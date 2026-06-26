/**
 * NEXUS 3D Studio — Enterprise System (Sprint 31-35)
 *
 * Sprint 31: Multi-user editing (WebSocket)
 * Sprint 32: Version control (Git-LFS)
 * Sprint 33: Asset library
 * Sprint 34: Render farm queue
 * Sprint 35: Review/approval workflow
 */

import * as THREE from 'three';

// ============ SPRINT 31: MULTI-USER EDITING ============

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  cursor: { x: number; y: number } | null;
  cursor3D: THREE.Vector3 | null;
  selectedObjectId: string | null;
  activeTool: string;
  activeTab: string;
  status: 'online' | 'away' | 'offline' | 'busy';
  lastSeen: Date;
  permissions: 'admin' | 'editor' | 'viewer';
}

export interface CollaborationSession {
  id: string;
  projectId: string;
  users: CollaborationUser[];
  owner: string;
  createdAt: Date;
  maxUsers: number;
  permissions: {
    allowEdit: boolean;
    allowDelete: boolean;
    allowExport: boolean;
    allowInvite: boolean;
  };
  // Conflict resolution
  lockingStrategy: 'pessimistic' | 'optimistic' | 'none';
  objectsLocked: Map<string, string>; // objectId → userId
}

export interface CollaborationEvent {
  type: 'join' | 'leave' | 'cursor' | 'select' | 'edit' | 'transform' | 'create' | 'delete' | 'message';
  userId: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

/**
 * Check if user can edit an object
 */
export function canEditObject(session: CollaborationSession, userId: string, objectId: string): boolean {
  const user = session.users.find((u) => u.id === userId);
  if (!user || user.permissions === 'viewer') return false;

  if (session.lockingStrategy === 'pessimistic') {
    const lockedBy = session.objectsLocked.get(objectId);
    return !lockedBy || lockedBy === userId;
  }

  return true;
}

/**
 * Lock object for editing
 */
export function lockObject(session: CollaborationSession, userId: string, objectId: string): { success: boolean; error?: string } {
  if (session.lockingStrategy !== 'pessimistic') return { success: true };
  const lockedBy = session.objectsLocked.get(objectId);
  if (lockedBy && lockedBy !== userId) {
    const locker = session.users.find((u) => u.id === lockedBy);
    return { success: false, error: `${locker?.name || 'Baska kullanici'} bu nesneyi duzenliyor` };
  }
  session.objectsLocked.set(objectId, userId);
  return { success: true };
}

/**
 * Unlock object
 */
export function unlockObject(session: CollaborationSession, objectId: string): void {
  session.objectsLocked.delete(objectId);
}

export const USER_COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#14b8a6'];

// ============ SPRINT 32: VERSION CONTROL ============

export interface AssetVersion {
  id: string;
  assetId: string;
  version: string; // semantic: 1.2.3
  author: string;
  message: string;
  createdAt: Date;
  size: number;
  checksum: string;
  parentId: string | null;
  tags: string[];
  // Diff
  changes: {
    added: string[];
    modified: string[];
    deleted: string[];
  };
  // Status
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
}

export interface VersionBranch {
  id: string;
  name: string;
  head: string; // version ID
  parent: string | null;
  created: Date;
  author: string;
  description: string;
}

export interface VersionControlConfig {
  repoPath: string;
  lfsThreshold: number; // bytes, files larger than this use LFS
  autoCommit: boolean;
  commitInterval: number; // minutes
  branchStrategy: 'gitflow' | 'trunk' | 'feature';
  requireReview: boolean;
  minReviewers: number;
  signedCommits: boolean;
}

export const DEFAULT_VC_CONFIG: VersionControlConfig = {
  repoPath: '/repo',
  lfsThreshold: 1024 * 1024, // 1MB
  autoCommit: false,
  commitInterval: 30,
  branchStrategy: 'gitflow',
  requireReview: true,
  minReviewers: 2,
  signedCommits: true,
};

export const VERSION_STATUS_FLOW: Array<{ from: string; to: string; label: string; color: string }> = [
  { from: 'draft', to: 'review', label: 'Submit for Review', color: '#f59e0b' },
  { from: 'review', to: 'approved', label: 'Approve', color: '#22c55e' },
  { from: 'review', to: 'draft', label: 'Request Changes', color: '#ef4444' },
  { from: 'approved', to: 'published', label: 'Publish', color: '#3b82f6' },
  { from: 'published', to: 'archived', label: 'Archive', color: '#64748b' },
];

/**
 * Calculate semantic version bump
 */
export function bumpVersion(version: string, type: 'major' | 'minor' | 'patch'): string {
  const [major, minor, patch] = version.split('.').map(Number);
  switch (type) {
    case 'major': return `${major + 1}.0.0`;
    case 'minor': return `${major}.${minor + 1}.0`;
    case 'patch': return `${major}.${minor}.${patch + 1}`;
  }
}

// ============ SPRINT 33: ASSET LIBRARY ============

export type AssetCategory = 'character' | 'environment' | 'prop' | 'material' | 'texture' | 'animation' | 'sound' | 'hdri' | 'brush' | 'plugin';

export interface AssetItem {
  id: string;
  name: string;
  category: AssetCategory;
  description: string;
  thumbnail: string;
  preview: string;
  format: string;
  fileSize: number;
  polygonCount: number;
  textureCount: number;
  author: string;
  authorUrl: string;
  license: 'CC0' | 'CC-BY' | 'CC-BY-SA' | 'CC-BY-NC' | 'MIT' | 'Apache' | 'Proprietary' | 'Royalty-Free';
  tags: string[];
  rating: number;
  downloadCount: number;
  favoriteCount: number;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  // Quality
  quality: 'low' | 'medium' | 'high' | 'AAA';
  hasRig: boolean;
  hasAnimation: boolean;
  hasMaterials: boolean;
  hasTextures: boolean;
  // LOD
  lods: number;
  // Dimensions
  dimensions: { x: number; y: number; z: number };
  // VRAM
  estimatedVRAM: number; // MB
}

export const ASSET_CATEGORIES: Array<{ id: AssetCategory; label: string; icon: string; color: string }> = [
  { id: 'character', label: 'Karakterler', icon: 'User', color: '#4fc3f7' },
  { id: 'environment', label: 'Cevre', icon: 'TreePine', color: '#22c55e' },
  { id: 'prop', label: 'Esyalar', icon: 'Box', color: '#f59e0b' },
  { id: 'material', label: 'Materyaller', icon: 'Palette', color: '#a855f7' },
  { id: 'texture', label: 'Teksturler', icon: 'Image', color: '#06b6d4' },
  { id: 'animation', label: 'Animasyonlar', icon: 'Play', color: '#ec4899' },
  { id: 'sound', label: 'Sesler', icon: 'Volume2', color: '#84cc16' },
  { id: 'hdri', label: 'HDRI', icon: 'Sun', color: '#f97316' },
  { id: 'brush', label: 'Fircalar', icon: 'Brush', color: '#14b8a6' },
  { id: 'plugin', label: 'Pluginler', icon: 'Puzzle', color: '#64748b' },
];

export const LICENSE_INFO: Record<string, { label: string; description: string; commercial: boolean }> = {
  'CC0': { label: 'CC0 (Public Domain)', description: 'Tamamen serbest, ticari kullanima acik', commercial: true },
  'CC-BY': { label: 'CC-BY (Attribution)', description: 'Atif gerekli, ticari kullanima acik', commercial: true },
  'CC-BY-SA': { label: 'CC-BY-SA (Share-Alike)', description: 'Atif + ayni lisans, ticari acik', commercial: true },
  'CC-BY-NC': { label: 'CC-BY-NC (Non-Commercial)', description: 'Atif + ticari yok', commercial: false },
  'MIT': { label: 'MIT License', description: 'Tamamen serbest, atif gerekli', commercial: true },
  'Apache': { label: 'Apache 2.0', description: 'Serbest, patent korumasi', commercial: true },
  'Proprietary': { label: 'Proprietary', description: 'Sahibinin izni gerekli', commercial: false },
  'Royalty-Free': { label: 'Royalty-Free', description: 'Tek seferlik lisans', commercial: true },
};

// ============ SPRINT 34: RENDER FARM ============

export type RenderJobStatus = 'queued' | 'assigned' | 'rendering' | 'completed' | 'failed' | 'canceled' | 'paused';

export interface RenderJob {
  id: string;
  name: string;
  projectId: string;
  scene: string;
  camera: string;
  status: RenderJobStatus;
  priority: number; // 0-10, 10 = highest
  // Frames
  frameStart: number;
  frameEnd: number;
  frameStep: number;
  currentFrame: number;
  completedFrames: number;
  totalFrames: number;
  // Output
  outputFormat: 'png' | 'exr' | 'jpg' | 'tiff' | 'mp4';
  outputPath: string;
  resolution: { width: number; height: number };
  // Quality
  samples: number;
  denoiser: string;
  // Timing
  submittedAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  estimatedTime: number; // seconds
  elapsedTime: number;
  // Worker
  assignedWorker: string | null;
  // Error
  error: string | null;
  retryCount: number;
  maxRetries: number;
}

export interface RenderWorker {
  id: string;
  name: string;
  hostname: string;
  status: 'idle' | 'busy' | 'offline' | 'error';
  // Specs
  cpu: { cores: number; model: string; usage: number };
  gpu: { name: string; vram: number; usage: number; driver: string };
  ram: { total: number; used: number };
  storage: { total: number; used: number };
  // Network
  ipAddress: string;
  port: number;
  // Performance
  renderSpeed: number; // frames per minute
  // Current job
  currentJobId: string | null;
  completedJobs: number;
  failedJobs: number;
  uptime: number; // seconds
  lastHeartbeat: Date;
}

export interface RenderFarmConfig {
  maxConcurrentJobs: number;
  autoScale: boolean;
  minWorkers: number;
  maxWorkers: number;
  schedulingAlgorithm: 'fifo' | 'priority' | 'fair' | 'deadline';
  retryFailed: boolean;
  maxRetries: number;
  notifyOnComplete: boolean;
  notifyOnError: boolean;
  emailNotifications: string[];
  // Cost tracking
  costPerHour: number;
  budgetLimit: number;
}

export const DEFAULT_FARM_CONFIG: RenderFarmConfig = {
  maxConcurrentJobs: 10,
  autoScale: false,
  minWorkers: 1,
  maxWorkers: 10,
  schedulingAlgorithm: 'priority',
  retryFailed: true,
  maxRetries: 3,
  notifyOnComplete: true,
  notifyOnError: true,
  emailNotifications: [],
  costPerHour: 0.5,
  budgetLimit: 100,
};

/**
 * Schedule next render job
 */
export function scheduleNextJob(jobs: RenderJob[], workers: RenderWorker[], config: RenderFarmConfig): { job: RenderJob | null; worker: RenderWorker | null } {
  const queuedJobs = jobs.filter((j) => j.status === 'queued');
  const idleWorkers = workers.filter((w) => w.status === 'idle');

  if (queuedJobs.length === 0 || idleWorkers.length === 0) {
    return { job: null, worker: null };
  }

  // Sort by priority (highest first), then by submission time (oldest first)
  queuedJobs.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.submittedAt.getTime() - b.submittedAt.getTime();
  });

  // Pick best worker (most powerful)
  idleWorkers.sort((a, b) => b.gpu.vram - a.gpu.vram);

  return { job: queuedJobs[0], worker: idleWorkers[0] };
}

/**
 * Calculate estimated completion time
 */
export function estimateCompletion(job: RenderJob, worker: RenderWorker): number {
  const remainingFrames = job.totalFrames - job.completedFrames;
  const framesPerSecond = worker.renderSpeed / 60;
  return remainingFrames / framesPerSecond;
}

// ============ SPRINT 35: REVIEW & APPROVAL WORKFLOW ============

export type ReviewStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'changes_requested' | 'archived';
export type ReviewPriority = 'low' | 'normal' | 'high' | 'critical' | 'blocker';

export interface ReviewRequest {
  id: string;
  title: string;
  description: string;
  author: string;
  reviewers: string[];
  status: ReviewStatus;
  priority: ReviewPriority;
  // Asset
  assetId: string;
  assetVersion: string;
  // Timeline
  submittedAt: Date;
  dueDate: Date | null;
  reviewedAt: Date | null;
  completedAt: Date | null;
  // Reviews
  reviews: Review[];
  // Changes
  changeRequests: ChangeRequest[];
  // Tags
  tags: string[];
}

export interface Review {
  id: string;
  reviewer: string;
  status: 'approve' | 'reject' | 'request_changes';
  comment: string;
  timestamp: Date;
  // Annotations
  annotations: ReviewAnnotation[];
}

export interface ReviewAnnotation {
  id: string;
  type: 'comment' | 'draw' | 'pin' | 'measure' | 'compare';
  position: { x: number; y: number; z: number } | { x: number; y: number };
  comment: string;
  author: string;
  timestamp: Date;
  resolved: boolean;
  // For compare
  beforeVersion?: string;
  afterVersion?: string;
}

export interface ChangeRequest {
  id: string;
  description: string;
  requestedBy: string;
  status: 'open' | 'in_progress' | 'resolved' | 'wont_fix';
  priority: ReviewPriority;
  createdAt: Date;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  resolution: string | null;
}

export const REVIEW_STATUS_FLOW: Array<{ from: ReviewStatus; to: ReviewStatus; label: string; color: string }> = [
  { from: 'pending', to: 'in_review', label: 'Start Review', color: '#f59e0b' },
  { from: 'in_review', to: 'approved', label: 'Approve', color: '#22c55e' },
  { from: 'in_review', to: 'rejected', label: 'Reject', color: '#ef4444' },
  { from: 'in_review', to: 'changes_requested', label: 'Request Changes', color: '#f97316' },
  { from: 'changes_requested', to: 'pending', label: 'Resubmit', color: '#3b82f6' },
  { from: 'approved', to: 'archived', label: 'Archive', color: '#64748b' },
];

export const PRIORITY_CONFIG: Record<ReviewPriority, { label: string; color: string; icon: string }> = {
  low: { label: 'Low', color: '#64748b', icon: 'ArrowDown' },
  normal: { label: 'Normal', color: '#3b82f6', icon: 'Minus' },
  high: { label: 'High', color: '#f59e0b', icon: 'ArrowUp' },
  critical: { label: 'Critical', color: '#ef4444', icon: 'AlertTriangle' },
  blocker: { label: 'Blocker', color: '#dc2626', icon: 'Ban' },
};

/**
 * Check if review is complete (all reviewers have responded)
 */
export function isReviewComplete(request: ReviewRequest): boolean {
  if (request.reviewers.length === 0) return true;
  const reviewedBy = new Set(request.reviews.map((r) => r.reviewer));
  return request.reviewers.every((r) => reviewedBy.has(r));
}

/**
 * Get review verdict
 */
export function getReviewVerdict(request: ReviewRequest): 'approved' | 'rejected' | 'changes' | 'pending' {
  if (request.reviews.length === 0) return 'pending';

  const approvals = request.reviews.filter((r) => r.status === 'approve').length;
  const rejections = request.reviews.filter((r) => r.status === 'reject').length;
  const changes = request.reviews.filter((r) => r.status === 'request_changes').length;

  if (rejections > 0) return 'rejected';
  if (changes > 0) return 'changes';
  if (approvals === request.reviewers.length) return 'approved';
  return 'pending';
}
