const traits = [
  { icon: 'psychology', title: 'Comprendo el comportamiento animal', text: 'Adapto el cuidado al carácter, las rutinas y las necesidades de cada mascota.' },
  { icon: 'medication', title: 'Administración de medicación', text: 'Experiencia siguiendo tratamientos y pautas veterinarias cuando es necesario.' },
  { icon: 'spa', title: 'Entorno limpio y enriquecido', text: 'Espacios preparados para favorecer el bienestar físico y emocional de las mascotas.' },
  { icon: 'photo_camera', title: 'Seguimiento durante la estancia', text: 'Recibirás fotos y vídeos con frecuencia para que puedas estar tranquilo.' },
  { icon: 'stars', title: 'Atención personalizada', text: 'Acepto pocas reservas para dedicar tiempo y atención individual a cada animal.' }
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
            <div className="text-body-lg text-on-surface-variant mb-12 leading-relaxed font-medium space-y-4">
              <p>
                Desde que tengo memoria he vivido rodeada de animales y, con el tiempo, he aprendido a
                observarlos, entender su lenguaje y respetar las necesidades de cada uno. Para mí nunca
                han sido solo mascotas: siempre han formado parte de la familia.
              </p>
              <p>
                Trabajo desde casa, lo que me permite pasar gran parte del día acompañando a las
                mascotas que cuido y ofrecerles una atención cercana, tranquila y adaptada a sus
                necesidades.
              </p>
              <p>
                No soy una empresa ni una residencia. Soy una persona que abre las puertas de su hogar
                a un número reducido de animales porque creo que la calidad del cuidado siempre debe
                estar por encima de la cantidad.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {traits.map((trait, index) => (
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
