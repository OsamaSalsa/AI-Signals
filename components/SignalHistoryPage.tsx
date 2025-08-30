import React, { useState, useMemo, useCallback } from 'react';
import { Signal, Theme } from '../types';
import SignalHistoryItem from './SignalHistoryItem';
import SignalDetailModal from './SignalDetailModal';

interface SignalHistoryPageProps {
  signalHistory: Signal[];
  theme: Theme;
}

const SignalHistoryPage: React.FC<SignalHistoryPageProps> = ({ signalHistory, theme }) => {
  const [assetFilter, setAssetFilter] = useState<string>('');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'BUY' | 'SELL'>('all');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);

  const recentSignals = useMemo(() => signalHistory.slice(0, 5), [signalHistory]);

  const uniqueAssets = useMemo(() => {
    const assets = new Set(signalHistory.map(s => s.assetName));
    return Array.from(assets).sort();
  }, [signalHistory]);

  const filteredAndSortedHistory = useMemo(() => {
    let filtered = [...signalHistory];

    if (assetFilter) {
      filtered = filtered.filter(s => s.assetName === assetFilter);
    }
    if (directionFilter !== 'all') {
      filtered = filtered.filter(s => s.direction === directionFilter);
    }
    if (startDateFilter) {
        const startDate = new Date(startDateFilter + 'T00:00:00.000Z');
        filtered = filtered.filter(s => new Date(s.updateTime) >= startDate);
    }
    if (endDateFilter) {
        const endDate = new Date(endDateFilter + 'T23:59:59.999Z');
        filtered = filtered.filter(s => new Date(s.updateTime) <= endDate);
    }

    if (sortOrder === 'newest') {
      filtered.sort((a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime());
    } else { // oldest
      filtered.sort((a, b) => new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime());
    }
    
    return filtered;
  }, [signalHistory, assetFilter, directionFilter, startDateFilter, endDateFilter, sortOrder]);

  const handleReset = useCallback(() => {
    setAssetFilter('');
    setDirectionFilter('all');
    setStartDateFilter('');
    setEndDateFilter('');
    setSortOrder('newest');
  }, []);
  
  const handleSelectSignal = useCallback((signal: Signal) => {
    setSelectedSignal(signal);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedSignal(null);
  }, []);

  const inputClasses = "w-full bg-input-bg dark:bg-dark-input-bg border border-border dark:border-dark-border rounded-lg p-2 text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-accent transition-colors h-10";

  return (
    <>
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-text-main dark:text-dark-text-main">Signal History</h2>
        </div>

        {signalHistory.length === 0 ? (
          <div className="text-center py-16 bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl">
            <p className="text-text-muted dark:text-dark-text-muted">No signals generated yet.</p>
            <p className="text-sm text-text-muted dark:text-dark-text-muted">Go to the 'AI' tab to get your first signal.</p>
          </div>
        ) : (
          <>
            {/* Quick Access Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-main dark:text-dark-text-main">Quick Access: Recent Signals</h3>
              <div className="space-y-3">
                {recentSignals.map((signal, index) => (
                  <SignalHistoryItem
                    key={`recent-${signal.updateTime}-${index}`}
                    signal={signal}
                    onClick={() => handleSelectSignal(signal)}
                  />
                ))}
              </div>
            </div>
            
            {/* Full History Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-main dark:text-dark-text-main">Full History & Filters</h3>
              
              {/* Filters */}
              <div className="bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div>
                    <label htmlFor="assetFilter" className="block text-sm font-medium text-text-muted dark:text-dark-text-muted mb-1">Asset</label>
                    <select id="assetFilter" value={assetFilter} onChange={e => setAssetFilter(e.target.value)} className={inputClasses}>
                      <option value="">All Assets</option>
                      {uniqueAssets.map(asset => <option key={asset} value={asset}>{asset}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="directionFilter" className="block text-sm font-medium text-text-muted dark:text-dark-text-muted mb-1">Direction</label>
                    <select id="directionFilter" value={directionFilter} onChange={e => setDirectionFilter(e.target.value as any)} className={inputClasses}>
                      <option value="all">All Directions</option>
                      <option value="BUY">Buy</option>
                      <option value="SELL">Sell</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="startDateFilter" className="block text-sm font-medium text-text-muted dark:text-dark-text-muted mb-1">From</label>
                    <input type="date" id="startDateFilter" value={startDateFilter} onChange={e => setStartDateFilter(e.target.value)} className={inputClasses} />
                  </div>
                  <div>
                    <label htmlFor="endDateFilter" className="block text-sm font-medium text-text-muted dark:text-dark-text-muted mb-1">To</label>
                    <input type="date" id="endDateFilter" value={endDateFilter} onChange={e => setEndDateFilter(e.target.value)} className={inputClasses} />
                  </div>
                  <div>
                    <label htmlFor="sortOrder" className="block text-sm font-medium text-text-muted dark:text-dark-text-muted mb-1">Sort By</label>
                    <select id="sortOrder" value={sortOrder} onChange={e => setSortOrder(e.target.value as any)} className={inputClasses}>
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button onClick={handleReset} className="px-4 py-2 text-sm font-semibold rounded-lg border bg-background dark:bg-dark-background text-text-main dark:text-dark-text-main border-border dark:border-dark-border hover:bg-border dark:hover:bg-dark-border transition-colors">
                    Reset Filters
                  </button>
                </div>
              </div>

              {/* List */}
              {filteredAndSortedHistory.length === 0 ? (
                <div className="text-center py-16 bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl">
                  <p className="text-text-muted dark:text-dark-text-muted">No signals match your criteria.</p>
                  <p className="text-sm text-text-muted dark:text-dark-text-muted">Try adjusting your filters.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAndSortedHistory.map((signal, index) => (
                    <SignalHistoryItem 
                      key={`${signal.updateTime}-${index}`} 
                      signal={signal} 
                      onClick={() => handleSelectSignal(signal)} 
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {selectedSignal && (
        <SignalDetailModal 
            signal={selectedSignal} 
            onClose={handleCloseModal} 
            theme={theme} 
        />
      )}
    </>
  );
};

export default SignalHistoryPage;
