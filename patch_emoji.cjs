const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Add import
const importMatch = code.match(/import\s+EmojiPicker\s+from\s+'emoji-picker-react';/);
if (!importMatch) {
  code = code.replace(
    /import \{ Pencil, Trash2, Plus, Calendar, ChevronUp, ChevronLeft, User, MapPin, Building2, Bed, AlignLeft, MoreVertical, Download, Upload, Ticket, Bell \} from 'lucide-react';/,
    `import { Pencil, Trash2, Plus, Calendar, ChevronUp, ChevronLeft, User, MapPin, Building2, Bed, AlignLeft, MoreVertical, Download, Upload, Ticket, Bell } from 'lucide-react';\nimport EmojiPicker from 'emoji-picker-react';`
  );
}

// Add state to EditModal
if (!code.includes('isEmojiPickerOpen')) {
  code = code.replace(
    /const \[formData, setFormData\] = useState<TimelineItem>\(day\);/,
    `const [formData, setFormData] = useState<TimelineItem>(day);\n  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);`
  );
}

// Replace the emoji input
const oldEmojiInput = `                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">אמוג'י (לוגו)</label>
                  <input 
                    value={formData.emoji || ''} onChange={e => handleChange('emoji', e.target.value)}
                    className="w-16 h-10 border border-gray-200 rounded-lg text-center text-xl focus:border-emerald-500 outline-none" 
                    maxLength={2}
                  />
                </div>`;

const newEmojiInput = `                <div className="relative">
                  <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">אמוג'י (לוגו)</label>
                  <button 
                    onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                    className="w-16 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-xl hover:bg-gray-50 transition-colors"
                  >
                    {formData.emoji || '😀'}
                  </button>
                  <AnimatePresence>
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
                  </AnimatePresence>
                </div>`;

code = code.replace(oldEmojiInput, newEmojiInput);

fs.writeFileSync('src/App.tsx', code);
