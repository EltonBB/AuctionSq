"use server";

import { createClient } from "@/lib/supabase/server";
import { eurToAll } from "@/lib/currency";
import { revalidatePath } from "next/cache";

export async function placeBid(auctionId: string, bidAmountEur: number) {
  if (!auctionId || !bidAmountEur || bidAmountEur <= 0) {
    return { success: false, error: "Bid value is invalid." };
  }
  const bidAmountAll = eurToAll(bidAmountEur);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to place a bid." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return { success: false, error: "Nuk u verifikua roli i llogarise." };
  }

  if (profile?.is_admin) {
    return { success: false, error: "ti je admini nuk mund te ofrosh" };
  }

  const { data: bidId, error } = await supabase.rpc("place_bid", {
    p_auction_id: auctionId,
    p_bid_amount: bidAmountAll,
  });

  if (error) {
    return {
      success: false,
      error: error.message || "An unexpected error occurred while placing your bid.",
    };
  }

  revalidatePath(`/auctions/${auctionId}`);
  revalidatePath("/auctions");
  revalidatePath("/");
  revalidatePath("/profile");

  return { success: true, bidId, message: "Your bid was placed successfully." };
}
