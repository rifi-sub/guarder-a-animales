import { useState, useEffect } from 'react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'https://alilyback.duckdns.org/eris';

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
          {reviews.map((rev, index) => (
            <div key={index} className="bg-white p-8 rounded-[2rem] shadow-sm border border-outline-variant/10 relative">
              <span className="material-symbols-outlined text-4xl text-primary/10 absolute top-6 left-6">format_quote</span>
              <div className="flex items-center gap-0.5 mb-4 relative z-10">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={`text-sm ${s <= rev.rating ? 'text-orange-400' : 'text-gray-200'}`}>★</span>
                ))}
              </div>
              <p className="text-sm text-on-surface-variant italic mb-8 relative z-10">{rev.text}</p>
              <div className="flex items-center gap-4 border-t border-outline-variant/10 pt-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs tracking-tighter">
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
          ))}
        </div>
      </div>
    </section>
  );
}
