const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const enviarCodigoVerificacion = async (correo, nombre, codigo) => {
  await transporter.sendMail({
    from: `"LMS Academy" <${process.env.MAIL_USER}>`,
    to: correo,
    subject: 'Verifica tu cuenta',

    html: `
      <div style="
        font-family:'Segoe UI', Arial, sans-serif;
        max-width:600px;
        margin:auto;
        background:#0f172a;
        border-radius:16px;
        overflow:hidden;
        box-shadow:0 10px 30px rgba(0,0,0,0.25);
      ">

        <!-- Header -->
        <div style="
          background:linear-gradient(135deg, #1e293b 0%, #312e81 100%);
          color:white;
          padding:40px 30px;
          text-align:center;
        ">
          <div style="
            font-size:13px;
            letter-spacing:3px;
            text-transform:uppercase;
            color:#93c5fd;
            margin-bottom:10px;
          ">
            Academia Tech
          </div>
          <h1 style="
            margin:0;
            font-size:26px;
            font-weight:700;
          ">
            ¡Bienvenido a la plataforma! 🚀
          </h1>
          <p style="
            margin:10px 0 0;
            color:#cbd5e1;
            font-size:14px;
          ">
            Programación, sistemas e inteligencia artificial
          </p>
        </div>

        <!-- Body -->
        <div style="
          background:#ffffff;
          padding:35px 30px;
        ">

          <h2 style="
            color:#0f172a;
            font-size:20px;
            margin-top:0;
          ">
            Hola ${nombre} 👋
          </h2>

          <p style="
            color:#475569;
            font-size:15px;
            line-height:1.6;
          ">
            Gracias por unirte a nuestra comunidad de aprendizaje. Estás a un paso
            de comenzar tu camino en programación, entornos tecnológicos
            e inteligencia artificial.
          </p>

          <p style="
            color:#475569;
            font-size:15px;
            line-height:1.6;
          ">
            Para activar tu cuenta, utiliza el siguiente código de verificación:
          </p>

          <div style="
            text-align:center;
            margin:35px 0;
          ">
            <div style="
              display:inline-block;
              background:linear-gradient(135deg, #1e293b, #312e81);
              padding:18px 40px;
              border-radius:12px;
              font-size:34px;
              font-weight:bold;
              letter-spacing:10px;
              color:#ffffff;
            ">
              ${codigo}
            </div>
          </div>

          <p style="
            text-align:center;
            color:#64748b;
            font-size:13px;
          ">
            ⏱️ Este código vence en <strong>15 minutos</strong>
          </p>

          <hr style="
            border:none;
            border-top:1px solid #e2e8f0;
            margin:30px 0;
          ">

          <p style="
            color:#94a3b8;
            font-size:12px;
            text-align:center;
            line-height:1.5;
          ">
            Si tú no creaste esta cuenta, simplemente ignora este correo.<br>
            Tu información está segura con nosotros.
          </p>

        </div>

        <!-- Footer -->
        <div style="
          background:#0f172a;
          padding:20px;
          text-align:center;
        ">
          <p style="
            color:#64748b;
            font-size:12px;
            margin:0;
          ">
            © Academia Tech · Aprende programación e IA desde cero
          </p>
        </div>

      </div>
    `
  });
};

const enviarCorreoRecuperacion = async (correo, nombre, codigo) => {
  await transporter.sendMail({
    from: `"LMS Academy" <${process.env.MAIL_USER}>`,
    to: correo,
    subject: 'Recupera tu contraseña',

    html: `
      <div style="
        font-family:'Segoe UI', Arial, sans-serif;
        max-width:600px;
        margin:auto;
        background:#0f172a;
        border-radius:16px;
        overflow:hidden;
        box-shadow:0 10px 30px rgba(0,0,0,0.25);
      ">

        <!-- Header -->
        <div style="
          background:linear-gradient(135deg, #1e293b 0%, #7c3aed 100%);
          color:white;
          padding:40px 30px;
          text-align:center;
        ">
          <div style="
            font-size:13px;
            letter-spacing:3px;
            text-transform:uppercase;
            color:#c4b5fd;
            margin-bottom:10px;
          ">
            Academia Tech
          </div>
          <h1 style="margin:0; font-size:26px; font-weight:700;">
            Recuperación de contraseña 🔐
          </h1>
          <p style="margin:10px 0 0; color:#ddd6fe; font-size:14px;">
            Recibimos una solicitud para restablecer tu acceso
          </p>
        </div>

        <!-- Body -->
        <div style="background:#ffffff; padding:35px 30px;">

          <h2 style="color:#0f172a; font-size:20px; margin-top:0;">
            Hola ${nombre} 👋
          </h2>

          <p style="color:#475569; font-size:15px; line-height:1.6;">
            Usa el siguiente código para restablecer tu contraseña.
            Si tú no solicitaste esto, ignora este correo — tu cuenta sigue segura.
          </p>

          <div style="text-align:center; margin:35px 0;">
            <div style="
              display:inline-block;
              background:linear-gradient(135deg, #1e293b, #7c3aed);
              padding:18px 40px;
              border-radius:12px;
              font-size:34px;
              font-weight:bold;
              letter-spacing:10px;
              color:#ffffff;
            ">
              ${codigo}
            </div>
          </div>

          <p style="text-align:center; color:#64748b; font-size:13px;">
            ⏱️ Este código vence en <strong>15 minutos</strong>
          </p>

          <hr style="border:none; border-top:1px solid #e2e8f0; margin:30px 0;">

          <p style="color:#94a3b8; font-size:12px; text-align:center; line-height:1.5;">
            Si no solicitaste este cambio, tu contraseña permanece igual.<br>
            Tu información está segura con nosotros.
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#0f172a; padding:20px; text-align:center;">
          <p style="color:#64748b; font-size:12px; margin:0;">
            © Academia Tech · Aprende programación e IA desde cero
          </p>
        </div>

      </div>
    `
  });
};

module.exports = {
  enviarCodigoVerificacion,
  enviarCorreoRecuperacion
};