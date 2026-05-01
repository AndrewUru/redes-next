const CONTACT_INBOX_EMAIL =
  process.env.CONTACT_INBOX_EMAIL?.trim() || "atobio459@gmail.com";

const RESEND_API_URL = "https://api.resend.com/emails";

type LeadNotificationInput = {
  id: string;
  fullName: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  message: string;
  service?: string | null;
  source?: string | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function row(label: string, value?: string | null) {
  return `
    <tr>
      <td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#f8fafc;">${escapeHtml(label)}</td>
      <td style="padding:8px 10px;border:1px solid #e5e7eb;">${escapeHtml(value?.trim() || "No indicado")}</td>
    </tr>
  `;
}

export async function sendLeadNotification(input: LeadNotificationInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY no esta configurada. No se puede enviar el email de notificacion."
    );
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "ElSaltoWeb <onboarding@resend.dev>";
  const subject = `Nueva solicitud: ${input.service || "Formulario web"} - ${input.fullName}`;
  const replyTo = input.email;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;">
      <h1 style="font-size:22px;margin:0 0 12px;">Nueva solicitud recibida</h1>
      <p style="margin:0 0 16px;color:#4b5563;">Se ha enviado un formulario desde ElSaltoWeb.</p>
      <table style="border-collapse:collapse;width:100%;max-width:680px;font-size:14px;">
        ${row("Referencia", input.id)}
        ${row("Servicio", input.service)}
        ${row("Origen", input.source)}
        ${row("Nombre", input.fullName)}
        ${row("Email", input.email)}
        ${row("Empresa / proyecto", input.company)}
        ${row("Teléfono", input.phone)}
      </table>
      <h2 style="font-size:16px;margin:20px 0 8px;">Mensaje</h2>
      <div style="white-space:pre-wrap;border:1px solid #e5e7eb;background:#f8fafc;border-radius:8px;padding:12px;">${escapeHtml(input.message)}</div>
    </div>
  `;

  const text = [
    "Nueva solicitud recibida",
    `Referencia: ${input.id}`,
    `Servicio: ${input.service || "No indicado"}`,
    `Origen: ${input.source || "No indicado"}`,
    `Nombre: ${input.fullName}`,
    `Email: ${input.email}`,
    `Empresa / proyecto: ${input.company || "No indicado"}`,
    `Teléfono: ${input.phone || "No indicado"}`,
    "",
    "Mensaje:",
    input.message
  ].join("\n");

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: CONTACT_INBOX_EMAIL,
      reply_to: replyTo,
      subject,
      html,
      text
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudo enviar el email: ${errorText}`);
  }

  return { ok: true };
}
