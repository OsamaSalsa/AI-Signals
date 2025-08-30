import React, { useEffect, useRef, memo } from 'react';
import { getTradingViewSymbol } from '../utils/tradingView';
import { ASSETS } from '../constants';
import { AssetCategory, Theme } from '../types';

interface FundamentalDataWidgetProps {
  assetName: string;
  theme: Theme;
}

const FundamentalDataWidget: React.FC<FundamentalDataWidgetProps> = ({ assetName, theme }) => {
  const container = useRef<HTMLDivElement>(null);
  
  const assetInfo = ASSETS.find(a => a.name === assetName);
  
  const supportedCategories = [AssetCategory.INDICES, AssetCategory.COMMODITIES, AssetCategory.STOCKS];

  if (!assetInfo || !supportedCategories.includes(assetInfo.category)) {
      return (
        <div className="bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border h-[500px] w-full flex flex-col">
            <h3 className="font-bold text-lg text-text-main dark:text-dark-text-main mb-2">Fundamental Data</h3>
            <div className="text-text-muted dark:text-dark-text-muted flex items-center justify-center h-full text-center p-4">
                Fundamental data is not available for this asset type.
            </div>
        </div>
      );
  }

  useEffect(() => {
    if (!container.current || typeof window.TradingView === 'undefined') {
      return;
    }

    const symbol = getTradingViewSymbol(assetName);
    if (!symbol) {
      container.current.innerHTML = `<div class="text-text-muted dark:text-dark-text-muted flex items-center justify-center h-full">Fundamental Data for ${assetName} is unavailable.</div>`;
      return;
    }

    container.current.innerHTML = '';
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-financials.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbol": symbol,
      "colorTheme": theme,
      "displayMode": "regular",
      "isTransparent": true,
      "locale": "en",
      "width": "100%",
      "height": "100%"
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
        <h3 className="font-bold text-lg text-text-main dark:text-dark-text-main mb-2">Fundamental Data</h3>
        <div className="tradingview-widget-container flex-1" ref={container}>
            <div className="tradingview-widget-container__widget h-full"></div>
        </div>
    </div>
  );
};

export default memo(FundamentalDataWidget);