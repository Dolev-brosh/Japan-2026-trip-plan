import re
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace the broken splits
code = re.sub(
    r'\{day\.transitDetails\.split\(\/\\r\?\\n\/\)\.map\(\(line, idx\) => \(\/\)\.map\(\(line, idx\) => \(',
    r'{day.transitDetails.split(/\\r?\\n/).map((line, idx) => (',
    code
)

code = re.sub(
    r'\{day\.description\.split\(\/\\r\?\\n\/\)\.map\(\(line, idx\) => \(\/\)\.map\(\(line, idx\) => \(',
    r'{day.description.split(/\\r?\\n/).map((line, idx) => (',
    code
)

# And fix the remaining /) if it's there
code = re.sub(r'\/\)\.map\(\(line, idx\) => \(', '', code)
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
