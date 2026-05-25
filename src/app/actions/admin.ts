"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  isSupabaseConnected,
  getSimulatedUser,
  createProductMemory,
  createAuctionMemory,
  cancelAuctionMemory,
  relistAuctionMemory,
  cancelBidMemory,
  updateOrderStatusMemory,
  toggleUserBlockMemory
} from "@/lib/db";

// Helper to assert admin privilege
async function checkAdminAuth(): Promise<any> {
  if (!isSupabaseConnected()) {
    const user = await getSimulatedUser();
    if (!user || !user.is_admin) {
      throw new Error("Forbidden. Admin access required.");
    }
    return { user, supabase: null };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized. Please log in.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_admin) {
    throw new Error("Forbidden. Admin access required.");
  }
  return { user, supabase };
}

// Helper to log administrative actions
async function writeAuditLog(
  supabase: any,
  action: string,
  performedBy: string,
  targetId: string,
  details: any
) {
  if (isSupabaseConnected() && supabase) {
    await supabase.from("audit_logs").insert({
      action,
      performed_by: performedBy,
      target_id: targetId,
      details,
    });
  } else {
    // Write in memory
    (global as any)._memoryDb?.auditLogs.push({
      id: `log-${Date.now()}`,
      action,
      performed_by: performedBy,
      target_id: targetId,
      details,
      created_at: new Date().toISOString()
    });
  }
}

// =====================================================================
// CATEGORIES
// =====================================================================
export async function createCategory(name: string, slug: string, description: string) {
  try {
    const { user, supabase } = await checkAdminAuth();
    if (!name || !slug) return { success: false, error: "Name and Slug are required." };

    if (!isSupabaseConnected()) {
      const newCat = { id: `cat-${Date.now()}`, name, slug, description };
      (global as any)._memoryDb?.categories.push(newCat);
      await writeAuditLog(null, "category_create", user.id, newCat.id, { name, slug });
      revalidatePath("/admin/categories");
      return { success: true, message: "Kategoria u krijua me sukses!" };
    }

    const { data: category, error } = await supabase
      .from("categories")
      .insert({ name, slug, description })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await writeAuditLog(supabase, "category_create", user.id, category.id, { name, slug });
    revalidatePath("/admin/categories");
    return { success: true, message: "Category created successfully!" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// =====================================================================
// PRODUCTS
// =====================================================================
export async function createProduct(prevState: any, formData: FormData) {
  try {
    const { user, supabase } = await checkAdminAuth();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string;
    const condition = formData.get("condition") as any;
    const testingNotes = formData.get("testingNotes") as string;
    const imageUrlsString = formData.get("imageUrls") as string || "";

    if (!title || !condition) {
      return { success: false, error: "Title and Condition are required." };
    }

    const images = imageUrlsString
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (!isSupabaseConnected()) {
      const newProd = await createProductMemory(title, description, categoryId, condition, testingNotes, images);
      await writeAuditLog(null, "product_create", user.id, newProd.id, { title, condition });
      revalidatePath("/admin/products");
      return { success: true, message: "Produkti u shtua me sukses!" };
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        title,
        description,
        category_id: categoryId || null,
        condition,
        testing_notes: testingNotes,
        images,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await writeAuditLog(supabase, "product_create", user.id, product.id, { title, condition });
    revalidatePath("/admin/products");
    return { success: true, message: "Product created successfully!" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateProduct(productId: string, formData: FormData) {
  try {
    const { user, supabase } = await checkAdminAuth();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string;
    const condition = formData.get("condition") as any;
    const testingNotes = formData.get("testingNotes") as string;
    const status = formData.get("status") as string;
    const imageUrlsString = formData.get("imageUrls") as string || "";

    if (!title || !condition) {
      return { success: false, error: "Title and Condition are required." };
    }

    const images = imageUrlsString
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (!isSupabaseConnected()) {
      const product = (global as any)._memoryDb?.products.find((p: any) => p.id === productId);
      if (product) {
        product.title = title;
        product.description = description;
        product.category_id = categoryId;
        product.condition = condition;
        product.testing_notes = testingNotes;
        product.status = status;
        if (images.length > 0) product.images = images;
      }
      await writeAuditLog(null, "product_edit", user.id, productId, { title, condition, status });
      revalidatePath("/admin/products");
      revalidatePath(`/admin/products/${productId}/edit`);
      return { success: true, message: "Produkti u përditësua me sukses!" };
    }

    const { error } = await supabase
      .from("products")
      .update({
        title,
        description,
        category_id: categoryId || null,
        condition,
        testing_notes: testingNotes,
        status,
        images,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (error) return { success: false, error: error.message };

    await writeAuditLog(supabase, "product_edit", user.id, productId, { title, condition, status });
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}/edit`);
    return { success: true, message: "Product updated successfully!" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// =====================================================================
// AUCTIONS
// =====================================================================
export async function createAuction(prevState: any, formData: FormData) {
  try {
    const { user, supabase } = await checkAdminAuth();

    const productId = formData.get("productId") as string;
    const startingPrice = parseFloat(formData.get("startingPrice") as string);
    const minIncrement = parseFloat(formData.get("minIncrement") as string || "1.00");
    const startTimeStr = formData.get("startTime") as string;
    const endTimeStr = formData.get("endTime") as string;

    if (!productId || isNaN(startingPrice) || !startTimeStr || !endTimeStr) {
      return { success: false, error: "Product, Starting Price, Start Time, and End Time are required." };
    }

    const startTime = new Date(startTimeStr).toISOString();
    const endTime = new Date(endTimeStr).toISOString();

    if (new Date(endTime) <= new Date(startTime)) {
      return { success: false, error: "End time must be after start time." };
    }

    if (!isSupabaseConnected()) {
      const newAuc = await createAuctionMemory(productId, startingPrice, minIncrement, startTime, endTime);
      await writeAuditLog(null, "auction_create", user.id, newAuc.id, { startingPrice, startTime, endTime });
      revalidatePath("/admin/auctions");
      revalidatePath("/auctions");
      revalidatePath("/");
      return { success: true, message: "Ankandi u krijua/programua me sukses!" };
    }

    const startTimeFormatted = new Date(startTimeStr).toISOString();
    const endTimeFormatted = new Date(endTimeStr).toISOString();

    const now = new Date();
    let status = "scheduled";
    if (now >= new Date(startTimeFormatted) && now < new Date(endTimeFormatted)) {
      status = "active";
    }

    const { data: auction, error } = await supabase
      .from("auctions")
      .insert({
        product_id: productId,
        starting_price: startingPrice,
        current_price: startingPrice,
        min_increment: minIncrement,
        start_time: startTimeFormatted,
        end_time: endTimeFormatted,
        status,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await writeAuditLog(supabase, "auction_create", user.id, auction.id, { startingPrice, startTime: startTimeFormatted, endTime: endTimeFormatted });
    revalidatePath("/admin/auctions");
    revalidatePath("/auctions");
    revalidatePath("/");
    return { success: true, message: "Auction scheduled/created successfully!" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function cancelAuction(auctionId: string) {
  try {
    const { user, supabase } = await checkAdminAuth();

    if (!isSupabaseConnected()) {
      await cancelAuctionMemory(auctionId, user.id);
      await writeAuditLog(null, "auction_cancel", user.id, auctionId, {});
      revalidatePath("/admin/auctions");
      revalidatePath("/auctions");
      revalidatePath(`/auctions/${auctionId}`);
      return { success: true, message: "Ankandi u anulua me sukses!" };
    }

    const { error } = await supabase
      .from("auctions")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", auctionId);

    if (error) return { success: false, error: error.message };

    await writeAuditLog(supabase, "auction_cancel", user.id, auctionId, {});
    revalidatePath("/admin/auctions");
    revalidatePath("/auctions");
    revalidatePath(`/auctions/${auctionId}`);
    return { success: true, message: "Auction cancelled successfully!" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function relistAuction(
  auctionId: string,
  startTimeStr: string,
  endTimeStr: string,
  startingPrice: number
) {
  try {
    const { user, supabase } = await checkAdminAuth();

    if (!startTimeStr || !endTimeStr || isNaN(startingPrice)) {
      return { success: false, error: "Start time, end time, and starting price are required to relist." };
    }

    const startTime = new Date(startTimeStr).toISOString();
    const endTime = new Date(endTimeStr).toISOString();

    if (new Date(endTime) <= new Date(startTime)) {
      return { success: false, error: "End time must be after start time." };
    }

    if (!isSupabaseConnected()) {
      await relistAuctionMemory(auctionId, user.id, startTime, endTime, startingPrice);
      await writeAuditLog(null, "auction_relist", user.id, auctionId, { startingPrice, startTime, endTime });
      revalidatePath("/admin/auctions");
      revalidatePath("/auctions");
      revalidatePath(`/auctions/${auctionId}`);
      return { success: true, message: "Ankandi u ri-aktivizua dhe ri-listua me sukses!" };
    }

    const now = new Date();
    let status = "scheduled";
    if (now >= new Date(startTime) && now < new Date(endTime)) {
      status = "active";
    }

    const { error } = await supabase
      .from("auctions")
      .update({
        starting_price: startingPrice,
        current_price: startingPrice,
        start_time: startTime,
        end_time: endTime,
        status,
        winner_id: null,
        winning_bid_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", auctionId);

    if (error) return { success: false, error: error.message };

    await supabase
      .from("bids")
      .update({ status: "cancelled", cancelled_reason: "Auction relisted" })
      .eq("auction_id", auctionId);

    await writeAuditLog(supabase, "auction_relist", user.id, auctionId, { startingPrice, startTime, endTime });
    revalidatePath("/admin/auctions");
    revalidatePath("/auctions");
    revalidatePath(`/auctions/${auctionId}`);
    return { success: true, message: "Auction successfully relisted!" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// =====================================================================
// BIDS MANAGEMENT
// =====================================================================
export async function cancelBid(bidId: string, reason: string) {
  try {
    const { user, supabase } = await checkAdminAuth();

    if (!reason || reason.trim().length < 5) {
      return { success: false, error: "Please provide a valid reason (minimum 5 characters)." };
    }

    if (!isSupabaseConnected()) {
      const res = await cancelBidMemory(bidId, user.id, reason);
      if (!res.success) return { success: false, error: res.error };

      revalidatePath("/admin/bids");
      revalidatePath("/admin/auctions");
      revalidatePath("/");
      return { success: true, message: "Oferta u anulua dhe çmimi u ndryshua me sukses!" };
    }

    // 1. Get the bid details
    const { data: bid, error: fetchError } = await supabase
      .from("bids")
      .select("auction_id, amount, status")
      .eq("id", bidId)
      .single();

    if (fetchError || !bid) return { success: false, error: "Bid not found." };
    if (bid.status === "cancelled") return { success: false, error: "Bid is already cancelled." };

    // 2. Mark this bid as cancelled
    const { error: updateBidError } = await supabase
      .from("bids")
      .update({
        status: "cancelled",
        cancelled_reason: reason,
      })
      .eq("id", bidId);

    if (updateBidError) return { success: false, error: updateBidError.message };

    // 3. Find the highest remaining active bid for this auction
    const { data: remainingBids, error: remainingError } = await supabase
      .from("bids")
      .select("amount")
      .eq("auction_id", bid.auction_id)
      .eq("status", "active")
      .order("amount", { ascending: false })
      .limit(1);

    let newCurrentPrice = 0;

    if (remainingError) return { success: false, error: remainingError.message };

    if (remainingBids && remainingBids.length > 0) {
      newCurrentPrice = remainingBids[0].amount;
    } else {
      const { data: auction } = await supabase
        .from("auctions")
        .select("starting_price")
        .eq("id", bid.auction_id)
        .single();
      newCurrentPrice = auction?.starting_price || 0;
    }

    // 4. Update the current price in auctions table
    await supabase
      .from("auctions")
      .update({ current_price: newCurrentPrice })
      .eq("id", bid.auction_id);

    await writeAuditLog(supabase, "bid_cancel", user.id, bidId, { auctionId: bid.auction_id, amount: bid.amount, reason });
    revalidatePath("/admin/bids");
    revalidatePath("/admin/auctions");
    revalidatePath(`/auctions/${bid.auction_id}`);
    return { success: true, message: "Bid cancelled and price reverted successfully!" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// =====================================================================
// ORDERS MANAGEMENT
// =====================================================================
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const { user, supabase } = await checkAdminAuth();

    const validStatuses = ["pending_confirmation", "confirmed", "processing", "out_for_delivery", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return { success: false, error: "Invalid order status specified." };
    }

    if (!isSupabaseConnected()) {
      await updateOrderStatusMemory(orderId, user.id, status as any);
      revalidatePath("/admin/orders");
      revalidatePath("/dashboard/orders");
      return { success: true, message: `Statusi i porosisë u ndryshua në: ${status.replace("_", " ")}` };
    }

    const { error } = await supabase
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) return { success: false, error: error.message };

    await writeAuditLog(supabase, "order_status_change", user.id, orderId, { status });
    revalidatePath("/admin/orders");
    revalidatePath("/dashboard/orders");
    return { success: true, message: `Order status updated to ${status.replace("_", " ")}!` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// =====================================================================
// USERS / PROFILES MANAGEMENT
// =====================================================================
export async function toggleUserBlock(userId: string, isBlocked: boolean) {
  try {
    const { user, supabase } = await checkAdminAuth();

    if (!isSupabaseConnected()) {
      await toggleUserBlockMemory(userId, user.id, isBlocked);
      revalidatePath("/admin/users");
      revalidatePath("/admin/bids");
      return { success: true, message: isBlocked ? "Përdoruesi u bllokua me sukses." : "Përdoruesi u zhbllokua." };
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        is_blocked: isBlocked,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) return { success: false, error: error.message };

    if (isBlocked) {
      const { data: userBids } = await supabase
        .from("bids")
        .select("id, auction_id")
        .eq("user_id", userId)
        .eq("status", "active");

      if (userBids && userBids.length > 0) {
        for (const userBid of userBids) {
          await supabase
            .from("bids")
            .update({ status: "cancelled", cancelled_reason: "User account suspended" })
            .eq("id", userBid.id);

          const { data: remainingBids } = await supabase
            .from("bids")
            .select("amount")
            .eq("auction_id", userBid.auction_id)
            .eq("status", "active")
            .order("amount", { ascending: false })
            .limit(1);

          let newPrice = 0;
          if (remainingBids && remainingBids.length > 0) {
            newPrice = remainingBids[0].amount;
          } else {
            const { data: auction } = await supabase.from("auctions").select("starting_price").eq("id", userBid.auction_id).single();
            newPrice = auction?.starting_price || 0;
          }

          await supabase.from("auctions").update({ current_price: newPrice }).eq("id", userBid.auction_id);
        }
      }
    }

    await writeAuditLog(supabase, "user_restrict", user.id, userId, { isBlocked });
    revalidatePath("/admin/users");
    revalidatePath("/admin/bids");
    return { success: true, message: isBlocked ? "User restricted successfully." : "User restrictions removed." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Action to close all expired auctions on demand
export async function runAuctionCloser() {
  try {
    await checkAdminAuth();

    if (!isSupabaseConnected()) {
      // In-memory closer will run automatically during database reads
      revalidatePath("/");
      revalidatePath("/auctions");
      revalidatePath("/winners");
      revalidatePath("/dashboard/orders");
      revalidatePath("/admin/orders");
      return { success: true, message: "Ankandet e skaduara u kontrolluan dhe u mbyllën me sukses." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("close_expired_auctions");
    if (error) return { success: false, error: error.message };

    revalidatePath("/");
    revalidatePath("/auctions");
    revalidatePath("/winners");
    revalidatePath("/dashboard/orders");
    revalidatePath("/admin/orders");
    return { success: true, data, message: "Expired auctions closed and winners processed." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// User-triggered order shipping details confirmation or revision
export async function updateOrderAddress(
  orderId: string,
  fullName: string,
  phoneNumber: string,
  city: string,
  address: string
) {
  try {
    const supabase = await createClient();
    let userId = "";

    if (isSupabaseConnected()) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Ju lutemi identifikohuni." };
      userId = user.id;
    } else {
      const simUser = await getSimulatedUser();
      userId = simUser.id;
    }

    if (!fullName || !phoneNumber || !city || !address) {
      return { success: false, error: "Të gjitha fushat e adresës janë të detyrueshme." };
    }

    if (!isSupabaseConnected()) {
      const order = (global as any)._memoryDb?.orders.find((o: any) => o.id === orderId);
      if (!order) return { success: false, error: "Porosia nuk u gjet." };

      if (order.winner_id !== userId) {
        return { success: false, error: "Nuk jeni i autorizuar për këtë porosi." };
      }

      if (!["pending_confirmation", "confirmed"].includes(order.status)) {
        return { success: false, error: "Nuk mund të ndryshoni adresën pasi porosia ka kaluar në proçesim." };
      }

      order.full_name = fullName;
      order.phone_number = phoneNumber;
      order.city = city;
      order.address = address;

      if (order.status === "pending_confirmation") {
        order.status = "confirmed";
      }

      revalidatePath("/dashboard/orders");
      revalidatePath("/admin/orders");
      return { success: true, message: "Adresa e dërgimit u konfirmua dhe u përditësua me sukses!" };
    }

    // Live Supabase checks
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("winner_id, status")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) return { success: false, error: "Porosia nuk u gjet." };
    if (order.winner_id !== userId) return { success: false, error: "Nuk jeni i autorizuar." };
    if (!["pending_confirmation", "confirmed"].includes(order.status)) {
      return { success: false, error: "Nuk mund të ndryshohet adresa në këtë fazë." };
    }

    const { error } = await supabase
      .from("orders")
      .update({
        full_name: fullName,
        phone_number: phoneNumber,
        city,
        address,
        status: order.status === "pending_confirmation" ? "confirmed" : order.status,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/orders");
    revalidatePath("/admin/orders");
    return { success: true, message: "Adresa e dërgimit u konfirmua me sukses!" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
