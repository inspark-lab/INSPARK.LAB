
import React, { useState } from 'react';
import { NewsZone } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface NavigationSidebarProps {
  zones: NewsZone[];
  activeZoneId: string | null;
  onSelectZone: (id: string | null) => void;
  onAddZone: () => void;
  onOpenSettings: () => void;
  onEditZone: (zone: NewsZone) => void;
  onReorderZones: (zones: NewsZone[]) => void;
}

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({ 
  zones, 
  activeZoneId, 
  onSelectZone, 
  onAddZone,
  onOpenSettings,
  onEditZone,
  onReorderZones
}) => {
  const { t } = useLanguage();
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Optional: Transparent drag image or custom styling could be set here
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // Necessary to allow dropping/movement

    if (draggedItemIndex === null) return;
    
    // Live Sort: Only trigger update if the item has moved to a new index
    if (draggedItemIndex !== index) {
      const newZones = [...zones];
      const draggedItem = newZones[draggedItemIndex];
      
      // Remove from old position
      newZones.splice(draggedItemIndex, 1);
      // Insert at new position
      newZones.splice(index, 0, draggedItem);

      // Update parent state immediately
      onReorderZones(newZones);
      
      // Update local tracking index to match new position
      setDraggedItemIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <div className="flex items-center justify-between px-2 mb-4">
          <h2 className="text-xs font-bold text-deep-300 uppercase tracking-wider">{t('myZones')}</h2>
        </div>
        
        {/* "All News" / Home Link */}
        <button
            onClick={() => onSelectZone(null)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors mb-2 flex items-center gap-2 ${
              activeZoneId === null
                ? 'bg-deep-400 text-deep-100' 
                : 'text-deep-400 hover:bg-deep-200/50 hover:text-deep-500'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-80" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            {t('home')}
          </button>

        <ul className="space-y-1">
          {zones.map((zone, index) => (
            <li 
              key={zone.id} 
              className={`group relative flex items-center rounded-md transition-all duration-300 ease-in-out transform ${
                 draggedItemIndex === index 
                   ? 'opacity-50 scale-95 bg-deep-100 shadow-inner' 
                   : 'hover:translate-x-1'
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              {/* Drag Handle */}
              <div className={`cursor-move p-2 text-deep-200 hover:text-deep-400 transition-opacity absolute left-0 z-10 ${
                 draggedItemIndex === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 2a2 2 0 10-.001 4.001A2 2 0 007 2zm0 6a2 2 0 10-.001 4.001A2 2 0 007 8zm0 6a2 2 0 10-.001 4.001A2 2 0 007 14zm6-8a2 2 0 10-.001-4.001A2 2 0 0013 6zm0 2a2 2 0 10-.001 4.001A2 2 0 0013 8zm0 6a2 2 0 10-.001 4.001A2 2 0 0013 14z" />
                 </svg>
              </div>

              <button
                onClick={() => onSelectZone(zone.id)}
                className={`flex-1 text-left pl-8 pr-10 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeZoneId === zone.id 
                    ? 'bg-deep-400 text-deep-100' 
                    : 'text-deep-400 hover:bg-deep-200/50 hover:text-deep-500'
                }`}
              >
                {zone.title}
              </button>

              {/* Edit Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditZone(zone);
                }}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-deep-300 hover:text-white hover:bg-deep-400/50 transition-colors ${
                   activeZoneId === zone.id ? 'text-deep-200' : 'opacity-0 group-hover:opacity-100'
                }`}
                title={t('editZone')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
        
        {zones.length === 0 && (
            <p className="text-xs text-deep-300 px-3 italic">{t('noZones')}</p>
        )}

        <button
          onClick={onAddZone}
          className="mt-4 w-full flex items-center gap-2 px-3 py-2 text-sm text-deep-400 hover:text-deep-500 font-medium border border-dashed border-deep-200 rounded-md hover:border-deep-300 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          {t('addZoneBtn')}
        </button>
      </div>

      <div className="mt-auto pt-6 border-t border-deep-200">
         <button
           onClick={onOpenSettings}
           className="flex items-center gap-2 text-deep-300 hover:text-deep-500 text-sm px-2 transition-colors"
         >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t('settings')}
         </button>
      </div>
    </div>
  );
};

export default NavigationSidebar;
