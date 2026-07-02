import { useState } from 'react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'https://alilyback.duckdns.org/eris';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    petType: 'Gato',
    service: 'Guardería en mi hogar',
    startDate: '',
    endDate: '',
    message: ''
  });

  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Algo salió mal al enviar la solicitud');
      }
      setStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        petType: 'Gato',
        service: 'Guardería en mi hogar',
        startDate: '',
        endDate: '',
        message: ''
      });
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Error de conexión con el servidor.');
    }
  };

  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop" id="contacto">
      <div className="max-w-container-max-width mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-terracota mb-4 block">CONTACTO</span>
            <h2 className="font-display-lg text-headline-md md:text-5xl text-primary leading-tight">
              Reservemos una primera quedada
            </h2>
            <p className="text-body-lg text-on-surface-variant mt-8 mb-12">
              Cuéntame sobre tu mascota y lo que necesitas. Te responderé lo antes posible para conocernos sin ningún compromiso.
            </p>
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                </div>
                <div>
                  <p className="font-bold text-primary">Ontinyent, Valencia</p>
                  <p className="text-sm text-on-surface-variant">y alrededores cercanos</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">speed</span>
                </div>
                <div>
                  <p className="font-bold text-primary">Respuesta rápida</p>
                  <p className="text-sm text-on-surface-variant">normalmente el mismo día</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">mail</span>
                </div>
                <div>
                  <p className="font-bold text-primary">hola@eris-mascotas.es</p>
                  <p className="text-sm text-on-surface-variant">escríbeme cuando quieras</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-surface-container-low rounded-[2.5rem] p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === 'success' && (
                <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-emerald-600 shrink-0">check_circle</span>
                  <div>
                    <p className="font-bold">¡Solicitud enviada con éxito!</p>
                    <p className="text-sm">Eris te responderá lo antes posible para concretar vuestro primer encuentro.</p>
                  </div>
                </div>
              )}
              {status === 'error' && (
                <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-rose-600 shrink-0">error</span>
                  <div>
                    <p className="font-bold">Error al enviar la solicitud</p>
                    <p className="text-sm">{errorMessage}</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Nombre</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white border-outline-variant/30 rounded-2xl p-4 focus:ring-primary focus:border-primary"
                    placeholder="Tu nombre"
                    type="text"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Email</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white border-outline-variant/30 rounded-2xl p-4 focus:ring-primary focus:border-primary"
                    placeholder="tu-correo@email.com"
                    type="email"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Teléfono</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-white border-outline-variant/30 rounded-2xl p-4 focus:ring-primary focus:border-primary"
                    placeholder="600 000 000"
                    type="tel"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Tipo de mascota</label>
                  <select
                    name="petType"
                    value={formData.petType}
                    onChange={handleChange}
                    className="w-full bg-white border-outline-variant/30 rounded-2xl p-4 focus:ring-primary focus:border-primary text-on-surface-variant"
                  >
                    <option>Gato</option>
                    <option>Perro (Paseo/Visita)</option>
                    <option>Pequeño mamífero</option>
                    <option>Otros</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Servicio</label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full bg-white border-outline-variant/30 rounded-2xl p-4 focus:ring-primary focus:border-primary text-on-surface-variant"
                  >
                    <option>Guardería en mi hogar</option>
                    <option>Cuidado a domicilio</option>
                    <option>Visitas</option>
                    <option>Paseos</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Entrada</label>
                    <input
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full bg-white border-outline-variant/30 rounded-2xl p-4 focus:ring-primary focus:border-primary text-sm text-on-surface-variant"
                      type="date"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Salida</label>
                    <input
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full bg-white border-outline-variant/30 rounded-2xl p-4 focus:ring-primary focus:border-primary text-sm text-on-surface-variant"
                      type="date"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Mensaje</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-white border-outline-variant/30 rounded-2xl p-4 focus:ring-primary focus:border-primary"
                  placeholder="Cuéntame sobre tu mascota y lo que necesitas..."
                  rows="4"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-terracota text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[0.98] transition-transform disabled:opacity-55 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">
                  {status === 'submitting' ? 'sync' : 'send'}
                </span>
                {status === 'submitting' ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
