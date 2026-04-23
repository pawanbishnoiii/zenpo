// Creates a Razorpay Payment Link (for SMS/WhatsApp share). Records txn.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { business_id, invoice_id, amount, customer_name, customer_email, customer_phone, description } = await req.json();
    if (!business_id || !amount) return json({ ok: false, error: "business_id and amount required" }, 400);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: admin } = await supabase.from("admin_payment_settings").select("*").eq("singleton", true).maybeSingle();
    const keyId = admin?.razorpay_key_id || Deno.env.get("RAZORPAY_KEY_ID") || "";
    const keySecret = admin?.razorpay_key_secret || Deno.env.get("RAZORPAY_KEY_SECRET") || "";
    if (!keyId || !keySecret) return json({ ok: false, error: "Razorpay not configured by admin." }, 400);

    const { data: biz } = await supabase.from("businesses").select("commission_percent_override, business_name").eq("id", business_id).maybeSingle();
    const commissionPct = biz?.commission_percent_override != null ? Number(biz.commission_percent_override) : Number(admin?.default_commission_percent ?? 2.0);
    const testMode = admin?.is_test_mode ?? keyId.startsWith("rzp_test_");

    const auth = btoa(`${keyId}:${keySecret}`);
    const body = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      accept_partial: false,
      description: description || `Payment to ${biz?.business_name || "business"}`,
      customer: { name: customer_name || "Customer", email: customer_email || undefined, contact: customer_phone || undefined },
      notify: { email: !!customer_email, sms: !!customer_phone },
      reminder_enable: true,
      notes: { business_id, invoice_id: invoice_id || "" },
    };
    const r = await fetch("https://api.razorpay.com/v1/payment_links", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) return json({ ok: false, error: data?.error?.description || "Failed to create payment link" }, 400);

    const commissionAmount = (Number(amount) * commissionPct) / 100;
    await supabase.from("payment_transactions").insert({
      business_id,
      invoice_id: invoice_id || null,
      razorpay_payment_link_id: data.id,
      amount: Number(amount),
      currency: "INR",
      status: "created",
      flow: "payment_link",
      commission_percent: commissionPct,
      commission_amount: commissionAmount,
      owner_net_amount: Number(amount) - commissionAmount,
      is_test_mode: testMode,
    });

    return json({ ok: true, short_url: data.short_url, id: data.id, mode: testMode ? "test" : "live" });
  } catch (e: any) {
    return json({ ok: false, error: e.message || "Server error" }, 500);
  }
});
