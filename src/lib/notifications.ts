import { Resend } from "resend";

import { hasResendEnv } from "@/lib/env";

function getResendClient() {
  if (!hasResendEnv()) {
    return null;
  }

  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getResendClient();

  if (!resend) {
    return { skipped: true };
  }

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL as string,
    to: [params.to],
    subject: params.subject,
    html: params.html,
  });
}
