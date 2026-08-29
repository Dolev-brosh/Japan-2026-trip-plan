import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_block = """                    <div className="flex gap-2 items-center">
                      <input 
                        value={f.label} onChange={(e) => updateField(f.id, 'label', e.target.value)}
                        placeholder="כותרת השדה" className="flex-[0.8] border-b border-gray-200 py-1 text-sm outline-none focus:border-emerald-500 bg-transparent"
                      />
                      <input 
                        value={f.value} onChange={(e) => updateField(f.id, 'value', e.target.value)}
                        placeholder={f.isLink ? "טקסט שיוצג (לדוג: כרטיסי טיסה)" : "ערך השדה"} className="flex-1 border-b border-gray-200 py-1 text-sm outline-none focus:border-emerald-500 bg-transparent"
                        dir="auto"
                      />"""

new_block = """                    <div className="flex gap-2 items-center w-full">
                      <input 
                        value={f.label} onChange={(e) => updateField(f.id, 'label', e.target.value)}
                        placeholder="כותרת" className="flex-[0.4] min-w-0 border-b border-gray-200 py-1 text-sm outline-none focus:border-emerald-500 bg-transparent"
                      />
                      <input 
                        value={f.value} onChange={(e) => updateField(f.id, 'value', e.target.value)}
                        placeholder={f.isLink ? "טקסט שיוצג" : "ערך"} className="flex-[0.6] min-w-0 border-b border-gray-200 py-1 text-sm outline-none focus:border-emerald-500 bg-transparent"
                        dir="auto"
                      />"""

if old_block in code:
    code = code.replace(old_block, new_block)
    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Fixed successfully")
else:
    print("Could not find block")
