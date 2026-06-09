import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const adminActions = readFileSync(new URL("../src/app/actions/admin.ts", import.meta.url), "utf8");
const db = readFileSync(new URL("../src/lib/db.ts", import.meta.url), "utf8");
const adminBidsPage = readFileSync(new URL("../src/app/admin/bids/page.tsx", import.meta.url), "utf8");
const adminOrdersPage = readFileSync(new URL("../src/app/admin/orders/page.tsx", import.meta.url), "utf8");
const adminUsersTable = readFileSync(new URL("../src/app/components/AdminUsersTable.tsx", import.meta.url), "utf8");
const adminOverviewPage = readFileSync(new URL("../src/app/admin/page.tsx", import.meta.url), "utf8");

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
