import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

anchor = """                     {day.description && (
                       <div className="col-span-2 mt-2">
                         <p className={`text-xs font-bold mb-1 ${day.isCurrent ? 'text-emerald-600' : 'text-gray-500'}`}>תיאור המסלול היומי:</p>
                         <div className={`space-y-1 w-full break-words leading-relaxed text-sm ${day.isCurrent ? 'text-emerald-800 italic' : 'text-gray-700'}`}>
                           {day.description.split(/\\r?\\n/).map((line, idx) => (
                             <p key={idx} className="min-h-[1rem]">
                               {line || '\\u00A0'}
                             </p>
                           ))}
                         </div>
                       </div>
                     )}"""

# Use string replace with exact text from cat
anchor = code[code.find('                     {day.description && ('):code.find('                     )}', code.find('                     {day.description && (')) + 23]

replacement = anchor + """
                     
                     {day.imageUrl && (
                        <div className="col-span-2 mt-5 -mx-4 -mb-4 overflow-hidden rounded-b-[16px]" onClick={e => e.stopPropagation()}>
                          <Zoom>
                            <img src={day.imageUrl} alt="Attachment" className="w-full h-64 sm:h-72 object-cover transition-transform duration-500 hover:scale-105" />
                          </Zoom>
                        </div>
                     )}"""

if anchor and len(anchor) > 100:
    code = code.replace(anchor, replacement)
    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Patched successfully!")
else:
    print("Anchor not found!")

