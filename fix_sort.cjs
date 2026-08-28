const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldSort = `(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()`;
const newSort = `(a, b) => (a.date || '').localeCompare(b.date || '')`;

code = code.replaceAll(oldSort, newSort);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed sort');
