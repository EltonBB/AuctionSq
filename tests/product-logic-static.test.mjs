import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const middleware = readFileSync(new URL("../src/lib/supabase/middleware.ts", import.meta.url), "utf8");
const dashboardLayout = readFileSync(new URL("../src/app/dashboard/layout.tsx", import.meta.url), "utf8");
const homePage = readFileSync(new URL("../src/app/(public)/page.tsx", import.meta.url), "utf8");
const rootLayout = readFileSync(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
const adminLayout = readFileSync(new URL("../src/app/admin/layout.tsx", import.meta.url), "utf8");
const pollingRefresh = readFileSync(new URL("../src/app/components/PollingRefresh.tsx", import.meta.url), "utf8");
const authActions = readFileSync(new URL("../src/app/actions/auth.ts", import.meta.url), "utf8");
const authCallback = readFileSync(new URL("../src/app/auth/callback/route.ts", import.meta.url), "utf8");
const auctionDetail = readFileSync(new URL("../src/app/(public)/auctions/[id]/page.tsx", import.meta.url), "utf8");
const auctionsPage = readFileSync(new URL("../src/app/(public)/auctions/page.tsx", import.meta.url), "utf8");
const endingSoonPage = readFileSync(new URL("../src/app/(public)/ending-soon/page.tsx", import.meta.url), "utf8");
const categoriesPage = readFileSync(new URL("../src/app/(public)/categories/page.tsx", import.meta.url), "utf8");
const brandUi = readFileSync(new URL("../src/app/components/BrandUi.tsx", import.meta.url), "utf8");
const countdownText = readFileSync(new URL("../src/app/components/CountdownText.tsx", import.meta.url), "utf8");
const biddingForm = readFileSync(new URL("../src/app/components/BiddingForm.tsx", import.meta.url), "utf8");

function readSourceFiles(relativeDir) {
  const dir = new URL(relativeDir, import.meta.url);
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const child = new URL(`${relativeDir}/${entry.name}`, import.meta.url);
    if (entry.isDirectory()) {
      return readSourceFiles(`${relativeDir}/${entry.name}`);
    }
    if (!/\.(tsx|ts)$/.test(entry.name)) {
      return [];
    }
    return [[child.pathname, readFileSync(child, "utf8")]];
  });
}

test("user dashboard routes are reachable for non-admin users", () => {
  assert.doesNotMatch(middleware, /Remove client panel routes/i);
  assert.doesNotMatch(middleware, /isLegacyDashboardRoute/);
  assert.doesNotMatch(middleware, /isLegacyDashboardRoute[\s\S]*?url\.pathname\s*=\s*isAdmin\s*\?\s*"\/admin"\s*:\s*"\/profile"/);
  assert.match(middleware, /url\.pathname\s*=\s*isAdmin\s*\?\s*"\/admin"\s*:\s*"\/dashboard\/profile"/);
  assert.doesNotMatch(authActions, /profile\?\.is_admin\s*\?\s*"\/admin"\s*:\s*"\/profile"/);
  assert.doesNotMatch(authCallback, /profile\?\.is_admin\s*\?\s*"\/admin"\s*:\s*"\/profile"/);
  assert.match(dashboardLayout, /return\s*\(\s*<div/);
  assert.doesNotMatch(dashboardLayout, /redirect\("\/profile"\)/);
});

test("app metadata and admin shell use NjeKlik branding", () => {
  for (const [file, source] of readSourceFiles("../src")) {
    assert.doesNotMatch(source, /AuctionSq|auctionsq\.com/, file);
  }
  assert.match(rootLayout, /NjeKlik/);
  assert.match(adminLayout, /NjeKlik Admin/);
});

test("auction bid leader is computed from active bids, not raw bid index", () => {
  assert.match(auctionDetail, /const\s+leaderBidId\s*=\s*activeBids\[0\]\?\.id/);
  assert.doesNotMatch(auctionDetail, /const\s+isLeader\s*=\s*bid\.status\s*===\s*"active"\s*&&\s*index\s*===\s*0/);
});

test("dynamic countdown text is calculated after client mount", () => {
  assert.doesNotMatch(auctionDetail, /Date\.now\(\)|function\s+formatTime/);
  assert.doesNotMatch(brandUi, /Date\.now\(\)|function\s+formatAuctionTime/);
  assert.match(auctionDetail, /<CountdownText\s+endTime=\{auc\.end_time\}\s+showSeconds\s+\/>/);
  assert.match(brandUi, /<CountdownText\s+endTime=\{auction\.end_time\}\s+\/>/);
  assert.match(countdownText, /useEffect[\s\S]*Date\.now\(\)/);
});

test("home auction grid stays server rendered", () => {
  assert.doesNotMatch(homePage, /AuctionShowMoreGrid/);
  assert.match(homePage, /<BrandAuctionCard\s+auction=\{auction\}\s+\/>/);
});

test("polling refresh does not refresh during initial hydration", () => {
  assert.doesNotMatch(pollingRefresh, /void\s+refresh\(\)/);
  assert.match(pollingRefresh, /window\.setInterval\(refresh,\s*intervalMs\)/);
});

test("bid form renders a stable placeholder before client mount", () => {
  assert.match(biddingForm, /const\s+\[isMounted,\s*setIsMounted\]\s*=\s*useState\(false\)/);
  assert.match(biddingForm, /if\s*\(!isMounted\)\s*\{/);
});

test("inactive products are hidden from public auction surfaces", () => {
  assert.match(homePage, /auction\.status\s*===\s*"active"\s*&&\s*auction\.product\?\.status\s*===\s*"active"/);
  assert.match(auctionsPage, /auction\.status\s*===\s*"active"\s*&&\s*auction\.product\?\.status\s*===\s*"active"/);
  assert.match(endingSoonPage, /auction\.status\s*===\s*"active"\s*&&\s*auction\.product\?\.status\s*===\s*"active"/);
  assert.match(categoriesPage, /auction\.status\s*===\s*"active"\s*&&\s*auction\.product\?\.status\s*===\s*"active"/);
  assert.match(auctionDetail, /auc\.product\?\.status\s*!==\s*"active"[\s\S]*?notFound\(\)/);
});
