"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { eurToAll } from "@/lib/currency";
import { revalidatePath } from "next/cache";

const PRODUCT_IMAGE_BUCKET = "product-images";
const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending_confirmation: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

async function checkAdminAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized. Please log in.");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) throw new Error("Forbidden. Admin access required.");

  return { user, supabase };
}

async function writeAuditLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  action: string,
  performedBy: string,
  targetId: string | null,
  details: unknown
) {
  await supabase.from("audit_logs").insert({
    action,
    performed_by: performedBy,
    target_id: targetId,
    details: details || {},
  });
}

function getPublicStorageUrl(path: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required.");
  return `${url}/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/${path}`;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

async function uploadProductImages(files: File[]) {
  if (files.length === 0) return [];
  const adminClient = createAdminClient();
  const uploadedUrls: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      throw new Error(`File "${file.name}" is not a valid image.`);
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error(`File "${file.name}" is larger than 5MB.`);
    }

    const path = `products/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
    const { error } = await adminClient.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      throw new Error(`Upload failed for "${file.name}": ${error.message}`);
    }

    uploadedUrls.push(getPublicStorageUrl(path));
  }

  return uploadedUrls;
}

export async function createCategory(name: string, slug: string, description: string) {
  try {
    const { user, supabase } = await checkAdminAuth();
    if (!name || !slug) return { success: false, error: "Name and slug are required." };
    const normalizedSlug = slug.trim().toLowerCase();

    const { data: existingCategory } = await supabase.from("categories").select("id").eq("slug", normalizedSlug).maybeSingle();
    if (existingCategory) {
      return { success: false, error: "Category slug already exists." };
    }

    const { data: category, error } = await supabase
      .from("categories")
      .insert({ name: name.trim(), slug: normalizedSlug, description: description || null })
      .select()
      .single();
    if (error) return { success: false, error: error.message };

    await writeAuditLog(supabase, "category_create", user.id, category.id, { name, slug });
    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    revalidatePath("/auctions");
    return { success: true, message: "Category created successfully." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createProduct(prevState: unknown, formData: FormData) {
  try {
    const { user, supabase } = await checkAdminAuth();

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const categoryId = String(formData.get("categoryId") || "");
    const condition = String(formData.get("condition") || "");
    const testingNotes = String(formData.get("testingNotes") || "").trim();
    const imageFiles = (formData.getAll("images") || []).filter((value) => value instanceof File) as File[];
    const validImageFiles = imageFiles.filter((file) => file.size > 0);

    if (!title || !condition) {
      return { success: false, error: "Title and condition are required." };
    }
    if (validImageFiles.length === 0) {
      return { success: false, error: "At least one product image is required." };
    }

    const { data: duplicateProduct } = await supabase
      .from("products")
      .select("id")
      .eq("title", title)
      .maybeSingle();
    if (duplicateProduct) {
      return { success: false, error: "A product with this title already exists." };
    }

    const uploadedImageUrls = await uploadProductImages(validImageFiles);

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        title,
        description: description || null,
        category_id: categoryId || null,
        condition,
        testing_notes: testingNotes || null,
        images: uploadedImageUrls,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await writeAuditLog(supabase, "product_create", user.id, product.id, {
      title,
      condition,
      imageCount: uploadedImageUrls.length,
    });
    revalidatePath("/admin/products");
    revalidatePath("/auctions");
    revalidatePath("/");
    return { success: true, message: "Product created successfully." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateProduct(productId: string, formData: FormData) {
  try {
    const { user, supabase } = await checkAdminAuth();
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const categoryId = String(formData.get("categoryId") || "");
    const condition = String(formData.get("condition") || "");
    const testingNotes = String(formData.get("testingNotes") || "").trim();
    const status = String(formData.get("status") || "active");
    const keepExistingImages = formData.get("keepExistingImages") === "true";
    const imageFiles = (formData.getAll("images") || []).filter((value) => value instanceof File) as File[];
    const validImageFiles = imageFiles.filter((file) => file.size > 0);

    if (!title || !condition) {
      return { success: false, error: "Title and condition are required." };
    }
    const { data: existingProduct, error: existingProductError } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .maybeSingle();
    if (existingProductError) return { success: false, error: existingProductError.message };
    if (!existingProduct) return { success: false, error: "Product not found." };

    let finalImages: string[] = [];
    if (keepExistingImages) {
      const { data: currentProduct, error: currentError } = await supabase
        .from("products")
        .select("images")
        .eq("id", productId)
        .single();
      if (currentError) return { success: false, error: currentError.message };
      finalImages = (currentProduct?.images || []) as string[];
    }

    if (validImageFiles.length > 0) {
      finalImages = [...finalImages, ...(await uploadProductImages(validImageFiles))];
    }

    const { error } = await supabase
      .from("products")
      .update({
        title,
        description: description || null,
        category_id: categoryId || null,
        condition,
        testing_notes: testingNotes || null,
        status,
        images: finalImages,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);
    if (error) return { success: false, error: error.message };

    await writeAuditLog(supabase, "product_edit", user.id, productId, { title, condition, status });
    revalidatePath("/admin/products");
    revalidatePath("/auctions");
    revalidatePath("/");
    return { success: true, message: "Product updated successfully." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createAuction(prevState: unknown, formData: FormData) {
  try {
    const { user, supabase } = await checkAdminAuth();

    const productId = String(formData.get("productId") || "");
    const startingPriceEur = Number(formData.get("startingPrice"));
    const minIncrementEur = Number(formData.get("minIncrement") || "1");
    const durationHours = Number(formData.get("durationHours") || "24");
    const startingPrice = eurToAll(startingPriceEur);
    const minIncrement = eurToAll(minIncrementEur);

    if (!productId || Number.isNaN(startingPriceEur) || Number.isNaN(minIncrementEur) || Number.isNaN(durationHours)) {
      return { success: false, error: "Product, minimum bid, minimum increment, and duration are required." };
    }
    if (startingPriceEur <= 0 || minIncrementEur <= 0) {
      return { success: false, error: "Minimum bid and minimum increment must be greater than zero." };
    }
    if (durationHours < 1 || durationHours > 168) {
      return { success: false, error: "Duration must be between 1 and 168 hours." };
    }

    const now = new Date();
    const startTime = now.toISOString();
    const endTime = new Date(now.getTime() + durationHours * 60 * 60 * 1000).toISOString();
    const status = "active";
    const { data: existingLiveAuction, error: existingLiveAuctionError } = await supabase
      .from("auctions")
      .select("id, status")
      .eq("product_id", productId)
      .in("status", ["active", "scheduled"])
      .maybeSingle();
    if (existingLiveAuctionError) return { success: false, error: existingLiveAuctionError.message };
    if (existingLiveAuction) {
      return { success: false, error: "This product already has an active or scheduled auction." };
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, status")
      .eq("id", productId)
      .maybeSingle();
    if (productError) return { success: false, error: productError.message };
    if (!product) return { success: false, error: "Product not found." };
    if (product.status !== "active") {
      return { success: false, error: "Only active and available products can be auctioned." };
    }

    const { data: auction, error } = await supabase
      .from("auctions")
      .insert({
        product_id: productId,
        starting_price: startingPrice,
        current_price: startingPrice,
        min_increment: minIncrement,
        start_time: startTime,
        end_time: endTime,
        status,
      })
      .select()
      .single();
    if (error) return { success: false, error: error.message };

    await writeAuditLog(supabase, "auction_create", user.id, auction.id, {
      productId,
      startingPrice,
      minIncrement,
      startTime,
      endTime,
      durationHours,
    });
    revalidatePath("/admin/auctions");
    revalidatePath("/auctions");
    revalidatePath("/");
    return { success: true, message: "Auction created successfully." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function cancelAuction(auctionId: string) {
  try {
    const { user, supabase } = await checkAdminAuth();
    const { data: auction, error: auctionError } = await supabase
      .from("auctions")
      .select("id, status")
      .eq("id", auctionId)
      .maybeSingle();
    if (auctionError) return { success: false, error: auctionError.message };
    if (!auction) return { success: false, error: "Auction not found." };
    if (auction.status === "cancelled") return { success: false, error: "Auction is already cancelled." };

    const { error } = await supabase
      .from("auctions")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", auctionId);
    if (error) return { success: false, error: error.message };

    await writeAuditLog(supabase, "auction_cancel", user.id, auctionId, {});
    revalidatePath("/admin/auctions");
    revalidatePath("/auctions");
    revalidatePath(`/auctions/${auctionId}`);
    return { success: true, message: "Auction cancelled successfully." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function relistAuction(auctionId: string, durationHours: number, startingPrice: number) {
  try {
    const { user, supabase } = await checkAdminAuth();
    if (Number.isNaN(durationHours) || Number.isNaN(startingPrice)) {
      return { success: false, error: "Duration and starting price are required." };
    }
    if (startingPrice <= 0) {
      return { success: false, error: "Starting bid must be greater than zero." };
    }
    const startingPriceAll = eurToAll(startingPrice);
    if (durationHours < 1 || durationHours > 168) {
      return { success: false, error: "Duration must be between 1 and 168 hours." };
    }
    const now = new Date();
    const startTime = now.toISOString();
    const endTime = new Date(now.getTime() + durationHours * 60 * 60 * 1000).toISOString();
    const status = "active";
    const { data: baseAuction, error: baseAuctionError } = await supabase
      .from("auctions")
      .select("id, product_id, status, winner_id")
      .eq("id", auctionId)
      .maybeSingle();
    if (baseAuctionError) return { success: false, error: baseAuctionError.message };
    if (!baseAuction) return { success: false, error: "Auction not found." };

    const { data: existingOrder, error: existingOrderError } = await supabase
      .from("orders")
      .select("id, status")
      .eq("auction_id", auctionId)
      .maybeSingle();
    if (existingOrderError) return { success: false, error: existingOrderError.message };

    const lockedStatuses = ["pending_confirmation", "confirmed", "processing", "out_for_delivery", "delivered"];
    if (existingOrder && lockedStatuses.includes(existingOrder.status)) {
      return { success: false, error: "Ky produkt eshte i fituar dhe ne proces porosie. Relist lejohet vetem pasi porosia anulohet." };
    }

    const { data: existingLiveAuction, error: existingLiveAuctionError } = await supabase
      .from("auctions")
      .select("id")
      .eq("product_id", baseAuction.product_id)
      .neq("id", auctionId)
      .in("status", ["active", "scheduled"])
      .maybeSingle();
    if (existingLiveAuctionError) return { success: false, error: existingLiveAuctionError.message };
    if (existingLiveAuction) return { success: false, error: "Another active or scheduled auction exists for this product." };

    const { data: newAuction, error: createRelistError } = await supabase
      .from("auctions")
      .insert({
        product_id: baseAuction.product_id,
        starting_price: startingPriceAll,
        current_price: startingPriceAll,
        min_increment: eurToAll(1),
        start_time: startTime,
        end_time: endTime,
        status,
      })
      .select()
      .single();
    if (createRelistError) return { success: false, error: createRelistError.message };

    const { error: markOldError } = await supabase
      .from("auctions")
      .update({ status: "relisted", updated_at: new Date().toISOString() })
      .eq("id", auctionId);
    if (markOldError) {
      await supabase.from("auctions").delete().eq("id", newAuction.id);
      return { success: false, error: markOldError.message };
    }

    await writeAuditLog(supabase, "auction_relist", user.id, newAuction.id, {
      previousAuctionId: auctionId,
      startingPrice: startingPriceAll,
      startTime,
      endTime,
      durationHours,
    });
    revalidatePath("/admin/auctions");
    revalidatePath("/auctions");
    revalidatePath(`/auctions/${auctionId}`);
    revalidatePath(`/auctions/${newAuction.id}`);
    return { success: true, message: "Auction relisted successfully." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function cancelBid(bidId: string, reason: string) {
  try {
    const { user, supabase } = await checkAdminAuth();
    if (!reason || reason.trim().length < 5) {
      return { success: false, error: "Provide a reason with at least 5 characters." };
    }

    const { data: bid, error: fetchError } = await supabase
      .from("bids")
      .select("auction_id, amount, status")
      .eq("id", bidId)
      .single();
    if (fetchError || !bid) return { success: false, error: "Bid not found." };
    if (bid.status === "cancelled") return { success: false, error: "Bid is already cancelled." };

    const { error: updateBidError } = await supabase
      .from("bids")
      .update({ status: "cancelled", cancelled_reason: reason })
      .eq("id", bidId)
      .eq("status", "active");
    if (updateBidError) return { success: false, error: updateBidError.message };

    const { data: remainingBids, error: remainingError } = await supabase
      .from("bids")
      .select("amount")
      .eq("auction_id", bid.auction_id)
      .eq("status", "active")
      .order("amount", { ascending: false })
      .limit(1);
    if (remainingError) return { success: false, error: remainingError.message };

    let newCurrentPrice = 0;
    if (remainingBids && remainingBids.length > 0) {
      newCurrentPrice = remainingBids[0].amount;
    } else {
      const { data: auction } = await supabase.from("auctions").select("starting_price").eq("id", bid.auction_id).single();
      newCurrentPrice = auction?.starting_price || 0;
    }

    const { error: updateAuctionError } = await supabase
      .from("auctions")
      .update({ current_price: newCurrentPrice })
      .eq("id", bid.auction_id);
    if (updateAuctionError) return { success: false, error: updateAuctionError.message };

    await writeAuditLog(supabase, "bid_cancel", user.id, bidId, {
      auctionId: bid.auction_id,
      amount: bid.amount,
      reason,
    });
    revalidatePath("/admin/bids");
    revalidatePath("/admin/auctions");
    revalidatePath(`/auctions/${bid.auction_id}`);
    return { success: true, message: "Bid cancelled and price adjusted." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const { user, supabase } = await checkAdminAuth();
    const validStatuses = ["pending_confirmation", "confirmed", "processing", "out_for_delivery", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return { success: false, error: "Invalid order status." };
    }

    const { data: order, error: orderFetchError } = await supabase
      .from("orders")
      .select("id, status, auction_id")
      .eq("id", orderId)
      .maybeSingle();
    if (orderFetchError) return { success: false, error: orderFetchError.message };
    if (!order) return { success: false, error: "Order not found." };
    if (order.status === status) return { success: false, error: "Order is already in this status." };

    const allowedTransitions = ORDER_STATUS_TRANSITIONS[order.status] || [];
    if (!allowedTransitions.includes(status)) {
      return { success: false, error: `Invalid transition from ${order.status.replaceAll("_", " ")}.` };
    }

    const { error } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", orderId);
    if (error) return { success: false, error: error.message };

    const { data: auctionForOrder } = await supabase
      .from("auctions")
      .select("id, product_id")
      .eq("id", order.auction_id)
      .maybeSingle();

    if (auctionForOrder?.product_id) {
      if (status === "delivered") {
        await supabase
          .from("products")
          .update({ status: "inactive", updated_at: new Date().toISOString() })
          .eq("id", auctionForOrder.product_id);
      }

      if (status === "cancelled") {
        await supabase
          .from("products")
          .update({ status: "active", updated_at: new Date().toISOString() })
          .eq("id", auctionForOrder.product_id);
      }
    }

    await writeAuditLog(supabase, "order_status_change", user.id, orderId, { status });
    revalidatePath("/admin/orders");
    revalidatePath("/admin/auctions");
    revalidatePath("/admin/products");
    revalidatePath("/auctions");
    revalidatePath("/");
    revalidatePath("/profile");
    return { success: true, message: `Order status updated to ${status.replaceAll("_", " ")}.` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function toggleUserBlock(userId: string, isBlocked: boolean) {
  try {
    const { user, supabase } = await checkAdminAuth();
    if (userId === user.id) return { success: false, error: "You cannot block your own admin account." };
    const { data: targetProfile, error: targetProfileError } = await supabase
      .from("profiles")
      .select("id, is_admin")
      .eq("id", userId)
      .maybeSingle();
    if (targetProfileError) return { success: false, error: targetProfileError.message };
    if (!targetProfile) return { success: false, error: "User not found." };
    if (targetProfile.is_admin) return { success: false, error: "Admin accounts cannot be blocked here." };

    const { error } = await supabase
      .from("profiles")
      .update({ is_blocked: isBlocked, updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (error) return { success: false, error: error.message };

    if (isBlocked) {
      const { data: userBids } = await supabase
        .from("bids")
        .select("id, auction_id")
        .eq("user_id", userId)
        .eq("status", "active");

      for (const userBid of userBids || []) {
        await supabase.from("bids").update({ status: "cancelled", cancelled_reason: "User account suspended" }).eq("id", userBid.id);
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
          const { data: auction } = await supabase
            .from("auctions")
            .select("starting_price")
            .eq("id", userBid.auction_id)
            .single();
          newPrice = auction?.starting_price || 0;
        }

        await supabase.from("auctions").update({ current_price: newPrice }).eq("id", userBid.auction_id);
      }
    }

    await writeAuditLog(supabase, "user_restrict", user.id, userId, { isBlocked });
    revalidatePath("/admin/users");
    revalidatePath("/admin/bids");
    return {
      success: true,
      message: isBlocked ? "User restricted successfully." : "User restrictions removed.",
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function runAuctionCloser() {
  try {
    const { supabase, user } = await checkAdminAuth();
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.rpc("close_expired_auctions");
    if (error) return { success: false, error: error.message };

    await writeAuditLog(supabase, "auction_closer_run", user.id, null, { closed: Array.isArray(data) ? data.length : 0 });

    revalidatePath("/");
    revalidatePath("/auctions");
    revalidatePath("/winners");
    revalidatePath("/profile");
    revalidatePath("/admin/orders");
    return { success: true, data, message: "Expired auctions closed and winners processed." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateOrderAddress(
  orderId: string,
  fullName: string,
  phoneNumber: string,
  city: string,
  address: string
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Ju lutemi identifikohuni." };

    if (!fullName || !phoneNumber || !city || !address) {
      return { success: false, error: "Te gjitha fushat e adreses jane te detyrueshme." };
    }

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("winner_id, status")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) return { success: false, error: "Porosia nuk u gjet." };
    if (order.winner_id !== user.id) return { success: false, error: "Nuk jeni i autorizuar." };
    if (!["pending_confirmation", "confirmed"].includes(order.status)) {
      return { success: false, error: "Nuk mund te ndryshohet adresa ne kete faze." };
    }

    const { error } = await supabase
      .from("orders")
      .update({
        full_name: fullName,
        phone_number: phoneNumber,
        city,
        address,
        status: order.status === "pending_confirmation" ? "confirmed" : order.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
    if (error) return { success: false, error: error.message };

    revalidatePath("/profile");
    revalidatePath("/admin/orders");
    return { success: true, message: "Adresa e dergimit u konfirmua me sukses." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function submitCancelAuction(_: unknown, formData: FormData) {
  return cancelAuction(String(formData.get("auctionId") || ""));
}
export async function performCancelAuction(formData: FormData) {
  return cancelAuction(String(formData.get("auctionId") || ""));
}

export async function submitRelistAuction(_: unknown, formData: FormData) {
  return relistAuction(
    String(formData.get("auctionId") || ""),
    Number(formData.get("durationHours") || "24"),
    Number(formData.get("startingPrice"))
  );
}
export async function performRelistAuction(formData: FormData) {
  return relistAuction(
    String(formData.get("auctionId") || ""),
    Number(formData.get("durationHours") || "24"),
    Number(formData.get("startingPrice"))
  );
}

export async function submitCancelBid(_: unknown, formData: FormData) {
  return cancelBid(String(formData.get("bidId") || ""), String(formData.get("reason") || ""));
}
export async function performCancelBid(formData: FormData) {
  return cancelBid(String(formData.get("bidId") || ""), String(formData.get("reason") || ""));
}

export async function submitUpdateOrderStatus(_: unknown, formData: FormData) {
  return updateOrderStatus(String(formData.get("orderId") || ""), String(formData.get("status") || ""));
}
export async function performUpdateOrderStatus(formData: FormData) {
  return updateOrderStatus(String(formData.get("orderId") || ""), String(formData.get("status") || ""));
}

export async function submitToggleUserBlock(_: unknown, formData: FormData) {
  return toggleUserBlock(String(formData.get("userId") || ""), String(formData.get("blocked")) === "true");
}

export async function submitCreateCategory(_: unknown, formData: FormData) {
  return createCategory(String(formData.get("name") || ""), String(formData.get("slug") || ""), String(formData.get("description") || ""));
}

export async function submitRunAuctionCloser() {
  return runAuctionCloser();
}
export async function performRunAuctionCloser() {
  return runAuctionCloser();
}

export async function setProductStatus(productId: string, status: "active" | "inactive") {
  try {
    const { user, supabase } = await checkAdminAuth();
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, status, title")
      .eq("id", productId)
      .maybeSingle();
    if (productError) return { success: false, error: productError.message };
    if (!product) return { success: false, error: "Product not found." };
    if (product.status === status) return { success: false, error: "No status change needed." };

    const { error } = await supabase
      .from("products")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", productId);
    if (error) return { success: false, error: error.message };

    await writeAuditLog(supabase, "product_status_change", user.id, productId, {
      title: product.title,
      status,
    });
    revalidatePath("/admin/products");
    revalidatePath("/auctions");
    revalidatePath("/");
    return { success: true, message: `Product marked as ${status}.` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const { user, supabase } = await checkAdminAuth();
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, title")
      .eq("id", productId)
      .maybeSingle();
    if (productError) return { success: false, error: productError.message };
    if (!product) return { success: false, error: "Product not found." };

    const { data: auctionsForProduct, error: auctionsError } = await supabase
      .from("auctions")
      .select("id, status")
      .eq("product_id", productId);
    if (auctionsError) return { success: false, error: auctionsError.message };

    const hasActiveAuction = (auctionsForProduct || []).some((auction) =>
      ["active", "scheduled"].includes(auction.status)
    );
    if (hasActiveAuction) {
      return { success: false, error: "Cannot delete product with active or scheduled auctions." };
    }

    if ((auctionsForProduct || []).length > 0) {
      const auctionIds = auctionsForProduct!.map((auction) => auction.id);
      const { data: existingOrders, error: ordersError } = await supabase
        .from("orders")
        .select("id")
        .in("auction_id", auctionIds)
        .limit(1);
      if (ordersError) return { success: false, error: ordersError.message };
      if ((existingOrders || []).length > 0) {
        return { success: false, error: "Cannot delete product that already has winner orders." };
      }
    }

    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) return { success: false, error: error.message };

    await writeAuditLog(supabase, "product_delete", user.id, productId, { title: product.title });
    revalidatePath("/admin/products");
    revalidatePath("/admin/auctions");
    revalidatePath("/auctions");
    revalidatePath("/");
    return { success: true, message: "Product removed successfully." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function submitSetProductStatus(_: unknown, formData: FormData) {
  return setProductStatus(
    String(formData.get("productId") || ""),
    String(formData.get("status") || "active") as "active" | "inactive"
  );
}
export async function performSetProductStatus(formData: FormData) {
  return setProductStatus(
    String(formData.get("productId") || ""),
    String(formData.get("status") || "active") as "active" | "inactive"
  );
}
