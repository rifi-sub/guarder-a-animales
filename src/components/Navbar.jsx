import { useState, useEffect } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-3 rounded-full mt-6 mx-auto w-fit max-w-[95%] border border-outline-variant/30 transition-all duration-300 font-label-md text-label-md ${
        scrolled 
          ? 'shadow-lg bg-surface/95' 
          : 'shadow-sm bg-surface/80 backdrop-blur-md'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
        <span className="font-display-lg text-headline-sm text-primary font-bold">Eris</span>
      </div>
      <div className="hidden md:flex items-center gap-8 mx-12">
        <a className="text-primary font-bold border-b-2 border-primary pb-1" href="#inicio">Inicio</a>
        <a className="text-on-surface-variant hover:text-primary transition-colors" href="#sobre-mi">Sobre mí</a>
        <a className="text-on-surface-variant hover:text-primary transition-colors" href="#servicios">Servicios</a>
        <a className="text-on-surface-variant hover:text-primary transition-colors" href="#disponibilidad">Disponibilidad</a>
        <a className="text-on-surface-variant hover:text-primary transition-colors" href="#reseñas">Reseñas</a>
        <a className="text-on-surface-variant hover:text-primary transition-colors" href="#contacto">Contacto</a>
      </div>
      <div className="flex items-center gap-4">
        <a 
          href="/portal"
          className="hidden md:flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">account_circle</span>
          Área Cliente
        </a>
        <button
          onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-terracota text-white px-6 py-2.5 rounded-full font-bold hover:scale-95 transition-transform"
        >
          Reservar guardería
        </button>
      </div>
    </nav>
  );
}
