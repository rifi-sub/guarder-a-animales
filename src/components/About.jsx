import { SectionMedia } from './SectionMedia';
import { usePageTexts } from '../hooks/usePageTexts';

export default function About() {
  const { texts, loading } = usePageTexts();
  const aboutTexts = texts.about;

  if (loading) {
    return <div className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low min-h-[60vh] animate-pulse" />;
  }

  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low" id="sobre-mi">
      <div className="max-w-container-max-width mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
          <div className="lg:col-span-5 relative">
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/5] border border-outline-variant/10">
              <SectionMedia
                sectionKey="about"
                alt="Eris with cat"
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
                gridClassName="grid grid-cols-2 gap-1 h-full"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white py-4 px-6 rounded-[2rem] shadow-xl border border-outline-variant/10 text-center max-w-[200px]">
              <p className="text-3xl font-extrabold text-primary leading-none">{aboutTexts.experienceYears}</p>
              <p className="text-[11px] text-on-surface-variant font-bold mt-2 leading-tight">{aboutTexts.experienceText}</p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <span className="text-xs font-extrabold uppercase tracking-widest text-terracota mb-4 block">{aboutTexts.badge}</span>
            <h2 className="font-display-lg text-headline-md md:text-5xl text-primary leading-tight mb-8">
              {aboutTexts.title}
            </h2>
            <div className="text-body-lg text-on-surface-variant mb-12 leading-relaxed font-medium space-y-4">
              {aboutTexts.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aboutTexts.traits.map((trait, index) => (
                <div key={index} className="flex flex-col gap-2 p-5 bg-white/70 backdrop-blur-sm rounded-[2rem] border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-lg font-bold">{trait.icon}</span>
                    </div>
                    <h3 className="font-bold text-sm text-primary leading-tight">{trait.title}</h3>
                  </div>
                  <p className="text-xs md:text-sm text-on-surface-variant leading-snug">{trait.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
