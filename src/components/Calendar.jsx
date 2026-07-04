import { useMemo, useState, useEffect, useCallback } from 'react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'https://alilyback.duckdns.org/eris';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAY_HEADERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function Calendar() {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [occupationData, setOccupationData] = useState({});
  const [dbAvailability, setDbAvailability] = useState({});
  const [loading, setLoading] = useState(true);

  const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [occRes, avRes] = await Promise.all([
        fetch(`${API_BASE}/api/occupation?month=${monthStr}`),
        fetch(`${API_BASE}/api/availability`)
      ]);
      if (occRes.ok) {
        const data = await occRes.json();
        const occMap = {};
        data.forEach(item => { occMap[item.date] = item; });
        setOccupationData(occMap);
      }
      if (avRes.ok) {
        const data = await avRes.json();
        const map = {};
        data.forEach(item => { map[item.date] = item.status; });
        setDbAvailability(map);
      }
    } catch (err) {
      console.error('Error fetching calendar data:', err);
    }
    setLoading(false);
  }, [monthStr]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const navigate = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(y => y - 1);
      } else {
        setCurrentMonth(m => m - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(y => y + 1);
      } else {
        setCurrentMonth(m => m + 1);
      }
    }
  };

  const days = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const numDays = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    const startCol = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const result = [];
    for (let i = 0; i < startCol; i++) {
      result.push(null);
    }
    for (let d = 1; d <= numDays; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      result.push({ day: d, dateStr });
    }
    return result;
  }, [currentYear, currentMonth]);

  const getDayInfo = (dateStr) => {
    const occ = occupationData[dateStr];
    const avStatus = dbAvailability[dateStr];

    if (occ?.blocked) {
      return { bgClass: 'bg-red-400/20 border-red-400/30', dot: 'bg-red-400', label: 'Bloqueado', blocked: true, blockReason: occ.blockReason, occ };
    }

    if (avStatus) {
      const label = avStatus === 'bg-green-500' ? 'Disponible' : avStatus === 'bg-red-400' ? 'Reservado' : 'Consultar';
      return { bgClass: `${avStatus}/10 border-${avStatus.replace('bg-', '')}/30`, dot: avStatus, label, blocked: false, occ };
    }

    if (!occ) return { bgClass: 'bg-green-500/10 border-green-500/30', dot: 'bg-green-500', label: 'Disponible', blocked: false, occ: null };
    if (occ.isFull) return { bgClass: 'bg-red-400/10 border-red-400/30', dot: 'bg-red-400', label: 'Completo', blocked: false, occ };
    if (occ.occupied > 0) return { bgClass: 'bg-orange-300/10 border-orange-300/30', dot: 'bg-orange-300', label: `${occ.available} plaza(s)`, blocked: false, occ };

    return { bgClass: 'bg-green-500/10 border-green-500/30', dot: 'bg-green-500', label: 'Disponible', blocked: false, occ };
  };

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
                <span className="w-3 h-3 rounded-full bg-orange-300"></span>
                <span className="text-sm font-semibold">Plazas limitadas</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="text-sm font-semibold">Completo / Reservado</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                <span className="text-sm font-semibold">Bloqueado / No disponible</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="bg-surface-container-low rounded-[2rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-primary">{MONTHS[currentMonth]} {currentYear}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('prev')}
                    className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-white transition-colors"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    onClick={() => navigate('next')}
                    className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-white transition-colors"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-on-surface-variant/50 uppercase tracking-widest mb-4">
                {DAY_HEADERS.map(d => <div key={d}>{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-3">
                {days.map((item, index) => {
                  if (!item) {
                    return <div key={`empty-${index}`} />;
                  }
                  const info = getDayInfo(item.dateStr);

                  return (
                    <div
                      key={item.dateStr}
                      className={`aspect-square rounded-2xl bg-white border ${info.bgClass || 'border-outline-variant/10'} flex flex-col items-center justify-center relative group hover:border-primary transition-colors cursor-default`}
                      title={info.blocked ? `Bloqueado: ${info.blockReason}` : `${info.label} - ${info.occ ? `${info.occ.occupied}/${info.occ.capacity} ocupadas` : ''}`}
                    >
                      <span className="relative z-10 text-sm font-semibold">{item.day}</span>
                      {info.blocked ? (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
                          <span className="text-[8px] text-white font-bold">⛔</span>
                        </div>
                      ) : (
                        <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${info.dot}`}></div>
                      )}
                      {info.occ && !info.blocked && (
                        <span className="absolute bottom-0 text-[8px] text-on-surface-variant/50 font-semibold">
                          {info.occ.occupied}/{info.occ.capacity}
                        </span>
                      )}
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
