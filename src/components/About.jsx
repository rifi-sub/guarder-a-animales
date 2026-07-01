const traits = [
  { icon: 'favorite', text: 'He convivido con animales desde pequeña y los entiendo de verdad.' },
  { icon: 'pets', text: 'Conozco el comportamiento animal y el adiestramiento básico felino.' },
  { icon: 'medication', text: 'Experiencia administrando medicación, especialmente a gatos.' },
  { icon: 'spark', text: 'Entorno extremadamente limpio y cuidado en todo momento.' },
  { icon: 'schedule', text: 'Nunca dejo a tu mascota sola más de 2 o 3 horas seguidas.' },
  { icon: 'photo_camera', text: 'Recibirás fotos y vídeos con frecuencia para estar tranquilo.' },
  { icon: 'home', text: 'Ambiente hogareño, calmado y con enriquecimiento ambiental.' },
  { icon: 'stars', text: 'Acepto pocos animales: calidad y atención por encima de cantidad.' }
];

export default function About() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low" id="sobre-mi">
      <div className="max-w-container-max-width mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
          <div className="lg:col-span-5 relative">
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/5] border border-outline-variant/10">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDG2yL4-wLZ6pfmfLQeDfiXfKOXBF-Cr2Xh2NR3DSMCBQJIkbUGFR5zTx0LYjtl5hPNDbekU-QSV9H7MdAXo1-Imd6EEuJp56mX5oJkgBaj_jqnDw6u2ZQGH9Dr8NjaovGq2T7hT8zJTh2-aRV5SekYh1bUStMKmNzS_c5KJ_fewbFMcDYqj5T2fVnDy-HxSfeFqDzv_AtgGGIBPkfuEgjdWnTKe_SSWkKQXYDHi_U1Pui8zmUdFjCpcA"
                alt="Eris with cat"
              />
            </div>
            {/* Overlapping Badge at Bottom Left */}
            <div className="absolute -bottom-6 -left-6 bg-white py-4 px-6 rounded-[2rem] shadow-xl border border-outline-variant/10 text-center max-w-[200px]">
              <p className="text-3xl font-extrabold text-primary leading-none">+15</p>
              <p className="text-[11px] text-on-surface-variant font-bold mt-2 leading-tight">
                años conviviendo con animales
              </p>
            </div>
          </div>
          <div className="lg:col-span-7">
            <span className="text-xs font-extrabold uppercase tracking-widest text-terracota mb-4 block">SOBRE MÍ</span>
            <h2 className="font-display-lg text-headline-md md:text-5xl text-primary leading-tight mb-8">
              Hola, soy Eris. Cuido de tu mascota como si fuera mía.
            </h2>
            <p className="text-body-lg text-on-surface-variant mb-12 leading-relaxed font-medium">
              Desde que tengo memoria he vivido rodeada de animales, y con el tiempo he aprendido a escucharlos, entender su lenguaje y darles justo lo que necesitan. No soy una empresa ni una residencia: soy una persona que abre su casa y su corazón a un número reducido de mascotas para poder dedicarles toda la atención que merecen.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {traits.map((trait, index) => (
                <div key={index} className="flex items-center gap-4 p-5 bg-white/70 backdrop-blur-sm rounded-[2rem] border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl font-bold">{trait.icon}</span>
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-on-surface-variant leading-snug">{trait.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
