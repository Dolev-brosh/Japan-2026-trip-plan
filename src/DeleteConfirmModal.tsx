import React from 'react';
import { motion } from 'motion/react';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "מחיקת פריט",
  message = "האם את/ה בטוח/ה שברצונך למחוק פריט זה? פעולה זו תסיר את כל המידע השמור ולא ניתן לשחזרו."
}: DeleteConfirmModalProps) => {
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
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-8 leading-relaxed">{message}</p>
        
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors">ביטול</button>
          <button onClick={onConfirm} className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 transition-colors">מחיקה</button>
        </div>
      </motion.div>
    </div>
  );
};
