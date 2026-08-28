import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_block = """                {days.map((day, index) => (
                  <div key={day.id} className={`relative z-10 ${day.isPast ? 'opacity-70' : ''}`} ref={day.isCurrent ? currentDayRef : null}>
                    {/* Stepper Dot */}
                    {day.isCurrent ? (
                      <CurrentDayStepper />
                    ) : (
                      <div 
                        className="absolute top-4 -right-[52.4px] z-10 w-10 h-10 rounded-full border-4 border-[#F9FAFB] flex items-center justify-center transition-colors duration-300 bg-gray-100 text-gray-400"
                      >
                         <span className="text-xs font-bold">{index + 1 < 10 ? `0${index + 1}` : index + 1}</span>
                      </div>
                    )}
                    
                    <SwipeableCard 
                      day={day}
                      index={index}
                      isExpanded={expandedDayId === day.id}
                      onToggle={() => toggleDay(day.id)}
                      onEdit={setEditingItem}
                      onDeleteRequest={setDeletingDayId}
                    />
                  </div>
                ))}"""

new_block = """                {days.map((day, index) => {
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
                      )}
                      
                      <SwipeableCard 
                        day={day}
                        index={dayNumber > 0 ? dayNumber - 1 : 0}
                        isExpanded={expandedDayId === day.id}
                        onToggle={() => toggleDay(day.id)}
                        onEdit={setEditingItem}
                        onDeleteRequest={setDeletingDayId}
                      />
                    </div>
                  );
                })}"""

if old_block in code:
    code = code.replace(old_block, new_block)
    print("Replaced timeline mapping")
else:
    print("Could not find the block, please check")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
