import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const adminActions = readFileSync(new URL("../src/app/actions/admin.ts", import.meta.url), "utf8");
const authActions = readFileSync(new URL("../src/app/actions/auth.ts", import.meta.url), "utf8");
const bidActions = readFileSync(new URL("../src/app/actions/bids.ts", import.meta.url), "utf8");
const finalizeRoute = readFileSync(new URL("../src/app/api/auctions/finalize/route.ts", import.meta.url), "utf8");
const rateLimit = readFileSync(new URL("../src/lib/rate-limit.ts", import.meta.url), "utf8");
const db = readFileSync(new URL("../src/lib/db.ts", import.meta.url), "utf8");
const adminBidsPage = readFileSync(new URL("../src/app/admin/bids/page.tsx", import.meta.url), "utf8");
const adminOrdersPage = readFileSync(new URL("../src/app/admin/orders/page.tsx", import.meta.url), "utf8");
const adminAuctionsPage = readFileSync(new URL("../src/app/admin/auctions/page.tsx", import.meta.url), "utf8");
const adminProductsPage = readFileSync(new URL("../src/app/admin/products/page.tsx", import.meta.url), "utf8");
const adminUsersTable = readFileSync(new URL("../src/app/components/AdminUsersTable.tsx", import.meta.url), "utf8");
const adminOverviewPage = readFileSync(new URL("../src/app/admin/page.tsx", import.meta.url), "utf8");
const adminForms = readFileSync(new URL("../src/app/components/AdminForms.tsx", import.meta.url), "utf8");
const accountForms = readFileSync(new URL("../src/app/components/AccountForms.tsx", import.meta.url), "utf8");
const profileWorkspace = readFileSync(new URL("../src/app/components/ProfileWorkspace.tsx", import.meta.url), "utf8");
const registerPage = readFileSync(new URL("../src/app/(auth)/register/page.tsx", import.meta.url), "utf8");
const resetPasswordPage = readFileSync(new URL("../src/app/(auth)/reset-password/page.tsx", import.meta.url), "utf8");
const authLayout = readFileSync(new URL("../src/app/(auth)/layout.tsx", import.meta.url), "utf8");
const authConfirmRoute = readFileSync(new URL("../src/app/auth/confirm/route.ts", import.meta.url), "utf8");
const siteUrl = readFileSync(new URL("../src/lib/site-url.ts", import.meta.url), "utf8");
const nextConfig = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");

test("admin bids page uses one admin bid query instead of per-auction fan-out", () => {
  assert.match(db, /export\s+async\s+function\s+getAdminBids\s*\(/);
  assert.match(adminBidsPage, /getAdminBids\s*\(/);
  assert.doesNotMatch(adminBidsPage, /getBidsForAuction/);
  assert.doesNotMatch(adminBidsPage, /auctions\.map\(\(auction\)\s*=>\s*getBidsForAuction/);
});

test("admin overview does not fan out bid queries per auction", () => {
  assert.match(db, /export\s+async\s+function\s+getAdminActiveBids\s*\(/);
  assert.match(db, /export\s+async\s+function\s+getAdminBidCount\s*\(/);
  assert.match(adminOverviewPage, /getAdminActiveBids\s*\(/);
  assert.match(adminOverviewPage, /getAdminBidCount\s*\(/);
  assert.doesNotMatch(adminOverviewPage, /getBidsForAuction/);
  assert.doesNotMatch(adminOverviewPage, /Promise\.all\(\s*auctions\.map/);
});

test("broad list reads are bounded", () => {
  for (const functionName of [
    "getProducts",
    "getAuctions",
    "getBidsForAuction",
    "getBidsByUser",
    "getOrders",
    "getOrdersByUser",
    "getProfiles",
    "getCustomerProfiles",
    "getAuditLogs",
  ]) {
    const match = db.match(new RegExp(`export\\s+async\\s+function\\s+${functionName}[\\s\\S]*?return \\(data \\|\\| \\[\\]\\)`));
    assert.ok(match, `${functionName} should return query data`);
    assert.match(match[0], /\.limit\(\d+\)/, `${functionName} should limit broad reads`);
  }
});

test("product image uploads are cleaned up when product writes fail", () => {
  assert.match(adminActions, /async\s+function\s+cleanupUploadedProductImages\s*\(/);
  assert.match(adminActions, /storage\.from\(PRODUCT_IMAGE_BUCKET\)\.remove/);
  assert.match(adminActions, /cleanupUploadedProductImages\(uploadedImagePaths\)/);
  assert.match(adminActions, /catch\s*\(\s*error\s*\)\s*\{\s*await cleanupUploadedProductImages\(uploadedPaths\);/);
});

test("product image uploads fail gracefully before oversized requests crash the client", () => {
  assert.match(nextConfig, /serverActions[\s\S]*?bodySizeLimit:\s*"30mb"/);
  assert.match(adminActions, /MAX_PRODUCT_IMAGE_SIZE_BYTES\s*=\s*5\s*\*\s*1024\s*\*\s*1024/);
  assert.match(adminActions, /MAX_PRODUCT_UPLOAD_BYTES\s*=\s*24\s*\*\s*1024\s*\*\s*1024/);
  assert.match(adminActions, /files\.length\s*>\s*MAX_PRODUCT_IMAGE_COUNT/);
  assert.match(adminForms, /function\s+validateImageFiles\s*\(/);
  assert.match(adminForms, /onSubmit=\{validateSubmit\}/);
  assert.match(adminForms, /event\.preventDefault\(\)/);
});

test("sensitive server actions use app-level rate limits", () => {
  assert.match(rateLimit, /check_app_rate_limit/);
  assert.match(rateLimit, /createHash\("sha256"\)/);
  assert.match(rateLimit, /x-forwarded-for/);
  assert.match(authActions, /enforceRateLimits/);
  assert.match(authActions, /auth:sign-in:email/);
  assert.match(authActions, /auth:sign-up:ip/);
  assert.match(authActions, /auth:password-reset:email/);
  assert.match(bidActions, /bid:place:auction-user/);
  assert.match(adminActions, /admin:action:user/);
  assert.match(finalizeRoute, /api:auction-finalize/);
});

test("password policy is at least eight characters across auth forms", () => {
  assert.match(authActions, /password\.length\s*<\s*8/);
  assert.match(registerPage, /Min\. 8 karaktere/);
  assert.doesNotMatch(`${resetPasswordPage}\n${accountForms}\n${profileWorkspace}`, /minLength=\{6\}/);
  assert.match(resetPasswordPage, /minLength=\{8\}/);
  assert.match(accountForms, /minLength=\{8\}/);
  assert.match(profileWorkspace, /minLength=\{8\}/);
});

test("next config applies browser security headers", () => {
  assert.match(nextConfig, /Content-Security-Policy/);
  assert.match(nextConfig, /frame-ancestors 'none'/);
  assert.match(nextConfig, /X-Content-Type-Options/);
  assert.match(nextConfig, /X-Frame-Options/);
  assert.match(nextConfig, /Strict-Transport-Security/);
  assert.match(nextConfig, /Permissions-Policy/);
});

test("auth pages are not cached across deployments", () => {
  assert.match(authLayout, /dynamic\s*=\s*"force-dynamic"/);
  assert.match(authLayout, /revalidate\s*=\s*0/);
  assert.match(authLayout, /fetchCache\s*=\s*"force-no-store"/);
  assert.match(nextConfig, /const\s+noStoreHeaders/);
  assert.match(nextConfig, /source:\s*"\/login"[\s\S]*?headers:\s*noStoreHeaders/);
  assert.match(nextConfig, /source:\s*"\/register"[\s\S]*?headers:\s*noStoreHeaders/);
  assert.match(nextConfig, /source:\s*"\/reset-password"[\s\S]*?headers:\s*noStoreHeaders/);
  assert.match(nextConfig, /source:\s*"\/auth\/callback"[\s\S]*?headers:\s*noStoreHeaders/);
  assert.match(nextConfig, /source:\s*"\/auth\/confirm"[\s\S]*?headers:\s*noStoreHeaders/);
});

test("auth redirects use the configured production site URL", () => {
  assert.match(authActions, /emailRedirectTo:\s*`\$\{baseUrl\}\/auth\/callback`/);
  assert.match(authActions, /redirectTo:\s*`\$\{baseUrl\}\/auth\/callback`/);
  assert.match(authActions, /const\s+baseUrl\s*=\s*getSiteUrl\(\)/);
  assert.match(siteUrl, /NEXT_PUBLIC_SITE_URL is required in production/);
  assert.doesNotMatch(authActions, /process\.env\.NEXT_PUBLIC_SITE_URL\s*\|\|\s*"http:\/\/localhost:3000"/);
  assert.match(authConfirmRoute, /export\s+\{\s*GET\s*\}\s+from\s+"..\/callback\/route"/);
});

test("audit log insert failures are surfaced", () => {
  assert.match(adminActions, /const\s+\{\s*error\s*\}\s*=\s*await\s+supabase\.from\("audit_logs"\)\.insert/);
  assert.match(adminActions, /throw\s+new\s+Error\(`Audit log write failed:/);
});

test("delivered orders do not force products inactive", () => {
  const updateOrderStatusMatch = adminActions.match(/export\s+async\s+function\s+updateOrderStatus[\s\S]*?export\s+async\s+function\s+toggleAuctionAutoRelist/);
  assert.ok(updateOrderStatusMatch, "updateOrderStatus should exist before toggleAuctionAutoRelist");
  assert.doesNotMatch(updateOrderStatusMatch[0], /status\s*===\s*"delivered"[\s\S]*?\.from\("products"\)[\s\S]*?status:\s*"inactive"/);
  assert.match(updateOrderStatusMatch[0], /status\s*===\s*"cancelled"[\s\S]*?status:\s*"active"/);
});

test("auction auto relist is admin-only and audited", () => {
  assert.match(adminActions, /export\s+async\s+function\s+toggleAuctionAutoRelist\s*\(/);
  assert.match(adminActions, /toggleAuctionAutoRelist[\s\S]*?checkAdminAuth\(\)/);
  assert.match(adminActions, /auction_auto_relist_change/);
  assert.match(db, /auto_relist/);
});

test("admin orders page only shows orders still in process", () => {
  assert.match(adminOrdersPage, /filter\(\(order\)\s*=>\s*!\["delivered",\s*"cancelled"\]\.includes\(order\.status\)\)/);
  assert.match(adminOrdersPage, /Nuk ka porosi ne proces/);
});

test("admin cleanup deletes are guarded and exposed in the right admin pages", () => {
  assert.match(adminActions, /export\s+async\s+function\s+deleteCustomerAccount\s*\(/);
  assert.match(adminActions, /deleteCustomerAccount[\s\S]*?checkAdminAuth\(\)/);
  assert.match(adminActions, /targetProfile\.is_admin/);
  assert.match(adminActions, /Customer has an order still in process/);
  assert.match(adminActions, /Customer still has active bids in live auctions/);
  assert.match(adminActions, /auth\.admin\.deleteUser\(userId\)/);
  assert.match(adminActions, /export\s+async\s+function\s+deleteCompletedBid\s*\(/);
  assert.match(adminActions, /Active auction bids must be cancelled, not deleted/);
  assert.match(adminActions, /Order is still in process\. Complete or cancel it before deleting related offers/);
  assert.match(adminBidsPage, /deleteCompletedBid/);
  assert.match(adminUsersTable, /submitDeleteCustomerAccount/);
});

test("admin auctions page is the combined product and auction workspace", () => {
  assert.match(adminProductsPage, /redirect\("\/admin\/auctions"\)/);
  assert.match(adminAuctionsPage, /ProductCreateForm/);
  assert.match(adminAuctionsPage, /PRODUCT_FILTERS/);
  assert.match(adminAuctionsPage, /filter=\$\{filter\.key\}/);
  assert.match(adminAuctionsPage, /createAuction/);
  assert.match(adminAuctionsPage, /setProductStatus/);
  assert.match(adminAuctionsPage, /deleteProduct/);
  assert.doesNotMatch(adminAuctionsPage, /AuctionCreateForm/);
});

test("product activation rules are enforced server-side for auction workflows", () => {
  assert.match(adminActions, /createAuction[\s\S]*?product\.status\s*!==\s*"active"[\s\S]*?Only active and available products can be auctioned/);
  assert.match(adminActions, /relistAuction[\s\S]*?product:products\(status\)[\s\S]*?product\.status\s*!==\s*"active"[\s\S]*?Only active products can be relisted/);
  assert.match(adminActions, /setProductStatus[\s\S]*?revalidatePath\("\/admin\/auctions"\)/);
});

test("delivered orders do not block relist and product delete cascades related records", () => {
  const relistAuctionMatch = adminActions.match(/export\s+async\s+function\s+relistAuction[\s\S]*?export\s+async\s+function\s+cancelBid/);
  assert.ok(relistAuctionMatch, "relistAuction should exist before cancelBid");
  assert.match(relistAuctionMatch[0], /const lockedStatuses = \["pending_confirmation", "confirmed", "processing", "out_for_delivery"\]/);
  assert.doesNotMatch(relistAuctionMatch[0], /lockedStatuses = \[[^\]]*"delivered"/);

  const deleteProductMatch = adminActions.match(/export\s+async\s+function\s+deleteProduct[\s\S]*?export\s+async\s+function\s+submitSetProductStatus/);
  assert.ok(deleteProductMatch, "deleteProduct should exist before submitSetProductStatus");
  assert.match(deleteProductMatch[0], /\.from\("orders"\)\.delete\(\)\.in\("auction_id", auctionIds\)/);
  assert.match(deleteProductMatch[0], /\.from\("bids"\)\.delete\(\)\.in\("auction_id", auctionIds\)/);
  assert.match(deleteProductMatch[0], /\.from\("auctions"\)\.delete\(\)\.in\("id", auctionIds\)/);
  assert.match(adminAuctionsPage, /confirmMessage="Fshij kete produkt dhe te gjitha ankandet, ofertat dhe porosite e lidhura me te\?/);
});
