import { VivaQuestion } from '../types';

export const vivaQuestions: VivaQuestion[] = [
  {
    category: 'Architecture',
    question: 'Why did you choose an Electron desktop shell rather than a purely browser-based (WebRTC) proctoring application?',
    shortAnswer: 'Web browsers operate inside OS sandboxes that prohibit low-level process enumeration, drive letter inspection, and secure clipboard purging.',
    deepDive: 'A web browser tab cannot detect background unauthorized software (e.g. Discord, Telegram, or Python scripts), cannot inspect USB removable drive volumes, cannot guarantee single-display lockdown, and cannot prevent users from switching applications without invasive browser hacks. By running an Electron desktop container with a local Python daemon, IntegrityFlow gains full OS-level access to verify running processes, block clipboard shortcuts, and monitor hardware ports while maintaining web UI responsiveness.',
    codeOrFormulaRef: 'psutil.process_iter() & win32api.GetDriveTypeW()'
  },
  {
    category: 'Architecture',
    question: 'How do you decouple the heavy AI detection algorithms from the user interface to prevent UI freezing?',
    shortAnswer: 'Heavy AI models run in an independent Python background process communicating asynchronously with the Electron main process via local IPC over port 8766.',
    deepDive: 'Running neural inference (MediaPipe FaceMesh, ONNX YOLO, and Resemblyzer) directly in the JavaScript V8 engine would cause severe frame drops, UI lag, and typing latency for the student. Isolating the AI suite to a dedicated Python daemon ensures the Candidate App renderer remains smooth (60fps) even under intensive neural processing. Furthermore, communication uses lightweight JSON events over local HTTP port 8766.',
    codeOrFormulaRef: 'ai-module/server.py -> Express receiver on port 8766'
  },
  {
    category: 'AI & Algorithms',
    question: 'How does your Two-Stage Acoustic Voice Pipeline prevent false alarms when a candidate reads exam questions aloud to themselves?',
    shortAnswer: 'It extracts a 256-dimensional neural speaker embedding and computes the Cosine Similarity against the candidate\'s own 4-second self-check reference sample.',
    deepDive: 'Many proctoring systems flag any speech detection as a violation, causing unfair penalties when students read questions aloud. In IntegrityFlow, audio first passes through a lightweight WebRTC VAD (<1% CPU). If speech sustains past 2.0s, Resemblyzer extracts a 256-d voice embedding and compares Cosine Similarity against the reference embedding recorded at self-check. Candidate self-speech yields similarity >= 0.75 and produces ZERO violations. A third party in the room yields < 0.75, which triggers a violation after 2 consecutive mismatched segments.',
    codeOrFormulaRef: 'Sim(e_ref, e_seg) >= 0.75 (True Negative: Self-Speech)'
  },
  {
    category: 'AI & Algorithms',
    question: 'How is audio evidence recorded and sent to the teacher dashboard for voice verification?',
    shortAnswer: 'When a voice mismatch triggers, the exact 16kHz speech utterance is recorded as a .wav file, sent via multipart FormData, and played back directly on the proctor dashboard.',
    deepDive: 'When a suspicious second voice is detected (similarity < 75%), voice_monitor.py writes the raw 16-bit mono PCM audio buffer out as a standalone .wav evidence clip under candidate-app/ai-module/audio_evidence/. The Electron IPC bridge attaches this audio file alongside the screenshot in a multipart FormData request. The server saves it to uploads/audio_clips/ or Cloudinary CDN. On the teacher dashboard, both the Live Alert Feed and Evidence Review Timeline render an embedded audio player with play/pause/seek controls and the exact match percentage, enabling instant human verification.',
    codeOrFormulaRef: 'voice_monitor.py: _save_audio_clip(audio_bytes) -> <audio controls src={assetUrl(v.audioPath)} />'
  },
  {
    category: 'AI & Algorithms',
    question: 'How does MediaPipe 3D Head-Pose Estimation calculate Euler angles (pitch, yaw, roll) from a standard 2D webcam without depth sensors?',
    shortAnswer: 'It uses Perspective-n-Point (PnP) pose solving against a generic 3D canonical face model using 6 specific facial landmarks.',
    deepDive: 'MediaPipe Face Mesh extracts 468 2D landmarks (x, y) per frame. Six key anatomical landmarks (nose tip, chin, left eye corner, right eye corner, left mouth corner, right mouth corner) are mapped against known 3D canonical facial coordinates. OpenCV\'s cv2.solvePnP uses the camera intrinsic matrix to solve the rotation and translation vectors, which are converted to Euler angles using Rodrigues and rotation matrix decomposition. If head yaw exceeds ±24° or downward desk gaze exceeds 2.2s, a head_turn_away violation triggers.',
    codeOrFormulaRef: 'cv2.solvePnP(face_3d, face_2d, cam_matrix, dist_matrix) -> Euler Angles'
  },
  {
    category: 'AI & Algorithms',
    question: 'What is Smart Inference Sampling, and how does it keep AI CPU utilization under 30% on low-end laptops?',
    shortAnswer: 'Lightweight algorithms run every frame, while heavy neural networks execute on a disciplined sampled schedule.',
    deepDive: 'Running full YOLOv8 object detection on every 30 FPS video frame would max out CPU at 100% and overheat laptops. IntegrityFlow implements Smart Sampling: (1) Lightweight Head-Pose runs every frame (30 FPS, ~5% CPU); (2) Face counting runs every 10 frames (~3 FPS, ~3% CPU); (3) Heavy INT8 quantized YOLOv8n object detection executes only once every 90 frames (~every 3 seconds, ~8% CPU); (4) WebRTC VAD runs continuously at <1% CPU and only invokes deep speaker verification when sustained speech occurs.',
    codeOrFormulaRef: 'Schedule: 30 FPS Pose | 3 FPS FaceCount | 0.33 FPS YOLOv8n INT8'
  },
  {
    category: 'AI & Algorithms',
    question: 'How does the YOLOv8 INT8 ONNX object detection pipeline work, what tensor shapes does it decode, and how is it optimized for CPU execution?',
    shortAnswer: 'It processes a 640x640 RGB blob via ONNX Runtime clamped to 2 threads, transposes the (1, 84, 8400) output tensor to (8400, 84), and filters COCO classes 67 (phone) and 73 (book) using NMS.',
    deepDive: 'Webcam frames are resized to 640x640 with SIMD float32 normalization (1.0/255.0) via cv2.dnn.blobFromImage. The INT8 quantized model yolo26n_int8.onnx executes on ONNX Runtime with intra_op_num_threads=2, taking ~18ms. The output tensor (1, 84, 8400) is transposed to (8400, 84), where each candidate box has [x_center, y_center, w, h] and 80 COCO class probabilities. We extract scores for Class 67 (cell phone) and Class 73 (book). If score >= threshold (0.45 for phone, 0.40 for book), corner coordinates [x1, y1, x2, y2] are computed and passed to cv2.dnn.NMSBoxes (IoU=0.45) to suppress duplicate overlapping boxes before firing an unauthorized_object violation.',
    codeOrFormulaRef: 'blob: (1, 3, 640, 640) -> ONNX INT8 -> Output: (8400, 84) -> Filter [67, 73] -> NMSBoxes(IoU=0.45)'
  },
  {
    category: 'AI & Algorithms',
    question: 'Why did you choose INT8 Quantization over standard FP32 for YOLOv8, and what are the trade-offs in proctoring accuracy?',
    shortAnswer: 'INT8 quantization cuts model memory by 76% (from 12.4MB to 2.97MB) and provides a 3.2x CPU speedup via SIMD AVX2/VNNI vector integer arithmetic with <1.2% mAP drop.',
    deepDive: 'Standard 32-bit floating point (FP32) YOLOv8 models require heavy floating-point arithmetic units, consuming 60-80ms per inference and causing dual-core student laptops to overheat or freeze. By calibrating weights and activations to 8-bit integers via dynamic range quantization (q = round(r/S) + Z), memory bandwidth pressure drops by 4x and CPUs can execute 4x more operations per vector cycle using AVX2/VNNI instructions. Rigorous validation shows that for large, distinct physical cheating aids (smartphones and books held near the candidate), INT8 detection accuracy suffers less than 1.2% mAP loss compared to FP32 while guaranteeing sub-20ms latency.',
    codeOrFormulaRef: 'q = round(r/S) + Z (FP32: 12.4MB / ~65ms -> INT8: 2.97MB / ~18ms)'
  },
  {
    category: 'AI & Algorithms',
    question: 'What is the mathematical rationale behind the Dynamic Exponential Severity Decay Engine, and why is its half-life set to ~30 minutes?',
    shortAnswer: 'It models real human error: isolated minor slips decay smoothly, while repeated or severe infractions escalate risk exponentially.',
    deepDive: 'Standard proctoring systems use linear summation: 10 minor head turns over a 2-hour exam would sum to the same score as 10 consecutive head turns in 60 seconds. IntegrityFlow uses exponential decay: S(t) = S0 * exp(-lambda * dt) with lambda = 0.0231/min (approx 30-minute half-life). An accidental glance away in minute 5 decays by 50% at minute 35 and 75% at minute 65. However, repeated infractions reinforce the cumulative baseline, escalating the risk score and floating the student to the top of the examiner Priority Queue.',
    codeOrFormulaRef: 'S(t) = S0 * exp(-0.0231 * dt) + B_cum'
  },
  {
    category: 'Security & Privacy',
    question: 'How do you satisfy Section 10.4 Data Ethics and GDPR / Student Privacy regulations?',
    shortAnswer: 'Continuous webcam video is NEVER recorded or stored. Analysis is performed strictly in RAM, and screenshots are captured ONLY upon concrete violation events.',
    deepDive: 'Most students and privacy advocates rightly object to proctoring software streaming 2-hour continuous video feeds to cloud servers or creating facial recognition databases. IntegrityFlow performs all video analysis in volatile RAM. Frames are discarded in milliseconds. No continuous video files are ever created on disk or uploaded to the cloud. A compressed screenshot (<200KB) is captured ONLY when a concrete violation (e.g. phone detected, second person, head turned away) triggers. Furthermore, candidates must explicitly agree to the Informed Consent screen before any camera activation.',
    codeOrFormulaRef: 'candidate-app/renderer/consent.html (Section 10.4)'
  },
  {
    category: 'Security & Privacy',
    question: 'Why do you store JWT access tokens in React memory instead of localStorage or cookies?',
    shortAnswer: 'Tokens stored in localStorage or sessionStorage are vulnerable to Cross-Site Scripting (XSS) extraction by malicious scripts.',
    deepDive: 'If a web application has any third-party script vulnerability, attackers can read window.localStorage and steal persistent tokens. IntegrityFlow uses a strict Two-Tier Auth architecture: the 15-minute JWT access token is stored strictly in JavaScript runtime closure memory (AuthContext), which is inaccessible to external script injection. Long-lived session persistence is handled via a 14-day cryptographically secure refresh token stored in an httpOnly, SameSite=strict, Secure cookie. When the in-memory token expires, an Axios interceptor silently performs POST /auth/refresh without user interruption.',
    codeOrFormulaRef: 'dashboard/src/context/AuthContext.jsx (Axios 401 Interceptor)'
  },
  {
    category: 'Security & Privacy',
    question: 'How do you detect candidates who attempt to open pre-written solution files inside allowed editors like Microsoft Word or VS Code?',
    shortAnswer: 'The Pre-Existing File Timestamp Guard inspects open file handles and flags any file whose modification time is earlier than the exam start time.',
    deepDive: 'If an instructor permits students to use Microsoft Word or VS Code to write code or essays, candidates could open pre-written solution documents prepared before the exam. IntegrityFlow solves this through the Pre-Existing File Timestamp Guard: WhitelistEnforcer inspects the file paths currently opened by the allowed process and checks os.path.getmtime(f.path). If mtime < exam_start_time, the file was authored prior to the exam, immediately triggering an unauthorized file violation.',
    codeOrFormulaRef: 'mtime = os.path.getmtime(path); if mtime < exam_start_time: flag_violation()'
  },
  {
    category: 'Security & Privacy',
    question: 'How does IntegrityFlow enforce OS clipboard lockdown and prevent copy-pasting code from external tools?',
    shortAnswer: 'Electron intercepts clipboard paste events, hooks keyboard accelerators (Ctrl+V, Win+V), and flushes external clipboard content.',
    deepDive: 'When the exam begins, Electron registers global keyboard shortcut hooks (intercepting Alt+Tab, Win+Tab, Ctrl+V, Windows Clipboard History Win+V) and listens to renderer paste events. Any clipboard data containing content not copied from within the exam window itself is sanitized, and the candidate is warned against clipboard injection.',
    codeOrFormulaRef: 'electron/main.js: globalShortcut.register("Alt+Tab", ...)'
  },
  {
    category: 'Performance & Database',
    question: 'How did your compound B-Tree indexes improve database performance during high-concurrency 40-student load testing?',
    shortAnswer: 'Indexes converted full collection scans (COLLSCAN) into targeted index scans (IXSCAN), cutting P99 write latency by 30.4% and peak read latency by 74.8%.',
    deepDive: 'Without indexes, querying GET /violations/priority-queue (which sorts by severity DESC, timestamp DESC) or filtering by sessionId required MongoDB to scan every single document (COLLSCAN) across all active candidates. Under 40 simultaneous candidate writes, this led to CPU spikes and read latency of 1230ms. By introducing compound indexes on { sessionId: 1, timestamp: -1 }, { reviewed: 1 }, and { examId: 1, status: 1 }, execution plans switched to IXSCAN, dropping total docs examined to match nReturned and reducing peak write latency by 54.1% and peak read latency to 310ms.',
    codeOrFormulaRef: 'violationSchema.index({ sessionId: 1, timestamp: -1 });'
  },
  {
    category: 'Performance & Database',
    question: 'What happens if a candidate experiences a campus Wi-Fi network drop for 5 minutes during an exam?',
    shortAnswer: 'The Electron IPC buffer writes failed violations atomically to disk and replays them chronologically upon reconnect, preserving original microsecond timestamps.',
    deepDive: 'When Wi-Fi drops, the individual monitors continue detecting infractions and dispatching them to the local receiver. The forwarder catches network errors and appends events to an atomic JSON queue under Electron userData. When connectivity resumes, a FIFO retry loop replays the queue. Crucially, each event preserves its authentic original_timestamp. This allows the backend Exponential Decay engine to calculate authentic risk progression as it physically occurred, rather than treating all replayed events as happening simultaneously upon reconnection.',
    codeOrFormulaRef: 'candidate-app/electron/ipc/violationBuffer.js (ORDER BY id ASC FIFO)'
  },
  {
    category: 'Architecture',
    question: 'How does the Question Paper Waiting Lobby (HTTP 423 Locked) protocol guarantee exam synchronization?',
    shortAnswer: 'The server rejects premature paper downloads with HTTP 423 Locked until the instructor releases the paper, triggering an atomic WebSocket broadcast.',
    deepDive: 'To prevent candidates from scraping the exam paper before the scheduled start time, GET /exam/:examId/paper verifies the paperReleased flag. If false, it returns HTTP 423 Locked with a synchronized countdown timer. When the instructor presses "Release Paper", the server atomically sets paperReleased: true, broadcasts the paperReleased event to all active candidate apps via Socket.io, and synchronizes the exam duration clock.',
    codeOrFormulaRef: 'server/src/routes/examPaper.js (res.status(423).json({ locked: true }))'
  },
  {
    category: 'Architecture',
    question: 'Why does IntegrityFlow support a "Physical Lab Mode", and how does it differ from "Remote Online Mode"?',
    shortAnswer: 'Physical Lab Mode enables university computer labs lacking webcams or microphones to still enforce desktop shell security, USB blockades, and process whitelists.',
    deepDive: 'University on-campus computer labs usually feature desktop tower PCs without attached webcams or microphones. Forcing webcam checks would prevent running exams in computer labs. IntegrityFlow introduces Dual-Environment Exam Modes: when an instructor selects "Physical Lab Mode", the candidate self-check automatically bypasses camera and microphone checks while strictly enforcing the Process Whitelist, Pre-Existing File Timestamp Guard, USB Removable Storage Guard, Multi-Display Block, and OS Clipboard Lockdown.',
    codeOrFormulaRef: 'exam.examType === "physical_lab" -> markStepBypassed()'
  }
];
