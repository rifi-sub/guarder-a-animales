import { useMemo } from 'react';

const statuses = ['bg-green-500', 'bg-red-400', 'bg-orange-300'];

export default function Calendar() {
  // Pre-generate the calendar days for July 2026 to keep them stable
  const days = useMemo(() => {
    const list = [
      { day: 1, status: 'bg-green-500' },
      { day: 2, status: 'bg-orange-300' },
      { day: 3, status: 'bg-red-400' },
      { day: 4, status: 'bg-green-500' },
      { day: 5, status: 'bg-orange-300' }
    ];

    for (let i = 6; i <= 31; i++) {
      // Pick a semi-random but stable status
      const seed = (i * 31 + 17) % statuses.length;
      list.push({ day: i, status: statuses[seed] });
    }
    return list;
  }, []);

  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-white" id="disponibilidad">
      <div className="max-w-container-max-width mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5">
            <span className="text-xs font-bold uppercase tracking-widest text-terracota mb-4 block">DISPONIBILIDAD</span>
            <h2 className="font-display-lg text-headline-md md:text-5xl text-primary leading-tight">
              Consulta las fechas y reserva con tranquilidad
            </h2>
            <p className="text-body-lg text-on-surface-variant mt-8 mb-10">
              Como acepto un número reducido de mascotas, las plazas vuelan. Echa un vistazo al calendario y escríbeme para confirmar la disponibilidad de tus fechas.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm font-semibold">Disponible</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="text-sm font-semibold">Reservado</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-orange-300"></span>
                <span className="text-sm font-semibold">Consultar</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="bg-surface-container-low rounded-[2rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-primary">Julio 2026</h3>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-white transition-colors">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-white transition-colors">
                    <span class="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
              
              {/* Calendar Grid Header */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-on-surface-variant/50 uppercase tracking-widest mb-4">
                <div>L</div><div>M</div><div>X</div><div>J</div><div>V</div><div>S</div><div>D</div>
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-3">
                {days.map((item, index) => {
                  // Wednesday (starts on col-start-3)
                  const colStartClass = item.day === 1 ? 'col-start-3' : '';
                  return (
                    <div
                      key={index}
                      className={`${colStartClass} aspect-square rounded-2xl bg-white border border-outline-variant/10 flex flex-col items-center justify-center relative group hover:border-primary transition-colors cursor-pointer`}
                    >
                      <span className="relative z-10">{item.day}</span>
                      <div className={`absolute bottom-2 w-1 h-1 rounded-full ${item.status}`}></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
