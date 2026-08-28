import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update cardStyle in SwipeableCard
code = code.replace(
    "    isReminder ? 'border-gray-200 text-gray-800' : \n    'text-white border-transparent';",
    "    'text-white border-transparent';"
)

# 2. Update bgColor in SwipeableCard
code = code.replace(
    "const bgColor = isReminder ? (day.color || '#fef3c7') : isTicket ? (day.color || '#10b981') : (day.isCurrent ? '#ecfdf5' : '#ffffff');",
    "const bgColor = !isDay ? (day.color || (isTicket ? '#10b981' : '#f59e0b')) : (day.isCurrent ? '#ecfdf5' : '#ffffff');"
)

# 3. Update text color for ticket title and subtitles, so Reminder gets text-white too
# Currently we have `isTicket ? 'text-white' : ''` and `isTicket ? 'text-white/80' : 'text-gray-500'` etc.
code = code.replace(
    "<h3 className={`font-bold leading-tight ${!isDay ? 'text-sm' : 'text-base'} ${isTicket ? 'text-white' : ''}`}>",
    "<h3 className={`font-bold leading-tight ${!isDay ? 'text-sm' : 'text-base'} ${!isDay ? 'text-white' : ''}`}>"
)
code = code.replace(
    "className={`text-xs overflow-hidden ${isTicket ? 'text-white/80' : 'text-gray-500'}`}",
    "className={`text-xs overflow-hidden ${!isDay ? 'text-white/80' : 'text-gray-500'}`}"
)

# 4. Update reminder expanded content text color
code = code.replace(
    """                  {/* Reminder Content */}
                  {isReminder && (
                    <div className="pt-4 border-t border-black/5 text-sm leading-relaxed text-gray-700 font-medium whitespace-pre-wrap break-words">
                      {day.notes || <span className="text-gray-400 italic">אין תוכן...</span>}
                    </div>
                  )}""",
    """                  {/* Reminder Content */}
                  {isReminder && (
                    <div className="pt-4 border-t border-white/20 text-sm leading-relaxed text-white font-medium whitespace-pre-wrap break-words">
                      {day.notes || <span className="text-white/50 italic">אין תוכן...</span>}
                    </div>
                  )}"""
)

# 5. Update the EditModal reminder color picker
old_picker = """              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">צבע רקע</label>
                <div className="flex gap-2 flex-wrap">
                  {reminderColors.map(c => (
                    <button 
                      key={c} onClick={() => handleChange('color', c)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform active:scale-90 ${formData.color === c ? 'border-gray-400 scale-110' : 'border-gray-200'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>"""

new_picker = """              <div className="relative">
                <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">צבע רקע</label>
                <button 
                  onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                  className="w-16 h-10 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                  style={{ backgroundColor: formData.color || '#f59e0b' }}
                />
                <AnimatePresence>
                  {isColorPickerOpen && (
                    <>
                      <div className="fixed inset-0 z-[110]" onClick={() => setIsColorPickerOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none"
                      >
                        <div className="pointer-events-auto bg-white p-4 shadow-2xl rounded-2xl border border-gray-100 flex flex-col gap-4">
                          <HexColorPicker 
                            color={formData.color || '#f59e0b'} 
                            onChange={(newColor) => handleChange('color', newColor)} 
                          />
                          <div className="flex items-center gap-2" dir="ltr">
                            <span className="text-gray-500 text-sm font-semibold uppercase">HEX:</span>
                            <HexColorInput 
                              color={formData.color || '#f59e0b'} 
                              onChange={(newColor) => handleChange('color', newColor)} 
                              prefixed
                              className="border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-emerald-500 w-full uppercase"
                            />
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>"""

code = code.replace(old_picker, new_picker)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

