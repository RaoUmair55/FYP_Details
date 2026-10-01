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
  FileCode,
  Layers
} from 'lucide-react';

export const DatabaseErdView: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<string>('violations');
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'erd' | 'indexes' | 'benchmarks'>('erd');

  const copyDdl = () => {
    const ddl = `// ==============================================================================
// MongoDB Mongoose Models for IntegrityFlow Production Architecture
// ==============================================================================
const mongoose = require('mongoose');

${databaseTables.map(table => `// ------------------------------------------------------------------------------
// Collection: ${table.name} (${table.description})
// ------------------------------------------------------------------------------
const ${table.name.charAt(0).toUpperCase() + table.name.slice(1)}Schema = new mongoose.Schema({
${table.columns.map(c => `  ${c.name}: { 
    type: ${c.type === 'ObjectId' ? 'mongoose.Schema.Types.ObjectId' : c.type === 'Array of Objects' ? '[Object]' : c.type === 'Object (Subdocument)' || c.type === 'Object (Mixed)' ? 'Object' : c.type}, 
    ${c.constraints.toLowerCase().includes('required') ? 'required: true, ' : ''}${c.constraints.toLowerCase().includes('unique') ? 'unique: true, ' : ''}/* ${c.description} */
  }`).join(',\n')}
}, { timestamps: true });

// Compound and Single-Field Indexes
${table.indexes.map(idx => `${table.name.charAt(0).toUpperCase() + table.name.slice(1)}Schema.index({ ${idx.fields} }); // ${idx.purpose}`).join('\n')}

const ${table.name.charAt(0).toUpperCase() + table.name.slice(1)} = mongoose.model('${table.name.charAt(0).toUpperCase() + table.name.slice(1)}', ${table.name.charAt(0).toUpperCase() + table.name.slice(1)}Schema);
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
            MongoDB Schema Architecture & Performance Benchmarks
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Mongoose ODM document models, compound B-Tree indexes, and high-concurrency 40-candidate load test results.
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
            Collection Schemas
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

      {/* TAB 1: ERD & COLLECTION EXPLORER */}
      {activeTab === 'erd' && (
        <div className="space-y-6">
          {/* Collection Selector Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2">
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
                    {tbl.columns.length} fields · {tbl.indexes.length} idx
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Collection Inspection Panel */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-500" />
                  <span className="font-mono text-base font-bold text-neutral-900 dark:text-white">
                    db.collection("{activeTableData.name}")
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
                <span>{copiedSql ? 'Copied Mongoose Schemas!' : 'Copy Mongoose Schemas'}</span>
              </button>
            </div>

            {/* Document Fields Table */}
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-x-auto text-xs">
              <div className="min-w-[640px] divide-y divide-neutral-100 dark:divide-neutral-800">
                <div className="bg-neutral-50 dark:bg-neutral-950 px-4 py-2.5 font-semibold text-neutral-400 grid grid-cols-12 gap-2">
                  <span className="col-span-3">Field Name</span>
                  <span className="col-span-2">BSON / Mongoose Type</span>
                  <span className="col-span-4">Schema Constraints & Defaults</span>
                  <span className="col-span-3">Description</span>
                </div>
                {activeTableData.columns.map((col, idx) => (
                  <div key={idx} className="px-4 py-3 grid grid-cols-12 gap-2 items-center bg-white dark:bg-neutral-900 font-mono text-[11px]">
                    <span className="col-span-3 font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                      {col.name === '_id' && <Key className="w-3 h-3 text-amber-500 shrink-0" />}
                      <span>{col.name}</span>
                    </span>
                    <span className="col-span-2 text-emerald-600 dark:text-emerald-400 font-semibold">{col.type}</span>
                    <span className="col-span-4 text-neutral-500 dark:text-neutral-400 truncate">{col.constraints}</span>
                    <span className="col-span-3 font-sans text-neutral-600 dark:text-neutral-400 truncate">{col.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Collection Indexes */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                MongoDB Indexes Applied to {activeTableData.name}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeTableData.indexes.map((idx, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1 text-xs">
                    <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {idx.name}
                    </div>
                    <div className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                      {`{ ${idx.fields} }`} · {idx.type}
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
            telemetry writes flood the <code className="font-mono">violations</code> collection. When proctors query the Priority Queue or inspect an individual student timeline, 
            a naive query performs a Full Collection Scan (<code className="font-mono">COLLSCAN</code>). Targeted compound indexes convert these lookups into instant Index Scans (<code className="font-mono">IXSCAN</code>), 
            ensuring sub-2ms query times even under burst traffic.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
              <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                1. Timeline Compound Index
              </div>
              <div className="font-mono text-xs text-neutral-900 dark:text-white p-2.5 rounded bg-neutral-100 dark:bg-neutral-950">
                sessionId_1_timestamp_-1<br />
                {`{ sessionId: 1, timestamp: -1 }`}
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Optimizes candidate evidence timeline queries. MongoDB traverses directly to the session's leaf nodes in reverse chronological order with zero memory sorting.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
              <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                2. Live Triage Index
              </div>
              <div className="font-mono text-xs text-neutral-900 dark:text-white p-2.5 rounded bg-neutral-100 dark:bg-neutral-950">
                reviewed_1<br />
                {`{ reviewed: 1 }`}
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Indexes unreviewed violations across all active candidates for instantaneous Priority Queue polling and real-time dashboard notification updates.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
              <div className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                3. Active Roster Index
              </div>
              <div className="font-mono text-xs text-neutral-900 dark:text-white p-2.5 rounded bg-neutral-100 dark:bg-neutral-950">
                examId_1_status_1<br />
                {`{ examId: 1, status: 1 }`}
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Accelerates active candidate card rendering and prevents duplicate concurrent exam logins for the same candidate roll number.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BENCHMARKS */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1">
              <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Simulated Candidates</div>
              <div className="text-3xl font-bold text-neutral-900 dark:text-white">{benchmarkMetrics.candidatesTested} Students</div>
              <div className="text-xs text-emerald-500 font-medium">100% Success Rate (Zero Failures)</div>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1">
              <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Throughput Gain</div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{benchmarkMetrics.afterOptimization.throughputGain}</div>
              <div className="text-xs text-neutral-500">6.23 Req/Sec sustained throughput</div>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1">
              <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">P99 Write Latency Delta</div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{benchmarkMetrics.afterOptimization.writes.p99Delta}</div>
              <div className="text-xs text-neutral-500">Dropped from 771ms to 536ms</div>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1">
              <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Peak Read Latency Delta</div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{benchmarkMetrics.afterOptimization.reads.maxPeakDelta}</div>
              <div className="text-xs text-neutral-500">Peak dropped from 1230ms to 310ms</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
