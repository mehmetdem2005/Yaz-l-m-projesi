/**
 * NEXUS 3D Studio — Model Loader System (Sprint 2)
 *
 * Gerçek GLB/GLTF dosya yükleme:
 * - File drag & drop
 * - URL'den yükleme
 * - GLTFLoader ile parse
 * - Model metadata extraction (polygon count, materials, animations, skeleton)
 * - Progress tracking
 * - Error handling
 * - Model validation
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export interface LoadedModel {
  id: string;
  name: string;
  format: string;
  url: string;
  scene: THREE.Group;
  metadata: ModelMetadata;
  loadedAt: Date;
}

export interface ModelMetadata {
  format: string;
  fileSize: number;
  meshes: number;
  materials: number;
  textures: number;
  animations: number;
  totalPolygons: number;
  totalVertices: number;
  totalTriangles: number;
  hasSkeleton: boolean;
  boneCount: number;
  hasMorphTargets: boolean;
  cameras: number;
  lights: number;
  images: number;
  jsonExtensions?: string[];
  warnings: string[];
  errors: string[];
}

export interface LoadProgress {
  loaded: number;
  total: number;
  url: string;
  percentage: number;
}

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface LoadResult {
  status: LoadStatus;
  model?: LoadedModel;
  error?: string;
  progress?: number;
}

/**
 * GLTFLoader factory with DRACO + KTX2 + Meshopt support
 */
export function createGLTFLoader(renderer?: THREE.WebGLRenderer): GLTFLoader {
  const loader = new GLTFLoader();

  // DRACO compressed geometry support
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  loader.setDRACOLoader(dracoLoader);

  // KTX2 texture compression support
  if (renderer) {
    const ktx2Loader = new KTX2Loader()
      .setTranscoderPath('https://unpkg.com/three@0.184.0/examples/jsm/libs/basis/')
      .detectSupport(renderer);
    loader.setKTX2Loader(ktx2Loader);
  }

  // Meshopt compression support
  loader.setMeshoptDecoder(MeshoptDecoder);

  return loader;
}

/**
 * Load GLB/GLTF from file
 */
export async function loadModelFromFile(
  file: File,
  renderer?: THREE.WebGLRenderer,
  onProgress?: (progress: LoadProgress) => void
): Promise<LoadResult> {
  const url = URL.createObjectURL(file);
  try {
    const result = await loadModelFromURL(url, file.name, file.size, renderer, onProgress);
    URL.revokeObjectURL(url);
    return result;
  } catch (err) {
    URL.revokeObjectURL(url);
    return { status: 'error', error: (err as Error).message };
  }
}

/**
 * Load GLB/GLTF from URL
 */
export async function loadModelFromURL(
  url: string,
  name: string = 'model',
  fileSize: number = 0,
  renderer?: THREE.WebGLRenderer,
  onProgress?: (progress: LoadProgress) => void
): Promise<LoadResult> {
  const loader = createGLTFLoader(renderer);

  return new Promise((resolve) => {
    loader.load(
      url,
      (gltf) => {
        const metadata = extractMetadata(gltf, name, fileSize);
        const model: LoadedModel = {
          id: `model_${Date.now()}`,
          name,
          format: name.endsWith('.glb') ? 'glb' : 'gltf',
          url,
          scene: gltf.scene,
          metadata,
          loadedAt: new Date(),
        };
        resolve({ status: 'loaded', model });
      },
      (progress) => {
        if (onProgress) {
          const percentage = progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0;
          onProgress({
            loaded: progress.loaded,
            total: progress.total,
            url,
            percentage,
          });
        }
      },
      (error) => {
        resolve({ status: 'error', error: (error as Error).message });
      }
    );
  });
}

/**
 * Extract comprehensive metadata from loaded GLTF
 */
export function extractMetadata(gltf: any, name: string, fileSize: number): ModelMetadata {
  let meshes = 0;
  let materials = 0;
  let textures = 0;
  let totalPolygons = 0;
  let totalVertices = 0;
  let totalTriangles = 0;
  let hasSkeleton = false;
  let boneCount = 0;
  let hasMorphTargets = false;
  let cameras = 0;
  let lights = 0;
  let images = 0;
  const warnings: string[] = [];
  const errors: string[] = [];

  // Count resources
  const materialSet = new Set<THREE.Material>();
  const textureSet = new Set<THREE.Texture>();

  gltf.scene.traverse((child: THREE.Object3D) => {
    if (child.type === 'Mesh') {
      meshes++;
      const mesh = child as THREE.Mesh;
      const geometry = mesh.geometry;

      if (geometry) {
        const vertices = geometry.attributes.position?.count || 0;
        totalVertices += vertices;

        if (geometry.index) {
          totalTriangles += geometry.index.count / 3;
        } else if (geometry.attributes.position) {
          totalTriangles += vertices / 3;
        }
        totalPolygons = totalTriangles;

        // Check morph targets
        if (geometry.morphAttributes && Object.keys(geometry.morphAttributes).length > 0) {
          hasMorphTargets = true;
        }
      }

      // Check skeleton
      if (mesh.skeleton) {
        hasSkeleton = true;
        boneCount = Math.max(boneCount, mesh.skeleton.bones.length);
      }

      // Collect materials
      if (mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => materialSet.add(m));
        }
    }

    if (child.type === 'Camera') cameras++;
    if (child.type === 'Light' || child.type === 'DirectionalLight' || child.type === 'PointLight' || child.type === 'SpotLight' || child.type === 'AmbientLight' || child.type === 'HemisphereLight') lights++;
  });

  materials = materialSet.size;
  materialSet.forEach((m) => {
    const mat = m as THREE.MeshStandardMaterial;
    if (mat.map) textureSet.add(mat.map);
    if (mat.normalMap) textureSet.add(mat.normalMap);
    if (mat.roughnessMap) textureSet.add(mat.roughnessMap);
    if (mat.metalnessMap) textureSet.add(mat.metalnessMap);
    if (mat.aoMap) textureSet.add(mat.aoMap);
    if (mat.emissiveMap) textureSet.add(mat.emissiveMap);
  });
  textures = textureSet.size;

  // Count animations
  const animations = gltf.animations?.length || 0;

  // JSON extensions
  const jsonExtensions = gltf.parser?.json?.extensionsUsed || [];

  // Validation warnings
  if (totalPolygons > 500000) {
    warnings.push(`Yuksek polygon sayisi: ${totalPolygons.toLocaleString()}. AAA oyunlar icin optimize edin.`);
  }
  if (totalPolygons > 2000000) {
    errors.push(`Cok yuksek polygon sayisi: ${totalPolygons.toLocaleString()}. Real-time render icin uygun degil.`);
  }
  if (textures > 20) {
    warnings.push(`Cok fazla texture: ${textures}. Texture atlas kullanin.`);
  }
  if (materials > 10) {
    warnings.push(`Cok fazla material: ${materials}. Draw call optimizasyonu yapin.`);
  }
  if (!hasSkeleton && animations > 0) {
    warnings.push('Animasyon var ama skeleton yok. Morph target animasyonu olabilir.');
  }

  return {
    format: name.endsWith('.glb') ? 'GLB' : 'glTF',
    fileSize,
    meshes,
    materials,
    textures,
    animations,
    totalPolygons,
    totalVertices,
    totalTriangles,
    hasSkeleton,
    boneCount,
    hasMorphTargets,
    cameras,
    lights,
    images,
    jsonExtensions,
    warnings,
    errors,
  };
}

/**
 * Validate model before loading — file size, extension
 */
export function validateModelFile(file: File): { valid: boolean; error?: string } {
  const validExtensions = ['.glb', '.gltf'];
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();

  if (!validExtensions.includes(ext)) {
    return { valid: false, error: `Gecersiz format: ${ext}. Sadece .glb ve .gltf desteklenir.` };
  }

  // Max 500MB
  const maxSize = 500 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: `Dosya cok buyuk: ${(file.size / 1024 / 1024).toFixed(0)}MB. Maksimum 500MB.` };
  }

  return { valid: true };
}

/**
 * Format model metadata for display
 */
export function formatModelStats(metadata: ModelMetadata): Array<{ label: string; value: string; color?: string }> {
  return [
    { label: 'Format', value: metadata.format },
    { label: 'File Size', value: formatBytes(metadata.fileSize) },
    { label: 'Meshes', value: metadata.meshes.toString() },
    { label: 'Materials', value: metadata.materials.toString() },
    { label: 'Textures', value: metadata.textures.toString() },
    { label: 'Vertices', value: metadata.totalVertices.toLocaleString() },
    { label: 'Triangles', value: Math.floor(metadata.totalTriangles).toLocaleString() },
    { label: 'Animations', value: metadata.animations.toString(), color: metadata.animations > 0 ? '#22c55e' : undefined },
    { label: 'Skeleton', value: metadata.hasSkeleton ? `Yes (${metadata.boneCount} bones)` : 'No', color: metadata.hasSkeleton ? '#22c55e' : undefined },
    { label: 'Morph Targets', value: metadata.hasMorphTargets ? 'Yes' : 'No' },
    { label: 'Cameras', value: metadata.cameras.toString() },
    { label: 'Lights', value: metadata.lights.toString() },
  ];
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
