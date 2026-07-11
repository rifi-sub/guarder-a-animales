import React from 'react';

const Terms = () => {
  return (
    <div className="bg-surface min-h-screen text-on-surface">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-display-lg text-primary mb-8">Términos y Condiciones</h1>
        
        <div className="space-y-8 text-on-surface-variant leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-on-surface mb-4 font-display">1. Introducción</h2>
            <p>
              Estos Términos y Condiciones regulan la prestación de los servicios de cuidado de mascotas (alojamiento, guardería de día, visitas y cuidado a domicilio) por parte de Eris Pet Care. Al solicitar una reserva, aceptas las condiciones aquí expuestas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-on-surface mb-4 font-display">2. Proceso de Reserva</h2>
            <p>
              Todas las reservas solicitadas a través de la página web están sujetas a la revisión manual y aprobación por parte de nuestro equipo. 
              Recibirás un correo electrónico confirmando si tu solicitud ha sido aceptada, rechazada o si te ofrecemos una alternativa (nuevas fechas u otro servicio similar) en caso de falta de disponibilidad.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-on-surface mb-4 font-display">3. Pagos y Anticipos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Para garantizar y bloquear las fechas de una reserva aceptada, puede solicitarse el abono de un <strong>anticipo</strong>, que normalmente es del 50% del total de la estancia, aunque podrá requerirse el 100% en determinados casos o fechas especiales.
              </li>
              <li>
                El importe restante de la reserva se deberá abonar en el momento del primer encuentro o al entregar la mascota.
              </li>
              <li>
                Los pagos del anticipo pueden realizarse de forma segura online (mediante Tarjeta o PayPal, a través de Stripe) o manualmente (vía Bizum o Transferencia Bancaria). Si eliges el pago manual, la reserva no se considerará formalizada hasta la recepción del comprobante o el dinero.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-on-surface mb-4 font-display">4. Política de Cancelación y Reembolsos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                En caso de que sea Eris Pet Care quien deba <strong>rechazar o cancelar</strong> una reserva previamente abonada (por fuerza mayor o imposibilidad sobrevenida), se <strong>reembolsará íntegramente</strong> el importe abonado. Si pagaste mediante tarjeta o PayPal, la devolución se procesará automáticamente. Si pagaste por Bizum/Transferencia, nos pondremos en contacto para devolverte el dinero.
              </li>
              <li>
                Si la cancelación es por parte del cliente, deberá notificarse con al menos 3 días de antelación para tener derecho al reembolso del anticipo, salvo causas de fuerza mayor debidamente justificadas.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-on-surface mb-4 font-display">5. Requisitos de Salud de la Mascota</h2>
            <p>
              Por la seguridad de todas las mascotas, es obligatorio que tu perro o gato cuente con la cartilla de vacunación al día, incluyendo la desparasitación interna y externa reciente. Eris Pet Care se reserva el derecho de no admitir a animales que presenten síntomas de enfermedades contagiosas o que no cumplan con este requisito en el momento de la entrega.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-on-surface mb-4 font-display">6. Seguimiento y Comunicación</h2>
            <p>
              Durante la estancia de la mascota, el propietario podrá acceder al seguimiento fotográfico y a los informes diarios (comidas, paseos, estado de ánimo) a través de la web. Autorizas a Eris Pet Care a tomar fotografías de tu mascota con fines de seguimiento y actualización.
            </p>
          </section>
          
        </div>
      </div>
    </div>
  );
};

export default Terms;
