import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json({ success: false, error: "Cron secret is not configured." }, { status: 503 });
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient.rpc("close_expired_auctions");
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      closed: Array.isArray(data) ? data.length : 0,
    });
  } catch {
    return NextResponse.json({ success: false, error: "Finalization failed." }, { status: 500 });
  }
}
