'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Square,
  Maximize2,
  Crosshair,
  Camera as CameraIcon,
  Grid3x3,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  CAMERA_PRESETS,
  DEFAULT_CAMERA_CONFIG,
  DEFAULT_CONTROLS_CONFIG,
  calculateFrameAll,
  getCameraInfo,
  detectPreset,
  easeInOutCubic,
  type CameraPreset,
  type CameraInfo,
} from '@/lib/nexus3d-camera';
import { toast } from 'sonner';

function CameraController({
  targetPreset,
  frameAllTrigger,
  onCameraUpdate,
}: {
  targetPreset: { preset: CameraPreset; timestamp: number } | null;
  frameAllTrigger: number;
  onCameraUpdate: (info: CameraInfo) => void;
}) {
  const { camera, scene } = useThree();
  const controlsRef = useRef<any>(null);
  const animatingRef = useRef(false);
  const animStartRef = useRef(0);
  const startPosRef = useRef(new THREE.Vector3());
  const endPosRef = useRef(new THREE.Vector3());
  const startTargetRef = useRef(new THREE.Vector3());
  const endTargetRef = useRef(new THREE.Vector3());
  const targetRef = useRef(new THREE.Vector3(0, 0.5, 0));

  useEffect(() => {
    if (!targetPreset || !controlsRef.current) return;
    const preset = CAMERA_PRESETS[targetPreset.preset];
    startPosRef.current.copy(camera.position);
    endPosRef.current.set(...preset.position);
    startTargetRef.current.copy(targetRef.current);
    endTargetRef.current.set(...preset.target);
    animStartRef.current = performance.now();
    animatingRef.current = true;
  }, [targetPreset, camera]);

  useEffect(() => {
    if (frameAllTrigger === 0 || !controlsRef.current) return;
    const objects = scene.children.filter((c) => c.type === 'Mesh' || c.type === 'Group');
    if (objects.length === 0) return;
    const result = calculateFrameAll(objects, camera as THREE.PerspectiveCamera);
    startPosRef.current.copy(camera.position);
    endPosRef.current.copy(result.position);
    startTargetRef.current.copy(targetRef.current);
    endTargetRef.current.copy(result.target);
    animStartRef.current = performance.now();
    animatingRef.current = true;
    toast.success('Tum nesneler cercevelendi');
  }, [frameAllTrigger, camera, scene]);

  useFrame(() => {
    if (animatingRef.current && controlsRef.current) {
      const elapsed = performance.now() - animStartRef.current;
      const duration = 800;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(t);
      camera.position.lerpVectors(startPosRef.current, endPosRef.current, eased);
      targetRef.current.lerpVectors(startTargetRef.current, endTargetRef.current, eased);
      controlsRef.current.target.copy(targetRef.current);
      controlsRef.current.update();
      if (t >= 1) animatingRef.current = false;
    }
    if (controlsRef.current) {
      const info = getCameraInfo(
        camera as THREE.PerspectiveCamera,
        controlsRef.current.target,
        'orbit',
        detectPreset(camera as THREE.PerspectiveCamera, controlsRef.current.target)
      );
      onCameraUpdate(info);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={DEFAULT_CONTROLS_CONFIG.enableDamping}
      dampingFactor={DEFAULT_CONTROLS_CONFIG.dampingFactor}
      rotateSpeed={DEFAULT_CONTROLS_CONFIG.rotateSpeed}
      panSpeed={DEFAULT_CONTROLS_CONFIG.panSpeed}
      zoomSpeed={DEFAULT_CONTROLS_CONFIG.zoomSpeed}
      minDistance={DEFAULT_CONTROLS_CONFIG.minDistance}
      maxDistance={DEFAULT_CONTROLS_CONFIG.maxDistance}
      minPolarAngle={DEFAULT_CONTROLS_CONFIG.minPolarAngle}
      maxPolarAngle={DEFAULT_CONTROLS_CONFIG.maxPolarAngle}
      enablePan={DEFAULT_CONTROLS_CONFIG.enablePan}
      enableRotate={DEFAULT_CONTROLS_CONFIG.enableRotate}
      enableZoom={DEFAULT_CONTROLS_CONFIG.enableZoom}
      screenSpacePanning={DEFAULT_CONTROLS_CONFIG.screenSpacePanning}
      makeDefault
    />
  );
}

export function NexusViewport() {
  const [targetPreset, setTargetPreset] = useState<{ preset: CameraPreset; timestamp: number } | null>(null);
  const [frameAllTrigger, setFrameAllTrigger] = useState(0);
  const [cameraInfo, setCameraInfo] = useState<CameraInfo | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showAxes, setShowAxes] = useState(true);

  const handlePreset = useCallback((preset: CameraPreset) => {
    setTargetPreset({ preset, timestamp: Date.now() });
  }, []);

  const handleFrameAll = useCallback(() => setFrameAllTrigger((p) => p + 1), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
      switch (e.key) {
        case '1': handlePreset('perspective'); break;
        case '2': handlePreset('front'); break;
        case '3': handlePreset('right'); break;
        case '4': handlePreset('top'); break;
        case '5': handlePreset('back'); break;
        case '6': handlePreset('left'); break;
        case '7': handlePreset('bottom'); break;
        case 'f': case 'F': handleFrameAll(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlePreset, handleFrameAll]);

  const presetButtons: Array<{ preset: CameraPreset; label: string; key: string }> = [
    { preset: 'perspective', label: 'Persp', key: '1' },
    { preset: 'front', label: 'Front', key: '2' },
    { preset: 'right', label: 'Right', key: '3' },
    { preset: 'top', label: 'Top', key: '4' },
    { preset: 'back', label: 'Back', key: '5' },
    { preset: 'left', label: 'Left', key: '6' },
    { preset: 'bottom', label: 'Bottom', key: '7' },
  ];

  return (
    <div className="relative w-full h-full bg-[#1a1a2e]">
      <Canvas
        shadows
        camera={{
          fov: DEFAULT_CAMERA_CONFIG.fov,
          near: DEFAULT_CAMERA_CONFIG.near,
          far: DEFAULT_CAMERA_CONFIG.far,
          position: DEFAULT_CAMERA_CONFIG.position.toArray(),
        }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#1a1a2e']} />
        <fog attach="fog" args={['#1a1a2e', 15, 60]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
        <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#88ccff" />
        <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#4fc3f7" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#0d0d18" roughness={1} />
        </mesh>
        {showGrid && <gridHelper args={[20, 40, '#0e639c', '#2a2a3e']} position={[0, 0.01, 0]} />}
        {showAxes && <axesHelper args={[2]} />}
        <CameraController
          targetPreset={targetPreset}
          frameAllTrigger={frameAllTrigger}
          onCameraUpdate={setCameraInfo}
        />
      </Canvas>

      {/* Camera Preset Toolbar */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-black/70 backdrop-blur-sm rounded-lg p-1">
        {presetButtons.map((btn) => (
          <Button
            key={btn.preset}
            size="sm"
            variant="ghost"
            className={`h-7 px-2 text-[10px] ${
              cameraInfo?.preset === btn.preset ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => handlePreset(btn.preset)}
            title={`${btn.label} (key ${btn.key})`}
          >
            <Square size={10} className="mr-1" />
            {btn.label}
          </Button>
        ))}
        <Separator orientation="vertical" className="h-5 mx-1 bg-white/10" />
        <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-gray-400 hover:text-white" onClick={handleFrameAll} title="Frame All (F)">
          <Maximize2 size={10} className="mr-1" />
          Frame All
        </Button>
      </div>

      {/* View toggles */}
      <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/70 backdrop-blur-sm rounded-lg p-1">
        <Button size="sm" variant="ghost" className={`h-7 w-7 p-0 ${showGrid ? 'text-blue-400' : 'text-gray-500'}`} onClick={() => setShowGrid(!showGrid)} title="Toggle Grid (G)">
          <Grid3x3 size={12} />
        </Button>
        <Button size="sm" variant="ghost" className={`h-7 w-7 p-0 ${showAxes ? 'text-blue-400' : 'text-gray-500'}`} onClick={() => setShowAxes(!showAxes)} title="Toggle Axes">
          <Crosshair size={12} />
        </Button>
        <Button size="sm" variant="ghost" className={`h-7 w-7 p-0 ${showOverlay ? 'text-blue-400' : 'text-gray-500'}`} onClick={() => setShowOverlay(!showOverlay)} title="Toggle Info Overlay">
          {showOverlay ? <Eye size={12} /> : <EyeOff size={12} />}
        </Button>
      </div>

      {/* Camera Info Overlay */}
      {showOverlay && cameraInfo && (
        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm rounded-lg p-2 text-[10px] font-mono space-y-0.5 min-w-[180px]">
          <div className="flex items-center gap-1 mb-1 text-blue-400 font-semibold">
            <CameraIcon size={10} />
            Camera Info
          </div>
          <div className="text-red-400">Pos X: {cameraInfo.position[0].toFixed(2)}</div>
          <div className="text-green-400">Pos Y: {cameraInfo.position[1].toFixed(2)}</div>
          <div className="text-blue-400">Pos Z: {cameraInfo.position[2].toFixed(2)}</div>
          <Separator className="my-1 bg-white/10" />
          <div className="text-gray-400">Distance: {cameraInfo.distance.toFixed(2)}</div>
          <div className="text-gray-400">FOV: {cameraInfo.fov}</div>
          <div className="text-gray-400">Azimuth: {cameraInfo.azimuth.toFixed(1)}</div>
          <div className="text-gray-400">Polar: {cameraInfo.polar.toFixed(1)}</div>
          <Separator className="my-1 bg-white/10" />
          <Badge variant="outline" className={`text-[9px] uppercase ${cameraInfo.preset !== 'custom' ? 'text-blue-400 border-blue-400' : 'text-gray-500'}`}>
            {cameraInfo.preset}
          </Badge>
        </div>
      )}

      {/* Keyboard hints */}
      {showOverlay && (
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg p-2 text-[9px] text-gray-500 space-y-0.5">
          <div className="font-semibold text-gray-400 mb-1">Shortcuts</div>
          <div><kbd className="bg-white/10 px-1 rounded">1-7</kbd> Presets</div>
          <div><kbd className="bg-white/10 px-1 rounded">F</kbd> Frame All</div>
          <div><kbd className="bg-white/10 px-1 rounded">LMB</kbd> Orbit</div>
          <div><kbd className="bg-white/10 px-1 rounded">MMB</kbd> Pan</div>
          <div><kbd className="bg-white/10 px-1 rounded">Wheel</kbd> Zoom</div>
        </div>
      )}
    </div>
  );
}
