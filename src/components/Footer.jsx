export default function Footer() {
  return (
    <footer className="w-full py-12 px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-element-gap bg-surface-container-low border-t border-outline-variant/20 font-body-md text-body-md">
      <div className="flex flex-col items-center md:items-start gap-4 max-w-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
          <span className="font-display-lg text-headline-sm text-primary font-bold">Eris</span>
        </div>
        <p className="text-on-surface-variant text-center md:text-left text-sm opacity-80">
          © 2024 Eris Pet Care. Cuidado cercano, responsable y lleno de cariño para que tu mascota se sienta como en casa.
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-16">
        <div className="text-center md:text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">NAVEGACIÓN</p>
          <div className="flex flex-col gap-2">
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#sobre-mi">Sobre mí</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#servicios">Servicios</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#disponibilidad">Disponibilidad</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#reseñas">Reseñas</a>
          </div>
        </div>
        <div className="text-center md:text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">CONTACTO</p>
          <div className="flex flex-col gap-2 text-on-surface-variant">
            <p className="flex items-center justify-center md:justify-start gap-2">
              <span className="material-symbols-outlined text-sm">location_on</span> Ontinyent, Valencia
            </p>
            <p className="flex items-center justify-center md:justify-start gap-2">
              <span className="material-symbols-outlined text-sm">mail</span> hola@eris-mascotas.es
            </p>
            <p className="flex items-center justify-center md:justify-start gap-2">
              <span className="material-symbols-outlined text-sm">alternate_email</span> @eris.mascotas
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
