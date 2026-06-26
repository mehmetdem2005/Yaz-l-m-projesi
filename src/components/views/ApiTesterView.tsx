'use client';

import { useEffect, useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Globe,
  Play,
  Loader2,
  Save,
  Trash2,
  Plus,
  Copy,
  Check,
  Clock,
  ArrowRight,
  Send,
  Code2,
  FileJson,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface ApiRequest {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers: Array<{ key: string; value: string; enabled: boolean }>;
  params: Array<{ key: string; value: string; enabled: boolean }>;
  body: string;
  bodyType: 'json' | 'text' | 'form' | 'none';
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  duration: number;
  size: number;
}

const STORAGE_KEY = 'api_tester_requests';

const DEFAULT_REQUEST: ApiRequest = {
  id: 'default',
  name: 'Yeni İstek',
  method: 'GET',
  url: 'https://api.deepseek.com/v1/models',
  headers: [
    { key: 'Authorization', value: 'Bearer YOUR_API_KEY', enabled: true },
    { key: 'Content-Type', value: 'application/json', enabled: true },
  ],
  params: [],
  body: '',
  bodyType: 'none',
};

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-green-400 border-green-500/30',
  POST: 'text-yellow-400 border-yellow-500/30',
  PUT: 'text-blue-400 border-blue-500/30',
  DELETE: 'text-red-400 border-red-500/30',
  PATCH: 'text-purple-400 border-purple-500/30',
  HEAD: 'text-gray-400 border-gray-500/30',
  OPTIONS: 'text-gray-400 border-gray-500/30',
};

export function ApiTesterView() {
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'response'>('params');

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRequests(parsed);
        if (parsed.length > 0) setActiveId(parsed[0].id);
      } else {
        const initial = [{ ...DEFAULT_REQUEST, id: 'req_1' }];
        setRequests(initial);
        setActiveId('req_1');
      }
    } catch {
      const initial = [{ ...DEFAULT_REQUEST, id: 'req_1' }];
      setRequests(initial);
      setActiveId('req_1');
    }
  }, []);

  const save = (reqs: ApiRequest[]) => {
    setRequests(reqs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reqs));
    } catch {}
  };

  const activeRequest = requests.find((r) => r.id === activeId) || null;

  const updateRequest = (updates: Partial<ApiRequest>) => {
    if (!activeRequest) return;
    save(requests.map((r) => (r.id === activeRequest.id ? { ...r, ...updates } : r)));
  };

  const newRequest = () => {
    const id = `req_${Date.now()}`;
    const newReq: ApiRequest = {
      ...DEFAULT_REQUEST,
      id,
      name: `İstek ${requests.length + 1}`,
      url: '',
    };
    save([...requests, newReq]);
    setActiveId(id);
  };

  const deleteRequest = (id: string) => {
    if (!confirm('Bu istek silinsin mi?')) return;
    const filtered = requests.filter((r) => r.id !== id);
    save(filtered);
    if (activeId === id) setActiveId(filtered[0]?.id || null);
  };

  const duplicateRequest = (id: string) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    const newId = `req_${Date.now()}`;
    save([...requests, { ...req, id: newId, name: `${req.name} (kopya)` }]);
    setActiveId(newId);
  };

  const sendRequest = async () => {
    if (!activeRequest) return;
    setLoading(true);
    setResponse(null);
    setActiveTab('response');

    const startTime = Date.now();
    try {
      // Build URL with params
      const url = new URL(activeRequest.url);
      activeRequest.params.filter((p) => p.enabled && p.key).forEach((p) => {
        url.searchParams.append(p.key, p.value);
      });

      // Build headers
      const headers: Record<string, string> = {};
      activeRequest.headers.filter((h) => h.enabled && h.key).forEach((h) => {
        headers[h.key] = h.value;
      });

      // Body
      let body: BodyInit | undefined;
      if (activeRequest.method !== 'GET' && activeRequest.method !== 'HEAD') {
        if (activeRequest.bodyType === 'json') {
          headers['Content-Type'] = headers['Content-Type'] || 'application/json';
          body = activeRequest.body;
        } else if (activeRequest.bodyType === 'text') {
          headers['Content-Type'] = headers['Content-Type'] || 'text/plain';
          body = activeRequest.body;
        } else if (activeRequest.bodyType === 'form') {
          body = activeRequest.body; // assume URL-encoded
        }
      }

      const res = await fetch(url.toString(), {
        method: activeRequest.method,
        headers,
        body,
      });

      const text = await res.text();
      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: text,
        duration: Date.now() - startTime,
        size: new Blob([text]).size,
      });
    } catch (err) {
      setResponse({
        status: 0,
        statusText: 'Network Error',
        headers: {},
        body: (err as Error).message,
        duration: Date.now() - startTime,
        size: 0,
      });
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex overflow-auto bg-background">
      {/* Sidebar: Request list */}
      <aside className="w-56 border-r border-border flex flex-col bg-[#252526] flex-shrink-0">
        <div className="p-2 border-b border-border flex items-center justify-between">
          <span className="text-xs font-semibold uppercase text-muted-foreground">
            İstekler
          </span>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={newRequest}>
            <Plus size={12} />
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-1">
          {requests.map((req) => {
            const isActive = req.id === activeId;
            return (
              <div
                key={req.id}
                onClick={() => setActiveId(req.id)}
                className={`group flex items-center gap-2 px-2 py-1.5 cursor-pointer text-sm ${
                  isActive ? 'bg-blue-500/20 text-white' : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <Badge
                  variant="outline"
                  className={`text-[9px] px-1 py-0 ${METHOD_COLORS[req.method]}`}
                >
                  {req.method}
                </Badge>
                <span className="flex-1 truncate text-xs">{req.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRequest(req.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 hover:text-red-400 rounded"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            );
          })}
          {requests.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-4">
              Henüz istek yok
            </div>
          )}
        </div>
      </aside>

      {/* Main: Request editor + response */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeRequest ? (
          <>
            {/* URL bar */}
            <div className="border-b border-border p-3 flex items-center gap-2">
              <Select
                value={activeRequest.method}
                onValueChange={(v) => updateRequest({ method: v as ApiRequest['method'] })}
              >
                <SelectTrigger className="w-28 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map((m) => (
                    <SelectItem key={m} value={m} className="text-xs">
                      <span className={METHOD_COLORS[m].split(' ')[0]}>{m}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={activeRequest.url}
                onChange={(e) => updateRequest({ url: e.target.value })}
                placeholder="https://api.example.com/endpoint"
                className="flex-1 h-9 text-xs font-mono"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendRequest();
                }}
              />
              <Button onClick={sendRequest} disabled={loading} className="h-9">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span className="ml-1 hidden sm:inline">Gönder</span>
              </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
              <TabsList className="border-b border-border rounded-none bg-transparent h-9">
                <TabsTrigger value="params" className="text-xs rounded-none">
                  Params {activeRequest.params.length > 0 && `(${activeRequest.params.length})`}
                </TabsTrigger>
                <TabsTrigger value="headers" className="text-xs rounded-none">
                  Headers {activeRequest.headers.length > 0 && `(${activeRequest.headers.length})`}
                </TabsTrigger>
                <TabsTrigger value="body" className="text-xs rounded-none">
                  Body
                </TabsTrigger>
                <TabsTrigger value="response" className="text-xs rounded-none">
                  Response {response && (
                    <Badge
                      variant={response.status >= 200 && response.status < 300 ? 'default' : 'destructive'}
                      className="ml-1 text-[9px]"
                    >
                      {response.status}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Params */}
              <TabsContent value="params" className="flex-1 overflow-auto mt-0 p-3">
                <KeyValueEditor
                  items={activeRequest.params}
                  onChange={(params) => updateRequest({ params })}
                />
              </TabsContent>

              {/* Headers */}
              <TabsContent value="headers" className="flex-1 overflow-auto mt-0 p-3">
                <KeyValueEditor
                  items={activeRequest.headers}
                  onChange={(headers) => updateRequest({ headers })}
                />
              </TabsContent>

              {/* Body */}
              <TabsContent value="body" className="flex-1 overflow-auto mt-0 p-3 space-y-2">
                <Select
                  value={activeRequest.bodyType}
                  onValueChange={(v) => updateRequest({ bodyType: v as ApiRequest['bodyType'] })}
                >
                  <SelectTrigger className="w-40 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs">none</SelectItem>
                    <SelectItem value="json" className="text-xs">application/json</SelectItem>
                    <SelectItem value="text" className="text-xs">text/plain</SelectItem>
                    <SelectItem value="form" className="text-xs">form-data</SelectItem>
                  </SelectContent>
                </Select>
                {activeRequest.bodyType !== 'none' && (
                  <Textarea
                    value={activeRequest.body}
                    onChange={(e) => updateRequest({ body: e.target.value })}
                    rows={15}
                    className="font-mono text-xs bg-[#1e1e1e]"
                    placeholder={activeRequest.bodyType === 'json' ? '{\n  "key": "value"\n}' : 'Body içeriği...'}
                  />
                )}
              </TabsContent>

              {/* Response */}
              <TabsContent value="response" className="flex-1 overflow-auto mt-0 p-3">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-blue-400" size={24} />
                  </div>
                ) : response ? (
                  <div className="space-y-3">
                    {/* Status line */}
                    <div className="flex items-center gap-3 text-xs">
                      <Badge
                        variant={response.status >= 200 && response.status < 300 ? 'default' : 'destructive'}
                      >
                        {response.status} {response.statusText}
                      </Badge>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock size={10} /> {response.duration}ms
                      </span>
                      <span className="text-muted-foreground">
                        {(response.size / 1024).toFixed(2)} KB
                      </span>
                    </div>

                    {/* Response body */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-xs">Body</Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(response.body);
                            toast.success('Kopyalandı');
                          }}
                        >
                          <Copy size={10} className="mr-1" /> Kopyala
                        </Button>
                      </div>
                      <pre className="bg-[#1e1e1e] border border-border p-3 rounded text-xs font-mono whitespace-pre-wrap max-h-96 overflow-auto">
                        {formatJson(response.body)}
                      </pre>
                    </div>

                    {/* Response headers */}
                    <div>
                      <Label className="text-xs mb-1 block">Headers</Label>
                      <div className="bg-[#1e1e1e] border border-border p-2 rounded text-[10px] font-mono space-y-1 max-h-48 overflow-auto">
                        {Object.entries(response.headers).map(([k, v]) => (
                          <div key={k} className="flex">
                            <span className="text-blue-400 flex-shrink-0">{k}:</span>
                            <span className="text-gray-300 ml-2 break-all">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Globe size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">İstek göndermek için "Gönder" butonuna bas</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Globe size={48} className="mx-auto mb-3 opacity-30" />
              <p>Yeni istek oluşturmak için + butonuna bas</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function KeyValueEditor({
  items,
  onChange,
}: {
  items: Array<{ key: string; value: string; enabled: boolean }>;
  onChange: (items: Array<{ key: string; value: string; enabled: boolean }>) => void;
}) {
  const addItem = () => {
    onChange([...items, { key: '', value: '', enabled: true }]);
  };

  const updateItem = (idx: number, updates: Partial<{ key: string; value: string; enabled: boolean }>) => {
    onChange(items.map((it, i) => (i === idx ? { ...it, ...updates } : it)));
  };

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-1">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={item.enabled}
            onChange={(e) => updateItem(idx, { enabled: e.target.checked })}
            className="w-3 h-3"
          />
          <Input
            value={item.key}
            onChange={(e) => updateItem(idx, { key: e.target.value })}
            placeholder="key"
            className="flex-1 h-8 text-xs font-mono"
          />
          <Input
            value={item.value}
            onChange={(e) => updateItem(idx, { value: e.target.value })}
            placeholder="value"
            className="flex-1 h-8 text-xs font-mono"
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400"
            onClick={() => removeItem(idx)}
          >
            <Trash2 size={12} />
          </Button>
        </div>
      ))}
      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addItem}>
        <Plus size={12} className="mr-1" /> Ekle
      </Button>
    </div>
  );
}

function formatJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}
