# Plan de Integración — Eris Pet Care CRM

## Fase 1: Capacidad y Lista de Espera
- [x] Modelos `CapacityConfig` y `Waitlist` en Prisma
- [x] Endpoints: GET/POST/DELETE capacity, occupation pública, CRUD waitlist
- [x] `Calendar.jsx` refactorizado con ocupación en tiempo real
- [x] `ContactForm.jsx`: check de ocupación al cambiar fecha, banner, waitlist
- [x] `AdminPanel.jsx`: pestaña Lista de Espera, sidebar con badge, configuración de capacidad

## Fase 2: Finanzas y Gastos
- [x] Modelos `Expense` y `FinancialState` en Prisma
- [x] CRUD gastos + exportación CSV
- [x] `GET /api/admin/financial-summary` (ingresos/gastos/beneficio por mes)
- [x] `FinancialDashboard.jsx` con Recharts (barras, líneas, tarta)

## Fase 3: Facturación (F.4)
- [x] Modelos `BusinessConfig`, `Coupon` en Prisma
- [x] Endpoints CRUD BusinessConfig (datos fiscales editables)
- [x] Endpoints CRUD Coupons + aplicar descuento a reserva
- [x] `GET /api/admin/invoices` lista facturas con filtro mes
- [x] `POST /api/admin/bookings/:id/invoice` generación explícita con nº secuencial
- [x] `GET /api/admin/invoices/:id/pdf` descarga PDF con datos fiscales dinámicos
- [x] `InvoicingPanel.jsx`: tabla facturas, resumen, datos fiscales, cupones
- [x] Botón "Factura" en vista lista y Kanban de reservas
- [x] PDF mejorado: desglose IVA, descuento, datos del negocio

## Fase 4: Clientes y Fidelización (F.2)
- [x] `birthday` y `nextVaccinationDate` en Pet + endpoints PATCH
- [x] Modelo `Review` + `LoyaltyConfig` en Prisma
- [x] Tags: `PATCH /api/admin/clients/:id/tags` + UI con chips por cliente
- [x] Alertas: `GET /api/admin/alerts` (vacunas próximas, cumpleaños del mes, clientes cerca de noche gratis)
- [x] Reseñas: CRUD admin + `GET /api/reviews` público (solo aprobadas)
- [x] Fidelidad: `GET /api/admin/clients/loyalty` (noches, gasto, noches gratis acumuladas)
- [x] `ClientsFidelityPanel.jsx`: 4 sub-tabs (Alertas, Etiquetas, Fidelidad, Reseñas)
- [x] `Reviews.jsx` público: carga desde DB con fallback a datos estáticos
- [x] Filtro de clientes por etiqueta en la UI

## Fase 5: Cuidado Diario (F.3)
- [x] Modelos: StayDiary, PetPhoto, Medication, TaskTemplate + checkInAt/checkOutAt en Booking
- [x] Endpoints: CRUD diario, fotos, medicación, plantillas, check-in/out
- [x] `GET /api/admin/active-stays` estancias activas con check-in pendiente
- [x] `POST /api/admin/bookings/:id/checkin|checkout`
- [x] `DailyCarePanel.jsx`: selector de estancia activa, diario (comida/paseo/ánimo), fotos (URL/base64), medicación con activar/pausar, plantillas con "Usar" para crear tarea
- [x] Pestaña "Cuidado Diario" con icono `pets` en sidebar y bottom nav

## Fase 6: Agenda y Calendario (F.1)
- [ ] Calendario dinámico (no solo Julio 2026)
- [ ] Sincronización Google Calendar
- [ ] Dashboard de próximas estancias

## Fase 7: Comunicaciones (Fase 3 del roadmap)
- [x] Nodemailer instalado con SMTP (Gmail/Yahoo)
- [x] Modelo BusinessConfig extendido con smtpHost, smtpPort, smtpUser, smtpPass, emailFrom, emailFromName
- [x] emailService.js con templates HTML (confirmación, check-in, check-out, factura, waitlist)
- [x] Email real en: aceptar reserva, check-in, check-out, generar factura
- [x] Endpoint notificar lista de espera (POST /api/admin/waitlist/:id/notify)
- [x] Endpoints configuración email (GET/POST /api/admin/email-config, POST /api/admin/email-test)
- [x] UI "Email" en AdminPanel con formulario SMTP y test de envío

## Fase 8: Portal Cliente + Stripe (Fase 4 del roadmap)
- [x] Portal con enlace mágico (POST /api/portal/send-link + GET /api/portal/verify-link)
- [x] Pasarela de pago Stripe (Checkout Sessions + PaymentIntents + webhook)
- [x] stripeCustomerId en Client, stripePaymentIntentId + paymentUrl en Booking
- [x] Endpoints: /api/stripe-config, /api/create-payment-intent, /api/create-checkout-session, /webhooks/stripe
- [x] Portal mejorado: sub-navegación (Reservas / Facturas / Pagar), lista de facturas con PDF, botón "Pagar con tarjeta"
- [x] Stripe instalado en backend (npm stripe) y frontend (@stripe/react-stripe-js, @stripe/stripe-js)
- [x] Magic link en login (alternativa a email+password)
- [x] Corrección: pet.ownerId → pet.clientId en endpoint portal
