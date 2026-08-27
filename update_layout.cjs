const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Root wrapper
code = code.replace(
  /<div dir="rtl" className="flex flex-col fixed inset-0 w-full bg-\[#F9FAFB\] font-sans overflow-hidden text-\[#1F2937\] selection:bg-emerald-100">/,
  '<div dir="rtl" className="flex flex-col h-[100dvh] w-full bg-[#F9FAFB] font-sans overflow-hidden text-[#1F2937] selection:bg-emerald-100">'
);
code = code.replace(
  /<div dir="rtl" className="flex flex-col h-screen w-full bg-\[#F9FAFB\] font-sans overflow-hidden text-\[#1F2937\] selection:bg-emerald-100">/,
  '<div dir="rtl" className="flex flex-col h-[100dvh] w-full bg-[#F9FAFB] font-sans overflow-hidden text-[#1F2937] selection:bg-emerald-100">'
);

// 2. Header
code = code.replace(
  /<header className="flex justify-between items-center px-4 sm:px-8 py-4 bg-white border-b border-gray-200 shadow-sm shrink-0 z-20">/,
  '<header className="sticky top-0 w-full flex justify-between items-center px-4 sm:px-8 py-4 bg-white border-b border-gray-200 shadow-sm shrink-0 z-50">'
);

// 3. FAB position
code = code.replace(
  /className="absolute bottom-8 left-1\/2 -translate-x-1\/2 lg:left-auto lg:right-\[30%\] lg:translate-x-1\/2 z-40"/,
  'className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:left-auto lg:right-[30%] lg:translate-x-1/2 z-50"'
);

fs.writeFileSync('src/App.tsx', code);
