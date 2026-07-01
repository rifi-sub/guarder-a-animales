const services = [
  {
    icon: 'home',
    title: 'Guardería en mi hogar',
    desc: 'Tu mascota se queda en casa, en un ambiente familiar, seguro y siempre acompañada.'
  },
  {
    icon: 'apartment',
    title: 'Cuidado a domicilio',
    desc: 'Voy a tu casa para cuidar de tu mascota en su propio entorno de siempre.'
  },
  {
    icon: 'notifications',
    title: 'Visitas',
    desc: 'Visitas puntuales para dar de comer, jugar, limpiar y hacer compañía.'
  },
  {
    icon: 'directions_walk',
    title: 'Paseos',
    desc: 'Paseos tranquilos y adaptados al ritmo y carácter de tu perro.'
  },
  {
    icon: 'pill',
    title: 'Administración de medicación',
    desc: 'Experiencia dando medicación, con especial cuidado y paciencia en gatos.'
  },
  {
    icon: 'photo_camera',
    title: 'Fotos y vídeos diarios',
    desc: 'Recibes actualizaciones cada día para verle feliz donde estés.'
  },
  {
    icon: 'potted_plant',
    title: 'Enriquecimiento ambiental',
    desc: 'Juego, estímulos y descanso para que su estancia sea plena y equilibrada.'
  },
  {
    icon: 'favorite',
    title: 'Cuidados personalizados',
    desc: 'Cada mascota es única: adapto rutinas, comida y mimos a sus necesidades.'
  }
];

const welcomePets = ['Gatos', 'Conejos', 'Cobayas', 'Hámsters', 'Peces'];
const serviceRules = [
  'Los perros se aceptan principalmente para visitas a domicilio y paseos.',
  'Aves y reptiles se valoran de forma individual según cada caso.',
  'Por el momento no se aceptan hurones.'
];

export default function Services() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-lowest" id="servicios">
      <div className="max-w-container-max-width mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-terracota mb-4 block">SERVICIOS</span>
          <h2 className="font-display-lg text-headline-md md:text-5xl text-primary leading-tight">
            Todo lo que tu mascota necesita para sentirse en casa
          </h2>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto mt-6">
            Servicios pensados con calma y cariño, siempre con atención individual y comunicación constante contigo.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {services.map((service, index) => (
            <div key={index} className="service-card p-8 bg-surface-container-low rounded-3xl border border-outline-variant/10">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <span className="material-symbols-outlined text-primary">{service.icon}</span>
              </div>
              <h4 className="text-xl font-bold text-primary mb-3">{service.title}</h4>
              <p className="text-sm text-on-surface-variant">{service.desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-surface-container-low rounded-[2rem] p-10 flex flex-col md:flex-row justify-between items-center gap-12 border border-outline-variant/20">
          <div className="space-y-6 flex-1">
            <h4 className="text-2xl font-bold text-primary">Mascotas bienvenidas en casa</h4>
            <div className="flex flex-wrap gap-3">
              {welcomePets.map((pet, idx) => (
                <span key={idx} className="px-6 py-2 bg-white rounded-full border border-outline-variant/30 text-sm font-semibold">
                  ✓ {pet}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-4 text-sm text-on-surface-variant border-l border-outline-variant/30 pl-10 hidden md:block">
            {serviceRules.map((rule, idx) => (
              <p key={idx} className="flex items-center gap-3">○ {rule}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
