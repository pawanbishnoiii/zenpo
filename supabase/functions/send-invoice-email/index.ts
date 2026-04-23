// Sends a bill receipt over SMTP using admin global config.
// Logs every send into public.email_log.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

interface InvoicePayload {
  business_id: string;
  invoice_id?: string;
  recipient: string;
  business_name: string;
  invoice_number: string;
  customer_name?: string;
  items: { name: string; qty: number; price: number; total: number }[];
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  payment_method: string;
  store_url?: string;
}

const buildHtml = (p: InvoicePayload) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${p.invoice_number}</title></head>
<body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f5f5f5;margin:0;padding:24px;color:#1a1a1a">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.08)">
    <div style="background:linear-gradient(135deg,#f97316,#ea580c);padding:24px;color:#fff">
      <h1 style="margin:0;font-size:20px">${p.business_name}</h1>
      <p style="margin:4px 0 0;font-size:13px;opacity:.9">Invoice ${p.invoice_number}</p>
    </div>
    <div style="padding:24px">
      ${p.customer_name ? `<p style="margin:0 0 16px;color:#666">Hi ${p.customer_name},</p>` : ''}
      <p style="margin:0 0 20px">Thank you for your purchase. Here's your receipt:</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="border-bottom:2px solid #eee"><th align="left" style="padding:8px 0">Item</th><th align="right" style="padding:8px 0">Qty</th><th align="right" style="padding:8px 0">Total</th></tr></thead>
        <tbody>${p.items.map(i => `<tr style="border-bottom:1px solid #f5f5f5"><td style="padding:8px 0">${i.name}</td><td align="right" style="padding:8px 0">${i.qty}</td><td align="right" style="padding:8px 0">₹${i.total.toFixed(2)}</td></tr>`).join('')}</tbody>
      </table>
      <div style="margin-top:20px;padding-top:16px;border-top:2px solid #eee;font-size:13px">
        <div style="display:flex;justify-content:space-between;padding:4px 0"><span>Subtotal</span><span>₹${p.subtotal.toFixed(2)}</span></div>
        ${p.discount && p.discount > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;color:#16a34a"><span>Discount</span><span>−₹${p.discount.toFixed(2)}</span></div>` : ''}
        <div style="display:flex;justify-content:space-between;padding:4px 0"><span>GST</span><span>₹${p.tax.toFixed(2)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:12px 0 0;font-size:18px;font-weight:700;color:#f97316"><span>Total</span><span>₹${p.total.toFixed(2)}</span></div>
        <p style="margin:12px 0 0;font-size:12px;color:#666">Paid by: <strong style="text-transform:uppercase">${p.payment_method}</strong></p>
      </div>
      ${p.store_url ? `<a href="${p.store_url}" style="display:inline-block;margin-top:24px;padding:12px 20px;background:#f97316;color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:13px">Visit Store</a>` : ''}
    </div>
    <div style="padding:16px 24px;background:#fafafa;text-align:center;font-size:11px;color:#999">Powered by Ezo</div>
  </div>
</body></html>`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const payload = await req.json() as InvoicePayload;
    if (!payload.recipient || !payload.business_id) return json({ ok: false, error: "recipient and business_id required" }, 400);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: smtp } = await supabase.from("smtp_settings").select("*").limit(1).maybeSingle();

    if (!smtp || !smtp.is_active || !smtp.host || !smtp.username) {
      await supabase.from("email_log").insert({
        business_id: payload.business_id, invoice_id: payload.invoice_id || null,
        recipient: payload.recipient, subject: `Invoice ${payload.invoice_number}`,
        status: "skipped", error: "SMTP not configured or inactive",
      });
      return json({ ok: false, error: "SMTP not configured. Admin must set up SMTP first." }, 400);
    }

    const subject = `Invoice ${payload.invoice_number} from ${payload.business_name}`;

    try {
      const client = new SMTPClient({
        connection: {
          hostname: smtp.host,
          port: smtp.port || 587,
          tls: (smtp.encryption || 'tls') === 'ssl' || smtp.port === 465,
          auth: { username: smtp.username, password: smtp.password },
        },
      });
      await client.send({
        from: `${smtp.from_name || 'Ezo POS'} <${smtp.from_email || smtp.username}>`,
        to: payload.recipient,
        subject,
        html: buildHtml(payload),
      });
      await client.close();

      await supabase.from("email_log").insert({
        business_id: payload.business_id, invoice_id: payload.invoice_id || null,
        recipient: payload.recipient, subject, status: "sent", sent_at: new Date().toISOString(),
      });
      return json({ ok: true });
    } catch (e: any) {
      console.error('[send-invoice-email] SMTP error:', e);
      await supabase.from("email_log").insert({
        business_id: payload.business_id, invoice_id: payload.invoice_id || null,
        recipient: payload.recipient, subject, status: "failed", error: e.message || 'SMTP send failed',
      });
      return json({ ok: false, error: e.message || 'SMTP send failed' }, 500);
    }
  } catch (e: any) {
    console.error('[send-invoice-email] Server error:', e);
    return json({ ok: false, error: e.message || "Server error" }, 500);
  }
});
