import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add import
if 'react-colorful' not in code:
    code = code.replace(
        "import EmojiPicker from 'emoji-picker-react';",
        "import EmojiPicker from 'emoji-picker-react';\nimport { HexColorPicker, HexColorInput } from 'react-colorful';"
    )

# 2. Add state
if 'isColorPickerOpen' not in code:
    code = code.replace(
        "const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);",
        "const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);\n  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);"
    )

# 3. Replace color picker
old_block = """                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">צבע רקע</label>
                  <div className="flex gap-2 flex-wrap">
                    {ticketColors.map(c => (
                      <button 
                        key={c} onClick={() => handleChange('color', c)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform active:scale-90 ${formData.color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>"""

new_block = """                <div className="relative">
                  <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">צבע רקע</label>
                  <button 
                    onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                    className="w-16 h-10 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                    style={{ backgroundColor: formData.color || '#10b981' }}
                  />
                  <AnimatePresence>
                    {isColorPickerOpen && (
                      <>
                        <div className="fixed inset-0 z-[110]" onClick={() => setIsColorPickerOpen(false)} />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none"
                        >
                          <div className="pointer-events-auto bg-white p-4 shadow-2xl rounded-2xl border border-gray-100 flex flex-col gap-4">
                            <HexColorPicker 
                              color={formData.color || '#10b981'} 
                              onChange={(newColor) => handleChange('color', newColor)} 
                            />
                            <div className="flex items-center gap-2" dir="ltr">
                              <span className="text-gray-500 text-sm font-semibold uppercase">HEX:</span>
                              <HexColorInput 
                                color={formData.color || '#10b981'} 
                                onChange={(newColor) => handleChange('color', newColor)} 
                                prefixed
                                className="border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-emerald-500 w-full uppercase"
                              />
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>"""

if old_block in code:
    code = code.replace(old_block, new_block)
    print("Color picker replaced successfully")
else:
    print("Could not find the color picker block")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

