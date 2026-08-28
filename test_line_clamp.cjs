const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldSubtitle = `                 <div className={\`text-xs text-gray-400 mt-1 overflow-hidden transition-[max-height] duration-300 ease-in-out \${isExpanded ? 'max-h-40' : 'max-h-4'}\`}>`;
const newSubtitle = `                 <div className={\`text-xs text-gray-400 mt-1 overflow-hidden transition-all duration-300 ease-in-out \${isExpanded ? 'max-h-40 line-clamp-[100]' : 'max-h-4 line-clamp-1'}\`}>`;

code = code.replace(oldSubtitle, newSubtitle);
fs.writeFileSync('src/App.tsx', code);
console.log('Done');
