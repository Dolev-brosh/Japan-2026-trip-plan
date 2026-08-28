const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add CurrentDayStepper component
const currentDayStepperCode = `
const CurrentDayStepper = () => {
  const [emojis, setEmojis] = useState<{id: number, x: number, y: number, r: number}[]>([]);
  const timerRef = useRef<any>(null);
  const emojiIdCounter = useRef(0);

  const spawnEmoji = () => {
    const id = emojiIdCounter.current++;
    const x = (Math.random() - 0.5) * 150;
    const y = - (Math.random() * 150 + 50);
    const r = (Math.random() - 0.5) * 180;
    setEmojis(prev => [...prev, { id, x, y, r }]);
    setTimeout(() => {
      setEmojis(prev => prev.filter(e => e.id !== id));
    }, 1000);
  };

  const startBurst = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    if (timerRef.current) return;
    spawnEmoji();
    timerRef.current = setInterval(spawnEmoji, 80);
  };

  const stopBurst = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div 
      className="absolute top-4 -right-[52.4px] z-20 w-10 h-10 rounded-full border-4 border-[#F9FAFB] flex items-center justify-center bg-white shadow-md cursor-pointer touch-none select-none"
      onMouseDown={startBurst}
      onMouseUp={stopBurst}
      onMouseLeave={stopBurst}
      onTouchStart={startBurst}
      onTouchEnd={stopBurst}
      onTouchCancel={stopBurst}
    >
      <img src="/favicon.svg" alt="Favicon" className="w-8 h-8 rounded-full border-2 border-emerald-500 pointer-events-none object-cover" />
      <AnimatePresence>
        {emojis.map(emoji => (
          <motion.div
            key={emoji.id}
            initial={{ opacity: 1, scale: 0.2, x: 0, y: 0, rotate: 0 }}
            animate={{ opacity: 0, scale: 1.5, x: emoji.x, y: emoji.y, rotate: emoji.r }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-2xl z-30 drop-shadow-sm"
          >
            🇯🇵
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

`;

code = code.replace('const SwipeableCard = ({', currentDayStepperCode + 'const SwipeableCard = ({');

// 2. Replace the Stepper Dot in rendering
const stepperDotOld = `                    {/* Stepper Dot */}
                    <div 
                      className={\`absolute top-4 -right-[52.4px] z-10 w-10 h-10 rounded-full border-4 border-[#F9FAFB] flex items-center justify-center transition-colors duration-300
                        \${day.isCurrent 
                           ? 'bg-emerald-500 shadow-md text-white' 
                           : 'bg-gray-100 text-gray-400'
                        }\`} 
                    >
                       {day.isCurrent ? <ChevronUp size={18} strokeWidth={3} className="rotate-180" /> : <span className="text-xs font-bold">{index + 1 < 10 ? \`0\${index + 1}\` : index + 1}</span>}
                    </div>`;

const stepperDotNew = `                    {/* Stepper Dot */}
                    {day.isCurrent ? (
                      <CurrentDayStepper />
                    ) : (
                      <div 
                        className="absolute top-4 -right-[52.4px] z-10 w-10 h-10 rounded-full border-4 border-[#F9FAFB] flex items-center justify-center transition-colors duration-300 bg-gray-100 text-gray-400"
                      >
                         <span className="text-xs font-bold">{index + 1 < 10 ? \`0\${index + 1}\` : index + 1}</span>
                      </div>
                    )}`;

code = code.replace(stepperDotOld, stepperDotNew);

// 3. Re-add the Current Day badge
const headerTitleOld = `               <h3 className={\`font-bold text-base leading-tight \${day.isCurrent ? 'text-emerald-900' : 'text-gray-700'}\`}>
                 {day.title ? \`יום \${index + 1}: \${day.title}\` : \`יום \${index + 1}\`}
               </h3>`;

const headerTitleNew = `               {day.isCurrent && isExpanded && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 inline-block uppercase">פעיל כעת</span>
               )}
               <h3 className={\`font-bold text-base leading-tight \${day.isCurrent ? 'text-emerald-900' : 'text-gray-700'}\`}>
                 {day.title ? \`יום \${index + 1}: \${day.title}\` : \`יום \${index + 1}\`}
               </h3>`;

code = code.replace(headerTitleOld, headerTitleNew);

fs.writeFileSync('src/App.tsx', code);
console.log('Script done');
