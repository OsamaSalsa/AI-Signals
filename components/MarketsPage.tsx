import React, { useState, useMemo, useEffect } from 'react';
import { ASSETS } from '../constants';
import { Asset, AssetCategory, Theme } from '../types';
import LivePrice from './LivePrice';

interface MarketsPageProps {
    theme: Theme;
}

const SearchIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const MarketAssetCard: React.FC<{ asset: Asset; theme: Theme }> = React.memo(({ asset, theme }) => {
    return (
        <div className="bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl p-3 space-y-2">
            <h3 className="font-semibold text-text-main dark:text-dark-text-main truncate" title={asset.name}>{asset.name}</h3>
            <LivePrice assetName={asset.name} theme={theme} />
        </div>
    );
});


const MarketsPage: React.FC<MarketsPageProps> = ({ theme }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<AssetCategory>(AssetCategory.STOCKS);
    const [currentPage, setCurrentPage] = useState(1);
    const assetsPerPage = 12;

    const categories = useMemo(() => [
        AssetCategory.STOCKS,
        AssetCategory.INDICES,
        AssetCategory.FOREX,
        AssetCategory.COMMODITIES,
        AssetCategory.CRYPTO,
    ], []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory]);

    const filteredAssets = useMemo(() => {
        let assets = ASSETS.filter(asset => asset.category === selectedCategory);

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            assets = assets.filter(asset =>
                asset.name.toLowerCase().includes(lowercasedFilter)
            );
        }
        
        return assets;
    }, [searchTerm, selectedCategory]);
    
    const totalPages = Math.ceil(filteredAssets.length / assetsPerPage);

    const paginatedAssets = useMemo(() => {
        const startIndex = (currentPage - 1) * assetsPerPage;
        return filteredAssets.slice(startIndex, startIndex + assetsPerPage);
    }, [filteredAssets, currentPage]);


    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold text-text-main dark:text-dark-text-main">Live Market Overview</h1>
                <p className="text-text-muted dark:text-dark-text-muted max-w-2xl mx-auto">Real-time price data for all available assets, powered by TradingView.</p>
            </div>

            <div className="sticky top-16 bg-background/80 dark:bg-dark-background/80 backdrop-blur-sm z-10 py-4 -mx-4 md:-mx-6 px-4 md:px-6 space-y-4">
                <div className="relative max-w-xl mx-auto">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon className="h-5 w-5 text-text-muted dark:text-dark-text-muted" />
                    </div>
                    <input
                        type="text"
                        placeholder={`Search in ${selectedCategory}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-lg p-3 pl-10 text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-accent"
                        aria-label="Search for an asset"
                    />
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full border transition-colors ${selectedCategory === category ? 'bg-accent-soft text-accent border-accent' : 'bg-card dark:bg-dark-card text-text-muted dark:text-dark-text-muted border-border dark:border-dark-border hover:border-accent-light'}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[500px]">
                    {paginatedAssets.map(asset => (
                        <MarketAssetCard key={asset.name} asset={asset} theme={theme} />
                    ))}
                </div>
                 
                 {filteredAssets.length === 0 && (
                    <div className="text-center py-16 bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl">
                        <p className="text-text-muted dark:text-dark-text-muted">
                           {searchTerm 
                                ? `No assets found for "${searchTerm}" in ${selectedCategory}.`
                                : `No assets found in the ${selectedCategory} category.`
                            }
                        </p>
                    </div>
                 )}

                 {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-sm font-semibold rounded-lg border bg-card dark:bg-dark-card text-text-main dark:text-dark-text-main border-border dark:border-dark-border hover:bg-border dark:hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-medium text-text-muted dark:text-dark-text-muted">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 text-sm font-semibold rounded-lg border bg-card dark:bg-dark-card text-text-main dark:text-dark-text-main border-border dark:border-dark-border hover:bg-border dark:hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default MarketsPage;