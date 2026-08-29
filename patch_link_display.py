import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update TicketField interface
code = code.replace(
'''export interface TicketField {
  id: string;
  label: string;
  value: string;
  isLink?: boolean;
}''',
'''export interface TicketField {
  id: string;
  label: string;
  value: string;
  isLink?: boolean;
  linkUrl?: string;
}''')

# 2. Update rendering in SwipeableCard (Reminder and Ticket)
old_link_render = """                              {f.isLink ? (
                                <a href={f.value.startsWith('http') ? f.value : `https://${f.value}`} target="_blank" rel="noreferrer" className={`text-sm font-semibold ${nonDayTitleClass} truncate underline`} onClick={e => e.stopPropagation()}>{f.value}</a>
                              ) : (
                                <p className={`text-sm font-semibold ${nonDayTitleClass} truncate`}>{f.value}</p>
                              )}"""

new_link_render = """                              {f.isLink ? (
                                <a href={(f.linkUrl || f.value || '').startsWith('http') ? (f.linkUrl || f.value) : `https://${f.linkUrl || f.value}`} target="_blank" rel="noreferrer" className={`text-sm font-semibold ${nonDayTitleClass} truncate underline block`} onClick={e => e.stopPropagation()}>{f.value || 'קישור'}</a>
                              ) : (
                                <p className={`text-sm font-semibold ${nonDayTitleClass} truncate`}>{f.value}</p>
                              )}"""

code = code.replace(old_link_render, new_link_render)

# 3. Update Edit Modal Dynamic Fields section
old_edit_fields = """                {(formData.fields || []).map((f) => (
                  <div key={f.id} className="flex gap-2 items-center">
                    <input 
                      value={f.label} onChange={(e) => updateField(f.id, 'label', e.target.value)}
                      placeholder="כותרת (לדוג: לינק לכרטיס)" className="flex-[0.8] border-b border-gray-200 py-1 text-sm outline-none focus:border-emerald-500"
                    />
                    <input 
                      value={f.value} onChange={(e) => updateField(f.id, 'value', e.target.value)}
                      placeholder="ערך (טקסט או לינק)" className="flex-1 border-b border-gray-200 py-1 text-sm outline-none focus:border-emerald-500"
                      dir="auto"
                    />
                    <button 
                      onClick={() => updateField(f.id, 'isLink', !f.isLink)} 
                      className={`p-1 rounded transition-colors ${f.isLink ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 hover:text-gray-600'}`}
                      title="הגדר כלינק"
                    >
                      <Link size={16} />
                    </button>
                    <button onClick={() => removeField(f.id)} className="text-gray-400 hover:text-red-500 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}"""

new_edit_fields = """                {(formData.fields || []).map((f) => (
                  <div key={f.id} className={`flex flex-col gap-2 ${f.isLink ? 'p-2 bg-emerald-50/30 rounded-md border border-emerald-100/50' : ''}`}>
                    <div className="flex gap-2 items-center">
                      <input 
                        value={f.label} onChange={(e) => updateField(f.id, 'label', e.target.value)}
                        placeholder="כותרת השדה" className="flex-[0.8] border-b border-gray-200 py-1 text-sm outline-none focus:border-emerald-500 bg-transparent"
                      />
                      <input 
                        value={f.value} onChange={(e) => updateField(f.id, 'value', e.target.value)}
                        placeholder={f.isLink ? "טקסט שיוצג (לדוג: כרטיסי טיסה)" : "ערך השדה"} className="flex-1 border-b border-gray-200 py-1 text-sm outline-none focus:border-emerald-500 bg-transparent"
                        dir="auto"
                      />
                      <button 
                        onClick={() => updateField(f.id, 'isLink', !f.isLink)} 
                        className={`p-1 rounded transition-colors shrink-0 ${f.isLink ? 'text-emerald-600 bg-emerald-100/70' : 'text-gray-400 hover:text-gray-600'}`}
                        title="הגדר כלינק"
                      >
                        <Link size={16} />
                      </button>
                      <button onClick={() => removeField(f.id)} className="text-gray-400 hover:text-red-500 p-1 shrink-0">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <AnimatePresence>
                      {f.isLink && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="pt-1 pb-1">
                            <input
                              value={f.linkUrl || ''} onChange={(e) => updateField(f.id, 'linkUrl', e.target.value)}
                              placeholder="הדבק כאן את הקישור האמיתי (https://...)" className="w-full border-b border-emerald-200 py-1 text-sm outline-none focus:border-emerald-500 bg-transparent text-left placeholder-right text-gray-700"
                              dir="ltr"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}"""

code = code.replace(old_edit_fields, new_edit_fields)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Patch applied")
