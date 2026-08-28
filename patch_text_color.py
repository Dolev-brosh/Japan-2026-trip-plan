import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update TimelineItem interface
code = code.replace(
    "  color?: string;",
    "  color?: string;\n  textColor?: 'white' | 'black';"
)

# 2. Update SwipeableCard variables
old_card_vars = """  const isDay = !day.type || day.type === 'day';
  const isTicket = day.type === 'ticket';
  const isReminder = day.type === 'reminder';

  const cardStyle = isDay ? 
    (day.isCurrent ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-gray-200 text-gray-700') :
    'text-white border-transparent';

  const bgColor = !isDay ? (day.color || (isTicket ? '#10b981' : '#f59e0b')) : (day.isCurrent ? '#ecfdf5' : '#ffffff');"""

new_card_vars = """  const isDay = !day.type || day.type === 'day';
  const isTicket = day.type === 'ticket';
  const isReminder = day.type === 'reminder';

  const isDarkText = day.textColor === 'black';
  const nonDayTitleClass = isDarkText ? 'text-gray-900' : 'text-white';
  const nonDaySubtitleClass = isDarkText ? 'text-gray-700' : 'text-white/80';
  const nonDayBorderClass = isDarkText ? 'border-gray-900/10' : 'border-white/20';
  const nonDayTextMutedClass = isDarkText ? 'text-gray-600' : 'text-white/70';
  const nonDayBgClass = isDarkText ? 'bg-white/30' : 'bg-black/10';
  const nonDayIconClass = isDarkText ? 'text-gray-800 hover:text-gray-900' : 'text-white hover:text-gray-200';

  const cardStyle = isDay ? 
    (day.isCurrent ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-gray-200 text-gray-700') :
    `${isDarkText ? 'text-gray-900' : 'text-white'} border-transparent`;

  const bgColor = !isDay ? (day.color || (isTicket ? '#10b981' : '#f59e0b')) : (day.isCurrent ? '#ecfdf5' : '#ffffff');"""

if old_card_vars in code:
    code = code.replace(old_card_vars, new_card_vars)
else:
    print("Could not patch SwipeableCard vars")

# 3. Update SwipeableCard rendering
code = code.replace(
    "<h3 className={`font-bold leading-tight ${!isDay ? 'text-white text-xs' : 'text-base'}`}>",
    "<h3 className={`font-bold leading-tight ${!isDay ? `${nonDayTitleClass} text-xs` : 'text-base'}`}>"
)
code = code.replace(
    "className={`text-xs overflow-hidden ${!isDay ? 'text-white/80' : 'text-gray-500'}`}",
    "className={`text-xs overflow-hidden ${!isDay ? nonDaySubtitleClass : 'text-gray-500'}`}"
)
code = code.replace(
    "className={`p-1 transition-all duration-200 ease-in-out active:scale-95 ${!isDay ? 'text-white hover:text-gray-200' : 'text-gray-400 hover:text-gray-700'}`}",
    "className={`p-1 transition-all duration-200 ease-in-out active:scale-95 ${!isDay ? nonDayIconClass : 'text-gray-400 hover:text-gray-700'}`}"
)

old_ticket_content = """                  {/* Ticket Content */}
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
                  )}"""

new_ticket_content = """                  {/* Ticket Content */}
                  {isTicket && (
                    <div className={`pt-4 border-t ${nonDayBorderClass}`}>
                      {(!day.fields || day.fields.length === 0) ? (
                        <p className={`${nonDayTextMutedClass} text-sm italic`}>אין פרטים נוספים</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {day.fields.map(f => (
                            <div key={f.id} className={`${nonDayBgClass} rounded-lg p-3 backdrop-blur-sm`}>
                              <p className={`text-[10px] ${nonDayTextMutedClass} uppercase tracking-wider mb-1 font-bold`}>{f.label}</p>
                              <p className={`text-sm font-semibold ${nonDayTitleClass} truncate`}>{f.value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}"""

if old_ticket_content in code:
    code = code.replace(old_ticket_content, new_ticket_content)
else:
    print("Could not patch Ticket Content")

old_reminder_content = """                  {/* Reminder Content */}
                  {isReminder && (
                    <div className="pt-4 border-t border-white/20 text-sm leading-relaxed text-white font-medium whitespace-pre-wrap break-words">
                      {day.notes || <span className="text-white/50 italic">אין תוכן...</span>}
                    </div>
                  )}"""

new_reminder_content = """                  {/* Reminder Content */}
                  {isReminder && (
                    <div className={`pt-4 border-t ${nonDayBorderClass} text-sm leading-relaxed ${nonDayTitleClass} font-medium whitespace-pre-wrap break-words`}>
                      {day.notes || <span className={`${nonDayTextMutedClass} italic`}>אין תוכן...</span>}
                    </div>
                  )}"""

if old_reminder_content in code:
    code = code.replace(old_reminder_content, new_reminder_content)
else:
    print("Could not patch Reminder Content")

# 4. Update EditModal Ticket controls
code = code.replace(
    '<div className="grid grid-cols-2 gap-4">',
    '<div className="grid grid-cols-3 gap-4">'
)

text_color_toggle_html = """                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">צבע טקסט</label>
                  <div className="flex bg-gray-100 rounded-lg p-1 w-fit h-10">
                    <button 
                      onClick={() => handleChange('textColor', 'white')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${(!formData.textColor || formData.textColor === 'white') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      לבן
                    </button>
                    <button 
                      onClick={() => handleChange('textColor', 'black')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${formData.textColor === 'black' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      שחור
                    </button>
                  </div>
                </div>"""

# Insert next to background color in Ticket (and we can do Reminder too)
old_bg_color_ticket = """                <div className="relative">
                  <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">צבע רקע</label>
                  <button 
                    onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                    className="w-16 h-10 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                    style={{ backgroundColor: formData.color || '#10b981' }}
                  />"""

new_bg_color_ticket = f"""                <div className="relative">
                  <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">צבע רקע</label>
                  <button 
                    onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                    className="w-16 h-10 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                    style={{ backgroundColor: formData.color || '#10b981' }}
                  />
                  <AnimatePresence>
                    {{isColorPickerOpen && (
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
                              color={{formData.color || '#10b981'}} 
                              onChange={{(newColor) => handleChange('color', newColor)}} 
                            />
                            <div className="flex items-center gap-2" dir="ltr">
                              <span className="text-gray-500 text-sm font-semibold uppercase">HEX:</span>
                              <HexColorInput 
                                color={{formData.color || '#10b981'}} 
                                onChange={{(newColor) => handleChange('color', newColor)}} 
                                prefixed
                                className="border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-emerald-500 w-full uppercase"
                              />
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}}
                  </AnimatePresence>
                </div>

{text_color_toggle_html}"""

# Actually, the quickest way to do this for both is to just replace the <label>צבע רקע</label> and add the new text color block after the whole color picker. Let's do it safely.
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

