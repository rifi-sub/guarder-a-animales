import { useState } from 'react';
import { SectionMedia } from './SectionMedia';
import { API_BASE } from '../config';

const petData = [
  {
    key: 'arya',
    name: 'Arya',
    typeInfo: 'Gata · 9 años',
    description: 'Mi compañera desde que era un bebé. Crecimos juntas y tenemos un vínculo muy especial. Es una gata inteligente, tranquila y muy cariñosa con las personas. Con otros gatos prefiere mantener su espacio al principio, por lo que siempre realizo las adaptaciones con calma y respetando los tiempos de cada uno.',
    fullDescription: [
      'Mi gata es mi compañera desde que era muy pequeña, literalmente desde que cabía en la palma de mi mano. Crecimos juntas y es una parte muy importante de mi vida.',
      'Es increíblemente inteligente, cariñosa y muy obediente; siempre me sigue a todas partes y tenemos un vínculo muy especial. Incluso salimos a pasear juntas y muchas veces la gente se sorprende de lo conectadas que estamos.',
      'Gracias a ella he aprendido aún más sobre el comportamiento felino, su sensibilidad y la importancia de respetar la personalidad y los ritmos de cada gato.',
      'Con las personas suele ser muy sociable y cariñosa. Con otros gatos necesita un periodo de adaptación y prefiere observar antes de relacionarse, por lo que siempre hago las presentaciones de forma tranquila y progresiva.',
    ],
    alt: 'Arya, Gata de 9 años',
  },
  {
    key: 'mina',
    name: 'Mina',
    typeInfo: 'Gato · 2 años',
    description: 'Lo rescaté cuando era un cachorro y desde entonces se ha convertido en un gato increíblemente dulce. Es muy juguetón, curioso y disfruta mucho de la compañía de otros gatos. Con las personas puede mostrarse tímido al principio, aunque enseguida saca su lado más cariñoso.',
    fullDescription: [
      'Mina tiene dos años y es mi pequeño rechonchito. Lo rescaté de una casa donde no lo estaban cuidando bien y desde entonces se ha convertido en un gato increíblemente dulce.',
      'Es muy bueno, manso y sociable con otros animales; de hecho, le encanta jugar y seguramente sería el que más disfrutaría si vienen otros gatitos de visita.',
      'Con las personas puede ser un poco tímido al principio debido a su pasado, pero es un gato muy noble que nunca haría daño a nadie. Incluso en el veterinario siempre me dicen lo bueno y tranquilo que es.',
      'Su carácter juguetón y sociable ayuda mucho a que otros gatos se sientan más cómodos durante las adaptaciones.',
    ],
    alt: 'Mina, Gato de 2 años',
  },
];

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
          {/* Modal header always shows single image for simplicity */}
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

  return (
    <>
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max-width mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-terracota mb-4 block">MIS MASCOTAS</span>
          <h2 className="font-display-lg text-headline-md md:text-5xl text-primary leading-tight mb-6">
            La familia peluda que hace de esta casa un hogar
          </h2>
          <p className="text-body-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
            Arya y Mina forman parte de mi familia. Conviven conmigo cada día y son una parte muy importante de mi vida. Como la tranquilidad de todos es mi prioridad, únicamente acepto mascotas compatibles con gatos y realizo las presentaciones de forma progresiva, respetando siempre el ritmo y la personalidad de cada animal.
          </p>
        </div>
        <div className="max-w-container-max-width mx-auto grid grid-cols-1 md:grid-cols-2 gap-element-gap">
          {petData.map((pet) => (
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
