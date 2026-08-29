import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace image rendering for all instances in SwipeableCard
code = code.replace(
    'className="w-full h-auto object-cover rounded-lg border border-black/10"',
    'className="w-full h-64 object-cover rounded-xl shadow-sm"'
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

