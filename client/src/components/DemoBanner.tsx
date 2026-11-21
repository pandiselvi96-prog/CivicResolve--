import React, { useState } from 'react';
import { AlertTriangle, Sparkles, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const DemoBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useLanguage();

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-teal-500/10 border-b border-amber-300/40 text-amber-950 px-4 py-2 text-xs md:text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1 bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wide shrink-0">
            <Sparkles className="w-3 h-3 text-amber-700" />
            Hackathon Demo
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 hidden sm:inline" />
            <span className="font-semibold text-amber-900">{t('disclaimerTitle')}:</span>
            <span className="text-amber-800/90">{t('disclaimerBody')}</span>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-amber-800/70 hover:text-amber-950 rounded hover:bg-amber-200/50 transition-colors shrink-0"
          title="Dismiss notification"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
