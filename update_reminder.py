import re
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Render fields in reminder too
old_reminder_content = """                  {/* Reminder Content */}
                  {isReminder && (
                    <div className={`pt-4 border-t ${nonDayBorderClass} text-sm leading-relaxed ${nonDayTitleClass} font-medium whitespace-pre-wrap break-words`}>
                      {day.notes || <span className={`${nonDayTextMutedClass} italic`}>אין תוכן...</span>}
                    </div>
                  )}"""

new_reminder_content = """                  {/* Reminder Content */}
                  {isReminder && (
                    <div className={`pt-4 border-t ${nonDayBorderClass}`}>
                      <div className={`text-sm leading-relaxed ${nonDayTitleClass} font-medium whitespace-pre-wrap break-words mb-4`}>
                        {day.notes || <span className={`${nonDayTextMutedClass} italic`}>אין תוכן...</span>}
                      </div>
                      {(day.fields && day.fields.length > 0) && (
                        <div className="grid grid-cols-2 gap-4">
                          {day.fields.map(f => (
                            <div key={f.id} className={`${nonDayBgClass} rounded-lg p-3 backdrop-blur-sm`}>
                              <p className={`text-[10px] ${nonDayTextMutedClass} uppercase tracking-wider mb-1 font-bold`}>{f.label}</p>
                              {f.isLink ? (
                                <a href={f.value.startsWith('http') ? f.value : `https://${f.value}`} target="_blank" rel="noreferrer" className={`text-sm font-semibold ${nonDayTitleClass} truncate underline`} onClick={e => e.stopPropagation()}>{f.value}</a>
                              ) : (
                                <p className={`text-sm font-semibold ${nonDayTitleClass} truncate`}>{f.value}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}"""

if old_reminder_content in code:
    code = code.replace(old_reminder_content, new_reminder_content)
else:
    print("WARNING: Could not patch old_reminder_content")

# Also patch Ticket Content to support isLink
old_ticket_content = """                  {/* Ticket Content */}
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
                              {f.isLink ? (
                                <a href={f.value.startsWith('http') ? f.value : `https://${f.value}`} target="_blank" rel="noreferrer" className={`text-sm font-semibold ${nonDayTitleClass} truncate underline`} onClick={e => e.stopPropagation()}>{f.value}</a>
                              ) : (
                                <p className={`text-sm font-semibold ${nonDayTitleClass} truncate`}>{f.value}</p>
                              )}
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

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

