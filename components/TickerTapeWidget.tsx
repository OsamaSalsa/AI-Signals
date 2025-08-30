import React, { useEffect, useRef, memo } from 'react';
import { Theme } from '../types';
import { getTradingViewSymbol } from '../utils/tradingView';

interface TickerTapeWidgetProps {
    watchlist: string[];
    theme: Theme;
}

const TickerTapeWidgetComponent: React.FC<TickerTapeWidgetProps> = ({ watchlist, theme }) => {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!container.current || typeof window.TradingView === 'undefined' || watchlist.length === 0) {
            return;
        }
        
        const symbols = watchlist.map(assetName => {
            const symbol = getTradingViewSymbol(assetName);
            return {
                proName: symbol || assetName.replace(/\//g, ''),
                title: assetName
            };
        });

        container.current.innerHTML = ''; // Clear previous widget
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "symbols": symbols,
            "showSymbolLogo": true,
            "colorTheme": "light",
            "isTransparent": true,
            "displayMode": "regular",
            "locale": "en"
        });
        
        container.current.appendChild(script);

    }, [watchlist, theme]);


    return (
        <div className="tradingview-widget-container" ref={container}>
            <div className="tradingview-widget-container__widget"></div>
        </div>
    );
}

export default memo(TickerTapeWidgetComponent);
