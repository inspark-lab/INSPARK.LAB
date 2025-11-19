
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { NewsZone, ZoneSource } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ZoneEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, sources: ZoneSource[]) => void;
  initialZone?: NewsZone | null;
}

const ZoneEditModal: React.FC<ZoneEditModalProps> = ({ isOpen, onClose, onSave, initialZone }) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  
  const [nameInput, setNameInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [sources, setSources] = useState<ZoneSource[]>([]);

  // Reset state when opening/closing or changing target zone
  useEffect(() => {
    if (isOpen) {
      if (initialZone) {
        setTitle(initialZone.title);
        setSources([...initialZone.sources]);
      } else {
        setTitle('');
        setSources([]);
      }
      setNameInput('');
      setUrlInput('');
    }
  }, [isOpen, initialZone]);

  const handleAddSource = () => {
    if (nameInput.trim() && urlInput.trim()) {
      setSources([...sources, { name: nameInput.trim(), url: urlInput.trim() }]);
      setNameInput('');
      setUrlInput('');
    }
  };

  const removeSource = (indexToRemove: number) => {
    setSources(sources.filter((_, index) => index !== indexToRemove));
  };

  const handleSave = () => {
    if (title && sources.length > 0) {
      onSave(title, sources);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialZone ? t('editZoneTitle') : t('addZoneTitle')}
    >
      <div className="space-y-6">
        
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-deep-400 mb-1">{t('zoneTitleLabel')}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('zoneTitlePlaceholder')}
            className="block w-full border border-deep-200 bg-deep-100 rounded-md shadow-sm py-2 px-3 text-deep-500 placeholder-deep-300 focus:outline-none focus:ring-deep-400 focus:border-deep-400 sm:text-sm transition-colors"
          />
        </div>

        {/* Source Management */}
        <div>
          <label className="block text-sm font-medium text-deep-400 mb-1">{t('sourcesLabel')}</label>
          <p className="text-xs text-deep-300 mb-2">{t('sourcesHelp')}</p>
          
          <div className="flex flex-col sm:flex-row gap-2 mb-3 items-end">
            <div className="flex-1 w-full">
               <label className="block text-xs text-deep-300 mb-1">{t('sourceNameLabel')}</label>
               <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={t('sourceNamePlaceholder')}
                className="block w-full border border-deep-200 bg-deep-100 rounded-md shadow-sm py-2 px-3 text-deep-500 placeholder-deep-300 focus:outline-none focus:ring-deep-400 focus:border-deep-400 sm:text-sm transition-colors"
              />
            </div>
            <div className="flex-1 w-full">
               <label className="block text-xs text-deep-300 mb-1">{t('sourceUrlLabel')}</label>
               <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={t('sourceUrlPlaceholder')}
                className="block w-full border border-deep-200 bg-deep-100 rounded-md shadow-sm py-2 px-3 text-deep-500 placeholder-deep-300 focus:outline-none focus:ring-deep-400 focus:border-deep-400 sm:text-sm transition-colors"
              />
            </div>
            <button
              onClick={handleAddSource}
              disabled={!nameInput.trim() || !urlInput.trim()}
              className="w-full sm:w-auto px-4 py-2 bg-deep-300 text-white rounded-md text-sm font-medium hover:bg-deep-400 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {t('addSourceBtn')}
            </button>
          </div>

          {/* Source List */}
          <div className="border border-dashed border-deep-200 rounded-md bg-deep-50/50 min-h-[60px] max-h-[200px] overflow-y-auto">
            {sources.length === 0 ? (
              <div className="flex items-center justify-center h-full py-4">
                 <span className="text-xs text-deep-300 italic">{t('noSourcesAdded')}</span>
              </div>
            ) : (
              <ul className="divide-y divide-deep-200/50">
                {sources.map((source, index) => (
                  <li key={index} className="flex items-center justify-between px-4 py-2 hover:bg-deep-100/50 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-deep-500">{source.name}</span>
                      <span className="text-xs text-deep-300 truncate max-w-[200px]">{source.url}</span>
                    </div>
                    <button
                      onClick={() => removeSource(index)}
                      className="text-deep-300 hover:text-red-500 focus:outline-none p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex justify-end space-x-3 border-t border-deep-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-deep-200 rounded-md text-sm font-medium text-deep-300 hover:bg-deep-200 hover:text-deep-500 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!title || sources.length === 0}
            className="px-4 py-2 bg-deep-400 text-deep-100 rounded-md text-sm font-medium hover:bg-deep-500 disabled:opacity-50 transition-colors"
          >
            {initialZone ? t('updateZone') : t('createZone')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ZoneEditModal;
