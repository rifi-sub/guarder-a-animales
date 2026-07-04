import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'https://alilyback.duckdns.org/eris';

const EXPENSE_CATEGORIES = [
  'ALIMENTACION', 'VETERINARIO', 'SUMINISTROS', 'LIMPIEZA',
  'MANTENIMIENTO', 'MARKETING', 'SEGUROS', 'IMPUESTOS', 'OTROS'
];

const CATEGORY_COLORS = {
  ALIMENTACION: '#22c55e', VETERINARIO: '#3b82f6', SUMINISTROS: '#a855f7',
  LIMPIEZA: '#06b6d4', MANTENIMIENTO: '#f59e0b', MARKETING: '#ec4899',
  SEGUROS: '#6366f1', IMPUESTOS: '#ef4444', OTROS: '#6b7280'
};

export default function FinancialDashboard({ token }) {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [financialState, setFinancialState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Formulario de gasto
  const [showForm, setShowForm] = useState(false);
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expCategory, setExpCategory] = useState('OTROS');
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expRecurring, setExpRecurring] = useState(false);
  const [expNotes, setExpNotes] = useState('');

  // Saldo inicial
  const [showBalanceForm, setShowBalanceForm] = useState(false);
  const [initialBalance, setInitialBalance] = useState(0);

  // Filtros
  const [expenseFilter, setExpenseFilter] = useState('');
  const [expenseMonth, setExpenseMonth] = useState(new Date().toISOString().substring(0, 7));

  const headers = { 'Authorization': `Bearer ${token}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expRes, sumRes, finRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/expenses?month=${expenseMonth}`, { headers }),
        fetch(`${API_BASE}/api/admin/financial-summary`, { headers }),
        fetch(`${API_BASE}/api/admin/financial-state`, { headers })
      ]);
      if (expRes.ok) setExpenses(await expRes.json());
      if (sumRes.ok) setSummary(await sumRes.json());
      if (finRes.ok) {
        const state = await finRes.json();
        setFinancialState(state);
        setInitialBalance(state.initialBalance || 0);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [expenseMonth]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ date: expDate, category: expCategory, description: expDesc, amount: parseFloat(expAmount), isRecurring: expRecurring, notes: expNotes })
      });
      if (res.ok) {
        setShowForm(false);
        setExpDesc('');
        setExpAmount('');
        setExpNotes('');
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteExpense = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/expenses/${id}`, { method: 'DELETE', headers });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const handleSaveBalance = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/financial-state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ initialBalance: parseFloat(initialBalance) })
      });
      if (res.ok) {
        setShowBalanceForm(false);
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const handleExportCSV = () => {
    window.open(`${API_BASE}/api/admin/expenses/export?token=${token}`, '_blank');
  };

  const filteredExpenses = expenseFilter
    ? expenses.filter(e => e.category === expenseFilter)
    : expenses;

  const totalMonthExpense = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  // Datos para gráfico de categorías
  const categoryData = EXPENSE_CATEGORIES.map(cat => {
    const total = expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
    return { name: cat, value: total };
  }).filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-terracota block mb-1">PANEL FINANCIERO</span>
          <h2 className="text-2xl font-bold text-primary font-display-lg">Finanzas</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBalanceForm(!showBalanceForm)}
            className="px-4 py-2 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-all">
            {financialState ? 'Editar saldo inicial' : 'Configurar saldo inicial'}
          </button>
          <button onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all">
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Saldo inicial form */}
      {showBalanceForm && (
        <div className="bg-white border border-outline-variant/20 p-6 rounded-[2.5rem] shadow-sm">
          <form onSubmit={handleSaveBalance} className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Saldo inicial (€)</label>
              <input type="number" step="0.01" value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" required />
            </div>
            <button type="submit" className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-xs hover:scale-[0.98] transition-all">Guardar</button>
          </form>
        </div>
      )}

      {/* Tarjetas de resumen */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-outline-variant/20 p-6 rounded-[2.5rem] shadow-sm">
            <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Ingresos totales</p>
            <p className="text-2xl font-bold text-emerald-600">{summary.totals.income.toFixed(2)}€</p>
            <p className="text-[10px] text-on-surface-variant/70 mt-1">{summary.totals.bookingCount} reservas</p>
          </div>
          <div className="bg-white border border-outline-variant/20 p-6 rounded-[2.5rem] shadow-sm">
            <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Gastos totales</p>
            <p className="text-2xl font-bold text-rose-600">{summary.totals.expense.toFixed(2)}€</p>
            <p className="text-[10px] text-on-surface-variant/70 mt-1">Incluye todos los gastos</p>
          </div>
          <div className="bg-white border border-outline-variant/20 p-6 rounded-[2.5rem] shadow-sm">
            <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Beneficio</p>
            <p className={`text-2xl font-bold ${summary.totals.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {summary.totals.profit.toFixed(2)}€
            </p>
            <p className="text-[10px] text-on-surface-variant/70 mt-1">Ingresos - Gastos</p>
          </div>
          <div className="bg-white border border-outline-variant/20 p-6 rounded-[2.5rem] shadow-sm">
            <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Saldo actual</p>
            <p className={`text-2xl font-bold ${summary.totals.currentBalance >= 0 ? 'text-primary' : 'text-rose-600'}`}>
              {summary.totals.currentBalance.toFixed(2)}€
            </p>
            <p className="text-[10px] text-on-surface-variant/70 mt-1">Saldo inicial + beneficio</p>
          </div>
        </div>
      )}

      {/* Gráficos */}
      {summary && summary.months.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-outline-variant/20 p-6 rounded-[2.5rem] shadow-sm">
            <h3 className="text-sm font-bold text-primary mb-4">Evolución mensual</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={summary.months}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="income" name="Ingresos" fill="#22c55e" radius={[4,4,0,0]} />
                <Bar dataKey="expense" name="Gastos" fill="#ef4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white border border-outline-variant/20 p-6 rounded-[2.5rem] shadow-sm">
            <h3 className="text-sm font-bold text-primary mb-4">Beneficio mensual</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={summary.months}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="profit" name="Beneficio" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Distribución de gastos por categoría */}
      {categoryData.length > 0 && (
        <div className="bg-white border border-outline-variant/20 p-6 rounded-[2.5rem] shadow-sm">
          <h3 className="text-sm font-bold text-primary mb-4">Distribución de gastos por categoría</h3>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 justify-center">
              {categoryData.map(entry => (
                <div key={entry.name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container text-[10px] font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[entry.name] || '#6b7280' }}></span>
                  {entry.name} — {entry.value.toFixed(2)}€
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabla de gastos */}
      <div className="bg-white border border-outline-variant/20 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-primary">Gastos</h3>
            <select value={expenseMonth} onChange={(e) => setExpenseMonth(e.target.value)}
              className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-[10px] font-semibold">
              {['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07','2026-08','2026-09','2026-10','2026-11','2026-12'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select value={expenseFilter} onChange={(e) => setExpenseFilter(e.target.value)}
              className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-[10px] font-semibold">
              <option value="">Todas las categorías</option>
              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:scale-[0.98] transition-all">
            + Nuevo gasto
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-on-surface-variant">Cargando...</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-outline-variant/40 mb-3 block">receipt_long</span>
            <p className="text-sm text-on-surface-variant italic">No hay gastos registrados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="text-left py-4 px-6 font-bold text-on-surface-variant/60 uppercase tracking-wider">Fecha</th>
                  <th className="text-left py-4 px-6 font-bold text-on-surface-variant/60 uppercase tracking-wider">Categoría</th>
                  <th className="text-left py-4 px-6 font-bold text-on-surface-variant/60 uppercase tracking-wider">Descripción</th>
                  <th className="text-right py-4 px-6 font-bold text-on-surface-variant/60 uppercase tracking-wider">Importe</th>
                  <th className="text-center py-4 px-6 font-bold text-on-surface-variant/60 uppercase tracking-wider">Rec.</th>
                  <th className="text-center py-4 px-6 font-bold text-on-surface-variant/60 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 px-6 font-semibold">{exp.date}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[exp.category] || '#6b7280' }}></span>
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant max-w-[200px] truncate">{exp.description}</td>
                    <td className="py-4 px-6 text-right font-bold text-rose-600">{exp.amount.toFixed(2)}€</td>
                    <td className="py-4 px-6 text-center">{exp.isRecurring ? '🔄' : '-'}</td>
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => handleDeleteExpense(exp.id)}
                        className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-[8px] hover:bg-rose-200 transition-colors mx-auto">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {filteredExpenses.length > 0 && (
                <tfoot>
                  <tr className="border-t border-outline-variant/20 bg-surface-container-low">
                    <td colSpan="3" className="py-4 px-6 font-bold text-xs">Total</td>
                    <td className="py-4 px-6 text-right font-bold text-rose-600">{totalMonthExpense.toFixed(2)}€</td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      {/* Modal nuevo gasto */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-[2.5rem] border border-outline-variant/15 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-terracota">NUEVO GASTO</span>
                <button onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Fecha</label>
                  <input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Categoría</label>
                  <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs">
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Descripción</label>
                  <input value={expDesc} onChange={(e) => setExpDesc(e.target.value)}
                    placeholder="Ej. Compra de pienso"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Importe (€)</label>
                  <input type="number" step="0.01" min="0" value={expAmount} onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" required />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="recurring" checked={expRecurring} onChange={(e) => setExpRecurring(e.target.checked)}
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
                  <label htmlFor="recurring" className="text-[10px] font-semibold text-on-surface-variant">Gasto recurrente</label>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Notas (opcional)</label>
                  <textarea value={expNotes} onChange={(e) => setExpNotes(e.target.value)} rows={2}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs resize-none" />
                </div>
                <button type="submit"
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold text-xs hover:scale-[0.98] transition-all">
                  Guardar gasto
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
