import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Asset, Signal, AssetCategory, ChatMessage, Theme, UserProfile } from '../types';
import { ASSETS } from '../constants';
import { generateTradingSignal, getChatResponse } from '../services/geminiService';
import Loader from './Loader';
import SignalCard from './SignalCard';
import LivePrice from './LivePrice';

interface SignalGeneratorPageProps {
  addSignalToHistory: (signal: Omit<Signal, 'status'>) => void;
  watchlist: string[];
  addToWatchlist: (assetName: string) => void;
  removeFromWatchlist: (assetName: string) => void;
  theme: Theme;
  userProfile: UserProfile;
}

const ForexLoader: React.FC = React.memo(() => (
    <div className="flex flex-col items-center justify-center">
        <svg width="200" height="80" viewBox="0 0 200 80" aria-hidden="true">
            <defs>
                <filter id="glow-forex">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            
            <line x1="0" y1="20" x2="200" y2="20" className="stroke-border dark:stroke-dark-border" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="0" y1="40" x2="200" y2="40" className="stroke-border dark:stroke-dark-border" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="0" y1="60" x2="200" y2="60" className="stroke-border dark:stroke-dark-border" strokeWidth="0.5" strokeDasharray="2,2" />
            
            <path
                d="M 10 50 Q 30 20, 50 40 T 90 55 T 130 30 T 170 60 L 190 50"
                fill="none"
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="2"
            />
            
            <path
                d="M 10 50 Q 30 20, 50 40 T 90 55 T 130 30 T 170 60 L 190 50"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                style={{ strokeDasharray: 400, strokeDashoffset: 400 }}
                className="animate-draw-line"
            />

            <circle cx="0" cy="0" r="4" fill="#60a5fa" filter="url(#glow-forex)">
                <animateMotion
                    dur="4s"
                    repeatCount="indefinite"
                    path="M 10 50 Q 30 20, 50 40 T 90 55 T 130 30 T 170 60 L 190 50"
                />
            </circle>
        </svg>
    </div>
));

const SearchIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const SignalGeneratorPage: React.FC<SignalGeneratorPageProps> = ({ addSignalToHistory, watchlist, addToWatchlist, removeFromWatchlist, theme, userProfile }) => {
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSignal, setCurrentSignal] = useState<Signal | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedAsset) {
        if (watchlist.length > 0) {
            setSelectedAsset(watchlist[0]);
        } else {
            setSelectedAsset('Bitcoin (BTCUSD)'); // Fallback
        }
    }
  }, [watchlist, selectedAsset]);

  const assets: Asset[] = useMemo(() => ASSETS, []);

  const groupedAssets = useMemo(() => {
    return assets.reduce((acc, asset) => {
        const category = asset.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(asset);
        return acc;
    }, {} as Record<AssetCategory, Asset[]>);
  }, [assets]);

  const filteredGroupedAssets = useMemo(() => {
    if (!searchTerm) {
      return groupedAssets;
    }

    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = {} as Record<AssetCategory, Asset[]>;

    for (const category in groupedAssets) {
      const assetsInCategory = groupedAssets[category as AssetCategory];
      const filteredAssets = assetsInCategory.filter(asset =>
        asset.name.toLowerCase().includes(lowercasedFilter)
      );

      if (filteredAssets.length > 0) {
        filtered[category as AssetCategory] = filteredAssets;
      }
    }
    return filtered;
  }, [searchTerm, groupedAssets]);

  const handleGenerateSignal = useCallback(async () => {
    if (!selectedAsset) return;
    setIsLoading(true);
    setError(null);
    setCurrentSignal(null);
    setChatHistory([]); // Reset chat on new signal
    setChatError(null);

    try {
      const signal = await generateTradingSignal(selectedAsset, userProfile);
      const fullSignal: Signal = { ...signal, status: 'Live' };
      setCurrentSignal(fullSignal);
      addSignalToHistory(signal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAsset, addSignalToHistory, userProfile]);
  
  const handleSendMessage = useCallback(async (message: string) => {
    if (!message || !currentSignal) return;
    
    setChatError(null);
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: message }];
    setChatHistory(newHistory);
    setIsChatLoading(true);

    try {
        const responseText = await getChatResponse(newHistory, message, currentSignal);
        setChatHistory(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (err) {
        setChatError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsChatLoading(false);
    }
  }, [chatHistory, currentSignal]);

  const isWatchlisted = useMemo(() => watchlist.includes(selectedAsset), [watchlist, selectedAsset]);
  
  const toggleWatchlist = useCallback(() => {
    if (isWatchlisted) {
        removeFromWatchlist(selectedAsset);
    } else {
        addToWatchlist(selectedAsset);
    }
  }, [isWatchlisted, selectedAsset, addToWatchlist, removeFromWatchlist]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleAssetSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAsset(e.target.value);
  }, []);

  return (
    <div className="flex flex-col items-center space-y-8 animate-fade-in">
       <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-text-main dark:text-dark-text-main">AI Signal Generator</h1>
            <p className="text-text-muted dark:text-dark-text-muted max-w-2xl mx-auto">Select an asset to generate a real-time technical analysis and an actionable trading strategy.</p>
        </div>

       {watchlist.length > 0 && (
        <div className="w-full max-w-2xl">
            <h4 className="text-sm font-semibold text-text-muted dark:text-dark-text-muted mb-2 text-left">Quick Access Watchlist</h4>
            <div className="flex flex-wrap gap-2">
                {watchlist.map(assetName => (
                    <button 
                        key={assetName}
                        onClick={() => setSelectedAsset(assetName)}
                        className={`px-3 py-1 text-sm rounded-full border transition-colors ${selectedAsset === assetName ? 'bg-accent-soft text-accent border-accent' : 'bg-card dark:bg-dark-card text-text-muted dark:text-dark-text-muted border-border dark:border-dark-border hover:border-accent-light'}`}
                    >
                        {assetName}
                    </button>
                ))}
            </div>
        </div>
      )}

      <div className="w-full max-w-2xl space-y-4">
        <div className="bg-card/50 dark:bg-dark-card/50 p-2 rounded-xl border border-border dark:border-dark-border w-full space-y-2">
          <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <SearchIcon className="h-5 w-5 text-text-muted dark:text-dark-text-muted" />
              </div>
              <input
                  type="text"
                  placeholder="Search for an asset..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full bg-input-bg dark:bg-dark-input-bg border-0 rounded-lg p-3 pl-10 text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-accent"
                  aria-label="Search for an asset"
              />
          </div>
          <div className="flex flex-col md:flex-row gap-2 items-center">
              <div className="relative w-full md:flex-1 flex items-center gap-2">
                  <div className="relative flex-grow">
                      <select 
                          id="asset" 
                          value={selectedAsset} 
                          onChange={handleAssetSelect} 
                          className="w-full bg-input-bg dark:bg-dark-input-bg border-0 rounded-lg p-3 text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-accent appearance-none pr-8"
                          aria-label="Select asset"
                      >
                        {Object.keys(filteredGroupedAssets).length > 0 ? (
                          Object.entries(filteredGroupedAssets).map(([category, assetsInCategory]) => (
                              <optgroup key={category} label={category}>
                                  {assetsInCategory.map(asset => (
                                      <option key={asset.name} value={asset.name}>{asset.name}</option>
                                  ))}
                              </optgroup>
                          ))
                        ) : (
                          <option disabled>No assets found</option>
                        )}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted dark:text-dark-text-muted">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                  </div>
                  <button
                      onClick={toggleWatchlist}
                      className="p-3 bg-input-bg dark:bg-dark-input-bg rounded-lg text-text-muted dark:text-dark-text-muted hover:text-accent focus:ring-2 focus:ring-accent transition-colors"
                      aria-label={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
                      title={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={isWatchlisted ? '#3B82F6' : 'currentColor'}>
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                  </button>
              </div>
            <button
              onClick={handleGenerateSignal}
              disabled={isLoading || !selectedAsset || Object.keys(filteredGroupedAssets).length === 0}
              className="w-full md:w-auto bg-accent text-white font-semibold rounded-lg px-6 py-3 h-12 flex items-center justify-center disabled:bg-opacity-50 disabled:cursor-not-allowed hover:bg-accent-hover transition-colors"
            >
              {isLoading ? <Loader /> : 'Generate'}
            </button>
          </div>
        </div>
        {selectedAsset && !isLoading && !currentSignal && <LivePrice assetName={selectedAsset} theme={theme} />}
       </div>
      
      {(isLoading || error || currentSignal) && (
        <div className="w-full max-w-5xl min-h-[400px] flex items-center justify-center">
          {isLoading ? (
              <div role="status" className="flex flex-col items-center justify-center text-center py-20">
                  <ForexLoader />
                  <p className="mt-4 text-text-muted dark:text-dark-text-muted" aria-live="polite">Generating AI Strategy...</p>
                  <p className="text-sm text-text-muted dark:text-dark-text-muted">This may take a moment.</p>
              </div>
          ) : error ? (
              <div role="alert" className="bg-danger-soft border border-danger text-danger p-4 rounded-lg max-w-2xl mx-auto">
                  <p className="font-semibold">An Error Occurred</p>
                  <p>{error}</p>
              </div>
          ) : currentSignal ? (
              <div className="animate-fade-in w-full space-y-4">
                  <SignalCard 
                    signal={currentSignal} 
                    isInteractive={true}
                    chatHistory={chatHistory}
                    isChatLoading={isChatLoading}
                    chatError={chatError}
                    onSendMessage={handleSendMessage}
                    theme={theme}
                  />
              </div>
          ) : null}
        </div>
      )}

      {!currentSignal && !isLoading && (
         <div className="text-center py-16 text-text-muted dark:text-dark-text-muted">
            <p>Your generated signal will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default SignalGeneratorPage;