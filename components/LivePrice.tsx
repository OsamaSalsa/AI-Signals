import React, { useEffect, useRef } from 'react';
import { getTradingViewSymbol } from '../utils/tradingView';
import { Theme } from '../types';

interface LivePriceProps {
  assetName: string;
  theme: Theme;
}

const LivePrice: React.FC<LivePriceProps> = ({ assetName, theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure the container is ready and TradingView script is loaded
    if (!containerRef.current || typeof window.TradingView === 'undefined') {
      return;
    }

    const symbol = getTradingViewSymbol(assetName);

    if (!symbol) {
        if (containerRef.current) {
            containerRef.current.innerHTML = `<div class="text-text-muted dark:text-dark-text-muted flex items-center justify-center h-full">Live price for ${assetName} is unavailable.</div>`;
        }
        return;
    }
    
    // Create the script element for the widget
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js';
    script.async = true; 
    script.innerHTML = JSON.stringify({
        "symbol": symbol,
        "width": "100%",
        "colorTheme": theme,
        "isTransparent": true,
        "locale": "en"
    });

    // Clear previous widget and append the new one
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(script);

  }, [assetName, theme]);

  return (
    <div className="bg-background dark:bg-dark-background p-2 rounded-xl border border-border dark:border-dark-border">
        <div ref={containerRef} className="tradingview-widget-container">
            {/* The TradingView widget will be dynamically injected here */}
        </div>
    </div>
  );
};

export default React.memo(LivePrice);