import React, { useState, useMemo } from 'react';
import { Theme, ChartSettings, AssetCategory } from '../types';
import { FullChart } from './FullChart';
import { ASSETS } from '../constants';

const ChartControl: React.FC<{label: string, children: React.ReactNode}> = ({label, children}) => (
    <div>
        <label className="block text-sm font-medium text-text-muted dark:text-dark-text-muted mb-1">{label}</label>
        {children}
    </div>
);

const CheckboxControl: React.FC<{label: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({label, checked, onChange}) => (
    <label className="flex items-center space-x-2 cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="form-checkbox h-4 w-4 text-accent bg-card dark:bg-dark-card border-border dark:border-dark-border rounded focus:ring-accent" />
        <span className="text-sm text-text-main dark:text-dark-text-main">{label}</span>
    </label>
);

const FullChartPage: React.FC<{ theme: Theme }> = ({ theme }) => {
    const [selectedAsset, setSelectedAsset] = useState<string>('Bitcoin (BTCUSD)');
    const [settings, setSettings] = useState<ChartSettings>({
        showDetails: true,
        showRsi: true,
        showMa: true,
        showMacd: false,
        showDrawingToolbar: false,
        chartStyle: '1', // Candlesticks
        interval: 'D', // Daily
    });

    const handleSettingChange = (key: keyof ChartSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings(prev => ({ ...prev, [key]: e.target.checked }));
    };

    const handleSelectChange = (key: keyof ChartSettings) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSettings(prev => ({ ...prev, [key]: e.target.value }));
    };

    const groupedAssets = useMemo(() => {
        return ASSETS.reduce((acc, asset) => {
            const category = asset.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(asset);
            return acc;
        }, {} as Record<AssetCategory, any[]>);
    }, []);

    const intervals = useMemo(() => [
        { value: '1', label: '1 minute' },
        { value: '5', label: '5 minutes' },
        { value: '15', label: '15 minutes' },
        { value: '30', label: '30 minutes' },
        { value: '60', label: '1 hour' },
        { value: '240', label: '4 hours' },
        { value: 'D', label: '1 day' },
        { value: 'W', label: '1 week' },
    ], []);

    const chartStyles = useMemo(() => [
        { value: '0', label: 'Bars' },
        { value: '1', label: 'Candles' },
        { value: '2', label: 'Line' },
        { value: '3', label: 'Area' },
        { value: '9', label: 'Hollow Candles' },
        { value: '8', label: 'Heikin Ashi' },
    ], []);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-text-main dark:text-dark-text-main">Advanced Charting</h1>
                <p className="text-text-muted dark:text-dark-text-muted max-w-2xl mx-auto">Full-featured TradingView chart for in-depth technical analysis.</p>
            </div>

            <div className="bg-card/50 dark:bg-dark-card/50 p-4 rounded-xl border border-border dark:border-dark-border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <ChartControl label="Asset">
                    <select
                        value={selectedAsset}
                        onChange={(e) => setSelectedAsset(e.target.value)}
                        className="w-full bg-input-bg dark:bg-dark-input-bg border border-border dark:border-dark-border rounded-lg p-2 text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-accent"
                    >
                        {Object.entries(groupedAssets).map(([category, assetsInCategory]) => (
                            <optgroup key={category} label={category}>
                                {assetsInCategory.map(asset => (
                                    <option key={asset.name} value={asset.name}>{asset.name}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </ChartControl>

                <ChartControl label="Timeframe">
                    <select value={settings.interval} onChange={handleSelectChange('interval')} className="w-full bg-input-bg dark:bg-dark-input-bg border border-border dark:border-dark-border rounded-lg p-2 text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-accent">
                        {intervals.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                </ChartControl>

                <ChartControl label="Chart Style">
                    <select value={settings.chartStyle} onChange={handleSelectChange('chartStyle')} className="w-full bg-input-bg dark:bg-dark-input-bg border border-border dark:border-dark-border rounded-lg p-2 text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-accent">
                        {chartStyles.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                </ChartControl>
                
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-text-muted dark:text-dark-text-muted">Indicators & Tools</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        <CheckboxControl label="Details" checked={settings.showDetails} onChange={handleSettingChange('showDetails')} />
                        <CheckboxControl label="Toolbar" checked={settings.showDrawingToolbar} onChange={handleSettingChange('showDrawingToolbar')} />
                        <CheckboxControl label="RSI" checked={settings.showRsi} onChange={handleSettingChange('showRsi')} />
                        <CheckboxControl label="MA" checked={settings.showMa} onChange={handleSettingChange('showMa')} />
                        <CheckboxControl label="MACD" checked={settings.showMacd} onChange={handleSettingChange('showMacd')} />
                    </div>
                </div>
            </div>

            <FullChart
                assetName={selectedAsset}
                theme={theme}
                {...settings}
            />
        </div>
    );
};

export default FullChartPage;
