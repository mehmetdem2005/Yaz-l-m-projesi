/**
 * NEXUS 3D Studio — 3D Production Library v2
 *
 * 40 sprint roadmap uygulaması:
 * - Sprint 1-10: Model yükleme, transform, scene hierarchy, material
 * - Sprint 11-20: Rig, IK/FK, keyframe, animation, retargeting, mocap
 * - Sprint 21-30: LOD, UV, texture baking, shader graph, particles, physics
 * - Sprint 31-40: Multi-user, version control, render farm, AI, cloud
 */

import * as THREE from 'three';

// ============ TYPES ============

export type ModelFormat = 'glb' | 'gltf' | 'fbx' | 'obj' | 'stl' | 'usd' | 'blend' | 'abc';

export interface Bone {
  id: string;
  name: string;
  parentId: string | null;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  children: string[];
  color: string;
  isRoot: boolean;
}

export interface Skeleton {
  id: string;
  name: string;
  bones: Bone[];
  rootBoneId: string;
  totalBones: number;
  maxDepth: number;
}

export interface Keyframe {
  id: string;
  time: number;
  boneId: string;
  property: 'position' | 'rotation' | 'scale';
  value: [number, number, number];
  interpolation: 'linear' | 'step' | 'bezier';
  easing?: string;
}

export interface AnimationClip {
  id: string;
  name: string;
  duration: number;
  fps: number;
  keyframes: Keyframe[];
  loop: boolean;
  loopMode?: 'repeat' | 'ping-pong' | 'once';
}

export interface Material3D {
  id: string;
  name: string;
  type: 'PBR' | 'Phong' | 'Basic' | 'Toon' | 'Custom';
  baseColor: string;
  metallic: number;
  roughness: number;
  emissive: string;
  emissiveIntensity: number;
  albedoMap?: string;
  normalMap?: string;
  metallicMap?: string;
  roughnessMap?: string;
  aoMap?: string;
  emissiveMap?: string;
  opacity: number;
  transparent: boolean;
  doubleSided: boolean;
  wireframe: boolean;
}

export interface SceneObject3D {
  id: string;
  name: string;
  type: 'mesh' | 'light' | 'camera' | 'bone' | 'empty' | 'group';
  visible: boolean;
  locked: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  parentId: string | null;
  children: string[];
  meshId?: string;
  materialId?: string;
  skeletonId?: string;
  // Yeni alanlar — gerçek 3D editör için
  geometryType?: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'plane';
  color?: string;
  metalness?: number;
  roughness?: number;
  wireframe?: boolean;
  // Weight painting için vertex ağırlıkları (boneId → number[])
  vertexWeights?: Record<string, number[]>;
}

export interface Scene3D {
  id: string;
  name: string;
  objects: SceneObject3D[];
  activeObjectId: string | null;
  selectedIds: string[];
  backgroundColor: string;
  fogColor: string;
  fogDensity: number;
  ambientLight: number;
  shadowEnabled: boolean;
  stats: {
    totalPolygons: number;
    totalVertices: number;
    totalDrawCalls: number;
    totalTextures: number;
    memoryUsage: number;
  };
}

// ============ SPRINT 1-10: FORMAT SUPPORT ============

export const FORMAT_INFO: Record<ModelFormat, { name: string; extension: string; supports: string[]; popularity: number }> = {
  glb: { name: 'glTF Binary', extension: '.glb', supports: ['mesh', 'material', 'skeleton', 'animation', 'texture'], popularity: 95 },
  gltf: { name: 'glTF 2.0', extension: '.gltf', supports: ['mesh', 'material', 'skeleton', 'animation', 'texture'], popularity: 90 },
  fbx: { name: 'Autodesk FBX', extension: '.fbx', supports: ['mesh', 'material', 'skeleton', 'animation', 'camera', 'light'], popularity: 85 },
  obj: { name: 'Wavefront OBJ', extension: '.obj', supports: ['mesh', 'material'], popularity: 70 },
  stl: { name: 'STL (3D Print)', extension: '.stl', supports: ['mesh'], popularity: 60 },
  usd: { name: 'Universal Scene Description', extension: '.usd', supports: ['mesh', 'material', 'skeleton', 'animation', 'camera', 'light', 'composition'], popularity: 50 },
  blend: { name: 'Blender', extension: '.blend', supports: ['mesh', 'material', 'skeleton', 'animation', 'particles', 'physics', 'shader-nodes'], popularity: 75 },
  abc: { name: 'Alembic Cache', extension: '.abc', supports: ['mesh', 'animation', 'particles'], popularity: 40 },
};

// ============ SPRINT 11-20: SKELETONS ============

export const HUMANOID_SKELETON: Bone[] = [
  { id: 'root', name: 'Root', parentId: null, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['hips'], color: '#ef4444', isRoot: true },
  { id: 'hips', name: 'Hips', parentId: 'root', position: [0, 0.9, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['spine'], color: '#f97316', isRoot: false },
  { id: 'spine', name: 'Spine', parentId: 'hips', position: [0, 0.2, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['spine1'], color: '#f97316', isRoot: false },
  { id: 'spine1', name: 'Chest', parentId: 'spine', position: [0, 0.2, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['neck', 'shoulder_L', 'shoulder_R'], color: '#f97316', isRoot: false },
  { id: 'neck', name: 'Neck', parentId: 'spine1', position: [0, 0.15, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['head'], color: '#eab308', isRoot: false },
  { id: 'head', name: 'Head', parentId: 'neck', position: [0, 0.15, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: [], color: '#eab308', isRoot: false },
  { id: 'shoulder_L', name: 'Shoulder.L', parentId: 'spine1', position: [0.05, 0.1, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['upperarm_L'], color: '#22c55e', isRoot: false },
  { id: 'upperarm_L', name: 'UpperArm.L', parentId: 'shoulder_L', position: [0.15, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['forearm_L'], color: '#22c55e', isRoot: false },
  { id: 'forearm_L', name: 'Forearm.L', parentId: 'upperarm_L', position: [0.25, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['hand_L'], color: '#22c55e', isRoot: false },
  { id: 'hand_L', name: 'Hand.L', parentId: 'forearm_L', position: [0.22, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['finger_L_1'], color: '#22c55e', isRoot: false },
  { id: 'finger_L_1', name: 'Finger.L', parentId: 'hand_L', position: [0.08, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: [], color: '#22c55e', isRoot: false },
  { id: 'shoulder_R', name: 'Shoulder.R', parentId: 'spine1', position: [-0.05, 0.1, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['upperarm_R'], color: '#06b6d4', isRoot: false },
  { id: 'upperarm_R', name: 'UpperArm.R', parentId: 'shoulder_R', position: [-0.15, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['forearm_R'], color: '#06b6d4', isRoot: false },
  { id: 'forearm_R', name: 'Forearm.R', parentId: 'upperarm_R', position: [-0.25, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['hand_R'], color: '#06b6d4', isRoot: false },
  { id: 'hand_R', name: 'Hand.R', parentId: 'forearm_R', position: [-0.22, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['finger_R_1'], color: '#06b6d4', isRoot: false },
  { id: 'finger_R_1', name: 'Finger.R', parentId: 'hand_R', position: [-0.08, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: [], color: '#06b6d4', isRoot: false },
  { id: 'thigh_L', name: 'Thigh.L', parentId: 'hips', position: [0.08, -0.1, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['calf_L'], color: '#a855f7', isRoot: false },
  { id: 'calf_L', name: 'Calf.L', parentId: 'thigh_L', position: [0, -0.4, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['foot_L'], color: '#a855f7', isRoot: false },
  { id: 'foot_L', name: 'Foot.L', parentId: 'calf_L', position: [0, -0.4, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['toe_L'], color: '#a855f7', isRoot: false },
  { id: 'toe_L', name: 'Toe.L', parentId: 'foot_L', position: [0, -0.05, 0.1], rotation: [0, 0, 0], scale: [1, 1, 1], children: [], color: '#a855f7', isRoot: false },
  { id: 'thigh_R', name: 'Thigh.R', parentId: 'hips', position: [-0.08, -0.1, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['calf_R'], color: '#ec4899', isRoot: false },
  { id: 'calf_R', name: 'Calf.R', parentId: 'thigh_R', position: [0, -0.4, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['foot_R'], color: '#ec4899', isRoot: false },
  { id: 'foot_R', name: 'Foot.R', parentId: 'calf_R', position: [0, -0.4, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['toe_R'], color: '#ec4899', isRoot: false },
  { id: 'toe_R', name: 'Toe.R', parentId: 'foot_R', position: [0, -0.05, 0.1], rotation: [0, 0, 0], scale: [1, 1, 1], children: [], color: '#ec4899', isRoot: false },
];

export const QUADRUPED_SKELETON: Bone[] = [
  { id: 'root', name: 'Root', parentId: null, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['spine'], color: '#ef4444', isRoot: true },
  { id: 'spine', name: 'Spine', parentId: 'root', position: [0, 0.5, 0.5], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['neck', 'tail'], color: '#f97316', isRoot: false },
  { id: 'neck', name: 'Neck', parentId: 'spine', position: [0, 0.3, 0.3], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['head'], color: '#eab308', isRoot: false },
  { id: 'head', name: 'Head', parentId: 'neck', position: [0, 0.2, 0.2], rotation: [0, 0, 0], scale: [1, 1, 1], children: [], color: '#eab308', isRoot: false },
  { id: 'tail', name: 'Tail', parentId: 'spine', position: [0, 0, -0.5], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['tail1'], color: '#22c55e', isRoot: false },
  { id: 'tail1', name: 'Tail.1', parentId: 'tail', position: [0, 0, -0.3], rotation: [0, 0, 0], scale: [1, 1, 1], children: [], color: '#22c55e', isRoot: false },
  { id: 'frontleg_L', name: 'FrontLeg.L', parentId: 'spine', position: [0.2, 0, 0.3], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['frontcalf_L'], color: '#06b6d4', isRoot: false },
  { id: 'frontcalf_L', name: 'FrontCalf.L', parentId: 'frontleg_L', position: [0, -0.4, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['frontfoot_L'], color: '#06b6d4', isRoot: false },
  { id: 'frontfoot_L', name: 'FrontFoot.L', parentId: 'frontcalf_L', position: [0, -0.4, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: [], color: '#06b6d4', isRoot: false },
  { id: 'frontleg_R', name: 'FrontLeg.R', parentId: 'spine', position: [-0.2, 0, 0.3], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['frontcalf_R'], color: '#a855f7', isRoot: false },
  { id: 'frontcalf_R', name: 'FrontCalf.R', parentId: 'frontleg_R', position: [0, -0.4, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['frontfoot_R'], color: '#a855f7', isRoot: false },
  { id: 'frontfoot_R', name: 'FrontFoot.R', parentId: 'frontcalf_R', position: [0, -0.4, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: [], color: '#a855f7', isRoot: false },
  { id: 'backleg_L', name: 'BackLeg.L', parentId: 'spine', position: [0.2, 0, -0.3], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['backcalf_L'], color: '#ec4899', isRoot: false },
  { id: 'backcalf_L', name: 'BackCalf.L', parentId: 'backleg_L', position: [0, -0.4, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['backfoot_L'], color: '#ec4899', isRoot: false },
  { id: 'backfoot_L', name: 'BackFoot.L', parentId: 'backcalf_L', position: [0, -0.4, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: [], color: '#ec4899', isRoot: false },
  { id: 'backleg_R', name: 'BackLeg.R', parentId: 'spine', position: [-0.2, 0, -0.3], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['backcalf_R'], color: '#84cc16', isRoot: false },
  { id: 'backcalf_R', name: 'BackCalf.R', parentId: 'backleg_R', position: [0, -0.4, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['backfoot_R'], color: '#84cc16', isRoot: false },
  { id: 'backfoot_R', name: 'BackFoot.R', parentId: 'backcalf_R', position: [0, -0.4, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: [], color: '#84cc16', isRoot: false },
];

// Bird skeleton (for flying creatures)
export const BIRD_SKELETON: Bone[] = [
  { id: 'root', name: 'Root', parentId: null, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['body'], color: '#ef4444', isRoot: true },
  { id: 'body', name: 'Body', parentId: 'root', position: [0, 0.5, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['neck', 'tail', 'wing_L', 'wing_R'], color: '#f97316', isRoot: false },
  { id: 'neck', name: 'Neck', parentId: 'body', position: [0, 0.15, 0.15], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['head'], color: '#eab308', isRoot: false },
  { id: 'head', name: 'Head', parentId: 'neck', position: [0, 0.1, 0.1], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['beak'], color: '#eab308', isRoot: false },
  { id: 'beak', name: 'Beak', parentId: 'head', position: [0, 0, 0.1], rotation: [0, 0, 0], scale: [1, 1, 1], children: [], color: '#eab308', isRoot: false },
  { id: 'tail', name: 'Tail', parentId: 'body', position: [0, 0, -0.3], rotation: [0, 0, 0], scale: [1, 1, 1], children: [], color: '#22c55e', isRoot: false },
  { id: 'wing_L', name: 'Wing.L', parentId: 'body', position: [0.15, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['wing_L_1'], color: '#06b6d4', isRoot: false },
  { id: 'wing_L_1', name: 'Wing.L.1', parentId: 'wing_L', position: [0.3, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: [], color: '#06b6d4', isRoot: false },
  { id: 'wing_R', name: 'Wing.R', parentId: 'body', position: [-0.15, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: ['wing_R_1'], color: '#a855f7', isRoot: false },
  { id: 'wing_R_1', name: 'Wing.R.1', parentId: 'wing_R', position: [-0.3, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], children: [], color: '#a855f7', isRoot: false },
];

export function createHumanoidSkeleton(name = 'Humanoid'): Skeleton {
  return { id: `skel_${Date.now()}`, name, bones: [...HUMANOID_SKELETON], rootBoneId: 'root', totalBones: HUMANOID_SKELETON.length, maxDepth: 5 };
}

export function createQuadrupedSkeleton(name = 'Quadruped'): Skeleton {
  return { id: `skel_${Date.now()}`, name, bones: [...QUADRUPED_SKELETON], rootBoneId: 'root', totalBones: QUADRUPED_SKELETON.length, maxDepth: 4 };
}

export function createBirdSkeleton(name = 'Bird'): Skeleton {
  return { id: `skel_${Date.now()}`, name, bones: [...BIRD_SKELETON], rootBoneId: 'root', totalBones: BIRD_SKELETON.length, maxDepth: 3 };
}

// ============ SPRINT 14: IK SOLVER ============

export interface IKChain {
  id: string;
  name: string;
  bones: string[]; // bone IDs from root to tip
  target: [number, number, number];
  iterations: number;
  tolerance: number;
}

/**
 * CCD (Cyclic Coordinate Descent) IK solver
 * Classic algorithm for inverse kinematics
 */
export function solveCCD(
  chain: THREE.Vector3[],
  target: THREE.Vector3,
  iterations: number = 10,
  tolerance: number = 0.001
): THREE.Vector3[] {
  const positions = chain.map((p) => p.clone());
  const totalLength = positions.length;

  for (let iter = 0; iter < iterations; iter++) {
    // Check if target reached
    const endEffector = positions[totalLength - 1];
    if (endEffector.distanceTo(target) < tolerance) break;

    // Iterate from second-to-last to first
    for (let i = totalLength - 2; i >= 0; i--) {
      const joint = positions[i];
      const endPos = positions[totalLength - 1];

      // Vectors
      const toEnd = endPos.clone().sub(joint).normalize();
      const toTarget = target.clone().sub(joint).normalize();

      // Angle between
      const dot = THREE.MathUtils.clamp(toEnd.dot(toTarget), -1, 1);
      const angle = Math.acos(dot);
      const axis = new THREE.Vector3().crossVectors(toEnd, toTarget).normalize();

      if (angle > 0.0001 && axis.lengthSq() > 0.0001) {
        // Rotate all bones after this joint
        const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
        for (let j = i + 1; j < totalLength; j++) {
          const offset = positions[j].clone().sub(joint);
          offset.applyQuaternion(quaternion);
          positions[j].copy(joint).add(offset);
        }
      }
    }
  }

  return positions;
}

/**
 * FABRIK (Forward And Backward Reaching Inverse Kinematics)
 * Faster convergence than CCD
 */
export function solveFABRIK(
  chain: THREE.Vector3[],
  target: THREE.Vector3,
  iterations: number = 10,
  tolerance: number = 0.001
): THREE.Vector3[] {
  const positions = chain.map((p) => p.clone());
  const n = positions.length;
  if (n < 2) return positions;

  // Store bone lengths
  const lengths: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    lengths.push(positions[i].distanceTo(positions[i + 1]));
  }
  const totalLength = lengths.reduce((a, b) => a + b, 0);

  // Check if target is reachable
  const rootToTarget = positions[0].distanceTo(target);
  if (rootToTarget > totalLength) {
    // Target unreachable — stretch
    const direction = target.clone().sub(positions[0]).normalize();
    for (let i = 0; i < n - 1; i++) {
      positions[i + 1].copy(positions[i]).add(direction.clone().multiplyScalar(lengths[i]));
    }
    return positions;
  }

  const root = positions[0].clone();

  for (let iter = 0; iter < iterations; iter++) {
    // Backward reaching: set end to target
    positions[n - 1].copy(target);
    for (let i = n - 2; i >= 0; i--) {
      const direction = positions[i].clone().sub(positions[i + 1]).normalize();
      positions[i].copy(positions[i + 1]).add(direction.multiplyScalar(lengths[i]));
    }

    // Forward reaching: set root back
    positions[0].copy(root);
    for (let i = 0; i < n - 1; i++) {
      const direction = positions[i + 1].clone().sub(positions[i]).normalize();
      positions[i + 1].copy(positions[i]).add(direction.multiplyScalar(lengths[i]));
    }

    // Check convergence
    if (positions[n - 1].distanceTo(target) < tolerance) break;
  }

  return positions;
}

// ============ SPRINT 16-20: ANIMATION ============

export const ANIMATION_PRESETS: Array<{ name: string; duration: number; description: string }> = [
  { name: 'Idle', duration: 2.0, description: 'Hafif nefes alma hareketi' },
  { name: 'Walk', duration: 1.0, description: 'Yürüme döngüsü (1 saniye)' },
  { name: 'Run', duration: 0.6, description: 'Koşma döngüsü' },
  { name: 'Jump', duration: 1.5, description: 'Zıplama (başlangıç→havada→iniş)' },
  { name: 'Wave', duration: 2.0, description: 'El sallama' },
  { name: 'Sit', duration: 3.0, description: 'Oturma' },
  { name: 'Dance', duration: 4.0, description: 'Dans döngüsü' },
  { name: 'Attack', duration: 0.8, description: 'Saldırı animasyonu' },
  { name: 'Death', duration: 2.5, description: 'Ölüm animasyonu' },
  { name: 'Talk', duration: 3.0, description: 'Konuşma (baş + el hareketi)' },
];

/**
 * Generate walk cycle keyframes for a humanoid skeleton
 */
export function generateWalkCycle(skeleton: Skeleton, duration: number = 1.0, fps: number = 30): Keyframe[] {
  const keyframes: Keyframe[] = [];
  const frameCount = Math.floor(duration * fps);
  const halfDuration = duration / 2;

  // Leg movement — opposite phase
  const legBones = ['thigh_L', 'thigh_R', 'calf_L', 'calf_R'];
  // Arm movement — opposite to legs
  const armBones = ['upperarm_L', 'upperarm_R', 'forearm_L', 'forearm_R'];

  for (let frame = 0; frame <= frameCount; frame++) {
    const t = (frame / fps);
    const phase = (t / duration) * Math.PI * 2;

    // Legs
    keyframes.push({
      id: `kf_walk_thigh_L_${frame}`,
      time: t,
      boneId: 'thigh_L',
      property: 'rotation',
      value: [Math.sin(phase) * 0.5, 0, 0],
      interpolation: 'linear',
    });
    keyframes.push({
      id: `kf_walk_thigh_R_${frame}`,
      time: t,
      boneId: 'thigh_R',
      property: 'rotation',
      value: [Math.sin(phase + Math.PI) * 0.5, 0, 0],
      interpolation: 'linear',
    });

    // Arms (opposite to legs)
    keyframes.push({
      id: `kf_walk_upperarm_L_${frame}`,
      time: t,
      boneId: 'upperarm_L',
      property: 'rotation',
      value: [Math.sin(phase + Math.PI) * 0.3, 0, 0],
      interpolation: 'linear',
    });
    keyframes.push({
      id: `kf_walk_upperarm_R_${frame}`,
      time: t,
      boneId: 'upperarm_R',
      property: 'rotation',
      value: [Math.sin(phase) * 0.3, 0, 0],
      interpolation: 'linear',
    });
  }

  return keyframes;
}

/**
 * Retarget animation from one skeleton to another
 */
export function retargetAnimation(
  sourceClip: AnimationClip,
  sourceSkeleton: Skeleton,
  targetSkeleton: Skeleton,
  mapping: Record<string, string> = {}
): AnimationClip {
  // Default mapping: match by name
  const retargetedKeyframes: Keyframe[] = [];

  for (const kf of sourceClip.keyframes) {
    const targetBoneId = mapping[kf.boneId] || kf.boneId;
    // Check if target bone exists
    if (targetSkeleton.bones.some((b) => b.id === targetBoneId)) {
      retargetedKeyframes.push({
        ...kf,
        id: `retarget_${kf.id}`,
        boneId: targetBoneId,
      });
    }
  }

  return {
    ...sourceClip,
    id: `retarget_${Date.now()}`,
    name: `${sourceClip.name} (retargeted)`,
    keyframes: retargetedKeyframes,
  };
}

// ============ SPRINT 21-30: LOD, MATERIALS, SHADERS ============

export const LOD_PRESETS = [
  { name: 'Hero (LOD0)', polygonMultiplier: 1.0, distance: 0, description: 'Yakın çekim — tam detay' },
  { name: 'Medium (LOD1)', polygonMultiplier: 0.5, distance: 15, description: 'Orta mesafe — %50 polygon' },
  { name: 'Low (LOD2)', polygonMultiplier: 0.25, distance: 30, description: 'Uzak — %25 polygon' },
  { name: 'Tiny (LOD3)', polygonMultiplier: 0.1, distance: 60, description: 'Çok uzak — %10 polygon' },
  { name: 'Billboard', polygonMultiplier: 0, distance: 100, description: 'Billboard (sprite)' },
];

export const MATERIAL_PRESETS: Material3D[] = [
  { id: 'mat_default', name: 'Default PBR', type: 'PBR', baseColor: '#cccccc', metallic: 0, roughness: 0.5, emissive: '#000000', emissiveIntensity: 0, opacity: 1, transparent: false, doubleSided: false, wireframe: false },
  { id: 'mat_metal', name: 'Polished Metal', type: 'PBR', baseColor: '#c0c0c0', metallic: 1, roughness: 0.1, emissive: '#000000', emissiveIntensity: 0, opacity: 1, transparent: false, doubleSided: false, wireframe: false },
  { id: 'mat_plastic', name: 'Plastic', type: 'PBR', baseColor: '#ff6b6b', metallic: 0, roughness: 0.4, emissive: '#000000', emissiveIntensity: 0, opacity: 1, transparent: false, doubleSided: false, wireframe: false },
  { id: 'mat_glass', name: 'Glass', type: 'PBR', baseColor: '#ffffff', metallic: 0, roughness: 0.05, emissive: '#000000', emissiveIntensity: 0, opacity: 0.3, transparent: true, doubleSided: false, wireframe: false },
  { id: 'mat_emissive', name: 'Emissive', type: 'PBR', baseColor: '#1a1a1a', metallic: 0, roughness: 0.5, emissive: '#00ffff', emissiveIntensity: 2, opacity: 1, transparent: false, doubleSided: false, wireframe: false },
  { id: 'mat_toon', name: 'Toon Shader', type: 'Toon', baseColor: '#ffaa00', metallic: 0, roughness: 1, emissive: '#000000', emissiveIntensity: 0, opacity: 1, transparent: false, doubleSided: false, wireframe: false },
  { id: 'mat_wireframe', name: 'Wireframe Debug', type: 'Basic', baseColor: '#00ff00', metallic: 0, roughness: 1, emissive: '#000000', emissiveIntensity: 0, opacity: 1, transparent: false, doubleSided: true, wireframe: true },
];

// Shader graph nodes (Sprint 26)
export interface ShaderNode {
  id: string;
  type: 'input' | 'output' | 'math' | 'texture' | 'vector' | 'color';
  subtype: string;
  position: { x: number; y: number };
  inputs: Array<{ id: string; name: string; type: string; connected: boolean }>;
  outputs: Array<{ id: string; name: string; type: string; connected: boolean }>;
  properties: Record<string, unknown>;
}

export interface ShaderGraph {
  id: string;
  name: string;
  nodes: ShaderNode[];
  edges: Array<{ id: string; from: string; fromPort: string; to: string; toPort: string }>;
}

export const SHADER_NODE_TYPES: Array<{ type: string; subtype: string; label: string; color: string; inputs: string[]; outputs: string[] }> = [
  // Input
  { type: 'input', subtype: 'position', label: 'Position', color: '#22c55e', inputs: [], outputs: ['vec3'] },
  { type: 'input', subtype: 'normal', label: 'Normal', color: '#22c55e', inputs: [], outputs: ['vec3'] },
  { type: 'input', subtype: 'uv', label: 'UV', color: '#22c55e', inputs: [], outputs: ['vec2'] },
  { type: 'input', subtype: 'time', label: 'Time', color: '#22c55e', inputs: [], outputs: ['float'] },
  // Texture
  { type: 'texture', subtype: 'sample2d', label: 'Texture Sample', color: '#f59e0b', inputs: ['uv'], outputs: ['vec4'] },
  { type: 'texture', subtype: 'sample_cube', label: 'Cubemap Sample', color: '#f59e0b', inputs: ['dir'], outputs: ['vec4'] },
  // Math
  { type: 'math', subtype: 'add', label: 'Add', color: '#3b82f6', inputs: ['a', 'b'], outputs: ['result'] },
  { type: 'math', subtype: 'multiply', label: 'Multiply', color: '#3b82f6', inputs: ['a', 'b'], outputs: ['result'] },
  { type: 'math', subtype: 'subtract', label: 'Subtract', color: '#3b82f6', inputs: ['a', 'b'], outputs: ['result'] },
  { type: 'math', subtype: 'mix', label: 'Mix/Lerp', color: '#3b82f6', inputs: ['a', 'b', 't'], outputs: ['result'] },
  { type: 'math', subtype: 'sine', label: 'Sin', color: '#3b82f6', inputs: ['x'], outputs: ['result'] },
  { type: 'math', subtype: 'cosine', label: 'Cos', color: '#3b82f6', inputs: ['x'], outputs: ['result'] },
  { type: 'math', subtype: 'power', label: 'Power', color: '#3b82f6', inputs: ['base', 'exp'], outputs: ['result'] },
  // Vector
  { type: 'vector', subtype: 'vec3_const', label: 'Vector3', color: '#a855f7', inputs: [], outputs: ['vec3'] },
  { type: 'vector', subtype: 'float_const', label: 'Float', color: '#a855f7', inputs: [], outputs: ['float'] },
  // Color
  { type: 'color', subtype: 'color_const', label: 'Color', color: '#ec4899', inputs: [], outputs: ['vec4'] },
  // Output
  { type: 'output', subtype: 'albedo', label: 'Albedo Output', color: '#ef4444', inputs: ['color'], outputs: [] },
  { type: 'output', subtype: 'normal', label: 'Normal Output', color: '#ef4444', inputs: ['normal'], outputs: [] },
  { type: 'output', subtype: 'emissive', label: 'Emissive Output', color: '#ef4444', inputs: ['color'], outputs: [] },
];

// ============ SPRINT 27-29: PARTICLES & PHYSICS ============

export interface ParticleSystem {
  id: string;
  name: string;
  type: 'fire' | 'smoke' | 'water' | 'spark' | 'snow' | 'rain' | 'explosion' | 'magic' | 'dust';
  maxParticles: number;
  emissionRate: number;
  lifetime: [number, number];
  speed: [number, number];
  size: [number, number];
  color: string;
  gravity: number;
  turbulence: number;
  spread: number;
}

export const PARTICLE_PRESETS: ParticleSystem[] = [
  { id: 'p_fire', name: 'Fire', type: 'fire', maxParticles: 500, emissionRate: 50, lifetime: [0.5, 1.5], speed: [1, 3], size: [0.1, 0.3], color: '#ff6600', gravity: -2, turbulence: 0.5, spread: 0.5 },
  { id: 'p_smoke', name: 'Smoke', type: 'smoke', maxParticles: 200, emissionRate: 20, lifetime: [2, 5], speed: [0.5, 1.5], size: [0.5, 2], color: '#666666', gravity: -0.5, turbulence: 0.3, spread: 1 },
  { id: 'p_water', name: 'Water', type: 'water', maxParticles: 1000, emissionRate: 100, lifetime: [1, 3], speed: [2, 5], size: [0.05, 0.15], color: '#4fc3f7', gravity: 9.8, turbulence: 0.1, spread: 0.3 },
  { id: 'p_spark', name: 'Spark', type: 'spark', maxParticles: 300, emissionRate: 80, lifetime: [0.3, 0.8], speed: [3, 8], size: [0.02, 0.05], color: '#ffff00', gravity: 5, turbulence: 0.8, spread: 2 },
  { id: 'p_snow', name: 'Snow', type: 'snow', maxParticles: 500, emissionRate: 30, lifetime: [5, 10], speed: [0.5, 2], size: [0.1, 0.3], color: '#ffffff', gravity: 1, turbulence: 0.5, spread: 5 },
  { id: 'p_rain', name: 'Rain', type: 'rain', maxParticles: 1000, emissionRate: 200, lifetime: [1, 2], speed: [10, 20], size: [0.02, 0.05], color: '#aaccff', gravity: 15, turbulence: 0.1, spread: 3 },
  { id: 'p_explosion', name: 'Explosion', type: 'explosion', maxParticles: 500, emissionRate: 500, lifetime: [0.5, 2], speed: [5, 15], size: [0.2, 0.5], color: '#ff4400', gravity: 3, turbulence: 1, spread: 3 },
  { id: 'p_magic', name: 'Magic', type: 'magic', maxParticles: 200, emissionRate: 40, lifetime: [1, 3], speed: [0.5, 2], size: [0.1, 0.4], color: '#a855f7', gravity: 0, turbulence: 0.8, spread: 2 },
  { id: 'p_dust', name: 'Dust', type: 'dust', maxParticles: 100, emissionRate: 10, lifetime: [3, 8], speed: [0.1, 0.5], size: [0.05, 0.15], color: '#aaa088', gravity: 0.1, turbulence: 0.2, spread: 4 },
];

export interface PhysicsBody {
  id: string;
  name: string;
  type: 'static' | 'dynamic' | 'kinematic';
  shape: 'box' | 'sphere' | 'capsule' | 'mesh' | 'convex';
  mass: number;
  friction: number;
  restitution: number;
  linearDamping: number;
  angularDamping: number;
  gravityScale: number;
}

export const PHYSICS_PRESETS: PhysicsBody[] = [
  { id: 'phy_static_floor', name: 'Static Floor', type: 'static', shape: 'box', mass: 0, friction: 0.8, restitution: 0.1, linearDamping: 0, angularDamping: 0, gravityScale: 1 },
  { id: 'phy_dynamic_box', name: 'Dynamic Box', type: 'dynamic', shape: 'box', mass: 1, friction: 0.5, restitution: 0.3, linearDamping: 0.1, angularDamping: 0.1, gravityScale: 1 },
  { id: 'phy_bouncy_ball', name: 'Bouncy Ball', type: 'dynamic', shape: 'sphere', mass: 0.5, friction: 0.2, restitution: 0.9, linearDamping: 0.05, angularDamping: 0.05, gravityScale: 1 },
  { id: 'phy_heavy_metal', name: 'Heavy Metal', type: 'dynamic', shape: 'box', mass: 10, friction: 0.7, restitution: 0.05, linearDamping: 0.2, angularDamping: 0.2, gravityScale: 1 },
  { id: 'phy_character', name: 'Character Capsule', type: 'kinematic', shape: 'capsule', mass: 70, friction: 0.9, restitution: 0, linearDamping: 0.8, angularDamping: 1, gravityScale: 1 },
];

// ============ SPRINT 31-40: ENTERPRISE ============

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  color: string; // cursor color
  cursor: { x: number; y: number } | null;
  selectedObjectId: string | null;
  active: boolean;
  lastSeen: number;
}

export interface RenderJob {
  id: string;
  name: string;
  status: 'queued' | 'rendering' | 'completed' | 'failed' | 'canceled';
  progress: number; // 0-100
  priority: number;
  startedAt: string | null;
  completedAt: string | null;
  duration: number | null;
  frames: { total: number; completed: number };
  outputUrl: string | null;
  error: string | null;
  camera: string;
  resolution: string;
  samples: number;
}

export interface AssetLibraryItem {
  id: string;
  name: string;
  category: 'character' | 'environment' | 'prop' | 'material' | 'texture' | 'animation' | 'sound' | 'hdri';
  thumbnail: string;
  format: ModelFormat;
  fileSize: number;
  polygonCount: number;
  author: string;
  license: 'CC0' | 'CC-BY' | 'CC-BY-SA' | 'MIT' | 'Proprietary' | 'Royalty-Free';
  tags: string[];
  rating: number;
  downloads: number;
  url: string;
}

export const ASSET_LIBRARY: AssetLibraryItem[] = [
  { id: 'a_1', name: 'Generic Human Male', category: 'character', thumbnail: '🧍', format: 'glb', fileSize: 2500000, polygonCount: 12000, author: 'NEXUS Team', license: 'CC-BY', tags: ['human', 'male', 'rigged', 'animated'], rating: 4.8, downloads: 15420, url: '/assets/human_male.glb' },
  { id: 'a_2', name: 'Generic Human Female', category: 'character', thumbnail: '🧍‍♀️', format: 'glb', fileSize: 2400000, polygonCount: 11500, author: 'NEXUS Team', license: 'CC-BY', tags: ['human', 'female', 'rigged', 'animated'], rating: 4.7, downloads: 12300, url: '/assets/human_female.glb' },
  { id: 'a_3', name: 'Medieval Castle', category: 'environment', thumbnail: '🏰', format: 'glb', fileSize: 8500000, polygonCount: 85000, author: 'PolyCount', license: 'CC0', tags: ['medieval', 'castle', 'architecture'], rating: 4.9, downloads: 8900, url: '/assets/castle.glb' },
  { id: 'a_4', name: 'Modern Car', category: 'prop', thumbnail: '🚗', format: 'glb', fileSize: 3200000, polygonCount: 28000, author: 'AutoDesign', license: 'CC-BY-SA', tags: ['car', 'vehicle', 'modern'], rating: 4.6, downloads: 6700, url: '/assets/car.glb' },
  { id: 'a_5', name: 'PBR Metal Material', category: 'material', thumbnail: '⚙️', format: 'glb', fileSize: 500000, polygonCount: 0, author: 'NEXUS Team', license: 'CC0', tags: ['metal', 'pbr', 'material'], rating: 4.5, downloads: 21000, url: '/assets/metal_mat.glb' },
  { id: 'a_6', name: 'Forest Environment', category: 'environment', thumbnail: '🌲', format: 'glb', fileSize: 12000000, polygonCount: 150000, author: 'NaturePack', license: 'CC-BY', tags: ['forest', 'nature', 'trees'], rating: 4.8, downloads: 5400, url: '/assets/forest.glb' },
  { id: 'a_7', name: 'Sci-Fi Corridor', category: 'environment', thumbnail: '🚀', format: 'glb', fileSize: 6500000, polygonCount: 45000, author: 'SciFiAssets', license: 'Royalty-Free', tags: ['scifi', 'corridor', 'space'], rating: 4.7, downloads: 4200, url: '/assets/scifi_corridor.glb' },
  { id: 'a_8', name: 'Walk Animation Pack', category: 'animation', thumbnail: '🚶', format: 'glb', fileSize: 800000, polygonCount: 0, author: 'MotionLib', license: 'CC-BY', tags: ['walk', 'run', 'animation', 'mocap'], rating: 4.9, downloads: 18000, url: '/assets/walk_pack.glb' },
  { id: 'a_9', name: 'Studio HDRI', category: 'hdri', thumbnail: '🌅', format: 'glb', fileSize: 15000000, polygonCount: 0, author: 'HDRIHub', license: 'CC0', tags: ['hdri', 'studio', 'lighting'], rating: 4.6, downloads: 9800, url: '/assets/studio_hdri.glb' },
  { id: 'a_10', name: 'Fantasy Sword', category: 'prop', thumbnail: '⚔️', format: 'glb', fileSize: 1200000, polygonCount: 8500, author: 'FantasyAssets', license: 'CC-BY-SA', tags: ['sword', 'weapon', 'fantasy'], rating: 4.5, downloads: 7600, url: '/assets/sword.glb' },
];

// ============ UTILITIES ============

export function getBoneColorByDepth(depth: number): string {
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899'];
  return colors[depth % colors.length];
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatNumber(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 1000000) return `${(n / 1000).toFixed(1)}K`;
  return `${(n / 1000000).toFixed(2)}M`;
}

export function calculateSceneStats(objects: SceneObject3D[]): Scene3D['stats'] {
  let totalPolygons = 0;
  let totalVertices = 0;
  let totalDrawCalls = 0;
  let totalTextures = 0;
  let memoryUsage = 0;

  for (const obj of objects) {
    if (obj.type === 'mesh') {
      totalPolygons += 1000;
      totalVertices += 500;
      totalDrawCalls += 1;
      totalTextures += 3;
      memoryUsage += 5;
    }
  }

  return { totalPolygons, totalVertices, totalDrawCalls, totalTextures, memoryUsage };
}

// ============ SPRINT 37-38: AI RIGGING & ANIMATION ============

export interface AIRiggingResult {
  skeletonId: string;
  confidence: number;
  detectedBones: Array<{ name: string; position: [number, number, number]; confidence: number }>;
  autoWeightPaint: boolean;
}

/**
 * AI-assisted rigging — detect bone positions from mesh
 * (Simulated — real implementation would use ML model)
 */
export function aiDetectSkeleton(meshVertexCount: number, meshType: 'humanoid' | 'quadruped' | 'bird' | 'auto'): AIRiggingResult {
  let detectedType = meshType;
  if (meshType === 'auto') {
    // Simulated AI detection
    detectedType = meshVertexCount > 5000 ? 'humanoid' : 'quadruped';
  }

  const skeleton = detectedType === 'humanoid' ? createHumanoidSkeleton() : detectedType === 'bird' ? createBirdSkeleton() : createQuadrupedSkeleton();

  const detectedBones = skeleton.bones.map((bone) => ({
    name: bone.name,
    position: bone.position,
    confidence: 0.7 + Math.random() * 0.3,
  }));

  return {
    skeletonId: skeleton.id,
    confidence: 0.85 + Math.random() * 0.14,
    detectedBones,
    autoWeightPaint: true,
  };
}

/**
 * AI-assisted animation generation
 */
export function aiGenerateAnimation(
  description: string,
  skeleton: Skeleton,
  duration: number = 2.0
): AnimationClip {
  const keyframes: Keyframe[] = [];
  const desc = description.toLowerCase();

  // Simple AI — match keywords to motion patterns
  if (desc.includes('walk') || desc.includes('yürü')) {
    return {
      id: `ai_walk_${Date.now()}`,
      name: `AI: ${description}`,
      duration,
      fps: 30,
      keyframes: generateWalkCycle(skeleton, duration),
      loop: true,
      loopMode: 'repeat',
    };
  }

  if (desc.includes('wave') || desc.includes('selam')) {
    // Wave animation
    for (let t = 0; t <= duration; t += 0.1) {
      keyframes.push({
        id: `ai_wave_${t}`,
        time: t,
        boneId: 'upperarm_R',
        property: 'rotation',
        value: [0, 0, Math.sin(t * 5) * 0.3 + 1.2],
        interpolation: 'bezier',
      });
    }
  } else if (desc.includes('jump') || desc.includes('zıpla')) {
    // Jump animation
    for (let t = 0; t <= duration; t += 0.05) {
      const phase = t / duration;
      const height = phase < 0.5 ? Math.sin(phase * Math.PI) * 2 : 0;
      keyframes.push({
        id: `ai_jump_root_${t}`,
        time: t,
        boneId: 'root',
        property: 'position',
        value: [0, height, 0],
        interpolation: 'bezier',
      });
    }
  } else {
    // Default idle — breathing
    for (let t = 0; t <= duration; t += 0.1) {
      keyframes.push({
        id: `ai_idle_root_${t}`,
        time: t,
        boneId: 'root',
        property: 'position',
        value: [0, Math.sin(t * 2) * 0.02, 0],
        interpolation: 'bezier',
      });
    }
  }

  return {
    id: `ai_anim_${Date.now()}`,
    name: `AI: ${description}`,
    duration,
    fps: 30,
    keyframes,
    loop: true,
    loopMode: 'repeat',
  };
}

// ============ SPRINT 39: PROCEDURAL GENERATION ============

export interface ProceduralConfig {
  type: 'terrain' | 'city' | 'forest' | 'cave' | 'building' | 'spacestation';
  seed: number;
  size: number;
  density: number;
  variation: number;
  params: Record<string, unknown>;
}

/**
 * Procedural generation — seeded random
 */
export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Generate procedural terrain heightmap
 */
export function generateTerrain(config: ProceduralConfig): number[][] {
  const rng = seededRandom(config.seed);
  const size = config.size;
  const heightmap: number[][] = [];

  // Simple noise (production'da Perlin/Simplex)
  for (let x = 0; x < size; x++) {
    heightmap[x] = [];
    for (let z = 0; z < size; z++) {
      const nx = x / size - 0.5;
      const nz = z / size - 0.5;
      let height = 0;
      height += Math.sin(nx * 10) * Math.cos(nz * 10) * 0.3;
      height += Math.sin(nx * 20 + rng()) * Math.cos(nz * 20 + rng()) * 0.15;
      height += (rng() - 0.5) * 0.05;
      heightmap[x][z] = height;
    }
  }

  return heightmap;
}

/**
 * Generate procedural city layout
 */
export function generateCity(config: ProceduralConfig): Array<{ x: number; z: number; width: number; depth: number; height: number; type: string }> {
  const rng = seededRandom(config.seed);
  const buildings: Array<{ x: number; z: number; width: number; depth: number; height: number; type: string }> = [];
  const size = config.size;
  const grid = 5; // grid spacing

  for (let x = -size / 2; x < size / 2; x += grid) {
    for (let z = -size / 2; z < size / 2; z += grid) {
      if (rng() > 0.7) {
        // Building
        const width = 2 + rng() * 3;
        const depth = 2 + rng() * 3;
        const height = 3 + rng() * 30 * config.density;
        const type = rng() > 0.7 ? 'skyscraper' : rng() > 0.5 ? 'office' : 'residential';
        buildings.push({ x: x + width / 2, z: z + depth / 2, width, depth, height, type });
      }
    }
  }

  return buildings;
}
