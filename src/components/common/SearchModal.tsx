import React, { useState, useEffect } from 'react';
import { Search, X, Layers, Cpu, Code2, Database, HelpCircle, ArrowRight } from 'lucide-react';
import { modulesData } from '../../data/modulesData';
import { vivaQuestions } from '../../data/vivaQuestions';
import { databaseTables } from '../../data/databaseSchema';
import { ActiveTab } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onSelectModule: (moduleId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onSelectModule
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName))) {
        e.preventDefault();
        // toggle handled by parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalized = query.toLowerCase().trim();

  // Search results
  const matchedModules = modulesData.filter(m => 
    !normalized || 
    m.title.toLowerCase().includes(normalized) ||
    m.shortDesc.toLowerCase().includes(normalized) ||
    m.technicalImplementation.libraries.some(l => l.toLowerCase().includes(normalized)) ||
    m.purpose.toLowerCase().includes(normalized)
  );

  const matchedQuestions = vivaQuestions.filter(q =>
    !normalized ||
    q.question.toLowerCase().includes(normalized) ||
    q.shortAnswer.toLowerCase().includes(normalized) ||
    q.deepDive.toLowerCase().includes(normalized)
  );

  const matchedTables = databaseTables.filter(t =>
    !normalized ||
    t.name.toLowerCase().includes(normalized) ||
    t.description.toLowerCase().includes(normalized) ||
    t.columns.some(c => c.name.toLowerCase().includes(normalized))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800 gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all 13 modules, YOLO INT8 vision, MongoDB schemas, algorithms, formulas, or viva questions..."
            autoFocus
            className="w-full bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {/* Modules Section */}
          {matchedModules.length > 0 && (
            <div className="space-y-2 pt-2 first:pt-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" />
                <span>Modules ({matchedModules.length})</span>
              </div>
              <div className="space-y-1">
                {matchedModules.slice(0, 4).map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => {
                      onSelectModule(mod.id);
                      onSelectTab('modules');
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-transparent hover:border-blue-200 dark:hover:border-blue-900/50 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        Module {mod.number} · {mod.category}
                      </div>
                      <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {mod.title}
                      </div>
                      <div className="text-xs text-neutral-500 line-clamp-1">
                        {mod.shortDesc}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Database Tables Section */}
          {matchedTables.length > 0 && (
            <div className="space-y-2 pt-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                <Database className="w-3.5 h-3.5" />
                <span>Database Tables ({matchedTables.length})</span>
              </div>
              <div className="space-y-1">
                {matchedTables.slice(0, 3).map((tbl) => (
                  <button
                    key={tbl.name}
                    onClick={() => {
                      onSelectTab('database');
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/60 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        {tbl.name}
                      </span>
                      <div className="text-xs text-neutral-500">
                        {tbl.description}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Viva Questions Section */}
          {matchedQuestions.length > 0 && (
            <div className="space-y-2 pt-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Viva Defense & Architectural Rationale ({matchedQuestions.length})</span>
              </div>
              <div className="space-y-1">
                {matchedQuestions.slice(0, 3).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectTab('viva-defense');
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/60 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        {q.category}
                      </div>
                      <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100 line-clamp-1">
                        {q.question}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedModules.length === 0 && matchedTables.length === 0 && matchedQuestions.length === 0 && (
            <div className="py-8 text-center text-sm text-neutral-400">
              No matching architecture topics found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950/80 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 flex items-center justify-between">
          <span>Press ESC to close</span>
          <span>Click any item to navigate immediately</span>
        </div>
      </div>
    </div>
  );
};
