'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Play,
  Terminal,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Code2,
  Globe,
  Palette,
  Braces,
  SquareTerminal,
  Clock,
  Cpu,
} from 'lucide-react';
import { SANDBOX_EXAMPLES, LANGUAGE_META, type SandboxLanguage } from '@/lib/sandbox';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Braces,
  FileCode: Code2,
  Terminal: SquareTerminal,
  Globe,
  Palette,
};

interface Result {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
  memoryUsed?: number;
  error?: string;
  output?: string;
}

export function SandboxView() {
  const [language, setLanguage] = useState<SandboxLanguage>('javascript');
  const [code, setCode] = useState(SANDBOX_EXAMPLES.javascript[0]);
  const [timeout, setTimeout] = useState(10000);
  const [memoryLimit, setMemoryLimit] = useState(128);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const handleRun = async () => {
    if (!code.trim()) {
      toast.error('Kod girin');
      return;
    }
    setRunning(true);
    setResult(null);

    try {
      const res = await fetch('/api/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          timeout,
          memoryLimit,
          allowNetwork: false,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.result);
        if (data.result.exitCode === 0) {
          toast.success('Çalıştırma başarılı');
        } else {
          toast.error(`Exit code: ${data.result.exitCode}`);
        }
      } else {
        toast.error(data.error || 'Hata');
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setRunning(false);
    }
  };

  const handleExample = (idx: number) => {
    setCode(SANDBOX_EXAMPLES[language][idx]);
    setResult(null);
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <SquareTerminal className="text-green-400" /> Sandbox
            </h1>
            <p className="text-sm text-muted-foreground">
              Güvenli kod çalıştırma — JavaScript, TypeScript, Python, Shell, HTML, CSS
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={language}
              onValueChange={(v) => {
                setLanguage(v as SandboxLanguage);
                setCode(SANDBOX_EXAMPLES[v as SandboxLanguage][0]);
                setResult(null);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LANGUAGE_META).map(([key, meta]) => {
                  const Icon = ICONS[meta.icon] || Code2;
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon size={12} style={{ color: meta.color }} />
                        <span>{meta.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button onClick={handleRun} disabled={running}>
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Editor + config */}
          <div className="lg:col-span-2 space-y-4">
            {/* Examples */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-2">
                  <Code2 size={12} /> Örnekler
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1">
                  {SANDBOX_EXAMPLES[language].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExample(idx)}
                      className="text-xs px-2 py-1 bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded text-gray-300"
                    >
                      Örnek {idx + 1}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Code editor */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs">Kod</CardTitle>
                  <Badge variant="outline" className="text-[10px]">
                    {LANGUAGE_META[language].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={16}
                  className="font-mono text-xs bg-[#1e1e1e] border-border resize-none"
                  placeholder="Kodunuzu buraya yazın..."
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === 'Enter') {
                      e.preventDefault();
                      handleRun();
                    }
                  }}
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Ctrl+Enter ile çalıştır
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right: Config + Output */}
          <div className="space-y-4">
            {/* Config */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-2">
                  <Cpu size={12} /> Yapılandırma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs flex items-center gap-1">
                    <Clock size={10} /> Timeout: {timeout}ms
                  </Label>
                  <input
                    type="range"
                    min={1000}
                    max={30000}
                    step={1000}
                    value={timeout}
                    onChange={(e) => setTimeout(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-xs flex items-center gap-1">
                    <Cpu size={10} /> Bellek: {memoryLimit} MB
                  </Label>
                  <input
                    type="range"
                    min={32}
                    max={512}
                    step={32}
                    value={memoryLimit}
                    onChange={(e) => setMemoryLimit(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <Separator />
                <div className="text-xs space-y-1 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={10} className="text-green-400" />
                    Filesystem izole
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={10} className="text-green-400" />
                    Network kapalı
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={10} className="text-green-400" />
                    Native module yasak
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={10} className="text-green-400" />
                    Memory & CPU limitli
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Output */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs">Çıktı</CardTitle>
                  {result && (
                    <Badge
                      variant={result.exitCode === 0 ? 'default' : 'destructive'}
                      className="text-[10px]"
                    >
                      Exit: {result.exitCode}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {running ? (
                  <div className="flex items-center justify-center py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="text-blue-400" size={24} />
                    </motion.div>
                  </div>
                ) : result ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {result.duration}ms
                      </span>
                      {result.memoryUsed && (
                        <span className="flex items-center gap-1">
                          <Cpu size={10} /> {(result.memoryUsed / 1024).toFixed(0)} KB
                        </span>
                      )}
                    </div>
                    {result.stdout && (
                      <div>
                        <Label className="text-[10px] text-green-400">stdout</Label>
                        <pre className="bg-[#0a1f0a] border border-green-500/20 p-2 rounded text-[10px] font-mono whitespace-pre-wrap max-h-60 overflow-auto text-green-300">
                          {result.stdout}
                        </pre>
                      </div>
                    )}
                    {result.stderr && (
                      <div>
                        <Label className="text-[10px] text-red-400">stderr</Label>
                        <pre className="bg-[#1f0a0a] border border-red-500/20 p-2 rounded text-[10px] font-mono whitespace-pre-wrap max-h-60 overflow-auto text-red-300">
                          {result.stderr}
                        </pre>
                      </div>
                    )}
                    {result.output && language === 'html' && (
                      <div>
                        <Label className="text-[10px] text-blue-400">HTML Render</Label>
                        <iframe
                          srcDoc={result.output}
                          className="w-full h-48 bg-white rounded border border-border"
                          sandbox="allow-scripts"
                          title="render"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-xs">
                    <Terminal size={32} className="mb-2 opacity-30" />
                    Çalıştırma bekleniyor
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
