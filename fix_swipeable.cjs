const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const startIdx = code.indexOf('const SwipeableCard = ({');
const endIdx = code.indexOf('const DeleteConfirmModal = ({');

const newSwipeableCard = `const SwipeableCard = ({ 
  day, 
  index,
  isExpanded, 
  onToggle, 
  onEdit, 
  onDeleteRequest 
}: { 
  day: TimelineItem; 
  index: number;
  isExpanded: boolean; 
  onToggle: () => void; 
  onEdit: (day: TimelineItem) => void;
  onDeleteRequest: (id: string) => void;
}) => {
  const controls = useAnimation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleDragEnd = (e: any, info: any) => {
    if (!isExpanded && info.offset.x < -40) {
       controls.start({ x: -80, transition: { type: 'tween', duration: 0.3 } });
    } else {
       controls.start({ x: 0, transition: { type: 'tween', duration: 0.3 } });
    }
  };

  const isDay = !day.type || day.type === 'day';
  const isTicket = day.type === 'ticket';
  const isReminder = day.type === 'reminder';

  const cardStyle = isDay ? 
    (day.isCurrent ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-gray-200 text-gray-700') :
    isReminder ? 'border-gray-200 text-gray-800' : 
    'text-white border-transparent';

  const bgColor = isReminder ? (day.color || '#fef3c7') : isTicket ? (day.color || '#10b981') : (day.isCurrent ? '#ecfdf5' : '#ffffff');

  return (
    <div className="relative w-full rounded-[16px] overflow-hidden mb-5 bg-[#F9FAFB]">
       {/* Background Delete Action */}
       <div 
         className="absolute top-[2px] bottom-[2px] right-[2px] w-[5.5rem] bg-red-500 flex flex-col items-center justify-center text-white cursor-pointer rounded-[14px]"
         onClick={(e) => {
           e.stopPropagation();
           onDeleteRequest(day.id);
           controls.start({ x: 0 });
         }}
       >
          <Trash2 size={24} className="mb-1" />
          <span className="text-sm font-medium">מחיקה</span>
       </div>
       
       {/* Foreground Card */}
       <motion.div
         drag={!isExpanded ? "x" : false}
         dragDirectionLock
         dragConstraints={{ left: -80, right: 0 }}
         onDragEnd={handleDragEnd}
         animate={controls}
         style={{ backgroundColor: bgColor }}
         className={\`rounded-[16px] border relative z-10 w-full overflow-hidden transition-colors duration-300 \${cardStyle}\`}
       >
          {/* Card Header */}
          <div 
            className="p-4 cursor-pointer flex items-start justify-between"
            onClick={onToggle}
          >
            <div className="flex-1 pl-4 flex gap-3 items-start">
               {isTicket && day.emoji && (
                 <div className="text-2xl mt-1 opacity-90">{day.emoji}</div>
               )}
               <div>
                 {day.isCurrent && isDay && isExpanded && (
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 inline-block uppercase">פעיל כעת</span>
                 )}
                 <h3 className={\`font-bold text-base leading-tight \${isTicket ? 'text-white' : ''}\`}>
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
                   <div className={\`text-xs mt-1 \${isTicket ? 'text-white/80' : 'text-gray-500'}\`}>
                     {formatDate(day.date)}
                   </div>
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
                 <ChevronLeft className={\`w-5 h-5 \${isTicket ? 'text-white/60' : 'text-gray-400'}\`} />
               )}
            </div>
          </div>

          {/* Expanded Details */}
          <div 
            className={\`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out \${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}\`}
          >
            <div className="overflow-hidden">
                <div className="px-4 pb-4">
                  {/* Day Content */}
                  {isDay && (
                    <div className={\`pt-4 border-t \${day.isCurrent ? 'border-emerald-100' : 'border-gray-100'} grid grid-cols-2 gap-y-4 text-sm\`}>
                     {day.city && (
                       <div>
                         <p className={\`text-xs font-bold mb-1 \${day.isCurrent ? 'text-emerald-600' : 'text-gray-500'}\`}>עיר הטיול:</p>
                         <p className={day.isCurrent ? 'text-emerald-900' : 'text-gray-800'}>{day.city}</p>
                       </div>
                     )}
                     {day.accommodationArea && (
                       <div>
                         <p className={\`text-xs font-bold mb-1 \${day.isCurrent ? 'text-emerald-600' : 'text-gray-500'}\`}>מיקום הלינה:</p>
                         <p className={day.isCurrent ? 'text-emerald-900' : 'text-gray-800'}>{day.accommodationArea}</p>
                       </div>
                     )}
                     {day.hotelName && (
                       <div className="col-span-2">
                         <p className={\`text-xs font-bold mb-1 \${day.isCurrent ? 'text-emerald-600' : 'text-gray-500'}\`}>שם המלון:</p>
                         <div>
                            {day.hotelLink ? (
                                <a href={day.hotelLink} target="_blank" rel="noreferrer" className={\`\${day.isCurrent ? 'text-emerald-700 decoration-emerald-300' : 'text-emerald-600 decoration-emerald-200'} underline font-medium\`} onClick={e => e.stopPropagation()}>
                                  {day.hotelName}
                                </a>
                            ) : (
                                <span className={\`font-medium \${day.isCurrent ? 'text-emerald-900' : 'text-gray-800'}\`}>{day.hotelName}</span>
                            )}
                            {(day.nightNumber || day.totalNights) ? (
                               <span className={\`text-[11px] mr-1 font-medium \${day.isCurrent ? 'text-emerald-700/70' : 'text-gray-400'}\`}>
                                 (לילה {day.nightNumber} מתוך {day.totalNights})
                               </span>
                            ) : null}
                         </div>
                       </div>
                     )}
                     
                     {day.transitDetails && day.transitDetails.trim() !== '' && (
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
                     
                     {day.description && (
                       <div className="col-span-2 mt-2">
                         <p className={\`text-xs font-bold mb-1 \${day.isCurrent ? 'text-emerald-600' : 'text-gray-500'}\`}>תיאור המסלול היומי:</p>
                         <div className={\`space-y-1 w-full break-words leading-relaxed text-sm \${day.isCurrent ? 'text-emerald-800 italic' : 'text-gray-700'}\`}>
                           {day.description.split(/\\r?\\n/).map((line, idx) => (
                             <p key={idx} className="min-h-[1rem]">
                               {line || '\\u00A0'}
                             </p>
                           ))}
                         </div>
                       </div>
                     )}
                    </div>
                  )}

                  {/* Ticket Content */}
                  {isTicket && (
                    <div className="pt-4 border-t border-white/20">
                      {(!day.fields || day.fields.length === 0) ? (
                        <p className="text-white/70 text-sm italic">אין פרטים נוספים</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {day.fields.map(f => (
                            <div key={f.id} className="bg-black/10 rounded-lg p-3 backdrop-blur-sm">
                              <p className="text-[10px] text-white/70 uppercase tracking-wider mb-1 font-bold">{f.label}</p>
                              <p className="text-sm font-semibold text-white truncate">{f.value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reminder Content */}
                  {isReminder && (
                    <div className="pt-4 border-t border-black/5 text-sm leading-relaxed text-gray-700 font-medium whitespace-pre-wrap break-words">
                      {day.notes || <span className="text-gray-400 italic">אין תוכן...</span>}
                    </div>
                  )}
                </div>
            </div>
          </div>
       </motion.div>
    </div>
  );
};
`

code = code.substring(0, startIdx) + newSwipeableCard + code.substring(endIdx);
fs.writeFileSync('src/App.tsx', code);
