const homeFeatures = [
  {
    icon: 'bed',
    title: 'Habitación adaptada',
    desc: 'Una habitación de invitados preparada especialmente para los animales.'
  },
  {
    icon: 'gpp_good',
    title: 'Espacios seguros',
    desc: 'Zonas interiores protegidas donde nada puede hacerles daño.'
  },
  {
    icon: 'toys',
    title: 'Tiempo de juego',
    desc: 'Estímulos y juego para mantenerlos activos, curiosos y felices.'
  },
  {
    icon: 'bedtime',
    title: 'Descanso tranquilo',
    desc: 'Rincones cálidos y silenciosos para dormir sin estrés.'
  }
];

import { API_BASE } from '../config';

export default function HomeSection() {
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
                <p>
                  Convivo con dos gatos acostumbrados a compartir espacio con otros animales. Por ello,
                  únicamente acepto mascotas compatibles con ellos para garantizar un ambiente tranquilo y
                  seguro para todos.
                </p>
                <p>
                  Considero que un buen cuidado empieza por respetar las rutinas de cada animal. Por eso sigo
                  siempre las indicaciones de su familia respecto a alimentación, medicación, paseos, descanso y
                  hábitos diarios, procurando que durante su estancia se sientan tranquilos, seguros y como en
                  casa.
                </p>
                <p>
                  En el caso de perros grandes, prefiero ofrecer paseos o cuidados a domicilio, ya que considero
                  que es la opción que mejor se adapta a sus necesidades y bienestar.
                </p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 relative">
            <div className="rounded-3xl overflow-hidden aspect-square shadow-2xl">
              <img
                className="w-full h-full object-cover"
                src={`${API_BASE}/api/images/homesection`}
                alt="Cozy pet care living room environment"
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
