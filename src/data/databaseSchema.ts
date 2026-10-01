import { DatabaseTable } from '../types';

export const databaseTables: DatabaseTable[] = [
  {
    name: 'teachers',
    description: 'Instructor and administrator accounts with salted bcrypt password hashes and lockout defense.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'Unique teacher identifier' },
      { name: 'name', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Instructor full name' },
      { name: 'email', type: 'VARCHAR(255)', constraints: 'UNIQUE NOT NULL', description: 'Institutional email address' },
      { name: 'password_hash', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Bcrypt hashed password (cost factor 12)' },
      { name: 'role', type: 'VARCHAR(20)', constraints: "DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin'))", description: 'Role-based access tier' },
      { name: 'email_verified', type: 'BOOLEAN', constraints: 'DEFAULT FALSE', description: 'Email verification status flag' },
      { name: 'failed_login_attempts', type: 'SMALLINT', constraints: 'DEFAULT 0', description: 'Counter for brute-force lockout (triggers lock at 5)' },
      { name: 'locked_until', type: 'TIMESTAMPTZ', constraints: 'NULL', description: '15-minute lockout expiration timestamp' },
      { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT NOW()', description: 'Account creation time' }
    ],
    indexes: [
      { name: 'idx_teachers_email', fields: 'email', type: 'B-Tree (Unique)', purpose: 'Instant O(log N) lookup during instructor login' }
    ]
  },
  {
    name: 'refresh_tokens',
    description: 'Cryptographically secure hashed refresh tokens (14-day lifespan) enabling seamless silent rotation.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'Token record ID' },
      { name: 'teacher_id', type: 'UUID', constraints: 'NOT NULL REFERENCES teachers(id) ON DELETE CASCADE', description: 'Associated instructor' },
      { name: 'token_hash', type: 'VARCHAR(64)', constraints: 'NOT NULL', description: 'SHA-256 hash of 40-byte random hex string' },
      { name: 'revoked', type: 'BOOLEAN', constraints: 'DEFAULT FALSE', description: 'Invalidated upon rotation or logout' },
      { name: 'expires_at', type: 'TIMESTAMPTZ', constraints: 'NOT NULL', description: 'Token expiration timestamp (14 days)' },
      { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT NOW()', description: 'Issuance timestamp' }
    ],
    indexes: [
      { name: 'idx_refresh_tokens_hash', fields: 'token_hash', type: 'B-Tree', purpose: 'Rapid hash lookup during silent POST /auth/refresh rotation' },
      { name: 'idx_refresh_tokens_teacher', fields: 'teacher_id', type: 'B-Tree', purpose: 'Bulk revocation during password reset' }
    ]
  },
  {
    name: 'exams',
    description: 'Exam configurations, question paper URLs, whitelist parameters, and lifecycle statuses.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'Unique exam primary key' },
      { name: 'exam_code', type: 'VARCHAR(50)', constraints: 'UNIQUE NOT NULL', description: 'Alphanumeric code candidates enter (e.g. CS401-MID)' },
      { name: 'title', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Descriptive course/exam title' },
      { name: 'exam_type', type: 'VARCHAR(20)', constraints: "DEFAULT 'online' CHECK (exam_type IN ('online', 'physical_lab'))", description: 'Online (full AI) vs Physical Lab (no webcam required)' },
      { name: 'status', type: 'VARCHAR(20)', constraints: "DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed'))", description: 'Current lifecycle stage' },
      { name: 'duration_minutes', type: 'INTEGER', constraints: 'NOT NULL DEFAULT 60', description: 'Official exam duration' },
      { name: 'paper_url', type: 'TEXT', constraints: 'NULL', description: 'Storage path/URL to uploaded PDF/DOCX paper' },
      { name: 'paper_locked', type: 'BOOLEAN', constraints: 'DEFAULT TRUE', description: 'Enforces HTTP 423 Waiting Lobby until instructor releases' },
      { name: 'activated_at', type: 'TIMESTAMPTZ', constraints: 'NULL', description: 'Timestamp when instructor pressed "Release Paper"' },
      { name: 'whitelist_rules', type: 'JSONB', constraints: "DEFAULT '[]'::jsonb", description: 'Permitted executable names (word.exe, code.exe, etc.)' },
      { name: 'created_by', type: 'UUID', constraints: 'NOT NULL REFERENCES teachers(id)', description: 'Instructor ownership foreign key' },
      { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT NOW()', description: 'Creation timestamp' }
    ],
    indexes: [
      { name: 'idx_exams_code', fields: 'exam_code', type: 'B-Tree (Unique)', purpose: 'Sub-millisecond lookup when student logs in on desktop' },
      { name: 'idx_exams_created_by', fields: 'created_by', type: 'B-Tree', purpose: 'Multi-tenant examiner isolation (only show own exams)' },
      { name: 'idx_exams_status_active', fields: 'status, activated_at', type: 'Compound B-Tree', purpose: 'Background lifecycle reaper auto-expiry checks' }
    ]
  },
  {
    name: 'sessions',
    description: 'Candidate proctoring sessions linking student identity, consent, camera checks, and exam state.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'Session UUID generated on candidate desktop' },
      { name: 'exam_id', type: 'VARCHAR(50)', constraints: 'NOT NULL REFERENCES exams(exam_code) ON DELETE CASCADE', description: 'Associated exam code' },
      { name: 'student_name', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Student Full Name (e.g. Muhammad Ali)' },
      { name: 'roll_number', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Institutional Roll/Registration number (e.g. FA20-BCS-042)' },
      { name: 'student_id', type: 'VARCHAR(50)', constraints: 'NULL', description: 'Secondary student identifier' },
      { name: 'consent_given', type: 'BOOLEAN', constraints: 'NOT NULL DEFAULT TRUE', description: 'Section 10.4 Data Ethics consent agreement' },
      { name: 'camera_verification_status', type: 'VARCHAR(20)', constraints: "DEFAULT 'pending' CHECK (camera_verification_status IN ('pending', 'verified', 'rejected', 're_verify'))", description: 'Pre-exam reference photo status' },
      { name: 'reference_photo_url', type: 'TEXT', constraints: 'NULL', description: 'Self-check identity reference selfie' },
      { name: 'status', type: 'VARCHAR(20)', constraints: "DEFAULT 'active' CHECK (status IN ('active', 'completed', 'terminated'))", description: 'Active session state' },
      { name: 'start_time', type: 'TIMESTAMPTZ', constraints: 'NOT NULL DEFAULT NOW()', description: 'Official exam start time' },
      { name: 'end_time', type: 'TIMESTAMPTZ', constraints: 'NULL', description: 'Session completion timestamp' },
      { name: 'risk_score', type: 'SMALLINT', constraints: 'DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100)', description: 'Cached dynamic exponential decay risk score' }
    ],
    indexes: [
      { name: 'idx_sessions_exam_status', fields: 'exam_id, status', type: 'Compound B-Tree', purpose: 'Optimizes active candidate roster and exam summary aggregates' },
      { name: 'idx_sessions_roll_exam', fields: 'roll_number, exam_id', type: 'Compound B-Tree (Unique Active)', purpose: 'Rejects duplicate simultaneous sessions for the same student' }
    ]
  },
  {
    name: 'violations',
    description: 'High-frequency violation telemetry with discrete microsecond timestamps, evidence paths, and triage decisions.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'Violation record UUID' },
      { name: 'session_id', type: 'UUID', constraints: 'NOT NULL REFERENCES sessions(id) ON DELETE CASCADE', description: 'Target candidate session' },
      { name: 'type', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Violation type enum (head_turn_away, unauthorized_object, etc.)' },
      { name: 'severity', type: 'SMALLINT', constraints: 'NOT NULL CHECK (severity BETWEEN 1 AND 5)', description: 'Standardized severity level (1: minor, 5: critical)' },
      { name: 'timestamp', type: 'TIMESTAMPTZ', constraints: 'NOT NULL', description: 'Microsecond timestamp of authentic physical occurrence' },
      { name: 'details', type: 'JSONB', constraints: "DEFAULT '{}'::jsonb", description: 'Telemetry attributes (similarity_score, angles, process_name)' },
      { name: 'screenshot_path', type: 'TEXT', constraints: 'NULL', description: 'Relative path or Cloudinary URL to <200KB evidence image' },
      { name: 'reviewed', type: 'BOOLEAN', constraints: 'DEFAULT FALSE', description: 'Human-in-the-loop review flag' },
      { name: 'decision', type: 'VARCHAR(20)', constraints: "DEFAULT 'pending' CHECK (decision IN ('pending', 'confirmed', 'dismissed'))", description: 'Examiner review judgment' },
      { name: 'examiner_notes', type: 'TEXT', constraints: 'NULL', description: 'Optional instructor rationale' }
    ],
    indexes: [
      { name: 'idx_violations_session_time', fields: 'session_id, timestamp DESC', type: 'Compound B-Tree', purpose: 'Chronological timeline reconstruction during evidence review' },
      { name: 'idx_violations_reviewed', fields: 'reviewed', type: 'Partial B-Tree (WHERE reviewed = FALSE)', purpose: 'Cross-student Priority Queue triage queries' },
      { name: 'idx_violations_session_reviewed', fields: 'session_id, reviewed', type: 'Compound B-Tree', purpose: 'Unreviewed badge counts on active student roster cards' }
    ]
  },
  {
    name: 'submissions',
    description: 'Final exam submissions containing typed answer scripts, word counts, and solution file attachments.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'Submission ID' },
      { name: 'session_id', type: 'UUID', constraints: 'UNIQUE NOT NULL REFERENCES sessions(id) ON DELETE CASCADE', description: 'Associated session' },
      { name: 'exam_id', type: 'VARCHAR(50)', constraints: 'NOT NULL REFERENCES exams(exam_code)', description: 'Exam identifier' },
      { name: 'student_name', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Candidate name' },
      { name: 'roll_number', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Candidate roll number' },
      { name: 'typed_text', type: 'TEXT', constraints: 'NULL', description: 'Candidate in-app typed responses' },
      { name: 'word_count', type: 'INTEGER', constraints: 'DEFAULT 0', description: 'Computed word count of typed answers' },
      { name: 'char_count', type: 'INTEGER', constraints: 'DEFAULT 0', description: 'Computed character count' },
      { name: 'attachments', type: 'JSONB', constraints: "DEFAULT '[]'::jsonb", description: 'Solution file metadata (filename, size, URL, modified_time)' },
      { name: 'submitted_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT NOW()', description: 'Submission timestamp' },
      { name: 'is_auto_submitted', type: 'BOOLEAN', constraints: 'DEFAULT FALSE', description: 'True if submitted automatically upon duration expiry' }
    ],
    indexes: [
      { name: 'idx_submissions_exam', fields: 'exam_id', type: 'B-Tree', purpose: 'Bulk export and grading roster generation' }
    ]
  },
  {
    name: 'messages',
    description: 'In-exam student paper inquiries and examiner broadcast announcements.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'Message ID' },
      { name: 'session_id', type: 'VARCHAR(100)', constraints: 'NOT NULL', description: 'Session UUID for 1-on-1 query, or "ALL" for broadcasts' },
      { name: 'exam_id', type: 'VARCHAR(50)', constraints: 'NOT NULL REFERENCES exams(exam_code)', description: 'Exam room identifier' },
      { name: 'sender', type: 'VARCHAR(20)', constraints: "NOT NULL CHECK (sender IN ('candidate', 'teacher'))", description: 'Message origin' },
      { name: 'sender_name', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Display name of sender' },
      { name: 'roll_number', type: 'VARCHAR(50)', constraints: 'NULL', description: 'Candidate roll number if student inquiry' },
      { name: 'text', type: 'TEXT', constraints: 'NOT NULL', description: 'Message content' },
      { name: 'is_broadcast', type: 'BOOLEAN', constraints: 'DEFAULT FALSE', description: 'Flag for exam-wide announcements' },
      { name: 'read', type: 'BOOLEAN', constraints: 'DEFAULT FALSE', description: 'Examiner/Candidate read status' },
      { name: 'timestamp', type: 'TIMESTAMPTZ', constraints: 'DEFAULT NOW()', description: 'Dispatch timestamp' }
    ],
    indexes: [
      { name: 'idx_messages_session', fields: 'session_id, timestamp', type: 'Compound B-Tree', purpose: 'Threaded 1-on-1 chat history retrieval' },
      { name: 'idx_messages_exam_broadcast', fields: 'exam_id, is_broadcast', type: 'Compound B-Tree', purpose: 'Exam-wide announcement delivery' }
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
