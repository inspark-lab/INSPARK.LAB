
import React, { useState } from 'react';
import Modal from './Modal';
import { NewsZone, ZoneSource } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SourceManagementDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  zones: NewsZone[];
  onMoveSource: (source: ZoneSource, fromZoneId: string, toZoneId: string) => void;
  onDeleteSource: (source: ZoneSource, fromZoneId: string) => void;
}

type SortOption = 'topic' | 'name';

const SourceManagementDashboard: React.FC<SourceManagementDashboardProps> = ({
  isOpen,
  onClose,
  zones,
  onMoveSource,
  onDeleteSource
}) => {
  const { t } = useLanguage();
  const [sortBy, setSortBy] = useState<SortOption>('topic');

  // Flatten sources into a workable list
  const allSources = zones.flatMap(zone => 
    zone.sources.map(source => ({
      ...source,
      zoneId: zone.id,
      zoneTitle: zone.title
    }))
  );

  const sortedSources = [...allSources].sort((a, b) => {
    if (sortBy === 'topic') {
      // Sort by Zone Title first, then Source Name
      const zoneCompare = a.zoneTitle.localeCompare(b.zoneTitle);
      return zoneCompare !== 0 ? zoneCompare : a.name.localeCompare(b.name);
    } else {
      // Sort by Source Name
      return a.name.localeCompare(b.name);
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('manageSourcesTitle')}
    >
      <div className="flex flex-col h-[70vh]">
        
        {/* Controls */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-deep-200">
          <div className="flex items-center gap-2">
             <span className="text-sm font-medium text-deep-400">{t('sortBy')}:</span>
             <div className="flex bg-deep-100 rounded-lg p-1 border border-deep-200">
                <button
                  onClick={() => setSortBy('topic')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${sortBy === 'topic' ? 'bg-deep-400 text-deep-100' : 'text-deep-400 hover:text-deep-500'}`}
                >
                  {t('sortByTopic')}
                </button>
                <button
                  onClick={() => setSortBy('name')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${sortBy === 'name' ? 'bg-deep-400 text-deep-100' : 'text-deep-400 hover:text-deep-500'}`}
                >
                  {t('sortByName')}
                </button>
             </div>
          </div>
          <span className="text-xs text-deep-300">
             {allSources.length} sources
          </span>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto pr-1">
           {sortedSources.length === 0 ? (
             <div className="h-full flex items-center justify-center text-deep-300 italic">
               {t('noSourcesGlobal')}
             </div>
           ) : (
             <div className="space-y-4">
                {/* If sorted by Topic, we can group them visually? 
                    Actually a flat list with 'Current Topic' column works well too, 
                    but grouping is requested in prompt ("Grouping: Initially group..."). 
                    Let's do visual grouping if sort === topic.
                */}
                
                {sortBy === 'topic' ? (
                   zones.map(zone => {
                     const zoneSources = sortedSources.filter(s => s.zoneId === zone.id);
                     if (zoneSources.length === 0) return null;

                     return (
                        <div key={zone.id} className="mb-6">
                            <h3 className="text-sm font-bold text-deep-500 bg-deep-100 px-3 py-2 rounded-md mb-2 flex items-center justify-between">
                                {zone.title}
                                <span className="text-xs font-normal text-deep-300 bg-white px-2 py-0.5 rounded-full border border-deep-200">
                                    {zoneSources.length}
                                </span>
                            </h3>
                            <div className="space-y-2 pl-2">
                                {zoneSources.map((source, idx) => (
                                    <SourceItem 
                                        key={`${source.url}-${idx}`} 
                                        source={source} 
                                        zones={zones}
                                        onMove={onMoveSource}
                                        onDelete={onDeleteSource}
                                        t={t}
                                    />
                                ))}
                            </div>
                        </div>
                     );
                   })
                ) : (
                   // Flat list for name sorting
                   <div className="space-y-2">
                      {sortedSources.map((source, idx) => (
                         <SourceItem 
                            key={`${source.url}-${idx}`} 
                            source={source} 
                            zones={zones}
                            onMove={onMoveSource}
                            onDelete={onDeleteSource}
                            t={t}
                         />
                      ))}
                   </div>
                )}
             </div>
           )}
        </div>
      </div>
    </Modal>
  );
};

interface ExtendedSource extends ZoneSource {
    zoneId: string;
    zoneTitle: string;
}

const SourceItem: React.FC<{
    source: ExtendedSource;
    zones: NewsZone[];
    onMove: (s: ZoneSource, from: string, to: string) => void;
    onDelete: (s: ZoneSource, from: string) => void;
    t: any;
}> = ({ source, zones, onMove, onDelete, t }) => {
    return (
        <div className="bg-white border border-deep-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="font-bold text-deep-500 truncate">{source.name}</h4>
                    {/* If we are in name sort mode, show the badge */}
                </div>
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-deep-300 hover:text-deep-400 truncate block mt-0.5 font-mono"
                >
                    {source.url}
                </a>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex flex-col items-end gap-1">
                   <label className="text-[10px] uppercase tracking-wider text-deep-300 font-bold">{t('currentTopic')}</label>
                   <select
                      value={source.zoneId}
                      onChange={(e) => {
                          if (e.target.value !== source.zoneId) {
                              onMove(source, source.zoneId, e.target.value);
                          }
                      }}
                      className="text-xs border border-deep-400 rounded px-2 py-1 bg-deep-500 text-deep-100 hover:bg-deep-400 focus:outline-none focus:ring-1 focus:ring-deep-300 cursor-pointer max-w-[150px]"
                   >
                      {zones.map(z => (
                          <option key={z.id} value={z.id} className="bg-deep-500 text-deep-100">{z.title}</option>
                      ))}
                   </select>
                </div>

                <div className="w-px h-8 bg-deep-100 mx-1"></div>

                <button
                  onClick={() => {
                      if (window.confirm(t('deleteSourceConfirm'))) {
                          onDelete(source, source.zoneId);
                      }
                  }}
                  className="p-2 text-deep-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  title={t('deleteZone')}
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                   </svg>
                </button>
            </div>
        </div>
    );
};

export default SourceManagementDashboard;
