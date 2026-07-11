const fs = require('fs');

const file = '/home/ilias/yakuza/src/components/AdminPanel.jsx';
let content = fs.readFileSync(file, 'utf8');

const importSettings = `import AdminImages from './AdminImages';\nimport AdminSettings from './AdminSettings';`;
content = content.replace(`import AdminImages from './AdminImages';`, importSettings);

const tabButtonInsert = `          <button onClick={() => setActiveTab('email')} className={\`w-full text-left px-5 py-3 rounded-2xl flex items-center gap-3 transition-colors \${activeTab === 'email' ? 'bg-primary text-on-primary shadow-sm font-bold' : 'text-on-surface-variant hover:bg-surface-variant/50'}\`}>
            <span className="material-symbols-outlined">mail</span>
            Configuración Email
          </button>`;

const newTabButton = `          <button onClick={() => setActiveTab('email')} className={\`w-full text-left px-5 py-3 rounded-2xl flex items-center gap-3 transition-colors \${activeTab === 'email' ? 'bg-primary text-on-primary shadow-sm font-bold' : 'text-on-surface-variant hover:bg-surface-variant/50'}\`}>
            <span className="material-symbols-outlined">mail</span>
            Configuración Email
          </button>
          
          <button onClick={() => setActiveTab('settings')} className={\`w-full text-left px-5 py-3 rounded-2xl flex items-center gap-3 transition-colors \${activeTab === 'settings' ? 'bg-primary text-on-primary shadow-sm font-bold' : 'text-on-surface-variant hover:bg-surface-variant/50'}\`}>
            <span className="material-symbols-outlined">settings</span>
            Ajustes Generales
          </button>`;

content = content.replace(tabButtonInsert, newTabButton);

const tabContentInsert = `        {/* TAB 13: EMAIL */}
        {activeTab === 'email' && (
          <div className="max-w-4xl mx-auto">
            <AdminEmail token={token} />
          </div>
        )}`;

const newTabContent = `        {/* TAB 13: EMAIL */}
        {activeTab === 'email' && (
          <div className="max-w-4xl mx-auto">
            <AdminEmail token={token} />
          </div>
        )}
        
        {/* TAB 14: AJUSTES GENERALES */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto">
            <AdminSettings token={token} />
          </div>
        )}`;

content = content.replace(tabContentInsert, newTabContent);

// Add the logic to load settings in handleAcceptBooking initial state:
// We will replace `const [acceptPaymentPercentage, setAcceptPaymentPercentage] = useState(50);`
// with loading the default. To not overcomplicate, I'll just change the default in the modal to load from API_BASE/api/settings when modal opens.
// Actually, let's inject a useEffect to load default settings in AdminPanel
const useEffectInsert = `  // --- EFECTOS INICIALES ---
  useEffect(() => {
    fetchData();
  }, [token]);`;

const useEffectNew = `  // --- EFECTOS INICIALES ---
  useEffect(() => {
    fetchData();
    fetch(\`\${API_BASE}/api/settings\`).then(res => res.json()).then(data => {
      if (data.default_payment_percentage) {
        setAcceptPaymentPercentage(parseInt(data.default_payment_percentage, 10));
      }
    }).catch(console.error);
  }, [token]);`;

content = content.replace(useEffectInsert, useEffectNew);

fs.writeFileSync(file, content);
console.log('Settings tab added');
