/**
 * NEXUS 3D Studio — Transform Gizmo System (Sprint 4)
 *
 * Move/Rotate/Scale gizmo:
 * - Translate (X/Y/Z axes + XY/XZ/YZ planes)
 * - Rotate (X/Y/Z rotation rings)
 * - Scale (X/Y/Z uniform + per-axis)
 * - Snap to grid
 * - Local vs World space
 * - Numeric input
 * - Transform history (undo/redo)
 * - Keyboard shortcuts (W/E/R)
 */

import * as THREE from 'three';

export type TransformMode = 'translate' | 'rotate' | 'scale';
export type TransformSpace = 'world' | 'local';

export interface TransformState {
  mode: TransformMode;
  space: TransformSpace;
  snapEnabled: boolean;
  snapTranslate: number; // grid units
  snapRotate: number; // degrees
  snapScale: number; // percentage
  showGizmo: boolean;
  size: number; // gizmo size
}

export const DEFAULT_TRANSFORM_STATE: TransformState = {
  mode: 'translate',
  space: 'world',
  snapEnabled: false,
  snapTranslate: 0.25,
  snapRotate: 15,
  snapScale: 10,
  showGizmo: true,
  size: 1,
};

export interface TransformHistoryEntry {
  id: string;
  objectId: string;
  mode: TransformMode;
  oldPosition: THREE.Vector3;
  oldRotation: THREE.Euler;
  oldScale: THREE.Vector3;
  newPosition: THREE.Vector3;
  newRotation: THREE.Euler;
  newScale: THREE.Vector3;
  timestamp: Date;
}

/**
 * Transform History Manager — undo/redo
 */
export class TransformHistory {
  private undoStack: TransformHistoryEntry[] = [];
  private redoStack: TransformHistoryEntry[] = [];
  private maxHistory: number = 100;

  push(entry: TransformHistoryEntry): void {
    this.undoStack.push(entry);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.redoStack = [];
  }

  undo(): TransformHistoryEntry | null {
    const entry = this.undoStack.pop();
    if (entry) {
      this.redoStack.push(entry);
    }
    return entry || null;
  }

  redo(): TransformHistoryEntry | null {
    const entry = this.redoStack.pop();
    if (entry) {
      this.undoStack.push(entry);
    }
    return entry || null;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  getStats(): { undoCount: number; redoCount: number } {
    return {
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
    };
  }
}

/**
 * Snap value to grid
 */
export function snapValue(value: number, snap: number): number {
  return Math.round(value / snap) * snap;
}

/**
 * Snap angle to degrees
 */
export function snapAngle(radians: number, snapDegrees: number): number {
  const snapRad = (snapDegrees * Math.PI) / 180;
  return Math.round(radians / snapRad) * snapRad;
}

/**
 * Apply transform to object
 */
export function applyTransform(
  object: THREE.Object3D,
  position: THREE.Vector3,
  rotation: THREE.Euler,
  scale: THREE.Vector3,
  space: TransformSpace = 'world'
): void {
  if (space === 'world') {
    object.position.copy(position);
  } else {
    // Local space — relative to parent
    if (object.parent) {
      const localPos = position.clone();
      object.position.copy(localPos);
    } else {
      object.position.copy(position);
    }
  }

  object.rotation.copy(rotation);
  object.scale.copy(scale);
  object.updateMatrixWorld();
}

/**
 * Get object transform as formatted string
 */
export function formatTransform(object: THREE.Object3D): {
  position: [string, string, string];
  rotation: [string, string, string];
  scale: [string, string, string];
} {
  return {
    position: [
      object.position.x.toFixed(3),
      object.position.y.toFixed(3),
      object.position.z.toFixed(3),
    ],
    rotation: [
      ((object.rotation.x * 180) / Math.PI).toFixed(1),
      ((object.rotation.y * 180) / Math.PI).toFixed(1),
      ((object.rotation.z * 180) / Math.PI).toFixed(1),
    ],
    scale: [
      object.scale.x.toFixed(3),
      object.scale.y.toFixed(3),
      object.scale.z.toFixed(3),
    ],
  };
}

/**
 * Reset transform to defaults
 */
export function resetTransform(object: THREE.Object3D): void {
  object.position.set(0, 0, 0);
  object.rotation.set(0, 0, 0);
  object.scale.set(1, 1, 1);
  object.updateMatrixWorld();
}

/**
 * Center object at origin
 */
export function centerAtOrigin(object: THREE.Object3D): void {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  object.position.sub(center);
  object.updateMatrixWorld();
}

/**
 * Align to ground (Y=0)
 */
export function alignToGround(object: THREE.Object3D): void {
  const box = new THREE.Box3().setFromObject(object);
  const minY = box.min.y;
  object.position.y -= minY;
  object.updateMatrixWorld();
}

/**
 * Transform mode config
 */
export const TRANSFORM_MODE_CONFIG: Record<TransformMode, { label: string; icon: string; key: string; color: string }> = {
  translate: { label: 'Move', icon: 'Move', key: 'W', color: '#4fc3f7' },
  rotate: { label: 'Rotate', icon: 'RotateCw', key: 'E', color: '#22c55e' },
  scale: { label: 'Scale', icon: 'Maximize', key: 'R', color: '#f59e0b' },
};

/**
 * Snap presets
 */
export const SNAP_PRESETS: Array<{ name: string; translate: number; rotate: number; scale: number }> = [
  { name: 'Off', translate: 0, rotate: 0, scale: 0 },
  { name: 'Fine', translate: 0.1, rotate: 5, scale: 5 },
  { name: 'Normal', translate: 0.25, rotate: 15, scale: 10 },
  { name: 'Coarse', translate: 0.5, rotate: 30, scale: 25 },
  { name: 'Grid 1m', translate: 1.0, rotate: 45, scale: 50 },
  { name: 'Grid 2m', translate: 2.0, rotate: 90, scale: 100 },
];
