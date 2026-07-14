import { useState, useEffect } from 'react';
import DateRangePicker from './DateRangePicker';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'https://alilyback.duckdns.org/eris';

const SERVICES = [
  { val: "Alojamiento", dbName: "Alojamiento de mascotas", icon: "bed", desc: "Día y noche en mi hogar" },
  { val: "Guardería", dbName: "Guardería de día", icon: "wb_sunny", desc: "Cuidados por el día" },
  { val: "Cuidado a domicilio", dbName: "Cuidado a domicilio", icon: "home_work", desc: "Día y noche en tu hogar" },
  { val: "Visitas", dbName: "Visitas a domicilio", icon: "notifications", desc: "Para gatos y perros" },
  { val: "Paseos", dbName: "Paseo de perros", icon: "directions_walk", desc: "Paseos activos" }
];

export default function ContactForm() {
  const [discountInfo, setDiscountInfo] = useState(null);
  const [discountError, setDiscountError] = useState('');
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  
  const [step, setStep] = useState(1);
  const [rates, setRates] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    petType: 'Gato',
    service: '', // UI name
    serviceDbName: '', // DB name to match rate
    startDate: '',
    endDate: '',
    durationUnits: 1, 
    message: '',
    extras: {},
    discountCode: ''
  });

  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [basePrice, setBasePrice] = useState(0);
  const [extrasPrice, setExtrasPrice] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerStatus, setRegisterStatus] = useState('idle');
  const [registerError, setRegisterError] = useState('');

  const [occupationInfo, setOccupationInfo] = useState(null);
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [waitlistStatus, setWaitlistStatus] = useState('idle');
  const [waitlistMessage, setWaitlistMessage] = useState('');
  const [waitlistPetName, setWaitlistPetName] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/rates`)
      .then(res => res.json())
      .then(data => setRates(data))
      .catch(err => console.error(err));
  }, []);

  const selectedRate = rates.find(r => r.serviceName.toLowerCase() === formData.serviceDbName.toLowerCase());
  const isDateBased = formData.service === 'Alojamiento' || formData.service === 'Guardería' || formData.service === 'Cuidado a domicilio';
  const isNights = formData.service === 'Alojamiento' || formData.service === 'Cuidado a domicilio';

  const parsedExtras = selectedRate?.extraRates ? (() => {
    try { return JSON.parse(selectedRate.extraRates); } catch { return []; }
  })() : [];

  let units = 0;
  if (isDateBased) {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffInDays = Math.max(0, Math.ceil((end - start) / (1000 * 3600 * 24)));
      units = isNights ? diffInDays : diffInDays + 1;
    }
  } else {
    units = parseInt(formData.durationUnits) || 1;
  }

  useEffect(() => {
    if (!selectedRate || units <= 0) {
      setBasePrice(0);
      setExtrasPrice(0);
      setEstimatedPrice(0);
      return;
    }

    const calculatedBase = units * selectedRate.ratePerUnit;
    setBasePrice(calculatedBase);

    let extrasTotal = 0;
    Object.keys(formData.extras).forEach(extraName => {
      const extraConfig = parsedExtras.find(e => e.name === extraName);
      if (extraConfig) {
        const val = formData.extras[extraName];
        if (typeof val === 'boolean' && val) {
           if (extraConfig.type === 'per_unit') extrasTotal += extraConfig.price * units;
           else if (extraConfig.type === 'per_booking') extrasTotal += extraConfig.price;
           else if (extraConfig.type === 'per_pet_per_unit') extrasTotal += extraConfig.price * units; 
        } else if (typeof val === 'number' && val > 0) {
           if (extraConfig.type === 'per_unit') extrasTotal += extraConfig.price * val * units;
           else if (extraConfig.type === 'per_booking') extrasTotal += extraConfig.price * val;
           else if (extraConfig.type === 'per_pet_per_unit') extrasTotal += extraConfig.price * val * units;
        }
      }
    });

    setExtrasPrice(extrasTotal);
    
    // Real discount logic
    let currentDiscount = 0;
    if (discountInfo) {
      if (discountInfo.discountType === 'PERCENTAGE') {
        currentDiscount = (calculatedBase + extrasTotal) * (discountInfo.discountValue / 100);
      } else {
        currentDiscount = discountInfo.discountValue;
      }
      
      // Check minAmount if present
      if (discountInfo.minAmount && (calculatedBase + extrasTotal) < discountInfo.minAmount) {
         currentDiscount = 0; // Doesn't qualify
      }
    }
    setDiscountAmount(currentDiscount);

    setEstimatedPrice(Math.max(0, calculatedBase + extrasTotal - currentDiscount));
  }, [formData.service, selectedRate, units, parsedExtras, formData.extras, discountInfo]);

  useEffect(() => {
    if (isDateBased && formData.startDate && formData.endDate) {
      const checkOccupation = async () => {
        try {
          const start = new Date(formData.startDate);
          const end = new Date(formData.endDate);
          if (end < start) { setOccupationInfo(null); return; }
          const res = await fetch(`${API_BASE}/api/occupation?month=${formData.startDate.substring(0, 7)}`);
          if (res.ok) {
            const data = await res.json();
            const relevant = data.filter(d => d.date >= formData.startDate && d.date <= formData.endDate);
            const fullDates = relevant.filter(d => d.isFull && !d.blocked);
            const blockedDates = relevant.filter(d => d.blocked);
            const totalDays = relevant.length;
            const maxOccupied = Math.max(...relevant.map(d => d.occupied), 0);
            const maxCapacity = Math.max(...relevant.map(d => d.capacity), 4);

            if (blockedDates.length > 0) {
              setOccupationInfo({ type: 'BLOCKED', message: `Hay fechas bloqueadas.` });
            } else if (fullDates.length > 0) {
              setOccupationInfo({ type: 'FULL', message: `El ${fullDates.length} de ${totalDays} día(s) está completo.` });
            } else {
              setOccupationInfo({ type: 'AVAILABLE', message: `${maxCapacity - maxOccupied}/${maxCapacity} plazas disponibles` });
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      checkOccupation();
    } else {
      setOccupationInfo(null);
    }
  }, [formData.startDate, formData.endDate, isDateBased]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExtraToggle = (name, value) => {
    setFormData(prev => ({
      ...prev,
      extras: { ...prev.extras, [name]: value }
    }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');
    try {
      const payload = {
        ...formData,
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        endDate: formData.endDate || new Date().toISOString().split('T')[0],
        service: formData.serviceDbName, // Send the real DB name
        price: estimatedPrice,
        discount: discountAmount,
        discountCode: discountInfo ? formData.discountCode : null,
        extrasDetails: JSON.stringify(formData.extras),
        source: 'WEB'
      };

      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Algo salió mal');
      
      setStatus('success');
      setSubmittedEmail(formData.email);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Error de conexión');
    }
  };

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    setWaitlistStatus('submitting');
    try {
      const res = await fetch(`${API_BASE}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.startDate,
          clientName: formData.name,
          clientEmail: formData.email,
          clientPhone: formData.phone,
          petType: formData.petType,
          petName: waitlistPetName,
          service: formData.serviceDbName,
          notes: `Rango completo: ${formData.startDate} al ${formData.endDate}. ${formData.message || ''}`
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setWaitlistStatus('success');
      setWaitlistMessage(data.message);
      setTimeout(() => { setShowWaitlistForm(false); setWaitlistStatus('idle'); }, 5000);
    } catch (err) {
      setWaitlistStatus('error');
      setWaitlistMessage(err.message);
    }
  };

  const handleRegisterClient = async (e) => {
    e.preventDefault();
    setRegisterStatus('submitting');
    try {
      const res = await fetch(`${API_BASE}/api/auth/register-client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: submittedEmail, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRegisterStatus('success');
      localStorage.setItem('clientToken', data.token);
    } catch (err) {
      setRegisterStatus('error');
      setRegisterError(err.message);
    }
  };

  const validateDiscount = async () => {
    if (!formData.discountCode) return;
    setIsValidatingDiscount(true);
    setDiscountError('');
    try {
      const res = await fetch(`${API_BASE}/api/coupons/validate?code=${formData.discountCode}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDiscountInfo(data);
    } catch (err) {
      setDiscountError(err.message);
      setDiscountInfo(null);
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const clearDiscount = () => {
    setFormData(prev => ({ ...prev, discountCode: '' }));
    setDiscountInfo(null);
    setDiscountError('');
  };

  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 px-6">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-5xl">check_circle</span>
        </div>
        <h2 className="text-4xl font-bold text-primary mb-4">¡Solicitud recibida!</h2>
        <p className="text-on-surface-variant mb-8">Te he enviado un correo a <b>{submittedEmail}</b> con los detalles. Te responderé muy pronto para confirmar disponibilidad.</p>
        
        <div className="bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/20 shadow-sm">
          <h3 className="font-bold text-xl mb-4 text-primary">¿Quieres agilizar futuras reservas?</h3>
          <p className="text-sm text-on-surface-variant mb-6">Crea una contraseña para acceder a tu Área de Cliente, donde podrás ver el estado de tus reservas y descargar tus facturas.</p>
          {registerStatus === 'success' ? (
             <div className="bg-green-50 text-green-700 p-4 rounded-xl font-bold">¡Cuenta creada con éxito! Ya puedes acceder al Área de Cliente.</div>
          ) : (
            <form onSubmit={handleRegisterClient} className="flex gap-4 max-w-sm mx-auto">
              <input type="password" placeholder="Tu contraseña" value={password} onChange={(e)=>setPassword(e.target.value)} required className="flex-1 bg-white border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary" />
              <button disabled={registerStatus==='submitting'} type="submit" className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90">Crear</button>
            </form>
          )}
          {registerError && <p className="text-red-500 text-sm mt-3">{registerError}</p>}
        </div>
      </div>
    );
  }

  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-lowest" id="reserva">
      <div className="max-w-container-max-width mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-terracota mb-4 block">CONFIGURADOR DE RESERVAS</span>
          <h2 className="font-display-lg text-headline-md md:text-5xl text-primary leading-tight">
            Personaliza tu cuidado
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT CONTENT: STEPS */}
          <div className="lg:col-span-8 bg-white rounded-[2rem] border border-outline-variant/20 shadow-sm p-6 md:p-10">
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-10 overflow-x-auto pb-4 gap-4">
              {['Servicio', 'Duración', 'Extras', 'Datos'].map((label, idx) => {
                const s = idx + 1;
                return (
                  <div key={s} className={`flex flex-col items-center gap-2 shrink-0 ${step === s ? 'opacity-100' : step > s ? 'opacity-70 cursor-pointer' : 'opacity-40 pointer-events-none'}`} onClick={() => step > s && setStep(s)}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= s ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}>{s}</div>
                    <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
                  </div>
                )
              })}
            </div>

            {/* STEP 1: SERVICIO */}
            {step === 1 && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold text-primary mb-6">1. ¿Qué servicio necesitas?</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {SERVICES.map(s => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, service: s.val, serviceDbName: s.dbName, extras: {} }));
                        setStep(2);
                      }}
                      className={`text-left p-5 rounded-[1.5rem] border transition-all ${
                        formData.service === s.val 
                          ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20' 
                          : 'bg-surface-container-lowest border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex flex-col gap-3 mb-3">
                        <span className={`material-symbols-outlined text-3xl ${formData.service === s.val ? 'text-primary' : 'text-on-surface-variant'}`}>{s.icon}</span>
                        <span className={`font-bold text-base leading-tight ${formData.service === s.val ? 'text-primary' : 'text-on-surface'}`}>{s.val}</span>
                      </div>
                      <div className="text-xs text-on-surface-variant leading-snug">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: DURACIÓN */}
            {step === 2 && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold text-primary mb-6">2. Duración del cuidado</h3>
                {isDateBased ? (
                  <DateRangePicker 
                    startDate={formData.startDate}
                    endDate={formData.endDate}
                    onChange={({ startDate, endDate }) => setFormData(prev => ({ ...prev, startDate, endDate }))}
                  />
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">¿Cuántas {selectedRate?.unitType || 'sesiones'} necesitas?</label>
                    <input type="number" name="durationUnits" min="1" value={formData.durationUnits} onChange={handleChange} className="w-full max-w-xs bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-primary" />
                  </div>
                )}

                {occupationInfo && (
                  <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${occupationInfo.type === 'AVAILABLE' ? 'bg-green-50 text-green-800' : occupationInfo.type === 'FULL' ? 'bg-amber-50 text-amber-800' : 'bg-red-50 text-red-800'}`}>
                    <span className="material-symbols-outlined">{occupationInfo.type === 'AVAILABLE' ? 'check_circle' : 'warning'}</span>
                    <span className="text-sm font-semibold">{occupationInfo.message}</span>
                  </div>
                )}

                <div className="mt-10 flex gap-4">
                  <button onClick={prevStep} className="px-6 py-3 border border-outline-variant/30 rounded-xl font-bold text-on-surface hover:bg-surface-container-low">Atrás</button>
                  <button 
                    onClick={nextStep} 
                    disabled={isDateBased ? (!formData.startDate || !formData.endDate) : !formData.durationUnits}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50"
                  >Continuar</button>
                </div>
              </div>
            )}

            {/* STEP 3: EXTRAS */}
            {step === 3 && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold text-primary mb-6">3. Suplementos y Extras</h3>
                
                {parsedExtras.length === 0 ? (
                  <p className="text-on-surface-variant italic mb-6">No hay suplementos configurables para este servicio.</p>
                ) : (
                  <div className="space-y-4">
                    {parsedExtras.map(extra => {
                      const isNumeric = extra.name.toLowerCase().includes('adicional') || extra.name.toLowerCase().includes('número') || extra.name.toLowerCase().includes('cantidad');
                      
                      return (
                        <div key={extra.name} className="flex items-center justify-between p-4 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest">
                          <div>
                            <p className="font-bold text-on-surface">{extra.name}</p>
                            <p className="text-xs text-terracota font-semibold">+{extra.price}€ {extra.type === 'per_unit' ? `por ${selectedRate?.unitType || 'unidad'}` : extra.type === 'per_booking' ? 'por reserva' : `por mascota y ${selectedRate?.unitType || 'unidad'}`}</p>
                          </div>
                          
                          {extra.info ? (
                            <div className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wide flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">info</span> Informativo
                            </div>
                          ) : isNumeric ? (
                            <div className="flex items-center gap-3">
                              <button onClick={() => handleExtraToggle(extra.name, Math.max(0, (formData.extras[extra.name] || 0) - 1))} className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center">-</button>
                              <span className="font-bold w-4 text-center">{formData.extras[extra.name] || 0}</span>
                              <button onClick={() => handleExtraToggle(extra.name, (formData.extras[extra.name] || 0) + 1)} className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center">+</button>
                            </div>
                          ) : (
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" checked={!!formData.extras[extra.name]} onChange={(e) => handleExtraToggle(extra.name, e.target.checked)} />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-10 flex gap-4">
                  <button onClick={prevStep} className="px-6 py-3 border border-outline-variant/30 rounded-xl font-bold text-on-surface hover:bg-surface-container-low">Atrás</button>
                  <button onClick={nextStep} className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90">Continuar</button>
                </div>
              </div>
            )}

            {/* STEP 4: DATOS */}
            {step === 4 && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold text-primary mb-6">4. Tus Datos</h3>
                <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Nombre Completo</label>
                      <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Email</label>
                      <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-primary" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Teléfono</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Mascota</label>
                      <select name="petType" value={formData.petType} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-primary">
                        <option>Gato</option>
                        <option>Perro (Alojamiento/Guardería)</option>
                        <option>Perro (Paseo/Visita)</option>
                        <option>Pequeño mamífero</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Mensaje Adicional</label>
                    <textarea name="message" rows="3" value={formData.message} onChange={handleChange} placeholder="Cuéntame sobre tu mascota..." className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-primary resize-none"></textarea>
                  </div>

                  {errorMessage && <p className="text-red-500 font-bold text-sm bg-red-50 p-4 rounded-xl">{errorMessage}</p>}

                  <div className="mt-10 flex gap-4">
                    <button type="button" onClick={prevStep} className="px-6 py-3 border border-outline-variant/30 rounded-xl font-bold text-on-surface hover:bg-surface-container-low">Atrás</button>
                    <button type="submit" disabled={status==='submitting'} className="flex-1 px-6 py-3 bg-terracota text-white rounded-xl font-bold hover:bg-terracota/90 shadow-md">
                      {status === 'submitting' ? 'Enviando...' : 'Enviar Solicitud'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT CONTENT: RESUMEN (Sticky) */}
          <div className="lg:col-span-4 sticky top-6 space-y-6">
            <div className="bg-surface-container-low rounded-[2rem] p-6 shadow-sm border border-outline-variant/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>
              
              <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">Resumen de tu reserva</h4>
              
              {formData.service ? (
                <>
                  <div className="mb-6">
                    <p className="font-bold text-xl text-primary">{formData.service}</p>
                    {units > 0 && (
                      <p className="text-sm text-on-surface-variant font-medium mt-1">
                        {isDateBased ? `${formData.startDate || 'Inicio'} al ${formData.endDate || 'Fin'}` : `${units} ${selectedRate?.unitType || 'sesiones'}`}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 text-sm border-t border-outline-variant/10 pt-4 mb-4">
                    <div className="flex justify-between items-center text-on-surface-variant">
                      <span>Tarifa base ({units} {selectedRate?.unitType || ''})</span>
                      <span>{basePrice.toFixed(2)}€</span>
                    </div>

                    {Object.keys(formData.extras).map(extraKey => {
                      const val = formData.extras[extraKey];
                      if (!val) return null;
                      
                      const config = parsedExtras.find(e => e.name === extraKey);
                      if (!config) return null;

                      let extraLineTotal = 0;
                      let label = extraKey;
                      if (typeof val === 'boolean') {
                         extraLineTotal = config.type === 'per_unit' ? config.price * units : config.type === 'per_booking' ? config.price : config.price * units;
                      } else {
                         extraLineTotal = config.type === 'per_unit' ? config.price * val * units : config.type === 'per_booking' ? config.price * val : config.price * val * units;
                         label = `${extraKey} (x${val})`;
                      }

                      return (
                        <div key={extraKey} className="flex justify-between items-center text-on-surface-variant">
                          <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px] text-terracota">check</span> {label}</span>
                          <span>+{extraLineTotal.toFixed(2)}€</span>
                        </div>
                      );
                    })}

                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-green-600 font-bold bg-green-50 p-2 rounded-lg -mx-2 px-2">
                        <span>Descuento aplicado</span>
                        <span>-{discountAmount.toFixed(2)}€</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-outline-variant/20 pt-4 mt-2">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Total Estimado</span>
                      <span className="text-4xl font-black text-terracota">{estimatedPrice.toFixed(2)}€</span>
                    </div>
                    <p className="text-[10px] text-right text-on-surface-variant mt-1 italic">Pago al confirmar la reserva</p>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center opacity-50 flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl mb-2">shopping_bag</span>
                  <p className="text-sm font-bold">Selecciona un servicio para comenzar</p>
                </div>
              )}
            </div>

            {/* Código promocional preparado */}
            <div className="bg-white rounded-2xl p-4 border border-outline-variant/20 shadow-sm">
              <div className="flex gap-2 items-center">
                <span className="material-symbols-outlined text-on-surface-variant p-2">sell</span>
                <input 
                  type="text" 
                  name="discountCode"
                  value={formData.discountCode}
                  onChange={(e) => {
                    handleChange(e);
                    if (discountInfo) setDiscountInfo(null); // Reset if they type
                    setDiscountError('');
                  }}
                  disabled={discountInfo !== null}
                  placeholder="Código promocional" 
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-semibold uppercase placeholder-normal disabled:opacity-50"
                />
                {!discountInfo ? (
                  <button 
                    onClick={validateDiscount}
                    disabled={!formData.discountCode || isValidatingDiscount}
                    className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest rounded-lg text-sm font-bold text-on-surface disabled:opacity-50 transition-colors"
                  >
                    {isValidatingDiscount ? '...' : 'Aplicar'}
                  </button>
                ) : (
                  <button 
                    onClick={clearDiscount}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-bold transition-colors"
                  >
                    Quitar
                  </button>
                )}
              </div>
              {discountError && <p className="text-red-500 text-xs font-semibold mt-2 px-2">{discountError}</p>}
              {discountInfo && <p className="text-green-600 text-xs font-semibold mt-2 px-2">¡Cupón aplicado correctamente!</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
