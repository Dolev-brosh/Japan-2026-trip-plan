import re
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix Non-day subtitles
old_subtitles = """                 {/* Non-day subtitles */}
                 {(!isDay && day.date) && (
                   <div className={`text-xs mt-1 ${isTicket ? 'text-white/80' : 'text-gray-500'}`}>
                     {formatDate(day.date)}
                   </div>
                 )}"""

new_subtitles = """                 {/* Non-day subtitles */}
                 {(!isDay && day.date) && (
                   <motion.div 
                     initial={false}
                     animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0, marginTop: isExpanded ? '0.25rem' : 0 }}
                     className={`text-xs overflow-hidden ${isTicket ? 'text-white/80' : 'text-gray-500'}`}
                   >
                     {formatDate(day.date)}
                   </motion.div>
                 )}"""

if old_subtitles in code:
    code = code.replace(old_subtitles, new_subtitles)
    print("Fixed subtitles")
else:
    print("Could not find subtitles block")

# Fix chevron
old_chevron = """               ) : (
                 <ChevronLeft className={`w-5 h-5 ${isTicket ? 'text-white/60' : 'text-gray-400'}`} />
               )}"""

new_chevron = """               ) : (
                 isDay ? <ChevronLeft className="w-5 h-5 text-gray-400" /> : null
               )}"""

if old_chevron in code:
    code = code.replace(old_chevron, new_chevron)
    print("Fixed chevron")
else:
    print("Could not find chevron block")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
