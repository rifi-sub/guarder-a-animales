import { useState } from 'react';

export default function DateRangePicker({ startDate, endDate, onChange }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Lunes = 0, Domingo = 6
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (dateStr) => {
    if (!startDate || (startDate && endDate)) {
      onChange({ startDate: dateStr, endDate: '' });
    } else {
      if (dateStr < startDate) {
         onChange({ startDate: dateStr, endDate: startDate });
      } else {
         onChange({ startDate: startDate, endDate: dateStr });
      }
    }
  };

  const renderCalendar = (dateOffset) => {
    const year = new Date(currentDate.getFullYear(), currentDate.getMonth() + dateOffset, 1).getFullYear();
    const month = new Date(currentDate.getFullYear(), currentDate.getMonth() + dateOffset, 1).getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = dateStr < todayStr;
      
      const isStart = startDate === dateStr;
      const isEnd = endDate === dateStr;
      const isBetween = startDate && endDate && dateStr > startDate && dateStr < endDate;
      
      let baseClasses = "h-10 w-full flex items-center justify-center text-sm font-semibold transition-colors ";
      let wrapperClasses = "relative ";

      if (isPast) {
        baseClasses += "text-on-surface-variant/30 cursor-not-allowed";
      } else {
        baseClasses += "cursor-pointer hover:bg-surface-container-high rounded-full ";
        
        if (isStart) {
          baseClasses += "bg-primary text-white hover:bg-primary ";
          if (endDate) wrapperClasses += "after:absolute after:top-0 after:bottom-0 after:right-0 after:w-1/2 after:bg-primary/10 after:-z-10";
        } else if (isEnd) {
          baseClasses += "bg-primary text-white hover:bg-primary ";
          wrapperClasses += "after:absolute after:top-0 after:bottom-0 after:left-0 after:w-1/2 after:bg-primary/10 after:-z-10";
        } else if (isBetween) {
          baseClasses += "bg-primary/10 text-primary rounded-none hover:bg-primary/20 ";
          wrapperClasses += "bg-primary/10";
        } else {
          baseClasses += "text-on-surface ";
        }
      }

      days.push(
        <div key={dateStr} className={wrapperClasses}>
          <button 
            type="button"
            disabled={isPast}
            onClick={() => handleDayClick(dateStr)}
            className={baseClasses}
          >
            {d}
          </button>
        </div>
      );
    }

    return (
      <div className="flex-1">
        <div className="text-center font-bold text-primary mb-4 capitalize">
          {monthNames[month]} {year}
        </div>
        <div className="grid grid-cols-7 gap-y-2 mb-2 text-center text-xs font-bold text-on-surface-variant">
          {dayNames.map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <button type="button" onClick={handlePrevMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <span className="text-sm font-bold uppercase text-on-surface-variant">Selecciona fechas</span>
        <button type="button" onClick={handleNextMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {renderCalendar(0)}
        <div className="hidden md:block w-px bg-outline-variant/20"></div>
        <div className="hidden md:block flex-1">
          {renderCalendar(1)}
        </div>
      </div>
      
      <div className="mt-6 flex justify-between items-center text-sm border-t border-outline-variant/20 pt-4">
        <div>
          <span className="font-bold text-on-surface-variant">Entrada:</span> <span className="text-primary font-bold">{startDate || '—'}</span>
        </div>
        <div>
          <span className="font-bold text-on-surface-variant">Salida:</span> <span className="text-primary font-bold">{endDate || '—'}</span>
        </div>
      </div>
    </div>
  );
}
