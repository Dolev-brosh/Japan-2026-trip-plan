import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_block = """  const nonDayTitleClass = isDarkText ? 'text-gray-900' : 'text-white';
  const nonDaySubtitleClass = isDarkText ? 'text-gray-700' : 'text-white/80';
  const nonDayBorderClass = isDarkText ? 'border-gray-900/20' : 'border-white/20';
  const nonDayTextMutedClass = isDarkText ? 'text-gray-600' : 'text-white/70';
  const nonDayBgClass = isDarkText ? 'bg-black/5' : 'bg-black/10';
  const nonDayIconClass = isDarkText ? 'text-gray-800 hover:text-gray-900' : 'text-white hover:text-gray-200';

  const cardStyle = isDay ? 
    (day.isCurrent ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-gray-200 text-gray-700') :
    `${isDarkText ? 'text-gray-900' : 'text-white'} border-transparent`;"""

new_block = """  const nonDayTitleClass = isDarkText ? 'text-gray-700' : 'text-white';
  const nonDaySubtitleClass = isDarkText ? 'text-gray-500' : 'text-white/80';
  const nonDayBorderClass = isDarkText ? 'border-gray-700/20' : 'border-white/20';
  const nonDayTextMutedClass = isDarkText ? 'text-gray-500' : 'text-white/70';
  const nonDayBgClass = isDarkText ? 'bg-black/5' : 'bg-black/10';
  const nonDayIconClass = isDarkText ? 'text-gray-500 hover:text-gray-700' : 'text-white hover:text-gray-200';

  const cardStyle = isDay ? 
    (day.isCurrent ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-gray-200 text-gray-700') :
    `${isDarkText ? 'text-gray-700' : 'text-white'} border-transparent`;"""

if old_block in code:
    code = code.replace(old_block, new_block)
    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Replaced successfully")
else:
    print("Not found")

