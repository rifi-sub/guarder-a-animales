import { useState, useEffect } from 'react';
import { API_BASE } from '../config';

const homeFeatures = [
  { icon: 'bed',     title: 'Habitación adaptada', desc: 'Una habitación de invitados preparada especialmente para los animales.' },
  { icon: 'gpp_good', title: 'Espacios seguros',   desc: 'Zonas interiores protegidas donde nada puede hacerles daño.' },
  { icon: 'toys',    title: 'Tiempo de juego',     desc: 'Estímulos y juego para mantenerlos activos, curiosos y felices.' },
  { icon: 'bedtime', title: 'Descanso tranquilo',  desc: 'Rincones cálidos y silenciosos para dormir sin estrés.' },
];

function MediaCarousel({ items, fallbackSrc, alt, className }) {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  if (!items || items.length === 0) {
    return <img src={fallbackSrc} alt={alt} className={className} />;
  }

  const item = items[current];
  const url = `${API_BASE}/api/media/file/${item.filename}`;

  const go = (idx) => {
    setFade(false);
    setTimeout(() => { setCurrent(idx); setFade(true); }, 150);
  };

  return (
    <div className="relative w-full h-full">
      <div className={`w-full h-full transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
        {item.type === 'video' ? (
          <video key={url} src={url} autoPlay muted loop playsInline className={className} />
        ) : (
          <img key={url} src={url} alt={item.caption || alt} className={className} />
        )}
      </div>
      {items.length > 1 && (
        <>
          <button
            onClick={() => go((current - 1 + items.length) % items.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button
            onClick={() => go((current + 1) % items.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {items.map((_, i) => (
              <button key={i} onClick={() => go(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-4' : 'bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function HomeSection() {
  const [mediaItems, setMediaItems] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/media/homesection`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setMediaItems(data))
      .catch(() => {});
  }, []);

  const fallbackSrc = `${API_BASE}/api/images/homesection`;

  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max-width mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1">
            <span className="text-xs font-bold uppercase tracking-widest text-terracota mb-4 block">EL HOGAR</span>
            <h2 className="font-display-lg text-headline-md md:text-5xl text-primary leading-tight mb-8">
              Un hogar de verdad, no jaulas
            </h2>
            <p className="text-body-lg text-on-surface-variant mb-12">
              Las mascotas que se quedan conmigo disfrutan de espacios reales de una casa: sitios cómodos para descansar, luz natural, plantas y compañía. Priorizo la calidad sobre la cantidad, con el máximo de atención en lugar del máximo de capacidad.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {homeFeatures.map((feat, idx) => (
                <div key={idx} className="p-6 bg-surface-container rounded-3xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-primary">{feat.icon}</span>
                    <h4 className="font-bold">{feat.title}</h4>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 md:p-8 bg-surface-container-low border border-outline-variant/20 rounded-[2rem]">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-terracota">gpp_maybe</span>
                <h3 className="font-bold text-lg text-primary">Convivencia responsable</h3>
              </div>
              <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
                <p>Convivo con dos gatos acostumbrados a compartir espacio con otros animales. Por ello, únicamente acepto mascotas compatibles con ellos para garantizar un ambiente tranquilo y seguro para todos.</p>
                <p>Considero que un buen cuidado empieza por respetar las rutinas de cada animal. Por eso sigo siempre las indicaciones de su familia respecto a alimentación, medicación, paseos, descanso y hábitos diarios, procurando que durante su estancia se sientan tranquilos, seguros y como en casa.</p>
                <p>En el caso de perros grandes, prefiero ofrecer paseos o cuidados a domicilio, ya que considero que es la opción que mejor se adapta a sus necesidades y bienestar.</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="rounded-3xl overflow-hidden aspect-square shadow-2xl">
              <MediaCarousel
                items={mediaItems}
                fallbackSrc={fallbackSrc}
                alt="Cozy pet care living room environment"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-10 -right-10 hidden xl:block bg-white/90 backdrop-blur p-8 rounded-3xl shadow-xl w-64">
              <p className="text-terracota font-bold text-lg">Máxima atención</p>
              <p className="text-sm text-on-surface-variant mt-2">No buscamos cantidad, buscamos que se sientan amados y seguros.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
