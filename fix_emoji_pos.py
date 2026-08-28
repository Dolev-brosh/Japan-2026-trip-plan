import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_block = """                  <AnimatePresence>
                    {isEmojiPickerOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsEmojiPickerOpen(false)} />
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 top-16 z-50 shadow-2xl rounded-lg"
                        >
                          <EmojiPicker 
                            onEmojiClick={(emojiData) => {
                              handleChange('emoji', emojiData.emoji);
                              setIsEmojiPickerOpen(false);
                            }}
                          />
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>"""

new_block = """                  <AnimatePresence>
                    {isEmojiPickerOpen && (
                      <>
                        <div className="fixed inset-0 z-[110]" onClick={() => setIsEmojiPickerOpen(false)} />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none"
                        >
                          <div className="pointer-events-auto shadow-2xl rounded-lg bg-white overflow-hidden">
                            <EmojiPicker 
                              onEmojiClick={(emojiData) => {
                                handleChange('emoji', emojiData.emoji);
                                setIsEmojiPickerOpen(false);
                              }}
                            />
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>"""

if old_block in code:
    code = code.replace(old_block, new_block)
    print("Replaced successfully")
else:
    print("Could not find block")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
