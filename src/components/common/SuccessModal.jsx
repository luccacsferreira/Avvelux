import React from 'react';
import { Check } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion } from 'motion/react';
import { useTheme } from '@/lib/theme';

const SuccessModal = ({ 
  open, 
  onOpenChange, 
  title = "Profile Updated!", 
  message = "Your changes have been saved successfully.",
  buttonText = "Got it"
}) => {
  const { isLight } = useTheme();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-md ${isLight ? 'bg-white border-gray-200' : 'bg-[#1a1a1a] border-gray-800'} p-0 overflow-hidden`}>
        <div className="p-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center mb-6"
          >
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </motion.div>
          
          <h2 className={`text-2xl font-bold mb-2 ${isLight ? 'text-black' : 'text-white'}`}>{title}</h2>
          <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} mb-8`}>{message}</p>
          
          <button
            onClick={() => onOpenChange(false)}
            className={`w-full py-3 rounded-xl font-bold transition-all border ${
              isLight 
                ? 'bg-gray-100 hover:bg-gray-200 text-black border-gray-200' 
                : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
            }`}
          >
            {buttonText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
