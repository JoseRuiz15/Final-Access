import { createTransport, Transporter } from 'nodemailer';
import { env } from '../config/env.js';

let transporter: Transporter | null = null;

function usesSmtpTransport(): boolean {
  return env.NODE_ENV === 'production' || env.EMAIL_TRANSPORT === 'smtp';
}

function getFromAddress(): string {
  return env.EMAIL_FROM || env.SMTP_USER || '"Final Acces" <noreply@example.com>';
}

function getTransporter(): Transporter {
  if (transporter) return transporter;

  if (!usesSmtpTransport()) {
    // En desarrollo: transporte de consola (no envía emails reales)
    transporter = createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
  } else {
    const smtpPassword = env.SMTP_PASS.replace(/\s/g, '');
    const missingSettings = [
      (!env.SMTP_USER.trim() || env.SMTP_USER.includes('your-account')) && 'SMTP_USER',
      (!smtpPassword || smtpPassword.includes('your-16-character')) && 'SMTP_PASS',
      env.SMTP_HOST.includes('example.com') && 'SMTP_HOST',
    ].filter(Boolean);

    if (missingSettings.length > 0) {
      throw new Error(
        `SMTP está activado, pero faltan valores válidos en server/.env: ${missingSettings.join(', ')}`
      );
    }

    // Gmail usa TLS implícito en 465 y STARTTLS en 587.
    transporter = createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      requireTLS: env.SMTP_PORT === 587,
      auth: {
        user: env.SMTP_USER,
        // Google suele mostrar la contraseña de aplicación agrupada con espacios.
        pass: smtpPassword,
      },
    });
  }

  return transporter;
}

export async function sendVerificationEmail(email: string, code: string): Promise<{ code: string } | void> {
  const transporter = getTransporter();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verifica tu email - Final Acces</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1a1a2e; border-radius: 12px; padding: 32px; color: #fff;">
        <h1 style="color: #fb00ff; margin: 0 0 16px; font-size: 28px;">FINAL ACCES</h1>
        <h2 style="color: #fff; margin: 0 0 24px; font-size: 20px;">Verifica tu correo electrónico</h2>
        <p style="color: #ccc; margin: 0 0 24px; line-height: 1.6;">
          Gracias por registrarte. Usa el siguiente código para verificar tu cuenta:
        </p>
        <div style="background: #0f0f1a; border: 2px solid #fb00ff; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: bold; color: #fb00ff; letter-spacing: 8px; font-family: monospace;">${code}</span>
        </div>
        <p style="color: #888; font-size: 14px; margin: 0;">
          Este código expira en ${env.EMAIL_VERIFICATION_TTL_MIN} minutos. Si no solicitaste esto, ignora este email.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
    FINAL ACCES - Verifica tu correo electrónico
    
    Tu código de verificación: ${code}
    
    Este código expira en ${env.EMAIL_VERIFICATION_TTL_MIN} minutos.
    Si no solicitaste esto, ignora este email.
  `;

  const mailOptions = {
    from: getFromAddress(),
    to: email,
    subject: 'Tu código de verificación - Final Acces',
    text,
    html,
  };

  if (!usesSmtpTransport()) {
    // En modo local: imprimir en consola
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 [LOCAL] Email de verificación:');
    console.log(`   To: ${email}`);
    console.log(`   Code: ${code}`);
    console.log(`   Expires: ${env.EMAIL_VERIFICATION_TTL_MIN} min`);
    console.log(`   Preview: ${info.messageId}`);
    // En modo local, devolver el código para permitir probar el flujo sin SMTP.
    return { code };
  }

  await transporter.sendMail(mailOptions);
}

export async function sendWelcomeEmail(email: string, username: string): Promise<void> {
  const transporter = getTransporter();

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1a1a2e; border-radius: 12px; padding: 32px; color: #fff;">
        <h1 style="color: #fb00ff; margin: 0 0 16px;">FINAL ACCES</h1>
        <h2 style="color: #fff; margin: 0 0 24px;">¡Bienvenido, ${username}!</h2>
        <p style="color: #ccc; line-height: 1.6;">
          Tu cuenta ha sido verificada correctamente. Ya puedes empezar a jugar.
        </p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: getFromAddress(),
    to: email,
    subject: '¡Bienvenido a Final Acces!',
    html,
  });
}
