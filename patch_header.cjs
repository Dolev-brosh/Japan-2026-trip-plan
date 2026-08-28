const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<div className="flex-1 pl-4 flex gap-3 items-start">([\s\S]*?)<\/div>\s*<\/div>\s*<div className="flex flex-col items-end shrink-0 text-left relative">([\s\S]*?)<ChevronLeft className=\{`w-5 h-5 \$\{isTicket \? 'text-white\/60' : 'text-gray-400'\}`\} \/>\s*\}\)\s*<\/div>/;

const newBlock = `<div className="flex-1 pl-4 flex gap-3 items-start">
               {!isDay && day.emoji && (
                 <div className="text-sm mt-0.5 opacity-90">{day.emoji}</div>
               )}
               <div>
                 {day.isCurrent && isDay && isExpanded && (
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 inline-block uppercase">פעיל כעת</span>
                 )}
                 <h3 className={\`font-bold leading-tight \${!isDay ? 'text-sm' : 'text-base'} \${isTicket ? 'text-white' : ''}\`}>
                   {day.title || (isDay ? \`יום \${index + 1}\` : isTicket ? 'כרטיס' : 'תזכורת')}
                 </h3>
                 
                 {(isDay && (day.date || day.subtitle)) && (
                   <div className={\`text-xs mt-1 relative \${day.isCurrent ? 'text-emerald-700/80' : 'text-gray-400'}\`}>
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
                 )}

                 {/* Non-day subtitles */}
                 {(!isDay && day.date) && (
                   <motion.div 
                     initial={false}
                     animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0, marginTop: isExpanded ? '0.25rem' : 0 }}
                     className={\`text-xs overflow-hidden \${isTicket ? 'text-white/80' : 'text-gray-500'}\`}
                   >
                     {formatDate(day.date)}
                   </motion.div>
                 )}
               </div>
            </div>
            
            <div className="flex flex-col items-end shrink-0 text-left relative">
               {isExpanded ? (
                 <>
                   <button 
                     onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                     className={\`p-1 transition-all duration-200 ease-in-out active:scale-95 \${isTicket ? 'text-white hover:text-gray-200' : 'text-gray-400 hover:text-gray-700'}\`}
                   >
                     <MoreVertical className="w-5 h-5" />
                   </button>
                   
                   <AnimatePresence>
                     {menuOpen && (
                       <motion.div 
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         transition={{ duration: 0.1 }}
                         className="absolute top-8 left-0 min-w-[120px] bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-20 text-gray-800"
                       >
                         <button 
                           onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(day); }}
                           className="w-full text-right px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 transition-all duration-200 ease-in-out active:scale-95"
                         >
                           <Pencil className="w-5 h-5" />
                           עריכה
                         </button>
                         <button 
                           onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDeleteRequest(day.id); }}
                           className="w-full text-right px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 border-t border-gray-50 transition-all duration-200 ease-in-out active:scale-95 text-red-500"
                         >
                           <Trash2 className="w-5 h-5" />
                           מחיקה
                         </button>
                       </motion.div>
                     )}
                   </AnimatePresence>
                   
                   {menuOpen && (
                     <div 
                       className="fixed inset-0 z-10" 
                       onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
                     />
                   )}
                 </>
               ) : (
                 isDay ? <ChevronLeft className="w-5 h-5 text-gray-400" /> : null
               )}
            </div>`;

code = code.replace(regex, newBlock);
fs.writeFileSync('src/App.tsx', code);
