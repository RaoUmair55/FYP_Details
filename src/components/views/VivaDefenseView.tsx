import React, { useState } from 'react';
import { vivaQuestions } from '../../data/vivaQuestions';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  Database,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export const VivaDefenseView: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIndices, setExpandedIndices] = useState<number[]>([0, 1, 2]);

  const categories = ['All', 'Architecture', 'AI & Algorithms', 'Security & Privacy', 'Performance & Database'];

  const filteredQuestions = vivaQuestions.filter(q => {
    const matchesCat = filterCategory === 'All' || q.category === filterCategory;
    const matchesSearch = 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.shortAnswer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.deepDive.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleIndex = (idx: number) => {
    setExpandedIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const expandAll = () => {
    setExpandedIndices(filteredQuestions.map((_, i) => i));
  };

  const collapseAll = () => {
    setExpandedIndices([]);
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            FYP Viva Voce & Technical Defense Guide
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Authoritative justifications for software design choices, privacy trade-offs, and algorithms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-800"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-800"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Category Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search defense questions..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Questions Accordion List */}
      <div className="space-y-4">
        {filteredQuestions.map((item, idx) => {
          const isExpanded = expandedIndices.includes(idx);
          return (
            <div
              key={idx}
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm transition-colors"
            >
              <button
                onClick={() => toggleIndex(idx)}
                className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="font-mono text-blue-600 dark:text-blue-400">
                      Q{idx + 1}
                    </span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-500">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {item.question}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">
                    {item.shortAnswer}
                  </p>
                </div>

                <div className="p-1 rounded-md text-neutral-400 shrink-0 mt-1">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-3 bg-neutral-50/50 dark:bg-neutral-950/40 text-xs">
                  <div className="text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-2">
                    <div className="font-semibold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px]">
                      In-Depth Technical Justification:
                    </div>
                    <p>{item.deepDive}</p>
                  </div>

                  {item.codeOrFormulaRef && (
                    <div className="pt-2">
                      <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/60 inline-block">
                        Reference: {item.codeOrFormulaRef}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Known Academic Limitations & Future Scope */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span>Transparent FYP Limitations & Future Research Directions</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
            <span className="font-bold text-neutral-900 dark:text-white">1. Acoustic Replay vs Live Human Speech</span>
            <p>
              While Resemblyzer evaluates vocal tract characteristics to detect unauthorized speakers, it cannot distinguish live speech in the room from recorded audio played through an external speaker (e.g. phone call). High-frequency acoustic artifact analysis is identified as future work.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
            <span className="font-bold text-neutral-900 dark:text-white">2. Multi-Candidate Model Training</span>
            <p>
              The current system uses pretrained general acoustic and computer vision models (MediaPipe and Resemblyzer). Fine-tuning embeddings on student vocal accents would further reduce false positive rates on localized dialects.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
