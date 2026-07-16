import { usePageTexts } from '../hooks/usePageTexts';

export default function Services() {
  const { texts, loading } = usePageTexts();
  const servicesTexts = texts.services;

  if (loading) {
    return <div className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container min-h-[50vh] animate-pulse" />;
  }

  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container" id="servicios">
      <div className="max-w-container-max-width mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-terracota mb-4 block">{servicesTexts.tag}</span>
          <h2 className="font-display-lg text-headline-md md:text-5xl text-primary leading-tight mb-6">
            {servicesTexts.title}
          </h2>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            {servicesTexts.description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-element-gap">
          {servicesTexts.servicesList.map((service, index) => (
            <div key={index} className="bg-white p-8 md:p-10 rounded-[2rem] border border-outline-variant/10 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-primary text-2xl">{service.icon}</span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">{service.title}</h3>
              <p className="text-on-surface-variant leading-relaxed font-medium">
                {service.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm font-bold text-on-surface-variant bg-white/50 backdrop-blur inline-block px-6 py-3 rounded-full border border-outline-variant/10">
            * Se aplicará un descuento del 10% por una segunda mascota.
          </p>
        </div>
      </div>
    </section>
  );
}
