/**
 * NEXUS Studio — Node System
 * Unity/Godot tarzı sahne graph mimarisi
 *
 * Her nesne bir Node'dur. Node'lar parent-child ilişkisine sahiptir.
 * Node tipleri: Mesh, Light, Camera, Audio, Empty, Script
 * Her node'a script component eklenebilir (update loop)
 */

// ---------- Node Types ----------
export type NodeType = 'mesh' | 'light' | 'camera' | 'audio' | 'empty' | 'script';

export interface SceneNode {
  id: string;
  name: string;
  type: NodeType;
  parentId: string | null;
  childrenIds: string[];
  expanded: boolean;
  visible: boolean;
  locked: boolean;

  // Transform
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];

  // Mesh props
  geometryType?: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'plane' | 'capsule' | 'tetrahedron';
  color?: string;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  wireframe?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  opacity?: number;

  // Light props
  lightType?: 'directional' | 'point' | 'spot' | 'ambient' | 'hemisphere';
  lightColor?: string;
  lightIntensity?: number;
  lightDistance?: number;
  lightAngle?: number;

  // Camera props
  cameraFov?: number;
  cameraNear?: number;
  cameraFar?: number;
  isMainCamera?: boolean;

  // Audio props
  audioUrl?: string;
  audioVolume?: number;
  audioLoop?: boolean;
  audioAutoplay?: boolean;

  // Script component
  script?: string;
  scriptEnabled?: boolean;

  // Metadata
  tags?: string[];
  layer?: number;
}

// ---------- Scene ----------
export interface StudioScene {
  id: string;
  name: string;
  nodes: SceneNode[];
  rootId: string; // root empty node
  backgroundColor: string;
  ambientColor: string;
  ambientIntensity: number;
  fogColor?: string;
  fogNear?: number;
  fogFar?: number;
  gravity: number;
}

// ---------- Default Script Template ----------
export const DEFAULT_NODE_SCRIPT = `// Bu node'un update fonksiyonu — her karede çağrılır
// dt: delta time (saniye)
// input: klavye/mouse input { left, right, up, down, space, mouse }
// node: bu node'un kendisi (position, rotation, scale)
function update(dt, input, node) {
  // Hareket
  if (input.left) node.position[0] -= 5 * dt;
  if (input.right) node.position[0] += 5 * dt;
  if (input.up) node.position[2] -= 5 * dt;
  if (input.down) node.position[2] += 5 * dt;

  // Döndürme
  node.rotation[1] += 1 * dt;

  // Zıplama
  if (input.space && node.position[1] <= 0.01) {
    node._velocity = 8;
  }
  node._velocity = (node._velocity || 0) - 20 * dt;
  node.position[1] += node._velocity * dt;
  if (node.position[1] < 0) {
    node.position[1] = 0;
    node._velocity = 0;
  }
}`;

// ---------- Node Factory ----------
export function createNode(type: NodeType, name?: string): SceneNode {
  const id = `node_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const base: SceneNode = {
    id,
    name: name || `${type.charAt(0).toUpperCase() + type.slice(1)}_${id.slice(-4)}`,
    type,
    parentId: null,
    childrenIds: [],
    expanded: true,
    visible: true,
    locked: false,
    position: [0, type === 'mesh' ? 0.5 : 2, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    tags: [],
    layer: 0,
  };

  switch (type) {
    case 'mesh':
      base.geometryType = 'box';
      base.color = '#4fc3f7';
      base.metalness = 0.3;
      base.roughness = 0.4;
      base.castShadow = true;
      base.receiveShadow = true;
      base.opacity = 1;
      break;
    case 'light':
      base.lightType = 'directional';
      base.lightColor = '#ffffff';
      base.lightIntensity = 1.2;
      base.position = [5, 10, 5];
      break;
    case 'camera':
      base.cameraFov = 50;
      base.cameraNear = 0.1;
      base.cameraFar = 1000;
      base.position = [5, 3, 8];
      break;
    case 'audio':
      base.audioVolume = 1;
      base.audioLoop = true;
      base.audioAutoplay = false;
      break;
    case 'script':
      base.script = DEFAULT_NODE_SCRIPT;
      base.scriptEnabled = true;
      break;
  }

  return base;
}

// ---------- Scene Factory ----------
export function createDefaultScene(): StudioScene {
  const rootId = `node_root_${Date.now()}`;
  const root: SceneNode = {
    id: rootId,
    name: 'Scene Root',
    type: 'empty',
    parentId: null,
    childrenIds: [],
    expanded: true,
    visible: true,
    locked: false,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  };

  // Default: 1 mesh + 1 light + 1 camera + zemin
  const player = createNode('mesh', 'Player');
  player.parentId = rootId;
  player.geometryType = 'box';
  player.color = '#4fc3f7';
  player.script = DEFAULT_NODE_SCRIPT;
  player.scriptEnabled = true;
  player.position = [0, 0.5, 0];

  const ground = createNode('mesh', 'Ground');
  ground.parentId = rootId;
  ground.geometryType = 'plane';
  ground.color = '#1a3a2a';
  ground.scale = [20, 1, 20];
  ground.position = [0, 0, 0];
  ground.receiveShadow = true;
  ground.castShadow = false;

  const sun = createNode('light', 'Directional Light');
  sun.parentId = rootId;
  sun.lightType = 'directional';
  sun.position = [5, 10, 5];
  sun.lightIntensity = 1.5;

  const cam = createNode('camera', 'Main Camera');
  cam.parentId = rootId;
  cam.position = [5, 3, 8];
  cam.isMainCamera = true;

  root.childrenIds = [player.id, ground.id, sun.id, cam.id];

  return {
    id: `scene_${Date.now()}`,
    name: 'Sahne 1',
    nodes: [root, player, ground, sun, cam],
    rootId,
    backgroundColor: '#0a0a15',
    ambientColor: '#3a3a5a',
    ambientIntensity: 0.4,
    gravity: 9.8,
    fogColor: '#0a0a15',
    fogNear: 20,
    fogFar: 80,
  };
}

// ---------- Node Operations ----------
export function addChildToNode(nodes: SceneNode[], parentId: string, child: SceneNode): SceneNode[] {
  return nodes.map((n) => {
    if (n.id === parentId) {
      return { ...n, childrenIds: [...n.childrenIds, child.id], expanded: true };
    }
    return n;
  }).concat({ ...child, parentId });
}

export function removeNode(nodes: SceneNode[], nodeId: string): SceneNode[] {
  const toRemove = new Set<string>([nodeId]);
  let changed = true;
  while (changed) {
    changed = false;
    nodes.forEach((n) => {
      if (n.parentId && toRemove.has(n.parentId) && !toRemove.has(n.id)) {
        toRemove.add(n.id);
        changed = true;
      }
    });
  }
  return nodes
    .filter((n) => !toRemove.has(n.id))
    .map((n) => ({
      ...n,
      childrenIds: n.childrenIds.filter((cid) => !toRemove.has(cid)),
    }));
}

export function reparentNode(nodes: SceneNode[], nodeId: string, newParentId: string | null): SceneNode[] {
  // Prevent making node a child of its own descendant
  if (newParentId) {
    let current: string | null = newParentId;
    while (current) {
      if (current === nodeId) return nodes;
      const node = nodes.find((n) => n.id === current);
      current = node?.parentId || null;
    }
  }
  return nodes.map((n) => {
    if (n.id === nodeId) return { ...n, parentId: newParentId };
    if (n.childrenIds.includes(nodeId) && n.id !== newParentId) {
      return { ...n, childrenIds: n.childrenIds.filter((cid) => cid !== nodeId) };
    }
    if (n.id === newParentId && !n.childrenIds.includes(nodeId)) {
      return { ...n, childrenIds: [...n.childrenIds, nodeId], expanded: true };
    }
    return n;
  });
}

export function getNodeDepth(nodes: SceneNode[], nodeId: string): number {
  let depth = 0;
  let current: string | null = nodeId;
  while (current) {
    const node = nodes.find((n) => n.id === current);
    if (!node || !node.parentId) break;
    depth++;
    current = node.parentId;
  }
  return depth;
}

export function getDescendants(nodes: SceneNode[], nodeId: string): SceneNode[] {
  const result: SceneNode[] = [];
  const stack = [nodeId];
  while (stack.length > 0) {
    const id = stack.pop()!;
    const children = nodes.filter((n) => n.parentId === id);
    result.push(...children);
    stack.push(...children.map((c) => c.id));
  }
  return result;
}
