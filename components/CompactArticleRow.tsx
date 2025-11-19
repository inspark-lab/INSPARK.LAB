import React from 'react';
import { Article } from '../types';

interface CompactArticleRowProps {
  article: Article;
}

const CompactArticleRow: React.FC<CompactArticleRowProps> = ({ article }) => {
  return (
     <div className="flex gap-3 group cursor-pointer items-start border-b border-deep-100 pb-3 last:border-0 last:pb-0">
        {/* Small Thumbnail */}
        <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-sm bg-deep-100">
           <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
           />
        </div>
        
        {/* Title */}
        <h4 className="text-sm font-medium text-deep-500 leading-snug group-hover:text-deep-400 transition-colors line-clamp-3">
           <a href={article.url} target="_blank" rel="noopener noreferrer">
             {article.title}
           </a>
        </h4>
     </div>
  );
};

export default CompactArticleRow;