import re
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
'''export interface TicketField {
  id: string;
  label: string;
  value: string;
}''',
'''export interface TicketField {
  id: string;
  label: string;
  value: string;
  isLink?: boolean;
}''')

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
