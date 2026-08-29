import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace Ticket Content
ticket_start = "                  {/* Ticket Content */}"
ticket_end = "                  {/* Reminder Content */}"
ticket_regex = re.compile(re.escape(ticket_start) + r"(.*?)" + re.escape(ticket_end), re.DOTALL)

def repl_ticket(m):
    return """                  {/* Ticket Content */}
                  {isTicket && (
                    <div className={`pt-4 border-t ${nonDayBorderClass}`}>
                      {(!day.fields || day.fields.length === 0) && !day.imageUrl ? (
                        <p className={`${nonDayTextMutedClass} text-sm italic`}>אין פרטים נוספים</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {(day.fields || []).map(f => (
                            <div key={f.id} className={`${nonDayBgClass} rounded-lg p-3 backdrop-blur-sm`}>
                              <p className={`text-[10px] ${nonDayTextMutedClass} uppercase tracking-wider mb-1 font-bold`}>{f.label}</p>
                              {f.isLink ? (
                                <a href={(f.linkUrl || f.value || '').startsWith('http') ? (f.linkUrl || f.value) : `https://${f.linkUrl || f.value}`} target="_blank" rel="noreferrer" className={`text-sm font-semibold ${nonDayTitleClass} truncate underline block`} onClick={e => e.stopPropagation()}>{f.value || 'קישור'}</a>
                              ) : (
                                <p className={`text-sm font-semibold ${nonDayTitleClass} truncate`}>{f.value}</p>
                              )}
                            </div>
                          ))}
                          {day.imageUrl && (
                            <div className="overflow-hidden rounded-lg min-h-[4.5rem] relative" onClick={e => e.stopPropagation()}>
                              <Zoom>
                                <img src={day.imageUrl} alt="Attachment" className="w-full h-full object-cover absolute inset-0" style={{ height: '100%' }} />
                              </Zoom>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reminder Content */}"""

code = ticket_regex.sub(repl_ticket, code)

# Replace Reminder Content
reminder_start = "                  {/* Reminder Content */}"
reminder_end = "                </div>\n              </motion.div>"
reminder_regex = re.compile(re.escape(reminder_start) + r"(.*?)" + re.escape(reminder_end), re.DOTALL)

def repl_reminder(m):
    return """                  {/* Reminder Content */}
                  {isReminder && (
                    <div className={`pt-4 border-t ${nonDayBorderClass}`}>
                      <div className={`text-sm leading-relaxed ${nonDayTitleClass} font-medium whitespace-pre-wrap break-words mb-4`}>
                        {day.notes || <span className={`${nonDayTextMutedClass} italic`}>אין תוכן...</span>}
                      </div>
                      {((day.fields && day.fields.length > 0) || day.imageUrl) && (
                        <div className="grid grid-cols-2 gap-4">
                          {(day.fields || []).map(f => (
                            <div key={f.id} className={`${nonDayBgClass} rounded-lg p-3 backdrop-blur-sm`}>
                              <p className={`text-[10px] ${nonDayTextMutedClass} uppercase tracking-wider mb-1 font-bold`}>{f.label}</p>
                              {f.isLink ? (
                                <a href={(f.linkUrl || f.value || '').startsWith('http') ? (f.linkUrl || f.value) : `https://${f.linkUrl || f.value}`} target="_blank" rel="noreferrer" className={`text-sm font-semibold ${nonDayTitleClass} truncate underline block`} onClick={e => e.stopPropagation()}>{f.value || 'קישור'}</a>
                              ) : (
                                <p className={`text-sm font-semibold ${nonDayTitleClass} truncate`}>{f.value}</p>
                              )}
                            </div>
                          ))}
                          {day.imageUrl && (
                            <div className="overflow-hidden rounded-lg min-h-[4.5rem] relative" onClick={e => e.stopPropagation()}>
                              <Zoom>
                                <img src={day.imageUrl} alt="Attachment" className="w-full h-full object-cover absolute inset-0" style={{ height: '100%' }} />
                              </Zoom>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>"""

code = reminder_regex.sub(repl_reminder, code)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
