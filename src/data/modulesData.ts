import { ModuleDetail } from '../types';

export const modulesData: ModuleDetail[] = [
  {
    id: 'module-1-whitelist',
    number: 1,
    title: 'Process Whitelist Enforcement & Pre-Existing Notes Guard',
    shortDesc: 'Continuous OS process scanning, unauthorized application termination, and open file handle modification timestamp validation.',
    category: 'AI Monitoring',
    purpose: 'Guarantees the candidate device only runs instructor-approved tools during an active exam, terminating prohibited apps and intercepting cheating via pre-written solution files in allowed software.',
    howItWorks: 'The Python background daemon executes WhitelistEnforcer on a 2.5-second polling cycle using psutil. It inspects all running processes against an exam-scoped whitelist. When permitted software (e.g. Word, VS Code, Notepad) is running, it inspects open file handles via OS APIs and checks if any document was modified prior to exam start (mtime < exam_start_time). Prohibited processes are immediately terminated, and a violation event with microsecond timestamp is dispatched.',
    technicalImplementation: {
      language: 'Python 3.10 / C++ OS bindings',
      libraries: ['psutil', 'win32process / win32api', 'subprocess', 'requests'],
      coreFiles: ['ai-module/whitelist_enforcer.py', 'ai-module/main.py', 'candidate-app/electron/main.js'],
      mechanisms: [
        '2.5-second process enumeration loop filtering candidate-owned process handles',
        'Pre-Existing File Timestamp Guard checking file.mtime against session.examStartTime',
        'Pre-Exam False-Alert Suppression: operates in "dev" mode during login and self-check, switching to strict "exam" mode only upon workspace launch',
        'Graceful process SIGTERM / TerminateProcess dispatch to prevent data corruption'
      ]
    },
    keyFormulasOrRules: [
      {
        name: 'Pre-Existing File Guard Rule',
        formula: '\\text{Flag Violation} \\iff t_{\\text{modified}} < t_{\\text{exam\\_start}}',
        explanation: 'If a candidate opens a document inside an allowed editor whose filesystem modification timestamp predates the official exam activation timestamp, an unauthorized_app or pre_existing_document alert is triggered.'
      },
      {
        name: 'Scan Cadence & CPU Budget',
        formula: 'T_{\\text{scan}} = 2.5\\text{ s}, \\quad \\text{CPU}_{\\text{whitelist}} < 1.2\\%',
        explanation: 'Enforces an optimal balance between rapid cheating detection (under 3 seconds) and minimal CPU footprint so low-spec candidate PCs remain responsive.'
      }
    ],
    architectureFit: 'Runs inside the local Python daemon. When a breach is discovered, WhitelistEnforcer dispatches an HTTP POST payload to the Electron receiver (port 8766), which commits it to the atomic offline buffer and streams it to the Node.js/MongoDB backend.',
    inputs: ['Candidate process table snapshot', 'Exam whitelist array (from exam configuration)', 'Active session exam_start_time ISO string'],
    outputs: ['Process termination signal', 'Violation event JSON (type: "unauthorized_app", severity: 4, process_name, timestamp)'],
    edgeCasesHandled: [
      'System background tasks (e.g., git-remote-https.exe, phoneexperiencehost.exe) are safelisted to prevent crashing the OS',
      'Distinguishes between student-launched instances and Windows system services running under SYSTEM/LOCAL SERVICE credentials',
      'Suppressed during pre-exam identification so students can launch necessary accessibility tools or type credentials freely'
    ],
    codeSnippet: {
      language: 'python',
      filename: 'ai-module/whitelist_enforcer.py',
      code: `class WhitelistEnforcer:
    def __init__(self, allowed_executables, exam_start_time):
        self.allowed = set([exe.lower() for exe in allowed_executables])
        self.exam_start_time = exam_start_time

    def check_processes(self):
        violations = []
        for proc in psutil.process_iter(['pid', 'name', 'open_files']):
            try:
                name = proc.info['name'].lower()
                if name not in self.allowed:
                    proc.terminate()
                    violations.append(self.create_violation('unauthorized_app', name))
                elif proc.info['open_files']:
                    for f in proc.info['open_files']:
                        mtime = os.path.getmtime(f.path)
                        if mtime < self.exam_start_time:
                            violations.append(self.create_violation('pre_existing_file', f.path))
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        return violations`,
      explanation: 'Iterates through process table, terminates unauthorized executables, and inspects file handles for pre-existing modifications.'
    }
  },
  {
    id: 'module-2-vision',
    number: 2,
    title: 'AI Computer Vision Monitoring & Lens Defense',
    shortDesc: 'Multi-signal head pose yaw/pitch tracking, gaze direction, multi-person/missing-face detection, and 1.2s camera lens occlusion defense.',
    category: 'AI Monitoring',
    purpose: 'Provides continuous in-memory visual proctoring to detect looking away, notes placed above the screen, third parties in the room, and deliberate physical tampering with the webcam.',
    howItWorks: 'Processes the live webcam stream in-memory. Runs MediaPipe FaceMesh (with OpenCV Haar cascade fallback) to extract 468 3D landmarks for lateral head yaw and sustained upward pitch (detecting glancing at notes placed above the monitor with 1.2s continuity check). Employs an ONNX Runtime YOLO neural network sampled every 3rd frame to detect unauthorized objects (smartphones, books). Simultaneously runs a photometric luminance and spatial variance algorithm to detect blacked-out or covered webcam lenses within 1.2 seconds.',
    technicalImplementation: {
      language: 'Python 3.10 / C++ SIMD',
      libraries: ['OpenCV (cv2)', 'MediaPipe FaceMesh', 'ONNX Runtime', 'NumPy'],
      coreFiles: ['ai-module/ai_monitor.py', 'ai-module/services/capture/webcam_provider.py'],
      mechanisms: [
        'Perspective-n-Point (solvePnP) head pose estimation computing Euler angles (yaw, pitch, roll)',
        'Upward pitch sustained threshold: sustained_upward_seconds = 1.2s with neck-tilt continuity',
        'ONNX Runtime clamped to 2 CPU threads with SIMD blob extraction, sampled every 3rd frame',
        'Photometric luminance check: flags camera_occluded_or_dark if mean brightness < 15 or spatial variance < 10 for 1.2s',
        'In-Memory Only: Frames are processed strictly in RAM and discarded immediately unless a violation occurs'
      ]
    },
    keyFormulasOrRules: [
      {
        name: 'Head Pose Euler Angle Limits',
        formula: '|\\text{Yaw}| > 28^\\circ \\quad \\text{or} \\quad \\text{Pitch} > 22^\\circ \\; (\\Delta t \\ge 1.2\\text{s})',
        explanation: 'Lateral rotation beyond 28 degrees triggers head_turn_away. Upward pitch beyond 22 degrees sustained for 1.2 seconds flags looking above screen.'
      },
      {
        name: 'Lens Occlusion Photometric Check',
        formula: '\\mu = \\frac{1}{N}\\sum I(x,y) < 15 \\quad \\lor \\quad \\sigma^2 = \\frac{1}{N}\\sum (I(x,y) - \\mu)^2 < 10',
        explanation: 'Detects deliberate tape, sticky notes, or darkness covering the webcam within 1.2 seconds.'
      }
    ],
    architectureFit: 'Runs inside the Python daemon. Bypassed automatically when an exam is created in "Physical Lab Mode", avoiding missing webcam crashes on lab desktop towers.',
    inputs: ['Raw OpenCV VideoCapture frames (1280x720 @ 30fps)'],
    outputs: ['Violation triggers: head_turn_away, second_person_detected, no_face_detected, unauthorized_object, camera_occluded_or_dark', 'Annotated bounding box evidence image'],
    edgeCasesHandled: [
      'Natural blinking and brief desk glances: debounced so normal keyboard lookups do not cause false positives',
      'Variable lighting: adaptive histogram equalization prevents ambient shadow from triggering occlusion alarms',
      'CPU budget enforcement: limits inference threads to guarantee <35% overall system CPU usage'
    ],
    codeSnippet: {
      language: 'python',
      filename: 'ai-module/ai_monitor.py',
      code: `def check_lens_and_pose(frame, landmarks):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    mean_val, std_dev = cv2.meanStdDev(gray)
    if mean_val[0][0] < 15.0 or std_dev[0][0] < 3.0:
        return 'camera_occluded_or_dark', 3

    # Solve PnP for 3D Head Pose
    success, rot_vec, trans_vec = cv2.solvePnP(
        model_points_3d, landmarks_2d, camera_matrix, dist_coeffs
    )
    yaw, pitch, roll = rotation_vector_to_euler(rot_vec)
    if abs(yaw) > 28.0:
        return 'head_turn_away', 2
    if pitch > 22.0: # looking above monitor
        return 'head_tilt_upward', 2
    return None, 0`,
      explanation: 'Evaluates frame luminance variance for lens tampering and computes 3D head pose Euler angles.'
    }
  },
  {
    id: 'module-3-voice',
    number: 3,
    title: 'Two-Stage Acoustic Voice Pipeline & Speaker Verification',
    shortDesc: 'Lightweight WebRTC VAD gating (<1% CPU) coupled with Resemblyzer 256-d neural speaker verification against a 4s self-check reference.',
    category: 'AI Monitoring',
    purpose: 'Detects unauthorized third-party speech in the room while tolerating candidate self-speech (reading questions aloud or murmuring calculations) without CPU exhaustion.',
    howItWorks: 'Audio is sampled in 30ms frames at 16kHz mono. Stage 1 (WebRTC VAD) runs continuously at <0.5% CPU. If sustained speech is detected for >2.0 seconds, Stage 2 is triggered. Stage 2 passes the audio segment into Resemblyzer to extract a 256-dimensional neural voice embedding and computes the Cosine Similarity against the candidate reference embedding recorded during pre-exam self-check. If similarity is <0.75 across 2 consecutive segments, a second_voice_detected (Severity 3) violation is fired.',
    technicalImplementation: {
      language: 'Python 3.10 / C++ WebRTC bindings',
      libraries: ['webrtcvad-wheels', 'resemblyzer', 'sounddevice', 'numpy', 'scipy'],
      coreFiles: ['ai-module/voice_monitor.py', 'ai-module/server.py', 'renderer/selfCheck.js'],
      mechanisms: [
        'Stage 1: WebRTC VAD (Mode 2) processes 480 samples per 30ms frame with 2.0s sustained threshold',
        'Transient filter: isolates coughs, sneezes, keystrokes, and throat clearing without running neural inference',
        'Stage 2: Resemblyzer VoiceEncoder extracts 256-d normalized d-vector embedding',
        'Cosine Similarity comparison: candidate self-speech produces similarity >= 0.75 and resets mismatch counter to 0',
        'Debouncing: requires 2 consecutive mismatched segments to trigger second_voice_detected'
      ]
    },
    keyFormulasOrRules: [
      {
        name: 'Cosine Similarity Formulation',
        formula: '\\text{Sim}(\\mathbf{e}_{\\text{ref}}, \\mathbf{e}_{\\text{seg}}) = \\frac{\\mathbf{e}_{\\text{ref}} \\cdot \\mathbf{e}_{\\text{seg}}}{\\|\\mathbf{e}_{\\text{ref}}\\| \\|\\mathbf{e}_{\\text{seg}}\\|}',
        explanation: 'Measures vocal tract acoustic properties. Candidate talking aloud matches reference (>= 0.75). Third person in room yields < 0.75.'
      },
      {
        name: 'Gated Execution Architecture',
        formula: '\\text{Execute Stage 2} \\iff \\tau_{\\text{VAD}} \\ge 2.0\\text{s}',
        explanation: 'Keeps heavy neural speech encoding asleep 98% of the time, preserving CPU budget.'
      }
    ],
    architectureFit: 'Calibrated during Self-Check Step 3 where the student reads a 4-second prompt sentence. In physical lab mode, voice checks are automatically bypassed.',
    inputs: ['16kHz mono PCM microphone audio stream', 'Candidate 256-d reference voice embedding vector'],
    outputs: ['Violation trigger: second_voice_detected (Severity 3) with similarity_score and duration_seconds'],
    edgeCasesHandled: [
      'Student reading questions aloud: matches candidate embedding vector and triggers no alert',
      'Desk taps, pencil clicks, coughing: WebRTC VAD gates out non-sustained transients before neural model runs',
      'Microphone clipping: normalized to float32 range [-1.0, 1.0] before embedding extraction'
    ],
    codeSnippet: {
      language: 'python',
      filename: 'ai-module/voice_monitor.py',
      code: `def process_audio_buffer(self, audio_chunk):
    # Stage 1: WebRTC VAD Gate (<1% CPU)
    is_speech = self.vad.is_speech(audio_chunk, 16000)
    if is_speech:
        self.speech_frames += 1
    else:
        self.speech_frames = max(0, self.speech_frames - 1)

    # Check if sustained past 2.0 seconds (66 frames @ 30ms)
    if self.speech_frames >= 66:
        # Stage 2: Deep Speaker Verification
        segment_emb = self.encoder.embed_utterance(self.get_audio_window())
        sim = np.dot(self.ref_embedding, segment_emb) / (
            np.linalg.norm(self.ref_embedding) * np.linalg.norm(segment_emb)
        )
        if sim < 0.75:
            self.consecutive_mismatches += 1
            if self.consecutive_mismatches >= 2:
                self.emit_violation('second_voice_detected', severity=3, similarity=float(sim))
        else:
            self.consecutive_mismatches = 0
        self.speech_frames = 0`,
      explanation: 'Two-stage gating: cheap VAD passes audio to Resemblyzer only upon sustained speech (>2.0s), comparing cosine similarity.'
    }
  },
  {
    id: 'module-4-capture',
    number: 4,
    title: 'Evidence Capture, Dynamic Downsampling & DIP Architecture',
    shortDesc: 'High-speed desktop and webcam frame capture (<200KB JPEG) with microsecond collision prevention based on the Dependency Inversion Principle.',
    category: 'Candidate App',
    purpose: 'Captures indisputable visual evidence the moment any violation triggers, ensuring evidence payloads remain under 200KB for rapid network transport without exhausting local disk or bandwidth.',
    howItWorks: 'Applies the Dependency Inversion Principle (DIP): high-level violation dispatchers depend on the CaptureProvider abstraction. Concrete implementations MssCaptureProvider (captures desktop across multi-monitors via mss) and WebcamCaptureProvider (encodes webcam frame with violation bounding box) implement dynamic quality downsampling. If an image exceeds 200KB, it iteratively steps down JPEG quality (from 85% to 65% to 45%) to guarantee strict size limits. Timestamps include microsecond precision to prevent hash collisions.',
    technicalImplementation: {
      language: 'Python 3.10 / C',
      libraries: ['mss', 'Pillow (PIL)', 'OpenCV', 'abc (Abstract Base Classes)'],
      coreFiles: ['ai-module/services/capture/capture_provider.py', 'ai-module/services/capture/mss_provider.py'],
      mechanisms: [
        'DIP Base Class CaptureProvider with abstract method capture(session_id, violation_type)',
        'MssCaptureProvider multi-display bounding canvas stitcher',
        'Dynamic downsampling loop: while len(buffer) > 200KB, quality -= 10',
        'Microsecond timestamping (ISO 8601 YYYY-MM-DDTHH:MM:SS.ffffffZ)'
      ]
    },
    keyFormulasOrRules: [
      {
        name: 'Payload Ceiling Rule',
        formula: '\\text{Size}(\\text{Evidence JPEG}) \\le 200\\text{ KB}',
        explanation: 'Enforces sub-second transmission over variable student Wi-Fi connections.'
      },
      {
        name: 'DIP Abstraction Contract',
        formula: '\\text{ViolationReporter} \\longrightarrow \\text{CaptureProvider} \\longleftarrow \\text{Mss/WebcamProvider}',
        explanation: 'Monitors never bind to concrete screenshot libraries; capture engines can be mocked or swapped cleanly.'
      }
    ],
    architectureFit: 'Called directly by AIMonitor, WhitelistEnforcer, USBMonitor, and DisplayMonitor before dispatching to the local receiver.',
    inputs: ['Session ID string', 'Violation type enum', 'Active video frame / screen handle'],
    outputs: ['Local image path', 'Compressed base64 string or file buffer (<200KB)'],
    edgeCasesHandled: [
      'Multi-monitor configurations: captures the primary active screen or stitches virtual geometry without distortion',
      'Zero display crash: headless/virtual display fallback ensures no unhandled exceptions'
    ],
    codeSnippet: {
      language: 'python',
      filename: 'ai-module/services/capture/mss_provider.py',
      code: `class MssCaptureProvider(CaptureProvider):
    def capture(self, session_id: str, violation_type: str) -> str:
        timestamp_us = datetime.utcnow().strftime('%Y%m%dT%H%M%S_%fZ')
        filename = f"{session_id}_{violation_type}_{timestamp_us}.jpg"
        filepath = os.path.join(self.storage_dir, filename)

        with mss.mss() as sct:
            monitor = sct.monitors[1] # Primary monitor
            sct_img = sct.grab(monitor)
            img = Image.frombytes("RGB", sct_img.size, sct_img.bgra, "raw", "BGRX")

            quality = 85
            buffer = io.BytesIO()
            img.save(buffer, format="JPEG", quality=quality)
            while buffer.tell() > 200 * 1024 and quality > 30:
                buffer.seek(0)
                buffer.truncate()
                quality -= 15
                img.save(buffer, format="JPEG", quality=quality)

            with open(filepath, "wb") as f:
                f.write(buffer.getvalue())
        return filepath`,
      explanation: 'Concrete DIP provider that captures desktop, downsamples JPEG quality until under 200KB, and writes microsecond-tagged image.'
    }
  },
  {
    id: 'module-5-selfcheck',
    number: 5,
    title: 'Informed Consent, Identity & Dual-Mode Self-Check Flow',
    shortDesc: 'Section 10.4 Data Ethics compliance screen, institutional credential validation, and dual-mode staging area (Remote Online vs Physical Lab).',
    category: 'Candidate App',
    purpose: 'Establishes candidate trust through transparent privacy declarations, validates institutional student identity, and verifies hardware integrity before exam entry.',
    howItWorks: 'Step 1 displays consent.html detailing exact monitoring bounds (continuous video is NEVER saved or stored; in-memory frame analysis only; no biometric database created) requiring an explicit checkbox. Step 2 captures Full Name and Roll Number with institutional regex formatting and executes POST /sessions. Step 3 launches selfCheck.html: in Remote Online Mode it executes 6 automated checks (Webcam, Mic, 4s Voice Calibration, Whitelist, USB, Multi-Display). In Physical Lab Mode, camera and mic checks are automatically bypassed, enabling smooth deployment on desktop lab PCs lacking webcams.',
    technicalImplementation: {
      language: 'JavaScript / HTML5 / CSS3 / Electron IPC',
      libraries: ['Electron contextBridge', 'Web Audio API', 'MediaStream API'],
      coreFiles: ['renderer/consent.html', 'renderer/identity.html', 'renderer/selfCheck.html', 'renderer/selfCheck.js'],
      mechanisms: [
        'Mandatory consent checkbox enabling "Continue to Identification" button',
        'Roll number validation enforcing institutional format (e.g. FA20-BCS-042)',
        'Dual-Mode Exam Switch: reads exam.examType from backend (online vs physical_lab)',
        '4-second voice reference recorder capturing 16kHz audio buffer for Resemblyzer embedding',
        'Suppressed monitoring state: isExamActive = false prevents self-check credential typing from triggering false alarms'
      ]
    },
    keyFormulasOrRules: [
      {
        name: 'Dual-Mode Proctoring Matrix',
        formula: '\\text{LabMode} = \\{\\text{Whitelist, USB, Display, Clipboard}\\} \\quad \\text{vs} \\quad \\text{OnlineMode} = \\text{LabMode} \\cup \\{\\text{Webcam, Mic, Voice}\\}',
        explanation: 'Enables flexible exam administration across both remote unmonitored home setups and university computer labs.'
      }
    ],
    architectureFit: 'Pre-exam gate. Candidate cannot advance to examScreen.html until all checks return status: "passed". POST /sessions establishes initial state in MongoDB.',
    inputs: ['Candidate Full Name & Roll Number', 'Webcam & Microphone permissions', 'Exam code'],
    outputs: ['Database Session record (status: "active", consentGiven: true)', 'Reference selfie image', '256-d reference voice embedding vector'],
    edgeCasesHandled: [
      'Candidate declines consent: gracefully exits Electron application without spawning monitors',
      'Computer lab setup: physical_lab mode prevents blocking students when lab PCs have no webcams or audio inputs',
      'Duplicate session attempt: server returns 409 Conflict if roll number is already in an active session'
    ],
    codeSnippet: {
      language: 'javascript',
      filename: 'renderer/selfCheck.js',
      code: `async function runSelfCheckSequence(examType) {
    updateBadge("Initializing Self-Check", "neutral");
    
    // Check 1 & 2: Camera & Mic (bypassed if physical_lab)
    if (examType === 'physical_lab') {
        markStepBypassed('check-camera', 'Physical Lab Mode: Camera not required');
        markStepBypassed('check-mic', 'Physical Lab Mode: Mic not required');
    } else {
        await verifyCameraStream();
        await calibrateReferenceVoice(4.0); // 4-second calibration
    }
    
    // Checks 3, 4, 5: System integrity (Always Enforced)
    await verifyProcessWhitelist();
    await verifyNoUsbStorage();
    await verifySingleDisplay();
    
    document.getElementById('btn-begin-exam').disabled = false;
}`,
      explanation: 'Coordinates self-check steps, selectively bypassing camera/mic checks based on examiner-designated exam mode.'
    }
  },
  {
    id: 'module-6-decay-engine',
    number: 6,
    title: 'Dynamic Exponential Severity Decay & Risk Scoring Engine',
    shortDesc: 'Mathematical risk scoring algorithm with ~30-minute half-life (λ = 0.0231/min) balancing transient single mistakes against persistent cheating patterns.',
    category: 'Server & Database',
    purpose: 'Calculates an authentic, real-time risk score (0 to 100) for every student. Accidental single occurrences (e.g. quick glance away) decay smoothly over time, while repeated or severe infractions escalate into immediate examiner alert priority.',
    howItWorks: 'Implemented as DecayScoringStrategy under the ScoringStrategy interface. For each active session, the backend gathers all non-dismissed violations. Each violation contributes a base severity score (scaled by severity level 1-5) that decays exponentially according to elapsed time between the violation microsecond timestamp and the reference calculation time. The final score is bounded in [0, 100]. Preserves authentic original timestamps during network replay, preventing reconnection bursts from falsely spiking candidate risk scores.',
    technicalImplementation: {
      language: 'Node.js / TypeScript',
      libraries: ['Math (Native JS)', 'date-fns'],
      coreFiles: ['server/src/services/scoring/DecayScoringStrategy.js', 'server/src/scoring/severityEngine.js'],
      mechanisms: [
        'Exponential decay constant: lambda = 0.0231 per minute (~30-minute half-life)',
        'Dismissed violation filtering: examiner-dismissed false positives are excluded from score calculation',
        'Cumulative baseline term: retains a fraction of historical score so high-frequency violators cannot reset to zero',
        'Authentic timestamp adherence: uses event.original_timestamp rather than database insertion time'
      ]
    },
    keyFormulasOrRules: [
      {
        name: 'Exponential Risk Scoring Formula',
        formula: 'R(t) = \\min\\left(100, \\; \\sum_{i=1}^{N} w(v_i) \\cdot e^{-\\lambda (t - t_i)} + B_{\\text{cum}}\\right)',
        explanation: 'Where w(v_i) is severity weight (Severity 1: 5pts, 2: 12pts, 3: 25pts, 4: 45pts, 5: 75pts), lambda = 0.0231 min^-1, and B_cum is cumulative violation density.'
      },
      {
        name: 'Half-Life Derivation',
        formula: 't_{1/2} = \\frac{\\ln 2}{\\lambda} = \\frac{0.69315}{0.0231} \\approx 30.0\\text{ minutes}',
        explanation: 'Ensures a minor glance away at minute 5 does not unfairly compromise a student at minute 45.'
      }
    ],
    architectureFit: 'Exposed via GET /risk-score/:sessionId and recalculated on every violation insertion, streaming real-time score updates to the examiner dashboard via Socket.io.',
    inputs: ['Array of session Violation records (timestamp, severity, reviewed, decision)', 'Current timestamp t'],
    outputs: ['Risk score integer [0 - 100]', 'Risk category ("low" < 30, "moderate" 30-60, "high" > 60)'],
    edgeCasesHandled: [
      'Offline network reconnection: events replayed from SQLite/JSON buffer preserve true microsecond timestamps, preventing simultaneous cluster spikes',
      'Examiner dismissal: instantly recalculates and reduces risk score upon examiner clicking "Dismiss"',
      'Zero violation baseline: returns 0 with no division-by-zero or NaN states'
    ],
    codeSnippet: {
      language: 'javascript',
      filename: 'server/src/services/scoring/DecayScoringStrategy.js',
      code: `class DecayScoringStrategy extends ScoringStrategy {
    constructor(lambda = 0.0231) {
        super();
        this.lambda = lambda; // ~30 minute half-life
        this.weights = { 1: 5, 2: 12, 3: 25, 4: 45, 5: 75 };
    }

    calculateScore(violations, referenceTime = new Date()) {
        const activeViolations = violations.filter(v => v.decision !== 'dismissed');
        if (activeViolations.length === 0) return 0;

        let totalScore = 0;
        let cumulativeBase = 0;

        for (const v of activeViolations) {
            const ageMinutes = Math.max(0, (referenceTime - new Date(v.timestamp)) / 60000);
            const weight = this.weights[v.severity] || 10;
            totalScore += weight * Math.exp(-this.lambda * ageMinutes);
            cumulativeBase += weight * 0.15; // Retain 15% cumulative baseline
        }

        return Math.min(100, Math.round(totalScore + cumulativeBase));
    }
}`,
      explanation: 'Decays each non-dismissed violation exponentially while maintaining a cumulative baseline for repeat infractions.'
    }
  },
  {
    id: 'module-7-workspace',
    number: 7,
    title: 'Two-Panel Exam Workspace, Clipboard Lockdown & Upload Guard',
    shortDesc: 'Secure in-app PDF/DOCX paper viewer with anti-leak watermarking, OS clipboard flush, and pre-existing upload rejection.',
    category: 'Candidate App',
    purpose: 'Provides a secure, self-contained examination workspace preventing candidate copy-paste, screen leaks, or uploading pre-authored solution files.',
    howItWorks: 'The candidate desktop app renders a split-pane layout: Left Pane displays the official question paper (rendered internally via PDF.js/mammoth without opening external viewer software) stamped with a dynamic anti-leak watermark showing the candidate name and roll number. Right Pane provides an autosaving typed response editor plus an attachment uploader. On launch, it flushes the OS clipboard and hooks keyboard events to disable Copy, Cut, Paste, and Context Menu. The file uploader inspects file.lastModified; if the file timestamp predates exam start, upload is blocked.',
    technicalImplementation: {
      language: 'JavaScript / Electron Main & Preload',
      libraries: ['Electron clipboard module', 'PDF.js', 'mammoth.js', 'LocalForage'],
      coreFiles: ['candidate-app/renderer/examScreen.html', 'candidate-app/renderer/examScreen.js', 'candidate-app/electron/main.js'],
      mechanisms: [
        'OS Clipboard Flush: clipboard.clear() on startup, window focus, and copy shortcut attempts',
        'Input suppression: traps Ctrl+C, Ctrl+V, Ctrl+X, Shift+Insert, and right-click context menu',
        'Dynamic Canvas Watermark: overlays student name, roll number, and IP diagonally across question paper',
        'Pre-Existing File Upload Guard: rejects file if file.lastModified < examStartTime',
        'Local autosave: typed script saved to local storage every 500ms to survive sudden power interruptions'
      ]
    },
    keyFormulasOrRules: [
      {
        name: 'Upload Integrity Timestamp Rule',
        formula: '\\text{Reject Upload} \\iff t_{\\text{modified}} < t_{\\text{session.startTime}}',
        explanation: 'Ensures uploaded code files (.py, .cpp, .zip) or documents (.pdf) were authored during the active exam session.'
      }
    ],
    architectureFit: 'Electron renderer interface. Submissions post to POST /submissions with typed text, attachment metadata, and word/character count.',
    inputs: ['Exam question paper URL (from server)', 'Candidate keyboard and file upload inputs'],
    outputs: ['Exam submission payload (typed response + uploaded artifact metadata)', 'Clipboard violation alert'],
    edgeCasesHandled: [
      'Sudden power loss / system crash: answers continuously autosaved in local browser cache and restored on restart',
      'Large solution files: 15MB file upload ceiling with MIME-type whitelist (.pdf, .docx, .zip, .cpp, .py, .java)',
      'Multiple displays: blocked from dragging exam window across multiple monitors'
    ],
    codeSnippet: {
      language: 'javascript',
      filename: 'candidate-app/renderer/examScreen.js',
      code: `// Enforce OS Clipboard Lockdown
window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        window.api.clearClipboard();
        showNotification("Clipboard shortcuts are strictly disabled during exams.");
    }
});

// Guard against pre-existing document uploads
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.lastModified < examStartTime) {
        e.target.value = '';
        alert("Integrity Guard: This file was modified before the exam started. Only in-exam work is accepted.");
    }
});`,
      explanation: 'Disables copy/paste shortcuts and rejects upload of solution files modified prior to exam start.'
    }
  },
  {
    id: 'module-8-examiner-dashboard',
    number: 8,
    title: 'Examiner Command Center, Priority Queue & 2-Minute Alert Grouping',
    shortDesc: 'React & Material Design proctoring dashboard with cross-student severity ranking, live Socket.io feed, and 2-minute repeated alert collapsing.',
    category: 'Examiner Dashboard',
    purpose: 'Empowers human examiners to supervise dozens of simultaneous candidates, immediately spotlighting high-risk infractions while eliminating cognitive overload from repeated micro-alerts.',
    howItWorks: 'Built with React, Vite, and Tailwind/Material design. Connects to backend via REST API and Socket.io. Features the Cross-Student Priority Queue (GET /violations/priority-queue) which sorts unreviewed violations strictly by severity: -1, timestamp: -1. Implements Client-Side 2-Minute Alert Grouping: consecutive same-student, same-type violations (e.g. 3 head turns in 45s) collapse into a single row ("3× Head Turned Away") without modifying the underlying microsecond database audit trail. Examiners can review evidence, click Confirm/Dismiss, and add notes.',
    technicalImplementation: {
      language: 'React 19 / TypeScript / Vite',
      libraries: ['Socket.io-client', 'Lucide React', 'Axios', 'Tailwind CSS'],
      coreFiles: ['dashboard/src/components/PriorityQueue.jsx', 'dashboard/src/components/AlertFeed.jsx', 'dashboard/src/components/EvidenceViewer.jsx'],
      mechanisms: [
        'Severity-First Priority Queue: Severity 4-5 infractions instantly float to the top across all candidates',
        'Client-side 2-minute sliding window alert grouping (preserves discrete evidence timestamps in DB)',
        'In-memory JWT access token with Axios 401 retry interceptor and httpOnly cookie refresh rotation',
        'Multi-tenant examiner data isolation: examiners only see their own exams (createdBy), admins have global view',
        'Segmented 3-way review suite: Final Submission, Evidence Timeline, and Camera/Identity'
      ]
    },
    keyFormulasOrRules: [
      {
        name: 'Priority Queue Sorting Rule',
        formula: '\\text{Triage Order}: \\text{severity} \\; \\mathbf{DESC}, \\quad \\text{timestamp} \\; \\mathbf{DESC}',
        explanation: 'Ensures severe cheating (cell phone, second person) demands examiner attention before minor head adjustments.'
      },
      {
        name: 'Client-Side Grouping Window',
        formula: '\\Delta t = |t_{k} - t_{k-1}| \\le 120\\text{ s} \\quad \\land \\quad \\text{type}_k = \\text{type}_{k-1} \\implies \\text{Collapse}',
        explanation: 'Reduces visual clutter by up to 68% while preserving full evidentiary links upon expansion.'
      }
    ],
    architectureFit: 'Central human-in-the-loop decision center. Actions trigger PATCH /violations/:id/review which broadcasts violationReviewed events to all connected examiner clients.',
    inputs: ['Real-time Socket.io violation events', 'Candidate session roster', 'Evidence image URLs'],
    outputs: ['Examiner review decision (confirmed / dismissed)', 'Real-time broadcast announcements', 'Exportable CSV/PDF audit summary'],
    edgeCasesHandled: [
      'Token expiration during active proctoring: silent in-memory refresh automatically fetches new access token without page refresh',
      'Examiner network flicker: auto-reconnects Socket.io and fetches delta from /violations/priority-queue',
      'Multiple examiners reviewing simultaneously: synchronized review badges prevent redundant effort'
    ],
    codeSnippet: {
      language: 'javascript',
      filename: 'dashboard/src/components/PriorityQueue.jsx',
      code: `// Client-Side 2-Minute Sliding Window Grouping
export function groupViolationsList(violations) {
    const grouped = [];
    for (const v of violations) {
        const lastGroup = grouped[grouped.length - 1];
        if (
            lastGroup &&
            lastGroup.type === v.type &&
            lastGroup.sessionId === v.sessionId &&
            Math.abs(new Date(lastGroup.timestamp) - new Date(v.timestamp)) <= 120000
        ) {
            lastGroup.count += 1;
            lastGroup.instances.push(v);
        } else {
            grouped.push({ ...v, count: 1, instances: [v] });
        }
    }
    return grouped;
}`,
      explanation: 'Groups consecutive same-type alerts within 2 minutes for clean presentation while keeping all raw instances accessible.'
    }
  },
  {
    id: 'module-9-offline-buffer',
    number: 9,
    title: 'Disk-Backed Offline Violation Buffer & Network Replay',
    shortDesc: 'Crash-proof atomic FIFO queue under Electron userData preserving original microsecond timestamps during Wi-Fi drops.',
    category: 'Security & Transport',
    purpose: 'Guarantees zero evidence loss during transient campus Wi-Fi outages, network drops, or server restarts, replaying events in strict chronological order once connectivity resumes.',
    howItWorks: 'Implemented in the Electron IPC layer (violationForwarder.js). Detection monitors remain decoupled from network state; they simply dispatch events to the local receiver. The forwarder attempts HTTP transmission to the central server. If the request fails, the event is immediately appended to an atomic JSON queue file under Electron userData (with SQLite fallback outside Electron). A background retry loop queries the buffer with FIFO ordering (ORDER BY id ASC), preserving the authentic original microsecond timestamp t_violation so exponential decay scoring reflects real time.',
    technicalImplementation: {
      language: 'JavaScript / Node.js (Electron Main)',
      libraries: ['fs/promises', 'path', 'better-sqlite3 / sqlite3 (fallback)', 'axios'],
      coreFiles: ['candidate-app/electron/ipc/violationBuffer.js', 'candidate-app/electron/ipc/violationForwarder.js'],
      mechanisms: [
        'Atomic JSON write: writes to temporary file and renames to prevent partial write corruption',
        'Decoupled architecture: monitors have zero awareness of network failure; buffering is handled by the forwarder',
        'Strict FIFO replay loop with exponential backoff (2s, 4s, 8s, max 30s)',
        'Authentic timestamp preservation: sends original_timestamp so server calculates authentic decay'
      ]
    },
    keyFormulasOrRules: [
      {
        name: 'Exponential Decay Integrity Preservation',
        formula: 'S(t_{\\text{reconnect}}) = S_0 \\cdot e^{-\\lambda (t_{\\text{reconnect}} - t_{\\text{violation}})} \\neq S_0 \\cdot e^{0}',
        explanation: 'Preserving t_violation ensures 3 violations during a 5-minute outage decay accurately rather than falsely spiking simultaneously upon reconnect.'
      }
    ],
    architectureFit: 'Sits between candidate AI detection monitors and the central Express backend, providing an unbreakable transport resilience bridge.',
    inputs: ['Failed HTTP POST payloads', 'Evidence file paths', 'Microsecond timestamp string'],
    outputs: ['Replayed HTTP requests upon network restoration', 'Buffer clearance signals'],
    edgeCasesHandled: [
      'Sudden OS crash or battery shutdown: atomic file state prevents database corruption on reboot',
      'Corrupted JSON entries: invalid entries are quarantined to .corrupt file to prevent blocking the FIFO queue',
      'Retry storm prevention: uses jittered exponential backoff to avoid overloading the server on bulk reconnections'
    ],
    codeSnippet: {
      language: 'javascript',
      filename: 'candidate-app/electron/ipc/violationBuffer.js',
      code: `async function queueViolation(payload) {
    const entry = {
        id: crypto.randomUUID(),
        payload,
        original_timestamp: payload.timestamp || new Date().toISOString(),
        queued_at: new Date().toISOString(),
        attempts: 0
    };
    
    // Atomic Write via temp file rename
    const queue = await loadQueue();
    queue.push(entry);
    const tempPath = queuePath + '.tmp';
    await fs.writeFile(tempPath, JSON.stringify(queue, null, 2));
    await fs.rename(tempPath, queuePath);
}

async function replayQueue() {
    const queue = await loadQueue();
    while (queue.length > 0) {
        const item = queue[0];
        try {
            await axios.post('/violation', item.payload);
            queue.shift(); // Remove from FIFO queue
            await saveQueue(queue);
        } catch (err) {
            break; // Network still down; retry later
        }
    }
}`,
      explanation: 'Appends failed violations atomically to disk and replays them chronologically upon reconnection.'
    }
  },
  {
    id: 'module-10-chat',
    number: 10,
    title: 'In-Exam Real-Time Chat & Broadcast Communications',
    shortDesc: 'Isolated bidirectional communication channels for candidate paper inquiries and urgent proctor announcements.',
    category: 'Candidate App',
    purpose: 'Enables candidates to request paper clarifications and allows examiners to broadcast emergency announcements (e.g., typo corrections, time extensions) with zero cross-exam chat leakage.',
    howItWorks: 'Built on Socket.io and MongoDB messages collection. Candidates have a 1-on-1 private channel linked to their active session ID. Examiners can reply directly or dispatch an exam-wide announcement (isBroadcast: true). Incoming messages appear non-intrusively in the candidate workspace header and in the examiner LiveExamChat sub-tab, auto-enriched with candidate Full Name and Roll Number.',
    technicalImplementation: {
      language: 'Node.js / React / Socket.io',
      libraries: ['Socket.io', 'Express', 'React Hooks'],
      coreFiles: ['server/src/routes/messages.js', 'dashboard/src/components/LiveExamChat.jsx', 'candidate-app/renderer/examScreen.js'],
      mechanisms: [
        'Dedicated rooms: socket.join(`exam_${examId}`) and socket.join(`session_${sessionId}`)',
        'Identity enrichment: server automatically stamps studentName and rollNumber onto incoming student messages',
        'Exam-scoped broadcast channel preventing communication across different course exams',
        'Read status tracking: marks messages as read when examiner opens candidate channel'
      ]
    },
    keyFormulasOrRules: [
      {
        name: 'Channel Scoping Rule',
        formula: '\\text{Access} = (\\text{candidate} \\cap \\text{session}_i) \\quad \\lor \\quad (\\text{proctor} \\cap \\text{exam}_k)',
        explanation: 'Prevents students from messaging other candidates or seeing other candidates queries.'
      }
    ],
    architectureFit: 'Runs on the WebSocket connection between candidate Electron app, Express server, and React dashboard.',
    inputs: ['Candidate message text', 'Proctor announcement text', 'Session and Exam IDs'],
    outputs: ['Real-time chat bubble notification', 'Persisted message audit record in MongoDB'],
    edgeCasesHandled: [
      'Proctor offline: messages persist in database with unread count badge, ready when proctor logs in',
      'Network reconnect: fetches missed messages using timestamp pagination'
    ],
    codeSnippet: {
      language: 'javascript',
      filename: 'server/src/routes/messages.js',
      code: `router.post('/messages', async (req, res) => {
    const { sessionId, examId, sender, text, isBroadcast } = req.body;
    let senderName = req.body.senderName;
    let rollNumber = req.body.rollNumber;

    if (sender === 'candidate') {
        const session = await Session.findOne({ sessionId });
        if (session) {
            senderName = session.studentName;
            rollNumber = session.rollNumber;
        }
    }

    const message = await Message.create({
        sessionId, examId, sender, senderName, rollNumber, text, isBroadcast
    });

    if (isBroadcast) {
        io.to(\`exam_\${examId}\`).emit('examAnnouncement', message);
    } else {
        io.to(\`session_\${sessionId}\`).emit('chatMessage', message);
    }
    res.json(message);
});`,
      explanation: 'Handles incoming message, enriches candidate identity, and broadcasts via targeted Socket.io rooms.'
    }
  },
  {
    id: 'module-11-lifecycle',
    number: 11,
    title: 'Exam Lifecycle, Waiting Lobby Protocol & Auto-Expiry Transition',
    shortDesc: 'Automated exam state machine: Question Paper Waiting Lobby (HTTP 423 Locked) and automated background duration expiry.',
    category: 'Server & Database',
    purpose: 'Synchronizes exam start times across all candidates and automatically concludes exams when the duration expires without requiring manual examiner clicks.',
    howItWorks: 'Question papers uploaded by instructors are initially locked. When candidates log in prior to start, GET /exam/:examId/paper returns HTTP 423 Locked, displaying a countdown Waiting Lobby. When the instructor clicks "Release Paper", the server atomically sets status: "active", records activatedAt, unlocks the paper, and emits paperReleased via WebSockets. A background cron worker periodically compares activatedAt + durationMinutes against current time. When elapsed, the exam is marked "completed", and all associated candidate sessions transition to "completed".',
    technicalImplementation: {
      language: 'Node.js / Express / MongoDB',
      libraries: ['node-cron', 'Socket.io', 'Express router'],
      coreFiles: ['server/src/routes/exams.js', 'server/src/routes/examPaper.js', 'candidate-app/renderer/examScreen.js'],
      mechanisms: [
        'HTTP 423 Locked protocol for paper waiting lobby standby',
        'Atomic batch release setting shared exam clock across all candidates',
        'Background lifecycle reaper running every 60s checking exam duration expiry',
        'Automated session transition: flags active sessions as "completed" and disables answers'
      ]
    },
    keyFormulasOrRules: [
      {
        name: 'Auto-Expiry Condition',
        formula: '\\text{Status} \\to \\text{"completed"} \\iff t_{\\text{current}} \\ge t_{\\text{activated}} + D_{\\text{minutes}} \\cdot 60\\text{s}',
        explanation: 'Guarantees strict equal testing time for all candidates without proctor manual timing.'
      }
    ],
    architectureFit: 'Core server coordination logic driving exam state transitions and candidate workspace permissions.',
    inputs: ['Exam activation trigger', 'Duration in minutes', 'Periodic system clock tick'],
    outputs: ['HTTP 423 / 200 paper responses', 'paperReleased broadcast event', 'Historical exam archive record'],
    edgeCasesHandled: [
      'Proctor grants 5m / 10m extension: updates durationMinutes in database, extending the auto-expiry deadline dynamically',
      'Candidate enters late: receives remaining duration calculated from shared activatedAt timestamp'
    ],
    codeSnippet: {
      language: 'javascript',
      filename: 'server/src/routes/exams.js',
      code: `// Background Lifecycle Reaper
setInterval(async () => {
    const activeExams = await Exam.find({ status: 'active' });
    const now = new Date();
    
    for (const exam of activeExams) {
        if (!exam.activatedAt) continue;
        const expiryTime = new Date(exam.activatedAt.getTime() + exam.durationMinutes * 60000);
        if (now >= expiryTime) {
            exam.status = 'completed';
            await exam.save();
            
            // Conclude all active candidate sessions
            await Session.updateMany(
                { examId: exam.examCode, status: 'active' },
                { status: 'completed', endTime: now }
            );
            io.to(\`exam_\${exam.examCode}\`).emit('examConcluded', { examCode: exam.examCode });
        }
    }
}, 30000);`,
      explanation: 'Background timer automatically transitions expired exams and candidate sessions to completed.'
    }
  },
  {
    id: 'module-12-backend-indexes',
    number: 12,
    title: 'High-Concurrency MongoDB Architecture & Benchmark Results',
    shortDesc: 'Document data modeling, compound B-Tree indexes, and 40-candidate benchmark achieving 30.4% P99 write latency reduction and 74.8% peak read latency cut.',
    category: 'Server & Database',
    purpose: 'Ensures the backend effortlessly absorbs high-frequency telemetry from dozens of concurrent candidate clients while maintaining sub-second query response times for proctors.',
    howItWorks: 'Uses Node.js + Express and MongoDB (with Mongoose schema validation and connection pooling). Critical high-frequency queries are backed by compound B-Tree indexes: sessionId_1_timestamp_-1 on (sessionId, timestamp DESC) for timeline lookups, reviewed_1 on (reviewed) for priority queues, and examId_1_status_1 on (examId, status). A load-testing simulation with 40 simultaneous candidates executing writes and dashboard reads demonstrated an 11.1% throughput gain, 30.4% P99 write latency cut, and 74.8% peak read latency cut.',
    technicalImplementation: {
      language: 'JavaScript / Node.js / Mongoose / MongoDB',
      libraries: ['mongoose', 'mongodb', 'bcrypt', 'helmet', 'express-rate-limit', 'cloudinary'],
      coreFiles: ['server/src/models/Violation.js', 'server/src/routes/violations.js', 'server/src/services/riskEngine.js'],
      mechanisms: [
        'Compound B-Tree indexes eliminating full collection scans (COLLSCAN -> IXSCAN)',
        'Dual-token authentication: in-memory 15m JWT + httpOnly 14d refresh token with SHA-256 rotation',
        '5-attempt failed login lockout (15 minutes) with constant-time bcrypt verification',
        'Connection pooling with mongoose.connect to handle burst writes under concurrent violation uploads'
      ]
    },
    keyFormulasOrRules: [
      {
        name: 'Benchmark Latency Optimization Results',
        formula: '\\text{P99 Write}: 771\\text{ms} \\to 536\\text{ms} (-30.4\\%), \\quad \\text{Max Read}: 1230\\text{ms} \\to 310\\text{ms} (-74.8\\%)',
        explanation: 'Validated with 40 concurrent candidates under simulated exam conditions.'
      }
    ],
    architectureFit: 'The backbone of the entire proctoring system, supporting candidate telemetry ingestion, examiner reviews, and security audits.',
    inputs: ['Candidate violation telemetry', 'Session status updates', 'Examiner triage queries'],
    outputs: ['JSON responses', 'Sub-millisecond index scan query plans', 'Security audit trails'],
    edgeCasesHandled: [
      'Connection exhaustion: pool queues incoming queries with 5000ms timeout rather than dropping sockets',
      'Concurrent duplicate logins: brute-force rate limiters restrict /auth/login to 10 attempts per 15m'
    ],
    codeSnippet: {
      language: 'javascript',
      filename: 'server/src/models/Violation.js',
      code: `const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
    sessionId: { type: String, required: true },
    type: { type: String, required: true },
    severity: { type: Number, required: true, min: 1, max: 5 },
    timestamp: { type: Date, required: true },
    details: { type: Object, default: {} },
    screenshotPath: { type: String },
    audioPath: { type: String },
    reviewed: { type: Boolean, default: false },
    decision: { type: String, enum: ["pending", "confirmed", "dismissed"], default: "pending" },
    reviewNote: { type: String, default: "" }
}, { timestamps: true });

// High-Concurrency Compound Indexes
violationSchema.index({ sessionId: 1, timestamp: -1 });
violationSchema.index({ reviewed: 1 });
violationSchema.index({ sessionId: 1, reviewed: 1 });

module.exports = mongoose.model('Violation', violationSchema);`,
      explanation: 'Optimized Mongoose schema with targeted compound and single-field indexes for sub-millisecond triage queries.'
    }
  }
];
