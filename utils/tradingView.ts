import { ASSETS } from '../constants';
import { AssetCategory } from '../types';

// Helper to convert asset names to TradingView symbols
export const getTradingViewSymbol = (assetName: string): string | null => {
    const priorityMap: { [key: string]: string } = {
        'Gold (XAU/USD)': 'OANDA:XAUUSD',
        'Silver (XAG/USD)': 'OANDA:XAGUSD',
        'Tether (USDTUSD)': 'USDTUSD',
        'NASDAQ 100 (NDX / US100)': 'NASDAQ:NDX',
        'Dow Jones (DJI / US30)': 'PEPPERSTONE:US30',
        'S&P 500 (INX)': 'SPX',
        'U.S. Dollar Index (DXY)': 'FXOPEN:DXY',
        'Gold (XAU/EUR)': 'OANDA:XAUEUR',
        'Gold (XAU/JPY)': 'OANDA:XAUJPY',
        'Silver (XAG/EUR)': 'OANDA:XAGEUR',
        'Natural Gas (XNG/USD)': 'NATURALGAS',
    };

    if (priorityMap[assetName]) {
        return priorityMap[assetName];
    }
    
    const assetInfo = ASSETS.find(a => a.name === assetName);
    if (!assetInfo) return assetName.replace(/\//g, '');

    const match = assetName.match(/\(([^)]+)\)/);
    let symbolPart: string;
    if (match) {
        symbolPart = match[1].split(' / ')[0].replace(/\//g, '');
    } else {
        symbolPart = assetName.replace(/\//g, '');
    }

    const stockExchangeMap: { [key: string]: string } = {
        'AAPL': 'NASDAQ',
        'MSFT': 'NASDAQ',
        'AMZN': 'NASDAQ',
        'GOOGL': 'NASDAQ',
        'META': 'NASDAQ',
        'TSLA': 'NASDAQ',
        'NVDA': 'NASDAQ',
        'BRK.B': 'NYSE',
        'JNJ': 'NYSE',
        'JPM': 'NYSE',
        'V': 'NYSE',
        'WMT': 'NYSE',
        'PG': 'NYSE',
        'UNH': 'NYSE',
        'XOM': 'NYSE'
    };

    switch (assetInfo.category) {
        case AssetCategory.STOCKS:
            const exchange = stockExchangeMap[symbolPart] || 'NASDAQ'; // Default to NASDAQ for any unmapped stocks
            return `${exchange}:${symbolPart}`;
        case AssetCategory.CRYPTO:
            return `BINANCE:${symbolPart}`;
        case AssetCategory.FOREX:
            return `${symbolPart}`;
        case AssetCategory.INDICES:
            return `PEPPERSTONE:${symbolPart}`;
        case AssetCategory.COMMODITIES:
            return `TVC:${symbolPart}`;
        default:
            return symbolPart;
    }
};