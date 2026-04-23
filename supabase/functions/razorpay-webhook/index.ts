// Razorpay webhook receiver. Verifies HMAC, updates payment_transactions.
// Configure URL in Razorpay Dashboard: https://<project>.supabase.co/functions/v1/razorpay-webhook
// Events to subscribe: payment.captured, payment.failed, payment_link.paid
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature, x-razorpay-event-id",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: admin } = await supabase.from("admin_payment_settings").select("razorpay_webhook_secret").eq("singleton", true).maybeSingle();
    const webhookSecret = admin?.razorpay_webhook_secret || Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || "";
    if (!webhookSecret) {
      console.error("[razorpay-webhook] Webhook secret not configured");
      return new Response("Webhook not configured", { status: 503, headers: corsHeaders });
    }

    const expected = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    if (expected !== signature) {
      console.error("[razorpay-webhook] Signature mismatch");
      return new Response("Invalid signature", { status: 401, headers: corsHeaders });
    }

    const event = JSON.parse(rawBody);
    const eventType: string = event?.event || "";
    console.log("[razorpay-webhook] Received:", eventType);

    if (eventType === "payment.captured" || eventType === "payment.authorized") {
      const p = event.payload?.payment?.entity;
      if (p?.order_id) {
        await supabase.from("payment_transactions")
          .update({
            status: eventType === "payment.captured" ? "paid" : "authorized",
            razorpay_payment_id: p.id,
            method: p.method,
            raw_event: p,
          })
          .eq("razorpay_order_id", p.order_id);
      }
    } else if (eventType === "payment.failed") {
      const p = event.payload?.payment?.entity;
      if (p?.order_id) {
        await supabase.from("payment_transactions")
          .update({ status: "failed", razorpay_payment_id: p.id, raw_event: p })
          .eq("razorpay_order_id", p.order_id);
      }
    } else if (eventType === "payment_link.paid") {
      const link = event.payload?.payment_link?.entity;
      const p = event.payload?.payment?.entity;
      if (link?.id) {
        await supabase.from("payment_transactions")
          .update({ status: "paid", razorpay_payment_id: p?.id, method: p?.method || "link", raw_event: { link, payment: p } })
          .eq("razorpay_payment_link_id", link.id);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[razorpay-webhook] Error:", e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
