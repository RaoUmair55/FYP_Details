import React, { useState } from 'react';
import { ActiveTab } from './types';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SearchModal } from './components/common/SearchModal';
import { OverviewView } from './components/views/OverviewView';
import { ArchitectureView } from './components/views/ArchitectureView';
import { ModulesView } from './components/views/ModulesView';
import { SimulatorsView } from './components/views/SimulatorsView';
import { ImplementationGuideView } from './components/views/ImplementationGuideView';
import { DatabaseErdView } from './components/views/DatabaseErdView';
import { VivaDefenseView } from './components/views/VivaDefenseView';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('module-1-whitelist');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const handleSelectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setActiveTab('modules');
  };

  return (
    <ThemeProvider>
      <div className="relative min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-300 overflow-x-hidden selection:bg-blue-600 selection:text-white">
        {/* Subtle Ambient Glassmorphic Mesh Lighting (Fixed in Background) */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          {/* Top-right subtle blue gradient orb */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl" />
          {/* Mid-left subtle purple gradient orb */}
          <div className="absolute top-1/3 -left-32 w-96 h-96 bg-purple-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl" />
          {/* Bottom-right subtle emerald gradient orb */}
          <div className="absolute -bottom-32 -right-20 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-3xl" />
        </div>

        {/* Sticky Glass Header */}
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          openSearch={() => setIsSearchOpen(true)} 
        />

        {/* Global Search Modal */}
        <SearchModal 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
          onSelectTab={(tab) => setActiveTab(tab)} 
          onSelectModule={handleSelectModule} 
        />

        {/* Main Content Area with Smooth Motion Transitions */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'overview' && (
                <OverviewView 
                  onNavigateTab={(tab) => setActiveTab(tab)} 
                  onSelectModule={handleSelectModule} 
                />
              )}

              {activeTab === 'architecture' && (
                <ArchitectureView />
              )}

              {activeTab === 'modules' && (
                <ModulesView 
                  selectedModuleId={selectedModuleId} 
                  onSelectModule={(id) => setSelectedModuleId(id)} 
                />
              )}

              {activeTab === 'simulators' && (
                <SimulatorsView />
              )}

              {activeTab === 'implementation' && (
                <ImplementationGuideView />
              )}

              {activeTab === 'database' && (
                <DatabaseErdView />
              )}

              {activeTab === 'viva-defense' && (
                <VivaDefenseView />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <Footer setActiveTab={setActiveTab} />
      </div>
    </ThemeProvider>
  );
}
