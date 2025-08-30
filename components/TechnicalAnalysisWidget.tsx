import React, { useEffect, useRef, memo } from 'react';
import { getTradingViewSymbol } from '../utils/tradingView';
import { Theme } from '../types';

interface TechnicalAnalysisWidgetProps {
  assetName: string;
  theme: Theme;
}

const TechnicalAnalysisWidget: React.FC<TechnicalAnalysisWidgetProps> = ({ assetName, theme }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current || typeof window.TradingView === 'undefined') {
      return;
    }

    const symbol = getTradingViewSymbol(assetName);
    if (!symbol) {
      container.current.innerHTML = `<div class="text-text-muted dark:text-dark-text-muted flex items-center justify-center h-full">Technical Analysis for ${assetName} is unavailable.</div>`;
      return;
    }

    container.current.innerHTML = '';
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "colorTheme": theme,
      "displayMode": "single",
      "isTransparent": true,
      "locale": "en",
      "interval": "1h",
      "width": "100%",
      "height": "100%",
      "symbol": symbol,
      "showIntervalTabs": true
    });
    
    container.current.appendChild(script);

    return () => {
        if (container.current) {
            container.current.innerHTML = '';
        }
    };
  }, [assetName, theme]);

  return (
    <div className="bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border h-[500px] w-full flex flex-col">
        <h3 className="font-bold text-lg text-text-main dark:text-dark-text-main mb-2">Technical Analysis</h3>
        <div className="tradingview-widget-container flex-1" ref={container}>
            <div className="tradingview-widget-container__widget h-full"></div>
        </div>
    </div>
  );
};

export default memo(TechnicalAnalysisWidget);