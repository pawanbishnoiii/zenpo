// Aggregates yesterday's paid online transactions into per-business settlement rows.
// Triggered by pg_cron daily between 4-6 AM IST.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Yesterday in IST (UTC +5:30): start of yesterday IST -> UTC, end -> UTC
    const now = new Date();
    const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const yEndIST = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate(), 0, 0, 0); // midnight IST today
    const yStartIST = new Date(yEndIST.getTime() - 24 * 60 * 60 * 1000);
    // Convert IST back to UTC by subtracting 5:30
    const yStartUTC = new Date(yStartIST.getTime() - 5.5 * 60 * 60 * 1000);
    const yEndUTC = new Date(yEndIST.getTime() - 5.5 * 60 * 60 * 1000);

    const { data, error } = await supabase.rpc("aggregate_daily_settlements", {
      _period_start: yStartUTC.toISOString(),
      _period_end: yEndUTC.toISOString(),
    });
    if (error) return json({ ok: false, error: error.message }, 500);

    return json({ ok: true, settlements_created: data, period: { start: yStartUTC.toISOString(), end: yEndUTC.toISOString() } });
  } catch (e: any) {
    return json({ ok: false, error: e.message || "Server error" }, 500);
  }
});
