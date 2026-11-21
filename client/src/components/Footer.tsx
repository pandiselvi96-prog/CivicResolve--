import React from 'react';
import { Logo } from './Logo';
import { useLanguage } from '../context/LanguageContext';
import { Heart, Sparkles, ShieldCheck, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Logo showText={false} size={32} />
              <span className="text-xl font-bold text-white tracking-tight">
                Civic<span className="text-civic-tealLight">Resolve</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              {t('brandTagline')}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('hackathonBadge')}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                {t('navReport')}
              </li>
              <li className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                {t('navTrack')}
              </li>
              <li className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                {t('navAdmin')}
              </li>
              <li className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                Google Gemini API Integration
              </li>
            </ul>
          </div>

          {/* Civic Tech Pillars */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Guiding Principles
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-civic-tealLight shrink-0" />
                <span>Zero Citizen Friction & Open Access</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Micro-Local Precision GIS Routing</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                <span>AI Automated Urgency Triage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CivicResolve. Built for PromptWars × GDG on Campus Hackathon.</p>
          <p className="flex items-center gap-1.5">
            Designed for urban civic empowerment with
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
