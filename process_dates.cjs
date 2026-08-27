const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Update initial state of expandedDayId
code = code.replace(
  /const \[expandedDayId, setExpandedDayId\] = useState<string \| null>\('4'\);/,
  "const [expandedDayId, setExpandedDayId] = useState<string | null>(null);\n  const [hasInitializedExpand, setHasInitializedExpand] = useState(false);"
);

// Add the helper function inside App
code = code.replace(
  /const \[loadingAuth, setLoadingAuth\] = useState\(true\);/,
  `const [loadingAuth, setLoadingAuth] = useState(true);

  const processLoadedData = (loadedDays: Day[], loadedTitle: string, currentExpandState: string | null, isInitial: boolean) => {
    const today = new Date();
    const todayString = \`\${today.getFullYear()}-\${String(today.getMonth() + 1).padStart(2, '0')}-\${String(today.getDate()).padStart(2, '0')}\`;
    
    let activeDayId: string | null = null;
    const computedDays = loadedDays.map(day => {
      const isCurrent = day.date === todayString;
      if (isCurrent) activeDayId = day.id;
      return { ...day, isCurrent };
    });
    
    setDays(computedDays);
    setTripTitle(loadedTitle);
    
    if (isInitial && activeDayId) {
       setExpandedDayId(activeDayId);
       setHasInitializedExpand(true);
    }
  };`
);

// We need to replace the data loading parts to use processLoadedData
// In Firestore snapshot
code = code.replace(
  /const data = snapshot\.data\(\);\n          setDays\(data\.days \|\| \[\]\);\n          setTripTitle\(data\.title \|\| 'מסלול טיול ביפן'\);/,
  `const data = snapshot.data();
          processLoadedData(data.days || [], data.title || 'מסלול טיול ביפן', expandedDayId, !hasInitializedExpand);`
);

// In Firestore else block (local storage)
code = code.replace(
  /let dataToSave = \{ title: 'מסלול טיול ביפן', days: initialDays \};\n          if \(localData\) \{\n             try \{\n                dataToSave = JSON\.parse\(localData\);\n             \} catch \(e\) \{\}\n          \}\n          setDoc\(docRef, dataToSave, \{ merge: true \}\);/,
  `let dataToSave = { title: 'מסלול טיול ביפן', days: initialDays };
          if (localData) {
             try {
                dataToSave = JSON.parse(localData);
             } catch (e) {}
          }
          processLoadedData(dataToSave.days || [], dataToSave.title || 'מסלול טיול ביפן', expandedDayId, !hasInitializedExpand);
          setDoc(docRef, dataToSave, { merge: true });`
);

// In no user block
code = code.replace(
  /try \{\n           const parsed = JSON\.parse\(localData\);\n           setDays\(parsed\.days \|\| \[\]\);\n           setTripTitle\(parsed\.title \|\| 'מסלול טיול ביפן'\);\n        \} catch \(e\) \{\n           setDays\(initialDays\);\n        \}\n      \} else \{\n        setDays\(initialDays\);\n      \}/,
  `try {
           const parsed = JSON.parse(localData);
           processLoadedData(parsed.days || [], parsed.title || 'מסלול טיול ביפן', expandedDayId, !hasInitializedExpand);
        } catch (e) {
           processLoadedData(initialDays, 'מסלול טיול ביפן', expandedDayId, !hasInitializedExpand);
        }
      } else {
        processLoadedData(initialDays, 'מסלול טיול ביפן', expandedDayId, !hasInitializedExpand);
      }`
);


fs.writeFileSync('src/App.tsx', code);
