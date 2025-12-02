require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const ENCARGADO_EMAIL = 'gracestudentdev@gmail.com'; 

// Función 1: Para el formulario simple de index.html
async function sendSimpleContactEmail(data) {
    const mailOptions = {
        from: `"RDH Web Contacto" <${process.env.EMAIL_USER}>`,
        to: ENCARGADO_EMAIL,
        subject: `[CONTACTO SIMPLE] Nuevo Mensaje de: ${data.name}`,
        html: `
            <h3>Detalles del Cliente</h3>
            <p><strong>Nombre/Empresa:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Teléfono:</strong> ${data.phone}</p>
            <p><strong>Mensaje:</strong> ${data.message}</p>
        `
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Notificación de contacto enviada a ${ENCARGADO_EMAIL}`);
    } catch (error) {
        console.error('[EMAIL ERROR] Falló el envío del correo de contacto:', error.message);
    }
}

// Función 2: Para el formulario de COTIZACIÓN (calculadora.html)
async function sendCotizationEmail(data, costoFinal, parametros) {
    const cotizacionDetalle = JSON.parse(parametros);
    let htmlContent = `
        <h3> Solicitud de Cotización Registrada (ID: ${data.id})</h3>
        <p><strong>Cliente:</strong> ${data.nombre}</p>
        <p><strong>Correo:</strong> ${data.correo}</p>
        <p><strong>Descripción del Proyecto:</strong> ${data.descripcion}</p>
        <hr>
        <h4>Presupuesto Estimado Aproximado</h4>
        <p style="font-size: 20px; font-weight: bold; color: #f59e0b;">Monto Estimado Final (Inc. IGV): S/ ${costoFinal}</p>
        <hr>
        <h4>Parámetros de Cálculo Aplicados:</h4>
        <ul>
            <li><strong>Metrado Ingresado:</strong> ${cotizacionDetalle.metrado}</li>
            <li><strong>Tipo de Obra:</strong> ${cotizacionDetalle.tipoObra}</li>
            <li><strong>Nivel de Acabado (Factor):</strong> ${cotizacionDetalle.acabadoFactor}</li>
            <li><strong>Complejidad (Factor):</strong> ${cotizacionDetalle.complejidadDisenoFactor}</li>
            <li><strong>Duración (Factor):</strong> ${cotizacionDetalle.duracionFactor}</li>
        </ul>
    `;

    const mailOptions = {
        from: `"RDH Cotizador Web" <${process.env.EMAIL_USER}>`,
        to: ENCARGADO_EMAIL, 
        subject: `¡COTIZACIÓN REGISTRADA! ID: ${data.id} - ${data.nombre}`,
        html: htmlContent
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Notificación de cotización enviada a ${ENCARGADO_EMAIL}`);
    } catch (error) {
        console.error('[EMAIL ERROR] Falló el envío del correo de cotización:', error.message);
    }
}

module.exports = {
    sendSimpleContactEmail,
    sendCotizationEmail
};
