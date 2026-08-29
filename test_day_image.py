import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# For isDay, let's fix the image to NOT be edge-to-edge, just a col-span-2 rounded-lg image.
anchor = """                     {day.imageUrl && (
                        <div className="col-span-2 mt-5 -mx-4 -mb-4 overflow-hidden rounded-b-[16px]" onClick={e => e.stopPropagation()}>
                          <Zoom>
                            <img src={day.imageUrl} alt="Attachment" className="w-full h-64 sm:h-72 object-cover transition-transform duration-500 hover:scale-105" />
                          </Zoom>
                        </div>
                     )}"""
                     
replacement = """                     {day.imageUrl && (
                        <div className="col-span-2 mt-4 overflow-hidden rounded-lg shadow-sm" onClick={e => e.stopPropagation()}>
                          <Zoom>
                            <img src={day.imageUrl} alt="Attachment" className="w-full h-48 sm:h-64 object-cover" />
                          </Zoom>
                        </div>
                     )}"""

if anchor in code:
    code = code.replace(anchor, replacement)
    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Fixed day image")
else:
    print("Anchor not found for day image")
