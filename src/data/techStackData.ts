export interface TechStackCategory {
  layer: string;
  name: string;
  role: string;
  keyPackages: { name: string; version: string; purpose: string }[];
  whyChosen: string[];
  dataFlowMechanisms: string[];
  concurrencyAndEfficiency: string[];
}

export const techStackData: TechStackCategory[] = [
  {
    layer: 'Frontend & Examiner Dashboard',
    name: 'React 19 + Vite + Tailwind CSS',
    role: 'Real-time proctoring command center, candidate gallery, and human-in-the-loop triage interface',
    keyPackages: [
      { name: 'react / react-dom', version: '^19.0.0', purpose: 'Concurrent rendering and component architecture' },
      { name: 'vite', version: '^8.0.0', purpose: 'Sub-second HMR and optimized bundler' },
      { name: 'socket.io-client', version: '^4.8.0', purpose: 'Persistent WebSocket connection for live telemetry' },
      { name: 'lucide-react', version: '^0.546.0', purpose: 'Consistent accessible UI icons' },
      { name: 'axios', version: '^1.7.0', purpose: 'HTTP client with automatic 401 retry interceptor' }
    ],
    whyChosen: [
      'Declarative state updates: seamlessly updates active student rosters and severity-ranked Priority Queue without layout re-renders',
      'In-memory token security: keeps short-lived JWT access tokens strictly in JavaScript memory closure, completely eliminating XSS token theft',
      'Virtual DOM efficiency: handles hundreds of live violation broadcasts per minute while maintaining 60fps responsiveness',
      'Tailwind CSS v4: zero-runtime CSS footprint with customized dark/light mode palette'
    ],
    dataFlowMechanisms: [
      'Priority Queue: receives real-time "violation" Socket.io events and dynamically re-sorts array by severity: -1, timestamp: -1',
      'Client-Side 2-Minute Grouping: consecutive infractions within 120s collapse into expandable cards (e.g. "3× Head Turned Away")',
      'Silent Refresh: interceptor catches HTTP 401, invokes POST /auth/refresh with httpOnly cookie, and retries failed request seamlessly'
    ],
    concurrencyAndEfficiency: [
      'Lightweight component trees prevent memory leaks during long 3-hour exam sessions',
      'Debounced search and filter inputs prevent unnecessary re-computations over large candidate sets'
    ]
  },
  {
    layer: 'Backend Application Server',
    name: 'Node.js + Express + Socket.io',
    role: 'Central coordination server, REST API, WebSocket pub/sub engine, and dynamic risk scoring orchestrator',
    keyPackages: [
      { name: 'express', version: '^4.21.2', purpose: 'Fast, unopinionated REST API framework' },
      { name: 'socket.io', version: '^4.8.0', purpose: 'Bi-directional event engine with room-based multi-tenancy' },
      { name: 'bcrypt', version: '^5.1.1', purpose: 'Salted password hashing with 12 rounds' },
      { name: 'helmet', version: '^8.0.0', purpose: 'HTTP security headers defense' },
      { name: 'express-rate-limit', version: '^7.5.0', purpose: 'Brute-force protection on auth endpoints' },
      { name: 'cookie-parser', version: '^1.4.7', purpose: 'Secure httpOnly cookie management' }
    ],
    whyChosen: [
      'Asynchronous Event-Driven I/O: Node.js non-blocking libuv event loop is purpose-built for high-concurrency telemetry streaming from dozens of students',
      'Unified TypeScript/JavaScript ecosystem across candidate Electron shell, server API, and examiner dashboard',
      'Express middleware pipeline: clean separation of rate-limiting, authentication verification (requireAuth), examiner ownership scoping, and error handling',
      'Socket.io Rooms: provides strict isolation (`exam_${examId}` and `session_${sessionId}`) preventing cross-exam chat or alert leaks'
    ],
    dataFlowMechanisms: [
      'Candidate Ingestion: Open machine-to-machine POST /violation and POST /sessions endpoints allow Electron clients to stream data without instructor login barrier',
      'Examiner Protection: requireAuth middleware checks Bearer JWT and queries MongoDB Teacher record',
      'Scoring Strategy Delegation: SeverityEngine delegates to DecayScoringStrategy (lambda=0.0231/min) to calculate real-time score [0-100]'
    ],
    concurrencyAndEfficiency: [
      'Handles 40+ concurrent candidate streams with sub-250ms average write latency',
      'Background Lifecycle Reaper checks exam expiry every 30s with zero impact on request threads'
    ]
  },
  {
    layer: 'Database & Persistent Storage',
    name: 'MongoDB NoSQL Database + Mongoose ODM',
    role: 'High-throughput document persistence for exams, sessions, violations, submissions, messages, and audit trails',
    keyPackages: [
      { name: 'mongoose', version: '^8.9.0', purpose: 'Object Document Mapper (ODM) providing schema validation and hooks' },
      { name: 'mongodb', version: '^6.12.0', purpose: 'Core native MongoDB connection driver with connection pooling' },
      { name: 'cloudinary', version: '^2.5.1', purpose: 'Cloud asset storage CDN for screenshots, verification selfies, and audio evidence' }
    ],
    whyChosen: [
      'Document Model: naturally models deeply-nested violation telemetry (details, confidence, euler angles, audio similarity) as native BSON documents',
      'High-Concurrency Telemetry Writes: handles burst write traffic from 40+ concurrent candidates with sub-25ms document insertion latency',
      'Compound B-Tree Indexes: optimizes high-frequency multi-student sorting queries ({ sessionId: 1, timestamp: -1 }, { reviewed: 1 }) down to <2ms execution time',
      'Mongoose Schema Validation: enforces strict field typing, enum constraints, pre-save hooks, and population references across collections'
    ],
    dataFlowMechanisms: [
      'sessionId_1_timestamp_-1 on (sessionId, timestamp DESC) for sub-millisecond candidate timeline reconstruction',
      'reviewed_1 on (reviewed) for instant cross-student Priority Queue triage queries',
      'examId_1_status_1 on (examId, status) for live examiner active roster lookups',
      'Audit Trail: records all authentication attempts and exam lifecycle actions in auditlogs collection'
    ],
    concurrencyAndEfficiency: [
      'Connection pooling (max 25 connections) prevents DB socket starvation during sudden violation bursts',
      '30.4% reduction in P99 write latency (771ms -> 536ms) and 74.8% reduction in peak read latency (1230ms -> 310ms) verified via load tests'
    ]
  },
  {
    layer: 'Candidate AI Daemon & Shell',
    name: 'Electron Shell + Python 3.10 AI Daemon',
    role: 'Secure desktop wrapper, OS clipboard/screen lockdown, and high-performance local AI inference engine',
    keyPackages: [
      { name: 'electron', version: '^34.0.0', purpose: 'Native desktop container with screen & clipboard hooks' },
      { name: 'mediapipe', version: '^0.10.0', purpose: '3D facial landmark mesh extraction' },
      { name: 'resemblyzer', version: '^0.1.4', purpose: 'Deep voice encoder extracting 256-d speaker embeddings' },
      { name: 'webrtcvad-wheels', version: '^2.0.10', purpose: 'Lightweight C-optimized voice activity detection (<1% CPU)' },
      { name: 'psutil', version: '^6.1.0', purpose: 'OS process enumeration and open file handle inspection' },
      { name: 'mss', version: '^9.0.0', purpose: 'Ultra-fast multi-monitor desktop screenshot grabber' }
    ],
    whyChosen: [
      'Native OS Access: Electron provides native hooks to flush clipboard, intercept Alt+Tab/shortcuts, and monitor secondary displays',
      'Heavy AI Isolated to Python: Keeps heavy neural computation out of Node.js event loop, preventing UI freezes',
      'In-Memory Privacy: Live webcam video is analyzed strictly in RAM and never written to disk or transmitted continuously to servers',
      'Offline Buffer: Atomic JSON queue guarantees zero loss of violation evidence during campus Wi-Fi outages'
    ],
    dataFlowMechanisms: [
      'Local Receiver: Electron starts Express server on port 8766; Python daemon posts local violation JSONs',
      'Forwarder: Electron forwards violation payload to central server; queues to disk on failure',
      'Self-Check Handshake: Electron passes examType to Python, selectively bypassing camera/mic checks for Physical Lab exams'
    ],
    concurrencyAndEfficiency: [
      'Two-Stage Voice: WebRTC VAD gates Resemblyzer inference, keeping voice CPU usage under 1%',
      'Vision Throttling: ONNX Runtime clamped to 2 threads, sampled every 3rd frame, keeping total AI CPU usage under 35%'
    ]
  }
];
