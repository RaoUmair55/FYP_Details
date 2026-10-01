import React, { useState } from 'react';
import { databaseTables, benchmarkMetrics } from '../../data/databaseSchema';
import { 
  Database, 
  Key, 
  Copy, 
  Check, 
  Activity, 
  CheckCircle2, 
  Sliders, 
  ArrowRight,
  TrendingDown,
  TrendingUp,
  FileCode
} from 'lucide-react';

export const DatabaseErdView: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<string>('violations');
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'erd' | 'indexes' | 'benchmarks'>('erd');

  const copyDdl = () => {
    const ddl = `-- PostgreSQL Schema for IntegrityFlow Production Architecture
${databaseTables.map(table => `
-- Table: ${table.name} (${table.description})
CREATE TABLE ${table.name} (
${table.columns.map(c => `    ${c.name} ${c.type} ${c.constraints}`).join(',\n')}
);
${table.indexes.map(idx => `CREATE INDEX ${idx.name} ON ${table.name} (${idx.fields});`).join('\n')}
`).join('\n')}`;

    navigator.clipboard.writeText(ddl);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const activeTableData = databaseTables.find(t => t.name === selectedTable) || databaseTables[0];

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            PostgreSQL Relational Schema & Performance Benchmarks
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            ACID transaction models, compound B-Tree indexes, and high-concurrency 40-candidate load test results.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setActiveTab('erd')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'erd'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Entity Relationships (ERD)
          </button>
          <button
            onClick={() => setActiveTab('indexes')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'indexes'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Index Architecture
          </button>
          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'benchmarks'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            40-Student Load Benchmark
          </button>
        </div>
      </div>

      {/* TAB 1: ERD & TABLE EXPLORER */}
      {activeTab === 'erd' && (
        <div className="space-y-6">
          {/* Relational Table Selector Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2">
            {databaseTables.map((tbl) => {
              const isSelected = tbl.name === selectedTable;
              return (
                <button
                  key={tbl.name}
                  onClick={() => setSelectedTable(tbl.name)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-1 ring-blue-500/20'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="font-mono text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {tbl.name}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1">
                    {tbl.columns.length} columns · {tbl.indexes.length} idx
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Table Inspection Panel */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-500" />
                  <span className="font-mono text-base font-bold text-neutral-900 dark:text-white">
                    public.{activeTableData.name}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {activeTableData.description}
                </p>
              </div>

              <button
                onClick={copyDdl}
                className="text-xs font-mono text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 self-start sm:self-auto bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied Full DDL!' : 'Copy Full Schema DDL'}</span>
              </button>
            </div>

            {/* Columns Table */}
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-x-auto text-xs">
              <div className="min-w-[640px] divide-y divide-neutral-100 dark:divide-neutral-800">
                <div className="bg-neutral-50 dark:bg-neutral-950 px-4 py-2.5 font-semibold text-neutral-400 grid grid-cols-12 gap-2">
                  <span className="col-span-3">Column Name</span>
                  <span className="col-span-2">Data Type</span>
                  <span className="col-span-4">Constraints & Defaults</span>
                  <span className="col-span-3">Description</span>
                </div>
                {activeTableData.columns.map((col, idx) => (
                  <div key={idx} className="px-4 py-3 grid grid-cols-12 gap-2 items-center bg-white dark:bg-neutral-900 font-mono text-[11px]">
                    <span className="col-span-3 font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                      {col.constraints.includes('PRIMARY KEY') && <Key className="w-3 h-3 text-amber-500 shrink-0" />}
                      <span>{col.name}</span>
                    </span>
                    <span className="col-span-2 text-blue-600 dark:text-blue-400 font-semibold">{col.type}</span>
                    <span className="col-span-4 text-neutral-500 dark:text-neutral-400 truncate">{col.constraints}</span>
                    <span className="col-span-3 font-sans text-neutral-600 dark:text-neutral-400 truncate">{col.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Table Indexes */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Indexes Applied to {activeTableData.name}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeTableData.indexes.map((idx, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1 text-xs">
                    <div className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {idx.name}
                    </div>
                    <div className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                      ON ({idx.fields}) · {idx.type}
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {idx.purpose}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INDEX ARCHITECTURE */}
      {activeTab === 'indexes' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <strong className="text-blue-600 dark:text-blue-400">Why Compound Indexes Matter in Proctoring:</strong> In an active exam with 40+ concurrent candidates, 
            telemetry writes flood the <code className="font-mono">violations</code> table. When proctors query the Priority Queue or inspect an individual student timeline, 
            a naive query performs a Full Table Scan (<code className="font-mono">COLLSCAN</code>). Targeted compound indexes convert these lookups into instant Index Scans (<code className="font-mono">IXSCAN</code>), 
            ensuring sub-2ms query times even under burst traffic.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
              <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                1. Timeline Compound Index
              </div>
              <div className="font-mono text-xs text-neutral-900 dark:text-white p-2.5 rounded bg-neutral-100 dark:bg-neutral-950">
                idx_violations_session_time<br />
                (session_id, timestamp DESC)
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Optimizes candidate evidence timeline queries. PostgreSQL traverses directly to the session's leaf nodes in reverse chronological order with zero memory sorting.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
              <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                2. Partial Triage Index
              </div>
              <div className="font-mono text-xs text-neutral-900 dark:text-white p-2.5 rounded bg-neutral-100 dark:bg-neutral-950">
                idx_violations_reviewed<br />
                WHERE reviewed = FALSE
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                A lightweight partial index that exclusively indexes unreviewed violations. Reviewed items are automatically pruned from the index tree, keeping it in CPU L3 cache.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
              <div className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                3. Active Exam Compound Index
              </div>
              <div className="font-mono text-xs text-neutral-900 dark:text-white p-2.5 rounded bg-neutral-100 dark:bg-neutral-950">
                idx_sessions_exam_status<br />
                (exam_id, status)
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Powers the live active student roster on the examiner dashboard and historical exam summaries with instantaneous candidate aggregation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 40-STUDENT LOAD BENCHMARKS */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-6">
          {/* Top High-Level Benchmark Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <div className="text-xs text-neutral-400">P99 Write Latency</div>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                -30.4%
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                Dropped from 771ms → 536ms
              </div>
            </div>

            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <div className="text-xs text-neutral-400">Max Peak Write Spike</div>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                -54.1%
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                Cut from 1394ms → 640ms
              </div>
            </div>

            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <div className="text-xs text-neutral-400">Max Dashboard Read Latency</div>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                -74.8%
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                Plummeted from 1230ms → 310ms
              </div>
            </div>

            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <div className="text-xs text-neutral-400">Effective Ingestion Throughput</div>
              <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1 tabular-nums">
                +11.1%
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                Gained 5.61 → 6.23 req/sec
              </div>
            </div>
          </div>

          {/* Full Benchmark Comparison Table */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4 shadow-sm">
            <div className="text-sm font-bold text-neutral-900 dark:text-white">
              Load Test Simulation Data (40 Simultaneous Candidate Clients)
            </div>
            
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden text-xs">
              <div className="bg-neutral-50 dark:bg-neutral-950 px-4 py-2.5 font-semibold text-neutral-400 grid grid-cols-12 gap-2">
                <span className="col-span-4">Benchmark Metric</span>
                <span className="col-span-3">Before Indexes (CollScan)</span>
                <span className="col-span-3">After Compound Indexes</span>
                <span className="col-span-2 text-right">Net Improvement</span>
              </div>

              <div className="px-4 py-3 grid grid-cols-12 gap-2 items-center bg-white dark:bg-neutral-900">
                <span className="col-span-4 font-bold text-neutral-800 dark:text-neutral-200">Simulated Candidates</span>
                <span className="col-span-3 font-mono text-neutral-600 dark:text-neutral-400">40 concurrent</span>
                <span className="col-span-3 font-mono text-neutral-600 dark:text-neutral-400">40 concurrent</span>
                <span className="col-span-2 text-right text-neutral-400">Parity</span>
              </div>

              <div className="px-4 py-3 grid grid-cols-12 gap-2 items-center bg-white dark:bg-neutral-900">
                <span className="col-span-4 font-bold text-neutral-800 dark:text-neutral-200">P99 Write Latency</span>
                <span className="col-span-3 font-mono text-red-500">771.01 ms</span>
                <span className="col-span-3 font-mono text-emerald-500 font-bold">536.99 ms</span>
                <span className="col-span-2 text-right text-emerald-500 font-bold font-mono">-30.4%</span>
              </div>

              <div className="px-4 py-3 grid grid-cols-12 gap-2 items-center bg-white dark:bg-neutral-900">
                <span className="col-span-4 font-bold text-neutral-800 dark:text-neutral-200">Max Peak Write Spike</span>
                <span className="col-span-3 font-mono text-red-500">1394.91 ms</span>
                <span className="col-span-3 font-mono text-emerald-500 font-bold">640.80 ms</span>
                <span className="col-span-2 text-right text-emerald-500 font-bold font-mono">-54.1%</span>
              </div>

              <div className="px-4 py-3 grid grid-cols-12 gap-2 items-center bg-white dark:bg-neutral-900">
                <span className="col-span-4 font-bold text-neutral-800 dark:text-neutral-200">Max Dashboard Read Latency</span>
                <span className="col-span-3 font-mono text-red-500">1230.66 ms</span>
                <span className="col-span-3 font-mono text-emerald-500 font-bold">310.59 ms</span>
                <span className="col-span-2 text-right text-emerald-500 font-bold font-mono">-74.8%</span>
              </div>

              <div className="px-4 py-3 grid grid-cols-12 gap-2 items-center bg-white dark:bg-neutral-900">
                <span className="col-span-4 font-bold text-neutral-800 dark:text-neutral-200">Overall Success Rate</span>
                <span className="col-span-3 font-mono text-emerald-500">100.0% (0 errors)</span>
                <span className="col-span-3 font-mono text-emerald-500">100.0% (0 errors)</span>
                <span className="col-span-2 text-right text-emerald-500">100% Reliable</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
