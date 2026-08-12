import { useState, useEffect } from 'react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? '' : 'https://alilyback.duckdns.org/eris';

const TABS = [
  { key: 'alimentacion', label: 'Alimentación', icon: 'restaurant' },
  { key: 'salud',        label: 'Salud',          icon: 'favorite' },
  { key: 'comportamiento', label: 'Comportamiento', icon: 'psychology' },
  { key: 'paseos',       label: 'Paseos',          icon: 'directions_walk' },
  { key: 'convivencia',  label: 'Convivencia',     icon: 'home' },
];

const ANXIETY_LEVELS = ['BAJO', 'MEDIO', 'ALTO'];
const BARK_LEVELS    = ['POCO', 'NORMAL', 'MUCHO'];

/**
 * PetCareFormModal
 * @param {object}  pet        - The pet object from the API
 * @param {string}  token      - JWT token
 * @param {string}  role       - 'ADMIN' or 'CLIENT'
 * @param {function} onClose   - Close handler
 * @param {function} onSaved   - Called after successful save with the updated pet
 */
export default function PetCareFormModal({ pet, token, role = 'ADMIN', onClose, onSaved }) {
  const [activeTab, setActiveTab]   = useState('alimentacion');
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState('');

  // Form state — initialised from the pet object
  const [form, setForm] = useState({
    // Datos básicos (editable solo en admin)
    name: pet.name || '',
    type: pet.type || '',
    breed: pet.breed || '',
    age: pet.age || '',

    // Alimentación
    diet:            pet.diet || '',
    feedingSchedule: pet.feedingSchedule || '',
    feedingAmount:   pet.feedingAmount || '',
    foodBrand:       pet.foodBrand || '',
    wetFood:         pet.wetFood   ?? false,
    treatAllowed:    pet.treatAllowed ?? true,
    treatNotes:      pet.treatNotes || '',

    // Salud
    medicalNotes:       pet.medicalNotes || '',
    microchip:          pet.microchip || '',
    vetName:            pet.vetName || '',
    vetPhone:           pet.vetPhone || '',
    vaccinationStatus:  pet.vaccinationStatus || '',
    nextVaccinationDate:pet.nextVaccinationDate || '',
    birthday:           pet.birthday || '',
    insuranceInfo:      pet.insuranceInfo || '',

    // Comportamiento
    behaviorNotes: pet.behaviorNotes || '',
    fearNotes:     pet.fearNotes || '',
    anxietyLevel:  pet.anxietyLevel || '',
    biteHistory:   pet.biteHistory  ?? false,
    barkLevel:     pet.barkLevel || '',

    // Paseos
    walkSchedule: pet.walkSchedule || '',
    walkDuration: pet.walkDuration || '',
    pullsLeash:   pet.pullsLeash   ?? false,
    walkNotes:    pet.walkNotes || '',

    // Convivencia
    sociableWithDogs: pet.sociableWithDogs ?? true,
    sociableWithCats: pet.sociableWithCats ?? true,
    sociableWithKids: pet.sociableWithKids ?? true,
    livesWith:        pet.livesWith || '',

    // Emergencias
    emergencyVetName:  pet.emergencyVetName || '',
    emergencyVetPhone: pet.emergencyVetPhone || '',
  });

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const endpoint = role === 'ADMIN'
        ? `${API_BASE}/api/admin/pets/${pet.id}/care-form`
        : `${API_BASE}/api/portal/my-pets/${pet.id}/care-form`;

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al guardar');
      }
      const updated = await res.json();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      if (onSaved) onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── INPUT HELPERS ────────────────────────────────────────────────
  const Input = ({ label, field, type = 'text', placeholder = '' }) => (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">{label}</label>
      <input
        type={type}
        value={form[field] || ''}
        onChange={e => set(field, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
      />
    </div>
  );

  const Textarea = ({ label, field, placeholder = '', rows = 3 }) => (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">{label}</label>
      <textarea
        value={form[field] || ''}
        onChange={e => set(field, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-primary"
      />
    </div>
  );

  const Toggle = ({ label, field, desc }) => (
    <label className="flex items-center justify-between gap-4 cursor-pointer bg-surface-container-low border border-outline-variant/20 rounded-xl p-3">
      <div>
        <p className="text-sm font-semibold text-on-surface">{label}</p>
        {desc && <p className="text-[10px] text-on-surface-variant mt-0.5">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => set(field, !form[field])}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${form[field] ? 'bg-primary' : 'bg-outline-variant/40'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form[field] ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </label>
  );

  const Select = ({ label, field, options }) => (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">{label}</label>
      <select
        value={form[field] || ''}
        onChange={e => set(field, e.target.value)}
        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
      >
        <option value="">— No indicado —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-[2rem] border border-outline-variant/15 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10 shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-terracota">FICHA DE CUIDADOS</span>
            <h2 className="text-xl font-bold text-primary">{pet.name} <span className="text-sm font-normal text-on-surface-variant">· {pet.type}</span></h2>
            {pet.formFilledAt && (
              <p className="text-[10px] text-on-surface-variant mt-0.5">
                Última actualización: {new Date(pet.formFilledAt).toLocaleDateString('es-ES')}
                {pet.formFilledBy && ` por ${pet.formFilledBy === 'CLIENT' ? 'el cliente' : 'la administradora'}`}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 overflow-x-auto scrollbar-none shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">

          {/* ── ALIMENTACIÓN ── */}
          {activeTab === 'alimentacion' && (
            <div className="space-y-4">
              {role === 'ADMIN' && (
                <div className="bg-surface-container-low/60 rounded-2xl p-4 space-y-3 border border-outline-variant/10">
                  <p className="text-xs font-bold text-primary">Datos básicos de la mascota</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Nombre" field="name" />
                    <Input label="Tipo" field="type" placeholder="Perro, Gato..." />
                    <Input label="Raza" field="breed" />
                    <Input label="Edad" field="age" placeholder="Ej: 3 años" />
                  </div>
                </div>
              )}
              <Textarea label="Dieta general" field="diet" placeholder="Pienso estándar, dieta especial, alergias..." rows={2} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Marca del pienso" field="foodBrand" placeholder="Royal Canin, Hill's..." />
                <Input label="Cantidad por toma" field="feedingAmount" placeholder="Ej: 150g" />
              </div>
              <Textarea label="Horario de comidas" field="feedingSchedule" placeholder="Ej: 8h mañana, 18h tarde" rows={2} />
              <Toggle label="¿Come pienso húmedo también?" field="wetFood" desc="Lata, sobre, comida casera..." />
              <Toggle label="¿Se le pueden dar premios?" field="treatAllowed" />
              {form.treatAllowed && (
                <Input label="Qué premios puede tomar" field="treatNotes" placeholder="Ej: solo chucherías de pollo, sin gluten" />
              )}
            </div>
          )}

          {/* ── SALUD ── */}
          {activeTab === 'salud' && (
            <div className="space-y-4">
              <Textarea label="Notas médicas generales" field="medicalNotes" placeholder="Alergias, condiciones crónicas, operaciones previas..." rows={3} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Nº de microchip" field="microchip" />
                <Input label="Cumpleaños (MM-DD)" field="birthday" placeholder="Ej: 03-15" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Veterinario habitual" field="vetName" />
                <Input label="Teléfono del vet." field="vetPhone" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Estado vacunación" field="vaccinationStatus" placeholder="Al día, pendiente..." />
                <Input label="Próxima vacuna" field="nextVaccinationDate" type="date" />
              </div>
              <Textarea label="Seguro médico / Info adicional" field="insuranceInfo" placeholder="Nº de póliza, aseguradora..." rows={2} />
              <div className="border-t border-outline-variant/10 pt-3">
                <p className="text-xs font-bold text-primary mb-3">Veterinario de emergencias (si es diferente)</p>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Nombre / Clínica" field="emergencyVetName" />
                  <Input label="Teléfono" field="emergencyVetPhone" />
                </div>
              </div>
            </div>
          )}

          {/* ── COMPORTAMIENTO ── */}
          {activeTab === 'comportamiento' && (
            <div className="space-y-4">
              <Textarea label="Notas de comportamiento generales" field="behaviorNotes" placeholder="Carácter, temperamento, cosas a tener en cuenta..." rows={3} />
              <Textarea label="Miedos conocidos" field="fearNotes" placeholder="Ej: miedo a los petardos, a la aspiradora, a desconocidos..." rows={2} />
              <div className="grid grid-cols-2 gap-3">
                <Select label="Nivel de ansiedad" field="anxietyLevel" options={ANXIETY_LEVELS} />
                <Select label="Nivel de ladrido / maullido" field="barkLevel" options={BARK_LEVELS} />
              </div>
              <Toggle
                label="Historial de mordeduras"
                field="biteHistory"
                desc="Marcar si ha mordido a personas o animales anteriormente"
              />
            </div>
          )}

          {/* ── PASEOS ── */}
          {activeTab === 'paseos' && (
            <div className="space-y-4">
              <Textarea label="Horario habitual de paseos" field="walkSchedule" placeholder="Ej: mañana a las 8h y tarde a las 19h" rows={2} />
              <Input label="Duración habitual del paseo" field="walkDuration" placeholder="Ej: 30 minutos, 1 hora..." />
              <Toggle
                label="¿Tira de la correa?"
                field="pullsLeash"
                desc="Marcar si tiene tendencia a tirar o arrastrar durante el paseo"
              />
              <Textarea label="Otras notas sobre paseos" field="walkNotes" placeholder="Ej: solo pasea con correa de flexi, le gusta el parque del río..." rows={2} />
            </div>
          )}

          {/* ── CONVIVENCIA ── */}
          {activeTab === 'convivencia' && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Socialización</p>
              <Toggle label="¿Se lleva bien con otros perros?" field="sociableWithDogs" />
              <Toggle label="¿Se lleva bien con gatos?" field="sociableWithCats" />
              <Toggle label="¿Se lleva bien con niños?" field="sociableWithKids" />
              <Textarea
                label="Con quién convive en casa"
                field="livesWith"
                placeholder="Ej: vive con otro perro (Labrador, 5 años), dos adultos y un niño de 7 años..."
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-outline-variant/10 px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          {error && (
            <p className="text-xs text-rose-600 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </p>
          )}
          {saved && (
            <p className="text-xs text-emerald-600 flex items-center gap-1.5 font-bold">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              ¡Ficha guardada correctamente!
            </p>
          )}
          {!error && !saved && <span />}
          <div className="flex gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container border border-outline-variant/20 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving
                ? <><span className="material-symbols-outlined text-sm animate-spin">sync</span>Guardando...</>
                : <><span className="material-symbols-outlined text-sm">save</span>Guardar ficha</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
