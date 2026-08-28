import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

pattern = re.compile(r'const EditModal = \(\{.*?\}\);?\s*', re.DOTALL)
# Wait, it ends with }

# Let's manually replace it using a Python script that splits the string.
start_idx = code.find('const EditModal = ({ day')
end_idx = code.find('// --- Main App ---')

if start_idx != -1 and end_idx != -1:
    new_modal = """const EditModal = ({ day, onClose, onSave }: { key?: string, day: TimelineItem, onClose: () => void, onSave: (d: TimelineItem) => void }) => {
  const [formData, setFormData] = useState<TimelineItem>(day);
  
  const handleChange = (field: keyof TimelineItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateField = (id: string, key: 'label' | 'value', val: string) => {
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
      setTimeout(() => { target.selectionStart = target.selectionEnd = start + cleanedText.length; }, 0);
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
      setTimeout(() => { target.selectionStart = target.selectionEnd = start + cleanedText.length; }, 0);
    }
  };

  const ticketColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#1f2937'];
  const reminderColors = ['#fffbeb', '#eff6ff', '#fff1f2', '#ecfdf5', '#f3f4f6'];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6" dir="rtl">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}
      />
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
                  <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">מיקום לינה</label>
                  <input 
                    value={formData.accommodationArea || ''} onChange={e => handleChange('accommodationArea', e.target.value)}
                    className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">שם המלון</label>
                  <input 
                    value={formData.hotelName || ''} onChange={e => handleChange('hotelName', e.target.value)}
                    className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">קישור למלון (אופציונלי)</label>
                  <input 
                    value={formData.hotelLink || ''} onChange={e => handleChange('hotelLink', e.target.value)}
                    className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" dir="ltr"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">נסיעות (אופציונלי)</label>
                <textarea 
                  rows={3} value={formData.transitDetails || ''} onChange={e => handleChange('transitDetails', e.target.value)} onPaste={handlePasteTransitDetails}
                  className="w-full border border-gray-200 rounded-lg p-3 min-h-[80px] focus:border-emerald-500 outline-none text-sm resize-y bg-transparent" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">תיאור מסלול יומי</label>
                <textarea 
                  rows={5} value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} onPaste={handlePasteDescription}
                  className="w-full border border-gray-200 rounded-lg p-3 min-h-[120px] focus:border-emerald-500 outline-none text-sm resize-y bg-transparent" 
                />
              </div>
            </div>
          )}

          {formData.type === 'ticket' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
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
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">אמוג'י (לוגו)</label>
                  <input 
                    value={formData.emoji || ''} onChange={e => handleChange('emoji', e.target.value)}
                    className="w-16 h-10 border border-gray-200 rounded-lg text-center text-xl focus:border-emerald-500 outline-none" 
                    maxLength={2}
                  />
                </div>
              </div>
              
              <div>
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
              </div>
            </div>
          )}

          {formData.type === 'reminder' && (
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">צבע רקע</label>
                <div className="flex gap-2 flex-wrap">
                  {reminderColors.map(c => (
                    <button 
                      key={c} onClick={() => handleChange('color', c)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform active:scale-90 ${formData.color === c ? 'border-gray-400 scale-110' : 'border-gray-200'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">תוכן התזכורת</label>
                <textarea 
                  rows={5} value={formData.notes || ''} onChange={e => handleChange('notes', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-3 min-h-[120px] focus:border-emerald-500 outline-none text-sm resize-y bg-transparent leading-relaxed" 
                  placeholder="הזן כאן את תוכן התזכורת..."
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0">
          <button 
            onClick={() => onSave(formData)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-md transition-all duration-200 ease-in-out active:scale-95"
          >
            שמור שינויים
          </button>
        </div>
      </motion.div>
    </div>
  );
}

"""
    code = code[:start_idx] + new_modal + code[end_idx:]
    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Patched EditModal successfully.")
else:
    print("Could not find start/end markers.")
