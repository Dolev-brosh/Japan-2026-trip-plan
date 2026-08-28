import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Remove EmojiPicker import
code = code.replace("import EmojiPicker from 'emoji-picker-react';\n", "")
code = code.replace("import EmojiPicker from 'emoji-picker-react';", "")

# 2. Remove emoji from TimelineItem
code = code.replace("  emoji?: string;\n", "")
code = code.replace("emoji: type === 'ticket' ? '🎫' : undefined,", "")

# 3. Remove isEmojiPickerOpen
code = code.replace("  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);\n", "")

# 4. In SwipeableCard, apply text color correctly
old_card_vars = """  const cardStyle = isDay ? 
    (day.isCurrent ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-gray-200 text-gray-700') :
    'text-white border-transparent';

  const bgColor = !isDay ? (day.color || (isTicket ? '#10b981' : '#f59e0b')) : (day.isCurrent ? '#ecfdf5' : '#ffffff');"""

new_card_vars = """  const isDarkText = day.textColor === 'black';
  const nonDayTitleClass = isDarkText ? 'text-gray-900' : 'text-white';
  const nonDaySubtitleClass = isDarkText ? 'text-gray-700' : 'text-white/80';
  const nonDayBorderClass = isDarkText ? 'border-gray-900/20' : 'border-white/20';
  const nonDayTextMutedClass = isDarkText ? 'text-gray-600' : 'text-white/70';
  const nonDayBgClass = isDarkText ? 'bg-black/5' : 'bg-black/10';
  const nonDayIconClass = isDarkText ? 'text-gray-800 hover:text-gray-900' : 'text-white hover:text-gray-200';

  const cardStyle = isDay ? 
    (day.isCurrent ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-gray-200 text-gray-700') :
    `${isDarkText ? 'text-gray-900' : 'text-white'} border-transparent`;

  const bgColor = !isDay ? (day.color || (isTicket ? '#10b981' : '#f59e0b')) : (day.isCurrent ? '#ecfdf5' : '#ffffff');"""

if old_card_vars in code:
    code = code.replace(old_card_vars, new_card_vars)
else:
    print("WARNING: Could not patch old_card_vars")

# 5. Remove Emoji render from SwipeableCard
old_emoji_render = """               {isTicket && day.emoji && (
                 <div className="text-sm mt-0.5 opacity-90">{day.emoji}</div>
               )}
"""
if old_emoji_render in code:
    code = code.replace(old_emoji_render, "")
else:
    print("WARNING: Could not patch old_emoji_render")

# 6. Apply classes in SwipeableCard
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
                        <div className="grid grid-cols-3 gap-4">
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
    print("WARNING: Could not patch old_ticket_content")

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
    print("WARNING: Could not patch old_reminder_content")

# 7. Remove Emoji section from EditModal (lines 699 to 730 approx)
old_emoji_section = """                <div className="relative">
                  <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">אמוג'י (לוגו)</label>
                  <button 
                    onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                    className="w-16 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-xl hover:bg-gray-50 transition-colors"
                  >
                    {formData.emoji || '😀'}
                  </button>
                  <AnimatePresence>
                    {isEmojiPickerOpen && (
                      <>
                        <div className="fixed inset-0 z-[110]" onClick={() => setIsEmojiPickerOpen(false)} />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none"
                        >
                          <div className="pointer-events-auto shadow-2xl rounded-lg bg-white overflow-hidden">
                            <EmojiPicker 
                              onEmojiClick={(emojiData) => {
                                handleChange('emoji', emojiData.emoji);
                                setIsEmojiPickerOpen(false);
                              }}
                            />
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>"""
if old_emoji_section in code:
    code = code.replace(old_emoji_section, "")
else:
    print("WARNING: Could not patch old_emoji_section")

code = code.replace('<div className="grid grid-cols-3 gap-4">', '<div className="grid grid-cols-2 gap-4">')

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
