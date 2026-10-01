import React, { useState } from 'react';
import { modulesData } from '../../data/modulesData';
import { ModuleDetail } from '../../types';
import { 
  Layers, 
  Search, 
  Code2, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  FileCode, 
  Sliders, 
  ArrowRight,
  Terminal,
  Activity
} from 'lucide-react';
import { MathFormula } from '../common/MathFormula';

interface ModulesViewProps {
  selectedModuleId: string;
  onSelectModule: (id: string) => void;
}

export const ModulesView: React.FC<ModulesViewProps> = ({
  selectedModuleId,
  onSelectModule
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'AI Monitoring', 'Candidate App', 'Server & Database', 'Examiner Dashboard', 'Security & Transport'];

  const filteredModules = modulesData.filter((mod) => {
    const matchesCategory = categoryFilter === 'All' || mod.category === categoryFilter;
    const matchesSearch = 
      mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.technicalImplementation.libraries.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const activeModule: ModuleDetail = 
    modulesData.find((m) => m.id === selectedModuleId) || 
    filteredModules[0] || 
    modulesData[0];

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Core Modules Technical Specification
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Exhaustive, step-by-step engineering breakdown of all 12 platform modules: inputs, mechanisms, algorithms, and code.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter modules or libraries..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Category Segmented Control */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-neutral-100 dark:border-neutral-800/60">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              categoryFilter === cat
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main 2-Column Layout: Sidebar Module Index + Deep Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Module Navigation List (4 cols) */}
        <div className="lg:col-span-4 space-y-2 max-h-[750px] overflow-y-auto pr-1">
          {filteredModules.map((mod) => {
            const isSelected = activeModule.id === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => onSelectModule(mod.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 shadow-sm ring-1 ring-blue-500/20'
                    : 'border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                    Module {mod.number < 10 ? `0${mod.number}` : mod.number}
                  </span>
                  <span className="text-neutral-400 text-[11px]">
                    {mod.category}
                  </span>
                </div>
                <div className="text-sm font-bold text-neutral-900 dark:text-white mt-1 line-clamp-1">
                  {mod.title}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                  {mod.shortDesc}
                </div>
              </button>
            );
          })}

          {filteredModules.length === 0 && (
            <div className="p-6 text-center text-xs text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl">
              No modules match your filter query.
            </div>
          )}
        </div>

        {/* Right Column: Deep Technical Inspector (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 space-y-6 shadow-sm">
            {/* Title & Metadata Header */}
            <div className="border-b border-neutral-100 dark:border-neutral-800 pb-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span>Module {activeModule.number < 10 ? `0${activeModule.number}` : activeModule.number}</span>
                <span aria-hidden="true">·</span>
                <span>{activeModule.category}</span>
                <span aria-hidden="true">·</span>
                <span>Production Implementation</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {activeModule.title}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {activeModule.purpose}
              </p>
            </div>

            {/* How It Works Deep-Dive */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-500" />
                <span>Under the Hood: Execution Sequence & Logic</span>
              </h3>
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-2">
                <p>{activeModule.howItWorks}</p>
                <div className="pt-2 text-neutral-500 border-t border-neutral-200 dark:border-neutral-800/60">
                  <strong className="text-neutral-700 dark:text-neutral-300">Architecture Integration:</strong> {activeModule.architectureFit}
                </div>
              </div>
            </div>

            {/* Formulas & Mathematical Boundaries */}
            {activeModule.keyFormulasOrRules && activeModule.keyFormulasOrRules.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Mathematical Formulas & Threshold Invariants</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeModule.keyFormulasOrRules.map((rule, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2 shadow-sm">
                      <div className="text-xs font-bold text-neutral-900 dark:text-white">
                        {rule.name}
                      </div>
                      {rule.formula && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/40 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/50 overflow-x-auto">
                          <MathFormula formula={rule.formula} />
                        </div>
                      )}
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                        {rule.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Stack & Implementation Mechanics */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                <span>Technical Implementation & Libraries</span>
              </h3>
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-neutral-400">Language / Runtime:</span>
                    <div className="font-mono font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                      {activeModule.technicalImplementation.language}
                    </div>
                  </div>
                  <div>
                    <span className="text-neutral-400">Core Source Files:</span>
                    <div className="font-mono font-semibold text-blue-600 dark:text-blue-400 mt-0.5 truncate">
                      {activeModule.technicalImplementation.coreFiles.join(', ')}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-neutral-400">Dependencies & Libraries:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {activeModule.technicalImplementation.libraries.map((lib, i) => (
                      <span key={i} className="font-mono text-[11px] px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {lib}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800/60">
                  <span className="text-neutral-400 block mb-1">Mechanisms Enforced:</span>
                  <ul className="space-y-1">
                    {activeModule.technicalImplementation.mechanisms.map((mech, i) => (
                      <li key={i} className="flex items-start gap-2 text-neutral-600 dark:text-neutral-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{mech}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Inputs & Outputs Contract */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 space-y-2">
                <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Input Signatures</span>
                </div>
                <ul className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                  {activeModule.inputs.map((inp, idx) => (
                    <li key={idx} className="font-mono text-[11px]">· {inp}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 space-y-2">
                <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Output Telemetry / Payloads</span>
                </div>
                <ul className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                  {activeModule.outputs.map((out, idx) => (
                    <li key={idx} className="font-mono text-[11px]">· {out}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Edge Cases & False-Positive Defenses */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Edge Cases & False-Positive Defenses</span>
              </h3>
              <div className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                {activeModule.edgeCasesHandled.map((edge, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold shrink-0">→</span>
                    <span>{edge}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Real Production Code Snippet */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Source Code Excerpt</span>
                </h3>
                <span className="font-mono text-[11px] text-neutral-400">
                  {activeModule.codeSnippet.filename}
                </span>
              </div>
              <div className="rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden shadow-inner">
                <div className="px-4 py-2 bg-neutral-900/80 border-b border-neutral-800 text-[11px] font-mono text-neutral-400 flex justify-between items-center">
                  <span>Language: {activeModule.codeSnippet.language}</span>
                  <span className="text-emerald-400">{activeModule.codeSnippet.explanation}</span>
                </div>
                <pre className="p-4 text-xs font-mono text-neutral-200 overflow-x-auto leading-relaxed">
                  <code>{activeModule.codeSnippet.code}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
