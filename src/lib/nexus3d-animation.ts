/**
 * NEXUS 3D Studio — Animation System (Sprint 16-20)
 *
 * Sprint 16: Keyframe animation system
 * Sprint 17: Timeline / Dope sheet
 * Sprint 18: Curve editor (graph editor)
 * Sprint 19: Animation retargeting
 * Sprint 20: Motion capture import (BVH, C3D)
 */

import * as THREE from 'three';

// ============ SPRINT 16: KEYFRAME SYSTEM ============

export type KeyframeInterpolation = 'linear' | 'step' | 'bezier' | 'catmullRom';
export type AnimatedProperty = 'position' | 'rotation' | 'scale' | 'visibility' | 'custom';

export interface KeyframeV2 {
  id: string;
  time: number;
  boneId: string;
  property: AnimatedProperty;
  component: 'x' | 'y' | 'z' | 'w' | 'all';
  value: number | [number, number, number] | [number, number, number, number];
  interpolation: KeyframeInterpolation;
  // Bezier handles
  inTangent?: [number, number]; // [time, value] offset
  outTangent?: [number, number];
  // Metadata
  selected: boolean;
  locked: boolean;
  breakdown: boolean; // in-between pose
}

export interface AnimationTrack {
  id: string;
  boneId: string;
  property: AnimatedProperty;
  keyframes: KeyframeV2[];
  enabled: boolean;
  solo: boolean;
  muted: boolean;
  color: string;
}

export interface AnimationClipV2 {
  id: string;
  name: string;
  duration: number;
  fps: number;
  tracks: AnimationTrack[];
  loop: boolean;
  loopMode: 'repeat' | 'ping-pong' | 'once' | 'clamp';
  // Metadata
  frameCount: number;
  keyframeCount: number;
  createdAt: Date;
  modifiedAt: Date;
}

/**
 * Keyframe interpolation — evaluate value at time t
 */
export function evaluateKeyframe(
  prev: KeyframeV2,
  next: KeyframeV2 | null,
  t: number
): number | [number, number, number] {
  if (!next || t >= next.time) {
    return prev.value;
  }

  const localT = (t - prev.time) / (next.time - prev.time);

  switch (prev.interpolation) {
    case 'step':
      return prev.value;
    case 'linear':
      return lerpValue(prev.value, next.value, localT);
    case 'bezier':
      if (prev.outTangent && next.inTangent) {
        const t1 = prev.outTangent[0];
        const v1 = prev.outTangent[1];
        const t2 = 1 + next.inTangent[0];
        const v2 = 1 + next.inTangent[1];
        return bezierInterpolate(0, 0, t1, v1, t2, v2, 1, 1, localT);
      }
      return lerpValue(prev.value, next.value, localT);
    case 'catmullRom':
      return catmullRomInterpolate(prev.value, next.value, localT);
    default:
      return prev.value;
  }
}

function lerpValue(a: number | [number, number, number], b: number | [number, number, number], t: number): number | [number, number, number] {
  if (typeof a === 'number' && typeof b === 'number') {
    return a + (b - a) * t;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
    ] as [number, number, number];
  }
  return a;
}

function bezierInterpolate(p0x: number, p0y: number, p1x: number, p1y: number, p2x: number, p2y: number, p3x: number, p3y: number, t: number): number {
  const u = 1 - t;
  const x = u * u * u * p0x + 3 * u * u * t * p1x + 3 * u * t * t * p2x + t * t * t * p3x;
  const y = u * u * u * p0y + 3 * u * u * t * p1y + 3 * u * t * t * p2y + t * t * t * p3y;
  return y;
}

function catmullRomInterpolate(a: number | [number, number, number], b: number | [number, number, number], t: number): number | [number, number, number] {
  const t2 = t * t;
  const t3 = t2 * t;
  const blend = 0.5 * (2 * t + (t3 - t) - (2 * t3 - 3 * t2 + 1) * 0 + (t3 - 2 * t2 + t) * 0 + (-t3 + t2) * 1);
  return lerpValue(a, b, blend);
}

/**
 * Add keyframe to track
 */
export function addKeyframe(track: AnimationTrack, keyframe: Omit<KeyframeV2, 'id' | 'selected' | 'locked' | 'breakdown'>): KeyframeV2 {
  const kf: KeyframeV2 = {
    ...keyframe,
    id: `kf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    selected: false,
    locked: false,
    breakdown: false,
  };

  // Insert at correct position (sorted by time)
  const insertIdx = track.keyframes.findIndex((k) => k.time > kf.time);
  if (insertIdx === -1) {
    track.keyframes.push(kf);
  } else {
    track.keyframes.splice(insertIdx, 0, kf);
  }

  return kf;
}

/**
 * Remove keyframe
 */
export function removeKeyframe(track: AnimationTrack, keyframeId: string): void {
  track.keyframes = track.keyframes.filter((k) => k.id !== keyframeId);
}

/**
 * Move keyframe in time
 */
export function moveKeyframe(track: AnimationTrack, keyframeId: string, newTime: number): void {
  const kf = track.keyframes.find((k) => k.id === keyframeId);
  if (kf && !kf.locked) {
    kf.time = newTime;
    // Re-sort
    track.keyframes.sort((a, b) => a.time - b.time);
  }
}

// ============ SPRINT 17: TIMELINE / DOPE SHEET ============

export interface TimelineConfig {
  startTime: number;
  endTime: number;
  currentTime: number;
  fps: number;
  pixelsPerSecond: number;
  rowHeight: number;
  headerHeight: number;
  showFrameNumbers: boolean;
  showTimecode: boolean;
  snapToFrames: boolean;
  snapToKeyframes: boolean;
  colorScheme: 'dark' | 'light';
}

export const DEFAULT_TIMELINE_CONFIG: TimelineConfig = {
  startTime: 0,
  endTime: 10,
  currentTime: 0,
  fps: 30,
  pixelsPerSecond: 80,
  rowHeight: 24,
  headerHeight: 28,
  showFrameNumbers: true,
  showTimecode: false,
  snapToFrames: true,
  snapToKeyframes: true,
  colorScheme: 'dark',
};

/**
 * Convert time to frame number
 */
export function timeToFrame(time: number, fps: number): number {
  return Math.round(time * fps);
}

/**
 * Convert frame to time
 */
export function frameToTime(frame: number, fps: number): number {
  return frame / fps;
}

/**
 * Format time as timecode (MM:SS:FF)
 */
export function formatTimecode(time: number, fps: number): string {
  const totalFrames = Math.round(time * fps);
  const minutes = Math.floor(totalFrames / (fps * 60));
  const seconds = Math.floor((totalFrames / fps) % 60);
  const frames = totalFrames % fps;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
}

/**
 * Snap time to frame boundary
 */
export function snapToFrame(time: number, fps: number): number {
  return Math.round(time * fps) / fps;
}

/**
 * Snap time to nearest keyframe
 */
export function snapToKeyframe(time: number, keyframes: KeyframeV2[], threshold: number = 0.05): number {
  let closestTime = time;
  let closestDist = Infinity;
  for (const kf of keyframes) {
    const dist = Math.abs(kf.time - time);
    if (dist < closestDist && dist < threshold) {
      closestDist = dist;
      closestTime = kf.time;
    }
  }
  return closestTime;
}

/**
 * Timeline playback state
 */
export interface PlaybackState {
  isPlaying: boolean;
  isLooping: boolean;
  speed: number; // 0.25, 0.5, 1.0, 2.0
  direction: 'forward' | 'backward';
  currentTime: number;
  startFrame: number;
  endFrame: number;
  currentFrame: number;
}

export const DEFAULT_PLAYBACK: PlaybackState = {
  isPlaying: false,
  isLooping: true,
  speed: 1.0,
  direction: 'forward',
  currentTime: 0,
  startFrame: 0,
  endFrame: 300,
  currentFrame: 0,
};

// ============ SPRINT 18: CURVE EDITOR (GRAPH EDITOR) ============

export interface CurveEditorConfig {
  minValue: number;
  maxValue: number;
  pixelsPerSecond: number;
  pixelsPerValue: number;
  showGrid: boolean;
  gridTimeStep: number;
  gridValueStep: number;
  showTangents: boolean;
  showFrameNumbers: boolean;
  pan: { x: number; y: number };
  zoom: { x: number; y: number };
  curveColor: string;
  keyframeColor: string;
  selectedColor: string;
  tangentColor: string;
  gridColor: string;
  backgroundColor: string;
}

export const DEFAULT_CURVE_EDITOR_CONFIG: CurveEditorConfig = {
  minValue: -10,
  maxValue: 10,
  pixelsPerSecond: 80,
  pixelsPerValue: 30,
  showGrid: true,
  gridTimeStep: 1,
  gridValueStep: 1,
  showTangents: true,
  showFrameNumbers: true,
  pan: { x: 0, y: 0 },
  zoom: { x: 1, y: 1 },
  curveColor: '#4fc3f7',
  keyframeColor: '#f59e0b',
  selectedColor: '#22c55e',
  tangentColor: '#a855f7',
  gridColor: '#2a2a3e',
  backgroundColor: '#1a1a2e',
};

/**
 * Evaluate a track's curve at a given time
 */
export function evaluateTrackCurve(track: AnimationTrack, time: number): number | [number, number, number] {
  if (track.keyframes.length === 0) return 0;
  if (track.keyframes.length === 1) return track.keyframes[0].value;
  if (time <= track.keyframes[0].time) return track.keyframes[0].value;
  if (time >= track.keyframes[track.keyframes.length - 1].time) return track.keyframes[track.keyframes.length - 1].value;

  for (let i = 0; i < track.keyframes.length - 1; i++) {
    const prev = track.keyframes[i];
    const next = track.keyframes[i + 1];
    if (time >= prev.time && time <= next.time) {
      return evaluateKeyframe(prev, next, time);
    }
  }

  return 0;
}

/**
 * Sample curve at regular intervals for display
 */
export function sampleCurve(track: AnimationTrack, startTime: number, endTime: number, samples: number = 100): Array<{ time: number; value: number | [number, number, number] }> {
  const result: Array<{ time: number; value: number | [number, number, number] }> = [];
  const dt = (endTime - startTime) / samples;

  for (let i = 0; i <= samples; i++) {
    const t = startTime + i * dt;
    result.push({ time: t, value: evaluateTrackCurve(track, t) });
  }

  return result;
}

/**
 * Auto-set tangent handles for smooth animation
 */
export function autoTangents(keyframes: KeyframeV2[], mode: 'auto' | 'clamped' | 'flat' | 'linear' | 'step'): void {
  for (let i = 0; i < keyframes.length; i++) {
    const kf = keyframes[i];
    const prev = keyframes[i - 1];
    const next = keyframes[i + 1];

    switch (mode) {
      case 'flat':
        kf.inTangent = [-0.3, 0];
        kf.outTangent = [0.3, 0];
        break;
      case 'linear':
        kf.interpolation = 'linear';
        kf.inTangent = undefined;
        kf.outTangent = undefined;
        break;
      case 'step':
        kf.interpolation = 'step';
        kf.inTangent = undefined;
        kf.outTangent = undefined;
        break;
      case 'auto':
      case 'clamped':
        if (prev && next) {
          const dt = next.time - prev.time;
          const dv = getValueScalar(next.value) - getValueScalar(prev.value);
          const slope = dv / dt;
          kf.inTangent = [-dt * 0.3, -slope * dt * 0.3];
          kf.outTangent = [dt * 0.3, slope * dt * 0.3];
        } else if (prev) {
          kf.inTangent = [-0.3, 0];
          kf.outTangent = [0.3, 0];
        } else if (next) {
          kf.inTangent = [-0.3, 0];
          kf.outTangent = [0.3, 0];
        }
        kf.interpolation = 'bezier';
        break;
    }
  }
}

function getValueScalar(value: number | [number, number, number] | [number, number, number, number]): number {
  if (typeof value === 'number') return value;
  if (Array.isArray(value)) return value[0];
  return 0;
}

// ============ SPRINT 19: ANIMATION RETARGETING ============

export interface RetargetMapping {
  sourceBoneId: string;
  targetBoneId: string;
  // Optional offset for bone length difference
  positionOffset: [number, number, number];
  rotationOffset: [number, number, number];
  scaleOffset: number;
  enabled: boolean;
}

export interface RetargetConfig {
  mapping: RetargetMapping[];
  sourceSkeleton: string;
  targetSkeleton: string;
  // Options
  preserveRootMotion: boolean;
  scaleToTarget: boolean;
  matchBoneLengths: boolean;
  // Animation space
  space: 'local' | 'world';
  // Rotation order
  rotationOrder: 'XYZ' | 'XZY' | 'YXZ' | 'YZX' | 'ZXY' | 'ZYX';
}

/**
 * Auto-generate retarget mapping by matching bone names
 */
export function autoGenerateMapping(
  sourceBones: Array<{ id: string; name: string }>,
  targetBones: Array<{ id: string; name: string }>
): RetargetMapping[] {
  const mapping: RetargetMapping[] = [];
  const targetMap = new Map(targetBones.map((b) => [b.name.toLowerCase(), b.id]));

  for (const source of sourceBones) {
    const targetId = targetMap.get(source.name.toLowerCase());
    if (targetId) {
      mapping.push({
        sourceBoneId: source.id,
        targetBoneId: targetId,
        positionOffset: [0, 0, 0],
        rotationOffset: [0, 0, 0],
        scaleOffset: 1,
        enabled: true,
      });
    }
  }

  return mapping;
}

/**
 * Retarget animation clip from source to target skeleton
 */
export function retargetAnimationClip(
  sourceClip: AnimationClipV2,
  config: RetargetConfig
): AnimationClipV2 {
  const retargetedTracks: AnimationTrack[] = [];

  for (const track of sourceClip.tracks) {
    const mapping = config.mapping.find((m) => m.sourceBoneId === track.boneId && m.enabled);
    if (!mapping) continue;

    // Clone track with new boneId
    const newTrack: AnimationTrack = {
      ...track,
      id: `retarget_${track.id}`,
      boneId: mapping.targetBoneId,
      keyframes: track.keyframes.map((kf) => ({
        ...kf,
        id: `retarget_${kf.id}`,
        // Apply scale offset to position values
        value: applyRetargetOffset(kf.value, mapping, kf.property),
      })),
    };

    retargetedTracks.push(newTrack);
  }

  return {
    ...sourceClip,
    id: `retarget_clip_${Date.now()}`,
    name: `${sourceClip.name} (retargeted)`,
    tracks: retargetedTracks,
    keyframeCount: retargetedTracks.reduce((s, t) => s + t.keyframes.length, 0),
    modifiedAt: new Date(),
  };
}

function applyRetargetOffset(
  value: number | [number, number, number] | [number, number, number, number],
  mapping: RetargetMapping,
  property: AnimatedProperty
): number | [number, number, number] {
  if (property === 'position' && Array.isArray(value) && value.length === 3) {
    return [
      (value[0] + mapping.positionOffset[0]) * mapping.scaleOffset,
      (value[1] + mapping.positionOffset[1]) * mapping.scaleOffset,
      (value[2] + mapping.positionOffset[2]) * mapping.scaleOffset,
    ] as [number, number, number];
  }
  if (property === 'scale' && Array.isArray(value) && value.length === 3) {
    return [
      value[0] * mapping.scaleOffset,
      value[1] * mapping.scaleOffset,
      value[2] * mapping.scaleOffset,
    ] as [number, number, number];
  }
  return value;
}

// ============ SPRINT 20: MOTION CAPTURE IMPORT ============

export interface BVHHierarchy {
  name: string;
  type: 'ROOT' | 'JOINT' | 'END_SITE';
  offset: [number, number, number];
  channels: string[]; // Xposition, Yposition, Zposition, Xrotation, Yrotation, Zrotation
  children: BVHHierarchy[];
}

export interface BVHFile {
  hierarchy: BVHHierarchy;
  frameTime: number;
  frameCount: number;
  frames: number[][];
  totalJoints: number;
  totalChannels: number;
}

/**
 * Parse BVH (Biovision Hierarchy) file
 */
export function parseBVH(content: string): BVHFile {
  const lines = content.split('\n').map((l) => l.trim());
  let lineIdx = 0;
  let totalJoints = 0;
  let totalChannels = 0;

  function parseJoint(indent: number): BVHHierarchy {
    const line = lines[lineIdx++];
    const parts = line.split(/\s+/);

    const type = parts[0] === 'ROOT' ? 'ROOT' : parts[0] === 'JOINT' ? 'JOINT' : 'END_SITE';
    const name = type === 'END_SITE' ? 'End Site' : parts[1] || `Joint_${totalJoints}`;

    if (type !== 'END_SITE') totalJoints++;

    // Skip {
    lineIdx++;

    // OFFSET
    const offsetLine = lines[lineIdx++];
    const offsetParts = offsetLine.split(/\s+/);
    const offset: [number, number, number] = [
      parseFloat(offsetParts[1]),
      parseFloat(offsetParts[2]),
      parseFloat(offsetParts[3]),
    ];

    let channels: string[] = [];
    if (type !== 'END_SITE') {
      const channelsLine = lines[lineIdx++];
      const channelParts = channelsLine.split(/\s+/);
      const channelCount = parseInt(channelParts[1]);
      channels = channelParts.slice(2, 2 + channelCount);
      totalChannels += channelCount;
    }

    // Children
    const children: BVHHierarchy[] = [];
    while (lineIdx < lines.length) {
      const nextLine = lines[lineIdx].trim();
      if (nextLine === '}') {
        lineIdx++;
        break;
      }
      if (nextLine.startsWith('JOINT') || nextLine.startsWith('ROOT')) {
        children.push(parseJoint(indent + 1));
      } else if (nextLine.startsWith('End Site')) {
        lineIdx++; // skip "End Site"
        lineIdx++; // skip "{"
        children.push(parseJoint(indent + 1));
      } else {
        lineIdx++;
      }
    }

    return { name, type, offset, channels, children };
  }

  // Parse HIERARCHY section
  lineIdx = 0;
  if (lines[lineIdx] === 'HIERARCHY') lineIdx++;
  const hierarchy = parseJoint(0);

  // Parse MOTION section
  let frameTime = 0;
  let frameCount = 0;
  const frames: number[][] = [];

  while (lineIdx < lines.length) {
    const line = lines[lineIdx++];
    if (line.startsWith('Frames:')) {
      frameCount = parseInt(line.split(':')[1].trim());
    } else if (line.startsWith('Frame Time:')) {
      frameTime = parseFloat(line.split(':')[1].trim());
    } else if (line && !isNaN(parseFloat(line.split(/\s+/)[0]))) {
      const frameData = line.split(/\s+/).map(parseFloat);
      frames.push(frameData);
    }
  }

  return {
    hierarchy,
    frameTime,
    frameCount: frameCount || frames.length,
    frames,
    totalJoints,
    totalChannels,
  };
}

/**
 * Convert BVH to animation clip
 */
export function bvhToAnimationClip(bvh: BVHFile, fps: number = 30): AnimationClipV2 {
  const tracks: AnimationTrack[] = [];
  const duration = bvh.frameCount * bvh.frameTime;

  // Build bone list from hierarchy
  const bones: Array<{ name: string; channels: string[]; offset: number }> = [];
  let channelOffset = 0;

  function collectBones(hierarchy: BVHHierarchy) {
    if (hierarchy.type !== 'END_SITE') {
      bones.push({
        name: hierarchy.name,
        channels: hierarchy.channels,
        offset: channelOffset,
      });
      channelOffset += hierarchy.channels.length;
    }
    hierarchy.children.forEach(collectBones);
  }
  collectBones(bvh.hierarchy);

  // Create tracks for each bone
  for (const bone of bones) {
    const hasPosition = bone.channels.some((c) => c.includes('position'));
    const hasRotation = bone.channels.some((c) => c.includes('rotation'));

    if (hasPosition) {
      const keyframes: KeyframeV2[] = [];
      for (let frame = 0; frame < bvh.frames.length; frame++) {
        const data = bvh.frames[frame];
        const x = data[bone.offset + bone.channels.indexOf('Xposition')] || 0;
        const y = data[bone.offset + bone.channels.indexOf('Yposition')] || 0;
        const z = data[bone.offset + bone.channels.indexOf('Zposition')] || 0;
        keyframes.push({
          id: `bvh_pos_${bone.name}_${frame}`,
          time: frame * bvh.frameTime,
          boneId: bone.name,
          property: 'position',
          component: 'all',
          value: [x, y, z],
          interpolation: 'linear',
          selected: false,
          locked: false,
          breakdown: false,
        });
      }
      tracks.push({
        id: `track_pos_${bone.name}`,
        boneId: bone.name,
        property: 'position',
        keyframes,
        enabled: true,
        solo: false,
        muted: false,
        color: '#22c55e',
      });
    }

    if (hasRotation) {
      const keyframes: KeyframeV2[] = [];
      for (let frame = 0; frame < bvh.frames.length; frame++) {
        const data = bvh.frames[frame];
        const xRot = data[bone.offset + bone.channels.indexOf('Xrotation')] || 0;
        const yRot = data[bone.offset + bone.channels.indexOf('Yrotation')] || 0;
        const zRot = data[bone.offset + bone.channels.indexOf('Zrotation')] || 0;
        keyframes.push({
          id: `bvh_rot_${bone.name}_${frame}`,
          time: frame * bvh.frameTime,
          boneId: bone.name,
          property: 'rotation',
          component: 'all',
          value: [xRot, yRot, zRot],
          interpolation: 'linear',
          selected: false,
          locked: false,
          breakdown: false,
        });
      }
      tracks.push({
        id: `track_rot_${bone.name}`,
        boneId: bone.name,
        property: 'rotation',
        keyframes,
        enabled: true,
        solo: false,
        muted: false,
        color: '#4fc3f7',
      });
    }
  }

  return {
    id: `bvh_clip_${Date.now()}`,
    name: 'BVH Motion Capture',
    duration,
    fps,
    tracks,
    loop: true,
    loopMode: 'repeat',
    frameCount: bvh.frameCount,
    keyframeCount: tracks.reduce((s, t) => s + t.keyframes.length, 0),
    createdAt: new Date(),
    modifiedAt: new Date(),
  };
}

/**
 * C3D motion capture format info
 */
export const C3D_INFO = {
  description: 'C3D (Coordinate 3D) is the standard motion capture file format',
  features: [
    '3D marker positions',
    'Analog signal data (force plates, EMG)',
    'Subject parameters',
    'Trial information',
  ],
  maxMarkers: 65535,
  maxFrames: 65535,
  maxAnalogChannels: 65535,
  typicalFps: [30, 60, 100, 120, 200, 240, 360, 480, 1000],
  commonSystems: ['Vicon', 'OptiTrack', 'Qualisys', 'Motion Analysis', 'PhaseSpace'],
};

/**
 * Animation export formats
 */
export const ANIMATION_EXPORT_FORMATS: Array<{ format: string; label: string; description: string }> = [
  { format: 'bvh', label: 'BVH', description: 'Biovision Hierarchy (mocap standard)' },
  { format: 'glb', label: 'glTF (embedded)', description: 'glTF 2.0 with animation' },
  { format: 'fbx', label: 'FBX', description: 'Autodesk FBX (industry standard)' },
  { format: 'usd', label: 'USD', description: 'Universal Scene Description' },
  { format: 'abc', label: 'Alembic', description: 'Alembic cache (VFX)' },
  { format: 'json', label: 'JSON', description: 'Custom JSON format' },
];
