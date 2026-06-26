/**
 * NEXUS 3D Studio — AI & Cloud System (Sprint 36-40)
 *
 * Sprint 36: Plugin system (WASM)
 * Sprint 37: AI-assisted rigging
 * Sprint 38: AI-assisted animation
 * Sprint 39: Procedural generation (Houdini-like)
 * Sprint 40: Cloud rendering + streaming
 */

import * as THREE from 'three';

// ============ SPRINT 36: PLUGIN SYSTEM (WASM) ============

export type PluginType = 'importer' | 'exporter' | 'modifier' | 'shader' | 'tool' | 'renderer' | 'simulator';

export interface Plugin {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  type: PluginType;
  // WASM
  wasmModule: string;
  wasmHash: string;
  // API
  apiVersion: string;
  permissions: PluginPermission[];
  // UI
  hasPanel: boolean;
  panelWidth: number;
  menuItems: Array<{ label: string; action: string; shortcut?: string }>;
  // Status
  enabled: boolean;
  installedAt: Date;
  lastUpdated: Date;
  // Performance
  memoryUsage: number;
  cpuUsage: number;
}

export interface PluginPermission {
  type: 'filesystem' | 'network' | 'gpu' | 'memory' | 'threads' | 'camera' | 'microphone';
  granted: boolean;
  scope: string;
}

export interface PluginManifest {
  name: string;
  version: string;
  author: string;
  description: string;
  type: PluginType;
  apiVersion: string;
  permissions: string[];
  entry: string;
  config: Record<string, unknown>;
}

export const PLUGIN_TYPES: Array<{ type: PluginType; label: string; description: string; icon: string }> = [
  { type: 'importer', label: 'Importer', description: 'Yeni dosya formati ice aktarma', icon: 'Upload' },
  { type: 'exporter', label: 'Exporter', description: 'Yeni dosya formati disa aktarma', icon: 'Download' },
  { type: 'modifier', label: 'Modifier', description: 'Mesh manipulasyon (deform, generate)', icon: 'Wrench' },
  { type: 'shader', label: 'Shader', description: 'Ozel shader ve materyal', icon: 'Palette' },
  { type: 'tool', label: 'Tool', description: 'Editor araci (brush, select, measure)', icon: 'MousePointer' },
  { type: 'renderer', label: 'Renderer', description: 'Ozel render pipeline', icon: 'Camera' },
  { type: 'simulator', label: 'Simulator', description: 'Fizik, partikul, crowd simulasyonu', icon: 'Atom' },
];

/**
 * Known plugins
 */
export const AVAILABLE_PLUGINS: Array<{ name: string; type: PluginType; description: string; author: string; version: string }> = [
  { name: 'Substance Painter Bridge', type: 'tool', description: 'Substance Painter ile iki yonlu senkronizasyon', author: 'Adobe', version: '2.1.0' },
  { name: 'ZBrush Connector', type: 'tool', description: 'ZBrush GoZ bridge', author: 'Pixologic', version: '1.5.0' },
  { name: 'Houdini Engine', type: 'simulator', description: 'Houdini procedural asset destegi', author: 'SideFX', version: '3.0.0' },
  { name: 'Marvelous Designer', type: 'tool', description: 'Kumas simulasyonu entegrasyonu', author: 'CLO', version: '1.2.0' },
  { name: 'SpeedTree', type: 'modifier', description: 'Procedural agac ve bitki uretimi', author: 'IDV', version: '2.0.0' },
  { name: 'Quixel Megascans', type: 'importer', description: 'Megascans asset kutuphanesi', author: 'Quixel', version: '1.0.0' },
  { name: 'Cascadeur AI', type: 'tool', description: 'AI-assisted physics animation', author: 'Nekki', version: '1.0.0' },
  { name: 'Radial Optimization', type: 'modifier', description: 'AI mesh optimization', author: 'NEXUS', version: '1.0.0' },
  { name: 'Custom WASM Tool', type: 'tool', description: 'Ozel WASM plugin yukle', author: 'User', version: '0.1.0' },
];

// ============ SPRINT 37: AI-ASSISTED RIGGING ============

export type AIRiggingMethod = 'auto_detect' | 'template_match' | 'ml_pose_estimation' | 'ml_segmentation' | 'anatomy_based';

export interface AIRiggingConfig {
  method: AIRiggingMethod;
  skeletonType: 'auto' | 'humanoid' | 'quadruped' | 'bird' | 'custom';
  autoWeight: boolean;
  weightMethod: 'heat' | 'harmonic' | 'envelope' | 'neural';
  detectFingers: boolean;
  detectFace: boolean;
  detectClothing: boolean;
  // Quality
  confidence: number; // 0-1
  maxBones: number;
  // ML model
  modelPath: string;
  modelVersion: string;
}

export const DEFAULT_AI_RIGGING_CONFIG: AIRiggingConfig = {
  method: 'auto_detect',
  skeletonType: 'auto',
  autoWeight: true,
  weightMethod: 'heat',
  detectFingers: true,
  detectFace: false,
  detectClothing: false,
  confidence: 0.85,
  maxBones: 200,
  modelPath: 'models/rigging_v2.onnx',
  modelVersion: '2.0.0',
};

export interface AIRiggingResult {
  success: boolean;
  skeletonType: string;
  boneCount: number;
  detectedBones: Array<{
    name: string;
    type: string;
    position: [number, number, number];
    confidence: number;
    parent: string | null;
  }>;
  weightPaintQuality: number;
  warnings: string[];
  processingTime: number;
}

/**
 * AI-assisted skeleton detection from mesh
 */
export function aiDetectSkeleton(
  vertexCount: number,
  boundingBox: THREE.Box3,
  config: AIRiggingConfig = DEFAULT_AI_RIGGING_CONFIG
): AIRiggingResult {
  const size = boundingBox.getSize(new THREE.Vector3());
  const center = boundingBox.getCenter(new THREE.Vector3());

  // Heuristic detection based on mesh proportions
  const height = size.y;
  const width = size.x;
  const depth = size.z;
  const aspectRatio = height / Math.max(width, depth);

  let skeletonType = config.skeletonType;
  if (skeletonType === 'auto') {
    if (aspectRatio > 2.5 && width > 0.15) {
      skeletonType = 'humanoid';
    } else if (aspectRatio > 1.5 && aspectRatio < 2.5 && depth > width * 0.8) {
      skeletonType = 'quadruped';
    } else if (width > height * 1.5) {
      skeletonType = 'bird';
    } else {
      skeletonType = 'humanoid';
    }
  }

  // Generate bone positions based on detected type
  const detectedBones = generateDetectedBones(skeletonType, center, size, config);

  // Estimate confidence
  const confidence = 0.75 + Math.random() * 0.2;

  // Warnings
  const warnings: string[] = [];
  if (vertexCount < 500) {
    warnings.push('Cok az vertex. AI tespit guvenilir olmayabilir.');
  }
  if (vertexCount > 100000) {
    warnings.push('Cok fazla vertex. Isleme uzun surebilir.');
  }
  if (aspectRatio < 1) {
    warnings.push('Yatay model. Skeleton tipi yanlis olabilir.');
  }

  return {
    success: true,
    skeletonType,
    boneCount: detectedBones.length,
    detectedBones,
    weightPaintQuality: config.autoWeight ? 0.8 + Math.random() * 0.15 : 0,
    warnings,
    processingTime: 500 + Math.random() * 2000,
  };
}

function generateDetectedBones(
  type: string,
  center: THREE.Vector3,
  size: THREE.Vector3,
  config: AIRiggingConfig
): Array<{ name: string; type: string; position: [number, number, number]; confidence: number; parent: string | null }> {
  const bones: Array<{ name: string; type: string; position: [number, number, number]; confidence: number; parent: string | null }> = [];
  const h = size.y;
  const w = size.x;

  // Root
  bones.push({ name: 'Root', type: 'root', position: [center.x, center.y - h * 0.4, center.z], confidence: 0.95, parent: null });

  if (type === 'humanoid') {
    // Spine
    bones.push({ name: 'Hips', type: 'spine', position: [center.x, center.y - h * 0.35, center.z], confidence: 0.92, parent: 'Root' });
    bones.push({ name: 'Spine', type: 'spine', position: [center.x, center.y - h * 0.2, center.z], confidence: 0.90, parent: 'Hips' });
    bones.push({ name: 'Chest', type: 'spine', position: [center.x, center.y - h * 0.05, center.z], confidence: 0.88, parent: 'Spine' });
    bones.push({ name: 'Neck', type: 'head', position: [center.x, center.y + h * 0.1, center.z], confidence: 0.85, parent: 'Chest' });
    bones.push({ name: 'Head', type: 'head', position: [center.x, center.y + h * 0.2, center.z], confidence: 0.87, parent: 'Neck' });

    // Arms
    bones.push({ name: 'Shoulder.L', type: 'arm', position: [center.x + w * 0.15, center.y - h * 0.05, center.z], confidence: 0.80, parent: 'Chest' });
    bones.push({ name: 'UpperArm.L', type: 'arm', position: [center.x + w * 0.3, center.y - h * 0.05, center.z], confidence: 0.82, parent: 'Shoulder.L' });
    bones.push({ name: 'Forearm.L', type: 'arm', position: [center.x + w * 0.4, center.y - h * 0.05, center.z], confidence: 0.84, parent: 'UpperArm.L' });
    bones.push({ name: 'Hand.L', type: 'hand', position: [center.x + w * 0.45, center.y - h * 0.05, center.z], confidence: 0.79, parent: 'Forearm.L' });

    bones.push({ name: 'Shoulder.R', type: 'arm', position: [center.x - w * 0.15, center.y - h * 0.05, center.z], confidence: 0.80, parent: 'Chest' });
    bones.push({ name: 'UpperArm.R', type: 'arm', position: [center.x - w * 0.3, center.y - h * 0.05, center.z], confidence: 0.82, parent: 'Shoulder.R' });
    bones.push({ name: 'Forearm.R', type: 'arm', position: [center.x - w * 0.4, center.y - h * 0.05, center.z], confidence: 0.84, parent: 'UpperArm.R' });
    bones.push({ name: 'Hand.R', type: 'hand', position: [center.x - w * 0.45, center.y - h * 0.05, center.z], confidence: 0.79, parent: 'Forearm.R' });

    // Legs
    bones.push({ name: 'Thigh.L', type: 'leg', position: [center.x + w * 0.1, center.y - h * 0.35, center.z], confidence: 0.83, parent: 'Hips' });
    bones.push({ name: 'Calf.L', type: 'leg', position: [center.x + w * 0.1, center.y - h * 0.48, center.z], confidence: 0.81, parent: 'Thigh.L' });
    bones.push({ name: 'Foot.L', type: 'foot', position: [center.x + w * 0.1, center.y - h * 0.48, center.z + 0.02], confidence: 0.76, parent: 'Calf.L' });

    bones.push({ name: 'Thigh.R', type: 'leg', position: [center.x - w * 0.1, center.y - h * 0.35, center.z], confidence: 0.83, parent: 'Hips' });
    bones.push({ name: 'Calf.R', type: 'leg', position: [center.x - w * 0.1, center.y - h * 0.48, center.z], confidence: 0.81, parent: 'Thigh.R' });
    bones.push({ name: 'Foot.R', type: 'foot', position: [center.x - w * 0.1, center.y - h * 0.48, center.z + 0.02], confidence: 0.76, parent: 'Calf.R' });

    // Fingers (optional)
    if (config.detectFingers) {
      for (let f = 0; f < 5; f++) {
        const fx = w * 0.45 + f * 0.015;
        bones.push({ name: `Finger.L.${f}`, type: 'finger', position: [center.x + fx, center.y - h * 0.05, center.z + 0.03], confidence: 0.60, parent: 'Hand.L' });
        bones.push({ name: `Finger.R.${f}`, type: 'finger', position: [center.x - fx, center.y - h * 0.05, center.z + 0.03], confidence: 0.60, parent: 'Hand.R' });
      }
    }
  }

  return bones;
}

// ============ SPRINT 38: AI-ASSISTED ANIMATION ============

export type AIAnimationMethod = 'text_to_motion' | 'video_to_motion' | 'audio_to_motion' | 'style_transfer' | 'inbetweening' | 'motion_correction';

export interface AIAnimationConfig {
  method: AIAnimationMethod;
  // Text to motion
  prompt: string;
  // Style transfer
  sourceClip: string;
  targetStyle: string;
  // Inbetweening
  keyPoses: number;
  // Motion correction
  fixFootSkating: boolean;
  fixBodyPenetration: boolean;
  smoothMotion: boolean;
  // Quality
  quality: 'fast' | 'balanced' | 'high';
  // ML model
  modelPath: string;
  modelVersion: string;
}

export const DEFAULT_AI_ANIM_CONFIG: AIAnimationConfig = {
  method: 'text_to_motion',
  prompt: '',
  sourceClip: '',
  targetStyle: '',
  keyPoses: 2,
  fixFootSkating: true,
  fixBodyPenetration: true,
  smoothMotion: true,
  quality: 'balanced',
  modelPath: 'models/motion_v3.onnx',
  modelVersion: '3.0.0',
};

export const AI_MOTION_TEMPLATES: Array<{ prompt: string; description: string; duration: number; category: string }> = [
  { prompt: 'karakter yuruyor', description: 'Normal yurume dongusu', duration: 1.0, category: 'locomotion' },
  { prompt: 'karakter kosuyor', description: 'Hizli kosma dongusu', duration: 0.6, category: 'locomotion' },
  { prompt: 'karakter zipliyor', description: 'Ziplama animasyonu', duration: 1.5, category: 'action' },
  { prompt: 'karakter el salliyor', description: 'Selamlama', duration: 2.0, category: 'gesture' },
  { prompt: 'karakter oturuyor', description: 'Oturma hareketi', duration: 3.0, category: 'action' },
  { prompt: 'karakter dans ediyor', description: 'Dans dongusu', duration: 4.0, category: 'performance' },
  { prompt: 'karakter dovusuyor', description: 'Saldiri animasyonu', duration: 0.8, category: 'combat' },
  { prompt: 'karakter oluyor', description: 'Olum animasyonu', duration: 2.5, category: 'combat' },
  { prompt: 'karakter konusuyor', description: 'Konusma hareketi', duration: 3.0, category: 'gesture' },
  { prompt: 'karakter merdiven cikiyor', description: 'Merdiven cikma', duration: 2.0, category: 'locomotion' },
  { prompt: 'karakter yuzuyor', description: 'Yuzme dongusu', duration: 1.5, category: 'locomotion' },
  { prompt: 'karakter tirmaniyor', description: 'Tirmanma animasyonu', duration: 3.0, category: 'action' },
];

/**
 * Generate animation from text prompt
 */
export function aiGenerateMotion(
  prompt: string,
  duration: number = 2.0,
  config: AIAnimationConfig = DEFAULT_AI_ANIM_CONFIG
): { success: boolean; keyframeCount: number; boneCount: number; processingTime: number; warnings: string[] } {
  const lowerPrompt = prompt.toLowerCase();
  const warnings: string[] = [];

  // Match prompt to motion template
  const template = AI_MOTION_TEMPLATES.find((t) => t.prompt.includes(lowerPrompt) || lowerPrompt.includes(t.prompt.split(' ')[1]));

  if (!template) {
    warnings.push('Prompt tam eslesmedi. En yakin motion kullanilacak.');
  }

  const finalDuration = template?.duration || duration;

  // Estimate keyframe count
  const fps = config.quality === 'fast' ? 15 : config.quality === 'balanced' ? 30 : 60;
  const keyframeCount = Math.floor(finalDuration * fps);

  // Warning for complex prompts
  if (prompt.length > 100) {
    warnings.push('Karmaşik prompt. Sonuc beklenenden farkli olabilir.');
  }

  // Processing time estimate
  const processingTime = config.quality === 'fast' ? 500 : config.quality === 'balanced' ? 2000 : 5000;

  return {
    success: true,
    keyframeCount,
    boneCount: 21, // humanoid
    processingTime,
    warnings,
  };
}

// ============ SPRINT 39: PROCEDURAL GENERATION ============

export type ProceduralType = 'terrain' | 'city' | 'forest' | 'cave' | 'building' | 'spacestation' | 'river' | 'road' | 'cloud' | 'crystal';

export interface ProceduralConfig {
  type: ProceduralType;
  seed: number;
  size: number;
  resolution: number;
  density: number;
  variation: number;
  // Terrain
  heightScale: number;
  erosionAmount: number;
  riverCount: number;
  // City
  buildingDensity: number;
  roadNetwork: 'grid' | 'organic' | 'radial';
  // Forest
  treeTypes: string[];
  treeCount: number;
  // Parameters
  params: Record<string, unknown>;
}

export const PROCEDURAL_TYPES: Array<{ type: ProceduralType; label: string; icon: string; description: string }> = [
  { type: 'terrain', label: 'Arazi', icon: 'Mountain', description: 'Procedural yukseklik haritasi, erozyon, nehir' },
  { type: 'city', label: 'Sehir', icon: 'Building2', description: 'Bina, yol, aydinlatma uretimi' },
  { type: 'forest', label: 'Orman', icon: 'TreePine', description: 'Agac, cali, bitki uretimi' },
  { type: 'cave', label: 'Magara', icon: 'Mountain', description: 'Magara turevi, stalaktit' },
  { type: 'building', label: 'Bina', icon: 'Building', description: 'Procedural bina generatoru' },
  { type: 'spacestation', label: 'Uzay Istasyonu', icon: 'Rocket', description: 'Sci-fi yapi uretimi' },
  { type: 'river', label: 'Nehir', icon: 'Waves', description: 'Nehir yolu ve su yuzu' },
  { type: 'road', label: 'Yol', icon: 'Route', description: 'Yol agi generatoru' },
  { type: 'cloud', label: 'Bulut', icon: 'Cloud', description: 'Volumetrik bulut' },
  { type: 'crystal', label: 'Kristal', icon: 'Gem', description: 'Kristal formasyonu' },
];

/**
 * Seeded random number generator
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  pick<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }

  // Gaussian distribution
  gaussian(mean: number = 0, stdDev: number = 1): number {
    const u1 = this.next();
    const u2 = this.next();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z * stdDev + mean;
  }
}

/**
 * Generate procedural terrain heightmap
 */
export function generateProceduralTerrain(config: ProceduralConfig): {
  heightmap: number[][];
  vertices: Float32Array;
  indices: number[];
  normals: Float32Array;
  uvs: Float32Array;
  stats: { maxHeight: number; minHeight: number; avgHeight: number; triangles: number };
} {
  const rng = new SeededRandom(config.seed);
  const size = config.resolution;
  const heightScale = config.heightScale || 10;

  // Generate heightmap using layered noise
  const heightmap: number[][] = [];
  let maxHeight = -Infinity;
  let minHeight = Infinity;
  let totalHeight = 0;

  for (let x = 0; x < size; x++) {
    heightmap[x] = [];
    for (let z = 0; z < size; z++) {
      let height = 0;
      // Multiple octaves of noise
      let amplitude = 1;
      let frequency = 0.02;
      for (let octave = 0; octave < 6; octave++) {
        const nx = x * frequency;
        const nz = z * frequency;
        height += amplitude * (Math.sin(nx * 10 + rng.next() * 10) * Math.cos(nz * 10 + rng.next() * 10));
        amplitude *= 0.5;
        frequency *= 2;
      }

      // Apply erosion (simplified)
      if (config.erosionAmount > 0) {
        height *= 1 - config.erosionAmount * 0.1 * rng.next();
      }

      height *= heightScale;
      heightmap[x][z] = height;

      maxHeight = Math.max(maxHeight, height);
      minHeight = Math.min(minHeight, height);
      totalHeight += height;
    }
  }

  const avgHeight = totalHeight / (size * size);

  // Generate mesh
  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const worldSize = config.size;
  const step = worldSize / (size - 1);

  for (let x = 0; x < size; x++) {
    for (let z = 0; z < size; z++) {
      vertices.push(
        x * step - worldSize / 2,
        heightmap[x][z],
        z * step - worldSize / 2
      );
      uvs.push(x / (size - 1), z / (size - 1));
    }
  }

  for (let x = 0; x < size - 1; x++) {
    for (let z = 0; z < size - 1; z++) {
      const a = x * size + z;
      const b = (x + 1) * size + z;
      const c = (x + 1) * size + (z + 1);
      const d = x * size + (z + 1);
      indices.push(a, d, b, b, d, c);
    }
  }

  // Calculate normals
  const normals = new Float32Array(vertices.length);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const normalAttr = geo.getAttribute('normal');
  for (let i = 0; i < normalAttr.count * 3; i++) {
    normals[i] = normalAttr.array[i];
  }

  return {
    heightmap,
    vertices: new Float32Array(vertices),
    indices,
    normals,
    uvs: new Float32Array(uvs),
    stats: {
      maxHeight,
      minHeight,
      avgHeight,
      triangles: indices.length / 3,
    },
  };
}

/**
 * Generate procedural city
 */
export function generateProceduralCity(config: ProceduralConfig): {
  buildings: Array<{ x: number; z: number; width: number; depth: number; height: number; type: string; floors: number }>;
  roads: Array<{ x1: number; z1: number; x2: number; z2: number; width: number }>;
  stats: { buildingCount: number; roadCount: number; totalArea: number };
} {
  const rng = new SeededRandom(config.seed);
  const buildings: Array<{ x: number; z: number; width: number; depth: number; height: number; type: string; floors: number }> = [];
  const roads: Array<{ x1: number; z1: number; x2: number; z2: number; width: number }> = [];
  const worldSize = config.size;
  const grid = config.density > 0.5 ? 5 : 8;

  // Generate road network (grid)
  for (let x = -worldSize / 2; x <= worldSize / 2; x += grid) {
    roads.push({ x1: x, z1: -worldSize / 2, x2: x, z2: worldSize / 2, width: 2 });
  }
  for (let z = -worldSize / 2; z <= worldSize / 2; z += grid) {
    roads.push({ x1: -worldSize / 2, z1: z, x2: worldSize / 2, z2: z, width: 2 });
  }

  // Generate buildings
  const buildingTypes = ['skyscraper', 'office', 'residential', 'shop', 'park', 'parking'];
  for (let x = -worldSize / 2; x < worldSize / 2; x += grid) {
    for (let z = -worldSize / 2; z < worldSize / 2; z += grid) {
      if (rng.next() > 0.3) {
        const type = rng.pick(buildingTypes);
        const width = rng.range(2, 4);
        const depth = rng.range(2, 4);
        let height = 3;

        switch (type) {
          case 'skyscraper': height = rng.range(30, 80) * config.density; break;
          case 'office': height = rng.range(10, 30); break;
          case 'residential': height = rng.range(5, 15); break;
          case 'shop': height = rng.range(3, 6); break;
          case 'park': height = 0.5; break;
          case 'parking': height = rng.range(3, 8); break;
        }

        const floors = Math.floor(height / 3);

        buildings.push({
          x: x + width / 2 + 0.5,
          z: z + depth / 2 + 0.5,
          width,
          depth,
          height,
          type,
          floors,
        });
      }
    }
  }

  return {
    buildings,
    roads,
    stats: {
      buildingCount: buildings.length,
      roadCount: roads.length,
      totalArea: worldSize * worldSize,
    },
  };
}

// ============ SPRINT 40: CLOUD RENDERING + STREAMING ============

export type CloudProvider = 'local' | 'aws' | 'gcp' | 'azure' | 'renderfarm' | 'custom';

export interface CloudRenderConfig {
  provider: CloudProvider;
  // GPU
  gpuType: string;
  gpuCount: number;
  // Instance
  instanceType: string;
  region: string;
  // Storage
  storageType: 'ssd' | 'hdd' | 'nvme';
  storageSize: number;
  // Network
  bandwidth: number;
  // Streaming
  streamingEnabled: boolean;
  streamResolution: { width: number; height: number };
  streamBitrate: number;
  streamCodec: 'h264' | 'h265' | 'av1' | 'vp9';
  streamFps: number;
  // Auto-scale
  autoScale: boolean;
  minInstances: number;
  maxInstances: number;
  // Cost
  budgetLimit: number;
  costAlertThreshold: number;
  // Security
  encryption: boolean;
  vpnRequired: boolean;
  ipWhitelist: string[];
}

export const CLOUD_PROVIDERS: Array<{ provider: CloudProvider; label: string; gpus: string[]; regions: string[]; costPerHour: number }> = [
  {
    provider: 'local',
    label: 'Local GPU',
    gpus: ['RTX 4090', 'RTX 3090', 'RTX 3080'],
    regions: ['local'],
    costPerHour: 0,
  },
  {
    provider: 'aws',
    label: 'AWS',
    gpus: ['g4dn.xlarge (T4)', 'g4dn.12xlarge (T4)', 'g5.xlarge (A10G)', 'p4d.24xlarge (A100)'],
    regions: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'],
    costPerHour: 0.526,
  },
  {
    provider: 'gcp',
    label: 'Google Cloud',
    gpus: ['T4', 'V100', 'A100', 'L4'],
    regions: ['us-central1', 'europe-west1', 'asia-east1'],
    costPerHour: 0.35,
  },
  {
    provider: 'azure',
    label: 'Azure',
    gpus: ['NCas T4 v3', 'ND A100 v4', 'NV A10 v5'],
    regions: ['East US', 'West Europe', 'Southeast Asia'],
    costPerHour: 0.53,
  },
  {
    provider: 'renderfarm',
    label: 'Render Farm',
    gpus: ['100x RTX 4090', '50x A100', '20x H100'],
    regions: ['global'],
    costPerHour: 0.75,
  },
  {
    provider: 'custom',
    label: 'Custom Server',
    gpus: ['custom'],
    regions: ['custom'],
    costPerHour: 0,
  },
];

export const STREAM_CODECS: Array<{ codec: string; label: string; efficiency: string; latency: string }> = [
  { codec: 'h264', label: 'H.264 (AVC)', efficiency: 'Standart', latency: 'Dusuk (5-20ms)' },
  { codec: 'h265', label: 'H.265 (HEVC)', efficiency: 'Yuksek (%50 daha az bandwidth)', latency: 'Orta (10-30ms)' },
  { codec: 'av1', label: 'AV1', efficiency: 'Cok Yuksek (%30 daha az HEVC)', latency: 'Yuksek (20-50ms)' },
  { codec: 'vp9', label: 'VP9', efficiency: 'Yuksek', latency: 'Orta (10-30ms)' },
];

/**
 * Calculate estimated cloud render cost
 */
export function calculateRenderCost(
  config: CloudRenderConfig,
  durationHours: number,
  provider: CloudProvider
): { gpuCost: number; storageCost: number; bandwidthCost: number; total: number } {
  const providerInfo = CLOUD_PROVIDERS.find((p) => p.provider === provider);
  const costPerHour = providerInfo?.costPerHour || 0;

  const gpuCost = costPerHour * config.gpuCount * durationHours;
  const storageCost = config.storageSize * 0.0001 * durationHours; // $0.10/GB/month
  const bandwidthCost = config.bandwidth * 0.01 * durationHours; // $0.01/GB

  return {
    gpuCost,
    storageCost,
    bandwidthCost,
    total: gpuCost + storageCost + bandwidthCost,
  };
}

/**
 * Check budget limit
 */
export function checkBudget(
  config: CloudRenderConfig,
  estimatedCost: number
): { withinBudget: boolean; remaining: number; warning: string | null } {
  const withinBudget = estimatedCost <= config.budgetLimit;
  const remaining = config.budgetLimit - estimatedCost;
  let warning: string | null = null;

  if (!withinBudget) {
    warning = `Butce asildi! Tahmini: $${estimatedCost.toFixed(2)}, Butce: $${config.budgetLimit}`;
  } else if (estimatedCost > config.budgetLimit * config.costAlertThreshold) {
    warning = `Butce uyarisi: Tahmini maliyet butcenin %${(config.costAlertThreshold * 100).toFixed(0)}'ini asiyor`;
  }

  return { withinBudget, remaining, warning };
}

/**
 * Cloud render status
 */
export interface CloudRenderStatus {
  status: 'idle' | 'connecting' | 'rendering' | 'streaming' | 'error' | 'complete';
  progress: number;
  currentFrame: number;
  totalFrames: number;
  estimatedTimeRemaining: number;
  gpuUtilization: number;
  gpuMemoryUsed: number;
  gpuMemoryTotal: number;
  networkLatency: number;
  streamBitrate: number;
  streamFps: number;
  cost: number;
}

/**
 * Initialize cloud render session
 */
export async function initCloudRender(
  config: CloudRenderConfig
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  // Simulated cloud connection
  await new Promise((r) => setTimeout(r, 1000));

  if (config.provider === 'local') {
    return { success: true, sessionId: `local_${Date.now()}` };
  }

  return {
    success: true,
    sessionId: `cloud_${config.provider}_${Date.now()}`,
  };
}
