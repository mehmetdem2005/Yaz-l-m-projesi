/**
 * NEXUS 3D Studio — Scene Hierarchy System (Sprint 3)
 *
 * Tam scene tree yönetimi:
 * - Nesne ekleme/silme/yeniden adlandırma
 * - Parent-child ilişkileri
 * - Visibility toggle (recursive)
 * - Lock/unlock
 * - Selection (single, multi, box)
 * - Drag & drop reparenting
 * - Search/filter
 * - Type icons
 * - Expand/collapse
 * - Context menu
 */

import * as THREE from 'three';

export type SceneNodeType = 'mesh' | 'light' | 'camera' | 'bone' | 'group' | 'empty' | 'skeleton' | 'particle' | 'physics';

export interface SceneNode {
  id: string;
  name: string;
  type: SceneNodeType;
  visible: boolean;
  locked: boolean;
  expanded: boolean;
  selected: boolean;
  parentId: string | null;
  childrenIds: string[];
  // Three.js object reference (runtime only, not serialized)
  object3D?: THREE.Object3D;
  // Metadata
  vertexCount?: number;
  triangleCount?: number;
  materialCount?: number;
  boneCount?: number;
  // Icons per type
  icon: string;
  color: string;
}

export interface SceneTree {
  nodes: Map<string, SceneNode>;
  rootIds: string[];
  selectedIds: string[];
  activeId: string | null;
}

export const NODE_TYPE_CONFIG: Record<SceneNodeType, { icon: string; color: string; label: string }> = {
  mesh: { icon: 'Box', color: '#4fc3f7', label: 'Mesh' },
  light: { icon: 'Lightbulb', color: '#fbbf24', label: 'Light' },
  camera: { icon: 'Camera', color: '#22c55e', label: 'Camera' },
  bone: { icon: 'Bone', color: '#a855f7', label: 'Bone' },
  group: { icon: 'Folder', color: '#94a3b8', label: 'Group' },
  empty: { icon: 'Circle', color: '#64748b', label: 'Empty' },
  skeleton: { icon: 'GitBranch', color: '#ec4899', label: 'Skeleton' },
  particle: { icon: 'Sparkles', color: '#f97316', label: 'Particle' },
  physics: { icon: 'Atom', color: '#06b6d4', label: 'Physics' },
};

/**
 * SceneTreeManager — tüm sahne ağacı operasyonları
 */
export class SceneTreeManager {
  private tree: SceneTree;

  constructor() {
    this.tree = {
      nodes: new Map(),
      rootIds: [],
      selectedIds: [],
      activeId: null,
    };
  }

  /**
   * Yeni node ekle
   */
  addNode(node: Omit<SceneNode, 'id' | 'childrenIds' | 'expanded' | 'selected'>): SceneNode {
    const id = `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const fullNode: SceneNode = {
      ...node,
      id,
      childrenIds: [],
      expanded: true,
      selected: false,
    };

    this.tree.nodes.set(id, fullNode);

    if (node.parentId) {
      const parent = this.tree.nodes.get(node.parentId);
      if (parent) {
        parent.childrenIds.push(id);
        parent.expanded = true;
      }
    } else {
      this.tree.rootIds.push(id);
    }

    return fullNode;
  }

  /**
   * Node sil (recursive — tüm çocukları da sil)
   */
  removeNode(id: string): void {
    const node = this.tree.nodes.get(id);
    if (!node) return;

    // Recursive delete children
    for (const childId of [...node.childrenIds]) {
      this.removeNode(childId);
    }

    // Remove from parent
    if (node.parentId) {
      const parent = this.tree.nodes.get(node.parentId);
      if (parent) {
        parent.childrenIds = parent.childrenIds.filter((cid) => cid !== id);
      }
    } else {
      this.tree.rootIds = this.tree.rootIds.filter((rid) => rid !== id);
    }

    // Remove from selection
    this.tree.selectedIds = this.tree.selectedIds.filter((sid) => sid !== id);
    if (this.tree.activeId === id) this.tree.activeId = null;

    // Delete node
    this.tree.nodes.delete(id);
  }

  /**
   * Node yeniden adlandır
   */
  renameNode(id: string, newName: string): void {
    const node = this.tree.nodes.get(id);
    if (node) node.name = newName;
  }

  /**
   * Visibility toggle (recursive option)
   */
  toggleVisibility(id: string, recursive: boolean = false): void {
    const node = this.tree.nodes.get(id);
    if (!node) return;

    node.visible = !node.visible;

    if (node.object3D) {
      node.object3D.visible = node.visible;
    }

    if (recursive) {
      for (const childId of node.childrenIds) {
        this.setVisibility(childId, node.visible, true);
      }
    }
  }

  setVisibility(id: string, visible: boolean, recursive: boolean = false): void {
    const node = this.tree.nodes.get(id);
    if (!node) return;
    node.visible = visible;
    if (node.object3D) node.object3D.visible = visible;
    if (recursive) {
      for (const childId of node.childrenIds) {
        this.setVisibility(childId, visible, true);
      }
    }
  }

  /**
   * Lock/unlock
   */
  toggleLock(id: string): void {
    const node = this.tree.nodes.get(id);
    if (node) node.locked = !node.locked;
  }

  /**
   * Expand/collapse
   */
  toggleExpanded(id: string): void {
    const node = this.tree.nodes.get(id);
    if (node) node.expanded = !node.expanded;
  }

  /**
   * Selection — single
   */
  select(id: string, additive: boolean = false): void {
    if (!additive) {
      // Clear previous selection
      for (const sid of this.tree.selectedIds) {
        const n = this.tree.nodes.get(sid);
        if (n) n.selected = false;
      }
      this.tree.selectedIds = [];
    }

    const node = this.tree.nodes.get(id);
    if (node) {
      node.selected = true;
      this.tree.selectedIds.push(id);
      this.tree.activeId = id;
    }
  }

  /**
   * Multi-select (box select)
   */
  selectMultiple(ids: string[]): void {
    for (const sid of this.tree.selectedIds) {
      const n = this.tree.nodes.get(sid);
      if (n) n.selected = false;
    }
    this.tree.selectedIds = [];
    for (const id of ids) {
      const node = this.tree.nodes.get(id);
      if (node) {
        node.selected = true;
        this.tree.selectedIds.push(id);
      }
    }
    this.tree.activeId = ids[0] || null;
  }

  /**
   * Deselect all
   */
  deselectAll(): void {
    for (const sid of this.tree.selectedIds) {
      const n = this.tree.nodes.get(sid);
      if (n) n.selected = false;
    }
    this.tree.selectedIds = [];
    this.tree.activeId = null;
  }

  /**
   * Reparent — drag & drop ile node'u başka bir parent'a taşı
   */
  reparent(id: string, newParentId: string | null): { success: boolean; error?: string } {
    const node = this.tree.nodes.get(id);
    if (!node) return { success: false, error: 'Node bulunamadi' };

    // Prevent making node a child of its own descendant
    if (newParentId && this.isDescendant(newParentId, id)) {
      return { success: false, error: 'Bir node, kendi torununa parent olamaz' };
    }

    // Prevent self-parenting
    if (id === newParentId) {
      return { success: false, error: 'Node kendisine parent olamaz' };
    }

    // Remove from old parent
    if (node.parentId) {
      const oldParent = this.tree.nodes.get(node.parentId);
      if (oldParent) {
        oldParent.childrenIds = oldParent.childrenIds.filter((cid) => cid !== id);
      }
    } else {
      this.tree.rootIds = this.tree.rootIds.filter((rid) => rid !== id);
    }

    // Add to new parent
    node.parentId = newParentId;
    if (newParentId) {
      const newParent = this.tree.nodes.get(newParentId);
      if (newParent) {
        newParent.childrenIds.push(id);
        newParent.expanded = true;
      }
    } else {
      this.tree.rootIds.push(id);
    }

    // Update Three.js object hierarchy
    if (node.object3D) {
      if (node.object3D.parent) {
        node.object3D.parent.remove(node.object3D);
      }
      if (newParentId) {
        const newParentNode = this.tree.nodes.get(newParentId);
        if (newParentNode?.object3D) {
          newParentNode.object3D.add(node.object3D);
        }
      }
    }

    return { success: true };
  }

  /**
   * Check if `descendantId` is a descendant of `ancestorId`
   */
  isDescendant(descendantId: string, ancestorId: string): boolean {
    const ancestor = this.tree.nodes.get(ancestorId);
    if (!ancestor) return false;

    for (const childId of ancestor.childrenIds) {
      if (childId === descendantId) return true;
      if (this.isDescendant(descendantId, childId)) return true;
    }
    return false;
  }

  /**
   * Get node by id
   */
  getNode(id: string): SceneNode | undefined {
    return this.tree.nodes.get(id);
  }

  /**
   * Get active node
   */
  getActiveNode(): SceneNode | null {
    if (!this.tree.activeId) return null;
    return this.tree.nodes.get(this.tree.activeId) || null;
  }

  /**
   * Get all selected nodes
   */
  getSelectedNodes(): SceneNode[] {
    return this.tree.selectedIds
      .map((id) => this.tree.nodes.get(id))
      .filter(Boolean) as SceneNode[];
  }

  /**
   * Get root nodes
   */
  getRootNodes(): SceneNode[] {
    return this.tree.rootIds
      .map((id) => this.tree.nodes.get(id))
      .filter(Boolean) as SceneNode[];
  }

  /**
   * Get children of a node
   */
  getChildren(id: string): SceneNode[] {
    const node = this.tree.nodes.get(id);
    if (!node) return [];
    return node.childrenIds
      .map((cid) => this.tree.nodes.get(cid))
      .filter(Boolean) as SceneNode[];
  }

  /**
   * Get full path from root to node
   */
  getPath(id: string): SceneNode[] {
    const path: SceneNode[] = [];
    let current = this.tree.nodes.get(id);
    while (current) {
      path.unshift(current);
      current = current.parentId ? this.tree.nodes.get(current.parentId) : undefined;
    }
    return path;
  }

  /**
   * Search nodes by name
   */
  search(query: string): SceneNode[] {
    const results: SceneNode[] = [];
    const lowerQuery = query.toLowerCase();
    this.tree.nodes.forEach((node) => {
      if (node.name.toLowerCase().includes(lowerQuery)) {
        results.push(node);
      }
    });
    return results;
  }

  /**
   * Get tree stats
   */
  getStats(): { totalNodes: number; totalMeshes: number; totalLights: number; totalCameras: number; totalGroups: number } {
    let totalMeshes = 0;
    let totalLights = 0;
    let totalCameras = 0;
    let totalGroups = 0;

    this.tree.nodes.forEach((node) => {
      switch (node.type) {
        case 'mesh': totalMeshes++; break;
        case 'light': totalLights++; break;
        case 'camera': totalCameras++; break;
        case 'group': totalGroups++; break;
      }
    });

    return {
      totalNodes: this.tree.nodes.size,
      totalMeshes,
      totalLights,
      totalCameras,
      totalGroups,
    };
  }

  /**
   * Export tree as JSON (without Three.js objects)
   */
  toJSON(): Omit<SceneNode, 'object3D'>[] {
    const nodes: Omit<SceneNode, 'object3D'>[] = [];
    this.tree.nodes.forEach((node) => {
      const { object3D, ...serializable } = node;
      nodes.push(serializable);
    });
    return nodes;
  }

  /**
   * Clear all
   */
  clear(): void {
    this.tree.nodes.clear();
    this.tree.rootIds = [];
    this.tree.selectedIds = [];
    this.tree.activeId = null;
  }
}

/**
 * Default scene — boş bir sahne için hazır node'lar
 */
export function createDefaultScene(manager: SceneTreeManager): void {
  // Camera
  manager.addNode({
    name: 'Main Camera',
    type: 'camera',
    visible: true,
    locked: true,
    parentId: null,
    icon: NODE_TYPE_CONFIG.camera.icon,
    color: NODE_TYPE_CONFIG.camera.color,
  });

  // Key Light
  manager.addNode({
    name: 'Key Light',
    type: 'light',
    visible: true,
    locked: false,
    parentId: null,
    icon: NODE_TYPE_CONFIG.light.icon,
    color: NODE_TYPE_CONFIG.light.color,
  });

  // Fill Light
  manager.addNode({
    name: 'Fill Light',
    type: 'light',
    visible: true,
    locked: false,
    parentId: null,
    icon: NODE_TYPE_CONFIG.light.icon,
    color: NODE_TYPE_CONFIG.light.color,
  });

  // Default cube
  manager.addNode({
    name: 'Cube',
    type: 'mesh',
    visible: true,
    locked: false,
    parentId: null,
    icon: NODE_TYPE_CONFIG.mesh.icon,
    color: NODE_TYPE_CONFIG.mesh.color,
    vertexCount: 24,
    triangleCount: 12,
    materialCount: 1,
  });

  // Ground plane
  manager.addNode({
    name: 'Ground',
    type: 'mesh',
    visible: true,
    locked: true,
    parentId: null,
    icon: NODE_TYPE_CONFIG.mesh.icon,
    color: NODE_TYPE_CONFIG.mesh.color,
    vertexCount: 4,
    triangleCount: 2,
    materialCount: 1,
  });
}
