import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# 2. Update processLoadedData
process_loaded_data_regex = r"(const processLoadedData = \(loadedDays: Day\[\], loadedTitle: string\) => \{.*?let activeDayId: string \| null = null;\s*)(const computedDays = loadedDays\.map\(day => \{.*?return \{ \.\.\.day, isCurrent, isPast \};\s*\}\);)"
process_loaded_data_new = r"\g<1>const sortedDays = [...loadedDays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());\n    const computedDays = sortedDays.map(day => {\n      const isCurrent = day.date === todayString;\n      const isPast = day.date < todayString;\n      if (isCurrent) activeDayId = day.id;\n      const cleanedTitle = (day.title || '').replace(/^יום\s*\d+\s*[:-]?\s*/, '');\n      return { ...day, title: cleanedTitle, isCurrent, isPast };\n    });"

code = re.sub(process_loaded_data_regex, process_loaded_data_new, code, flags=re.DOTALL)

# 3. Update syncData
sync_data_regex = r"(const syncData = async \(newTitle: string, newDays: Day\[\]\) => \{.*?const todayString = [^;]+;\s*)(const computedDays = newDays\.map\(day => \(\{.*?isPast: day\.date < todayString\s*\}\)\);)"
sync_data_new = r"\g<1>const sortedDays = [...newDays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());\n    const computedDays = sortedDays.map(day => ({\n      ...day,\n      title: (day.title || '').replace(/^יום\s*\d+\s*[:-]?\s*/, ''),\n      isCurrent: day.date === todayString,\n      isPast: day.date < todayString\n    }));"

code = re.sub(sync_data_regex, sync_data_new, code, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("Fixed")
