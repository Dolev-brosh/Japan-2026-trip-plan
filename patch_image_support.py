import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update lucide imports to include Image as ImageIcon and ZoomIn (wait, Zoom is from react-medium-image-zoom)
if "import Zoom from 'react-medium-image-zoom';" not in code:
    code = code.replace("import { HexColorPicker, HexColorInput } from 'react-colorful';", "import { HexColorPicker, HexColorInput } from 'react-colorful';\nimport Zoom from 'react-medium-image-zoom';\nimport 'react-medium-image-zoom/dist/styles.css';")
    code = code.replace("Upload, Ticket, Bell, Link } from 'lucide-react'", "Upload, Ticket, Bell, Link, Image as ImageIcon, X } from 'lucide-react'")

# 2. Add imageUrl to TimelineItem
if "imageUrl?: string;" not in code:
    code = code.replace("  textColor?: 'white' | 'black';", "  textColor?: 'white' | 'black';\n  imageUrl?: string;")

# 3. Add compressImage utility outside the component
compress_util = """
const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
"""
if "const compressImage =" not in code:
    code = code.replace("const App = () => {", f"{compress_util}\nconst App = () => {{") # wait, App is defined as export default function App()
    code = code.replace("export default function App() {", f"{compress_util}\nexport default function App() {{")

# 4. Image Upload UI in EditModal
# We need to add handleImageUpload inside EditModal
handle_image_upload_func = """
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
"""
if "const handleImageUpload =" not in code:
    code = code.replace("  const handlePasteDescription = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {", f"{handle_image_upload_func}\n  const handlePasteDescription = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {{")


# Add the Image Upload UI block in EditModal for ticket and reminder (or just at the end of formData.type !== 'day')
image_upload_ui = """
            <div className="mt-6 pt-6 border-t border-gray-100">
              <label className="block text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider">תמונה (אופציונלי)</label>
              {formData.imageUrl ? (
                <div className="relative inline-block">
                  <img src={formData.imageUrl} alt="Uploaded" className="w-full max-w-[200px] h-auto rounded-lg border border-gray-200" />
                  <button 
                    onClick={() => handleChange('imageUrl', '')}
                    className="absolute -top-2 -right-2 bg-white text-gray-500 hover:text-red-500 rounded-full p-1 shadow-md border border-gray-200"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors w-fit text-sm text-gray-600 font-medium">
                  <ImageIcon size={18} className="text-gray-400" />
                  העלה תמונה
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
"""

# Insert into the EditModal right after dynamic fields:
if "העלה תמונה" not in code:
    code = code.replace("          {formData.type !== 'day' && (", f"          {{formData.type !== 'day' && (\n            <>{image_upload_ui}")
    # Wait, we need to close the <> at the end of formData.type !== 'day'
    # Actually, the dynamic fields block is already inside a {formData.type !== 'day' && ( ... )} block.
    # Let's find that block.
    
    old_fields_block = '''          {formData.type !== 'day' && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <label className="block text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider">שדות דינמיים</label>'''
              
    new_fields_block = f'''          {{formData.type !== 'day' && (
            <>
{image_upload_ui}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <label className="block text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider">שדות דינמיים</label>'''
    
    if old_fields_block in code:
        code = code.replace(old_fields_block, new_fields_block)
        
        # Now close the <> after dynamic fields.
        # dynamic fields ends at:
        #                 </button>
        #               </div>
        #             </div>
        #           )}
        
        old_fields_end = '''                </button>
              </div>
            </div>
          )}'''
        new_fields_end = '''                </button>
              </div>
            </div>
            </>
          )}'''
        code = code.replace(old_fields_end, new_fields_end)
    else:
        print("WARNING: Could not find old_fields_block")


# 5. Render imageUrl in Expanded View of Ticket and Reminder
ticket_image_render = """
                      {day.imageUrl && (
                        <div className="mt-4">
                          <Zoom>
                            <img src={day.imageUrl} alt="Attachment" className="w-full h-auto object-cover rounded-lg border border-black/10" />
                          </Zoom>
                        </div>
                      )}
                    </div>
                  )}"""

old_ticket_content_end = """                      )}
                    </div>
                  )}"""
                  
if "ticket_image_render" not in code:
    code = code.replace(old_ticket_content_end, f"""                      )}
{ticket_image_render}""")
    code = code.replace(ticket_image_render + "\n" + ticket_image_render, ticket_image_render) # dedup if accidentally run twice

reminder_image_render = """                      {day.imageUrl && (
                        <div className="mt-4">
                          <Zoom>
                            <img src={day.imageUrl} alt="Attachment" className="w-full h-auto object-cover rounded-lg border border-black/10" />
                          </Zoom>
                        </div>
                      )}
                    </div>
                  )}"""

old_reminder_content_end = """                        </div>
                      )}
                    </div>
                  )}"""
                  
# Wait, let's just do targeted replace for reminder
# Reminder ends like:
#                       )}
#                     </div>
#                   )}

if "reminder_image_render" not in code:
    pass # we will manually do this to be safe

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
