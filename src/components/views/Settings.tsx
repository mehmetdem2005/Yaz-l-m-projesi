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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Key,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Cpu,
  Settings as SettingsIcon,
  Palette,
} from 'lucide-react';
import { DEEPSEEK_MODELS } from '@/lib/deepseek';
import { toast } from 'sonner';

export function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [currentKeyMasked, setCurrentKeyMasked] = useState<string | null>(null);
  const [defaultModel, setDefaultModel] = useState('deepseek-reasoner');
  const [defaultStandard, setDefaultStandard] = useState('');
  const setApiKeysSet = useStore((s) => s.setApiKeysSet);
  const setDeepseekModel = useStore((s) => s.setDeepseekModel);

  useEffect(() => {
    fetch('/api/settings?key=deepseek_api_key')
      .then((r) => r.json())
      .then((d) => {
        if (d.isSet) {
          setCurrentKeyMasked(d.value);
          setApiKeysSet(true);
        }
      });
    fetch('/api/settings?key=default_model')
      .then((r) => r.json())
      .then((d) => {
        if (d.value) setDefaultModel(d.value);
      });
    fetch('/api/settings?key=default_standard')
      .then((r) => r.json())
      .then((d) => {
        if (d.value) setDefaultStandard(d.value);
      });
  }, [setApiKeysSet]);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      toast.error('API key girin');
      return;
    }
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'deepseek_api_key', value: apiKey }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success('API key kaydedildi');
      setCurrentKeyMasked(data.masked);
      setApiKeysSet(true);
      setApiKey('');
    } else {
      toast.error(data.error || 'Hata');
    }
  };

  const handleDeleteKey = async () => {
    if (!confirm('API key silinsin mi?')) return;
    await fetch('/api/settings?key=deepseek_api_key', { method: 'DELETE' });
    setCurrentKeyMasked(null);
    setApiKeysSet(false);
    toast.success('API key silindi');
  };

  const handleSaveModel = async () => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'default_model', value: defaultModel }),
    });
    setDeepseekModel(defaultModel);
    toast.success('Varsayılan model kaydedildi');
  };

  const handleSaveStandard = async () => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'default_standard', value: defaultStandard }),
    });
    toast.success('Varsayılan standart kaydedildi');
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <SettingsIcon /> Ayarlar
          </h1>
          <p className="text-sm text-muted-foreground">
            DeepSeek API key, varsayılan model ve standart yapılandırması
          </p>
        </div>

        {/* API Key */}
        <Card className="mb-4 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Key size={16} /> DeepSeek API Key
            </CardTitle>
            <CardDescription>
              deepseek.com/platform/api_keys adresinden alabilirsiniz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentKeyMasked && (
              <div className="flex items-center justify-between p-3 bg-[#1e1e1e] rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-green-400" />
                  <span className="text-xs font-mono">{currentKeyMasked}</span>
                </div>
                <Button size="sm" variant="ghost" onClick={handleDeleteKey}>
                  <Trash2 size={12} />
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-10 font-mono text-xs"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <Button onClick={handleSaveKey}>
                <Save size={14} className="mr-1" /> Kaydet
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Key server-side&apos;da DB&apos;de saklanır. İstemciye gönderilmez.
            </p>
          </CardContent>
        </Card>

        {/* Default Model */}
        <Card className="mb-4 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Cpu size={16} /> Varsayılan Model
            </CardTitle>
            <CardDescription>
              Yeni sohbetlerde varsayılan olarak kullanılacak model
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={defaultModel} onValueChange={setDefaultModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEEPSEEK_MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{m.name}</span>
                      <Badge variant="outline" className="ml-2 text-[9px]">
                        {m.maturity}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSaveModel} variant="outline">
              <Save size={14} className="mr-1" /> Kaydet
            </Button>
          </CardContent>
        </Card>

        {/* Model Comparison Table */}
        <Card className="mb-4 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Model Karşılaştırma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left border-b border-border">
                    <th className="py-2 pr-4">Model</th>
                    <th className="py-2 pr-4">Context</th>
                    <th className="py-2 pr-4">Max Out</th>
                    <th className="py-2 pr-4">Input $/1M</th>
                    <th className="py-2 pr-4">Output $/1M</th>
                    <th className="py-2 pr-4">Tools</th>
                    <th className="py-2 pr-4">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {DEEPSEEK_MODELS.map((m) => (
                    <tr key={m.id} className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">{m.name}</td>
                      <td className="py-2 pr-4 font-mono">
                        {(m.contextWindow / 1000).toFixed(0)}K
                      </td>
                      <td className="py-2 pr-4 font-mono">
                        {(m.maxOutput / 1000).toFixed(0)}K
                      </td>
                      <td className="py-2 pr-4 font-mono">${m.inputPricePer1M}</td>
                      <td className="py-2 pr-4 font-mono">${m.outputPricePer1M}</td>
                      <td className="py-2 pr-4">
                        {m.supportsFunctionCalling ? (
                          <CheckCircle2 size={12} className="text-green-400" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        <Badge
                          variant={
                            m.maturity === 'stable'
                              ? 'default'
                              : m.maturity === 'beta'
                              ? 'secondary'
                              : 'outline'
                          }
                          className="text-[10px]"
                        >
                          {m.maturity}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Default Standard */}
        <Card className="mb-4 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette size={16} /> Varsayılan Kurumsal Standart
            </CardTitle>
            <CardDescription>
              Yeni projelerde varsayılan olarak uygulanacak standart
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={defaultStandard}
              onChange={(e) => setDefaultStandard(e.target.value)}
              placeholder="örn: iso-27001, togaf, soc2"
              className="text-xs"
            />
            <Button onClick={handleSaveStandard} variant="outline">
              <Save size={14} className="mr-1" /> Kaydet
            </Button>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        <div className="text-xs text-muted-foreground">
          <AlertCircle size={12} className="inline mr-1" />
          Tüm ayarlar yerel SQLite veritabanında saklanır. API key hiçbir zaman istemciye
          açık metin olarak gönderilmez.
        </div>
      </div>
    </div>
  );
}
