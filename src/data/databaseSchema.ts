import { DatabaseTable } from '../types';

export const databaseTables: DatabaseTable[] = [
  {
    name: 'teachers',
    description: 'Instructor and administrator accounts with salted bcrypt password hashes and lockout defense.',
    columns: [
      { name: '_id', type: 'ObjectId', constraints: 'PRIMARY KEY (Default ObjectId)', description: 'Unique teacher identifier' },
      { name: 'name', type: 'String', constraints: 'Required, Trimmed', description: 'Instructor full name' },
      { name: 'email', type: 'String', constraints: 'Required, Unique, Lowercase, Trimmed', description: 'Institutional email address' },
      { name: 'passwordHash', type: 'String', constraints: 'Required', description: 'Bcrypt hashed password (cost factor 10-12)' },
      { name: 'role', type: 'String', constraints: "Enum: ['teacher', 'admin'], default: 'teacher'", description: 'Role-based access tier' },
      { name: 'emailVerified', type: 'Boolean', constraints: 'default: false', description: 'Email verification status flag' },
      { name: 'failedLoginAttempts', type: 'Number', constraints: 'default: 0', description: 'Counter for brute-force lockout (triggers lock at 5)' },
      { name: 'lockedUntil', type: 'Date', constraints: 'default: null', description: '15-minute lockout expiration timestamp' },
      { name: 'createdAt', type: 'Date', constraints: 'default: Date.now', description: 'Account creation time' }
    ],
    indexes: [
      { name: 'email_1', fields: 'email: 1', type: 'Unique B-Tree', purpose: 'Instant O(log N) lookup during instructor login' }
    ]
  },
  {
    name: 'refreshtokens',
    description: 'Cryptographically secure hashed refresh tokens (14-day lifespan) enabling silent rotation.',
    columns: [
      { name: '_id', type: 'ObjectId', constraints: 'PRIMARY KEY (Default ObjectId)', description: 'Token record ID' },
      { name: 'teacherId', type: 'ObjectId', constraints: 'Required, Ref: Teacher', description: 'Associated instructor' },
      { name: 'tokenHash', type: 'String', constraints: 'Required', description: 'SHA-256 hash of 40-byte random hex string' },
      { name: 'revoked', type: 'Boolean', constraints: 'default: false', description: 'Invalidated upon rotation or logout' },
      { name: 'expiresAt', type: 'Date', constraints: 'Required', description: 'Token expiration timestamp (14 days)' },
      { name: 'createdAt', type: 'Date', constraints: 'default: Date.now', description: 'Issuance timestamp' }
    ],
    indexes: [
      { name: 'tokenHash_1', fields: 'tokenHash: 1', type: 'B-Tree', purpose: 'Rapid hash lookup during silent POST /auth/refresh rotation' },
      { name: 'teacherId_1', fields: 'teacherId: 1', type: 'B-Tree', purpose: 'Bulk revocation during password reset' }
    ]
  },
  {
    name: 'exams',
    description: 'Exam configurations, question paper URLs, whitelist parameters, and proctoring rules.',
    columns: [
      { name: '_id', type: 'ObjectId', constraints: 'PRIMARY KEY (Default ObjectId)', description: 'Unique exam primary key' },
      { name: 'examCode', type: 'String', constraints: 'Required, Unique', description: 'Alphanumeric code candidates enter (e.g. CS401-MID)' },
      { name: 'title', type: 'String', constraints: 'Required', description: 'Descriptive course/exam title' },
      { name: 'examType', type: 'String', constraints: "Enum: ['online', 'physical_lab'], default: 'online'", description: 'Online (full AI) vs Physical Lab' },
      { name: 'status', type: 'String', constraints: "Enum: ['draft', 'active', 'completed'], default: 'draft'", description: 'Current lifecycle stage' },
      { name: 'durationMinutes', type: 'Number', constraints: 'default: 60', description: 'Official exam duration' },
      { name: 'extraMinutes', type: 'Number', constraints: 'default: 0', description: 'Examiner-granted extra time' },
      { name: 'paperPath', type: 'String', constraints: 'default: null', description: 'Storage path/URL to uploaded PDF/DOCX paper' },
      { name: 'paperFilename', type: 'String', constraints: 'default: null', description: 'Original uploaded filename' },
      { name: 'paperReleased', type: 'Boolean', constraints: 'default: false', description: 'Controls whether students can download paper' },
      { name: 'paperReleasedAt', type: 'Date', constraints: 'default: null', description: 'Timestamp when instructor pressed "Release Paper"' },
      { name: 'rules', type: 'Object (Subdocument)', constraints: '{ detectCellPhone, detectMultiplePersons, enforceAppWhitelist, detectLookingAway, autoTerminateRiskScore }', description: 'Proctoring violation feature flags' },
      { name: 'allowedApplications', type: 'Array of Objects', constraints: '[{ id, name, executable, category }]', description: 'Permitted executable names (word.exe, code.exe, etc.)' },
      { name: 'createdBy', type: 'ObjectId', constraints: 'Ref: Teacher, default: null', description: 'Instructor ownership reference' },
      { name: 'createdByName', type: 'String', constraints: "default: 'Examiner'", description: 'Instructor display name' },
      { name: 'createdAt', type: 'Date', constraints: 'default: Date.now', description: 'Creation timestamp' }
    ],
    indexes: [
      { name: 'examCode_1', fields: 'examCode: 1', type: 'Unique B-Tree', purpose: 'Sub-millisecond lookup when student logs in on desktop' },
      { name: 'createdBy_1', fields: 'createdBy: 1', type: 'B-Tree', purpose: 'Multi-tenant examiner isolation (only show own exams)' },
      { name: 'status_1_createdAt_-1', fields: 'status: 1, createdAt: -1', type: 'Compound B-Tree', purpose: 'Active exam queries and dashboard overview' }
    ]
  },
  {
    name: 'sessions',
    description: 'Candidate proctoring sessions linking student identity, consent, camera checks, and exam state.',
    columns: [
      { name: '_id', type: 'ObjectId', constraints: 'PRIMARY KEY (Default ObjectId)', description: 'Session record ID' },
      { name: 'studentId', type: 'String', constraints: 'Required', description: 'Candidate session UUID generated on desktop' },
      { name: 'studentName', type: 'String', constraints: "default: 'Candidate'", description: 'Student Full Name (e.g. Muhammad Ali)' },
      { name: 'rollNumber', type: 'String', constraints: "default: 'N/A'", description: 'Institutional Roll/Registration number' },
      { name: 'examId', type: 'String', constraints: 'Required', description: 'Associated exam code' },
      { name: 'status', type: 'String', constraints: "Enum: ['active', 'completed', 'terminated'], default: 'active'", description: 'Active session state' },
      { name: 'startTime', type: 'Date', constraints: 'default: Date.now', description: 'Official exam start time' },
      { name: 'endTime', type: 'Date', constraints: 'default: null', description: 'Session completion timestamp' },
      { name: 'cameraVerificationPhoto', type: 'String', constraints: 'default: null', description: 'Self-check identity reference selfie path/URL' },
      { name: 'cameraVerificationStatus', type: 'String', constraints: "Enum: ['pending', 'verified', 'flagged', 'none'], default: 'none'", description: 'Pre-exam reference photo status' },
      { name: 'cameraVerificationNote', type: 'String', constraints: 'default: null', description: 'Examiner note on photo verification' },
      { name: 'consentGiven', type: 'Boolean', constraints: 'default: false', description: 'Section 10.4 Data Ethics consent agreement' },
      { name: 'consentTimestamp', type: 'Date', constraints: 'default: null', description: 'Consent timestamp' },
      { name: 'autoSubmitted', type: 'Boolean', constraints: 'default: false', description: 'True if submitted automatically upon duration expiry' },
      { name: 'extraMinutes', type: 'Number', constraints: 'default: 0', description: 'Student-specific extra time allowance' },
      { name: 'terminationReason', type: 'String', constraints: 'default: null', description: 'Reason for session termination' },
      { name: 'warnings', type: 'Array of Objects', constraints: '[{ message, timestamp }]', description: 'Live broadcast warnings sent by instructor' }
    ],
    indexes: [
      { name: 'examId_1_status_1', fields: 'examId: 1, status: 1', type: 'Compound B-Tree', purpose: 'Optimizes active candidate roster and exam summary aggregates' },
      { name: 'studentId_1', fields: 'studentId: 1', type: 'B-Tree', purpose: 'Sub-millisecond candidate session telemetry routing' }
    ]
  },
  {
    name: 'violations',
    description: 'High-frequency violation telemetry with discrete microsecond timestamps, evidence paths, and triage decisions.',
    columns: [
      { name: '_id', type: 'ObjectId', constraints: 'PRIMARY KEY (Default ObjectId)', description: 'Violation record ID' },
      { name: 'sessionId', type: 'String', constraints: 'Required', description: 'Target candidate session identifier' },
      { name: 'type', type: 'String', constraints: "Required, Enum: ['head_turn_away', 'second_person_detected', 'no_face_detected', 'unauthorized_object', 'unauthorized_app', 'second_voice_detected', 'pre_existing_file', 'camera_occluded_or_dark', ...]", description: 'Violation classification' },
      { name: 'severity', type: 'Number', constraints: 'Required, min: 1, max: 5', description: 'Standardized severity level (1: minor, 5: critical)' },
      { name: 'timestamp', type: 'Date', constraints: 'Required', description: 'Timestamp of authentic physical occurrence' },
      { name: 'details', type: 'Object (Mixed)', constraints: '{ confidence, duration, object_class, reason, fileName, filePath, similarity_score }', description: 'Telemetry attributes' },
      { name: 'screenshotPath', type: 'String', constraints: 'Optional', description: 'Path or Cloudinary URL to evidence screenshot (<200KB)' },
      { name: 'audioPath', type: 'String', constraints: 'Optional', description: 'Path or Cloudinary URL to recorded voice evidence .wav clip' },
      { name: 'reviewed', type: 'Boolean', constraints: 'default: false', description: 'Human-in-the-loop review flag' },
      { name: 'decision', type: 'String', constraints: "Enum: ['pending', 'confirmed', 'dismissed'], default: 'pending'", description: 'Examiner review judgment' },
      { name: 'reviewNote', type: 'String', constraints: "default: ''", description: 'Optional instructor rationale' },
      { name: 'reviewedAt', type: 'Date', constraints: 'default: null', description: 'Timestamp when examiner confirmed or dismissed' },
      { name: 'createdAt', type: 'Date', constraints: 'default: Date.now', description: 'Ingestion timestamp' }
    ],
    indexes: [
      { name: 'sessionId_1_timestamp_-1', fields: 'sessionId: 1, timestamp: -1', type: 'Compound B-Tree', purpose: 'Chronological timeline reconstruction during evidence review' },
      { name: 'reviewed_1', fields: 'reviewed: 1', type: 'B-Tree', purpose: 'Cross-student Priority Queue triage queries' },
      { name: 'sessionId_1_reviewed_1', fields: 'sessionId: 1, reviewed: 1', type: 'Compound B-Tree', purpose: 'Unreviewed badge counts on active student roster cards' }
    ]
  },
  {
    name: 'submissions',
    description: 'Final exam submissions containing uploaded answer scripts, word counts, and solution file attachments.',
    columns: [
      { name: '_id', type: 'ObjectId', constraints: 'PRIMARY KEY (Default ObjectId)', description: 'Submission ID' },
      { name: 'sessionId', type: 'String', constraints: 'Required', description: 'Associated session' },
      { name: 'submissionType', type: 'String', constraints: "Enum: ['text', 'file', 'both'], default: 'text'", description: 'Submission mode' },
      { name: 'answerText', type: 'String', constraints: "default: ''", description: 'Candidate in-app typed responses' },
      { name: 'filename', type: 'String', constraints: 'default: null', description: 'Original uploaded filename' },
      { name: 'filePath', type: 'String', constraints: 'default: null', description: 'Path or Cloudinary URL to solution attachment' },
      { name: 'fileSize', type: 'Number', constraints: 'default: 0', description: 'File size in bytes' },
      { name: 'uploadedAt', type: 'Date', constraints: 'default: Date.now', description: 'Submission timestamp' }
    ],
    indexes: [
      { name: 'sessionId_1', fields: 'sessionId: 1', type: 'B-Tree', purpose: 'Instant submission lookup and verification' },
      { name: 'uploadedAt_-1', fields: 'uploadedAt: -1', type: 'B-Tree', purpose: 'Chronological grading view' }
    ]
  },
  {
    name: 'messages',
    description: 'In-exam student paper inquiries and examiner broadcast announcements.',
    columns: [
      { name: '_id', type: 'ObjectId', constraints: 'PRIMARY KEY (Default ObjectId)', description: 'Message ID' },
      { name: 'sessionId', type: 'String', constraints: 'Required', description: 'Session UUID for 1-on-1 query, or "ALL" for broadcasts' },
      { name: 'examId', type: 'String', constraints: 'Required', description: 'Exam room identifier' },
      { name: 'sender', type: 'String', constraints: "Enum: ['candidate', 'teacher'], Required", description: 'Message origin' },
      { name: 'senderName', type: 'String', constraints: 'Required', description: 'Display name of sender' },
      { name: 'rollNumber', type: 'String', constraints: 'default: null', description: 'Candidate roll number if student inquiry' },
      { name: 'text', type: 'String', constraints: 'Required', description: 'Message content' },
      { name: 'isBroadcast', type: 'Boolean', constraints: 'default: false', description: 'Flag for exam-wide announcements' },
      { name: 'read', type: 'Boolean', constraints: 'default: false', description: 'Examiner/Candidate read status' },
      { name: 'timestamp', type: 'Date', constraints: 'default: Date.now', description: 'Dispatch timestamp' }
    ],
    indexes: [
      { name: 'sessionId_1_timestamp_1', fields: 'sessionId: 1, timestamp: 1', type: 'Compound B-Tree', purpose: 'Threaded 1-on-1 chat history retrieval' },
      { name: 'examId_1_isBroadcast_1', fields: 'examId: 1, isBroadcast: 1', type: 'Compound B-Tree', purpose: 'Exam-wide announcement delivery' }
    ]
  },
  {
    name: 'auditlogs',
    description: 'System activity, login attempts, exam management operations, and administrator audit trails.',
    columns: [
      { name: '_id', type: 'ObjectId', constraints: 'PRIMARY KEY (Default ObjectId)', description: 'Audit log record ID' },
      { name: 'action', type: 'String', constraints: 'Required', description: 'Action type (LOGIN, EXAM_CREATE, PAPER_RELEASE, etc.)' },
      { name: 'performedBy', type: 'String', constraints: 'Required', description: 'Teacher name or system identifier' },
      { name: 'teacherId', type: 'ObjectId', constraints: 'Ref: Teacher, default: null', description: 'Associated teacher ID' },
      { name: 'target', type: 'String', constraints: 'default: null', description: 'Exam code or candidate target' },
      { name: 'details', type: 'Object (Mixed)', constraints: 'default: {}', description: 'Contextual audit metadata' },
      { name: 'ipAddress', type: 'String', constraints: 'default: null', description: 'Origin IP address' },
      { name: 'userAgent', type: 'String', constraints: 'default: null', description: 'Client browser / platform agent' },
      { name: 'createdAt', type: 'Date', constraints: 'default: Date.now', description: 'Event timestamp' }
    ],
    indexes: [
      { name: 'createdAt_-1', fields: 'createdAt: -1', type: 'B-Tree', purpose: 'Latest system activity sorting and security review' },
      { name: 'action_1', fields: 'action: 1', type: 'B-Tree', purpose: 'Action-specific audit trail filtering' }
    ]
  }
];

export const benchmarkMetrics = {
  candidatesTested: 40,
  beforeOptimization: {
    durationMinutes: 3.0,
    totalRequests: 1009,
    throughputRps: 5.61,
    successRate: '100.0%',
    writes: {
      total: 723,
      avgLatency: 198.79,
      p50: 167.83,
      p90: 234.83,
      p95: 368.46,
      p99: 771.01,
      maxPeak: 1394.91
    },
    reads: {
      total: 246,
      avgLatency: 106.85,
      p50: 88.76,
      p90: 119.26,
      p95: 176.09,
      p99: 369.66,
      maxPeak: 1230.66
    }
  },
  afterOptimization: {
    durationMinutes: 1.0,
    totalRequests: 374,
    throughputRps: 6.23,
    throughputGain: '+11.1%',
    successRate: '100.0%',
    writes: {
      total: 252,
      avgLatency: 225.40,
      p50: 195.74,
      p90: 324.41,
      p95: 378.06,
      p99: 536.99, // -30.4%
      p99Delta: '-30.4%',
      maxPeak: 640.80, // -54.1%
      maxPeakDelta: '-54.1%'
    },
    reads: {
      total: 82,
      avgLatency: 114.66,
      p50: 101.37,
      p90: 148.17,
      p95: 182.08,
      p99: 310.59, // -16.0%
      p99Delta: '-16.0%',
      maxPeak: 310.59, // -74.8%
      maxPeakDelta: '-74.8%'
    }
  }
};
