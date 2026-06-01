import { createAdminClient, createClient } from "./supabase/server";

export interface Profile {
  id: string;
  email?: string;
  full_name: string;
  phone_number: string;
  country: string;
  city: string;
  address: string;
  postal_code?: string;
  is_admin: boolean;
  is_blocked: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  category_id: string;
  condition: "new" | "like_new" | "used_good" | "used_fair";
  images: string[];
  testing_notes: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at?: string;
}

export interface Auction {
  id: string;
  product_id: string;
  starting_price: number;
  current_price: number;
  min_increment: number;
  start_time: string;
  end_time: string;
  status: "scheduled" | "active" | "ended" | "cancelled" | "relisted";
  winner_id: string | null;
  winning_bid_id: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Bid {
  id: string;
  auction_id: string;
  user_id: string;
  amount: number;
  status: "active" | "cancelled";
  cancelled_reason?: string;
  created_at: string;
}

export interface Order {
  id: string;
  auction_id: string;
  winner_id: string;
  final_price: number;
  full_name: string;
  phone_number: string;
  country: string;
  city: string;
  address: string;
  status: "pending_confirmation" | "confirmed" | "processing" | "out_for_delivery" | "delivered" | "cancelled";
  created_at: string;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performed_by: string | null;
  target_id: string | null;
  details: unknown;
  created_at: string;
}

export function isSupabaseConnected(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  if (url.includes("placeholder") || url.includes("your-project")) return false;
  if (key.includes("placeholder") || key.includes("mock-")) return false;
  return true;
}

export function assertSupabaseConfigured() {
  if (!isSupabaseConnected()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }
}

const guestProfile: Profile = {
  id: "usr-guest",
  full_name: "Visitor",
  phone_number: "",
  country: "Albania",
  city: "",
  address: "",
  postal_code: "",
  is_admin: false,
  is_blocked: false,
  email_verified: false,
  created_at: new Date(0).toISOString(),
};

export async function getCurrentUserProfile(): Promise<Profile> {
  assertSupabaseConfigured();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return guestProfile;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (profile) {
    return {
      ...(profile as Profile),
      email: user.email || "",
      email_verified: !!user.email_confirmed_at,
    };
  }

  return {
    id: user.id,
    full_name: (user.user_metadata?.full_name as string) || user.email || "User",
    phone_number: "",
    country: "Albania",
    city: "",
    address: "",
    postal_code: "",
    is_admin: false,
    is_blocked: false,
    email: user.email || "",
    email_verified: !!user.email_confirmed_at,
    created_at: user.created_at || new Date().toISOString(),
  };
}

export async function getCategories(): Promise<Category[]> {
  assertSupabaseConfigured();
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw new Error(error.message);
  return (data || []) as Category[];
}

export async function getProducts(): Promise<Product[]> {
  assertSupabaseConfigured();
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  assertSupabaseConfigured();
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error) return null;
  return data as Product;
}

type AuctionWithProductRow = Auction & { product: Product | null };
export type AuctionWithRelations = Auction & { product: Product; category: Category | null };

export async function getAuctions(): Promise<AuctionWithRelations[]> {
  assertSupabaseConfigured();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("auctions")
    .select("*, product:products(*)")
    .order("end_time", { ascending: true });
  if (error) throw new Error(error.message);

  const categories = await getCategories();
  return ((data || []) as AuctionWithProductRow[])
    .filter((auction) => !!auction.product)
    .map((auction) => ({
      ...auction,
      product: auction.product as Product,
      category: categories.find((category) => category.id === auction.product?.category_id) || null,
    }));
}

export async function getAuctionById(id: string): Promise<AuctionWithRelations | null> {
  assertSupabaseConfigured();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("auctions")
    .select("*, product:products(*)")
    .eq("id", id)
    .single();
  if (error || !data) return null;

  const auction = data as AuctionWithProductRow;
  if (!auction.product) return null;

  const categories = await getCategories();
  return {
    ...auction,
    product: auction.product,
    category: categories.find((category) => category.id === auction.product?.category_id) || null,
  };
}

export async function getBidsForAuction(auctionId: string): Promise<(Bid & { user: Profile })[]> {
  assertSupabaseConfigured();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bids")
    .select("*, user:profiles(*)")
    .eq("auction_id", auctionId)
    .order("amount", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []) as (Bid & { user: Profile })[];
}

export async function getBidsByUser(userId: string): Promise<(Bid & { auction: Auction & { product: Product } })[]> {
  assertSupabaseConfigured();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bids")
    .select("*, auction:auctions!bids_auction_id_fkey(*, product:products(*))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as (Bid & { auction: Auction & { product: Product } })[];
}

export async function getOrders(): Promise<(Order & { auction: Auction & { product: Product }; winner: Profile })[]> {
  assertSupabaseConfigured();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, auction:auctions!orders_auction_id_fkey(*, product:products(*)), winner:profiles(*)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as (Order & { auction: Auction & { product: Product }; winner: Profile })[];
}

export async function getOrdersByUser(userId: string): Promise<(Order & { auction: Auction & { product: Product } })[]> {
  assertSupabaseConfigured();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, auction:auctions!orders_auction_id_fkey(*, product:products(*))")
    .eq("winner_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as (Order & { auction: Auction & { product: Product } })[];
}

export async function getProfiles(): Promise<Profile[]> {
  assertSupabaseConfigured();
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").order("created_at");
  if (error) throw new Error(error.message);
  return (data || []) as Profile[];
}

export async function getCustomerProfiles(): Promise<Profile[]> {
  assertSupabaseConfigured();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_admin", false)
    .order("created_at");
  if (error) throw new Error(error.message);
  return (data || []) as Profile[];
}

export async function getProfileById(id: string): Promise<Profile | null> {
  assertSupabaseConfigured();
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (error) return null;
  return data as Profile;
}

export async function getAuditLogs(): Promise<(AuditLog & { performer: Profile | null })[]> {
  assertSupabaseConfigured();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*, performer:profiles(*)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as (AuditLog & { performer: Profile | null })[];
}
