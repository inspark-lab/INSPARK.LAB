
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { NewsZone, ZoneSource } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ZoneEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, sources: ZoneSource[], targetZoneId?: string) => void;
  initialZone?: NewsZone | null;
  zones: NewsZone[];
}

const ZoneEditModal: React.FC<ZoneEditModalProps> = ({ isOpen, onClose, onSave, initialZone, zones }) => {
  const { t } = useLanguage();
  
  // State for Mode Selection (only active when creating/adding, not editing)
  const [mode, setMode] = useState<'create' | 'existing'>('create');
  const [targetZoneId, setTargetZoneId] = useState('');
  
  const [title, setTitle] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [sources, setSources] = useState<ZoneSource[]>([]);

  // Reset state when opening/closing or changing target zone
  useEffect(() => {
    if (isOpen) {
      if (initialZone) {
        // Editing Mode
        setMode('create'); // Effectively standard edit
        setTitle(initialZone.title);
        setSources([...initialZone.sources]);
        setTargetZoneId('');
      } else {
        // Adding Mode (Reset defaults)
        setMode('create');
        setTitle('');
        setSources([]);
        setTargetZoneId(zones.length > 0 ? zones[0].id : '');
      }
      setNameInput('');
      setUrlInput('');
    }
  }, [isOpen, initialZone, zones]);

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
    if (mode === 'create') {
      if (title && sources.length > 0) {
        onSave(title, sources);
        onClose();
      }
    } else {
      // Existing mode
      if (targetZoneId && sources.length > 0) {
        onSave('', sources, targetZoneId);
        onClose();
      }
    }
  };

  const isEditMode = !!initialZone;

  // Dynamic Button Text
  let saveButtonText = t('createZone');
  if (isEditMode) saveButtonText = t('updateZone');
  else if (mode === 'existing') saveButtonText = t('addToTopic');

  // Validation
  const isValid = 
    sources.length > 0 && 
    (mode === 'create' ? !!title : !!targetZoneId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? t('editZoneTitle') : t('addZoneTitle')}
    >
      <div className="space-y-6">
        
        {/* Mode Selector (Only show if NOT editing an existing zone) */}
        {!isEditMode && zones.length > 0 && (
          <div className="flex p-1 bg-deep-100 rounded-lg border border-deep-200">
             <button
               onClick={() => setMode('create')}
               className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'create' ? 'bg-deep-500 text-white shadow-sm' : 'text-deep-400 hover:text-deep-500'}`}
             >
               {t('modeCreate')}
             </button>
             <button
               onClick={() => setMode('existing')}
               className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'existing' ? 'bg-deep-500 text-white shadow-sm' : 'text-deep-400 hover:text-deep-500'}`}
             >
               {t('modeAddExisting')}
             </button>
          </div>
        )}

        {/* Topic Selection or Creation */}
        <div>
          {mode === 'create' ? (
             <>
                <label className="block text-sm font-medium text-deep-400 mb-1">{t('zoneTitleLabel')}</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('zoneTitlePlaceholder')}
                  className="block w-full border border-deep-200 bg-deep-100 rounded-md shadow-sm py-2 px-3 text-deep-500 placeholder-deep-300 focus:outline-none focus:ring-deep-400 focus:border-deep-400 sm:text-sm transition-colors"
                />
             </>
          ) : (
             <>
                <label className="block text-sm font-medium text-deep-400 mb-1">{t('selectTopic')}</label>
                <select
                  value={targetZoneId}
                  onChange={(e) => setTargetZoneId(e.target.value)}
                  className="block w-full border border-deep-200 bg-deep-100 rounded-md shadow-sm py-2 px-3 text-deep-500 focus:outline-none focus:ring-deep-400 focus:border-deep-400 sm:text-sm transition-colors cursor-pointer"
                >
                   {zones.map(z => (
                     <option key={z.id} value={z.id}>{z.title}</option>
                   ))}
                </select>
             </>
          )}
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
          <div className="border border-dashed border-deep-200 rounded-md bg-deep-50/50 min-h-[60px] max-h-[240px] overflow-y-auto p-2">
            {sources.length === 0 ? (
              <div className="flex items-center justify-center h-full py-4">
                 <span className="text-xs text-deep-300 italic">{t('noSourcesAdded')}</span>
              </div>
            ) : (
              <ul className="space-y-2">
                {sources.map((source, index) => (
                  <li key={index} className="flex items-center justify-between px-3 py-2 bg-white rounded-md shadow-sm border border-deep-100">
                    <div className="flex flex-col overflow-hidden mr-2">
                      <span className="text-sm font-bold text-deep-500 truncate" title={source.name}>{source.name}</span>
                      <span className="text-xs text-deep-300 truncate font-mono" title={source.url}>{source.url}</span>
                    </div>
                    <button
                      onClick={() => removeSource(index)}
                      className="text-deep-300 hover:text-red-500 focus:outline-none p-1 transition-colors"
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
            disabled={!isValid}
            className="px-4 py-2 bg-deep-400 text-deep-100 rounded-md text-sm font-medium hover:bg-deep-500 disabled:opacity-50 transition-colors"
          >
            {saveButtonText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ZoneEditModal;