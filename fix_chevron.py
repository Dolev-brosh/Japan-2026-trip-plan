import re
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()
code = code.replace(
    "className={`p-1 transition-all duration-200 ease-in-out active:scale-95 ${isTicket ? 'text-white hover:text-gray-200' : 'text-gray-400 hover:text-gray-700'}`}",
    "className={`p-1 transition-all duration-200 ease-in-out active:scale-95 ${!isDay ? 'text-white hover:text-gray-200' : 'text-gray-400 hover:text-gray-700'}`}"
)
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
