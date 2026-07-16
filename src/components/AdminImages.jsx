import { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE } from '../config';

const SECTIONS = [
  { key: 'all',         label: 'Todo',               icon: 'grid_view' },
  { key: 'hero',        label: 'Cabecera (Hero)',     icon: 'image' },
  { key: 'about',       label: 'Sobre Mí',           icon: 'person' },
  { key: 'homesection', label: 'Sección Intermedia',  icon: 'home' },
  { key: 'arya',        label: 'Mascota Arya',        icon: 'pets' },
  { key: 'mina',        label: 'Mascota Mina',        icon: 'pets' },
  { key: 'gallery',     label: 'Galería Libre',       icon: 'photo_library' },
];

const SECTION_LABELS = Object.fromEntries(SECTIONS.filter(s => s.key !== 'all').map(s => [s.key, s.label]));

function MediaThumb({ item, onDelete, onReassign, onCaptionSave, isDragging, onDragStart, onDragEnd, onDragOver }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showReassign, setShowReassign] = useState(false);
  const [editCaption, setEditCaption] = useState(false);
  const [caption, setCaption] = useState(item.caption || '');
  const url = `${API_BASE}/api/media/file/${item.filename}`;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      className={`relative group rounded-2xl overflow-hidden bg-surface-container border border-outline-variant/20 shadow-sm transition-all duration-200 ${isDragging ? 'opacity-40 scale-95' : 'hover:shadow-lg hover:-translate-y-0.5'} cursor-grab active:cursor-grabbing`}
    >
      {/* Thumbnail */}
      <div className="aspect-square w-full bg-surface-container-low">
        {item.type === 'video' ? (
          <video src={url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
        ) : (
          <img src={url} alt={item.caption || item.section} className="w-full h-full object-cover" loading="lazy" />
        )}
      </div>

      {/* Type badge */}
      <div className="absolute top-2 left-2 flex gap-1">
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${item.type === 'video' ? 'bg-purple-600 text-white' : 'bg-white/90 text-on-surface backdrop-blur-sm'}`}>
          <span className="material-symbols-outlined text-[12px]">{item.type === 'video' ? 'videocam' : 'photo'}</span>
          {item.type === 'video' ? 'Vídeo' : 'Foto'}
        </span>
      </div>

      {/* Drag handle hint */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-1">
          <span className="material-symbols-outlined text-white text-[14px]">drag_indicator</span>
        </div>
      </div>

      {/* Actions overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 gap-2">
        
        {/* Caption */}
        {editCaption ? (
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <input
              autoFocus
              value={caption}
              onChange={e => setCaption(e.target.value)}
              className="flex-1 text-[11px] bg-white/95 rounded-lg px-2 py-1 outline-none text-on-surface font-medium"
              placeholder="Descripción..."
              onKeyDown={e => {
                if (e.key === 'Enter') { onCaptionSave(item.id, caption); setEditCaption(false); }
                if (e.key === 'Escape') setEditCaption(false);
              }}
            />
            <button onClick={() => { onCaptionSave(item.id, caption); setEditCaption(false); }} className="bg-primary text-white rounded-lg px-2 text-[11px] font-bold">✓</button>
          </div>
        ) : (
          <button onClick={() => setEditCaption(true)} className="text-left text-[11px] text-white/80 hover:text-white truncate">
            {item.caption || <span className="italic opacity-60">Añadir descripción...</span>}
          </button>
        )}

        <div className="flex gap-1.5">
          {/* Reassign section */}
          {showReassign ? (
            <select
              autoFocus
              className="flex-1 text-[11px] bg-white/95 rounded-lg px-2 py-1 outline-none font-medium text-on-surface"
              defaultValue={item.section}
              onChange={e => { onReassign(item.id, e.target.value); setShowReassign(false); }}
              onBlur={() => setShowReassign(false)}
            >
              {SECTIONS.filter(s => s.key !== 'all').map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => setShowReassign(true)}
              className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[13px]">move_item</span>
              {SECTION_LABELS[item.section] || item.section}
            </button>
          )}

          {/* Delete */}
          {confirmDelete ? (
            <div className="flex gap-1">
              <button onClick={() => onDelete(item.id)} className="bg-rose-600 text-white text-[11px] font-black px-2 py-1.5 rounded-lg">¡Borrar!</button>
              <button onClick={() => setConfirmDelete(false)} className="bg-white/20 text-white text-[11px] px-2 py-1.5 rounded-lg">No</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="bg-rose-500/80 hover:bg-rose-600 backdrop-blur-sm text-white p-1.5 rounded-lg transition-colors"
              title="Eliminar"
            >
              <span className="material-symbols-outlined text-[14px]">delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminImages() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [dragItemId, setDragItemId] = useState(null);
  const [dragOverItemId, setDragOverItemId] = useState(null);
  const [uploadSection, setUploadSection] = useState('gallery');
  const fileInputRef = useRef();
  const token = localStorage.getItem('adminToken');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/media`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const displayedItems = activeSection === 'all'
    ? items
    : items.filter(i => i.section === activeSection);

  // Count per section for badges
  const countBySec = items.reduce((acc, i) => { acc[i.section] = (acc[i.section] || 0) + 1; return acc; }, {});

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const progList = Array.from(files).map(f => ({ name: f.name, status: 'pending' }));
    setUploadProgress(progList);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fd = new FormData();
      fd.append('file', file);
      fd.append('section', uploadSection);

      setUploadProgress(p => p.map((x, idx) => idx === i ? { ...x, status: 'uploading' } : x));

      try {
        const res = await fetch(`${API_BASE}/api/admin/media`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fd
        });
        if (res.ok) {
          setUploadProgress(p => p.map((x, idx) => idx === i ? { ...x, status: 'done' } : x));
        } else {
          setUploadProgress(p => p.map((x, idx) => idx === i ? { ...x, status: 'error' } : x));
        }
      } catch {
        setUploadProgress(p => p.map((x, idx) => idx === i ? { ...x, status: 'error' } : x));
      }
    }

    setUploading(false);
    await fetchItems();
    setTimeout(() => setUploadProgress([]), 3000);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDelete = async (id) => {
    await fetch(`${API_BASE}/api/admin/media/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleReassign = async (id, section) => {
    await fetch(`${API_BASE}/api/admin/media/${id}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ section })
    });
    setItems(prev => prev.map(i => i.id === id ? { ...i, section } : i));
  };

  const handleCaptionSave = async (id, caption) => {
    await fetch(`${API_BASE}/api/admin/media/${id}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption })
    });
    setItems(prev => prev.map(i => i.id === id ? { ...i, caption } : i));
  };

  // Drag-to-reorder within displayed items
  const handleItemDragStart = (id) => setDragItemId(id);
  const handleItemDragEnd = async () => {
    if (dragItemId && dragOverItemId && dragItemId !== dragOverItemId) {
      // Reorder in the current section view
      const sectionItems = [...displayedItems];
      const fromIdx = sectionItems.findIndex(i => i.id === dragItemId);
      const toIdx   = sectionItems.findIndex(i => i.id === dragOverItemId);
      if (fromIdx !== -1 && toIdx !== -1) {
        const reordered = [...sectionItems];
        const [moved] = reordered.splice(fromIdx, 1);
        reordered.splice(toIdx, 0, moved);
        const payload = reordered.map((item, idx) => ({ id: item.id, order: idx }));
        // Update UI optimistically
        const newItems = items.map(i => {
          const p = payload.find(p => p.id === i.id);
          return p ? { ...i, order: p.order } : i;
        });
        setItems(newItems);
        // Persist
        await fetch(`${API_BASE}/api/admin/media/reorder`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: payload })
        });
      }
    }
    setDragItemId(null);
    setDragOverItemId(null);
  };

  const sectionItemsCount = activeSection === 'all' ? items.length : displayedItems.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/20">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-2xl">photo_library</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-primary">Biblioteca de Medios</h2>
            <p className="text-sm text-on-surface-variant mt-0.5">Sube fotos y vídeos, asígnalos a secciones de la web y reordénalos arrastrando.</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-primary">{items.length}</p>
            <p className="text-xs text-on-surface-variant">archivos</p>
          </div>
        </div>

        {/* Upload zone */}
        <div
          className={`border-2 border-dashed rounded-2xl transition-all duration-200 ${dragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-outline-variant/40 hover:border-primary/50 hover:bg-surface-container-low/50'}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{ cursor: uploading ? 'default' : 'pointer' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />

          {uploadProgress.length > 0 ? (
            <div className="p-5 space-y-2">
              {uploadProgress.map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className={`material-symbols-outlined text-base ${f.status === 'done' ? 'text-emerald-500' : f.status === 'error' ? 'text-rose-500' : f.status === 'uploading' ? 'text-primary animate-spin' : 'text-on-surface-variant'}`}>
                    {f.status === 'done' ? 'check_circle' : f.status === 'error' ? 'error' : f.status === 'uploading' ? 'sync' : 'hourglass_empty'}
                  </span>
                  <span className="flex-1 truncate font-medium">{f.name}</span>
                  <span className={`text-xs font-bold ${f.status === 'done' ? 'text-emerald-600' : f.status === 'error' ? 'text-rose-600' : 'text-primary'}`}>
                    {f.status === 'done' ? '¡Subido!' : f.status === 'error' ? 'Error' : f.status === 'uploading' ? 'Subiendo...' : 'En cola'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 px-6 gap-3 text-center">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${dragOver ? 'bg-primary text-white scale-110' : 'bg-primary/10 text-primary'}`}>
                <span className="material-symbols-outlined text-2xl">{dragOver ? 'file_upload' : 'add_photo_alternate'}</span>
              </div>
              <div>
                <p className="font-bold text-on-surface">{dragOver ? 'Suelta para subir' : 'Arrastra aquí tus archivos'}</p>
                <p className="text-sm text-on-surface-variant mt-0.5">o haz clic para seleccionarlos · Fotos y vídeos hasta 200 MB</p>
              </div>
            </div>
          )}
        </div>

        {/* Upload section selector */}
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Subir a:</span>
          <div className="flex flex-wrap gap-2">
            {SECTIONS.filter(s => s.key !== 'all').map(s => (
              <button
                key={s.key}
                onClick={() => setUploadSection(s.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  uploadSection === s.key
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/40 hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section filter tabs + grid */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/20">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {SECTIONS.map(s => {
            const count = s.key === 'all' ? items.length : (countBySec[s.key] || 0);
            return (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                  activeSection === s.key
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'border-outline-variant/20 text-on-surface-variant hover:border-primary/30 hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">{s.icon}</span>
                {s.label}
                {count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${activeSection === s.key ? 'bg-white/25 text-white' : 'bg-primary/10 text-primary'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-surface-container-low animate-pulse" />
            ))}
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-3xl bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-outline-variant/50">image_not_supported</span>
            </div>
            <p className="font-bold text-on-surface-variant">No hay medios en esta sección.</p>
            <p className="text-sm text-on-surface-variant/60">Sube archivos usando la zona de arriba y asígnalos aquí.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-on-surface-variant mb-4 font-medium">
              <span className="material-symbols-outlined text-[13px] align-middle mr-1">drag_indicator</span>
              Arrastra para reordenar · Pasa el ratón sobre una imagen para ver opciones
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {displayedItems.map(item => (
                <MediaThumb
                  key={item.id}
                  item={item}
                  onDelete={handleDelete}
                  onReassign={handleReassign}
                  onCaptionSave={handleCaptionSave}
                  isDragging={dragItemId === item.id}
                  onDragStart={() => handleItemDragStart(item.id)}
                  onDragEnd={handleItemDragEnd}
                  onDragOver={e => { e.preventDefault(); setDragOverItemId(item.id); }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Info box */}
      <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5 flex gap-4">
        <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5">info</span>
        <div className="text-sm text-on-surface-variant space-y-1">
          <p><strong className="text-on-surface">¿Cómo funciona la asignación?</strong></p>
          <p>Cada archivo está asignado a una sección de la web. Si una sección tiene <strong>un solo archivo</strong>, se muestra directamente. Si tiene <strong>varios</strong>, se muestra como galería o carrusel automáticamente.</p>
          <p>La sección <strong>"Galería Libre"</strong> es para archivos extra que no van en ninguna sección específica pero quieres tener disponibles.</p>
        </div>
      </div>
    </div>
  );
}
