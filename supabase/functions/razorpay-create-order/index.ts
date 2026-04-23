// Creates a Razorpay order for the Checkout popup flow.
// Picks active_mode keys (test XOR live) from admin_payment_settings.
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function loadActiveKeys(supabase: any): Promise<{ keyId: string; keySecret: string; mode: 'test' | 'live'; commission: number; enabled: boolean } | null> {
  const { data } = await supabase.from("admin_payment_settings").select("*").eq("singleton", true).maybeSingle();
  const d: any = data;
  if (!d) {
    // env fallback
    const envId = Deno.env.get("RAZORPAY_KEY_ID") || "";
    const envSecret = Deno.env.get("RAZORPAY_KEY_SECRET") || "";
    if (!envId || !envSecret) return null;
    return { keyId: envId, keySecret: envSecret, mode: envId.startsWith('rzp_test_') ? 'test' : 'live', commission: 2.0, enabled: true };
  }
  const mode = (d.active_mode as 'test' | 'live') || (d.is_test_mode ? 'test' : 'live');
  const keyId = mode === 'live' ? (d.live_key_id || d.razorpay_key_id || '') : (d.test_key_id || d.razorpay_key_id || '');
  const keySecret = mode === 'live' ? (d.live_key_secret || d.razorpay_key_secret || '') : (d.test_key_secret || d.razorpay_key_secret || '');
  if (!keyId || !keySecret) return null;
  return {
    keyId, keySecret, mode,
    commission: Number(d.default_commission_percent ?? 2.0),
    enabled: !!d.is_enabled,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { business_id, invoice_id, amount, customer_name, customer_email, customer_phone, customer_id, customer_gstin, customer_address } = await req.json();
    if (!business_id) return json({ ok: false, error: "business_id required" }, 400);
    if (!amount || Number(amount) <= 0) return json({ ok: false, error: "Invalid amount" }, 400);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const keys = await loadActiveKeys(supabase);
    if (!keys) return json({ ok: false, error: "Razorpay not configured by admin." }, 400);
    if (!keys.enabled) return json({ ok: false, error: "Payment gateway is disabled by admin." }, 400);

    // Per-business commission override
    const { data: biz } = await supabase.from("businesses").select("commission_percent_override, business_name").eq("id", business_id).maybeSingle();
    const commissionPct = biz?.commission_percent_override != null ? Number(biz.commission_percent_override) : keys.commission;

    const auth = btoa(`${keys.keyId}:${keys.keySecret}`);
    const orderBody = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `inv_${(invoice_id || "tmp").slice(0, 30)}_${Date.now().toString(36)}`,
      notes: {
        business_id,
        invoice_id: invoice_id || "",
        customer_id: customer_id || "",
        customer_name: customer_name || "",
        customer_phone: customer_phone || "",
        customer_email: customer_email || "",
        gstin: customer_gstin || "",
        address: customer_address || "",
      },
    };
    const r = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify(orderBody),
    });
    const order = await r.json();
    if (!r.ok) {
      console.error('[razorpay-create-order] Razorpay error:', order);
      return json({ ok: false, error: order?.error?.description || "Razorpay order creation failed" }, 400);
    }

    const commissionAmount = (Number(amount) * commissionPct) / 100;
    const ownerNet = Number(amount) - commissionAmount;

    await supabase.from("payment_transactions").insert({
      business_id,
      invoice_id: invoice_id || null,
      razorpay_order_id: order.id,
      amount: Number(amount),
      currency: "INR",
      status: "created",
      flow: "checkout",
      commission_percent: commissionPct,
      commission_amount: commissionAmount,
      owner_net_amount: ownerNet,
      is_test_mode: keys.mode === 'test',
    });

    return json({
      ok: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keys.keyId,
      mode: keys.mode,
      business_name: biz?.business_name || "",
      customer: { name: customer_name || "", email: customer_email || "", contact: customer_phone || "" },
    });
  } catch (e: any) {
    console.error('[razorpay-create-order] Server error:', e);
    return json({ ok: false, error: e.message || "Server error" }, 500);
  }
});
