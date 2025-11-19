
import React from 'react';
import { Article } from '../types';

interface StandardArticleRowProps {
  article: Article;
}

const StandardArticleRow: React.FC<StandardArticleRowProps> = ({ article }) => {
  return (
    <div className="flex justify-between gap-4 p-4 bg-white rounded-lg shadow-sm mb-4 group cursor-pointer hover:shadow-md transition-all duration-200 border border-deep-100/50">
      {/* Left: Content */}
      <div className="flex flex-col justify-between flex-1 pr-2">
        <div>
          <h3 className="text-base font-medium text-deep-500 leading-snug group-hover:text-deep-400 transition-colors line-clamp-2">
             <a href={article.url} target="_blank" rel="noopener noreferrer">
               {article.title}
             </a>
          </h3>
          {article.description && (
             <p className="text-sm text-deep-400 line-clamp-2 mt-2 leading-relaxed">
               {article.description}
             </p>
          )}
        </div>
        <div className="mt-3 flex items-center text-xs text-deep-300 gap-2">
           <span className="font-medium text-deep-400 truncate max-w-[100px]">{article.source}</span>
           <span className="text-deep-200">|</span>
           <span>{article.publishedAt}</span>
        </div>
      </div>

      {/* Right: Thumbnail (Small Square) */}
      {/* Mobile: 80px (w-20), Desktop: 96px (w-24) */}
      <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 overflow-hidden rounded-md bg-deep-100 mt-1">
         <img 
           src={article.imageUrl} 
           alt={article.title} 
           className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
         />
      </div>
    </div>
  );
};

export default StandardArticleRow;
