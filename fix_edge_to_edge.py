import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# I will replace the wrapper around the image:
# from:
# <div className="mt-4 w-full" onClick={e => e.stopPropagation()}>
# to:
# <div className="mt-5 -mx-4 -mb-4" onClick={e => e.stopPropagation()}>

code = code.replace(
    '<div className="mt-4 w-full" onClick={e => e.stopPropagation()}>',
    '<div className="mt-5 -mx-4 -mb-4 overflow-hidden rounded-b-[16px]" onClick={e => e.stopPropagation()}>'
)

# And remove rounded-xl from the image itself, making it completely square at the top, or just filling the container
code = code.replace(
    'className="w-full h-64 object-cover rounded-xl shadow-sm"',
    'className="w-full h-64 sm:h-72 object-cover transition-transform duration-500 hover:scale-105"'
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

