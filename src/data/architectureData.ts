export interface DataFlowStep {
  stepNumber: number;
  phase: string;
  source: string;
  destination: string;
  protocol: string;
  payload: string;
  description: string;
  securityControls: string[];
}

export const dataFlowSteps: DataFlowStep[] = [
  {
    stepNumber: 1,
    phase: 'Candidate Authentication & Consent',
    source: 'Candidate App (Electron Shell)',
    destination: 'Backend Server (Express / Node.js)',
    protocol: 'HTTPS POST /sessions',
    payload: '{ studentName, rollNumber, examId, consentGiven: true, startTime }',
    description: 'Candidate reviews Section 10.4 Data Ethics notice, checks mandatory consent, and enters institutional roll number. Electron creates a verified proctoring session in MongoDB.',
    securityControls: ['Roll number regex validation', 'Consent checkbox enforcement', 'Duplicate session rejection (409 Conflict)']
  },
  {
    stepNumber: 2,
    phase: 'Dual-Mode Self-Check & Calibration',
    source: 'Candidate Renderer (Webcam / Mic / OS)',
    destination: 'Local Python AI Daemon',
    protocol: 'Local HTTP POST /set-reference-voice (Port 8766)',
    payload: '{ audioWavBuffer, candidateSelfieBase64, examType }',
    description: 'In Remote Online mode, candidate records 4s reference voice sentence and snapshot. Daemon extracts 256-d reference voice embedding. In Physical Lab mode, camera and mic checks are automatically bypassed.',
    securityControls: ['In-memory frame processing', 'Isolated local IPC port 8766', 'Audio buffer normalization']
  },
  {
    stepNumber: 3,
    phase: 'Waiting Lobby & Paper Standby',
    source: 'Candidate App (examScreen.js)',
    destination: 'Backend Server',
    protocol: 'HTTPS GET /exam/:examId/paper',
    payload: 'Headers: Session-Token',
    description: 'Candidate desktop app queries question paper. Until examiner clicks "Release Paper", server returns HTTP 423 Locked with countdown timer. Paper is encrypted and hidden.',
    securityControls: ['HTTP 423 Locked protocol', 'Session state verification', 'Prevent paper scraping']
  },
  {
    stepNumber: 4,
    phase: 'Paper Release & Exam Activation',
    source: 'Examiner Dashboard',
    destination: 'All Active Candidate Apps',
    protocol: 'WebSocket Broadcast (event: "paperReleased")',
    payload: '{ examCode, paperUrl, activatedAt, durationMinutes }',
    description: 'Instructor releases question paper. Backend marks exam active, initializes shared exam clock, and streams paper payload. Candidates render paper inside in-app viewer with dynamic watermark.',
    securityControls: ['Anti-leak watermark overlay', 'Clipboard flush and shortcut lockdown', 'OS process whitelist switches to strict exam mode']
  },
  {
    stepNumber: 5,
    phase: 'Real-Time Violation Detection',
    source: 'Local Monitors (Vision, Whitelist, USB, Voice)',
    destination: 'Electron IPC Forwarder (violationForwarder.js)',
    protocol: 'Local IPC HTTP POST /violation',
    payload: '{ sessionId, type, severity: 1-5, timestamp: "YYYY-MM-DDTHH:MM:SS.ffffffZ", details }',
    description: 'AIMonitor, WhitelistEnforcer, USBMonitor, or VoiceMonitor detects an infraction. CaptureProvider creates lightweight <200KB evidence JPEG and dispatches JSON to Electron receiver.',
    securityControls: ['Dependency Inversion Principle (DIP)', 'Dynamic JPEG downsampling <200KB', 'Microsecond timestamp precision']
  },
  {
    stepNumber: 6,
    phase: 'Telemetry Ingestion & Offline Buffer',
    source: 'Electron IPC Forwarder',
    destination: 'Backend Server (POST /violation)',
    protocol: 'HTTPS POST /violation (with atomic JSON buffer fallback)',
    payload: '{ sessionId, type, severity, timestamp, details, screenshotPath }',
    description: 'Electron forwarder transmits event to central server. If network drops, event is queued to atomic JSON queue under userData. Original timestamp t_violation is preserved for exponential decay calculation.',
    securityControls: ['Atomic file write via temp file rename', 'Strict FIFO queue ordering', 'Exponential backoff replay loop']
  },
  {
    stepNumber: 7,
    phase: 'Risk Calculation & Live Triage Broadcast',
    source: 'Backend Server (Express / MongoDB)',
    destination: 'Examiner Dashboard (React)',
    protocol: 'WebSocket Event ("violation") & ("riskScoreUpdate")',
    payload: '{ violation, updatedRiskScore: 0-100, studentName, rollNumber }',
    description: 'Server persists violation into MongoDB, evaluates exponential decay formula S(t) = S0 * exp(-lambda*dt), and broadcasts alert to examiner Priority Queue.',
    securityControls: ['Indexed query plans (<2ms IXSCAN)', 'Examiner exam-scoping (createdBy isolation)', 'Cross-student severity sorting']
  },
  {
    stepNumber: 8,
    phase: 'Human-in-the-Loop Review Decision',
    source: 'Examiner Dashboard',
    destination: 'Backend Server',
    protocol: 'HTTPS PATCH /violations/:id/review',
    payload: 'Bearer JWT | { decision: "confirmed" | "dismissed", examinerNotes: "..." }',
    description: 'Examiner reviews screenshot evidence and confirms or dismisses the infraction. Dismissed violations are immediately excluded from candidate risk score calculation.',
    securityControls: ['JWT verification with in-memory tokens', 'Instant score recalculation', 'Multi-client WebSocket sync']
  }
];

export const solidArchitecturePrinciples = [
  {
    name: 'Dependency Inversion Principle (DIP)',
    domain: 'Evidence Capture & Storage',
    abstractInterface: 'CaptureProvider (ABC) / StorageProvider',
    concreteImplementations: ['MssCaptureProvider (Desktop <200KB)', 'WebcamCaptureProvider (Annotated)', 'LocalStorageProvider / CloudinaryProvider'],
    benefit: 'Violation detectors have zero dependency on concrete OS screenshot libraries; storage drivers can swap from local disk to AWS S3 in one line.'
  },
  {
    name: 'Strategy Pattern',
    domain: 'Dynamic Risk Scoring',
    abstractInterface: 'ScoringStrategy',
    concreteImplementations: ['DecayScoringStrategy (30-min half-life, lambda=0.0231)', 'LinearScoringStrategy (Mock/Dev)'],
    benefit: 'Enables rapid mathematical experimentation with different decay models or ML-based scoring without touching Express route handlers.'
  },
  {
    name: 'Separation of Concerns (SoC)',
    domain: 'Transport & Monitoring Decoupling',
    abstractInterface: 'Electron IPC Transport Boundary',
    concreteImplementations: ['violationBuffer.js (Atomic JSON queue under Electron userData)', 'violationForwarder.js (FIFO retry loop)'],
    benefit: 'Individual AI monitors (vision, voice, USB) need zero retry or offline network logic; transport reliability is centralized in the IPC bridge.'
  },
  {
    name: 'Dual-Token Security Split',
    domain: 'Authentication & Session Integrity',
    abstractInterface: 'AuthMiddleware / TokenManager',
    concreteImplementations: ['In-Memory Access Token (15-min JWT)', 'httpOnly Strict Refresh Cookie (14-day SHA-256 in DB)'],
    benefit: 'Immune to XSS token harvesting (tokens never touch localStorage) and immune to CSRF via strict SameSite cookies and Axios interceptor.'
  }
];
