import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_block = """                      ) : (
                        <div 
                          className={`absolute top-4 z-10 rounded-full border-4 border-[#F9FAFB] flex items-center justify-center transition-colors duration-300 ${
                            isDay 
                              ? 'w-10 h-10 -right-[52.4px] bg-gray-100 text-gray-400' 
                              : isTicket
                                ? 'w-8 h-8 -right-[48.4px] bg-emerald-100 text-emerald-600'
                                : 'w-8 h-8 -right-[48.4px] bg-amber-100 text-amber-600'
                          }`}
                        >
                           {isDay ? (
                             <span className="text-xs font-bold">{dayNumber < 10 ? `0${dayNumber}` : dayNumber}</span>
                           ) : isTicket ? (
                             <Ticket size={14} />
                           ) : (
                             <Bell size={14} />
                           )}
                        </div>
                      )}"""

new_block = """                      ) : (
                        <div 
                          className={`absolute top-4 z-10 rounded-full border-4 border-[#F9FAFB] flex items-center justify-center transition-colors duration-300 ${
                            isDay 
                              ? 'w-10 h-10 -right-[52.4px] bg-gray-100 text-gray-400' 
                              : 'w-8 h-8 -right-[48.4px] text-white'
                          }`}
                          style={!isDay ? { backgroundColor: day.color || (isTicket ? '#10b981' : '#f59e0b') } : {}}
                        >
                           {isDay ? (
                             <span className="text-xs font-bold">{dayNumber < 10 ? `0${dayNumber}` : dayNumber}</span>
                           ) : isTicket ? (
                             <Ticket size={14} />
                           ) : (
                             <Bell size={14} />
                           )}
                        </div>
                      )}"""

if old_block in code:
    code = code.replace(old_block, new_block)
    print("Replaced stepper logic successfully")
else:
    print("Failed to replace stepper logic")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
