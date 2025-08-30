import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getNewsWithSentiment } from '../services/geminiService';
import { NewsArticle, AssetCategory } from '../types';

const NewsCard: React.FC<{ article: NewsArticle }> = React.memo(({ article }) => {
    const sentimentStyles: { [key: string]: { icon: string; classes: string } } = {
        Bullish: { icon: '🐂', classes: 'bg-success-soft text-success' },
        Bearish: { icon: '🐻', classes: 'bg-danger-soft text-danger' },
        Neutral: { icon: '➖', classes: 'bg-card dark:bg-dark-card text-text-muted dark:text-dark-text-muted' },
    };
    const style = sentimentStyles[article.sentiment] || sentimentStyles.Neutral;

    return (
        <div className="bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border flex flex-col justify-between h-full">
            <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-text-main dark:text-dark-text-main hover:text-accent transition-colors">
                        {article.title}
                    </a>
                    <span 
                        className={`text-sm font-semibold px-2 py-1 rounded-full flex-shrink-0 ${style.classes}`}
                        title={`AI Sentiment: ${article.sentiment}`}
                    >
                        {style.icon} {article.sentiment}
                    </span>
                </div>
                <p className="text-sm text-text-muted dark:text-dark-text-muted mb-3">{article.snippet}</p>
                <div className="bg-background dark:bg-dark-background p-3 rounded-lg border border-border dark:border-dark-border text-sm">
                    <p className="font-semibold text-text-main dark:text-dark-text-main mb-1">AI Impact Summary:</p>
                    <p className="text-accent">{article.impactSummary}</p>
                </div>
            </div>
            <p className="text-xs text-text-muted dark:text-dark-text-muted mt-4 text-right">Source: {article.sourceName}</p>
        </div>
    );
});

const NewsPage: React.FC = () => {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    
    const categories = useMemo(() => ['All', ...Object.values(AssetCategory)], []);

    const fetchNews = useCallback(async (category: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const articles = await getNewsWithSentiment(category);
            setNews(articles);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setNews([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNews(selectedCategory);
    }, [selectedCategory, fetchNews]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold text-text-main dark:text-dark-text-main">AI-Powered News</h1>
                <p className="text-text-muted dark:text-dark-text-muted max-w-2xl mx-auto">Latest market news with AI-driven sentiment analysis and impact summaries.</p>
            </div>

            <div className="sticky top-16 bg-background/80 dark:bg-dark-background/80 backdrop-blur-sm z-10 py-4 -mx-4 md:-mx-6 px-4 md:px-6">
                 <div className="flex flex-wrap justify-center gap-2">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full border transition-colors ${selectedCategory === category ? 'bg-accent-soft text-accent border-accent' : 'bg-card dark:bg-dark-card text-text-muted dark:text-dark-text-muted border-border dark:border-dark-border hover:border-accent-light'}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
            
            <div>
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-4 border-t-accent border-r-accent border-card/50 dark:border-dark-card/50 rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                     <div role="alert" className="bg-danger-soft border border-danger text-danger p-4 rounded-lg max-w-2xl mx-auto text-center">
                        <p className="font-semibold">Failed to load news</p>
                        <p className="text-sm mb-4">{error}</p>
                        <button onClick={() => fetchNews(selectedCategory)} className="bg-accent text-white font-semibold rounded-lg px-6 py-2 hover:bg-accent-hover transition-colors">
                            Try Again
                        </button>
                    </div>
                ) : news.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {news.map((article, index) => (
                            <NewsCard key={`${article.url}-${index}`} article={article} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl">
                        <p className="text-text-muted dark:text-dark-text-muted">No recent news found for this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsPage;