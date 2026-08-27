const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace the useState with useRef for hasInitializedExpand
code = code.replace(
  /const \[hasInitializedExpand, setHasInitializedExpand\] = useState\(false\);/,
  "const hasInitializedExpand = useRef(false);"
);

// We need to import useRef if not imported
if (!code.includes('useRef')) {
  code = code.replace(/import \{ useState, useEffect/g, "import { useState, useEffect, useRef");
}

code = code.replace(
  /if \(isInitial && activeDayId\) \{\n       setExpandedDayId\(activeDayId\);\n       setHasInitializedExpand\(true\);\n    \}/g,
  `if (!hasInitializedExpand.current && activeDayId) {
       setExpandedDayId(activeDayId);
       hasInitializedExpand.current = true;
    }`
);

// We can remove the isInitial parameter from processLoadedData, or just ignore it.
code = code.replace(
  /const processLoadedData = \(loadedDays: Day\[\], loadedTitle: string, currentExpandState: string \| null, isInitial: boolean\) => \{/g,
  "const processLoadedData = (loadedDays: Day[], loadedTitle: string) => {"
);

code = code.replace(/processLoadedData\(([^,]+), ([^,]+), expandedDayId, !hasInitializedExpand\)/g, "processLoadedData($1, $2)");
code = code.replace(/processLoadedData\(([^,]+),([^,]+), expandedDayId, !hasInitializedExpand\)/g, "processLoadedData($1, $2)");

fs.writeFileSync('src/App.tsx', code);
