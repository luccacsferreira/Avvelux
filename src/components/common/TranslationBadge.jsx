import React, { useState, useEffect } from 'react';
import { apiClient as base44 } from '@/api/apiClient';

const LANG_LABELS = {
  en: 'EN', pt: 'PT', nl: 'NL', fr: 'FR', es: 'ES', 
  de: 'DE', it: 'IT', ja: 'JA', ko: 'KO', zh: 'ZH'
};

// Translation cache to avoid re-translating
const translationCache = {};

export default function TranslationBadge({ 
  text, 
  language, 
  targetLanguage, 
  onTranslated, 
  showBadge = true,
  inline = false,
  className = ''
}) {
  const [translated, setTranslated] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const userLang = targetLanguage || (typeof localStorage !== 'undefined' && localStorage.getItem('avvelux-language')) || 'en';
  const needsTranslation = language && language !== userLang && text;

  useEffect(() => {
    if (!needsTranslation || showOriginal) {
      setTranslated(null);
      return;
    }

    const cacheKey = `${language}-${userLang}-${text.substring(0, 50)}`;
    if (translationCache[cacheKey]) {
      setTranslated(translationCache[cacheKey]);
      onTranslated?.(translationCache[cacheKey]);
      return;
    }

    const translate = async () => {
      setIsTranslating(true);
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Translate this ${language} text to ${userLang}. Return ONLY the translation, nothing else:\n\n${text}`,
        });
        translationCache[cacheKey] = result;
        setTranslated(result);
        onTranslated?.(result);
      } catch (e) {
        setTranslated(text);
      }
      setIsTranslating(false);
    };

    translate();
  }, [text, language, userLang, needsTranslation, showOriginal]);

  const displayText = showOriginal ? text : (translated || text);

  if (!needsTranslation) {
    return inline ? <>{text}</> : <span className={className}>{text}</span>;
  }

  return (
    <div className={inline ? 'inline' : ''}>
      {inline ? displayText : <span className={className}>{displayText}</span>}
      {!showOriginal && translated && !inline && (
        <button
          onClick={() => setShowOriginal(true)}
          className="text-xs text-gray-400 hover:text-blue-400 ml-2"
        >
          Translated · <span className="text-blue-400">See original</span>
        </button>
      )}
      {showOriginal && !inline && (
        <button
          onClick={() => setShowOriginal(false)}
          className="text-xs text-blue-400 hover:text-blue-300 ml-2"
        >
          Show translation
        </button>
      )}
      {showBadge && (
        <span className="ml-2 px-1.5 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded">
          {LANG_LABELS[language]}
        </span>
      )}
    </div>
  );
}