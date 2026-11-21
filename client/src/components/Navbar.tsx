import React, { useState } from 'react';
import { Logo } from './Logo';
import { useLanguage } from '../context/LanguageContext';
import {
  FileText,
  Search,
  Shield,
  Languages,
  Menu,
  X,
  Sparkles,
  Bot
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'home' | 'report' | 'track' | 'admin';
  setCurrentTab: (tab: 'home' | 'report' | 'track' | 'admin') => void;
  onOpenAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenAssistant }) => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ id: 'home' | 'report' | 'track' | 'admin'; label: string; icon: React.ElementType }> = [
    { id: 'home', label: t('navHome'), icon: Shield },
    { id: 'report', label: t('navReport'), icon: FileText },
    { id: 'track', label: t('navTrack'), icon: Search },
    { id: 'admin', label: t('navAdmin'), icon: Shield },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => {
              setCurrentTab('home');
              setMobileMenuOpen(false);
            }}
            className="cursor-pointer"
          >
            <Logo />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-navy-900 text-white shadow-xs'
                      : 'text-slate-700 hover:text-navy-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: AI Assistant Trigger + Language Switch + Demo Mode Badge */}
          <div className="hidden sm:flex items-center gap-3">
            {/* AI Assistant Quick Pill */}
            {onOpenAssistant && (
              <button
                onClick={onOpenAssistant}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-50 text-civic-teal hover:bg-teal-100/80 border border-teal-200 transition-colors shadow-xs"
                title="Ask CivicResolve AI Assistant"
              >
                <Bot className="w-3.5 h-3.5 text-civic-teal" />
                <span>AI Assistant</span>
              </button>
            )}

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-all shadow-xs"
              title="Switch language EN / தமிழ்"
              aria-label="Toggle language"
            >
              <Languages className="w-4 h-4 text-civic-teal" />
              <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {/* Demo Status Indicator */}
            <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gemini AI Demo</span>
            </div>
          </div>

          {/* Mobile menu hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-2 py-1 rounded border border-slate-300 text-xs font-bold text-slate-700"
            >
              {language === 'en' ? 'தமிழ்' : 'EN'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-navy-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
          {onOpenAssistant && (
            <button
              onClick={() => {
                onOpenAssistant();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-civic-teal bg-teal-50"
            >
              <Bot className="w-4 h-4" />
              AI Assistant
            </button>
          )}
        </div>
      )}
    </header>
  );
};
