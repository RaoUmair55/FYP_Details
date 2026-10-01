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
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-200">
        {/* Sticky Header */}
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

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
        </main>

        {/* Footer */}
        <Footer setActiveTab={setActiveTab} />
      </div>
    </ThemeProvider>
  );
}
