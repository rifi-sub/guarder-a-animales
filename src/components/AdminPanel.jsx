import { useState, useEffect, useMemo } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'https://alilyback.duckdns.org/eris';

const statuses = ['bg-green-500', 'bg-red-400', 'bg-orange-300'];
const statusLabels = {
  'bg-green-500': 'Disponible',
  'bg-red-400': 'Reservado',
  'bg-orange-300': 'Consultar'
};

export default function AdminPanel() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Navegación principal del Dashboard
  const [activeTab, setActiveTab] = useState('bookings'); // bookings, crm, planner, tasks, availability

  // Datos del Dashboard
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [pets, setPets] = useState([]);
  const [availability, setAvailability] = useState({});

  // Tareas Diarias
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    // Forzar fecha en Julio 2026 para demostración del seeding, si no es Julio 2026
    const year = today.getFullYear();
    if (year === 2026 && today.getMonth() === 6) {
      return today.toISOString().split('T')[0];
    }
    return '2026-07-13'; // Por defecto el día sembrado para ver datos de ejemplo
  });
  const [dailyTasks, setDailyTasks] = useState([]);
  const [boardedPets, setBoardedPets] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPetId, setNewTaskPetId] = useState('');

  // Formularios de CRM
  const [crmSubTab, setCrmSubTab] = useState('clients'); // clients, pets
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmergency, setNewClientEmergency] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');

  const [newPetName, setNewPetName] = useState('');
  const [newPetType, setNewPetType] = useState('Gato');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetAge, setNewPetAge] = useState('');
  const [newPetDiet, setNewPetDiet] = useState('');
  const [newPetNotes, setNewPetNotes] = useState('');
  const [newPetClientId, setNewPetClientId] = useState('');

  // Tarifas y cálculos
  const [rates, setRates] = useState([]);

  // Ficha de cliente seleccionada en CRM y sus interacciones
  const [selectedClient, setSelectedClient] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [newInteractionType, setNewInteractionType] = useState('NOTA');
  const [newInteractionContent, setNewInteractionContent] = useState('');

  // Edición financiera de Reservas
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editingPrice, setEditingPrice] = useState('');
  const [editingPaymentStatus, setEditingPaymentStatus] = useState('PENDIENTE');
  const [editingPaymentMethod, setEditingPaymentMethod] = useState('');

  // Fase 2: Pestañas de Cliente, Modos y Buscador
  const [selectedClientTab, setSelectedClientTab] = useState('resumen');
  const [workMode, setWorkMode] = useState('RECEPTION'); // RECEPTION o CARE
  const [globalSearch, setGlobalSearch] = useState('');
  const [bookingViewType, setBookingViewType] = useState('list'); // list o kanban

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '¡Entendido!',
      steps: [
        { popover: { title: 'Bienvenido al CRM de Eris Pet Care', description: 'Vamos a dar un paseo rápido por las principales funcionalidades del panel de administración.' } },
        { element: '#tour-nav-bookings', popover: { title: 'Gestión de Reservas', description: 'Aquí entrarán todas las solicitudes de la web. Puedes aceptarlas, rechazarlas o pedir más info. Al aceptarlas, se calculan los precios y se añade al cliente al CRM automáticamente.', side: "right", align: 'start' }},
        { element: '#tour-nav-crm', popover: { title: 'Directorio CRM', description: 'Tu base de datos permanente. Fichas 360º de dueños y mascotas, con historial de interacciones, notas veterinarias y más.', side: "right", align: 'start' }},
        { element: '#tour-nav-planner', popover: { title: 'Planificador Gantt', description: 'Visión a largo plazo de las estancias. Útil para ver picos de ocupación.', side: "right", align: 'start' }},
        { element: '#tour-nav-tasks', popover: { title: 'Agenda Diaria', description: 'Lista de mascotas hospedadas hoy y checklist de tareas diarias (paseos, medicinas).', side: "right", align: 'start' }},
        { element: '#tour-care-mode', popover: { title: 'Modo Cuidados', description: '¿Sales al campo? Haz clic aquí para activar el Modo App Móvil, con botones gigantes y navegación táctil optimizada.', side: "bottom", align: 'center' }},
      ]
    });
    driverObj.drive();
  };

  useEffect(() => {
    if (token) {
      const hasSeenTour = localStorage.getItem('hasSeenTour');
      if (!hasSeenTour) {
        localStorage.setItem('hasSeenTour', 'true');
        setTimeout(() => {
          startTour();
        }, 800);
      }
    }
  }, [token]);

  // Cargar datos al cambiar de pestaña o token
  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, activeTab, selectedDate]);

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Reservas
      if (activeTab === 'bookings' || activeTab === 'planner') {
        const res = await fetch(`${API_BASE}/api/admin/bookings`, { headers });
        if (res.ok) setBookings(await res.json());
        else if (res.status === 401 || res.status === 403) handleLogout();
      }

      // 2. CRM Clientes
      if (activeTab === 'crm' || activeTab === 'planner') {
        const resC = await fetch(`${API_BASE}/api/admin/clients`, { headers });
        if (resC.ok) {
          const data = await resC.json();
          setClients(data);
          if (data.length > 0 && !newPetClientId) setNewPetClientId(data[0].id.toString());
        }
      }

      // 3. CRM Mascotas
      if (activeTab === 'crm' || activeTab === 'planner' || activeTab === 'tasks') {
        const resP = await fetch(`${API_BASE}/api/admin/pets`, { headers });
        if (resP.ok) setPets(await resP.json());
      }

      // 4. Calendario Disponibilidad
      if (activeTab === 'availability' || activeTab === 'planner') {
        const resA = await fetch(`${API_BASE}/api/availability`);
        if (resA.ok) {
          const data = await resA.json();
          const mapping = {};
          data.forEach(item => {
            mapping[item.date] = item.status;
          });
          setAvailability(mapping);
        }
      }

      // 5. Tareas y mascotas activas para una fecha seleccionada
      if (activeTab === 'tasks') {
        const resT = await fetch(`${API_BASE}/api/admin/tasks?date=${selectedDate}`, { headers });
        if (resT.ok) {
          const data = await resT.json();
          setDailyTasks(data.tasks);
          setBoardedPets(data.boardedPets);
          if (data.boardedPets.length > 0) {
            setNewTaskPetId(data.boardedPets[0].id.toString());
          } else {
            setNewTaskPetId('');
          }
        }
      }

      // 6. Tarifas de servicios (para configurador y presupuestos)
      if (activeTab === 'rates' || activeTab === 'bookings') {
        const resR = await fetch(`${API_BASE}/api/admin/rates`, { headers });
        if (resR.ok) setRates(await resR.json());
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Credenciales incorrectas');
      localStorage.setItem('adminToken', data.token);
      setToken(data.token);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken('');
  };

  // --- ACCIONES DE TARIFAS ---
  const handleSaveRate = async (serviceName, ratePerUnit, unitType) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ serviceName, ratePerUnit: parseFloat(ratePerUnit), unitType })
      });
      if (res.ok) {
        alert('Tarifa guardada correctamente.');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al guardar tarifa');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    }
  };

  // --- ACCIONES DE INTERACCIONES ---
  const handleSelectClient = async (client) => {
    setSelectedClient(client);
    setSelectedClientTab('resumen');
    setNewInteractionContent('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/clients/${client.id}/interactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setInteractions(await res.json());
      }
    } catch (err) {
      console.error('Error fetching interactions:', err);
    }
  };

  const handleCreateInteraction = async (e) => {
    e.preventDefault();
    if (!newInteractionContent || !selectedClient) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/clients/${selectedClient.id}/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: newInteractionType, content: newInteractionContent })
      });
      if (res.ok) {
        setNewInteractionContent('');
        // Recargar interacciones
        handleSelectClient(selectedClient);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- EDICIÓN FINANCIERA DE RESERVAS ---
  const handleSaveBookingPayment = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          price: editingPrice ? parseFloat(editingPrice) : null,
          paymentStatus: editingPaymentStatus,
          paymentMethod: editingPaymentMethod || null
        })
      });
      if (res.ok) {
        setEditingBookingId(null);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al guardar cambios de pago');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    }
  };

  const startEditingBooking = (booking) => {
    setEditingBookingId(booking.id);
    setEditingPrice(booking.price ? booking.price.toString() : '');
    setEditingPaymentStatus(booking.paymentStatus || 'PENDIENTE');
    setEditingPaymentMethod(booking.paymentMethod || '');
  };

  const generateWhatsAppLink = (phone, text) => {
    if (!phone) return '#';
    let cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone.startsWith('34')) {
      cleanPhone = '34' + cleanPhone; // Asumir España por defecto
    }
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const getWhatsAppMessage = (booking) => {
    return `¡Hola ${booking.name}! 🐾 Confirmamos la reserva para los cuidados del ${booking.startDate} al ${booking.endDate}. El presupuesto estimado es de ${booking.price ? booking.price + '€' : 'pendiente de calcular'}. ¡Cualquier duda nos dices!`;
  };

  // --- DRAG AND DROP KANBAN ---
  const handleDragStart = (e, bookingId) => {
    e.dataTransfer.setData('text/plain', bookingId.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const bookingIdStr = e.dataTransfer.getData('text/plain');
    if (!bookingIdStr) return;
    const bookingId = parseInt(bookingIdStr, 10);
    
    try {
      const res = await fetch(`${API_BASE}/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: targetStatus })
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al cambiar estado de reserva');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- ACCIONES DE RESERVAS ---

  const handleAcceptBooking = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/bookings/${id}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        alert('Reserva aceptada. Se ha creado/vinculado la ficha del cliente y su mascota en el CRM, y se han generado las tareas diarias automáticas.');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al procesar reserva');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    }
  };

  const handleRejectBooking = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/bookings/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReopenBooking = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/bookings/${id}/reopen`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadInvoice = async (bookingId) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/bookings/${bookingId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Error al generar la factura');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Factura-Reserva-${bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('No se pudo generar la factura. Asegúrate de que la reserva está en estado Aceptado.');
    }
  };

  // --- CRM: ACCIONES ---

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newClientName,
          email: newClientEmail,
          phone: newClientPhone,
          emergencyContact: newClientEmergency,
          notes: newClientNotes
        })
      });
      if (res.ok) {
        alert('Cliente registrado con éxito');
        setNewClientName('');
        setNewClientEmail('');
        setNewClientPhone('');
        setNewClientEmergency('');
        setNewClientNotes('');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al crear cliente');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePet = async (e) => {
    e.preventDefault();
    if (!newPetClientId) {
      alert('Debes seleccionar un propietario.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/admin/pets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newPetName,
          type: newPetType,
          breed: newPetBreed,
          age: newPetAge,
          diet: newPetDiet,
          medicalNotes: newPetNotes,
          clientId: parseInt(newPetClientId, 10)
        })
      });
      if (res.ok) {
        alert('Mascota registrada con éxito');
        setNewPetName('');
        setNewPetBreed('');
        setNewPetAge('');
        setNewPetDiet('');
        setNewPetNotes('');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al registrar mascota');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- TAREAS DIARIAS: ACCIONES ---

  const handleToggleTask = async (id, currentVal) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isCompleted: !currentVal })
      });
      if (res.ok) {
        setDailyTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !currentVal } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: selectedDate,
          title: newTaskTitle,
          description: newTaskDesc,
          petId: newTaskPetId ? parseInt(newTaskPetId, 10) : null
        })
      });
      if (res.ok) {
        setNewTaskTitle('');
        setNewTaskDesc('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setDailyTasks(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- DISPONIBILIDAD: ACCIONES ---

  const toggleDayStatus = async (dayNum) => {
    const dateStr = `2026-07-${String(dayNum).padStart(2, '0')}`;
    let currentStatus = availability[dateStr];
    if (!currentStatus) {
      if (dayNum === 1) currentStatus = 'bg-green-500';
      else if (dayNum === 2) currentStatus = 'bg-orange-300';
      else if (dayNum === 3) currentStatus = 'bg-red-400';
      else if (dayNum === 4) currentStatus = 'bg-green-500';
      else if (dayNum === 5) currentStatus = 'bg-orange-300';
      else {
        const seed = (dayNum * 31 + 17) % statuses.length;
        currentStatus = statuses[seed];
      }
    }

    let nextStatus = '';
    if (currentStatus === 'bg-green-500') nextStatus = 'bg-orange-300';
    else if (currentStatus === 'bg-orange-300') nextStatus = 'bg-red-400';
    else nextStatus = 'bg-green-500';

    try {
      const res = await fetch(`${API_BASE}/api/admin/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: dateStr, status: nextStatus })
      });
      if (res.ok) {
        setAvailability(prev => ({ ...prev, [dateStr]: nextStatus }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Pre-generar días de Julio 2026
  const calendarDays = useMemo(() => {
    const list = [];
    for (let i = 1; i <= 31; i++) {
      const dateStr = `2026-07-${String(i).padStart(2, '0')}`;
      let status = availability[dateStr];
      if (!status) {
        if (i === 1) status = 'bg-green-500';
        else if (i === 2) status = 'bg-orange-300';
        else if (i === 3) status = 'bg-red-400';
        else if (i === 4) status = 'bg-green-500';
        else if (i === 5) status = 'bg-orange-300';
        else {
          const seed = (i * 31 + 17) % statuses.length;
          status = statuses[seed];
        }
      }
      list.push({ day: i, status });
    }
    return list;
  }, [availability]);

  // Si no hay token de autenticación, mostrar login
  if (!token) {
    return (
      <section className="min-h-screen bg-background py-20 px-margin-mobile flex items-center justify-center font-body-md text-on-surface">
        <div className="w-full max-w-md bg-white border border-outline-variant/30 rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-terracota to-secondary-fixed"></div>
          
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-terracota mb-2 block">ADMINISTRACIÓN</span>
            <h2 className="font-display-lg text-headline-sm text-primary">Eris Pet Care</h2>
            <p className="text-xs text-on-surface-variant mt-2">Acceso protegido por clave única (JWT)</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl flex items-center gap-3 text-sm">
              <span className="material-symbols-outlined text-rose-600">error</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Email Administrador</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@eris-mascotas.es"
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 focus:ring-primary focus:border-primary text-sm text-on-surface"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 focus:ring-primary focus:border-primary text-sm text-on-surface"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
              <span className="material-symbols-outlined text-sm">lock_open</span>
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <a href="/" className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-xs">arrow_back</span>
              Volver a la web pública
            </a>
          </div>
        </div>
      </section>
    );
  }

  const filteredClients = useMemo(() => {
    if (!globalSearch) return clients;
    const lower = globalSearch.toLowerCase();
    return clients.filter(c => 
      c.name.toLowerCase().includes(lower) || 
      c.email.toLowerCase().includes(lower) || 
      c.phone.includes(lower) ||
      (c.pets && c.pets.some(p => p.name.toLowerCase().includes(lower)))
    );
  }, [clients, globalSearch]);

  const filteredPets = useMemo(() => {
    if (!globalSearch) return pets;
    const lower = globalSearch.toLowerCase();
    return pets.filter(p => 
      p.name.toLowerCase().includes(lower) || 
      p.type.toLowerCase().includes(lower) || 
      (p.client && p.client.name.toLowerCase().includes(lower))
    );
  }, [pets, globalSearch]);

  // Interfaz de Dashboard Completo (con Sidebar Lateral)
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-body-md text-on-surface">
      
      {/* SIDEBAR LATERAL (Solo Mostrador) */}
      {workMode === 'RECEPTION' && (
        <aside className="w-full md:w-80 bg-white border-r border-outline-variant/20 flex flex-col justify-between shrink-0 p-8">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-xl">admin_panel_settings</span>
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-primary tracking-tight leading-tight">Eris Admin</h2>
              <p className="text-[10px] text-on-surface-variant font-bold tracking-widest uppercase">Workspace</p>
            </div>
          </div>

          {/* Toggle Modo Cuidados (Solo Visible en Mostrador) */}
          <button 
            id="tour-care-mode"
            onClick={() => { setWorkMode('CARE'); setActiveTab('tasks'); }}
            className="w-full mb-8 bg-surface-container-low border border-outline-variant/30 text-on-surface p-4 rounded-2xl flex items-center gap-3 hover:bg-primary/5 hover:border-primary/30 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-outline-variant/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-lg">smartphone</span>
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold text-primary mb-0.5 uppercase tracking-wider">Entrar Modo Cuidados</span>
              <span className="block text-[10px] text-on-surface-variant leading-tight">Optimizado para tablet/móvil con Bottom Nav</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant/30 ml-auto group-hover:text-primary transition-colors">chevron_right</span>
          </button>

          {/* Menú de Navegación */}
          <nav className="space-y-2">
            <button
              id="tour-nav-bookings"
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'bookings'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined">forum</span>
              Recepción Reservas
              {bookings.filter(b => b.status === 'PENDIENTE').length > 0 && (
                <span className="ml-auto bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                  {bookings.filter(b => b.status === 'PENDIENTE').length}
                </span>
              )}
            </button>

            <button
              id="tour-nav-crm"
              onClick={() => setActiveTab('crm')}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'crm'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined">contacts</span>
              Directorio CRM
            </button>

            <button
              id="tour-nav-planner"
              onClick={() => setActiveTab('planner')}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'planner'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined">analytics</span>
              Planificador Gantt
            </button>

            <button
              id="tour-nav-tasks"
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'tasks'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined">event_note</span>
              Tareas Diarias
            </button>

            <button
              onClick={() => setActiveTab('availability')}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'availability'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined">calendar_month</span>
              Disponibilidad Web
            </button>

            <button
              onClick={() => setActiveTab('rates')}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'rates'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined">payments</span>
              Configurar Tarifas
            </button>
          </nav>
        </div>

        {/* Info de Sesión y Salida */}
        <div className="mt-12 pt-6 border-t border-outline-variant/10 text-center md:text-left space-y-4">
          <div>
            <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest font-bold">Administrador</p>
            <p className="text-xs font-semibold text-primary truncate">admin@eris-mascotas.es</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={startTour}
              className="flex-1 border border-outline-variant/30 text-on-surface px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-surface-container transition-colors flex items-center justify-center gap-1.5"
              title="Guía Rápida"
            >
              <span className="material-symbols-outlined text-xs">help</span>
              Tour
            </button>
            <a
              href="/"
              className="w-10 h-10 border border-outline-variant/30 text-on-surface hover:bg-surface-container rounded-xl flex items-center justify-center transition-colors"
              title="Ver Web"
            >
              <span className="material-symbols-outlined text-sm">arrow_outward</span>
            </a>
            <button
              onClick={handleLogout}
              className="w-10 h-10 border border-outline-variant/30 text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-xl flex items-center justify-center transition-colors"
              title="Cerrar sesión"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        </div>
      </aside>
      )}

      {/* ÁREA PRINCIPAL DE CONTENIDO */}
      <main className={`flex-1 overflow-y-auto max-w-7xl mx-auto w-full transition-all ${workMode === 'CARE' ? 'p-4 pb-28 md:p-8 md:pb-32' : 'p-8 md:p-12'}`}>
        
        {/* TAB 1: RESERVAS */}
        {activeTab === 'bookings' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
              <div>
                <h1 className="font-display-lg text-headline-md text-primary">Solicitudes de Reserva</h1>
                <p className="text-sm text-on-surface-variant">Gestión de contacto entrante y conversión automática al CRM.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/15">
                  <button
                    type="button"
                    onClick={() => setBookingViewType('list')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      bookingViewType === 'list' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
                    Vista Lista
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingViewType('kanban')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      bookingViewType === 'kanban' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">view_week</span>
                    Tablero Kanban
                  </button>
                </div>
                <button
                  onClick={fetchData}
                  className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-white transition-colors"
                  title="Actualizar datos"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">refresh</span>
                </button>
              </div>
            </div>

            {bookingViewType === 'list' ? (
              bookings.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-12 text-center border border-outline-variant/20 shadow-sm">
                  <span className="material-symbols-outlined text-5xl text-outline-variant/40 mb-4 block">mail_outline</span>
                  <p className="font-bold text-lg text-on-surface-variant">No hay solicitudes registradas.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white border border-outline-variant/20 rounded-[2rem] p-6 md:p-8 shadow-sm flex flex-col lg:flex-row justify-between gap-6 hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${
                        booking.status === 'PENDIENTE' ? 'bg-orange-300' :
                        booking.status === 'ACEPTADA' || booking.status === 'RESERVADA' ? 'bg-emerald-500' :
                        booking.status === 'VISITA' ? 'bg-indigo-400' :
                        booking.status === 'PROGRESO' ? 'bg-sky-400' : 'bg-rose-400'
                      }`}></div>

                      <div className="flex-1 space-y-4 pl-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-bold text-primary">{booking.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                            booking.status === 'PENDIENTE' ? 'bg-orange-100 text-orange-800' :
                            booking.status === 'ACEPTADA' || booking.status === 'RESERVADA' ? 'bg-emerald-100 text-emerald-800' :
                            booking.status === 'VISITA' ? 'bg-indigo-100 text-indigo-800' :
                            booking.status === 'PROGRESO' ? 'bg-sky-100 text-sky-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {booking.status}
                          </span>
                          
                          {booking.client && (
                            <span className="px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md text-[10px] font-bold uppercase tracking-wider">
                              Ficha CRM vinculada
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm bg-surface-container-low p-4 rounded-2xl">
                          <div>
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Email</p>
                            <p className="font-semibold text-primary/95 break-all">{booking.email}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Teléfono</p>
                            <p className="font-semibold text-primary/95">{booking.phone || 'No indicado'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Servicio / Mascota</p>
                            <p className="font-semibold text-primary/95">{booking.service} ({booking.petType})</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Fechas Estancia</p>
                            <p className="font-semibold text-terracota font-bold">{booking.startDate} al {booking.endDate}</p>
                          </div>
                        </div>

                        {/* INFORMACIÓN DE PRECIOS Y PAGOS */}
                        {editingBookingId === booking.id ? (
                          <div className="bg-surface-container p-5 rounded-2xl border border-primary/20 space-y-4">
                            <p className="text-xs font-bold text-primary uppercase tracking-wider">Editar Datos de Pago</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Importe (€)</label>
                                <input
                                  type="number"
                                  value={editingPrice}
                                  onChange={(e) => setEditingPrice(e.target.value)}
                                  className="w-full bg-white border border-outline-variant/30 rounded-xl p-2.5 text-xs font-semibold focus:ring-primary focus:border-primary text-right"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Estado de Pago</label>
                                <select
                                  value={editingPaymentStatus}
                                  onChange={(e) => setEditingPaymentStatus(e.target.value)}
                                  className="w-full bg-white border border-outline-variant/30 rounded-xl p-2.5 text-xs font-semibold focus:ring-primary focus:border-primary text-on-surface-variant"
                                >
                                  <option value="PENDIENTE">PENDIENTE</option>
                                  <option value="SEÑA">SEÑA RECIBIDA</option>
                                  <option value="PAGADO">PAGADO</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Método de Pago</label>
                                <select
                                  value={editingPaymentMethod}
                                  onChange={(e) => setEditingPaymentMethod(e.target.value)}
                                  className="w-full bg-white border border-outline-variant/30 rounded-xl p-2.5 text-xs font-semibold focus:ring-primary focus:border-primary text-on-surface-variant"
                                >
                                  <option value="">Sin definir</option>
                                  <option value="BIZUM">BIZUM</option>
                                  <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                                  <option value="EFECTIVO">EFECTIVO</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingBookingId(null)}
                                className="px-4 py-2 border border-outline-variant/30 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveBookingPayment(booking.id)}
                                className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:scale-[0.98] transition-transform"
                              >
                                Guardar Cambios
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/5">
                            <div>
                              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Presupuesto</p>
                              <p className="font-bold text-primary text-sm mt-0.5">{booking.price ? `${booking.price} €` : 'No calculado'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Estado de Pago</p>
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase mt-1 ${
                                booking.paymentStatus === 'PAGADO' ? 'bg-emerald-100 text-emerald-800' :
                                booking.paymentStatus === 'SEÑA' ? 'bg-sky-100 text-sky-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {booking.paymentStatus || 'PENDIENTE'}
                              </span>
                            </div>
                            <div>
                              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Método</p>
                              <p className="font-semibold text-on-surface mt-0.5">{booking.paymentMethod || 'No indicado'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Origen / Canal</p>
                              <p className="font-semibold text-on-surface mt-0.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">
                                  {booking.source === 'WHATSAPP' ? 'chat' : 'language'}
                                </span>
                                {booking.source || 'WEB'}
                              </p>
                            </div>
                          </div>
                        )}

                        {booking.message && (
                          <div>
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">Mensaje</p>
                            <p className="text-sm bg-background border border-outline-variant/10 p-4 rounded-xl italic text-on-surface-variant">
                              "{booking.message}"
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-row lg:flex-col justify-end items-center gap-3 border-t lg:border-t-0 lg:border-l border-outline-variant/10 pt-4 lg:pt-0 lg:pl-6 shrink-0 min-w-[170px]">
                        {booking.status === 'PENDIENTE' ? (
                          <>
                            <button
                              onClick={() => handleAcceptBooking(booking.id)}
                              className="w-full bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-sm">check</span>
                              Aceptar y Guardar CRM
                            </button>
                            <button
                              onClick={() => handleRejectBooking(booking.id)}
                              className="w-full bg-rose-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-rose-700 transition-colors flex items-center justify-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-sm">close</span>
                              Rechazar
                            </button>
                          </>
                        ) : (
                          <>
                            {editingBookingId !== booking.id && (
                              <button
                                onClick={() => startEditingBooking(booking)}
                                className="w-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5"
                              >
                                <span className="material-symbols-outlined text-sm">payments</span>
                                Editar Pago
                              </button>
                            )}
                            {booking.phone && (
                              <a
                                href={generateWhatsAppLink(booking.phone, getWhatsAppMessage(booking))}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-[#25D366] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#1DA851] transition-colors flex items-center justify-center gap-1.5"
                              >
                                <span className="material-symbols-outlined text-sm">chat</span>
                                WhatsApp
                              </a>
                            )}
                            <button
                              onClick={() => handleReopenBooking(booking.id)}
                              className="w-full border border-outline-variant text-on-surface-variant text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-surface-container transition-colors flex items-center justify-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-sm">settings_backup_restore</span>
                              Reabrir
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-8 items-start snap-x">
                {['PENDIENTE', 'ACEPTADA', 'RESERVADA', 'VISITA', 'PROGRESO'].map(status => (
                  <div 
                    key={status}
                    className="min-w-[300px] w-[300px] bg-surface-container-low/50 rounded-2xl p-4 border border-outline-variant/10 snap-center shrink-0"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status)}
                  >
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-outline-variant/10">
                      <h3 className="font-bold text-sm text-primary uppercase tracking-wider">{status}</h3>
                      <span className="bg-white text-on-surface-variant text-xs font-bold px-2 py-0.5 rounded-full border border-outline-variant/20 shadow-sm">
                        {bookings.filter(b => b.status === status).length}
                      </span>
                    </div>
                    <div className="space-y-3 min-h-[150px]">
                      {bookings.filter(b => b.status === status).map(booking => (
                        <div 
                          key={booking.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, booking.id)}
                          className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow relative overflow-hidden group"
                        >
                          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                            booking.status === 'PENDIENTE' ? 'bg-orange-300' :
                            booking.status === 'ACEPTADA' || booking.status === 'RESERVADA' ? 'bg-emerald-500' :
                            booking.status === 'VISITA' ? 'bg-indigo-400' :
                            booking.status === 'PROGRESO' ? 'bg-sky-400' : 'bg-rose-400'
                          }`}></div>
                          <div className="pl-2">
                            <h4 className="font-bold text-primary text-sm mb-1">{booking.name}</h4>
                            <p className="text-xs text-on-surface-variant mb-2">{booking.petType} - {booking.service}</p>
                            <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-medium mb-3">
                              <span className="bg-surface-container px-2 py-1 rounded-md">{booking.startDate}</span>
                              {booking.price && <span className="font-bold text-terracota">{booking.price}€</span>}
                            </div>
                            
                            {booking.status !== 'PENDIENTE' && (
                              <div className="flex gap-2 w-full mt-3">
                                {booking.phone && (
                                  <a
                                    href={generateWhatsAppLink(booking.phone, getWhatsAppMessage(booking))}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-[#25D366]/10 text-[#1DA851] border border-[#25D366]/20 text-[10px] font-bold px-2 py-1.5 rounded-lg hover:bg-[#25D366]/20 transition-colors flex items-center justify-center gap-1"
                                    onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                  >
                                    <span className="material-symbols-outlined text-[12px]">chat</span>
                                    Chatear
                                  </a>
                                )}
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDownloadInvoice(booking.id); }}
                                  className="flex-1 bg-surface-container-low text-primary border border-outline-variant/30 text-[10px] font-bold px-2 py-1.5 rounded-lg hover:bg-surface-container transition-colors flex items-center justify-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[12px]">receipt_long</span>
                                  Factura
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CRM CLIENTES Y MASCOTAS */}
        {activeTab === 'crm' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="font-display-lg text-headline-md text-primary">Directorio CRM</h1>
                <p className="text-sm text-on-surface-variant">Fichas permanentes de dueños de mascotas y animales registrados en Eris Pet Care.</p>
              </div>
              <div className="relative w-full md:w-80">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input
                  type="text"
                  placeholder="Buscar cliente, email o mascota..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl py-3 pl-12 pr-4 focus:ring-primary focus:border-primary text-sm text-on-surface"
                />
              </div>
            </div>

            {/* Selector de Sub-pestañas */}
            <div className="flex gap-4 mb-8 border-b border-outline-variant/15">
              <button
                onClick={() => setCrmSubTab('clients')}
                className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${
                  crmSubTab === 'clients' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
                }`}
              >
                Clientes ({clients.length})
              </button>
              <button
                onClick={() => setCrmSubTab('pets')}
                className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${
                  crmSubTab === 'pets' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
                }`}
              >
                Mascotas ({pets.length})
              </button>
            </div>

            {crmSubTab === 'clients' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                
                {/* Formulario Crear Cliente */}
                <div className="lg:col-span-4 bg-white border border-outline-variant/20 p-6 rounded-[2rem] shadow-sm">
                  <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">person_add</span>
                    Registrar nuevo Cliente
                  </h3>
                  <form onSubmit={handleCreateClient} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Nombre Completo</label>
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
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Email</label>
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
                        rows="3"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-primary text-white py-3 rounded-xl font-bold text-xs hover:scale-[0.98] transition-transform"
                    >
                      Añadir Cliente al CRM
                    </button>
                  </form>
                </div>

                {/* Listado de Clientes */}
                <div className="lg:col-span-8 space-y-4">
                  {filteredClients.map(client => (
                    <div key={client.id} className="bg-white border border-outline-variant/20 rounded-[2rem] p-6 shadow-sm">
                      <div className="flex justify-between items-start gap-4 mb-4 border-b border-outline-variant/10 pb-3">
                        <div>
                          <h4 className="text-lg font-bold text-primary">{client.name}</h4>
                          <p className="text-xs text-on-surface-variant/70">{client.email} | Telf: {client.phone || 'No indicado'}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <button
                            type="button"
                            onClick={() => handleSelectClient(client)}
                            className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">history</span>
                            Ficha & Notas
                          </button>
                          <span className="text-[10px] font-bold bg-surface-container px-3 py-1.5 rounded-lg text-on-surface-variant">
                            ID: #{client.id}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50">Dirección y Canal Preferido</p>
                          <p className="text-xs font-semibold text-primary/90 mt-1">
                            {client.address || 'Sin dirección registrada'} 
                            <span className="text-on-surface-variant/50 font-normal"> ({client.preferredChannel || 'WHATSAPP'})</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50">Contacto Emergencia</p>
                          <p className="text-xs text-on-surface-variant mt-1">{client.emergencyContact || 'No registrado'}</p>
                        </div>
                      </div>

                      {/* Mascotas del Cliente */}
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50 mb-2">Mascotas Asociadas</p>
                        {client.pets.length === 0 ? (
                          <p className="text-xs text-on-surface-variant/60 italic">No hay mascotas asociadas a este propietario.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {client.pets.map(pet => (
                              <div key={pet.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low border border-outline-variant/15 rounded-xl text-xs font-bold text-primary">
                                <span className="material-symbols-outlined text-xs">
                                  {pet.type.toLowerCase().includes('perro') ? 'pets' : 'cat'}
                                </span>
                                {pet.name} ({pet.breed || 'Sin raza'})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                
                {/* Formulario Crear Mascota */}
                <div className="lg:col-span-4 bg-white border border-outline-variant/20 p-6 rounded-[2rem] shadow-sm">
                  <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">pets</span>
                    Registrar nueva Mascota
                  </h3>
                  <form onSubmit={handleCreatePet} className="space-y-4">
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Nombre</label>
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
                    <div className="grid grid-cols-2 gap-4">
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
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Detalles de Alimentación</label>
                      <textarea
                        value={newPetDiet}
                        onChange={(e) => setNewPetDiet(e.target.value)}
                        placeholder="Tipo de pienso, porciones, horarios..."
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-sm"
                        rows="2"
                      ></textarea>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Notas Médicas / Cuidados</label>
                      <textarea
                        value={newPetNotes}
                        onChange={(e) => setNewPetNotes(e.target.value)}
                        placeholder="Medicación habitual, miedos, alergias..."
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-sm"
                        rows="2"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-primary text-white py-3 rounded-xl font-bold text-xs hover:scale-[0.98] transition-transform"
                    >
                      Registrar Mascota
                    </button>
                  </form>
                </div>

                {/* Listado de Mascotas */}
                <div className="lg:col-span-8 space-y-4">
                  {filteredPets.map(pet => (
                    <div key={pet.id} className="bg-white border border-outline-variant/20 rounded-[2rem] p-6 shadow-sm flex items-start gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-3xl text-primary">
                          {pet.type.toLowerCase().includes('perro') ? 'pets' :
                           pet.type.toLowerCase().includes('gato') ? 'cat' : 'cruelty_free'}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2 mb-3">
                          <div>
                            <h4 className="text-lg font-bold text-primary flex items-center gap-2">
                              {pet.name}
                              <span className="text-xs font-normal text-on-surface-variant bg-surface-container px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                {pet.type}
                              </span>
                            </h4>
                            <p className="text-xs text-on-surface-variant/70">
                              Raza: {pet.breed || 'No indicada'} | Edad: {pet.age || 'No indicada'}
                            </p>
                          </div>
                          <span className="text-xs text-on-surface-variant">
                            Dueño: <strong className="text-primary-container">{pet.client?.name}</strong>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="bg-surface-container-low p-3 rounded-xl">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60">Alimentación / Dieta</p>
                            <p className="text-on-surface mt-1 font-semibold">{pet.diet || 'Estándar'}</p>
                          </div>
                          <div className="bg-surface-container-low p-3 rounded-xl">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60">Médico y Comportamiento</p>
                            <p className="text-on-surface mt-1 font-semibold">{pet.medicalNotes || 'Ninguna observación médica'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 3: PLANIFICADOR GANTT DE OCUPACIÓN */}
        {activeTab === 'planner' && (
          <div>
            <div className="mb-8">
              <h1 className="font-display-lg text-headline-md text-primary">Planificador de Ocupación</h1>
              <p className="text-sm text-on-surface-variant">Línea de tiempo mensual que muestra la agenda de estancias de cada mascota en Julio de 2026.</p>
            </div>

            {pets.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-12 text-center border border-outline-variant/20 shadow-sm">
                <span className="material-symbols-outlined text-5xl text-outline-variant/40 mb-4 block">analytics</span>
                <p className="font-bold text-lg text-on-surface-variant">Debes tener mascotas en el CRM para usar el planificador.</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-[2rem] p-8 border border-outline-variant/20 shadow-sm">
                <div className="min-w-[1000px]">
                  
                  {/* Fila Cabecera: Días del Mes */}
                  <div className="border-b border-outline-variant/15 pb-4 text-center font-bold text-xs" style={{ display: 'grid', gridTemplateColumns: '180px repeat(31, 1fr)' }}>
                    <div className="text-left text-primary">Mascota</div>
                    {Array.from({ length: 31 }, (_, i) => (
                      <div key={i} className="text-on-surface-variant">{i + 1}</div>
                    ))}
                  </div>

                  {/* Filas de cada Mascota */}
                  <div className="divide-y divide-outline-variant/10">
                    {pets.map(pet => (
                      <div key={pet.id} className="py-4 items-center" style={{ display: 'grid', gridTemplateColumns: '180px repeat(31, 1fr)' }}>
                        
                        {/* Nombre Mascota */}
                        <div className="font-bold text-primary flex items-center gap-2 truncate pr-2">
                          <span className="material-symbols-outlined text-sm">
                            {pet.type.toLowerCase().includes('perro') ? 'pets' :
                             pet.type.toLowerCase().includes('gato') ? 'cat' : 'cruelty_free'}
                          </span>
                          {pet.name}
                          <span className="text-[9px] font-normal text-on-surface-variant/50">({pet.breed || 'cruce'})</span>
                        </div>

                        {/* Celdas de calendario 1-31 */}
                        {Array.from({ length: 31 }, (_, i) => {
                          const dayNum = i + 1;
                          const dateStr = `2026-07-${String(dayNum).padStart(2, '0')}`;
                          
                          // Buscar si hay reserva aceptada para esta mascota cubriendo esta fecha
                          const activeStay = bookings.find(b => 
                            b.status === 'ACEPTADA' &&
                            b.petId === pet.id &&
                            b.startDate <= dateStr &&
                            b.endDate >= dateStr
                          );

                          return (
                            <div key={i} className="h-9 flex items-center justify-center border-l border-outline-variant/10 relative group">
                              {activeStay ? (
                                <div 
                                  className="w-full h-7 bg-primary/20 border-y border-primary/50 flex items-center justify-center cursor-help"
                                  title={`Dueño: ${activeStay.name} (${activeStay.service})`}
                                >
                                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-on-surface-variant/10">·</span>
                              )}
                            </div>
                          );
                        })}

                      </div>
                    ))}
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TAREAS DIARIAS */}
        {activeTab === 'tasks' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h1 className="font-display-lg text-headline-md text-primary">Agenda Diaria y Cuidados</h1>
                <p className="text-sm text-on-surface-variant">Checklist de tareas y listado de mascotas hospedadas.</p>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-outline-variant/20 shadow-sm shrink-0">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Fecha de trabajo:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-xs font-bold text-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Columna Izquierda: Mascotas hospedadas este día */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white border border-outline-variant/20 p-6 rounded-[2rem] shadow-sm">
                  <h3 className="text-md font-bold text-primary mb-4 flex items-center gap-2 border-b border-outline-variant/10 pb-2">
                    <span className="material-symbols-outlined text-sm">home_work</span>
                    Mascotas en casa hoy
                  </h3>
                  
                  {boardedPets.length === 0 ? (
                    <p className="text-xs text-on-surface-variant/70 italic">No hay mascotas hospedadas para esta fecha en las reservas aceptadas.</p>
                  ) : (
                    <div className="space-y-3">
                      {boardedPets.map(pet => (
                        <div key={pet.id} className="p-3 bg-surface-container-low border border-outline-variant/15 rounded-xl flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary text-lg">
                            {pet.type.toLowerCase().includes('perro') ? 'pets' : 'cat'}
                          </span>
                          <div>
                            <p className="text-sm font-bold">{pet.name}</p>
                            <p className="text-[10px] text-on-surface-variant/80">Propietario: {pet.client?.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Formulario Añadir Tarea */}
                <div className="bg-white border border-outline-variant/20 p-6 rounded-[2rem] shadow-sm">
                  <h3 className="text-md font-bold text-primary mb-4 flex items-center gap-2 border-b border-outline-variant/10 pb-2">
                    <span className="material-symbols-outlined text-sm">playlist_add</span>
                    Añadir tarea a la agenda
                  </h3>
                  <form onSubmit={handleCreateTask} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Título de la Tarea</label>
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Ej. Pasear o dar medicación"
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Detalle / Descripción</label>
                      <input
                        type="text"
                        value={newTaskDesc}
                        onChange={(e) => setNewTaskDesc(e.target.value)}
                        placeholder="Ej. 30 minutos o 0.5ml"
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Asociar a Mascota</label>
                      <select
                        value={newTaskPetId}
                        onChange={(e) => setNewTaskPetId(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs text-on-surface"
                      >
                        <option value="">-- General (Sin mascota) --</option>
                        {boardedPets.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-primary text-white py-3 rounded-xl font-bold text-xs hover:scale-[0.98] transition-transform"
                    >
                      Añadir Tarea
                    </button>
                  </form>
                </div>
              </div>

              {/* Columna Derecha: Listado de tareas diarias */}
              <div className="lg:col-span-8 bg-white border border-outline-variant/20 p-8 rounded-[2rem] shadow-sm">
                <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2 border-b border-outline-variant/10 pb-4">
                  <span className="material-symbols-outlined text-xl">done_all</span>
                  Lista de verificación diaria
                </h3>

                {dailyTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-4xl text-outline-variant/40 mb-3 block">event_busy</span>
                    <p className="text-sm text-on-surface-variant italic">No hay tareas creadas para este día.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dailyTasks.map(task => (
                      <div
                        key={task.id}
                        className={`p-4 border rounded-2xl flex justify-between items-center gap-4 transition-all ${
                          task.isCompleted
                            ? 'bg-emerald-50/40 border-emerald-100 text-on-surface-variant/60'
                            : 'bg-white border-outline-variant/20 text-on-surface'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={task.isCompleted}
                            onChange={() => handleToggleTask(task.id, task.isCompleted)}
                            className="w-5 h-5 rounded-md border-outline-variant text-primary focus:ring-primary mt-0.5 cursor-pointer"
                          />
                          <div>
                            <p className={`font-bold text-sm ${task.isCompleted ? 'line-through text-emerald-800/60' : 'text-primary'}`}>
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-on-surface-variant/80 mt-0.5">{task.description}</p>
                            )}
                            
                            {/* Chip de Mascota */}
                            {task.pet && (
                              <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-surface-container border border-outline-variant/10 rounded-md text-[9px] font-bold text-primary">
                                <span className="material-symbols-outlined text-[10px]">pets</span>
                                {task.pet.name}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center border border-transparent text-on-surface-variant/60 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Eliminar tarea"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: DISPONIBILIDAD WEB */}
        {activeTab === 'availability' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 bg-white border border-outline-variant/20 p-8 rounded-[2.5rem] shadow-sm font-body-md text-on-surface">
              <span className="text-xs font-bold uppercase tracking-widest text-terracota mb-3 block">ADMINISTRAR FECHAS</span>
              <h2 className="text-2xl font-bold text-primary mb-6 font-display-lg">Gestión de Calendario</h2>
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                Haz clic directamente en cualquier día del calendario para cambiar cíclicamente su disponibilidad. El cambio se guardará de forma inmediata en la base de datos y se reflejará en la web pública.
              </p>
              
              <div className="space-y-4 border-t border-outline-variant/10 pt-6">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-green-500"></span>
                  <div>
                    <p className="text-sm font-bold">Disponible</p>
                    <p className="text-xs text-on-surface-variant/75">Permite a los clientes pedir estas fechas.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-red-400"></span>
                  <div>
                    <p className="text-sm font-bold">Reservado</p>
                    <p className="text-xs text-on-surface-variant/75">Fechas llenas, no se aceptan nuevas mascotas.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-orange-300"></span>
                  <div>
                    <p className="text-sm font-bold">Consultar</p>
                    <p className="text-xs text-on-surface-variant/75">Fechas semi-reservadas o pendientes de confirmar.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-surface-container-low rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-primary">Julio 2026</h3>
                <span className="text-xs font-semibold px-4 py-1.5 bg-white border border-outline-variant/30 rounded-full text-on-surface-variant flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Mes activo
                </span>
              </div>
              
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-on-surface-variant/50 uppercase tracking-widest mb-4">
                <div>L</div><div>M</div><div>X</div><div>J</div><div>V</div><div>S</div><div>D</div>
              </div>
              
              <div className="grid grid-cols-7 gap-3">
                {calendarDays.map((item, index) => {
                  const colStartClass = item.day === 1 ? 'col-start-3' : '';
                  return (
                    <button
                      key={index}
                      onClick={() => toggleDayStatus(item.day)}
                      className={`${colStartClass} aspect-square rounded-2xl bg-white border border-outline-variant/10 flex flex-col items-center justify-center relative group hover:ring-2 hover:ring-primary transition-all cursor-pointer`}
                      title={`Clic para cambiar estado de día ${item.day}`}
                    >
                      <span className="relative z-10 font-semibold text-sm">{item.day}</span>
                      <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${item.status}`}></div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {/* TAB 6: CONFIGURAR TARIFAS */}
        {activeTab === 'rates' && (
          <div className="max-w-4xl mx-auto bg-white border border-outline-variant/20 p-8 md:p-12 rounded-[2.5rem] shadow-sm font-body-md text-on-surface">
            <span className="text-xs font-bold uppercase tracking-widest text-terracota mb-3 block">PRECIOS Y SERVICIOS</span>
            <h2 className="text-3xl font-bold text-primary mb-6 font-display-lg">Configuración de Tarifas</h2>
            <p className="text-sm text-on-surface-variant mb-10 leading-relaxed">
              Define los precios por unidad para cada uno de los servicios ofrecidos en tu web. Al actualizarlos, el calculador del formulario de contacto de los clientes mostrará los nuevos importes al instante.
            </p>

            <div className="space-y-6">
              {rates.map((rate) => (
                <RateRow
                  key={rate.id}
                  rate={rate}
                  onSave={handleSaveRate}
                />
              ))}
              {rates.length === 0 && (
                <p className="text-sm text-on-surface-variant/70 italic text-center py-6">
                  No hay tarifas configuradas en el servidor. Ejecuta el seeding de base de datos.
                </p>
              )}
            </div>
          </div>
        )}

        {/* MODAL FICHA 360 Y TIMELINE DE INTERACCIONES */}
        {selectedClient && (() => {
          const clientBookings = bookings.filter(b => b.clientId === selectedClient.id || b.email === selectedClient.email);
          const totalSpent = clientBookings.reduce((sum, b) => sum + (b.price || 0), 0);
          const totalBookingsCount = clientBookings.length;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-[2.5rem] border border-outline-variant/15 w-full max-w-5xl max-h-[85vh] overflow-y-auto p-6 md:p-10 shadow-2xl relative">
                {/* Botón cerrar */}
                <button
                  type="button"
                  onClick={() => setSelectedClient(null)}
                  className="absolute right-6 top-6 w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-4">
                  {/* COLUMNA IZQUIERDA: PERFIL Y NAVEGACIÓN DE PESTAÑAS */}
                  <div className="lg:col-span-4 bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 space-y-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-terracota mb-1 block">PERFIL CRM</span>
                      <h3 className="text-2xl font-bold text-primary leading-tight font-display-md">{selectedClient.name}</h3>
                      <p className="text-xs text-on-surface-variant/70 mt-1">ID: #{selectedClient.id}</p>
                    </div>

                    <div className="space-y-3 border-t border-outline-variant/10 pt-4 text-xs">
                      <div>
                        <p className="font-bold text-on-surface-variant/60 uppercase tracking-wider">Email</p>
                        <p className="font-semibold break-all mt-0.5">{selectedClient.email}</p>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface-variant/60 uppercase tracking-wider">Teléfono</p>
                        <p className="font-semibold mt-0.5">{selectedClient.phone || 'No registrado'}</p>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface-variant/60 uppercase tracking-wider">Canal Preferido</p>
                        <span className="inline-block bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded text-[10px] font-bold mt-1 uppercase tracking-wide">
                          {selectedClient.preferredChannel || 'WHATSAPP'}
                        </span>
                      </div>
                    </div>

                    {/* Selector Vertical de Pestañas */}
                    <div className="space-y-2 border-t border-outline-variant/10 pt-4">
                      {[
                        { id: 'resumen', label: 'Resumen Ficha', icon: 'dashboard' },
                        { id: 'mascotas', label: `Mascotas (${selectedClient.pets.length})`, icon: 'pets' },
                        { id: 'reservas', label: `Reservas (${totalBookingsCount})`, icon: 'calendar_month' },
                        { id: 'interacciones', label: 'Línea de Tiempo', icon: 'history' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setSelectedClientTab(tab.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all text-left ${
                            selectedClientTab === tab.id
                              ? 'bg-primary text-white shadow-sm'
                              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* COLUMNA DERECHA: PANEL DE CONTENIDO ACTIVO */}
                  <div className="lg:col-span-8 space-y-6 min-h-[45vh]">
                    
                    {/* TAB: RESUMEN */}
                    {selectedClientTab === 'resumen' && (
                      <div className="space-y-6">
                        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-outline-variant/10 pb-3">
                          <h4 className="text-lg font-bold text-primary flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl">dashboard</span>
                            Resumen Operativo del Cliente
                          </h4>
                          {selectedClient.phone && (
                            <a
                              href={generateWhatsAppLink(selectedClient.phone, `¡Hola ${selectedClient.name}! Soy de Eris Pet Care.`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-[#25D366] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#1DA851] transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                              <span className="material-symbols-outlined text-sm">chat</span>
                              Chatear
                            </a>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-emerald-50/40 border border-emerald-100 p-5 rounded-2xl">
                            <p className="text-[10px] font-bold text-emerald-800/70 uppercase tracking-wider">Total Facturado</p>
                            <p className="text-3xl font-bold text-emerald-950 mt-1">{totalSpent} €</p>
                            <p className="text-[10px] text-emerald-800/80 mt-1">Suma de reservas aceptadas y manuales.</p>
                          </div>
                          <div className="bg-primary/[0.03] border border-outline/10 p-5 rounded-2xl">
                            <p className="text-[10px] font-bold text-primary/80 uppercase tracking-wider">Contacto de Emergencia</p>
                            <p className="text-sm font-bold text-primary mt-1">{selectedClient.emergencyContact || 'No registrado'}</p>
                            <p className="text-[10px] text-on-surface-variant/70 mt-1">Disponible en caso de incidentes médicos.</p>
                          </div>
                        </div>

                        <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 space-y-4">
                          <h5 className="font-bold text-primary text-sm">Información de Localización e Instrucciones</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="font-bold text-on-surface-variant/60 uppercase tracking-wider">Dirección de Residencia</p>
                              <p className="text-on-surface mt-1">{selectedClient.address || 'Sin dirección declarada en la ficha.'}</p>
                            </div>
                            <div>
                              <p className="font-bold text-on-surface-variant/60 uppercase tracking-wider">Etiquetas / Tags de Interés</p>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  selectedClient.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {selectedClient.status || 'ACTIVE'}
                                </span>
                                {selectedClient.tags && selectedClient.tags.split(',').map((tag, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-[9px] font-bold">
                                    {tag.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {selectedClient.notes && (
                          <div className="bg-amber-50/40 border border-amber-100 p-5 rounded-2xl">
                            <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                              <span className="material-symbols-outlined text-sm">warning</span>
                              Observaciones Generales de la Sitter
                            </h5>
                            <p className="text-xs text-amber-900 leading-relaxed italic">
                              "{selectedClient.notes}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: MASCOTAS */}
                    {selectedClientTab === 'mascotas' && (
                      <div className="space-y-6">
                        <h4 className="text-lg font-bold text-primary flex items-center gap-2 border-b border-outline-variant/10 pb-3">
                          <span className="material-symbols-outlined text-xl">pets</span>
                          Ficha Médica de Mascotas
                        </h4>
                        
                        {selectedClient.pets.length === 0 ? (
                          <p className="text-xs text-on-surface-variant/60 italic text-center py-10">No hay mascotas asociadas a este propietario.</p>
                        ) : (
                          <div className="space-y-4">
                            {selectedClient.pets.map(pet => (
                              <div key={pet.id} className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 space-y-4">
                                <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
                                  <h5 className="font-bold text-primary text-sm flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-sm">
                                      {pet.type.toLowerCase().includes('perro') ? 'pets' : 'cat'}
                                    </span>
                                    {pet.name} ({pet.breed || 'Sin raza'}) - {pet.age || 'Edad no indicada'}
                                  </h5>
                                  <span className="text-[10px] font-bold bg-white border border-outline-variant/20 px-2 py-0.5 rounded text-on-surface-variant">
                                    Vacunas: {pet.vaccinationStatus || 'Desconocido'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                  <div>
                                    <p className="font-bold text-on-surface-variant/60 uppercase tracking-wider">Nº Microchip</p>
                                    <p className="font-semibold mt-0.5">{pet.microchip || 'No indicado'}</p>
                                  </div>
                                  <div>
                                    <p className="font-bold text-on-surface-variant/60 uppercase tracking-wider">Seguro / Póliza</p>
                                    <p className="font-semibold mt-0.5">{pet.insuranceInfo || 'No indicado'}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="font-bold text-on-surface-variant/60 uppercase tracking-wider">Clínica Veterinaria</p>
                                    <p className="font-semibold mt-0.5">{pet.vetName ? `${pet.vetName} (${pet.vetPhone || 'S/T'})` : 'No indicada'}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="font-bold text-on-surface-variant/60 uppercase tracking-wider">Dieta / Comidas</p>
                                    <p className="text-on-surface-variant mt-0.5">{pet.diet || 'No indicada'}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="font-bold text-on-surface-variant/60 uppercase tracking-wider">Notas Clínicas o Médicas</p>
                                    <p className="text-on-surface-variant mt-0.5">{pet.medicalNotes || 'Sin notas clínicas'}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="font-bold text-on-surface-variant/60 uppercase tracking-wider">Comportamiento / Notas Conducta</p>
                                    <p className="text-on-surface-variant mt-0.5">{pet.behaviorNotes || 'Sin notas de conducta'}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: RESERVAS */}
                    {selectedClientTab === 'reservas' && (
                      <div className="space-y-6">
                        <h4 className="text-lg font-bold text-primary flex items-center gap-2 border-b border-outline-variant/10 pb-3">
                          <span className="material-symbols-outlined text-xl">calendar_month</span>
                          Historial de Estancias y Reservas
                        </h4>

                        {clientBookings.length === 0 ? (
                          <p className="text-xs text-on-surface-variant/60 italic text-center py-10">No hay reservas registradas para este cliente.</p>
                        ) : (
                          <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2">
                            {clientBookings.map(b => (
                              <div key={b.id} className="p-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold text-primary">{b.service} ({b.petType})</p>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                      b.status === 'ACEPTADA' ? 'bg-emerald-100 text-emerald-800' :
                                      b.status === 'PENDIENTE' ? 'bg-orange-100 text-orange-800' : 'bg-rose-100 text-rose-800'
                                    }`}>
                                      {b.status}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-on-surface-variant/80">Estancia: {b.startDate} al {b.endDate}</p>
                                </div>
                                <div className="text-right text-xs">
                                  <p className="font-bold text-primary">{b.price ? `${b.price} €` : 'No calculado'}</p>
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase mt-0.5 ${
                                    b.paymentStatus === 'PAGADO' ? 'bg-emerald-100 text-emerald-800' :
                                    b.paymentStatus === 'SEÑA' ? 'bg-sky-100 text-sky-800' : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {b.paymentStatus || 'PENDIENTE'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: INTERACCIONES */}
                    {selectedClientTab === 'interacciones' && (
                      <div className="space-y-6">
                        <h4 className="text-lg font-bold text-primary flex items-center gap-2 border-b border-outline-variant/10 pb-3">
                          <span className="material-symbols-outlined text-xl">history</span>
                          Línea de Tiempo de Interacciones
                        </h4>

                        {/* Formulario añadir nota */}
                        <form onSubmit={handleCreateInteraction} className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10 space-y-3">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Añadir nueva nota rápida</p>
                          <div className="flex gap-2">
                            <select
                              value={newInteractionType}
                              onChange={(e) => setNewInteractionType(e.target.value)}
                              className="bg-white border border-outline-variant/30 rounded-xl p-2.5 text-xs font-semibold focus:ring-primary focus:border-primary text-on-surface-variant"
                            >
                              <option value="NOTA">NOTA</option>
                              <option value="LLAMADA">LLAMADA</option>
                              <option value="WHATSAPP">WHATSAPP</option>
                              <option value="EMAIL">EMAIL</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Describe la llamada, acuerdo o nota de la mascota..."
                              value={newInteractionContent}
                              onChange={(e) => setNewInteractionContent(e.target.value)}
                              className="flex-1 bg-white border border-outline-variant/30 rounded-xl p-2.5 text-xs font-semibold focus:ring-primary focus:border-primary"
                              required
                            />
                            <button
                              type="submit"
                              className="bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:scale-[0.98] transition-transform flex items-center justify-center"
                            >
                              <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                          </div>
                        </form>

                        {/* Lista de interacciones */}
                        <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-2">
                          {interactions.map(interaction => {
                            const icons = {
                              NOTA: 'description',
                              LLAMADA: 'call',
                              WHATSAPP: 'chat',
                              EMAIL: 'mail'
                            };
                            return (
                              <div key={interaction.id} className="flex gap-3 p-4 bg-background border border-outline-variant/10 rounded-2xl">
                                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                                  <span className="material-symbols-outlined text-primary text-xs">{icons[interaction.type] || 'info'}</span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-primary uppercase tracking-wider">{interaction.type}</span>
                                    <span className="text-[9px] text-on-surface-variant/60">{new Date(interaction.createdAt).toLocaleString()}</span>
                                  </div>
                                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                                    {interaction.content}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          {interactions.length === 0 && (
                            <p className="text-xs text-on-surface-variant/60 italic text-center py-6">Sin interacciones registradas.</p>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            </div>
          );
        })()}

      </main>

      {/* BOTTOM NAVIGATION BAR (Solo Cuidados) */}
      {workMode === 'CARE' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant/20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.15)] z-50 flex justify-around items-center p-3 sm:px-10 pb-6 md:pb-6">
          <button onClick={() => setActiveTab('tasks')} className={`flex flex-col items-center p-2 rounded-xl transition-all min-w-[72px] ${activeTab === 'tasks' ? 'text-emerald-600 bg-emerald-50 scale-105' : 'text-on-surface-variant hover:bg-surface-container'}`}>
            <span className="material-symbols-outlined text-3xl mb-1">event_note</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Tareas</span>
          </button>
          
          <button onClick={() => setActiveTab('crm')} className={`flex flex-col items-center p-2 rounded-xl transition-all min-w-[72px] ${activeTab === 'crm' ? 'text-emerald-600 bg-emerald-50 scale-105' : 'text-on-surface-variant hover:bg-surface-container'}`}>
            <span className="material-symbols-outlined text-3xl mb-1">contacts</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">CRM</span>
          </button>
          
          <button onClick={() => setActiveTab('bookings')} className={`flex flex-col items-center p-2 rounded-xl transition-all min-w-[72px] ${activeTab === 'bookings' ? 'text-emerald-600 bg-emerald-50 scale-105' : 'text-on-surface-variant hover:bg-surface-container'}`}>
            <span className="material-symbols-outlined text-3xl mb-1">forum</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Reservas</span>
          </button>

          <button onClick={() => setActiveTab('planner')} className={`flex flex-col items-center p-2 rounded-xl transition-all min-w-[72px] ${activeTab === 'planner' ? 'text-emerald-600 bg-emerald-50 scale-105' : 'text-on-surface-variant hover:bg-surface-container'}`}>
            <span className="material-symbols-outlined text-3xl mb-1">calendar_month</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Planner</span>
          </button>
          
          <div className="w-[1px] h-10 bg-outline-variant/20 mx-2 hidden sm:block"></div>
          
          <button onClick={() => { setWorkMode('RECEPTION'); setActiveTab('bookings'); }} className="flex flex-col items-center p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-all min-w-[72px]">
            <span className="material-symbols-outlined text-3xl mb-1">storefront</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Mostrador</span>
          </button>
        </nav>
      )}

    </div>
  );
}

function RateRow({ rate, onSave }) {
  const [val, setVal] = useState(rate.ratePerUnit);
  const [unit, setUnit] = useState(rate.unitType);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-surface-container-low rounded-3xl border border-outline-variant/10">
      <div>
        <h4 className="font-bold text-primary text-base">{rate.serviceName}</h4>
        <p className="text-xs text-on-surface-variant mt-1">Tarifa base actual</p>
      </div>
      <div className="flex items-center gap-3 self-end sm:self-auto">
        <div className="relative w-28">
          <input
            type="number"
            step="0.01"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full bg-white border border-outline-variant/30 rounded-xl p-3 pr-8 font-semibold text-sm focus:ring-primary focus:border-primary text-right"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-on-surface-variant/75">€</span>
        </div>
        <span className="text-sm text-on-surface-variant">/</span>
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="bg-white border border-outline-variant/30 rounded-xl p-3 font-semibold text-sm focus:ring-primary focus:border-primary text-on-surface-variant"
        >
          <option value="noche">noche</option>
          <option value="día">día</option>
          <option value="visita">visita</option>
          <option value="paseo">paseo</option>
        </select>
        <button
          onClick={() => onSave(rate.serviceName, val, unit)}
          className="bg-primary text-white font-bold text-xs px-5 py-3 rounded-xl hover:scale-[0.98] transition-transform flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">save</span>
          Guardar
        </button>
      </div>
    </div>
  );
}
