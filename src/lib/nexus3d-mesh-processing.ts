/**
 * NEXUS 3D Studio — Mesh Processing System (Sprint 21-25)
 *
 * Sprint 21: LOD (Level of Detail) generator
 * Sprint 22: Mesh decimation (polygon reduction)
 * Sprint 23: UV unwrap tool
 * Sprint 24: Texture baking
 * Sprint 25: PBR material editor (node-based)
 */

import * as THREE from 'three';

// ============ SPRINT 21: LOD GENERATOR ============

export interface LODLevel {
  level: number;
  polygonCount: number;
  triangleCount: number;
  reduction: number; // 0-1, 1 = full detail
  screenSize: number; // pixels
  distance: number; // world units
  switchDistance: number;
}

export interface LODConfig {
  levels: number;
  reductionPerLevel: number; // 0.5 = halve each level
  algorithm: 'quadric' | 'edgeCollapse' | 'vertexClustering' | 'proximity';
  preserveBorders: boolean;
  preserveTopology: boolean;
  preserveUVs: boolean;
  aggressiveness: number; // 1-10
  maxError: number;
}

export const DEFAULT_LOD_CONFIG: LODConfig = {
  levels: 4,
  reductionPerLevel: 0.5,
  algorithm: 'quadric',
  preserveBorders: true,
  preserveTopology: true,
  preserveUVs: true,
  aggressiveness: 7,
  maxError: 0.01,
};

/**
 * Generate LOD levels for a geometry
 */
export function generateLODLevels(
  geometry: THREE.BufferGeometry,
  config: LODConfig = DEFAULT_LOD_CONFIG
): Array<{ level: number; geometry: THREE.BufferGeometry; stats: LODLevel }> {
  const results: Array<{ level: number; geometry: THREE.BufferGeometry; stats: LODLevel }> = [];
  const originalTriangles = geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3;

  // LOD 0 — original
  results.push({
    level: 0,
    geometry: geometry.clone(),
    stats: {
      level: 0,
      polygonCount: originalTriangles,
      triangleCount: originalTriangles,
      reduction: 1.0,
      screenSize: 1.0,
      distance: 0,
      switchDistance: 5,
    },
  });

  // Generate reduced levels
  let currentGeo = geometry;
  for (let i = 1; i < config.levels; i++) {
    const targetReduction = Math.pow(config.reductionPerLevel, i);
    const targetTriangles = Math.floor(originalTriangles * targetReduction);

    const reducedGeo = decimateGeometry(currentGeo, targetTriangles, config);
    const triCount = reducedGeo.index ? reducedGeo.index.count / 3 : reducedGeo.attributes.position.count / 3;

    results.push({
      level: i,
      geometry: reducedGeo,
      stats: {
        level: i,
        polygonCount: triCount,
        triangleCount: triCount,
        reduction: triCount / originalTriangles,
        screenSize: targetReduction,
        distance: i * 15,
        switchDistance: i * 15 + 15,
      },
    });

    currentGeo = reducedGeo;
  }

  return results;
}

// ============ SPRINT 22: MESH DECIMATION ============

/**
 * Simplified mesh decimation — edge collapse algorithm
 */
export function decimateGeometry(
  geometry: THREE.BufferGeometry,
  targetTriangles: number,
  config: LODConfig
): THREE.BufferGeometry {
  const geo = geometry.clone();
  let currentTriangles = geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3;

  if (currentTriangles <= targetTriangles) return geo;

  // Simplified — just remove every Nth vertex
  // Real implementation would use quadric edge collapse
  const reductionFactor = currentTriangles / targetTriangles;
  const positions = geo.attributes.position;
  const newIndex: number[] = [];

  if (geo.index) {
    const index = geo.index;
    for (let i = 0; i < index.count; i += 3) {
      // Skip every Nth triangle
      if (Math.floor(i / 3) % reductionFactor < 1) {
        newIndex.push(index.getX(i), index.getX(i + 1), index.getX(i + 2));
      }
    }
    geo.setIndex(newIndex);
  }

  geo.computeVertexNormals();
  geo.computeBoundingBox();
  geo.computeBoundingSphere();

  return geo;
}

/**
 * Calculate mesh complexity metrics
 */
export interface MeshMetrics {
  triangleCount: number;
  vertexCount: number;
  edgeCount: number;
  averageEdgeLength: number;
  surfaceArea: number;
  volume: number;
  boundingBox: THREE.Box3;
  boundingSphere: THREE.Sphere;
  isManifold: boolean;
  hasUVs: boolean;
  hasNormals: boolean;
  hasColors: boolean;
  hasTangents: boolean;
  degenerateTriangles: number;
  nonPlanarQuads: number;
}

export function calculateMeshMetrics(geometry: THREE.BufferGeometry): MeshMetrics {
  const positions = geometry.attributes.position;
  const vertexCount = positions.count;
  const triangleCount = geometry.index ? geometry.index.count / 3 : vertexCount / 3;
  let surfaceArea = 0;
  let degenerateTriangles = 0;

  const index = geometry.index;
  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();
  const cross = new THREE.Vector3();

  for (let i = 0; i < triangleCount; i++) {
    const a = index ? index.getX(i * 3) : i * 3;
    const b = index ? index.getX(i * 3 + 1) : i * 3 + 1;
    const c = index ? index.getX(i * 3 + 2) : i * 3 + 2;

    vA.fromBufferAttribute(positions, a);
    vB.fromBufferAttribute(positions, b);
    vC.fromBufferAttribute(positions, c);

    ab.subVectors(vB, vA);
    ac.subVectors(vC, vA);
    cross.crossVectors(ab, ac);
    const area = cross.length() * 0.5;
    surfaceArea += area;

    if (area < 1e-10) degenerateTriangles++;
  }

  const boundingBox = new THREE.Box3().setFromBufferAttribute(positions);
  const boundingSphere = new THREE.Sphere();
  boundingBox.getBoundingSphere(boundingSphere);

  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  const volume = size.x * size.y * size.z;

  return {
    triangleCount: Math.floor(triangleCount),
    vertexCount,
    edgeCount: Math.floor(triangleCount * 1.5), // approximate
    averageEdgeLength: 0,
    surfaceArea,
    volume,
    boundingBox,
    boundingSphere,
    isManifold: true,
    hasUVs: !!geometry.attributes.uv,
    hasNormals: !!geometry.attributes.normal,
    hasColors: !!geometry.attributes.color,
    hasTangents: !!geometry.attributes.tangent,
    degenerateTriangles,
    nonPlanarQuads: 0,
  };
}

// ============ SPRINT 23: UV UNWRAP ============

export type UVUnwrapMethod = 'planar' | 'box' | 'cylindrical' | 'spherical' | 'conformal' | 'lscm' | 'angleBased';

export interface UVUnwrapConfig {
  method: UVUnwrapMethod;
  islandMargin: number;
  packQuality: number;
  rotateIslands: boolean;
  scaleIslands: boolean;
  normalize: boolean;
  texelDensity: number;
  resolution: number;
}

export const DEFAULT_UV_CONFIG: UVUnwrapConfig = {
  method: 'box',
  islandMargin: 0.02,
  packQuality: 0.5,
  rotateIslands: true,
  scaleIslands: true,
  normalize: true,
  texelDensity: 1024,
  resolution: 2048,
};

/**
 * Generate UVs using planar projection
 */
export function planarUVUnwrap(geometry: THREE.BufferGeometry, axis: 'x' | 'y' | 'z' = 'y'): void {
  const positions = geometry.attributes.position;
  const uvs = new Float32Array(positions.count * 2);

  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox!;
  const size = new THREE.Vector3();
  bbox.getSize(size);

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    let u = 0, v = 0;
    switch (axis) {
      case 'x':
        u = (z - bbox.min.z) / size.z;
        v = (y - bbox.min.y) / size.y;
        break;
      case 'y':
        u = (x - bbox.min.x) / size.x;
        v = (z - bbox.min.z) / size.z;
        break;
      case 'z':
        u = (x - bbox.min.x) / size.x;
        v = (y - bbox.min.y) / size.y;
        break;
    }
    uvs[i * 2] = u;
    uvs[i * 2 + 1] = v;
  }

  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
}

/**
 * Generate UVs using box projection (6-face)
 */
export function boxUVUnwrap(geometry: THREE.BufferGeometry): void {
  const positions = geometry.attributes.position;
  const normals = geometry.attributes.normal;
  const uvs = new Float32Array(positions.count * 2);

  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox!;
  const size = new THREE.Vector3();
  bbox.getSize(size);

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    let nx = 0, ny = 0, nz = 0;
    if (normals) {
      nx = normals.getX(i);
      ny = normals.getY(i);
      nz = normals.getZ(i);
    }

    const absX = Math.abs(nx);
    const absY = Math.abs(ny);
    const absZ = Math.abs(nz);

    let u = 0, v = 0;

    if (absX >= absY && absX >= absZ) {
      // X face
      u = (z - bbox.min.z) / size.z;
      v = (y - bbox.min.y) / size.y;
    } else if (absY >= absX && absY >= absZ) {
      // Y face
      u = (x - bbox.min.x) / size.x;
      v = (z - bbox.min.z) / size.z;
    } else {
      // Z face
      u = (x - bbox.min.x) / size.x;
      v = (y - bbox.min.y) / size.y;
    }

    uvs[i * 2] = u;
    uvs[i * 2 + 1] = v;
  }

  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
}

/**
 * Generate UVs using cylindrical projection
 */
export function cylindricalUVUnwrap(geometry: THREE.BufferGeometry): void {
  const positions = geometry.attributes.position;
  const uvs = new Float32Array(positions.count * 2);

  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox!;
  const size = new THREE.Vector3();
  bbox.getSize(size);
  const centerY = (bbox.max.y + bbox.min.y) / 2;

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    // Cylindrical projection
    const angle = Math.atan2(z, x);
    const u = (angle + Math.PI) / (2 * Math.PI);
    const v = (y - bbox.min.y) / size.y;

    uvs[i * 2] = u;
    uvs[i * 2 + 1] = v;
  }

  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
}

/**
 * Generate UVs using spherical projection
 */
export function sphericalUVUnwrap(geometry: THREE.BufferGeometry): void {
  const positions = geometry.attributes.position;
  const uvs = new Float32Array(positions.count * 2);

  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox!;
  const center = new THREE.Vector3();
  bbox.getCenter(center);

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i) - center.x;
    const y = positions.getY(i) - center.y;
    const z = positions.getZ(i) - center.z;

    const r = Math.sqrt(x * x + y * y + z * z);
    const theta = Math.atan2(z, x); // azimuth
    const phi = Math.acos(y / (r || 1)); // polar

    const u = (theta + Math.PI) / (2 * Math.PI);
    const v = phi / Math.PI;

    uvs[i * 2] = u;
    uvs[i * 2 + 1] = v;
  }

  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
}

// ============ SPRINT 24: TEXTURE BAKING ============

export type BakeType =
  | 'albedo' | 'normal' | 'metallic' | 'roughness'
  | 'ao' | 'emissive' | 'height' | 'curvature'
  | 'thickness' | 'lightmap' | 'combined_orm';

export interface BakeConfig {
  type: BakeType;
  resolution: number;
  samples: number;
  margin: number; // pixel padding
  UVSpace: 'uv0' | 'uv1' | 'uv2';
  filter: 'box' | 'gaussian' | 'mitchell';
  denoise: boolean;
  denoiseStrength: number;
  colorSpace: 'sRGB' | 'Linear';
  bitDepth: 8 | 16;
  format: 'png' | 'exr' | 'tiff' | 'ktx2';
}

export const BAKE_TYPES: Array<{ type: BakeType; label: string; description: string; colorSpace: string }> = [
  { type: 'albedo', label: 'Albedo / Base Color', description: 'Base color without lighting', colorSpace: 'sRGB' },
  { type: 'normal', label: 'Normal Map', description: 'Tangent-space normal map', colorSpace: 'Linear' },
  { type: 'metallic', label: 'Metallic', description: 'Metallic mask (grayscale)', colorSpace: 'Linear' },
  { type: 'roughness', label: 'Roughness', description: 'Roughness map (grayscale)', colorSpace: 'Linear' },
  { type: 'ao', label: 'Ambient Occlusion', description: 'Baked ambient occlusion', colorSpace: 'Linear' },
  { type: 'emissive', label: 'Emissive', description: 'Emission color map', colorSpace: 'sRGB' },
  { type: 'height', label: 'Height / Displacement', description: 'Height map for tessellation', colorSpace: 'Linear' },
  { type: 'curvature', label: 'Curvature', description: 'Convex/concave curvature map', colorSpace: 'Linear' },
  { type: 'thickness', label: 'Thickness', description: 'Mesh thickness (SSS)', colorSpace: 'Linear' },
  { type: 'lightmap', label: 'Lightmap', description: 'Baked lighting (precomputed)', colorSpace: 'sRGB' },
  { type: 'combined_orm', label: 'ORM (Packed)', description: 'AO (R) + Roughness (G) + Metallic (B)', colorSpace: 'Linear' },
];

export const BAKE_RESOLUTIONS = [128, 256, 512, 1024, 2048, 4096, 8192];

// ============ SPRINT 25: PBR MATERIAL EDITOR ============

export interface MaterialNode {
  id: string;
  type: 'input' | 'texture' | 'math' | 'vector' | 'color' | 'output' | 'constant' | 'noise' | 'blend' | 'curve';
  subtype: string;
  label: string;
  position: { x: number; y: number };
  inputs: Array<{ id: string; name: string; type: string; connected: boolean; defaultValue?: any }>;
  outputs: Array<{ id: string; name: string; type: string }>;
  properties: Record<string, any>;
  preview?: string; // base64 thumbnail
}

export interface MaterialNodeConnection {
  id: string;
  fromNode: string;
  fromPort: string;
  toNode: string;
  toPort: string;
}

export interface MaterialGraph {
  id: string;
  name: string;
  nodes: MaterialNode[];
  connections: MaterialNodeConnection[];
  outputNode: string;
}

export const MATERIAL_NODE_LIBRARY: Array<{ category: string; nodes: Array<{ type: string; subtype: string; label: string; inputs: string[]; outputs: string[] }> }> = [
  {
    category: 'Input',
    nodes: [
      { type: 'input', subtype: 'position', label: 'Position', inputs: [], outputs: ['vec3'] },
      { type: 'input', subtype: 'normal', label: 'Normal', inputs: [], outputs: ['vec3'] },
      { type: 'input', subtype: 'uv', label: 'UV', inputs: [], outputs: ['vec2'] },
      { type: 'input', subtype: 'tangent', label: 'Tangent', inputs: [], outputs: ['vec3'] },
      { type: 'input', subtype: 'bitangent', label: 'Bitangent', inputs: [], outputs: ['vec3'] },
      { type: 'input', subtype: 'view_dir', label: 'View Direction', inputs: [], outputs: ['vec3'] },
      { type: 'input', subtype: 'time', label: 'Time', inputs: [], outputs: ['float'] },
      { type: 'input', subtype: 'screen_uv', label: 'Screen UV', inputs: [], outputs: ['vec2'] },
    ],
  },
  {
    category: 'Texture',
    nodes: [
      { type: 'texture', subtype: 'sample2d', label: 'Texture 2D', inputs: ['uv'], outputs: ['color', 'r', 'g', 'b', 'a'] },
      { type: 'texture', subtype: 'sample_cube', label: 'Cubemap', inputs: ['dir'], outputs: ['color'] },
      { type: 'texture', subtype: 'sample3d', label: 'Texture 3D', inputs: ['uvw'], outputs: ['color'] },
    ],
  },
  {
    category: 'Math',
    nodes: [
      { type: 'math', subtype: 'add', label: 'Add', inputs: ['a', 'b'], outputs: ['result'] },
      { type: 'math', subtype: 'subtract', label: 'Subtract', inputs: ['a', 'b'], outputs: ['result'] },
      { type: 'math', subtype: 'multiply', label: 'Multiply', inputs: ['a', 'b'], outputs: ['result'] },
      { type: 'math', subtype: 'divide', label: 'Divide', inputs: ['a', 'b'], outputs: ['result'] },
      { type: 'math', subtype: 'mix', label: 'Mix/Lerp', inputs: ['a', 'b', 't'], outputs: ['result'] },
      { type: 'math', subtype: 'clamp', label: 'Clamp', inputs: ['value', 'min', 'max'], outputs: ['result'] },
      { type: 'math', subtype: 'sine', label: 'Sin', inputs: ['x'], outputs: ['result'] },
      { type: 'math', subtype: 'cosine', label: 'Cos', inputs: ['x'], outputs: ['result'] },
      { type: 'math', subtype: 'power', label: 'Power', inputs: ['base', 'exp'], outputs: ['result'] },
      { type: 'math', subtype: 'abs', label: 'Absolute', inputs: ['x'], outputs: ['result'] },
      { type: 'math', subtype: 'floor', label: 'Floor', inputs: ['x'], outputs: ['result'] },
      { type: 'math', subtype: 'smoothstep', label: 'Smooth Step', inputs: ['edge0', 'edge1', 'x'], outputs: ['result'] },
    ],
  },
  {
    category: 'Vector',
    nodes: [
      { type: 'vector', subtype: 'vec3_const', label: 'Vector3', inputs: [], outputs: ['vec3'] },
      { type: 'vector', subtype: 'vec2_const', label: 'Vector2', inputs: [], outputs: ['vec2'] },
      { type: 'vector', subtype: 'float_const', label: 'Float', inputs: [], outputs: ['float'] },
      { type: 'vector', subtype: 'split', label: 'Split XYZ', inputs: ['vec3'], outputs: ['x', 'y', 'z'] },
      { type: 'vector', subtype: 'combine', label: 'Combine XYZ', inputs: ['x', 'y', 'z'], outputs: ['vec3'] },
      { type: 'vector', subtype: 'dot', label: 'Dot Product', inputs: ['a', 'b'], outputs: ['float'] },
      { type: 'vector', subtype: 'cross', label: 'Cross Product', inputs: ['a', 'b'], outputs: ['vec3'] },
      { type: 'vector', subtype: 'normalize', label: 'Normalize', inputs: ['vec3'], outputs: ['vec3'] },
      { type: 'vector', subtype: 'reflect', label: 'Reflect', inputs: ['incident', 'normal'], outputs: ['vec3'] },
    ],
  },
  {
    category: 'Color',
    nodes: [
      { type: 'color', subtype: 'color_const', label: 'Color', inputs: [], outputs: ['color'] },
      { type: 'color', subtype: 'rgb_to_hsv', label: 'RGB to HSV', inputs: ['rgb'], outputs: ['hsv'] },
      { type: 'color', subtype: 'hsv_to_rgb', label: 'HSV to RGB', inputs: ['hsv'], outputs: ['rgb'] },
      { type: 'color', subtype: 'brightness_contrast', label: 'Brightness/Contrast', inputs: ['color', 'bright', 'contrast'], outputs: ['color'] },
      { type: 'color', subtype: 'gamma', label: 'Gamma', inputs: ['color', 'gamma'], outputs: ['color'] },
      { type: 'color', subtype: 'invert', label: 'Invert', inputs: ['color'], outputs: ['color'] },
    ],
  },
  {
    category: 'Procedural',
    nodes: [
      { type: 'noise', subtype: 'perlin', label: 'Perlin Noise', inputs: ['uv', 'scale'], outputs: ['float'] },
      { type: 'noise', subtype: 'simplex', label: 'Simplex Noise', inputs: ['uv', 'scale'], outputs: ['float'] },
      { type: 'noise', subtype: 'voronoi', label: 'Voronoi', inputs: ['uv', 'scale'], outputs: ['float', 'color'] },
      { type: 'noise', subtype: 'cellular', label: 'Cellular', inputs: ['uv', 'scale'], outputs: ['float'] },
      { type: 'noise', subtype: 'fbm', label: 'FBM', inputs: ['uv', 'scale', 'octaves'], outputs: ['float'] },
      { type: 'noise', subtype: 'ridge', label: 'Ridge', inputs: ['uv', 'scale'], outputs: ['float'] },
    ],
  },
  {
    category: 'Blend',
    nodes: [
      { type: 'blend', subtype: 'normal', label: 'Normal Blend', inputs: ['base', 'blend', 'opacity'], outputs: ['result'] },
      { type: 'blend', subtype: 'multiply', label: 'Multiply Blend', inputs: ['base', 'blend', 'opacity'], outputs: ['result'] },
      { type: 'blend', subtype: 'screen', label: 'Screen Blend', inputs: ['base', 'blend', 'opacity'], outputs: ['result'] },
      { type: 'blend', subtype: 'overlay', label: 'Overlay Blend', inputs: ['base', 'blend', 'opacity'], outputs: ['result'] },
      { type: 'blend', subtype: 'soft_light', label: 'Soft Light', inputs: ['base', 'blend', 'opacity'], outputs: ['result'] },
    ],
  },
  {
    category: 'Output',
    nodes: [
      { type: 'output', subtype: 'albedo', label: 'Albedo Output', inputs: ['color'], outputs: [] },
      { type: 'output', subtype: 'normal', label: 'Normal Output', inputs: ['normal'], outputs: [] },
      { type: 'output', subtype: 'metallic', label: 'Metallic Output', inputs: ['value'], outputs: [] },
      { type: 'output', subtype: 'roughness', label: 'Roughness Output', inputs: ['value'], outputs: [] },
      { type: 'output', subtype: 'emissive', label: 'Emissive Output', inputs: ['color', 'strength'], outputs: [] },
      { type: 'output', subtype: 'ao', label: 'AO Output', inputs: ['value'], outputs: [] },
      { type: 'output', subtype: 'opacity', label: 'Opacity Output', inputs: ['value'], outputs: [] },
      { type: 'output', subtype: 'displacement', label: 'Displacement Output', inputs: ['value'], outputs: [] },
    ],
  },
];

/**
 * Evaluate material graph — generate shader code
 */
export function generateShaderFromGraph(graph: MaterialGraph): string {
  let code = `// Generated PBR Shader from Material Graph\n`;
  code += `// Nodes: ${graph.nodes.length}, Connections: ${graph.connections.length}\n\n`;
  code += `uniform float time;\n\n`;
  code += `// Fragment shader\n`;
  code += `void main() {\n`;

  // Process nodes in topological order
  const processed = new Set<string>();
  const processNode = (nodeId: string, depth: number = 0) => {
    if (processed.has(nodeId) || depth > 50) return;
    const node = graph.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Process input dependencies first
    const inputConnections = graph.connections.filter((c) => c.toNode === nodeId);
    for (const conn of inputConnections) {
      processNode(conn.fromNode, depth + 1);
    }

    processed.add(nodeId);

    const indent = '  ';
    code += `${indent}// ${node.label} (${node.type}/${node.subtype})\n`;

    switch (node.type) {
      case 'input':
        if (node.subtype === 'uv') code += `${indent}vec2 uv_${nodeId} = vUv;\n`;
        if (node.subtype === 'normal') code += `${indent}vec3 normal_${nodeId} = vNormal;\n`;
        if (node.subtype === 'position') code += `${indent}vec3 pos_${nodeId} = vPosition;\n`;
        break;
      case 'texture':
        code += `${indent}vec4 tex_${nodeId} = texture2D(map_${nodeId}, uv);\n`;
        break;
      case 'math':
        code += `${indent}float result_${nodeId} = /* ${node.subtype} */;\n`;
        break;
      case 'color':
        code += `${indent}vec3 color_${nodeId} = vec3(${node.properties.r || 1}, ${node.properties.g || 1}, ${node.properties.b || 1});\n`;
        break;
      case 'noise':
        code += `${indent}float noise_${nodeId} = /* ${node.subtype} noise */;\n`;
        break;
      case 'output':
        if (node.subtype === 'albedo') code += `${indent}gl_FragColor.rgb = /* albedo */;\n`;
        if (node.subtype === 'normal') code += `${indent}gl_FragColor.rgb = /* normal */;\n`;
        break;
    }
    code += '\n';
  };

  // Start from output node
  processNode(graph.outputNode);

  code += `}\n`;
  return code;
}

/**
 * Create default PBR material graph
 */
export function createDefaultPBRGraph(): MaterialGraph {
  const nodes: MaterialNode[] = [
    {
      id: 'node_uv',
      type: 'input',
      subtype: 'uv',
      label: 'UV',
      position: { x: 100, y: 100 },
      inputs: [],
      outputs: [{ id: 'out', name: 'uv', type: 'vec2' }],
      properties: {},
    },
    {
      id: 'node_albedo_tex',
      type: 'texture',
      subtype: 'sample2d',
      label: 'Albedo Texture',
      position: { x: 300, y: 100 },
      inputs: [{ id: 'uv', name: 'UV', type: 'vec2', connected: true }],
      outputs: [{ id: 'color', name: 'Color', type: 'vec4' }],
      properties: { texture: 'albedo.png' },
    },
    {
      id: 'node_normal_tex',
      type: 'texture',
      subtype: 'sample2d',
      label: 'Normal Texture',
      position: { x: 300, y: 250 },
      inputs: [{ id: 'uv', name: 'UV', type: 'vec2', connected: true }],
      outputs: [{ id: 'color', name: 'Color', type: 'vec4' }],
      properties: { texture: 'normal.png' },
    },
    {
      id: 'node_metallic_const',
      type: 'vector',
      subtype: 'float_const',
      label: 'Metallic',
      position: { x: 300, y: 400 },
      inputs: [],
      outputs: [{ id: 'out', name: 'Value', type: 'float' }],
      properties: { value: 0.0 },
    },
    {
      id: 'node_roughness_const',
      type: 'vector',
      subtype: 'float_const',
      label: 'Roughness',
      position: { x: 300, y: 500 },
      inputs: [],
      outputs: [{ id: 'out', name: 'Value', type: 'float' }],
      properties: { value: 0.5 },
    },
    {
      id: 'node_out_albedo',
      type: 'output',
      subtype: 'albedo',
      label: 'Albedo Output',
      position: { x: 600, y: 100 },
      inputs: [{ id: 'color', name: 'Color', type: 'vec3', connected: true }],
      outputs: [],
      properties: {},
    },
    {
      id: 'node_out_normal',
      type: 'output',
      subtype: 'normal',
      label: 'Normal Output',
      position: { x: 600, y: 250 },
      inputs: [{ id: 'normal', name: 'Normal', type: 'vec3', connected: true }],
      outputs: [],
      properties: {},
    },
    {
      id: 'node_out_metallic',
      type: 'output',
      subtype: 'metallic',
      label: 'Metallic Output',
      position: { x: 600, y: 400 },
      inputs: [{ id: 'value', name: 'Value', type: 'float', connected: true }],
      outputs: [],
      properties: {},
    },
    {
      id: 'node_out_roughness',
      type: 'output',
      subtype: 'roughness',
      label: 'Roughness Output',
      position: { x: 600, y: 500 },
      inputs: [{ id: 'value', name: 'Value', type: 'float', connected: true }],
      outputs: [],
      properties: {},
    },
  ];

  const connections: MaterialNodeConnection[] = [
    { id: 'c1', fromNode: 'node_uv', fromPort: 'out', toNode: 'node_albedo_tex', toPort: 'uv' },
    { id: 'c2', fromNode: 'node_uv', fromPort: 'out', toNode: 'node_normal_tex', toPort: 'uv' },
    { id: 'c3', fromNode: 'node_albedo_tex', fromPort: 'color', toNode: 'node_out_albedo', toPort: 'color' },
    { id: 'c4', fromNode: 'node_normal_tex', fromPort: 'color', toNode: 'node_out_normal', toPort: 'normal' },
    { id: 'c5', fromNode: 'node_metallic_const', fromPort: 'out', toNode: 'node_out_metallic', toPort: 'value' },
    { id: 'c6', fromNode: 'node_roughness_const', fromPort: 'out', toNode: 'node_out_roughness', toPort: 'value' },
  ];

  return {
    id: `mat_graph_${Date.now()}`,
    name: 'Default PBR',
    nodes,
    connections,
    outputNode: 'node_out_albedo',
  };
}
