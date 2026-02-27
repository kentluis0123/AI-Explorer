import React, { useState } from 'react';
import axios from 'axios';
import { Search, BookOpen, Newspaper, GraduationCap, ShieldCheck, Loader2, ExternalLink } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const App = () => {
  const [topic, setTopic] = useState('');
  const [activeTab, setActiveTab] = useState('Articles');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'Articles', label: 'Overview', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'Studies', label: 'Research', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'News', label: 'News', icon: <Newspaper className="w-4 h-4" /> },
    { id: 'Fact-Check', label: 'Fact-Check', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!topic) return;
    
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post(`${API_URL}/api/summarize`, {
        topic,
        category: activeTab
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please ensure the backend is running and API keys are set.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 font-sans">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-16">
        
        {/* Header */}
        <header className="text-center mb-10 md:mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-4">
            AI <span className="text-blue-600">Explorer</span>
          </h1>
          <p className="text-slate-500 text-base md:text-lg max-w-md mx-auto">
            Real-time AI research and summarization at your fingertips.
          </p>
        </header>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mb-8 md:mb-12 group">
          <input
            type="text"
            className="w-full p-4 md:p-6 pl-12 md:pl-16 rounded-2xl md:rounded-3xl border-none bg-white shadow-xl shadow-blue-900/5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base md:text-xl"
            placeholder="Explore any topic (e.g., Quantum Computing, Mars...)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 md:w-6 h-6 group-focus-within:text-blue-500 transition-colors" />
          <button className="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95">
            Search
          </button>
        </form>

        {/* Tabs - Mobile Scrollable */}
        <div className="flex overflow-x-auto pb-4 md:pb-0 md:justify-center gap-2 no-scrollbar">
          <div className="flex bg-slate-200/50 p-1 rounded-2xl whitespace-nowrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  // Optionally trigger search on tab change if topic exists
                  // if (topic && result) handleSearch(); 
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all text-sm md:text-base ${
                  activeTab === tab.id 
                    ? 'bg-white text-blue-600 shadow-sm font-bold' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <main className="mt-8 md:mt-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <Loader2 className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="text-slate-500 font-medium animate-pulse text-center">
                AI is researching {activeTab} for "{topic}"...
              </p>
            </div>
          ) : result ? (
            <div className="animate-fade-in">
              {/* Image Gallery */}
              {result.images && result.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
                  {result.images.slice(0, 4).map((img, i) => (
                    <div key={i} className="aspect-square rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                      <img 
                        src={img} 
                        alt={`${topic} reference ${i + 1}`} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
                {/* Summary */}
                <div className="flex-1 bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600">
                    {activeTab} Summary
                  </h3>
                  <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-400 font-bold tracking-tighter">AI RESEARCHED</span>
                </div>
                <div className="prose prose-slate max-w-none">
                  {result.summary.split('\n').map((line, i) => (
                    <p key={i} className="text-slate-700 leading-relaxed text-base md:text-lg mb-4 last:mb-0">
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              {/* Sidebar Sources */}
              <div className="w-full lg:w-80 shrink-0">
                <h3 className="text-sm font-bold text-slate-900 mb-4 px-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  Verified Sources
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                  {result.sources.map((source, i) => (
                    <a 
                      key={i} 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all group"
                    >
                      <span className="text-slate-800 text-sm font-semibold line-clamp-2 group-hover:text-blue-600 mb-2 transition-colors">
                        {source.title}
                      </span>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">
                          {new URL(source.url).hostname.replace('www.', '')}
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 md:py-40 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 transition-colors hover:border-slate-300">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-slate-300 w-8 h-8" />
              </div>
              <p className="text-slate-400 font-medium">Type a topic and click Search to see the AI magic.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
