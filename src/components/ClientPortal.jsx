import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'https://alilyback.duckdns.org/eris';

export default function ClientPortal() {
  const [token, setToken] = useState(localStorage.getItem('clientToken') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const [activeSection, setActiveSection] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [pets, setPets] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [stripePk, setStripePk] = useState('');
  const [stripe, setStripe] = useState(null);
  const [payingBooking, setPayingBooking] = useState(null);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/stripe-config`).then(r => r.json()).then(d => {
      setStripePk(d.publishableKey);
      if (d.publishableKey) loadStripe(d.publishableKey).then(setStripe);
    }).catch(() => {});
  }, []);

  // Magic link token from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const magicToken = params.get('token');
    const paymentSuccess = params.get('payment');
    if (magicToken) {
      fetch(`${API_BASE}/api/portal/verify-link?token=${magicToken}`)
        .then(r => r.json())
        .then(d => {
          if (d.token) {
            localStorage.setItem('clientToken', d.token);
            setToken(d.token);
            window.history.replaceState({}, '', '/portal');
          }
        })
        .catch(() => {});
    }
    if (paymentSuccess === 'success') {
      alert('¡Pago realizado con éxito!');
      window.history.replaceState({}, '', '/portal');
    }
  }, []);

  useEffect(() => {
    if (token) fetchPortalData();
  }, [token]);

  const fetchPortalData = async () => {
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [bRes, pRes, iRes] = await Promise.all([
        fetch(`${API_BASE}/api/portal/my-bookings`, { headers }),
        fetch(`${API_BASE}/api/portal/my-pets`, { headers }),
        fetch(`${API_BASE}/api/portal/my-invoices`, { headers })
      ]);
      if (bRes.ok) setBookings(await bRes.json());
      if (pRes.ok) setPets(await pRes.json());
      if (iRes.ok) setInvoices(await iRes.json());
      if (!bRes.ok && !pRes.ok) handleLogout();
    } catch (err) {
      console.error(err);
      handleLogout();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Credenciales inválidas');
      if (data.user.role !== 'CLIENT') throw new Error('Esta cuenta no es de cliente');
      localStorage.setItem('clientToken', data.token);
      setToken(data.token);
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMagicLink = async () => {
    if (!email) return;
    setMagicSent(false);
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/portal/send-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) setMagicSent(true);
      else setLoginError(data.error);
    } catch (err) {
      setLoginError('Error al enviar enlace');
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    setToken('');
  };

  const handlePayBooking = async (bookingId) => {
    setPayingBooking(bookingId);
    try {
      const res = await fetch(`${API_BASE}/api/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ bookingId })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Error al iniciar pago');
    } catch (err) {
      alert('Error de conexión');
    }
    setPayingBooking(null);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-[2rem] border border-outline-variant/30 shadow-sm text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-3xl">pets</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-primary mb-2">Espacio de Cliente</h2>
          <p className="text-sm text-on-surface-variant mb-8">Accede para gestionar tus reservas y facturas.</p>

          {magicSent ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="material-symbols-outlined text-emerald-600 text-3xl mb-2">mark_email_read</span>
              <p className="text-sm font-bold text-emerald-800">Enlace enviado</p>
              <p className="text-xs text-emerald-600 mt-1">Revisa tu bandeja de entrada y haz clic en el enlace para acceder.</p>
            </div>
          ) : (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required
                  className="w-full bg-surface-container-low border-outline-variant/30 rounded-xl p-4 focus:ring-primary focus:border-primary text-sm" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña"
                  className="w-full bg-surface-container-low border-outline-variant/30 rounded-xl p-4 focus:ring-primary focus:border-primary text-sm" />
                {loginError && <p className="text-rose-600 text-xs font-bold text-left">{loginError}</p>}
                <button type="submit" disabled={isLoading}
                  className="w-full bg-primary text-white font-bold p-4 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-outline-variant/30"></div>
                <span className="text-xs text-on-surface-variant font-bold">O</span>
                <div className="flex-1 h-px bg-outline-variant/30"></div>
              </div>
              <button onClick={handleSendMagicLink} disabled={isLoading || !email}
                className="w-full border-2 border-outline-variant/30 text-on-surface font-bold p-4 rounded-xl hover:bg-surface-container-low transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">magic</span>
                Enviar enlace mágico
              </button>
            </>
          )}

          <a href="/" className="inline-block mt-8 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors">
            ← Volver a la web
          </a>
        </div>
      </div>
    );
  }

  const statusBadge = (status) => {
    const map = { PENDIENTE: 'bg-orange-100 text-orange-700', ACEPTADA: 'bg-emerald-100 text-emerald-700', RECHAZADA: 'bg-rose-100 text-rose-700', RESERVADA: 'bg-blue-100 text-blue-700', PROGRESO: 'bg-violet-100 text-violet-700' };
    return <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${map[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
  };

  const navItem = (key, label, icon) => (
    <button onClick={() => setActiveSection(key)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeSection === key ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
      <span className="material-symbols-outlined text-sm">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r border-outline-variant/20 flex flex-col justify-between p-6 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary">person</span>
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-primary leading-tight">Mi Espacio</h2>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase">Cliente Eris</p>
            </div>
          </div>
          <nav className="space-y-2">
            {navItem('bookings', 'Mis Reservas', 'event')}
            {navItem('invoices', 'Mis Facturas', 'receipt')}
            {navItem('pay', 'Pagar', 'credit_card')}
          </nav>
        </div>
        <div className="pt-6 border-t border-outline-variant/10 space-y-2">
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border border-outline-variant/30 text-rose-600 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-rose-50 transition-colors">
            <span className="material-symbols-outlined text-sm">logout</span>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-5xl overflow-y-auto">
        {activeSection === 'bookings' && (
          <>
            <h1 className="text-3xl font-display font-bold text-primary mb-8">Mis Reservas</h1>
            {bookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-outline-variant/20 shadow-sm text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3">event_busy</span>
                <p className="text-sm text-on-surface-variant">No tienes reservas todavía.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(b => (
                  <div key={b.id} className="bg-white rounded-3xl p-6 border border-outline-variant/20 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-primary text-lg">{b.service}</h3>
                        <p className="text-xs text-on-surface-variant">{b.petType}{b.petName ? ` — ${b.petName}` : ''}</p>
                      </div>
                      {statusBadge(b.status)}
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-on-surface-variant">
                      <span><span className="font-semibold">Entrada:</span> {b.startDate}</span>
                      <span><span className="font-semibold">Salida:</span> {b.endDate}</span>
                      {b.price && <span><span className="font-semibold">Precio:</span> {b.price}€</span>}
                    </div>
                    {b.paymentStatus && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.paymentStatus === 'PAGADO' ? 'bg-emerald-100 text-emerald-700' : b.paymentStatus === 'SEÑA' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {b.paymentStatus}
                        </span>
                        {(b.paymentStatus === 'PENDIENTE' || b.paymentStatus === 'SEÑA') && b.price && stripePk && (
                          <button onClick={() => handlePayBooking(b.id)} disabled={payingBooking === b.id}
                            className="text-[10px] font-bold bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">credit_card</span>
                            {payingBooking === b.id ? 'Procesando...' : 'Pagar ahora'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <a href="/#contacto" className="inline-block mt-6 text-xs font-bold text-terracota hover:underline">+ Solicitar nueva reserva</a>
          </>
        )}

        {activeSection === 'invoices' && (
          <>
            <h1 className="text-3xl font-display font-bold text-primary mb-8">Mis Facturas</h1>
            {invoices.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-outline-variant/20 shadow-sm text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3">receipt_long</span>
                <p className="text-sm text-on-surface-variant">No tienes facturas todavía.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map(inv => (
                  <div key={inv.id} className="bg-white rounded-3xl p-6 border border-outline-variant/20 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="font-bold text-primary text-sm">{inv.invoiceNum}</p>
                      <p className="text-xs text-on-surface-variant">{new Date(inv.issuedAt).toLocaleDateString()}</p>
                      {inv.booking && <p className="text-xs text-on-surface-variant">{inv.booking.service} — {inv.booking.startDate} al {inv.booking.endDate}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{inv.totalAmount.toFixed(2)}€</p>
                      <a href={`${API_BASE}/api/admin/invoices/${inv.id}/pdf`} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] text-terracota font-bold hover:underline flex items-center gap-1 justify-end">
                        <span className="material-symbols-outlined text-[10px]">download</span>
                        PDF
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeSection === 'pay' && (
          <>
            <h1 className="text-3xl font-display font-bold text-primary mb-8">Pagar</h1>
            {(() => {
              const unpaid = bookings.filter(b => b.price && b.paymentStatus !== 'PAGADO');
              if (unpaid.length === 0) return (
                <div className="bg-white rounded-3xl p-8 border border-outline-variant/20 shadow-sm text-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3">check_circle</span>
                  <p className="text-sm text-on-surface-variant">No tienes pagos pendientes.</p>
                </div>
              );
              return (
                <div className="space-y-4">
                  {unpaid.map(b => (
                    <div key={b.id} className="bg-white rounded-3xl p-6 border border-outline-variant/20 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="font-bold text-primary">{b.service}</p>
                        <p className="text-xs text-on-surface-variant">{b.startDate} al {b.endDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary text-lg">{b.price}€</p>
                        {stripePk ? (
                          <button onClick={() => handlePayBooking(b.id)} disabled={payingBooking === b.id}
                            className="text-xs font-bold bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
                            {payingBooking === b.id ? 'Procesando...' : 'Pagar con tarjeta'}
                          </button>
                        ) : (
                          <p className="text-xs text-amber-600 font-semibold">Pago online no disponible</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </>
        )}
      </main>
    </div>
  );
}