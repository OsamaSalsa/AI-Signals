import React from 'react';
import { Signal } from '../types';

interface SignalHistoryItemProps {
    signal: Signal;
    onClick: () => void;
}

const SignalHistoryItem: React.FC<SignalHistoryItemProps> = ({ signal, onClick }) => {
    const isSell = signal.direction.toUpperCase() === 'SELL';
    const isLive = signal.status === 'Live';

    return (
        <div 
            onClick={onClick}
            className="bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border cursor-pointer hover:border-accent dark:hover:border-accent transition-colors duration-200"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
            aria-label={`View details for ${signal.direction} signal on ${signal.assetName}`}
        >
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
                <div className="md:col-span-1">
                    <p className="font-bold text-lg text-text-main dark:text-dark-text-main truncate" title={signal.assetName}>{signal.assetName}</p>
                    <p className={`font-semibold text-base ${isSell ? 'text-danger' : 'text-success'}`}>{isSell ? 'SELL' : 'BUY'}</p>
                </div>
                <div className="md:col-span-2 text-sm text-text-muted dark:text-dark-text-muted grid grid-cols-2 gap-x-4">
                    <p><span className="font-semibold text-text-main/80 dark:text-dark-text-main/80">Entry:</span> {signal.entryPrice}</p>
                    <p><span className="font-semibold text-text-main/80 dark:text-dark-text-main/80">TP1:</span> {signal.tp1}</p>
                    <p><span className="font-semibold text-text-main/80 dark:text-dark-text-main/80">SL:</span> {signal.sl}</p>
                     <p><span className="font-semibold text-text-main/80 dark:text-dark-text-main/80">TP2:</span> {signal.tp2}</p>
                </div>
                 <div className="md:col-span-1 text-sm text-center">
                    <p className="font-semibold text-text-main dark:text-dark-text-main">Confidence</p>
                    <p className="font-bold text-lg text-accent">{signal.confidence}%</p>
                </div>
                <div className="col-span-2 md:col-span-1 flex flex-col items-end text-right">
                    <p className="text-xs text-text-muted dark:text-dark-text-muted">{new Date(signal.updateTime).toLocaleString()}</p>
                    <div className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-semibold mt-2 ${isLive ? 'bg-success-soft text-success' : 'bg-card dark:bg-dark-card text-text-muted dark:text-dark-text-muted border border-border dark:border-dark-border'}`}>
                        <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-success animate-pulse' : 'bg-text-muted dark:bg-dark-text-muted'}`}></div>
                        {signal.status}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(SignalHistoryItem);