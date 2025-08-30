import React from 'react';
import { Signal, ChatMessage, Theme } from '../types';
import LivePrice from './LivePrice';
import { PriceChart } from './PriceChart';
import TechnicalIndicators from './TechnicalIndicators';
import ChatInterface from './ChatInterface';
import TechnicalAnalysisWidget from './TechnicalAnalysisWidget';
import FundamentalDataWidget from './FundamentalDataWidget';

const SignalPriceBox: React.FC<{ label: string; value: string; color: 'green' | 'red' | 'blue' }> = React.memo(({ label, value, color }) => {
    const colors = {
        green: 'bg-success-soft text-success',
        red: 'bg-danger-soft text-danger',
        blue: 'bg-accent-soft text-accent',
    }
    return (
        <div className={`flex-1 p-3 rounded-lg text-center ${colors[color]}`}>
            <p className="text-sm font-semibold opacity-80">{label}</p>
            <p className="text-lg font-bold">{value}</p>
        </div>
    )
});

const ConfidenceBar: React.FC<{ score: number }> = React.memo(({ score }) => (
    <div className="bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border">
        <div className="flex justify-between items-center mb-1">
            <h4 className="font-semibold text-text-main dark:text-dark-text-main">Confidence</h4>
            <span className="font-bold text-accent">{score}%</span>
        </div>
        <div className="w-full bg-background dark:bg-dark-background rounded-full h-2.5 border border-border dark:border-dark-border">
            <div className="bg-accent h-2 rounded-full" style={{ width: `${score}%` }}></div>
        </div>
    </div>
));

const StrategyAnalysis: React.FC<{signal: Signal}> = React.memo(({signal}) => {
    const renderTextWithCitations = (text: string) => {
        if (!text) return null;
        const parts = text.split(/(\[\d+(?:,\s*\d+)*\])/g);
        
        return parts.map((part, index) => {
            if (/^\[\d+(?:,\s*\d+)*\]$/.test(part)) {
                const numbers = part.slice(1, -1).split(',').map(n => n.trim());
                
                return (
                    <span key={index}>
                        {'['}
                        {numbers.map((numStr, numIndex) => {
                            const citationNumber = parseInt(numStr, 10);
                            if (isNaN(citationNumber)) {
                                 return (
                                    <React.Fragment key={numIndex}>
                                        {numStr}
                                        {numIndex < numbers.length - 1 && ', '}
                                    </React.Fragment>
                                );
                            }

                            const sourceIndex = citationNumber - 1;
                            const source = signal.sources && signal.sources[sourceIndex];

                            if (source) {
                                return (
                                    <React.Fragment key={numIndex}>
                                        <a 
                                            href={source.uri}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={`View source: ${source.title} (opens in new tab)`}
                                            className="inline-block text-accent font-semibold hover:underline decoration-dotted"
                                            aria-label={`View data source ${citationNumber}: ${source.title}`}
                                        >
                                            {numStr}
                                        </a>
                                        {numIndex < numbers.length - 1 && ', '}
                                    </React.Fragment>
                                );
                            }
                            
                            return (
                                <React.Fragment key={numIndex}>
                                    {numStr}
                                    {numIndex < numbers.length - 1 && ', '}
                                </React.Fragment>
                            );
                        })}
                        {']'}
                    </span>
                );
            }
            return <React.Fragment key={index}>{part}</React.Fragment>;
        });
    };
    
    return(
        <div className="bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border space-y-4">
            <h3 className="font-bold text-lg text-text-main dark:text-dark-text-main">Strategy Analysis Description:</h3>
            
            <div className="text-text-muted dark:text-dark-text-muted space-y-3 text-sm leading-relaxed whitespace-pre-line max-h-72 overflow-y-auto pr-2">
                <p>{renderTextWithCitations(signal.strategyDescription)}</p>

                <h4 className="font-semibold text-text-main dark:text-dark-text-main pt-2">Risk Tip:</h4>
                <p>{renderTextWithCitations(signal.riskTip)}</p>
            </div>
        </div>
    );
});

const StatusBadge: React.FC<{ status: 'Live' | 'Expired' }> = React.memo(({ status }) => {
    const isLive = status === 'Live';
    const colorClasses = isLive ? 'bg-success-soft text-success' : 'bg-card dark:bg-dark-card text-text-muted dark:text-dark-text-muted';
    const dotClasses = isLive ? 'bg-success animate-pulse' : 'bg-text-muted dark:bg-dark-text-muted';
    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${colorClasses}`}>
            <div className={`w-2 h-2 rounded-full ${dotClasses}`}></div>
            {status}
        </div>
    );
});


interface SignalCardProps {
  signal: Signal;
  isInteractive?: boolean;
  chatHistory?: ChatMessage[];
  isChatLoading?: boolean;
  chatError?: string | null;
  onSendMessage?: (message: string) => void;
  theme: Theme;
}

const SignalCard: React.FC<SignalCardProps> = ({ 
    signal, 
    isInteractive = false,
    chatHistory,
    isChatLoading,
    chatError,
    onSendMessage,
    theme
 }) => {
  const isSell = signal.direction.toUpperCase() === 'SELL';
  const updateDate = new Date(signal.updateTime).toLocaleDateString(undefined, {
      month: '2-digit', day: '2-digit', year: 'numeric'
  });
  const updateTime = new Date(signal.updateTime).toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="space-y-4">
        <PriceChart signal={signal} theme={theme} />

        {signal.status === 'Live' && <LivePrice assetName={signal.assetName} theme={theme} />}

        <div className="bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border space-y-4">
             <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-xl text-text-main dark:text-dark-text-main">{signal.assetName}</h3>
                    <p className="font-bold text-text-main dark:text-dark-text-main">Direction: <span className={isSell ? 'text-danger' : 'text-success'}>{isSell ? 'sell' : 'buy'}</span></p>
                    <p className="text-xs text-text-muted dark:text-dark-text-muted">Update: {updateTime} {updateDate}</p>
                </div>
                <StatusBadge status={signal.status} />
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                 <SignalPriceBox label="Entry" value={signal.entryPrice} color="blue" />
                 <SignalPriceBox label="TP1" value={signal.tp1} color="green" />
                 <SignalPriceBox label="TP2" value={signal.tp2} color="green" />
                 <SignalPriceBox label="SL" value={signal.sl} color="red" />
             </div>
        </div>
        
        <ConfidenceBar score={signal.confidence} />

        {isInteractive && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TechnicalAnalysisWidget key={`${signal.assetName}-tech`} assetName={signal.assetName} theme={theme} />
                <FundamentalDataWidget key={`${signal.assetName}-fund`} assetName={signal.assetName} theme={theme} />
            </div>
        )}

        {signal.rsi && signal.pivotPoints && signal.sma && (
            <TechnicalIndicators
                rsi={signal.rsi}
                pivotPoints={signal.pivotPoints}
                sma={signal.sma}
            />
        )}

        <StrategyAnalysis signal={signal} />
       
       {signal.sources && signal.sources.length > 0 && (
         <div className="pt-2">
            <h4 className="font-semibold text-sm mb-2 text-text-muted dark:text-dark-text-muted">Data Sources</h4>
            <div className="flex flex-wrap gap-2">
                {signal.sources.map((source, index) => (
                    <a 
                        key={index} 
                        id={`source-${index + 1}`}
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs bg-card dark:bg-dark-card text-accent px-3 py-1 rounded-full hover:bg-border dark:hover:bg-dark-border transition-colors"
                    >
                        [{index + 1}] {source.title}
                    </a>
                ))}
            </div>
         </div>
       )}

       {isInteractive && onSendMessage && (
            <ChatInterface 
                history={chatHistory || []}
                isLoading={!!isChatLoading}
                error={chatError || null}
                onSendMessage={onSendMessage}
            />
       )}
    </div>
  );
};

export default React.memo(SignalCard);