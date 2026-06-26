/**
 * NEXUS 3D Studio — VFX & Simulation System (Sprint 26-30)
 *
 * Sprint 26: Shader graph (node-based)
 * Sprint 27: Particle system
 * Sprint 28: Physics simulation
 * Sprint 29: Crowd simulation
 * Sprint 30: Real-time ray tracing (WebGPU)
 */

import * as THREE from 'three';

// ============ SPRINT 26: SHADER GRAPH ============

export interface ShaderGraphNode {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  inputs: Array<{ id: string; name: string; type: string; connected: boolean }>;
  outputs: Array<{ id: string; name: string; type: string }>;
  properties: Record<string, unknown>;
  code: string;
}

export interface ShaderGraphConnection {
  id: string;
  fromNode: string;
  fromPort: string;
  toNode: string;
  toPort: string;
}

export interface ShaderGraphData {
  id: string;
  name: string;
  nodes: ShaderGraphNode[];
  connections: ShaderGraphConnection[];
  vertexShader: string;
  fragmentShader: string;
}

export const SHADER_NODE_LIBRARY_26: Array<{ category: string; nodes: Array<{ type: string; label: string; inputs: string[]; outputs: string[]; code: string }> }> = [
  {
    category: 'Procedural',
    nodes: [
      { type: 'perlin', label: 'Perlin Noise', inputs: ['uv', 'scale'], outputs: ['float'], code: 'float n = perlinNoise(uv * scale);' },
      { type: 'simplex', label: 'Simplex Noise', inputs: ['uv', 'scale'], outputs: ['float'], code: 'float n = simplexNoise(uv * scale);' },
      { type: 'voronoi', label: 'Voronoi', inputs: ['uv', 'scale'], outputs: ['float', 'vec2'], code: 'vec2 v = voronoi(uv * scale);' },
      { type: 'fbm', label: 'FBM', inputs: ['uv', 'scale', 'octaves'], outputs: ['float'], code: 'float f = fbm(uv * scale, octaves);' },
      { type: 'ridge', label: 'Ridge Noise', inputs: ['uv', 'scale'], outputs: ['float'], code: 'float r = ridgeNoise(uv * scale);' },
      { type: 'warp', label: 'Domain Warp', inputs: ['uv', 'noise'], outputs: ['vec2'], code: 'vec2 w = uv + noise * 0.1;' },
    ],
  },
  {
    category: 'Math',
    nodes: [
      { type: 'remap', label: 'Remap', inputs: ['value', 'inMin', 'inMax', 'outMin', 'outMax'], outputs: ['result'], code: 'float r = remap(value, inMin, inMax, outMin, outMax);' },
      { type: 'smoothstep', label: 'Smooth Step', inputs: ['edge0', 'edge1', 'x'], outputs: ['result'], code: 'float s = smoothstep(edge0, edge1, x);' },
      { type: 'lerp', label: 'Lerp', inputs: ['a', 'b', 't'], outputs: ['result'], code: 'float r = mix(a, b, t);' },
      { type: 'frac', label: 'Fractional', inputs: ['x'], outputs: ['result'], code: 'float f = fract(x);' },
      { type: 'distance', label: 'Distance', inputs: ['a', 'b'], outputs: ['float'], code: 'float d = distance(a, b);' },
      { type: 'length', label: 'Length', inputs: ['vec'], outputs: ['float'], code: 'float l = length(vec);' },
    ],
  },
];

/**
 * Compile shader graph to GLSL
 */
export function compileShaderGraph(graph: ShaderGraphData): { vertex: string; fragment: string } {
  const vertex = `// Vertex Shader
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
  vUv = uv;
  vNormal = normalMatrix * normal;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

  let fragment = `// Fragment Shader (generated from graph: ${graph.name})
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
uniform float time;

// Noise functions
float perlinNoise(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float simplexNoise(vec2 p) { return perlinNoise(p); }
vec2 voronoi(vec2 p) { return vec2(perlinNoise(p), perlinNoise(p + 1.0)); }
float fbm(vec2 p, int oct) { float f = 0.0; for(int i = 0; i < 4; i++) { f += perlinNoise(p * pow(2.0, float(i))) * 0.5; } return f; }
float ridgeNoise(vec2 p) { return 1.0 - abs(perlinNoise(p) * 2.0 - 1.0); }
float remap(float v, float a, float b, float c, float d) { return c + (d - c) * (v - a) / (b - a); }

void main() {
`;

  // Process nodes
  for (const node of graph.nodes) {
    fragment += `  // ${node.label}\n`;
    fragment += `  ${node.code}\n`;
  }

  fragment += `  gl_FragColor = vec4(1.0);\n`;
  fragment += `}\n`;

  return { vertex, fragment };
}

// ============ SPRINT 27: PARTICLE SYSTEM ============

export interface ParticleEmitter {
  id: string;
  name: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  shape: 'point' | 'sphere' | 'box' | 'cone' | 'disc' | 'line' | 'mesh';
  shapeSize: THREE.Vector3;
  // Emission
  maxParticles: number;
  emissionRate: number;
  emissionBurst: Array<{ time: number; count: number; cycles: number; interval: number }>;
  // Lifetime
  lifetime: { min: number; max: number };
  // Velocity
  speed: { min: number; max: number };
  direction: THREE.Vector3;
  spread: number;
  // Size
  startSize: { min: number; max: number };
  endSize: { min: number; max: number };
  sizeCurve: string; // easing function name
  // Color
  startColor: THREE.Color;
  endColor: THREE.Color;
  colorGradient: Array<{ position: number; color: THREE.Color }>;
  // Rotation
  startRotation: { min: number; max: number };
  angularVelocity: { min: number; max: number };
  // Physics
  gravity: THREE.Vector3;
  drag: number;
  turbulence: number;
  turbulenceFrequency: number;
  // Render
  renderMode: 'billboard' | 'stretched' | 'mesh' | 'trail';
  material: string;
  texture: string;
  blendMode: 'opaque' | 'additive' | 'alpha' | 'multiply';
  sortMode: 'none' | 'distance' | 'oldestFirst' | 'youngestFirst';
  // Simulation
  simulationSpace: 'local' | 'world';
  maxSpeed: number;
  inheritVelocity: number;
}

export const PARTICLE_PRESETS_27: Array<{ name: string; emoji: string; config: Partial<ParticleEmitter> }> = [
  {
    name: 'Fire',
    emoji: '🔥',
    config: {
      maxParticles: 500,
      emissionRate: 80,
      lifetime: { min: 0.3, max: 1.0 },
      speed: { min: 1, max: 3 },
      direction: new THREE.Vector3(0, 1, 0),
      spread: 0.3,
      startSize: { min: 0.2, max: 0.5 },
      endSize: { min: 0.05, max: 0.1 },
      startColor: new THREE.Color('#ff4400'),
      endColor: new THREE.Color('#ff0000'),
      gravity: new THREE.Vector3(0, -2, 0),
      renderMode: 'billboard',
      blendMode: 'additive',
    },
  },
  {
    name: 'Smoke',
    emoji: '💨',
    config: {
      maxParticles: 200,
      emissionRate: 15,
      lifetime: { min: 2, max: 5 },
      speed: { min: 0.3, max: 1 },
      direction: new THREE.Vector3(0, 1, 0),
      spread: 0.5,
      startSize: { min: 0.3, max: 0.6 },
      endSize: { min: 1.5, max: 3 },
      startColor: new THREE.Color('#666666'),
      endColor: new THREE.Color('#222222'),
      gravity: new THREE.Vector3(0, -0.5, 0),
      drag: 0.5,
      renderMode: 'billboard',
      blendMode: 'alpha',
    },
  },
  {
    name: 'Explosion',
    emoji: '💥',
    config: {
      maxParticles: 500,
      emissionRate: 500,
      emissionBurst: [{ time: 0, count: 500, cycles: 1, interval: 0 }],
      lifetime: { min: 0.5, max: 2 },
      speed: { min: 5, max: 15 },
      spread: 1.0,
      startSize: { min: 0.3, max: 0.8 },
      endSize: { min: 0.1, max: 0.2 },
      startColor: new THREE.Color('#ffff00'),
      endColor: new THREE.Color('#ff0000'),
      gravity: new THREE.Vector3(0, -3, 0),
      drag: 0.3,
      renderMode: 'billboard',
      blendMode: 'additive',
    },
  },
  {
    name: 'Magic Aura',
    emoji: '🔮',
    config: {
      maxParticles: 150,
      emissionRate: 30,
      lifetime: { min: 1, max: 3 },
      speed: { min: 0.2, max: 0.8 },
      direction: new THREE.Vector3(0, 1, 0),
      spread: 0.8,
      startSize: { min: 0.1, max: 0.3 },
      endSize: { min: 0.05, max: 0.1 },
      startColor: new THREE.Color('#a855f7'),
      endColor: new THREE.Color('#3b82f6'),
      gravity: new THREE.Vector3(0, 0, 0),
      turbulence: 1.0,
      renderMode: 'billboard',
      blendMode: 'additive',
    },
  },
  {
    name: 'Rain',
    emoji: '🌧️',
    config: {
      maxParticles: 2000,
      emissionRate: 300,
      lifetime: { min: 0.5, max: 1.5 },
      speed: { min: 15, max: 25 },
      direction: new THREE.Vector3(0, -1, 0),
      spread: 0.05,
      startSize: { min: 0.02, max: 0.04 },
      endSize: { min: 0.02, max: 0.04 },
      startColor: new THREE.Color('#aaccff'),
      endColor: new THREE.Color('#aaccff'),
      gravity: new THREE.Vector3(0, -15, 0),
      renderMode: 'stretched',
      blendMode: 'alpha',
    },
  },
  {
    name: 'Snow',
    emoji: '❄️',
    config: {
      maxParticles: 800,
      emissionRate: 50,
      lifetime: { min: 5, max: 10 },
      speed: { min: 0.5, max: 2 },
      direction: new THREE.Vector3(0, -1, 0),
      spread: 0.5,
      startSize: { min: 0.1, max: 0.3 },
      endSize: { min: 0.1, max: 0.3 },
      startColor: new THREE.Color('#ffffff'),
      endColor: new THREE.Color('#ffffff'),
      gravity: new THREE.Vector3(0, -1, 0),
      turbulence: 0.5,
      renderMode: 'billboard',
      blendMode: 'alpha',
    },
  },
];

// ============ SPRINT 28: PHYSICS SIMULATION ============

export type PhysicsBodyType = 'static' | 'dynamic' | 'kinematic';
export type ColliderShape = 'box' | 'sphere' | 'capsule' | 'mesh' | 'convex' | 'plane' | 'cylinder' | 'cone';

export interface PhysicsBodyConfig {
  id: string;
  name: string;
  type: PhysicsBodyType;
  shape: ColliderShape;
  size: THREE.Vector3;
  mass: number;
  friction: number;
  restitution: number;
  linearDamping: number;
  angularDamping: number;
  gravityScale: number;
  // Collision
  collisionGroups: number;
  collisionMask: number;
  isTrigger: boolean;
  // Constraints
  freezePosition: { x: boolean; y: boolean; z: boolean };
  freezeRotation: { x: boolean; y: boolean; z: boolean };
  // Velocity
  linearVelocity: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  // Material
  physicsMaterial: string;
}

export interface PhysicsJoint {
  id: string;
  type: 'fixed' | 'hinge' | 'ball' | 'slider' | 'cone' | 'spring' | 'motor';
  bodyA: string;
  bodyB: string;
  anchorA: THREE.Vector3;
  anchorB: THREE.Vector3;
  // Hinge
  axis: THREE.Vector3;
  limits: { min: number; max: number };
  // Spring
  stiffness: number;
  damping: number;
  // Motor
  motorSpeed: number;
  motorForce: number;
  enabled: boolean;
}

export interface PhysicsWorldConfig {
  gravity: THREE.Vector3;
  fixedTimeStep: number;
  maxSubSteps: number;
  broadphase: 'naive' | 'sap' | 'grid';
  allowSleep: boolean;
  sleepThreshold: number;
  CCD: boolean; // continuous collision detection
  solverIterations: number;
}

export const DEFAULT_PHYSICS_WORLD: PhysicsWorldConfig = {
  gravity: new THREE.Vector3(0, -9.81, 0),
  fixedTimeStep: 1 / 60,
  maxSubSteps: 3,
  broadphase: 'sap',
  allowSleep: true,
  sleepThreshold: 0.1,
  CCD: false,
  solverIterations: 10,
};

export const PHYSICS_MATERIALS: Array<{ name: string; friction: number; restitution: number; description: string }> = [
  { name: 'Ice', friction: 0.02, restitution: 0.1, description: 'Cok dusuk suretni, dusuk sekmeli' },
  { name: 'Metal', friction: 0.5, restitution: 0.3, description: 'Orta suretni, orta sekmeli' },
  { name: 'Rubber', friction: 0.8, restitution: 0.9, description: 'Yuksek suretni, cok sekmeli' },
  { name: 'Wood', friction: 0.6, restitution: 0.2, description: 'Orta suretni, dusuk sekmeli' },
  { name: 'Concrete', friction: 0.9, restitution: 0.05, description: 'Cok yuksek suretni, cok dusuk sekmeli' },
  { name: 'Glass', friction: 0.3, restitution: 0.4, description: 'Dusuk suretni, orta sekmeli' },
  { name: 'Sand', friction: 0.95, restitution: 0.0, description: 'Cok yuksek suretni, sekmeyen' },
  { name: 'Bouncy', friction: 0.4, restitution: 1.0, description: 'Tamamen sekmeli' },
];

// ============ SPRINT 29: CROWD SIMULATION ============

export type CrowdBehavior = 'flock' | 'wander' | 'seek' | 'flee' | 'evade' | 'pursue' | 'path' | 'queue' | 'flow' | 'separation';

export interface CrowdAgent {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  maxSpeed: number;
  maxForce: number;
  radius: number;
  mass: number;
  // Behavior
  behaviors: CrowdBehavior[];
  target: THREE.Vector3 | null;
  // State
  group: number;
  color: string;
  active: boolean;
}

export interface CrowdConfig {
  agentCount: number;
  behaviors: CrowdBehavior[];
  // Flocking (Boids)
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
  perceptionRadius: number;
  // Seek/Flee
  targetPosition: THREE.Vector3;
  seekWeight: number;
  fleeWeight: number;
  fleeRadius: number;
  // Path following
  path: THREE.Vector3[];
  pathRadius: number;
  // Flow field
  flowFieldResolution: number;
  // Obstacle avoidance
  obstacleAvoidance: boolean;
  obstacleRadius: number;
  // Navigation mesh
  useNavMesh: boolean;
  navMesh: string;
}

export const DEFAULT_CROWD_CONFIG: CrowdConfig = {
  agentCount: 100,
  behaviors: ['flock', 'separation'],
  separationWeight: 1.5,
  alignmentWeight: 1.0,
  cohesionWeight: 1.0,
  perceptionRadius: 5,
  targetPosition: new THREE.Vector3(0, 0, 0),
  seekWeight: 1.0,
  fleeWeight: 1.0,
  fleeRadius: 10,
  path: [],
  pathRadius: 2,
  flowFieldResolution: 10,
  obstacleAvoidance: true,
  obstacleRadius: 1,
  useNavMesh: false,
  navMesh: '',
};

/**
 * Boids flocking algorithm — separation, alignment, cohesion
 */
export function boidsUpdate(
  agents: CrowdAgent[],
  config: CrowdConfig,
  deltaTime: number
): void {
  for (const agent of agents) {
    if (!agent.active) continue;

    const separation = new THREE.Vector3();
    const alignment = new THREE.Vector3();
    const cohesion = new THREE.Vector3();
    let neighborCount = 0;

    // Find neighbors
    for (const other of agents) {
      if (other.id === agent.id || !other.active) continue;
      const dist = agent.position.distanceTo(other.position);
      if (dist < config.perceptionRadius && dist > 0) {
        neighborCount++;
        // Separation
        const away = agent.position.clone().sub(other.position).normalize().divideScalar(dist);
        separation.add(away);
        // Alignment
        alignment.add(other.velocity);
        // Cohesion
        cohesion.add(other.position);
      }
    }

    if (neighborCount > 0) {
      separation.divideScalar(neighborCount).setLength(agent.maxSpeed).sub(agent.velocity).clampLength(0, agent.maxForce);
      alignment.divideScalar(neighborCount).setLength(agent.maxSpeed).sub(agent.velocity).clampLength(0, agent.maxForce);
      cohesion.divideScalar(neighborCount).sub(agent.position).setLength(agent.maxSpeed).sub(agent.velocity).clampLength(0, agent.maxForce);
    }

    // Apply forces
    agent.acceleration.set(0, 0, 0);
    agent.acceleration.add(separation.multiplyScalar(config.separationWeight));
    agent.acceleration.add(alignment.multiplyScalar(config.alignmentWeight));
    agent.acceleration.add(cohesion.multiplyScalar(config.cohesionWeight));

    // Seek target
    if (agent.target) {
      const seek = agent.target.clone().sub(agent.position).setLength(agent.maxSpeed).sub(agent.velocity).clampLength(0, agent.maxForce);
      agent.acceleration.add(seek.multiplyScalar(config.seekWeight));
    }

    // Update velocity and position
    agent.velocity.add(agent.acceleration.clone().multiplyScalar(deltaTime));
    agent.velocity.clampLength(0, agent.maxSpeed);
    agent.position.add(agent.velocity.clone().multiplyScalar(deltaTime));
  }
}

// ============ SPRINT 30: REAL-TIME RAY TRACING (WebGPU) ============

export type RayTracingBackend = 'webgl2' | 'webgpu' | 'pathtracer' | 'hybrid';

export interface RayTracingConfig {
  backend: RayTracingBackend;
  maxBounces: number;
  samplesPerPixel: number;
  resolution: { width: number; height: number };
  // Denoising
  denoiser: 'none' | 'svgf' | 'oidn' | 'temporal';
  denoiseStrength: number;
  // Lighting
  globalIllumination: boolean;
  ambientOcclusion: boolean;
  softShadows: boolean;
  areaLights: boolean;
  // Materials
  refraction: boolean;
  dispersion: boolean;
  subsurfaceScattering: boolean;
  // Effects
  motionBlur: boolean;
  depthOfField: boolean;
  chromaticAberration: boolean;
  bloom: boolean;
  // Performance
  adaptiveSampling: boolean;
  tileSize: number;
  maxRayDepth: number;
  russianRoulette: boolean;
}

export const DEFAULT_RT_CONFIG: RayTracingConfig = {
  backend: 'webgpu',
  maxBounces: 8,
  samplesPerPixel: 4,
  resolution: { width: 1920, height: 1080 },
  denoiser: 'svgf',
  denoiseStrength: 0.5,
  globalIllumination: true,
  ambientOcclusion: true,
  softShadows: true,
  areaLights: true,
  refraction: true,
  dispersion: false,
  subsurfaceScattering: false,
  motionBlur: false,
  depthOfField: false,
  chromaticAberration: false,
  bloom: true,
  adaptiveSampling: true,
  tileSize: 64,
  maxRayDepth: 16,
  russianRoulette: true,
};

export const RT_QUALITY_PRESETS: Array<{ name: string; label: string; config: Partial<RayTracingConfig> }> = [
  {
    name: 'fast',
    label: 'Fast Preview',
    config: { maxBounces: 2, samplesPerPixel: 1, denoiser: 'svgf', globalIllumination: false, softShadows: false },
  },
  {
    name: 'balanced',
    label: 'Balanced',
    config: { maxBounces: 4, samplesPerPixel: 2, denoiser: 'svgf', globalIllumination: true, softShadows: true },
  },
  {
    name: 'high',
    label: 'High Quality',
    config: { maxBounces: 8, samplesPerPixel: 4, denoiser: 'oidn', globalIllumination: true, softShadows: true, refraction: true },
  },
  {
    name: 'cinematic',
    label: 'Cinematic (AAA)',
    config: { maxBounces: 16, samplesPerPixel: 8, denoiser: 'oidn', globalIllumination: true, softShadows: true, refraction: true, dispersion: true, subsurfaceScattering: true, depthOfField: true, motionBlur: true, bloom: true },
  },
  {
    name: 'pathtracer',
    label: 'Path Tracer (Reference)',
    config: { maxBounces: 32, samplesPerPixel: 64, denoiser: 'oidn', globalIllumination: true, softShadows: true, refraction: true, dispersion: true, subsurfaceScattering: true, depthOfField: true, motionBlur: true, bloom: true, adaptiveSampling: true, russianRoulette: true },
  },
];

/**
 * WebGPU support check
 */
export function checkWebGPUSupport(): { supported: boolean; adapter?: string; error?: string } {
  if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
    return { supported: false, error: 'WebGPU bu tarayicida desteklenmiyor. Chrome 113+ gereklidir.' };
  }
  return { supported: true };
}

/**
 * BVH (Bounding Volume Hierarchy) builder
 */
export interface BVHNode {
  bounds: THREE.Box3;
  left: BVHNode | null;
  right: BVHNode | null;
  triangles: number[];
  isLeaf: boolean;
}

export function buildBVH(triangles: Array<{ vertices: [THREE.Vector3, THREE.Vector3, THREE.Vector3] }>, maxLeafSize: number = 4): BVHNode {
  if (triangles.length <= maxLeafSize) {
    const bounds = new THREE.Box3();
    const indices: number[] = [];
    triangles.forEach((tri, i) => {
      tri.vertices.forEach((v) => bounds.expandByPoint(v));
      indices.push(i);
    });
    return { bounds, left: null, right: null, triangles: indices, isLeaf: true };
  }

  // Calculate bounds
  const bounds = new THREE.Box3();
  triangles.forEach((tri) => {
    tri.vertices.forEach((v) => bounds.expandByPoint(v));
  });

  // Find longest axis
  const size = bounds.getSize(new THREE.Vector3());
  let axis: 0 | 1 | 2 = 0;
  if (size.y > size.x && size.y > size.z) axis = 1;
  else if (size.z > size.x && size.z > size.y) axis = 2;

  // Sort by axis
  const sorted = triangles.map((t, i) => ({ tri: t, idx: i, center: t.vertices[0].clone().add(t.vertices[1]).add(t.vertices[2]).divideScalar(3) }));
  sorted.sort((a, b) => (axis === 0 ? a.center.x - b.center.x : axis === 1 ? a.center.y - b.center.y : a.center.z - b.center.z));

  // Split
  const mid = Math.floor(sorted.length / 2);
  const leftTris = sorted.slice(0, mid).map((s) => s.tri);
  const rightTris = sorted.slice(mid).map((s) => s.tri);

  return {
    bounds,
    left: buildBVH(leftTris, maxLeafSize),
    right: buildBVH(rightTris, maxLeafSize),
    triangles: [],
    isLeaf: false,
  };
}
