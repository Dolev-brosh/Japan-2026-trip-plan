const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const syncDataReplacement = `const syncData = async (newTitle: string, newDays: Day[]) => {
    const today = new Date();
    const todayString = \`\${today.getFullYear()}-\${String(today.getMonth() + 1).padStart(2, '0')}-\${String(today.getDate()).padStart(2, '0')}\`;
    
    const computedDays = newDays.map(day => ({
      ...day,
      isCurrent: day.date === todayString
    }));

    setTripTitle(newTitle);
    setDays(computedDays);

    if (user) {
      const docRef = doc(db, 'users', user.uid, 'trip', 'itinerary');
      await setDoc(docRef, { title: newTitle, days: computedDays }, { merge: true });
    } else {
      localStorage.setItem('itinerary_main', JSON.stringify({ title: newTitle, days: computedDays }));
    }
  };`;

code = code.replace(
  /const syncData = async \(newTitle: string, newDays: Day\[\]\) => \{[\s\S]*?\}\n  \};/,
  syncDataReplacement
);

fs.writeFileSync('src/App.tsx', code);
