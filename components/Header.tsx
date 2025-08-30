import React, { useState } from 'react';
import { View, Theme } from '../types';
import TickerTapeWidget from './TickerTapeWidget';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  theme: Theme;
  toggleTheme: () => void;
  watchlist: string[];
}

interface NavLinkProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const NavLink: React.FC<NavLinkProps> = React.memo(({ label, isActive, onClick }) => {
    const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200";
    const activeClasses = "bg-accent-soft text-accent";
    const inactiveClasses = "text-text-muted dark:text-dark-text-muted hover:text-text-main dark:hover:text-dark-text-main hover:bg-card dark:hover:bg-dark-card";

    return (
        <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {label}
        </button>
    );
});


const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, theme, toggleTheme, watchlist }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMobileLinkClick = (view: View) => {
    setCurrentView(view);
    setIsMenuOpen(false);
  };
  
  const navItems = [
    { view: View.DASHBOARD, label: 'Dashboard' },
    { view: View.AI, label: 'AI Generator' },
    { view: View.NEWS, label: 'News' },
    { view: View.CALENDAR, label: 'Calendar' },
    { view: View.MARKETS, label: 'Markets' },
    { view: View.CHART, label: 'Chart' },
    { view: View.HISTORY, label: 'History' },
    { view: View.ABOUT, label: 'About' },
  ];

  return (
    <header className="bg-background/80 dark:bg-dark-background/80 backdrop-blur-sm sticky top-0 z-20">
      {watchlist.length > 0 && <TickerTapeWidget watchlist={watchlist} theme={theme} />}
      
      <div className="relative border-b border-border dark:border-dark-border">
        <div className="container mx-auto px-4 md:px-6">
            <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView(View.DASHBOARD)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.5L13.84 8.16L19.5 10L13.84 11.84L12 17.5L10.16 11.84L4.5 10L10.16 8.16L12 2.5Z" fill="#3B82F6"/>
                        <path d="M20.5 15.5L19.66 17.66L17.5 18.5L19.66 19.34L20.5 21.5L21.34 19.34L23.5 18.5L21.34 17.66L20.5 15.5Z" fill="#3B82F6"/>
                    </svg>
                    <span className="text-xl font-medium text-text-main dark:text-dark-text-main">AI Signals</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                    <nav className="hidden md:flex items-center gap-2">
                        {navItems.map(item => (
                            <NavLink 
                                key={item.view}
                                label={item.label}
                                isActive={currentView === item.view} 
                                onClick={() => setCurrentView(item.view)}
                            />
                        ))}
                    </nav>
                    <button
                        onClick={() => setCurrentView(View.SETTINGS)}
                        className={`p-2 rounded-full text-text-muted dark:text-dark-text-muted hover:bg-card dark:hover:bg-dark-card transition-colors ${currentView === View.SETTINGS ? 'bg-accent-soft text-accent' : ''}`}
                        aria-label="View settings"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0l-.1.41a1.5 1.5 0 01-2.1 1.44l-.4-.2a1.5 1.5 0 00-1.92.51l-.54.93a1.5 1.5 0 00.13 1.91l.33.39a1.5 1.5 0 010 2.12l-.33.39a1.5 1.5 0 00-.13 1.91l.54.93a1.5 1.5 0 001.92.51l.4-.2a1.5 1.5 0 012.1 1.44l.1.41c.38 1.56 2.6 1.56 2.98 0l.1-.41a1.5 1.5 0 012.1-1.44l.4.2a1.5 1.5 0 001.92-.51l.54-.93a1.5 1.5 0 00-.13-1.91l-.33-.39a1.5 1.5 0 010-2.12l.33.39a1.5 1.5 0 00.13-1.91l-.54-.93a1.5 1.5 0 00-1.92-.51l-.4.2a1.5 1.5 0 01-2.1-1.44l-.1-.41zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-text-muted dark:text-dark-text-muted hover:bg-card dark:hover:bg-dark-card transition-colors"
                        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme === 'light' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                        ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.706-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                        )}
                    </button>
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-full text-text-muted dark:text-dark-text-muted hover:bg-card dark:hover:bg-dark-card transition-colors"
                            aria-label="Toggle menu"
                            aria-expanded={isMenuOpen}
                        >
                            {isMenuOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 w-full bg-background dark:bg-dark-background border-b border-border dark:border-dark-border p-4 animate-fade-in shadow-lg">
                <nav className="flex flex-col gap-2 [&>button]:w-full [&>button]:text-left [&>button]:py-3 [&>button]:text-base">
                    {navItems.map(item => (
                        <NavLink 
                            key={item.view}
                            label={item.label}
                            isActive={currentView === item.view} 
                            onClick={() => handleMobileLinkClick(item.view)}
                        />
                    ))}
                </nav>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;