import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';
import { Rotate3d, Play, Pause, Activity, Eye, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ProctoringVisualizer3DProps {
  onPoseChange?: (yaw: number, pitch: number, roll: number) => void;
}

export const ProctoringVisualizer3D: React.FC<ProctoringVisualizer3DProps> = ({ onPoseChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const [yaw, setYaw] = useState<number>(0);
  const [pitch, setPitch] = useState<number>(0);
  const [roll, setRoll] = useState<number>(0);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>('Normal Gaze · Within Permitted Field of View');
  const [statusColor, setStatusColor] = useState<'normal' | 'yaw-alert' | 'pitch-alert'>('normal');

  // Three.js internal refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const headGroupRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Sync state with status
  useEffect(() => {
    if (Math.abs(yaw) > 28) {
      setStatusMessage(`Violation: Lateral Head Turn (${yaw > 0 ? '+' : ''}${yaw}° > 28° Limit)`);
      setStatusColor('yaw-alert');
    } else if (pitch > 22) {
      setStatusMessage(`Violation: Head Tilt Upward (${pitch > 0 ? '+' : ''}${pitch}° > 22° Limit)`);
      setStatusColor('pitch-alert');
    } else {
      setStatusMessage('Normal Gaze · Within Permitted Field of View');
      setStatusColor('normal');
    }

    if (onPoseChange) {
      onPoseChange(yaw, pitch, roll);
    }
  }, [yaw, pitch, roll, onPoseChange]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 340;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);

    // 2. Renderer with transparent background for glass effect
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Clear previous children
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(theme === 'dark' ? 0x60a5fa : 0x2563eb, 3, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // 4. Head Model Group (FaceMesh representation)
    const headGroup = new THREE.Group();
    headGroupRef.current = headGroup;

    // Outer Head Icosahedron (FaceMesh outer cage)
    const headGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: theme === 'dark' ? 0x3b82f6 : 0x2563eb,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    const headMesh = new THREE.Mesh(headGeo, wireframeMat);
    headGroup.add(headMesh);

    // Face Landmark Point Cloud (MediaPipe 468 landmark simulation)
    const pointsCount = 180;
    const pointsGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(pointsCount * 3);

    for (let i = 0; i < pointsCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.62;

      // Concentrate points towards the front (+Z) face region
      const z = Math.abs(r * Math.cos(phi)) * 0.9 + 0.3;
      const x = r * Math.sin(phi) * Math.sin(theta) * 0.85;
      const y = r * Math.sin(phi) * Math.cos(theta) * 1.0;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pointsMat = new THREE.PointsMaterial({
      color: theme === 'dark' ? 0x38bdf8 : 0x0284c7,
      size: 0.08,
      transparent: true,
      opacity: 0.85
    });
    const pointsMesh = new THREE.Points(pointsGeo, pointsMat);
    headGroup.add(pointsMesh);

    // Eyes landmarks
    const eyeGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.55, 0.25, 1.4);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.55, 0.25, 1.4);
    headGroup.add(leftEye);
    headGroup.add(rightEye);

    // Nose bridge pointer & Forward directional ray
    const noseGeo = new THREE.ConeGeometry(0.12, 0.6, 16);
    noseGeo.rotateX(Math.PI / 2);
    const noseMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, 0, 1.65);
    headGroup.add(nose);

    // Gaze Direction Ray Arrow
    const dir = new THREE.Vector3(0, 0, 1);
    const origin = new THREE.Vector3(0, 0, 1.6);
    const arrowHelper = new THREE.ArrowHelper(dir, origin, 2.0, 0x10b981, 0.3, 0.2);
    headGroup.add(arrowHelper);

    scene.add(headGroup);

    // 5. Surrounding Virtual Exam Camera Frustum (Sensor Cone)
    const frustumGeo = new THREE.ConeGeometry(3.5, 5, 4, 1, true);
    frustumGeo.rotateX(-Math.PI / 2);
    const frustumMat = new THREE.MeshBasicMaterial({
      color: theme === 'dark' ? 0x64748b : 0x94a3b8,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const frustumMesh = new THREE.Mesh(frustumGeo, frustumMat);
    frustumMesh.position.set(0, 0, 4.5);
    scene.add(frustumMesh);

    // 6. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (headGroupRef.current) {
        if (isAutoRotating) {
          const t = clock.getElapsedTime();
          // Simulate realistic proctoring head movements
          const autoYaw = Math.sin(t * 0.8) * 35; // Swings into alert zone
          const autoPitch = Math.sin(t * 0.5) * 20;

          headGroupRef.current.rotation.y = THREE.MathUtils.degToRad(-autoYaw);
          headGroupRef.current.rotation.x = THREE.MathUtils.degToRad(autoPitch);

          setYaw(Math.round(autoYaw));
          setPitch(Math.round(autoPitch));
        } else {
          headGroupRef.current.rotation.y = THREE.MathUtils.degToRad(-yaw);
          headGroupRef.current.rotation.x = THREE.MathUtils.degToRad(pitch);
          headGroupRef.current.rotation.z = THREE.MathUtils.degToRad(roll);
        }

        // Dynamically adjust arrow and wireframe color based on violation
        const currentYaw = isAutoRotating ? THREE.MathUtils.radToDeg(-headGroupRef.current.rotation.y) : yaw;
        const currentPitch = isAutoRotating ? THREE.MathUtils.radToDeg(headGroupRef.current.rotation.x) : pitch;

        if (Math.abs(currentYaw) > 28) {
          wireframeMat.color.setHex(0xef4444);
          arrowHelper.setColor(new THREE.Color(0xef4444));
        } else if (currentPitch > 22) {
          wireframeMat.color.setHex(0xa855f7);
          arrowHelper.setColor(new THREE.Color(0xa855f7));
        } else {
          wireframeMat.color.setHex(theme === 'dark' ? 0x3b82f6 : 0x2563eb);
          arrowHelper.setColor(new THREE.Color(0x10b981));
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize Observer
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      headGeo.dispose();
      wireframeMat.dispose();
      pointsGeo.dispose();
      pointsMat.dispose();
    };
  }, [theme, isAutoRotating]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl shadow-xl p-6 transition-all duration-300">
      {/* Top Bar inside Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200/60 dark:border-neutral-800/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Rotate3d className="w-4 h-4 text-blue-500 animate-spin-slow" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              3D Spatial Pose & Landmark Mesh (Three.js Simulation)
            </h3>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Real-time visualizer of MediaPipe 468-point 3D landmark mesh and solvePnP Euler angles.
          </p>
        </div>

        {/* Auto Rotation Toggle Button */}
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 transition-colors self-start sm:self-auto"
        >
          {isAutoRotating ? <Pause className="w-3.5 h-3.5 text-blue-500" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
          <span>{isAutoRotating ? 'Pause Auto Motion' : 'Auto Play Simulation'}</span>
        </button>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative w-full h-[340px] flex items-center justify-center">
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Floating Glass Telemetry HUD */}
        <div className="absolute top-4 left-4 p-3 rounded-xl bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border border-white/30 dark:border-neutral-800/80 shadow-md space-y-1 font-mono text-[11px] pointer-events-none">
          <div className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
            Euler Angles (Deg)
          </div>
          <div className="flex items-center gap-3">
            <span className={Math.abs(yaw) > 28 ? 'text-red-500 font-bold' : 'text-neutral-700 dark:text-neutral-300'}>
              Yaw: {yaw > 0 ? `+${yaw}` : yaw}°
            </span>
            <span className={pitch > 22 ? 'text-purple-500 font-bold' : 'text-neutral-700 dark:text-neutral-300'}>
              Pitch: {pitch > 0 ? `+${pitch}` : pitch}°
            </span>
            <span className="text-neutral-400">
              Roll: {roll}°
            </span>
          </div>
        </div>

        {/* Live Threshold Status Banner */}
        <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl backdrop-blur-md border shadow-md flex items-center justify-between text-xs transition-colors duration-200"
          style={{
            backgroundColor: statusColor === 'yaw-alert' 
              ? 'rgba(239, 68, 68, 0.15)' 
              : statusColor === 'pitch-alert' 
              ? 'rgba(168, 85, 247, 0.15)' 
              : 'rgba(16, 185, 129, 0.15)',
            borderColor: statusColor === 'yaw-alert' 
              ? 'rgba(239, 68, 68, 0.4)' 
              : statusColor === 'pitch-alert' 
              ? 'rgba(168, 85, 247, 0.4)' 
              : 'rgba(16, 185, 129, 0.4)'
          }}
        >
          <div className="flex items-center gap-2 font-medium">
            {statusColor === 'normal' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
            )}
            <span className={statusColor === 'yaw-alert' ? 'text-red-600 dark:text-red-400 font-bold' : statusColor === 'pitch-alert' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-emerald-700 dark:text-emerald-400'}>
              {statusMessage}
            </span>
          </div>
          <span className="font-mono text-[11px] text-neutral-500 hidden sm:inline">
            Limits: |Yaw| ≤ 28°, Pitch ≤ 22°
          </span>
        </div>
      </div>

      {/* Manual Slider Controls (Enabled when Auto Rotation paused) */}
      {!isAutoRotating && (
        <div className="pt-4 border-t border-neutral-200/60 dark:border-neutral-800/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs animate-in fade-in duration-200">
          <div className="space-y-1.5">
            <div className="flex justify-between font-mono">
              <span className="text-neutral-500">Manual Yaw (Lateral Turn):</span>
              <span className={Math.abs(yaw) > 28 ? 'text-red-500 font-bold' : 'text-neutral-800 dark:text-neutral-200'}>
                {yaw}°
              </span>
            </div>
            <input
              type="range"
              min="-45"
              max="45"
              value={yaw}
              onChange={(e) => setYaw(Number(e.target.value))}
              className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-mono">
              <span className="text-neutral-500">Manual Pitch (Up/Down):</span>
              <span className={pitch > 22 ? 'text-purple-500 font-bold' : 'text-neutral-800 dark:text-neutral-200'}>
                {pitch}°
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="40"
              value={pitch}
              onChange={(e) => setPitch(Number(e.target.value))}
              className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      )}
    </div>
  );
};
