
import React from 'react';
import { Article } from '../types';

interface FeaturedBoxCardProps {
  article: Article;
}

const FeaturedBoxCard: React.FC<FeaturedBoxCardProps> = ({ article }) => {
  return (
    <div className="group cursor-pointer flex flex-col h-full bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-300">
      {/* Image Container - 16:9 */}
      <div className="w-full aspect-video overflow-hidden rounded-md bg-deep-100 mb-3">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      
      {/* Content */}
      <div className="flex flex-col flex-grow">
        <h3 className="text-base md:text-lg font-bold text-deep-500 leading-tight mb-2 group-hover:text-deep-400 transition-colors line-clamp-3">
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </h3>
        
        <div className="mt-auto pt-2 flex items-center text-xs text-deep-300 gap-2">
           <span className="font-medium text-deep-400 truncate max-w-[100px]">{article.source}</span>
           <span className="w-1 h-1 bg-deep-200 rounded-full"></span>
           <span>{article.publishedAt}</span>
        </div>
      </div>
    </div>
  );
};

export default FeaturedBoxCard;
