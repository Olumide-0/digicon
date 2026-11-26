// Outgoing email (server only).
//
// ⚠️ NOT CONNECTED YET: no email service is set up, so emails are printed to the
// server console instead of being sent. To send real emails, plug a provider into
// sendEmail() (e.g. Resend, Brevo, Mailgun, SendGrid, or your SMTP server).
export async function sendEmail({ to, subject, text }) {
  console.info(`\n[email not sent — no email service configured]\nTo: ${to}\nSubject: ${subject}\n\n${text}\n`);
}

export async function sendPasswordResetEmail(to, firstName, link) {
  await sendEmail({
    to,
    subject: "Reset your Digicon password",
    text:
      `Hi ${firstName},\n\n` +
      `We received a request to reset your Digicon password. Use the link below to choose a new one:\n\n` +
      `${link}\n\n` +
      `This link expires in 30 minutes and can only be used once. ` +
      `If you didn't ask to reset your password, you can ignore this email.\n\n— Digicon`,
  });
}

export async function sendTeamInviteEmail(to, firstName, roleName, inviterName, link) {
  await sendEmail({
    to,
    subject: "You've been invited to the Digicon admin",
    text:
      `Hi${firstName ? ` ${firstName}` : ""},\n\n` +
      `${inviterName} has invited you to join the Digicon team as ${roleName}. ` +
      `Use the link below to set your password and get started:\n\n` +
      `${link}\n\n` +
      `This link expires in 7 days. If you weren't expecting this, you can ignore this email.\n\n— Digicon`,
  });
}
