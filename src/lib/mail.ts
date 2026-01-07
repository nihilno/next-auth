import nodemailer from "nodemailer";

function env(name: string) {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

const transporter = (() => {
  const user = env("EMAIL_SERVER_USER");
  const pass = env("EMAIL_SERVER_PASSWORD");
  if (!user || !pass) {
    console.warn("Missing SMTP creds");
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host: env("EMAIL_SERVER_HOST") ?? "smtp.gmail.com",
    port: Number(env("EMAIL_SERVER_PORT") ?? 587),
    secure: Number(env("EMAIL_SERVER_PORT") ?? 587) === 465,
    auth: {
      user,
      pass,
    },
  });
})();

export async function sendVerificationEmail(to: string, link: string) {
  const from = env("EMAIL_FROM") || "MP Next <m.polowy.next@gmail.com>";
  const res = await transporter.sendMail({
    to,
    from,
    subject: "Verify your email address.",
    text: `Click the link to verify your email address: ${link}`,
    html: `<p>Click the link to verify your email address:</p><p><a href=${link}>${link}</a></p>`,
  });

  return res;
}

export async function sendResetEmail(to: string, link: string) {
  const from = env("EMAIL_FROM") || "MP Next <m.polowy.next@gmail.com>";
  const res = await transporter.sendMail({
    to,
    from,
    subject: "Reset your password.",
    text: `Click the link to reset your password: ${link}`,
    html: `<p>Click the link to reset your password. It will expire in 30 minutes:</p><p><a href=${link}>${link}</a></p>`,
  });

  return res;
}
