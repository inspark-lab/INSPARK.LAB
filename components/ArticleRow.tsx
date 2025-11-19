
import React from 'react';
import { Article } from '../types';

interface ArticleRowProps {
  article: Article;
}

const ArticleRow: React.FC<ArticleRowProps> = ({ article }) => {
  return (
    <div className="flex gap-6 py-6 px-4 -mx-4 border-b border-deep-200 group hover:bg-deep-100/40 transition-all duration-200 rounded-lg">
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-deep-300 mb-2">
            <span className="font-medium text-deep-400">{article.source}</span>
            <span className="w-1 h-1 bg-deep-200 rounded-full"></span>
            <span>{article.publishedAt}</span>
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-deep-500 leading-snug group-hover:text-deep-400 transition-colors">
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              {article.title}
            </a>
          </h3>
        </div>
      </div>
      <div className="w-[120px] h-[100px] md:w-[160px] md:h-[110px] flex-shrink-0 overflow-hidden rounded-md bg-deep-100">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
    </div>
  );
};

export default ArticleRow;
