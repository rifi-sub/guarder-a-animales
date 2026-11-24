import { useState, useMemo } from 'react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'https://alilyback.duckdns.org/eris';

function resolvePhotoUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  return `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;
}

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function formatShortRange(startStr, endStr) {
  if (!startStr) return '—';
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const s = new Date(startStr + 'T12:00:00');
  const e = endStr ? new Date(endStr + 'T12:00:00') : s;
  if (isNaN(s.getTime())) return startStr;
  const sDay = s.getDate();
  const sMon = months[s.getMonth()];
  if (!endStr || startStr === endStr) return `${sDay} ${sMon}`;
  const eDay = e.getDate();
  const eMon = months[e.getMonth()];
  return sMon === eMon ? `${sDay} – ${eDay} ${sMon}` : `${sDay} ${sMon} – ${eDay} ${eMon}`;
}

export default function CrmDirectoryView({
  clients = [],
  pets = [],
  bookings = [],
  globalSearch,
  setGlobalSearch,
  crmSubTab,
  setCrmSubTab,
  handleSelectClient,
  setCareFormPet,
  // New client form props
  handleCreateClient,
  newClientName, setNewClientName,
  newClientEmail, setNewClientEmail,
  newClientPhone, setNewClientPhone,
  newClientEmergency, setNewClientEmergency,
  newClientNotes, setNewClientNotes,
  // New pet form props
  handleCreatePet,
  newPetClientId, setNewPetClientId,
  newPetName, setNewPetName,
  newPetType, setNewPetType,
  newPetBreed, setNewPetBreed,
  newPetAge, setNewPetAge,
  newPetDiet, setNewPetDiet,
  newPetNotes, setNewPetNotes,
}) {
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'recurrent' | 'incomplete' | 'upcoming' | 'new'
  const [showFiltersBar, setShowFiltersBar] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showNewPetModal, setShowNewPetModal] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const currentMonthPrefix = useMemo(() => todayStr.slice(0, 7), [todayStr]);

  // Enrich each client with booking stats, upcoming stay, completeness, and segment
  const enrichedClients = useMemo(() => {
    return clients.map(client => {
      const clientPets = Array.isArray(client.pets) && client.pets.length > 0
        ? client.pets
        : pets.filter(p => p.clientId === client.id);

      const clientBookings = bookings.filter(b =>
        b.clientId === client.id ||
        (b.email && client.email && b.email.toLowerCase() === client.email.toLowerCase())
      );

      const acceptedOrPending = clientBookings.filter(b => b.status !== 'RECHAZADA' && b.status !== 'CANCELADA');
      const upcomingBookings = acceptedOrPending
        .filter(b => (b.endDate || b.startDate) >= todayStr)
        .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));

      const nextBooking = upcomingBookings[0] || null;
      const isRecurrent = acceptedOrPending.length >= 2 || (client.tags && client.tags.toUpperCase().includes('RECURRENTE'));
      const isNewThisMonth = client.createdAt && String(client.createdAt).startsWith(currentMonthPrefix);

      const hasEmergency = Boolean(client.emergencyContact && client.emergencyContact.trim());
      const allPetsComplete = clientPets.length > 0 && clientPets.every(p => Boolean(p.formFilledAt));
      const isProfileComplete = Boolean(client.phone && client.email && allPetsComplete);

      let segment = 'Nuevo';
      if (isRecurrent) segment = 'Recurrente';
      else if (!isProfileComplete && clientPets.length > 0) segment = 'En seguimiento';

      return {
        ...client,
        clientPets,
        bookingsCount: acceptedOrPending.length,
        nextBooking,
        isRecurrent,
        isNewThisMonth,
        hasEmergency,
        isProfileComplete,
        segment
      };
    });
  }, [clients, pets, bookings, todayStr, currentMonthPrefix]);

  // KPI metrics
  const kpis = useMemo(() => {
    const newThisMonthCount = enrichedClients.filter(c => c.isNewThisMonth).length;
    const upcomingCount = bookings.filter(b =>
      (b.status === 'ACEPTADA' || b.status === 'PENDIENTE') &&
      (b.endDate || b.startDate) >= todayStr
    ).length;
    const incompleteCount = enrichedClients.filter(c => !c.isProfileComplete).length;
    const recurrentCount = enrichedClients.filter(c => c.isRecurrent).length;

    return {
      totalClients: clients.length,
      newThisMonthCount,
      totalPets: pets.length,
      upcomingCount,
      incompleteCount,
      recurrentCount
    };
  }, [enrichedClients, clients.length, pets.length, bookings, todayStr]);

  // Filtered clients
  const visibleClients = useMemo(() => {
    const q = (globalSearch || '').trim().toLowerCase();
    return enrichedClients.filter(c => {
      if (statusFilter === 'recurrent' && !c.isRecurrent) return false;
      if (statusFilter === 'incomplete' && c.isProfileComplete) return false;
      if (statusFilter === 'upcoming' && !c.nextBooking) return false;
      if (statusFilter === 'new' && c.segment !== 'Nuevo') return false;

      if (!q) return true;
      const inClient =
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q);
      const inPets = c.clientPets.some(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.breed || '').toLowerCase().includes(q) ||
        (p.type || '').toLowerCase().includes(q)
      );
      return inClient || inPets;
    });
  }, [enrichedClients, statusFilter, globalSearch]);

  // Filtered pets
  const visiblePets = useMemo(() => {
    const q = (globalSearch || '').trim().toLowerCase();
    return pets.filter(p => {
      if (statusFilter === 'incomplete' && p.formFilledAt) return false;
      if (!q) return true;
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (p.breed || '').toLowerCase().includes(q) ||
        (p.type || '').toLowerCase().includes(q) ||
        (p.client?.name || '').toLowerCase().includes(q)
      );
    });
  }, [pets, statusFilter, globalSearch]);

  const onSubmitNewClient = async (e) => {
    await handleCreateClient(e);
    setShowNewClientModal(false);
  };

  const onSubmitNewPet = async (e) => {
    await handleCreatePet(e);
    setShowNewPetModal(false);
  };

  const openAddPetForClient = (clientId) => {
    setNewPetClientId(String(clientId));
    setShowNewPetModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera superior */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-headline-md text-primary tracking-tight">Directorio CRM</h1>
          <p className="text-sm text-on-surface-variant">Gestión de clientes, mascotas y relaciones.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Buscador */}
          <div className="relative flex-1 sm:flex-none sm:w-72">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-lg">search</span>
            <input
              type="text"
              placeholder="Buscar cliente, mascota, email..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-white border border-outline-variant/30 rounded-xl py-2.5 pl-10 pr-8 text-xs text-on-surface shadow-sm focus:ring-primary focus:border-primary"
            />
            {globalSearch && (
              <button
                type="button"
                onClick={() => setGlobalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>

          {/* Botón filtros */}
          <button
            type="button"
            onClick={() => setShowFiltersBar(v => !v)}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm ${
              showFiltersBar || statusFilter !== 'all'
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-white border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low'
            }`}
            title="Filtrar directorio"
          >
            <span className="material-symbols-outlined text-base">filter_alt</span>
            {statusFilter !== 'all' && <span className="w-2 h-2 rounded-full bg-terracota" />}
          </button>

          {/* Alta ligera en modal */}
          <button
            type="button"
            onClick={() => crmSubTab === 'pets' ? setShowNewPetModal(true) : setShowNewClientModal(true)}
            className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-sm hover:bg-on-primary-fixed-variant transition-all flex items-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            {crmSubTab === 'pets' ? 'Nueva Mascota' : 'Nuevo Cliente'}
          </button>
        </div>
      </div>

      {/* Tarjetas de resumen (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <button
          type="button"
          onClick={() => { setCrmSubTab('clients'); setStatusFilter('all'); }}
          className={`text-left bg-white rounded-2xl p-4 border shadow-sm transition-all flex items-center gap-3.5 hover:border-primary/30 ${
            statusFilter === 'all' && crmSubTab === 'clients' ? 'border-primary/40 ring-1 ring-primary/15' : 'border-outline-variant/20'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-[#f5ebe6] text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">group</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-on-surface-variant truncate">Clientes</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-on-surface leading-tight">{kpis.totalClients}</span>
              {kpis.newThisMonthCount > 0 && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  +{kpis.newThisMonthCount} este mes
                </span>
              )}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setCrmSubTab('pets'); setStatusFilter('all'); }}
          className={`text-left bg-white rounded-2xl p-4 border shadow-sm transition-all flex items-center gap-3.5 hover:border-primary/30 ${
            crmSubTab === 'pets' ? 'border-primary/40 ring-1 ring-primary/15' : 'border-outline-variant/20'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-[#f7ede4] text-terracota flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">pets</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-on-surface-variant truncate">Mascotas</p>
            <span className="text-2xl font-extrabold text-on-surface leading-tight">{kpis.totalPets}</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setCrmSubTab('clients'); setStatusFilter(statusFilter === 'upcoming' ? 'all' : 'upcoming'); }}
          className={`text-left bg-white rounded-2xl p-4 border shadow-sm transition-all flex items-center gap-3.5 hover:border-primary/30 ${
            statusFilter === 'upcoming' ? 'border-primary/40 ring-1 ring-primary/15' : 'border-outline-variant/20'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-[#f4ece6] text-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">event_upcoming</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-on-surface-variant truncate">Reservas próximas</p>
            <span className="text-2xl font-extrabold text-on-surface leading-tight">{kpis.upcomingCount}</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'incomplete' ? 'all' : 'incomplete')}
          className={`text-left bg-white rounded-2xl p-4 border shadow-sm transition-all flex items-center gap-3.5 hover:border-amber-400/50 ${
            statusFilter === 'incomplete' ? 'border-amber-400 ring-1 ring-amber-200' : 'border-outline-variant/20'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">assignment_late</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-on-surface-variant truncate">Fichas incompletas</p>
            <span className="text-2xl font-extrabold text-amber-800 leading-tight">{kpis.incompleteCount}</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setCrmSubTab('clients'); setStatusFilter(statusFilter === 'recurrent' ? 'all' : 'recurrent'); }}
          className={`text-left bg-white rounded-2xl p-4 border shadow-sm transition-all flex items-center gap-3.5 hover:border-rose-300/60 col-span-2 sm:col-span-1 ${
            statusFilter === 'recurrent' ? 'border-primary/40 ring-1 ring-primary/15' : 'border-outline-variant/20'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-[#f9eae6] text-[#9b4f41] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">favorite</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-on-surface-variant truncate">Clientes recurrentes</p>
            <span className="text-2xl font-extrabold text-on-surface leading-tight">{kpis.recurrentCount}</span>
          </div>
        </button>
      </div>

      {/* Barra de filtros desplegable / activa */}
      {(showFiltersBar || statusFilter !== 'all') && (
        <div className="flex flex-wrap items-center gap-2 bg-white/80 border border-outline-variant/20 rounded-2xl px-4 py-2.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 mr-1">Filtrar por:</span>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'recurrent', label: 'Recurrentes' },
            { id: 'upcoming', label: 'Con reserva próxima' },
            { id: 'incomplete', label: 'Ficha incompleta' },
            { id: 'new', label: 'Nuevos' }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                statusFilter === f.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Sub-pestañas Clientes / Mascotas */}
      <div className="flex items-center justify-between border-b border-outline-variant/20">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => setCrmSubTab('clients')}
            className={`pb-3 px-1 text-sm font-bold border-b-2 transition-all ${
              crmSubTab === 'clients' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          >
            Clientes ({visibleClients.length})
          </button>
          <button
            type="button"
            onClick={() => setCrmSubTab('pets')}
            className={`pb-3 px-1 text-sm font-bold border-b-2 transition-all ${
              crmSubTab === 'pets' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          >
            Mascotas ({visiblePets.length})
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowNewPetModal(true)}
          className="mb-2 text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">pets</span>
          + Registrar mascota
        </button>
      </div>

      {/* CONTENIDO: CLIENTES */}
      {crmSubTab === 'clients' ? (
        visibleClients.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-outline-variant/20 p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-4xl text-outline-variant/50 mb-3 block">person_search</span>
            <p className="text-sm font-bold text-on-surface-variant">No hay clientes que coincidan con el filtro actual.</p>
            {statusFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className="mt-3 text-xs font-bold text-primary underline"
              >
                Ver todos los clientes
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {visibleClients.map(client => {
              const firstPetWithPhoto = client.clientPets.find(p => p.photoUrl);
              const channelLabel = (client.preferredChannel || 'WHATSAPP').toUpperCase() === 'EMAIL' ? 'Email' : 'WhatsApp';
              const cleanPhone = (client.phone || '').replace(/[^\d+]/g, '');

              return (
                <div
                  key={client.id}
                  className="bg-white border border-outline-variant/20 rounded-[1.75rem] p-5 shadow-sm hover:shadow-md hover:border-primary/25 transition-all flex flex-col justify-between gap-4"
                >
                  {/* Cabecera tarjeta cliente */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f3dfd6] to-[#e9c8ba] text-primary font-extrabold text-sm flex items-center justify-center shrink-0 overflow-hidden border border-primary/15 shadow-inner">
                        {firstPetWithPhoto ? (
                          <img src={resolvePhotoUrl(firstPetWithPhoto.photoUrl)} alt={client.name} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(client.name)
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-base font-bold text-on-surface truncate">{client.name}</h4>
                          {client.isRecurrent && (
                            <span className="material-symbols-outlined text-sm text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }} title="Cliente recurrente">
                              star
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-on-surface-variant/80 mt-0.5">
                          <span className="truncate max-w-[200px]">{client.email}</span>
                          {client.phone && (
                            <span className="inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px] text-primary/70">call</span>
                              {client.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Etiqueta segmento */}
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 inline-flex items-center gap-1 border ${
                      client.segment === 'Recurrente'
                        ? 'bg-[#f8efe9] text-primary border-primary/20'
                        : client.segment === 'En seguimiento'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-sky-50 text-sky-800 border-sky-200'
                    }`}>
                      <span className="material-symbols-outlined text-xs">
                        {client.segment === 'Recurrente' ? 'autorenew' : client.segment === 'En seguimiento' ? 'schedule' : 'verified'}
                      </span>
                      {client.segment}
                    </span>
                  </div>

                  {/* Zona central: Mascotas + Estado de ficha y detalles */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-3 border-t border-outline-variant/15 items-start">
                    {/* Mascotas */}
                    <div className="sm:col-span-6 space-y-2">
                      <p className="text-[11px] font-bold text-on-surface-variant">
                        Mascotas ({client.clientPets.length})
                      </p>
                      {client.clientPets.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => openAddPetForClient(client.id)}
                          className="text-xs text-primary/80 hover:text-primary font-semibold inline-flex items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-xl border border-dashed border-primary/30"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                          Añadir primera mascota
                        </button>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {client.clientPets.map(pet => (
                            <button
                              key={pet.id}
                              type="button"
                              onClick={() => setCareFormPet(pet)}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-surface-container-low hover:bg-[#f3e8e2] border border-outline-variant/20 transition-colors text-left"
                              title={`Abrir ficha de cuidados de ${pet.name}`}
                            >
                              <div className="w-7 h-7 rounded-full bg-white border border-outline-variant/20 flex items-center justify-center overflow-hidden shrink-0">
                                {pet.photoUrl ? (
                                  <img src={resolvePhotoUrl(pet.photoUrl)} alt={pet.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="material-symbols-outlined text-sm text-primary">
                                    {(pet.type || '').toLowerCase().includes('perro') ? 'pets' : 'cruelty_free'}
                                  </span>
                                )}
                              </div>
                              <div className="leading-tight">
                                <p className="text-xs font-bold text-on-surface">{pet.name}</p>
                                <p className="text-[10px] text-on-surface-variant">{pet.breed || pet.type || 'Sin raza'}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Canal, Emergencia, Próxima estancia y Estado ficha */}
                    <div className="sm:col-span-6 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm text-primary/70">
                            {channelLabel === 'Email' ? 'mail' : 'chat'}
                          </span>
                          Canal: <strong className="text-on-surface">{channelLabel}</strong>
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 shrink-0 ${
                          client.isProfileComplete
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          <span className="material-symbols-outlined text-[12px]">
                            {client.isProfileComplete ? 'check_circle' : 'warning'}
                          </span>
                          {client.isProfileComplete ? 'Ficha completa' : 'Ficha incompleta'}
                        </span>
                      </div>

                      <p className="text-on-surface-variant flex items-center gap-1.5 truncate" title={client.emergencyContact || 'No registrado'}>
                        <span className="material-symbols-outlined text-sm text-terracota">emergency</span>
                        <span className="truncate">
                          Emergencia: <span className={client.hasEmergency ? 'text-on-surface font-medium' : 'text-on-surface-variant/60 italic'}>
                            {client.emergencyContact || 'No registrado'}
                          </span>
                        </span>
                      </p>

                      <p className="text-on-surface-variant flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-primary/70">calendar_month</span>
                        <span>
                          Próxima estancia:{' '}
                          <strong className={client.nextBooking ? 'text-primary' : 'text-on-surface-variant/50 font-normal'}>
                            {client.nextBooking ? formatShortRange(client.nextBooking.startDate, client.nextBooking.endDate) : '—'}
                          </strong>
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Barra inferior de accesos rápidos */}
                  <div className="flex items-center justify-between pt-3 border-t border-outline-variant/10">
                    <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-wider">
                      ID #{client.id} · {client.bookingsCount} {client.bookingsCount === 1 ? 'reserva' : 'reservas'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSelectClient(client)}
                        className="px-3 py-1.5 rounded-lg bg-[#f6ede8] hover:bg-primary/15 text-primary text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                        title="Abrir ficha completa y notas del cliente"
                      >
                        <span className="material-symbols-outlined text-sm">badge</span>
                        Ficha & Notas
                      </button>

                      <button
                        type="button"
                        onClick={() => openAddPetForClient(client.id)}
                        className="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
                        title="Añadir mascota a este cliente"
                      >
                        <span className="material-symbols-outlined text-base">pets</span>
                      </button>

                      {cleanPhone && (
                        <a
                          href={`https://wa.me/${cleanPhone.startsWith('+') ? cleanPhone.slice(1) : `34${cleanPhone}`}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-surface-container-low hover:bg-emerald-50 text-on-surface-variant hover:text-emerald-700 transition-colors"
                          title="Enviar WhatsApp"
                        >
                          <span className="material-symbols-outlined text-base">chat</span>
                        </a>
                      )}

                      {client.email && (
                        <a
                          href={`mailto:${client.email}`}
                          className="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
                          title="Enviar correo"
                        >
                          <span className="material-symbols-outlined text-base">mail</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* CONTENIDO: MASCOTAS */
        visiblePets.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-outline-variant/20 p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-4xl text-outline-variant/50 mb-3 block">pets</span>
            <p className="text-sm font-bold text-on-surface-variant">No hay mascotas que coincidan con el filtro actual.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {visiblePets.map(pet => (
              <div
                key={pet.id}
                className="bg-white border border-outline-variant/20 rounded-[1.75rem] p-5 shadow-sm hover:shadow-md hover:border-primary/25 transition-all flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-[#f6ede8] border border-primary/15 flex items-center justify-center overflow-hidden shrink-0">
                      {pet.photoUrl ? (
                        <img src={resolvePhotoUrl(pet.photoUrl)} alt={pet.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-3xl text-primary">
                          {(pet.type || '').toLowerCase().includes('perro') ? 'pets' : 'cruelty_free'}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-on-surface">{pet.name}</h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                          {pet.type}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {pet.breed || 'Sin raza'} · {pet.age || 'Edad no indicada'}
                      </p>
                      <p className="text-[11px] text-on-surface-variant/80 mt-0.5">
                        Dueño: <strong className="text-primary">{pet.client?.name || 'Sin asignar'}</strong>
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 shrink-0 ${
                    pet.formFilledAt
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    <span className="material-symbols-outlined text-xs">
                      {pet.formFilledAt ? 'check_circle' : 'warning'}
                    </span>
                    {pet.formFilledAt ? 'Ficha completa' : 'Ficha incompleta'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-surface-container-low p-3 rounded-xl">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60">Alimentación / Dieta</p>
                    <p className="text-on-surface mt-1 font-medium line-clamp-2">{pet.diet || 'Estándar'}</p>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-xl">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60">Médico y Comportamiento</p>
                    <p className="text-on-surface mt-1 font-medium line-clamp-2">{pet.medicalNotes || 'Sin observaciones médicas'}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-outline-variant/10">
                  <button
                    type="button"
                    onClick={() => setCareFormPet(pet)}
                    className="px-3.5 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">assignment</span>
                    {pet.formFilledAt ? 'Ver / Editar Ficha' : 'Completar Ficha'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* MODAL: NUEVO CLIENTE */}
      {showNewClientModal && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowNewClientModal(false)}
        >
          <div
            className="bg-white rounded-[2rem] border border-outline-variant/20 w-full max-w-md p-7 shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">person_add</span>
                Registrar nuevo Cliente
              </h3>
              <button
                type="button"
                onClick={() => setShowNewClientModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <form onSubmit={onSubmitNewClient} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Nombre Completo *</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Email *</label>
                <input
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  placeholder="juan@email.com"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Teléfono</label>
                <input
                  type="tel"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="600 000 000"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Contacto de Emergencia</label>
                <input
                  type="text"
                  value={newClientEmergency}
                  onChange={(e) => setNewClientEmergency(e.target.value)}
                  placeholder="Nombre y telf (ej. Hermana 600...)"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Notas del Cliente</label>
                <textarea
                  value={newClientNotes}
                  onChange={(e) => setNewClientNotes(e.target.value)}
                  placeholder="Observaciones generales..."
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-sm"
                  rows="2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface-variant"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-on-primary-fixed-variant transition-colors"
                >
                  Añadir Cliente al CRM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA MASCOTA */}
      {showNewPetModal && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowNewPetModal(false)}
        >
          <div
            className="bg-white rounded-[2rem] border border-outline-variant/20 w-full max-w-md p-7 shadow-2xl my-auto max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">pets</span>
                Registrar nueva Mascota
              </h3>
              <button
                type="button"
                onClick={() => setShowNewPetModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <form onSubmit={onSubmitNewPet} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Propietario (CRM)</label>
                <select
                  value={newPetClientId}
                  onChange={(e) => setNewPetClientId(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface"
                  required
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Nombre *</label>
                  <input
                    type="text"
                    value={newPetName}
                    onChange={(e) => setNewPetName(e.target.value)}
                    placeholder="Kira"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Tipo</label>
                  <select
                    value={newPetType}
                    onChange={(e) => setNewPetType(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface"
                  >
                    <option>Gato</option>
                    <option>Perro</option>
                    <option>Pequeño mamífero</option>
                    <option>Otros</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Raza</label>
                  <input
                    type="text"
                    value={newPetBreed}
                    onChange={(e) => setNewPetBreed(e.target.value)}
                    placeholder="Ej. Persa"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Edad</label>
                  <input
                    type="text"
                    value={newPetAge}
                    onChange={(e) => setNewPetAge(e.target.value)}
                    placeholder="Ej. 3 años"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Alimentación</label>
                <textarea
                  value={newPetDiet}
                  onChange={(e) => setNewPetDiet(e.target.value)}
                  placeholder="Tipo de pienso, porciones, horarios..."
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-sm"
                  rows="2"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Notas Médicas / Cuidados</label>
                <textarea
                  value={newPetNotes}
                  onChange={(e) => setNewPetNotes(e.target.value)}
                  placeholder="Medicación habitual, miedos, alergias..."
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-sm"
                  rows="2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPetModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface-variant"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-on-primary-fixed-variant transition-colors"
                >
                  Registrar Mascota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
