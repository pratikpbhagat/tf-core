import "server-only";

// Plain fetch against Resend's HTTP API rather than pulling in their SDK —
// there's no real API key configured for this local/demo project, so the
// SDK would add a dependency we can't even exercise. Swap this for the SDK
// if/when a real key is wired up; the call shape wouldn't change much.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.NOTIFICATIONS_FROM_EMAIL ?? "TaxFlow India <notifications@taxflow.example>";

export type SendEmailInput = { to: string; subject: string; html: string };
export type SendEmailResult = { ok: boolean; error?: string };

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<SendEmailResult> {
  if (!RESEND_API_KEY) {
    // Stub mode: local dev / this portfolio deployment has no real Resend
    // key. Still returns ok so the calling code's log-then-send flow
    // behaves the same as it would in production.
    console.log(`[notifications:stub] would email ${to} — "${subject}"`);
    return { ok: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });

  if (!response.ok) {
    return { ok: false, error: await response.text() };
  }
  return { ok: true };
}
