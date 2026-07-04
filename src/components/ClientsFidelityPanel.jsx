import { useState, useEffect } from 'react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'https://alilyback.duckdns.org/eris';

const TAG_OPTIONS = ['VIP', 'RECURRENTE', 'NUEVO', 'REFERIDO', 'ANUAL', 'PERRO_ANSIOSO', 'GATO_MIEDOSO', 'MEDICACION', 'URGENTE'];

export default function ClientsFidelityPanel({ token }) {
  const headers = { 'Authorization': `Bearer ${token}` };

  const [activeSubTab, setActiveSubTab] = useState('alerts');
  const [alerts, setAlerts] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loyaltyData, setLoyaltyData] = useState([]);
  const [loyaltyConfig, setLoyaltyConfig] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTags, setEditingTags] = useState(null);
  const [tagInput, setTagInput] = useState('');

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [revName, setRevName] = useState('');
  const [revPetName, setRevPetName] = useState('');
  const [revPetType, setRevPetType] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revText, setRevText] = useState('');
  const [revInitials, setRevInitials] = useState('');

  // Loyalty config form
  const [cfgNights, setCfgNights] = useState(10);
  const [cfgMaxFree, setCfgMaxFree] = useState(1);

  // Filter
  const [tagFilter, setTagFilter] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [alertRes, revRes, loyRes, loyCfgRes, clientRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/alerts`, { headers }),
        fetch(`${API_BASE}/api/admin/reviews`, { headers }),
        fetch(`${API_BASE}/api/admin/clients/loyalty`, { headers }),
        fetch(`${API_BASE}/api/admin/loyalty-config`, { headers }),
        fetch(`${API_BASE}/api/admin/clients`, { headers })
      ]);
      if (alertRes.ok) setAlerts(await alertRes.json());
      if (revRes.ok) setReviews(await revRes.json());
      if (loyRes.ok) setLoyaltyData(await loyRes.json());
      if (loyCfgRes.ok) {
        const c = await loyCfgRes.json();
        setLoyaltyConfig(c);
        setCfgNights(c.nightsPerFree || 10);
        setCfgMaxFree(c.maxFreeNights || 1);
      }
      if (clientRes.ok) setClients(await clientRes.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Tags
  const handleSaveTags = async (clientId, tags) => {
    try {
      await fetch(`${API_BASE}/api/admin/clients/${clientId}/tags`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ tags })
      });
      fetchAll();
    } catch (err) { console.error(err); }
  };

  const toggleTag = (clientId, currentTags, tag) => {
    const list = currentTags ? currentTags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const idx = list.indexOf(tag);
    if (idx >= 0) list.splice(idx, 1); else list.push(tag);
    handleSaveTags(clientId, list.join(','));
  };

  // Reviews
  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/reviews`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ clientName: revName, petName: revPetName, petType: revPetType, rating: revRating, text: revText, initials: revInitials || revName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) })
      });
      if (res.ok) { setShowReviewForm(false); setRevName(''); setRevPetName(''); setRevPetType(''); setRevText(''); setRevInitials(''); fetchAll(); }
    } catch (err) { console.error(err); }
  };

  const handleToggleApproval = async (id, approved) => {
    try {
      await fetch(`${API_BASE}/api/admin/reviews/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ approved: !approved })
      });
      fetchAll();
    } catch (err) { console.error(err); }
  };

  const handleDeleteReview = async (id) => {
    try { await fetch(`${API_BASE}/api/admin/reviews/${id}`, { method: 'DELETE', headers }); fetchAll(); }
    catch (err) { console.error(err); }
  };

  // Loyalty config
  const handleSaveLoyaltyConfig = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/api/admin/loyalty-config`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ nightsPerFree: cfgNights, maxFreeNights: cfgMaxFree })
      });
      fetchAll();
    } catch (err) { console.error(err); }
  };

  // Filter clients by tag
  const filteredClients = tagFilter
    ? clients.filter(c => c.tags && c.tags.split(',').map(t => t.trim()).includes(tagFilter))
    : clients;

  const alertsCount = alerts
    ? alerts.vaccinationAlerts.length + alerts.birthdayAlerts.length + alerts.loyaltyAlerts.length
    : 0;

  if (loading) return <div className="text-center py-12 text-sm text-on-surface-variant">Cargando...</div>;

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-terracota block mb-1">CLIENTES Y FIDELIZACIÓN</span>
          <h2 className="text-2xl font-bold text-primary font-display-lg">Fidelización</h2>
        </div>
        {alertsCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            {alertsCount} alertas activas
          </span>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'alerts', label: 'Alertas', icon: 'notifications_active' },
          { key: 'tags', label: 'Etiquetas', icon: 'label' },
          { key: 'loyalty', label: 'Fidelidad', icon: 'card_membership' },
          { key: 'reviews', label: 'Reseñas', icon: 'star' }
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveSubTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === tab.key ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}>
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Alertas */}
      {activeSubTab === 'alerts' && (
        <div className="space-y-4">
          {alerts && alerts.vaccinationAlerts.length === 0 && alerts.birthdayAlerts.length === 0 && alerts.loyaltyAlerts.length === 0 ? (
            <div className="bg-white border border-outline-variant/20 p-8 rounded-[2.5rem] text-center">
              <span className="material-symbols-outlined text-4xl text-emerald-300 mb-3 block">check_circle</span>
              <p className="text-sm font-bold text-emerald-600">Todo al día — no hay alertas pendientes</p>
            </div>
          ) : (
            <>
              {/* Vacunas */}
              {alerts?.vaccinationAlerts?.length > 0 && (
                <div className="bg-white border border-amber-200 p-6 rounded-[2.5rem] shadow-sm">
                  <h3 className="text-sm font-bold text-amber-800 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">vaccines</span>
                    Vacunas próximas a caducar ({alerts.vaccinationAlerts.length})
                  </h3>
                  <div className="space-y-2">
                    {alerts.vaccinationAlerts.map((a, i) => (
                      <div key={i} className="flex items-center justify-between bg-amber-50 p-3 rounded-xl text-xs">
                        <span className="font-semibold">{a.message}</span>
                        <span className="text-amber-700 font-bold">{a.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cumpleaños */}
              {alerts?.birthdayAlerts?.length > 0 && (
                <div className="bg-white border border-pink-200 p-6 rounded-[2.5rem] shadow-sm">
                  <h3 className="text-sm font-bold text-pink-800 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">celebration</span>
                    Cumpleaños del mes ({alerts.birthdayAlerts.length})
                  </h3>
                  <div className="space-y-2">
                    {alerts.birthdayAlerts.map((a, i) => (
                      <div key={i} className="flex items-center justify-between bg-pink-50 p-3 rounded-xl text-xs">
                        <span className="font-semibold">{a.message}</span>
                        <span className="text-pink-700">Día {a.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fidelización */}
              {alerts?.loyaltyAlerts?.length > 0 && (
                <div className="bg-white border border-indigo-200 p-6 rounded-[2.5rem] shadow-sm">
                  <h3 className="text-sm font-bold text-indigo-800 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">card_membership</span>
                    Cerca de noche gratis ({alerts.loyaltyAlerts.length})
                  </h3>
                  <div className="space-y-2">
                    {alerts.loyaltyAlerts.map((a, i) => (
                      <div key={i} className="flex items-center justify-between bg-indigo-50 p-3 rounded-xl text-xs">
                        <span className="font-semibold">{a.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB: Etiquetas */}
      {activeSubTab === 'tags' && (
        <div className="bg-white border border-outline-variant/20 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10">
            <h3 className="text-sm font-bold text-primary mb-2">Segmentación de clientes</h3>
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-[10px] font-semibold text-on-surface-variant">Filtrar:</span>
              <button onClick={() => setTagFilter('')} className={`px-3 py-1 rounded-lg text-[10px] font-bold ${!tagFilter ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}>Todos</button>
              {TAG_OPTIONS.map(t => (
                <button key={t} onClick={() => setTagFilter(t === tagFilter ? '' : t)} className={`px-3 py-1 rounded-lg text-[10px] font-bold ${tagFilter === t ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}>
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {filteredClients.map(client => {
              const tags = client.tags ? client.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
              return (
                <div key={client.id} className="flex items-center justify-between p-4 px-6 hover:bg-surface-container-low/50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold">{client.name}</p>
                    <p className="text-[10px] text-on-surface-variant/70">{client.email} {client.phone ? `· ${client.phone}` : ''}</p>
                  </div>
                  <div className="flex gap-1.5 flex-wrap items-center">
                    {TAG_OPTIONS.map(t => (
                      <button key={t} onClick={() => toggleTag(client.id, client.tags, t)}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all ${
                          tags.includes(t)
                            ? 'bg-primary/10 border-primary/30 text-primary'
                            : 'bg-white border-outline-variant/20 text-on-surface-variant/50 hover:border-outline-variant/40'
                        }`}>
                        {t.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: Fidelidad */}
      {activeSubTab === 'loyalty' && (
        <div className="space-y-6">
          {/* Config */}
          <div className="bg-white border border-outline-variant/20 p-6 rounded-[2.5rem] shadow-sm">
            <h3 className="text-sm font-bold text-primary mb-4">Configuración del programa</h3>
            <form onSubmit={handleSaveLoyaltyConfig} className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Noches para 1 gratis</label>
                <input type="number" min="1" value={cfgNights} onChange={(e) => setCfgNights(e.target.value)}
                  className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs w-24" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Máx. noches gratis por canje</label>
                <input type="number" min="1" value={cfgMaxFree} onChange={(e) => setCfgMaxFree(e.target.value)}
                  className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs w-24" />
              </div>
              <button type="submit" className="px-5 py-3 rounded-xl bg-primary text-white font-bold text-xs hover:scale-[0.98] transition-all">Guardar</button>
            </form>
          </div>

          {/* Tabla fidelidad */}
          <div className="bg-white border border-outline-variant/20 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-outline-variant/10">
              <h3 className="text-sm font-bold text-primary">Estado de fidelización</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-outline-variant/10">
                    <th className="text-left py-4 px-6 font-bold text-on-surface-variant/60 uppercase tracking-wider">Cliente</th>
                    <th className="text-center py-4 px-6 font-bold text-on-surface-variant/60 uppercase tracking-wider">Reservas</th>
                    <th className="text-center py-4 px-6 font-bold text-on-surface-variant/60 uppercase tracking-wider">Noches totales</th>
                    <th className="text-center py-4 px-6 font-bold text-on-surface-variant/60 uppercase tracking-wider">Gasto total</th>
                    <th className="text-center py-4 px-6 font-bold text-on-surface-variant/60 uppercase tracking-wider">Noches gratis</th>
                    <th className="text-center py-4 px-6 font-bold text-on-surface-variant/60 uppercase tracking-wider">Próxima</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {loyaltyData.map(d => (
                    <tr key={d.clientId} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 px-6 font-semibold">{d.clientName}</td>
                      <td className="py-4 px-6 text-center">{d.bookingCount}</td>
                      <td className="py-4 px-6 text-center font-bold">{d.totalNights}</td>
                      <td className="py-4 px-6 text-center">{d.totalSpent.toFixed(2)}€</td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-emerald-600 font-bold">{d.earnedFreeNights}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {d.nightsUntilNextFree === 0 ? (
                          <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-bold">¡Ya!</span>
                        ) : (
                          <span className="text-on-surface-variant">{d.nightsUntilNextFree} noches</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Reseñas */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => setShowReviewForm(true)}
              className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:scale-[0.98] transition-all">
              + Nueva reseña
            </button>
          </div>

          {/* Grid de reseñas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map(rev => (
              <div key={rev.id} className={`bg-white border rounded-[2.5rem] p-6 shadow-sm transition-all ${
                rev.approved ? 'border-emerald-200' : 'border-outline-variant/20 opacity-70'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                      {rev.initials || rev.clientName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{rev.clientName}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                        {rev.petName ? `con ${rev.petName}` : ''} {rev.petType ? `(${rev.petType})` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-xs ${s <= rev.rating ? 'text-orange-400' : 'text-gray-200'}`}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant italic mb-4">"{rev.text}"</p>
                <div className="flex items-center justify-between">
                  <button onClick={() => handleToggleApproval(rev.id, rev.approved)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${
                      rev.approved ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}>
                    {rev.approved ? 'Ocultar' : 'Aprobar'}
                  </button>
                  <button onClick={() => handleDeleteReview(rev.id)}
                    className="px-3 py-1.5 rounded-lg text-[9px] font-bold border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <span className="material-symbols-outlined text-4xl text-outline-variant/40 mb-3 block">star</span>
                <p className="text-sm text-on-surface-variant italic">No hay reseñas aún.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal nueva reseña */}
      {showReviewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowReviewForm(false)}>
          <div className="bg-white rounded-[2.5rem] border border-outline-variant/15 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-terracota">NUEVA RESEÑA</span>
                <button onClick={() => setShowReviewForm(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <form onSubmit={handleAddReview} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Nombre del cliente</label>
                  <input value={revName} onChange={(e) => setRevName(e.target.value)} required
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Nombre mascota</label>
                    <input value={revPetName} onChange={(e) => setRevPetName(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Tipo</label>
                    <input value={revPetType} onChange={(e) => setRevPetType(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Valoración</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setRevRating(s)}
                        className={`text-xl px-2 py-1 rounded-lg transition-all ${s <= revRating ? 'text-orange-400' : 'text-gray-200'}`}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Texto de la reseña</label>
                  <textarea value={revText} onChange={(e) => setRevText(e.target.value)} rows={3} required
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs resize-none" />
                </div>
                <button type="submit"
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold text-xs hover:scale-[0.98] transition-all">
                  Guardar reseña
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
