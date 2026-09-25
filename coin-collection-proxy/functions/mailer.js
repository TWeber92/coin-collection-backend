import { EmailError } from '../../src/coin-collection-exception/CoinCollectionError';

export async function sendEmail(to, pin, env) {
  try {
    // Check if running in Cloudflare Workers runtime
    const isWorker = typeof WorkerGlobalScope !== 'undefined';

    if (isWorker) {
      // Production: Use worker-mailer (Cloudflare Workers)
      const { WorkerMailer } = await import('worker-mailer');
      const mailer = await WorkerMailer.connect({
        credentials: {
          username: env.EMAIL_ADMIN,
          password: env.EMAIL_PASS,
        },
        authType: 'plain',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
      });
      await mailer.send({
        from: { name: 'Coin Collection', email: env.EMAIL_ADMIN },
        to: { email: to },
        subject: 'Your Password Reset PIN',
        html: `<p>Your PIN: <strong>${pin}</strong></p><p>Expires in 15 minutes.</p>`,
      });
    } else {
      // Local Development: Use nodemailer (Node.js)
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: env.EMAIL_ADMIN,
          pass: env.EMAIL_PASS,
        },
      });
      await transporter.sendMail({
        from: `"Coin Collection" <${env.EMAIL_ADMIN}>`,
        to: to,
        subject: 'Your Password Reset PIN',
        html: `<p>Your PIN: <strong>${pin}</strong></p><p>Expires in 15 minutes.</p>`,
      });
    }
  } catch (error) {
    throw new EmailError(error);
  }
}