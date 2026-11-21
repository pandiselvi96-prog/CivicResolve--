import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { DemoBanner } from './components/DemoBanner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { ReportPage } from './pages/ReportPage';
import { TrackPage } from './pages/TrackPage';
import { AdminPage } from './pages/AdminPage';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'home' | 'report' | 'track' | 'admin'>('home');
  const [selectedTrackId, setSelectedTrackId] = useState<string>('CR-2026-1001');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const handleNavigateToTrack = (id: string) => {
    setSelectedTrackId(id);
    setCurrentTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Demo & Disclaimer Strip */}
      <DemoBanner />

      {/* Main Responsive Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={tab => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <LandingPage
            onNavigate={tab => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectComplaintForTracking={handleNavigateToTrack}
          />
        )}

        {currentTab === 'report' && (
          <ReportPage
            onNavigate={tab => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSetTrackId={handleNavigateToTrack}
          />
        )}

        {currentTab === 'track' && (
          <TrackPage
            initialComplaintId={selectedTrackId}
            onNavigateReport={() => {
              setCurrentTab('report');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPage
            onOpenAssistant={() => setIsAssistantOpen(true)}
            onSelectForTrack={handleNavigateToTrack}
          />
        )}
      </main>

      {/* AI Assistant Flyout Drawer */}
      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        activeComplaintId={selectedTrackId}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
