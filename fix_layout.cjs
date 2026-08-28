const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix Main Layout in App.tsx
code = code.replace(
  /className="\w+-full \${editingDay \? 'hidden lg:block lg:w-3\/5' : ''} lg:w-3\/5 lg:border-l border-gray-200 overflow-y-auto p-4 sm:p-6 space-y-4 pb-32"/,
  'className="w-full max-w-3xl mx-auto overflow-y-auto p-4 sm:p-6 space-y-4 pb-32"'
);

fs.writeFileSync('src/App.tsx', code);
