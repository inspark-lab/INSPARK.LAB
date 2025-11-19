import React from 'react';
import { Article } from '../types';

interface FocusArticleCardProps {
  article: Article;
}

const FocusArticleCard: React.FC<FocusArticleCardProps> = ({ article }) => {
  return (
    <div className="flex flex-row h-full group cursor-pointer bg-white">
       {/* Image Left (40%) */}
       <div className="w-[40%] relative overflow-hidden rounded-sm bg-deep-100 aspect-[4/3]">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
       </div>
       
       {/* Content Right (60%) */}
       <div className="w-[60%] pl-4 flex flex-col">
          {/* Red Uppercase Category Tag */}
          <span className="text-red-600 text-xs font-bold uppercase tracking-wider mb-2 line-clamp-1">
            {article.source || 'NEWS'}
          </span>
          
          {/* Headline */}
          <h3 className="text-lg font-bold text-deep-500 leading-snug group-hover:text-deep-400 transition-colors line-clamp-3 mb-2">
            <a href={article.url} target="_blank" rel="noopener noreferrer">
               {article.title}
            </a>
          </h3>
          
          {/* Meta */}
          <span className="text-xs text-deep-300 mt-auto">{article.publishedAt}</span>
       </div>
    </div>
  );
};

export default FocusArticleCard;