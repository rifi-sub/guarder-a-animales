import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import { DEFAULT_TEXTS } from '../hooks/usePageTexts';

const SECTIONS = [
  { key: 'hero', label: 'Cabecera (Hero)', icon: 'image' },
  { key: 'about', label: 'Sobre Mí', icon: 'person' },
  { key: 'homesection', label: 'El Hogar', icon: 'home' },
  { key: 'pets', label: 'Mascotas', icon: 'pets' },
  { key: 'services', label: 'Servicios', icon: 'design_services' },
];

export default function AdminTexts() {
  const [texts, setTexts] = useState(JSON.parse(JSON.stringify(DEFAULT_TEXTS)));
  const [activeTab, setActiveTab] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetch(`${API_BASE}/api/settings`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        const loadedTexts = JSON.parse(JSON.stringify(DEFAULT_TEXTS));
        SECTIONS.forEach(s => {
          if (data[`text_${s.key}`]) {
            try {
              const parsed = JSON.parse(data[`text_${s.key}`]);
              loadedTexts[s.key] = { ...loadedTexts[s.key], ...parsed };
            } catch (e) {
              console.error(e);
            }
          }
        });
        setTexts(loadedTexts);
        setLoading(false);
      });
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const payload = {};
      SECTIONS.forEach(s => {
        payload[`text_${s.key}`] = JSON.stringify(texts[s.key]);
      });
      await fetch(`${API_BASE}/api/admin/settings`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('Error guardando los textos');
    } finally {
      setSaving(false);
    }
  };

  const updateText = (section, key, value) => {
    setTexts(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  // Helper for arrays of strings (paragraphs)
  const updateArrayString = (section, key, index, value) => {
    setTexts(prev => {
      const arr = [...prev[section][key]];
      arr[index] = value;
      return { ...prev, [section]: { ...prev[section], [key]: arr } };
    });
  };
  const addArrayString = (section, key) => {
    setTexts(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: [...prev[section][key], ''] }
    }));
  };
  const removeArrayString = (section, key, index) => {
    setTexts(prev => {
      const arr = prev[section][key].filter((_, i) => i !== index);
      return { ...prev, [section]: { ...prev[section], [key]: arr } };
    });
  };

  // Helper for arrays of objects
  const updateArrayObject = (section, arrayKey, index, field, value) => {
    setTexts(prev => {
      const arr = [...prev[section][arrayKey]];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [section]: { ...prev[section], [arrayKey]: arr } };
    });
  };
  const addArrayObject = (section, arrayKey, defaultObj) => {
    setTexts(prev => ({
      ...prev,
      [section]: { ...prev[section], [arrayKey]: [...prev[section][arrayKey], defaultObj] }
    }));
  };
  const removeArrayObject = (section, arrayKey, index) => {
    setTexts(prev => {
      const arr = prev[section][arrayKey].filter((_, i) => i !== index);
      return { ...prev, [section]: { ...prev[section], [arrayKey]: arr } };
    });
  };

  if (loading) return <div className="p-8 text-center text-on-surface-variant animate-pulse">Cargando textos...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-2xl">edit_document</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-primary">Textos de la Web</h2>
            <p className="text-sm text-on-surface-variant mt-0.5">Modifica los textos públicos de tu página web.</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          {saving ? <span className="material-symbols-outlined animate-spin text-xl">sync</span> : <span className="material-symbols-outlined text-xl">save</span>}
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {success && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-3 font-bold border border-emerald-200">
          <span className="material-symbols-outlined">check_circle</span>
          Textos guardados correctamente. Los cambios ya son visibles en la web.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {SECTIONS.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveTab(s.key)}
            className={`shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === s.key
                ? 'bg-primary text-white shadow-md'
                : 'bg-white border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/20 space-y-6">
        
        {activeTab === 'hero' && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-primary border-b pb-2">Sección Cabecera (Hero)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-xs font-bold text-on-surface-variant block mb-1">Ubicación (Badge superior)</label><input className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.hero.location} onChange={e => updateText('hero', 'location', e.target.value)} /></div>
              <div><label className="text-xs font-bold text-on-surface-variant block mb-1">Título principal</label><input className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.hero.title} onChange={e => updateText('hero', 'title', e.target.value)} /></div>
              <div><label className="text-xs font-bold text-on-surface-variant block mb-1">Subtítulo (destacado color)</label><input className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.hero.titleHighlight} onChange={e => updateText('hero', 'titleHighlight', e.target.value)} /></div>
              <div className="md:col-span-2"><label className="text-xs font-bold text-on-surface-variant block mb-1">Descripción</label><textarea className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" rows="3" value={texts.hero.description} onChange={e => updateText('hero', 'description', e.target.value)} /></div>
              <div><label className="text-xs font-bold text-on-surface-variant block mb-1">Texto botón primario</label><input className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.hero.buttonPrimary} onChange={e => updateText('hero', 'buttonPrimary', e.target.value)} /></div>
              <div><label className="text-xs font-bold text-on-surface-variant block mb-1">Texto botón secundario</label><input className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.hero.buttonSecondary} onChange={e => updateText('hero', 'buttonSecondary', e.target.value)} /></div>
              <div><label className="text-xs font-bold text-on-surface-variant block mb-1">Badge lateral 1 (ej. Pocas plazas)</label><input className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.hero.badge1} onChange={e => updateText('hero', 'badge1', e.target.value)} /></div>
              <div><label className="text-xs font-bold text-on-surface-variant block mb-1">Badge lateral 2 (ej. Fotos diario)</label><input className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.hero.badge2} onChange={e => updateText('hero', 'badge2', e.target.value)} /></div>
              <div><label className="text-xs font-bold text-on-surface-variant block mb-1">Etiqueta flotante foto 1</label><input className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.hero.floatingBadge1} onChange={e => updateText('hero', 'floatingBadge1', e.target.value)} /></div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1">Etiqueta flotante foto 2</label>
                <div className="flex gap-2">
                  <input className="w-1/2 p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.hero.floatingBadge2Title} onChange={e => updateText('hero', 'floatingBadge2Title', e.target.value)} />
                  <input className="w-1/2 p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.hero.floatingBadge2Desc} onChange={e => updateText('hero', 'floatingBadge2Desc', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'homesection' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-primary border-b pb-2">Sección "El Hogar"</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-on-surface-variant block mb-1">Etiqueta superior</label><input className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.homesection.tag} onChange={e => updateText('homesection', 'tag', e.target.value)} /></div>
                <div><label className="text-xs font-bold text-on-surface-variant block mb-1">Título principal</label><input className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.homesection.title} onChange={e => updateText('homesection', 'title', e.target.value)} /></div>
                <div className="md:col-span-2"><label className="text-xs font-bold text-on-surface-variant block mb-1">Descripción</label><textarea className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" rows="3" value={texts.homesection.description} onChange={e => updateText('homesection', 'description', e.target.value)} /></div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1">Etiqueta flotante en imagen (Título y Desc)</label>
                  <div className="flex gap-2">
                    <input className="w-1/2 p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.homesection.floatingBadge} onChange={e => updateText('homesection', 'floatingBadge', e.target.value)} />
                    <input className="w-1/2 p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.homesection.floatingBadgeDesc} onChange={e => updateText('homesection', 'floatingBadgeDesc', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-md text-primary">Características</h4>
              {texts.homesection.features.map((feat, i) => (
                <div key={i} className="flex gap-2 items-start bg-surface-container-low p-4 rounded-xl">
                  <input className="w-32 p-3 rounded-xl bg-white border border-outline-variant/20 outline-none" placeholder="Icono (Google)" value={feat.icon} onChange={e => updateArrayObject('homesection', 'features', i, 'icon', e.target.value)} />
                  <div className="flex-1 space-y-2">
                    <input className="w-full p-3 rounded-xl bg-white border border-outline-variant/20 outline-none" placeholder="Título" value={feat.title} onChange={e => updateArrayObject('homesection', 'features', i, 'title', e.target.value)} />
                    <input className="w-full p-3 rounded-xl bg-white border border-outline-variant/20 outline-none" placeholder="Descripción" value={feat.desc} onChange={e => updateArrayObject('homesection', 'features', i, 'desc', e.target.value)} />
                  </div>
                  <button onClick={() => removeArrayObject('homesection', 'features', i)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl"><span className="material-symbols-outlined">delete</span></button>
                </div>
              ))}
              <button onClick={() => addArrayObject('homesection', 'features', {icon: 'check', title: '', desc: ''})} className="text-primary font-bold text-sm flex items-center gap-1"><span className="material-symbols-outlined text-lg">add</span> Añadir característica</button>
            </div>

            <div className="space-y-4 pt-4 border-t border-outline-variant/10">
              <h4 className="font-bold text-md text-primary">Recuadro: {texts.homesection.convivenciaTitle}</h4>
              <input className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.homesection.convivenciaTitle} onChange={e => updateText('homesection', 'convivenciaTitle', e.target.value)} />
              {texts.homesection.convivenciaParagraphs.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <textarea className="flex-1 p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 outline-none focus:border-primary" rows="2" value={p} onChange={e => updateArrayString('homesection', 'convivenciaParagraphs', i, e.target.value)} />
                  <button onClick={() => removeArrayString('homesection', 'convivenciaParagraphs', i)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl"><span className="material-symbols-outlined">delete</span></button>
                </div>
              ))}
              <button onClick={() => addArrayString('homesection', 'convivenciaParagraphs')} className="text-primary font-bold text-sm flex items-center gap-1"><span className="material-symbols-outlined text-lg">add</span> Añadir párrafo</button>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-primary border-b pb-2">Sección "Sobre Mí"</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-on-surface-variant block mb-1">Etiqueta superior</label><input className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.about.badge} onChange={e => updateText('about', 'badge', e.target.value)} /></div>
                <div><label className="text-xs font-bold text-on-surface-variant block mb-1">Título principal</label><input className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.about.title} onChange={e => updateText('about', 'title', e.target.value)} /></div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1">Años experiencia (Flotante)</label>
                  <div className="flex gap-2">
                    <input className="w-1/3 p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.about.experienceYears} onChange={e => updateText('about', 'experienceYears', e.target.value)} />
                    <input className="w-2/3 p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.about.experienceText} onChange={e => updateText('about', 'experienceText', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-md text-primary">Párrafos principales</h4>
              {texts.about.paragraphs.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <textarea className="flex-1 p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 outline-none focus:border-primary" rows="2" value={p} onChange={e => updateArrayString('about', 'paragraphs', i, e.target.value)} />
                  <button onClick={() => removeArrayString('about', 'paragraphs', i)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl"><span className="material-symbols-outlined">delete</span></button>
                </div>
              ))}
              <button onClick={() => addArrayString('about', 'paragraphs')} className="text-primary font-bold text-sm flex items-center gap-1"><span className="material-symbols-outlined text-lg">add</span> Añadir párrafo</button>
            </div>

            <div className="space-y-4 pt-4 border-t border-outline-variant/10">
              <h4 className="font-bold text-md text-primary">Lista de características</h4>
              {texts.about.traits.map((trait, i) => (
                <div key={i} className="flex gap-2 items-start bg-surface-container-low p-4 rounded-xl">
                  <input className="w-32 p-3 rounded-xl bg-white border border-outline-variant/20 outline-none" placeholder="Icono" value={trait.icon} onChange={e => updateArrayObject('about', 'traits', i, 'icon', e.target.value)} />
                  <div className="flex-1 space-y-2">
                    <input className="w-full p-3 rounded-xl bg-white border border-outline-variant/20 outline-none" placeholder="Título" value={trait.title} onChange={e => updateArrayObject('about', 'traits', i, 'title', e.target.value)} />
                    <textarea className="w-full p-3 rounded-xl bg-white border border-outline-variant/20 outline-none" rows="2" placeholder="Texto" value={trait.text} onChange={e => updateArrayObject('about', 'traits', i, 'text', e.target.value)} />
                  </div>
                  <button onClick={() => removeArrayObject('about', 'traits', i)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl"><span className="material-symbols-outlined">delete</span></button>
                </div>
              ))}
              <button onClick={() => addArrayObject('about', 'traits', {icon: 'star', title: '', text: ''})} className="text-primary font-bold text-sm flex items-center gap-1"><span className="material-symbols-outlined text-lg">add</span> Añadir característica</button>
            </div>
          </div>
        )}

        {activeTab === 'pets' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-primary border-b pb-2">Sección "Mascotas"</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-on-surface-variant block mb-1">Etiqueta superior</label><input className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.pets.tag} onChange={e => updateText('pets', 'tag', e.target.value)} /></div>
                <div><label className="text-xs font-bold text-on-surface-variant block mb-1">Título principal</label><input className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.pets.title} onChange={e => updateText('pets', 'title', e.target.value)} /></div>
                <div className="md:col-span-2"><label className="text-xs font-bold text-on-surface-variant block mb-1">Descripción general</label><textarea className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" rows="3" value={texts.pets.description} onChange={e => updateText('pets', 'description', e.target.value)} /></div>
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-outline-variant/10">
              <h4 className="font-bold text-md text-primary">Listado de Mascotas</h4>
              {texts.pets.petData.map((pet, i) => (
                <div key={i} className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 space-y-4">
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold">Mascota {i + 1}</h5>
                    <button onClick={() => removeArrayObject('pets', 'petData', i)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl text-sm font-bold flex items-center gap-1"><span className="material-symbols-outlined">delete</span> Eliminar</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className="text-xs font-bold text-on-surface-variant block mb-1">Identificador (clave img)</label><input className="w-full p-3 rounded-xl bg-white border border-outline-variant/20 outline-none" value={pet.key} onChange={e => updateArrayObject('pets', 'petData', i, 'key', e.target.value)} /></div>
                    <div><label className="text-xs font-bold text-on-surface-variant block mb-1">Nombre</label><input className="w-full p-3 rounded-xl bg-white border border-outline-variant/20 outline-none" value={pet.name} onChange={e => updateArrayObject('pets', 'petData', i, 'name', e.target.value)} /></div>
                    <div><label className="text-xs font-bold text-on-surface-variant block mb-1">Info (Ej: Gata · 9 años)</label><input className="w-full p-3 rounded-xl bg-white border border-outline-variant/20 outline-none" value={pet.typeInfo} onChange={e => updateArrayObject('pets', 'petData', i, 'typeInfo', e.target.value)} /></div>
                    <div className="md:col-span-3"><label className="text-xs font-bold text-on-surface-variant block mb-1">Descripción corta (Tarjeta)</label><textarea className="w-full p-3 rounded-xl bg-white border border-outline-variant/20 outline-none" rows="2" value={pet.description} onChange={e => updateArrayObject('pets', 'petData', i, 'description', e.target.value)} /></div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant block mb-2">Descripción completa (Modal, párrafos)</label>
                    <div className="space-y-2">
                      {pet.fullDescription.map((descP, pIdx) => (
                        <div key={pIdx} className="flex gap-2">
                          <textarea className="flex-1 p-3 rounded-xl bg-white border border-outline-variant/20 outline-none" rows="2" value={descP} onChange={e => {
                            const newFullDesc = [...pet.fullDescription];
                            newFullDesc[pIdx] = e.target.value;
                            updateArrayObject('pets', 'petData', i, 'fullDescription', newFullDesc);
                          }} />
                          <button onClick={() => {
                            const newFullDesc = pet.fullDescription.filter((_, idx) => idx !== pIdx);
                            updateArrayObject('pets', 'petData', i, 'fullDescription', newFullDesc);
                          }} className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl"><span className="material-symbols-outlined">close</span></button>
                        </div>
                      ))}
                      <button onClick={() => {
                        updateArrayObject('pets', 'petData', i, 'fullDescription', [...pet.fullDescription, '']);
                      }} className="text-primary font-bold text-xs flex items-center gap-1 mt-1"><span className="material-symbols-outlined text-base">add</span> Añadir párrafo al modal</button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => addArrayObject('pets', 'petData', {key:'nuevo', name:'Nueva Mascota', typeInfo:'', description:'', fullDescription:[''], alt:''})} className="text-primary font-bold text-sm flex items-center gap-1"><span className="material-symbols-outlined text-lg">add</span> Añadir Mascota</button>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-primary border-b pb-2">Sección "Servicios"</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-on-surface-variant block mb-1">Etiqueta superior</label><input className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.services.tag} onChange={e => updateText('services', 'tag', e.target.value)} /></div>
                <div><label className="text-xs font-bold text-on-surface-variant block mb-1">Título principal</label><input className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" value={texts.services.title} onChange={e => updateText('services', 'title', e.target.value)} /></div>
                <div className="md:col-span-2"><label className="text-xs font-bold text-on-surface-variant block mb-1">Descripción</label><textarea className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/20 outline-none focus:border-primary" rows="2" value={texts.services.description} onChange={e => updateText('services', 'description', e.target.value)} /></div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-outline-variant/10">
              <h4 className="font-bold text-md text-primary">Lista de Servicios (Tarjetas)</h4>
              {texts.services.servicesList.map((srv, i) => (
                <div key={i} className="flex gap-2 items-start bg-surface-container-low p-4 rounded-xl">
                  <input className="w-32 p-3 rounded-xl bg-white border border-outline-variant/20 outline-none" placeholder="ID (ej: alojamiento)" value={srv.id} onChange={e => updateArrayObject('services', 'servicesList', i, 'id', e.target.value)} />
                  <input className="w-24 p-3 rounded-xl bg-white border border-outline-variant/20 outline-none" placeholder="Icono" value={srv.icon} onChange={e => updateArrayObject('services', 'servicesList', i, 'icon', e.target.value)} />
                  <div className="flex-1 space-y-2">
                    <input className="w-full p-3 rounded-xl bg-white border border-outline-variant/20 outline-none" placeholder="Título" value={srv.title} onChange={e => updateArrayObject('services', 'servicesList', i, 'title', e.target.value)} />
                    <textarea className="w-full p-3 rounded-xl bg-white border border-outline-variant/20 outline-none" rows="2" placeholder="Descripción" value={srv.desc} onChange={e => updateArrayObject('services', 'servicesList', i, 'desc', e.target.value)} />
                  </div>
                  <button onClick={() => removeArrayObject('services', 'servicesList', i)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl"><span className="material-symbols-outlined">delete</span></button>
                </div>
              ))}
              <button onClick={() => addArrayObject('services', 'servicesList', {id: 'nuevo', icon: 'star', title: '', desc: ''})} className="text-primary font-bold text-sm flex items-center gap-1"><span className="material-symbols-outlined text-lg">add</span> Añadir Servicio</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
