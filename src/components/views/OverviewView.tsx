import React from 'react';
import { ActiveTab } from '../../types';
import { 
  ShieldCheck, 
  Cpu, 
  Layers, 
  ArrowRight, 
  Database, 
  Laptop, 
  Server, 
  Monitor, 
  CheckCircle2, 
  Lock, 
  Zap, 
  Volume2, 
  Eye, 
  FileText,
  Activity,
  Sparkles,
  Rotate3d
} from 'lucide-react';
import { benchmarkMetrics } from '../../data/databaseSchema';
import { ProctoringVisualizer3D } from '../3d/ProctoringVisualizer3D';

interface OverviewViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectModule: (moduleId: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigateTab, onSelectModule }) => {
  return (
    <div className="space-y-12 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-white/40 dark:border-white/10 bg-white/75 dark:bg-neutral-900/75 backdrop-blur-2xl p-8 sm:p-10 lg:p-12 shadow-xl transition-all duration-300">
        <div className="max-w-4xl space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
            <span>Final Year Project (FYP)</span>
            <span aria-hidden="true">·</span>
            <span>Computer Science & Software Engineering</span>
            <span aria-hidden="true">·</span>
            <span>Comprehensive Technical Defense</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
            IntegrityFlow: Autonomous Dual-Environment Exam Proctoring Architecture
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
            A production-grade, privacy-first academic examination and integrity platform. Combines an 
            <strong> Electron OS-locked desktop shell</strong> running an in-memory 
            <strong> Python AI monitoring suite</strong>, a high-concurrency 
            <strong> Node.js & PostgreSQL backend</strong>, and an intuitive 
            <strong> React examiner dashboard</strong> with real-time severity triage and dynamic exponential decay risk scoring.
          </p>

          {/* Quick CTA Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('simulators')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/25 transition-all"
            >
              <span>Launch Interactive Simulators</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateTab('architecture')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700"
            >
              <Cpu className="w-4 h-4 text-neutral-500" />
              <span>Explore 3-Tier System Map</span>
            </button>

            <button
              onClick={() => onNavigateTab('modules')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700"
            >
              <Layers className="w-4 h-4 text-neutral-500" />
              <span>Inspect All 12 Modules</span>
            </button>
          </div>
        </div>

        {/* Live System Invariant Metrics Grid */}
        <div className="mt-10 pt-8 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
              &lt; 35%
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Overall AI CPU Budget (Vision + Voice + Whitelist + USB)
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
              0.0231<span className="text-sm font-sans font-normal text-neutral-400">/min</span>
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Decay Engine λ (~30-Minute Half-Life)
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
              &lt; 200 KB
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Downsampled Evidence Screenshot Cap (Microsecond Timestamps)
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              -30.4%
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              P99 Write Latency Drop with PostgreSQL B-Tree Indexes
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Core Architectural Pillars */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            The Three-Tier System Topology
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Engineered with strict separation of concerns, defensive security boundaries, and modular dependency inversion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1: Candidate App */}
          <div className="rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl p-6 flex flex-col justify-between hover:border-blue-400/50 hover:shadow-xl transition-all duration-300 group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  1. Candidate Desktop Shell
                </h3>
                <div className="text-xs text-neutral-400 mt-0.5">
                  Electron Shell · Python 3.10 Daemon · Port 8766 IPC
                </div>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Runs on the candidate examination PC. Flushes OS clipboard, hooks keyboard shortcuts, scans processes every 2.5s, 
                inspects open file timestamps in permitted editors, performs in-memory webcam analysis, runs the two-stage acoustic voice pipeline, 
                and persists an atomic offline FIFO buffer.
              </p>
              <ul className="text-xs space-y-1.5 text-neutral-600 dark:text-neutral-300 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Dual-Mode Support: Remote Online vs Physical Lab</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Section 10.4 Data Ethics: Zero continuous video storage</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Crash-proof atomic JSON queue under Electron userData</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-xs">
              <span className="text-neutral-400">Tech: Python · Electron · C++</span>
              <button 
                onClick={() => onSelectModule('module-1-whitelist')}
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
              >
                <span>Inspect</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Tier 2: Backend Application Server */}
          <div className="rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl p-6 flex flex-col justify-between hover:border-emerald-400/50 hover:shadow-xl transition-all duration-300 group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  2. Central Backend & PostgreSQL
                </h3>
                <div className="text-xs text-neutral-400 mt-0.5">
                  Node.js · Express · PostgreSQL · Socket.io
                </div>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Asynchronously ingests telemetry streams from 40+ concurrent candidates. Enforces compound B-Tree indexes for sub-2ms query plans. 
                Computes dynamic risk scores via DecayScoringStrategy (30-min half-life), manages exam lifecycles with HTTP 423 paper waiting lobbies, 
                and securely handles dual-token in-memory JWT authentication.
              </p>
              <ul className="text-xs space-y-1.5 text-neutral-600 dark:text-neutral-300 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Dependency Inversion: Scoring, Storage, Mail strategies</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Compound B-Tree indexes: -30.4% P99 write latency</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Dual-token auth: 15m in-memory JWT + 14d httpOnly cookie</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-xs">
              <span className="text-neutral-400">Tech: Express · PostgreSQL · Socket.io</span>
              <button 
                onClick={() => onNavigateTab('database')}
                className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1"
              >
                <span>View Schema</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Tier 3: Examiner Command Center */}
          <div className="rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl p-6 flex flex-col justify-between hover:border-indigo-400/50 hover:shadow-xl transition-all duration-300 group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  3. Examiner Command Center
                </h3>
                <div className="text-xs text-neutral-400 mt-0.5">
                  React 19 · Vite · Tailwind · Material Design
                </div>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Empowers human proctors to monitor real-time examination sessions. Features the Cross-Student Priority Queue 
                (sorting severity-4 and 5 alerts to the top), 2-minute client-side alert collapsing to eliminate cognitive overload, 
                full candidate identity visibility (Student Name & Roll Number), and 3-way top-tabbed submission/evidence review.
              </p>
              <ul className="text-xs space-y-1.5 text-neutral-600 dark:text-neutral-300 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Cross-Student Severity-First Priority Queue</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>2-minute consecutive grouping (68% clutter reduction)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Multi-tenant examiner data isolation (createdBy scoping)</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-xs">
              <span className="text-neutral-400">Tech: React 19 · Vite · WebSockets</span>
              <button 
                onClick={() => onSelectModule('module-8-examiner-dashboard')}
                className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
              >
                <span>Inspect</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Spatial Computer Vision Landmark Visualizer (Three.js) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Rotate3d className="w-4 h-4" />
              <span>Interactive 3D Spatial Computer Vision</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
              Live MediaPipe 468-Point Mesh & 3D Pose Frustum
            </h2>
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            solvePnP Euler Angles · In-Memory Analysis Only
          </span>
        </div>

        <ProctoringVisualizer3D />
      </section>

      {/* Deep-Dive Architectural Highlights Grid */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Core Engineering Innovations & FYP Highlights
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Real solutions built to overcome the common pitfalls of academic cheating and proctoring software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Innovation 1: Whitelist & Pre-Existing Notes Guard */}
          <div className="rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl p-6 space-y-3 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Pre-Existing File Timestamp Guard
                </h4>
                <div className="text-xs text-neutral-400">Module 1 · ai-module/whitelist_enforcer.py</div>
              </div>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              When an exam allows software like Microsoft Word or VS Code, students frequently open pre-written solution files. 
              Our engine inspects open OS file handles: if <code className="font-mono text-amber-600 dark:text-amber-400">file.mtime &lt; exam_start_time</code>, 
              an unauthorized document violation is instantly triggered.
            </p>
            <div className="text-xs text-neutral-500 pt-2 flex items-center justify-between">
              <span>Solves pre-authored solution sharing</span>
              <button 
                onClick={() => onSelectModule('module-1-whitelist')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Learn mechanism →
              </button>
            </div>
          </div>

          {/* Innovation 2: Two-Stage Acoustic Pipeline */}
          <div className="rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl p-6 space-y-3 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Two-Stage Voice Verification Pipeline
                </h4>
                <div className="text-xs text-neutral-400">Module 3 · ai-module/voice_monitor.py</div>
              </div>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Lightweight WebRTC VAD (&lt;1% CPU) continuously gates ambient noise and coughs. Only sustained speech (&gt;2.0s) 
              triggers Resemblyzer neural speaker verification. Matches student self-speech against a 4s reference sample (similarity &ge; 0.75), 
              flagging violations ONLY when unauthorized third parties speak.
            </p>
            <div className="text-xs text-neutral-500 pt-2 flex items-center justify-between">
              <span>Zero false alarms from question murmuring</span>
              <button 
                onClick={() => onSelectModule('module-3-voice')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Learn mechanism →
              </button>
            </div>
          </div>

          {/* Innovation 3: Dynamic Exponential Severity Decay */}
          <div className="rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl p-6 space-y-3 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Exponential Severity Decay Engine
                </h4>
                <div className="text-xs text-neutral-400">Module 6 · server/src/services/scoring/</div>
              </div>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Calculates real-time risk scores using <code className="font-mono text-emerald-600 dark:text-emerald-400">S(t) = S0 · e^(-0.0231·Δt)</code>. 
              Single transient glances decay smoothly with a ~30-minute half-life, while repeated infractions sustain cumulative risk, 
              preventing honest candidates from accumulating permanent penalties.
            </p>
            <div className="text-xs text-neutral-500 pt-2 flex items-center justify-between">
              <span>Fair mathematical risk progression</span>
              <button 
                onClick={() => onSelectModule('module-6-decay-engine')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Interactive lab →
              </button>
            </div>
          </div>

          {/* Innovation 4: Disk-Backed Offline Violation Buffer */}
          <div className="rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl p-6 space-y-3 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Atomic FIFO Offline Replay Buffer
                </h4>
                <div className="text-xs text-neutral-400">Module 9 · candidate-app/electron/ipc/</div>
              </div>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Campus Wi-Fi outages never drop violation evidence. The Electron IPC layer buffers failed payloads atomically to disk 
              and replays them in FIFO sequence once reconnected. Preserves the authentic microsecond detection timestamp so exponential 
              decay reflects genuine chronological progression.
            </p>
            <div className="text-xs text-neutral-500 pt-2 flex items-center justify-between">
              <span>Zero evidence loss during network drops</span>
              <button 
                onClick={() => onSelectModule('module-9-offline-buffer')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Learn mechanism →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Evaluation & Viva Quick Navigation Bar */}
      <section className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-sm font-bold text-neutral-900 dark:text-white">
            Preparing for Project Defense / Viva Voce Examination?
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Review the 10 most critical architectural trade-offs, security justifications, and load testing benchmarks.
          </p>
        </div>
        <button
          onClick={() => onNavigateTab('viva-defense')}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm whitespace-nowrap transition-colors"
        >
          <span>Open Viva Defense Guide</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
