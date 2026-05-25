"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isSupabaseConnected, getSimulatedUser, placeBidMemory } from "@/lib/db";

export async function placeBid(auctionId: string, bidAmount: number) {
  if (!auctionId || !bidAmount || bidAmount <= 0) {
    return { success: false, error: "Blerje e pavlefshme." };
  }

  if (!isSupabaseConnected()) {
    const user = await getSimulatedUser();
    if (!user || user.id === "usr-guest") {
      return { success: false, error: "Duhet të regjistroheni ose identifikoheni për të vendosur një ofertë." };
    }

    const res = await placeBidMemory(auctionId, user.id, bidAmount);
    if (!res.success) {
      return { success: false, error: res.error };
    }

    revalidatePath(`/auctions/${auctionId}`);
    revalidatePath("/auctions");
    revalidatePath("/");
    revalidatePath("/dashboard/bids");
    revalidatePath("/dashboard");
    return { success: true, bidId: res.bidId, message: "Oferta juaj u vendos me sukses!" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to place a bid." };
  }

  // Call the database function to handle bid insertion in a transaction
  const { data: bidId, error } = await supabase.rpc("place_bid", {
    p_auction_id: auctionId,
    p_user_id: user.id,
    p_bid_amount: bidAmount,
  });

  if (error) {
    return { 
      success: false, 
      error: error.message || "An unexpected error occurred while placing your bid." 
    };
  }

  revalidatePath(`/auctions/${auctionId}`);
  revalidatePath("/auctions");
  revalidatePath("/");
  revalidatePath("/dashboard/bids");
  revalidatePath("/dashboard");

  return { success: true, bidId, message: "Your bid was placed successfully!" };
}
