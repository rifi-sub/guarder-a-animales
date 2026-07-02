import { useState, useEffect } from 'react';
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Pets from './components/Pets'
import Services from './components/Services'
import HomeSection from './components/HomeSection'
import Calendar from './components/Calendar'
import HowItWorks from './components/HowItWorks'
import Reviews from './components/Reviews'
import ContactForm from './components/ContactForm'
import Footer from './components/Footer'
import AdminPanel from './components/AdminPanel'

function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
      // Auto-scroll to top when hash changes
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  if (currentHash === '#admin') {
    return <AdminPanel />;
  }

  return (
    <>
      <Navbar />
      <main className="font-body-md text-on-surface">
        <Hero />
        <About />
        <Pets />
        <Services />
        <HomeSection />
        <Calendar />
        <HowItWorks />
        <Reviews />
        <ContactForm />
      </main>
      <Footer />
    </>
  )
}

export default App
