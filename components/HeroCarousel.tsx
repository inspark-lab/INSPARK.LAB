
import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface HeroCarouselProps {
  articles: Article[];
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ articles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [articles.length]);

  if (articles.length === 0) return null;

  const currentArticle = articles[currentIndex];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % articles.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);

  return (
    <div className="relative w-full h-[300px] md:h-[400px] bg-deep-100 mb-8 rounded-lg overflow-hidden group">
      {/* Image Background */}
      <img 
        src={currentArticle.imageUrl} 
        alt={currentArticle.title}
        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
      />
      
      {/* Gradient Overlay - Increased opacity for mobile readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-deep-500 via-deep-500/30 to-transparent"></div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-4 md:p-8">
        <div className="inline-block px-2 py-0.5 md:px-3 md:py-1 bg-deep-400 text-deep-100 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2 md:mb-3 rounded-sm">
          {t('featured')}
        </div>
        <h2 className="text-xl md:text-3xl font-bold text-white mb-2 leading-tight drop-shadow-md line-clamp-2 md:line-clamp-none">
          <a href={currentArticle.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {currentArticle.title}
          </a>
        </h2>
        <div className="flex items-center text-deep-200 text-xs md:text-sm gap-2 md:gap-4">
           <span className="truncate max-w-[120px] md:max-w-none">{currentArticle.source}</span>
           <span>•</span>
           <span>{currentArticle.publishedAt}</span>
        </div>
      </div>

      {/* Controls */}
      <button 
        onClick={prevSlide}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        {articles.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-3 md:w-4' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
