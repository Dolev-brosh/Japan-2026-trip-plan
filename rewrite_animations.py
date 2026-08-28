import sys
import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# 1. Edit Modal Layout & Animation
edit_modal_old = """  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden lg:static lg:w-2/5 lg:border-r lg:border-gray-100 lg:z-0 lg:translate-y-0" 
      dir="rtl"
    >
      {/* Header */}
      <div className="p-6 flex justify-between items-center border-b border-gray-100 shrink-0 bg-white shadow-sm lg:shadow-none">"""

edit_modal_new = """  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">
      {/* Dark overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10"
      >
      {/* Header */}
      <div className="p-6 flex justify-between items-center border-b border-gray-100 shrink-0 bg-white shadow-sm">"""

code = code.replace(edit_modal_old, edit_modal_new)

# Edit Modal closing tag
edit_modal_end_old = """      {/* Sticky Footer */}
      <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0">
        <button 
          onClick={() => onSave(formData)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-md active:scale-[0.98] transition-all"
        >
          שמור שינויים
        </button>
      </div>
    </motion.div>
  )"""

edit_modal_end_new = """      {/* Sticky Footer */}
      <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0">
        <button 
          onClick={() => onSave(formData)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-md transition-all duration-200 ease-in-out active:scale-95"
        >
          שמור שינויים
        </button>
      </div>
      </motion.div>
    </div>
  )"""

code = code.replace(edit_modal_end_old, edit_modal_end_new)

# 2. Accordion CSS Grid Animation
accordion_old = """          {/* Expanded Details */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className={`px-4 pb-4 ${day.isCurrent ? 'bg-emerald-50' : 'bg-white'}`}>"""

accordion_new = """          {/* Expanded Details */}
          <div 
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
          >
            <div className="overflow-hidden">
                <div className={`px-4 pb-4 ${day.isCurrent ? 'bg-emerald-50' : 'bg-white'}`}>"""

code = code.replace(accordion_old, accordion_new)

accordion_end_old = """                     </div>
                   )}
                </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
       </motion.div>"""

accordion_end_new = """                     </div>
                   )}
                </div>
                </div>
            </div>
          </div>
       </motion.div>"""

code = code.replace(accordion_end_old, accordion_end_new)


# 3. Swipe-to-Delete Smooth Translation
# In SwipeableCard:
swipe_handle_old = """  const handleDragEnd = (e: any, info: any) => {
    // Reveal delete action if dragged far enough to the left
    if (!isExpanded && info.offset.x < -40) {
       controls.start({ x: -80 });
    } else {
       controls.start({ x: 0 });
    }
  };"""

swipe_handle_new = """  const handleDragEnd = (e: any, info: any) => {
    // Reveal delete action if dragged far enough to the left
    if (!isExpanded && info.offset.x < -40) {
       controls.start({ x: -80, transition: { type: 'tween', duration: 0.3 } });
    } else {
       controls.start({ x: 0, transition: { type: 'tween', duration: 0.3 } });
    }
  };"""

code = code.replace(swipe_handle_old, swipe_handle_new)

swipe_div_old = """       <motion.div
         drag={!isExpanded ? "x" : false}
         dragDirectionLock
         dragConstraints={{ left: -80, right: 0 }}
         onDragEnd={handleDragEnd}
         animate={controls}
         className={`rounded-[16px] border relative z-10 w-full overflow-hidden transition-all ${day.isCurrent ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'}`}
       >"""

swipe_div_new = """       <motion.div
         drag={!isExpanded ? "x" : false}
         dragDirectionLock
         dragConstraints={{ left: -80, right: 0 }}
         onDragEnd={handleDragEnd}
         animate={controls}
         className={`rounded-[16px] border relative z-10 w-full overflow-hidden transition-colors duration-300 ${day.isCurrent ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'}`}
       >"""

code = code.replace(swipe_div_old, swipe_div_new)

# 4. Micro-interactions
menu_button_old = """                   <button 
                     onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                     className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
                   >
                     <MoreVertical size={20} />
                   </button>"""

menu_button_new = """                   <button 
                     onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                     className="p-1 text-gray-400 hover:text-gray-700 transition-all duration-200 ease-in-out active:scale-95"
                   >
                     <MoreVertical size={20} />
                   </button>"""

code = code.replace(menu_button_old, menu_button_new)

edit_menu_item_old = """                         <button 
                           onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(day); }}
                           className="w-full text-right px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                         >"""

edit_menu_item_new = """                         <button 
                           onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(day); }}
                           className="w-full text-right px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200 ease-in-out active:scale-95"
                         >"""

code = code.replace(edit_menu_item_old, edit_menu_item_new)

delete_menu_item_old = """                         <button 
                           onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDeleteRequest(day.id); }}
                           className="w-full text-right px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-50"
                         >"""

delete_menu_item_new = """                         <button 
                           onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDeleteRequest(day.id); }}
                           className="w-full text-right px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-50 transition-all duration-200 ease-in-out active:scale-95"
                         >"""

code = code.replace(delete_menu_item_old, delete_menu_item_new)

fab_old = """                 className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-emerald-700 font-bold transition-transform active:scale-95"
               >
                  <Plus size={20} strokeWidth={3} />"""

fab_new = """                 className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-emerald-700 font-bold transition-all duration-200 ease-in-out active:scale-95"
               >
                  <Plus size={20} strokeWidth={3} />"""

code = code.replace(fab_old, fab_new)


with open('src/App.tsx', 'w') as f:
    f.write(code)

print("Rewrite complete")
