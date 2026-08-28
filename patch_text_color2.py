import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

text_color_toggle_html = """                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">צבע טקסט</label>
                  <div className="flex bg-gray-100 rounded-lg p-1 w-fit h-10">
                    <button 
                      onClick={() => handleChange('textColor', 'white')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${(!formData.textColor || formData.textColor === 'white') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      לבן
                    </button>
                    <button 
                      onClick={() => handleChange('textColor', 'black')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${formData.textColor === 'black' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      שחור
                    </button>
                  </div>
                </div>"""

# For Ticket (which is a grid layout)
old_ticket_grid = '<div className="grid grid-cols-3 gap-4">' # It was replaced in the previous step
if old_ticket_grid in code:
    print("Ticket grid already 3 cols")
else:
    code = code.replace('<div className="grid grid-cols-2 gap-4">', '<div className="grid grid-cols-3 gap-4">')

old_ticket_emoji = """                <div className="relative">
                  <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">אמוג'י (לוגו)</label>"""

if old_ticket_emoji in code:
    code = code.replace(old_ticket_emoji, f"{text_color_toggle_html}\n{old_ticket_emoji}")

# For Reminder (which is just flex gap-wrap for color picker, but wait it's a relative div now)
old_reminder_bg = """              <div className="relative">
                <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">צבע רקע</label>"""
                
if 'formData.type === \'reminder\'' in code:
    reminder_section_start = code.find("formData.type === 'reminder'")
    bg_idx = code.find(old_reminder_bg, reminder_section_start)
    if bg_idx != -1:
        # wrap the color picker and text color in a grid grid-cols-2 gap-4
        end_of_picker = code.find("</AnimatePresence>", bg_idx) + len("</AnimatePresence>")
        end_of_div = code.find("</div>", end_of_picker) + len("</div>")
        
        extracted_picker = code[bg_idx:end_of_div]
        new_reminder_top = f"""              <div className="grid grid-cols-2 gap-4">
{extracted_picker}
{text_color_toggle_html}
              </div>"""
        
        code = code[:bg_idx] + new_reminder_top + code[end_of_div:]
        print("Patched reminder")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

