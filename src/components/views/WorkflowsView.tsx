'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ScrollArea,
} from '@/components/ui/scroll-area';
import {
  Workflow,
  Plus,
  Zap,
  GitBranch,
  Cog,
  Bell,
  Webhook,
  Clock,
  Hand,
  Code2,
  Bot,
  Mail,
  Slack,
  Play,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type NodeType = 'trigger' | 'condition' | 'action' | 'notify';

interface WFNode {
  id: string;
  type: NodeType;
  subtype: string;
  label: string;
  config: Record<string, string>;
}

interface WorkflowDef {
  id: string;
  name: string;
  enabled: boolean;
  lastRun: string | null;
  runs: number;
  nodes: WFNode[];
  edges: Array<[string, string]>;
}

interface LogEntry {
  id: string;
  ts: string;
  nodeId: string;
  level: 'info' | 'success' | 'error';
  message: string;
}

const SUBTYPE_META: Record<
  NodeType,
  Record<string, { icon: any; color: string; label: string }>
> = {
  trigger: {
    webhook: { icon: Webhook, color: '#06b6d4', label: 'Webhook' },
    cron: { icon: Clock, color: '#a855f7', label: 'Cron' },
    manual: { icon: Hand, color: '#f59e0b', label: 'Manuel' },
  },
  condition: {
    if: { icon: GitBranch, color: '#eab308', label: 'If/Else' },
  },
  action: {
    api: { icon: Code2, color: '#10b981', label: 'Call API' },
    agent: { icon: Bot, color: '#3b82f6', label: 'Run Agent' },
    email: { icon: Mail, color: '#ec4899', label: 'Send Email' },
  },
  notify: {
    slack: { icon: Slack, color: '#6366f1', label: 'Slack' },
    email: { icon: Mail, color: '#ec4899', label: 'Email' },
  },
};

const NODE_TYPE_META: Record<NodeType, { icon: any; color: string; label: string }> = {
  trigger: { icon: Zap, color: '#06b6d4', label: 'Trigger' },
  condition: { icon: GitBranch, color: '#eab308', label: 'Condition' },
  action: { icon: Cog, color: '#10b981', label: 'Action' },
  notify: { icon: Bell, color: '#6366f1', label: 'Notify' },
};

const INITIAL_WORKFLOWS: WorkflowDef[] = [
  {
    id: 'wf-1',
    name: 'PR Reviewer Pipeline',
    enabled: true,
    lastRun: '2 dk önce',
    runs: 184,
    nodes: [
      { id: 'n1', type: 'trigger', subtype: 'webhook', label: 'GitHub PR Webhook', config: { url: '/webhooks/github' } },
      { id: 'n2', type: 'condition', subtype: 'if', label: 'Branch = main?', config: {} },
      { id: 'n3', type: 'action', subtype: 'agent', label: 'Code Review Agent', config: { model: 'deepseek-reasoner' } },
      { id: 'n4', type: 'notify', subtype: 'slack', label: 'Slack #reviews', config: { channel: '#reviews' } },
    ],
    edges: [['n1', 'n2'], ['n2', 'n3'], ['n3', 'n4']],
  },
  {
    id: 'wf-2',
    name: 'Nightly Security Scan',
    enabled: true,
    lastRun: '6 saat önce',
    runs: 32,
    nodes: [
      { id: 'n1', type: 'trigger', subtype: 'cron', label: 'Her gece 02:00', config: { schedule: '0 2 * * *' } },
      { id: 'n2', type: 'action', subtype: 'api', label: 'Security Scan API', config: { endpoint: '/api/security-scan' } },
      { id: 'n3', type: 'condition', subtype: 'if', label: 'Critical > 0?', config: {} },
      { id: 'n4', type: 'notify', subtype: 'email', label: 'Ekip E-postası', config: { to: 'team@x.com' } },
    ],
    edges: [['n1', 'n2'], ['n2', 'n3'], ['n3', 'n4']],
  },
  {
    id: 'wf-3',
    name: 'Manual Deploy Approve',
    enabled: false,
    lastRun: '3 gün önce',
    runs: 7,
    nodes: [
      { id: 'n1', type: 'trigger', subtype: 'manual', label: 'Buton Tetikleyici', config: {} },
      { id: 'n2', type: 'action', subtype: 'api', label: 'Deploy Endpoint', config: { endpoint: '/api/deploy' } },
      { id: 'n3', type: 'notify', subtype: 'slack', label: 'Slack #deploys', config: { channel: '#deploys' } },
    ],
    edges: [['n1', 'n2'], ['n2', 'n3']],
  },
];

const INITIAL_LOGS: LogEntry[] = [
  { id: 'l1', ts: '14:02:11', nodeId: 'n1', level: 'success', message: 'Webhook alındı — PR #482' },
  { id: 'l2', ts: '14:02:11', nodeId: 'n2', level: 'info', message: 'Branch=main → true dalı seçildi' },
  { id: 'l3', ts: '14:02:12', nodeId: 'n3', level: 'info', message: 'Agent çalıştırılıyor (deepseek-reasoner)' },
  { id: 'l4', ts: '14:02:34', nodeId: 'n3', level: 'success', message: 'Review tamam — 3 bulgu' },
  { id: 'l5', ts: '14:02:35', nodeId: 'n4', level: 'success', message: 'Slack #reviews kanalına gönderildi' },
];

export function WorkflowsView() {
  const [workflows, setWorkflows] = useState<WorkflowDef[]>(INITIAL_WORKFLOWS);
  const [activeId, setActiveId] = useState<string>(INITIAL_WORKFLOWS[0].id);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [running, setRunning] = useState(false);

  const active = workflows.find((w) => w.id === activeId) || workflows[0];

  const addWorkflow = () => {
    const id = `wf-${Date.now()}`;
    const newWf: WorkflowDef = {
      id,
      name: 'Yeni Workflow',
      enabled: false,
      lastRun: null,
      runs: 0,
      nodes: [
        { id: 'n1', type: 'trigger', subtype: 'manual', label: 'Manuel Başlat', config: {} },
      ],
      edges: [],
    };
    setWorkflows([...workflows, newWf]);
    setActiveId(id);
    toast.success('Yeni workflow oluşturuldu');
  };

  const deleteWorkflow = (id: string) => {
    const remaining = workflows.filter((w) => w.id !== id);
    setWorkflows(remaining);
    if (activeId === id && remaining.length > 0) setActiveId(remaining[0].id);
    toast.success('Workflow silindi');
  };

  const toggleEnabled = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const runWorkflow = async () => {
    if (running) return;
    setRunning(true);
    setLogs([]);
    const baseTs = Date.now();
    for (const node of active.nodes) {
      await new Promise((r) => setTimeout(r, 700));
      const meta = SUBTYPE_META[node.type][node.subtype];
      setLogs((prev) => [
        ...prev,
        {
          id: `l-${Date.now()}-${node.id}`,
          ts: new Date().toLocaleTimeString('tr-TR'),
          nodeId: node.id,
          level: 'success',
          message: `${node.label} (${meta.label}) çalıştırıldı`,
        },
      ]);
    }
    setRunning(false);
    toast.success(`"${active.name}" çalıştırıldı`);
    void baseTs;
  };

  // Node pozisyonları (sabit grid)
  const nodePositions: Record<string, { x: number; y: number }> = {};
  active.nodes.forEach((n, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    nodePositions[n.id] = { x: 40 + col * 260, y: 40 + row * 170 };
  });

  return (
    <div className="flex-1 flex bg-background overflow-hidden">
      {/* Sidebar — workflow list */}
      <aside className="w-64 border-r border-border bg-sidebar/50 flex flex-col">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <span className="text-xs font-semibold uppercase text-muted-foreground">
            Workflows ({workflows.length})
          </span>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={addWorkflow}>
            <Plus size={14} />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {workflows.map((w) => (
              <button
                key={w.id}
                onClick={() => setActiveId(w.id)}
                className={`w-full text-left p-2.5 rounded border text-xs transition-colors ${
                  activeId === w.id
                    ? 'bg-primary/10 border-primary/40'
                    : 'bg-transparent border-transparent hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium truncate">{w.name}</span>
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      w.enabled ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{w.nodes.length} node</span>
                  <span>·</span>
                  <span>{w.runs} çalışma</span>
                </div>
                {w.lastRun && (
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Son: {w.lastRun}
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Main — editor + log */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-border p-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Workflow size={18} className="text-cyan-400 flex-shrink-0" />
            <Input
              value={active.name}
              onChange={(e) =>
                setWorkflows((prev) =>
                  prev.map((w) => (w.id === active.id ? { ...w, name: e.target.value } : w))
                )
              }
              className="h-8 w-64 text-sm"
            />
            <Badge variant={active.enabled ? 'default' : 'outline'} className="text-[10px]">
              {active.enabled ? 'Aktif' : 'Devre dışı'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => toggleEnabled(active.id)}
            >
              {active.enabled ? 'Devre Dışı Bırak' : 'Aktifleştir'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-red-400 hover:bg-red-500/10"
              onClick={() => deleteWorkflow(active.id)}
            >
              <Trash2 size={14} />
            </Button>
            <Button size="sm" className="h-8" onClick={runWorkflow} disabled={running}>
              {running ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : (
                <Play size={14} className="mr-1" />
              )}
              Çalıştır
            </Button>
          </div>
        </div>

        {/* Node palette + canvas */}
        <div className="flex-1 flex overflow-hidden">
          {/* Palette */}
          <div className="w-44 border-r border-border p-2 bg-sidebar/30">
            <div className="text-[10px] uppercase text-muted-foreground mb-2 px-1">Node Tipleri</div>
            <div className="space-y-1">
              {(Object.keys(NODE_TYPE_META) as NodeType[]).map((t) => {
                const meta = NODE_TYPE_META[t];
                const Icon = meta.icon;
                const subs = Object.entries(SUBTYPE_META[t]);
                return (
                  <div key={t} className="mb-2">
                    <div className="flex items-center gap-1.5 px-1.5 py-1 text-[11px] font-medium" style={{ color: meta.color }}>
                      <Icon size={12} /> {meta.label}
                    </div>
                    {subs.map(([sk, sm]) => {
                      const SIcon = sm.icon;
                      return (
                        <div
                          key={sk}
                          className="flex items-center gap-1.5 px-2 py-1 text-[10px] rounded hover:bg-muted/40 cursor-grab"
                          style={{ color: sm.color }}
                        >
                          <SIcon size={10} /> {sm.label}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative overflow-auto bg-[#0d0d10]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #2a2a2e 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
            {/* Edges (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: 600 }}>
              {active.edges.map(([from, to], i) => {
                const a = nodePositions[from];
                const b = nodePositions[to];
                if (!a || !b) return null;
                const x1 = a.x + 220;
                const y1 = a.y + 40;
                const x2 = b.x;
                const y2 = b.y + 40;
                const midX = (x1 + x2) / 2;
                return (
                  <path
                    key={i}
                    d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                    stroke="#4fc3f7"
                    strokeWidth={1.5}
                    fill="none"
                    strokeDasharray="4 4"
                    opacity={0.6}
                  />
                );
              })}
            </svg>
            {/* Nodes */}
            {active.nodes.map((n) => {
              const pos = nodePositions[n.id];
              const meta = SUBTYPE_META[n.type][n.subtype];
              const Icon = meta.icon;
              return (
                <div
                  key={n.id}
                  className="absolute w-[220px] rounded-lg border bg-card shadow-lg"
                  style={{
                    left: pos.x,
                    top: pos.y,
                    borderColor: `${meta.color}66`,
                  }}
                >
                  <div
                    className="px-3 py-1.5 rounded-t-lg flex items-center gap-2 text-xs font-medium"
                    style={{ background: `${meta.color}22`, color: meta.color }}
                  >
                    <Icon size={12} />
                    {meta.label}
                  </div>
                  <div className="p-2.5">
                    <div className="text-xs font-medium text-foreground">{n.label}</div>
                    {Object.keys(n.config).length > 0 && (
                      <div className="mt-1.5 text-[10px] font-mono text-muted-foreground space-y-0.5">
                        {Object.entries(n.config).map(([k, v]) => (
                          <div key={k} className="truncate">
                            <span className="text-muted-foreground/70">{k}:</span> {v}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Execution log */}
        <div className="border-t border-border bg-sidebar/40 max-h-48 overflow-auto">
          <div className="px-3 py-1.5 border-b border-border text-[10px] uppercase text-muted-foreground flex items-center justify-between sticky top-0 bg-sidebar/80 backdrop-blur">
            <span className="flex items-center gap-1">
              <ChevronRight size={10} /> Execution Log
            </span>
            <span>{logs.length} kayıt</span>
          </div>
          <div className="p-2 space-y-0.5">
            <AnimatePresence>
              {logs.length === 0 ? (
                <div className="text-center text-[11px] text-muted-foreground py-4">
                  Log kaydı yok — "Çalıştır" butonu ile test edin
                </div>
              ) : (
                logs.map((l) => (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 text-[11px] font-mono px-1 py-0.5"
                  >
                    <span className="text-muted-foreground/60">{l.ts}</span>
                    <span
                      className={
                        l.level === 'success'
                          ? 'text-green-400'
                          : l.level === 'error'
                          ? 'text-red-400'
                          : 'text-cyan-400'
                      }
                    >
                      {l.level === 'success' ? '✓' : l.level === 'error' ? '✗' : '→'} [{l.nodeId}]
                    </span>
                    <span className="text-foreground/90">{l.message}</span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
