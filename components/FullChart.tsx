import React, { useEffect, useRef, useMemo } from 'react';
import { getTradingViewSymbol } from '../utils/tradingView';
import { Theme } from '../types';

declare global {
    interface Window {
        TradingView: any;
    }
}

interface FullChartProps {
    assetName: string;
    showDetails: boolean;
    showRsi: boolean;
    showMa: boolean;
    showMacd: boolean;
    showDrawingToolbar: boolean;
    chartStyle: string;
    interval: string;
    theme: Theme;
}

const FullChartComponent: React.FC<FullChartProps> = ({ assetName, showDetails, showRsi, showMa, showMacd, showDrawingToolbar, chartStyle, interval, theme }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<any>(null);

    const chartContainerId = useMemo(
        () => `tradingview-chart-container-${Math.random().toString(36).substr(2, 9)}`,
        []
    );

    useEffect(() => {
        const cleanup = () => {
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
        }
        
        if (!containerRef.current || typeof window.TradingView === 'undefined' || !assetName) {
            return cleanup;
        }

        const symbol = getTradingViewSymbol(assetName);
        if (!symbol) {
            if (containerRef.current) {
                containerRef.current.innerHTML = `<p class="text-text-muted dark:text-dark-text-muted p-4 flex items-center justify-center h-full">Could not load chart for ${assetName}.</p>`;
            }
            return cleanup;
        }

        const studies = [];
        if (showRsi) studies.push("RSI@tv-basicstudies");
        if (showMa) studies.push("MASimple@tv-basicstudies");
        if (showMacd) studies.push("MACD@tv-basicstudies");

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
            "studyStyles.Volume.color": "rgba(59, 130, 246, 0.2)",
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
            "studyStyles.Volume.color": "rgba(59, 130, 246, 0.1)",
        };

        const widgetOptions = {
            autosize: true,
            symbol: symbol,
            interval: interval,
            timezone: 'Etc/UTC',
            theme: theme,
            style: chartStyle,
            locale: 'en',
            toolbar_bg: theme === 'dark' ? '#010a17' : '#F9FAFB',
            enable_publishing: false,
            hide_side_toolbar: !showDrawingToolbar,
            allow_symbol_change: false,
            container_id: chartContainerId,
            details: showDetails,
            studies: studies,
            overrides: overrides,
            backgroundColor: theme === 'dark' ? '#010a17' : '#F9FAFB',
        };

        if (containerRef.current) {
            containerRef.current.innerHTML = '';
        }

        const widget = new window.TradingView.widget(widgetOptions);
        widgetRef.current = widget;

        return cleanup;
        
    }, [assetName, showDetails, showRsi, showMa, showMacd, showDrawingToolbar, chartStyle, interval, chartContainerId, theme]);

    return (
        <div className="bg-card dark:bg-dark-card border border-border dark:border-dark-border p-2 rounded-xl h-[75vh] w-full flex flex-col">
            <div id={chartContainerId} ref={containerRef} className="flex-1 w-full" />
        </div>
    );
};

export const FullChart = React.memo(FullChartComponent);