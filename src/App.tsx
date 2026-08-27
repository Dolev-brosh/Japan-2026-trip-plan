import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { Pencil, Trash2, Plus, Calendar, ChevronUp, ChevronLeft, User, MapPin, Building2, Bed, AlignLeft } from 'lucide-react';
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
  isCurrent: boolean;
}

const initialDays: Day[] = [
  {
    id: '1',
    title: 'יום 1: נחיתה בטוקיו',
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
    title: 'יום 2: שיבויה והסביבה',
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
    title: 'יום 3: נסיעה לקיוטו',
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
    title: 'יום 4: מקדשים בקיוטו',
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
    title: 'יום 5: נארה ואיילים',
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
  isCurrent: false,
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

// --- Components ---

const SwipeableCard = ({ 
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
}) => {
  const controls = useAnimation();
  
  const handleDragEnd = (e: any, info: any) => {
    // Reveal delete action if dragged far enough to the left
    if (!isExpanded && info.offset.x < -40) {
       controls.start({ x: -80 });
    } else {
       controls.start({ x: 0 });
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
         className={`rounded-[16px] border relative z-10 w-full overflow-hidden transition-all ${day.isCurrent ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'}`}
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
               <h3 className={`font-bold ${day.isCurrent ? 'text-emerald-900' : 'text-gray-700'} ${isExpanded ? 'text-lg leading-tight' : 'text-base'}`}>
                 {day.title || 'יום חדש'}
               </h3>
               
               {!isExpanded && day.subtitle && (
                 <p className="text-xs text-gray-400 mt-1 line-clamp-1">{formatDate(day.date)} • {day.subtitle}</p>
               )}
               
               {isExpanded && (
                 <p className="text-sm text-emerald-700 opacity-80 mt-0.5">{day.subtitle}</p>
               )}
            </div>
            
            <div className="flex flex-col items-end gap-1 text-gray-400 shrink-0 text-left">
               {isExpanded ? (
                 <>
                   <p className="text-xs font-mono text-emerald-600 font-bold">{formatDate(day.date)}</p>
                   <div className="mt-4 flex gap-2">
                     <button 
                       onClick={(e) => { e.stopPropagation(); onEdit(day); }} 
                       className="p-1.5 bg-white border border-emerald-200 rounded-md shadow-sm text-emerald-600 hover:bg-emerald-50 transition-colors"
                     >
                        <Pencil size={14} strokeWidth={2.5} />
                     </button>
                     <button 
                       onClick={(e) => { e.stopPropagation(); onDeleteRequest(day.id); }} 
                       className="p-1.5 bg-white border border-red-100 rounded-md shadow-sm text-red-500 hover:bg-red-50 transition-colors"
                     >
                        <Trash2 size={14} strokeWidth={2.5} />
                     </button>
                   </div>
                 </>
               ) : (
                 <ChevronLeft size={18} className="text-gray-400" />
               )}
            </div>
          </div>

          {/* Expanded Details */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className={`px-4 pb-4 ${day.isCurrent ? 'bg-emerald-50' : 'bg-white'}`}>
                  <div className={`mt-2 pt-4 border-t ${day.isCurrent ? 'border-emerald-100' : 'border-gray-100'} grid grid-cols-2 gap-y-4 text-sm`}>
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
                     <div className="col-span-2 sm:col-span-1">
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
                             <span className={`text-[11px] ml-2 font-medium ${day.isCurrent ? 'text-emerald-700/70' : 'text-gray-400'}`}>
                               (לילה {day.nightNumber} מתוך {day.totalNights})
                             </span>
                          ) : null}
                       </div>
                     </div>
                   )}
                   
                   {day.description && (
                     <div className="col-span-2 mt-2">
                       <p className={`text-xs font-bold mb-1 ${day.isCurrent ? 'text-emerald-600' : 'text-gray-500'}`}>תיאור המסלול היומי:</p>
                       <p className={`leading-relaxed text-sm ${day.isCurrent ? 'text-emerald-800 italic' : 'text-gray-700'}`}>
                          {day.description}
                       </p>
                     </div>
                   )}
                </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden lg:static lg:w-2/5 lg:border-r lg:border-gray-100 lg:z-0 lg:translate-y-0" 
      dir="rtl"
    >
      {/* Header */}
      <div className="p-6 flex justify-between items-center border-b border-gray-100 shrink-0 bg-white shadow-sm lg:shadow-none">
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
            placeholder="לדוגמה: יום 4 - קיוטו"
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">לילה X מתוך</label>
            <input 
              type="number" min="1" 
              value={formData.nightNumber || ''}
              onChange={e => handleChange('nightNumber', parseInt(e.target.value) || 0)}
              className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
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
          <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">תיאור מסלול יומי</label>
          <textarea 
            rows={5} 
            value={formData.description}
            onChange={e => handleChange('description', e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-3 h-32 focus:border-emerald-500 outline-none text-sm resize-none bg-transparent mt-1 leading-relaxed" 
            placeholder="פרט את המסלול המתוכנן כאן..."
          />
        </div>
      </div>
      
      {/* Sticky Footer */}
      <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0">
        <button 
          onClick={() => onSave(formData)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-md active:scale-[0.98] transition-all"
        >
          שמור שינויים
        </button>
      </div>
    </motion.div>
  )
}

// --- Main App ---

export default function App() {
  const [days, setDays] = useState<Day[]>([]);
  const [tripTitle, setTripTitle] = useState('מסלול טיול ביפן');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  const [expandedDayId, setExpandedDayId] = useState<string | null>('4');
  
  const [editingDay, setEditingDay] = useState<Day | null>(null);
  const [deletingDayId, setDeletingDayId] = useState<string | null>(null);

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

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
      const docRef = doc(db, 'users', user.uid, 'itinerary', 'main');
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setDays(data.days || []);
          setTripTitle(data.title || 'מסלול טיול ביפן');
        } else {
          const localData = localStorage.getItem('itinerary_main');
          let dataToSave = { title: 'מסלול טיול ביפן', days: initialDays };
          if (localData) {
             try {
                dataToSave = JSON.parse(localData);
             } catch (e) {}
          }
          setDoc(docRef, dataToSave, { merge: true });
        }
      });
      return () => unsubscribe();
    } else {
      const localData = localStorage.getItem('itinerary_main');
      if (localData) {
        try {
           const parsed = JSON.parse(localData);
           setDays(parsed.days || []);
           setTripTitle(parsed.title || 'מסלול טיול ביפן');
        } catch (e) {
           setDays(initialDays);
        }
      } else {
        setDays(initialDays);
      }
    }
  }, [user, loadingAuth]);

  const syncData = async (newTitle: string, newDays: Day[]) => {
    setTripTitle(newTitle);
    setDays(newDays);

    if (user) {
      const docRef = doc(db, 'users', user.uid, 'itinerary', 'main');
      await setDoc(docRef, { title: newTitle, days: newDays }, { merge: true });
    } else {
      localStorage.setItem('itinerary_main', JSON.stringify({ title: newTitle, days: newDays }));
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setIsEditingTitle(false);
    syncData(newTitle, days);
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

  return (
    <div dir="rtl" className="flex flex-col h-screen w-full bg-[#F9FAFB] font-sans overflow-hidden text-[#1F2937] selection:bg-emerald-100">
       
       {/* Header */}
       <header className="flex justify-between items-center px-4 sm:px-8 py-4 bg-white border-b border-gray-200 shadow-sm shrink-0 z-20">
          <div className="flex items-center gap-3">
             <div className="bg-emerald-500 p-2 rounded-lg text-white">
                 <MapPin size={20} />
             </div>
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
                <div className="absolute top-8 bottom-4 right-[1.15rem] w-px bg-gray-200 z-0" />
                
                {days.map((day, index) => (
                  <div key={day.id} className="relative z-10">
                    {/* Stepper Dot */}
                    <div 
                      className={`absolute top-4 -right-[3.15rem] z-10 mt-1 w-10 h-10 rounded-full border-4 border-[#F9FAFB] flex items-center justify-center transition-colors duration-300
                        ${day.isCurrent 
                           ? 'bg-emerald-500 shadow-md text-white' 
                           : 'bg-gray-100 text-gray-400'
                        }`} 
                    >
                       {day.isCurrent ? <ChevronUp size={18} strokeWidth={3} className="rotate-180" /> : <span className="text-xs font-bold">{index + 1 < 10 ? `0${index + 1}` : index + 1}</span>}
                    </div>
                    
                    <SwipeableCard 
                      day={day}
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
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 lg:left-auto lg:right-[30%] lg:translate-x-1/2 z-40">
               <button 
                 onClick={() => setEditingDay(emptyDay)}
                 className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-emerald-700 font-bold transition-transform active:scale-95"
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
