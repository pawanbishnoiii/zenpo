// Razorpay credentials test + payment link creator
// Uses admin-level RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET env (global) by default,
// falls back to per-business payment_settings row if env not configured.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, business_id, amount, customer_email, customer_name, description } = await req.json();

    // 1) Prefer admin-level global keys
    let keyId = Deno.env.get("RAZORPAY_KEY_ID") || "";
    let keySecret = Deno.env.get("RAZORPAY_KEY_SECRET") || "";
    let isTestMode = keyId.startsWith("rzp_test_");
    let descFallback = "Invoice payment";
    let source: "admin" | "business" = "admin";

    // 2) Fallback: load per-business keys
    if (!keyId || !keySecret) {
      if (!business_id) {
        return json({ ok: false, error: "Razorpay not configured (missing admin keys and business_id)" }, 400);
      }
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { data: settings } = await supabase
        .from("payment_settings")
        .select("*")
        .eq("business_id", business_id)
        .maybeSingle();
      if (!settings || !settings.razorpay_key_id || !settings.razorpay_key_secret) {
        return json({ ok: false, error: "Razorpay not configured. Ask admin to set keys or configure in Settings." }, 400);
      }
      keyId = settings.razorpay_key_id;
      keySecret = settings.razorpay_key_secret;
      isTestMode = !!settings.is_test_mode;
      descFallback = settings.payment_description || descFallback;
      source = "business";
    }

    const auth = btoa(`${keyId}:${keySecret}`);

    if (action === "test") {
      const r = await fetch("https://api.razorpay.com/v1/payments?count=1", {
        headers: { Authorization: `Basic ${auth}` },
      });
      if (!r.ok) {
        const t = await r.text();
        return json({ ok: false, error: `Razorpay rejected keys: ${t.slice(0, 200)}`, source });
      }
      return json({ ok: true, mode: isTestMode ? "test" : "live", source });
    }

    if (action === "create_link") {
      if (!amount || Number(amount) <= 0) return json({ ok: false, error: "Invalid amount" }, 400);
      const body = {
        amount: Math.round(Number(amount) * 100),
        currency: "INR",
        accept_partial: false,
        description: description || descFallback,
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
        return json({ ok: false, error: data?.error?.description || "Failed to create payment link", source });
      }
      return json({ ok: true, short_url: data.short_url, id: data.id, source, mode: isTestMode ? "test" : "live" });
    }

    return json({ ok: false, error: "Unknown action" }, 400);
  } catch (e: any) {
    return json({ ok: false, error: e.message || "Server error" }, 500);
  }
});
