/**
 * NEXUS 3D Studio — Bone Hierarchy Editor (Sprint 11)
 *
 * Tam bone hierarchy editörü:
 * - Bone ekle/sil/yeniden adlandır
 * - Parent-child ilişkilerini düzenle
 * - Bone tipi (root, spine, limb, digit, tail, custom)
 * - Bone renkleri (laterality: L/R/center)
 * - Bone constraint'leri (IK, copy rotation, limit)
 * - Bone groups
 * - Mirror operations (L↔R)
 * - Bone layer management (32 layers)
 * - Naming convention validation
 */

import * as THREE from 'three';

export type BoneType = 'root' | 'spine' | 'head' | 'arm' | 'hand' | 'finger' | 'leg' | 'foot' | 'toe' | 'tail' | 'wing' | 'custom';
export type BoneSide = 'center' | 'left' | 'right';

export interface BoneExtended {
  id: string;
  name: string;
  type: BoneType;
  side: BoneSide;
  parentId: string | null;
  childrenIds: string[];
  head: THREE.Vector3;  // bone start position
  tail: THREE.Vector3;  // bone end position
  roll: number;         // rotation around bone axis
  length: number;       // head-to-tail distance
  color: string;
  layer: number;        // 0-31
  group?: string;
  constraints: BoneConstraint[];
  customShape?: string;  // custom display mesh
  hide: boolean;
  locked: boolean;
  deform: boolean;      // affects mesh vertices
}

export interface BoneConstraint {
  id: string;
  type: 'IK' | 'COPY_LOCATION' | 'COPY_ROTATION' | 'COPY_SCALE' | 'LIMIT_DISTANCE' | 'LIMIT_LOCATION' | 'LIMIT_ROTATION' | 'TRACK_TO' | 'LOCKED_TRACK' | 'CHILD_OF' | 'SHRINKWRAP' | 'DAMPED_TRACK' | 'STRETCH_TO';
  name: string;
  target: string;       // target bone id
  subtarget?: string;   // subtarget bone
  influence: number;    // 0-1
  enabled: boolean;
  properties: Record<string, unknown>;
}

export interface BoneGroup {
  id: string;
  name: string;
  color: string;
  boneIds: string[];
}

export interface BoneLayer {
  index: number;        // 0-31
  name: string;
  visible: boolean;
  locked: boolean;
  boneIds: string[];
}

/**
 * Bone naming convention validator
 */
export const BONE_NAMING_RULES: Array<{ rule: string; pattern: RegExp; example: string }> = [
  { rule: 'PascalCase', pattern: /^[A-Z][a-zA-Z0-9]*$/, example: 'UpperArm' },
  { rule: 'Side suffix .L/.R', pattern: /\.[LR]$/, example: 'UpperArm.L' },
  { rule: 'Side suffix _L/_R', pattern: /_[LR]$/, example: 'UpperArm_L' },
  { rule: 'No spaces', pattern: /^\S+$/, example: 'UpperArm' },
  { rule: 'No special chars', pattern: /^[a-zA-Z0-9._]+$/, example: 'UpperArm.L.001' },
];

export function validateBoneName(name: string): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  if (name.includes(' ')) violations.push('Bosluk iceremez');
  if (!/^[a-zA-Z]/.test(name)) violations.push('Harfle baslamali');
  if (/[^\w.]/.test(name)) violations.push('Ozel karakter iceremez (sadece harf, rakam, nokta, alt cizgi)');
  if (name.length > 64) violations.push('64 karakteri asamaz');

  return { valid: violations.length === 0, violations };
}

/**
 * Detect bone side from name
 */
export function detectBoneSide(name: string): BoneSide {
  if (name.endsWith('.L') || name.endsWith('_L') || name.endsWith('Left')) return 'left';
  if (name.endsWith('.R') || name.endsWith('_R') || name.endsWith('Right')) return 'right';
  return 'center';
}

/**
 * Bone type colors (AAA convention)
 */
export const BONE_TYPE_COLORS: Record<BoneType, string> = {
  root: '#ef4444',
  spine: '#f97316',
  head: '#eab308',
  arm: '#22c55e',
  hand: '#22c55e',
  finger: '#22c55e',
  leg: '#a855f7',
  foot: '#a855f7',
  toe: '#a855f7',
  tail: '#06b6d4',
  wing: '#3b82f6',
  custom: '#64748b',
};

/**
 * Bone side colors
 */
export const BONE_SIDE_COLORS: Record<BoneSide, string> = {
  left: '#22c55e',
  right: '#06b6d4',
  center: '#a855f7',
};

/**
 * Bone hierarchy operations
 */
export class BoneHierarchyEditor {
  private bones: Map<string, BoneExtended> = new Map();
  private rootId: string | null = null;
  private groups: Map<string, BoneGroup> = new Map();
  private layers: BoneLayer[] = Array.from({ length: 32 }, (_, i) => ({
    index: i,
    name: i === 0 ? 'Default' : `Layer ${i + 1}`,
    visible: i === 0,
    locked: false,
    boneIds: [],
  }));

  addBone(bone: Omit<BoneExtended, 'id' | 'childrenIds' | 'length'>): BoneExtended {
    const id = `bone_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const length = bone.head.distanceTo(bone.tail);
    const fullBone: BoneExtended = {
      ...bone,
      id,
      childrenIds: [],
      length,
    };

    this.bones.set(id, fullBone);

    // Link to parent
    if (bone.parentId) {
      const parent = this.bones.get(bone.parentId);
      if (parent) {
        parent.childrenIds.push(id);
      }
    } else if (!this.rootId) {
      this.rootId = id;
    }

    // Add to layer
    this.layers[bone.layer].boneIds.push(id);

    // Auto-detect side
    if (fullBone.side === 'center') {
      fullBone.side = detectBoneSide(bone.name);
    }

    return fullBone;
  }

  removeBone(id: string): void {
    const bone = this.bones.get(id);
    if (!bone) return;

    // Re-parent children to grandparent
    for (const childId of [...bone.childrenIds]) {
      const child = this.bones.get(childId);
      if (child) {
        child.parentId = bone.parentId;
        if (bone.parentId) {
          const parent = this.bones.get(bone.parentId);
          parent?.childrenIds.push(childId);
        }
      }
    }

    // Remove from parent
    if (bone.parentId) {
      const parent = this.bones.get(bone.parentId);
      if (parent) {
        parent.childrenIds = parent.childrenIds.filter((cid) => cid !== id);
      }
    }

    // Remove from layer
    this.layers[bone.layer].boneIds = this.layers[bone.layer].boneIds.filter((bid) => bid !== id);

    // Remove from groups
    this.groups.forEach((g) => {
      g.boneIds = g.boneIds.filter((bid) => bid !== id);
    });

    if (this.rootId === id) this.rootId = null;
    this.bones.delete(id);
  }

  renameBone(id: string, newName: string): { success: boolean; error?: string } {
    const bone = this.bones.get(id);
    if (!bone) return { success: false, error: 'Bone bulunamadi' };

    const validation = validateBoneName(newName);
    if (!validation.valid) return { success: false, error: validation.violations.join(', ') };

    bone.name = newName;
    bone.side = detectBoneSide(newName);
    return { success: true };
  }

  reparent(boneId: string, newParentId: string | null): { success: boolean; error?: string } {
    const bone = this.bones.get(boneId);
    if (!bone) return { success: false, error: 'Bone bulunamadi' };

    if (boneId === newParentId) return { success: false, error: 'Kendine parent olamaz' };
    if (newParentId && this.isDescendant(newParentId, boneId)) {
      return { success: false, error: 'Descendant a parent olamaz' };
    }

    // Remove from old parent
    if (bone.parentId) {
      const oldParent = this.bones.get(bone.parentId);
      if (oldParent) oldParent.childrenIds = oldParent.childrenIds.filter((id) => id !== boneId);
    }

    // Add to new parent
    bone.parentId = newParentId;
    if (newParentId) {
      const newParent = this.bones.get(newParentId);
      newParent?.childrenIds.push(boneId);
    } else if (!this.rootId) {
      this.rootId = boneId;
    }

    return { success: true };
  }

  isDescendant(descendantId: string, ancestorId: string): boolean {
    const ancestor = this.bones.get(ancestorId);
    if (!ancestor) return false;
    for (const childId of ancestor.childrenIds) {
      if (childId === descendantId) return true;
      if (this.isDescendant(descendantId, childId)) return true;
    }
    return false;
  }

  /**
   * Mirror bone hierarchy (L → R)
   */
  mirrorBones(side: 'left' | 'right'): { mirrored: number; errors: string[] } {
    const sourceSide: BoneSide = side;
    const targetSide: BoneSide = side === 'left' ? 'right' : 'left';
    let mirrored = 0;
    const errors: string[] = [];

    const sourceBones = Array.from(this.bones.values()).filter((b) => b.side === sourceSide);

    for (const bone of sourceBones) {
      // Generate mirror name
      let mirrorName = bone.name;
      if (bone.name.endsWith('.L')) mirrorName = bone.name.replace('.L', '.R');
      else if (bone.name.endsWith('.R')) mirrorName = bone.name.replace('.R', '.L');
      else if (bone.name.endsWith('_L')) mirrorName = bone.name.replace('_L', '_R');
      else if (bone.name.endsWith('_R')) mirrorName = bone.name.replace('_R', '_L');
      else continue; // No side suffix, skip

      // Check if mirror already exists
      const existing = Array.from(this.bones.values()).find((b) => b.name === mirrorName);
      if (existing) {
        errors.push(`${mirrorName} zaten var`);
        continue;
      }

      // Create mirror
      const mirrorHead = bone.head.clone();
      mirrorHead.x = -mirrorHead.x; // Mirror on X axis

      const mirrorTail = bone.tail.clone();
      mirrorTail.x = -mirrorTail.x;

      this.addBone({
        name: mirrorName,
        type: bone.type,
        side: targetSide,
        parentId: bone.parentId,
        head: mirrorHead,
        tail: mirrorTail,
        roll: -bone.roll,
        color: BONE_SIDE_COLORS[targetSide],
        layer: bone.layer,
        constraints: [],
        hide: false,
        locked: false,
        deform: bone.deform,
      });
      mirrored++;
    }

    return { mirrored, errors };
  }

  addConstraint(boneId: string, constraint: Omit<BoneConstraint, 'id'>): void {
    const bone = this.bones.get(boneId);
    if (!bone) return;
    const id = `con_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    bone.constraints.push({ ...constraint, id });
  }

  removeConstraint(boneId: string, constraintId: string): void {
    const bone = this.bones.get(boneId);
    if (!bone) return;
    bone.constraints = bone.constraints.filter((c) => c.id !== constraintId);
  }

  getBone(id: string): BoneExtended | undefined {
    return this.bones.get(id);
  }

  getAllBones(): BoneExtended[] {
    return Array.from(this.bones.values());
  }

  getRootBones(): BoneExtended[] {
    return Array.from(this.bones.values()).filter((b) => b.parentId === null);
  }

  getChildren(boneId: string): BoneExtended[] {
    const bone = this.bones.get(boneId);
    if (!bone) return [];
    return bone.childrenIds.map((id) => this.bones.get(id)).filter(Boolean) as BoneExtended[];
  }

  getBoneChain(fromId: string, toId: string): BoneExtended[] {
    const chain: BoneExtended[] = [];
    let current = this.bones.get(fromId);
    while (current && current.id !== toId) {
      chain.push(current);
      current = current.parentId ? this.bones.get(current.parentId) : undefined;
    }
    if (current) chain.push(current);
    return chain;
  }

  getDepth(boneId: string): number {
    let depth = 0;
    let current = this.bones.get(boneId);
    while (current?.parentId) {
      depth++;
      current = this.bones.get(current.parentId);
    }
    return depth;
  }

  getStats(): { totalBones: number; byType: Record<BoneType, number>; bySide: Record<BoneSide, number>; maxDepth: number; totalConstraints: number } {
    const byType: Record<string, number> = {};
    const bySide: Record<string, number> = { center: 0, left: 0, right: 0 };
    let maxDepth = 0;
    let totalConstraints = 0;

    this.bones.forEach((bone) => {
      byType[bone.type] = (byType[bone.type] || 0) + 1;
      bySide[bone.side] = (bySide[bone.side] || 0) + 1;
      maxDepth = Math.max(maxDepth, this.getDepth(bone.id));
      totalConstraints += bone.constraints.length;
    });

    return {
      totalBones: this.bones.size,
      byType: byType as Record<BoneType, number>,
      bySide: bySide as Record<BoneSide, number>,
      maxDepth,
      totalConstraints,
    };
  }

  getLayers(): BoneLayer[] {
    return this.layers;
  }

  setLayerVisible(index: number, visible: boolean): void {
    if (index >= 0 && index < 32) this.layers[index].visible = visible;
  }

  createGroup(name: string, color: string, boneIds: string[]): BoneGroup {
    const id = `grp_${Date.now()}`;
    const group: BoneGroup = { id, name, color, boneIds };
    this.groups.set(id, group);
    return group;
  }

  exportToJSON(): string {
    return JSON.stringify({
      bones: Array.from(this.bones.values()),
      groups: Array.from(this.groups.values()),
      layers: this.layers,
    }, null, 2);
  }
}

/**
 * Constraint type descriptions
 */
export const CONSTRAINT_INFO: Record<BoneConstraint['type'], { label: string; description: string; category: string }> = {
  IK: { label: 'Inverse Kinematics', description: 'Hedef noktaya gore eklemleri hesapla', category: 'Kinematics' },
  COPY_LOCATION: { label: 'Copy Location', description: 'Hedef bone konumunu kopyala', category: 'Transform' },
  COPY_ROTATION: { label: 'Copy Rotation', description: 'Hedef bone rotasyonunu kopyala', category: 'Transform' },
  COPY_SCALE: { label: 'Copy Scale', description: 'Hedef bone olcegini kopyala', category: 'Transform' },
  LIMIT_DISTANCE: { label: 'Limit Distance', description: 'Maksimum mesafe siniri', category: 'Limit' },
  LIMIT_LOCATION: { label: 'Limit Location', description: 'Konum sinirlari (min/max)', category: 'Limit' },
  LIMIT_ROTATION: { label: 'Limit Rotation', description: 'Rotasyon sinirlari (min/max)', category: 'Limit' },
  TRACK_TO: { label: 'Track To', description: 'Hedefe yonlen', category: 'Tracking' },
  LOCKED_TRACK: { label: 'Locked Track', description: 'Kilitli eksen ile hedefe yonlen', category: 'Tracking' },
  CHILD_OF: { label: 'Child Of', description: 'Dinamik parent iliskisi', category: 'Relationship' },
  SHRINKWRAP: { label: 'Shrinkwrap', description: 'Yuzeye yapistir', category: 'Surface' },
  DAMPED_TRACK: { label: 'Damped Track', description: 'Yumusak hedefe yonlen', category: 'Tracking' },
  STRETCH_TO: { label: 'Stretch To', description: 'Hedefe uzan/daral', category: 'Transform' },
};
