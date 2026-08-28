const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const transitView = `                   {day.transitDetails && day.transitDetails.trim() !== '' && (
                     <div className="col-span-2 mt-2">
                       <p className={\`text-xs font-bold mb-1 \${day.isCurrent ? 'text-emerald-600' : 'text-gray-500'}\`}>נסיעות:</p>
                       <div className={\`space-y-1 w-full break-words leading-relaxed text-sm \${day.isCurrent ? 'text-emerald-800 italic' : 'text-gray-700'}\`}>
                         {day.transitDetails.split(/\\r?\\n/).map((line, idx) => (
                           <p key={idx} className="min-h-[1rem]">
                             {line || '\\u00A0'}
                           </p>
                         ))}
                       </div>
                     </div>
                   )}
                   
                   {day.description && (`;

code = code.replace('                   {day.description && (', transitView);

fs.writeFileSync('src/App.tsx', code);
