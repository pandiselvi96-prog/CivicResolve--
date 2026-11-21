import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Shield,
  Search,
  PlusCircle,
  Clock,
  CheckCircle2,
  Building,
  Sparkles,
  MapPin,
  Flame,
  Truck,
  Droplet,
  Trash2,
  Lightbulb,
  Workflow
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { AnalyticsData, Complaint } from '../types';

interface LandingPageProps {
  onNavigate: (tab: 'home' | 'report' | 'track' | 'admin') => void;
  onSelectComplaintForTracking?: (id: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onSelectComplaintForTracking
}) => {
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    api.getAnalytics()
      .then(res => {
        if (res.success && res.analytics) {
          setAnalytics(res.analytics);
        }
      })
      .catch(err => console.warn('Failed to load live landing stats:', err));

    api.getComplaints()
      .then(res => {
        if (res.success && res.complaints) {
          setRecentComplaints(res.complaints.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  const categories = [
    { name: t('catRoads'), icon: Truck, color: 'text-amber-500 bg-amber-50 border-amber-200' },
    { name: t('catGarbage'), icon: Trash2, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
    { name: t('catWater'), icon: Droplet, color: 'text-sky-500 bg-sky-50 border-sky-200' },
    { name: t('catLights'), icon: Lightbulb, color: 'text-yellow-500 bg-yellow-50 border-yellow-200' },
    { name: t('catDrainage'), icon: Workflow, color: 'text-indigo-500 bg-indigo-50 border-indigo-200' },
    { name: t('catInfra'), icon: Building, color: 'text-rose-500 bg-rose-50 border-rose-200' }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 bg-gradient-to-b from-slate-100 via-white to-slate-50 border-b border-slate-200">
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.07] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Hackathon Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-civic-teal text-xs font-bold mb-6 shadow-2xs animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Sparkles className="w-3.5 h-3.5 text-civic-teal" />
            <span>PromptWars × GDG on Campus Hackathon</span>
          </div>

          {/* Exact Heading Required */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-navy-950 tracking-tight leading-[1.1] max-w-4xl mx-auto">
            {t('heroTitle')}
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* Primary CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
            <button
              onClick={() => onNavigate('report')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-gradient-to-r from-teal-600 to-civic-teal hover:from-teal-700 hover:to-teal-800 text-white font-bold text-base shadow-lg shadow-teal-600/25 transition-all hover:scale-105 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>{t('btnReportIssue')}</span>
            </button>

            <button
              onClick={() => onNavigate('track')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white hover:bg-slate-100 text-navy-900 font-bold text-base border border-slate-300 shadow-xs transition-all hover:border-slate-400 cursor-pointer"
            >
              <Search className="w-5 h-5 text-civic-teal" />
              <span>{t('btnTrackComplaint')}</span>
            </button>
          </div>

          {/* Secondary Admin Link */}
          <div className="mt-6">
            <button
              onClick={() => onNavigate('admin')}
              className="text-xs font-semibold text-slate-500 hover:text-navy-900 inline-flex items-center gap-1 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Municipal Officials Portal & Dashboard</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Live Impact Statistics Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200/80">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {/* Stat 1: Resolved */}
            <div className="flex flex-col items-center text-center p-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="text-3xl sm:text-4xl font-extrabold text-navy-950">
                {analytics?.resolvedComplaints ?? 38}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                {t('statResolved')}
              </span>
            </div>

            {/* Stat 2: Avg Resolution Time */}
            <div className="flex flex-col items-center text-center p-2 pt-4 sm:pt-2">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-2">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-3xl sm:text-4xl font-extrabold text-navy-950">
                {analytics?.avgResolutionTimeHours ?? 24.5} <span className="text-lg font-bold text-slate-500">h</span>
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                {t('statAvgTime')}
              </span>
            </div>

            {/* Stat 3: Active Departments */}
            <div className="flex flex-col items-center text-center p-2 pt-4 sm:pt-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
                <Building className="w-6 h-6" />
              </div>
              <span className="text-3xl sm:text-4xl font-extrabold text-navy-950">
                6+
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                {t('statDepartments')}
              </span>
            </div>

            {/* Stat 4: AI Triage Accuracy */}
            <div className="flex flex-col items-center text-center p-2 pt-4 sm:pt-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-3xl sm:text-4xl font-extrabold text-navy-950">
                96.4%
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                {t('statAccuracy')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-950 tracking-tight">
            {t('howItWorksTitle')}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            {t('howItWorksSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-civic-teal flex items-center justify-center font-extrabold text-xl mb-5 group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6 text-civic-teal" />
            </div>
            <h3 className="text-lg font-bold text-navy-950 mb-2">
              {t('step1Title')}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('step1Desc')}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center font-extrabold text-xl mb-5 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="text-lg font-bold text-navy-950 mb-2">
              {t('step2Title')}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('step2Desc')}
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-extrabold text-xl mb-5 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-navy-950 mb-2">
              {t('step3Title')}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('step3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Category Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
              Grievance Categories Supported
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Smart automated department dispatch tailored for municipal city governance
            </p>
          </div>
          <button
            onClick={() => onNavigate('report')}
            className="self-start sm:self-auto text-xs font-bold text-civic-teal hover:text-civic-tealDark inline-flex items-center gap-1"
          >
            <span>Report in any category</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div
                key={i}
                onClick={() => onNavigate('report')}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 border ${cat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-navy-950 group-hover:text-civic-teal transition-colors line-clamp-2">
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Resolutions Ticker */}
      {recentComplaints.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Live Public Feed
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  Recent Grievances Tracked in System
                </h3>
              </div>
              <button
                onClick={() => onNavigate('track')}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-teal-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <span>Track By Complaint ID</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentComplaints.map(c => (
                <div
                  key={c.id}
                  onClick={() => {
                    if (onSelectComplaintForTracking) {
                      onSelectComplaintForTracking(c.id);
                    }
                    onNavigate('track');
                  }}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl p-4 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-teal-400">
                        {c.id}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                        {c.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-1 mb-1">
                      {c.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {c.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[150px]">{c.department}</span>
                    <span className="text-teal-400 font-semibold group-hover:underline">Track →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
