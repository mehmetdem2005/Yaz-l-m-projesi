'use client';

import { useEffect, useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Activity,
  Bot,
  Brain,
  Cpu,
  Database,
  Github,
  Globe,
  Zap,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Network,
  Eye,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MonitorData {
  trees: Array<{
    id: string;
    name: string;
    status: string;
    nodes: any[];
    edges: any[];
    results: Record<string, string> | null;
    startedAt: string | null;
    completedAt: string | null;
  }>;
  runs: any[];
  templates: any[];
  memoryStats: {
    total: number;
    byType: Record<string, number>;
    totalSize: number;
    avgImportance: number;
  };
  mcpServers: any[];
  connectors: any[];
}

export function AgentMonitorView() {
  const [data, setData] = useState<MonitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTree, setSelectedTree] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const load = async () => {
    try {
      const res = await fetch('/api/agent-monitor');
      const d = await res.json();
      setData(d);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, 3000);
    return () => clearInterval(intervalRef.current);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#050510]">
        <Loader2 className="animate-spin text-purple-400" size={32} />
      </div>
    );
  }

  const activeTrees = data?.trees.filter((t) => t.status === 'running') || [];
  const completedTrees = data?.trees.filter((t) => t.status === 'completed') || [];
  const selectedTreeData = data?.trees.find((t) => t.id === selectedTree);

  return (
    <div className="flex-1 overflow-auto bg-[#050510] text-white">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="text-cyan-400" />
              </motion.div>
              Agent Mission Control
            </h1>
            <p className="text-sm text-gray-500">
              Sistemdeki tüm agent'ları neon Jarvis tarzında izleyin — her 3 saniyede güncellenir
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-green-400">CANLI</span>
            </motion.div>
          </div>
        </div>

        {/* Top stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Aktif Ağaçlar', value: activeTrees.length, icon: Network, color: '#06b6d4' },
            { label: 'Tamamlanan', value: completedTrees.length, icon: CheckCircle2, color: '#10b981' },
            { label: 'Memory Items', value: data?.memoryStats.total || 0, icon: Brain, color: '#a855f7' },
            { label: 'MCP Server', value: data?.mcpServers.length || 0, icon: Globe, color: '#f59e0b' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon size={18} style={{ color: s.color }} />
                      <motion.div
                        animate={{ boxShadow: [`0 0 0px ${s.color}`, `0 0 12px ${s.color}`, `0 0 0px ${s.color}`] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                        className="w-2 h-2 rounded-full"
                        style={{ background: s.color }}
                      />
                    </div>
                    <div className="text-2xl font-bold">{s.value}</div>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Memory breakdown */}
        <Card className="mb-6 bg-black/40 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="text-purple-400" size={16} /> Agent Bellek Durumu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {data &&
                Object.entries(data.memoryStats.byType).map(([type, count]) => (
                  <div
                    key={type}
                    className="p-3 bg-white/5 border border-white/10 rounded text-center"
                  >
                    <div className="text-xl font-bold text-purple-300">{count}</div>
                    <div className="text-[10px] text-gray-500 uppercase">{type}</div>
                  </div>
                ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">
              <span>Toplam boyut: <strong className="text-white">{(data?.memoryStats.totalSize || 0).toLocaleString('tr-TR')}</strong> byte</span>
              <span>Ort. önem: <strong className="text-white">{((data?.memoryStats.avgImportance || 0) * 100).toFixed(0)}%</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Active trees grid */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Activity className="text-cyan-400" size={14} /> Çalışan & Son Agent Ağaçları
          </h2>
          {data && data.trees.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <AnimatePresence>
                {data.trees.map((tree) => (
                  <motion.div
                    key={tree.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card
                      className="bg-black/40 border-white/10 backdrop-blur-md cursor-pointer hover:border-cyan-500/50 transition-colors"
                      onClick={() => setSelectedTree(tree.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate">{tree.name}</div>
                            <div className="text-[10px] text-gray-500">
                              {new Date(tree.startedAt || tree.updatedAt).toLocaleString('tr-TR')}
                            </div>
                          </div>
                          <StatusBadge status={tree.status} />
                        </div>

                        {/* Node count */}
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Bot size={10} />
                            {tree.nodes.length} node
                          </span>
                          <span className="flex items-center gap-1">
                            <Network size={10} />
                            {tree.edges.length} bağlantı
                          </span>
                        </div>

                        {/* Node visualization (mini) */}
                        <div className="mt-3 flex flex-wrap gap-1">
                          {tree.nodes.slice(0, 10).map((node: any) => (
                            <motion.div
                              key={node.id}
                              animate={
                                node.data?.status === 'running'
                                  ? { boxShadow: ['0 0 0px #06b6d4', '0 0 10px #06b6d4', '0 0 0px #06b6d4'] }
                                  : {}
                              }
                              transition={{ duration: 1, repeat: Infinity }}
                              className="w-2 h-2 rounded-full"
                              style={{
                                background: getNodeColor(node.data?.type),
                                opacity: node.data?.status === 'idle' ? 0.3 : 1,
                              }}
                              title={node.data?.label}
                            />
                          ))}
                          {tree.nodes.length > 10 && (
                            <span className="text-[10px] text-gray-500">+{tree.nodes.length - 10}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <Card className="bg-black/40 border-white/10">
              <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Network size={48} className="mb-3 opacity-30" />
                <p>Henüz agent ağacı çalışmamış</p>
                <Button
                  variant="outline"
                  className="mt-3 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                  onClick={() => useStore.getState().setView('agent-tree')}
                >
                  Agent Tree Studio'ya Git
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Selected tree detail */}
        {selectedTreeData && (
          <Card className="mb-6 bg-black/60 border-cyan-500/30 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Eye className="text-cyan-400" size={14} />
                  {selectedTreeData.name} — Detaylı İzleme
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7"
                  onClick={() => setSelectedTree(null)}
                >
                  Kapat
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nodes with prompts */}
                <div>
                  <h3 className="text-xs font-semibold mb-2 text-cyan-400">
                    Node'lar & Prompt'ları
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-auto pr-2">
                    {selectedTreeData.nodes.map((node: any) => (
                      <div
                        key={node.id}
                        className="p-2 bg-white/5 border border-white/10 rounded text-xs"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: getNodeColor(node.data?.type) }}
                          />
                          <span className="font-medium text-white">{node.data?.label}</span>
                          <StatusBadge status={node.data?.status || 'idle'} />
                        </div>
                        <div className="text-[10px] text-gray-500 italic line-clamp-2 pl-4">
                          "{node.data?.systemPrompt?.slice(0, 120)}..."
                        </div>
                        {node.data?.output && (
                          <div className="mt-1 p-1.5 bg-black/40 rounded text-[10px] text-gray-400 line-clamp-3">
                            Çıktı: {node.data.output.slice(0, 200)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Results */}
                <div>
                  <h3 className="text-xs font-semibold mb-2 text-green-400">
                    Çıktılar
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-auto pr-2">
                    {selectedTreeData.results &&
                      Object.entries(selectedTreeData.results).map(([nodeId, output]: [string, any]) => (
                        <div
                          key={nodeId}
                          className="p-2 bg-green-500/5 border border-green-500/20 rounded text-xs"
                        >
                          <div className="text-[10px] text-green-400 font-mono mb-1">
                            {selectedTreeData.nodes.find((n: any) => n.id === nodeId)?.data?.label || nodeId}
                          </div>
                          <div className="text-gray-300 whitespace-pre-wrap line-clamp-6">
                            {output?.slice(0, 500)}
                          </div>
                        </div>
                      ))}
                    {!selectedTreeData.results && (
                      <div className="text-center text-gray-600 py-8 text-xs">
                        Henüz çıktı yok
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* MCP Servers & Connectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="text-amber-400" size={16} /> MCP Server'ları
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data && data.mcpServers.length > 0 ? (
                <div className="space-y-2">
                  {data.mcpServers.map((s: any) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={s.status === 'connected' ? { opacity: [0.5, 1, 0.5] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`w-1.5 h-1.5 rounded-full ${
                            s.status === 'connected' ? 'bg-green-400' : 'bg-gray-600'
                          }`}
                        />
                        <span className="font-medium">{s.name}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {s.status || 'disconnected'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 py-4 text-xs">MCP server yok</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="text-blue-400" size={16} /> Connector'lar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data && data.connectors.length > 0 ? (
                <div className="space-y-2">
                  {data.connectors.map((c: any) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Cpu size={12} className="text-blue-400" />
                        <span className="font-medium">{c.name}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {c.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 py-4 text-xs">Connector yok</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: any; label: string }> = {
    running: { color: '#06b6d4', icon: Loader2, label: 'Çalışıyor' },
    completed: { color: '#10b981', icon: CheckCircle2, label: 'Tamam' },
    error: { color: '#ef4444', icon: AlertCircle, label: 'Hata' },
    idle: { color: '#64748b', icon: Activity, label: 'Bekliyor' },
  };
  const c = config[status] || config.idle;
  const Icon = c.icon;
  return (
    <Badge
      variant="outline"
      className="text-[9px] py-0 flex items-center gap-1"
      style={{ color: c.color, borderColor: `${c.color}40` }}
    >
      <Icon size={9} className={status === 'running' ? 'animate-spin' : ''} />
      {c.label}
    </Badge>
  );
}

function getNodeColor(type?: string): string {
  const colors: Record<string, string> = {
    orchestrator: '#a855f7',
    researcher: '#06b6d4',
    coder: '#10b981',
    reviewer: '#f59e0b',
    tester: '#ec4899',
    planner: '#3b82f6',
    executor: '#ef4444',
    critic: '#8b5cf6',
    custom: '#64748b',
  };
  return colors[type || 'custom'] || '#64748b';
}
