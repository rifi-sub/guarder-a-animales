import { useState, useEffect } from 'react';

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

  const [rates, setRates] = useState([]);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerStatus, setRegisterStatus] = useState('idle'); // idle, submitting, success, error
  const [registerError, setRegisterError] = useState('');

  // Cargar tarifas de servicios al montar
  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/rates`);
      if (res.ok) {
        setRates(await res.json());
      }
    } catch (err) {
      console.error('Error fetching rates:', err);
    }
  };

  // Calcular precio estimado dinámicamente
  useEffect(() => {
    if (formData.startDate && formData.endDate && rates.length > 0) {
      // Intentar buscar la tarifa para el servicio
      const rate = rates.find(r => r.serviceName.toLowerCase() === formData.service.toLowerCase());
      if (rate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const timeDiff = end.getTime() - start.getTime();
        
        if (timeDiff >= 0) {
          const diffInDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
          // Si el servicio es Alojamiento, calculamos Noches, si no, calculamos Días
          const count = formData.service.toLowerCase().includes('alojamiento')
            ? Math.max(1, diffInDays - 1)
            : diffInDays;
          
          setEstimatedPrice(count * rate.ratePerUnit);
        } else {
          setEstimatedPrice(null);
        }
      } else {
        setEstimatedPrice(null);
      }
    } else {
      setEstimatedPrice(null);
    }
  }, [formData.startDate, formData.endDate, formData.service, rates]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');
    try {
      const payload = {
        ...formData,
        price: estimatedPrice,
        source: 'WEB'
      };

      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Algo salió mal al enviar la solicitud');
      }
      setStatus('success');
      setSubmittedEmail(formData.email);
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
      setEstimatedPrice(null);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Error de conexión con el servidor.');
    }
  };

  const handleRegisterClient = async (e) => {
    e.preventDefault();
    setRegisterStatus('submitting');
    setRegisterError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/register-client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: submittedEmail, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la cuenta');
      
      setRegisterStatus('success');
      // Podríamos guardar el token y redirigir al portal, o simplemente avisar
      localStorage.setItem('clientToken', data.token);
    } catch (err) {
      console.error(err);
      setRegisterStatus('error');
      setRegisterError(err.message || 'No se pudo crear la cuenta.');
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
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl space-y-4">
                  <div className="flex items-start gap-3 text-emerald-800">
                    <span className="material-symbols-outlined text-emerald-600 shrink-0">check_circle</span>
                    <div>
                      <p className="font-bold text-lg">¡Solicitud enviada con éxito!</p>
                      <p className="text-sm mt-1">Eris te responderá lo antes posible para concretar vuestro primer encuentro.</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm mt-4">
                    <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">person_add</span>
                      Crea tu Espacio de Cliente
                    </h3>
                    <p className="text-xs text-on-surface-variant mb-4">
                      ¿Quieres guardar la cartilla de tu mascota y ver el estado de tus reservas? Crea una cuenta gratis usando el email de tu reserva ({submittedEmail}).
                    </p>
                    
                    {registerStatus === 'success' ? (
                      <div className="text-sm font-bold text-emerald-600 flex items-center gap-2 bg-emerald-50 p-3 rounded-xl">
                        <span className="material-symbols-outlined">how_to_reg</span>
                        ¡Cuenta creada! Puedes iniciar sesión en el portal.
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Elige una contraseña"
                          required
                          minLength="6"
                          className="flex-1 bg-surface-container-low border-outline-variant/30 rounded-xl p-3 text-sm focus:ring-primary focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={handleRegisterClient}
                          disabled={registerStatus === 'submitting'}
                          className="bg-primary text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          {registerStatus === 'submitting' ? 'Creando...' : 'Crear Cuenta'}
                        </button>
                      </div>
                    )}
                    {registerStatus === 'error' && (
                      <p className="text-xs text-rose-600 font-bold mt-2">{registerError}</p>
                    )}
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
                    className="w-full bg-white border-outline-variant/30 rounded-2xl p-4 focus:ring-primary focus:border-primary text-on-surface-variant text-sm"
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
                    className="w-full bg-white border-outline-variant/30 rounded-2xl p-4 focus:ring-primary focus:border-primary text-on-surface-variant text-sm"
                  >
                    <option value="Alojamiento">Alojamiento</option>
                    <option value="Guardería en mi hogar">Guardería en mi hogar</option>
                    <option value="Cuidado a domicilio">Cuidado a domicilio</option>
                    <option value="Paseos">Paseos</option>
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
                  className="w-full bg-white border-outline-variant/30 rounded-2xl p-4 focus:ring-primary focus:border-primary text-sm"
                  placeholder="Cuéntame sobre tu mascota y lo que necesitas..."
                  rows="4"
                ></textarea>
              </div>

              {estimatedPrice !== null && (
                <div className="p-5 bg-primary/[0.03] border border-outline/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">Presupuesto Estimado</p>
                    <p className="text-[11px] text-on-surface-variant/70 mt-1">
                      Calculado según las tarifas de Eris
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-display-md font-bold text-primary">{estimatedPrice} €</p>
                    <p className="text-[9px] text-on-surface-variant/50 font-semibold">Pago en efectivo/Bizum (sin adelanto online)</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-terracota text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[0.98] transition-transform disabled:opacity-55 disabled:cursor-not-allowed text-sm"
              >
                <span className="material-symbols-outlined text-sm">
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
