import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldSubtitleBlock = `               {(day.date || day.subtitle) && (
                 <div className={\`text-xs text-gray-400 mt-1 overflow-hidden transition-all duration-300 ease-in-out \${isExpanded ? 'max-h-40 line-clamp-[100]' : 'max-h-4 line-clamp-1'}\`}>
                   {day.date ? formatDate(day.date) : ''}
                   {day.date && day.subtitle ? ' • ' : ''}
                   {day.subtitle || ''}
                 </div>
               )}`;

const newSubtitleBlock = `               {(day.date || day.subtitle) && (
                 <div className="text-xs text-gray-400 mt-1 relative">
                   <motion.div
                     initial={false}
                     animate={{ opacity: isExpanded ? 0 : 1 }}
                     transition={{ duration: 0.2 }}
                     className="absolute top-0 left-0 w-full line-clamp-1 pointer-events-none"
                   >
                     {day.date ? formatDate(day.date) : ''}
                     {day.date && day.subtitle ? ' • ' : ''}
                     {day.subtitle || ''}
                   </motion.div>
                   <motion.div
                     initial={false}
                     animate={{ 
                       height: isExpanded ? 'auto' : '1rem',
                       opacity: isExpanded ? 1 : 0 
                     }}
                     transition={{ duration: 0.3, ease: "easeInOut" }}
                     className="overflow-hidden"
                   >
                     {day.date ? formatDate(day.date) : ''}
                     {day.date && day.subtitle ? ' • ' : ''}
                     {day.subtitle || ''}
                   </motion.div>
                 </div>
               )}`;

code = code.replace(oldSubtitleBlock, newSubtitleBlock);
fs.writeFileSync('src/App.tsx', code);
console.log('Fixed subtitle to crossfade');
