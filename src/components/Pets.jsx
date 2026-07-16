import { useState } from 'react';
import { SectionMedia } from './SectionMedia';
import { API_BASE } from '../config';
import { usePageTexts } from '../hooks/usePageTexts';

function PetModal({ pet, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-black/20 hover:bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors z-20"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="h-48 md:h-64 relative shrink-0">
          <img
            src={`${API_BASE}/api/images/${pet.key}`}
            alt={pet.alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6 md:p-8">
            <h3 className="text-3xl md:text-4xl font-black text-white">Sobre {pet.name}</h3>
          </div>
        </div>
        <div className="p-6 md:p-8 overflow-y-auto space-y-4 bg-white">
          {pet.fullDescription.map((paragraph, idx) => (
            <p key={idx} className="text-on-surface-variant leading-relaxed text-sm md:text-base font-medium">{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Pets() {
  const [activePet, setActivePet] = useState(null);
  const { texts, loading } = usePageTexts();
  const petsTexts = texts.pets;

  if (loading) {
    return <div className="py-section-gap px-margin-mobile md:px-margin-desktop min-h-[50vh] animate-pulse bg-surface-container" />;
  }

  return (
    <>
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max-width mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-terracota mb-4 block">{petsTexts.tag}</span>
          <h2 className="font-display-lg text-headline-md md:text-5xl text-primary leading-tight mb-6">
            {petsTexts.title}
          </h2>
          <p className="text-body-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
            {petsTexts.description}
          </p>
        </div>
        <div className="max-w-container-max-width mx-auto grid grid-cols-1 md:grid-cols-2 gap-element-gap">
          {petsTexts.petData.map((pet) => (
            <div key={pet.key} className="group flex flex-col h-full bg-surface-container-low rounded-[2rem] p-6 border border-outline-variant/10 shadow-sm hover:shadow-md transition-all">
              <div className="rounded-2xl overflow-hidden aspect-video shadow-sm mb-6 relative">
                <SectionMedia
                  sectionKey={pet.key}
                  alt={pet.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  containerClassName="w-full h-full group-hover:scale-105 transition-transform duration-700"
                  gridClassName="grid grid-cols-2 gap-1 h-full"
                />
              </div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-primary">{pet.name}</h3>
                <span className="px-4 py-1.5 bg-primary/10 rounded-full text-xs font-bold text-primary uppercase tracking-wider">{pet.typeInfo}</span>
              </div>
              <p className="text-on-surface-variant leading-relaxed mb-6 flex-grow">{pet.description}</p>
              <button
                onClick={() => setActivePet(pet)}
                className="mt-auto px-6 py-3 bg-white border border-primary/10 shadow-sm text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors self-start flex items-center gap-2"
              >
                Conoce a {pet.name}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {activePet && <PetModal pet={activePet} onClose={() => setActivePet(null)} />}
    </>
  );
}
