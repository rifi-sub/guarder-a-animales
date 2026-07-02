# Hoja de Ruta (Roadmap) y Valoración: Hacia el CRM Perfecto para Eris Pet Care

Este documento evalúa los cambios propuestos para la plataforma, organizándolos por fases lógicas de prioridad y analizando la viabilidad económica (costes de infraestructura, APIs y licencias) frente al esfuerzo de desarrollo.

---

## Resumen de Costes y Viabilidad Técnica

| Funcionalidad / Módulo | Coste de Proveedor | Complejidad | Viabilidad | Alternativa Económica |
| :--- | :--- | :--- | :--- | :--- |
| **Ficha Clínica y Datos Ampliados** | **0 €** | Baja | Alta | Almacenamiento local SQLite. |
| **Facturación y Tarifas Básicas** | **0 €** | Media-Baja | Alta | Cálculo en JS y guardado en SQLite. |
| **Gestión Documental (Archivos)** | **0 € a 5€/mes** | Media | Alta | Subir archivos a la VPS (gratis) o usar AWS S3 (céntimos). |
| **Notificaciones por Email** | **0 € a 10€/mes** | Media-Baja | Alta | Resend (3.000 emails/mes gratis) o Gmail SMTP (gratis). |
| **Notificaciones por WhatsApp** | **15€ a 50€/mes** | Alta | Media | Usar links interactivos `wa.me` manuales (gratis). |
| **Pasarela de Pagos (Stripe)** | **Comisiones %** | Alta | Media-Alta | Bizum / Transferencias manuales (gratis). |
| **Portal del Cliente (Links mágicos)**| **0 €** | Alta | Media | No requiere servidores extra; usa React y tokens de base de datos. |

---

## Fases de Implementación Priorizadas

---

### FASE 1: Ampliación de Base de Datos y Operativa Básica (Prioridad: Alta) - ¡COMPLETADA! 🚀
*Objetivo: Registrar información crítica para el cuidado y cobro sin añadir costes de infraestructura.*
* **Coste de Licencias/APIs**: **0 €** (Todo implementado localmente y en la VPS Hetzner).
* **Esfuerzo de Código**: Completado y desplegado con éxito.

#### 1.1 Ficha Médica y Cumplimiento Veterinario
* **Qué se añade**: Campos en el modelo `Pet` para microchip, nombre/teléfono del veterinario, estado de vacunación, datos de póliza de seguro y alergias críticas.
* **Por qué es prioritario**: Es información vital en caso de una urgencia médica mientras el dueño está de viaje.

#### 1.2 Módulo de Precios y Control de Pagos
* **Qué se añade**:
  * Campos en `Booking`: `totalPrice`, `paymentStatus` (Pendiente, Seña recibida, Pagado), `paymentMethod` (Bizum, Transferencia, Efectivo).
  * Lógica en Backend: Registro del precio definitivo cobrado al aceptar la reserva.
* **Por qué es prioritario**: Permite a la sitter llevar el control financiero del negocio sin usar hojas de Excel externas.

#### 1.3 Timeline de Interacciones Manuales
* **Qué se añade**: Crear la tabla `Interaction` en la base de datos. Permite al administrador añadir notas internas ("Llamada realizada para confirmar hora", "Me comenta que el perro tiene un poco de otitis").
* **Por qué es prioritario**: Es el núcleo del CRM (saber qué se ha hablado con cada cliente a lo largo de los meses).

#### 1.4 Tarifas de Servicios y Autocalculador Público (Petición de la Clienta)
* **Qué se añade**:
  * **Base de Datos**: Tabla `ServiceRate` (`id`, `serviceName`, `ratePerUnit`, `unitType` ["noche", "paseo", "visita"]).
  * **Panel de Admin**: Panel de control de tarifas para actualizar los precios (ej. Alojamiento: 15€/noche, Guardería: 12€/día).
  * **Formulario Público de Reservas**: Despliega las tarifas actualizadas y realiza un cálculo del precio estimado en tiempo real basado en el rango de fechas seleccionado (ej. "Rango: 5 noches = 75€ estimados") antes de que el cliente envíe la solicitud.
* **Por qué es prioritario**: Da transparencia absoluta de precios al cliente final, reduce las consultas redundantes de "cuánto me costaría" y profesionaliza la experiencia de reserva.

---

### FASE 2: Rediseño de UX y Panel Administrativo 360 (Prioridad: Media-Alta)
*Objetivo: Convertir el panel en un espacio de trabajo ágil e intuitivo adaptado al flujo de la cuidadora.*
* **Coste de Licencias/APIs**: **0 €** (Afecta puramente a la interfaz React).
* **Esfuerzo de Código**: Medio-Alto.

#### 2.1 Ficha 360º del Cliente
* **Qué se añade**: Al hacer clic en un cliente en el CRM, se abre una vista detallada con pestañas:
  * *Resumen*: Notas rápidas del cliente y accesos directos.
  * *Mascotas*: Listado de sus animales con su ficha clínica.
  * *Historial*: Lista de estancias pasadas y futuras.
  * *Notas/Interacciones*: Timeline cronológico de llamadas o acuerdos.
* **Por qué es prioritario**: Mejora radicalmente la velocidad de consulta en el día a día.

#### 2.2 Pipeline Visual (Tablero Kanban de Estancias)
* **Qué se añade**: Una vista tipo Trello donde las reservas se agrupan en columnas por estado: `Pendientes` → `Visita de presentación` → `Reservadas` → `En curso (Hospedadas)` → `Completadas`.
* **Por qué es prioritario**: Le da a la sitter el control visual absoluto del flujo de trabajo de la semana.

#### 2.3 Modos de Trabajo en el Panel (Mostrador vs. Cuidados)
* **Qué se añade**: Un interruptor en la cabecera del panel administrativo para alternar entre dos modos de UX:
  * *Modo Mostrador (Recepción)*: Vista de escritorio con buscador rápido de clientes/mascotas, panel de Check-In/Check-Out rápido, advertencias sobre vacunas/firmas pendientes, y atajos de cobros en efectivo/Bizum.
  * *Modo Cuidados (Casa/Móvil)*: Interfaz móvil simplificada con botones táctiles grandes, modo oscuro (para exteriores), listado cronológico de tareas de alimentación/paseos y acceso rápido a cámara/galería para reportar fotos a los clientes.
* **Por qué es prioritario**: Adapta la densidad de información y los controles al entorno físico donde la sitter realiza su trabajo (el escritorio al recibir al animal frente a movilidad o paseos al cuidarlo).

---

### FASE 3: Notificaciones y Comunicaciones Automatizadas (Prioridad: Media)
*Objetivo: Automatizar los mensajes repetitivos para ahorrar tiempo de gestión y dar mejor imagen.*
* **Coste de Licencias/APIs**: **Gratis a Bajo** (Email) / **Medio** (WhatsApp).
* **Esfuerzo de Código**: Medio.

#### 3.1 Notificaciones por Email (Confirmación y Recordatorios)
* **Viabilidad**: **Muy recomendada**. Podemos integrar **Resend** o **Nodemailer** (usando una cuenta de correo corporativa).
* **Coste**: **0 €** (Hasta 3.000 correos al mes con el plan gratuito de Resend).
* **Flujo**: El servidor envía correos automáticamente al aceptar/rechazar reservas o 3 días antes de una estancia.

#### 3.2 Comunicación por WhatsApp (Alternativa Económica vs API Oficial)
* **Opción A (API Oficial via Twilio/Meta)**:
  * *Coste*: Unos 15€-30€/mes fijos de plataforma + cargo por mensaje (0,05€ aprox).
  * *Ventaja*: El sistema envía los mensajes en segundo plano de forma 100% automática.
* **Opción B (Integración mediante Enlaces "wa.me" - RECOMENDADA)**:
  * *Coste*: **0 €**.
  * *Ventaja*: Añadimos un botón en la reserva "Enviar confirmación WhatsApp". Al pulsarlo, abre WhatsApp Web con el teléfono del cliente y el mensaje pre-redactado automáticamente (ej. *"Hola Juan, confirmo la reserva de Toby del 14 al 20..."*). La sitter solo tiene que pulsar "Enviar". Ahorra el 90% del tiempo y es totalmente gratuito.

---

### FASE 4: Portal del Cliente Autogestionado y Stripe (Prioridad: Baja)
*Objetivo: Reducir la fricción de cobros y permitir a los clientes recurrentes rellenar sus datos directamente.*
* **Coste de Licencias/APIs**: **Bajo-Medio** (Stripe cobra un 1.4% + 0.25€ por transacción).
* **Esfuerzo de Código**: Alto.

#### 4.1 Enlaces Mágicos de Acceso (Portal sin contraseñas)
* **Qué se añade**: Cuando el cliente recibe su email de confirmación, incluye un enlace único seguro (ej. `/portal?token=xyz`). Al hacer clic, puede ver el estado de su reserva, subir el PDF de vacunación de su mascota y actualizar su contacto de emergencia.
* **Ventaja**: Elimina la necesidad de que el cliente recuerde una contraseña y mantiene tus datos limpios y actualizados por ellos mismos.

#### 4.2 Pasarela de Pago Stripe (Reserva Garantizada)
* **Qué se añade**: Botón para pagar la seña de la reserva con tarjeta o Apple Pay a través de Stripe Checkout.
* **Ventaja**: Evita reservas fantasma y automatiza el cobro de la seña.

---

## 5. Cambios Recomendados en el Esquema Prisma (Futura Migración)

Cuando decidas dar el paso e implementar estas mejoras, el esquema de Prisma deberá modificarse de la siguiente manera. Esta migración mantendrá intactas las tablas actuales y añadirá las nuevas relaciones:

```prisma
// 1. Ampliación de campos en Cliente
model Client {
  id               Int           @id @default(autoincrement())
  name             String
  email            String        @unique
  phone            String
  emergencyContact String
  notes            String?
  address          String?       // Nuevo: Para visitas a domicilio
  status           String        @default("ACTIVE") // Nuevo: ACTIVE, VIP, INACTIVE
  tags             String?       // Nuevo: "VIP, perro-ansioso" (formato CSV o JSON)
  preferredChannel String        @default("WHATSAPP") // Nuevo: WHATSAPP, EMAIL, CALL
  createdAt        DateTime      @default(now())
  pets             Pet[]
  bookings         Booking[]
  interactions     Interaction[] // Nuevo: Historial de contacto
}

// 2. Ampliación de campos médicos en Mascota
model Pet {
  id                Int         @id @default(autoincrement())
  name              String
  type              String
  breed             String?
  age               String?
  diet              String?
  medicalNotes      String?
  microchip         String?     // Nuevo
  vetName           String?     // Nuevo
  vetPhone          String?     // Nuevo
  vaccinationStatus String?     // Nuevo: "Al día", "Pendiente"
  insuranceInfo     String?     // Nuevo: Compañía y póliza
  behaviorNotes     String?     // Nuevo: Sociabilidad con otros perros/gatos
  clientId          Int
  client            Client      @relation(fields: [clientId], references: [id], onDelete: Cascade)
  bookings          Booking[]
  tasks             DailyTask[]
}

// 3. Control financiero en Reservas
model Booking {
  id            Int      @id @default(autoincrement())
  name          String
  email         String
  phone         String
  petType       String
  service       String
  startDate     String
  endDate       String
  message       String?
  status        String   @default("PENDIENTE")
  price         Float?   // Nuevo: Precio total autocalculado
  paymentStatus String   @default("PENDIENTE") // Nuevo: PENDIENTE, SEÑA, PAGADO
  paymentMethod String?  // Nuevo: BIZUM, TRANSF, EFECTIVO
  source        String   @default("WEB") // Nuevo: WEB, WHATSAPP, RECOMENDADO
  createdAt     DateTime @default(now())
  clientId      Int?
  client        Client?  @relation(fields: [clientId], references: [id], onDelete: SetNull)
  petId         Int?
  pet           Pet?     @relation(fields: [petId], references: [id], onDelete: SetNull)
}

// 4. Nueva Tabla: Registro de Interacciones / Notas Cronológicas
model Interaction {
  id        Int      @id @default(autoincrement())
  clientId  Int
  client    Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  type      String   // NOTA, LLAMADA, WHATSAPP, EMAIL
  content   String
  createdAt DateTime @default(now())
}

// 5. Nueva Tabla: Tarifas de Servicios Modificables
model ServiceRate {
  id          Int      @id @default(autoincrement())
  serviceName String   @unique // Ej: "Alojamiento", "Guardería", "Paseo"
  ratePerUnit Float    // Ej: 15.0, 12.0, 8.0
  unitType    String   // Ej: "noche", "día", "paseo"
  updatedAt   DateTime @updatedAt
}
```
