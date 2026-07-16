import { SectionMedia } from './SectionMedia';
import { usePageTexts } from '../hooks/usePageTexts';

export default function HomeSection() {
  const { texts, loading } = usePageTexts();
  const hsTexts = texts.homesection;

  if (loading) {
    return <div className="py-section-gap px-margin-mobile md:px-margin-desktop min-h-[60vh] animate-pulse" />;
  }

  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max-width mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Text — always left */}
          <div className="order-2 lg:order-1">
            <span className="text-xs font-bold uppercase tracking-widest text-terracota mb-4 block">{hsTexts.tag}</span>
            <h2 className="font-display-lg text-headline-md md:text-5xl text-primary leading-tight mb-8">
              {hsTexts.title}
            </h2>
            <p className="text-body-lg text-on-surface-variant mb-12">
              {hsTexts.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hsTexts.features.map((feat, idx) => (
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
                <h3 className="font-bold text-lg text-primary">{hsTexts.convivenciaTitle}</h3>
              </div>
              <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
                {hsTexts.convivenciaParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Media — right: renders based on admin mode setting */}
          <div className="order-1 lg:order-2 relative">
            <div className="rounded-3xl overflow-hidden aspect-square shadow-2xl">
              <SectionMedia
                sectionKey="homesection"
                alt="Cozy pet care living room"
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
                gridClassName="grid grid-cols-2 gap-2 h-full"
              />
            </div>
            <div className="absolute -top-10 -right-10 hidden xl:block bg-white/90 backdrop-blur p-8 rounded-3xl shadow-xl w-64">
              <p className="text-terracota font-bold text-lg">{hsTexts.floatingBadge}</p>
              <p className="text-sm text-on-surface-variant mt-2">{hsTexts.floatingBadgeDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
