import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Plus, X, Trash2 } from 'lucide-react';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export interface Expense {
  id: string;
  date: string;
  title: string;
  category: string;
  notes?: string;
  originalAmount?: number;
  currency?: 'JPY' | 'USD' | 'ILS';
  lockedAmountILS?: number;
  amountYen?: number;
}

export const getOriginalAmount = (e: Expense) => e.originalAmount ?? e.amountYen ?? 0;
export const getCurrency = (e: Expense) => e.currency ?? 'JPY';
export const getLockedILS = (e: Expense) => e.lockedAmountILS ?? ((e.amountYen || 0) * 0.025);
export const getCurrencySymbol = (c: string) => c === 'USD' ? '$' : c === 'ILS' ? '₪' : '¥';

export const CATEGORIES = [
  '✈️ טיסה', '🚆 תחבורה', '🚗 השכרת רכב', '🏨 לינה', '🍔 אוכל ושתייה', 
  '🏪 סופרמרקטים', '🎡 אטרקציות', '🛍️ שופינג', '🧳 לוגיסטיקה', '📶 תקשורת', '❓ שונות'
];

interface ExpensesScreenProps {
  expenses: Expense[];
  onSaveExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpensesScreen: React.FC<ExpensesScreenProps> = ({ expenses, onSaveExpense, onDeleteExpense }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const JPY_TO_ILS = 0.025;

  const totalIls = expenses.reduce((sum, e) => sum + getLockedILS(e), 0);

  // Group by date
  const groupedExpenses = expenses.reduce((acc, expense) => {
    if (!acc[expense.date]) acc[expense.date] = [];
    acc[expense.date].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);

  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => a.localeCompare(b));

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const parseCategory = (cat: string) => {
    const match = cat.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)\s*(.*)$/u);
    if (match) return { emoji: match[1], label: match[2] };
    return { emoji: '❓', label: cat };
  };

  const handleSaveExpense = (expense: Expense) => {
    onSaveExpense(expense);
    setIsModalOpen(false);
  };

  // Analytics
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + getLockedILS(e);
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .map(([category, amount]) => ({ category, amountILS: amount }));

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB] relative overflow-hidden" dir="rtl">
      {/* Segmented Control */}
      <div className="px-6 mb-4 mt-6 shrink-0">
        <div className="flex bg-gray-200/50 p-1 rounded-2xl relative">
          <button 
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all z-10 ${activeTab === 'list' ? 'text-white' : 'text-gray-500'}`}
            onClick={() => setActiveTab('list')}
          >
            רשימה
          </button>
          <button 
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all z-10 ${activeTab === 'analytics' ? 'text-white' : 'text-gray-500'}`}
            onClick={() => setActiveTab('analytics')}
          >
            פילוח
          </button>
          
          <div 
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-emerald-500 rounded-xl transition-all duration-300 shadow-sm"
            style={{ right: activeTab === 'list' ? '4px' : 'calc(50%)' }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        {activeTab === 'list' ? (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date}>
                <div className="text-right text-xs font-bold text-gray-400 mb-3">{formatDate(date)}</div>
                <div className="space-y-3">
                  {groupedExpenses[date].map((expense, idx) => {
                    const { emoji, label } = parseCategory(expense.category);
                    return (
                      <div key={expense.id} className="relative w-full rounded-[16px] overflow-hidden bg-white border border-gray-200 transition-colors duration-300 text-gray-700">
                        <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => { setEditingExpense(expense); setIsModalOpen(true); }}>
                          <div className="flex gap-4 items-center flex-1">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-xl shrink-0">
                              {emoji}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-[15px]">{expense.title}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-left">
                              <div className="font-medium text-gray-900 text-base">{getCurrencySymbol(getCurrency(expense))}{getOriginalAmount(expense).toLocaleString()}</div>
                              <div className="text-xs text-gray-400 font-medium">₪{getLockedILS(expense).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(expense.id); }}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCategories.map(({ category, amountILS }) => {
              const { emoji, label } = parseCategory(category);
              const numAmount = Number(amountILS);
              const percentage = totalIls > 0 ? (numAmount / totalIls) * 100 : 0;
              return (
                <div key={category} className="relative w-full rounded-[16px] overflow-hidden bg-white border border-gray-200 transition-colors duration-300 text-gray-700 p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-lg shrink-0">
                        {emoji}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-[15px]">{label}</div>
                        <div className="text-[11px] text-gray-400 font-medium">{percentage.toFixed(0)}% מהסך הכל</div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 text-sm">₪{numAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                      <div className="text-[11px] text-gray-400 font-medium">₪{numAmount.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-8 flex justify-between items-center z-20">
        <button 
          onClick={() => {
            setEditingExpense({
              id: Date.now().toString(),
              date: new Date().toISOString().split('T')[0],
              title: '',
              amountYen: 0,
              category: CATEGORIES[4] // Default to food
            });
            setIsModalOpen(true);
          }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-3.5 rounded-full flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Plus size={18} />
          הוספת הוצאה
        </button>
        <div className="text-left">
          <div className="text-[10px] font-bold text-gray-400 mb-0.5">סה״כ</div>
          <div className="font-medium text-gray-900 text-lg leading-none mb-1">₪{totalIls.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && editingExpense && (
          <ExpenseModal 
            key="expense-modal"
            expense={editingExpense} 
            onClose={() => setIsModalOpen(false)} 
            onSave={handleSaveExpense} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirmId && (
          <DeleteConfirmModal 
            isOpen={true} 
            onClose={() => setDeleteConfirmId(null)} 
            onConfirm={() => {
              onDeleteExpense(deleteConfirmId);
              setDeleteConfirmId(null);
            }}
            title="מחיקת הוצאה"
            message="האם אתה בטוח שברצונך למחוק הוצאה זו? פעולה זו בלתי הפיכה ויורדת מסך ההוצאות הכללי."
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ExpenseModal = ({ expense, onClose, onSave }: { key?: string, expense: Expense, onClose: () => void, onSave: (e: Expense) => void }) => {
  const [formData, setFormData] = useState<Expense>({
    ...expense,
    originalAmount: getOriginalAmount(expense),
    currency: getCurrency(expense)
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    let finalLockedILS = formData.lockedAmountILS;

    try {
      const amt = formData.originalAmount || 0;
      const cur = formData.currency || 'JPY';
      
      if (cur === 'ILS') {
        finalLockedILS = amt;
      } else if (!formData.id || formData.originalAmount !== getOriginalAmount(expense) || formData.currency !== getCurrency(expense) || !formData.lockedAmountILS) {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/ILS');
        const data = await res.json();
        const rate = data.rates[cur];
        if (rate) {
          finalLockedILS = amt / rate;
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversion rate', err);
      if (formData.currency === 'JPY') finalLockedILS = (formData.originalAmount || 0) * 0.025;
      if (formData.currency === 'USD') finalLockedILS = (formData.originalAmount || 0) * 3.7;
    }

    onSave({
      ...formData,
      lockedAmountILS: finalLockedILS,
      amountYen: formData.originalAmount
    });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6" dir="rtl">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.95 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full sm:max-w-md max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10"
      >
        <div className="p-6 flex justify-between items-center border-b border-gray-100 shrink-0 bg-white">
          <h2 className="text-xl font-black text-gray-900">
            {expense.title ? 'עריכת הוצאה' : 'הוצאה חדשה'}
          </h2>
          <button onClick={onClose} disabled={isSaving} className="text-sm text-gray-400 font-medium hover:text-emerald-600 transition-colors">ביטול</button>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-5 bg-white">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">כותרת</label>
            <input 
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
              placeholder="איפה קנית?"
            />
          </div>
          
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">סכום</label>
            <div className="flex gap-2 w-full">
              <select 
                value={formData.currency || 'JPY'} 
                onChange={e => setFormData({...formData, currency: e.target.value as any})}
                className="w-16 border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm font-bold bg-transparent"
                dir="ltr"
              >
                <option value="JPY">¥</option>
                <option value="USD">$</option>
                <option value="ILS">₪</option>
              </select>
              <input 
                type="number"
                value={formData.originalAmount || ''} onChange={e => setFormData({...formData, originalAmount: Number(e.target.value)})}
                className="flex-1 border-b border-gray-200 py-2 focus:border-emerald-500 outline-none min-w-0 text-sm font-bold bg-transparent" 
                placeholder="0"
                dir="ltr"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">תאריך</label>
            <input 
              type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
              className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">קטגוריה</label>
            <select
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full border border-gray-200 py-3 px-3 rounded-xl focus:border-emerald-500 outline-none text-sm bg-gray-50/50"
            >
              <option value="" disabled>בחר קטגוריה</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">הערות</label>
            <textarea 
              value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full border border-gray-200 rounded-xl p-3 focus:border-emerald-500 outline-none text-sm bg-transparent min-h-[80px]" 
              placeholder="פרטים נוספים..."
            />
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0">
          <button 
            disabled={isSaving}
            onClick={handleSave}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-md transition-all active:scale-95"
          >
            {isSaving ? 'שומר...' : 'שמור שינויים'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
