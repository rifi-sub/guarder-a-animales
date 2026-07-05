import React from 'react';

const leftColumn = [
  {
    title: "Alojamiento de mascotas",
    subtitle: "en casa del cuidador",
    basePrice: "18 €",
    unit: "por noche",
    icon: "luggage", 
    extras: [
      { name: "Tarifa de temporada alta", price: "22 €", unit: "por noche", info: true },
      { name: "Tarifa para cachorro", price: "+ 4 €", unit: "por noche" },
      { name: "Perro adicional", price: "+ 12 €", unit: "por perro por noche" },
      { name: "Gato adicional", price: "+ 8 €", unit: "por gato por noche" },
      { name: "Reserva de última hora", price: "+ 8 €", unit: "por reserva", info: true }
    ],
    cancelPolicy: "3 días"
  },
  {
    title: "Cuidado a domicilio",
    subtitle: "en tu casa",
    basePrice: "24 €",
    unit: "por noche",
    icon: "home",
    extras: [
      { name: "Tarifa de temporada alta", price: "28 €", unit: "por noche", info: true },
      { name: "Perro adicional", price: "+ 12 €", unit: "por perro por noche" },
      { name: "Gato adicional", price: "+ 8 €", unit: "por gato por noche" },
      { name: "Reserva de última hora", price: "+ 10 €", unit: "por reserva", info: true }
    ],
    cancelPolicy: "3 días"
  },
  {
    title: "Visitas a domicilio",
    subtitle: "visitas en tu casa",
    basePrice: "17 €",
    unit: "por visita",
    icon: "pets",
    extras: [
      { name: "Tarifa de 60 minutos", price: "+ 8 €", unit: "por visita" },
      { name: "Tarifa de temporada alta", price: "+ 4 €", unit: "por visita", info: true },
      { name: "Perro adicional", price: "+ 6 €", unit: "por perro por visita" },
      { name: "Gato adicional", price: "+ 5 €", unit: "por gato por visita" },
      { name: "Reserva de última hora", price: "+ 10 €", unit: "por reserva", info: true }
    ],
    cancelPolicy: "3 días"
  }
];

const rightColumn = [
  {
    title: "Guardería de día",
    subtitle: "en casa del cuidador",
    basePrice: "18 €",
    unit: "por día",
    icon: "wb_sunny",
    extras: [
      { name: "Tarifa de temporada alta", price: "22 €", unit: "por día", info: true },
      { name: "Tarifa para cachorro", price: "+ 4 €", unit: "por día" },
      { name: "Perro adicional", price: "+ 10 €", unit: "por perro por día" },
      { name: "Recogida y entrega por el cuidador", price: "20 €", unit: "por día" },
      { name: "Reserva de última hora", price: "+ 5 €", unit: "por reserva", info: true }
    ],
    cancelPolicy: "1 día"
  },
  {
    title: "Paseo de perros",
    subtitle: "en tu barrio",
    basePrice: "10 €",
    unit: "por paseo",
    icon: "pets",
    extras: [
      { name: "Tarifa de 60 minutos", price: "+ 7 €", unit: "por paseo" },
      { name: "Tarifa de temporada alta", price: "+ 3 €", unit: "por paseo", info: true },
      { name: "Perro adicional", price: "+ 5 €", unit: "por perro por paseo" },
      { name: "Reserva de última hora", price: "+ 5 €", unit: "por reserva", info: true }
    ],
    cancelPolicy: "3 días"
  }
];

const ServiceBlock = ({ service, isExpanded, onToggle }) => (
  <div className={`mb-10 last:mb-0 bg-white rounded-2xl transition-all ${isExpanded ? 'border border-outline-variant/30 shadow-sm p-6' : 'border-b border-outline-variant/30 pb-6'}`}>
    <div 
      className="flex justify-between items-start cursor-pointer group"
      onClick={onToggle}
    >
      <div className="flex gap-4 items-start">
        <span className={`material-symbols-outlined text-[32px] transition-colors ${isExpanded ? 'text-primary' : 'text-on-surface/80 group-hover:text-primary'}`}>{service.icon}</span>
        <div>
          <h3 className={`text-[17px] font-bold tracking-tight transition-colors ${isExpanded ? 'text-primary' : 'text-on-surface group-hover:text-primary'}`}>{service.title}</h3>
          <p className="text-[14px] text-on-surface-variant/80 mt-0.5">{service.subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <div className="text-[17px] font-bold text-on-surface tracking-tight">{service.basePrice}</div>
          <div className="text-[13px] text-on-surface-variant/80">{service.unit}</div>
        </div>
        <button className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-primary/10 text-primary' : 'bg-surface-container-lowest text-on-surface-variant group-hover:bg-surface-container-low'}`}>
          <span className={`material-symbols-outlined transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
        </button>
      </div>
    </div>

    {/* Vista Móvil Precio (solo si no está expandido) */}
    {!isExpanded && (
      <div className="sm:hidden flex justify-between items-center mt-3 pl-12 text-on-surface-variant">
        <span className="text-[13px]">{service.unit}</span>
        <span className="text-[15px] font-bold text-on-surface">{service.basePrice}</span>
      </div>
    )}

    {/* Contenido Expandible */}
    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100 mt-8 pt-6 border-t border-outline-variant/20' : 'max-h-0 opacity-0'}`}>
      <div className="space-y-4">
        {service.extras.map((extra, idx) => (
          <div key={idx} className="flex justify-between items-center text-[14px]">
            <div className="flex items-center gap-1 text-on-surface/90">
              {extra.name}
              {extra.info && (
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant/50 cursor-help" title="Información adicional">info</span>
              )}
            </div>
            <div className="text-right">
              <div className="font-bold text-on-surface tracking-tight">{extra.price}</div>
              <div className="text-[12px] text-on-surface-variant/80">{extra.unit}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-2 text-[14px] text-on-surface/90 bg-green-50 p-4 rounded-xl border border-green-100/50">
        <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
        <p>
          Puedes cancelar con hasta <span className="font-bold text-green-700">{service.cancelPolicy}</span> de antelación.
        </p>
      </div>
    </div>
  </div>
);

export default function Services() {
  const [expandedId, setExpandedId] = React.useState(null);

  const toggleAccordion = (title) => {
    setExpandedId(expandedId === title ? null : title);
  };

  return (
    <section className="py-20 px-6 md:px-12 bg-white" id="servicios">
      <div className="max-w-[1100px] mx-auto">
        <h2 className="text-[28px] font-bold text-on-surface mb-12">Servicios</h2>
        
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          <div className="flex-1">
            {leftColumn.map((service, idx) => (
              <ServiceBlock 
                key={idx} 
                service={service} 
                isExpanded={expandedId === service.title}
                onToggle={() => toggleAccordion(service.title)}
              />
            ))}
          </div>
          <div className="flex-1">
            {rightColumn.map((service, idx) => (
              <ServiceBlock 
                key={idx} 
                service={service} 
                isExpanded={expandedId === service.title}
                onToggle={() => toggleAccordion(service.title)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
