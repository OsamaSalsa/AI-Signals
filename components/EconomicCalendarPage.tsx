import React, { useEffect, useRef, memo } from 'react';
import { Theme } from '../types';

interface EconomicCalendarPageProps {
    theme: Theme;
}

const EconomicCalendarPageComponent: React.FC<EconomicCalendarPageProps> = ({ theme }) => {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!container.current || typeof window.TradingView === 'undefined') {
            return;
        }

        container.current.innerHTML = '';
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "colorTheme": theme,
            "isTransparent": true,
            "width": "100%",
            "height": "100%",
            "locale": "en",
            "importanceFilter": "0,1",
            "countryFilter": "us,cn,de,jp,in,gb,fr,it,br,ca,ru,mx,au,kr,es,id,nl,sa,tr,ch",
        });

        container.current.appendChild(script);

        return () => {
            if (container.current) {
                container.current.innerHTML = '';
            }
        };
    }, [theme]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold text-text-main dark:text-dark-text-main">Economic Calendar</h1>
                <p className="text-text-muted dark:text-dark-text-muted max-w-2xl mx-auto">Stay ahead of market-moving events with real-time economic data from the world's top 20 economies.</p>
            </div>
            <div className="bg-card dark:bg-dark-card p-2 rounded-xl border border-border dark:border-dark-border h-[75vh] w-full flex flex-col">
                <div className="tradingview-widget-container flex-1" ref={container}>
                    <div className="tradingview-widget-container__widget h-full"></div>
                </div>
            </div>
        </div>
    );
};

export default memo(EconomicCalendarPageComponent);