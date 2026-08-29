import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

start_anchor = "                  {/* Reminder Content */}"
end_anchor = "const DeleteConfirmModal"

# extract everything between start_anchor and end_anchor
regex = re.compile(re.escape(start_anchor) + r"(.*?)" + re.escape(end_anchor), re.DOTALL)

replacement = """                  {/* Reminder Content */}
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
       </motion.div>
    </div>
  );
};

const DeleteConfirmModal"""

if start_anchor in code and end_anchor in code:
    code = regex.sub(replacement, code)
    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Fixed syntax successfully!")
else:
    print("Could not find anchors")

