import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_str = '<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">'
new_str = '<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6" dir="rtl">'

code = code.replace(old_str, new_str)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
print("Replaced wrapper class")
