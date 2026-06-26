/**
 * NEXUS 3D Studio — Blend Import System (Sprint 10)
 *
 * Blender .blend dosya yükleme:
 * - Python script ile Blender headless mode
 * - .blend → .glb conversion pipeline
 * - Scene extraction (objects, materials, particles, physics)
 * - Blender Python API bridge
 * - Mesh, armature, animation, particle system extraction
 * - Material node graph → PBR conversion
 *
 * Not: Gerçek .blend parse C++ DNA gerektirir.
 * Bu modül, Blender'ı headless mode'da çalıştırıp
 * .glb'ye dönüştüren bir pipeline kurar.
 */

export interface BlendImportConfig {
  convertTo: 'glb' | 'gltf' | 'fbx' | 'obj' | 'usd';
  blenderPath: string; // /usr/bin/blender
  scriptPath: string;  // conversion script
  importMeshes: boolean;
  importArmatures: boolean;
  importAnimations: boolean;
  importMaterials: boolean;
  importTextures: boolean;
  importParticles: boolean;
  importPhysics: boolean;
  importCameras: boolean;
  importLights: boolean;
  applyModifiers: boolean;
  triangulate: boolean;
  exportScale: number;
}

export const DEFAULT_BLEND_CONFIG: BlendImportConfig = {
  convertTo: 'glb',
  blenderPath: 'blender',
  scriptPath: '/scripts/blender_convert.py',
  importMeshes: true,
  importArmatures: true,
  importAnimations: true,
  importMaterials: true,
  importTextures: true,
  importParticles: false,
  importPhysics: false,
  importCameras: true,
  importLights: true,
  applyModifiers: true,
  triangulate: true,
  exportScale: 1.0,
};

export interface BlendSceneInfo {
  objects: number;
  meshes: number;
  armatures: number;
  cameras: number;
  lights: number;
  materials: number;
  textures: number;
  animations: number;
  particleSystems: number;
  physicsObjects: number;
  collections: number;
  totalPolygons: number;
  totalVertices: number;
  blenderVersion: string;
  fileSize: number;
}

export interface BlendObject {
  name: string;
  type: 'MESH' | 'ARMATURE' | 'CAMERA' | 'LIGHT' | 'EMPTY' | 'CURVE' | 'SURFACE' | 'META' | 'FONT' | 'LATTICE' | 'SPEAKER' | 'LIGHT_PROBE';
  collection: string;
  location: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  visible: boolean;
  vertexCount?: number;
  polygonCount?: number;
  materialSlots?: string[];
  modifiers?: string[];
  parent?: string;
  children?: string[];
}

export interface BlendMaterial {
  name: string;
  type: 'PRINCIPLED' | 'EMISSIVE' | 'DIFFUSE' | 'GLOSSY' | 'GLASS' | 'MIX' | 'ADD' | 'CUSTOM';
  nodes: number;
  links: number;
  baseColor: [number, number, number, number];
  metallic: number;
  roughness: number;
  emissionColor: [number, number, number];
  emissionStrength: number;
  alpha: number;
  hasVolume: boolean;
  hasDisplacement: boolean;
  textureCount: number;
}

/**
 * Blender Python conversion script template
 * .blend → .glb
 */
export const BLENDER_CONVERT_SCRIPT = `
import bpy
import sys
import json

# Args: input.blend output.glb
input_file = sys.argv[-2]
output_file = sys.argv[-1]

# Open blend file
bpy.ops.wm.open_mainfile(filepath=input_file)

# Apply all modifiers
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        bpy.context.view_layer.objects.active = obj
        for mod in obj.modifiers:
            try:
                bpy.ops.object.modifier_apply(modifier=mod.name)
            except:
                pass

# Triangulate all meshes
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.mode_set(mode='OBJECT')
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.quads_convert_to_tris()
        bpy.ops.object.mode_set(mode='OBJECT')

# Export to glTF
bpy.ops.export_scene.gltf(
    filepath=output_file,
    export_format='GLB',
    export_apply=True,
    export_texcoords=True,
    export_normals=True,
    export_materials='EXPORT',
    export_colors=True,
    export_cameras=True,
    export_extras=True,
    export_yup=True,
    export_skins=True,
    export_morph=True,
    export_animations=True,
)

# Collect scene info
scene_info = {
    'objects': len(bpy.data.objects),
    'meshes': len([o for o in bpy.data.objects if o.type == 'MESH']),
    'armatures': len([o for o in bpy.data.objects if o.type == 'ARMATURE']),
    'cameras': len([o for o in bpy.data.objects if o.type == 'CAMERA']),
    'lights': len([o for o in bpy.data.objects if o.type == 'LIGHT']),
    'materials': len(bpy.data.materials),
    'textures': len(bpy.data.textures),
    'animations': len(bpy.data.actions),
    'particleSystems': sum(len(o.particle_systems) for o in bpy.data.objects if o.type == 'MESH'),
    'collections': len(bpy.data.collections),
    'blenderVersion': bpy.app.version_string,
}

print(json.dumps(scene_info))
`;

/**
 * Generate conversion command
 */
export function generateBlenderCommand(
  blendFile: string,
  outputFile: string,
  config: BlendImportConfig = DEFAULT_BLEND_CONFIG
): string {
  const parts = [
    config.blenderPath,
    '--background',
    '--python',
    config.scriptPath,
    '--',
    blendFile,
    outputFile,
  ];
  return parts.join(' ');
}

/**
 * Parse Blender stdout for scene info
 */
export function parseBlenderOutput(output: string): BlendSceneInfo | null {
  // Find JSON in output
  const jsonMatch = output.match(/\{[^}]+\}/);
  if (!jsonMatch) return null;

  try {
    const data = JSON.parse(jsonMatch[0]);
    return {
      objects: data.objects || 0,
      meshes: data.meshes || 0,
      armatures: data.armatures || 0,
      cameras: data.cameras || 0,
      lights: data.lights || 0,
      materials: data.materials || 0,
      textures: data.textures || 0,
      animations: data.animations || 0,
      particleSystems: data.particleSystems || 0,
      physicsObjects: 0,
      collections: data.collections || 0,
      totalPolygons: 0,
      totalVertices: 0,
      blenderVersion: data.blenderVersion || 'unknown',
      fileSize: 0,
    };
  } catch {
    return null;
  }
}

/**
 * Validate .blend file
 */
export function validateBlendFile(file: File): { valid: boolean; error?: string; warnings: string[] } {
  const warnings: string[] = [];
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();

  if (ext !== '.blend') {
    return { valid: false, error: `Gecersiz format: ${ext}. Sadece .blend desteklenir.`, warnings: [] };
  }

  if (file.size > 2 * 1024 * 1024 * 1024) {
    return { valid: false, error: 'Blend dosyasi 2GB sinirini asiyor.', warnings: [] };
  }

  // Check Blender header (first 12 bytes: "BLENDER-vXXX")
  // Real impl would read first bytes

  if (file.size > 200 * 1024 * 1024) {
    warnings.push('Buyuk blend dosyasi. Donusum uzun surebilir.');
  }

  warnings.push('Blend dosyalari Blender headless mode ile GLB formatina cevrilir.');
  warnings.push('Blender yuklu olmali (blender.org).');

  return { valid: true, warnings };
}

/**
 * Blender version compatibility
 */
export const BLENDER_VERSIONS: Array<{ version: string; year: string; lts: boolean }> = [
  { version: '4.2', year: '2024', lts: true },
  { version: '4.1', year: '2024', lts: false },
  { version: '4.0', year: '2023', lts: false },
  { version: '3.6', year: '2023', lts: true },
  { version: '3.5', year: '2023', lts: false },
  { version: '3.4', year: '2022', lts: false },
  { version: '3.3', year: '2022', lts: true },
];

/**
 * Blender modifier types — .blend import'da uygulanabilir
 */
export const BLENDER_MODIFIERS: Array<{ name: string; category: string; description: string }> = [
  { name: 'Subdivision Surface', category: 'Generate', description: 'Catmull-Clark veya Simple subdivision' },
  { name: 'Mirror', category: 'Generate', description: 'Eksen boyunca ayna kopya' },
  { name: 'Array', category: 'Generate', description: 'Dizi kopya olustur' },
  { name: 'Boolean', category: 'Generate', description: 'Union, Difference, Intersect' },
  { name: 'Bevel', category: 'Generate', description: 'Kenar yumusatma' },
  { name: 'Solidify', category: 'Generate', description: 'Yuzeye kalinlik ver' },
  { name: 'Screw', category: 'Generate', description: 'Eksen etrafinda dondur' },
  { name: 'Decimate', category: 'Generate', description: 'Polygon azaltma' },
  { name: 'Remesh', category: 'Generate', description: 'Topoloji yeniden olusturma' },
  { name: 'Smooth', category: 'Deform', description: 'Yuzey yumusatma' },
  { name: 'Wave', category: 'Deform', description: 'Dalga deformasyonu' },
  { name: 'Armature', category: 'Deform', description: 'Skeleton deformasyonu' },
  { name: 'Cast', category: 'Deform', description: 'Sekil cast (sphere/cylinder)' },
  { name: 'Curve', category: 'Deform', description: 'Curve boyunca deformasyon' },
  { name: 'Hook', category: 'Deform', description: 'Vertex hook kontrol' },
  { name: 'Lattice', category: 'Deform', description: 'Lattice deformasyonu' },
  { name: 'Shrinkwrap', category: 'Deform', description: 'Yuzeye yapistir' },
  { name: 'Simple Deform', category: 'Deform', description: 'Bend/Twist/Taper/Stretch' },
  { name: 'Collision', category: 'Physics', description: 'Carpisma' },
  { name: 'Cloth', category: 'Physics', description: 'Kumas simulasyonu' },
  { name: 'Fluid', category: 'Physics', description: 'Sivi simulasyonu' },
  { name: 'Soft Body', category: 'Physics', description: 'Yumusak govde' },
  { name: 'Ocean', category: 'Physics', description: 'Okyanus simulasyonu' },
  { name: 'Particle Instance', category: 'Physics', description: 'Partikul olusturma' },
];

/**
 * Blender material node types
 */
export const BLENDER_NODE_TYPES: Array<{ category: string; nodes: string[] }> = [
  {
    category: 'Input',
    nodes: ['Texture Coordinate', 'UV Map', 'Attribute', 'Vertex Color', 'Camera Data', 'New Geometry', 'Object Info', 'RGB', 'Value', 'Time'],
  },
  {
    category: 'Texture',
    nodes: ['Image Texture', 'Environment Texture', 'Brick Texture', 'Checker Texture', 'Gradient Texture', 'Magic Texture', 'Musgrave Texture', 'Noise Texture', 'Voronoi Texture', 'Wave Texture'],
  },
  {
    category: 'Shader',
    nodes: ['Principled BSDF', 'Diffuse BSDF', 'Glossy BSDF', 'Glass BSDF', 'Refraction BSDF', 'Transparent BSDF', 'Translucent BSDF', 'Anisotropic BSDF', 'Subsurface Scattering', 'Emission', 'Hair BSDF', 'Holdout', 'Mix Shader', 'Add Shader'],
  },
  {
    category: 'Vector',
    nodes: ['Mapping', 'Bump', 'Normal Map', 'Vector Transform', 'Displacement', 'Curve', 'Vector Math'],
  },
  {
    category: 'Color',
    nodes: ['MixRGB', 'Separate RGB', 'Combine RGB', 'Separate HSV', 'Combine HSV', 'Hue/Saturation', 'Gamma', 'Invert', 'Light Falcon', 'Bright/Contrast'],
  },
  {
    category: 'Converter',
    nodes: ['Math', 'Vector Math', 'Separate XYZ', 'Combine XYZ', 'RGB to BW', 'ColorRamp', 'Value to Normal', 'Wavelength', 'Blackbody'],
  },
  {
    category: 'Output',
    nodes: ['Material Output', 'World Output', 'Light Output', 'Eevee Specular'],
  },
];
