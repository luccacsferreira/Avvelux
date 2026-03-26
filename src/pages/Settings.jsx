import React, { useState } from 'react';
import { Moon, Sun, Bell, Shield, Eye, Globe, Lock, Palette, X, AlertTriangle, Monitor } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const LANGUAGES = [
  { code: 'en', native: 'English', english: 'English' },
  { code: 'pt', native: 'Português', english: 'Portuguese' },
  { code: 'es', native: 'Español', english: 'Spanish' },
  { code: 'fr', native: 'Français', english: 'French' },
  { code: 'de', native: 'Deutsch', english: 'German' },
  { code: 'it', native: 'Italiano', english: 'Italian' },
  { code: 'nl', native: 'Nederlands', english: 'Dutch' },
  { code: 'pl', native: 'Polski', english: 'Polish' },
  { code: 'ru', native: 'Русский', english: 'Russian' },
  { code: 'ar', native: 'العربية', english: 'Arabic' },
  { code: 'zh', native: '中文 (简体)', english: 'Chinese (Simplified)' },
  { code: 'zh-tw', native: '中文 (繁體)', english: 'Chinese (Traditional)' },
  { code: 'ja', native: '日本語', english: 'Japanese' },
  { code: 'ko', native: '한국어', english: 'Korean' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali' },
  { code: 'tr', native: 'Türkçe', english: 'Turkish' },
  { code: 'vi', native: 'Tiếng Việt', english: 'Vietnamese' },
  { code: 'th', native: 'ภาษาไทย', english: 'Thai' },
  { code: 'id', native: 'Bahasa Indonesia', english: 'Indonesian' },
  { code: 'ms', native: 'Bahasa Melayu', english: 'Malay' },
  { code: 'fa', native: 'فارسی', english: 'Persian' },
  { code: 'uk', native: 'Українська', english: 'Ukrainian' },
  { code: 'cs', native: 'Čeština', english: 'Czech' },
  { code: 'sk', native: 'Slovenčina', english: 'Slovak' },
  { code: 'ro', native: 'Română', english: 'Romanian' },
  { code: 'hu', native: 'Magyar', english: 'Hungarian' },
  { code: 'sv', native: 'Svenska', english: 'Swedish' },
  { code: 'no', native: 'Norsk', english: 'Norwegian' },
  { code: 'da', native: 'Dansk', english: 'Danish' },
  { code: 'fi', native: 'Suomi', english: 'Finnish' },
  { code: 'el', native: 'Ελληνικά', english: 'Greek' },
  { code: 'he', native: 'עברית', english: 'Hebrew' },
  { code: 'sw', native: 'Kiswahili', english: 'Swahili' },
  { code: 'am', native: 'አማርኛ', english: 'Amharic' },
  { code: 'yo', native: 'Yorùbá', english: 'Yoruba' },
  { code: 'ig', native: 'Igbo', english: 'Igbo' },
  { code: 'ha', native: 'Hausa', english: 'Hausa' },
  { code: 'zu', native: 'isiZulu', english: 'Zulu' },
  { code: 'af', native: 'Afrikaans', english: 'Afrikaans' },
  { code: 'ca', native: 'Català', english: 'Catalan' },
  { code: 'eu', native: 'Euskara', english: 'Basque' },
  { code: 'gl', native: 'Galego', english: 'Galician' },
  { code: 'hr', native: 'Hrvatski', english: 'Croatian' },
  { code: 'sr', native: 'Српски', english: 'Serbian' },
  { code: 'bg', native: 'Български', english: 'Bulgarian' },
  { code: 'lt', native: 'Lietuvių', english: 'Lithuanian' },
  { code: 'lv', native: 'Latviešu', english: 'Latvian' },
  { code: 'et', native: 'Eesti', english: 'Estonian' },
  { code: 'sl', native: 'Slovenščina', english: 'Slovenian' },
  { code: 'mk', native: 'Македонски', english: 'Macedonian' },
  { code: 'sq', native: 'Shqip', english: 'Albanian' },
  { code: 'mt', native: 'Malti', english: 'Maltese' },
  { code: 'is', native: 'Íslenska', english: 'Icelandic' },
  { code: 'ga', native: 'Gaeilge', english: 'Irish' },
  { code: 'cy', native: 'Cymraeg', english: 'Welsh' },
  { code: 'lb', native: 'Lëtzebuergesch', english: 'Luxembourgish' },
  { code: 'ur', native: 'اردو', english: 'Urdu' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu' },
  { code: 'ml', native: 'മലയാളം', english: 'Malayalam' },
  { code: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada' },
  { code: 'mr', native: 'मराठी', english: 'Marathi' },
  { code: 'gu', native: 'ગુજરાતી', english: 'Gujarati' },
  { code: 'pa', native: 'ਪੰਜਾਬੀ', english: 'Punjabi' },
  { code: 'ne', native: 'नेपाली', english: 'Nepali' },
  { code: 'si', native: 'සිංහල', english: 'Sinhala' },
  { code: 'my', native: 'မြန်မာ', english: 'Burmese' },
  { code: 'km', native: 'ខ្មែរ', english: 'Khmer' },
  { code: 'lo', native: 'ລາວ', english: 'Lao' },
  { code: 'ka', native: 'ქართული', english: 'Georgian' },
  { code: 'hy', native: 'Հայերեն', english: 'Armenian' },
  { code: 'az', native: 'Azərbaycan', english: 'Azerbaijani' },
  { code: 'kk', native: 'Қазақша', english: 'Kazakh' },
  { code: 'uz', native: "O'zbek", english: 'Uzbek' },
  { code: 'tk', native: 'Türkmen', english: 'Turkmen' },
  { code: 'ky', native: 'Кыргызча', english: 'Kyrgyz' },
  { code: 'tg', native: 'Тоҷикӣ', english: 'Tajik' },
  { code: 'mn', native: 'Монгол', english: 'Mongolian' },
  { code: 'ps', native: 'پښتو', english: 'Pashto' },
  { code: 'so', native: 'Soomaaliga', english: 'Somali' },
  { code: 'om', native: 'Afaan Oromoo', english: 'Oromo' },
  { code: 'ti', native: 'ትግርኛ', english: 'Tigrinya' },
  { code: 'rw', native: 'Kinyarwanda', english: 'Kinyarwanda' },
  { code: 'ny', native: 'Chichewa', english: 'Chichewa' },
  { code: 'mg', native: 'Malagasy', english: 'Malagasy' },
  { code: 'eo', native: 'Esperanto', english: 'Esperanto' },
  { code: 'la', native: 'Latina', english: 'Latin' },
];

const ToggleSwitch = ({ value, onChange, isLight }) => (
  <button
    onClick={() => onChange(!value)}
    className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-purple-500' : isLight ? 'bg-gray-300' : 'bg-gray-600'}`}
  >
    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </button>
);

const Section = ({ title, icon: Icon, children, isLight }) => (
  <div className={`rounded-xl p-6 border mb-4 ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}>
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h2 className={`text-lg font-semibold ${isLight ? 'text-black' : 'text-white'}`}>{title}</h2>
    </div>
    {children}
  </div>
);

const Row = ({ label, description, right, isLight }) => (
  <div className="flex items-center justify-between py-3 first:pt-0">
    <div className="flex-1 mr-4">
      <p className={`font-medium text-sm ${isLight ? 'text-black' : 'text-white'}`}>{label}</p>
      {description && <p className={`text-xs mt-0.5 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{description}</p>}
    </div>
    {right}
  </div>
);

function DeleteAccountModal({ isLight, onClose }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1=confirm, 2=info
  const [error, setError] = useState('');

  const muted = isLight ? 'text-gray-500' : 'text-gray-400';
  const text = isLight ? 'text-gray-900' : 'text-white';
  const modalBg = isLight ? 'bg-white' : 'bg-[#2a2a2a]';

  const handleConfirmDeletion = () => {
    setStep(2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full max-w-md rounded-2xl border p-6 ${modalBg} ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className={`text-lg font-semibold ${text}`}>Delete Account</h2>
          </div>
          <button onClick={onClose}><X className={`w-5 h-5 ${muted}`} /></button>
        </div>

        {step === 1 && (
          <>
            <p className={`text-sm ${muted} mb-6`}>
              This action is irreversible. After deletion, you have <strong className="text-orange-400">30 days</strong> to recover your account before it is permanently removed.
            </p>
            <div className="flex gap-3">
              <button onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${isLight ? 'border-gray-300 text-gray-700 hover:bg-gray-50' : 'border-gray-600 text-gray-300 hover:bg-white/5'}`}>Cancel</button>
              <button onClick={handleConfirmDeletion} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600">Delete Account</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${text}`}>Account Scheduled for Deletion</h3>
              <p className={`text-sm ${muted} mb-2`}>Your account will be <strong className="text-red-400">permanently deleted in 30 days</strong>.</p>
              <p className={`text-sm ${muted} mb-6`}>You can still log in and recover your account during this period. After 30 days, all your data will be permanently removed.</p>
              <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90">
                I understand
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Settings() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('avvelux-theme');
    // If nothing saved, it means device mode is active
    return saved === 'light' || saved === 'dark' ? saved : 'device';
  });
  const [showThemeToggle, setShowThemeToggle] = useState(() => localStorage.getItem('avvelux-show-theme-toggle') !== 'false');
  const [language, setLanguage] = useState(() => localStorage.getItem('avvelux-language') || 'en');
  const [personalizedAds, setPersonalizedAds] = useState(() => localStorage.getItem('avvelux-personalized-ads') !== 'false');
  const [restrictedMode, setRestrictedMode] = useState(() => localStorage.getItem('avvelux-restricted-mode') === 'true');
  const [autoplay, setAutoplay] = useState(() => localStorage.getItem('avvelux-autoplay') !== 'false');
  const [notifications, setNotifications] = useState(() => localStorage.getItem('avvelux-notifications') !== 'false');
  const [dataCollection, setDataCollection] = useState(() => localStorage.getItem('avvelux-data-collection') !== 'false');
  const [searchHistory, setSearchHistory] = useState(() => localStorage.getItem('avvelux-search-history') !== 'false');
  const [watchHistory, setWatchHistory] = useState(() => localStorage.getItem('avvelux-watch-history') !== 'false');
  const [locationData, setLocationData] = useState(() => localStorage.getItem('avvelux-location') === 'true');
  const [emailNotifs, setEmailNotifs] = useState(() => localStorage.getItem('avvelux-email-notifs') !== 'false');
  const [pushNotifs, setPushNotifs] = useState(() => localStorage.getItem('avvelux-push-notifs') !== 'false');
  const [captionsDefault, setCaptionsDefault] = useState(() => localStorage.getItem('avvelux-captions') === 'true');
  const [defaultQuality, setDefaultQuality] = useState(() => localStorage.getItem('avvelux-quality') || 'auto');
  const [langSearch, setLangSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isLight = theme === 'light';

  const save = (key, value) => localStorage.setItem(key, value);

  const handleThemeChange = (t) => {
    setTheme(t);
    if (t === 'device') {
      // Remove the key so Layout's getInitialTheme falls back to OS preference
      localStorage.removeItem('avvelux-theme');
    } else {
      save('avvelux-theme', t);
    }
    window.location.reload();
  };

  const handleShowThemeToggle = (v) => {
    setShowThemeToggle(v);
    save('avvelux-show-theme-toggle', v);
    window.dispatchEvent(new Event('avvelux-prefs-changed'));
  };

  const handleLanguageChange = (code) => {
    setLanguage(code);
    save('avvelux-language', code);
  };

  const filteredLangs = LANGUAGES.filter(l =>
    l.native.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.english.toLowerCase().includes(langSearch.toLowerCase())
  );

  const themeOptions = [
    { key: 'device', icon: Monitor, label: 'Device' },
    { key: 'dark', icon: Moon, label: 'Dark' },
    { key: 'light', icon: Sun, label: 'Light' },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-12">
      {showDeleteModal && <DeleteAccountModal isLight={isLight} onClose={() => setShowDeleteModal(false)} />}
      <h1 className={`text-2xl font-bold mb-6 ${isLight ? 'text-black' : 'text-white'}`}>Settings</h1>

      {/* Appearance */}
      <Section title="Appearance" icon={Palette} isLight={isLight}>
        <p className={`text-sm mb-4 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Theme</p>
        <div className="flex gap-3 mb-5">
          {themeOptions.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => handleThemeChange(key)}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                theme === key
                  ? 'border-purple-500 bg-purple-500/10'
                  : isLight ? 'border-gray-200 hover:border-gray-300' : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <Icon className={`w-7 h-7 mx-auto mb-2 ${theme === key ? 'text-purple-400' : isLight ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={`text-center text-sm font-medium ${theme === key ? isLight ? 'text-black' : 'text-white' : isLight ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
            </button>
          ))}
        </div>
        <div className={`border-t pt-4 ${isLight ? 'border-gray-100' : 'border-gray-700'}`}>
          <Row
            label="Show theme toggle button"
            description="Show the sun/moon button in the top navigation bar"
            isLight={isLight}
            right={<ToggleSwitch value={showThemeToggle} onChange={handleShowThemeToggle} isLight={isLight} />}
          />
        </div>
      </Section>

      {/* Language */}
      <Section title="Language" icon={Globe} isLight={isLight}>
        <p className={`text-sm mb-3 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Platform language</p>
        <input
          value={langSearch}
          onChange={e => setLangSearch(e.target.value)}
          placeholder="Search language..."
          className={`w-full rounded-lg px-3 py-2 text-sm mb-3 border ${isLight ? 'bg-gray-100 border-gray-200 text-black placeholder:text-gray-400' : 'bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-500'}`}
        />
        <div className={`rounded-lg border max-h-48 overflow-y-auto ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>
          {filteredLangs.map(l => (
            <button
              key={l.code}
              onClick={() => handleLanguageChange(l.code)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors border-b last:border-b-0 ${
                language === l.code
                  ? isLight ? 'bg-purple-50 text-purple-700' : 'bg-purple-900/30 text-purple-300'
                  : isLight ? 'text-black hover:bg-gray-50 border-gray-100' : 'text-white hover:bg-white/5 border-gray-700/50'
              }`}
            >
              <span>{l.native}</span>
              <span className={`text-xs ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>{l.english}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Privacy & Data */}
      <Section title="Privacy & Data" icon={Shield} isLight={isLight}>
        <div className={`divide-y ${isLight ? 'divide-gray-100' : 'divide-gray-700'}`}>
          <Row label="Personalized ads" description="Use your interests to show more relevant ads" isLight={isLight}
            right={<ToggleSwitch value={personalizedAds} onChange={v => { setPersonalizedAds(v); save('avvelux-personalized-ads', v); }} isLight={isLight} />} />
          <Row label="Data collection for improvements" description="Help us improve Avvelux with anonymous usage data" isLight={isLight}
            right={<ToggleSwitch value={dataCollection} onChange={v => { setDataCollection(v); save('avvelux-data-collection', v); }} isLight={isLight} />} />
          <Row label="Search history" description="Save your search history for better suggestions" isLight={isLight}
            right={<ToggleSwitch value={searchHistory} onChange={v => { setSearchHistory(v); save('avvelux-search-history', v); }} isLight={isLight} />} />
          <Row label="Watch history" description="Keep track of what you've watched" isLight={isLight}
            right={<ToggleSwitch value={watchHistory} onChange={v => { setWatchHistory(v); save('avvelux-watch-history', v); }} isLight={isLight} />} />
          <Row label="Location data" description="Use your location for nearby content and services" isLight={isLight}
            right={<ToggleSwitch value={locationData} onChange={v => { setLocationData(v); save('avvelux-location', v); }} isLight={isLight} />} />
        </div>
      </Section>

      {/* Content */}
      <Section title="Content Preferences" icon={Eye} isLight={isLight}>
        <div className={`divide-y ${isLight ? 'divide-gray-100' : 'divide-gray-700'}`}>
          <Row label="Restricted mode (+18)" description="Hide videos and content marked as 18+" isLight={isLight}
            right={<ToggleSwitch value={restrictedMode} onChange={v => { setRestrictedMode(v); save('avvelux-restricted-mode', v); }} isLight={isLight} />} />
          <Row label="Autoplay next video" description="Automatically play the next video when current one ends" isLight={isLight}
            right={<ToggleSwitch value={autoplay} onChange={v => { setAutoplay(v); save('avvelux-autoplay', v); }} isLight={isLight} />} />
          <Row label="Default captions" description="Always show captions when available" isLight={isLight}
            right={<ToggleSwitch value={captionsDefault} onChange={v => { setCaptionsDefault(v); save('avvelux-captions', v); }} isLight={isLight} />} />
          <Row
            label="Default video quality"
            description="Quality used when starting videos"
            isLight={isLight}
            right={
              <select
                value={defaultQuality}
                onChange={e => { setDefaultQuality(e.target.value); save('avvelux-quality', e.target.value); }}
                className={`text-sm rounded-lg px-3 py-1.5 border ${isLight ? 'bg-gray-100 border-gray-200 text-black' : 'bg-[#1a1a1a] border-gray-700 text-white'}`}
              >
                <option value="auto">Auto</option>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
                <option value="360p">360p</option>
              </select>
            }
          />
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell} isLight={isLight}>
        <div className={`divide-y ${isLight ? 'divide-gray-100' : 'divide-gray-700'}`}>
          <Row label="Push notifications" description="Receive notifications in your browser" isLight={isLight}
            right={<ToggleSwitch value={pushNotifs} onChange={v => { setPushNotifs(v); save('avvelux-push-notifs', v); }} isLight={isLight} />} />
          <Row label="Email notifications" description="Receive email updates about your account and subscriptions" isLight={isLight}
            right={<ToggleSwitch value={emailNotifs} onChange={v => { setEmailNotifs(v); save('avvelux-email-notifs', v); }} isLight={isLight} />} />
          <Row label="All notifications" description="Master toggle for all notification types" isLight={isLight}
            right={<ToggleSwitch value={notifications} onChange={v => { setNotifications(v); save('avvelux-notifications', v); }} isLight={isLight} />} />
        </div>
      </Section>

      {/* Account */}
      <Section title="Account & Security" icon={Lock} isLight={isLight}>
        <div className={`divide-y ${isLight ? 'divide-gray-100' : 'divide-gray-700'}`}>
          <Row label="Two-factor authentication" description="Add an extra layer of security to your account" isLight={isLight}
            right={<button className={`text-xs px-3 py-1.5 rounded-lg font-medium ${isLight ? 'bg-gray-200 text-black hover:bg-gray-300' : 'bg-[#3a3a3a] text-white hover:bg-[#444]'}`}>Set up</button>} />
          <Row label="Active sessions" description="View and manage your active login sessions" isLight={isLight}
            right={<button className={`text-xs px-3 py-1.5 rounded-lg font-medium ${isLight ? 'bg-gray-200 text-black hover:bg-gray-300' : 'bg-[#3a3a3a] text-white hover:bg-[#444]'}`}>Manage</button>} />
          <Row label="Download your data" description="Request a copy of all your Avvelux data" isLight={isLight}
            right={<button className={`text-xs px-3 py-1.5 rounded-lg font-medium ${isLight ? 'bg-gray-200 text-black hover:bg-gray-300' : 'bg-[#3a3a3a] text-white hover:bg-[#444]'}`}>Request</button>} />
          <Row label="Delete account" description="Permanently delete your account and all data" isLight={isLight}
            right={<button onClick={() => setShowDeleteModal(true)} className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20">Delete</button>} />
        </div>
      </Section>
    </div>
  );
}