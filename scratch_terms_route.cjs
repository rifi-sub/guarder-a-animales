const fs = require('fs');

const file = '/home/ilias/yakuza/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import Terms')) {
  const importsStart = `import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';`;
  content = content.replace(importsStart, importsStart + `\nimport Terms from './components/Terms';`);
}

if (!content.includes('<Route path="/terminos"')) {
  const routesEnd = `</Routes>`;
  content = content.replace(routesEnd, `  <Route path="/terminos" element={<Terms />} />\n        </Routes>`);
}

fs.writeFileSync(file, content);
console.log('Terms route added');
