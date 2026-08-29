import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# We will just find and replace the whole blocks

ticket_start = "                  {/* Ticket Content */}"
ticket_end = "                  {/* Reminder Content */}"

# We extract everything between ticket_start and ticket_end
ticket_regex = re.compile(re.escape(ticket_start) + r"(.*?)" + re.escape(ticket_end), re.DOTALL)

def repl_ticket(m):
    return """                  {/* Ticket Content */}
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
                                <a href={(f.linkUrl || f.value || '').startsWith('http') ? (f.linkUrl || f.value) : `https://${f.linkUrl || f.value}`} target="_blank" rel="noreferrer" className={`text-sm font-semibold ${nonDayTitleClass} truncate underline block`} onClick={e => e.stopPropagation()}>{f.value || 'קישור'}</a>
                              ) : (
                                <p className={`text-sm font-semibold ${nonDayTitleClass} truncate`}>{f.value}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {day.imageUrl && (
                        <div className="mt-4 w-full" onClick={e => e.stopPropagation()}>
                          <Zoom>
                            <img src={day.imageUrl} alt="Attachment" className="w-full h-auto object-cover rounded-lg border border-black/10" />
                          </Zoom>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reminder Content */}"""

code = ticket_regex.sub(repl_ticket, code)

reminder_start = "                  {/* Reminder Content */}"
reminder_end = "                </motion.div>"

reminder_regex = re.compile(re.escape(reminder_start) + r"(.*?)" + re.escape(reminder_end), re.DOTALL)

def repl_reminder(m):
    return """                  {/* Reminder Content */}
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
                                <a href={(f.linkUrl || f.value || '').startsWith('http') ? (f.linkUrl || f.value) : `https://${f.linkUrl || f.value}`} target="_blank" rel="noreferrer" className={`text-sm font-semibold ${nonDayTitleClass} truncate underline block`} onClick={e => e.stopPropagation()}>{f.value || 'קישור'}</a>
                              ) : (
                                <p className={`text-sm font-semibold ${nonDayTitleClass} truncate`}>{f.value}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {day.imageUrl && (
                        <div className="mt-4 w-full" onClick={e => e.stopPropagation()}>
                          <Zoom>
                            <img src={day.imageUrl} alt="Attachment" className="w-full h-auto object-cover rounded-lg border border-black/10" />
                          </Zoom>
                        </div>
                      )}
                    </div>
                  )}

                </motion.div>"""

code = reminder_regex.sub(repl_reminder, code)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

