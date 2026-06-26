'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Rocket,
  Globe,
  Loader2,
  CheckCircle2,
  XCircle,
  Cloud,
  Server,
  Settings,
  Key,
  Plus,
  Terminal,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface DeployTarget {
  id: string;
  name: string;
  icon: any;
  color: string;
  status: 'idle' | 'deploying' | 'success' | 'failed';
  lastDeploy: string | null;
  url: string | null;
  branch: string;
  buildCmd: string;
  outputDir: string;
  envVars: Array<{ key: string; value: string; secret: boolean }>;
}

const INITIAL_TARGETS: DeployTarget[] = [
  {
    id: 'vercel',
    name: 'Vercel',
    icon: Rocket,
    color: '#ffffff',
    status: 'success',
    lastDeploy: '2 saat önce',
    url: 'https://my-project.vercel.app',
    branch: 'main',
    buildCmd: 'next build',
    outputDir: '.next',
    envVars: [
      { key: 'NEXT_PUBLIC_API_URL', value: 'https://api.x.com', secret: false },
      { key: 'DEEPSEEK_API_KEY', value: 'sk-***', secret: true },
    ],
  },
  {
    id: 'netlify',
    name: 'Netlify',
    icon: Globe,
    color: '#00ad9f',
    status: 'idle',
    lastDeploy: '3 gün önce',
    url: 'https://my-project.netlify.app',
    branch: 'main',
    buildCmd: 'npm run build',
    outputDir: 'dist',
    envVars: [{ key: 'NODE_VERSION', value: '20', secret: false }],
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Pages',
    icon: Cloud,
    color: '#f38020',
    status: 'idle',
    lastDeploy: null,
    url: null,
    branch: 'main',
    buildCmd: 'next build',
    outputDir: '.next/static',
    envVars: [],
  },
  {
    id: 'amplify',
    name: 'AWS Amplify',
    icon: Cloud,
    color: '#ff9900',
    status: 'failed',
    lastDeploy: '1 gün önce',
    url: 'https://main.d2abc.amplifyapp.com',
    branch: 'main',
    buildCmd: 'next build',
    outputDir: '.next',
    envVars: [{ key: 'AWS_REGION', value: 'us-east-1', secret: false }],
  },
  {
    id: 'railway',
    name: 'Railway',
    icon: Server,
    color: '#a855f7',
    status: 'idle',
    lastDeploy: null,
    url: null,
    branch: 'main',
    buildCmd: 'bun run build',
    outputDir: '.next',
    envVars: [],
  },
  {
    id: 'render',
    name: 'Render',
    icon: Server,
    color: '#46e3b7',
    status: 'idle',
    lastDeploy: null,
    url: null,
    branch: 'main',
    buildCmd: 'next build',
    outputDir: '.next',
    envVars: [],
  },
  {
    id: 'fly',
    name: 'Fly.io',
    icon: Rocket,
    color: '#8b5cf6',
    status: 'idle',
    lastDeploy: null,
    url: null,
    branch: 'main',
    buildCmd: 'docker build',
    outputDir: '.',
    envVars: [],
  },
];

interface LogLine {
  id: string;
  ts: string;
  level: 'info' | 'success' | 'error';
  msg: string;
}

const SAMPLE_LOG_SEQUENCE: Array<Omit<LogLine, 'id' | 'ts'>> = [
  { level: 'info', msg: 'Deploy başlatılıyor...' },
  { level: 'info', msg: 'Kaynak kod indiriliyor (main branch)' },
  { level: 'info', msg: 'Bağımlılıklar yükleniyor: bun install' },
  { level: 'info', msg: 'Build komutu çalıştırılıyor: next build' },
  { level: 'info', msg: '  ✓ Route (app)                                        ' },
  { level: 'info', msg: '  ✓ Compiled successfully (4.2s)' },
  { level: 'info', msg: '  ✓ Generating static pages (12/12)' },
  { level: 'info', msg: 'Build tamamlandı — output boyutu: 18.4 MB' },
  { level: 'info', msg: 'Dosyalar CDN\'e yükleniyor...' },
  { level: 'info', msg: '  ✓ 1,247 dosya yüklendi' },
  { level: 'info', msg: 'Edge fonksiyonları dağıtılıyor...' },
  { level: 'info', msg: '  ✓ 4 edge function aktif' },
  { level: 'success', msg: 'Deploy başarılı! Canlı URL aktif.' },
];

const STATUS_META = {
  idle: { color: '#64748b', label: 'Hazır', icon: Rocket },
  deploying: { color: '#06b6d4', label: 'Deploy ediliyor', icon: Loader2 },
  success: { color: '#10b981', label: 'Başarılı', icon: CheckCircle2 },
  failed: { color: '#ef4444', label: 'Başarısız', icon: XCircle },
};

export function DeployTargetsView() {
  const [targets, setTargets] = useState<DeployTarget[]>(INITIAL_TARGETS);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_TARGETS[0].id);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [logTargetId, setLogTargetId] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const activeProject = useStore((s) => s.activeProject);

  const selected = targets.find((t) => t.id === selectedId) || targets[0];

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleDeploy = async (id: string) => {
    const target = targets.find((t) => t.id === id);
    if (!target || target.status === 'deploying') return;

    setTargets((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'deploying' } : t)));
    setLogTargetId(id);
    setLogs([]);

    for (const line of SAMPLE_LOG_SEQUENCE) {
      await new Promise((r) => setTimeout(r, 500));
      setLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}-${prev.length}`,
          ts: new Date().toLocaleTimeString('tr-TR'),
          ...line,
        },
      ]);
    }

    const success = Math.random() > 0.15;
    setTargets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: success ? 'success' : 'failed',
              lastDeploy: 'az önce',
              url: success ? t.url || `https://${t.id}-${Date.now()}.app` : t.url,
            }
          : t
      )
    );

    if (success) {
      toast.success(`${target.name} deploy başarılı`);
    } else {
      toast.error(`${target.name} deploy başarısız`);
      setLogs((prev) => [
        ...prev,
        {
          id: `log-err-${Date.now()}`,
          ts: new Date().toLocaleTimeString('tr-TR'),
          level: 'error',
          msg: 'Deploy başarısız — build hatası (exit code 1)',
        },
      ]);
    }
  };

  const updateTarget = (id: string, patch: Partial<DeployTarget>) => {
    setTargets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const addEnvVar = (id: string) => {
    setTargets((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, envVars: [...t.envVars, { key: '', value: '', secret: false }] }
          : t
      )
    );
  };

  const updateEnvVar = (targetId: string, idx: number, patch: Partial<DeployTarget['envVars'][number]>) => {
    setTargets((prev) =>
      prev.map((t) =>
        t.id === targetId
          ? { ...t, envVars: t.envVars.map((ev, i) => (i === idx ? { ...ev, ...patch } : ev)) }
          : t
      )
    );
  };

  const removeEnvVar = (targetId: string, idx: number) => {
    setTargets((prev) =>
      prev.map((t) =>
        t.id === targetId
          ? { ...t, envVars: t.envVars.filter((_, i) => i !== idx) }
          : t
      )
    );
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL kopyalandı');
  };

  return (
    <div className="flex-1 overflow-auto bg-background pb-20 md:pb-0">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Rocket className="text-orange-400" /> Deploy Hedefleri
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeProject ? (
                <>Aktif proje: <span className="font-medium">{activeProject.name}</span></>
              ) : (
                '7 platform — tek tıkla deploy, canlı log akışı'
              )}
            </p>
          </div>
          <Button variant="outline" size="sm" className="h-8">
            <Plus size={14} className="mr-1" /> Yeni Hedef
          </Button>
        </div>

        {/* Platform cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {targets.map((t) => {
            const Icon = t.icon;
            const sMeta = STATUS_META[t.status];
            const SIcon = sMeta.icon;
            return (
              <Card
                key={t.id}
                className={`bg-card border-border cursor-pointer transition-all ${
                  selectedId === t.id ? 'border-primary/60 ring-1 ring-primary/20' : 'hover:border-border'
                }`}
                onClick={() => setSelectedId(t.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center"
                        style={{ background: `${t.color}15` }}
                      >
                        <Icon size={16} style={{ color: t.color }} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{t.name}</div>
                        <div className="text-[10px] text-muted-foreground">branch: {t.branch}</div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[9px] flex items-center gap-1"
                      style={{ color: sMeta.color, borderColor: `${sMeta.color}55` }}
                    >
                      <SIcon size={9} className={t.status === 'deploying' ? 'animate-spin' : ''} />
                      {sMeta.label}
                    </Badge>
                  </div>

                  {t.url && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-2 truncate">
                      <Globe size={10} className="flex-shrink-0" />
                      <span className="truncate">{t.url}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyUrl(t.url!);
                        }}
                        className="ml-auto opacity-60 hover:opacity-100"
                      >
                        <Copy size={10} />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-muted-foreground">
                      {t.lastDeploy ? `Son: ${t.lastDeploy}` : 'Henüz deploy edilmedi'}
                    </span>
                    <Button
                      size="sm"
                      className="h-7 text-xs"
                      disabled={t.status === 'deploying'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeploy(t.id);
                      }}
                    >
                      {t.status === 'deploying' ? (
                        <Loader2 size={12} className="animate-spin mr-1" />
                      ) : (
                        <Rocket size={12} className="mr-1" />
                      )}
                      Deploy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Selected target detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings size={14} /> {selected.name} — Yapılandırma
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="build">
                <TabsList className="grid grid-cols-3 mb-3">
                  <TabsTrigger value="build" className="text-xs">Build</TabsTrigger>
                  <TabsTrigger value="env" className="text-xs">Env Vars</TabsTrigger>
                  <TabsTrigger value="general" className="text-xs">Genel</TabsTrigger>
                </TabsList>

                <TabsContent value="build" className="space-y-3 mt-0">
                  <div>
                    <Label className="text-xs mb-1.5">Build Komutu</Label>
                    <Input
                      value={selected.buildCmd}
                      onChange={(e) => updateTarget(selected.id, { buildCmd: e.target.value })}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5">Output Dizini</Label>
                    <Input
                      value={selected.outputDir}
                      onChange={(e) => updateTarget(selected.id, { outputDir: e.target.value })}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5">Branch</Label>
                    <Input
                      value={selected.branch}
                      onChange={(e) => updateTarget(selected.id, { branch: e.target.value })}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="env" className="space-y-2 mt-0">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs flex items-center gap-1">
                      <Key size={11} /> Environment Variables
                    </Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs px-2"
                      onClick={() => addEnvVar(selected.id)}
                    >
                      <Plus size={11} className="mr-0.5" /> Ekle
                    </Button>
                  </div>
                  {selected.envVars.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded">
                      Henüz env var yok
                    </div>
                  ) : (
                    selected.envVars.map((ev, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          placeholder="KEY"
                          value={ev.key}
                          onChange={(e) => updateEnvVar(selected.id, idx, { key: e.target.value })}
                          className="h-7 text-xs font-mono flex-1"
                        />
                        <Input
                          placeholder="value"
                          value={ev.value}
                          onChange={(e) => updateEnvVar(selected.id, idx, { value: e.target.value })}
                          className="h-7 text-xs font-mono flex-1"
                          type={ev.secret ? 'password' : 'text'}
                        />
                        <Switch
                          checked={ev.secret}
                          onCheckedChange={(c) => updateEnvVar(selected.id, idx, { secret: c })}
                          className="scale-75"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-400"
                          onClick={() => removeEnvVar(selected.id, idx)}
                        >
                          <XCircle size={12} />
                        </Button>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="general" className="space-y-3 mt-0">
                  <div className="flex items-center justify-between p-2 rounded border border-border">
                    <div>
                      <div className="text-xs font-medium">Otomatik Deploy</div>
                      <div className="text-[10px] text-muted-foreground">Her push'ta tetikle</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded border border-border">
                    <div>
                      <div className="text-xs font-medium">Preview Branches</div>
                      <div className="text-[10px] text-muted-foreground">PR'lar için preview URL</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded border border-border">
                    <div>
                      <div className="text-xs font-medium">Skype Build Cache</div>
                      <div className="text-[10px] text-muted-foreground">Hızlı build için cache</div>
                    </div>
                    <Switch />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Live deploy log */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Terminal size={14} /> Deploy Log
                {logTargetId && (
                  <Badge variant="outline" className="text-[9px] ml-1">
                    {targets.find((t) => t.id === logTargetId)?.name}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0d0d10] rounded border border-border p-3 h-80 overflow-auto font-mono text-[11px]">
                <AnimatePresence>
                  {logs.length === 0 ? (
                    <div className="text-muted-foreground text-center py-12">
                      <Terminal size={32} className="mx-auto mb-2 opacity-30" />
                      <p>Deploy logu burada görünecek</p>
                      <p className="text-[10px] mt-1">Bir platformda "Deploy" butonuna basın</p>
                    </div>
                  ) : (
                    logs.map((l) => (
                      <motion.div
                        key={l.id}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-2 py-0.5"
                      >
                        <span className="text-muted-foreground/60 flex-shrink-0">{l.ts}</span>
                        <span
                          className={
                            l.level === 'success'
                              ? 'text-green-400'
                              : l.level === 'error'
                              ? 'text-red-400'
                              : 'text-cyan-400'
                          }
                        >
                          {l.level === 'success' ? '✓' : l.level === 'error' ? '✗' : '›'}
                        </span>
                        <span className={l.level === 'error' ? 'text-red-300' : 'text-foreground/90'}>
                          {l.msg}
                        </span>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
                <div ref={logEndRef} />
              </div>
              {selected.url && selected.status === 'success' && (
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-1.5 text-xs text-blue-400 hover:underline"
                >
                  <ExternalLink size={12} /> Canlı siteyi aç: {selected.url}
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
