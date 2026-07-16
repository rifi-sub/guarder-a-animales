import { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE } from '../config';

// Secciones configurables de la web
const SECTIONS = [
  { key: 'hero',        label: 'Cabecera (Hero)',    icon: 'image',        desc: 'La imagen principal al entrar a la web.' },
  { key: 'about',       label: 'Sobre Mí',           icon: 'person',       desc: 'Tu foto de perfil en la sección de presentación.' },
  { key: 'homesection', label: 'Sección "El Hogar"', icon: 'home',         desc: 'La imagen o galería junto al texto del hogar.' },
  { key: 'arya',        label: 'Mascota Arya',       icon: 'pets',         desc: 'Foto o galería de la gata Arya.' },
  { key: 'mina',        label: 'Mascota Mina',       icon: 'pets',         desc: 'Foto o galería del gato Mina.' },
  { key: 'gallery',     label: 'Galería Extra',      icon: 'photo_library',desc: 'Contenido adicional no asignado a ninguna sección.' },
];

// Modos disponibles por sección
const MODES = [
  { key: 'single',   label: 'Imagen única',  icon: 'image',       desc: 'Muestra el primer archivo subido.' },
  { key: 'carousel', label: 'Carrusel',      icon: 'view_carousel',desc: 'Pasa entre los archivos con flechas.' },
  { key: 'gallery',  label: 'Galería',       icon: 'grid_view',   desc: 'Mosaico donde se ven todos a la vez.' },
];

function UploadZone({ section, token, onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState([]);
  const inputRef = useRef();

  const handleFiles = async (files) => {
    if (!files?.length) return;
    const list = Array.from(files).map(f => ({ name: f.name, status: 'pending' }));
    setProgress(list);

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      setProgress(p => p.map((x, idx) => idx === i ? { ...x, status: 'uploading' } : x));
      const fd = new FormData();
      fd.append('file', f);
      fd.append('section', section);
      try {
        const res = await fetch(`${API_BASE}/api/admin/media`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        setProgress(p => p.map((x, idx) => idx === i ? { ...x, status: res.ok ? 'done' : 'error' } : x));
      } catch {
        setProgress(p => p.map((x, idx) => idx === i ? { ...x, status: 'error' } : x));
      }
    }
    await onUploaded();
    setTimeout(() => setProgress([]), 2500);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-2xl transition-all cursor-pointer ${dragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-outline-variant/30 hover:border-primary/40 hover:bg-surface-container-low/50'}`}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" multiple accept="image/*,video/mp4,video/webm,video/quicktime" className="hidden" onChange={e => handleFiles(e.target.files)} />

      {progress.length > 0 ? (
        <div className="p-4 space-y-1.5">
          {progress.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className={`material-symbols-outlined text-sm ${f.status === 'done' ? 'text-emerald-500' : f.status === 'error' ? 'text-rose-500' : f.status === 'uploading' ? 'text-primary animate-spin' : 'text-outline-variant'}`}>
                {f.status === 'done' ? 'check_circle' : f.status === 'error' ? 'error' : f.status === 'uploading' ? 'sync' : 'schedule'}
              </span>
              <span className="flex-1 truncate font-medium">{f.name}</span>
              <span className={`font-bold ${f.status === 'done' ? 'text-emerald-600' : f.status === 'error' ? 'text-rose-600' : 'text-primary'}`}>
                {f.status === 'done' ? '¡Listo!' : f.status === 'error' ? 'Error' : f.status === 'uploading' ? 'Subiendo…' : 'Pendiente'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${dragging ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
            <span className="material-symbols-outlined text-lg">{dragging ? 'file_upload' : 'add_photo_alternate'}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">{dragging ? 'Suelta para subir' : 'Añadir archivos'}</p>
            <p className="text-xs text-on-surface-variant">Arrastra o haz clic · Fotos y vídeos</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MediaItem({ item, token, onDelete, onDragStart, onDragEnd, onDragOver, isDragging }) {
  const [confirm, setConfirm] = useState(false);
  const url = `${API_BASE}/api/media/file/${item.filename}`;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm) { setConfirm(true); setTimeout(() => setConfirm(false), 3000); return; }
    await fetch(`${API_BASE}/api/admin/media/${item.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    onDelete(item.id);
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      className={`relative group aspect-square rounded-xl overflow-hidden bg-surface-container cursor-grab active:cursor-grabbing border border-outline-variant/10 transition-all ${isDragging ? 'opacity-40 scale-95' : 'hover:shadow-md'}`}
    >
      {item.type === 'video' ? (
        <video src={url} muted playsInline preload="metadata" className="w-full h-full object-cover" />
      ) : (
        <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
      )}

      {/* Type badge */}
      {item.type === 'video' && (
        <div className="absolute top-1.5 left-1.5 bg-purple-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
          <span className="material-symbols-outlined text-[11px]">videocam</span>
        </div>
      )}

      {/* Drag hint */}
      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black/40 rounded-md p-0.5">
          <span className="material-symbols-outlined text-white text-[13px]">drag_indicator</span>
        </div>
      </div>

      {/* Delete button */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end justify-center pb-2">
        <button
          onClick={handleDelete}
          className={`opacity-0 group-hover:opacity-100 transition-all text-[11px] font-black px-3 py-1.5 rounded-lg ${confirm ? 'bg-rose-600 text-white scale-110' : 'bg-white/90 text-rose-600 hover:bg-rose-600 hover:text-white'}`}
        >
          {confirm ? '¿Borrar?' : <span className="material-symbols-outlined text-[14px]">delete</span>}
        </button>
      </div>
    </div>
  );
}

function SectionCard({ section, token, sectionMode, allItems, onModeChange, onItemsChange }) {
  const items = allItems.filter(i => i.section === section.key);
  const mode  = sectionMode || 'single';
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [savingMode, setSavingMode] = useState(false);

  const handleModeChange = async (newMode) => {
    setSavingMode(true);
    try {
      await fetch(`${API_BASE}/api/admin/settings`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ [`section_mode_${section.key}`]: newMode }),
      });
      onModeChange(section.key, newMode);
    } finally {
      setSavingMode(false);
    }
  };

  const handleDeleteItem = (id) => {
    onItemsChange(prev => prev.filter(i => i.id !== id));
  };

  const handleDragEnd = async () => {
    if (dragId && dragOverId && dragId !== dragOverId) {
      const fromIdx = items.findIndex(i => i.id === dragId);
      const toIdx   = items.findIndex(i => i.id === dragOverId);
      if (fromIdx !== -1 && toIdx !== -1) {
        const reordered = [...items];
        const [moved] = reordered.splice(fromIdx, 1);
        reordered.splice(toIdx, 0, moved);
        const payload = reordered.map((item, idx) => ({ id: item.id, order: idx }));
        onItemsChange(prev => {
          const withoutSection = prev.filter(i => i.section !== section.key);
          return [...withoutSection, ...reordered.map((item, idx) => ({ ...item, order: idx }))];
        });
        fetch(`${API_BASE}/api/admin/media/reorder`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: payload }),
        });
      }
    }
    setDragId(null);
    setDragOverId(null);
  };

  return (
    <div className="bg-white rounded-3xl border border-outline-variant/20 shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-4 p-5 border-b border-outline-variant/10">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-lg">{section.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-primary text-base">{section.label}</h3>
          <p className="text-xs text-on-surface-variant truncate">{section.desc}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${items.length > 0 ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
            {items.length} {items.length === 1 ? 'archivo' : 'archivos'}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Mode selector */}
        <div>
          <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Modo de presentación</p>
          <div className="grid grid-cols-3 gap-2">
            {MODES.map(m => (
              <button
                key={m.key}
                onClick={() => handleModeChange(m.key)}
                disabled={savingMode}
                title={m.desc}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                  mode === m.key
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-outline-variant/20 text-on-surface-variant hover:border-primary/30 hover:text-primary hover:bg-surface-container-low'
                }`}
              >
                <span className={`material-symbols-outlined text-2xl ${mode === m.key ? '' : 'text-outline-variant'}`} style={mode === m.key ? { fontVariationSettings: "'FILL' 1" } : {}}>{m.icon}</span>
                <span className="text-[11px] font-bold leading-tight text-center">{m.label}</span>
              </button>
            ))}
          </div>
          {items.length <= 1 && mode !== 'single' && (
            <p className="mt-2 text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">info</span>
              Sube al menos 2 archivos para ver este modo en acción.
            </p>
          )}
        </div>

        {/* Media grid */}
        {items.length > 0 && (
          <div>
            <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">
              Archivos · <span className="normal-case font-normal">Arrastra para reordenar</span>
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {items.map(item => (
                <MediaItem
                  key={item.id}
                  item={item}
                  token={token}
                  onDelete={handleDeleteItem}
                  isDragging={dragId === item.id}
                  onDragStart={() => setDragId(item.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={e => { e.preventDefault(); setDragOverId(item.id); }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Upload zone */}
        <UploadZone section={section.key} token={token} onUploaded={async () => {
          const res = await fetch(`${API_BASE}/api/admin/media`, { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) onItemsChange(await res.json());
        }} />
      </div>
    </div>
  );
}

export default function AdminImages() {
  const [allItems, setAllItems] = useState([]);
  const [sectionModes, setSectionModes] = useState({});
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [mediaRes, settingsRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/media`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/settings`),
        ]);
        if (mediaRes.ok) setAllItems(await mediaRes.json());
        if (settingsRes.ok) {
          const s = await settingsRes.json();
          const modes = {};
          SECTIONS.forEach(sec => {
            if (s[`section_mode_${sec.key}`]) modes[sec.key] = s[`section_mode_${sec.key}`];
          });
          setSectionModes(modes);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleModeChange = useCallback((sectionKey, mode) => {
    setSectionModes(prev => ({ ...prev, [sectionKey]: mode }));
  }, []);

  const totalFiles = allItems.length;

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-3xl h-64 animate-pulse border border-outline-variant/20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/20 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-2xl">tune</span>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-primary">Apariencia e Imágenes</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Para cada sección: sube los archivos y elige cómo presentarlos. Los cambios se aplican inmediatamente en la web.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-black text-primary">{totalFiles}</p>
          <p className="text-xs text-on-surface-variant">archivos totales</p>
        </div>
      </div>

      {/* One card per section */}
      {SECTIONS.map(section => (
        <SectionCard
          key={section.key}
          section={section}
          token={token}
          sectionMode={sectionModes[section.key] || 'single'}
          allItems={allItems}
          onModeChange={handleModeChange}
          onItemsChange={setAllItems}
        />
      ))}
    </div>
  );
}
