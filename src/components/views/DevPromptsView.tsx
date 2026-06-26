'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Network,
  Code2,
  Bug,
  RefreshCw,
  FlaskConical,
  FileText,
  Shield,
  Zap,
  GitBranch,
  Search,
  Copy,
  Play,
  Sparkles,
  Check,
  ChevronRight,
} from 'lucide-react';
import {
  DEV_PROMPTS,
  PROMPT_CATEGORIES,
  getPromptsByCategory,
  fillPromptTemplate,
  buildFullPrompt,
  type DevPrompt,
} from '@/lib/dev-prompts';
import { DEEPSEEK_MODELS } from '@/lib/deepseek';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Building2, Network, Code2, Bug, RefreshCw, FlaskConical, FileText, Shield, Zap, GitBranch,
};

export function DevPromptsView() {
  const [selected, setSelected] = useState<DevPrompt | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const filtered = DEV_PROMPTS.filter((p) => {
    if (filter !== 'all' && p.category !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 overflow-auto bg-background pb-20 md:pb-0">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="text-purple-400" /> Dev Prompt Kütüphanesi
          </h1>
          <p className="text-sm text-muted-foreground">
            10 tür gelişmiş prompt şablonu — kurumsal, mimari, kod, debug, refactor, test, dokümantasyon, güvenlik, performans, devops
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Prompt ara (isim, açıklama, etiket)..."
            className="pl-9"
          />
        </div>

        {/* Categories */}
        <Tabs value={filter} onValueChange={setFilter} className="mb-4">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all" className="text-xs">Tümü ({DEV_PROMPTS.length})</TabsTrigger>
            {PROMPT_CATEGORIES.map((c) => {
              const count = getPromptsByCategory(c.id).length;
              return (
                <TabsTrigger key={c.id} value={c.id} className="text-xs">
                  {c.label} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Prompt cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((prompt, i) => {
            const cat = PROMPT_CATEGORIES.find((c) => c.id === prompt.category);
            const Icon = ICONS[prompt.icon] || Sparkles;
            return (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="bg-card border-border hover:border-purple-500/50 transition-colors cursor-pointer group h-full flex flex-col"
                  onClick={() => setSelected(prompt)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${cat?.color}20` }}
                      >
                        <Icon size={20} style={{ color: cat?.color }} />
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                    <CardTitle className="text-base mt-2">{prompt.name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {prompt.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {prompt.tags.slice(0, 3).map((t) => (
                        <Badge key={t} variant="outline" className="text-[9px]">{t}</Badge>
                      ))}
                    </div>
                    <div className="mt-auto space-y-1 text-[10px] text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Model: <strong className="text-foreground">{prompt.recommendedModel.split('-').slice(-1)[0]}</strong></span>
                        <span>~{prompt.estimatedTokens} tok</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Değişken: <strong className="text-foreground">{prompt.variables.length}</strong></span>
                        <span>{prompt.qualityCriteria.length} kriter</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Prompt detail dialog */}
        {selected && (
          <PromptDetailDialog
            key={selected.id}
            prompt={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}

function PromptDetailDialog({ prompt, onClose }: { prompt: DevPrompt; onClose: () => void }) {
  const setView = useStore((s) => s.setView);
  const [variables, setVariables] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    prompt.variables.forEach((v) => {
      initial[v.key] = v.defaultValue || '';
    });
    return initial;
  });
  const [filledPrompt, setFilledPrompt] = useState<{ system: string; user: string } | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (!prompt) return null;

  const cat = PROMPT_CATEGORIES.find((c) => c.id === prompt.category);
  const Icon = ICONS[prompt.icon] || Sparkles;

  const handleGenerate = () => {
    // Validate required
    for (const v of prompt.variables) {
      if (v.required && !variables[v.key]) {
        toast.error(`${v.label} gerekli`);
        return;
      }
    }
    const full = buildFullPrompt(prompt, variables);
    setFilledPrompt(full);
    setShowResult(true);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Kopyalandı');
  };

  const handleUseInChat = () => {
    if (!filledPrompt) return;
    // Editor'daki chat'e enjekte et
    useStore.setState({
      activeView: 'editor',
    });
    // Custom event ile chat'e yolla
    window.dispatchEvent(
      new CustomEvent('ide:inject-prompt', {
        detail: filledPrompt,
      })
    );
    toast.success('Prompt editöre gönderildi');
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${cat?.color}20` }}
            >
              <Icon size={24} style={{ color: cat?.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px]">{cat?.label}</Badge>
                <Badge variant="secondary" className="text-[10px]">
                  Önerilen: {DEEPSEEK_MODELS.find((m) => m.id === prompt.recommendedModel)?.name || prompt.recommendedModel}
                </Badge>
              </div>
              <DialogTitle className="text-lg">{prompt.name}</DialogTitle>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{prompt.description}</p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!showResult ? (
            <>
              {/* Variables */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Sparkles size={14} className="text-purple-400" /> Değişkenler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {prompt.variables.map((v) => (
                    <div key={v.key} className="space-y-1">
                      <Label className="text-xs flex items-center gap-1">
                        {v.label}
                        {v.required && <span className="text-red-400">*</span>}
                      </Label>
                      {v.type === 'textarea' ? (
                        <Textarea
                          value={variables[v.key] || ''}
                          onChange={(e) => setVariables({ ...variables, [v.key]: e.target.value })}
                          placeholder={v.placeholder}
                          rows={3}
                          className="text-xs"
                        />
                      ) : v.type === 'select' ? (
                        <Select
                          value={variables[v.key]}
                          onValueChange={(val) => setVariables({ ...variables, [v.key]: val })}
                        >
                          <SelectTrigger className="text-xs">
                            <SelectValue placeholder={v.placeholder || 'Seçin'} />
                          </SelectTrigger>
                          <SelectContent>
                            {v.options?.map((opt) => (
                              <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : v.type === 'number' ? (
                        <Input
                          type="number"
                          value={variables[v.key] || ''}
                          onChange={(e) => setVariables({ ...variables, [v.key]: e.target.value })}
                          placeholder={v.placeholder}
                          className="text-xs"
                        />
                      ) : (
                        <Input
                          value={variables[v.key] || ''}
                          onChange={(e) => setVariables({ ...variables, [v.key]: e.target.value })}
                          placeholder={v.placeholder}
                          className="text-xs"
                        />
                      )}
                      {v.description && (
                        <p className="text-[10px] text-muted-foreground">{v.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality criteria */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Check size={14} className="text-green-400" /> Kalite Kriterleri
                </h3>
                <ul className="text-xs space-y-1">
                  {prompt.qualityCriteria.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check size={10} className="text-green-400 mt-1" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button onClick={handleGenerate} className="w-full">
                <Sparkles size={14} className="mr-2" /> Promptu Oluştur
              </Button>
            </>
          ) : (
            <>
              {/* Generated prompt */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold">System Prompt</h3>
                  <Button size="sm" variant="ghost" onClick={() => handleCopy(filledPrompt!.system)}>
                    <Copy size={12} className="mr-1" /> Kopyala
                  </Button>
                </div>
                <pre className="bg-[#1e1e1e] border border-border p-3 rounded text-xs font-mono whitespace-pre-wrap max-h-60 overflow-auto">
                  {filledPrompt!.system}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold">User Prompt</h3>
                  <Button size="sm" variant="ghost" onClick={() => handleCopy(filledPrompt!.user)}>
                    <Copy size={12} className="mr-1" /> Kopyala
                  </Button>
                </div>
                <pre className="bg-[#1e1e1e] border border-border p-3 rounded text-xs font-mono whitespace-pre-wrap max-h-60 overflow-auto">
                  {filledPrompt!.user}
                </pre>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowResult(false)}>
                  Geri Düzenle
                </Button>
                <Button className="flex-1" onClick={handleUseInChat}>
                  <Play size={12} className="mr-2" /> Editörde Çalıştır
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
