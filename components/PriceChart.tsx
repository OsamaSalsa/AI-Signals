import React, { useEffect, useRef, useMemo } from 'react';
import { Signal, Theme } from '../types';
import { getTradingViewSymbol } from '../utils/tradingView';


declare global {
    interface Window {
        TradingView: any;
    }
}

interface PriceChartProps {
    signal: Signal;
    theme: Theme;
}

const PriceChartComponent: React.FC<PriceChartProps> = ({ signal, theme }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<any>(null);

    const chartContainerId = useMemo(
        () => `tradingview-chart-container-${Math.random().toString(36).substr(2, 9)}`,
        []
    );

    useEffect(() => {
        if (!containerRef.current || typeof window.TradingView === 'undefined') {
            return;
        }

        const symbol = getTradingViewSymbol(signal.assetName);
        if (!symbol) {
            if (containerRef.current) {
                containerRef.current.innerHTML = `<p class="text-text-muted dark:text-dark-text-muted p-4">Could not load chart for ${signal.assetName}.</p>`;
            }
            return;
        }

        const overrides = theme === 'dark' ? {
            "paneProperties.background": "#172A46",
            "paneProperties.vertGridProperties.color": "#233554",
            "paneProperties.horzGridProperties.color": "#233554",
            "symbolWatermarkProperties.transparency": 90,
            "scalesProperties.textColor": "#8892B0",
            "mainSeriesProperties.candleStyle.upColor": "#22C55E",
            "mainSeriesProperties.candleStyle.downColor": "#EF4444",
            "mainSeriesProperties.candleStyle.wickUpColor": '#22C55E',
            "mainSeriesProperties.candleStyle.wickDownColor": '#EF4444',
            "mainSeriesProperties.candleStyle.borderUpColor": "#22C55E",
            "mainSeriesProperties.candleStyle.borderDownColor": "#EF4444",
        } : {
            "paneProperties.background": "#FFFFFF",
            "paneProperties.vertGridProperties.color": "#E5E7EB",
            "paneProperties.horzGridProperties.color": "#E5E7EB",
            "symbolWatermarkProperties.transparency": 90,
            "scalesProperties.textColor": "#6B7280",
            "mainSeriesProperties.candleStyle.upColor": "#16A34A",
            "mainSeriesProperties.candleStyle.downColor": "#DC2626",
            "mainSeriesProperties.candleStyle.wickUpColor": '#16A34A',
            "mainSeriesProperties.candleStyle.wickDownColor": '#DC2626',
            "mainSeriesProperties.candleStyle.borderUpColor": "#16A34A",
            "mainSeriesProperties.candleStyle.borderDownColor": "#DC2626",
        };


        const widgetOptions = {
            autosize: true,
            symbol: symbol,
            interval: '60', // 1 hour
            timezone: 'Etc/UTC',
            theme: theme,
            style: '1', // Candlesticks
            locale: 'en',
            toolbar_bg: theme === 'dark' ? '#172A46' : '#F9FAFB',
            enable_publishing: false,
            hide_side_toolbar: true,
            allow_symbol_change: false,
            container_id: chartContainerId,
            details: false,
            studies: [ "RSI@tv-basicstudies", "MASimple@tv-basicstudies" ],
            overrides: overrides,
            backgroundColor: theme === 'dark' ? '#010a17' : '#F9FAFB',
        };

        // Clean container
        containerRef.current.innerHTML = '';

        const widget = new window.TradingView.widget(widgetOptions);
        widgetRef.current = widget;

        const handleChartReady = () => {
             const chart = widgetRef.current?.activeChart?.();
             if (!chart) return;
             
             const parsePrice = (p: string) => {
                 const v = parseFloat(p);
                 return isNaN(v) ? null : v;
             };

             const prices = {
                 entry: parsePrice(signal.entryPrice),
                 tp1: parsePrice(signal.tp1),
                 tp2: parsePrice(signal.tp2),
                 sl: parsePrice(signal.sl),
             };

             const addLine = (price: number | null, title: string, color: string) => {
                 if (price === null) return;
                 chart.createStudy("Horizontal Line", false, false, [price], {
                     "horizLineProperties.color": color,
                     "horizLineProperties.linewidth": 2,
                     "horizLineProperties.linestyle": 2,
                     "showPrice": true,
                     "text": title,
                 });
             };

             addLine(prices.entry, "Entry", "#3b82f6");
             addLine(prices.tp1, "TP1", theme === 'dark' ? "#22C55E" : "#16A34A");
             addLine(prices.tp2, "TP2", theme === 'dark' ? "#22C55E" : "#16A34A");
             addLine(prices.sl, "SL", theme === 'dark' ? "#EF4444" : "#DC2626");
         };
         
         // The 'ready' method is used for the Advanced Chart Widget loaded via tv.js.
         // This ensures the callback is fired only when the chart is fully loaded and interactive.
         widget.ready(handleChartReady);


        return () => {
            if (widgetRef.current) {
                if (containerRef.current && containerRef.current.childElementCount > 0) {
                    try {
                        widgetRef.current.remove();
                    } catch (e) {
                        console.error("Error removing TradingView widget", e);
                    }
                }
                widgetRef.current = null;
            }
        };
    }, [signal, chartContainerId, theme]);

    return (
        <div className="bg-card dark:bg-dark-card border border-border dark:border-dark-border p-4 rounded-xl h-[550px] w-full flex flex-col">
            <h3 className="font-bold text-lg text-text-main dark:text-dark-text-main mb-2">Price Chart</h3>
            <div id={chartContainerId} ref={containerRef} className="flex-1 w-full" />
        </div>
    );
};

export const PriceChart = React.memo(PriceChartComponent);