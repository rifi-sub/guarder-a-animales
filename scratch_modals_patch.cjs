const fs = require('fs');

const file = '/home/ilias/yakuza/src/components/AdminPanel.jsx';
let content = fs.readFileSync(file, 'utf8');

const modalsHtml = `      {/* MODAL ACEPTAR RESERVA */}
      {acceptingBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-surface w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-on-surface mb-2">Aceptar Reserva</h3>
              <p className="text-on-surface-variant text-sm mb-6">Selecciona el porcentaje del total a cobrar por adelantado.</p>

              <div className="space-y-3 mb-6">
                <label className={\`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors \${acceptPaymentPercentage === 100 ? 'border-primary bg-primary/5' : 'border-outline-variant/30 hover:bg-surface-variant/30'}\`}>
                  <input type="radio" name="paymentPct" value={100} checked={acceptPaymentPercentage === 100} onChange={() => setAcceptPaymentPercentage(100)} className="hidden" />
                  <div className={\`w-5 h-5 rounded-full border-2 flex items-center justify-center \${acceptPaymentPercentage === 100 ? 'border-primary' : 'border-outline-variant'}\`}>
                    {acceptPaymentPercentage === 100 && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                  </div>
                  <div>
                    <div className="font-bold text-on-surface">100% del Total</div>
                    <div className="text-xs text-on-surface-variant">Cobrar la totalidad de la estancia ahora.</div>
                  </div>
                </label>

                <label className={\`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors \${acceptPaymentPercentage === 50 ? 'border-primary bg-primary/5' : 'border-outline-variant/30 hover:bg-surface-variant/30'}\`}>
                  <input type="radio" name="paymentPct" value={50} checked={acceptPaymentPercentage === 50} onChange={() => setAcceptPaymentPercentage(50)} className="hidden" />
                  <div className={\`w-5 h-5 rounded-full border-2 flex items-center justify-center \${acceptPaymentPercentage === 50 ? 'border-primary' : 'border-outline-variant'}\`}>
                    {acceptPaymentPercentage === 50 && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                  </div>
                  <div>
                    <div className="font-bold text-on-surface">50% de Anticipo</div>
                    <div className="text-xs text-on-surface-variant">Pedir la mitad ahora y la otra mitad después.</div>
                  </div>
                </label>

                <label className={\`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors \${acceptPaymentPercentage === 0 ? 'border-primary bg-primary/5' : 'border-outline-variant/30 hover:bg-surface-variant/30'}\`}>
                  <input type="radio" name="paymentPct" value={0} checked={acceptPaymentPercentage === 0} onChange={() => setAcceptPaymentPercentage(0)} className="hidden" />
                  <div className={\`w-5 h-5 rounded-full border-2 flex items-center justify-center \${acceptPaymentPercentage === 0 ? 'border-primary' : 'border-outline-variant'}\`}>
                    {acceptPaymentPercentage === 0 && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                  </div>
                  <div>
                    <div className="font-bold text-on-surface">0% (Sin Anticipo)</div>
                    <div className="text-xs text-on-surface-variant">Aceptar y cobrar directamente al finalizar la estancia.</div>
                  </div>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setAcceptingBooking(null)}
                  className="flex-1 py-3 text-on-surface-variant hover:bg-surface-variant/50 rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmAcceptBooking}
                  className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Confirmar y Enviar Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONTRAOFERTA */}
      {alternativeBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-surface w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-on-surface mb-2">Ofrecer Alternativa</h3>
              <p className="text-on-surface-variant text-sm mb-4">La reserva pasará a estado CONTRAOFERTA y se enviará este mensaje al cliente.</p>

              <textarea
                value={alternativeMessage}
                onChange={(e) => setAlternativeMessage(e.target.value)}
                placeholder="Ej. Las fechas indicadas están llenas, pero podríamos hacer la guardería a partir del día 14..."
                className="w-full bg-surface-variant/30 border border-outline-variant/30 rounded-2xl p-4 text-on-surface focus:outline-none focus:border-primary min-h-[120px] mb-6"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setAlternativeBooking(null)}
                  className="flex-1 py-3 text-on-surface-variant hover:bg-surface-variant/50 rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmAlternative}
                  disabled={!alternativeMessage}
                  className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enviar Oferta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FICHA 360 Y TIMELINE DE INTERACCIONES */}`;

content = content.replace(`{/* MODAL FICHA 360 Y TIMELINE DE INTERACCIONES */}`, modalsHtml);

fs.writeFileSync(file, content);
console.log("AdminPanel modals patched successfully.");
