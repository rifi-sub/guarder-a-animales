import { useState, useEffect } from 'react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'https://alilyback.duckdns.org/eris';

function parseReviewMedia(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function resolveReviewMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  return `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;
}

const fallbackReviews = [
  { initials: 'MG', clientName: 'María G.', petName: 'Nube', petType: 'gata persa', rating: 5, text: '"Eris me mandaba fotos y vídeos cada día. Volví de viaje y mi gata estaba feliz y tranquila, como si no me hubiera ido. Confianza total."' },
  { initials: 'JR', clientName: 'Javier R.', petName: 'Toby', petType: 'conejo', rating: 5, text: '"Se nota que ama a los animales. La casa impecable y mi conejo cuidadísimo. Me transmitió una tranquilidad que no había sentido con nadie."' },
  { initials: 'LM', clientName: 'Laura M.', petName: 'Milo', petType: 'gato', rating: 5, text: '"Mi gato necesita medicación y Eris la administró sin problema. Muy responsable, cercana y comunicativa. Repetiré sin dudarlo."' },
  { initials: 'CP', clientName: 'Carlos P.', petName: 'Kira', petType: 'perra', rating: 5, text: '"Los paseos y las visitas fueron perfectos. Puntual, cariñosa y siempre atenta. Kira la recibe con una alegría que lo dice todo."' },
  { initials: 'AS', clientName: 'Ana S.', petName: 'Coco y Pelusa', petType: 'gatos', rating: 5, text: '"Dejar a dos gatos daba respeto, pero Eris lo hizo fácil. Limpieza, cariño y comunicación constante. Un segundo hogar de verdad."' },
  { initials: 'NB', clientName: 'Nuria B.', petName: 'Boli', petType: 'cobaya', rating: 5, text: '"Súper detallista con la alimentación y el enriquecimiento. Volvió más sociable y contento. Da gusto dejar a tu mascota en tan buenas manos."' }
];

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [lightbox, setLightbox] = useState(null); // { items: [...], index: number, author: string }

  useEffect(() => {
    fetch(`${API_BASE}/api/reviews`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setReviews(data.length > 0 ? data : fallbackReviews))
      .catch(() => setReviews(fallbackReviews));
  }, []);

  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low" id="reseñas">
      <div className="max-w-container-max-width mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-terracota mb-4 block">RESEÑAS</span>
          <h2 className="font-display-lg text-headline-md md:text-5xl text-primary leading-tight">
            Familias que ya confían en Eris
          </h2>
          <div className="flex items-center justify-center gap-1 mt-4 text-orange-400">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="ml-2 text-sm font-bold text-on-surface-variant">
              Cariño, limpieza y confianza en cada estancia
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev, index) => {
            const mediaItems = parseReviewMedia(rev.media);
            return (
              <div key={rev.id || index} className="bg-white p-8 rounded-[2rem] shadow-sm border border-outline-variant/10 relative flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-4xl text-primary/10 absolute top-6 left-6">format_quote</span>
                  <div className="flex items-center gap-0.5 mb-4 relative z-10">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-sm ${s <= rev.rating ? 'text-orange-400' : 'text-gray-200'}`}>★</span>
                    ))}
                  </div>
                  <p className="text-sm text-on-surface-variant italic mb-6 relative z-10">{rev.text}</p>

                  {mediaItems.length > 0 && (
                    <div className={`grid gap-2 mb-6 relative z-10 ${mediaItems.length === 1 ? 'grid-cols-1' : mediaItems.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                      {mediaItems.slice(0, 6).map((m, mIdx) => {
                        const src = resolveReviewMediaUrl(m.url);
                        const isVideo = m.type === 'VIDEO' || m.mimeType?.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv)$/i.test(m.url || '');
                        return (
                          <button
                            key={mIdx}
                            type="button"
                            onClick={() => setLightbox({ items: mediaItems, index: mIdx, author: rev.clientName })}
                            className={`relative group rounded-2xl overflow-hidden border border-outline-variant/15 bg-black/5 text-left ${mediaItems.length === 1 ? 'aspect-video' : 'aspect-square'}`}
                            title={isVideo ? 'Reproducir vídeo' : 'Ver foto en grande'}
                          >
                            {isVideo ? (
                              <video
                                src={src}
                                muted
                                playsInline
                                preload="metadata"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <img
                                src={src}
                                alt={`Estancia de ${rev.petName || rev.clientName}`}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            )}
                            {isVideo && (
                              <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                                <span className="w-10 h-10 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                                </span>
                              </div>
                            )}
                            {mIdx === 5 && mediaItems.length > 6 && (
                              <div className="absolute inset-0 bg-black/55 text-white font-bold text-sm flex items-center justify-center">
                                +{mediaItems.length - 6}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 border-t border-outline-variant/10 pt-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs tracking-tighter shrink-0">
                    {rev.initials || rev.clientName?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{rev.clientName}</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                      {rev.petName ? `con ${rev.petName}` : ''} {rev.petType ? `(${rev.petType})` : ''}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox para ver fotos y vídeos de las reseñas */}
      {lightbox && (() => {
        const current = lightbox.items[lightbox.index];
        const src = resolveReviewMediaUrl(current?.url);
        const isVideo = current?.type === 'VIDEO' || current?.mimeType?.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv)$/i.test(current?.url || '');
        const hasMultiple = lightbox.items.length > 1;
        return (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <div className="relative max-w-4xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="absolute -top-11 right-0 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
                aria-label="Cerrar"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              {isVideo ? (
                <video
                  key={src}
                  src={src}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[80vh] max-w-full rounded-2xl bg-black shadow-2xl"
                />
              ) : (
                <img
                  src={src}
                  alt={`Foto de reseña de ${lightbox.author}`}
                  className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl"
                />
              )}

              <div className="mt-4 flex items-center gap-4 text-white/90 text-xs font-medium">
                {hasMultiple && (
                  <button
                    type="button"
                    onClick={() => setLightbox(prev => ({ ...prev, index: (prev.index - 1 + prev.items.length) % prev.items.length }))}
                    className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span> Anterior
                  </button>
                )}
                <span>
                  Reseña de {lightbox.author}{hasMultiple ? ` · ${lightbox.index + 1} / ${lightbox.items.length}` : ''}
                </span>
                {hasMultiple && (
                  <button
                    type="button"
                    onClick={() => setLightbox(prev => ({ ...prev, index: (prev.index + 1) % prev.items.length }))}
                    className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors flex items-center gap-1"
                  >
                    Siguiente <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
}
