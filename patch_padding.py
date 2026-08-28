with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_content = """          <div 
            className="p-4 cursor-pointer flex items-start justify-between"
            onClick={onToggle}
          >"""

new_content = """          <div 
            className={`px-4 cursor-pointer flex items-start justify-between ${!isDay && !isExpanded ? 'py-2' : 'py-4'}`}
            onClick={onToggle}
          >"""

if old_content in code:
    code = code.replace(old_content, new_content)
    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Patched successfully")
else:
    print("Could not find content")
