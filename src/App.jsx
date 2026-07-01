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

function App() {
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
