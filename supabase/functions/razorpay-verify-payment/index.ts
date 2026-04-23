// Verifies a Razorpay payment signature (HMAC-SHA256) using ACTIVE mode key.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHmac } from "https://deno.land/std@0.224.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return json({ ok: false, error: "Missing required fields" }, 400);
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: admin } = await supabase.from("admin_payment_settings").select("*").eq("singleton", true).maybeSingle();
    const a: any = admin;
    const mode = (a?.active_mode as 'test' | 'live') || (a?.is_test_mode ? 'test' : 'live');
    const keyId = (mode === 'live' ? a?.live_key_id : a?.test_key_id) || a?.razorpay_key_id || Deno.env.get("RAZORPAY_KEY_ID") || "";
    const keySecret = (mode === 'live' ? a?.live_key_secret : a?.test_key_secret) || a?.razorpay_key_secret || Deno.env.get("RAZORPAY_KEY_SECRET") || "";
    if (!keySecret) return json({ ok: false, error: "Razorpay secret not configured" }, 500);

    const expected = createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      console.error('[razorpay-verify-payment] Signature mismatch');
      await supabase.from("payment_transactions")
        .update({ status: "failed", razorpay_payment_id, raw_event: { reason: "signature_mismatch" } })
        .eq("razorpay_order_id", razorpay_order_id);
      return json({ ok: false, error: "Invalid signature" }, 400);
    }

    // Fetch payment details
    const auth = btoa(`${keyId}:${keySecret}`);
    let paymentDetails: any = {};
    try {
      const r = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
        headers: { Authorization: `Basic ${auth}` },
      });
      if (r.ok) paymentDetails = await r.json();
    } catch (_) { /* non-fatal */ }

    const { data: updated, error: updErr } = await supabase.from("payment_transactions")
      .update({
        status: "paid",
        razorpay_payment_id,
        method: paymentDetails.method || "online",
        raw_event: paymentDetails,
      })
      .eq("razorpay_order_id", razorpay_order_id)
      .select()
      .maybeSingle();
    if (updErr) return json({ ok: false, error: updErr.message }, 500);

    return json({ ok: true, payment_id: razorpay_payment_id, txn: updated, mode });
  } catch (e: any) {
    console.error('[razorpay-verify-payment] Error:', e);
    return json({ ok: false, error: e.message || "Server error" }, 500);
  }
});
