import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  Activity, 
  Volume2, 
  Lock, 
  ListFilter, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sliders, 
  RotateCcw, 
  ChevronDown, 
  ChevronRight,
  ShieldAlert,
  Terminal,
  FileText,
  Rotate3d
} from 'lucide-react';
import { MathFormula } from '../common/MathFormula';
import { ProctoringVisualizer3D } from '../3d/ProctoringVisualizer3D';

export const SimulatorsView: React.FC = () => {
  const [activeLab, setActiveLab] = useState<'decay' | 'whitelist' | 'voice' | 'priority-queue' | 'face-mesh-3d'>('decay');

  /* -------------------------------------------------------------
     LAB 1: DYNAMIC RISK EXPONENTIAL DECAY SIMULATOR
  ------------------------------------------------------------- */
  interface SimViolation {
    id: string;
    type: string;
    severity: 1 | 2 | 3 | 4 | 5;
    points: number;
    minute: number;
    dismissed: boolean;
  }

  const [simViolations, setSimViolations] = useState<SimViolation[]>([
    { id: 'v1', type: 'head_turn_away', severity: 2, points: 12, minute: 5, dismissed: false },
    { id: 'v2', type: 'second_voice_detected', severity: 3, points: 25, minute: 15, dismissed: false }
  ]);
  const [currentMinute, setCurrentMinute] = useState<number>(30);
  const lambda = 0.0231; // ~30 minute half-life

  // Calculate decayed score
  const calculateDecayScore = (minute: number, violations: SimViolation[]) => {
    const active = violations.filter(v => !v.dismissed && v.minute <= minute);
    let total = 0;
    let cumulative = 0;
    active.forEach(v => {
      const dt = minute - v.minute;
      total += v.points * Math.exp(-lambda * dt);
      cumulative += v.points * 0.15; // 15% cumulative floor
    });
    return Math.min(100, Math.round(total + cumulative));
  };

  const currentScore = calculateDecayScore(currentMinute, simViolations);

  const addSimViolation = (type: string, severity: 1 | 2 | 3 | 4 | 5, points: number) => {
    const newV: SimViolation = {
      id: 'v_' + Math.random().toString(36).substring(7),
      type,
      severity,
      points,
      minute: currentMinute,
      dismissed: false
    };
    setSimViolations(prev => [...prev, newV]);
  };

  const toggleDismiss = (id: string) => {
    setSimViolations(prev => prev.map(v => v.id === id ? { ...v, dismissed: !v.dismissed } : v));
  };

  const resetDecayLab = () => {
    setSimViolations([
      { id: 'v1', type: 'head_turn_away', severity: 2, points: 12, minute: 5, dismissed: false }
    ]);
    setCurrentMinute(10);
  };

  /* -------------------------------------------------------------
     LAB 2: PROCESS WHITELIST & FILE TIMESTAMP SCANNER
  ------------------------------------------------------------- */
  interface ProcessItem {
    pid: number;
    name: string;
    isAllowed: boolean;
    openFile?: { path: string; mtimeStr: string; mtimeBeforeExam: boolean };
    status: 'running' | 'terminated' | 'flagged';
  }

  const initialProcesses: ProcessItem[] = [
    { pid: 4820, name: 'winword.exe', isAllowed: true, openFile: { path: 'C:\\Users\\Student\\Docs\\Assignment.docx', mtimeStr: '09:41 AM (Pre-Exam)', mtimeBeforeExam: true }, status: 'running' },
    { pid: 7124, name: 'code.exe', isAllowed: true, openFile: { path: 'D:\\Projects\\exam_solution.py', mtimeStr: '10:14 AM (In-Exam)', mtimeBeforeExam: false }, status: 'running' },
    { pid: 3290, name: 'chrome.exe', isAllowed: false, status: 'running' },
    { pid: 8812, name: 'discord.exe', isAllowed: false, status: 'running' },
    { pid: 1044, name: 'notepad.exe', isAllowed: true, status: 'running' }
  ];

  const [processList, setProcessList] = useState<ProcessItem[]>(initialProcesses);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'completed'>('idle');
  const [whitelistLog, setWhitelistLog] = useState<string[]>([]);

  const runWhitelistScan = () => {
    setScanStatus('scanning');
    setWhitelistLog(['[0.0s] Initiating 2.5s process iteration loop via psutil...']);

    setTimeout(() => {
      setProcessList(prev => prev.map(p => {
        if (!p.isAllowed) return { ...p, status: 'terminated' };
        if (p.openFile && p.openFile.mtimeBeforeExam) return { ...p, status: 'flagged' };
        return p;
      }));

      setWhitelistLog([
        '[0.4s] Scanned 5 active processes under candidate session.',
        '[0.8s] Terminated unauthorized process: chrome.exe (PID 3290) via SIGTERM.',
        '[1.2s] Terminated unauthorized process: discord.exe (PID 8812) via SIGTERM.',
        '[1.8s] Inspected open file handles in winword.exe (PID 4820).',
        '[2.2s] FLAGGED: Assignment.docx modified at 09:41 AM (mtime < exam_start_time 10:00 AM).',
        '[2.5s] Scan complete. 2 processes killed, 1 pre-existing document violation queued.'
      ]);
      setScanStatus('completed');
    }, 1200);
  };

  const resetWhitelistLab = () => {
    setProcessList(initialProcesses);
    setScanStatus('idle');
    setWhitelistLog([]);
  };

  /* -------------------------------------------------------------
     LAB 3: TWO-STAGE ACOUSTIC VOICE PIPELINE
  ------------------------------------------------------------- */
  type VoiceScenario = 'student-reading' | 'second-speaker' | 'cough-noise';
  const [selectedScenario, setSelectedScenario] = useState<VoiceScenario>('student-reading');
  const [voiceRunning, setVoiceRunning] = useState<boolean>(false);
  const [vadSeconds, setVadSeconds] = useState<number>(0);
  const [cosineSimilarity, setCosineSimilarity] = useState<number>(0);
  const [voiceViolationFired, setVoiceViolationFired] = useState<boolean>(false);
  const [voiceStepLog, setVoiceStepLog] = useState<string[]>([]);

  const runVoiceSimulation = (scenario: VoiceScenario) => {
    setSelectedScenario(scenario);
    setVoiceRunning(true);
    setVadSeconds(0);
    setCosineSimilarity(0);
    setVoiceViolationFired(false);

    if (scenario === 'cough-noise') {
      setVoiceStepLog(['Sampling 16kHz PCM audio buffer...']);
      setTimeout(() => setVadSeconds(0.4), 400);
      setTimeout(() => {
        setVoiceStepLog([
          'Stage 1: WebRTC VAD detected audio activity for 0.4s.',
          'Transient noise fell below 2.0s sustained threshold.',
          'Stage 2: Resemblyzer speaker verification bypassed. Zero CPU spike (<0.5%).'
        ]);
        setVoiceRunning(false);
      }, 1000);
    } else if (scenario === 'student-reading') {
      setVoiceStepLog(['Sampling 16kHz audio buffer: candidate reading exam question aloud...']);
      setTimeout(() => setVadSeconds(2.3), 600);
      setTimeout(() => {
        setCosineSimilarity(0.89);
        setVoiceStepLog([
          'Stage 1: WebRTC VAD detected continuous speech for 2.3s (> 2.0s gate threshold).',
          'Stage 2: Resemblyzer extracted 256-d speaker embedding.',
          'Cosine Similarity vs 4s reference sample: 0.89 (Threshold >= 0.75).',
          'Candidate self-speech confirmed (True Negative). No violation fired.'
        ]);
        setVoiceRunning(false);
      }, 1400);
    } else if (scenario === 'second-speaker') {
      setVoiceStepLog(['Sampling 16kHz audio buffer: unauthorized second person speaking in room...']);
      setTimeout(() => setVadSeconds(2.6), 600);
      setTimeout(() => {
        setCosineSimilarity(0.44);
        setVoiceViolationFired(true);
        setVoiceStepLog([
          'Stage 1: WebRTC VAD detected continuous speech for 2.6s (> 2.0s gate threshold).',
          'Stage 2: Resemblyzer extracted 256-d speaker embedding.',
          'Cosine Similarity vs 4s reference sample: 0.44 (Below 0.75 threshold).',
          'Consecutive mismatch threshold reached: second_voice_detected (Severity 3) emitted!'
        ]);
        setVoiceRunning(false);
      }, 1500);
    }
  };

  /* -------------------------------------------------------------
     LAB 4: EXAMINER PRIORITY QUEUE & 2-MINUTE ALERT COLLAPSING
  ------------------------------------------------------------- */
  interface TriageAlert {
    id: string;
    sessionId: string;
    studentName: string;
    rollNumber: string;
    type: string;
    severity: 1 | 2 | 3 | 4 | 5;
    timestamp: string;
    decision: 'pending' | 'confirmed' | 'dismissed';
  }

  const initialAlerts: TriageAlert[] = [
    { id: 'a1', sessionId: 's1', studentName: 'Ali Raza', rollNumber: 'FA20-BCS-042', type: 'head_turn_away', severity: 2, timestamp: '10:14:05 AM', decision: 'pending' },
    { id: 'a2', sessionId: 's1', studentName: 'Ali Raza', rollNumber: 'FA20-BCS-042', type: 'head_turn_away', severity: 2, timestamp: '10:14:28 AM', decision: 'pending' },
    { id: 'a3', sessionId: 's1', studentName: 'Ali Raza', rollNumber: 'FA20-BCS-042', type: 'head_turn_away', severity: 2, timestamp: '10:14:52 AM', decision: 'pending' },
    { id: 'a4', sessionId: 's2', studentName: 'Zainab Bibi', rollNumber: 'FA20-BCS-088', type: 'unauthorized_object', severity: 4, timestamp: '10:15:10 AM', decision: 'pending' },
    { id: 'a5', sessionId: 's3', studentName: 'Hamza Khan', rollNumber: 'FA20-BCS-112', type: 'second_person_detected', severity: 4, timestamp: '10:15:30 AM', decision: 'pending' }
  ];

  const [triageAlerts, setTriageAlerts] = useState<TriageAlert[]>(initialAlerts);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Severity-first sort
  const sortedAlerts = [...triageAlerts].sort((a, b) => {
    if (b.severity !== a.severity) return b.severity - a.severity;
    return b.timestamp.localeCompare(a.timestamp);
  });

  // Client-side 2-minute grouping
  interface AlertGroup {
    key: string;
    type: string;
    severity: 1 | 2 | 3 | 4 | 5;
    studentName: string;
    rollNumber: string;
    items: TriageAlert[];
  }

  const groupedAlerts: AlertGroup[] = [];
  sortedAlerts.forEach(alert => {
    const existing = groupedAlerts.find(g => 
      g.studentName === alert.studentName && 
      g.type === alert.type && 
      g.severity === alert.severity
    );
    if (existing) {
      existing.items.push(alert);
    } else {
      groupedAlerts.push({
        key: `${alert.studentName}_${alert.type}_${alert.severity}`,
        type: alert.type,
        severity: alert.severity,
        studentName: alert.studentName,
        rollNumber: alert.rollNumber,
        items: [alert]
      });
    }
  });

  const handleTriageDecision = (id: string, decision: 'confirmed' | 'dismissed') => {
    setTriageAlerts(prev => prev.map(a => a.id === id ? { ...a, decision } : a));
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Interactive Engineering Simulators
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Test and visualize the real mathematical algorithms, process killers, acoustic pipelines, and triage engines.
          </p>
        </div>

        {/* Lab Switcher Segmented Control */}
        <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-x-auto">
          <button
            onClick={() => setActiveLab('decay')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              activeLab === 'decay'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            1. Risk Decay Engine
          </button>
          <button
            onClick={() => setActiveLab('whitelist')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              activeLab === 'whitelist'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            2. Process & File Guard
          </button>
          <button
            onClick={() => setActiveLab('voice')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              activeLab === 'voice'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            3. Two-Stage Voice Lab
          </button>
          <button
            onClick={() => setActiveLab('priority-queue')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              activeLab === 'priority-queue'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            4. Priority Queue & Grouping
          </button>
          <button
            onClick={() => setActiveLab('face-mesh-3d')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeLab === 'face-mesh-3d'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Rotate3d className="w-3.5 h-3.5 text-blue-500" />
            <span>5. 3D FaceMesh & Pose Lab</span>
          </button>
        </div>
      </div>

      {/* LAB 1: RISK DECAY ENGINE */}
      {activeLab === 'decay' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                  Module 06 · Dynamic Exponential Severity Decay
                </span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
                  Real-Time Mathematical Risk Progression
                </h3>
              </div>
              <button
                onClick={resetDecayLab}
                className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Simulation</span>
              </button>
            </div>

            {/* Current Risk Gauge & Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="p-6 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
                  Computed Risk Score
                </span>
                <div className={`text-5xl font-extrabold font-mono my-2 tabular-nums ${
                  currentScore > 60 ? 'text-red-500' : currentScore > 30 ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  {currentScore}
                  <span className="text-xl font-normal text-neutral-400">/100</span>
                </div>
                <div className="text-xs font-semibold">
                  {currentScore > 60 ? (
                    <span className="text-red-500">High Risk · Immediate Proctor Review</span>
                  ) : currentScore > 30 ? (
                    <span className="text-amber-500">Moderate Risk · Escalated Monitoring</span>
                  ) : (
                    <span className="text-emerald-500">Low Risk · Nominal Academic Integrity</span>
                  )}
                </div>
              </div>

              {/* Time Elapsed Slider */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Exam Timeline (Elapsed: {currentMinute} Minutes)
                  </div>
                  <span className="text-xs font-mono text-neutral-400">
                    Decay constant λ = 0.0231/min (~30m half-life)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={currentMinute}
                  onChange={(e) => setCurrentMinute(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                  <span>Minute 0 (Exam Start)</span>
                  <span>Minute 30 (1st Half-Life)</span>
                  <span>Minute 60 (2nd Half-Life)</span>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 overflow-x-auto">
                  <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Real-Time Exponential Risk Formula at Minute {currentMinute}:
                  </div>
                  <MathFormula 
                    formula={`S(${currentMinute}) = \\min\\left(100, \\; \\sum_{i=1}^{N} w(v_i) \\cdot e^{-0.0231 \\cdot (${currentMinute} - t_i)} + B_{\\text{cum}}\\right)`} 
                  />
                </div>
              </div>
            </div>

            {/* Violation Injection Controls */}
            <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Trigger Physical Violation Event at Minute {currentMinute}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => addSimViolation('head_turn_away', 2, 12)}
                  className="px-3 py-1.5 text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg transition-colors"
                >
                  + Head Turn Away (Sev 2, 12pts)
                </button>
                <button
                  onClick={() => addSimViolation('second_voice_detected', 3, 25)}
                  className="px-3 py-1.5 text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg transition-colors"
                >
                  + Second Voice Detected (Sev 3, 25pts)
                </button>
                <button
                  onClick={() => addSimViolation('unauthorized_object', 4, 45)}
                  className="px-3 py-1.5 text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg transition-colors"
                >
                  + Cell Phone / Book (Sev 4, 45pts)
                </button>
                <button
                  onClick={() => addSimViolation('second_person_detected', 4, 45)}
                  className="px-3 py-1.5 text-xs font-semibold bg-orange-50 dark:bg-orange-950/60 hover:bg-orange-100 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-lg transition-colors"
                >
                  + Second Person in Room (Sev 4, 45pts)
                </button>
                <button
                  onClick={() => addSimViolation('unauthorized_app', 5, 75)}
                  className="px-3 py-1.5 text-xs font-semibold bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg transition-colors"
                >
                  + Prohibited Executable (Sev 5, 75pts)
                </button>
              </div>
            </div>

            {/* Violation History Table with Dismiss Toggle */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Active Violation Roster & Examiner Dismissal Control
              </div>
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden text-xs">
                {simViolations.map((v) => {
                  const elapsed = Math.max(0, currentMinute - v.minute);
                  const decayedVal = Math.round(v.points * Math.exp(-lambda * elapsed));
                  return (
                    <div key={v.id} className={`p-3 flex items-center justify-between transition-colors ${
                      v.dismissed ? 'bg-neutral-50 dark:bg-neutral-950/40 opacity-50' : 'bg-white dark:bg-neutral-900'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-neutral-400">Minute {v.minute}</span>
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">{v.type}</span>
                        <span className="text-[11px] text-neutral-400">Severity {v.severity} ({v.points}pts initial)</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-neutral-700 dark:text-neutral-300">
                          {v.dismissed ? '0pts (Dismissed)' : `Decayed to: ${decayedVal}pts`}
                        </span>
                        <button
                          onClick={() => toggleDismiss(v.id)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors ${
                            v.dismissed
                              ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                              : 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900'
                          }`}
                        >
                          {v.dismissed ? 'Restore' : 'Dismiss (False Positive)'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LAB 2: PROCESS & FILE GUARD */}
      {activeLab === 'whitelist' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 uppercase">
                  Module 01 · Process Whitelist & Pre-Existing Notes Guard
                </span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
                  Process Iteration & Open File Modification Inspector
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={runWhitelistScan}
                  disabled={scanStatus === 'scanning'}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>{scanStatus === 'scanning' ? 'Scanning OS Processes...' : 'Run Whitelist Scan'}</span>
                </button>
                <button
                  onClick={resetWhitelistLab}
                  className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Process Table */}
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden text-xs">
              <div className="bg-neutral-50 dark:bg-neutral-950 px-4 py-2.5 font-semibold text-neutral-400 grid grid-cols-12 gap-2">
                <span className="col-span-2">PID</span>
                <span className="col-span-3">Process Name</span>
                <span className="col-span-4">Open File Handle & Modification Time</span>
                <span className="col-span-3 text-right">Enforcement Status</span>
              </div>
              {processList.map((proc) => (
                <div key={proc.pid} className="px-4 py-3 grid grid-cols-12 gap-2 items-center bg-white dark:bg-neutral-900">
                  <span className="col-span-2 font-mono text-neutral-500">{proc.pid}</span>
                  <div className="col-span-3 font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                    <span>{proc.name}</span>
                    <span className="text-[10px] text-neutral-400 font-normal">
                      ({proc.isAllowed ? 'Allowed' : 'Blocked'})
                    </span>
                  </div>
                  <div className="col-span-4 text-neutral-600 dark:text-neutral-400 truncate">
                    {proc.openFile ? (
                      <span className={proc.openFile.mtimeBeforeExam ? 'text-amber-600 dark:text-amber-400 font-semibold' : ''}>
                        {proc.openFile.path} · {proc.openFile.mtimeStr}
                      </span>
                    ) : (
                      <span className="text-neutral-400">None</span>
                    )}
                  </div>
                  <div className="col-span-3 text-right">
                    {proc.status === 'terminated' ? (
                      <span className="font-semibold text-red-500 inline-flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Terminated (SIGTERM)</span>
                      </span>
                    ) : proc.status === 'flagged' ? (
                      <span className="font-semibold text-amber-500 inline-flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Pre-Exam File Flagged</span>
                      </span>
                    ) : (
                      <span className="text-emerald-500 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Nominal Running</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Daemon Log Window */}
            {whitelistLog.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-500" />
                  <span>Python WhitelistEnforcer Console Output</span>
                </div>
                <div className="p-4 rounded-xl bg-neutral-950 font-mono text-xs text-neutral-300 space-y-1">
                  {whitelistLog.map((log, i) => (
                    <div key={i} className={log.includes('FLAGGED') ? 'text-amber-400' : log.includes('Terminated') ? 'text-red-400' : ''}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LAB 3: TWO-STAGE VOICE LAB */}
      {activeLab === 'voice' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <span className="text-xs font-mono font-semibold text-purple-600 dark:text-purple-400 uppercase">
                  Module 03 · Two-Stage Acoustic Voice Pipeline
                </span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
                  WebRTC VAD Gate & Resemblyzer Speaker Verification
                </h3>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                Candidate Reference Profile Calibrated
              </span>
            </div>

            {/* Scenario Selection Buttons */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Select Audio Input Scenario to Simulate:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => runVoiceSimulation('student-reading')}
                  disabled={voiceRunning}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedScenario === 'student-reading'
                      ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40 ring-1 ring-purple-500/20'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="text-xs font-bold text-purple-600 dark:text-purple-400">Scenario A</div>
                  <div className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">Student Murmuring Aloud</div>
                  <p className="text-xs text-neutral-500 mt-1">Candidate reading question text aloud alone (True Negative).</p>
                </button>

                <button
                  onClick={() => runVoiceSimulation('second-speaker')}
                  disabled={voiceRunning}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedScenario === 'second-speaker'
                      ? 'border-red-600 bg-red-50/50 dark:bg-red-950/40 ring-1 ring-red-500/20'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="text-xs font-bold text-red-600 dark:text-red-400">Scenario B</div>
                  <div className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">Third Party Speaking</div>
                  <p className="text-xs text-neutral-500 mt-1">Another person whispering or talking nearby (True Positive).</p>
                </button>

                <button
                  onClick={() => runVoiceSimulation('cough-noise')}
                  disabled={voiceRunning}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedScenario === 'cough-noise'
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500/20'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400">Scenario C</div>
                  <div className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">Cough & Keystroke Noise</div>
                  <p className="text-xs text-neutral-500 mt-1">Transient non-speech sound &lt;2.0s (Ambient Filter).</p>
                </button>
              </div>
            </div>

            {/* Gauges for Stage 1 and Stage 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Stage 1: WebRTC VAD Gate */}
              <div className="p-5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    Stage 1: WebRTC VAD Gate (&lt;1% CPU)
                  </span>
                  <span className="font-mono text-neutral-500">
                    Sustained: {vadSeconds.toFixed(1)}s / 2.0s
                  </span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      vadSeconds >= 2.0 ? 'bg-purple-600' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(100, (vadSeconds / 2.0) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-neutral-500">
                  {vadSeconds >= 2.0
                    ? '✓ Sustained speech threshold reached (>2.0s). Triggering Stage 2.'
                    : 'Gating in progress. Brief sounds <2.0s are discarded.'}
                </div>
              </div>

              {/* Stage 2: Resemblyzer Cosine Similarity */}
              <div className="p-5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    Stage 2: Speaker Verification (256-d)
                  </span>
                  <span className="font-mono text-neutral-500">
                    Similarity: {cosineSimilarity.toFixed(2)} (Min 0.75)
                  </span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      cosineSimilarity === 0
                        ? 'bg-neutral-400'
                        : cosineSimilarity >= 0.75
                        ? 'bg-emerald-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${cosineSimilarity * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs font-semibold">
                  {cosineSimilarity === 0 ? (
                    <span className="text-neutral-400">Stage 2 Asleep (Conserving CPU)</span>
                  ) : cosineSimilarity >= 0.75 ? (
                    <span className="text-emerald-500">Match Confirmed (≥ 0.75) · Student Self-Speech</span>
                  ) : (
                    <span className="text-red-500">Mismatch (&lt; 0.75) · Second Voice Detected!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Pipeline Step Log Output */}
            {voiceStepLog.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Acoustic Pipeline Step Execution
                </div>
                <div className="p-4 rounded-xl bg-neutral-950 font-mono text-xs text-neutral-300 space-y-1.5">
                  {voiceStepLog.map((log, i) => (
                    <div key={i} className={log.includes('emitted') ? 'text-red-400 font-bold' : log.includes('True Negative') ? 'text-emerald-400' : ''}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LAB 4: PRIORITY QUEUE & 2-MINUTE ALERT GROUPER */}
      {activeLab === 'priority-queue' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 uppercase">
                  Module 08 · Cross-Student Priority Queue & Client-Side Grouping
                </span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
                  Severity-First Sorting & 2-Minute Micro-Alert Collapsing
                </h3>
              </div>
              <span className="text-xs text-neutral-500">
                {triageAlerts.length} total events collapsed into {groupedAlerts.length} triage cards
              </span>
            </div>

            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              Notice how <strong className="text-neutral-900 dark:text-white">Severity 4</strong> alerts float directly to the top across all students, 
              and how Ali Raza's 3 consecutive head turns in 47 seconds collapse into a single summary card with discrete evidence snapshots upon expansion.
            </div>

            {/* Grouped Alert Cards List */}
            <div className="space-y-3">
              {groupedAlerts.map((group) => {
                const isExpanded = expandedGroup === group.key;
                return (
                  <div
                    key={group.key}
                    className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-950 shadow-sm"
                  >
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded ${
                          group.severity >= 4
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                        }`}>
                          Severity {group.severity}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                            <span>{group.items.length > 1 ? `${group.items.length}× ${group.type}` : group.type}</span>
                            {group.items.length > 1 && (
                              <span className="text-xs font-normal text-blue-600 dark:text-blue-400">
                                (Collapsed 2m Window)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-500">
                            Candidate: {group.studentName} ({group.rollNumber})
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {group.items.length > 1 && (
                          <button
                            onClick={() => setExpandedGroup(isExpanded ? null : group.key)}
                            className="px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 rounded flex items-center gap-1 transition-colors"
                          >
                            <span>{isExpanded ? 'Collapse' : 'Inspect Instances'}</span>
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded instances breakdown */}
                    {isExpanded && (
                      <div className="bg-neutral-50 dark:bg-neutral-900/60 p-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                          Discrete Microsecond Evidence Snapshots (Underlying DB Records Intact)
                        </div>
                        {group.items.map((item, idx) => (
                          <div key={item.id} className="p-2.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-neutral-500">Instance #{idx + 1}</span>
                              <span className="font-mono text-neutral-800 dark:text-neutral-200">{item.timestamp}</span>
                              <span className="text-neutral-400">Decision: {item.decision}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleTriageDecision(item.id, 'confirmed')}
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  item.decision === 'confirmed'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-red-50'
                                }`}
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleTriageDecision(item.id, 'dismissed')}
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  item.decision === 'dismissed'
                                    ? 'bg-neutral-600 text-white'
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                                }`}
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* LAB 5: 3D FACEMESH & HEAD POSE LAB */}
      {activeLab === 'face-mesh-3d' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 uppercase">
                  Module 02 · 3D Spatial Computer Vision & solvePnP Invariants
                </span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
                  MediaPipe 468-Point Mesh & Virtual Camera Frustum
                </h3>
              </div>
              <span className="text-xs text-neutral-500 font-mono">
                WebGL Point Cloud & Frustum Cone
              </span>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              This interactive Three.js laboratory simulates how the local Python daemon processes facial geometry. 
              The 3D point cloud represents the MediaPipe FaceMesh landmarks. The forward arrow represents the head pose gaze vector. 
              When candidate yaw exceeds ±28° or pitch tilts above 22°, the bounding frustum reacts with real-time visual alerts.
            </p>

            {/* Embedded 3D Component */}
            <ProctoringVisualizer3D />
          </div>
        </div>
      )}
    </div>
  );
};
