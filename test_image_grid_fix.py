import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace the absolute inset-0 trick with just standard aspect ratio or height
old_str = """                          {day.imageUrl && (
                            <div className="overflow-hidden rounded-lg min-h-[4.5rem] relative" onClick={e => e.stopPropagation()}>
                              <Zoom>
                                <img src={day.imageUrl} alt="Attachment" className="w-full h-full object-cover absolute inset-0" style={{ height: '100%' }} />
                              </Zoom>
                            </div>
                          )}"""

new_str = """                          {day.imageUrl && (
                            <div className="overflow-hidden rounded-lg h-full min-h-[4.5rem]" onClick={e => e.stopPropagation()}>
                              <Zoom>
                                <img src={day.imageUrl} alt="Attachment" className="w-full h-full object-cover" style={{ minHeight: '4.5rem' }} />
                              </Zoom>
                            </div>
                          )}"""

code = code.replace(old_str, new_str)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
print("Replaced safely")
