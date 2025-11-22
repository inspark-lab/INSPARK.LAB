
import React, { useEffect, useState } from 'react';
import { NewsZone, Article } from '../types';
import { fetchZoneNews } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import HeroCarousel from './HeroCarousel';
import FeaturedBoxCard from './FeaturedBoxCard';
import StandardArticleRow from './StandardArticleRow';
import { mapChunksToArticles } from '../utils';

interface NewsFeedProps {
  zone: NewsZone;
  onUpdate: (id: string, data: Partial<NewsZone>) => void;
  onDelete: (id: string) => void;
  onEdit: (zone: NewsZone) => void;
  onError: (message: string) => void;
  currentLoadCount: number;
  onLoadMore: () => void;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ 
  zone, 
  onUpdate, 
  onDelete, 
  onEdit, 
  onError, 
  currentLoadCount, 
  onLoadMore 
}) => {
  const { t } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (zone.articles && zone.articles.length > 0) {
         setArticles(mapChunksToArticles(zone.articles));
         return;
      }

      if (zone.isLoading) return;

      onUpdate(zone.id, { isLoading: true, error: undefined });
      try {
        const { chunks } = await fetchZoneNews(zone.title, zone.sources);
        onUpdate(zone.id, { 
          articles: chunks, 
          lastUpdated: Date.now(), 
          isLoading: false 
        });
        setArticles(mapChunksToArticles(chunks));
      } catch (err) {
        const errorMsg = t('errorFetch');
        onUpdate(zone.id, { 
            error: errorMsg, 
            isLoading: false 
        });
        onError(errorMsg);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone.id]);

  // 3-Tier Hierarchy Slicing
  // 1. Hero: Top 1
  const heroArticle = articles.slice(0, 1);
  
  // 2. Featured Story: Next 4 items (displayed as grid)
  const featuredArticles = articles.slice(1, 5);
  
  // 3. Just In: The rest (vertical list)
  // Starts at index 5. Shows 'currentLoadCount' items (default 6).
  const justInArticles = articles.slice(5, 5 + currentLoadCount);
  
  // Check if we have more articles than what is currently shown
  const hasMoreArticles = articles.length > (5 + currentLoadCount);

  if (zone.isLoading && articles.length === 0) {
      return (
          <div className="animate-pulse space-y-8">
              <div className="w-full h-[400px] bg-deep-200/20 rounded-lg"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[1,2,3,4].map(i => (
                      <div key={i} className="h-64 bg-deep-200/20 rounded-lg"></div>
                  ))}
              </div>
          </div>
      );
  }

  if (zone.error) {
      return (
          <div className="h-64 flex flex-col items-center justify-center text-center bg-white rounded-lg shadow-sm p-6">
              <p className="text-red-500 mb-2">{zone.error}</p>
              <button onClick={() => onUpdate(zone.id, { isLoading: false, error: undefined })} className="underline text-deep-400">{t('tryAgain')}</button>
          </div>
      );
  }

  if (articles.length === 0) {
      return <div className="p-10 text-center text-deep-300 bg-white rounded-lg shadow-sm">{t('noNews')}</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-end border-b border-deep-200 pb-4">
        <div>
            <h1 className="text-3xl font-bold text-deep-500">{zone.title}</h1>
            <div className="mt-1 flex flex-wrap gap-2">
                {zone.sources.map((s, i) => (
                     <a 
                       key={i} 
                       href={s.homepage || (s.url.startsWith('http') ? new URL(s.url).origin : s.url)} 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="inline-block bg-deep-100 text-deep-400 text-xs px-2 py-0.5 rounded-full border border-deep-200 hover:bg-deep-200 hover:text-deep-500 hover:shadow-sm transition-all cursor-pointer" 
                       title={s.homepage || s.url}
                       onClick={(e) => e.stopPropagation()}
                     >
                        {s.name}
                    </a>
                ))}
            </div>
        </div>
        <div className="flex gap-2 items-center">
            <button 
                onClick={() => onEdit(zone)} 
                className="text-xs text-deep-400 hover:text-deep-500 underline flex items-center gap-1"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                {t('editZone')}
            </button>
            <span className="text-deep-200">|</span>
            <button onClick={() => onUpdate(zone.id, { articles: undefined })} className="text-xs text-deep-400 hover:text-deep-500 underline">
                {t('refresh')}
            </button>
            <span className="text-deep-200">|</span>
            <button onClick={() => onDelete(zone.id)} className="text-xs text-red-400 hover:text-red-600 underline">
                {t('deleteZone')}
            </button>
        </div>
      </div>

      {/* Tier 1: Hero (Top 1) */}
      {heroArticle.length > 0 && (
        <div className="mb-12">
           <HeroCarousel articles={heroArticle} />
        </div>
      )}

      {/* Tier 2: Featured Story (Grid of 4) */}
      {featuredArticles.length > 0 && (
        <div className="mb-12">
           <h2 className="text-lg font-bold text-deep-500 border-b border-deep-200 pb-2 mb-6 uppercase tracking-wide">
             {t('featured')}
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredArticles.map(article => (
                <FeaturedBoxCard key={article.id} article={article} />
              ))}
           </div>
        </div>
      )}

      {/* Tier 3: Just In (List of Rest) */}
      {justInArticles.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-deep-500 border-b border-deep-200 pb-2 mb-6 uppercase tracking-wide">
            {t('justIn')}
          </h2>
          <div className="flex flex-col">
             {justInArticles.map(article => (
               <StandardArticleRow key={article.id} article={article} />
             ))}
          </div>

          {/* Load More Button */}
          {hasMoreArticles && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={onLoadMore}
                className="px-6 py-2 bg-deep-100 text-deep-400 font-medium rounded-full border border-deep-200 hover:bg-deep-200 hover:text-deep-500 transition-all shadow-sm"
              >
                {t('loadMore')}
              </button>
            </div>
          )}
        </div>
      )}

      {featuredArticles.length === 0 && justInArticles.length === 0 && heroArticle.length === 0 && (
          <p className="text-sm text-deep-300 italic py-4">{t('noNews')}</p>
      )}

    </div>
  );
};

export default NewsFeed;