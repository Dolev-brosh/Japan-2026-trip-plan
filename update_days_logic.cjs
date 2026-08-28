const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Update initialDays
code = code.replace(/title: 'יום \d+: (.*?)'/g, "title: '$1'");

// 2. Update processLoadedData
const processLoadedDataOld = `  const processLoadedData = (loadedDays: Day[], loadedTitle: string) => {
    const today = new Date();
    const todayString = \`\${today.getFullYear()}-\${String(today.getMonth() + 1).padStart(2, '0')}-\${String(today.getDate()).padStart(2, '0')}\`;
    
    let activeDayId: string | null = null;
    const computedDays = loadedDays.map(day => {
      const isCurrent = day.date === todayString;
      const isPast = day.date < todayString;
      if (isCurrent) activeDayId = day.id;
      return { ...day, isCurrent, isPast };
    });
    
    setDays(computedDays);
    setTripTitle(loadedTitle);
    
    if (activeDayId) setExpandedDayId(activeDayId);
  };`;

const processLoadedDataNew = `  const processLoadedData = (loadedDays: Day[], loadedTitle: string) => {
    const today = new Date();
    const todayString = \`\${today.getFullYear()}-\${String(today.getMonth() + 1).padStart(2, '0')}-\${String(today.getDate()).padStart(2, '0')}\`;
    
    let activeDayId: string | null = null;
    
    const sortedDays = [...loadedDays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const computedDays = sortedDays.map(day => {
      const isCurrent = day.date === todayString;
      const isPast = day.date < todayString;
      if (isCurrent) activeDayId = day.id;
      
      const cleanedTitle = (day.title || '').replace(/^יום\\s*\\d+\\s*[:-]?\\s*/, '');
      
      return { ...day, title: cleanedTitle, isCurrent, isPast };
    });
    
    setDays(computedDays);
    setTripTitle(loadedTitle);
    
    if (activeDayId) setExpandedDayId(activeDayId);
  };`;

code = code.replace(processLoadedDataOld, processLoadedDataNew);

// 3. Update syncData
const syncDataOld = `  const syncData = async (newTitle: string, newDays: Day[]) => {
    const today = new Date();
    const todayString = \`\${today.getFullYear()}-\${String(today.getMonth() + 1).padStart(2, '0')}-\${String(today.getDate()).padStart(2, '0')}\`;
    
    const computedDays = newDays.map(day => ({
      ...day,
      isCurrent: day.date === todayString,
      isPast: day.date < todayString
    }));

    setTripTitle(newTitle);
    setDays(computedDays);`;

const syncDataNew = `  const syncData = async (newTitle: string, newDays: Day[]) => {
    const today = new Date();
    const todayString = \`\${today.getFullYear()}-\${String(today.getMonth() + 1).padStart(2, '0')}-\${String(today.getDate()).padStart(2, '0')}\`;
    
    const sortedDays = [...newDays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const computedDays = sortedDays.map(day => ({
      ...day,
      title: (day.title || '').replace(/^יום\\s*\\d+\\s*[:-]?\\s*/, ''),
      isCurrent: day.date === todayString,
      isPast: day.date < todayString
    }));

    setTripTitle(newTitle);
    setDays(computedDays);`;

code = code.replace(syncDataOld, syncDataNew);


// 4. Update handleSaveDay
const handleSaveDayOld = `  const handleSaveDay = (savedDay: Day) => {
    let newDays;
    if (savedDay.id) {
      newDays = days.map(d => d.id === savedDay.id ? savedDay : d);
    } else {
      const newDay = { ...savedDay, id: Date.now().toString() };
      newDays = [...days, newDay];
    }
    syncData(tripTitle, newDays);
    setEditingDay(null);
  };`;

const handleSaveDayNew = `  const handleSaveDay = (savedDay: Day) => {
    let newDays;
    if (savedDay.id) {
      newDays = days.map(d => d.id === savedDay.id ? savedDay : d);
    } else {
      const newDay = { ...savedDay, id: Date.now().toString() };
      newDays = [...days, newDay];
    }
    
    newDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    syncData(tripTitle, newDays);
    setEditingDay(null);
  };`;

code = code.replace(handleSaveDayOld, handleSaveDayNew);

// 5. Update SwipeableCard Props
const swipeablePropsOld = `const SwipeableCard = ({ 
  day, 
  isExpanded, 
  onToggle, 
  onEdit, 
  onDeleteRequest 
}: { 
  day: Day; 
  isExpanded: boolean; 
  onToggle: () => void; 
  onEdit: (day: Day) => void;
  onDeleteRequest: (id: string) => void;
}) => {`;

const swipeablePropsNew = `const SwipeableCard = ({ 
  day, 
  index,
  isExpanded, 
  onToggle, 
  onEdit, 
  onDeleteRequest 
}: { 
  day: Day; 
  index: number;
  isExpanded: boolean; 
  onToggle: () => void; 
  onEdit: (day: Day) => void;
  onDeleteRequest: (id: string) => void;
}) => {`;

code = code.replace(swipeablePropsOld, swipeablePropsNew);

// 6. Update SwipeableCard Header Render
const headerRenderOld = `               <h3 className={\`font-bold text-base leading-tight \${day.isCurrent ? 'text-emerald-900' : 'text-gray-700'}\`}>
                 {day.title || 'יום חדש'}
               </h3>`;

const headerRenderNew = `               <h3 className={\`font-bold text-base leading-tight \${day.isCurrent ? 'text-emerald-900' : 'text-gray-700'}\`}>
                 {day.title ? \`יום \${index + 1}: \${day.title}\` : \`יום \${index + 1}\`}
               </h3>`;

code = code.replace(headerRenderOld, headerRenderNew);

// 7. Update SwipeableCard Map Render Call
const mapRenderOld = `                    <SwipeableCard 
                      day={day}
                      isExpanded={expandedDayId === day.id}
                      onToggle={() => toggleDay(day.id)}
                      onEdit={setEditingDay}
                      onDeleteRequest={setDeletingDayId}
                    />`;

const mapRenderNew = `                    <SwipeableCard 
                      day={day}
                      index={index}
                      isExpanded={expandedDayId === day.id}
                      onToggle={() => toggleDay(day.id)}
                      onEdit={setEditingDay}
                      onDeleteRequest={setDeletingDayId}
                    />`;

code = code.replace(mapRenderOld, mapRenderNew);

// 8. Update EditModal placeholder
const placeholderOld = `placeholder="לדוגמה: יום 4 - קיוטו"`;
const placeholderNew = `placeholder="לדוגמה: ביקור במקדשים"`;
code = code.replace(placeholderOld, placeholderNew);


fs.writeFileSync('src/App.tsx', code);
console.log('Done replacing logic');
