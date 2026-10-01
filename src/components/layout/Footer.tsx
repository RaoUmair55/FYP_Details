import React from 'react';
import { ActiveTab } from '../../types';
import { ShieldCheck } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-neutral-900 dark:text-white">
              IntegrityFlow
            </span>
            <span className="text-xs text-neutral-400">
              · Final Year Project Architecture
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400">
            <button onClick={() => setActiveTab('overview')} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              System Overview
            </button>
            <button onClick={() => setActiveTab('architecture')} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              3-Tier Topology
            </button>
            <button onClick={() => setActiveTab('modules')} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Core Modules
            </button>
            <button onClick={() => setActiveTab('simulators')} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Interactive Simulators
            </button>
            <button onClick={() => setActiveTab('database')} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Database & Indexes
            </button>
            <button onClick={() => setActiveTab('viva-defense')} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Viva Voce Defense
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-400">
          <div>
            Built with React 19, Node.js, Express, and PostgreSQL. Designed for institutional exam integrity.
          </div>
          <div>
            Computer Science FYP Showcase
          </div>
        </div>
      </div>
    </footer>
  );
};
