'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  Handle,
  Position,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bot,
  Code2,
  Eye,
  ClipboardList,
  Search,
  FlaskConical,
  Terminal,
  MessageSquareWarning,
  Crown,
  Box,
  Play,
  Save,
  Trash2,
  Sparkles,
  Loader2,
  Plus,
} from 'lucide-react';
import { NODE_STYLES, BUILTIN_AGENT_TEMPLATES, type AgentNode, type AgentNodeType, type AgentEdge } from '@/lib/agent-tree';
import { DEEPSEEK_MODELS, type DeepSeekModel } from '@/lib/deepseek';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Crown,
  Search,
  Code2,
  Eye,
  FlaskConical,
  ClipboardList,
  Terminal,
  MessageSquareWarning,
  Box,
};

// ---------- Custom Node Component ----------

function AgentNodeComponent({ data, id }: { data: AgentNode['data']; id: string }) {
  const style = NODE_STYLES[data.type || 'custom'];
  const Icon = ICONS[style.icon] || Box;
  const status = data.status || 'idle';

  return (
    <div
      className="relative px-4 py-3 rounded-lg min-w-[200px] border-2 transition-all"
      style={{
        background: 'rgba(15, 15, 25, 0.95)',
        borderColor: style.color,
        boxShadow: status === 'running'
          ? `0 0 30px ${style.glow}, 0 0 60px ${style.glow}, inset 0 0 20px rgba(255,255,255,0.05)`
          : `0 0 12px ${style.glow}`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: style.color, width: 10, height: 10, border: 'none' }}
      />

      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: style.color, boxShadow: `0 0 10px ${style.glow}` }}
        >
          <Icon size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-white truncate">{data.label}</div>
          <div className="text-[10px] text-gray-400">{style.label}</div>
        </div>
        {status === 'running' && (
          <Loader2 size={12} className="animate-spin text-white" />
        )}
        {status === 'done' && (
          <div className="w-2 h-2 rounded-full bg-green-400 glow-green" />
        )}
      </div>

      <div className="text-[10px] text-gray-500 truncate">
        🤖 {DEEPSEEK_MODELS.find((m) => m.id === data.model)?.name.split(' ')[0] || data.model}
      </div>

      {data.systemPrompt && (
        <div className="mt-2 text-[9px] text-gray-600 line-clamp-2 italic">
          "{data.systemPrompt.slice(0, 80)}..."
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: style.color, width: 10, height: 10, border: 'none' }}
      />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  agentNode: AgentNodeComponent as any,
};

// ---------- Main View ----------

export function AgentTreeView() {
  const [nodes, setNodes, onNodesChange] = useNodesState<AgentNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AgentEdge>([]);
  const [selectedNode, setSelectedNode] = useState<AgentNode | null>(null);
  const [editingNode, setEditingNode] = useState<AgentNode | null>(null);
  const [running, setRunning] = useState(false);
  const [executionLog, setExecutionLog] = useState<Array<{ type: string; data: any }>>([]);
  const [userInput, setUserInput] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds: any) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const addNode = (type: AgentNodeType) => {
    const style = NODE_STYLES[type];
    const newNode: AgentNode = {
      id: `node_${nanoid(6)}`,
      type: 'agentNode',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: {
        label: `${style.label} ${nodes.length + 1}`,
        type,
        systemPrompt: `Sen bir ${style.label} agentsın. Görevini en profesyonel şekilde yerine getir.`,
        model: 'deepseek-v4-pro',
        temperature: 0.4,
        maxTokens: 2000,
        tools: [],
        inputs: '$user_input',
        expectedOutput: 'Profesyonel çıktı',
      },
    };
    setNodes((nds: any) => [...nds, newNode]);
  };

  const loadTemplate = (template: typeof BUILTIN_AGENT_TEMPLATES[0]) => {
    setNodes(template.nodes as any);
    setEdges(template.edges as any);
    toast.success(`"${template.name}" yüklendi`);
  };

  const saveAsTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('İsim gerekli');
      return;
    }
    await fetch('/api/agent-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: templateName,
        description: 'Kullanıcı tarafından oluşturuldu',
        nodes,
        edges,
      }),
    });
    toast.success('Şablon kaydedildi');
    setSaveDialogOpen(false);
    setTemplateName('');
  };

  const runTree = async () => {
    if (nodes.length === 0) {
      toast.error('En az bir node ekleyin');
      return;
    }
    if (!userInput.trim()) {
      toast.error('Görev girin');
      return;
    }

    setRunning(true);
    setExecutionLog([]);

    // Reset node statuses
    setNodes((nds: any) =>
      nds.map((n: AgentNode) => ({ ...n, data: { ...n.data, status: 'idle', output: undefined } }))
    );

    try {
      const res = await fetch('/api/agent-tree/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName || 'Runtime',
          nodes,
          edges,
          userInput,
          model: 'deepseek-v4-pro',
        }),
      });

      if (!res.ok) throw new Error('Tree çalıştırılamadı');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            setExecutionLog((prev) => [...prev, data]);

            if (data.type === 'node_start') {
              setNodes((nds: any) =>
                nds.map((n: AgentNode) =>
                  n.id === data.nodeId ? { ...n, data: { ...n.data, status: 'running' } } : n
                )
              );
            } else if (data.type === 'node_complete') {
              setNodes((nds: any) =>
                nds.map((n: AgentNode) =>
                  n.id === data.nodeId
                    ? { ...n, data: { ...n.data, status: 'done', output: data.output } }
                    : n
                )
              );
            } else if (data.type === 'node_error') {
              setNodes((nds: any) =>
                nds.map((n: AgentNode) =>
                  n.id === data.nodeId ? { ...n, data: { ...n.data, status: 'error' } } : n
                )
              );
            }
          } catch {}
        }
      }
      toast.success('Tree tamamlandı');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setRunning(false);
    }
  };

  const onNodeClick = useCallback((_: unknown, node: AgentNode) => {
    setSelectedNode(node);
    setEditingNode({ ...node, data: { ...node.data } });
  }, []);

  const updateNode = (updates: Partial<AgentNode['data']>) => {
    if (!editingNode) return;
    const updated = { ...editingNode, data: { ...editingNode.data, ...updates } };
    setEditingNode(updated);
    setNodes((nds: any) => nds.map((n: AgentNode) => (n.id === updated.id ? updated : n)));
    setSelectedNode(updated);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0f]">
      {/* Header */}
      <div className="border-b border-white/10 p-3 flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold flex items-center gap-2 text-white">
            <Sparkles className="text-purple-400" size={16} />
            Agent Tree Studio
          </h1>
          <p className="text-[10px] text-gray-500">
            Subagent hiyerarşisi kur, node'ları bağla, neon Jarvis tarzı izle
          </p>
        </div>

        {/* Add node buttons */}
        <div className="flex flex-wrap items-center gap-1">
          {(Object.keys(NODE_STYLES) as AgentNodeType[]).map((type) => {
            const style = NODE_STYLES[type];
            const Icon = ICONS[style.icon] || Box;
            return (
              <button
                key={type}
                onClick={() => addNode(type)}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] hover:bg-white/10 transition-colors"
                style={{ color: style.color, border: `1px solid ${style.color}40` }}
                title={`${style.label} ekle`}
              >
                <Icon size={11} /> {style.label}
              </button>
            );
          })}
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setSaveDialogOpen(true)}
          className="h-7 text-xs border-white/20 text-white hover:bg-white/10"
        >
          <Save size={12} className="mr-1" /> Şablon Kaydet
        </Button>
      </div>

      {/* Built-in templates */}
      <div className="border-b border-white/10 px-3 py-2 flex flex-wrap items-center gap-2 bg-[#11111a]">
        <span className="text-[10px] text-gray-500">Hazır Şablonlar:</span>
        {BUILTIN_AGENT_TEMPLATES.map((t) => (
          <button
            key={t.name}
            onClick={() => loadTemplate(t)}
            className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-gray-300 hover:text-white transition-colors"
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Main: React Flow + Side panel */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative" style={{ background: '#0a0a0f' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-transparent"
            style={{ background: 'transparent' }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#1a1a2e"
            />
            <Controls
              className="!bg-[#1a1a2e] !border-white/20"
              showInteractive={false}
            />
            <MiniMap
              className="!bg-[#0a0a0f] !border-white/20"
              nodeColor={(n: any) => NODE_STYLES[n.data?.type || 'custom']?.color || '#64748b'}
              maskColor="rgba(0,0,0,0.7)"
            />
          </ReactFlow>

          {/* Run controls overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-3 bg-[#1a1a2e]/90 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Agent'a görev girin..."
              className="h-8 w-64 bg-transparent border-white/20 text-white placeholder:text-gray-500 text-xs"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !running) runTree();
              }}
            />
            <Button
              size="sm"
              onClick={runTree}
              disabled={running}
              className="h-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {running ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
              <span className="ml-1 text-xs">Çalıştır</span>
            </Button>
          </div>
        </div>

        {/* Right: Execution log */}
        <aside className="w-72 border-l border-white/10 bg-[#0d0d18] flex flex-col flex-shrink-0">
          <div className="p-2 border-b border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-gray-400">
              Çalışma Günlüğü
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs"
              onClick={() => setExecutionLog([])}
            >
              <Trash2 size={10} />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-1">
            {executionLog.length === 0 ? (
              <div className="text-center text-[10px] text-gray-600 py-8">
                Henüz çalışma yok
              </div>
            ) : (
              executionLog.map((log, i) => (
                <div
                  key={i}
                  className="text-[10px] p-2 rounded bg-white/5 border border-white/5 fade-in-up"
                >
                  <div className="flex items-center gap-1 mb-1">
                    <Badge
                      variant="outline"
                      className="text-[8px] py-0"
                      style={{
                        color:
                          log.type === 'node_complete'
                            ? '#10b981'
                            : log.type === 'node_error'
                            ? '#ef4444'
                            : log.type === 'node_start'
                            ? '#06b6d4'
                            : '#a855f7',
                        borderColor: 'currentColor',
                      }}
                    >
                      {log.type}
                    </Badge>
                    {log.nodeId && (
                      <span className="text-gray-400 font-mono text-[9px]">
                        {log.nodeId.slice(0, 12)}
                      </span>
                    )}
                  </div>
                  {log.node?.label && (
                    <div className="text-white font-medium">{log.node.label}</div>
                  )}
                  {log.node?.systemPrompt && (
                    <div className="text-[9px] text-gray-500 italic mt-1 line-clamp-2">
                      "{log.node.systemPrompt.slice(0, 60)}..."
                    </div>
                  )}
                  {log.output && (
                    <div className="text-gray-300 mt-1 line-clamp-3 text-[9px]">
                      {log.output.slice(0, 200)}
                    </div>
                  )}
                  {log.error && (
                    <div className="text-red-400 mt-1 text-[9px]">{log.error}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {/* Node edit dialog */}
      <Dialog open={Boolean(editingNode)} onOpenChange={(o) => !o && setEditingNode(null)}>
        <DialogContent className="max-w-2xl bg-[#1a1a2e] border-white/20 text-white">
          {editingNode && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      background: NODE_STYLES[editingNode.data.type].color,
                      boxShadow: `0 0 8px ${NODE_STYLES[editingNode.data.type].glow}`,
                    }}
                  />
                  {editingNode.data.label} — Düzenle
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 max-h-[60vh] overflow-auto pr-2">
                <div>
                  <Label className="text-xs">Etiket</Label>
                  <Input
                    value={editingNode.data.label}
                    onChange={(e) => updateNode({ label: e.target.value })}
                    className="bg-transparent border-white/20 text-white text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">System Prompt</Label>
                  <Textarea
                    value={editingNode.data.systemPrompt}
                    onChange={(e) => updateNode({ systemPrompt: e.target.value })}
                    rows={4}
                    className="bg-transparent border-white/20 text-white text-xs font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Model</Label>
                    <Select
                      value={editingNode.data.model}
                      onValueChange={(v) => updateNode({ model: v })}
                    >
                      <SelectTrigger className="bg-transparent border-white/20 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEEPSEEK_MODELS.map((m) => (
                          <SelectItem key={m.id} value={m.id} className="text-xs">
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Sıcaklık: {editingNode.data.temperature}</Label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={editingNode.data.temperature}
                      onChange={(e) => updateNode({ temperature: parseFloat(e.target.value) })}
                      className="w-full mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Maks. Token</Label>
                  <Input
                    type="number"
                    value={editingNode.data.maxTokens}
                    onChange={(e) => updateNode({ maxTokens: parseInt(e.target.value) || 1000 })}
                    className="bg-transparent border-white/20 text-white text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Input (değişken kullan: $user_input, $nodeId.output)</Label>
                  <Input
                    value={editingNode.data.inputs}
                    onChange={(e) => updateNode({ inputs: e.target.value })}
                    className="bg-transparent border-white/20 text-white text-sm font-mono text-xs"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNodes((nds: any) => nds.filter((n: AgentNode) => n.id !== editingNode.id));
                    setEditingNode(null);
                  }}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 size={12} className="mr-1" /> Node Sil
                </Button>
                <Button onClick={() => setEditingNode(null)}>Kapat</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Save template dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="max-w-md bg-[#1a1a2e] border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Agent Şablonu Kaydet</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Şablon Adı</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="örn: SaaS Dashboard Generator"
                className="bg-transparent border-white/20 text-white text-sm"
              />
            </div>
            <p className="text-xs text-gray-500">
              {nodes.length} node, {edges.length} bağlantı kaydedilecek.
              Şablonu daha sonra Connectors/Agent Templates bölümünden yükleyebilirsiniz.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={saveAsTemplate}>
              <Save size={12} className="mr-1" /> Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
