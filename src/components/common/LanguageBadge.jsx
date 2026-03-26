import React from 'react';

const LANG_LABELS = {
  en: 'EN', pt: 'PT', nl: 'NL', fr: 'FR', es: 'ES',
  de: 'DE', it: 'IT', ja: 'JA', ko: 'KO', zh: 'ZH'
};

export default function LanguageBadge({ language, className = '' }) {
  if (!language || language === 'en') return null;
  
  return (
    <span className={`px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded ${className}`}>
      {LANG_LABELS[language] || language.toUpperCase()}
    </span>
  );
}