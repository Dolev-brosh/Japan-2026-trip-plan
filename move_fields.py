import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_fields_block = """              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider">שדות דינמיים</label>
                <div className="space-y-3">
                  {(formData.fields || []).map((f) => (
                    <div key={f.id} className="flex gap-2 items-center">
                      <input 
                        value={f.label} onChange={(e) => updateField(f.id, 'label', e.target.value)}
                        placeholder="כותרת (לדוג: מס' טיסה)" className="flex-1 border-b border-gray-200 py-1 text-sm outline-none focus:border-emerald-500"
                      />
                      <input 
                        value={f.value} onChange={(e) => updateField(f.id, 'value', e.target.value)}
                        placeholder="ערך (לדוג: LY123)" className="flex-1 border-b border-gray-200 py-1 text-sm outline-none focus:border-emerald-500"
                      />
                      <button onClick={() => removeField(f.id)} className="text-gray-400 hover:text-red-500 p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button onClick={addField} className="text-emerald-600 text-sm font-medium flex items-center gap-1 hover:text-emerald-700 mt-2">
                    <Plus size={16} /> הוסף שדה
                  </button>
                </div>
              </div>"""

new_fields_block = """          {formData.type !== 'day' && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <label className="block text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider">שדות דינמיים</label>
              <div className="space-y-3">
                {(formData.fields || []).map((f) => (
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
                ))}
                <button onClick={addField} className="text-emerald-600 text-sm font-medium flex items-center gap-1 hover:text-emerald-700 mt-2">
                  <Plus size={16} /> הוסף שדה
                </button>
              </div>
            </div>
          )}"""

if old_fields_block in code:
    # Remove from ticket section
    code = code.replace(old_fields_block, "")
    # Insert before the end of the scrollable container
    # The scrollable container ends right before `<div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0">`
    insert_target = "        </div>\n        \n        <div className=\"p-6 bg-gray-50 border-t border-gray-100 shrink-0\">"
    if insert_target in code:
        code = code.replace(insert_target, f"{new_fields_block}\n{insert_target}")
    else:
        print("WARNING: Could not find insert_target")
else:
    print("WARNING: Could not find old_fields_block")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
