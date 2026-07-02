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
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  if (currentPath === '/admin') {
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
