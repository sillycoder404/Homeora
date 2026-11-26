import nodemailer from 'nodemailer';

export async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  const missingSettings = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM']
    .filter((name) => !process.env[name]?.trim());
  if (missingSettings.length > 0) {
    throw new Error(`Email delivery is not configured: ${missingSettings.join(', ')}`);
  }

  const port = Number(process.env.SMTP_PORT || 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('SMTP_PORT must be a valid port number');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
  });
}
