/**
 * NEXUS 3D Studio — Camera System (Sprint 1)
 *
 * Çok modlu kamera sistemi:
 * - Orbit (döndür)
 * - Pan (ötele)
 * - Zoom (yakınlaş/uzaklaş)
 * - Focus (seçili nesneye odaklan)
 * - Frame All (tüm sahneyi çerçevele)
 * - Camera presets (Perspective, Front, Side, Top, Back, Bottom)
 * - Smooth animated transitions
 * - Keyboard shortcuts
 * - Configurable sensitivity, damping, limits
 */

import * as THREE from 'three';

export type CameraMode = 'orbit' | 'pan' | 'zoom';
export type CameraPreset = 'perspective' | 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';

export interface CameraConfig {
  fov: number;
  near: number;
  far: number;
  position: THREE.Vector3;
  target: THREE.Vector3;
  up: THREE.Vector3;
}

export interface CameraControlsConfig {
  enableDamping: boolean;
  dampingFactor: number;
  rotateSpeed: number;
  panSpeed: number;
  zoomSpeed: number;
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number; // 0 = top
  maxPolarAngle: number; // PI = bottom
  minAzimuthAngle: number; // -Infinity = unlimited
  maxAzimuthAngle: number;
  enablePan: boolean;
  enableRotate: boolean;
  enableZoom: boolean;
  screenSpacePanning: boolean;
  keyPanSpeed: number;
}

export const DEFAULT_CAMERA_CONFIG: CameraConfig = {
  fov: 50,
  near: 0.1,
  far: 1000,
  position: new THREE.Vector3(5, 3, 8),
  target: new THREE.Vector3(0, 0.5, 0),
  up: new THREE.Vector3(0, 1, 0),
};

export const DEFAULT_CONTROLS_CONFIG: CameraControlsConfig = {
  enableDamping: true,
  dampingFactor: 0.08,
  rotateSpeed: 1.0,
  panSpeed: 1.0,
  zoomSpeed: 1.2,
  minDistance: 0.5,
  maxDistance: 100,
  minPolarAngle: 0.1,
  maxPolarAngle: Math.PI / 2 - 0.05,
  minAzimuthAngle: -Infinity,
  maxAzimuthAngle: Infinity,
  enablePan: true,
  enableRotate: true,
  enableZoom: true,
  screenSpacePanning: true,
  keyPanSpeed: 7.0,
};

/**
 * Camera preset positions — her biri farklı bir açıdan bakış
 */
export const CAMERA_PRESETS: Record<CameraPreset, { position: [number, number, number]; target: [number, number, number]; label: string; icon: string }> = {
  perspective: {
    position: [5, 3, 8],
    target: [0, 0.5, 0],
    label: 'Perspective',
    icon: 'Box',
  },
  front: {
    position: [0, 1, 8],
    target: [0, 1, 0],
    label: 'Front',
    icon: 'Square',
  },
  back: {
    position: [0, 1, -8],
    target: [0, 1, 0],
    label: 'Back',
    icon: 'Square',
  },
  left: {
    position: [-8, 1, 0],
    target: [0, 1, 0],
    label: 'Left',
    icon: 'Square',
  },
  right: {
    position: [8, 1, 0],
    target: [0, 1, 0],
    label: 'Right',
    icon: 'Square',
  },
  top: {
    position: [0, 10, 0.01],
    target: [0, 0, 0],
    label: 'Top',
    icon: 'Square',
  },
  bottom: {
    position: [0, -10, 0.01],
    target: [0, 0, 0],
    label: 'Bottom',
    icon: 'Square',
  },
};

/**
 * Smooth camera transition — bir pozisyondan diğerine animasyonlu geçiş
 */
export class CameraAnimator {
  private camera: THREE.PerspectiveCamera;
  private isAnimating: boolean = false;
  private startTime: number = 0;
  private duration: number = 1000; // ms
  private startPosition: THREE.Vector3 = new THREE.Vector3();
  private endPosition: THREE.Vector3 = new THREE.Vector3();
  private startTarget: THREE.Vector3 = new THREE.Vector3();
  private endTarget: THREE.Vector3 = new THREE.Vector3();
  private easing: (t: number) => number;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.easing = easeInOutCubic;
  }

  /**
   * Kamerayı yeni pozisyona ve hedefe yumuşakça taşı
   */
  transitionTo(
    endPosition: THREE.Vector3,
    endTarget: THREE.Vector3,
    duration: number = 1000,
    easing?: (t: number) => number
  ): void {
    this.startPosition.copy(this.camera.position);
    this.endPosition.copy(endPosition);
    this.startTarget.copy(this.getCurrentTarget());
    this.endTarget.copy(endTarget);
    this.duration = duration;
    if (easing) this.easing = easing;
    this.startTime = performance.now();
    this.isAnimating = true;
  }

  /**
   * Her frame'de çağrılır — animasyonu güncelle
   * Returns: current target (OrbitControls için)
   */
  update(): THREE.Vector3 | null {
    if (!this.isAnimating) return null;

    const elapsed = performance.now() - this.startTime;
    const t = Math.min(elapsed / this.duration, 1);
    const eased = this.easing(t);

    this.camera.position.lerpVectors(this.startPosition, this.endPosition, eased);
    const currentTarget = new THREE.Vector3().lerpVectors(this.startTarget, this.endTarget, eased);

    if (t >= 1) {
      this.isAnimating = false;
    }

    return currentTarget;
  }

  get isRunning(): boolean {
    return this.isAnimating;
  }

  cancel(): void {
    this.isAnimating = false;
  }

  private currentTarget: THREE.Vector3 = new THREE.Vector3(0, 0.5, 0);

  setTarget(target: THREE.Vector3): void {
    this.currentTarget.copy(target);
  }

  getCurrentTarget(): THREE.Vector3 {
    return this.currentTarget;
  }
}

/**
 * Frame all — tüm nesneleri çerçeveleyecek şekilde kamera pozisyonu hesapla
 */
export function calculateFrameAll(
  objects: THREE.Object3D[],
  camera: THREE.PerspectiveCamera,
  padding: number = 1.2
): { position: THREE.Vector3; target: THREE.Vector3 } {
  if (objects.length === 0) {
    return {
      position: new THREE.Vector3(5, 3, 8),
      target: new THREE.Vector3(0, 0.5, 0),
    };
  }

  const box = new THREE.Box3();
  objects.forEach((obj) => {
    box.expandByObject(obj);
  });

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = (camera.fov * Math.PI) / 180;
  let distance = (maxDim / 2) / Math.tan(fov / 2);
  distance *= padding;

  const direction = new THREE.Vector3(1, 0.6, 1).normalize();
  const position = center.clone().add(direction.multiplyScalar(distance));

  return { position, target: center };
}

/**
 * Focus — belirli bir nesneye odaklan
 */
export function calculateFocus(
  object: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  padding: number = 1.5
): { position: THREE.Vector3; target: THREE.Vector3 } {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.5);
  const fov = (camera.fov * Math.PI) / 180;
  let distance = (maxDim / 2) / Math.tan(fov / 2);
  distance *= padding;

  const currentDir = camera.position.clone().sub(center).normalize();
  const position = center.clone().add(currentDir.multiplyScalar(distance));

  return { position, target: center };
}

/**
 * Zoom to cursor — mouse pozisyonuna doğru zoom
 */
export function calculateZoomToCursor(
  camera: THREE.PerspectiveCamera,
  mouseNDC: THREE.Vector2,
  delta: number,
  raycaster: THREE.Raycaster
): void {
  // Raycast from mouse position
  raycaster.setFromCamera(mouseNDC, camera);
  const distance = camera.position.distanceTo(new THREE.Vector3());
  const factor = 1 + delta * 0.001;
  const newDistance = distance * factor;

  // Move camera along ray
  const direction = raycaster.ray.direction.clone().negate();
  camera.position.add(direction.multiplyScalar((newDistance - distance) * 0.3));
}

// ---------- Easing functions ----------

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function easeInOutQuart(t: number): number {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function easeOutElastic(t: number): number {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

// ---------- Keyboard shortcuts ----------

export const CAMERA_KEYBOARD_SHORTCUTS: Array<{ key: string; action: string; description: string }> = [
  { key: '1', action: 'preset:perspective', description: 'Perspective view' },
  { key: '2', action: 'preset:front', description: 'Front view' },
  { key: '3', action: 'preset:right', description: 'Right view' },
  { key: '4', action: 'preset:top', description: 'Top view' },
  { key: '5', action: 'preset:back', description: 'Back view' },
  { key: '6', action: 'preset:left', description: 'Left view' },
  { key: '7', action: 'preset:bottom', description: 'Bottom view' },
  { key: 'f', action: 'frame-all', description: 'Frame all objects' },
  { key: '.', action: 'focus-selected', description: 'Focus selected object' },
  { key: '+', action: 'zoom-in', description: 'Zoom in' },
  { key: '-', action: 'zoom-out', description: 'Zoom out' },
  { key: 'ArrowUp', action: 'pan-up', description: 'Pan up' },
  { key: 'ArrowDown', action: 'pan-down', description: 'Pan down' },
  { key: 'ArrowLeft', action: 'pan-left', description: 'Pan left' },
  { key: 'ArrowRight', action: 'pan-right', description: 'Pan right' },
];

// ---------- Camera viewport overlay info ----------

export interface CameraInfo {
  position: [number, number, number];
  target: [number, number, number];
  distance: number;
  fov: number;
  azimuth: number; // degrees
  polar: number; // degrees
  mode: CameraMode;
  preset: CameraPreset | 'custom';
}

export function getCameraInfo(
  camera: THREE.PerspectiveCamera,
  target: THREE.Vector3,
  mode: CameraMode,
  preset: CameraPreset | 'custom'
): CameraInfo {
  const offset = camera.position.clone().sub(target);
  const distance = offset.length();
  const azimuth = Math.atan2(offset.x, offset.z) * (180 / Math.PI);
  const polar = Math.acos(offset.y / distance) * (180 / Math.PI);

  return {
    position: [camera.position.x, camera.position.y, camera.position.z],
    target: [target.x, target.y, target.z],
    distance,
    fov: camera.fov,
    azimuth,
    polar,
    mode,
    preset,
  };
}

/**
 * Detect which preset is closest to current camera position
 */
export function detectPreset(camera: THREE.PerspectiveCamera, target: THREE.Vector3): CameraPreset | 'custom' {
  const offset = camera.position.clone().sub(target);
  const distance = offset.length();
  if (distance < 0.01) return 'custom';

  const azimuth = Math.atan2(offset.x, offset.z) * (180 / Math.PI);
  const polar = Math.acos(offset.y / distance) * (180 / Math.PI);

  // Perspective: ~45° azimuth, ~60° polar
  if (Math.abs(azimuth - 32) < 15 && Math.abs(polar - 60) < 15) return 'perspective';
  // Front: azimuth ~0, polar ~90
  if (Math.abs(azimuth) < 10 && Math.abs(polar - 90) < 10) return 'front';
  // Back: azimuth ~180, polar ~90
  if (Math.abs(Math.abs(azimuth) - 180) < 10 && Math.abs(polar - 90) < 10) return 'back';
  // Right: azimuth ~90, polar ~90
  if (Math.abs(azimuth - 90) < 10 && Math.abs(polar - 90) < 10) return 'right';
  // Left: azimuth ~-90, polar ~90
  if (Math.abs(azimuth + 90) < 10 && Math.abs(polar - 90) < 10) return 'left';
  // Top: polar ~0
  if (polar < 10) return 'top';
  // Bottom: polar ~180
  if (polar > 170) return 'bottom';

  return 'custom';
}
