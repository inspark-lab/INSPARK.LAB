import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-500 bg-opacity-75 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-deep-100 w-full max-w-2xl rounded-lg shadow-xl border border-deep-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-deep-200 bg-deep-500 rounded-t-lg">
          <h2 className="text-xl font-medium text-deep-100">{title}</h2>
          <button 
            onClick={onClose}
            className="text-deep-200 hover:text-deep-100 transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;