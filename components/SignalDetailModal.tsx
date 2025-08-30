import React, { useEffect } from 'react';
import { Signal, Theme } from '../types';
import SignalCard from './SignalCard';

interface SignalDetailModalProps {
    signal: Signal;
    onClose: () => void;
    theme: Theme;
}

const SignalDetailModal: React.FC<SignalDetailModalProps> = ({ signal, onClose, theme }) => {
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="signal-modal-title"
        >
            <div 
                className="bg-background dark:bg-dark-background rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-border dark:border-dark-border shadow-2xl"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                <div className="sticky top-0 bg-background/80 dark:bg-dark-background/80 backdrop-blur-sm z-10 p-4 md:p-6 border-b border-border dark:border-dark-border">
                    <div className="flex justify-between items-center">
                        <h2 id="signal-modal-title" className="text-xl font-bold text-text-main dark:text-dark-text-main">Signal Details</h2>
                        <button 
                            onClick={onClose} 
                            className="p-2 rounded-full text-text-muted dark:text-dark-text-muted hover:bg-card dark:hover:bg-dark-card transition-colors"
                            aria-label="Close signal details"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="p-4 md:p-6">
                    <SignalCard signal={signal} theme={theme} />
                </div>
            </div>
        </div>
    );
};

export default SignalDetailModal;