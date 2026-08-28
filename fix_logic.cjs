const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. processLoadedData
const processSearch = `    const computedDays = loadedDays.map(day => {
      const isCurrent = day.date === todayString;
      const isPast = day.date < todayString;
      if (isCurrent) activeDayId = day.id;
      return { ...day, isCurrent, isPast };
    });`;
const processReplace = `    const sortedDays = [...loadedDays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const computedDays = sortedDays.map(day => {
      const isCurrent = day.date === todayString;
      const isPast = day.date < todayString;
      if (isCurrent) activeDayId = day.id;
      const cleanedTitle = (day.title || '').replace(/^יום\\s*\\d+\\s*[:-]?\\s*/, '');
      return { ...day, title: cleanedTitle, isCurrent, isPast };
    });`;
code = code.replace(processSearch, processReplace);

// 2. syncData
const syncSearch = `    const computedDays = newDays.map(day => ({
      ...day,
      isCurrent: day.date === todayString,
      isPast: day.date < todayString
    }));`;
const syncReplace = `    const sortedDays = [...newDays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const computedDays = sortedDays.map(day => ({
      ...day,
      title: (day.title || '').replace(/^יום\\s*\\d+\\s*[:-]?\\s*/, ''),
      isCurrent: day.date === todayString,
      isPast: day.date < todayString
    }));`;
code = code.replace(syncSearch, syncReplace);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed');
