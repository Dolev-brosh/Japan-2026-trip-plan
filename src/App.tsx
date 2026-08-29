import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { Pencil, Trash2, Plus, Calendar, ChevronUp, ChevronLeft, User, MapPin, Building2, Bed, AlignLeft, MoreVertical, Download, Upload, Ticket, Bell, Link, Image as ImageIcon, X } from 'lucide-react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

export interface TicketField {
  id: string;
  label: string;
  value: string;
  isLink?: boolean;
  linkUrl?: string;
}

export interface TimelineItem {
  id: string;
  type?: 'day' | 'ticket' | 'reminder';
  title: string;
  subtitle?: string;
  date: string;
  city?: string;
  accommodationArea?: string;
  hotelName?: string;
  hotelLink?: string;
  nightNumber?: number;
  totalNights?: number;
  description?: string;
  transitDetails?: string;
  isCurrent?: boolean;
  isPast?: boolean;
  
  color?: string;
  textColor?: 'white' | 'black';
  imageUrl?: string;
  fields?: TicketField[];
  notes?: string;
}

const initialDays: TimelineItem[] = [
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

const emptyItem: TimelineItem = {
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
  day: TimelineItem; 
  index: number;
  isExpanded: boolean; 
  onToggle: () => void; 
  onEdit: (day: TimelineItem) => void;
  onDeleteRequest: (id: string) => void;
}) => {
  const controls = useAnimation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleDragEnd = (e: any, info: any) => {
    if (!isExpanded && info.offset.x < -40) {
       controls.start({ x: -80, transition: { type: 'tween', duration: 0.3 } });
    } else {
       controls.start({ x: 0, transition: { type: 'tween', duration: 0.3 } });
    }
  };

  const isDay = !day.type || day.type === 'day';
  const isTicket = day.type === 'ticket';
  const isReminder = day.type === 'reminder';

  const isDarkText = day.textColor === 'black';
  const nonDayTitleClass = isDarkText ? 'text-gray-700' : 'text-white';
  const nonDaySubtitleClass = isDarkText ? 'text-gray-500' : 'text-white/80';
  const nonDayBorderClass = isDarkText ? 'border-gray-700/20' : 'border-white/20';
  const nonDayTextMutedClass = isDarkText ? 'text-gray-500' : 'text-white/70';
  const nonDayBgClass = isDarkText ? 'bg-black/5' : 'bg-black/10';
  const nonDayIconClass = isDarkText ? 'text-gray-500 hover:text-gray-700' : 'text-white hover:text-gray-200';

  const cardStyle = isDay ? 
    (day.isCurrent ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-gray-200 text-gray-700') :
    `${isDarkText ? 'text-gray-700' : 'text-white'} border-transparent`;

  const bgColor = !isDay ? (day.color || (isTicket ? '#10b981' : '#f59e0b')) : (day.isCurrent ? '#ecfdf5' : '#ffffff');

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
         style={{ backgroundColor: bgColor }}
         className={`rounded-[16px] border relative z-10 w-full overflow-hidden transition-colors duration-300 ${cardStyle}`}
       >
          {/* Card Header */}
          <div 
            className={`px-4 cursor-pointer flex items-start justify-between transition-all duration-300 ease-in-out ${!isDay && !isExpanded ? 'py-2' : 'py-4'}`}
            onClick={onToggle}
          >
            <div className="flex-1 pl-4 flex gap-3 items-start">
               <div>
                 {day.isCurrent && isDay && isExpanded && (
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 inline-block uppercase">פעיל כעת</span>
                 )}
                 <h3 className={`font-bold leading-tight ${!isDay ? `${nonDayTitleClass} text-xs` : 'text-base'}`}>
                   {day.title || (isDay ? `יום ${index + 1}` : isTicket ? 'כרטיס' : 'תזכורת')}
                 </h3>
                 
                 {(isDay && (day.date || day.subtitle)) && (
                   <div className={`text-xs mt-1 relative ${day.isCurrent ? 'text-emerald-700/80' : 'text-gray-400'}`}>
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

                 {/* Non-day subtitles */}
                 {(!isDay && day.date) && (
                   <motion.div 
                     initial={false}
                     animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0, marginTop: isExpanded ? '0.25rem' : 0 }}
                     className={`text-xs overflow-hidden ${!isDay ? nonDaySubtitleClass : 'text-gray-500'}`}
                   >
                     {formatDate(day.date)}
                   </motion.div>
                 )}
               </div>
            </div>
            
            <div className="flex flex-col items-end shrink-0 text-left relative">
               {isExpanded ? (
                 <>
                   <button 
                     onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                     className={`p-1 transition-all duration-200 ease-in-out active:scale-95 ${!isDay ? nonDayIconClass : 'text-gray-400 hover:text-gray-700'}`}
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
                         className="absolute top-8 left-0 min-w-[120px] bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-20 text-gray-800"
                       >
                         <button 
                           onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(day); }}
                           className="w-full text-right px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 transition-all duration-200 ease-in-out active:scale-95"
                         >
                           <Pencil className="w-5 h-5" />
                           עריכה
                         </button>
                         <button 
                           onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDeleteRequest(day.id); }}
                           className="w-full text-right px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 border-t border-gray-50 transition-all duration-200 ease-in-out active:scale-95 text-red-500"
                         >
                           <Trash2 className="w-5 h-5" />
                           מחיקה
                         </button>
                       </motion.div>
                     )}
                   </AnimatePresence>
                   
                   {menuOpen && (
                     <div 
                       className="fixed inset-0 z-10" 
                       onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
                     />
                   )}
                 </>
               ) : (
                 isDay ? <ChevronLeft className="w-5 h-5 text-gray-400" /> : null
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
                <div className="px-4 pb-4">
                  {/* Day Content */}
                  {isDay && (
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
                     
                     {day.imageUrl && (
                        <div className="col-span-2 mt-4 overflow-hidden rounded-lg shadow-sm" onClick={e => e.stopPropagation()}>
                          <Zoom>
                            <img src={day.imageUrl} alt="Attachment" className="w-full h-48 sm:h-64 object-cover" />
                          </Zoom>
                        </div>
                     )}
                    </div>
                  )}

                  {/* Ticket Content */}
                  {isTicket && (
                    <div className={`pt-4 border-t ${nonDayBorderClass}`}>
                      {(!day.fields || day.fields.length === 0) && !day.imageUrl ? (
                        <p className={`${nonDayTextMutedClass} text-sm italic`}>אין פרטים נוספים</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {(day.fields || []).map(f => (
                            <div key={f.id} className={`${nonDayBgClass} rounded-lg p-3 backdrop-blur-sm`}>
                              <p className={`text-[10px] ${nonDayTextMutedClass} uppercase tracking-wider mb-1 font-bold`}>{f.label}</p>
                              {f.isLink ? (
                                <a href={(f.linkUrl || f.value || '').startsWith('http') ? (f.linkUrl || f.value) : `https://${f.linkUrl || f.value}`} target="_blank" rel="noreferrer" className={`text-sm font-semibold ${nonDayTitleClass} truncate underline block`} onClick={e => e.stopPropagation()}>{f.value || 'קישור'}</a>
                              ) : (
                                <p className={`text-sm font-semibold ${nonDayTitleClass} truncate`}>{f.value}</p>
                              )}
                            </div>
                          ))}
                          {day.imageUrl && (
                            <div className="overflow-hidden rounded-lg h-full min-h-[4.5rem]" onClick={e => e.stopPropagation()}>
                              <Zoom>
                                <img src={day.imageUrl} alt="Attachment" className="w-full h-full object-cover" style={{ minHeight: '4.5rem' }} />
                              </Zoom>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reminder Content */}
                  {isReminder && (
                    <div className={`pt-4 border-t ${nonDayBorderClass}`}>
                      <div className={`text-sm leading-relaxed ${nonDayTitleClass} font-medium whitespace-pre-wrap break-words mb-4`}>
                        {day.notes || <span className={`${nonDayTextMutedClass} italic`}>אין תוכן...</span>}
                      </div>
                      {((day.fields && day.fields.length > 0) || day.imageUrl) && (
                        <div className="grid grid-cols-2 gap-4">
                          {(day.fields || []).map(f => (
                            <div key={f.id} className={`${nonDayBgClass} rounded-lg p-3 backdrop-blur-sm`}>
                              <p className={`text-[10px] ${nonDayTextMutedClass} uppercase tracking-wider mb-1 font-bold`}>{f.label}</p>
                              {f.isLink ? (
                                <a href={(f.linkUrl || f.value || '').startsWith('http') ? (f.linkUrl || f.value) : `https://${f.linkUrl || f.value}`} target="_blank" rel="noreferrer" className={`text-sm font-semibold ${nonDayTitleClass} truncate underline block`} onClick={e => e.stopPropagation()}>{f.value || 'קישור'}</a>
                              ) : (
                                <p className={`text-sm font-semibold ${nonDayTitleClass} truncate`}>{f.value}</p>
                              )}
                            </div>
                          ))}
                          {day.imageUrl && (
                            <div className="overflow-hidden rounded-lg h-full min-h-[4.5rem]" onClick={e => e.stopPropagation()}>
                              <Zoom>
                                <img src={day.imageUrl} alt="Attachment" className="w-full h-full object-cover" style={{ minHeight: '4.5rem' }} />
                              </Zoom>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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
        <h3 className="text-xl font-bold text-gray-900 mb-2">מחיקת פריט</h3>
        <p className="text-gray-500 mb-8 leading-relaxed">האם את/ה בטוח/ה שברצונך למחוק פריט זה? פעולה זו תסיר את כל המידע השמור ולא ניתן לשחזרו.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors">ביטול</button>
          <button onClick={onConfirm} className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 transition-colors">מחיקה</button>
        </div>
      </motion.div>
    </div>
  )
}

const EditModal = ({ day, onClose, onSave }: { key?: string, day: TimelineItem, onClose: () => void, onSave: (d: TimelineItem) => void }) => {
  const [formData, setFormData] = useState<TimelineItem>(day);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  
  const handleChange = (field: keyof TimelineItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateField = (id: string, key: keyof TicketField, val: any) => {
    setFormData(prev => ({
      ...prev,
      fields: (prev.fields || []).map(f => f.id === id ? { ...f, [key]: val } : f)
    }));
  };

  const addField = () => {
    setFormData(prev => ({
      ...prev,
      fields: [...(prev.fields || []), { id: Date.now().toString(), label: '', value: '' }]
    }));
  };

  const removeField = (id: string) => {
    setFormData(prev => ({
      ...prev,
      fields: (prev.fields || []).filter(f => f.id !== id)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64Str = await compressImage(e.target.files[0]);
        handleChange('imageUrl', base64Str);
      } catch (err) {
        console.error('Image upload failed', err);
      }
    }
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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6" dir="rtl">
      {/* Dark overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }} transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full sm:max-w-2xl max-h-[90vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10"
      >
        <div className="p-6 flex justify-between items-center border-b border-gray-100 shrink-0 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            {formData.type === 'ticket' ? 'עריכת כרטיס' : formData.type === 'reminder' ? 'עריכת תזכורת' : 'עריכת יום'}
          </h2>
          <button onClick={onClose} className="text-sm text-gray-400 font-medium hover:text-emerald-600 transition-colors">ביטול</button>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6 bg-white">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">כותרת</label>
              <input 
                value={formData.title} onChange={e => handleChange('title', e.target.value)}
                className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm transition-colors bg-transparent" 
                placeholder="לדוגמה: כותרת..."
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">תאריך</label>
              <input 
                type="date" value={formData.date} onChange={e => handleChange('date', e.target.value)}
                className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
              />
            </div>
          </div>

          {(!formData.type || formData.type === 'day') && (
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">כותרת משנה</label>
                <input 
                  value={formData.subtitle || ''} onChange={e => handleChange('subtitle', e.target.value)}
                  className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">עיר</label>
                  <input 
                    value={formData.city || ''} onChange={e => handleChange('city', e.target.value)}
                    className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">אזור לינה</label>
                  <input 
                    value={formData.accommodationArea || ''} onChange={e => handleChange('accommodationArea', e.target.value)}
                    className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">שם המלון</label>
                  <input 
                    value={formData.hotelName || ''} onChange={e => handleChange('hotelName', e.target.value)}
                    className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">קישור למלון</label>
                  <input 
                    value={formData.hotelLink || ''} onChange={e => handleChange('hotelLink', e.target.value)}
                    className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">מספר לילה</label>
                  <input 
                    type="number" value={formData.nightNumber || ''} onChange={e => handleChange('nightNumber', parseInt(e.target.value) || 0)}
                    className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">סה"כ לילות במלון זה</label>
                  <input 
                    type="number" value={formData.totalNights || ''} onChange={e => handleChange('totalNights', parseInt(e.target.value) || 0)}
                    className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">פרטי נסיעות (אופציונלי)</label>
                <textarea 
                  rows={2} value={formData.transitDetails || ''} onChange={e => handleChange('transitDetails', e.target.value)}
                  onPaste={handlePasteTransitDetails}
                  className="w-full border border-gray-200 rounded-lg p-3 min-h-[60px] focus:border-emerald-500 outline-none text-sm resize-y bg-transparent" 
                  placeholder="לדוגמה: רכבת ב-09:00 מתחנת שינג'וקו..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">תיאור המסלול היומי</label>
                <textarea 
                  rows={5} value={formData.description || ''} onChange={e => handleChange('description', e.target.value)}
                  onPaste={handlePasteDescription}
                  className="w-full border border-gray-200 rounded-lg p-3 min-h-[120px] focus:border-emerald-500 outline-none text-sm resize-y bg-transparent leading-relaxed" 
                  placeholder="פרט את מסלול הטיול כאן..."
                />
              </div>
            </div>
          )}

          {formData.type === 'ticket' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">צבע רקע</label>
                  <button 
                    onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                    className="w-16 h-10 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                    style={{ backgroundColor: formData.color || '#10b981' }}
                  />
                  <AnimatePresence>
                    {isColorPickerOpen && (
                      <>
                        <div className="fixed inset-0 z-[110]" onClick={() => setIsColorPickerOpen(false)} />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none"
                        >
                          <div className="pointer-events-auto bg-white p-4 shadow-2xl rounded-2xl border border-gray-100 flex flex-col gap-4">
                            <HexColorPicker 
                              color={formData.color || '#10b981'} 
                              onChange={(newColor) => handleChange('color', newColor)} 
                            />
                            <div className="flex items-center gap-2" dir="ltr">
                              <span className="text-gray-500 text-sm font-semibold uppercase">HEX:</span>
                              <HexColorInput 
                                color={formData.color || '#10b981'} 
                                onChange={(newColor) => handleChange('color', newColor)} 
                                prefixed
                                className="border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-emerald-500 w-full uppercase"
                              />
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">צבע טקסט</label>
                  <div className="flex bg-gray-100 rounded-lg p-1 w-fit h-10">
                    <button 
                      onClick={() => handleChange('textColor', 'white')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${(!formData.textColor || formData.textColor === 'white') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      לבן
                    </button>
                    <button 
                      onClick={() => handleChange('textColor', 'black')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${formData.textColor === 'black' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      שחור
                    </button>
                  </div>
                </div>

              </div>
              

            </div>
          )}

          {formData.type === 'reminder' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">צבע רקע</label>
                <button 
                  onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                  className="w-16 h-10 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                  style={{ backgroundColor: formData.color || '#f59e0b' }}
                />
                <AnimatePresence>
                  {isColorPickerOpen && (
                    <>
                      <div className="fixed inset-0 z-[110]" onClick={() => setIsColorPickerOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none"
                      >
                        <div className="pointer-events-auto bg-white p-4 shadow-2xl rounded-2xl border border-gray-100 flex flex-col gap-4">
                          <HexColorPicker 
                            color={formData.color || '#f59e0b'} 
                            onChange={(newColor) => handleChange('color', newColor)} 
                          />
                          <div className="flex items-center gap-2" dir="ltr">
                            <span className="text-gray-500 text-sm font-semibold uppercase">HEX:</span>
                            <HexColorInput 
                              color={formData.color || '#f59e0b'} 
                              onChange={(newColor) => handleChange('color', newColor)} 
                              prefixed
                              className="border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-emerald-500 w-full uppercase"
                            />
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">צבע טקסט</label>
                  <div className="flex bg-gray-100 rounded-lg p-1 w-fit h-10">
                    <button 
                      onClick={() => handleChange('textColor', 'white')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${(!formData.textColor || formData.textColor === 'white') ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      לבן
                    </button>
                    <button 
                      onClick={() => handleChange('textColor', 'black')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${formData.textColor === 'black' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      שחור
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">תוכן התזכורת</label>
                <textarea 
                  rows={5} value={formData.notes || ''} onChange={e => handleChange('notes', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-3 min-h-[120px] focus:border-emerald-500 outline-none text-sm resize-y bg-transparent leading-relaxed" 
                  placeholder="הזן כאן את תוכן התזכורת..."
                />
              </div>
            </div>
          )}
          {formData.type !== 'day' && (
            <>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <label className="block text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider">תמונה (אופציונלי)</label>
              {formData.imageUrl ? (
                <div className="relative inline-block">
                  <img src={formData.imageUrl} alt="Uploaded" className="w-full max-w-[200px] h-auto rounded-lg border border-gray-200" />
                  <button 
                    onClick={() => handleChange('imageUrl', '')}
                    className="absolute -top-2 -right-2 bg-white text-gray-500 hover:text-red-500 rounded-full p-1 shadow-md border border-gray-200"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors w-fit text-sm text-gray-600 font-medium">
                  <ImageIcon size={18} className="text-gray-400" />
                  העלה תמונה
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <label className="block text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider">שדות דינמיים</label>
              <div className="space-y-3">
                {(formData.fields || []).map((f) => (
                  <div key={f.id} className={`flex flex-col gap-2 ${f.isLink ? 'p-2 bg-emerald-50/30 rounded-md border border-emerald-100/50' : ''}`}>
                    <div className="flex gap-2 items-center w-full">
                      <input 
                        value={f.label} onChange={(e) => updateField(f.id, 'label', e.target.value)}
                        placeholder="כותרת" className="flex-[0.4] min-w-0 border-b border-gray-200 py-1 text-sm outline-none focus:border-emerald-500 bg-transparent"
                      />
                      <input 
                        value={f.value} onChange={(e) => updateField(f.id, 'value', e.target.value)}
                        placeholder={f.isLink ? "טקסט שיוצג" : "ערך"} className="flex-[0.6] min-w-0 border-b border-gray-200 py-1 text-sm outline-none focus:border-emerald-500 bg-transparent"
                        dir="auto"
                      />
                      <button 
                        onClick={() => updateField(f.id, 'isLink', !f.isLink)} 
                        className={`p-1 rounded transition-colors shrink-0 ${f.isLink ? 'text-emerald-600 bg-emerald-100/70' : 'text-gray-400 hover:text-gray-600'}`}
                        title="הגדר כלינק"
                      >
                        <Link size={16} />
                      </button>
                      <button onClick={() => removeField(f.id)} className="text-gray-400 hover:text-red-500 p-1 shrink-0">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <AnimatePresence>
                      {f.isLink && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="pt-1 pb-1">
                            <input
                              value={f.linkUrl || ''} onChange={(e) => updateField(f.id, 'linkUrl', e.target.value)}
                              placeholder="קישור מלא (https://...)" className="w-full border-b border-emerald-200 py-1 text-sm outline-none focus:border-emerald-500 bg-transparent text-left placeholder-right text-gray-700"
                              dir="ltr"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                <button onClick={addField} className="text-emerald-600 text-sm font-medium flex items-center gap-1 hover:text-emerald-700 mt-2">
                  <Plus size={16} /> הוסף שדה
                </button>
              </div>
            </div>
            </>
          )}
        </div>
        
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
  );
}

// --- Main App ---


const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function App() {
  const [days, setDays] = useState<TimelineItem[]>([]);
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

  
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [deletingDayId, setDeletingDayId] = useState<string | null>(null);

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const processLoadedData = (loadedDays: TimelineItem[], loadedTitle: string) => {
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

  const syncData = async (newTitle: string, newDays: TimelineItem[]) => {
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
      const safeDays = JSON.parse(JSON.stringify(computedDays));
      await setDoc(docRef, { title: newTitle || '', days: safeDays }, { merge: true });
    } else {
      localStorage.setItem('itinerary_main', JSON.stringify({ title: newTitle, days: computedDays }));
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setIsEditingTitle(false);
    syncData(newTitle, days);
  };

  
    const handleAddClick = (type: 'day' | 'ticket' | 'reminder') => {
    let nextDateStr = '';
    let inheritedAccommodation = { ...emptyItem };
    
    if (days.length > 0) {
      const sortedDays = [...days]
        .filter(d => d.date)
        .sort((a, b) => a.date.localeCompare(b.date));
        
      if (sortedDays.length > 0) {
        const lastDay = sortedDays[sortedDays.length - 1];
        
        const lastDate = new Date(lastDay.date);
        if (!isNaN(lastDate.getTime())) {
          if (type === 'day') lastDate.setDate(lastDate.getDate() + 1);
          nextDateStr = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}-${String(lastDate.getDate()).padStart(2, '0')}`;
        }
        
        if (type === 'day' && lastDay.hotelName && (lastDay.nightNumber || 0) < (lastDay.totalNights || 1)) {
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

    setEditingItem({
      ...inheritedAccommodation,
      type,
      color: type === 'ticket' ? '#10b981' : type === 'reminder' ? '#fef3c7' : undefined,
      
      fields: type === 'ticket' ? [] : undefined,
      notes: type === 'reminder' ? '' : undefined,
      date: nextDateStr
    });
    setIsAddMenuOpen(false);
  };
  
  const toggleDay = (id: string) => {
    setExpandedDayId(prev => prev === id ? null : id);
  };

  const handleSaveDay = (savedDay: TimelineItem) => {
    let newDays;
    if (savedDay.id) {
      newDays = days.map(d => d.id === savedDay.id ? savedDay : d);
    } else {
      const newDay = { ...savedDay, id: Date.now().toString() };
      newDays = [...days, newDay];
    }
    
    newDays.sort((a, b) => {
      const dateCompare = (a.date || '').localeCompare(b.date || '');
      if (dateCompare !== 0) return dateCompare;
      const typeOrder = { day: 1, ticket: 2, reminder: 3 };
      return (typeOrder[a.type || 'day'] || 1) - (typeOrder[b.type || 'day'] || 1);
    });
    
    syncData(tripTitle, newDays);
    setEditingItem(null);
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
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
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
          <div className={`w-full ${editingItem ? 'hidden lg:block lg:w-3/5' : ''} lg:w-3/5 lg:border-l border-gray-200 overflow-y-auto p-4 sm:p-6 space-y-4 pb-32`}>
             <div className="max-w-2xl mx-auto relative pr-12 mt-2">
                {/* Vertical Line */}
                <div className="absolute top-8 bottom-4 right-[1rem] w-px bg-gray-200 z-0" />
                
                {days.map((day, index) => {
                  const isDay = !day.type || day.type === 'day';
                  const isTicket = day.type === 'ticket';
                  const isReminder = day.type === 'reminder';
                  const isDarkText = day.textColor === 'black';
                  
                  // Compute the day number (only count actual days up to this index)
                  const dayNumber = days.slice(0, index + 1).filter(d => !d.type || d.type === 'day').length;
                  
                  return (
                    <div key={day.id} className={`relative z-10 ${day.isPast ? 'opacity-70' : ''}`} ref={day.isCurrent ? currentDayRef : null}>
                      {/* Stepper Dot */}
                      {day.isCurrent && isDay ? (
                        <CurrentDayStepper />
                      ) : (
                        <div 
                          className={`absolute top-4 z-10 rounded-full border-4 border-[#F9FAFB] flex items-center justify-center transition-colors duration-300 ${
                            isDay 
                              ? 'w-10 h-10 -right-[52.4px] bg-gray-100 text-gray-400' 
                              : `w-8 h-8 -right-[48.4px] -mt-[14px] ${isDarkText ? 'text-gray-900' : 'text-white'}`
                          }`}
                          style={!isDay ? { backgroundColor: day.color || (isTicket ? '#10b981' : '#f59e0b') } : {}}
                        >
                           {isDay ? (
                             <span className="text-xs font-bold">{dayNumber < 10 ? `0${dayNumber}` : dayNumber}</span>
                           ) : isTicket ? (
                             <Ticket size={14} />
                           ) : (
                             <Bell size={14} />
                           )}
                        </div>
                      )}
                      
                      <SwipeableCard 
                        day={day}
                        index={dayNumber > 0 ? dayNumber - 1 : 0}
                        isExpanded={expandedDayId === day.id}
                        onToggle={() => toggleDay(day.id)}
                        onEdit={setEditingItem}
                        onDeleteRequest={setDeletingDayId}
                      />
                    </div>
                  );
                })}
                
                {days.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    אין ימים במסלול עדיין. הוסף יום חדש!
                  </div>
                )}
             </div>
          </div>

          {/* Edit Panel */}
          <AnimatePresence>
            {editingItem && (
              <EditModal 
                key="edit-modal"
                day={editingItem} 
                onClose={() => setEditingItem(null)} 
                onSave={handleSaveDay} 
              />
            )}
          </AnimatePresence>
          
          {/* Floating Action Button */}
          {!editingItem && (
            <>
               <AnimatePresence>
                 {isAddMenuOpen && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 20 }}
                     className="fixed bottom-24 left-1/2 -translate-x-1/2 lg:left-auto lg:right-[30%] lg:translate-x-1/2 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden min-w-[180px] z-[65] flex flex-col"
                   >
                     <button onClick={(e) => { e.stopPropagation(); handleAddClick('day'); }} className="w-full text-right px-4 py-4 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-3 transition-colors">
                       <Calendar size={18} className="text-emerald-500" />
                       יום חדש
                     </button>
                     <button onClick={(e) => { e.stopPropagation(); handleAddClick('ticket'); }} className="w-full text-right px-4 py-4 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-3 transition-colors border-t border-gray-50">
                       <Ticket size={18} className="text-blue-500" />
                       כרטיס חדש
                     </button>
                     <button onClick={(e) => { e.stopPropagation(); handleAddClick('reminder'); }} className="w-full text-right px-4 py-4 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-3 transition-colors border-t border-gray-50">
                       <Bell size={18} className="text-amber-500" />
                       תזכורת חדשה
                     </button>
                   </motion.div>
                 )}
               </AnimatePresence>
               {isAddMenuOpen && (
                 <div className="fixed inset-0 z-[60] bg-black/5" onClick={() => setIsAddMenuOpen(false)} />
               )}
               
               <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:left-auto lg:right-[30%] lg:translate-x-1/2 z-[65]">
                 <button 
                   onClick={(e) => { e.stopPropagation(); setIsAddMenuOpen(!isAddMenuOpen); }}
                   className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-emerald-700 font-bold transition-all duration-200 ease-in-out active:scale-95"
                 >
                    <Plus size={20} strokeWidth={3} className={isAddMenuOpen ? "rotate-45 transition-transform" : "transition-transform"} />
                    <span>הוספה</span>
                 </button>
               </div>
            </>
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
