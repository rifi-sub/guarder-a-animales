import { useState, useEffect } from 'react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'https://alilyback.duckdns.org/eris';

export default function ClientPortal() {
  const [token, setToken] = useState(localStorage.getItem('clientToken') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [pets, setPets] = useState([]);

  useEffect(() => {
    if (token) {
      fetchPortalData();
    }
  }, [token]);

  const fetchPortalData = async () => {
    try {
      const [bookingsRes, petsRes] = await Promise.all([
        fetch(`${API_BASE}/api/portal/my-bookings`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/portal/my-pets`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (bookingsRes.ok && petsRes.ok) {
        setBookings(await bookingsRes.json());
        setPets(await petsRes.json());
      } else {
        handleLogout();
      }
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

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    setToken('');
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-[2rem] border border-outline-variant/30 shadow-sm text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-3xl">pets</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-primary mb-2">Espacio de Cliente</h2>
          <p className="text-sm text-on-surface-variant mb-8">Accede para gestionar tus reservas y las cartillas de tus mascotas.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full bg-surface-container-low border-outline-variant/30 rounded-xl p-4 focus:ring-primary focus:border-primary text-sm"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              className="w-full bg-surface-container-low border-outline-variant/30 rounded-xl p-4 focus:ring-primary focus:border-primary text-sm"
            />
            {loginError && <p className="text-rose-600 text-xs font-bold text-left">{loginError}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-bold p-4 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <a href="/" className="inline-block mt-8 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors">
            ← Volver a la web
          </a>
        </div>
      </div>
    );
  }

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
            <div className="w-full flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-sm">
              <span className="material-symbols-outlined text-sm">dashboard</span>
              Panel Principal
            </div>
          </nav>
        </div>
        
        <div className="pt-6 border-t border-outline-variant/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border border-outline-variant/30 text-rose-600 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-rose-50 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-5xl">
        <h1 className="text-3xl font-display font-bold text-primary mb-8">Resumen de tu cuenta</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Reservas */}
          <section className="bg-white rounded-3xl p-6 border border-outline-variant/20 shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">event</span>
              Tus Reservas
            </h2>
            {bookings.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No tienes reservas todavía.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-bold text-on-surface">{b.service}</span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                        b.status === 'PENDIENTE' ? 'bg-orange-100 text-orange-700' :
                        b.status === 'ACEPTADO' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant">Mascota: <span className="font-semibold text-primary">{b.petType}</span></p>
                    <p className="text-xs text-on-surface-variant">Fechas: {b.startDate} al {b.endDate}</p>
                  </div>
                ))}
              </div>
            )}
            <a href="/#contacto" className="inline-block mt-4 text-xs font-bold text-terracota hover:underline">
              + Solicitar nueva reserva
            </a>
          </section>

          {/* Mascotas */}
          <section className="bg-white rounded-3xl p-6 border border-outline-variant/20 shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">pets</span>
              Tus Mascotas registradas
            </h2>
            {pets.length === 0 ? (
              <p className="text-sm text-on-surface-variant">Tus mascotas aparecerán aquí cuando Eris apruebe tu primera reserva.</p>
            ) : (
              <div className="space-y-3">
                {pets.map(p => (
                  <div key={p.id} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                    <p className="font-bold text-primary mb-1">{p.name} <span className="text-xs font-normal text-on-surface-variant">({p.species})</span></p>
                    {p.medicalNotes && <p className="text-[10px] text-rose-600 bg-rose-50 px-2 py-1 rounded-lg mt-2 inline-block"><span className="font-bold">Médico:</span> {p.medicalNotes}</p>}
                    <button className="text-[10px] text-on-surface-variant underline mt-2 block hover:text-primary">
                      Añadir Cartilla Veterinaria (PDF)
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
