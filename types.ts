export enum View {
    DASHBOARD = 'DASHBOARD',
    NEWS = 'NEWS',
    HISTORY = 'HISTORY',
    AI = 'AI',
    ABOUT = 'ABOUT',
    MARKETS = 'MARKETS',
    CHART = 'CHART',
    SETTINGS = 'SETTINGS',
    CALENDAR = 'CALENDAR',
}

export enum AssetCategory {
  STOCKS = 'Stocks',
  FOREX = 'Forex',
  COMMODITIES = 'Commodities',
  INDICES = 'Indices',
  CRYPTO = 'Crypto',
}

export type Theme = 'light' | 'dark';

export interface Asset {
  name: string;
  category: AssetCategory;
}

export interface DataSource {
    name:string;
    url: string;
}

export interface SignalSource {
    title: string;
    uri: string;
}

export interface PivotPoints {
  r2: string;
  r1: string;
  pivot: string;
  s1: string;
  s2:string;
}

export interface Rsi {
  value: number;
  interpretation: string;
}

export interface Sma {
  sma20: string;
  sma50: string;
  sma100: string;
}

export interface Signal {
  assetName: string;
  updateTime: string;
  sources: SignalSource[];
  direction: 'BUY' | 'SELL';
  confidence: number;
  entryPrice: string;
  tp1: string;
  tp2: string;
  sl: string;
  strategyDescription: string;
  riskTip: string;
  pivotPoints: PivotPoints;
  rsi: Rsi;
  sma: Sma;
  status: 'Live' | 'Expired';
}

export interface NewsArticle {
    title: string;
    snippet: string;
    url: string;
    sourceName: string;
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
    impactSummary: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export type TradingStyle = 'Scalper' | 'Day Trader' | 'Swing Trader' | 'Position Trader';
export type RiskTolerance = 'Low' | 'Medium' | 'High';

export interface UserProfile {
    tradingStyle: TradingStyle;
    riskTolerance: RiskTolerance;
}

export interface ChartSettings {
    showDetails: boolean;
    showRsi: boolean;
    showMa: boolean;
    showMacd: boolean;
    showDrawingToolbar: boolean;
    chartStyle: string;
    interval: string;
}