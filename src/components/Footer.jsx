import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-outline-variant/20 py-8 text-center text-on-surface-variant">
      <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm">© {new Date().getFullYear()} Eris Pet Care. Todos los derechos reservados.</p>
        <div className="flex gap-6 text-sm">
          <Link to="/terminos" className="hover:text-primary transition-colors">Términos y Condiciones</Link>
          <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
