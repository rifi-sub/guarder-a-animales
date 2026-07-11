const fs = require('fs');

const file = '/home/ilias/yakuza/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import Footer')) {
  const importsStart = `import Terms from './components/Terms';`;
  content = content.replace(importsStart, importsStart + `\nimport Footer from './components/Footer';`);
}

if (!content.includes('<Footer />')) {
  const routesEnd = `</Routes>\n      </div>`;
  if (content.includes(routesEnd)) {
      content = content.replace(routesEnd, `</Routes>\n      </div>\n      <Footer />`);
  } else {
      content = content.replace(`</Routes>`, `</Routes>\n        <Footer />`);
  }
}

fs.writeFileSync(file, content);
console.log('Footer added');
