import React from 'react';
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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] text-white border-gray-800">
        <DialogHeader className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 text-green-500">
            <CheckCircle2 size={64} />
          </div>
          <DialogTitle className="text-2xl font-bold">
            {title || 'Success!'}
          </DialogTitle>
          <DialogDescription className="text-gray-400 mt-2">
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
