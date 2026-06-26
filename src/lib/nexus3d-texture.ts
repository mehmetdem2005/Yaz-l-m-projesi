/**
 * NEXUS 3D Studio — Texture Viewer System (Sprint 6)
 *
 * Texture görselleştirme ve yönetim:
 * - Albedo/Diffuse (sRGB)
 * - Normal (Linear, tangent space)
 * - Metallic (Linear)
 * - Roughness (Linear)
 * - AO (Linear)
 * - Emissive (sRGB)
 * - Height/Displacement (Linear)
 * - Color space detection
 * - Channel viewer (R/G/B/A/Luminance)
 * - MIP level preview
 * - Texture size info
 * - Compression info
 */

export type TextureType =
  | 'albedo'
  | 'normal'
  | 'metallic'
  | 'roughness'
  | 'ao'
  | 'emissive'
  | 'height'
  | 'opacity'
  | 'specular'
  | 'glossiness'
  | 'orm'; // Occlusion-Roughness-Metallic packed

export type TextureColorSpace = 'sRGB' | 'Linear' | 'None';

export type TextureChannel = 'rgb' | 'r' | 'g' | 'b' | 'a' | 'luminance';

export interface TextureInfo {
  id: string;
  name: string;
  type: TextureType;
  url: string;
  width: number;
  height: number;
  channels: number; // 1=Gray, 3=RGB, 4=RGBA
  bitDepth: number; // 8, 16, 32
  colorSpace: TextureColorSpace;
  format: string; // png, jpg, webp, ktx2, tga, hdr
  fileSize: number;
  compression?: string;
  mipLevels?: number;
  anisotropy?: number;
  wrapS: string;
  wrapT: string;
  flipY: boolean;
  premultiplyAlpha: boolean;
}

export interface TextureSlotConfig {
  type: TextureType;
  label: string;
  colorSpace: TextureColorSpace;
  description: string;
  isPacked: boolean;
  packedChannel?: 'r' | 'g' | 'b' | 'a';
}

/**
 * Texture slot configuration — hangi texture tipi hangi color space kullanır
 */
export const TEXTURE_SLOTS: Record<TextureType, TextureSlotConfig> = {
  albedo: {
    type: 'albedo',
    label: 'Albedo / Base Color',
    colorSpace: 'sRGB',
    description: 'Temel renk tekstürü. sRGB color space. Metal için genelde beyaz veya çok açık renk.',
    isPacked: false,
  },
  normal: {
    type: 'normal',
    label: 'Normal Map',
    colorSpace: 'Linear',
    description: 'Tangent space normal haritası. Mavi tonlu (RGB). Linear color space.',
    isPacked: false,
  },
  metallic: {
    type: 'metallic',
    label: 'Metallic',
    colorSpace: 'Linear',
    description: 'Metaliklik haritası. Beyaz=metal, siyah=dielektrik. Linear color space.',
    isPacked: false,
  },
  roughness: {
    type: 'roughness',
    label: 'Roughness',
    colorSpace: 'Linear',
    description: 'Pürüzlülük haritası. Beyaz=pürüzlü, siyah=pürüzsüz/cilalı. Linear color space.',
    isPacked: false,
  },
  ao: {
    type: 'ao',
    label: 'Ambient Occlusion',
    colorSpace: 'Linear',
    description: 'Ortam occlusion haritası. Beyaz=açık, siyah=gölge. Linear color space.',
    isPacked: false,
  },
  emissive: {
    type: 'emissive',
    label: 'Emissive',
    colorSpace: 'sRGB',
    description: 'Yayılımcı ışık haritası. Kendinden parlama efekti. sRGB color space.',
    isPacked: false,
  },
  height: {
    type: 'height',
    label: 'Height / Displacement',
    colorSpace: 'Linear',
    description: 'Yükseklik/displacement haritası. Tessellation ve parallax mapping için. Linear.',
    isPacked: false,
  },
  opacity: {
    type: 'opacity',
    label: 'Opacity / Alpha',
    colorSpace: 'Linear',
    description: 'Saydamlık haritası. Beyaz=opak, siyah=şeffaf. Linear color space.',
    isPacked: false,
  },
  specular: {
    type: 'specular',
    label: 'Specular (legacy)',
    colorSpace: 'sRGB',
    description: 'Specular-glossiness workflow için. Legacy, metallic-roughness tercih edilir.',
    isPacked: false,
  },
  glossiness: {
    type: 'glossiness',
    label: 'Glossiness (legacy)',
    colorSpace: 'Linear',
    description: 'Specular-glossiness workflow için. Roughness tersi. Legacy.',
    isPacked: false,
  },
  orm: {
    type: 'orm',
    label: 'ORM (Packed)',
    colorSpace: 'Linear',
    description: 'Occlusion (R) + Roughness (G) + Metallic (B) packed texture. glTF standard.',
    isPacked: true,
  },
};

/**
 * Texture resolution presets
 */
export const TEXTURE_RESOLUTIONS: Array<{ size: number; label: string; use: string }> = [
  { size: 32, label: '32×32', use: 'Icon / thumbnail' },
  { size: 64, label: '64×64', use: 'UI element' },
  { size: 128, label: '128×128', use: 'Small prop' },
  { size: 256, label: '256×256', use: 'Mobile prop' },
  { size: 512, label: '512×512', use: 'Standard prop' },
  { size: 1024, label: '1024×1024', use: 'Character/weapon' },
  { size: 2048, label: '2048×2048', use: 'Hero character' },
  { size: 4096, label: '4096×4096', use: 'AAA character' },
  { size: 8192, label: '8192×8192', use: 'Cinematic / environment' },
];

/**
 * Texture compression formats
 */
export const TEXTURE_COMPRESSION: Array<{ format: string; label: string; platform: string; ratio: string }> = [
  { format: 'BC1', label: 'BC1 (DXT1)', platform: 'Desktop PC', ratio: '6:1 (RGB)' },
  { format: 'BC3', label: 'BC3 (DXT5)', platform: 'Desktop PC', ratio: '4:1 (RGBA)' },
  { format: 'BC5', label: 'BC5 (ATI2)', platform: 'Desktop PC', ratio: '2:1 (Normal map)' },
  { format: 'BC7', label: 'BC7', platform: 'Desktop PC (modern)', ratio: '3:1 (high quality)' },
  { format: 'ASTC', label: 'ASTC', platform: 'Mobile (iOS/Android)', ratio: 'Configurable 4:1-12:1' },
  { format: 'ETC2', label: 'ETC2', platform: 'Mobile (OpenGL ES 3)', ratio: '6:1 (RGB)' },
  { format: 'PVRTC', label: 'PVRTC', platform: 'iOS (legacy)', ratio: '4:1-8:1' },
  { format: 'KTX2', label: 'KTX2 + Basis', platform: 'Universal (WebGL)', ratio: 'Configurable' },
];

/**
 * Validate texture
 */
export function validateTexture(info: TextureInfo): { valid: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Power of 2 check
  const isPowerOf2 = (n: number) => Math.log2(n) % 1 === 0;
  if (!isPowerOf2(info.width) || !isPowerOf2(info.height)) {
    warnings.push('Texture boyutu 2nin kuvveti degil. MIP mapping calismayabilir.');
  }

  // Resolution check
  if (info.width > 4096 || info.height > 4096) {
    warnings.push(`Yuksek cozunurluk: ${info.width}x${info.height}. Mobile icin optimize edin.`);
  }

  // Color space check
  if (info.type === 'albedo' && info.colorSpace !== 'sRGB') {
    errors.push('Albedo texture sRGB color space kullanmali.');
  }
  if ((info.type === 'normal' || info.type === 'metallic' || info.type === 'roughness' || info.type === 'ao') && info.colorSpace !== 'Linear') {
    errors.push(`${info.type} texture Linear color space kullanmali.`);
  }

  // File size check
  if (info.fileSize > 20 * 1024 * 1024) {
    warnings.push(`Buyuk dosya: ${(info.fileSize / 1024 / 1024).toFixed(1)}MB. Sikistirma kullanin.`);
  }

  // Format check
  if (info.format === 'jpg' && (info.type === 'normal' || info.type === 'metallic' || info.type === 'roughness')) {
    warnings.push('JPG data texture icin lossless degil. PNG veya KTX2 kullanin.');
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Format texture file size
 */
export function formatTextureSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Get channel color for display
 */
export function getChannelColor(channel: TextureChannel): string {
  switch (channel) {
    case 'r': return '#ff0000';
    case 'g': return '#00ff00';
    case 'b': return '#0000ff';
    case 'a': return '#ffffff';
    case 'luminance': return '#ffff00';
    default: return '#ffffff';
  }
}
