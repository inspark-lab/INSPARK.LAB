
import React, { useState } from 'react';
import { NotificationSettings, ZoneSource } from '../types';
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

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
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
          <div className="flex-1 py-6 px-6 overflow-y-auto flex flex-col">
            
            {/* Section: Daily Digest Settings */}
            <div className="mb-8">
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

            {/* Branding Section (Moved to bottom) */}
            <div className="mt-auto pt-8">
               <div className="bg-deep-500 rounded-lg p-5 shadow-lg border border-deep-400">
                  <p className="text-xs text-white italic mb-4 font-light leading-relaxed">
                    {t('footerSlogan')}
                  </p>
                  <a 
                    href="https://insparklab.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-white hover:text-deep-100 transition-colors flex items-center gap-2"
                  >
                    {t('officialWebsite')}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-deep-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <p className="text-xs text-deep-200 mt-4 pt-4 border-t border-deep-400/50">
                    {t('contactUs')}
                  </p>
               </div>
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
    </div>
  );
};

export default SettingsDrawer;
