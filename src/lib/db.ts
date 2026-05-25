import { createClient } from "./supabase/server";

// =====================================================================
// TYPES DEFINITION
// =====================================================================
export interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
  country: string;
  city: string;
  address: string;
  is_admin: boolean;
  is_blocked: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
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
}

export interface AuditLog {
  id: string;
  action: string;
  performed_by: string;
  target_id: string;
  details: any;
  created_at: string;
}

// =====================================================================
// SEED DATA & STATE CACHE FOR SANDBOX
// =====================================================================
const MOCK_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Telefona & Teknologji", slug: "teknologji", description: "Smartphones, laptops, and tablets." },
  { id: "cat-2", name: "Orë & Aksesorë", slug: "ore-aksesore", description: "Premium wristwatches and fine jewelry." },
  { id: "cat-3", name: "Koleksione & Art", slug: "koleksione", description: "Rare collectibles, antique arts, and memorabilia." },
  { id: "cat-4", name: "Vegla & Shtëpia", slug: "vegla-shtepia", description: "Home appliances, power tools, and smart home items." },
  { id: "cat-5", name: "Sport & Jashtë", slug: "sport", description: "Bicycles, camping gear, and sports equipment." }
];

const MOCK_PROFILES: Profile[] = [
  {
    id: "usr-guest",
    full_name: "Visitor Profile",
    phone_number: "",
    country: "Albania",
    city: "",
    address: "",
    is_admin: false,
    is_blocked: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "usr-incomplete",
    full_name: "Blerim Hoxha",
    phone_number: "",
    country: "Albania",
    city: "",
    address: "",
    is_admin: false,
    is_blocked: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "usr-complete",
    full_name: "Arjan Shkodra",
    phone_number: "+355691234567",
    country: "Albania",
    city: "Tirana",
    address: "Rruga Myslym Shyri, Pallati 12, Ap. 5",
    is_admin: false,
    is_blocked: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "usr-admin",
    full_name: "Administrator",
    phone_number: "+355689999999",
    country: "Albania",
    city: "Tirana",
    address: "Bulevardi Dëshmorët e Kombit",
    is_admin: true,
    is_blocked: false,
    created_at: new Date().toISOString(),
  }
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    title: "iPhone 15 Pro Max - 256GB (E Kontrolluar)",
    description: "iPhone 15 Pro Max origjinal në ngjyrë Titanium Natyral. Produkti vjen me kutinë origjinale dhe karikues. Nuk ka gërvishtje dhe bateri shëndeti është në 98%. Testuar plotësisht nga stafi ynë teknik.",
    category_id: "cat-1",
    condition: "like_new",
    images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80"],
    testing_notes: "Bateria: 98%. Kamera: e pastër. FaceID: Funksionon 100%. E pastruar teknikisht.",
    status: "active",
    created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
  },
  {
    id: "prod-2",
    title: "Orë Premium Tissot PRX Powermatic 80",
    description: "Tissot PRX automatike me fushë të kaltër. Rrip çeliku, xham safiri, e papërshkueshme nga uji 100m. Aksesor elegant që vjen me kutinë e certifikuar dhe garancinë ndërkombëtare.",
    category_id: "cat-2",
    condition: "new",
    images: ["https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800&auto=format&fit=crop&q=80"],
    testing_notes: "Produkt krejtësisht i ri, i papërdorur. Çeliku pa asnjë shenjë gërvishtjeje.",
    status: "active",
    created_at: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
  },
  {
    id: "prod-3",
    title: "Dron DJI Mini 3 Pro me Kontrollues RC",
    description: "Dron profesional kompakt me peshë nën 249g. Ofron xhirime 4K/60fps, kohë fluturimi deri në 34 minuta dhe sensorë pengesash në tre drejtime. Përfshin kontrolluesin me ekran të integruar.",
    category_id: "cat-1",
    condition: "used_good",
    images: ["https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80"],
    testing_notes: "Pjesët e helikave janë të reja. Testuar fluturimi 20 minuta pa asnjë problem teknik.",
    status: "active",
    created_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
  },
  {
    id: "prod-4",
    title: "Kamerë Retro Vintage Canon AE-1 (1981)",
    description: "Kamerë filmike klasike Canon AE-1 me lentë 50mm f/1.8. Një ikonë e fotografisë retro në gjendje të jashtëzakonshme pune dhe estetike. Përfshin rripin lëkurë dhe filtrin UV.",
    category_id: "cat-3",
    condition: "used_fair",
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"],
    testing_notes: "E provuar me film, mekanizmi i shkrepjes punon shkëlqyeshëm. Lentja nuk ka myk.",
    status: "active",
    created_at: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
  }
];

// Set end times relative to now to dynamically show countdowns!
const MOCK_AUCTIONS: Auction[] = [
  {
    id: "auc-1",
    product_id: "prod-1",
    starting_price: 80000,
    current_price: 85000,
    min_increment: 2000,
    start_time: new Date(Date.now() - 3600 * 1000 * 2).toISOString(), // started 2 hrs ago
    end_time: new Date(Date.now() + 3600 * 1000 * 3).toISOString(),   // ends in 3 hours
    status: "active",
    winner_id: null,
    winning_bid_id: null,
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
  {
    id: "auc-2",
    product_id: "prod-2",
    starting_price: 45000,
    current_price: 45000,
    min_increment: 1000,
    start_time: new Date(Date.now() - 3600 * 1000 * 5).toISOString(), // started 5 hrs ago
    end_time: new Date(Date.now() + 3600 * 1000 * 24).toISOString(),  // ends in 24 hours
    status: "active",
    winner_id: null,
    winning_bid_id: null,
    created_at: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
  },
  {
    id: "auc-3",
    product_id: "prod-3",
    starting_price: 60000,
    current_price: 64000,
    min_increment: 1500,
    start_time: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
    end_time: new Date(Date.now() + 60 * 1000 * 8).toISOString(),     // ENDING SOON! Ends in 8 minutes!
    status: "active",
    winner_id: null,
    winning_bid_id: null,
    created_at: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
  },
  {
    id: "auc-4",
    product_id: "prod-4",
    starting_price: 15000,
    current_price: 18000,
    min_increment: 500,
    start_time: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    end_time: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),   // Ended 1 hour ago
    status: "ended",
    winner_id: "usr-complete",
    winning_bid_id: "bid-mock-retro-4",
    created_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
  }
];

const MOCK_BIDS: Bid[] = [
  {
    id: "bid-mock-iphone-1",
    auction_id: "auc-1",
    user_id: "usr-incomplete",
    amount: 82000,
    status: "active",
    created_at: new Date(Date.now() - 3600 * 1000 * 1.5).toISOString(),
  },
  {
    id: "bid-mock-iphone-2",
    auction_id: "auc-1",
    user_id: "usr-complete",
    amount: 85000,
    status: "active",
    created_at: new Date(Date.now() - 3600 * 1000 * 1.0).toISOString(),
  },
  {
    id: "bid-mock-drone-1",
    auction_id: "auc-3",
    user_id: "usr-complete",
    amount: 61500,
    status: "active",
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: "bid-mock-drone-2",
    auction_id: "auc-3",
    user_id: "usr-incomplete",
    amount: 64000,
    status: "active",
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "bid-mock-retro-1",
    auction_id: "auc-4",
    user_id: "usr-incomplete",
    amount: 15500,
    status: "active",
    created_at: new Date(Date.now() - 3600 * 1000 * 11).toISOString(),
  },
  {
    id: "bid-mock-retro-2",
    auction_id: "auc-4",
    user_id: "usr-complete",
    amount: 16500,
    status: "active",
    created_at: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
  },
  {
    id: "bid-mock-retro-3",
    auction_id: "auc-4",
    user_id: "usr-incomplete",
    amount: 17000,
    status: "active",
    created_at: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
  },
  {
    id: "bid-mock-retro-4",
    auction_id: "auc-4",
    user_id: "usr-complete",
    amount: 18000,
    status: "active",
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  }
];

const MOCK_ORDERS: Order[] = [
  {
    id: "ord-1",
    auction_id: "auc-4",
    winner_id: "usr-complete",
    final_price: 18000,
    full_name: "Arjan Shkodra",
    phone_number: "+355691234567",
    country: "Albania",
    city: "Tirana",
    address: "Rruga Myslym Shyri, Pallati 12, Ap. 5",
    status: "pending_confirmation",
    created_at: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
  }
];

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    action: "product_create",
    performed_by: "usr-admin",
    target_id: "prod-1",
    details: { title: "iPhone 15 Pro Max - 256GB" },
    created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
  },
  {
    id: "log-2",
    action: "auction_create",
    performed_by: "usr-admin",
    target_id: "auc-1",
    details: { startingPrice: 80000, duration: "72 hours" },
    created_at: new Date(Date.now() - 3600 * 1000 * 23).toISOString(),
  }
];

// Set up node global singleton to persist memory state in hot reload
interface MemoryDb {
  categories: Category[];
  profiles: Profile[];
  products: Product[];
  auctions: Auction[];
  bids: Bid[];
  orders: Order[];
  auditLogs: AuditLog[];
  simulatedUserRole: string; // 'guest', 'incomplete', 'complete', 'admin'
}

let db: MemoryDb;

if (process.env.NODE_ENV === "production") {
  db = {
    categories: [...MOCK_CATEGORIES],
    profiles: [...MOCK_PROFILES],
    products: [...MOCK_PRODUCTS],
    auctions: [...MOCK_AUCTIONS],
    bids: [...MOCK_BIDS],
    orders: [...MOCK_ORDERS],
    auditLogs: [...MOCK_AUDIT_LOGS],
    simulatedUserRole: "complete"
  };
} else {
  const globalWithDb = global as typeof globalThis & { _memoryDb?: MemoryDb };
  if (!globalWithDb._memoryDb) {
    globalWithDb._memoryDb = {
      categories: [...MOCK_CATEGORIES],
      profiles: [...MOCK_PROFILES],
      products: [...MOCK_PRODUCTS],
      auctions: [...MOCK_AUCTIONS],
      bids: [...MOCK_BIDS],
      orders: [...MOCK_ORDERS],
      auditLogs: [...MOCK_AUDIT_LOGS],
      simulatedUserRole: "complete" // defaults to Complete Buyer for sandbox convenience
    };
  }
  db = globalWithDb._memoryDb;
}

// Helper to determine if we should fall back to memory
export function isSupabaseConnected(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  if (url.includes("your-project") || url.includes("placeholder")) return false;
  if (key.includes("mock-") || key.includes("placeholder")) return false;
  return true;
}

// =====================================================================
// DATABASE LAYER EXPORTS
// =====================================================================
export async function getSimulatedUser() {
  const role = db.simulatedUserRole;
  return db.profiles.find(p => p.id === `usr-${role}`) || db.profiles[2]; // Default to complete buyer
}

export async function getCurrentUserProfile(): Promise<Profile> {
  if (isSupabaseConnected()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return db.profiles[0];

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) return profile;

    return {
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email || "User",
      phone_number: "",
      country: "Albania",
      city: "",
      address: "",
      is_admin: false,
      is_blocked: false,
      created_at: user.created_at || new Date().toISOString(),
    };
  }

  return getSimulatedUser();
}

export async function setSimulatedUserRole(role: string) {
  if (["guest", "incomplete", "complete", "admin"].includes(role)) {
    db.simulatedUserRole = role;
  }
}

export async function getSimulatedUserRole() {
  return db.simulatedUserRole;
}

// 1. Categories
export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConnected()) {
    const supabase = await createClient();
    const { data } = await supabase.from("categories").select("*").order("name");
    return data || [];
  }
  return db.categories;
}

// 2. Products
export async function getProducts(): Promise<Product[]> {
  if (isSupabaseConnected()) {
    const supabase = await createClient();
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    return data || [];
  }
  return db.products;
}

export async function getProductById(id: string): Promise<Product | null> {
  if (isSupabaseConnected()) {
    const supabase = await createClient();
    const { data } = await supabase.from("products").select("*").eq("id", id).single();
    return data || null;
  }
  return db.products.find(p => p.id === id) || null;
}

// 3. Auctions
export async function getAuctions(): Promise<(Auction & { product: Product; category: Category | null })[]> {
  // Always trigger auto closer check to keep times active
  await autoCloseAuctionsMemory();

  if (isSupabaseConnected()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("auctions")
      .select("*, product:products(*), category:products(category_id)")
      .order("end_time", { ascending: true });

    if (data) {
      // Fetch categories separately and map them for safety
      const categories = await getCategories();
      return data.map((a: any) => ({
        ...a,
        product: a.product,
        category: categories.find(c => c.id === a.product?.category_id) || null
      }));
    }
    return [];
  }

  return db.auctions.map(auc => {
    const product = db.products.find(p => p.id === auc.product_id)!;
    const category = db.categories.find(c => c.id === product?.category_id) || null;
    return { ...auc, product, category };
  });
}

export async function getAuctionById(id: string): Promise<(Auction & { product: Product; category: Category | null }) | null> {
  await autoCloseAuctionsMemory();

  if (isSupabaseConnected()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("auctions")
      .select("*, product:products(*)")
      .eq("id", id)
      .single();

    if (data) {
      const categories = await getCategories();
      const category = categories.find(c => c.id === data.product?.category_id) || null;
      return { ...data, product: data.product, category };
    }
    return null;
  }

  const auc = db.auctions.find(a => a.id === id);
  if (!auc) return null;
  const product = db.products.find(p => p.id === auc.product_id)!;
  const category = db.categories.find(c => c.id === product?.category_id) || null;
  return { ...auc, product, category };
}

// 4. Bids
export async function getBidsForAuction(auctionId: string): Promise<(Bid & { user: Profile })[]> {
  if (isSupabaseConnected()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("bids")
      .select("*, user:profiles(*)")
      .eq("auction_id", auctionId)
      .order("amount", { ascending: false })
      .order("created_at", { ascending: true });
    return data || [];
  }

  return db.bids
    .filter(b => b.auction_id === auctionId)
    .map(b => {
      const user = db.profiles.find(p => p.id === b.user_id) || db.profiles[1];
      return { ...b, user };
    })
    .sort((a, b) => b.amount - a.amount || new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function getBidsByUser(userId: string): Promise<(Bid & { auction: Auction & { product: Product } })[]> {
  if (isSupabaseConnected()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("bids")
      .select("*, auction:auctions(*, product:products(*))")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return data || [];
  }

  return db.bids
    .filter(b => b.user_id === userId)
    .map(b => {
      const auction = db.auctions.find(a => a.id === b.auction_id)!;
      const product = db.products.find(p => p.id === auction.product_id)!;
      return {
        ...b,
        auction: { ...auction, product }
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// 5. Orders
export async function getOrders(): Promise<(Order & { auction: Auction & { product: Product }; winner: Profile })[]> {
  if (isSupabaseConnected()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, auction:auctions(*, product:products(*)), winner:profiles(*)")
      .order("created_at", { ascending: false });
    return data || [];
  }

  return db.orders.map(o => {
    const auction = db.auctions.find(a => a.id === o.auction_id)!;
    const product = db.products.find(p => p.id === auction.product_id)!;
    const winner = db.profiles.find(p => p.id === o.winner_id)!;
    return {
      ...o,
      auction: { ...auction, product },
      winner
    };
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getOrdersByUser(userId: string): Promise<(Order & { auction: Auction & { product: Product } })[]> {
  if (isSupabaseConnected()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, auction:auctions(*, product:products(*))")
      .eq("winner_id", userId)
      .order("created_at", { ascending: false });
    return data || [];
  }

  return db.orders
    .filter(o => o.winner_id === userId)
    .map(o => {
      const auction = db.auctions.find(a => a.id === o.auction_id)!;
      const product = db.products.find(p => p.id === auction.product_id)!;
      return {
        ...o,
        auction: { ...auction, product }
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// 6. Profiles / Users Directory
export async function getProfiles(): Promise<Profile[]> {
  if (isSupabaseConnected()) {
    const supabase = await createClient();
    const { data } = await supabase.from("profiles").select("*").order("created_at");
    return data || [];
  }
  return db.profiles;
}

export async function getProfileById(id: string): Promise<Profile | null> {
  if (isSupabaseConnected()) {
    const supabase = await createClient();
    const { data } = await supabase.from("profiles").select("*").eq("id", id).single();
    return data || null;
  }
  return db.profiles.find(p => p.id === id) || null;
}

// 7. Audit Logs
export async function getAuditLogs(): Promise<(AuditLog & { performer: Profile | null })[]> {
  if (isSupabaseConnected()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("audit_logs")
      .select("*, performer:profiles(*)")
      .order("created_at", { ascending: false });
    return data || [];
  }

  return db.auditLogs.map(l => {
    const performer = db.profiles.find(p => p.id === l.performed_by) || null;
    return { ...l, performer };
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// =====================================================================
// MEMORY WRITE MODIFIERS (MOCK DATABASE MUTATORS)
// =====================================================================
export async function placeBidMemory(auctionId: string, userId: string, amount: number) {
  const auc = db.auctions.find(a => a.id === auctionId);
  const user = db.profiles.find(p => p.id === userId);

  if (!auc) return { success: false, error: "Auction not found." };
  if (!user) return { success: false, error: "User not found." };
  if (user.is_blocked) return { success: false, error: "This user has been blocked from placing bids." };

  // Profile completion validation
  if (!user.full_name || !user.phone_number || !user.city || !user.address) {
    return { success: false, error: "Ju lutemi plotësoni adresën tuaj dhe numrin e telefonit në profil para se të ofroni." };
  }

  if (auc.status !== "active") {
    return { success: false, error: `Bidding not allowed. Auction is currently ${auc.status}.` };
  }

  // Bid Increment check
  const activeBids = db.bids.filter(b => b.auction_id === auctionId && b.status === "active");
  if (activeBids.length === 0) {
    if (amount < auc.starting_price) {
      return { success: false, error: `Bidi i parë duhet të jetë të paktën sa çmimi fillestar Leka ${auc.starting_price}.` };
    }
  } else {
    const highestBid = Math.max(...activeBids.map(b => b.amount));
    if (amount < (highestBid + auc.min_increment)) {
      return { success: false, error: `Bidi duhet të jetë të paktën Leka ${highestBid + auc.min_increment} për të respektuar hapin minimal.` };
    }
  }

  // Insert bid
  const newBid: Bid = {
    id: `bid-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    auction_id: auctionId,
    user_id: userId,
    amount,
    status: "active",
    created_at: new Date().toISOString()
  };

  db.bids.push(newBid);
  auc.current_price = amount;

  return { success: true, bidId: newBid.id };
}

export async function cancelBidMemory(bidId: string, performedBy: string, reason: string) {
  const bid = db.bids.find(b => b.id === bidId);
  if (!bid) return { success: false, error: "Bid not found." };
  if (bid.status === "cancelled") return { success: false, error: "Bid is already cancelled." };

  bid.status = "cancelled";
  bid.cancelled_reason = reason;

  // Recalculate price
  const auc = db.auctions.find(a => a.id === bid.auction_id)!;
  const remainingActiveBids = db.bids.filter(b => b.auction_id === auc.id && b.status === "active");

  if (remainingActiveBids.length > 0) {
    auc.current_price = Math.max(...remainingActiveBids.map(b => b.amount));
  } else {
    auc.current_price = auc.starting_price;
  }

  // Log action
  db.auditLogs.push({
    id: `log-${Date.now()}`,
    action: "bid_cancel",
    performed_by: performedBy,
    target_id: bidId,
    details: { reason, amount: bid.amount, auctionId: bid.auction_id },
    created_at: new Date().toISOString()
  });

  return { success: true };
}

export async function updateOrderStatusMemory(orderId: string, performedBy: string, status: any) {
  const ord = db.orders.find(o => o.id === orderId);
  if (!ord) return { success: false, error: "Order not found." };

  ord.status = status;

  db.auditLogs.push({
    id: `log-${Date.now()}`,
    action: "order_status_change",
    performed_by: performedBy,
    target_id: orderId,
    details: { status },
    created_at: new Date().toISOString()
  });

  return { success: true };
}

export async function toggleUserBlockMemory(userId: string, performedBy: string, isBlocked: boolean) {
  const p = db.profiles.find(u => u.id === userId);
  if (!p) return { success: false, error: "Profile not found." };

  p.is_blocked = isBlocked;

  if (isBlocked) {
    // Cancel all their bids
    const userBids = db.bids.filter(b => b.user_id === userId && b.status === "active");
    for (const b of userBids) {
      b.status = "cancelled";
      b.cancelled_reason = "Llogaria e përdoruesit u pezullua";

      const auc = db.auctions.find(a => a.id === b.auction_id)!;
      const remainingBids = db.bids.filter(x => x.auction_id === auc.id && x.status === "active");
      if (remainingBids.length > 0) {
        auc.current_price = Math.max(...remainingBids.map(x => x.amount));
      } else {
        auc.current_price = auc.starting_price;
      }
    }
  }

  db.auditLogs.push({
    id: `log-${Date.now()}`,
    action: "user_restrict",
    performed_by: performedBy,
    target_id: userId,
    details: { isBlocked },
    created_at: new Date().toISOString()
  });

  return { success: true };
}

export async function updateProfileMemory(userId: string, fullName: string, phone: string, city: string, address: string) {
  const p = db.profiles.find(u => u.id === userId);
  if (!p) return { success: false, error: "Profile not found." };

  p.full_name = fullName;
  p.phone_number = phone;
  p.city = city;
  p.address = address;

  return { success: true };
}

export async function createProductMemory(title: string, desc: string, catId: string, cond: any, notes: string, imageUrls: string[]) {
  const newProd: Product = {
    id: `prod-${Date.now()}`,
    title,
    description: desc,
    category_id: catId,
    condition: cond,
    images: imageUrls.length > 0 ? imageUrls : ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80"],
    testing_notes: notes,
    status: "active",
    created_at: new Date().toISOString()
  };

  db.products.push(newProd);

  return newProd;
}

export async function createAuctionMemory(productId: string, startPrice: number, minInc: number, startTime: string, endTime: string) {
  const newAuc: Auction = {
    id: `auc-${Date.now()}`,
    product_id: productId,
    starting_price: startPrice,
    current_price: startPrice,
    min_increment: minInc,
    start_time: startTime,
    end_time: endTime,
    status: new Date() >= new Date(startTime) ? "active" : "scheduled",
    winner_id: null,
    winning_bid_id: null,
    created_at: new Date().toISOString()
  };

  db.auctions.push(newAuc);
  return newAuc;
}

export async function cancelAuctionMemory(auctionId: string, performedBy: string) {
  const auc = db.auctions.find(a => a.id === auctionId);
  if (!auc) return { success: false, error: "Auction not found." };

  auc.status = "cancelled";

  db.auditLogs.push({
    id: `log-${Date.now()}`,
    action: "auction_cancel",
    performed_by: performedBy,
    target_id: auctionId,
    details: {},
    created_at: new Date().toISOString()
  });

  return { success: true };
}

export async function relistAuctionMemory(auctionId: string, performedBy: string, start: string, end: string, startPrice: number) {
  const auc = db.auctions.find(a => a.id === auctionId);
  if (!auc) return { success: false, error: "Auction not found." };

  auc.starting_price = startPrice;
  auc.current_price = startPrice;
  auc.start_time = start;
  auc.end_time = end;
  auc.status = new Date() >= new Date(start) ? "active" : "scheduled";
  auc.winner_id = null;
  auc.winning_bid_id = null;

  // Cancel old bids
  const bids = db.bids.filter(b => b.auction_id === auctionId);
  bids.forEach(b => {
    b.status = "cancelled";
    b.cancelled_reason = "Ankandi u ri-listua";
  });

  db.auditLogs.push({
    id: `log-${Date.now()}`,
    action: "auction_relist",
    performed_by: performedBy,
    target_id: auctionId,
    details: { startingPrice: startPrice, startTime: start, endTime: end },
    created_at: new Date().toISOString()
  });

  return { success: true };
}

// 8. Auto-closer in memory
async function autoCloseAuctionsMemory() {
  const now = new Date();
  const expired = db.auctions.filter(a => (a.status === "active" || a.status === "scheduled") && now >= new Date(a.end_time));

  for (const auc of expired) {
    // Find highest bid
    const activeBids = db.bids.filter(b => b.auction_id === auc.id && b.status === "active");
    if (activeBids.length > 0) {
      const highestBid = activeBids.sort((a, b) => b.amount - a.amount || new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];
      auc.status = "ended";
      auc.winner_id = highestBid.user_id;
      auc.winning_bid_id = highestBid.id;

      // Check if order already exists
      const orderExists = db.orders.some(o => o.auction_id === auc.id);
      if (!orderExists) {
        const winner = db.profiles.find(p => p.id === highestBid.user_id)!;
        db.orders.push({
          id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          auction_id: auc.id,
          winner_id: highestBid.user_id,
          final_price: highestBid.amount,
          full_name: winner.full_name || "Winner Account",
          phone_number: winner.phone_number || "N/A",
          country: winner.country || "Albania",
          city: winner.city || "Tirana",
          address: winner.address || "Pending Confirmation",
          status: "pending_confirmation",
          created_at: new Date().toISOString()
        });
      }
    } else {
      auc.status = "ended";
    }
  }
}
