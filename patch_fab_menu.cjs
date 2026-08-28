const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldFab = `{/* Floating Action Button */}
          {!editingItem && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:left-auto lg:right-[30%] lg:translate-x-1/2 z-50">
               <button 
                 onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                 className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-emerald-700 font-bold transition-all duration-200 ease-in-out active:scale-95 relative z-[60]"
               >
                  <Plus size={20} strokeWidth={3} />
                  <span>הוספה</span>
               </button>
            </div>
          )}`;

const newFab = `{/* Floating Action Button */}
          {!editingItem && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:left-auto lg:right-[30%] lg:translate-x-1/2 z-50 flex flex-col items-center">
               <AnimatePresence>
                 {isAddMenuOpen && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 20 }}
                     className="absolute bottom-16 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden min-w-[180px] z-[60] flex flex-col"
                   >
                     <button onClick={() => handleAddClick('day')} className="w-full text-right px-4 py-4 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-3 transition-colors">
                       <Calendar size={18} className="text-emerald-500" />
                       יום חדש
                     </button>
                     <button onClick={() => handleAddClick('ticket')} className="w-full text-right px-4 py-4 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-3 transition-colors border-t border-gray-50">
                       <Ticket size={18} className="text-blue-500" />
                       כרטיס חדש
                     </button>
                     <button onClick={() => handleAddClick('reminder')} className="w-full text-right px-4 py-4 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-3 transition-colors border-t border-gray-50">
                       <Bell size={18} className="text-amber-500" />
                       תזכורת חדשה
                     </button>
                   </motion.div>
                 )}
               </AnimatePresence>
               {isAddMenuOpen && (
                 <div className="fixed inset-0 z-[55]" onClick={() => setIsAddMenuOpen(false)} />
               )}
               
               <button 
                 onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                 className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-emerald-700 font-bold transition-all duration-200 ease-in-out active:scale-95 relative z-[60]"
               >
                  <Plus size={20} strokeWidth={3} className={isAddMenuOpen ? "rotate-45 transition-transform" : "transition-transform"} />
                  <span>הוספה</span>
               </button>
            </div>
          )}`;

code = code.replace(oldFab, newFab);
fs.writeFileSync('src/App.tsx', code);
