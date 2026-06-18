"use server";

import { createClient } from "@/lib/supabase/server";
import { eurToAll } from "@/lib/currency";
import { enforceRateLimits } from "@/lib/rate-limit";
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

  const rateLimit = await enforceRateLimits([
    {
      action: "bid:place:ip",
      limit: 120,
      windowSeconds: 60,
      keyParts: ["bid-place"],
      message: "Too many bid attempts. Please slow down.",
    },
    {
      action: "bid:place:user",
      limit: 60,
      windowSeconds: 60,
      keyParts: ["bid-place", user.id],
      includeIp: false,
      message: "Too many bid attempts from this account. Please slow down.",
    },
    {
      action: "bid:place:auction-user",
      limit: 20,
      windowSeconds: 60,
      keyParts: ["bid-place", auctionId, user.id],
      includeIp: false,
      message: "Too many bid attempts on this auction. Please wait a moment.",
    },
  ]);
  if (rateLimit) return rateLimit;

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
