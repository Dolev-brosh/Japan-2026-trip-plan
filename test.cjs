const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(
  'onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}',
  'onClick={(e) => { e.stopPropagation(); console.log("Button clicked, current state:", isAddMenuOpen); setIsAddMenuOpen(!isAddMenuOpen); }}'
);
fs.writeFileSync('src/App.tsx', code);
