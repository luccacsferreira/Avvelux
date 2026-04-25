import React from 'react';
import { useTheme } from '@/lib/theme';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from 'lucide-react';

export default function SuccessModal({ isOpen, onClose, title, message }) {
  const { isLight } = useTheme();
  
  const bgColor = isLight ? 'bg-white' : 'bg-[#1a1a1a]';
  const textColor = isLight ? 'text-black' : 'text-white';
  const borderColor = isLight ? 'border-gray-200' : 'border-gray-800';
  const textMuted = isLight ? 'text-gray-600' : 'text-gray-400';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[425px] ${bgColor} ${textColor} ${borderColor}`}>
        <DialogHeader className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 text-green-500">
            <CheckCircle2 size={64} />
          </div>
          <DialogTitle className={`text-2xl font-bold ${textColor}`}>
            {title || 'Success!'}
          </DialogTitle>
          <DialogDescription className={`${textMuted} mt-2`}>
            {message || 'Your action was completed successfully.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center mt-4">
          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 font-bold"
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
