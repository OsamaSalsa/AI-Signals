import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, TradingStyle, RiskTolerance, Asset, AssetCategory } from '../types';
import { ASSETS } from '../constants';

interface ProfilePageProps {
    userProfile: UserProfile;
    onProfileUpdate: (newProfile: UserProfile) => void;
    watchlist: string[];
    addToWatchlist: (assetName: string) => void;
    removeFromWatchlist: (assetName: string) => void;
}

type SortOrder = 'added' | 'name' | 'category';

const tradingStyleOptions: { style: TradingStyle; description: string }[] = [
    { style: 'Scalper', description: 'Focuses on very small price changes and making numerous trades in a short period.' },
    { style: 'Day Trader', description: 'Opens and closes trades within a single day, avoiding overnight positions.' },
    { style: 'Swing Trader', description: 'Holds trades for several days to weeks to profit from price "swings".' },
    { style: 'Position Trader', description: 'Holds trades for long periods, from months to years, based on long-term outlooks.' },
];

const riskToleranceOptions: { level: RiskTolerance; description: string, color: string }[] = [
    { level: 'Low', description: 'Prefers conservative strategies with smaller, more certain gains and minimal risk.', color: 'text-success' },
    { level: 'Medium', description: 'Seeks a balance between risk and return, comfortable with moderate market fluctuations.', color: 'text-accent' },
    { level: 'High', description: 'Willing to take on significant risk for the potential of higher returns.', color: 'text-danger' },
];

const ProfileOptionCard: React.FC<{ title: string; description: string; isSelected: boolean; onSelect: () => void; color?: string }> = ({ title, description, isSelected, onSelect, color = 'text-accent' }) => (
    <div
        onClick={onSelect}
        className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? `border-accent bg-accent-soft` : 'border-border dark:border-dark-border bg-card dark:bg-dark-card hover:border-accent-light'}`}
        role="radio"
        aria-checked={isSelected}
        tabIndex={0}
        onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
    >
        <h3 className={`text-lg font-bold ${isSelected ? color : 'text-text-main dark:text-dark-text-main'}`}>{title}</h3>
        <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">{description}</p>
    </div>
);

const ProfilePage: React.FC<ProfilePageProps> = ({ userProfile, onProfileUpdate, watchlist, addToWatchlist, removeFromWatchlist }) => {
    // Profile State
    const [localProfile, setLocalProfile] = useState<UserProfile>(userProfile);
    const [showSuccess, setShowSuccess] = useState(false);
    
    // Watchlist State
    const [assetToAdd, setAssetToAdd] = useState('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('added');

    useEffect(() => {
        setLocalProfile(userProfile);
    }, [userProfile]);

    const handleSave = () => {
        onProfileUpdate(localProfile);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const hasChanges = JSON.stringify(localProfile) !== JSON.stringify(userProfile);

    // Watchlist Logic
    const availableAssets = useMemo(() => {
        return ASSETS.filter(asset => !watchlist.includes(asset.name));
    }, [watchlist]);

    const groupedAvailableAssets = useMemo(() => {
        return availableAssets.reduce((acc, asset) => {
            const category = asset.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(asset);
            return acc;
        }, {} as Record<AssetCategory, Asset[]>);
    }, [availableAssets]);

    const handleAddAsset = () => {
        if (assetToAdd) {
            addToWatchlist(assetToAdd);
            const remainingAssets = availableAssets.filter(a => a.name !== assetToAdd);
            setAssetToAdd(remainingAssets.length > 0 ? remainingAssets[0].name : '');
        }
    };
    
    useEffect(() => {
        if (availableAssets.length > 0 && !assetToAdd) {
            setAssetToAdd(availableAssets[0].name);
        }
        if(availableAssets.length === 0) {
            setAssetToAdd('');
        }
    }, [availableAssets, assetToAdd]);

    const watchlistWithDetails = useMemo(() => {
        return watchlist.map(name => ASSETS.find(asset => asset.name === name)).filter((asset): asset is Asset => !!asset);
    }, [watchlist]);

    const sortedWatchlist = useMemo(() => {
        const list = [...watchlistWithDetails];
        switch (sortOrder) {
            case 'name':
                return list.sort((a, b) => a.name.localeCompare(b.name));
            case 'category':
                return list.sort((a, b) => {
                    const categoryCompare = a.category.localeCompare(b.category);
                    if (categoryCompare !== 0) return categoryCompare;
                    return a.name.localeCompare(b.name);
                });
            case 'added':
            default:
                // We need to respect the original order from props for 'added'
                return watchlistWithDetails; 
        }
    }, [watchlistWithDetails, sortOrder]);


    return (
        <div className="max-w-4xl mx-auto py-8 md:py-12 px-4 space-y-12 animate-fade-in">
            {/* --- PROFILE SECTION --- */}
            <div className="text-center space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold text-text-main dark:text-dark-text-main">Settings</h1>
                <p className="text-text-muted dark:text-dark-text-muted max-w-2xl mx-auto">Tailor the AI's analysis to match your personal trading style and risk tolerance.</p>
            </div>

            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-text-main dark:text-dark-text-main mb-4">Trading Style</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="radiogroup" aria-labelledby="trading-style-label">
                        {tradingStyleOptions.map(option => (
                            <ProfileOptionCard
                                key={option.style}
                                title={option.style}
                                description={option.description}
                                isSelected={localProfile.tradingStyle === option.style}
                                onSelect={() => setLocalProfile(p => ({ ...p, tradingStyle: option.style }))}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-text-main dark:text-dark-text-main mb-4">Risk Tolerance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="radiogroup" aria-labelledby="risk-tolerance-label">
                         {riskToleranceOptions.map(option => (
                            <ProfileOptionCard
                                key={option.level}
                                title={option.level}
                                description={option.description}
                                color={option.color}
                                isSelected={localProfile.riskTolerance === option.level}
                                onSelect={() => setLocalProfile(p => ({ ...p, riskTolerance: option.level }))}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-center items-center gap-4">
                 <button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className="bg-accent text-white font-semibold rounded-lg px-8 py-3 hover:bg-accent-hover transition-colors disabled:bg-opacity-50 disabled:cursor-not-allowed"
                >
                    Save Preferences
                </button>
                {showSuccess && (
                    <div className="text-success font-semibold flex items-center gap-2 animate-fade-in" role="status">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Saved!
                    </div>
                )}
            </div>

            <hr className="border-border dark:border-dark-border !my-16" />

            {/* --- WATCHLIST SECTION --- */}
            <div className="space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl md:text-4xl font-bold text-text-main dark:text-dark-text-main">Watchlist</h2>
                    <p className="text-text-muted dark:text-dark-text-muted max-w-2xl mx-auto">Manage your favorite assets for quick analysis from the AI Generator page.</p>
                </div>

                <div className="max-w-xl mx-auto bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border space-y-3">
                    <h3 className="font-semibold text-text-main dark:text-dark-text-main">Add New Asset</h3>
                    <div className="flex gap-2">
                        <div className="relative w-full">
                            <select
                                value={assetToAdd}
                                onChange={(e) => setAssetToAdd(e.target.value)}
                                className="w-full bg-input-bg dark:bg-dark-input-bg border-0 rounded-lg p-3 text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-accent appearance-none pr-8"
                                aria-label="Select asset to add to watchlist"
                                disabled={availableAssets.length === 0}
                            >
                                {availableAssets.length === 0 ? (
                                    <option>All assets are on your watchlist</option>
                                ) : (
                                    Object.entries(groupedAvailableAssets).map(([category, assetsInCategory]) => (
                                        <optgroup key={category} label={category}>
                                            {assetsInCategory.map(asset => (
                                                <option key={asset.name} value={asset.name}>{asset.name}</option>
                                            ))}
                                        </optgroup>
                                    ))
                                )}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted dark:text-dark-text-muted">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                        <button
                            onClick={handleAddAsset}
                            disabled={!assetToAdd}
                            className="bg-accent text-white font-semibold rounded-lg px-6 py-2 flex items-center justify-center disabled:bg-opacity-50 disabled:cursor-not-allowed hover:bg-accent-hover transition-colors"
                        >
                            Add
                        </button>
                    </div>
                </div>

                <div>
                    {watchlistWithDetails.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                            <span className="text-sm font-semibold text-text-muted dark:text-dark-text-muted mr-2">Sort by:</span>
                            <button
                                onClick={() => setSortOrder('added')}
                                className={`px-3 py-1 text-sm rounded-full border transition-colors ${sortOrder === 'added' ? 'bg-accent-soft text-accent border-accent' : 'bg-card dark:bg-dark-card text-text-muted dark:text-dark-text-muted border-border dark:border-dark-border hover:border-accent-light'}`}
                            >
                                Order Added
                            </button>
                            <button
                                onClick={() => setSortOrder('name')}
                                className={`px-3 py-1 text-sm rounded-full border transition-colors ${sortOrder === 'name' ? 'bg-accent-soft text-accent border-accent' : 'bg-card dark:bg-dark-card text-text-muted dark:text-dark-text-muted border-border dark:border-dark-border hover:border-accent-light'}`}
                            >
                                Name (A-Z)
                            </button>
                            <button
                                onClick={() => setSortOrder('category')}
                                className={`px-3 py-1 text-sm rounded-full border transition-colors ${sortOrder === 'category' ? 'bg-accent-soft text-accent border-accent' : 'bg-card dark:bg-dark-card text-text-muted dark:text-dark-text-muted border-border dark:border-dark-border hover:border-accent-light'}`}
                            >
                                Category
                            </button>
                        </div>
                    )}

                    {sortedWatchlist.length === 0 ? (
                        <div className="text-center py-16 bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl">
                            <p className="text-text-muted dark:text-dark-text-muted">Your watchlist is empty.</p>
                            <p className="text-sm text-text-muted dark:text-dark-text-muted">Add some assets above to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sortedWatchlist.map(asset => (
                                <div key={asset.name} className="bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-text-main dark:text-dark-text-main">{asset.name}</p>
                                        <p className="text-xs bg-background dark:bg-dark-background text-text-muted dark:text-dark-text-muted px-2 py-0.5 rounded-full inline-block mt-1">{asset.category}</p>
                                    </div>
                                    <button 
                                        onClick={() => removeFromWatchlist(asset.name)}
                                        className="text-text-muted dark:text-dark-text-muted hover:text-danger p-2 rounded-full hover:bg-danger-soft transition-colors"
                                        aria-label={`Remove ${asset.name} from watchlist`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;