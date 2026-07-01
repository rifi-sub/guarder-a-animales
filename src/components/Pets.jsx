const pets = [
  {
    name: 'Luna',
    typeInfo: 'Gata · 4 años',
    description: 'Tranquila y observadora. Le encanta buscar los rincones más soleados de la casa para dormir la siesta.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJDjBt_B-H-asfzF9AC1s2AhthpAKA3EsJBarT_3dYEhjNOfH1cGApricJ-AzAuyeX8apRb3OIy95pOV_JfghkaWIrZrKxmZPAcVz2uCHRATRFGFv1rIyk09j33gbXZflDpCMvVkI1r5nkSIbs78GGRGH2IXjJjCz-xqaefhLHaRHRqghrT3F0BtLaTiP5Okcv4QORpAKyHp9McKT_q0mEW46yPRpwhM9xWakZUwQajAIgj-Ih_2OnKw',
    alt: 'Tabby cat Luna'
  },
  {
    name: 'Coco',
    typeInfo: 'Perro · 3 años',
    description: 'Cariñoso y sociable. Recibe a cada nueva mascota con calma y ayuda a que se sientan como en casa.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwjIdDQK8DapqH_c7Q3i0h0pJMgeXBE6_TEGVyjELaVaJE5F2ZeRNSsYpQejpmodnuwYvNk8uu_rhsQM6uh6OD9qj2QYryvhXqp8W6cClMM2Jd2oLgtl7Ja6P0uP9rurO-2aZBUEeeb-l-pGV0sjWdTjoA2OkIuwkiX-dWRjdDfV5rn30HqpOIGQzaxbdALkU0mNkEZKGh7cmEkxk2Db1OG1Q2qZ0LS4n8ZRXgI5_9M-6B_TNhWZQRXA',
    alt: 'Cavalier King Charles Spaniel dog Coco'
  }
];

export default function Pets() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max-width mx-auto text-center mb-16">
        <span className="text-xs font-bold uppercase tracking-widest text-terracota mb-4 block">MIS MASCOTAS</span>
        <h2 className="font-display-lg text-headline-md md:text-5xl text-primary leading-tight">
          La familia peluda que hace de esta casa un hogar
        </h2>
        <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto mt-6">
          Ellos son parte del equipo. Un ambiente equilibrado y sociable ayuda a que tu mascota se adapte con tranquilidad y confianza.
        </p>
      </div>
      <div className="max-w-container-max-width mx-auto grid grid-cols-1 md:grid-cols-2 gap-element-gap">
        {pets.map((pet, index) => (
          <div key={index} className="group cursor-pointer">
            <div className="rounded-3xl overflow-hidden aspect-video shadow-lg mb-6">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                src={pet.image}
                alt={pet.alt}
              />
            </div>
            <div className="flex justify-between items-center px-2">
              <h3 className="text-2xl font-bold text-primary">{pet.name}</h3>
              <span className="px-4 py-1 bg-surface-container rounded-full text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {pet.typeInfo}
              </span>
            </div>
            <p className="mt-4 px-2 text-on-surface-variant leading-relaxed">{pet.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
