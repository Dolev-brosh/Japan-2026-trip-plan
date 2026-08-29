import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# The corrupted part starts after the reminder block in SwipeableCard
# Let's find exactly where my `repl_reminder` left off:
corrupted_anchor = """                      {day.imageUrl && (
                        <div className="mt-4 w-full" onClick={e => e.stopPropagation()}>
                          <Zoom>
                            <img src={day.imageUrl} alt="Attachment" className="w-full h-auto object-cover rounded-lg border border-black/10" />
                          </Zoom>
                        </div>
                      )}
                    </div>
                  )}

                </motion.div>"""

# We need to replace `                </motion.div>` with the rest of SwipeableCard, DeleteConfirmModal, and top of EditModal up to the color picker motion.div.

replacement = """                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      );
    }
    
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-gray-900/40 backdrop-blur-sm" dir="rtl">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl w-full max-w-sm p-7 shadow-2xl relative overflow-hidden"
      >
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5">
           <Trash2 size={24} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">מחיקת פריט</h3>
        <p className="text-gray-500 mb-8 leading-relaxed">האם את/ה בטוח/ה שברצונך למחוק פריט זה? פעולה זו תסיר את כל המידע השמור ולא ניתן לשחזרו.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors">ביטול</button>
          <button onClick={onConfirm} className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 transition-colors">מחיקה</button>
        </div>
      </motion.div>
    </div>
  )
}

const EditModal = ({ day, onClose, onSave }: { key?: string, day: TimelineItem, onClose: () => void, onSave: (d: TimelineItem) => void }) => {
  const [formData, setFormData] = useState<TimelineItem>(day);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  
  const handleChange = (field: keyof TimelineItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateField = (id: string, key: keyof TicketField, val: any) => {
    setFormData(prev => ({
      ...prev,
      fields: (prev.fields || []).map(f => f.id === id ? { ...f, [key]: val } : f)
    }));
  };

  const addField = () => {
    setFormData(prev => ({
      ...prev,
      fields: [...(prev.fields || []), { id: Date.now().toString(), label: '', value: '' }]
    }));
  };

  const removeField = (id: string) => {
    setFormData(prev => ({
      ...prev,
      fields: (prev.fields || []).filter(f => f.id !== id)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64Str = await compressImage(e.target.files[0]);
        handleChange('imageUrl', base64Str);
      } catch (err) {
        console.error('Image upload failed', err);
      }
    }
  };

  const handlePasteDescription = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('Text');
    if (pastedText.startsWith('"') && pastedText.endsWith('"')) {
      e.preventDefault();
      const cleanedText = pastedText.replace(/^"|"$/g, '');
      
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      
      const currentDesc = formData.description || '';
      const newValue = currentDesc.substring(0, start) + cleanedText + currentDesc.substring(end);
      
      handleChange('description', newValue);
      
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + cleanedText.length;
      }, 0);
    }
  }

  const handlePasteTransitDetails = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('Text');
    if (pastedText.startsWith('"') && pastedText.endsWith('"')) {
      e.preventDefault();
      const cleanedText = pastedText.replace(/^"|"$/g, '');
      
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      
      const currentDesc = formData.transitDetails || '';
      const newValue = currentDesc.substring(0, start) + cleanedText + currentDesc.substring(end);
      
      handleChange('transitDetails', newValue);
      
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + cleanedText.length;
      }, 0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">
      {/* Dark overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }} transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full sm:max-w-2xl max-h-[90vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10"
      >
        <div className="p-6 flex justify-between items-center border-b border-gray-100 shrink-0 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            {formData.type === 'ticket' ? 'עריכת כרטיס' : formData.type === 'reminder' ? 'עריכת תזכורת' : 'עריכת יום'}
          </h2>
          <button onClick={onClose} className="text-sm text-gray-400 font-medium hover:text-emerald-600 transition-colors">ביטול</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">כותרת</label>
              <input 
                value={formData.title} onChange={e => handleChange('title', e.target.value)}
                className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm transition-colors bg-transparent" 
                placeholder="לדוגמה: כותרת..."
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">תאריך</label>
              <input 
                type="date" value={formData.date} onChange={e => handleChange('date', e.target.value)}
                className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
              />
            </div>
          </div>

          {(!formData.type || formData.type === 'day') && (
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">כותרת משנה</label>
                <input 
                  value={formData.subtitle || ''} onChange={e => handleChange('subtitle', e.target.value)}
                  className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">עיר</label>
                  <input 
                    value={formData.city || ''} onChange={e => handleChange('city', e.target.value)}
                    className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">אזור לינה</label>
                  <input 
                    value={formData.accommodationArea || ''} onChange={e => handleChange('accommodationArea', e.target.value)}
                    className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">שם המלון</label>
                  <input 
                    value={formData.hotelName || ''} onChange={e => handleChange('hotelName', e.target.value)}
                    className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">קישור למלון</label>
                  <input 
                    value={formData.hotelLink || ''} onChange={e => handleChange('hotelLink', e.target.value)}
                    className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">מספר לילה</label>
                  <input 
                    type="number" value={formData.nightNumber || ''} onChange={e => handleChange('nightNumber', parseInt(e.target.value) || 0)}
                    className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">סה"כ לילות במלון זה</label>
                  <input 
                    type="number" value={formData.totalNights || ''} onChange={e => handleChange('totalNights', parseInt(e.target.value) || 0)}
                    className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">פרטי נסיעות (אופציונלי)</label>
                <textarea 
                  rows={2} value={formData.transitDetails || ''} onChange={e => handleChange('transitDetails', e.target.value)}
                  onPaste={handlePasteTransitDetails}
                  className="w-full border border-gray-200 rounded-lg p-3 min-h-[60px] focus:border-emerald-500 outline-none text-sm resize-y bg-transparent" 
                  placeholder="לדוגמה: רכבת ב-09:00 מתחנת שינג'וקו..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">תיאור המסלול היומי</label>
                <textarea 
                  rows={5} value={formData.description || ''} onChange={e => handleChange('description', e.target.value)}
                  onPaste={handlePasteDescription}
                  className="w-full border border-gray-200 rounded-lg p-3 min-h-[120px] focus:border-emerald-500 outline-none text-sm resize-y bg-transparent leading-relaxed" 
                  placeholder="פרט את מסלול הטיול כאן..."
                />
              </div>
            </div>
          )}

          {formData.type === 'ticket' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
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
                        </motion.div>"""

if corrupted_anchor in code:
    code = code.replace(corrupted_anchor, replacement)
    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Fixed corrupted code successfully!")
else:
    print("Could not find corrupted anchor!")

