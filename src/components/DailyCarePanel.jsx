import { useState, useEffect } from 'react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'https://alilyback.duckdns.org/eris';

const MOOD_OPTIONS = ['FELIZ', 'TRANQUILO', 'NERVIOSO', 'TRISTE'];
const FOOD_OPTIONS = ['BIEN', 'REGULAR', 'MAL', 'NO_COMIO'];
const WALK_OPTIONS = ['SI', 'NO', 'CORTO', 'LARGO'];

export default function DailyCarePanel({ token, pets }) {
  const headers = { 'Authorization': `Bearer ${token}` };

  const [activeStays, setActiveStays] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [diary, setDiary] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [medications, setMedications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [diaryDate, setDiaryDate] = useState(new Date().toISOString().split('T')[0]);

  // Diary form
  const [diaryFood, setDiaryFood] = useState('');
  const [diaryWalk, setDiaryWalk] = useState('');
  const [diaryMood, setDiaryMood] = useState('');
  const [diaryMedGiven, setDiaryMedGiven] = useState(false);
  const [diaryNotes, setDiaryNotes] = useState('');

  // Photo
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');

  // Medication
  const [showMedForm, setShowMedForm] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medTime, setMedTime] = useState('');
  const [medNotes, setMedNotes] = useState('');

  // Template
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [tmpTitle, setTmpTitle] = useState('');
  const [tmpDesc, setTmpDesc] = useState('');
  const [tmpPetType, setTmpPetType] = useState('');

  const fetchActiveStays = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/active-stays`, { headers });
      if (res.ok) setActiveStays(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchAll = async (booking) => {
    setLoading(true);
    try {
      const [diaryRes, photoRes, medRes, tmpRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/stay-diary?bookingId=${booking.id}&date=${diaryDate}`, { headers }),
        fetch(`${API_BASE}/api/admin/pet-photos?petId=${booking.pet?.id}`, { headers }),
        fetch(`${API_BASE}/api/admin/medications?petId=${booking.pet?.id}`, { headers }),
        fetch(`${API_BASE}/api/admin/task-templates`, { headers })
      ]);
      if (diaryRes.ok) setDiary(await diaryRes.json());
      if (photoRes.ok) setPhotos(await photoRes.json());
      if (medRes.ok) setMedications(await medRes.json());
      if (tmpRes.ok) setTemplates(await tmpRes.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchActiveStays(); }, []);

  useEffect(() => {
    if (selectedBooking) fetchAll(selectedBooking);
  }, [selectedBooking, diaryDate]);

  const handleCheckin = async (id) => {
    await fetch(`${API_BASE}/api/admin/bookings/${id}/checkin`, { method: 'POST', headers });
    fetchActiveStays();
  };

  const handleCheckout = async (id) => {
    await fetch(`${API_BASE}/api/admin/bookings/${id}/checkout`, { method: 'POST', headers });
    fetchActiveStays();
    setSelectedBooking(null);
  };

  const handleAddDiaryEntry = async (e) => {
    e.preventDefault();
    if (!selectedBooking?.pet?.id) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/stay-diary`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ bookingId: selectedBooking.id, petId: selectedBooking.pet.id, date: diaryDate, food: diaryFood, walk: diaryWalk, mood: diaryMood, medicationGiven: diaryMedGiven, notes: diaryNotes })
      });
      if (res.ok) { setDiaryFood(''); setDiaryWalk(''); setDiaryMood(''); setDiaryMedGiven(false); setDiaryNotes(''); fetchAll(selectedBooking); }
    } catch (err) { console.error(err); }
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!selectedBooking?.pet?.id || !photoUrl) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/pet-photos`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ petId: selectedBooking.pet.id, url: photoUrl, caption: photoCaption })
      });
      if (res.ok) { setPhotoUrl(''); setPhotoCaption(''); fetchAll(selectedBooking); }
    } catch (err) { console.error(err); }
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();
    if (!selectedBooking?.pet?.id) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/medications`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ petId: selectedBooking.pet.id, name: medName, dosage: medDosage, time: medTime, notes: medNotes })
      });
      if (res.ok) { setShowMedForm(false); setMedName(''); setMedDosage(''); setMedTime(''); setMedNotes(''); fetchAll(selectedBooking); }
    } catch (err) { console.error(err); }
  };

  const handleToggleMed = async (id, active) => {
    await fetch(`${API_BASE}/api/admin/medications/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify({ active: !active }) });
    fetchAll(selectedBooking);
  };

  const handleDeletePhoto = async (id) => {
    await fetch(`${API_BASE}/api/admin/pet-photos/${id}`, { method: 'DELETE', headers });
    fetchAll(selectedBooking);
  };

  const handleAddTemplate = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/api/admin/task-templates`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ title: tmpTitle, description: tmpDesc, petType: tmpPetType || null })
      });
      setShowTemplateForm(false); setTmpTitle(''); setTmpDesc(''); setTmpPetType('');
      const res = await fetch(`${API_BASE}/api/admin/task-templates`, { headers });
      if (res.ok) setTemplates(await res.json());
    } catch (err) { console.error(err); }
  };

  const useTemplate = async (tpl) => {
    if (!selectedBooking?.pet?.id) return;
    try {
      // Create a daily task from the template
      await fetch(`${API_BASE}/api/admin/tasks`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ date: diaryDate, title: tpl.title, description: tpl.description, petId: selectedBooking.pet.id })
      });
      alert('Tarea creada desde plantilla');
    } catch (err) { console.error(err); }
  };

  if (!selectedBooking) {
    return (
      <div className="space-y-8">
        <span className="text-xs font-bold uppercase tracking-widest text-terracota block mb-1">CUIDADO DIARIO</span>
        <h2 className="text-2xl font-bold text-primary font-display-lg mb-6">Estancias activas</h2>
        {activeStays.length === 0 ? (
          <div className="bg-white border border-outline-variant/20 p-12 rounded-[2.5rem] text-center">
            <span className="material-symbols-outlined text-4xl text-outline-variant/40 mb-3 block">pets</span>
            <p className="text-sm text-on-surface-variant italic">No hay estancias activas ahora mismo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeStays.map(b => (
              <button key={b.id} onClick={() => setSelectedBooking(b)}
                className="bg-white border border-outline-variant/20 p-6 rounded-[2.5rem] shadow-sm text-left hover:ring-2 hover:ring-primary transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {b.pet?.name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{b.pet?.name || 'Mascota'}</p>
                    <p className="text-[10px] text-on-surface-variant">{b.client?.name} · {b.petType}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">{b.startDate} → {b.endDate}</span>
                  {!b.checkInAt ? (
                    <button onClick={(e) => { e.stopPropagation(); handleCheckin(b.id); }} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-bold">Check-in</button>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const pet = selectedBooking.pet;
  const isCheckedIn = !!selectedBooking.checkInAt;

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => setSelectedBooking(null)} className="text-xs text-on-surface-variant hover:text-primary mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Volver a estancias activas
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
              {pet?.name?.[0] || '?'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary font-display-lg">{pet?.name || 'Mascota'}</h2>
              <p className="text-xs text-on-surface-variant">{selectedBooking.client?.name} · {selectedBooking.petType} · {selectedBooking.startDate} → {selectedBooking.endDate}</p>
            </div>
            {!selectedBooking.checkOutAt && (
              <button onClick={() => handleCheckout(selectedBooking.id)} className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:scale-[0.98] transition-all">Check-out</button>
            )}
          </div>
        </div>
      </div>

      {/* Grid de cuidado diario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diario */}
        <div className="bg-white border border-outline-variant/20 p-6 rounded-[2.5rem] shadow-sm">
          <h3 className="text-sm font-bold text-primary mb-4">Diario de hoy</h3>
          <form onSubmit={handleAddDiaryEntry} className="space-y-3">
            <input type="date" value={diaryDate} onChange={(e) => setDiaryDate(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-2.5 text-xs" />
            <div className="grid grid-cols-3 gap-2">
              <select value={diaryFood} onChange={(e) => setDiaryFood(e.target.value)} className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-2.5 text-[10px]">
                <option value="">Comida</option>
                {FOOD_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <select value={diaryWalk} onChange={(e) => setDiaryWalk(e.target.value)} className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-2.5 text-[10px]">
                <option value="">Paseo</option>
                {WALK_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <select value={diaryMood} onChange={(e) => setDiaryMood(e.target.value)} className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-2.5 text-[10px]">
                <option value="">Ánimo</option>
                {MOOD_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-[10px] font-semibold text-on-surface-variant">
              <input type="checkbox" checked={diaryMedGiven} onChange={(e) => setDiaryMedGiven(e.target.checked)} className="w-4 h-4 rounded border-outline-variant text-primary" />
              Medicación administrada
            </label>
            <textarea value={diaryNotes} onChange={(e) => setDiaryNotes(e.target.value)} placeholder="Notas del día..." rows={2} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-2.5 text-xs resize-none" />
            <button type="submit" className="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-xs hover:scale-[0.98] transition-all">Guardar entrada</button>
          </form>

          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
            {diary.map(entry => (
              <div key={entry.id} className="bg-surface-container-low p-3 rounded-xl text-[10px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold">{entry.date}</span>
                  {entry.food && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded">{entry.food}</span>}
                  {entry.walk && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">{entry.walk}</span>}
                  {entry.mood && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">{entry.mood}</span>}
                  {entry.medicationGiven && <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded">💊</span>}
                </div>
                {entry.notes && <p className="text-on-surface-variant mt-1">{entry.notes}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Fotos */}
        <div className="bg-white border border-outline-variant/20 p-6 rounded-[2.5rem] shadow-sm">
          <h3 className="text-sm font-bold text-primary mb-4">Fotos</h3>
          <form onSubmit={handleAddPhoto} className="space-y-3 mb-4">
            <input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="Pega la URL de la imagen o base64..." className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-2.5 text-xs" />
            <input value={photoCaption} onChange={(e) => setPhotoCaption(e.target.value)} placeholder="Pie de foto (opcional)" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-2.5 text-xs" />
            <button type="submit" className="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-xs hover:scale-[0.98] transition-all">Añadir foto</button>
          </form>
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {photos.map(ph => (
              <div key={ph.id} className="relative group">
                <img src={ph.url} alt={ph.caption || ''} className="w-full aspect-square object-cover rounded-xl border border-outline-variant/10" />
                <button onClick={() => handleDeletePhoto(ph.id)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                {ph.caption && <p className="text-[8px] text-on-surface-variant mt-0.5 truncate">{ph.caption}</p>}
              </div>
            ))}
            {photos.length === 0 && <p className="col-span-3 text-center text-[10px] text-on-surface-variant italic py-4">Sin fotos aún</p>}
          </div>
        </div>

        {/* Medicación */}
        <div className="bg-white border border-outline-variant/20 p-6 rounded-[2.5rem] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-primary">Medicación</h3>
            <button onClick={() => setShowMedForm(true)} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-[9px] font-bold">+ Añadir</button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {medications.map(m => (
              <div key={m.id} className={`flex items-center justify-between p-3 rounded-xl text-xs border ${m.active ? 'bg-white border-outline-variant/20' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                <div>
                  <p className="font-semibold">{m.name} <span className="text-on-surface-variant">({m.dosage})</span></p>
                  <p className="text-[10px] text-on-surface-variant">{m.time ? `A las ${m.time}` : ''} {m.notes ? `· ${m.notes}` : ''}</p>
                </div>
                <button onClick={() => handleToggleMed(m.id, m.active)} className={`px-2 py-1 rounded-lg text-[9px] font-bold ${m.active ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {m.active ? 'Pausar' : 'Activar'}
                </button>
              </div>
            ))}
            {medications.length === 0 && <p className="text-center text-[10px] text-on-surface-variant italic py-4">Sin medicación registrada</p>}
          </div>
        </div>

        {/* Plantillas */}
        <div className="bg-white border border-outline-variant/20 p-6 rounded-[2.5rem] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-primary">Plantillas de tareas</h3>
            <button onClick={() => setShowTemplateForm(true)} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-[9px] font-bold">+ Nueva</button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {templates.map(t => (
              <button key={t.id} onClick={() => useTemplate(t)} className="w-full flex items-center justify-between p-3 rounded-xl border border-outline-variant/20 text-xs hover:bg-surface-container-low transition-all text-left">
                <div>
                  <p className="font-semibold">{t.title}</p>
                  {t.description && <p className="text-[10px] text-on-surface-variant">{t.description}</p>}
                </div>
                <span className="text-[9px] text-primary font-bold">Usar</span>
              </button>
            ))}
            {templates.length === 0 && <p className="text-center text-[10px] text-on-surface-variant italic py-4">Sin plantillas aún</p>}
          </div>
        </div>
      </div>

      {/* Modal medicación */}
      {showMedForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowMedForm(false)}>
          <div className="bg-white rounded-[2.5rem] border border-outline-variant/15 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-terracota">NUEVA MEDICACIÓN</span>
                <button onClick={() => setShowMedForm(false)} className="w-8 h-8 rounded-full flex items-center justify-center border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <form onSubmit={handleAddMedication} className="space-y-4">
                <input value={medName} onChange={(e) => setMedName(e.target.value)} placeholder="Nombre del medicamento" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" required />
                <div className="grid grid-cols-2 gap-3">
                  <input value={medDosage} onChange={(e) => setMedDosage(e.target.value)} placeholder="Dosis (ej. 1/2 pastilla)" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" required />
                  <input type="time" value={medTime} onChange={(e) => setMedTime(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" />
                </div>
                <textarea value={medNotes} onChange={(e) => setMedNotes(e.target.value)} placeholder="Notas adicionales" rows={2} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs resize-none" />
                <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold text-xs hover:scale-[0.98] transition-all">Guardar</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal plantilla */}
      {showTemplateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowTemplateForm(false)}>
          <div className="bg-white rounded-[2.5rem] border border-outline-variant/15 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-terracota">NUEVA PLANTILLA</span>
                <button onClick={() => setShowTemplateForm(false)} className="w-8 h-8 rounded-full flex items-center justify-center border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <form onSubmit={handleAddTemplate} className="space-y-4">
                <input value={tmpTitle} onChange={(e) => setTmpTitle(e.target.value)} placeholder="Título de la tarea" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" required />
                <textarea value={tmpDesc} onChange={(e) => setTmpDesc(e.target.value)} placeholder="Descripción" rows={2} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs resize-none" />
                <select value={tmpPetType} onChange={(e) => setTmpPetType(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs">
                  <option value="">Para cualquier mascota</option>
                  <option value="Gato">Gato</option>
                  <option value="Perro">Perro</option>
                  <option value="Conejo">Conejo</option>
                  <option value="Cobaya">Cobaya</option>
                </select>
                <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold text-xs hover:scale-[0.98] transition-all">Crear plantilla</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
