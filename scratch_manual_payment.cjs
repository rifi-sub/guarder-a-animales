const fs = require('fs');

const file = '/home/ilias/yakuza/src/components/AdminPanel.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add the endpoint function for manual payment
const endOfAcceptMethod = `alert('Error de conexión');
    }
  };`;

const manualPaymentMethod = `
  const handleManualPayment = async (id, currentPaid, price) => {
    const amountStr = prompt(\`Introduce la cantidad recibida manualmente (Ej. 20).\\nPrecio total: \${price}€\\nYa pagado: \${currentPaid || 0}€\`);
    if (!amountStr) return;
    
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return alert('Cantidad inválida');
    
    try {
      // Re-using the patch endpoint to just add to paidAmount
      const res = await fetch(\`\${API_BASE}/api/admin/bookings/\${id}\`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({ manualPayment: amount })
      });
      
      if (res.ok) {
        alert('Pago manual registrado correctamente.');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al registrar pago');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };
`;

content = content.replace(endOfAcceptMethod, endOfAcceptMethod + manualPaymentMethod);

// Find where the status badge is rendered and add the paid info
const statusRender = `{booking.status === 'PENDIENTE' && <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">Pendiente</span>}`;
const paidInfo = `
                            {booking.depositAmount > 0 && (
                              <div className="mt-2 text-xs">
                                <span className="text-on-surface-variant">Pagado: </span>
                                <span className={\`font-bold \${(booking.paidAmount || 0) >= (booking.price || 0) ? 'text-emerald-600' : (booking.paidAmount || 0) >= booking.depositAmount ? 'text-amber-600' : 'text-rose-600'}\`}>
                                  {(booking.paidAmount || 0).toFixed(2)}€ / {(booking.price || 0).toFixed(2)}€
                                </span>
                              </div>
                            )}
`;
// We will insert it inside the booking card details
const bookingDetailsBottom = `<div className="mt-3 flex items-center justify-between">`;
content = content.replace(bookingDetailsBottom, paidInfo + bookingDetailsBottom);

// Add the Registrar Pago button in the actions section for accepted bookings
const startEditingButton = `<button
                                onClick={() => startEditingBooking(booking)}`;

const newButtons = `
                              {['ACEPTADA', 'CONTRAOFERTA'].includes(booking.status) && (booking.paidAmount || 0) < (booking.price || 0) && (
                                <button
                                  onClick={() => handleManualPayment(booking.id, booking.paidAmount, booking.price)}
                                  className="w-full bg-surface-variant/50 text-on-surface border border-outline-variant/30 text-xs font-bold px-4 py-2 rounded-xl hover:bg-surface-variant transition-colors flex items-center justify-center gap-1.5 mb-2"
                                >
                                  <span className="material-symbols-outlined text-sm">payments</span>
                                  Pago Manual
                                </button>
                              )}
                              <button
                                onClick={() => startEditingBooking(booking)}`;

content = content.replace(startEditingButton, newButtons);

fs.writeFileSync(file, content);
console.log('Manual payment button added');
