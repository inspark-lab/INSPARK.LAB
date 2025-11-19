
import React, { useState } from 'react';
import { NotificationSettings, ZoneSource } from '../types';
import { generateDailyBriefing } from '../services/geminiService';
import Modal from './Modal';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onSaveSettings: (s: NotificationSettings) => void;
  zones: { title: string, sources: ZoneSource[] }[];
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose, settings, onSaveSettings, zones }) => {
  const { t } = useLanguage();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const handleTestNotification = async () => {
    setIsGeneratingPreview(true);
    setPreviewContent(null);
    const content = await generateDailyBriefing(zones);
    setPreviewContent(content);
    setIsGeneratingPreview(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 overflow-hidden">
      <div className="absolute inset-0 bg-deep-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
      
      <div className="fixed inset-y-0 right-0 max-w-md w-full flex">
        <div className="relative w-full h-full bg-deep-100 shadow-xl flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-6 bg-deep-500 border-b border-deep-400 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-deep-100">{t('settingsTitle')}</h2>
            <button onClick={onClose} className="text-deep-200 hover:text-deep-100">
              <span className="sr-only">Close panel</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 py-6 px-6 overflow-y-auto space-y-8">
            
            {/* Section: Daily Digest Settings */}
            <div>
              <h3 className="text-sm font-medium text-deep-400 uppercase tracking-wider mb-4">{t('schedule')}</h3>
              <div className="space-y-6">
                
                {/* Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-deep-500 font-medium">{t('enableDigest')}</span>
                  <button 
                    onClick={() => setLocalSettings(s => ({ ...s, enabled: !s.enabled }))}
                    className={`${localSettings.enabled ? 'bg-deep-400' : 'bg-deep-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                  >
                    <span className={`${localSettings.enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-deep-100 transition`}/>
                  </button>
                </div>

                {/* Conditional Fields */}
                {localSettings.enabled && (
                  <div className="space-y-4 pt-2 border-t border-deep-200/50">
                    {/* Delivery Time */}
                    <div>
                      <label className="block text-sm font-medium text-deep-400 mb-1">{t('deliveryTime')}</label>
                      <input 
                          type="time" 
                          value={localSettings.time}
                          onChange={(e) => setLocalSettings({...localSettings, time: e.target.value})}
                          className="block w-full border border-deep-200 bg-deep-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-400 focus:border-deep-400 sm:text-sm text-deep-500"
                      />
                    </div>

                    {/* Email Input */}
                    <div>
                      <label className="block text-sm font-medium text-deep-400 mb-1">{t('recipientEmail')}</label>
                      <input 
                          type="email" 
                          placeholder={t('emailPlaceholder')}
                          value={localSettings.email}
                          onChange={e => setLocalSettings(s => ({...s, email: e.target.value}))}
                          className="block w-full border border-deep-200 bg-deep-100 rounded-md shadow-sm py-2 px-3 text-sm text-deep-500 focus:ring-deep-400 focus:border-deep-400 placeholder-deep-300"
                      />
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Section: Test */}
            <div className="pt-6 border-t border-deep-200">
               <h3 className="text-sm font-medium text-deep-400 uppercase tracking-wider mb-4">{t('testFunc')}</h3>
               <button
                 onClick={handleTestNotification}
                 disabled={isGeneratingPreview}
                 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-deep-100 bg-deep-400 hover:bg-deep-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-400 disabled:opacity-50 transition-colors"
               >
                 {isGeneratingPreview ? t('generating') : t('simulateBtn')}
               </button>
               <p className="mt-2 text-xs text-deep-300">
                 {t('testDesc')}
               </p>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-deep-100 border-t border-deep-200 flex justify-end space-x-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 border border-deep-200 rounded-md text-sm font-medium text-deep-400 hover:bg-deep-200 focus:outline-none transition-colors"
            >
              {t('cancel')}
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-deep-100 bg-deep-400 hover:bg-deep-500 focus:outline-none transition-colors"
            >
              {t('saveSettings')}
            </button>
          </div>
        </div>
      </div>
      
      {/* Preview Modal */}
      <Modal 
        isOpen={!!previewContent} 
        onClose={() => setPreviewContent(null)}
        title={t('previewTitle')}
      >
        <div className="prose prose-sm max-w-none prose-headings:text-deep-500 prose-p:text-deep-300">
           <ReactMarkdown>{previewContent || ''}</ReactMarkdown>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsDrawer;
