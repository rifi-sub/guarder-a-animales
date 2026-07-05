import React, { useState } from 'react';
import { API_BASE } from '../config';

const IMAGE_SECTIONS = [
  { key: 'hero', title: 'Cabecera Principal (Hero)', description: 'Imagen de fondo de la primera sección de la web.' },
  { key: 'about', title: 'Sección Sobre Mí', description: 'Tu foto de perfil en la sección Sobre Mí.' },
  { key: 'homesection', title: 'Sección Intermedia', description: 'Imagen grande debajo de los servicios.' },
  { key: 'arya', title: 'Foto de Arya', description: 'Imagen de la gata Arya en la sección Mis Mascotas.' },
  { key: 'mina', title: 'Foto de Mina', description: 'Imagen del gato Mina en la sección Mis Mascotas.' },
];

export default function AdminImages() {
  const [uploading, setUploading] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(key);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/api/images/${key}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      setSuccess(key);
      
      // Refresh the image by forcing a reload with a timestamp query param
      const imgElements = document.querySelectorAll(`img[data-key="${key}"]`);
      imgElements.forEach(img => {
        const currentSrc = img.src.split('?')[0];
        img.src = `${currentSrc}?t=${new Date().getTime()}`;
      });

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Hubo un problema al subir la imagen.');
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/30">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-2xl">image</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-primary">Apariencia e Imágenes</h2>
          <p className="text-on-surface-variant">Modifica las fotos que se muestran en la web pública.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {IMAGE_SECTIONS.map((section) => (
          <div key={section.key} className="border border-outline-variant/30 rounded-2xl p-5 flex flex-col">
            <h3 className="text-lg font-bold text-primary">{section.title}</h3>
            <p className="text-sm text-on-surface-variant mt-1 mb-4">{section.description}</p>
            
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-container mb-4 flex-grow border border-outline-variant/20">
              <img 
                data-key={section.key}
                src={`${API_BASE}/api/images/${section.key}`} 
                alt={section.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                  e.target.parentElement.innerHTML = '<span class="text-on-surface-variant/50 text-sm">Sin imagen</span>';
                }}
              />
            </div>

            <div className="mt-auto pt-4 border-t border-outline-variant/20 flex items-center justify-between">
              <div className="text-sm font-medium">
                {uploading === section.key ? (
                  <span className="text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-base animate-spin">sync</span> Subiendo...
                  </span>
                ) : success === section.key ? (
                  <span className="text-emerald-600 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">check_circle</span> ¡Actualizada!
                  </span>
                ) : (
                  <span className="text-on-surface-variant">JPG o PNG</span>
                )}
              </div>
              <label className="cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-base">upload</span>
                Cambiar
                <input 
                  type="file" 
                  accept="image/jpeg, image/png"
                  className="hidden" 
                  onChange={(e) => handleFileChange(e, section.key)}
                  disabled={uploading === section.key}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
