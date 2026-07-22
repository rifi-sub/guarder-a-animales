import { useState, useEffect } from 'react';
import { API_BASE } from '../config';

export const DEFAULT_TEXTS = {
  hero: {
    location: 'Ontinyent, Valencia',
    title: 'Ellos felices,',
    titleHighlight: 'tú tranquilo.',
    description: 'Cuidado personalizado para mascotas en Ontinyent. Un entorno seguro, tranquilo y lleno de cariño para que puedas marcharte con total confianza.',
    buttonPrimary: 'Solicitar una reserva',
    buttonSecondary: 'Ver servicios',
    badge1: 'Pocas plazas',
    badge2: 'Fotos y vídeos a diario',
    floatingBadge1: 'Un segundo hogar',
    floatingBadge2Title: 'Nueva foto de Luna',
    floatingBadge2Desc: 'Durmiendo feliz',
  },
  homesection: {
    tag: 'EL HOGAR',
    title: 'Un hogar de verdad, no jaulas',
    description: 'Las mascotas que se quedan conmigo disfrutan de espacios reales de una casa: sitios cómodos para descansar, luz natural, plantas y compañía. Priorizo la calidad sobre la cantidad, con el máximo de atención en lugar del máximo de capacidad.',
    features: [
      { icon: 'bed', title: 'Habitación adaptada', desc: 'Una habitación de invitados preparada especialmente para los animales.' },
      { icon: 'gpp_good', title: 'Espacios seguros', desc: 'Zonas interiores protegidas donde nada puede hacerles daño.' },
      { icon: 'toys', title: 'Tiempo de juego', desc: 'Estímulos y juego para mantenerlos activos, curiosos y felices.' },
      { icon: 'bedtime', title: 'Descanso tranquilo', desc: 'Rincones cálidos y silenciosos para dormir sin estrés.' }
    ],
    convivenciaTitle: 'Convivencia responsable',
    convivenciaParagraphs: [
      'Convivo con dos gatos acostumbrados a compartir espacio con otros animales. Por ello, únicamente acepto mascotas compatibles con ellos para garantizar un ambiente tranquilo y seguro para todos.',
      'Considero que un buen cuidado empieza por respetar las rutinas de cada animal. Por eso sigo siempre las indicaciones de su familia respecto a alimentación, medicación, paseos, descanso y hábitos diarios, procurando que durante su estancia se sientan tranquilos, seguros y como en casa.',
      'En el caso de perros grandes, prefiero ofrecer paseos o cuidados a domicilio, ya que considero que es la opción que mejor se adapta a sus necesidades y bienestar.'
    ],
    floatingBadge: 'Máxima atención',
    floatingBadgeDesc: 'No buscamos cantidad, buscamos que se sientan amados y seguros.'
  },
  about: {
    badge: 'SOBRE MÍ',
    experienceYears: '+20',
    experienceText: 'años de experiencia',
    title: 'Hola, soy Eris. Cuido de tu mascota como si fuera mía.',
    paragraphs: [
      'Desde que tengo memoria he vivido rodeada de animales y, con el tiempo, he aprendido a observarlos, entender su lenguaje y respetar las necesidades de cada uno. Para mí nunca han sido solo mascotas: siempre han formado parte de la familia.',
      'Trabajo desde casa, lo que me permite pasar gran parte del día acompañando a las mascotas que cuido y ofrecerles una atención cercana, tranquila y adaptada a sus necesidades.',
      'No soy una empresa ni una residencia. Soy una persona que abre las puertas de su hogar a un número reducido de animales porque creo que la calidad del cuidado siempre debe estar por encima de la cantidad.'
    ],
    traits: [
      { icon: 'psychology', title: 'Comprendo el comportamiento animal', text: 'Adapto el cuidado al carácter, las rutinas y las necesidades de cada mascota.' },
      { icon: 'medication', title: 'Administración de medicación', text: 'Experiencia siguiendo tratamientos y pautas veterinarias cuando es necesario.' },
      { icon: 'spa', title: 'Entorno limpio y enriquecido', text: 'Espacios preparados para favorecer el bienestar físico y emocional de las mascotas.' },
      { icon: 'photo_camera', title: 'Seguimiento durante la estancia', text: 'Recibirás fotos y vídeos con frecuencia para que puedas estar tranquilo.' },
      { icon: 'stars', title: 'Atención personalizada', text: 'Acepto pocas reservas para dedicar tiempo y atención individual a cada animal.' }
    ]
  },
  pets: {
    tag: 'MIS MASCOTAS',
    title: 'La familia peluda que hace de esta casa un hogar',
    description: 'Arya y Mina forman parte de mi familia. Conviven conmigo cada día y son una parte muy importante de mi vida. Como la tranquilidad de todos es mi prioridad, únicamente acepto mascotas compatibles con gatos y realizo las presentaciones de forma progresiva, respetando siempre el ritmo y la personalidad de cada animal.',
    petData: [
      {
        key: 'arya',
        name: 'Arya',
        typeInfo: 'Gata · 9 años',
        description: 'Mi compañera desde que era un bebé. Crecimos juntas y tenemos un vínculo muy especial. Es una gata inteligente, tranquila y muy cariñosa con las personas. Con otros gatos prefiere mantener su espacio al principio, por lo que siempre realizo las adaptaciones con calma y respetando los tiempos de cada uno.',
        fullDescription: [
          'Mi gata es mi compañera desde que era muy pequeña, literalmente desde que cabía en la palma de mi mano. Crecimos juntas y es una parte muy importante de mi vida.',
          'Es increíblemente inteligente, cariñosa y muy obediente; siempre me sigue a todas partes y tenemos un vínculo muy especial. Incluso salimos a pasear juntas y muchas veces la gente se sorprende de lo conectadas que estamos.',
          'Gracias a ella he aprendido aún más sobre el comportamiento felino, su sensibilidad y la importancia de respetar la personalidad y los ritmos de cada gato.',
          'Con las personas suele ser muy sociable y cariñosa. Con otros gatos necesita un periodo de adaptación y prefiere observar antes de relacionarse, por lo que siempre hago las presentaciones de forma tranquila y progresiva.'
        ],
        alt: 'Arya, Gata de 9 años'
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
          'Su carácter juguetón y sociable ayuda mucho a que otros gatos se sientan más cómodos durante las adaptaciones.'
        ],
        alt: 'Mina, Gato de 2 años'
      }
    ]
  },
  services: {
    tag: 'LO QUE OFREZCO',
    title: 'Servicios de cuidado',
    description: 'Ofrezco un servicio de guardería y alojamiento en mi propio hogar. De esta forma, puedo atender de forma personalizada las necesidades de cada animal y que no les falte compañía en ningún momento.',
    servicesList: [
      {
        id: 'alojamiento',
        icon: 'night_shelter',
        title: 'Alojamiento',
        desc: 'Tu mascota dormirá en casa, como uno más de la familia, con todas las comodidades y atención las 24 horas.'
      },
      {
        id: 'guarderia',
        icon: 'light_mode',
        title: 'Guardería de día',
        desc: 'Cuidado durante el día para que no pase horas a solas mientras trabajas o tienes compromisos.'
      },
      {
        id: 'paseos',
        icon: 'directions_walk',
        title: 'Paseos y visitas',
        desc: 'Me acerco a tu domicilio para darle su paseo diario, alimentarle o simplemente hacerle compañía un rato.'
      }
    ]
  }
};

export function usePageTexts() {
  const [texts, setTexts] = useState(DEFAULT_TEXTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/settings`)
      .then(res => res.json())
      .then(data => {
        // Merge the loaded texts with DEFAULT_TEXTS so we always have fallbacks
        const loadedTexts = { ...DEFAULT_TEXTS };
        
        ['hero', 'homesection', 'about', 'pets', 'services'].forEach(section => {
          if (data[`text_${section}`]) {
            try {
              const parsed = JSON.parse(data[`text_${section}`]);
              loadedTexts[section] = { ...loadedTexts[section], ...parsed };
            } catch (e) {
              console.error(`Error parsing text_${section}`, e);
            }
          }
        });
        
        setTexts(loadedTexts);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return { texts, loading };
}
