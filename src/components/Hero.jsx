import { useState, useEffect } from 'react';
import { API_BASE } from '../config';

export default function Hero() {
  const [mediaItems, setMediaItems] = useState([]);
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/media/hero`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setMediaItems(data))
      .catch(() => {});
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const goTo = (idx) => {
    setFade(false);
    setTimeout(() => { setCurrent(idx); setFade(true); }, 150);
  };

  const currentItem = mediaItems[current];
  const mediaUrl = currentItem
    ? `${API_BASE}/api/media/file/${currentItem.filename}`
    : `${API_BASE}/api/images/hero`;

  return (
    <section className="pt-40 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max-width mx-auto" id="inicio">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-16">
        <div className="space-y-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container w-fit rounded-full text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">location_on</span>
            <span className="text-xs font-semibold uppercase tracking-widest">Ontinyent, Valencia</span>
          </div>
          <h1 className="font-display-lg text-display-lg md:text-6xl text-primary leading-tight">
            Ellos felices,<br /><span className="text-terracota">tú tranquilo.</span>
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-lg">
            Cuidado personalizado para mascotas en Ontinyent. Un entorno seguro, tranquilo y lleno de cariño para que puedas marcharte con total confianza.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => scrollToSection('contacto')}
              className="bg-terracota text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-terracota/20 hover:-translate-y-1 transition-all"
            >
              <span className="material-symbols-outlined">favorite</span> Reservar una primera quedada
            </button>
            <button
              onClick={() => scrollToSection('servicios')}
              className="border border-outline-variant text-primary px-8 py-4 rounded-2xl font-bold hover:bg-surface-container transition-colors"
            >
              Ver servicios
            </button>
          </div>
          <div className="flex items-center gap-6 text-sm text-on-surface-variant">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Pocas plazas
            </span>
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">videocam</span> Fotos y vídeos a diario
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="hero-image-mask aspect-[4/5] bg-surface-container shadow-2xl relative overflow-hidden">
            {/* Media */}
            <div className={`w-full h-full transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
              {currentItem?.type === 'video' ? (
                <video key={mediaUrl} src={mediaUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
              ) : (
                <img key={mediaUrl} className="w-full h-full object-cover" src={mediaUrl} alt="Eris Pet Care Living Room" />
              )}
            </div>

            {/* Carousel controls */}
            {mediaItems.length > 1 && (
              <>
                <button
                  onClick={() => goTo((current - 1 + mediaItems.length) % mediaItems.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white flex items-center justify-center z-10"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button
                  onClick={() => goTo((current + 1) % mediaItems.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white flex items-center justify-center z-10"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {mediaItems.map((_, i) => (
                    <button key={i} onClick={() => goTo(i)} className={`h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`} />
                  ))}
                </div>
              </>
            )}

            {/* Floating Badges */}
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur p-3 rounded-2xl shadow-xl animate-bounce z-10" style={{ animationDuration: '3s' }}>
              <span className="material-symbols-outlined text-primary">eco</span>
            </div>
            <div className="absolute top-12 right-6 bg-white/95 backdrop-blur p-4 rounded-2xl shadow-xl flex items-center gap-3 z-10">
              <span className="material-symbols-outlined text-terracota" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              <span className="text-sm font-bold">Un segundo hogar</span>
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur p-4 rounded-2xl shadow-xl flex items-center gap-4 w-[80%] z-10">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-white">pets</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Nueva foto de Luna</p>
                <p className="text-sm font-bold">Durmiendo feliz</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
