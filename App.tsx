
import React, { useState, useEffect } from 'react';
import { NewsZone, NotificationSettings, ZoneSource } from './types';
import NavigationSidebar from './components/NavigationSidebar';
import NewsFeed from './components/NewsFeed';
import SettingsDrawer from './components/SettingsDrawer';
import ZoneEditModal from './components/ZoneEditModal';
import HeroCarousel from './components/HeroCarousel';
import FeaturedBoxCard from './components/FeaturedBoxCard';
import StandardArticleRow from './components/StandardArticleRow';
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from './contexts/LanguageContext';
import { mapChunksToArticles } from './utils';

// Initial Data
const INITIAL_ZONES: NewsZone[] = [
  { 
    id: '1', 
    title: 'Tech & AI', 
    sources: [
      { name: 'TechCrunch', url: 'https://techcrunch.com' },
      { name: 'OpenAI', url: 'https://openai.com/blog' }
    ],
    isLoading: false
  },
  { 
    id: '2', 
    title: 'Business', 
    sources: [
      { name: 'Bloomberg', url: 'https://www.bloomberg.com' },
      { name: 'WSJ', url: 'https://www.wsj.com' }
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
        if (parsedZones.length > 0) setActiveZoneId(parsedZones[0].id);
      } catch (e) {
        console.error("Failed to parse zones", e);
        setZones(INITIAL_ZONES);
        setActiveZoneId(INITIAL_ZONES[0].id);
      }
    } else {
      setZones(INITIAL_ZONES);
      setActiveZoneId(INITIAL_ZONES[0].id);
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

  // Handlers
  const updateZone = (id: string, data: Partial<NewsZone>) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, ...data } : z));
  };

  const deleteZone = (id: string) => {
    if(window.confirm(t('confirmDelete'))) {
      const newZones = zones.filter(z => z.id !== id);
      setZones(newZones);
      if (activeZoneId === id) {
        setActiveZoneId(newZones.length > 0 ? newZones[0].id : null);
      }
    }
  };

  // Navigation Handler: Scroll to View
  const scrollToZone = (id: string | null) => {
    setActiveZoneId(id);
    setIsMobileMenuOpen(false); // Close mobile menu on selection
    
    if (!id) {
      // Scroll to top for "All News" / Home
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Delay slightly to allow DOM update if needed (though content is statically rendered now)
    setTimeout(() => {
      const element = document.getElementById(`zone-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
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
      setTimeout(() => scrollToZone(newZone.id), 100);
    }
    setIsZoneModalOpen(false);
    setEditingZone(null);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh-TW' : 'en');
  };

  // Aggregation Logic for "All News" Section
  const getAggregatedArticles = () => {
    const allChunks = zones.flatMap(z => z.articles || []);
    const articles = mapChunksToArticles(allChunks);
    // Shuffle simply for variety using a sort with random
    return articles.sort(() => Math.random() - 0.5);
  };

  const allArticles = getAggregatedArticles();
  
  // 3-Tier Slicing
  const heroArticles = allArticles.slice(0, 5); // Tier 1: Top 5
  const featuredArticles = allArticles.slice(5, 9); // Tier 2: Next 4
  const standardArticles = allArticles.slice(9, 15); // Tier 3: Next 6

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
            />
          </aside>

          {/* Center Column: Content (10 cols on Desktop, 1 col on Mobile) */}
          <main className="lg:col-span-10 min-h-[600px]">
             
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
               <div className="mb-16">
                  <h2 className="text-lg font-bold text-deep-500 border-b border-deep-200 pb-2 mb-6 uppercase tracking-wide">
                    {t('justIn')}
                  </h2>
                  <div className="flex flex-col">
                    {standardArticles.map(article => (
                      <StandardArticleRow key={article.id} article={article} />
                    ))}
                  </div>
               </div>
             )}

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
      <footer className="bg-white border-t border-deep-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-deep-300 font-light mb-4">
            {t('footerSlogan')}
          </p>
          <div className="flex flex-col items-center gap-2">
            <a 
              href="https://insparklab.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-deep-400 hover:text-deep-500 font-medium transition-colors"
            >
              {t('officialWebsite')}
            </a>
            <p className="text-xs text-deep-200">&copy; {new Date().getFullYear()} INSpark.Lab All rights reserved.</p>
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

    </div>
  );
}

export default App;
