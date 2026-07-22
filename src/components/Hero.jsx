import { SectionMedia } from './SectionMedia';
import { usePageTexts } from '../hooks/usePageTexts';

export default function Hero() {
  const { texts, loading } = usePageTexts();
  const heroTexts = texts.hero;

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return <div className="pt-40 pb-20 px-margin-mobile md:px-margin-desktop min-h-screen animate-pulse bg-surface-container" />;
  }

  return (
    <section className="pt-40 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max-width mx-auto" id="inicio">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-16">
        <div className="space-y-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container w-fit rounded-full text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">location_on</span>
            <span className="text-xs font-semibold uppercase tracking-widest">{heroTexts.location}</span>
          </div>
          <h1 className="font-display-lg text-display-lg md:text-6xl text-primary leading-tight">
            {heroTexts.title}<br /><span className="text-terracota">{heroTexts.titleHighlight}</span>
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-lg">
            {heroTexts.description}
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => scrollToSection('reserva')}
              className="bg-terracota text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-terracota/20 hover:-translate-y-1 transition-all"
            >
              <span className="material-symbols-outlined">favorite</span> {heroTexts.buttonPrimary}
            </button>
            <button
              onClick={() => scrollToSection('servicios')}
              className="border border-outline-variant text-primary px-8 py-4 rounded-2xl font-bold hover:bg-surface-container transition-colors"
            >
              {heroTexts.buttonSecondary}
            </button>
          </div>
          <div className="flex items-center gap-6 text-sm text-on-surface-variant">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> {heroTexts.badge1}
            </span>
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">videocam</span> {heroTexts.badge2}
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="hero-image-mask aspect-[4/5] bg-surface-container shadow-2xl relative overflow-hidden rounded-3xl">
            <SectionMedia
              sectionKey="hero"
              alt="Eris Pet Care"
              className="w-full h-full object-cover"
              containerClassName="w-full h-full"
              gridClassName="grid grid-cols-1 gap-2 h-full"
            />
            {/* Floating Badges */}
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur p-3 rounded-2xl shadow-xl animate-bounce z-10" style={{ animationDuration: '3s' }}>
              <span className="material-symbols-outlined text-primary">eco</span>
            </div>
            <div className="absolute top-12 right-6 bg-white/95 backdrop-blur p-4 rounded-2xl shadow-xl flex items-center gap-3 z-10">
              <span className="material-symbols-outlined text-terracota" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              <span className="text-sm font-bold">{heroTexts.floatingBadge1}</span>
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur p-4 rounded-2xl shadow-xl flex items-center gap-4 w-[80%] z-10">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-white">pets</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">{heroTexts.floatingBadge2Title}</p>
                <p className="text-sm font-bold">{heroTexts.floatingBadge2Desc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
