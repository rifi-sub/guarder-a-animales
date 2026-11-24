import { useState, useMemo } from 'react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'https://alilyback.duckdns.org/eris';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
const SHORT_MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const SHORT_WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function resolvePhotoUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  return `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;
}

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseISODate(str) {
  if (!str) return null;
  const d = new Date(str.slice(0, 10) + 'T12:00:00');
  return isNaN(d.getTime()) ? null : d;
}

function classifyService(booking) {
  const svc = (booking.service || '').toLowerCase();
  const st = (booking.status || '').toUpperCase();

  if (st === 'PENDIENTE' || svc.includes('consulta')) {
    return {
      key: 'pending',
      label: svc.includes('consulta') ? 'Consulta' : (booking.service || 'Pendiente'),
      icon: 'pending',
      bgClass: 'border-[#d6a965] text-[#6d4811]',
      style: {
        backgroundImage: 'repeating-linear-gradient(-45deg, #f8e9cd, #f8e9cd 8px, #f2dbb1 8px, #f2dbb1 16px)'
      },
      statusIcon: 'error',
      statusColor: 'text-amber-600'
    };
  }
  if (svc.includes('domicilio') || svc.includes('paseo') || svc.includes('visita')) {
    return {
      key: 'visits',
      label: booking.service || 'Visitas a domicilio',
      icon: 'home',
      bgClass: 'bg-[#d4e1ed] border-[#9bb6cf] text-[#28445e]',
      style: {},
      statusIcon: 'check_circle',
      statusColor: 'text-emerald-700'
    };
  }
  if (svc.includes('día') || svc.includes('dia') || (svc.includes('guardería') && !svc.includes('hogar') && !svc.includes('alojamiento'))) {
    return {
      key: 'daycare',
      label: booking.service || 'Guardería',
      icon: 'wb_sunny',
      bgClass: 'bg-[#f4dfa8] border-[#d8b460] text-[#5e440d]',
      style: {},
      statusIcon: 'check_circle',
      statusColor: 'text-emerald-700'
    };
  }
  // Alojamiento / Guardería en mi hogar
  return {
    key: 'boarding',
    label: booking.service || 'Alojamiento',
    icon: 'bed',
    bgClass: 'bg-[#ecc3b6] border-[#cc8e7c] text-[#5a291c]',
    style: {},
    statusIcon: 'check_circle',
    statusColor: 'text-emerald-700'
  };
}

function formatBarRange(startStr, endStr) {
  const s = parseISODate(startStr);
  const e = parseISODate(endStr || startStr);
  if (!s) return '';
  const sd = s.getDate();
  const sm = SHORT_MONTHS[s.getMonth()];
  if (!e || toISODate(s) === toISODate(e)) return `${sd} ${sm}`;
  const ed = e.getDate();
  const em = SHORT_MONTHS[e.getMonth()];
  return sm === em ? `${sd} – ${ed} ${sm}` : `${sd} ${sm} – ${ed} ${em}`;
}

export default function OccupancyPlannerView({
  pets = [],
  clients = [],
  bookings = [],
  availability = {},
  onNewBookingClick,
  onSelectBookingNavigate
}) {
  const now = new Date();
  const todayStr = toISODate(now);

  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week'
  const [cursorDate, setCursorDate] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Visible days array
  const visibleDays = useMemo(() => {
    const days = [];
    if (viewMode === 'month') {
      const year = cursorDate.getFullYear();
      const month = cursorDate.getMonth();
      const totalDays = new Date(year, month + 1, 0).getDate();
      for (let d = 1; d <= totalDays; d++) {
        const dateObj = new Date(year, month, d);
        days.push({
          dateObj,
          iso: toISODate(dateObj),
          dayNum: d,
          weekday: SHORT_WEEKDAYS[dateObj.getDay()],
          isWeekend: dateObj.getDay() === 0 || dateObj.getDay() === 6,
          isToday: toISODate(dateObj) === todayStr
        });
      }
    } else {
      // Week starting Monday of cursorDate
      const d = new Date(cursorDate);
      const dayOfWeek = d.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diffToMonday);
      for (let i = 0; i < 7; i++) {
        const dateObj = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
        days.push({
          dateObj,
          iso: toISODate(dateObj),
          dayNum: dateObj.getDate(),
          weekday: SHORT_WEEKDAYS[dateObj.getDay()],
          isWeekend: dateObj.getDay() === 0 || dateObj.getDay() === 6,
          isToday: toISODate(dateObj) === todayStr
        });
      }
    }
    return days;
  }, [viewMode, cursorDate, todayStr]);

  const periodStartIso = visibleDays[0]?.iso || todayStr;
  const periodEndIso = visibleDays[visibleDays.length - 1]?.iso || todayStr;

  const periodLabel = useMemo(() => {
    if (viewMode === 'month') {
      return `${MONTH_NAMES[cursorDate.getMonth()]} ${cursorDate.getFullYear()}`;
    }
    const first = visibleDays[0]?.dateObj;
    const last = visibleDays[visibleDays.length - 1]?.dateObj;
    if (!first || !last) return '';
    return `${first.getDate()} ${SHORT_MONTHS[first.getMonth()]} – ${last.getDate()} ${SHORT_MONTHS[last.getMonth()]} ${last.getFullYear()}`;
  }, [viewMode, cursorDate, visibleDays]);

  const navigatePrev = () => {
    setCursorDate(prev =>
      viewMode === 'month'
        ? new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
        : new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7)
    );
  };

  const navigateNext = () => {
    setCursorDate(prev =>
      viewMode === 'month'
        ? new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
        : new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7)
    );
  };

  const navigateToday = () => {
    const t = new Date();
    setCursorDate(viewMode === 'month' ? new Date(t.getFullYear(), t.getMonth(), 1) : t);
  };

  // Active bookings overlapping the visible period (excluding RECHAZADA / CANCELADA)
  const periodBookings = useMemo(() => {
    return bookings.filter(b => {
      const st = (b.status || '').toUpperCase();
      if (st === 'RECHAZADA' || st === 'CANCELADA') return false;
      const bStart = (b.startDate || '').slice(0, 10);
      const bEnd = (b.endDate || b.startDate || '').slice(0, 10);
      if (!bStart) return false;
      return bStart <= periodEndIso && bEnd >= periodStartIso;
    });
  }, [bookings, periodStartIso, periodEndIso]);

  // Build rows: all CRM pets + any unlinked booking rows so nothing is missed
  const rows = useMemo(() => {
    const clientMap = new Map(clients.map(c => [c.id, c]));
    const petRows = pets.map(pet => {
      const owner = pet.client || clientMap.get(pet.clientId) || null;
      const petStays = periodBookings.filter(b => b.petId === pet.id);
      return {
        rowId: `pet-${pet.id}`,
        pet,
        petName: pet.name,
        petBreed: pet.breed || pet.type || 'Sin raza',
        petType: pet.type || 'Mascota',
        photoUrl: pet.photoUrl || null,
        clientName: owner?.name || '—',
        stays: petStays
      };
    });

    // Any bookings in the period that don't have a petId matching a CRM pet
    const matchedIds = new Set(petRows.flatMap(r => r.stays.map(s => s.id)));
    const orphanBookings = periodBookings.filter(b => !matchedIds.has(b.id));

    const orphanByKey = new Map();
    orphanBookings.forEach(b => {
      const key = `${b.name || 'Cliente'}_${b.petType || 'Mascota'}`;
      if (!orphanByKey.has(key)) {
        orphanByKey.set(key, {
          rowId: `orphan-${key}`,
          pet: null,
          petName: b.petType || 'Mascota',
          petBreed: 'Sin ficha CRM',
          petType: b.petType || 'Mascota',
          photoUrl: null,
          clientName: b.name || 'Cliente',
          stays: []
        });
      }
      orphanByKey.get(key).stays.push(b);
    });

    // Sort: rows with stays in this period first, then alphabetical
    return [...petRows, ...Array.from(orphanByKey.values())].sort((a, b) => {
      if (a.stays.length > 0 && b.stays.length === 0) return -1;
      if (a.stays.length === 0 && b.stays.length > 0) return 1;
      return (a.petName || '').localeCompare(b.petName || '');
    });
  }, [pets, clients, periodBookings]);

  // KPIs for the selected period
  const kpis = useMemo(() => {
    const activeRowsCount = rows.filter(r => r.stays.length > 0).length;
    let occupiedDays = 0;
    visibleDays.forEach(d => {
      const hasStay = periodBookings.some(b => {
        const s = (b.startDate || '').slice(0, 10);
        const e = (b.endDate || b.startDate || '').slice(0, 10);
        return s <= d.iso && e >= d.iso;
      });
      if (hasStay) occupiedDays++;
    });

    const totalDays = visibleDays.length || 1;
    const occupancyPct = Math.round((occupiedDays / totalDays) * 100);

    const upcomingCheckIns = periodBookings.filter(b => {
      const s = (b.startDate || '').slice(0, 10);
      return s >= todayStr && s >= periodStartIso && s <= periodEndIso;
    }).length;

    const upcomingCheckOuts = periodBookings.filter(b => {
      const e = (b.endDate || b.startDate || '').slice(0, 10);
      return e >= todayStr && e >= periodStartIso && e <= periodEndIso;
    }).length;

    return {
      activePets: activeRowsCount,
      occupiedDays,
      totalDays,
      occupancyPct,
      upcomingCheckIns,
      upcomingCheckOuts
    };
  }, [rows, visibleDays, periodBookings, todayStr, periodStartIso, periodEndIso]);

  return (
    <div className="space-y-6">
      {/* Cabecera superior */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-headline-md text-primary tracking-tight">Planificador de Ocupación</h1>
          <p className="text-sm text-on-surface-variant">Calendario de estancias y ocupación de mascotas.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Navegación por meses / semanas */}
          <div className="inline-flex items-center bg-white border border-outline-variant/30 rounded-xl p-1 shadow-sm">
            <button
              type="button"
              onClick={navigatePrev}
              className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
              title="Anterior"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <div className="px-3 flex items-center gap-1.5 text-xs font-bold text-on-surface min-w-[140px] justify-center">
              <span className="material-symbols-outlined text-base text-primary">calendar_month</span>
              <span>{periodLabel}</span>
            </div>
            <button
              type="button"
              onClick={navigateNext}
              className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
              title="Siguiente"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>

          <button
            type="button"
            onClick={navigateToday}
            className="px-3 py-2 rounded-xl bg-white border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:text-primary hover:bg-surface-container-low shadow-sm transition-colors"
          >
            Hoy
          </button>

          {/* Selector Mes / Semana */}
          <div className="inline-flex bg-white border border-outline-variant/30 rounded-xl p-1 shadow-sm">
            <button
              type="button"
              onClick={() => {
                setViewMode('month');
                setCursorDate(prev => new Date(prev.getFullYear(), prev.getMonth(), 1));
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'month' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Mes
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'week' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Semana
            </button>
          </div>

          {onNewBookingClick && (
            <button
              type="button"
              onClick={onNewBookingClick}
              className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-sm hover:bg-on-primary-fixed-variant transition-all flex items-center gap-1.5 shrink-0"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Nueva Reserva
            </button>
          )}
        </div>
      </div>

      {/* 5 Tarjetas de resumen superior */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#f7ede4] text-terracota flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">pets</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant">
              {viewMode === 'month' ? 'Mascotas este mes' : 'Mascotas esta semana'}
            </p>
            <span className="text-2xl font-extrabold text-on-surface leading-tight">{kpis.activePets}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#f4ece6] text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">date_range</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant">Días ocupados</p>
            <span className="text-2xl font-extrabold text-on-surface leading-tight">
              {kpis.occupiedDays} <span className="text-sm font-semibold text-on-surface-variant/60">/ {kpis.totalDays}</span>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#f5ebe6] text-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">donut_large</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant">Ocupación media</p>
            <span className="text-2xl font-extrabold text-on-surface leading-tight">{kpis.occupancyPct} %</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">login</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant">Próximas entradas</p>
            <span className="text-2xl font-extrabold text-on-surface leading-tight">{kpis.upcomingCheckIns}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex items-center gap-3.5 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">logout</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant">Próximas salidas</p>
            <span className="text-2xl font-extrabold text-on-surface leading-tight">{kpis.upcomingCheckOuts}</span>
          </div>
        </div>
      </div>

      {/* Cuerpo principal: Gantt + Leyenda lateral */}
      {rows.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border border-outline-variant/20 shadow-sm">
          <span className="material-symbols-outlined text-5xl text-outline-variant/40 mb-4 block">analytics</span>
          <p className="font-bold text-lg text-on-surface-variant">No hay mascotas ni reservas registradas para mostrar en el planificador.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 2xl:grid-cols-12 gap-5 items-start">
          {/* Tabla Gantt */}
          <div className="2xl:col-span-10 bg-white rounded-[1.75rem] border border-outline-variant/20 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <div className={viewMode === 'month' ? 'min-w-[1060px]' : 'min-w-[780px]'}>
                {/* Cabecera del Gantt */}
                <div
                  className="bg-surface-container-low/70 border-b border-outline-variant/20 text-[11px] font-bold text-on-surface-variant items-center"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `175px 125px repeat(${visibleDays.length}, minmax(0, 1fr))`
                  }}
                >
                  <div className="px-4 py-3 text-left text-primary">Mascota</div>
                  <div className="px-2 py-3 text-left text-primary">Cliente</div>
                  {visibleDays.map(d => {
                    const dayAvail = availability[d.iso];
                    const isBlocked = dayAvail === 'BLOQUEADO' || dayAvail === 'COMPLETO';
                    return (
                      <div
                        key={d.iso}
                        className={`py-2.5 text-center border-l border-outline-variant/10 flex flex-col items-center justify-center ${
                          d.isToday
                            ? 'bg-primary text-white font-extrabold'
                            : isBlocked
                            ? 'bg-rose-50 text-rose-700'
                            : d.isWeekend
                            ? 'bg-surface-container/60 text-on-surface-variant/80'
                            : ''
                        }`}
                        title={isBlocked ? `${d.iso} — Bloqueado / No disponible` : d.iso}
                      >
                        {viewMode === 'week' && (
                          <span className="text-[9px] uppercase tracking-wider opacity-80">{d.weekday}</span>
                        )}
                        <span>{d.dayNum}</span>
                        {isBlocked && (
                          <span className="material-symbols-outlined text-[10px]">lock</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Filas de Mascotas */}
                <div className="divide-y divide-outline-variant/15">
                  {rows.map(row => (
                    <div
                      key={row.rowId}
                      className="items-center hover:bg-surface-container-low/40 transition-colors"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `175px 125px 1fr`
                      }}
                    >
                      {/* Columna 1: Mascota */}
                      <div className="px-4 py-3.5 flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#f6ede8] border border-primary/15 flex items-center justify-center overflow-hidden shrink-0">
                          {row.photoUrl ? (
                            <img src={resolvePhotoUrl(row.photoUrl)} alt={row.petName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-base text-primary">
                              {(row.petType || '').toLowerCase().includes('perro') ? 'pets' : 'cruelty_free'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 leading-tight">
                          <p className="text-xs font-bold text-on-surface truncate">{row.petName}</p>
                          <p className="text-[10px] text-on-surface-variant/75 truncate">{row.petBreed}</p>
                        </div>
                      </div>

                      {/* Columna 2: Cliente */}
                      <div className="px-2 py-3.5 text-xs font-medium text-on-surface-variant truncate">
                        {row.clientName}
                      </div>

                      {/* Columna 3: Grid de días + Barras continuas */}
                      <div
                        className="relative h-14"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: `repeat(${visibleDays.length}, minmax(0, 1fr))`
                        }}
                      >
                        {/* Fondo de celdas de días */}
                        {visibleDays.map(d => {
                          const dayAvail = availability[d.iso];
                          const isBlocked = dayAvail === 'BLOQUEADO' || dayAvail === 'COMPLETO';
                          return (
                            <div
                              key={d.iso}
                              className={`h-full border-l border-outline-variant/10 ${
                                d.isToday
                                  ? 'bg-primary/[0.06]'
                                  : isBlocked
                                  ? 'bg-rose-50/70'
                                  : d.isWeekend
                                  ? 'bg-surface-container-low/60'
                                  : ''
                              }`}
                            />
                          );
                        })}

                        {/* Barras de reserva posicionadas sobre el grid */}
                        {row.stays.map(stay => {
                          const bStart = (stay.startDate || '').slice(0, 10);
                          const bEnd = (stay.endDate || stay.startDate || '').slice(0, 10);

                          const startIdx = visibleDays.findIndex(d => d.iso >= bStart);
                          const clampedStart = bStart < periodStartIso ? 0 : (startIdx === -1 ? 0 : startIdx);

                          let endIdx = visibleDays.length - 1;
                          if (bEnd <= periodEndIso) {
                            const found = visibleDays.findIndex(d => d.iso === bEnd);
                            if (found !== -1) endIdx = found;
                          }

                          const spanCols = Math.max(1, endIdx - clampedStart + 1);
                          const leftPct = (clampedStart / visibleDays.length) * 100;
                          const widthPct = (spanCols / visibleDays.length) * 100;
                          const visual = classifyService(stay);

                          return (
                            <button
                              key={stay.id}
                              type="button"
                              onClick={() => setSelectedBooking({ ...stay, petName: row.petName, clientName: row.clientName })}
                              style={{
                                left: `calc(${leftPct}% + 2px)`,
                                width: `calc(${widthPct}% - 4px)`,
                                ...visual.style
                              }}
                              className={`absolute top-1.5 bottom-1.5 rounded-xl border px-2.5 flex items-center justify-between gap-1.5 shadow-sm hover:brightness-95 transition-all cursor-pointer overflow-hidden z-10 text-left ${visual.bgClass}`}
                              title={`${row.petName} (${row.clientName}) — ${visual.label} (${formatBarRange(bStart, bEnd)})`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="material-symbols-outlined text-sm shrink-0">{visual.icon}</span>
                                <div className="min-w-0 leading-tight">
                                  <p className="text-[11px] font-bold truncate">{visual.label}</p>
                                  <p className="text-[9px] font-semibold opacity-80 truncate">
                                    {formatBarRange(bStart, bEnd)}
                                  </p>
                                </div>
                              </div>
                              {spanCols >= 3 && (
                                <span
                                  className={`material-symbols-outlined text-sm shrink-0 ${visual.statusColor}`}
                                  style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                  {visual.statusIcon}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Panel lateral: Leyenda y Estados de Reserva */}
          <div className="2xl:col-span-2 bg-white rounded-[1.75rem] border border-outline-variant/20 p-5 shadow-sm space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Leyenda</h3>
              <ul className="space-y-2.5 text-xs text-on-surface-variant font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="w-6 h-5 rounded-md bg-[#ecc3b6] border border-[#cc8e7c] flex items-center justify-center text-[#5a291c] shrink-0">
                    <span className="material-symbols-outlined text-xs">bed</span>
                  </span>
                  <span>Alojamiento</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-6 h-5 rounded-md bg-[#f4dfa8] border border-[#d8b460] flex items-center justify-center text-[#5e440d] shrink-0">
                    <span className="material-symbols-outlined text-xs">wb_sunny</span>
                  </span>
                  <span>Guardería</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-6 h-5 rounded-md bg-[#d4e1ed] border border-[#9bb6cf] flex items-center justify-center text-[#28445e] shrink-0">
                    <span className="material-symbols-outlined text-xs">home</span>
                  </span>
                  <span>Visitas a domicilio</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span
                    className="w-6 h-5 rounded-md border border-[#d6a965] flex items-center justify-center text-[#6d4811] shrink-0"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(-45deg, #f8e9cd, #f8e9cd 4px, #f2dbb1 4px, #f2dbb1 8px)'
                    }}
                  >
                    <span className="material-symbols-outlined text-xs">pending</span>
                  </span>
                  <span>Consulta / Pendiente</span>
                </li>
              </ul>
            </div>

            <div className="border-t border-outline-variant/15 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Estado de la reserva</h3>
              <ul className="space-y-2.5 text-xs text-on-surface-variant font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-base text-emerald-700" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span>Confirmada</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-base text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                  <span>Pendiente</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-base text-sky-600" style={{ fontVariationSettings: "'FILL' 1" }}>help</span>
                  <span>Consulta</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-base text-rose-700">lock</span>
                  <span>Bloqueada / No disponible</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modal rápido de detalle de reserva al hacer clic en una barra */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-[2rem] border border-outline-variant/20 w-full max-w-md p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-outline-variant/15 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-terracota">Detalle de Estancia</span>
                <h3 className="text-lg font-bold text-primary mt-0.5">{selectedBooking.petName}</h3>
                <p className="text-xs text-on-surface-variant">Cliente: <strong>{selectedBooking.clientName || selectedBooking.name}</strong></p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-surface-container-low p-3 rounded-xl">
                <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60">Servicio</p>
                <p className="font-bold text-on-surface mt-0.5">{selectedBooking.service || 'Alojamiento'}</p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-xl">
                <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60">Estado</p>
                <p className={`font-bold mt-0.5 ${selectedBooking.status === 'ACEPTADA' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {selectedBooking.status || 'PENDIENTE'}
                </p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-xl">
                <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60">Entrada</p>
                <p className="font-bold text-on-surface mt-0.5">{selectedBooking.startDate}</p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-xl">
                <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60">Salida</p>
                <p className="font-bold text-on-surface mt-0.5">{selectedBooking.endDate || selectedBooking.startDate}</p>
              </div>
            </div>

            {selectedBooking.notes && (
              <div className="bg-surface-container-low p-3 rounded-xl text-xs">
                <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">Notas</p>
                <p className="text-on-surface">{selectedBooking.notes}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface-variant"
              >
                Cerrar
              </button>
              {onSelectBookingNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBooking(null);
                    onSelectBookingNavigate(selectedBooking);
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-on-primary-fixed-variant"
                >
                  Gestionar en Reservas
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
