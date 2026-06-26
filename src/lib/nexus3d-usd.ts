/**
 * NEXUS 3D Studio — USD Import System (Sprint 9, experimental)
 *
 * Universal Scene Description (Pixar):
 * - .usd (binary), .usda (ASCII), .usdz (AR/Apple)
 * - Layer composition (non-destructive)
 * - Variant sets
 * - Payloads
 * - References
 * - Stage hierarchy
 * - Prim paths
 *
 * Not: Gerçek USD parse C++ USD SDK gerektirir.
 * Bu modül USD formatını anlamak ve metadata çıkarmak için
 * bir bridge/konfigürasyon katmanı sağlar.
 */

export type USDFormat = 'usd' | 'usda' | 'usdz';

export interface USDLayer {
  identifier: string;
  realPath: string;
  format: USDFormat;
  isAnonymous: boolean;
  subLayers: USDLayer[];
}

export interface USDPrim {
  path: string; // /World/Character/Mesh
  name: string;
  type: string; // Mesh, Xform, Camera, Light, Material, Scope
  specifier: 'def' | 'over' | 'class';
  active: boolean;
  loaded: boolean;
  children: USDPrim[];
  attributes: USDAttribute[];
  references: string[];
  payloads: string[];
  variantSets: string[];
  instanced: boolean;
}

export interface USDAttribute {
  name: string;
  type: string;
  value: string;
  timeSamples?: Array<{ time: number; value: string }>;
  interpolation?: string; // constant, uniform, varying, vertex, faceVarying
}

export interface USDStageInfo {
  upAxis: 'Y' | 'Z';
  metersPerUnit: number;
  defaultPrim: string;
  startTimeCode: number;
  endTimeCode: number;
  framesPerSecond: number;
  layers: USDLayer[];
  prims: USDPrim[];
  totalPrims: number;
  totalMeshes: number;
  totalMaterials: number;
  totalCameras: number;
  totalLights: number;
}

export interface USDImportConfig {
  loadPayloads: boolean;
  loadReferences: boolean;
  flattenLayers: boolean;
  applyUnitConversion: boolean;
  targetUnit: 'meters' | 'centimeters' | 'millimeters';
  upAxisConversion: 'y-up' | 'z-up';
  importAnimations: boolean;
  importMaterials: boolean;
  importCameras: boolean;
  importLights: boolean;
  instancing: 'preserve' | 'expand';
}

export const DEFAULT_USD_CONFIG: USDImportConfig = {
  loadPayloads: true,
  loadReferences: true,
  flattenLayers: false,
  applyUnitConversion: true,
  targetUnit: 'meters',
  upAxisConversion: 'y-up',
  importAnimations: true,
  importMaterials: true,
  importCameras: true,
  importLights: true,
  instancing: 'preserve',
};

/**
 * USD unit conversion
 */
export const USD_UNITS: Record<string, number> = {
  nanometers: 1e-9,
  micrometers: 1e-6,
  millimeters: 0.001,
  centimeters: 0.01,
  decimeters: 0.1,
  meters: 1.0,
  kilometers: 1000,
  inches: 0.0254,
  feet: 0.3048,
  yards: 0.9144,
  miles: 1609.344,
};

/**
 * Parse USDA (ASCII) — simplified parser
 * Real implementation would use USD SDK or WASM build
 */
export function parseUSDA(content: string): USDStageInfo {
  const lines = content.split('\n');
  const prims: USDPrim[] = [];
  const primStack: USDPrim[] = [];
  let upAxis: 'Y' | 'Z' = 'Y';
  let metersPerUnit = 0.01;
  let defaultPrim = '';
  let startTimeCode = 0;
  let endTimeCode = 0;
  let framesPerSecond = 24;

  for (const line of lines) {
    const trimmed = line.trim();

    // Stage metadata
    if (trimmed.startsWith('#usda')) continue;

    const upAxisMatch = trimmed.match(/upAxis\s*=\s*"?(Y|Z)"?/);
    if (upAxisMatch) upAxis = upAxisMatch[1] as 'Y' | 'Z';

    const unitMatch = trimmed.match(/metersPerUnit\s*=\s*([0-9.eE+-]+)/);
    if (unitMatch) metersPerUnit = parseFloat(unitMatch[1]);

    const defaultPrimMatch = trimmed.match(/defaultPrim\s*=\s*"([^"]+)"/);
    if (defaultPrimMatch) defaultPrim = defaultPrimMatch[1];

    const startMatch = trimmed.match(/startTimeCode\s*=\s*([0-9.]+)/);
    if (startMatch) startTimeCode = parseFloat(startMatch[1]);

    const endMatch = trimmed.match(/endTimeCode\s*=\s*([0-9.]+)/);
    if (endMatch) endTimeCode = parseFloat(endMatch[1]);

    const fpsMatch = trimmed.match(/framesPerSecond\s*=\s*([0-9.]+)/);
    if (fpsMatch) framesPerSecond = parseFloat(fpsMatch[1]);

    // Prim definition
    const primMatch = trimmed.match(/^(def|over|class)\s+(\w+)\s+"([^"]+)"/);
    if (primMatch) {
      const prim: USDPrim = {
        path: primMatch[3],
        name: primMatch[3].split('/').pop() || primMatch[3],
        type: primMatch[2],
        specifier: primMatch[1] as 'def' | 'over' | 'class',
        active: true,
        loaded: true,
        children: [],
        attributes: [],
        references: [],
        payloads: [],
        variantSets: [],
        instanced: false,
      };
      prims.push(prim);
      if (primStack.length > 0) {
        primStack[primStack.length - 1].children.push(prim);
      }
      primStack.push(prim);
    }

    // Close brace
    if (trimmed === '}') {
      primStack.pop();
    }

    // Attributes
    const attrMatch = trimmed.match(/^(?:\s+)?(?:custom\s+)?(\w+)\s+(\w+)\s*=\s*(.+)/);
    if (attrMatch && primStack.length > 0) {
      const attr: USDAttribute = {
        name: attrMatch[2],
        type: attrMatch[1],
        value: attrMatch[3].replace(/;?\s*$/, ''),
      };
      primStack[primStack.length - 1].attributes.push(attr);
    }

    // References
    const refMatch = trimmed.match(/references\s*=\s*\[?\s*<([^>]+)>\s*\]?/);
    if (refMatch && primStack.length > 0) {
      primStack[primStack.length - 1].references.push(refMatch[1]);
    }

    // Payloads
    const payloadMatch = trimmed.match(/payloads\s*=\s*\[?\s*<([^>]+)>\s*\]?/);
    if (payloadMatch && primStack.length > 0) {
      primStack[primStack.length - 1].payloads.push(payloadMatch[1]);
    }

    // Variant sets
    const variantMatch = trimmed.match(/variantSets\s*=\s*\[?\s*"([^"]+)"\s*\]?/);
    if (variantMatch && primStack.length > 0) {
      primStack[primStack.length - 1].variantSets.push(variantMatch[1]);
    }
  }

  // Count types
  let totalMeshes = 0;
  let totalMaterials = 0;
  let totalCameras = 0;
  let totalLights = 0;
  prims.forEach((p) => {
    if (p.type === 'Mesh') totalMeshes++;
    if (p.type === 'Material') totalMaterials++;
    if (p.type === 'Camera') totalCameras++;
    if (p.type.includes('Light')) totalLights++;
  });

  return {
    upAxis,
    metersPerUnit,
    defaultPrim,
    startTimeCode,
    endTimeCode,
    framesPerSecond,
    layers: [{ identifier: 'root', realPath: 'root.usda', format: 'usda', isAnonymous: false, subLayers: [] }],
    prims: prims.filter((p) => !p.path.includes('/')), // root level
    totalPrims: prims.length,
    totalMeshes,
    totalMaterials,
    totalCameras,
    totalLights,
  };
}

/**
 * USDZ (Apple AR) specific handling
 */
export interface USDZConfig {
  generateARQuickLook: boolean;
  maximumTextureSize: number; // 2048 for AR
  maximumPolygonCount: number; // 100K for AR
  embedTextures: boolean;
  compressionLevel: number;
  arAnchor: 'plane' | 'image' | 'face' | 'object';
}

export const DEFAULT_USDZ_CONFIG: USDZConfig = {
  generateARQuickLook: true,
  maximumTextureSize: 2048,
  maximumPolygonCount: 100000,
  embedTextures: true,
  compressionLevel: 6,
  arAnchor: 'plane',
};

/**
 * Validate USD file
 */
export function validateUSDFile(file: File): { valid: boolean; format?: USDFormat; error?: string; warnings: string[] } {
  const warnings: string[] = [];
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  let format: USDFormat | undefined;

  if (ext === '.usd') format = 'usd';
  else if (ext === '.usda') format = 'usda';
  else if (ext === '.usdz') format = 'usdz';
  else return { valid: false, error: `Gecersiz format: ${ext}. .usd, .usda, .usdz desteklenir.`, warnings };

  if (file.size > 2 * 1024 * 1024 * 1024) {
    return { valid: false, error: 'USD dosyasi 2GB sinirini asiyor.', warnings };
  }

  if (file.size > 500 * 1024 * 1024) {
    warnings.push('Buyuk USD dosyasi. Payload yukleme onerilir.');
  }

  return { valid: true, format, warnings };
}

/**
 * USD composition arc types
 */
export const USD_ARC_TYPES: Array<{ type: string; description: string; strength: string }> = [
  { type: 'References', description: 'Guclu baglanti. Hedef prim yoksa hata verir.', strength: 'Strong' },
  { type: 'Payloads', description: 'Zayif baglanti. Lazy loading. Hedef yoksa atlanir.', strength: 'Weak (lazy)' },
  { type: 'Inherits', description: 'Kalitim. Class priminden attrs alir.', strength: 'Strong' },
  { type: 'Specializes', description: 'Ozellestirme. Base prim override eder.', strength: 'Medium' },
  { type: 'VariantSets', description: 'Varyant secimi. Farkli versiyonlar.', strength: 'Strong' },
  { type: 'Sublayers', description: 'Layer kompozisyonu. Weak arc.', strength: 'Weak' },
];

/**
 * USD variant set example
 */
export interface USDVariantSet {
  name: string;
  variants: Array<{ name: string; selected: boolean }>;
}

export const USD_VARIANT_EXAMPLES: USDVariantSet[] = [
  {
    name: 'lod',
    variants: [
      { name: 'high', selected: true },
      { name: 'medium', selected: false },
      { name: 'low', selected: false },
    ],
  },
  {
    name: 'colorScheme',
    variants: [
      { name: 'red', selected: false },
      { name: 'blue', selected: true },
      { name: 'green', selected: false },
    ],
  },
  {
    name: 'quality',
    variants: [
      { name: 'cinematic', selected: false },
      { name: 'production', selected: true },
      { name: 'proxy', selected: false },
    ],
  },
];
