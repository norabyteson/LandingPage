import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "Nombre demasiado largo"),
  email: z.string().email("Correo electrónico inválido"),
  company: z.string().max(100).optional(),
  service: z.string().min(1, "Por favor selecciona un servicio"),
  message: z
    .string()
    .min(20, "El mensaje debe tener al menos 20 caracteres")
    .max(2000, "Mensaje demasiado largo"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, company, service, message } = parsed.data;

    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      console.error("[Contact API Error] Faltan credenciales SMTP (SMTP_USER o SMTP_PASS)");
      return NextResponse.json(
        { error: "Error de configuración del servidor de correo" },
        { status: 500 }
      );
    }

    // Configurar transporter de nodemailer
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465 || process.env.SMTP_SECURE === "true",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 10000,
    });

    const recipientEmail = process.env.CONTACT_EMAIL || "contacto@norabyte.com";
    const fromEmail = smtpUser;

    // Email al equipo de NORABYTE
    await transporter.sendMail({
      from: `"NORABYTE Contact Form" <${fromEmail}>`,
      to: recipientEmail,
      replyTo: email,
      subject: `[NORABYTE] Nueva solicitud: ${service} — ${name}`,
      html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nueva solicitud de cotización</title>
</head>
<body style="margin:0;padding:0;background:#191716;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#191716;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#232120;border-radius:16px;overflow:hidden;border:1px solid rgba(240,240,240,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1A4F9A,#266DD3);padding:28px 32px;">
              <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">NORA<span style="color:#A8D0FF;">BYTE</span></h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Nueva solicitud de cotización</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 6px;color:rgba(240,240,240,0.45);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Nombre</p>
                    <p style="margin:0;color:#F0F0F0;font-size:16px;font-weight:600;">${name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 6px;color:rgba(240,240,240,0.45);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Correo electrónico</p>
                    <a href="mailto:${email}" style="color:#4A8FE8;font-size:15px;text-decoration:none;">${email}</a>
                  </td>
                </tr>
                ${company ? `
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 6px;color:rgba(240,240,240,0.45);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Empresa</p>
                    <p style="margin:0;color:#F0F0F0;font-size:15px;">${company}</p>
                  </td>
                </tr>` : ""}
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 6px;color:rgba(240,240,240,0.45);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Servicio de interés</p>
                    <span style="display:inline-block;background:rgba(38,109,211,0.2);color:#4A8FE8;border:1px solid rgba(38,109,211,0.3);padding:4px 12px;border-radius:999px;font-size:13px;font-weight:600;">${service}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:8px;">
                    <p style="margin:0 0 10px;color:rgba(240,240,240,0.45);font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Mensaje</p>
                    <div style="background:rgba(240,240,240,0.04);border:1px solid rgba(240,240,240,0.07);border-radius:10px;padding:16px;">
                      <p style="margin:0;color:rgba(240,240,240,0.75);font-size:14px;line-height:1.7;">${message.replace(/\n/g, "<br/>")}</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(240,240,240,0.06);">
              <p style="margin:0;color:rgba(240,240,240,0.25);font-size:11px;">Este mensaje fue enviado a través del formulario de contacto de norabyte.com</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    });

    // Email de confirmación al cliente
    await transporter.sendMail({
      from: `"NORABYTE" <${fromEmail}>`,
      to: email,
      subject: `Hemos recibido tu solicitud — NORABYTE`,
      html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmación de solicitud</title>
</head>
<body style="margin:0;padding:0;background:#191716;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#191716;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#232120;border-radius:16px;overflow:hidden;border:1px solid rgba(240,240,240,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#1A4F9A,#266DD3);padding:28px 32px;">
              <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">NORA<span style="color:#A8D0FF;">BYTE</span></h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="margin:0 0 16px;color:#F0F0F0;font-size:20px;font-weight:700;">¡Hola, ${name}!</h2>
              <p style="margin:0 0 16px;color:rgba(240,240,240,0.65);font-size:15px;line-height:1.7;">Hemos recibido tu solicitud para <strong style="color:#4A8FE8;">${service}</strong>. Nuestro equipo la revisará y te contactará en menos de <strong style="color:#F0F0F0;">24 horas hábiles</strong>.</p>
              <p style="margin:0 0 28px;color:rgba(240,240,240,0.65);font-size:15px;line-height:1.7;">Si tienes alguna duda urgente, puedes responder directamente a este correo.</p>
              <a href="https://norabyte.com" style="display:inline-block;background:linear-gradient(135deg,#266DD3,#4A8FE8);color:#fff;text-decoration:none;padding:12px 28px;border-radius:999px;font-weight:700;font-size:14px;">Visitar NORABYTE</a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(240,240,240,0.06);">
              <p style="margin:0;color:rgba(240,240,240,0.25);font-size:11px;">© 2025 NORABYTE. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("[Contact API Critical Error]:", error?.message || error);

    // Verificamos si es un timeout o error de conexión específicamente
    if (error?.code === 'ETIMEDOUT' || error?.code === 'ESOCKETTIMEDOUT') {
      console.error("-> El servidor SMTP tardó demasiado en responder.");
    }

    return NextResponse.json(
      { error: "Error interno al procesar la solicitud. Revisa los logs de Vercel para más info." },
      { status: 500 }
    );
  }
}
