
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NewsZone, NotificationSettings, ZoneSource, Article } from './types';
import NavigationSidebar from './components/NavigationSidebar';
import NewsFeed from './components/NewsFeed';
import SettingsDrawer from './components/SettingsDrawer';
import ZoneEditModal from './components/ZoneEditModal';
import SourceManagementDashboard from './components/SourceManagementDashboard';
import HeroCarousel from './components/HeroCarousel';
import FeaturedBoxCard from './components/FeaturedBoxCard';
import StandardArticleRow from './components/StandardArticleRow';
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from './contexts/LanguageContext';
import { mapChunksToArticles } from './utils';
import Toast from './components/Toast';

// Initial Data
const INITIAL_ZONES: NewsZone[] = [
  {
    id: '2',
    title: 'News & Current Affairs',
    sources: [
      { name: 'INSPARK LAB', url: 'https://insparklab.com/feed/' },
      { name: 'BBC News 中文', url: 'https://feeds.bbci.co.uk/zhongwen/trad/rss.xml' },
      { name: 'BBC (World)', url: 'https://feeds.bbci.co.uk/news/rss.xml' }
    ],
    isLoading: false
  },
  {
    id: '3',
    title: 'Blockchain',
    sources: [
      { name: 'WEB 3+', url: 'https://web3plus.bnext.com.tw/rss' },
      { name: 'PANews', url: 'https://rss.panewslab.com/zh/rss.xml' }
    ],
    isLoading: false
  }
];

const INITIAL_SETTINGS: NotificationSettings = {
  enabled: false,
  email: '',
  time: '08:00'
};

function App() {
  const { t, language, setLanguage } = useLanguage();

  // State
  const [zones, setZones] = useState<NewsZone[]>([]);
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>(INITIAL_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Zone Editing State
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<NewsZone | null>(null);

  // Source Management State
  const [isSourceManagerOpen, setIsSourceManagerOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  // Expansion State (for Read More)
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);

  // Ref to disable scroll spy temporarily during click scrolling
  const isClickScrolling = useRef(false);
  const allNewsJustInRef = useRef<HTMLDivElement>(null);

  // Load Data
  useEffect(() => {
    const storedZones = localStorage.getItem('nexus_zones');
    const storedSettings = localStorage.getItem('nexus_settings');
    
    if (storedZones) {
      try {
        let parsedZones = JSON.parse(storedZones);
        // Migration: If zones have 'queries' but not 'sources', map them
        parsedZones = parsedZones.map((z: any) => {
          if (!z.sources && z.queries) {
            return {
              ...z,
              sources: z.queries.map((q: string) => ({ name: q, url: '' }))
            };
          }
          return z;
        });
        setZones(parsedZones);
        if (parsedZones.length > 0) setActiveZoneId(null); // Default to Home/All News on load
      } catch (e) {
        console.error("Failed to parse zones", e);
        setZones(INITIAL_ZONES);
        setActiveZoneId(null);
      }
    } else {
      setZones(INITIAL_ZONES);
      setActiveZoneId(null);
    }

    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      const migratedSettings: NotificationSettings = {
        enabled: parsed.enabled ?? false,
        email: parsed.email ?? '',
        time: parsed.time ?? '08:00'
      };
      setSettings(migratedSettings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('nexus_zones', JSON.stringify(zones));
  }, [zones]);

  useEffect(() => {
    localStorage.setItem('nexus_settings', JSON.stringify(settings));
  }, [settings]);

  // Scroll Spy Logic
  useEffect(() => {
    const observerOptions = {
      root: null,
      // Trigger when the element hits the top 20% of the screen
      rootMargin: '-10% 0px -80% 0px', 
      threshold: 0
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      if (isClickScrolling.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id === 'all-news-section') {
            setActiveZoneId(null);
          } else if (id.startsWith('zone-')) {
             const zoneId = id.replace('zone-', '');
             setActiveZoneId(zoneId);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe "All News" Section
    const allNewsEl = document.getElementById('all-news-section');
    if (allNewsEl) observer.observe(allNewsEl);

    // Observe Individual Zones
    zones.forEach(zone => {
      const el = document.getElementById(`zone-${zone.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [zones]);


  // Handlers
  const updateZone = (id: string, data: Partial<NewsZone>) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, ...data } : z));
  };

  const deleteZone = (id: string) => {
    if(window.confirm(t('confirmDelete'))) {
      const newZones = zones.filter(z => z.id !== id);
      setZones(newZones);
      if (activeZoneId === id) {
        setActiveZoneId(null);
      }
    }
  };

  const handleReorderZones = (newZones: NewsZone[]) => {
    setZones(newZones);
  };

  // Navigation Handler: Scroll to View
  const scrollToZone = (id: string | null) => {
    // Disable scroll spy temporarily to prevent jitter/wrong highlighting during scroll
    isClickScrolling.current = true;
    setActiveZoneId(id);
    setIsMobileMenuOpen(false); 
    
    if (!id) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setTimeout(() => {
        const element = document.getElementById(`zone-${id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }

    // Re-enable scroll spy after animation
    setTimeout(() => {
      isClickScrolling.current = false;
    }, 1000);
  };

  const handleOpenAddZone = () => {
    setEditingZone(null);
    setIsZoneModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleOpenEditZone = (zone: NewsZone) => {
    setEditingZone(zone);
    setIsZoneModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleSaveZone = (title: string, sources: ZoneSource[]) => {
    if (editingZone) {
      // Update Existing
      setZones(prev => prev.map(z => z.id === editingZone.id ? {
        ...z,
        title,
        sources,
        // Invalidate cache if sources change
        articles: JSON.stringify(z.sources) !== JSON.stringify(sources) ? undefined : z.articles
      } : z));
    } else {
      // Create New
      const newZone: NewsZone = {
        id: uuidv4(),
        title,
        sources,
        isLoading: false
      };
      const newZones = [...zones, newZone];
      setZones(newZones);
      // Timeout to allow DOM render before scroll
      setTimeout(() => scrollToZone(newZone.id), 100);
    }
    setIsZoneModalOpen(false);
    setEditingZone(null);
  };

  // --- SOURCE MANAGEMENT HANDLERS ---
  const handleMoveSource = (source: ZoneSource, fromZoneId: string, toZoneId: string) => {
    setZones(prevZones => {
      // 1. Remove from old zone
      const withoutSource = prevZones.map(z => {
        if (z.id === fromZoneId) {
          return { 
            ...z, 
            sources: z.sources.filter(s => s.url !== source.url || s.name !== source.name),
            articles: undefined // Invalidate cache
          };
        }
        return z;
      });

      // 2. Add to new zone (checking for duplicates)
      return withoutSource.map(z => {
        if (z.id === toZoneId) {
           const exists = z.sources.some(s => s.url === source.url);
           if (exists) return z;
           
           return { 
             ...z, 
             sources: [...z.sources, source],
             articles: undefined // Invalidate cache
           };
        }
        return z;
      });
    });
  };

  const handleDeleteSource = (source: ZoneSource, fromZoneId: string) => {
    setZones(prevZones => prevZones.map(z => {
      if (z.id === fromZoneId) {
        return { 
          ...z, 
          sources: z.sources.filter(s => s.url !== source.url || s.name !== source.name),
          articles: undefined // Invalidate cache
        };
      }
      return z;
    }));
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh-TW' : 'en');
  };

  const showToast = (message: string) => {
    setToast({ message, visible: true });
  };

  const toggleTopicExpansion = (id: string) => {
    setExpandedTopics(prev => {
      const isExpanded = prev.includes(id);
      // If collapsing and it's the all-news section, scroll to top of its Just In section
      if (isExpanded && id === 'all-news' && allNewsJustInRef.current) {
        allNewsJustInRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      return isExpanded ? prev.filter(tid => tid !== id) : [...prev, id];
    });
  };

  // Aggregation Logic for "All News" Section
  // Memoized to prevent reshuffling on every render and implement pinning logic
  const allArticles = useMemo(() => {
    // 1. Flatten all chunks from all zones
    const allChunks = zones.flatMap(z => z.articles || []);

    // 2. Sort by date (Freshest first)
    allChunks.sort((a, b) => {
      const dateA = a.meta?.publishedAt ? new Date(a.meta.publishedAt).getTime() : 0;
      const dateB = b.meta?.publishedAt ? new Date(b.meta.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
    
    const articles = mapChunksToArticles(allChunks);
    
    // Separation: INSpark vs Others
    const insparkArticles = articles.filter(a => 
      (a.source && a.source.toUpperCase().includes('INSPARK')) || 
      (a.url && a.url.includes('insparklab.com'))
    );

    // Final Construction List
    const finalArticles: Article[] = [];
    const usedIds = new Set<string>();

    const addArticle = (art: Article) => {
        if (!usedIds.has(art.id)) {
            finalArticles.push(art);
            usedIds.add(art.id);
        }
    };

    // --- TIER 1: HERO (6 Items) ---
    
    // Slot 1: Reserved for Newest INSpark Article
    if (insparkArticles.length > 0) {
        addArticle(insparkArticles[0]);
    }

    // Slots 2-6: Fill with freshest mix (skipping used)
    for (const art of articles) {
        if (finalArticles.length >= 6) break;
        addArticle(art);
    }

    // --- TIER 2: FEATURED (4 Items) - Starts at index 6 ---
    
    // Slot 7 (Featured #1): Reserved for NEXT available INSpark Article
    const nextInspark = insparkArticles.find(a => !usedIds.has(a.id));
    if (nextInspark) {
        addArticle(nextInspark);
    }

    // Slots 8-10: Fill with freshest mix (skipping used)
    for (const art of articles) {
        if (finalArticles.length >= 10) break;
        addArticle(art);
    }

    // --- TIER 3: REST ---
    for (const art of articles) {
        addArticle(art);
    }
    
    return finalArticles;
  }, [zones]); 
  
  // 3-Tier Slicing
  const heroArticles = allArticles.slice(0, 6); // Tier 1: Top 6
  const featuredArticles = allArticles.slice(6, 10); // Tier 2: Next 4
  
  // Tier 3: Check expansion
  const isAllNewsExpanded = expandedTopics.includes('all-news');
  const standardArticles = isAllNewsExpanded ? allArticles.slice(10) : allArticles.slice(10, 16);
  const hasMoreAllNews = allArticles.length > 16;

  return (
    <div className="min-h-screen bg-deep-100 text-deep-500 font-sans flex flex-col">
      
      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out h-full overflow-y-auto">
            <div className="p-4 flex items-center justify-between border-b border-deep-200">
              <span className="text-lg font-bold text-deep-500">Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-deep-400 hover:text-deep-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <NavigationSidebar 
                zones={zones}
                activeZoneId={activeZoneId}
                onSelectZone={scrollToZone}
                onAddZone={handleOpenAddZone}
                onOpenSettings={() => {
                  setIsSettingsOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                onEditZone={handleOpenEditZone}
                onReorderZones={handleReorderZones}
                onOpenSourceManager={() => {
                  setIsSourceManagerOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-deep-500 border-b border-deep-400 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
           <div className="flex items-center gap-4">
             {/* Hamburger Button (Mobile Only) */}
             <button 
               onClick={() => setIsMobileMenuOpen(true)}
               className="lg:hidden text-deep-200 hover:text-white focus:outline-none"
               aria-label="Open menu"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
               </svg>
             </button>

             <button 
               onClick={() => scrollToZone(null)}
               className="flex items-center gap-3 focus:outline-none hover:opacity-90 transition-opacity"
               aria-label={t('home')}
             >
                <span className="text-xl font-bold text-white tracking-tight">INSpark Daily</span>
              </button>
           </div>
            <button 
                onClick={toggleLanguage}
                className="text-xs font-medium text-deep-200 hover:text-white transition-colors border border-deep-400 hover:border-deep-200 rounded px-2 py-1"
              >
                <span className={language === 'en' ? 'text-white font-bold' : ''}>EN</span>
                <span className="mx-1">/</span>
                <span className={language === 'zh-TW' ? 'text-white font-bold' : ''}>繁中</span>
              </button>
        </div>
      </header>

      {/* Main Portal Layout */}
      <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Navigation (2 cols) - Hidden on Mobile */}
          <aside className="hidden lg:block lg:col-span-2 sticky top-24 self-start h-[calc(100vh-6rem)] overflow-y-auto">
            <NavigationSidebar 
              zones={zones}
              activeZoneId={activeZoneId}
              onSelectZone={scrollToZone}
              onAddZone={handleOpenAddZone}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onEditZone={handleOpenEditZone}
              onReorderZones={handleReorderZones}
              onOpenSourceManager={() => setIsSourceManagerOpen(true)}
            />
          </aside>

          {/* Center Column: Content (10 cols on Desktop, 1 col on Mobile) */}
          <main className="lg:col-span-10 min-h-[600px]">
             
             {/* ALL NEWS SECTION WRAPPER (Observed by Scroll Spy) */}
             <div id="all-news-section" className="scroll-mt-28">
               {/* --- TIER 1: Hero Carousel --- */}
               {heroArticles.length > 0 && (
                 <div className="mb-8 md:mb-12">
                    <HeroCarousel articles={heroArticles} />
                 </div>
               )}

               {/* --- TIER 2: Featured Grid (4 Boxes) --- */}
               {featuredArticles.length > 0 && (
                 <div className="mb-12">
                    <h2 className="text-lg font-bold text-deep-500 border-b border-deep-200 pb-2 mb-6 uppercase tracking-wide">
                      {t('featured')}
                    </h2>
                    {/* Mobile: 1 col, Desktop: 4 cols */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                       {featuredArticles.map(article => (
                         <FeaturedBoxCard key={article.id} article={article} />
                       ))}
                    </div>
                 </div>
               )}

               {/* --- TIER 3: Standard List (6 Lines) --- */}
               {standardArticles.length > 0 && (
                 <div className="mb-16" ref={allNewsJustInRef}>
                    <h2 className="text-lg font-bold text-deep-500 border-b border-deep-200 pb-2 mb-6 uppercase tracking-wide">
                      {t('justIn')}
                    </h2>
                    <div className="flex flex-col">
                      {standardArticles.map(article => (
                        <StandardArticleRow key={article.id} article={article} />
                      ))}
                    </div>
                    
                    {/* Read More Button for All News */}
                    {hasMoreAllNews && (
                      <div className="mt-6 flex justify-center">
                        <button
                          onClick={() => toggleTopicExpansion('all-news')}
                          className="px-6 py-2 bg-deep-100 text-deep-400 font-medium rounded-full border border-deep-200 hover:bg-deep-200 hover:text-deep-500 transition-all shadow-sm"
                        >
                          {isAllNewsExpanded ? t('showLess') : t('readMore')}
                        </button>
                      </div>
                    )}
                 </div>
               )}
             </div>

             {/* --- ZONES FEED --- */}
             {zones.length > 0 ? (
               <div className="space-y-16">
                 {zones.map((zone) => (
                   <div 
                      key={zone.id} 
                      id={`zone-${zone.id}`} 
                      className="scroll-mt-28 bg-white rounded-lg shadow-sm p-4 md:p-6 border border-deep-200/50"
                   >
                     <NewsFeed 
                       zone={zone}
                       onUpdate={updateZone}
                       onDelete={deleteZone}
                       onEdit={handleOpenEditZone}
                       onError={showToast}
                       isExpanded={expandedTopics.includes(zone.id)}
                       onToggleExpand={() => toggleTopicExpansion(zone.id)}
                     />
                   </div>
                 ))}
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-deep-300 bg-white rounded-lg shadow-sm p-12 border border-deep-200/50">
                 <p className="mb-4">{t('noZones')}</p>
                 <button onClick={handleOpenAddZone} className="text-deep-400 underline font-medium">
                   {t('createFirstZone')}
                 </button>
               </div>
             )}
          </main>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-deep-500 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-deep-200 font-light mb-4">
            {t('footerSlogan')}
          </p>
          <div className="flex flex-col items-center gap-2">
            <a 
              href="https://insparklab.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-deep-100 hover:text-white font-medium transition-colors"
            >
              {t('officialWebsite')}
            </a>
            <p className="text-xs text-deep-200 opacity-60">&copy; {new Date().getFullYear()} INSpark.Lab All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Settings Drawer */}
      <SettingsDrawer 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        zones={zones}
      />

      {/* Zone Edit Modal */}
      <ZoneEditModal
        isOpen={isZoneModalOpen}
        onClose={() => setIsZoneModalOpen(false)}
        onSave={handleSaveZone}
        initialZone={editingZone}
      />

      {/* Source Management Dashboard */}
      <SourceManagementDashboard
        isOpen={isSourceManagerOpen}
        onClose={() => setIsSourceManagerOpen(false)}
        zones={zones}
        onMoveSource={handleMoveSource}
        onDeleteSource={handleDeleteSource}
      />

      {/* Toast Notifications */}
      <Toast 
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

    </div>
  );
}

export default App;
