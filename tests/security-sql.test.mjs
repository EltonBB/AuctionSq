import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const schema = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");
const hardening = readFileSync(
  new URL("../supabase/migrations/20260607_must_fix_rls_hardening.sql", import.meta.url),
  "utf8"
);
const auctionIntegrity = readFileSync(
  new URL("../supabase/migrations/20260607_high_priority_auction_integrity.sql", import.meta.url),
  "utf8"
);
const appRateLimits = readFileSync(
  new URL("../supabase/migrations/20260617193233_app_rate_limits.sql", import.meta.url),
  "utf8"
);
const adminActions = readFileSync(new URL("../src/app/actions/admin.ts", import.meta.url), "utf8");

const combined = `${schema}\n${hardening}\n${auctionIntegrity}`;

test("profiles cannot be self-updated through a broad table policy", () => {
  assert.doesNotMatch(
    combined,
    /CREATE\s+POLICY\s+"Allow users to update their own profiles"[\s\S]*?ON\s+public\.profiles/i
  );
  assert.match(combined, /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.update_own_profile\s*\(/i);
  assert.match(combined, /DROP\s+POLICY\s+IF\s+EXISTS\s+"Allow users to update their own profiles"\s+ON\s+public\.profiles/i);
});

test("authenticated users cannot insert bids directly", () => {
  assert.doesNotMatch(
    combined,
    /CREATE\s+POLICY\s+"Allow authenticated users to place bids"[\s\S]*?FOR\s+INSERT\s+TO\s+authenticated/i
  );
  assert.match(combined, /DROP\s+POLICY\s+IF\s+EXISTS\s+"Allow authenticated users to place bids"\s+ON\s+public\.bids/i);
  assert.match(combined, /GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.place_bid\(UUID,\s*NUMERIC\)\s+TO\s+authenticated/i);
});

test("orders are confirmed through a narrow RPC instead of direct user updates", () => {
  assert.doesNotMatch(
    combined,
    /CREATE\s+POLICY\s+"Allow users to confirm their own order delivery details"[\s\S]*?ON\s+public\.orders/i
  );
  assert.match(combined, /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.confirm_order_delivery\s*\(/i);
  assert.match(
    combined,
    /DROP\s+POLICY\s+IF\s+EXISTS\s+"Allow users to confirm their own order delivery details"\s+ON\s+public\.orders/i
  );
});

test("only one live auction can exist for a product", () => {
  assert.match(
    combined,
    /CREATE\s+UNIQUE\s+INDEX\s+IF\s+NOT\s+EXISTS\s+auctions_one_live_per_product_idx[\s\S]*?ON\s+public\.auctions\s*\(\s*product_id\s*\)[\s\S]*?WHERE\s+status\s+IN\s*\(\s*'active'\s*,\s*'scheduled'\s*\)/i
  );
});

test("public auction reads do not expose every auction status", () => {
  assert.doesNotMatch(
    combined,
    /CREATE\s+POLICY\s+"Allow public read access to auctions"[\s\S]*?FOR\s+SELECT\s+TO\s+public\s+USING\s*\(\s*true\s*\)/i
  );
  assert.match(
    combined,
    /CREATE\s+POLICY\s+"Allow public read access to auctions"[\s\S]*?status\s+IN\s*\(\s*'active'\s*,\s*'ended'\s*\)/i
  );
});

test("admin bid moderation is scoped to live auctions", () => {
  assert.match(adminActions, /Only live auction bids can be cancelled/i);
  assert.match(adminActions, /liveAuctionIds/i);
  assert.match(adminActions, /\.in\("status",\s*\["active",\s*"scheduled"\]\)/);
});

test("auto relist is server-side and only applies to no-bid expired auctions", () => {
  assert.match(schema, /auto_relist\s+BOOLEAN\s+NOT\s+NULL\s+DEFAULT\s+false/i);
  assert.match(schema, /SELECT\s+a\.id,\s*a\.product_id,\s*a\.starting_price,\s*a\.min_increment,\s*a\.auto_relist/i);
  assert.match(schema, /IF\s+r\.auto_relist\s+THEN[\s\S]*?status\s*=\s*'relisted'[\s\S]*?now\(\)\s*\+\s*interval\s+'24 hours'[\s\S]*?'active'[\s\S]*?true/i);
  assert.match(schema, /IF\s+FOUND\s+THEN[\s\S]*?INSERT\s+INTO\s+public\.orders/);
});

test("app rate limits are stored server-side and not exposed to browser roles", () => {
  assert.match(appRateLimits, /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+public\.app_rate_limits/i);
  assert.match(appRateLimits, /ALTER\s+TABLE\s+public\.app_rate_limits\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i);
  assert.match(appRateLimits, /REVOKE\s+ALL\s+ON\s+TABLE\s+public\.app_rate_limits\s+FROM\s+PUBLIC,\s*anon,\s*authenticated/i);
  assert.match(appRateLimits, /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.check_app_rate_limit/i);
  assert.match(appRateLimits, /SECURITY\s+DEFINER/i);
  assert.match(appRateLimits, /REVOKE\s+ALL\s+ON\s+FUNCTION\s+public\.check_app_rate_limit\(TEXT,\s*TEXT,\s*INTEGER,\s*INTEGER\)\s+FROM\s+PUBLIC,\s*anon,\s*authenticated/i);
  assert.match(appRateLimits, /GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.check_app_rate_limit\(TEXT,\s*TEXT,\s*INTEGER,\s*INTEGER\)\s+TO\s+service_role/i);
});
