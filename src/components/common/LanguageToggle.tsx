import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export interface LanguageToggleProps {
  className?: string;
  variant?: 'pill' | 'button';
  size?: 'sm' | 'md';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className = '',
  variant = 'pill',
  size = 'sm',
}) => {
  const { language, setLanguage, isUrdu } = useLanguage();

  if (variant === 'button') {
    return (
      <button
        onClick={() => setLanguage(isUrdu ? 'en' : 'ur')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:shadow-xs ${className}`}
        title="Toggle English / اردو"
      >
        <Globe className="w-3.5 h-3.5 text-[#0F766E]" />
        <span>{isUrdu ? 'English' : 'اردو'}</span>
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs ${className}`}
      role="group"
      aria-label="Language selector"
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
          !isUrdu
            ? 'bg-white text-[#0F766E] shadow-2xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLanguage('ur')}
        className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
          isUrdu
            ? 'bg-white text-[#0F766E] shadow-2xs font-urdu'
            : 'text-slate-600 hover:text-slate-900 font-urdu'
        }`}
      >
        اردو
      </button>
    </div>
  );
};
