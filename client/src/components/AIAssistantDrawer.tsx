import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, MessageSquare, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeComplaintId?: string;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  isDemo?: boolean;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  activeComplaintId
}) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: 'Hello! I am the **CivicResolve AI Assistant** powered by Google Gemini. Ask me to summarize recent civic incidents, analyze department workloads, or draft official status updates.',
      isDemo: true
    }
  ]);

  const sampleQueries = [
    "Summarize today's critical road issues",
    activeComplaintId ? `Draft a status update for ${activeComplaintId}` : 'Draft a status update for CR-2026-1001',
    "Which department has the most pending grievances?",
    "Identify priority sanitation hotspots in Chennai"
  ];

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || query).trim();
    if (!q || loading) return;

    setMessages(prev => [...prev, { sender: 'user', text: q }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.askAssistant({
        query: q,
        complaintId: activeComplaintId
      });

      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: res.answer,
          isDemo: res.isDemoMode
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Unable to reach the AI service right now. Please verify backend connection.',
          isDemo: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 md:w-[420px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="p-4 bg-navy-900 text-white flex items-center justify-between border-b border-navy-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-civic-teal flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-white">{t('aiDrawerTitle')}</h3>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-[11px] text-slate-300">Gemini-Powered Civic Copilot</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
          aria-label="Close drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs">
        <span className="font-semibold text-slate-500 block mb-2 text-[10px] uppercase tracking-wider">
          {t('aiDrawerSuggestions')}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSend(sq)}
              className="text-left text-[11px] bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 px-2.5 py-1 rounded-lg transition-colors shadow-2xs flex items-center gap-1"
            >
              <ChevronRight className="w-3 h-3 text-civic-teal shrink-0" />
              <span className="truncate max-w-[280px]">{sq}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-navy-900 text-white rounded-br-xs shadow-sm'
                  : 'bg-slate-100 text-slate-800 border border-slate-200/80 rounded-bl-xs'
              }`}
            >
              {m.sender === 'assistant' && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-civic-teal mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>CivicResolve AI</span>
                  {m.isDemo && (
                    <span className="text-slate-400 font-normal">• Demo Mode</span>
                  )}
                </div>
              )}
              <div className="whitespace-pre-line">{m.text}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl p-3 text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-civic-teal animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-civic-teal animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-civic-teal animate-bounce [animation-delay:0.4s]" />
              <span>Analyzing city data...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('aiDrawerPlaceholder')}
            className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="p-2.5 rounded-xl bg-civic-teal hover:bg-civic-tealDark text-white disabled:opacity-50 transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
