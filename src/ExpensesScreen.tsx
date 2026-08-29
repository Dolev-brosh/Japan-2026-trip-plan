import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Plus, X, Trash2 } from 'lucide-react';

export interface Expense {
  id: string;
  date: string;
  title: string;
  amountYen: number;
  category: string;
  notes?: string;
}

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

  const JPY_TO_ILS = 0.025;

  const totalYen = expenses.reduce((sum, e) => sum + e.amountYen, 0);
  const totalIls = totalYen * JPY_TO_ILS;

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
    acc[e.category] = (acc[e.category] || 0) + e.amountYen;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .map(([category, amount]) => ({ category, amount }));

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
                              <div className="font-medium text-gray-900 text-base">¥{expense.amountYen.toLocaleString()}</div>
                              <div className="text-xs text-gray-400 font-medium">₪{(expense.amountYen * JPY_TO_ILS).toFixed(2)}</div>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); onDeleteExpense(expense.id); }}
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
            {sortedCategories.map(({ category, amount }) => {
              const { emoji, label } = parseCategory(category);
              const numAmount = Number(amount);
              const percentage = totalYen > 0 ? (numAmount / totalYen) * 100 : 0;
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
                      <div className="font-medium text-gray-900 text-sm">¥{numAmount.toLocaleString()}</div>
                      <div className="text-[11px] text-gray-400 font-medium">₪{(numAmount * JPY_TO_ILS).toFixed(2)}</div>
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
          <div className="font-medium text-gray-900 text-lg leading-none mb-1">¥{totalYen.toLocaleString()}</div>
          <div className="font-bold text-emerald-600 text-sm leading-none">₪{totalIls.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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
    </div>
  );
};

const ExpenseModal = ({ expense, onClose, onSave }: { expense: Expense, onClose: () => void, onSave: (e: Expense) => void }) => {
  const [formData, setFormData] = useState<Expense>(expense);

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
          <button onClick={onClose} className="text-sm text-gray-400 font-medium hover:text-emerald-600 transition-colors">ביטול</button>
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
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">סכום (¥)</label>
              <input 
                type="number"
                value={formData.amountYen || ''} onChange={e => setFormData({...formData, amountYen: Number(e.target.value)})}
                className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm font-bold bg-transparent" 
                placeholder="0"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">תאריך</label>
              <input 
                type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none text-sm bg-transparent" 
              />
            </div>
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
            onClick={() => onSave(formData)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-md transition-all active:scale-95"
          >
            שמור שינויים
          </button>
        </div>
      </motion.div>
    </div>
  );
};
