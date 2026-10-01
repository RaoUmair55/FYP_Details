import React from 'react';
import { ActiveTab } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { 
  Sun, 
  Moon, 
  Search, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  PlayCircle, 
  Code2, 
  Database, 
  HelpCircle,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openSearch: () => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, openSearch }) => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: NavItem[] = [
    { id: 'overview', label: 'System Overview', icon: <ShieldCheck className="w-4 h-4 shrink-0" /> },
    { id: 'architecture', label: 'Architecture', icon: <Cpu className="w-4 h-4 shrink-0" /> },
    { id: 'modules', label: 'Core Modules', icon: <Layers className="w-4 h-4 shrink-0" /> },
    { id: 'simulators', label: 'Interactive Labs', icon: <PlayCircle className="w-4 h-4 shrink-0" /> },
    { id: 'implementation', label: 'Codebase Guide', icon: <Code2 className="w-4 h-4 shrink-0" /> },
    { id: 'database', label: 'Schema & Benchmarks', icon: <Database className="w-4 h-4 shrink-0" /> },
    { id: 'viva-defense', label: 'Viva & Defense', icon: <HelpCircle className="w-4 h-4 shrink-0" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800/80 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl transition-colors duration-200 shadow-sm">
      {/* Top Bar: Brand, Search, Theme Toggle & Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800/60">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:bg-blue-700 transition-colors shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-white font-sans whitespace-nowrap">
              IntegrityFlow
            </span>
          </button>
          
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/50 whitespace-nowrap">
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span>FYP Technical Architecture</span>
          </span>
        </div>

        {/* Right: Actions (Quick Search, Dark Mode, Mobile Menu) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openSearch}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg transition-colors shrink-0"
            title="Search modules, formulas, architecture, and code (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline font-mono text-[11px]">Quick Search</span>
            <kbd className="hidden md:inline text-[10px] px-1.5 py-0.2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-400 font-mono">
              /
            </kbd>
          </button>

          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-800 shrink-0"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline font-medium">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="hidden sm:inline font-medium">Dark</span>
              </>
            )}
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="md:hidden p-1.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg shrink-0"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Bottom Bar: Dedicated Tab Navigation Row (Completely separated from buttons) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1.5 no-scrollbar scroll-smooth">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-semibold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/80 dark:hover:bg-neutral-900/80'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer (Only under md breakpoint when hamburger clicked) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl px-4 py-3 space-y-1 shadow-2xl">
          <div className="pb-2.5 mb-2 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
            <span className="text-xs text-neutral-500 font-medium">Theme Mode</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-600" />}
              <span>{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
            </button>
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
