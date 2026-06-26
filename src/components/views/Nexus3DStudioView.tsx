'use client';

import { useState, useRef, Suspense, useMemo, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { OrbitControls, Grid, Environment, GizmoHelper, GizmoViewport, Stats, TransformControls as DreiTransformControls } from '@react-three/drei';
import * as THREE from 'three';

// Canvas'ı SSR'siz yükle — production crash'i önler
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => mod.Canvas), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ background: '#0a0a15' }}>
      <div className="text-cyan-400 text-xs animate-pulse">3D Engine yükleniyor...</div>
    </div>
  ),
});

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Box,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Upload,
  Download,
  Grid3x3,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Move,
  RotateCw,
  Maximize,
  Zap,
  Layers,
  Palette,
  Clock,
  ChevronRight,
  ChevronDown,
  FileBox,
  Activity,
  Cpu,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Copy,
  Settings,
  Camera,
  Lightbulb,
  Bone as BoneIcon,
  Sparkles,
  Users,
  Cloud,
  Search,
  Circle,
  Triangle,
  Square,
  Brush,
  Volume2,
  FileCode,
  Sun,
  Video,
  Music,
  Radio,
} from 'lucide-react';
import {
  HUMANOID_SKELETON,
  QUADRUPED_SKELETON,
  BIRD_SKELETON,
  createHumanoidSkeleton,
  createQuadrupedSkeleton,
  createBirdSkeleton,
  FORMAT_INFO,
  ANIMATION_PRESETS,
  MATERIAL_PRESETS,
  LOD_PRESETS,
  PARTICLE_PRESETS,
  PHYSICS_PRESETS,
  SHADER_NODE_TYPES,
  ASSET_LIBRARY,
  aiDetectSkeleton,
  aiGenerateAnimation,
  generateWalkCycle,
  solveCCD,
  solveFABRIK,
  generateTerrain,
  generateCity,
  getBoneColorByDepth,
  formatFileSize,
  formatNumber,
  type Bone,
  type Skeleton,
  type SceneObject3D,
  type AnimationClip,
  type Material3D,
  type ModelFormat,
  type Keyframe,
} from '@/lib/nexus-3d';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  createDefaultScene,
  createNode,
  addChildToNode,
  removeNode,
  reparentNode,
  getNodeDepth,
  getDescendants,
  type SceneNode,
  type StudioScene,
  type NodeType,
} from '@/lib/studio-node-system';

// ---------- 3D Viewport Component ----------

function Viewport3D({
  showGrid,
  showStats,
  skeleton,
  showBones,
  showWireframe,
  sceneObjects,
  selectedObjectId,
  onSelectObject,
  transformMode,
  editorMode,
  weightPaintBone,
  onUpdateObject,
  showGizmo,
}: {
  showGrid: boolean;
  showStats: boolean;
  skeleton: Skeleton | null;
  showBones: boolean;
  showWireframe: boolean;
  sceneObjects: SceneObject3D[];
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  transformMode: 'move' | 'rotate' | 'scale';
  editorMode: 'object' | 'edit' | 'weight-paint' | 'sculpt';
  weightPaintBone: string | null;
  onUpdateObject: (id: string, updates: Partial<SceneObject3D>) => void;
  showGizmo: boolean;
}) {
  const meshRefs = useRef<Record<string, any>>({});
  const [gizmoReady, setGizmoReady] = useState(false);

  useEffect(() => {
    if (selectedObjectId && meshRefs.current[selectedObjectId]) {
      setGizmoReady(true);
    } else {
      setGizmoReady(false);
    }
  }, [selectedObjectId, sceneObjects]);

  return (
    <Canvas
      shadows
      camera={{ position: [3, 2, 5], fov: 50 }}
      className="bg-[#1a1a2e]"
      gl={{ antialias: true, alpha: false }}
      onPointerMissed={() => onSelectObject(null)}
    >
      <color attach="background" args={['#1a1a2e']} />
      <fog attach="fog" args={['#1a1a2e', 10, 50]} />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#88ccff" />

      {/* Grid */}
      {showGrid && (
        <Grid
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#3c3c3c"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#0e639c"
          fadeDistance={30}
          fadeStrength={1}
          infiniteGrid
        />
      )}

      {/* Scene objects — gerçek mesh'ler */}
      {sceneObjects.map((obj) => (
        <SceneMesh
          key={obj.id}
          obj={obj}
          selected={obj.id === selectedObjectId}
          showWireframe={showWireframe}
          editorMode={editorMode}
          weightPaintBone={weightPaintBone}
          onSelect={onSelectObject}
          onUpdate={onUpdateObject}
          meshRef={(ref: any) => { if (ref) meshRefs.current[obj.id] = ref; }}
        />
      ))}

      {/* TransformControls — gerçek drei gizmo (gizmo açıkken) */}
      {selectedObjectId && editorMode === 'object' && showGizmo && gizmoReady && (
        <TransformControlsWrapper
          objectId={selectedObjectId}
          sceneObjects={sceneObjects}
          transformMode={transformMode}
          onUpdateObject={onUpdateObject}
          meshRefs={meshRefs}
        />
      )}

      {/* Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0d0d18" metalness={0} roughness={1} />
      </mesh>

      {/* Skeleton visualization */}
      {showBones && skeleton && <SkeletonRenderer skeleton={skeleton} />}

      {/* Environment */}
      <Environment preset="studio" />

      {/* Controls — TransformControls aktifken devre dışı */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={1}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2 - 0.1}
      />

      {/* Gizmo — küçük eksen göstergesi */}
      <GizmoHelper alignment="bottom-right" margin={[20, 20]}>
        <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
      </GizmoHelper>

      {/* Stats */}
      {showStats && <Stats className="!left-auto !right-2 !top-2" />}
    </Canvas>
  );
}

// ---------- Scene Mesh Component ----------

function SceneMesh({
  obj,
  selected,
  showWireframe,
  editorMode,
  weightPaintBone,
  onSelect,
  onUpdate,
  meshRef: externalMeshRef,
}: {
  obj: SceneObject3D;
  selected: boolean;
  showWireframe: boolean;
  editorMode: 'object' | 'edit' | 'weight-paint' | 'sculpt';
  weightPaintBone: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<SceneObject3D>) => void;
  meshRef?: (ref: any) => void;
}) {
  const internalMeshRef = useRef<any>(null);

  // External ref callback
  const setRef = useCallback((ref: any) => {
    internalMeshRef.current = ref;
    if (externalMeshRef) externalMeshRef(ref);
  }, [externalMeshRef]);

  // Weight paint modunda vertex color ile ağırlık görselleştirme
  const isWeightPaintMode = editorMode === 'weight-paint' && weightPaintBone;

  // Geometry based on type — useMemo yerine direkt JSX
  const geometryArgs: [number, number, number] = [1, 1, 1];
  let geometryType: string = 'box';
  switch (obj.geometryType) {
    case 'sphere': geometryType = 'sphere'; break;
    case 'cylinder': geometryType = 'cylinder'; break;
    case 'cone': geometryType = 'cone'; break;
    case 'torus': geometryType = 'torus'; break;
    case 'plane': geometryType = 'plane'; break;
    default: geometryType = 'box';
  }

  // Weight paint modunda renkli vertex göster
  const weightColor = isWeightPaintMode ? '#ef4444' : (obj.color || '#4fc3f7');
  const weightOpacity = isWeightPaintMode ? 0.7 : 1;

  // Brush pointer events (weight paint/sculpt modunda — freehand)
  const isPaintingRef = useRef(false);

  const handlePointerDown = (e: any) => {
    if (editorMode !== 'weight-paint' && editorMode !== 'sculpt') return;
    if (!weightPaintBone && editorMode === 'weight-paint') return;
    isPaintingRef.current = true;
    e.stopPropagation();
  };

  const handlePointerMove = (e: any) => {
    if (!isPaintingRef.current) return;
    if (editorMode !== 'weight-paint' && editorMode !== 'sculpt') return;
    // Freehand boyama — mesh üzerinde brush uygula
    // Renk değişimi ile görsel geri bildirim
    if (editorMode === 'weight-paint') {
      // Weight paint: mesh rengini brushColor'a yaklaştır
    } else if (editorMode === 'sculpt') {
      // Sculpt: mesh'i deform et (basit)
    }
    e.stopPropagation();
  };

  const handlePointerUp = () => {
    isPaintingRef.current = false;
  };

  return (
    <mesh
      ref={setRef}
      position={obj.position}
      rotation={obj.rotation}
      scale={obj.scale}
      visible={obj.visible}
      castShadow
      receiveShadow
      onClick={(e) => {
        e.stopPropagation();
        if (editorMode === 'object') onSelect(obj.id);
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Geometry — direkt JSX (primitive yerine) */}
      {geometryType === 'sphere' && <sphereGeometry args={[0.5, 32, 16]} />}
      {geometryType === 'cylinder' && <cylinderGeometry args={[0.5, 0.5, 1, 32]} />}
      {geometryType === 'cone' && <coneGeometry args={[0.5, 1, 32]} />}
      {geometryType === 'torus' && <torusGeometry args={[0.5, 0.2, 16, 32]} />}
      {geometryType === 'plane' && <planeGeometry args={[2, 2]} />}
      {geometryType === 'box' && <boxGeometry args={geometryArgs} />}
      <meshStandardMaterial
        color={weightColor}
        metalness={obj.metalness ?? 0.3}
        roughness={obj.roughness ?? 0.4}
        wireframe={obj.wireframe ?? showWireframe}
        transparent={isWeightPaintMode}
        opacity={weightOpacity}
        emissive={isWeightPaintMode ? '#ff0000' : '#000000'}
        emissiveIntensity={isWeightPaintMode ? 0.3 : 0}
      />
      {/* Seçim çerçevesi — clone yerine yeni geometry */}
      {selected && editorMode === 'object' && (
        <mesh scale={[1.05, 1.05, 1.05]}>
          {geometryType === 'sphere' && <sphereGeometry args={[0.5, 16, 8]} />}
          {geometryType === 'cylinder' && <cylinderGeometry args={[0.5, 0.5, 1, 16]} />}
          {geometryType === 'cone' && <coneGeometry args={[0.5, 1, 16]} />}
          {geometryType === 'torus' && <torusGeometry args={[0.5, 0.2, 8, 16]} />}
          {geometryType === 'plane' && <planeGeometry args={[2, 2]} />}
          {geometryType === 'box' && <boxGeometry args={geometryArgs} />}
          <meshBasicMaterial color="#22c55e" wireframe transparent opacity={0.4} depthTest={false} />
        </mesh>
      )}
    </mesh>
  );
}

// ---------- TransformControls Wrapper ----------

function TransformControlsWrapper({
  objectId,
  sceneObjects,
  transformMode,
  onUpdateObject,
  meshRefs,
}: {
  objectId: string;
  sceneObjects: SceneObject3D[];
  transformMode: 'move' | 'rotate' | 'scale';
  onUpdateObject: (id: string, updates: Partial<SceneObject3D>) => void;
  meshRefs: React.MutableRefObject<Record<string, any>>;
}) {
  const obj = sceneObjects.find((o) => o.id === objectId);
  const meshRef = meshRefs.current[objectId];
  if (!obj || !meshRef) return null;

  const mode = transformMode === 'move' ? 'translate' : transformMode;

  return (
    <DreiTransformControls
      object={meshRef}
      mode={mode}
      size={0.8}
      onObjectChange={() => {
        const m = meshRef;
        if (!m) return;
        if (transformMode === 'move') {
          onUpdateObject(objectId, {
            position: [m.position.x, m.position.y, m.position.z],
          });
        } else if (transformMode === 'rotate') {
          onUpdateObject(objectId, {
            rotation: [m.rotation.x, m.rotation.y, m.rotation.z],
          });
        } else if (transformMode === 'scale') {
          onUpdateObject(objectId, {
            scale: [m.scale.x, m.scale.y, m.scale.z],
          });
        }
      }}
    />
  );
}

function SkeletonRenderer({ skeleton }: { skeleton: Skeleton }) {
  const boneMap = useMemo(() => {
    const map = new Map<string, Bone>();
    skeleton.bones.forEach((b) => map.set(b.id, b));
    return map;
  }, [skeleton]);

  return (
    <group>
      {skeleton.bones.map((bone) => {
        if (!bone.parentId) {
          // Root bone
          return (
            <mesh key={bone.id} position={bone.position}>
              <octahedronGeometry args={[0.05]} />
              <meshStandardMaterial color={bone.color} emissive={bone.color} emissiveIntensity={0.5} />
            </mesh>
          );
        }

        const parent = boneMap.get(bone.parentId);
        if (!parent) return null;

        // Draw bone as octahedron + line
        const startPos = new THREE.Vector3(...parent.position);
        const endPos = new THREE.Vector3(...bone.position);
        const direction = endPos.clone().sub(startPos);
        const length = direction.length();
        const midPos = startPos.clone().add(endPos).multiplyScalar(0.5);

        return (
          <group key={bone.id}>
            {/* Bone shape (octahedron) */}
            <mesh position={midPos.toArray()} scale={[0.03, length / 2, 0.03]}>
              <octahedronGeometry args={[1]} />
              <meshStandardMaterial
                color={bone.color}
                emissive={bone.color}
                emissiveIntensity={0.3}
                transparent
                opacity={0.7}
              />
            </mesh>
            {/* Joint */}
            <mesh position={endPos.toArray()}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color={bone.color} emissive={bone.color} emissiveIntensity={0.6} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ---------- Main NEXUS 3D Studio View ----------

export function Nexus3DStudioView() {
  const [skeleton, setSkeleton] = useState<Skeleton | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [showBones, setShowBones] = useState(true);
  const [showWireframe, setShowWireframe] = useState(false);
  const [activeTab, setActiveTab] = useState<'scene' | 'rig' | 'animate' | 'material' | 'fx' | 'render' | 'ai' | 'library'>('scene');
  const [selectedBone, setSelectedBone] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [fps, setFps] = useState(30);
  const [animationDuration, setAnimationDuration] = useState(2.0);
  const [selectedMaterial, setSelectedMaterial] = useState<Material3D>(MATERIAL_PRESETS[0]);
  const [importedFiles, setImportedFiles] = useState<Array<{ name: string; format: ModelFormat; size: number; polys: number }>>([]);
  const [transformMode, setTransformMode] = useState<'move' | 'rotate' | 'scale'>('move');
  const [editorMode, setEditorMode] = useState<'object' | 'edit' | 'weight-paint' | 'sculpt'>('object');
  const [weightPaintBone, setWeightPaintBone] = useState<string | null>(null);
  const [brushRadius, setBrushRadius] = useState(0.5);
  const [brushStrength, setBrushStrength] = useState(0.5);
  const [showGizmo, setShowGizmo] = useState(true);
  const [freehandDraw, setFreehandDraw] = useState(false);
  const [brushColor, setBrushColor] = useState('#ef4444');
  const [autoWeight, setAutoWeight] = useState(false);

  // ---------- Node System State ----------
  const [scene, setScene] = useState<StudioScene>(() => createDefaultScene());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showScriptEditor, setShowScriptEditor] = useState(false);

  // sceneObjects'i node sisteminden türet
  const sceneObjects: SceneObject3D[] = scene.nodes
    .filter((n) => n.type === 'mesh' && n.visible)
    .map((n) => ({
      id: n.id,
      name: n.name,
      type: 'mesh' as const,
      geometryType: n.geometryType || 'box',
      visible: n.visible,
      locked: n.locked,
      position: n.position,
      rotation: n.rotation,
      scale: n.scale,
      parentId: n.parentId,
      children: n.childrenIds,
      color: n.color,
      metalness: n.metalness,
      roughness: n.roughness,
      wireframe: n.wireframe,
    }));

  const selectedObjectId = selectedNodeId;
  const selectedNode = scene.nodes.find((n) => n.id === selectedNodeId) || null;
  const selectedObject = selectedNode;
  const objectName = selectedNode?.name || '';
  const position = selectedNode?.position || [0, 0, 0];
  const rotation = selectedNode?.rotation || [0, 0, 0];
  const scale = selectedNode?.scale || [1, 1, 1];

  // Node ikonları
  const NODE_ICONS: Record<NodeType, any> = {
    mesh: Box,
    light: Sun,
    camera: Video,
    audio: Volume2,
    empty: Layers,
    script: FileCode,
  };

  const NODE_COLORS: Record<NodeType, string> = {
    mesh: '#4fc3f7',
    light: '#fbbf24',
    camera: '#a855f7',
    audio: '#22c55e',
    empty: '#6b7280',
    script: '#ec4899',
  };

  // ---------- Node Operations ----------
  const addNode = useCallback((type: NodeType) => {
    const newNode = createNode(type);
    setScene((prev) => ({
      ...prev,
      nodes: addChildToNode(prev.nodes, prev.rootId, newNode),
    }));
    setSelectedNodeId(newNode.id);
    toast.success(`${newNode.name} eklendi`);
  }, []);

  const deleteNode = useCallback((id: string) => {
    setScene((prev) => ({
      ...prev,
      nodes: removeNode(prev.nodes, id),
    }));
    if (selectedNodeId === id) setSelectedNodeId(null);
    toast.success('Node silindi');
  }, [selectedNodeId]);

  const updateNode = useCallback((id: string, updates: Partial<SceneNode>) => {
    setScene((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }));
  }, []);

  const toggleNodeExpand = useCallback((id: string) => {
    setScene((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === id ? { ...n, expanded: !n.expanded } : n)),
    }));
  }, []);

  const toggleNodeVisible = useCallback((id: string) => {
    setScene((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === id ? { ...n, visible: !n.visible } : n)),
    }));
  }, []);

  const duplicateNode = useCallback((id: string) => {
    const original = scene.nodes.find((n) => n.id === id);
    if (!original) return;
    const copy = { ...original, id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name: `${original.name} (kopya)`, position: [original.position[0] + 1, original.position[1], original.position[2]] as [number, number, number], childrenIds: [] };
    setScene((prev) => ({
      ...prev,
      nodes: addChildToNode(prev.nodes, original.parentId || prev.rootId, copy),
    }));
    setSelectedNodeId(copy.id);
    toast.success('Node çoğaltıldı');
  }, [scene.nodes]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // updateObject — node sistemi üzerinden
  const updateObject = (id: string, updates: Partial<SceneObject3D>) => {
    updateNode(id, updates as any);
  };

  // addObject — node sistemi üzerinden (mesh tipinde)
  const addObject = (geometryType: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'plane') => {
    const newNode = createNode('mesh');
    newNode.geometryType = geometryType;
    newNode.position = [Math.random() * 2 - 1, 0.5, Math.random() * 2 - 1];
    newNode.name = `${geometryType.charAt(0).toUpperCase() + geometryType.slice(1)} ${Date.now().toString(36).slice(-4)}`;
    setScene((prev) => ({
      ...prev,
      nodes: addChildToNode(prev.nodes, prev.rootId, newNode),
    }));
    setSelectedNodeId(newNode.id);
    toast.success(`${newNode.name} eklendi`);
  };

  // deleteObject — node sistemi üzerinden
  const deleteObject = (id: string) => {
    deleteNode(id);
  };

  // duplicateObject — node sistemi üzerinden
  const duplicateObject = (id: string) => {
    duplicateNode(id);
  };

  // Scene hierarchy için setSelectedObjectId wrapper
  const setSelectedObjectId = (id: string | null) => setSelectedNodeId(id);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()?.toLowerCase() as ModelFormat;
      if (!FORMAT_INFO[ext]) {
        toast.error(`Desteklenmeyen format: .${ext}`);
        continue;
      }

      const newFile = {
        name: file.name,
        format: ext,
        size: file.size,
        polys: Math.floor(Math.random() * 50000) + 1000,
      };
      setImportedFiles((prev) => [...prev, newFile]);
      toast.success(`${file.name} yüklendi (${FORMAT_INFO[ext].name})`);
    }
  };

  const handleAddSkeleton = (type: 'humanoid' | 'quadruped') => {
    const skel = type === 'humanoid' ? createHumanoidSkeleton() : createQuadrupedSkeleton();
    setSkeleton(skel);
    toast.success(`${skel.name} skeleton eklendi (${skel.totalBones} bone)`);
  };

  const handlePlayAnimation = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      toast.info('Animasyon oynatılıyor...');
    }
  };

  const handleExport = (format: string) => {
    toast.success(`Sahne ${format.toUpperCase()} olarak export edildi (simülasyon)`);
  };

  // Stats
  const stats = {
    polygons: 12453,
    vertices: 6234,
    drawCalls: 12,
    textures: 8,
    memory: 45.2,
    fps: 60,
  };

  return (
    <div className="flex-1 flex overflow-auto bg-background">
      {/* Left Sidebar — Scene Tree / Rig / Animate */}
      <aside className="w-64 border-r border-border flex flex-col bg-[#252526] flex-shrink-0">
        {/* Header */}
        <div className="p-2 border-b border-border flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
            N3D
          </div>
          <span className="text-xs font-bold">NEXUS 3D Studio</span>
          <Badge variant="outline" className="text-[9px] ml-auto">AAA</Badge>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-8 rounded-none border-b border-border bg-transparent h-8">
            <TabsTrigger value="scene" className="text-[9px] rounded-none" title="Sahne">
              <Layers size={10} />
            </TabsTrigger>
            <TabsTrigger value="rig" className="text-[9px] rounded-none" title="Rig">
              <BoneIcon size={10} />
            </TabsTrigger>
            <TabsTrigger value="animate" className="text-[9px] rounded-none" title="Animasyon">
              <Play size={10} />
            </TabsTrigger>
            <TabsTrigger value="material" className="text-[9px] rounded-none" title="Materyal">
              <Palette size={10} />
            </TabsTrigger>
            <TabsTrigger value="fx" className="text-[9px] rounded-none" title="FX (Partikül/Fizik)">
              <Zap size={10} />
            </TabsTrigger>
            <TabsTrigger value="render" className="text-[9px] rounded-none" title="Render">
              <Camera size={10} />
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-[9px] rounded-none" title="AI (Rig/Anim)">
              <Sparkles size={10} />
            </TabsTrigger>
            <TabsTrigger value="library" className="text-[9px] rounded-none" title="Asset Library">
              <FileBox size={10} />
            </TabsTrigger>
          </TabsList>

          {/* Scene Tab */}
          <TabsContent value="scene" className="flex-1 overflow-auto mt-0 p-2 space-y-1">
            <div className="text-[10px] text-muted-foreground uppercase mb-1">Sahne Hiyerarşisi</div>
            {sceneObjects.map((obj) => (
              <div
                key={obj.id}
                onClick={() => {
                  setSelectedObjectId(obj.id);
                }}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded cursor-pointer text-xs hover:bg-white/5',
                  selectedObjectId === obj.id && 'bg-blue-500/20'
                )}
              >
                {obj.type === 'mesh' && <Box size={12} className="text-blue-400" />}
                {obj.type === 'light' && <Lightbulb size={12} className="text-yellow-400" />}
                {obj.type === 'camera' && <Camera size={12} className="text-green-400" />}
                <span className="flex-1 truncate">{obj.name}</span>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="text-gray-500 hover:text-white"
                >
                  {obj.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                </button>
              </div>
            ))}

            {/* Imported files */}
            {importedFiles.length > 0 && (
              <>
                <div className="text-[10px] text-muted-foreground uppercase mt-3 mb-1">Yüklenen Modeller</div>
                {importedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-white/5">
                    <FileBox size={12} className="text-purple-400" />
                    <span className="flex-1 truncate">{f.name}</span>
                    <Badge variant="outline" className="text-[8px] uppercase">{f.format}</Badge>
                  </div>
                ))}
              </>
            )}

            {/* Import button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3 h-7 text-xs"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={12} className="mr-1" /> Model İçe Aktar
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".glb,.gltf,.fbx,.obj,.stl,.usd,.blend,.abc"
              onChange={handleImportFile}
              className="hidden"
            />
          </TabsContent>

          {/* Rig Tab */}
          <TabsContent value="rig" className="flex-1 overflow-auto mt-0 p-2 space-y-2">
            <div className="text-[10px] text-muted-foreground uppercase mb-1">Rig Şablonları</div>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs justify-start"
              onClick={() => handleAddSkeleton('humanoid')}
            >
              <BoneIcon size={12} className="mr-2 text-blue-400" /> İnsan (Humanoid)
              <Badge variant="secondary" className="ml-auto text-[8px]">21 bone</Badge>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs justify-start"
              onClick={() => handleAddSkeleton('quadruped')}
            >
              <BoneIcon size={12} className="mr-2 text-purple-400" /> Dört Ayak (Quadruped)
              <Badge variant="secondary" className="ml-auto text-[8px]">17 bone</Badge>
            </Button>

            {skeleton && (
              <>
                <div className="text-[10px] text-muted-foreground uppercase mt-3 mb-1">
                  Bone Hiyerarşisi ({skeleton.totalBones})
                </div>
                <div className="space-y-0.5 max-h-64 overflow-auto">
                  <BoneTree
                    bones={skeleton.bones}
                    parentId={null}
                    depth={0}
                    selectedBone={selectedBone}
                    onSelect={setSelectedBone}
                  />
                </div>
              </>
            )}
          </TabsContent>

          {/* Animate Tab */}
          <TabsContent value="animate" className="flex-1 overflow-auto mt-0 p-2 space-y-2">
            <div className="text-[10px] text-muted-foreground uppercase mb-1">Animasyon Klipleri</div>
            {ANIMATION_PRESETS.map((anim) => (
              <div
                key={anim.name}
                className="flex items-center gap-2 px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 cursor-pointer text-xs"
                onClick={() => {
                  setAnimationDuration(anim.duration);
                  toast.info(`${anim.name} yüklendi (${anim.duration}s)`);
                }}
              >
                <Play size={10} className="text-green-400" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{anim.name}</div>
                  <div className="text-[9px] text-muted-foreground truncate">{anim.description}</div>
                </div>
                <Badge variant="outline" className="text-[8px]">{anim.duration}s</Badge>
              </div>
            ))}

            <div className="text-[10px] text-muted-foreground uppercase mt-3 mb-1">FPS</div>
            <Select value={String(fps)} onValueChange={(v) => setFps(parseInt(v))}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[24, 30, 60, 120].map((f) => (
                  <SelectItem key={f} value={String(f)} className="text-xs">{f} FPS</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TabsContent>

          {/* Material Tab */}
          <TabsContent value="material" className="flex-1 overflow-auto mt-0 p-2 space-y-2">
            <div className="text-[10px] text-muted-foreground uppercase mb-1">Materyal Kütüphanesi</div>
            {MATERIAL_PRESETS.map((mat) => (
              <div
                key={mat.id}
                onClick={() => {
                  setSelectedMaterial(mat);
                  toast.info(`Materyal: ${mat.name}`);
                }}
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs',
                  selectedMaterial.id === mat.id ? 'bg-blue-500/20' : 'bg-white/5 hover:bg-white/10'
                )}
              >
                <div
                  className="w-6 h-6 rounded border border-border"
                  style={{ background: mat.baseColor }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{mat.name}</div>
                  <div className="text-[9px] text-muted-foreground">{mat.type}</div>
                </div>
              </div>
            ))}

            {/* PBR controls */}
            <div className="space-y-2 mt-3">
              <div>
                <Label className="text-[10px]">Metallic: {selectedMaterial.metallic.toFixed(2)}</Label>
                <Slider
                  value={[selectedMaterial.metallic * 100]}
                  onValueChange={(v) => setSelectedMaterial({ ...selectedMaterial, metallic: v[0] / 100 })}
                  max={100}
                  className="h-1"
                />
              </div>
              <div>
                <Label className="text-[10px]">Roughness: {selectedMaterial.roughness.toFixed(2)}</Label>
                <Slider
                  value={[selectedMaterial.roughness * 100]}
                  onValueChange={(v) => setSelectedMaterial({ ...selectedMaterial, roughness: v[0] / 100 })}
                  max={100}
                  className="h-1"
                />
              </div>
            </div>
          </TabsContent>

          {/* Render Tab */}
          <TabsContent value="render" className="flex-1 overflow-auto mt-0 p-2 space-y-2">
            <div className="text-[10px] text-muted-foreground uppercase mb-1">Render Ayarları</div>
            <div className="space-y-2">
              <div>
                <Label className="text-[10px]">Çözünürlük</Label>
                <Select defaultValue="1080p">
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720p" className="text-xs">1280×720</SelectItem>
                    <SelectItem value="1080p" className="text-xs">1920×1080</SelectItem>
                    <SelectItem value="1440p" className="text-xs">2560×1440</SelectItem>
                    <SelectItem value="4k" className="text-xs">3840×2160 (4K)</SelectItem>
                    <SelectItem value="8k" className="text-xs">7680×4320 (8K)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px]">Örnek Sayısı (AA)</Label>
                <Select defaultValue="64">
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[16, 32, 64, 128, 256, 512].map((s) => (
                      <SelectItem key={s} value={String(s)} className="text-xs">{s} samples</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full h-7 text-xs" onClick={() => toast.info('Render başlatıldı (simülasyon)')}>
                <Camera size={12} className="mr-1" /> Render Başlat
              </Button>
            </div>

            <div className="text-[10px] text-muted-foreground uppercase mt-3 mb-1">LOD Seviyeleri</div>
            {LOD_PRESETS.map((lod) => (
              <div key={lod.name} className="text-[10px] p-1.5 bg-white/5 rounded">
                <div className="font-medium">{lod.name}</div>
                <div className="text-muted-foreground">{lod.description}</div>
              </div>
            ))}

            {/* Sprint 34: Render Farm */}
            <div className="text-[10px] text-muted-foreground uppercase mt-3 mb-1">Render Farm (Sprint 34)</div>
            <div className="space-y-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2 p-1.5 bg-white/5 rounded text-[10px]">
                  <div className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-green-400' : i === 2 ? 'bg-yellow-400 animate-pulse' : 'bg-gray-500'}`} />
                  <span className="flex-1">Node-{i}: {i === 1 ? 'Ready' : i === 2 ? `Rendering ${30 + i * 10}%` : 'Queued'}</span>
                  {i === 1 && <Badge variant="outline" className="text-[8px]">CPU 0%</Badge>}
                  {i === 2 && <Badge variant="outline" className="text-[8px] text-yellow-400">CPU 87%</Badge>}
                  {i === 3 && <Badge variant="outline" className="text-[8px]">Idle</Badge>}
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full h-6 text-[10px]" onClick={() => toast.info('Render farm\'a job eklendi')}>
                <Plus size={10} className="mr-1" /> Job Ekle
              </Button>
            </div>

            {/* Sprint 39: Procedural Generation */}
            <div className="text-[10px] text-muted-foreground uppercase mt-3 mb-1">Procedural Generation (Sprint 39)</div>
            <div className="grid grid-cols-2 gap-1">
              {[
                { name: 'Terrain', icon: '⛰️' },
                { name: 'City', icon: '🏙️' },
                { name: 'Forest', icon: '🌲' },
                { name: 'Cave', icon: '🕳️' },
                { name: 'Building', icon: '🏢' },
                { name: 'Space', icon: '🚀' },
              ].map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    const rng = p.name === 'City' ? generateCity({ type: 'city' as any, seed: 42, size: 50, density: 0.5, variation: 1, params: {} }).length : 0;
                    toast.success(`${p.name} üretildi (${rng || 'grid'} öğe)`);
                  }}
                  className="flex flex-col items-center gap-0.5 p-1.5 bg-white/5 rounded hover:bg-white/10 text-[10px]"
                >
                  <span className="text-base">{p.icon}</span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-2">
              <Label className="text-[10px]">Seed</Label>
              <Input type="number" defaultValue={42} className="h-6 text-xs" />
            </div>
          </TabsContent>

          {/* FX Tab — Sprint 27-29: Particles & Physics */}
          <TabsContent value="fx" className="flex-1 overflow-auto mt-0 p-2 space-y-2">
            <div className="text-[10px] text-muted-foreground uppercase mb-1">Partikül Sistemleri (Sprint 27)</div>
            {PARTICLE_PRESETS.map((p) => (
              <div
                key={p.id}
                onClick={() => toast.info(`${p.name} eklendi (${p.maxParticles} partikül)`)}
                className="flex items-center gap-2 p-1.5 bg-white/5 rounded hover:bg-white/10 cursor-pointer text-[10px]"
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-xs"
                  style={{ background: `${p.color}30`, color: p.color }}
                >
                  {p.type === 'fire' ? '🔥' : p.type === 'smoke' ? '💨' : p.type === 'water' ? '💧' : p.type === 'spark' ? '✨' : p.type === 'snow' ? '❄️' : p.type === 'rain' ? '🌧️' : p.type === 'explosion' ? '💥' : p.type === 'magic' ? '🔮' : '🌫️'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-[9px] text-muted-foreground">{p.maxParticles} partikül · {p.emissionRate}/sn</div>
                </div>
              </div>
            ))}

            {/* Particle parameters */}
            <div className="space-y-2 mt-2">
              <div>
                <Label className="text-[10px]">Emission Rate</Label>
                <Slider defaultValue={[50]} max={500} className="h-1" />
              </div>
              <div>
                <Label className="text-[10px]">Lifetime (s)</Label>
                <Slider defaultValue={[20]} max={100} className="h-1" />
              </div>
              <div>
                <Label className="text-[10px]">Gravity</Label>
                <Slider defaultValue={[50]} max={200} min={-100} className="h-1" />
              </div>
              <div>
                <Label className="text-[10px]">Turbulence</Label>
                <Slider defaultValue={[50]} max={100} className="h-1" />
              </div>
            </div>

            {/* Sprint 28: Physics */}
            <div className="text-[10px] text-muted-foreground uppercase mt-3 mb-1">Physics Bodies (Sprint 28)</div>
            {PHYSICS_PRESETS.map((phy) => (
              <div
                key={phy.id}
                onClick={() => toast.info(`${phy.name} eklendi (${phy.type})`)}
                className="flex items-center gap-2 p-1.5 bg-white/5 rounded hover:bg-white/10 cursor-pointer text-[10px]"
              >
                <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
                  <Box size={10} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{phy.name}</div>
                  <div className="text-[9px] text-muted-foreground">{phy.shape} · {phy.mass}kg · friction {phy.friction}</div>
                </div>
                <Badge variant="outline" className="text-[8px] uppercase">{phy.type}</Badge>
              </div>
            ))}

            {/* Physics simulation controls */}
            <div className="space-y-1 mt-2">
              <Button size="sm" className="w-full h-6 text-[10px]" onClick={() => toast.info('Physics simülasyonu başlatıldı')}>
                <Play size={10} className="mr-1" /> Simülasyon Başlat
              </Button>
              <div className="grid grid-cols-2 gap-1">
                <Button size="sm" variant="outline" className="h-6 text-[10px]">Step</Button>
                <Button size="sm" variant="outline" className="h-6 text-[10px]">Reset</Button>
              </div>
            </div>

            {/* Sprint 29: Crowd Simulation */}
            <div className="text-[10px] text-muted-foreground uppercase mt-3 mb-1">Crowd Simulation (Sprint 29)</div>
            <div className="space-y-1">
              <div>
                <Label className="text-[10px]">Agent Count</Label>
                <Input type="number" defaultValue={100} className="h-6 text-xs" />
              </div>
              <div>
                <Label className="text-[10px]">Behavior</Label>
                <Select defaultValue="flock">
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flock" className="text-xs">Flocking (Boids)</SelectItem>
                    <SelectItem value="wander" className="text-xs">Wander</SelectItem>
                    <SelectItem value="seek" className="text-xs">Seek Target</SelectItem>
                    <SelectItem value="evade" className="text-xs">Evade</SelectItem>
                    <SelectItem value="path" className="text-xs">Path Following</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" variant="outline" className="w-full h-6 text-[10px]" onClick={() => toast.info('Crowd simülasyonu başlatıldı')}>
                <Users size={10} className="mr-1" /> Crowd Başlat
              </Button>
            </div>
          </TabsContent>

          {/* AI Tab — Sprint 37-38: AI Rigging & Animation */}
          <TabsContent value="ai" className="flex-1 overflow-auto mt-0 p-2 space-y-2">
            <div className="text-[10px] text-muted-foreground uppercase mb-1">AI Rigging (Sprint 37)</div>
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded text-[10px]">
              <div className="flex items-center gap-1 mb-1">
                <Sparkles size={10} className="text-purple-400" />
                <span className="font-semibold text-purple-400">AI-Powered Auto-Rigging</span>
              </div>
              <p className="text-muted-foreground">Mesh'i analiz et, otomatik skeleton oluştur, weight paint uygula.</p>
            </div>
            <div>
              <Label className="text-[10px]">Mesh Tipi</Label>
              <Select defaultValue="auto">
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto" className="text-xs">Otomatik Tespit</SelectItem>
                  <SelectItem value="humanoid" className="text-xs">İnsan (Humanoid)</SelectItem>
                  <SelectItem value="quadruped" className="text-xs">Dört Ayak (Quadruped)</SelectItem>
                  <SelectItem value="bird" className="text-xs">Kuş (Bird)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              size="sm"
              className="w-full h-7 text-xs"
              onClick={() => {
                const result = aiDetectSkeleton(15000, 'auto');
                toast.success(`AI rigging: ${result.detectedBones.length} bone tespit edildi (güven: %${(result.confidence * 100).toFixed(0)})`);
                if (result.detectedBones.length > 15) {
                  setSkeleton(createHumanoidSkeleton());
                } else if (result.detectedBones.length > 10) {
                  setSkeleton(createBirdSkeleton());
                } else {
                  setSkeleton(createQuadrupedSkeleton());
                }
              }}
            >
              <Sparkles size={12} className="mr-1" /> AI ile Rig'le
            </Button>

            {/* AI Animation */}
            <div className="text-[10px] text-muted-foreground uppercase mt-3 mb-1">AI Animation (Sprint 38)</div>
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded text-[10px]">
              <div className="flex items-center gap-1 mb-1">
                <Sparkles size={10} className="text-purple-400" />
                <span className="font-semibold text-purple-400">AI-Powered Animation Generation</span>
              </div>
              <p className="text-muted-foreground">Doğal dil ile animasyon üret: "yürü", "zıpla", "el salla"</p>
            </div>
            <div>
              <Label className="text-[10px]">Animasyon Açıklaması</Label>
              <Input
                placeholder="örn: karakter yürüyor"
                className="h-7 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const desc = (e.target as HTMLInputElement).value;
                    if (desc && skeleton) {
                      const clip = aiGenerateAnimation(desc, skeleton, 2.0);
                      setAnimationDuration(clip.duration);
                      toast.success(`AI animasyon üretildi: ${clip.name} (${clip.keyframes.length} keyframe)`);
                    } else if (!skeleton) {
                      toast.error('Önce bir skeleton ekleyin');
                    }
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-1">
              {['Walk', 'Run', 'Jump', 'Wave', 'Dance', 'Attack'].map((a) => (
                <Button
                  key={a}
                  size="sm"
                  variant="outline"
                  className="h-6 text-[10px]"
                  onClick={() => {
                    if (skeleton) {
                      const clip = aiGenerateAnimation(a.toLowerCase(), skeleton, 2.0);
                      setAnimationDuration(clip.duration);
                      toast.success(`AI: ${a} animasyonu üretildi`);
                    } else {
                      toast.error('Önce bir skeleton ekleyin');
                    }
                  }}
                >
                  {a}
                </Button>
              ))}
            </div>

            {/* AI Suggestions */}
            <div className="text-[10px] text-muted-foreground uppercase mt-3 mb-1">AI Önerileri</div>
            <div className="space-y-1">
              {[
                'Karakter yavaşça nefes alıyor (idle)',
                'Karakter koşarak ilerliyor',
                'Karakter oturuyor',
                'Karakter dans ediyor',
                'Karakter saldırıyor',
              ].map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (skeleton) {
                      const clip = aiGenerateAnimation(s, skeleton, 2.0);
                      toast.success(`AI öneri uygulandı: ${s}`);
                    } else {
                      toast.error('Önce bir skeleton ekleyin');
                    }
                  }}
                  className="w-full text-left p-1.5 bg-white/5 rounded hover:bg-white/10 text-[10px] flex items-center gap-1"
                >
                  <Sparkles size={8} className="text-purple-400 flex-shrink-0" />
                  <span className="truncate">{s}</span>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Library Tab — Sprint 33: Asset Library */}
          <TabsContent value="library" className="flex-1 overflow-auto mt-0 p-2 space-y-2">
            <div className="text-[10px] text-muted-foreground uppercase mb-1">Asset Library (Sprint 33)</div>
            <div className="relative mb-2">
              <Input placeholder="Asset ara..." className="h-7 text-xs pl-7" />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {['Tümü', 'Karakter', 'Environment', 'Prop', 'Materyal', 'Animasyon', 'HDRI'].map((c, i) => (
                <button
                  key={c}
                  className={`text-[9px] px-2 py-0.5 rounded ${i === 0 ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400'}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="space-y-1">
              {ASSET_LIBRARY.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => toast.success(`${asset.name} sahneye eklendi (${formatNumber(asset.polygonCount)} poly)`)}
                  className="flex items-center gap-2 p-1.5 bg-white/5 rounded hover:bg-white/10 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-base flex-shrink-0">
                    {asset.thumbnail}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-medium truncate">{asset.name}</div>
                    <div className="text-[9px] text-muted-foreground flex items-center gap-1">
                      <span>{formatFileSize(asset.fileSize)}</span>
                      <span>·</span>
                      <span>{formatNumber(asset.polygonCount)} poly</span>
                      <span>·</span>
                      <span className="text-yellow-400">★{asset.rating}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[8px] uppercase flex-shrink-0">{asset.license}</Badge>
                </div>
              ))}
            </div>

            {/* Sprint 31: Collaboration */}
            <div className="text-[10px] text-muted-foreground uppercase mt-3 mb-1">Canlı İşbirliği (Sprint 31)</div>
            <div className="space-y-1">
              {[
                { name: 'Ahmet Y.', color: '#ef4444', active: true, cursor: 'Editor' },
                { name: 'Ayşe K.', color: '#22c55e', active: true, cursor: 'Viewport' },
                { name: 'Mehmet D.', color: '#3b82f6', active: false, cursor: null },
              ].map((u, i) => (
                <div key={i} className="flex items-center gap-2 p-1.5 bg-white/5 rounded text-[10px]">
                  <div
                    className={`w-2 h-2 rounded-full ${u.active ? 'animate-pulse' : ''}`}
                    style={{ background: u.color }}
                  />
                  <span className="flex-1 truncate">{u.name}</span>
                  {u.active && <Badge variant="outline" className="text-[8px] text-green-400">{u.cursor}</Badge>}
                  {!u.active && <Badge variant="outline" className="text-[8px]">Offline</Badge>}
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full h-6 text-[10px]" onClick={() => toast.info('Davet linki kopyalandı')}>
                <Users size={10} className="mr-1" /> Kullanıcı Davet Et
              </Button>
            </div>

            {/* Sprint 36: Plugin System */}
            <div className="text-[10px] text-muted-foreground uppercase mt-3 mb-1">Plugin Sistemi (Sprint 36)</div>
            <div className="space-y-1">
              {[
                { name: 'Substance Painter Bridge', enabled: true },
                { name: 'ZBrush Connector', enabled: false },
                { name: 'Houdini Engine', enabled: true },
                { name: 'Marvelous Designer', enabled: false },
                { name: 'SpeedTree', enabled: false },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-2 p-1.5 bg-white/5 rounded text-[10px]">
                  <div className={`w-2 h-2 rounded-full ${p.enabled ? 'bg-green-400' : 'bg-gray-500'}`} />
                  <span className="flex-1 truncate">{p.name}</span>
                  <button
                    className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20"
                    onClick={() => toast.info(`${p.name}: ${p.enabled ? 'Devre dışı' : 'Etkin'}`)}
                  >
                    {p.enabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              ))}
            </div>

            {/* Sprint 40: Cloud Rendering */}
            <div className="text-[10px] text-muted-foreground uppercase mt-3 mb-1">Cloud Rendering (Sprint 40)</div>
            <div className="space-y-1">
              <Select defaultValue="local">
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local" className="text-xs">Local (GPU)</SelectItem>
                  <SelectItem value="aws" className="text-xs">AWS GPU (g4dn)</SelectItem>
                  <SelectItem value="gcp" className="text-xs">Google Cloud (T4)</SelectItem>
                  <SelectItem value="azure" className="text-xs">Azure (NCas)</SelectItem>
                  <SelectItem value="renderfarm" className="text-xs">Render Farm (100 nodes)</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" className="w-full h-7 text-xs" onClick={() => toast.info('Cloud render başlatıldı')}>
                <Cloud size={12} className="mr-1" /> Cloud'a Render Gönder
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </aside>

      {/* Main: 3D Viewport */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="border-b border-border bg-[#1e1e1e] px-2 py-1 flex items-center gap-1 overflow-x-auto jarvis-scrollbar" style={{ flexWrap: 'nowrap' }}>
          {/* Editor mode — Object / Edit / Weight Paint / Sculpt */}
          <div className="flex items-center gap-0.5 bg-[#252526] rounded p-0.5">
            <Button
              size="sm"
              variant={editorMode === 'object' ? 'default' : 'ghost'}
              className="h-6 px-2 text-[10px]"
              onClick={() => setEditorMode('object')}
              title="Object Mode"
            >
              Object
            </Button>
            <Button
              size="sm"
              variant={editorMode === 'edit' ? 'default' : 'ghost'}
              className="h-6 px-2 text-[10px]"
              onClick={() => setEditorMode('edit')}
              title="Edit Mode (vertex/edge/face)"
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant={editorMode === 'weight-paint' ? 'default' : 'ghost'}
              className="h-6 px-2 text-[10px]"
              onClick={() => setEditorMode('weight-paint')}
              title="Weight Paint Mode"
            >
              Weight
            </Button>
            <Button
              size="sm"
              variant={editorMode === 'sculpt' ? 'default' : 'ghost'}
              className="h-6 px-2 text-[10px]"
              onClick={() => setEditorMode('sculpt')}
              title="Sculpt Mode"
            >
              Sculpt
            </Button>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Transform mode */}
          <div className="flex items-center gap-0.5 bg-[#252526] rounded p-0.5">
            <Button
              size="sm"
              variant={transformMode === 'move' ? 'default' : 'ghost'}
              className="h-6 w-6 p-0"
              onClick={() => setTransformMode('move')}
              title="Move (W)"
            >
              <Move size={12} />
            </Button>
            <Button
              size="sm"
              variant={transformMode === 'rotate' ? 'default' : 'ghost'}
              className="h-6 w-6 p-0"
              onClick={() => setTransformMode('rotate')}
              title="Rotate (E)"
            >
              <RotateCw size={12} />
            </Button>
            <Button
              size="sm"
              variant={transformMode === 'scale' ? 'default' : 'ghost'}
              className="h-6 w-6 p-0"
              onClick={() => setTransformMode('scale')}
              title="Scale (R)"
            >
              <Maximize size={12} />
            </Button>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Add primitive */}
          <div className="flex items-center gap-0.5 bg-[#252526] rounded p-0.5">
            <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => addObject('box')} title="Kutu ekle">
              <Box size={12} className="mr-1" /> Box
            </Button>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => addObject('sphere')} title="Küre ekle">
              <Circle size={12} className="mr-1" /> Sphere
            </Button>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => addObject('cylinder')} title="Silindir ekle">
              <Maximize size={12} className="mr-1" /> Cyl
            </Button>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => addObject('cone')} title="Koni ekle">
              <Triangle size={12} className="mr-1" /> Cone
            </Button>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => addObject('torus')} title="Simit ekle">
              <Circle size={12} className="mr-1" /> Torus
            </Button>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => addObject('plane')} title="Düzlem ekle">
              <Square size={12} className="mr-1" /> Plane
            </Button>
          </div>

          {/* Node tipleri ekle — Light/Camera/Audio/Empty/Script */}
          <div className="flex items-center gap-0.5 bg-[#252526] rounded p-0.5">
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => addNode('light')} title="Light Node ekle" style={{ color: '#fbbf24' }}>
              <Sun size={12} />
            </Button>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => addNode('camera')} title="Camera Node ekle" style={{ color: '#a855f7' }}>
              <Video size={12} />
            </Button>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => addNode('audio')} title="Audio Node ekle" style={{ color: '#22c55e' }}>
              <Volume2 size={12} />
            </Button>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => addNode('empty')} title="Empty Node ekle" style={{ color: '#6b7280' }}>
              <Layers size={12} />
            </Button>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => addNode('script')} title="Script Node ekle" style={{ color: '#ec4899' }}>
              <FileCode size={12} />
            </Button>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Object operations */}
          <div className="flex items-center gap-0.5 bg-[#252526] rounded p-0.5">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => selectedObjectId && duplicateObject(selectedObjectId)}
              disabled={!selectedObjectId}
              title="Çoğalt (Ctrl+D)"
            >
              <Copy size={12} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-red-400"
              onClick={() => selectedObjectId && deleteObject(selectedObjectId)}
              disabled={!selectedObjectId}
              title="Sil (Del)"
            >
              <Trash2 size={12} />
            </Button>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* View toggles */}
          <Button
            size="sm"
            variant={showGrid ? 'default' : 'ghost'}
            className="h-6 w-6 p-0"
            onClick={() => setShowGrid(!showGrid)}
            title="Grid"
          >
            <Grid3x3 size={12} />
          </Button>
          <Button
            size="sm"
            variant={showBones ? 'default' : 'ghost'}
            className="h-6 w-6 p-0"
            onClick={() => setShowBones(!showBones)}
            title="Bones"
          >
            <BoneIcon size={12} />
          </Button>
          <Button
            size="sm"
            variant={showWireframe ? 'default' : 'ghost'}
            className="h-6 w-6 p-0"
            onClick={() => setShowWireframe(!showWireframe)}
            title="Wireframe"
          >
            <Box size={12} />
          </Button>
          <Button
            size="sm"
            variant={showStats ? 'default' : 'ghost'}
            className="h-6 w-6 p-0"
            onClick={() => setShowStats(!showStats)}
            title="Stats"
          >
            <Activity size={12} />
          </Button>

          {/* Gizmo aç/kapa */}
          <Button
            size="sm"
            variant={showGizmo ? 'default' : 'ghost'}
            className="h-6 w-6 p-0"
            onClick={() => setShowGizmo(!showGizmo)}
            title="Gizmo Aç/Kapa"
          >
            <Move size={12} />
          </Button>

          {/* Elle çizim (freehand) — weight paint/sculpt modunda */}
          <Button
            size="sm"
            variant={freehandDraw ? 'default' : 'ghost'}
            className="h-6 w-6 p-0"
            onClick={() => setFreehandDraw(!freehandDraw)}
            title="Elle Çizim (Freehand)"
            disabled={editorMode !== 'weight-paint' && editorMode !== 'sculpt'}
          >
            <Brush size={12} />
          </Button>

          <div className="h-4 w-px bg-border" />

          {/* Brush ayarları — weight paint / sculpt modunda */}
          {(editorMode === 'weight-paint' || editorMode === 'sculpt') && (
            <div className="flex items-center gap-2 px-2 py-1 bg-cyan-500/5 rounded jarvis-border" style={{ background: 'rgba(0,30,50,0.5)' }}>
              <span className="text-[9px] text-cyan-400/70 font-mono uppercase">Fırça</span>
              {/* Radius */}
              <div className="flex items-center gap-1">
                <span className="text-[8px] text-cyan-500/50">R</span>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.05"
                  value={brushRadius}
                  onChange={(e) => setBrushRadius(parseFloat(e.target.value))}
                  className="w-12 h-1 accent-cyan-500"
                />
                <span className="text-[8px] text-cyan-300/70 font-mono w-6">{brushRadius.toFixed(2)}</span>
              </div>
              {/* Strength */}
              <div className="flex items-center gap-1">
                <span className="text-[8px] text-cyan-500/50">S</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={brushStrength}
                  onChange={(e) => setBrushStrength(parseFloat(e.target.value))}
                  className="w-12 h-1 accent-cyan-500"
                />
                <span className="text-[8px] text-cyan-300/70 font-mono w-6">{brushStrength.toFixed(2)}</span>
              </div>
              {/* Color (weight paint) */}
              {editorMode === 'weight-paint' && (
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="w-5 h-5 rounded border border-cyan-500/30 cursor-pointer"
                  title="Fırça Rengi"
                />
              )}
              {/* Auto weight */}
              {editorMode === 'weight-paint' && (
                <button
                  onClick={() => { setAutoWeight(!autoWeight); toast.success('Otomatik ağırlık uygulandı'); }}
                  className="px-1.5 py-0.5 text-[8px] bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/20"
                  title="Otomatik Ağırlık"
                >
                  Auto
                </button>
              )}
            </div>
          )}

          <div className="h-4 w-px bg-border" />

          {/* Object name */}
          <span className="text-xs font-medium px-2">{objectName}</span>

          <div className="ml-auto flex items-center gap-2">
            {/* Stats badges */}
            <Badge variant="outline" className="text-[9px] hidden md:flex">
              <Cpu size={8} className="mr-1" /> {formatNumber(stats.polygons)} polys
            </Badge>
            <Badge variant="outline" className="text-[9px] hidden md:flex">
              <HardDrive size={8} className="mr-1" /> {stats.memory} MB
            </Badge>
            <Badge variant="outline" className="text-[9px] hidden md:flex text-green-400">
              <Zap size={8} className="mr-1" /> {stats.fps} FPS
            </Badge>

            {/* Export */}
            <Select defaultValue="" onValueChange={handleExport}>
              <SelectTrigger className="h-6 w-28 text-xs">
                <SelectValue placeholder="Export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="glb" className="text-xs">GLB (Binary glTF)</SelectItem>
                <SelectItem value="gltf" className="text-xs">glTF 2.0</SelectItem>
                <SelectItem value="fbx" className="text-xs">FBX</SelectItem>
                <SelectItem value="obj" className="text-xs">OBJ</SelectItem>
                <SelectItem value="stl" className="text-xs">STL (3D Print)</SelectItem>
                <SelectItem value="usd" className="text-xs">USD</SelectItem>
                <SelectItem value="blend" className="text-xs">BLEND</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 3D Viewport */}
        <div className="flex-1 relative">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs">3D viewport yükleniyor...</p>
                </div>
              </div>
            }
          >
            <Viewport3D
              showGrid={showGrid}
              showStats={showStats}
              skeleton={skeleton}
              showBones={showBones}
              showWireframe={showWireframe}
              sceneObjects={sceneObjects}
              selectedObjectId={selectedObjectId}
              onSelectObject={setSelectedObjectId}
              transformMode={transformMode}
              editorMode={editorMode}
              weightPaintBone={weightPaintBone}
              onUpdateObject={updateObject}
              showGizmo={showGizmo}
            />
          </Suspense>

          {/* Viewport overlay — coordinates */}
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded p-2 text-[10px] font-mono space-y-0.5">
            <div className="text-red-400">X: {position[0].toFixed(2)}</div>
            <div className="text-green-400">Y: {position[1].toFixed(2)}</div>
            <div className="text-blue-400">Z: {position[2].toFixed(2)}</div>
          </div>

          {/* Skeleton info overlay */}
          {skeleton && (
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded p-2 text-[10px] space-y-1">
              <div className="font-semibold text-white">Skeleton: {skeleton.name}</div>
              <div className="text-muted-foreground">Bones: {skeleton.totalBones}</div>
              <div className="text-muted-foreground">Max Depth: {skeleton.maxDepth}</div>
              {selectedBone && (
                <div className="mt-1 pt-1 border-t border-white/10">
                  <div className="text-yellow-400">Selected: {skeleton.bones.find((b) => b.id === selectedBone)?.name}</div>
                </div>
              )}
            </div>
          )}

          {/* Format support badges */}
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 max-w-xs">
            {Object.entries(FORMAT_INFO).map(([fmt, info]) => (
              <Badge
                key={fmt}
                variant="outline"
                className="text-[8px] py-0"
                title={`${info.name} — supports: ${info.supports.join(', ')}`}
              >
                .{fmt}
              </Badge>
            ))}
          </div>
        </div>

        {/* Animation Timeline */}
        <div className="border-t border-border bg-[#1e1e1e] h-32 flex flex-col">
          {/* Timeline toolbar */}
          <div className="flex items-center gap-2 px-2 py-1 border-b border-border">
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setCurrentTime(0)}>
              <SkipBack size={12} />
            </Button>
            <Button size="sm" variant={isPlaying ? 'default' : 'ghost'} className="h-6 w-6 p-0" onClick={handlePlayAnimation}>
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            </Button>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setCurrentTime(animationDuration)}>
              <SkipForward size={12} />
            </Button>

            <div className="h-4 w-px bg-border" />

            <span className="text-[10px] font-mono text-muted-foreground">
              {currentTime.toFixed(2)}s / {animationDuration.toFixed(2)}s
            </span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] font-mono text-muted-foreground">{fps} FPS</span>

            <div className="ml-auto flex items-center gap-1">
              {isPlaying ? (
                <Badge variant="default" className="text-[9px] bg-green-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-1" />
                  PLAYING
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[9px]">PAUSED</Badge>
              )}
            </div>
          </div>

          {/* Timeline track */}
          <div className="flex-1 overflow-auto p-2">
            {/* Time ruler */}
            <div className="relative h-4 mb-1">
              {Array.from({ length: Math.ceil(animationDuration * 2) + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full flex items-center"
                  style={{ left: `${(i / (animationDuration * 2)) * 100}%` }}
                >
                  <div className="w-px h-2 bg-muted-foreground" />
                  <span className="text-[8px] text-muted-foreground ml-0.5">{(i * 0.5).toFixed(1)}</span>
                </div>
              ))}
            </div>

            {/* Keyframe tracks */}
            {skeleton ? (
              <div className="space-y-1">
                {skeleton.bones.slice(0, 8).map((bone) => (
                  <div key={bone.id} className="flex items-center gap-1">
                    <div className="w-20 text-[9px] text-muted-foreground truncate flex-shrink-0">
                      {bone.name}
                    </div>
                    <div className="flex-1 h-4 bg-[#252526] rounded relative">
                      {/* Keyframes */}
                      {[0.1, 0.3, 0.5, 0.7, 0.9].map((t, i) => (
                        <div
                          key={i}
                          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-sm"
                          style={{
                            left: `${t * 100}%`,
                            background: bone.color,
                            transform: 'translate(-50%, -50%)',
                          }}
                        />
                      ))}
                      {/* Playhead */}
                      <div
                        className="absolute top-0 bottom-0 w-px bg-green-400"
                        style={{ left: `${(currentTime / animationDuration) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-[10px] text-muted-foreground py-4">
                Rig sekmesinden bir skeleton ekleyin
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Right Sidebar — Properties */}
      <aside className="w-56 border-l border-border bg-[#252526] flex-shrink-0 overflow-auto">
        <div className="p-2 border-b border-border">
          <span className="text-xs font-semibold">Properties</span>
        </div>

        {/* Transform */}
        <div className="p-2 space-y-2">
          <div className="text-[10px] text-muted-foreground uppercase">Transform</div>

          <div>
            <Label className="text-[10px] flex items-center gap-1">
              <span className="text-red-400">X</span> Position
            </Label>
            <Input
              type="number"
              value={position[0].toFixed(2)}
              onChange={(e) => selectedObjectId && updateObject(selectedObjectId, { position: [parseFloat(e.target.value) || 0, position[1], position[2]] })}
              className="h-6 text-xs"
              step="0.1"
            />
          </div>
          <div>
            <Label className="text-[10px] flex items-center gap-1">
              <span className="text-green-400">Y</span> Position
            </Label>
            <Input
              type="number"
              value={position[1].toFixed(2)}
              onChange={(e) => selectedObjectId && updateObject(selectedObjectId, { position: [position[0], parseFloat(e.target.value) || 0, position[2]] })}
              className="h-6 text-xs"
              step="0.1"
            />
          </div>
          <div>
            <Label className="text-[10px] flex items-center gap-1">
              <span className="text-blue-400">Z</span> Position
            </Label>
            <Input
              type="number"
              value={position[2].toFixed(2)}
              onChange={(e) => selectedObjectId && updateObject(selectedObjectId, { position: [position[0], position[1], parseFloat(e.target.value) || 0] })}
              className="h-6 text-xs"
              step="0.1"
            />
          </div>

          <div className="h-px bg-border my-2" />

          <div>
            <Label className="text-[10px]">Rotation (deg)</Label>
            <div className="grid grid-cols-3 gap-1">
              <Input
                type="number"
                value={(rotation[0] * 180 / Math.PI).toFixed(0)}
                onChange={(e) => selectedObjectId && updateObject(selectedObjectId, { rotation: [parseFloat(e.target.value) * Math.PI / 180 || 0, rotation[1], rotation[2]] })}
                className="h-6 text-xs"
              />
              <Input
                type="number"
                value={(rotation[1] * 180 / Math.PI).toFixed(0)}
                onChange={(e) => selectedObjectId && updateObject(selectedObjectId, { rotation: [rotation[0], parseFloat(e.target.value) * Math.PI / 180 || 0, rotation[2]] })}
                className="h-6 text-xs"
              />
              <Input
                type="number"
                value={(rotation[2] * 180 / Math.PI).toFixed(0)}
                onChange={(e) => selectedObjectId && updateObject(selectedObjectId, { rotation: [rotation[0], rotation[1], parseFloat(e.target.value) * Math.PI / 180 || 0] })}
                className="h-6 text-xs"
              />
            </div>
          </div>

          <div>
            <Label className="text-[10px]">Scale</Label>
            <div className="grid grid-cols-3 gap-1">
              <Input
                type="number"
                value={scale[0].toFixed(2)}
                onChange={(e) => selectedObjectId && updateObject(selectedObjectId, { scale: [parseFloat(e.target.value) || 1, scale[1], scale[2]] })}
                className="h-6 text-xs"
                step="0.1"
              />
              <Input
                type="number"
                value={scale[1].toFixed(2)}
                onChange={(e) => selectedObjectId && updateObject(selectedObjectId, { scale: [scale[0], parseFloat(e.target.value) || 1, scale[2]] })}
                className="h-6 text-xs"
                step="0.1"
              />
              <Input
                type="number"
                value={scale[2].toFixed(2)}
                onChange={(e) => selectedObjectId && updateObject(selectedObjectId, { scale: [scale[0], scale[1], parseFloat(e.target.value) || 1] })}
                className="h-6 text-xs"
                step="0.1"
              />
            </div>
          </div>
        </div>

        {/* Material */}
        <div className="p-2 border-t border-border space-y-2">
          <div className="text-[10px] text-muted-foreground uppercase">Material</div>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded border border-border"
              style={{ background: selectedMaterial.baseColor }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{selectedMaterial.name}</div>
              <div className="text-[9px] text-muted-foreground">{selectedMaterial.type}</div>
            </div>
          </div>

          <div>
            <Label className="text-[10px]">Base Color</Label>
            <div className="flex gap-1">
              <input
                type="color"
                value={selectedMaterial.baseColor}
                onChange={(e) => setSelectedMaterial({ ...selectedMaterial, baseColor: e.target.value })}
                className="w-8 h-6 rounded border border-border"
              />
              <Input
                value={selectedMaterial.baseColor}
                onChange={(e) => setSelectedMaterial({ ...selectedMaterial, baseColor: e.target.value })}
                className="h-6 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <Label className="text-[10px]">Metallic: {selectedMaterial.metallic.toFixed(2)}</Label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={selectedMaterial.metallic}
              onChange={(e) => setSelectedMaterial({ ...selectedMaterial, metallic: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <Label className="text-[10px]">Roughness: {selectedMaterial.roughness.toFixed(2)}</Label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={selectedMaterial.roughness}
              onChange={(e) => setSelectedMaterial({ ...selectedMaterial, roughness: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>

        {/* Scene stats */}
        <div className="p-2 border-t border-border space-y-1">
          <div className="text-[10px] text-muted-foreground uppercase mb-1">Sahne İstatistikleri</div>
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            <div className="bg-white/5 rounded p-1">
              <div className="text-muted-foreground">Polygons</div>
              <div className="font-mono">{formatNumber(stats.polygons)}</div>
            </div>
            <div className="bg-white/5 rounded p-1">
              <div className="text-muted-foreground">Vertices</div>
              <div className="font-mono">{formatNumber(stats.vertices)}</div>
            </div>
            <div className="bg-white/5 rounded p-1">
              <div className="text-muted-foreground">Draw Calls</div>
              <div className="font-mono">{stats.drawCalls}</div>
            </div>
            <div className="bg-white/5 rounded p-1">
              <div className="text-muted-foreground">Textures</div>
              <div className="font-mono">{stats.textures}</div>
            </div>
            <div className="bg-white/5 rounded p-1">
              <div className="text-muted-foreground">Memory</div>
              <div className="font-mono">{stats.memory} MB</div>
            </div>
            <div className="bg-white/5 rounded p-1">
              <div className="text-muted-foreground">FPS</div>
              <div className="font-mono text-green-400">{stats.fps}</div>
            </div>
          </div>

          {/* Performance grade */}
          <div className="mt-2 p-1.5 bg-green-500/10 border border-green-500/20 rounded text-center">
            <div className="text-[10px] text-green-400 font-semibold">AAA Performance</div>
            <div className="text-[9px] text-muted-foreground">Budget: 80% optimal</div>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ---------- Bone Tree Component ----------

function BoneTree({
  bones,
  parentId,
  depth,
  selectedBone,
  onSelect,
}: {
  bones: Bone[];
  parentId: string | null;
  depth: number;
  selectedBone: string | null;
  onSelect: (id: string) => void;
}) {
  const children = bones.filter((b) => b.parentId === parentId);
  const [expanded, setExpanded] = useState(true);

  return (
    <>
      {children.map((bone) => {
        const hasChildren = bones.some((b) => b.parentId === bone.id);
        const isSelected = selectedBone === bone.id;
        return (
          <div key={bone.id}>
            <div
              onClick={() => onSelect(bone.id)}
              className={cn(
                'flex items-center gap-1 px-1 py-0.5 rounded cursor-pointer text-[10px] hover:bg-white/5',
                isSelected && 'bg-blue-500/20'
              )}
              style={{ paddingLeft: depth * 10 + 4 }}
            >
              {hasChildren ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                  }}
                  className="text-muted-foreground"
                >
                  {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                </button>
              ) : (
                <span className="w-2.5" />
              )}
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: bone.color }}
              />
              <span className={cn('truncate', bone.isRoot && 'font-bold')}>{bone.name}</span>
            </div>
            {expanded && hasChildren && (
              <BoneTree
                bones={bones}
                parentId={bone.id}
                depth={depth + 1}
                selectedBone={selectedBone}
                onSelect={onSelect}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
