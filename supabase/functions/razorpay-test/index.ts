// Razorpay credentials test + payment link creator
// Public function (no JWT required since called from owner-authenticated UI with key from DB)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, business_id, amount, customer_email, customer_name, description } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch payment settings
    const { data: settings } = await supabase
      .from("payment_settings")
      .select("*")
      .eq("business_id", business_id)
      .maybeSingle();

    if (!settings || !settings.razorpay_key_id || !settings.razorpay_key_secret) {
      return new Response(JSON.stringify({ ok: false, error: "Razorpay not configured" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const auth = btoa(`${settings.razorpay_key_id}:${settings.razorpay_key_secret}`);

    if (action === "test") {
      // Verify by listing payments (lightweight call)
      const r = await fetch("https://api.razorpay.com/v1/payments?count=1", {
        headers: { Authorization: `Basic ${auth}` },
      });
      if (!r.ok) {
        const t = await r.text();
        return new Response(JSON.stringify({ ok: false, error: `Razorpay rejected keys: ${t.slice(0, 200)}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ ok: true, mode: settings.is_test_mode ? "test" : "live" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create_link") {
      const body = {
        amount: Math.round(Number(amount) * 100),
        currency: "INR",
        accept_partial: false,
        description: description || settings.payment_description || "Invoice payment",
        customer: { name: customer_name || "Customer", email: customer_email || undefined },
        notify: { email: !!customer_email, sms: false },
        reminder_enable: true,
      };
      const r = await fetch("https://api.razorpay.com/v1/payment_links", {
        method: "POST",
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) {
        return new Response(JSON.stringify({ ok: false, error: data?.error?.description || "Failed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ ok: true, short_url: data.short_url, id: data.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: false, error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
