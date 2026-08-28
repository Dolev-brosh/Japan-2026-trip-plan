const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldSyncData = `    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'trip', 'itinerary');
        await setDoc(docRef, { title: newTitle, days: computedDays }, { merge: true });
      } catch (error) {
        console.error("Error saving document: ", error);
      }
    }`;

// Wait, let's look for exactly how setDoc is used
