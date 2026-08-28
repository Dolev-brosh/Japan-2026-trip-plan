with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
    "  color?: string;",
    "  color?: string;\n  textColor?: 'white' | 'black';"
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
