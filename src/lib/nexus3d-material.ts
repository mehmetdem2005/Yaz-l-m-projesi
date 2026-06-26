/**
 * NEXUS 3D Studio — Material Inspector System (Sprint 5)
 *
 * Tam PBR material editörü:
 * - Base color (sRGB)
 * - Metallic / Roughness sliders
 * - Emissive color + intensity
 * - Normal map strength
 * - AO map intensity
 * - Texture slots (albedo, normal, metallic, roughness, AO, emissive)
 * - Opacity / Transparent / Double-sided
 * - Wireframe mode
 * - Material presets
 * - Material library
 * - UV tiling/offset
 * - Color space management
 */

import * as THREE from 'three';

export type MaterialType = 'PBR' | 'Phong' | 'Basic' | 'Toon' | 'Physical' | 'Custom';

export interface PBRMaterialConfig {
  id: string;
  name: string;
  type: MaterialType;
  // Base
  baseColor: string;
  metallic: number;
  roughness: number;
  // Emissive
  emissiveColor: string;
  emissiveIntensity: number;
  // Normal
  normalScale: number;
  // AO
  aoMapIntensity: number;
  // Displacement
  displacementScale: number;
  // Textures
  albedoMap: TextureSlot | null;
  normalMap: TextureSlot | null;
  metallicMap: TextureSlot | null;
  roughnessMap: TextureSlot | null;
  aoMap: TextureSlot | null;
  emissiveMap: TextureSlot | null;
  // Alpha
  opacity: number;
  transparent: boolean;
  alphaTest: number;
  // Render
  doubleSided: boolean;
  wireframe: boolean;
  // UV
  uvOffset: [number, number];
  uvRepeat: [number, number];
  uvRotation: number;
  // Advanced (Physical)
  clearcoat: number;
  clearcoatRoughness: number;
  sheen: number;
  sheenColor: string;
  iridescence: number;
  transmission: number;
  thickness: number;
  ior: number;
}

export interface TextureSlot {
  url: string;
  enabled: boolean;
  colorSpace: 'sRGB' | 'Linear' | 'None';
  flipY: boolean;
  wrapS: THREE.WrappingMode;
  wrapT: THREE.WrappingMode;
  anisotropy: number;
}

export const DEFAULT_PBR_MATERIAL: PBRMaterialConfig = {
  id: 'mat_default',
  name: 'Default PBR',
  type: 'PBR',
  baseColor: '#cccccc',
  metallic: 0,
  roughness: 0.5,
  emissiveColor: '#000000',
  emissiveIntensity: 0,
  normalScale: 1,
  aoMapIntensity: 1,
  displacementScale: 1,
  albedoMap: null,
  normalMap: null,
  metallicMap: null,
  roughnessMap: null,
  aoMap: null,
  emissiveMap: null,
  opacity: 1,
  transparent: false,
  alphaTest: 0,
  doubleSided: false,
  wireframe: false,
  uvOffset: [0, 0],
  uvRepeat: [1, 1],
  uvRotation: 0,
  clearcoat: 0,
  clearcoatRoughness: 0,
  sheen: 0,
  sheenColor: '#ffffff',
  iridescence: 0,
  transmission: 0,
  thickness: 0,
  ior: 1.5,
};

/**
 * Apply material config to Three.js material
 */
export function applyMaterialConfig(
  config: PBRMaterialConfig,
  material: THREE.MeshStandardMaterial
): void {
  // Base
  material.color.set(config.baseColor);
  material.metalness = config.metallic;
  material.roughness = config.roughness;

  // Emissive
  material.emissive.set(config.emissiveColor);
  material.emissiveIntensity = config.emissiveIntensity;

  // Normal
  if (material.normalScale) {
    material.normalScale.set(config.normalScale, config.normalScale);
  }

  // AO
  material.aoMapIntensity = config.aoMapIntensity;

  // Alpha
  material.opacity = config.opacity;
  material.transparent = config.transparent;
  material.alphaTest = config.alphaTest;

  // Render
  material.side = config.doubleSided ? THREE.DoubleSide : THREE.FrontSide;
  material.wireframe = config.wireframe;

  // UV
  if (material.map) {
    material.map.offset.set(config.uvOffset[0], config.uvOffset[1]);
    material.map.repeat.set(config.uvRepeat[0], config.uvRepeat[1]);
    material.map.rotation = config.uvRotation;
  }

  material.needsUpdate = true;
}

/**
 * Material presets — AAA stüdyo kalitesinde
 */
export const MATERIAL_PRESETS: PBRMaterialConfig[] = [
  {
    ...DEFAULT_PBR_MATERIAL,
    id: 'mat_plastic_white',
    name: 'White Plastic',
    baseColor: '#f0f0f0',
    metallic: 0,
    roughness: 0.4,
  },
  {
    ...DEFAULT_PBR_MATERIAL,
    id: 'mat_plastic_black',
    name: 'Black Plastic',
    baseColor: '#1a1a1a',
    metallic: 0,
    roughness: 0.35,
  },
  {
    ...DEFAULT_PBR_MATERIAL,
    id: 'mat_brushed_metal',
    name: 'Brushed Metal',
    baseColor: '#b8b8b8',
    metallic: 1,
    roughness: 0.35,
  },
  {
    ...DEFAULT_PBR_MATERIAL,
    id: 'mat_polished_gold',
    name: 'Polished Gold',
    baseColor: '#ffd700',
    metallic: 1,
    roughness: 0.1,
  },
  {
    ...DEFAULT_PBR_MATERIAL,
    id: 'mat_polished_copper',
    name: 'Polished Copper',
    baseColor: '#b87333',
    metallic: 1,
    roughness: 0.15,
  },
  {
    ...DEFAULT_PBR_MATERIAL,
    id: 'mat_chrome',
    name: 'Chrome',
    baseColor: '#e8e8e8',
    metallic: 1,
    roughness: 0.02,
  },
  {
    ...DEFAULT_PBR_MATERIAL,
    id: 'mat_glass_clear',
    name: 'Clear Glass',
    baseColor: '#ffffff',
    metallic: 0,
    roughness: 0.0,
    opacity: 0.3,
    transparent: true,
  },
  {
    ...DEFAULT_PBR_MATERIAL,
    id: 'mat_glass_frosted',
    name: 'Frosted Glass',
    baseColor: '#ffffff',
    metallic: 0,
    roughness: 0.4,
    opacity: 0.5,
    transparent: true,
  },
  {
    ...DEFAULT_PBR_MATERIAL,
    id: 'mat_wood_oak',
    name: 'Oak Wood',
    baseColor: '#8b6f47',
    metallic: 0,
    roughness: 0.65,
  },
  {
    ...DEFAULT_PBR_MATERIAL,
    id: 'mat_marble_white',
    name: 'White Marble',
    baseColor: '#f5f5f0',
    metallic: 0,
    roughness: 0.2,
  },
  {
    ...DEFAULT_PBR_MATERIAL,
    id: 'mat_concrete',
    name: 'Concrete',
    baseColor: '#808080',
    metallic: 0,
    roughness: 0.85,
  },
  {
    ...DEFAULT_PBR_MATERIAL,
    id: 'mat_fabric_cotton',
    name: 'Cotton Fabric',
    baseColor: '#4a90d9',
    metallic: 0,
    roughness: 0.9,
  },
  {
    ...DEFAULT_PBR_MATERIAL,
    id: 'mat_leather',
    name: 'Leather',
    baseColor: '#3d2817',
    metallic: 0,
    roughness: 0.55,
  },
  {
    ...DEFAULT_PBR_MATERIAL,
    id: 'mat_rubber',
    name: 'Rubber',
    baseColor: '#1a1a1a',
    metallic: 0,
    roughness: 0.95,
  },
  {
    ...DEFAULT_PBR_MATERIAL,
    id: 'mat_emissive_neon_blue',
    name: 'Neon Blue',
    baseColor: '#0a0a20',
    metallic: 0,
    roughness: 0.3,
    emissiveColor: '#00aaff',
    emissiveIntensity: 3,
  },
  {
    ...DEFAULT_PBR_MATERIAL,
    id: 'mat_emissive_neon_pink',
    name: 'Neon Pink',
    baseColor: '#1a0a1a',
    metallic: 0,
    roughness: 0.3,
    emissiveColor: '#ff00aa',
    emissiveIntensity: 3,
  },
  {
    ...DEFAULT_PBR_MATERIAL,
    id: 'mat_carbon_fiber',
    name: 'Carbon Fiber',
    baseColor: '#1a1a1a',
    metallic: 0.8,
    roughness: 0.3,
  },
  {
    ...DEFAULT_PBR_MATERIAL,
    id: 'mat_ceramic',
    name: 'Ceramic',
    baseColor: '#f8f8f8',
    metallic: 0,
    roughness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  },
  {
    ...DEFAULT_PBR_MATERIAL,
    id: 'mat_skin',
    name: 'Skin',
    baseColor: '#e0ac69',
    metallic: 0,
    roughness: 0.55,
    sheen: 0.5,
    sheenColor: '#ffe0c0',
  },
  {
    ...DEFAULT_PBR_MATERIAL,
    id: 'mat_toon_cel',
    name: 'Cel Shaded',
    baseColor: '#ff8800',
    type: 'Toon',
    metallic: 0,
    roughness: 1,
  },
];

/**
 * Material categories
 */
export const MATERIAL_CATEGORIES: Array<{ id: string; label: string; color: string; materialIds: string[] }> = [
  { id: 'metal', label: 'Metal', color: '#c0c0c0', materialIds: ['mat_brushed_metal', 'mat_polished_gold', 'mat_polished_copper', 'mat_chrome', 'mat_carbon_fiber'] },
  { id: 'dielectric', label: 'Dielectric', color: '#4fc3f7', materialIds: ['mat_plastic_white', 'mat_plastic_black', 'mat_ceramic', 'mat_glass_clear', 'mat_glass_frosted'] },
  { id: 'organic', label: 'Organic', color: '#22c55e', materialIds: ['mat_wood_oak', 'mat_marble_white', 'mat_leather', 'mat_skin', 'mat_fabric_cotton'] },
  { id: 'surface', label: 'Surface', color: '#f59e0b', materialIds: ['mat_concrete', 'mat_rubber'] },
  { id: 'emissive', label: 'Emissive', color: '#a855f7', materialIds: ['mat_emissive_neon_blue', 'mat_emissive_neon_pink'] },
  { id: 'stylized', label: 'Stylized', color: '#ec4899', materialIds: ['mat_toon_cel'] },
];

/**
 * PBR Workflow info
 */
export const PBR_WORKFLOW_INFO = {
  metallicRoughness: {
    name: 'Metallic-Roughness (glTF default)',
    maps: ['Albedo (sRGB)', 'Normal (Linear)', 'Metallic (Linear)', 'Roughness (Linear)', 'AO (Linear)', 'Emissive (sRGB)'],
    description: 'glTF 2.0 standard workflow. Metallic ve roughness ayrı texture veya combined (ORM - Occlusion Roughness Metallic) olabilir.',
  },
  specularGlossiness: {
    name: 'Specular-Glossiness (legacy)',
    maps: ['Diffuse (sRGB)', 'Normal (Linear)', 'Specular (sRGB)', 'Glossiness (Linear)'],
    description: 'Eski KHR_materials_pbrSpecularGlossiness. Unreal/Unity legacy pipeline.',
  },
};

/**
 * Texel density calculator
 */
export function calculateTexelDensity(
  textureSize: number,
  meshWorldSize: number,
  uvRepeat: number = 1
): number {
  return (textureSize * uvRepeat) / meshWorldSize;
}

/**
 * Recommended texture resolution based on texel density
 */
export function recommendTextureResolution(
  meshWorldSize: number,
  targetTexelDensity: number = 1024,
  uvRepeat: number = 1
): number {
  const pixels = targetTexelDensity * meshWorldSize / uvRepeat;
  // Round to nearest power of 2
  const power = Math.ceil(Math.log2(pixels));
  return Math.pow(2, Math.max(5, Math.min(13, power))); // 32 to 8192
}
