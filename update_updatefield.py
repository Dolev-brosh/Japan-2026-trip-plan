import re
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
'''  const updateField = (id: string, key: 'label' | 'value', val: string) => {
    setFormData(prev => ({
      ...prev,
      fields: (prev.fields || []).map(f => f.id === id ? { ...f, [key]: val } : f)
    }));
  };''',
'''  const updateField = (id: string, key: keyof TicketField, val: any) => {
    setFormData(prev => ({
      ...prev,
      fields: (prev.fields || []).map(f => f.id === id ? { ...f, [key]: val } : f)
    }));
  };''')

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
