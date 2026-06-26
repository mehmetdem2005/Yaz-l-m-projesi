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
  Database,
  Table,
  RefreshCw,
  Trash2,
  Eye,
  Search,
  Loader2,
  ChevronDown,
  ChevronRight,
  Key,
  Link2,
  Play,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface ModelSchema {
  name: string;
  fields: Array<{
    name: string;
    type: string;
    isId: boolean;
    isUnique: boolean;
    isRequired: boolean;
    isRelation: boolean;
  }>;
}

interface Record {
  [key: string]: unknown;
}

export function DatabaseExplorerView() {
  const [models, setModels] = useState<ModelSchema[]>([]);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set());
  const [sqlEditor, setSqlEditor] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('// Prisma query\nawait db.project.findMany({\n  take: 10,\n  orderBy: { createdAt: "desc" }\n});');

  useEffect(() => {
    fetch('/api/db/schema')
      .then((r) => r.json())
      .then((d) => {
        setModels(d.models || []);
        if (d.models?.length > 0) {
          setActiveModel(d.models[0].name);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeModel) loadRecords();
  }, [activeModel, page]);

  const loadRecords = async () => {
    if (!activeModel) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/db/query?model=${activeModel}&take=${pageSize}&skip=${page * pageSize}`
      );
      const d = await res.json();
      setRecords(d.data || []);
      setCount(d.count || 0);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!activeModel) return;
    if (!confirm(`${activeModel} kaydını silmek istediğinize emin misiniz? (ID: ${id})`)) return;
    try {
      await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: activeModel,
          operation: 'delete',
          args: { where: { id } },
        }),
      });
      toast.success('Silindi');
      loadRecords();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const toggleModel = (name: string) => {
    setExpandedModels((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleRow = (idx: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(records, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeModel?.toLowerCase()}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Dışa aktarıldı');
  };

  const activeSchema = models.find((m) => m.name === activeModel);
  const filteredRecords = search
    ? records.filter((r) =>
        JSON.stringify(r).toLowerCase().includes(search.toLowerCase())
      )
    : records;

  return (
    <div className="flex-1 flex overflow-hidden bg-background">
      {/* Sidebar: Models */}
      <aside className="w-64 border-r border-border flex flex-col bg-[#252526] flex-shrink-0">
        <div className="p-3 border-b border-border">
          <h2 className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
            <Database size={14} /> Modeller
          </h2>
          <p className="text-[10px] text-muted-foreground mt-1">
            {models.length} model
          </p>
        </div>
        <div className="flex-1 overflow-auto py-1">
          {models.map((model) => {
            const isActive = activeModel === model.name;
            const isExpanded = expandedModels.has(model.name);
            return (
              <div key={model.name}>
                <div
                  className={`flex items-center gap-1 px-2 py-1.5 cursor-pointer hover:bg-white/5 text-sm ${
                    isActive ? 'bg-blue-500/20 text-white' : 'text-gray-400'
                  }`}
                  onClick={() => {
                    setActiveModel(model.name);
                    setPage(0);
                    toggleModel(model.name);
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown size={12} className="text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronRight size={12} className="text-muted-foreground flex-shrink-0" />
                  )}
                  <Table size={12} className="text-blue-400 flex-shrink-0" />
                  <span className="flex-1 truncate">{model.name}</span>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-6 py-1 space-y-0.5">
                        {model.fields.map((f) => (
                          <div
                            key={f.name}
                            className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300"
                          >
                            {f.isId && <Key size={8} className="text-yellow-400" />}
                            {f.isRelation && <Link2 size={8} className="text-purple-400" />}
                            {!f.isId && !f.isRelation && (
                              <span className="w-2 h-2 rounded-full bg-gray-600 inline-block" />
                            )}
                            <span className="flex-1 truncate font-mono">{f.name}</span>
                            <span className="text-[9px] text-gray-600">{f.type}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main: Records */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-border p-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Table size={16} className="text-blue-400" />
            <span className="font-semibold">{activeModel}</span>
            <Badge variant="secondary" className="text-[10px]">
              {count} kayıt
            </Badge>
          </div>

          <div className="relative ml-auto">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kayıtlarda ara..."
              className="pl-7 h-8 w-48 text-xs"
            />
          </div>

          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={loadRecords}
            disabled={loading}
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            <span className="ml-1 hidden sm:inline">Yenile</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={exportJson}
            disabled={records.length === 0}
          >
            <Download size={12} />
            <span className="ml-1 hidden sm:inline">JSON</span>
          </Button>
          <Button
            size="sm"
            variant={sqlEditor ? 'default' : 'outline'}
            className="h-8 text-xs"
            onClick={() => setSqlEditor(!sqlEditor)}
          >
            <Play size={12} />
            <span className="ml-1 hidden sm:inline">SQL</span>
          </Button>
        </div>

        {/* SQL Editor (toggle) */}
        <AnimatePresence>
          {sqlEditor && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden border-b border-border bg-[#1e1e1e]"
            >
              <div className="p-3 space-y-2">
                <Label className="text-xs">Prisma Query (JavaScript)</Label>
                <Textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  rows={5}
                  className="font-mono text-xs bg-[#0a0a0a] border-border"
                />
                <Button size="sm" className="h-7 text-xs">
                  <Play size={12} className="mr-1" /> Çalıştır
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Records table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="animate-spin mx-auto text-blue-400" size={24} />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Database size={48} className="mx-auto mb-3 opacity-30" />
              <p>Bu modelde kayıt yok</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[#1a1a1a] border-b border-border">
                <tr>
                  <th className="w-8 py-2 px-2"></th>
                  {activeSchema?.fields.slice(0, 8).map((f) => (
                    <th key={f.name} className="text-left py-2 px-3 font-medium text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {f.isId && <Key size={10} className="text-yellow-400" />}
                        {f.isRelation && <Link2 size={10} className="text-purple-400" />}
                        {f.name}
                        <span className="text-[9px] text-gray-600 font-normal">({f.type})</span>
                      </div>
                    </th>
                  ))}
                  <th className="text-right py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, idx) => {
                  const isExpanded = expandedRows.has(idx);
                  return (
                    <>
                      <tr
                        key={idx}
                        className={`border-b border-border/50 hover:bg-white/5 cursor-pointer ${
                          isExpanded ? 'bg-blue-500/5' : ''
                        }`}
                        onClick={() => toggleRow(idx)}
                      >
                        <td className="py-2 px-2 text-center text-muted-foreground">
                          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </td>
                        {activeSchema?.fields.slice(0, 8).map((f) => (
                          <td key={f.name} className="py-2 px-3 text-gray-300 max-w-[200px] truncate">
                            {formatValue(record[f.name])}
                          </td>
                        ))}
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(record.id as string);
                            }}
                            className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded opacity-0 group-hover:opacity-100"
                            title="Sil"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                      <AnimatePresence>
                        {isExpanded && (
                          <tr key={`${idx}-detail`}>
                            <td colSpan={activeSchema.fields.length + 2} className="p-3 bg-[#1e1e1e] border-b border-border">
                              <pre className="text-[10px] font-mono whitespace-pre-wrap break-all max-h-60 overflow-auto">
                                {JSON.stringify(record, null, 2)}
                              </pre>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {count > pageSize && (
          <div className="border-t border-border p-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {page * pageSize + 1}-{Math.min((page + 1) * pageSize, count)} / {count}
            </span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                Önceki
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * pageSize >= count}
              >
                Sonraki
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? '✓' : '✗';
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'string') {
    if (value.length > 50) return value.slice(0, 50) + '...';
    return value;
  }
  if (value instanceof Date) return value.toLocaleString('tr-TR');
  if (typeof value === 'object') return JSON.stringify(value).slice(0, 50) + '...';
  return String(value);
}
