/**
 * Agent Orchestration v2 — Paralel, koşullu, döngü, human-in-the-loop
 *
 * Execution patterns:
 * 1. Sequential (var olan) — A → B → C
 * 2. Parallel — A → [B, C, D] → E (fan-out/fan-in)
 * 3. Conditional — A → (if X then B else C) → D
 * 4. Loop — A → B → (if not done, repeat B) → C
 * 5. Human-in-the-loop — A → [HUMAN APPROVAL] → B
 * 6. Retry — A (max 3 attempts) → B
 * 7. Timeout — A (timeout 30s) → B
 * 8. Fallback — A → (on error) → B
 *
 * Her node artık şunları destekliyor:
 * - condition: JS expression (next node'lar için)
 * - parallel: boolean (aynı seviyedeki diğer node'larla paralel)
 * - loop: { maxIterations, condition }
 * - requireApproval: boolean (HITL)
 * - retry: { maxAttempts, backoff }
 * - timeout: number (ms)
 * - fallback: nodeId (hata durumunda)
 */

import type { AgentNode, AgentEdge } from './agent-tree';

export type ExecutionPattern =
  | 'sequential'
  | 'parallel'
  | 'conditional'
  | 'loop'
  | 'hitl'
  | 'retry'
  | 'timeout'
  | 'fallback';

export interface NodeExecutionConfig {
  nodeId: string;
  pattern: ExecutionPattern;
  // Conditional
  condition?: string; // JS expression, returns boolean
  // Loop
  loopMaxIterations?: number;
  loopCondition?: string;
  // Retry
  retryMaxAttempts?: number;
  retryBackoffMs?: number;
  // Timeout
  timeoutMs?: number;
  // HITL
  requireApproval?: boolean;
  approvalMessage?: string;
  // Fallback
  fallbackNodeId?: string;
  // Parallel
  parallelGroup?: string; // same group = run in parallel
}

export interface ExecutionPlan {
  levels: string[][]; // her level paralel çalışır
  configs: Record<string, NodeExecutionConfig>;
  totalNodes: number;
  estimatedDuration: string;
  requiresHumanApproval: boolean;
}

/**
 * Edge'leri analiz ederek execution plan oluştur
 * - Topolojik sıralama + paralel gruplama
 */
export function buildExecutionPlan(
  nodes: AgentNode[],
  edges: AgentEdge[],
  configs: Record<string, NodeExecutionConfig> = {}
): ExecutionPlan {
  const inDegree: Record<string, number> = {};
  const outEdges: Record<string, string[]> = {};
  const inEdges: Record<string, string[]> = {};

  nodes.forEach((n) => {
    inDegree[n.id] = 0;
    outEdges[n.id] = [];
    inEdges[n.id] = [];
  });

  edges.forEach((e) => {
    outEdges[e.source]?.push(e.target);
    inEdges[e.target]?.push(e.source);
    inDegree[e.target] = (inDegree[e.target] || 0) + 1;
  });

  // BFS ile level'ları belirle
  const levels: string[][] = [];
  const visited = new Set<string>();
  const current: string[] = nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id);

  let level = 0;
  while (current.length > 0) {
    levels[level] = [...current];
    current.forEach((id) => visited.add(id));

    const next: string[] = [];
    for (const id of current) {
      for (const target of outEdges[id] || []) {
        // Tüm source'lar visited mı kontrol et
        const allSourcesVisited = (inEdges[target] || []).every((s) => visited.has(s));
        if (allSourcesVisited && !visited.has(target) && !next.includes(target)) {
          next.push(target);
        }
      }
    }
    current.length = 0;
    current.push(...next);
    level++;
  }

  // HITL var mı?
  const requiresHumanApproval = Object.values(configs).some((c) => c.requireApproval);

  // Süre tahmini
  const totalNodes = nodes.length;
  const hasHITL = requiresHumanApproval;
  const estimatedDuration = hasHITL
    ? `${totalNodes * 30}sn + insan onayı`
    : `${totalNodes * 15}sn`;

  return {
    levels,
    configs,
    totalNodes,
    estimatedDuration,
    requiresHumanApproval,
  };
}

/**
 * Koşul ifadesini değerlendir (güvenli sandbox)
 */
export function evaluateCondition(
  condition: string,
  context: Record<string, unknown>
): boolean {
  try {
    // Basit güvenlik: sadece belirli karakterlere izin ver
    if (!/^[\w\s.\[\]()=!<>&|"'-]+$/.test(condition)) {
      console.warn('Invalid condition:', condition);
      return true;
    }
    const keys = Object.keys(context);
    const values = Object.values(context);
    const fn = new Function(...keys, `return (${condition});`);
    return Boolean(fn(...values));
  } catch (err) {
    console.warn('Condition eval error:', err);
    return true; // hata durumunda devam et
  }
}

/**
 * Bir node'un çalışıp çalışmayacağına karar ver
 */
export function shouldExecuteNode(
  nodeId: string,
  configs: Record<string, NodeExecutionConfig>,
  context: Record<string, unknown>
): { execute: boolean; reason: string } {
  const config = configs[nodeId];

  if (!config) {
    return { execute: true, reason: 'No config, executing' };
  }

  // Conditional check
  if (config.condition) {
    const result = evaluateCondition(config.condition, context);
    if (!result) {
      return { execute: false, reason: `Condition false: ${config.condition}` };
    }
  }

  // Loop check
  if (config.loopMaxIterations && config.loopCondition) {
    const iterations = (context[`_iterations_${nodeId}`] as number) || 0;
    if (iterations >= config.loopMaxIterations) {
      return { execute: false, reason: `Max iterations reached (${iterations})` };
    }
    const continueLoop = evaluateCondition(config.loopCondition, context);
    if (!continueLoop && iterations > 0) {
      return { execute: false, reason: `Loop condition false after ${iterations} iterations` };
    }
  }

  return { execute: true, reason: 'All checks passed' };
}

/**
 * Execution step — runtime'da bir node çalıştırıldığında
 */
export interface ExecutionStep {
  nodeId: string;
  nodeName: string;
  pattern: ExecutionPattern;
  status: 'pending' | 'running' | 'waiting_approval' | 'completed' | 'skipped' | 'error' | 'timeout';
  output?: string;
  error?: string;
  tokensUsed?: number;
  durationMs?: number;
  iteration?: number;
  attempt?: number;
  timestamp: string;
}

/**
 * Retry wrapper
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: { maxAttempts: number; backoffMs: number }
): Promise<{ result: T | null; attempts: number; error?: Error }> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const result = await fn();
      return { result, attempts: attempt };
    } catch (err) {
      lastError = err as Error;
      if (attempt < config.maxAttempts) {
        await new Promise((r) => setTimeout(r, config.backoffMs * attempt));
      }
    }
  }
  return { result: null, attempts: config.maxAttempts, error: lastError || undefined };
}

/**
 * Timeout wrapper
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number
): Promise<{ result: T | null; timedOut: boolean; error?: Error }> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({ result: null, timedOut: true });
    }, timeoutMs);

    fn()
      .then((result) => {
        clearTimeout(timer);
        resolve({ result, timedOut: false });
      })
      .catch((err) => {
        clearTimeout(timer);
        resolve({ result: null, timedOut: false, error: err as Error });
      });
  });
}

/**
 * Parallel execution — fan-out/fan-in
 */
export async function executeParallel<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number = 4
): Promise<Array<{ item: T; result: R | null; error?: Error }>> {
  const results: Array<{ item: T; result: R | null; error?: Error }> = [];
  const executing: Promise<void>[] = [];

  for (const item of items) {
    const p = fn(item)
      .then((result) => {
        results.push({ item, result, error: undefined });
      })
      .catch((error) => {
        results.push({ item, result: null, error: error as Error });
      });
    executing.push(p);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      // Remove completed
      const settled = executing.filter(async (p) => {
        try {
          await p;
          return false;
        } catch {
          return false;
        }
      });
      // Simplification: just clear array when full
      if (executing.length >= concurrency * 2) {
        await Promise.all(executing);
        executing.length = 0;
      }
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * HITL — insan onayı bekle
 */
export function requestHumanApproval(
  nodeId: string,
  message: string,
  context: Record<string, unknown>
): Promise<{ approved: boolean; feedback?: string }> {
  // Bu fonksiyon server-side'da bir pending approval yaratır
  // Frontend poll eder veya WebSocket bekler
  return new Promise((resolve) => {
    // Simülasyon: 5 saniye sonra auto-approve
    setTimeout(() => {
      resolve({ approved: true });
    }, 5000);
  });
}

/**
 * Execution trace — observability için
 */
export interface ExecutionTrace {
  treeId: string;
  startedAt: string;
  completedAt?: string;
  steps: ExecutionStep[];
  totalTokens: number;
  totalCost: number;
  totalDurationMs: number;
  errors: Array<{ nodeId: string; error: string; timestamp: string }>;
  approvals: Array<{ nodeId: string; approved: boolean; feedback?: string; timestamp: string }>;
}

export function createTrace(treeId: string): ExecutionTrace {
  return {
    treeId,
    startedAt: new Date().toISOString(),
    steps: [],
    totalTokens: 0,
    totalCost: 0,
    totalDurationMs: 0,
    errors: [],
    approvals: [],
  };
}

export function addStepToTrace(
  trace: ExecutionTrace,
  step: ExecutionStep
): ExecutionTrace {
  trace.steps.push(step);
  if (step.tokensUsed) trace.totalTokens += step.tokensUsed;
  if (step.durationMs) trace.totalDurationMs += step.durationMs;
  if (step.status === 'error' && step.error) {
    trace.errors.push({
      nodeId: step.nodeId,
      error: step.error,
      timestamp: step.timestamp,
    });
  }
  return trace;
}

export function finalizeTrace(trace: ExecutionTrace): ExecutionTrace {
  trace.completedAt = new Date().toISOString();
  return trace;
}
