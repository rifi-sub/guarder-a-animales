import { useState, useEffect } from 'react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'https://alilyback.duckdns.org/eris';

export default function InvoicingPanel({ token }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7));

  // Config fiscal
  const [config, setConfig] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [cfgBusinessName, setCfgBusinessName] = useState('');
  const [cfgNif, setCfgNif] = useState('');
  const [cfgAddress, setCfgAddress] = useState('');
  const [cfgCity, setCfgCity] = useState('');
  const [cfgZipCode, setCfgZipCode] = useState('');
  const [cfgPhone, setCfgPhone] = useState('');
  const [cfgEmail, setCfgEmail] = useState('');
  const [cfgIvaRate, setCfgIvaRate] = useState(21);
  const [cfgPrefix, setCfgPrefix] = useState('FAC');

  // Cupones
  const [coupons, setCoupons] = useState([]);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [cpCode, setCpCode] = useState('');
  const [cpDesc, setCpDesc] = useState('');
  const [cpType, setCpType] = useState('PERCENTAGE');
  const [cpValue, setCpValue] = useState('');
  const [cpMaxUses, setCpMaxUses] = useState('');
  const [cpMinAmount, setCpMinAmount] = useState('');
  const [cpExpires, setCpExpires] = useState('');

  const headers = { 'Authorization': `Bearer ${token}` };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [invRes, cfgRes, coupRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/invoices?month=${month}`, { headers }),
        fetch(`${API_BASE}/api/admin/business-config`, { headers }),
        fetch(`${API_BASE}/api/admin/coupons`, { headers })
      ]);
      if (invRes.ok) setInvoices(await invRes.json());
      if (cfgRes.ok) {
        const c = await cfgRes.json();
        setConfig(c);
        setCfgBusinessName(c.businessName || '');
        setCfgNif(c.nif || '');
        setCfgAddress(c.address || '');
        setCfgCity(c.city || '');
        setCfgZipCode(c.zipCode || '');
        setCfgPhone(c.phone || '');
        setCfgEmail(c.email || '');
        setCfgIvaRate(c.ivaRate || 21);
        setCfgPrefix(c.invoicePrefix || 'FAC');
      }
      if (coupRes.ok) setCoupons(await coupRes.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [month]);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/business-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          businessName: cfgBusinessName, nif: cfgNif, address: cfgAddress,
          city: cfgCity, zipCode: cfgZipCode, phone: cfgPhone, email: cfgEmail,
          ivaRate: parseFloat(cfgIvaRate), invoicePrefix: cfgPrefix
        })
      });
      if (res.ok) { setConfig(await res.json()); setShowConfig(false); }
    } catch (err) { console.error(err); }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          code: cpCode, description: cpDesc, discountType: cpType,
          discountValue: parseFloat(cpValue), maxUses: cpMaxUses || null,
          minAmount: cpMinAmount || null, expiresAt: cpExpires || null
        })
      });
      if (res.ok) {
        setShowCouponForm(false);
        setCpCode(''); setCpDesc(''); setCpValue(''); setCpMaxUses(''); setCpMinAmount(''); setCpExpires('');
        fetchAll();
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await fetch(`${API_BASE}/api/admin/coupons/${id}`, { method: 'DELETE', headers });
      fetchAll();
    } catch (err) { console.error(err); }
  };

  const downloadPDF = async (invoiceId) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/invoices/${invoiceId}/pdf`, { headers });
      if (!res.ok) throw new Error('Error al descargar PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Factura-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error(err);
      alert('Error al descargar el PDF');
    }
  };

  const totalAmount = invoices.reduce((s, i) => s + i.totalAmount, 0);

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-terracota block mb-1">FACTURACIÓN</span>
          <h2 className="text-2xl font-bold text-primary font-display-lg">Facturas</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowConfig(!showConfig)}
            className="px-4 py-2 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-all">
            {showConfig ? 'Cerrar' : 'Datos fiscales'}
          </button>
          <button onClick={() => setShowCouponForm(true)}
            className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all">
            + Cupón
          </button>
        </div>
      </div>

      {/* Configuración fiscal */}
      {showConfig && (
        <div className="bg-white border border-outline-variant/20 p-6 rounded-[2.5rem] shadow-sm">
          <h3 className="text-sm font-bold text-primary mb-4">Datos fiscales del negocio</h3>
          <form onSubmit={handleSaveConfig} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Nombre del negocio</label>
              <input value={cfgBusinessName} onChange={(e) => setCfgBusinessName(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">NIF/CIF</label>
              <input value={cfgNif} onChange={(e) => setCfgNif(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Dirección</label>
              <input value={cfgAddress} onChange={(e) => setCfgAddress(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Ciudad</label>
              <input value={cfgCity} onChange={(e) => setCfgCity(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Código postal</label>
              <input value={cfgZipCode} onChange={(e) => setCfgZipCode(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Teléfono</label>
              <input value={cfgPhone} onChange={(e) => setCfgPhone(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Email</label>
              <input value={cfgEmail} onChange={(e) => setCfgEmail(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">IVA (%)</label>
              <input type="number" step="0.1" value={cfgIvaRate} onChange={(e) => setCfgIvaRate(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Prefijo factura</label>
              <input value={cfgPrefix} onChange={(e) => setCfgPrefix(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit"
                className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-xs hover:scale-[0.98] transition-all">
                Guardar configuración
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-outline-variant/20 p-6 rounded-[2.5rem] shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Facturas emitidas</p>
          <p className="text-2xl font-bold text-primary">{invoices.length}</p>
        </div>
        <div className="bg-white border border-outline-variant/20 p-6 rounded-[2.5rem] shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Total facturado</p>
          <p className="text-2xl font-bold text-emerald-600">{totalAmount.toFixed(2)}€</p>
        </div>
        <div className="bg-white border border-outline-variant/20 p-6 rounded-[2.5rem] shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Cupones activos</p>
          <p className="text-2xl font-bold text-indigo-600">{coupons.filter(c => c.active).length}</p>
        </div>
      </div>

      {/* Tabla de facturas */}
      <div className="bg-white border border-outline-variant/20 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant/10 flex items-center gap-3">
          <h3 className="text-sm font-bold text-primary">Facturas</h3>
          <select value={month} onChange={(e) => setMonth(e.target.value)}
            className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-[10px] font-semibold">
            {['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07','2026-08','2026-09','2026-10','2026-11','2026-12'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-on-surface-variant">Cargando...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-outline-variant/40 mb-3 block">receipt</span>
            <p className="text-sm text-on-surface-variant italic">No hay facturas en este período.</p>
            <p className="text-xs text-on-surface-variant/60 mt-1">Acepta una reserva y asígnale un precio desde la pestaña de Reservas, luego genera su factura.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="text-left py-4 px-6 font-bold text-on-surface-variant/60 uppercase tracking-wider">Nº Factura</th>
                  <th className="text-left py-4 px-6 font-bold text-on-surface-variant/60 uppercase tracking-wider">Cliente</th>
                  <th className="text-left py-4 px-6 font-bold text-on-surface-variant/60 uppercase tracking-wider">Fecha</th>
                  <th className="text-right py-4 px-6 font-bold text-on-surface-variant/60 uppercase tracking-wider">Base</th>
                  <th className="text-right py-4 px-6 font-bold text-on-surface-variant/60 uppercase tracking-wider">IVA</th>
                  <th className="text-right py-4 px-6 font-bold text-on-surface-variant/60 uppercase tracking-wider">Total</th>
                  <th className="text-center py-4 px-6 font-bold text-on-surface-variant/60 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-primary">{inv.invoiceNum}</td>
                    <td className="py-4 px-6">{inv.client?.name || inv.booking?.client?.name || '-'}</td>
                    <td className="py-4 px-6 text-on-surface-variant">{new Date(inv.issuedAt).toLocaleDateString('es-ES')}</td>
                    <td className="py-4 px-6 text-right">{inv.amount.toFixed(2)}€</td>
                    <td className="py-4 px-6 text-right text-on-surface-variant">{inv.taxAmount.toFixed(2)}€</td>
                    <td className="py-4 px-6 text-right font-bold text-emerald-600">{inv.totalAmount.toFixed(2)}€</td>
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => downloadPDF(inv.id)}
                        className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs hover:bg-primary/20 transition-colors mx-auto"
                        title="Descargar PDF">
                        <span className="material-symbols-outlined text-sm">download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-outline-variant/20 bg-surface-container-low">
                  <td colSpan="3" className="py-4 px-6 font-bold text-xs">Total</td>
                  <td className="py-4 px-6 text-right font-bold">{invoices.reduce((s,i) => s + i.amount, 0).toFixed(2)}€</td>
                  <td className="py-4 px-6 text-right font-bold text-on-surface-variant">{invoices.reduce((s,i) => s + i.taxAmount, 0).toFixed(2)}€</td>
                  <td className="py-4 px-6 text-right font-bold text-emerald-600">{totalAmount.toFixed(2)}€</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Cupones de descuento */}
      <div className="bg-white border border-outline-variant/20 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
          <h3 className="text-sm font-bold text-primary">Cupones de descuento</h3>
        </div>
        {coupons.length === 0 ? (
          <div className="p-8 text-center text-sm text-on-surface-variant italic">No hay cupones creados.</div>
        ) : (
          <div className="flex flex-wrap gap-2 p-6">
            {coupons.map(cp => (
              <div key={cp.id} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border ${
                cp.active ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}>
                <span className="font-black uppercase">{cp.code}</span>
                <span className="opacity-70">—</span>
                <span>{cp.discountType === 'PERCENTAGE' ? `${cp.discountValue}%` : `${cp.discountValue}€`}</span>
                {cp.maxUses && <span className="opacity-50">({cp.usedCount}/{cp.maxUses})</span>}
                {cp.description && <span className="opacity-50 text-[9px]">— {cp.description}</span>}
                <button onClick={() => handleDeleteCoupon(cp.id)}
                  className="ml-1 w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-[8px] hover:bg-rose-200 transition-colors">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal nuevo cupón */}
      {showCouponForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowCouponForm(false)}>
          <div className="bg-white rounded-[2.5rem] border border-outline-variant/15 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-terracota">NUEVO CUPÓN</span>
                <button onClick={() => setShowCouponForm(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <form onSubmit={handleAddCoupon} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Código</label>
                  <input value={cpCode} onChange={(e) => setCpCode(e.target.value.toUpperCase())}
                    placeholder="Ej. BIENVENIDA10"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs uppercase font-bold" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Descripción (opcional)</label>
                  <input value={cpDesc} onChange={(e) => setCpDesc(e.target.value)}
                    placeholder="Ej. 10% de descuento en primera reserva"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Tipo</label>
                    <select value={cpType} onChange={(e) => setCpType(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs">
                      <option value="PERCENTAGE">Porcentaje</option>
                      <option value="FIXED">Importe fijo</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Valor</label>
                    <input type="number" step="0.01" min="0" value={cpValue} onChange={(e) => setCpValue(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Usos máximos</label>
                    <input type="number" min="1" value={cpMaxUses} onChange={(e) => setCpMaxUses(e.target.value)}
                      placeholder="Ilimitado"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Importe mínimo</label>
                    <input type="number" step="0.01" min="0" value={cpMinAmount} onChange={(e) => setCpMinAmount(e.target.value)}
                      placeholder="Sin mínimo"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Fecha de expiración</label>
                  <input type="date" value={cpExpires} onChange={(e) => setCpExpires(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs" />
                </div>
                <button type="submit"
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold text-xs hover:scale-[0.98] transition-all">
                  Crear cupón
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
