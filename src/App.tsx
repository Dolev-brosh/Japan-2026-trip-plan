import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { Pencil, Trash2, Plus, Calendar, ChevronUp, ChevronLeft, User, MapPin, Building2, Bed, AlignLeft, MoreVertical, Download, Upload } from 'lucide-react';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

interface Day {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  city: string;
  accommodationArea: string;
  hotelName: string;
  hotelLink: string;
  nightNumber: number;
  totalNights: number;
  description: string;
  transitDetails?: string;
  isCurrent: boolean;
  isPast?: boolean;
}

const initialDays: Day[] = [
  {
    id: '1',
    title: 'נחיתה בטוקיו',
    subtitle: 'הגעה למלון והתארגנות',
    date: '2025-04-12',
    city: 'טוקיו',
    accommodationArea: 'שינג\'וקו',
    hotelName: 'Shinjuku Prince Hotel',
    hotelLink: '',
    nightNumber: 1,
    totalNights: 2,
    description: 'נחיתה בנמל התעופה, איסוף ציוד ונסיעה למלון.',
    isCurrent: false,
  },
  {
    id: '2',
    title: 'שיבויה והסביבה',
    subtitle: 'תצפית שיבויה סקיי ומעבר ה...',
    date: '2025-04-13',
    city: 'טוקיו',
    accommodationArea: 'שיבויה',
    hotelName: 'Shibuya Stream',
    hotelLink: '',
    nightNumber: 2,
    totalNights: 2,
    description: 'יום שלם באזור שיבויה.',
    isCurrent: false,
  },
  {
    id: '3',
    title: 'נסיעה לקיוטו',
    subtitle: 'רכבת מהירה שינקנסן',
    date: '2025-04-14',
    city: 'קיוטו',
    accommodationArea: 'אזור התחנה',
    hotelName: 'Kyoto Station Hotel',
    hotelLink: '',
    nightNumber: 1,
    totalNights: 4,
    description: 'נסיעה ברכבת המהירה לקיוטו, התארגנות במלון.',
    isCurrent: false,
  },
  {
    id: '4',
    title: 'מקדשים בקיוטו',
    subtitle: '',
    date: '2025-04-15',
    city: 'קיוטו',
    accommodationArea: 'מרכז העיר',
    hotelName: 'הצג פרטי מלון',
    hotelLink: '#',
    nightNumber: 1,
    totalNights: 4,
    description: 'ביקור במקדש פושימי אינארי בבוקר, הליכה לאורך אלפי השערים האדומים. לאחר מכן נסיעה למקדש מוזהב (קינקאקו-ג\'י) וסיום בטיול ערב בסמטאות גיון הציוריות.',
    isCurrent: true,
  },
  {
    id: '5',
    title: 'נארה ואיילים',
    subtitle: 'פארק נארה ומקדש טודאי-ג\'י',
    date: '2025-04-16',
    city: 'נארה',
    accommodationArea: 'מרכז העיר',
    hotelName: 'Nara Park Hotel',
    hotelLink: '',
    nightNumber: 2,
    totalNights: 4,
    description: 'נסיעה קצרה לנארה, האכלת האיילים בפארק.',
    isCurrent: false,
  }
];

const emptyDay: Day = {
  id: '',
  title: '',
  subtitle: '',
  date: '',
  city: '',
  accommodationArea: '',
  hotelName: '',
  hotelLink: '',
  nightNumber: 1,
  totalNights: 1,
  description: '',
  transitDetails: '',
  isCurrent: false,
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

// --- Components ---


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

const SwipeableCard = ({ 
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
}) => {
  const controls = useAnimation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleDragEnd = (e: any, info: any) => {
    // Reveal delete action if dragged far enough to the left
    if (!isExpanded && info.offset.x < -40) {
       controls.start({ x: -80, transition: { type: 'tween', duration: 0.3 } });
    } else {
       controls.start({ x: 0, transition: { type: 'tween', duration: 0.3 } });
    }
  };

  return (
    <div className="relative w-full rounded-[16px] overflow-hidden mb-5 bg-[#F9FAFB]">
       {/* Background Delete Action */}
       <div 
         className="absolute top-[2px] bottom-[2px] right-[2px] w-[5.5rem] bg-red-500 flex flex-col items-center justify-center text-white cursor-pointer rounded-[14px]"
         onClick={(e) => {
           e.stopPropagation();
           onDeleteRequest(day.id);
           controls.start({ x: 0 });
         }}
       >
          <Trash2 size={24} className="mb-1" />
          <span className="text-sm font-medium">מחיקה</span>
       </div>
       
       {/* Foreground Card */}
       <motion.div
         drag={!isExpanded ? "x" : false}
         dragDirectionLock
         dragConstraints={{ left: -80, right: 0 }}
         onDragEnd={handleDragEnd}
         animate={controls}
         className={`rounded-[16px] border relative z-10 w-full overflow-hidden transition-colors duration-300 ${day.isCurrent ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'}`}
       >
          {/* Card Header (Always visible) */}
          <div 
            className={`p-4 cursor-pointer flex items-start justify-between ${day.isCurrent ? 'bg-emerald-50' : 'bg-white'}`}
            onClick={onToggle}
          >
            <div className="flex-1 pl-4">
               {day.isCurrent && isExpanded && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 inline-block uppercase">פעיל כעת</span>
               )}
               <h3 className={`font-bold text-base leading-tight ${day.isCurrent ? 'text-emerald-900' : 'text-gray-700'}`}>
                 {day.title || `יום ${index + 1}`}
               </h3>
               
               {(day.date || day.subtitle) && (
                 <div className="text-xs text-gray-400 mt-1 relative">
                   <motion.div
                     initial={false}
                     animate={{ opacity: isExpanded ? 0 : 1 }}
                     transition={{ duration: 0.2 }}
                     className="absolute top-0 left-0 w-full line-clamp-1 pointer-events-none"
                   >
                     {day.date ? formatDate(day.date) : ''}
                     {day.date && day.subtitle ? ' • ' : ''}
                     {day.subtitle || ''}
                   </motion.div>
                   <motion.div
                     initial={false}
                     animate={{ 
                       height: isExpanded ? 'auto' : '1rem',
                       opacity: isExpanded ? 1 : 0 
                     }}
                     transition={{ duration: 0.3, ease: "easeInOut" }}
                     className="overflow-hidden"
                   >
                     {day.date ? formatDate(day.date) : ''}
                     {day.date && day.subtitle ? ' • ' : ''}
                     {day.subtitle || ''}
                   </motion.div>
                 </div>
               )}
            </div>
            
            <div className="flex flex-col items-end shrink-0 text-left relative">
               {isExpanded ? (
                 <>
                   <button 
                     onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                     className="p-1 text-gray-400 hover:text-gray-700 transition-all duration-200 ease-in-out active:scale-95"
                   >
                     <MoreVertical className="w-5 h-5" />
                   </button>
                   
                   <AnimatePresence>
                     {menuOpen && (
                       <motion.div 
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         transition={{ duration: 0.1 }}
                         className="absolute top-8 left-0 min-w-[120px] bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-20"
                       >
                         <button 
                           onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(day); }}
                           className="w-full text-right px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200 ease-in-out active:scale-95"
                         >
                           <Pencil className="w-5 h-5" />
                           עריכה
                         </button>
                         <button 
                           onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDeleteRequest(day.id); }}
                           className="w-full text-right px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-50 transition-all duration-200 ease-in-out active:scale-95"
                         >
                           <Trash2 className="w-5 h-5" />
                           מחיקה
                         </button>
                       </motion.div>
                     )}
                   </AnimatePresence>
                   
                   {/* Click away listener for menu */}
                   {menuOpen && (
                     <div 
                       className="fixed inset-0 z-10" 
                       onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
                     />
                   )}
                 </>
               ) : (
                 <ChevronLeft className="w-5 h-5 text-gray-400" />
               )}
            </div>
          </div>

          {/* Expanded Details */}
          <div 
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
          >
            <div className="overflow-hidden">
                <div className={`px-4 pb-4 ${day.isCurrent ? 'bg-emerald-50' : 'bg-white'}`}>
                  <div className={`pt-4 border-t ${day.isCurrent ? 'border-emerald-100' : 'border-gray-100'} grid grid-cols-2 gap-y-4 text-sm`}>
                   {day.city && (
                     <div>
                       <p className={`text-xs font-bold mb-1 ${day.isCurrent ? 'text-emerald-600' : 'text-gray-500'}`}>עיר הטיול:</p>
                       <p className={day.isCurrent ? 'text-emerald-900' : 'text-gray-800'}>{day.city}</p>
                     </div>
                   )}
                   {day.accommodationArea && (
                     <div>
                       <p className={`text-xs font-bold mb-1 ${day.isCurrent ? 'text-emerald-600' : 'text-gray-500'}`}>מיקום הלינה:</p>
                       <p className={day.isCurrent ? 'text-emerald-900' : 'text-gray-800'}>{day.accommodationArea}</p>
                     </div>
                   )}
                   {day.hotelName && (
                     <div className="col-span-2">
                       <p className={`text-xs font-bold mb-1 ${day.isCurrent ? 'text-emerald-600' : 'text-gray-500'}`}>שם המלון:</p>
                       <div>
                          {day.hotelLink ? (
                              <a href={day.hotelLink} target="_blank" rel="noreferrer" className={`${day.isCurrent ? 'text-emerald-700 decoration-emerald-300' : 'text-emerald-600 decoration-emerald-200'} underline font-medium`} onClick={e => e.stopPropagation()}>
                                {day.hotelName}
                              </a>
                          ) : (
                              <span className={`font-medium ${day.isCurrent ? 'text-emerald-900' : 'text-gray-800'}`}>{day.hotelName}</span>
                          )}
                          {(day.nightNumber || day.totalNights) ? (
                             <span className={`text-[11px] mr-1 font-medium ${day.isCurrent ? 'text-emerald-700/70' : 'text-gray-400'}`}>
                               (לילה {day.nightNumber} מתוך {day.totalNights})
                             </span>
                          ) : null}
                       </div>
                     </div>
                   )}
                   
                   {day.transitDetails && day.transitDetails.trim() !== '' && (
                     <div className="col-span-2 mt-2">
                       <p className={`text-xs font-bold mb-1 ${day.isCurrent ? 'text-emerald-600' : 'text-gray-500'}`}>נסיעות:</p>
                       <div className={`space-y-1 w-full break-words leading-relaxed text-sm ${day.isCurrent ? 'text-emerald-800 italic' : 'text-gray-700'}`}>
                         {day.transitDetails.split(/\r?\n/).map((line, idx) => (
                           <p key={idx} className="min-h-[1rem]">
                             {line || '\u00A0'}
                           </p>
                         ))}
                       </div>
                     </div>
                   )}
                   
                   {day.description && (
                     <div className="col-span-2 mt-2">
                       <p className={`text-xs font-bold mb-1 ${day.isCurrent ? 'text-emerald-600' : 'text-gray-500'}`}>תיאור המסלול היומי:</p>
                       <div className={`space-y-1 w-full break-words leading-relaxed text-sm ${day.isCurrent ? 'text-emerald-800 italic' : 'text-gray-700'}`}>
                         {day.description.split(/\r?\n/).map((line, idx) => (
                           <p key={idx} className="min-h-[1rem]">
                             {line || '\u00A0'}
                           </p>
                         ))}
                       </div>
                     </div>
                   )}
                </div>
                </div>
            </div>
          </div>
       </motion.div>
    </div>
  );
};


const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-gray-900/40 backdrop-blur-sm" dir="rtl">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl w-full max-w-sm p-7 shadow-2xl relative overflow-hidden"
      >
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5">
           <Trash2 size={24} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">מחיקת יום טיול</h3>
        <p className="text-gray-500 mb-8 leading-relaxed">האם את/ה בטוח/ה שברצונך למחוק יום זה? פעולה זו תסיר את כל המידע השמור ולא ניתן לשחזרו.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors">ביטול</button>
          <button onClick={onConfirm} className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 transition-colors">מחיקה</button>
        </div>
      </motion.div>
    </div>
  )
}

const EditModal = ({ day, onClose, onSave }: { key?: string, day: Day, onClose: () => void, onSave: (d: Day) => void }) => {
  const [formData, setFormData] = useState<Day>(day);
  
    const handleChange = (field: keyof Day, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasteDescription = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('Text');
    if (pastedText.startsWith('"') && pastedText.endsWith('"')) {
      e.preventDefault();
      const cleanedText = pastedText.replace(/^"|"$/g, '');
      
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      
      const currentDesc = formData.description || '';
      const newValue = currentDesc.substring(0, start) + cleanedText + currentDesc.substring(end);
      
      handleChange('description', newValue);
      
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + cleanedText.length;
      }, 0);
    }
  }
  const handlePasteTransitDetails = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('Text');
    if (pastedText.startsWith('"') && pastedText.endsWith('"')) {
      e.preventDefault();
      const cleanedText = pastedText.replace(/^"|"$/g, '');
      
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      
      const currentDesc = formData.transitDetails || '';
      const newValue = currentDesc.substring(0, start) + cleanedText + currentDesc.substring(end);
      
      handleChange('transitDetails', newValue);
      
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + cleanedText.length;
      }, 0);
    }
  };;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">
      {/* Dark overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10"
      >
      {/* Header */}
      <div className="p-6 flex justify-between items-center border-b border-gray-100 shrink-0 bg-white shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">{formData.id ? 'עריכת יום טיול' : 'הוספת יום חדש'}</h2>
        <button onClick={onClose} className="text-sm text-gray-400 font-medium hover:text-emerald-600 transition-colors">ביטול</button>
      </div>
      
      {/* Scrollable Form */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
        
        <div>
          <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">כותרת היום</label>
          <input 
            value={formData.title} 
            onChange={e => handleChange('title', e.target.value)}
            className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm transition-colors bg-transparent" 
            placeholder="לדוגמה: ביקור במקדשים"
          />
        </div>
        
        <div>
          <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">כותרת משנה</label>
          <input 
            value={formData.subtitle} 
            onChange={e => handleChange('subtitle', e.target.value)}
            className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm transition-colors bg-transparent" 
            placeholder="הזן כותרת משנה"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">תאריך</label>
            <div className="relative">
              <input 
                type="date" 
                value={formData.date}
                onChange={e => handleChange('date', e.target.value)}
                className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">עיר</label>
            <input 
              value={formData.city}
              onChange={e => handleChange('city', e.target.value)}
              className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
              placeholder="הזן עיר"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">מיקום לינה</label>
            <input 
              value={formData.accommodationArea}
              onChange={e => handleChange('accommodationArea', e.target.value)}
              className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
              placeholder="לדוגמה: מרכז העיר"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">שם המלון</label>
            <input 
              value={formData.hotelName}
              onChange={e => handleChange('hotelName', e.target.value)}
              className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
              placeholder="שם המלון"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">קישור למלון (אופציונלי)</label>
            <input 
              value={formData.hotelLink}
              onChange={e => handleChange('hotelLink', e.target.value)}
              className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
              placeholder="https://..."
              dir="ltr"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">לילה X מתוך</label>
            <input 
              type="number" min="1" 
              value={formData.nightNumber || ''}
              disabled
              readOnly
              className="w-full border-b border-gray-200 py-2 outline-none text-sm bg-gray-50 text-gray-400 cursor-not-allowed" 
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">סה"כ לינות</label>
            <input 
              type="number" min="1" 
              value={formData.totalNights || ''}
              onChange={e => handleChange('totalNights', parseInt(e.target.value) || 0)}
              className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">נסיעות (אופציונלי)</label>
          <textarea 
            rows={3} 
            value={formData.transitDetails || ''}
            onChange={e => handleChange('transitDetails', e.target.value)}
            onPaste={handlePasteTransitDetails}
            className="w-full border border-gray-200 rounded-lg p-3 min-h-[80px] focus:border-emerald-500 outline-none text-sm resize-y bg-transparent mt-1 leading-relaxed whitespace-pre-wrap" 
            placeholder="פרט על רכבות, טיסות, נסיעות..."
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">תיאור מסלול יומי</label>
          <textarea 
            rows={5} 
            value={formData.description}
            onChange={e => handleChange('description', e.target.value)}
            onPaste={handlePasteDescription}
            className="w-full border border-gray-200 rounded-lg p-3 min-h-[120px] focus:border-emerald-500 outline-none text-sm resize-y bg-transparent mt-1 leading-relaxed" 
            placeholder="פרט את המסלול המתוכנן כאן..."
          />
        </div>
      </div>
      
      {/* Sticky Footer */}
      <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0">
        <button 
          onClick={() => onSave(formData)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-md transition-all duration-200 ease-in-out active:scale-95"
        >
          שמור שינויים
        </button>
      </div>
      </motion.div>
    </div>
  )
}

// --- Main App ---

export default function App() {
  const [days, setDays] = useState<Day[]>([]);
  const [tripTitle, setTripTitle] = useState('מסלול טיול ביפן');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);
  const hasInitializedExpand = useRef(false);
  const currentDayRef = useRef<HTMLDivElement>(null);
  const hasScrolledToCurrent = useRef(false);

  useEffect(() => {
    if (currentDayRef.current && !hasScrolledToCurrent.current) {
      setTimeout(() => {
        currentDayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      hasScrolledToCurrent.current = true;
    }
  }, [days]);

  
  const [editingDay, setEditingDay] = useState<Day | null>(null);
  const [deletingDayId, setDeletingDayId] = useState<string | null>(null);

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const processLoadedData = (loadedDays: Day[], loadedTitle: string) => {
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    let activeDayId: string | null = null;
    const sortedDays = [...loadedDays].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    const computedDays = sortedDays.map(day => {
      const isCurrent = day.date === todayString;
      const isPast = day.date < todayString;
      if (isCurrent) activeDayId = day.id;
      const cleanedTitle = (day.title || '').replace(/^יום\s*\d+\s*[:-]?\s*/, '');
      return { ...day, title: cleanedTitle, isCurrent, isPast };
    });
    
    setDays(computedDays);
    setTripTitle(loadedTitle);
    
    if (!hasInitializedExpand.current && activeDayId) {
       setExpandedDayId(activeDayId);
       hasInitializedExpand.current = true;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loadingAuth) return;
    
    if (user) {
      const docRef = doc(db, 'users', user.uid, 'trip', 'itinerary');
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          processLoadedData(data.days || [], data.title || 'מסלול טיול ביפן');
        } else {
          const localData = localStorage.getItem('itinerary_main');
          let dataToSave = { title: 'מסלול טיול ביפן', days: initialDays };
          if (localData) {
             try {
                dataToSave = JSON.parse(localData);
             } catch (e) {}
          }
          processLoadedData(dataToSave.days || [], dataToSave.title || 'מסלול טיול ביפן');
          setDoc(docRef, dataToSave, { merge: true });
        }
      });
      return () => unsubscribe();
    } else {
      const localData = localStorage.getItem('itinerary_main');
      if (localData) {
        try {
           const parsed = JSON.parse(localData);
           processLoadedData(parsed.days || [], parsed.title || 'מסלול טיול ביפן');
        } catch (e) {
           processLoadedData(initialDays, 'מסלול טיול ביפן');
        }
      } else {
        processLoadedData(initialDays, 'מסלול טיול ביפן');
      }
    }
  }, [user, loadingAuth]);

  const syncData = async (newTitle: string, newDays: Day[]) => {
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const sortedDays = [...newDays].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    
    const computedDays = sortedDays.map(day => ({
      ...day,
      title: (day.title || '').replace(/^יום\s*\d+\s*[:-]?\s*/, ''),
      isCurrent: day.date === todayString,
      isPast: day.date < todayString
    }));

    setTripTitle(newTitle);
    setDays(computedDays);

    if (user) {
      const docRef = doc(db, 'users', user.uid, 'trip', 'itinerary');
      await setDoc(docRef, { title: newTitle, days: computedDays }, { merge: true });
    } else {
      localStorage.setItem('itinerary_main', JSON.stringify({ title: newTitle, days: computedDays }));
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setIsEditingTitle(false);
    syncData(newTitle, days);
  };

  
    const handleAddDayClick = () => {
    let nextDateStr = '';
    let inheritedAccommodation = { ...emptyDay };
    
    if (days.length > 0) {
      // Sort days by date to find the last day chronologically
      const sortedDays = [...days]
        .filter(d => d.date)
        .sort((a, b) => a.date.localeCompare(b.date));
        
      if (sortedDays.length > 0) {
        const lastDay = sortedDays[sortedDays.length - 1];
        
        // Date increment
        const lastDate = new Date(lastDay.date);
        if (!isNaN(lastDate.getTime())) {
          lastDate.setDate(lastDate.getDate() + 1);
          nextDateStr = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}-${String(lastDate.getDate()).padStart(2, '0')}`;
        }
        
        // Accommodation inheritance
        if (lastDay.hotelName && (lastDay.nightNumber || 0) < (lastDay.totalNights || 1)) {
          inheritedAccommodation = {
            ...inheritedAccommodation,
            city: lastDay.city || '',
            accommodationArea: lastDay.accommodationArea || '',
            hotelName: lastDay.hotelName || '',
            hotelLink: lastDay.hotelLink || '',
            totalNights: lastDay.totalNights || 1,
            nightNumber: (lastDay.nightNumber || 0) + 1
          };
        }
      }
    }
    
    if (!nextDateStr) {
      const today = new Date();
      nextDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }

    setEditingDay({
      ...inheritedAccommodation,
      date: nextDateStr
    });
  };

  const toggleDay = (id: string) => {
    setExpandedDayId(prev => prev === id ? null : id);
  };

  const handleSaveDay = (savedDay: Day) => {
    let newDays;
    if (savedDay.id) {
      newDays = days.map(d => d.id === savedDay.id ? savedDay : d);
    } else {
      const newDay = { ...savedDay, id: Date.now().toString() };
      newDays = [...days, newDay];
    }
    
    newDays.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    
    syncData(tripTitle, newDays);
    setEditingDay(null);
  };

  const handleDeleteConfirm = () => {
    if (deletingDayId) {
      const newDays = days.filter(d => d.id !== deletingDayId);
      syncData(tripTitle, newDays);
      if (expandedDayId === deletingDayId) setExpandedDayId(null);
      setDeletingDayId(null);
    }
  };

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    setIsExportMenuOpen(false);
    const dataStr = JSON.stringify(days, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "japan-itinerary.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsExportMenuOpen(false);
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedDays = JSON.parse(content);
        if (!Array.isArray(parsedDays)) {
          throw new Error("Invalid data format: Expected an array of days.");
        }
        setDays(parsedDays);
        syncData(tripTitle, parsedDays);
      } catch (error) {
        console.error("Failed to parse JSON file:", error);
        alert("קובץ לא תקין. אנא ודא שהקובץ הוא בפורמט JSON תקין של מסלול.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div dir="rtl" className="flex flex-col fixed inset-0 w-full bg-[#F9FAFB] font-sans overflow-hidden text-[#1F2937] selection:bg-emerald-100">
       
       {/* Header */}
       <header className="sticky top-0 w-full flex justify-between items-center px-4 sm:px-8 py-4 bg-white border-b border-gray-200 shadow-sm shrink-0 z-50">
          <div className="flex items-center gap-3 relative">
             <div className="relative">
               <button 
                 onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                 className="relative z-50 block transition-transform active:scale-95"
               >
                 <img src="/favicon.svg" alt="לוגו אפליקציה" className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm hover:ring-2 hover:ring-emerald-100 transition-all" />
               </button>
               
               <AnimatePresence>
                 {isExportMenuOpen && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95, y: -10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: -10 }}
                     transition={{ duration: 0.15 }}
                     className="absolute top-12 right-0 bg-white border border-gray-100 shadow-lg rounded-xl overflow-hidden min-w-[160px] z-50 flex flex-col"
                   >
                     <button onClick={handleExport} className="w-full text-right px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-3 transition-colors group">
                       <Download size={16} className="text-gray-400 group-hover:text-emerald-500" />
                       ייצוא נתונים
                     </button>
                     <button onClick={() => { setIsExportMenuOpen(false); fileInputRef.current?.click(); }} className="w-full text-right px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-3 transition-colors border-t border-gray-50 group">
                       <Upload size={16} className="text-gray-400 group-hover:text-emerald-500" />
                       ייבוא נתונים
                     </button>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
             {isExportMenuOpen && (
               <div className="fixed inset-0 z-40" onClick={() => setIsExportMenuOpen(false)} />
             )}
             
             {/* Hidden file input */}
             <input 
               type="file" 
               accept=".json"
               ref={fileInputRef}
               onChange={handleImport}
               className="hidden"
             />

             <div className="flex items-center gap-2">
                {isEditingTitle ? (
                   <input 
                      autoFocus 
                      value={tripTitle} 
                      onChange={e => setTripTitle(e.target.value)} 
                      onBlur={() => handleTitleChange(tripTitle)}
                      onKeyDown={e => e.key === 'Enter' && handleTitleChange(tripTitle)}
                      className="text-xl font-bold text-gray-900 bg-transparent border-b-2 border-emerald-500 outline-none w-48 pb-1"
                   />
                ) : (
                   <h1 className="text-xl font-bold">{tripTitle}</h1>
                )}
                <button 
                  onClick={() => setIsEditingTitle(!isEditingTitle)} 
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                >
                   <Pencil size={16} />
                </button>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             {loadingAuth ? (
                <div className="text-sm text-gray-400">טוען...</div>
             ) : user ? (
                <>
                  <div className="text-left ml-4 hidden sm:block">
                     <p className="text-xs text-gray-500">מחובר כ-</p>
                     <p className="text-sm font-semibold italic truncate max-w-[120px]">{user.displayName || 'משתמש'}</p>
                     <button onClick={() => signOut(auth)} className="text-[10px] text-red-500 hover:underline font-bold transition-all">התנתק</button>
                  </div>
                  <div className="w-10 h-10 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-700 font-bold overflow-hidden">
                     {user.photoURL ? (
                        <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                     ) : (
                        user.displayName?.charAt(0) || 'א'
                     )}
                  </div>
                </>
             ) : (
                <button 
                  onClick={() => signInWithPopup(auth, googleProvider)} 
                  className="text-sm bg-white border border-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
                >
                  התחבר עם Google
                </button>
             )}
          </div>
       </header>

       {/* Main Split Layout */}
       <main className="flex flex-1 overflow-hidden relative">
          
          {/* Timeline Section */}
          <div className={`w-full ${editingDay ? 'hidden lg:block lg:w-3/5' : ''} lg:w-3/5 lg:border-l border-gray-200 overflow-y-auto p-4 sm:p-6 space-y-4 pb-32`}>
             <div className="max-w-2xl mx-auto relative pr-12 mt-2">
                {/* Vertical Line */}
                <div className="absolute top-8 bottom-4 right-[1rem] w-px bg-gray-200 z-0" />
                
                {days.map((day, index) => (
                  <div key={day.id} className={`relative z-10 ${day.isPast ? 'opacity-70' : ''}`} ref={day.isCurrent ? currentDayRef : null}>
                    {/* Stepper Dot */}
                    {day.isCurrent ? (
                      <CurrentDayStepper />
                    ) : (
                      <div 
                        className="absolute top-4 -right-[52.4px] z-10 w-10 h-10 rounded-full border-4 border-[#F9FAFB] flex items-center justify-center transition-colors duration-300 bg-gray-100 text-gray-400"
                      >
                         <span className="text-xs font-bold">{index + 1 < 10 ? `0${index + 1}` : index + 1}</span>
                      </div>
                    )}
                    
                    <SwipeableCard 
                      day={day}
                      index={index}
                      isExpanded={expandedDayId === day.id}
                      onToggle={() => toggleDay(day.id)}
                      onEdit={setEditingDay}
                      onDeleteRequest={setDeletingDayId}
                    />
                  </div>
                ))}
                
                {days.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    אין ימים במסלול עדיין. הוסף יום חדש!
                  </div>
                )}
             </div>
          </div>

          {/* Edit Panel */}
          <AnimatePresence>
            {editingDay && (
              <EditModal 
                key="edit-modal"
                day={editingDay} 
                onClose={() => setEditingDay(null)} 
                onSave={handleSaveDay} 
              />
            )}
          </AnimatePresence>
          
          {/* Floating Action Button */}
          {!editingDay && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:left-auto lg:right-[30%] lg:translate-x-1/2 z-50">
               <button 
                 onClick={handleAddDayClick}
                 className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-emerald-700 font-bold transition-all duration-200 ease-in-out active:scale-95"
               >
                  <Plus size={20} strokeWidth={3} />
                  <span>הוספת יום חדש</span>
               </button>
            </div>
          )}
       </main>

       {/* Delete Modal */}
       <DeleteConfirmModal 
         isOpen={!!deletingDayId} 
         onClose={() => setDeletingDayId(null)} 
         onConfirm={handleDeleteConfirm} 
       />
    </div>
  );
}
