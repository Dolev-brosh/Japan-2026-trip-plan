import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

anchor_search = """                {days.map((day, index) => {
                  const isDay = !day.type || day.type === 'day';
                  const isTicket = day.type === 'ticket';
                  const isReminder = day.type === 'reminder';
                  
                  // Compute the day number (only count actual days up to this index)
                  const dayNumber = days.slice(0, index + 1).filter(d => !d.type || d.type === 'day').length;
                  
                  return (
                    <div key={day.id} className={`relative z-10 ${day.isPast ? 'opacity-70' : ''}`} ref={day.isCurrent ? currentDayRef : null}>
                      {/* Stepper Dot */}
                      {day.isCurrent && isDay ? (
                        <CurrentDayStepper />
                      ) : (
                        <div 
                          className={`absolute top-4 z-10 rounded-full border-4 border-[#F9FAFB] flex items-center justify-center transition-colors duration-300 ${
                            isDay 
                              ? 'w-10 h-10 -right-[52.4px] bg-gray-100 text-gray-400' 
                              : 'w-8 h-8 -right-[48.4px] text-white -mt-[14px]'
                          }`}"""

replacement = """                {days.map((day, index) => {
                  const isDay = !day.type || day.type === 'day';
                  const isTicket = day.type === 'ticket';
                  const isReminder = day.type === 'reminder';
                  const isDarkText = day.textColor === 'black';
                  
                  // Compute the day number (only count actual days up to this index)
                  const dayNumber = days.slice(0, index + 1).filter(d => !d.type || d.type === 'day').length;
                  
                  return (
                    <div key={day.id} className={`relative z-10 ${day.isPast ? 'opacity-70' : ''}`} ref={day.isCurrent ? currentDayRef : null}>
                      {/* Stepper Dot */}
                      {day.isCurrent && isDay ? (
                        <CurrentDayStepper />
                      ) : (
                        <div 
                          className={`absolute top-4 z-10 rounded-full border-4 border-[#F9FAFB] flex items-center justify-center transition-colors duration-300 ${
                            isDay 
                              ? 'w-10 h-10 -right-[52.4px] bg-gray-100 text-gray-400' 
                              : `w-8 h-8 -right-[48.4px] -mt-[14px] ${isDarkText ? 'text-gray-900' : 'text-white'}`
                          }`}"""

if anchor_search in code:
    code = code.replace(anchor_search, replacement)
    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Patched successfully!")
else:
    print("Anchor not found!")

