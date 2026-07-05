import { useMemo, useState, useEffect, useCallback } from 'react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'https://alilyback.duckdns.org/eris';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAY_HEADERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function Calendar({ isAdmin = false, onDayClick = null }) {
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
      return { bgClass: 'bg-red-100 border-red-200 text-red-900', label: 'Bloqueado', blocked: true, blockReason: occ.blockReason, occ };
    }

    if (avStatus) {
      const isGreen = avStatus.includes('green');
      const isRed = avStatus.includes('red');
      const label = isGreen ? 'Disponible' : isRed ? 'Reservado' : 'Consultar';
      const bgClass = isGreen ? 'bg-green-100 border-green-200 text-green-900' : isRed ? 'bg-red-100 border-red-200 text-red-900' : 'bg-amber-100 border-amber-200 text-amber-900';
      return { bgClass, label, blocked: false, occ };
    }

    if (!occ) return { bgClass: 'bg-green-100 border-green-200 text-green-900', label: 'Disponible', blocked: false, occ: null };
    if (occ.isFull) return { bgClass: 'bg-red-100 border-red-200 text-red-900', label: 'Completo', blocked: false, occ };
    if (occ.occupied > 0) return { bgClass: 'bg-amber-100 border-amber-200 text-amber-900', label: `${occ.available} plaza(s)`, blocked: false, occ };

    return { bgClass: 'bg-green-100 border-green-200 text-green-900', label: 'Disponible', blocked: false, occ };
  };

  const calendarContent = (
    <div className="bg-surface-container-low rounded-[2rem] p-8 shadow-sm h-full">
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
            <button
              key={item.dateStr}
              onClick={() => {
                if (isAdmin && onDayClick) {
                  onDayClick(item.dateStr); // Pass the full date string
                }
              }}
              disabled={!isAdmin}
              className={`aspect-square rounded-2xl border ${info.bgClass || 'bg-white border-outline-variant/10'} flex flex-col items-center justify-center relative transition-colors ${isAdmin ? 'cursor-pointer hover:ring-2 hover:ring-primary hover:scale-105' : 'cursor-default'}`}
              title={info.blocked ? `Bloqueado: ${info.blockReason}` : `${info.label} - ${info.occ ? `${info.occ.occupied}/${info.occ.capacity} ocupadas` : ''}`}
            >
              <span className="relative z-10 text-base font-bold">{item.day}</span>
              {info.blocked && (
                <div className="absolute top-1 right-1">
                  <span className="material-symbols-outlined text-red-900/50 text-[10px]">lock</span>
                </div>
              )}
              {info.occ && !info.blocked && (
                <span className="absolute bottom-1 text-[10px] text-black/40 font-bold">
                  {info.occ.occupied}/{info.occ.capacity}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (isAdmin) {
    return calendarContent;
  }

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
            <div className="flex flex-col gap-4 mt-8">
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-md bg-green-100 border border-green-200"></span>
                <span className="text-sm font-semibold text-on-surface-variant">Disponible</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-md bg-amber-100 border border-amber-200"></span>
                <span className="text-sm font-semibold text-on-surface-variant">Plazas limitadas</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-md bg-red-100 border border-red-200"></span>
                <span className="text-sm font-semibold text-on-surface-variant">Completo / Bloqueado</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            {calendarContent}
          </div>
        </div>
      </div>
    </section>
  );
}
