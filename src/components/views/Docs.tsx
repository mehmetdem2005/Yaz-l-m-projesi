'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Copy, ExternalLink, Code2, Book } from 'lucide-react';
import { DEEPSEEK_MODELS } from '@/lib/deepseek';
import { toast } from 'sonner';

export function Docs() {
  const [activeExample, setActiveExample] = useState('chat');

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Kod kopyalandı');
  };

  const examples: Record<string, { title: string; code: string; description: string }> = {
    chat: {
      title: 'Basit Sohbet Tamamlama',
      description: 'Tek seferlik completion isteği',
      code: `// TypeScript
const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY',
  },
  body: JSON.stringify({
    model: 'deepseek-reasoner',
    messages: [
      { role: 'system', content: 'Sen bir yardımcı asistanın.' },
      { role: 'user', content: 'Bir SaaS dashboard nasıl tasarlanır?' }
    ],
    temperature: 0.4,
    max_tokens: 2000,
  }),
});

const data = await res.json();
console.log(data.choices[0].message.content);`,
    },
    stream: {
      title: 'Streaming (SSE)',
      description: 'Token token yanıt akışı',
      code: `// TypeScript — Streaming
const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY',
  },
  body: JSON.stringify({
    model: 'deepseek-v4-pro',
    messages: [{ role: 'user', content: 'Bir kod örneği yaz' }],
    stream: true,
  }),
});

const reader = res.body!.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = decoder.decode(value);
  // SSE format: data: {...}\\n\\n
  text.split('\\n').forEach(line => {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') return;
      const parsed = JSON.parse(data);
      const delta = parsed.choices[0]?.delta?.content || '';
      process.stdout.write(delta);
    }
  });
}`,
    },
    function_calling: {
      title: 'Function Calling',
      description: 'AI tool çağırma (function calling)',
      code: `// TypeScript — Function Calling
const tools = [{
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Belirli bir şehrin hava durumunu getir',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'Şehir adı' }
      },
      required: ['city']
    }
  }
}];

const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY',
  },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: 'İstanbul hava durumu?' }],
    tools,
    tool_choice: 'auto',
  }),
});

const data = await res.json();
const toolCall = data.choices[0].message.tool_calls[0];
console.log('Çağrılan fonksiyon:', toolCall.function.name);
console.log('Argümanlar:', toolCall.function.arguments);`,
    },
    multi_turn: {
      title: 'Çok Turlu Sohbet',
      description: 'Geçmiş bağlamıyla devam eden sohbet',
      code: `// TypeScript — Multi-turn
const messages = [
  { role: 'system', content: 'Sen bir kod asistanısın.' },
  { role: 'user', content: 'TypeScript\\'te bir debounce fonksiyonu yaz' },
  { role: 'assistant', content: 'function debounce<T>(fn: T, delay: number) {...}' },
  { role: 'user', content: 'Buna cancel metodu ekle' }
];

const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY',
  },
  body: JSON.stringify({
    model: 'deepseek-v4-flash',
    messages,
    temperature: 0.3,
  }),
});`,
    },
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Book /> DeepSeek API Dokümantasyonu
          </h1>
          <p className="text-sm text-muted-foreground">
            Model kataloğu, API referansı ve kod örnekleri
          </p>
        </div>

        {/* API Overview */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">API Genel Bakış</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Base URL</p>
                <code className="text-xs bg-[#1e1e1e] p-2 rounded block">
                  https://api.deepseek.com/v1
                </code>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Auth</p>
                <code className="text-xs bg-[#1e1e1e] p-2 rounded block">
                  Bearer YOUR_API_KEY
                </code>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Format</p>
                <code className="text-xs bg-[#1e1e1e] p-2 rounded block">
                  OpenAI-compatible JSON
                </code>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Protocol</p>
                <code className="text-xs bg-[#1e1e1e] p-2 rounded block">
                  HTTPS / SSE (streaming)
                </code>
              </div>
            </div>
            <a
              href="https://api-docs.deepseek.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-400 hover:underline mt-2"
            >
              Resmi dokümantasyon <ExternalLink size={12} />
            </a>
          </CardContent>
        </Card>

        {/* Model Catalog */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Model Kataloğu</CardTitle>
            <CardDescription>Stüdyoda desteklenen tüm modeller</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {DEEPSEEK_MODELS.map((m) => (
                <div key={m.id} className="border-l-2 border-blue-500/50 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{m.name}</h4>
                    <Badge variant="outline" className="text-[10px]">{m.maturity}</Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {(m.contextWindow / 1000).toFixed(0)}K ctx
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      ${m.inputPricePer1M}/${m.outputPricePer1M} per 1M
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{m.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {m.bestFor.map((b) => (
                      <Badge key={b} variant="outline" className="text-[9px]">
                        {b}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-2 text-[10px] text-muted-foreground font-mono">
                    model: &apos;{m.id}&apos;
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Code Examples */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Code2 size={16} /> Kod Örnekleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeExample} onValueChange={setActiveExample}>
              <TabsList className="flex-wrap h-auto mb-4">
                {Object.entries(examples).map(([key, ex]) => (
                  <TabsTrigger key={key} value={key} className="text-xs">
                    {ex.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(examples).map(([key, ex]) => (
                <TabsContent key={key} value={key}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{ex.description}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyCode(ex.code)}
                    >
                      <Copy size={12} className="mr-1" /> Kopyala
                    </Button>
                  </div>
                  <pre className="bg-[#1e1e1e] border border-border p-4 rounded text-xs font-mono overflow-auto">
                    {ex.code}
                  </pre>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">Rate Limits</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="flex justify-between">
                <span>Tier 1 RPM</span>
                <span className="font-mono">60</span>
              </div>
              <div className="flex justify-between">
                <span>Tier 1 TPM</span>
                <span className="font-mono">10,000</span>
              </div>
              <div className="flex justify-between">
                <span>Tier 2 RPM</span>
                <span className="font-mono">500</span>
              </div>
              <div className="flex justify-between">
                <span>Tier 2 TPM</span>
                <span className="font-mono">500,000</span>
              </div>
              <div className="flex justify-between">
                <span>Tier 3 RPM</span>
                <span className="font-mono">5,000</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">Hata Kodları</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="font-mono">400</span>
                <span>Bad Request — Geçersiz parametre</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono">401</span>
                <span>Unauthorized — API key geçersiz</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono">402</span>
                <span>Insufficient Balance</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono">422</span>
                <span>Validation Error</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono">429</span>
                <span>Rate Limit Exceeded</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono">500</span>
                <span>Server Error</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
