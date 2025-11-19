
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const TrendingSidebar: React.FC = () => {
  const { t } = useLanguage();

  // Mock trending data for UI demo
  const trendingTopics = [
    "Global Markets Rally",
    "AI Safety Regulations",
    "Electric Vehicle Sales 2025",
    "SpaceX Mars Mission",
    "Sustainable Energy Tech"
  ];

  return (
    <div>
      <h2 className="text-xs font-bold text-deep-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        {t('trending')}
      </h2>
      <div className="bg-white border border-deep-200 rounded-lg p-4 shadow-sm">
        <ol className="list-decimal list-inside space-y-4">
          {trendingTopics.map((topic, idx) => (
            <li key={idx} className="text-sm font-medium text-deep-500 hover:text-deep-400 cursor-pointer transition-colors border-b border-deep-200/50 pb-2 last:border-0 last:pb-0">
              <span className="ml-1">{topic}</span>
            </li>
          ))}
        </ol>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xs font-bold text-deep-300 uppercase tracking-wider mb-4">
           {t('justIn')}
        </h2>
        <div className="space-y-3">
             {[1, 2, 3].map((i) => (
                 <div key={i} className="flex gap-3 items-start">
                    <div className="text-xs text-deep-300 pt-1 whitespace-nowrap">10:4{i} AM</div>
                    <div className="text-sm text-deep-500 hover:underline cursor-pointer">
                        Market update: Tech stocks surge as new chips announced.
                    </div>
                 </div>
             ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingSidebar;
