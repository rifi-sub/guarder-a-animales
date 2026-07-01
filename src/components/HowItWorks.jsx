const steps = [
  {
    num: 1,
    icon: 'chat_bubble',
    title: 'Contacto',
    desc: 'Me escribes contándome sobre tu mascota, tus fechas y lo que necesitas.'
  },
  {
    num: 2,
    icon: 'coffee',
    title: 'Primera quedada',
    desc: 'Nos conocemos sin compromiso para que todo fluya con confianza.'
  },
  {
    num: 3,
    icon: 'pets',
    title: 'Conozco a tu mascota',
    desc: 'Aprendo sus rutinas, gustos y manías para cuidarla a su medida.'
  },
  {
    num: 4,
    icon: 'photo_camera',
    title: 'Recibes fotos y vídeos',
    desc: 'Te mantengo al día con actualizaciones para que estés tranquilo.'
  },
  {
    num: 5,
    icon: 'home_app_logo',
    title: 'Un hogar seguro',
    desc: 'Tu mascota disfruta de un entorno cálido, cuidado y lleno de cariño.'
  }
];

export default function HowItWorks() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max-width mx-auto">
        <div className="text-center mb-24">
          <span className="text-xs font-bold uppercase tracking-widest text-terracota mb-4 block">CÓMO FUNCIONA</span>
          <h2 className="font-display-lg text-headline-md md:text-5xl text-primary leading-tight">
            Un proceso sencillo y cercano
          </h2>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto mt-6">
            Desde el primer mensaje hasta el último mimo, cada paso está pensado para que tú y tu mascota os sintáis en buenas manos.
          </p>
        </div>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-8 left-0 right-0 h-px bg-outline-variant/30 hidden md:block"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 text-center">
            {steps.map((step, idx) => (
              <div key={idx} className="space-y-6 relative group">
                <div className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center mx-auto border-4 border-background group-hover:scale-110 transition-transform relative z-10">
                  <span className="material-symbols-outlined text-primary text-2xl">{step.icon}</span>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-terracota text-[10px] text-white flex items-center justify-center font-bold">
                    {step.num}
                  </div>
                </div>
                <h4 className="font-bold text-primary">{step.title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
