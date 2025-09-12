import { ActionError, defineAction } from 'astro:actions';
import { Resend } from 'resend';
import z from 'astro:schema';

const resend = new Resend(import.meta.env.RESEND_API_KEY);
const email = import.meta.env.EMAIL_TO;

export const server = {
  send: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(2).max(100),
      email: z.string().email(),
      phone: z.string().min(10).max(15),
      country: z.string().min(2).max(100),
      opactic_member: z.enum(['sí', 'no']),
      working: z.enum(['sí', 'no']),
      student: z.enum(['sí', 'no']),
      company: z.string().min(2).max(100).optional(),
      position: z.string().min(2).max(100).optional(),
      consent: z.boolean().refine((val) => val === true, {
        message: 'Se requiere consentimiento',
      }),
    }),
    handler: async (input) => {
      const { data, error } = await resend.batch.send([{
        from: email,
        to: ['Feria Tec <juanmtorrijos@gmail.com>'],
        subject: 'Nuevo registro para Feria Tec 2025',
        html: `
          <h2>Nuevo registro para Feria Tec 2025</h2>
          <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif;">
            <tr>
              <td><strong>Nombre:</strong></td>
              <td>${input.name}</td>
            </tr>
            <tr>
              <td><strong>Email:</strong></td>
              <td>${input.email}</td>
            </tr>
            <tr>
              <td><strong>Teléfono:</strong></td>
              <td>${input.phone}</td>
            </tr>
            <tr>
              <td><strong>País:</strong></td>
              <td>${input.country}</td>
            </tr>
            <tr>
              <td><strong>Miembro de OPACTIC:</strong></td>
              <td>${input.opactic_member}</td>
            </tr>
            <tr>
              <td><strong>Trabajando:</strong></td>
              <td>${input.working}</td>
            </tr>
            <tr>
              <td><strong>Estudiante:</strong></td>
              <td>${input.student}</td>
            </tr>
            ${input.company ? `
            <tr>
              <td><strong>Empresa:</strong></td>
              <td>${input.company}</td>
            </tr>
            ` : ''}
            ${input.position ? `
            <tr>
              <td><strong>Posición:</strong></td>
              <td>${input.position}</td>
            </tr>
            ` : ''}
            <tr>
              <td><strong>Consentimiento:</strong></td>
              <td>${input.consent ? 'Sí' : 'No'}</td>
            </tr>
              </table>
            `,
      }, {
        from: email,
        to: [input.email],
        subject: 'Confirmación de registro para Feria Tec 2025',
        html: `
            <h2>Gracias por registrarte en Feria Tec 2025</h2>
            <p>Hola ${input.name},</p>
            <p>Hemos recibido tu registro para la Feria Tec 2025. Nos pondremos en contacto contigo pronto con más detalles.</p>
            <p>Saludos cordiales,<br/>El equipo de OPACTIC</p>
          `,
      }]);
      console.log('Resend response:', { data, error });
      if (error) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: error.message,
        });
      }

      return data;
    },
  }),
};