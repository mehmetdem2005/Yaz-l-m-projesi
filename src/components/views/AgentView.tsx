'use client';

import { useEffect, useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bot,
  Brain,
  Wrench,
  Eye,
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { DEEPSEEK_MODELS, type DeepSeekModel } from '@/lib/deepseek';
import { toast } from 'sonner';

interface AgentStep {
  step: number;
  type: 'thought' | 'action' | 'observation' | 'final';
  content: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: string;
  timestamp: string;
}

const STEP_ICONS = {
  thought: Brain,
  action: Zap,
  observation: Eye,
  final: CheckCircle2,
};

const STEP_COLORS = {
  thought: 'text-purple-400',
  action: 'text-blue-400',
  observation: 'text-amber-400',
  final: 'text-green-400',
};

export function AgentView() {
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [finalAnswer, setFinalAnswer] = useState('');
  const [model, setModel] = useState<DeepSeekModel>('deepseek-v4-pro');
  const [maxSteps, setMaxSteps] = useState(8);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const apiKeysSet = useStore((s) => s.apiKeysSet);
  const setView = useStore((s) => s.setView);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps, finalAnswer]);

  const handleRun = async () => {
    if (!input.trim()) {
      toast.error('Lütfen bir görev girin');
      return;
    }
    if (!apiKeysSet) {
      toast.error('Önce API key girin');
      setView('settings');
      return;
    }

    setRunning(true);
    setSteps([]);
    setFinalAnswer('');

    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          model,
          maxSteps,
          projectId: activeProjectId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Agent hatası');
      }

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
            const parsed = JSON.parse(line.slice(6));
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.type === 'final_answer') {
              setFinalAnswer(parsed.content);
            } else {
              setSteps((prev) => [...prev, { ...parsed, timestamp: new Date().toISOString() }]);
            }
          } catch (e) {
            // ignore
          }
        }
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot /> Agent Backend
          </h1>
          <p className="text-sm text-muted-foreground">
            ReAct (Reasoning + Acting) pattern agent. Function calling, memory ve tool use destekli.
          </p>
        </div>

        {/* Config */}
        <Card className="mb-4 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm">Yapılandırma</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Model</label>
              <Select value={model} onValueChange={(v) => setModel(v as DeepSeekModel)}>
                <SelectTrigger className="h-8 text-xs">
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
              <label className="text-xs text-muted-foreground mb-1 block">Maks. Adım</label>
              <Select value={String(maxSteps)} onValueChange={(v) => setMaxSteps(parseInt(v))}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[4, 6, 8, 12, 16].map((n) => (
                    <SelectItem key={n} value={String(n)} className="text-xs">
                      {n} adım
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleRun} disabled={running} className="w-full">
                {running ? (
                  <>
                    <Loader2 size={14} className="mr-1 animate-spin" /> Çalışıyor...
                  </>
                ) : (
                  <>
                    <Play size={14} className="mr-1" /> Çalıştır
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Task Input */}
        <Card className="mb-4 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm">Görev Tanımı</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="örn: 'Bir SaaS dashboard tasarla. 3 dosya oluştur: src/app/page.tsx, src/components/Sidebar.tsx, src/lib/auth.ts. Her dosyayı ISO 27001 standartlarına uygun şekilde yaz.'"
              rows={4}
              className="text-sm"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                'TOGAF uyumlu mimari tasarla',
                'ISO 27001 risk değerlendirmesi yap',
                'OWASP Top 10 audit yap',
                'GDPR uyum kontrolü yap',
              ].map((ex) => (
                <button
                  key={ex}
                  onClick={() => setInput(ex)}
                  className="text-xs px-2 py-1 bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded text-gray-300"
                >
                  {ex}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        {steps.length > 0 && (
          <Card className="mb-4 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Wrench size={14} /> Agent Adımları ({steps.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {steps.map((step, i) => {
                const Icon = STEP_ICONS[step.type];
                const color = STEP_COLORS[step.type];
                return (
                  <div
                    key={i}
                    className="border-l-2 border-border pl-3 py-1 fade-in-up"
                    style={{ borderColor: step.type === 'thought' ? '#a855f7' : step.type === 'action' ? '#3b82f6' : step.type === 'observation' ? '#f59e0b' : '#10b981' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={12} className={color} />
                      <Badge variant="outline" className="text-[10px]">
                        Adım {step.step} · {step.type}
                      </Badge>
                      {step.toolName && (
                        <Badge variant="secondary" className="text-[10px]">
                          {step.toolName}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {step.toolArgs && (
                        <pre className="text-[10px] font-mono bg-[#1e1e1e] p-2 rounded mt-1 mb-1 overflow-auto">
                          {JSON.stringify(step.toolArgs, null, 2)}
                        </pre>
                      )}
                      <div className="whitespace-pre-wrap">{step.content}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </CardContent>
          </Card>
        )}

        {/* Final Answer */}
        {finalAnswer && (
          <Card className="bg-card border-green-500/30">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2 text-green-400">
                <CheckCircle2 size={14} /> Final Cevap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm whitespace-pre-wrap">{finalAnswer}</div>
            </CardContent>
          </Card>
        )}

        {!apiKeysSet && (
          <Card className="bg-yellow-500/5 border-yellow-500/30 mt-4">
            <CardContent className="flex items-center gap-2 p-4 text-sm">
              <AlertCircle className="text-yellow-500" size={16} />
              <span>Agent çalıştırmak için DeepSeek API key gerekli.</span>
              <Button size="sm" variant="outline" onClick={() => setView('settings')}>
                Ayarlara Git
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
