import React, { useState, useEffect, useCallback } from 'react';
import { Signal, DataSource, View, Theme, UserProfile } from './types';
import SignalGeneratorPage from './components/SignalGeneratorPage';
import SignalHistoryPage from './components/SignalHistoryPage';
import AboutPage from './components/AboutPage';
import MarketsPage from './components/MarketsPage';
import FullChartPage from './components/FullChartPage';
import Header from './components/Header';
import Footer from './components/Footer';
import DashboardPage from './components/DashboardPage';
import NewsPage from './components/NewsPage';
import { INITIAL_WATCHLIST_ASSETS } from './constants';
import ScrollToTopButton from './components/ScrollToTopButton';
import ProfilePage from './components/ProfilePage';
import EconomicCalendarPage from './components/EconomicCalendarPage';

const App: React.FC = () => {
  const [signalHistory, setSignalHistory] = useState<Signal[]>([]);
  const [featuredSites, setFeaturedSites] = useState<DataSource[]>([]);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [theme, setTheme] = useState<Theme>('dark');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    tradingStyle: 'Swing Trader',
    riskTolerance: 'Medium',
  });

  useEffect(() => {
    // Theme initialization
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (prefersDark) {
        setTheme('dark');
    } else {
        setTheme('light');
    }
  }, []);

  useEffect(() => {
    // Apply theme class to root element and save to local storage
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('signalHistory');
      if (storedHistory) {
        setSignalHistory(JSON.parse(storedHistory));
      }
      const storedSites = localStorage.getItem('featuredSites');
      if (storedSites) {
        setFeaturedSites(JSON.parse(storedSites));
      }
      const storedWatchlist = localStorage.getItem('watchlist');
      if (storedWatchlist) {
        setWatchlist(JSON.parse(storedWatchlist));
      } else {
        setWatchlist(INITIAL_WATCHLIST_ASSETS);
        localStorage.setItem('watchlist', JSON.stringify(INITIAL_WATCHLIST_ASSETS));
      }
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  const handleProfileUpdate = useCallback((newProfile: UserProfile) => {
    setUserProfile(newProfile);
    try {
        localStorage.setItem('userProfile', JSON.stringify(newProfile));
    } catch (error) {
        console.error("Failed to save user profile to localStorage", error);
    }
  }, []);

  useEffect(() => {
    const now = new Date().getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    let needsUpdate = false;

    const updatedHistory = signalHistory.map(signal => {
        if (signal.status === 'Live' && (now - new Date(signal.updateTime).getTime() > twentyFourHours)) {
            needsUpdate = true;
            return { ...signal, status: 'Expired' as const };
        }
        return signal;
    });

    if (needsUpdate) {
        setSignalHistory(updatedHistory);
        try {
            localStorage.setItem('signalHistory', JSON.stringify(updatedHistory));
        } catch (error) {
            console.error("Failed to save updated signal history to localStorage", error);
        }
    }
  }, [signalHistory]);

  const addSignalToHistory = useCallback((signal: Omit<Signal, 'status'>) => {
    const newSignalWithStatus: Signal = { ...signal, status: 'Live' };
    setSignalHistory(prevHistory => {
      const newHistory = [newSignalWithStatus, ...prevHistory];
      try {
        localStorage.setItem('signalHistory', JSON.stringify(newHistory));
      } catch (error) {
        console.error("Failed to save signal history to localStorage", error);
      }
      return newHistory;
    });

    setFeaturedSites(prevSites => {
        const excludedHosts = ['vertexaisearch.cloud.google.com'];
        const newSources: DataSource[] = signal.sources
            .map(source => {
                try {
                    const url = new URL(source.uri);
                     if (excludedHosts.includes(url.hostname)) {
                        return null;
                    }
                    return {
                        name: source.title,
                        url: source.uri,
                    };
                } catch {
                    return null;
                }
            })
            .filter((source): source is DataSource => source !== null);

        const combinedSources = [...prevSites, ...newSources];
        
        const uniqueSourcesMap = new Map<string, DataSource>();
        combinedSources.forEach(source => {
            try {
                const hostname = new URL(source.url).hostname.replace(/^www\./, '');
                if (!uniqueSourcesMap.has(hostname)) {
                    uniqueSourcesMap.set(hostname, source);
                }
            } catch {}
        });
        
        const uniqueNewSources = Array.from(uniqueSourcesMap.values());

        if (uniqueNewSources.length > prevSites.length) {
            try {
                localStorage.setItem('featuredSites', JSON.stringify(uniqueNewSources));
            } catch (error) {
                console.error("Failed to save featured sites to localStorage", error);
            }
            return uniqueNewSources;
        }

        return prevSites;
    });
  }, []);

  const addToWatchlist = useCallback((assetName: string) => {
    setWatchlist(prev => {
        if (prev.includes(assetName)) return prev;
        const newWatchlist = [...prev, assetName];
        try {
            localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
        } catch (error) {
            console.error("Failed to save watchlist to localStorage", error);
        }
        return newWatchlist;
    });
  }, []);

  const removeFromWatchlist = useCallback((assetName: string) => {
    setWatchlist(prev => {
        const newWatchlist = prev.filter(name => name !== assetName);
        try {
            localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
        } catch (error) {
            console.error("Failed to save watchlist to localStorage", error);
        }
        return newWatchlist;
    });
  }, []);


  const renderContent = () => {
    switch (currentView) {
        case View.DASHBOARD:
             return <DashboardPage
                latestSignal={signalHistory[0]}
                setCurrentView={setCurrentView}
            />;
        case View.AI:
            return <SignalGeneratorPage 
                addSignalToHistory={addSignalToHistory} 
                watchlist={watchlist}
                addToWatchlist={addToWatchlist}
                removeFromWatchlist={removeFromWatchlist}
                theme={theme}
                userProfile={userProfile}
            />;
        case View.NEWS:
            return <NewsPage />;
        case View.CALENDAR:
            return <EconomicCalendarPage theme={theme} />;
        case View.MARKETS:
            return <MarketsPage theme={theme} />;
        case View.CHART:
            return <FullChartPage theme={theme} />;
        case View.HISTORY:
            return <SignalHistoryPage signalHistory={signalHistory} theme={theme} />;
        case View.ABOUT:
            return <AboutPage featuredSites={featuredSites} />;
        case View.SETTINGS:
            return <ProfilePage 
                userProfile={userProfile} 
                onProfileUpdate={handleProfileUpdate} 
                watchlist={watchlist}
                addToWatchlist={addToWatchlist}
                removeFromWatchlist={removeFromWatchlist}
            />;
        default:
             return <DashboardPage
                latestSignal={signalHistory[0]}
                setCurrentView={setCurrentView}
            />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-card to-background dark:from-dark-background dark:to-black font-sans flex flex-col">
      <Header 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        watchlist={watchlist}
      />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        {renderContent()}
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default App;
