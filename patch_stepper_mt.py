with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_block = "'w-8 h-8 -right-[48.4px] text-white'"
new_block = "'w-8 h-8 -right-[48.4px] text-white -mt-[14px]'"

if old_block in code:
    code = code.replace(old_block, new_block)
    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Patched successfully")
else:
    print("Could not find block")
