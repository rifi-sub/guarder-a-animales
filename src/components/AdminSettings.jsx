import React, { useState, useEffect } from "react";
import { API_BASE } from "../config";

const AdminSettings = ({ token }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert("Ajustes guardados correctamente");
      } else {
        alert("Error al guardar ajustes");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin">refresh</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 bg-surface p-8 rounded-3xl shadow-sm border border-outline-variant/20">
      <div>
        <h2 className="text-3xl font-bold text-primary mb-2 font-display-lg">Ajustes Generales</h2>
        <p className="text-on-surface-variant text-sm mb-6">Configura el comportamiento global de la aplicación.</p>

        <div className="space-y-6">
          <div className="bg-surface-variant/20 p-6 rounded-2xl border border-outline-variant/30">
            <h3 className="font-bold text-on-surface mb-1">Porcentaje de Anticipo por Defecto</h3>
            <p className="text-sm text-on-surface-variant mb-4">
              Este es el porcentaje que se seleccionará por defecto al aceptar una nueva reserva.
            </p>
            <select
              value={settings.default_payment_percentage || "50"}
              onChange={(e) => setSettings({ ...settings, default_payment_percentage: e.target.value })}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="100">100% (Cobro total)</option>
              <option value="50">50% (Seña mitad)</option>
              <option value="0">0% (Cobro al final)</option>
            </select>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar Ajustes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
