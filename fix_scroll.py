import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add overflow-x-hidden to the modal body
code = code.replace(
    'className="flex-1 overflow-y-auto p-6 space-y-6 bg-white"',
    'className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6 bg-white"'
)

# And shorten the link placeholder to be safe
code = code.replace(
    'placeholder="הדבק כאן את הקישור האמיתי (https://...)"',
    'placeholder="קישור מלא (https://...)"'
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
print("Updated scroll and placeholders")
