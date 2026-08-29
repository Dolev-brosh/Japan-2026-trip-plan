with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
    "Upload, Ticket, Bell } from 'lucide-react'",
    "Upload, Ticket, Bell, Link } from 'lucide-react'"
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
