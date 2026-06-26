/**
 * NEXUS 3D Studio - Skeleton Viz + Weight Paint + IK/FK (Sprint 12-15)
 *
 * Sprint 12: Skeleton gorsellestirme - octahedron, stick, bone shapes
 * Sprint 13: Weight paint - bone influence, vertex weights, heat/diffusion
 * Sprint 14: IK solver - CCD, FABRIK, analytical
 * Sprint 15: FK controls - rotation handles, control shapes
 */

import * as THREE from 'three';

// ============ SPRINT 12: SKELETON VISUALIZATION ============

export type BoneDisplayMode = 'octahedron' | 'stick' | 'b-bone' | 'envelope' | 'wire';

export interface BoneDisplayConfig {
  mode: BoneDisplayMode;
  size: number;
  showNames: boolean;
  showAxes: boolean;
  showPaths: boolean;
  colors: {
    default: string;
    selected: string;
    active: string;
    ikChain: string;
    leftSide: string;
    rightSide: string;
  };
}

export const DEFAULT_BONE_DISPLAY: BoneDisplayConfig = {
  mode: 'octahedron',
  size: 1.0,
  showNames: false,
  showAxes: false,
  showPaths: false,
  colors: {
    default: '#a855f7',
    selected: '#f59e0b',
    active: '#22c55e',
    ikChain: '#06b6d4',
    leftSide: '#22c55e',
    rightSide: '#06b6d4',
  },
};

/**
 * Generate octahedron bone geometry
 */
export function createOctahedronBone(length: number, thickness: number = 0.05): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const t = thickness;
  const l = length;

  const vertices = new Float32Array([
    // Top (head)
    0, 0, 0,
    t, -l * 0.2, 0,
    0, -l * 0.2, t,
    -t, -l * 0.2, 0,
    0, -l * 0.2, -t,
    // Bottom (tail)
    0, -l, 0,
  ]);

  const indices = [
    // Top pyramid
    0, 1, 2,  0, 2, 3,  0, 3, 4,  0, 4, 1,
    // Bottom pyramid
    5, 2, 1,  5, 3, 2,  5, 4, 3,  5, 1, 4,
  ];

  geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Generate stick bone geometry (simple line + joint)
 */
export function createStickBone(length: number): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    0, 0, 0,  0, -length, 0,
  ]), 3));
  return geo;
}

/**
 * Generate B-bone (bezier curve bone) geometry
 */
export function createBBoneBone(length: number, segments: number = 4, thickness: number = 0.08): THREE.BufferGeometry {
  // Simplified - real B-bone uses bezier curve with ease-in/out
  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = -length * t;
    const radius = thickness * (1 - Math.sin(t * Math.PI) * 0.3);

    // Circle vertices at this segment
    const segments2 = 8;
    for (let j = 0; j < segments2; j++) {
      const angle = (j / segments2) * Math.PI * 2;
      positions.push(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      );
    }
  }

  // Build faces
  const seg2 = 8;
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < seg2; j++) {
      const a = i * seg2 + j;
      const b = i * seg2 + (j + 1) % seg2;
      const c = (i + 1) * seg2 + (j + 1) % seg2;
      const d = (i + 1) * seg2 + j;
      indices.push(a, b, c, a, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ============ SPRINT 13: WEIGHT PAINT ============

export type WeightPaintMethod = 'automatic' | 'heat' | 'harmonic' | 'envelope' | 'manual';

export interface WeightPaintConfig {
  method: WeightPaintMethod;
  brushSize: number;
  brushStrength: number;
  brushFalloff: number;
  autoNormalize: boolean;
  maxInfluencesPerVertex: number;
  mirrorWeights: boolean;
  showWeights: boolean;
  colorRamp: Array<{ position: number; color: string }>;
}

export const DEFAULT_WEIGHT_PAINT_CONFIG: WeightPaintConfig = {
  method: 'heat',
  brushSize: 0.5,
  brushStrength: 0.5,
  brushFalloff: 0.5,
  autoNormalize: true,
  maxInfluencesPerVertex: 4,
  mirrorWeights: false,
  showWeights: true,
  colorRamp: [
    { position: 0.0, color: '#0000ff' },
    { position: 0.25, color: '#00ffff' },
    { position: 0.5, color: '#00ff00' },
    { position: 0.75, color: '#ffff00' },
    { position: 1.0, color: '#ff0000' },
  ],
};

export interface VertexWeight {
  vertexIndex: number;
  boneId: string;
  weight: number; // 0-1
}

export interface SkinningData {
  vertexCount: number;
  weights: Map<number, VertexWeight[]>; // vertexIndex → weights
  boneIds: string[];
  maxInfluences: number;
}

/**
 * Automatic weight calculation using heat diffusion
 * Simplified - real impl uses Laplacian matrix
 */
export function calculateAutomaticWeights(
  positions: Float32Array,
  bonePositions: Map<string, THREE.Vector3>,
  method: WeightPaintMethod = 'heat'
): SkinningData {
  const vertexCount = positions.length / 3;
  const weights = new Map<number, VertexWeight[]>();
  const boneIds = Array.from(bonePositions.keys());
  const maxInfluences = 4;

  for (let i = 0; i < vertexCount; i++) {
    const vertex = new THREE.Vector3(
      positions[i * 3],
      positions[i * 3 + 1],
      positions[i * 3 + 2]
    );

    // Calculate distance to each bone
    const distances: Array<{ boneId: string; distance: number }> = [];
    boneIds.forEach((boneId) => {
      const bonePos = bonePositions.get(boneId);
      if (bonePos) {
        distances.push({ boneId, distance: vertex.distanceTo(bonePos) });
      }
    });

    // Sort by distance
    distances.sort((a, b) => a.distance - b.distance);

    // Take closest N bones
    const closest = distances.slice(0, maxInfluences);

    // Convert distances to weights (inverse distance weighting)
    let totalWeight = 0;
    const vertexWeights: VertexWeight[] = closest.map(({ boneId, distance }) => {
      const weight = 1 / (distance + 0.001);
      totalWeight += weight;
      return { vertexIndex: i, boneId, weight };
    });

    // Normalize
    if (totalWeight > 0) {
      vertexWeights.forEach((vw) => {
        vw.weight /= totalWeight;
      });
    }

    weights.set(i, vertexWeights);
  }

  return {
    vertexCount,
    weights,
    boneIds,
    maxInfluences,
  };
}

/**
 * Paint weight at a specific vertex
 */
export function paintWeight(
  skinning: SkinningData,
  vertexIndex: number,
  boneId: string,
  weightDelta: number,
  config: WeightPaintConfig
): void {
  let vertexWeights = skinning.weights.get(vertexIndex) || [];

  // Find existing weight for this bone
  const existing = vertexWeights.find((vw) => vw.boneId === boneId);
  if (existing) {
    existing.weight = Math.max(0, Math.min(1, existing.weight + weightDelta));
  } else {
    vertexWeights.push({ vertexIndex, boneId, weight: Math.max(0, Math.min(1, weightDelta)) });
  }

  // Remove zero weights
  vertexWeights = vertexWeights.filter((vw) => vw.weight > 0.001);

  // Sort by weight descending
  vertexWeights.sort((a, b) => b.weight - a.weight);

  // Limit to max influences
  if (vertexWeights.length > config.maxInfluencesPerVertex) {
    vertexWeights = vertexWeights.slice(0, config.maxInfluencesPerVertex);
  }

  // Auto-normalize
  if (config.autoNormalize) {
    const total = vertexWeights.reduce((s, vw) => s + vw.weight, 0);
    if (total > 0) {
      vertexWeights.forEach((vw) => (vw.weight /= total));
    }
  }

  skinning.weights.set(vertexIndex, vertexWeights);
}

/**
 * Get weight color for visualization
 */
export function getWeightColor(weight: number, ramp: Array<{ position: number; color: string }>): string {
  for (let i = 0; i < ramp.length - 1; i++) {
    if (weight >= ramp[i].position && weight <= ramp[i + 1].position) {
      const t = (weight - ramp[i].position) / (ramp[i + 1].position - ramp[i].position);
      return lerpColor(ramp[i].color, ramp[i + 1].color, t);
    }
  }
  return ramp[ramp.length - 1]?.color || '#000000';
}

function lerpColor(c1: string, c2: string, t: number): string {
  const a = new THREE.Color(c1);
  const b = new THREE.Color(c2);
  return '#' + a.lerp(b, t).getHexString();
}

/**
 * Normalize all weights for a vertex
 */
export function normalizeWeights(weights: VertexWeight[]): VertexWeight[] {
  const total = weights.reduce((s, vw) => s + vw.weight, 0);
  if (total === 0) return weights;
  return weights.map((vw) => ({ ...vw, weight: vw.weight / total }));
}

/**
 * Clean weights - remove very small influences
 */
export function cleanWeights(skinning: SkinningData, threshold: number = 0.01): void {
  skinning.weights.forEach((vertexWeights, vertexIndex) => {
    const cleaned = vertexWeights.filter((vw) => vw.weight >= threshold);
    skinning.weights.set(vertexIndex, cleaned);
  });
}

// ============ SPRINT 14: IK SOLVER (already in nexus-3d.ts) ============
// CCD and FABRIK solvers are in nexus-3d.ts

export interface IKConstraint {
  id: string;
  chainRoot: string;     // bone ID
  chainTip: string;      // bone ID (end effector)
  target: THREE.Vector3;
  poleTarget?: THREE.Vector3;
  iterations: number;
  tolerance: number;
  chainLength: number;
  useTipRotation: boolean;
  weight: number;
}

/**
 * Solve IK chain with pole target
 */
export function solveIKChain(
  bonePositions: THREE.Vector3[],
  target: THREE.Vector3,
  poleTarget: THREE.Vector3 | null,
  iterations: number = 10,
  tolerance: number = 0.001
): THREE.Vector3[] {
  let positions = bonePositions.map((p) => p.clone());

  // First solve with FABRIK
  positions = solveFABRIKInternal(positions, target, iterations, tolerance);

  // Apply pole target if provided
  if (poleTarget) {
    applyPoleTarget(positions, poleTarget);
  }

  return positions;
}

function solveFABRIKInternal(
  chain: THREE.Vector3[],
  target: THREE.Vector3,
  iterations: number,
  tolerance: number
): THREE.Vector3[] {
  const positions = chain.map((p) => p.clone());
  const n = positions.length;
  if (n < 2) return positions;

  const lengths: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    lengths.push(positions[i].distanceTo(positions[i + 1]));
  }
  const totalLength = lengths.reduce((a, b) => a + b, 0);

  const root = positions[0].clone();

  for (let iter = 0; iter < iterations; iter++) {
    // Backward
    positions[n - 1].copy(target);
    for (let i = n - 2; i >= 0; i--) {
      const dir = positions[i].clone().sub(positions[i + 1]).normalize();
      positions[i].copy(positions[i + 1]).add(dir.multiplyScalar(lengths[i]));
    }

    // Forward
    positions[0].copy(root);
    for (let i = 0; i < n - 1; i++) {
      const dir = positions[i + 1].clone().sub(positions[i]).normalize();
      positions[i + 1].copy(positions[i]).add(dir.multiplyScalar(lengths[i]));
    }

    if (positions[n - 1].distanceTo(target) < tolerance) break;
  }

  return positions;
}

function applyPoleTarget(positions: THREE.Vector3[], poleTarget: THREE.Vector3): void {
  if (positions.length < 3) return;

  // For each middle joint, align towards pole target
  for (let i = 1; i < positions.length - 1; i++) {
    const root = positions[0];
    const mid = positions[i];
    const tip = positions[positions.length - 1];

    // Current plane normal
    const v1 = mid.clone().sub(root);
    const v2 = tip.clone().sub(root);
    const normal = v1.clone().cross(v2).normalize();

    // Project pole target onto plane
    const toPole = poleTarget.clone().sub(root);
    const poleOnPlane = toPole.clone().sub(normal.clone().multiplyScalar(toPole.dot(normal)));

    // Rotate mid towards pole
    const currentDir = mid.clone().sub(root).normalize();
    const desiredDir = poleOnPlane.normalize();
    const angle = currentDir.angleTo(desiredDir);
    const axis = currentDir.clone().cross(desiredDir).normalize();

    if (angle > 0.001 && axis.lengthSq() > 0.001) {
      const quat = new THREE.Quaternion().setFromAxisAngle(axis, angle);
      for (let j = i; j < positions.length; j++) {
        const offset = positions[j].clone().sub(root);
        offset.applyQuaternion(quat);
        positions[j].copy(root).add(offset);
      }
    }
  }
}

// ============ SPRINT 15: FK CONTROLS ============

export type ControlShape = 'circle' | 'square' | 'diamond' | 'arrow' | 'cube' | 'sphere' | 'null' | 'custom';

export interface FKControl {
  id: string;
  boneId: string;
  name: string;
  shape: ControlShape;
  size: number;
  color: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  lockedAxes: { x: boolean; y: boolean; z: boolean };
  customProps: Record<string, unknown>;
}

export const CONTROL_SHAPES: Record<ControlShape, { label: string; icon: string; useCase: string }> = {
  circle: { label: 'Circle', icon: 'Circle', useCase: 'Rotation control (IK pole, limb)' },
  square: { label: 'Square', icon: 'Square', useCase: 'Transform control (root, COG)' },
  diamond: { label: 'Diamond', icon: 'Diamond', useCase: 'FK rotation (spine, fingers)' },
  arrow: { label: 'Arrow', icon: 'ArrowUp', useCase: 'Direction control (look at)' },
  cube: { label: 'Cube', icon: 'Box', useCase: 'Full transform (hand, foot)' },
  sphere: { label: 'Sphere', icon: 'Globe', useCase: 'Head control (all-axis rotation)' },
  null: { label: 'Null', icon: 'Crosshair', useCase: 'Group/offset (parent constraint)' },
  custom: { label: 'Custom', icon: 'Shapes', useCase: 'Custom shape mesh' },
};

/**
 * Generate control shape geometry
 */
export function createControlGeometry(shape: ControlShape, size: number = 0.2): THREE.BufferGeometry {
  switch (shape) {
    case 'circle': {
      const geo = new THREE.RingGeometry(size * 0.9, size, 32);
      return geo;
    }
    case 'square': {
      const geo = new THREE.PlaneGeometry(size * 2, size * 2);
      return geo;
    }
    case 'diamond': {
      const geo = new THREE.OctahedronGeometry(size);
      return geo;
    }
    case 'arrow': {
      const group = new THREE.BufferGeometry();
      const positions = new Float32Array([
        0, size, 0,    0, -size * 0.5, 0,
        -size * 0.3, -size * 0.5, 0,
        size * 0.3, -size * 0.5, 0,
      ]);
      group.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      return group;
    }
    case 'cube': {
      return new THREE.BoxGeometry(size * 1.5, size * 1.5, size * 1.5);
    }
    case 'sphere': {
      return new THREE.SphereGeometry(size, 16, 12);
    }
    case 'null': {
      const geo = new THREE.BufferGeometry();
      const s = size;
      const positions = new Float32Array([
        -s, 0, 0,  s, 0, 0,
        0, -s, 0,  0, s, 0,
        0, 0, -s,  0, 0, s,
      ]);
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      return geo;
    }
    default:
      return new THREE.SphereGeometry(size, 8, 6);
  }
}

/**
 * Auto-generate FK controls for a skeleton
 */
export function generateFKControls(
  bones: Array<{ id: string; name: string; type: string; head: THREE.Vector3; tail: THREE.Vector3 }>,
  boneIdToBone: Map<string, any>
): FKControl[] {
  const controls: FKControl[] = [];

  for (const bone of bones) {
    // Skip finger bones (too small for controls)
    if (bone.type === 'finger') continue;

    // Determine shape
    let shape: ControlShape = 'diamond';
    let size = 0.15;

    if (bone.type === 'root') {
      shape = 'square';
      size = 0.3;
    } else if (bone.type === 'head') {
      shape = 'sphere';
      size = 0.25;
    } else if (bone.type === 'hand' || bone.type === 'foot') {
      shape = 'cube';
      size = 0.2;
    } else if (bone.type === 'arm' || bone.type === 'leg') {
      shape = 'circle';
      size = 0.18;
    }

    controls.push({
      id: `ctrl_${bone.id}`,
      boneId: bone.id,
      name: `ctrl_${bone.name}`,
      shape,
      size,
      color: '#4fc3f7',
      position: bone.head.clone(),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(1, 1, 1),
      lockedAxes: { x: false, y: false, z: false },
      customProps: {},
    });
  }

  return controls;
}

/**
 * Control hierarchy - parent controls to match bone hierarchy
 */
export function buildControlHierarchy(
  controls: FKControl[],
  boneIdToParentId: Map<string, string | null>
): Map<string, string | null> {
  const controlParentMap = new Map<string, string | null>();

  for (const control of controls) {
    const boneParent = boneIdToParentId.get(control.boneId);
    if (boneParent) {
      const parentControl = controls.find((c) => c.boneId === boneParent);
      controlParentMap.set(control.id, parentControl?.id || null);
    } else {
      controlParentMap.set(control.id, null);
    }
  }

  return controlParentMap;
}
