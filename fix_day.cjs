const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/loadedDays: Day\[\]/g, 'loadedDays: TimelineItem[]');
code = code.replace(/newDays: Day\[\]/g, 'newDays: TimelineItem[]');

fs.writeFileSync('src/App.tsx', code);
