import React, { useState, useCallback } from 'react';
import { Signal, View } from '../types';
import { generateMarketBriefing } from '../services/geminiService';

const MarketBriefingLoader: React.FC = React.memo(() => (
    <div className="flex justify-center items-center h-24 overflow-hidden" aria-label="Loading market briefing...">
        <div className="w-6 h-6 border-4 border-t-accent border-r-accent border-card/50 dark:border-dark-card/50 rounded-full animate-spin"></div>
    </div>
));

const HeroIllustration: React.FC = React.memo(() => (
    <svg width="100%" height="100%" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
            <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#0A192F" stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="green-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" />
                <stop offset="100%" stopColor="#16A34A" />
            </linearGradient>
            <linearGradient id="red-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>

        {/* Background Grid */}
        <path d="M0 75 H400 M0 150 H400 M0 225 H400 M100 0 V300 M200 0 V300 M300 0 V300" className="stroke-card dark:stroke-dark-card" strokeWidth="1"/>
        
        {/* Central Pulsing AI Core */}
        <circle cx="200" cy="150" r="100" fill="url(#grad1)" className="animate-pulse-bg hidden dark:block" />
        <circle cx="200" cy="150" r="10" fill="#93C5FD" filter="url(#glow)" className="animate-pulse-dot" />

        {/* Floating Currency Symbols */}
        <g fontFamily="Inter, sans-serif" fontSize="24" fontWeight="bold" className="fill-text-muted dark:fill-dark-text-muted opacity-60">
            <text x="50" y="100" className="animate-float-up" style={{animationDelay: '0s'}}>€</text>
            <text x="320" y="80" className="animate-float-up" style={{animationDelay: '-1s'}}>$</text>
            <text x="80" y="240" className="animate-float-up" style={{animationDelay: '-2s'}}>£</text>
            <text x="350" y="210" className="animate-float-up" style={{animationDelay: '-3s'}}>¥</text>
        </g>
        
        {/* Bullish Candlestick Chart */}
        <g transform="translate(40, 150)">
            <path d="M0,0 C30,-40 60,-40 90,0" className="stroke-border dark:stroke-dark-border" strokeWidth="2" fill="none" />
            <g className="animate-pulse-candle" style={{transformOrigin: '50% 100%'}}>
                <line x1="20" y1="-25" x2="20" y2="15" stroke="#22C55E" strokeWidth="2" className="animate-pulse-wick" style={{transformOrigin: 'center'}} />
                <rect x="10" y="-15" width="20" height="20" fill="url(#green-grad)" />
            </g>
             <g className="animate-pulse-candle" style={{transformOrigin: '50% 100%', animationDelay: '-0.5s'}}>
                <line x1="60" y1="-50" x2="60" y2="20" stroke="#22C55E" strokeWidth="2" className="animate-pulse-wick" style={{transformOrigin: 'center'}}/>
                <rect x="50" y="-30" width="20" height="40" fill="url(#green-grad)" />
            </g>
        </g>
        
        {/* Bearish Candlestick Chart */}
        <g transform="translate(270, 120)">
            <path d="M0,0 C30,40 60,40 90,0" className="stroke-border dark:stroke-dark-border" strokeWidth="2" fill="none" />
            <g className="animate-pulse-candle" style={{transformOrigin: '50% 0%'}}>
                <line x1="25" y1="-10" x2="25" y2="40" stroke="#EF4444" strokeWidth="2" className="animate-pulse-wick" style={{transformOrigin: 'center'}} />
                <rect x="15" y="10" width="20" height="20" fill="url(#red-grad)" />
            </g>
             <g className="animate-pulse-candle" style={{transformOrigin: '50% 0%', animationDelay: '-0.5s'}}>
                <line x1="65" y1="-20" x2="65" y2="55" stroke="#EF4444" strokeWidth="2" className="animate-pulse-wick" style={{transformOrigin: 'center'}}/>
                <rect x="55" y="0" width="20" height="35" fill="url(#red-grad)" />
            </g>
        </g>
    </svg>
));

const MarketBriefing: React.FC = React.memo(() => {
    const [briefing, setBriefing] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateBriefing = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setBriefing('');
        try {
            const briefingText = await generateMarketBriefing();
            setBriefing(briefingText);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return <MarketBriefingLoader />;
        }
        if (error) {
            return (
                <div role="alert" className="text-danger text-center py-4">
                    <p className="font-semibold">Failed to load briefing</p>
                    <p className="text-sm mb-4">{error}</p>
                    <button onClick={handleGenerateBriefing} className="bg-accent text-white font-semibold rounded-lg px-6 py-2 hover:bg-accent-hover transition-colors">
                        Try Again
                    </button>
                </div>
            );
        }
        if (briefing) {
            return <p className="text-text-muted dark:text-dark-text-muted leading-relaxed">{briefing}</p>;
        }
        return (
            <div className="text-center py-4">
                <p className="text-text-muted dark:text-dark-text-muted mb-4">Get a real-time overview of the global financial market sentiment.</p>
                <button onClick={handleGenerateBriefing} className="bg-accent text-white font-semibold rounded-lg px-6 py-2 hover:bg-accent-hover transition-colors">
                    Generate Briefing
                </button>
            </div>
        );
    };

    return (
        <div className="bg-card/50 dark:bg-dark-card/50 p-6 rounded-xl border border-border dark:border-dark-border" role="region" aria-live="polite">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-text-main dark:text-dark-text-main flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.5L13.84 8.16L19.5 10L13.84 11.84L12 17.5L10.16 11.84L4.5 10L10.16 8.16L12 2.5Z" fill="#3B82F6"/>
                        <path d="M20.5 15.5L19.66 17.66L17.5 18.5L19.66 19.34L20.5 21.5L21.34 19.34L23.5 18.5L21.34 17.66L20.5 15.5Z" fill="#3B82F6"/>
                    </svg>
                    AI Daily Market Briefing
                </h2>
                {briefing && !isLoading && (
                    <button onClick={handleGenerateBriefing} className="text-sm text-accent hover:underline flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                        Refresh
                    </button>
                )}
            </div>
            {renderContent()}
        </div>
    );
});

const LatestSignal: React.FC<{ signal: Signal | undefined, onNavigate: () => void }> = React.memo(({ signal, onNavigate }) => (
    <div className="bg-card/50 dark:bg-dark-card/50 p-6 rounded-xl border border-border dark:border-dark-border">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-text-main dark:text-dark-text-main">Latest Signal</h2>
            <button onClick={onNavigate} className="text-sm text-accent hover:underline">View History</button>
        </div>
        {signal ? (
            <div className="bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-xl text-text-main dark:text-dark-text-main">{signal.assetName}</h3>
                        <p className={`font-bold text-lg ${signal.direction === 'SELL' ? 'text-danger' : 'text-success'}`}>{signal.direction}</p>
                    </div>
                    <p className="text-xs text-text-muted dark:text-dark-text-muted">{new Date(signal.updateTime).toLocaleString()}</p>
                </div>
                 <div className="mt-2 text-sm text-text-muted dark:text-dark-text-muted">
                    Entry: {signal.entryPrice} | SL: {signal.sl} | TP1: {signal.tp1}
                </div>
            </div>
        ) : (
             <p className="text-text-muted dark:text-dark-text-muted text-center py-8">No signals generated yet. Go to the AI Generator to get your first signal.</p>
        )}
    </div>
));


interface DashboardPageProps {
    latestSignal?: Signal;
    setCurrentView: (view: View) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ latestSignal, setCurrentView }) => {
    return (
        <div className="space-y-8 animate-fade-in">
             <div className="w-full flex flex-col-reverse md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div className="md:w-1/2 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-text-main dark:text-dark-text-main leading-tight">AI-Powered Trading Analysis</h1>
                    <p className="text-lg text-text-muted dark:text-dark-text-muted max-w-lg mx-auto md:mx-0">
                        Select an asset from the controls below to generate a real-time technical analysis and an actionable trading strategy.
                    </p>
                    <button 
                        onClick={() => setCurrentView(View.AI)}
                        className="mt-2 bg-accent text-white font-semibold rounded-lg px-6 py-3 hover:bg-accent-hover transition-colors"
                    >
                        Go to AI Generator
                    </button>
                </div>
                <div className="md:w-1/2 w-full max-w-sm md:max-w-none">
                    <HeroIllustration />
                </div>
            </div>

            <MarketBriefing />

            <LatestSignal signal={latestSignal} onNavigate={() => setCurrentView(View.HISTORY)} />

        </div>
    );
};

export default DashboardPage;