const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const pasteTransitCode = `
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
  };`;

// Insert after handlePasteDescription
const pasteDescEndIndex = code.indexOf('}, 0);\n    }\n  };');
if (pasteDescEndIndex !== -1) {
  const insertIndex = pasteDescEndIndex + 16;
  code = code.substring(0, insertIndex) + pasteTransitCode + code.substring(insertIndex);
}

const textareaCode = `        <div>
          <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">נסיעות (אופציונלי)</label>
          <textarea 
            rows={3} 
            value={formData.transitDetails || ''}
            onChange={e => handleChange('transitDetails', e.target.value)}
            onPaste={handlePasteTransitDetails}
            className="w-full border border-gray-200 rounded-lg p-3 min-h-[80px] focus:border-emerald-500 outline-none text-sm resize-y bg-transparent mt-1 leading-relaxed whitespace-pre-wrap" 
            placeholder="פרט על רכבות, טיסות, נסיעות..."
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">תיאור מסלול יומי</label>`;

code = code.replace(
  `        <div>
          <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">תיאור מסלול יומי</label>`,
  textareaCode
);

fs.writeFileSync('src/App.tsx', code);
