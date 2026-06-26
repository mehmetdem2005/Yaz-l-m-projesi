'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useStore, type DeviceType, type ChatMessage } from '@/lib/store';
import { useViewportSize, useHapticFeedback } from '@/lib/mobile-ui';
import { VoiceInputButton } from '@/components/ide/VoiceInputButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  FilePlus,
  FileCode,
  FileJson,
  File,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Send,
  Loader2,
  Bot,
  User,
  Trash2,
  Save,
  Eye,
  RefreshCw,
  Code2,
  BookMarked,
  Monitor,
  Tablet,
  Smartphone,
  Maximize,
  GitCompare,
  Sparkles,
  HelpCircle,
  Check,
  X,
} from 'lucide-react';
import { DEEPSEEK_MODELS, type DeepSeekModel } from '@/lib/deepseek';
import { STANDARDS, STANDARD_CATEGORIES } from '@/lib/standards';
import { BUILTIN_SKILLS } from '@/lib/skills-data';
import { buildSkillPrompt } from '@/lib/skills-data';
import { parseSmartResponse, type SmartChatResponse } from '@/lib/smart-chat';
import { parseDiffToLines, type FileDiff } from '@/lib/diff';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
      Editör yükleniyor...
    </div>
  ),
});

// ---------- File Tree ----------

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  language?: string;
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['tsx', 'ts', 'js', 'jsx'].includes(ext || '')) return <FileCode size={14} className="text-blue-400" />;
  if (['json'].includes(ext || '')) return <FileJson size={14} className="text-yellow-400" />;
  if (['md', 'mdx'].includes(ext || '')) return <FileText size={14} className="text-gray-400" />;
  return <File size={14} className="text-gray-400" />;
}

function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    json: 'json', md: 'markdown', html: 'html', css: 'css', py: 'python',
    sh: 'shell', yml: 'yaml', yaml: 'yaml',
  };
  return map[ext || ''] || 'plaintext';
}

function buildTree(paths: { path: string; language?: string }[]): FileNode[] {
  const root: FileNode = { name: '', path: '', type: 'folder', children: [] };
  for (const f of paths) {
    const parts = f.path.split('/');
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const path = parts.slice(0, i + 1).join('/');
      if (!current.children) current.children = [];
      let next = current.children.find((c) => c.name === part);
      if (!next) {
        next = {
          name: part, path, type: isLast ? 'file' : 'folder',
          children: isLast ? undefined : [], language: isLast ? f.language : undefined,
        };
        current.children.push(next);
      }
      current = next;
    }
  }
  function sortChildren(node: FileNode) {
    if (!node.children) return;
    node.children.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortChildren);
  }
  sortChildren(root);
  return root.children || [];
}

function TreeView({
  nodes, depth = 0, activePath, onSelect, expandedPaths, toggleExpand, onDelete,
}: {
  nodes: FileNode[]; depth?: number; activePath: string | null;
  onSelect: (n: FileNode) => void; expandedPaths: Set<string>;
  toggleExpand: (path: string) => void; onDelete: (path: string) => void;
}) {
  return (
    <div>
      {nodes.map((node) => {
        const isExpanded = expandedPaths.has(node.path);
        const isActive = activePath === node.path;
        return (
          <div key={node.path}>
            <div
              className={cn(
                'group flex items-center gap-1 py-1 pr-2 cursor-pointer hover:bg-white/5 text-sm',
                isActive && 'bg-blue-500/20 text-white'
              )}
              style={{ paddingLeft: depth * 12 + 8 }}
              onClick={() => {
                if (node.type === 'folder') toggleExpand(node.path);
                else onSelect(node);
              }}
            >
              {node.type === 'folder' ? (
                <>
                  {isExpanded ? <ChevronDown size={14} className="text-muted-foreground flex-shrink-0" />
                    : <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />}
                  {isExpanded ? <FolderOpen size={14} className="text-blue-400 flex-shrink-0" />
                    : <Folder size={14} className="text-blue-400 flex-shrink-0" />}
                </>
              ) : (
                <>
                  <span className="w-3.5 flex-shrink-0" />
                  {getFileIcon(node.name)}
                </>
              )}
              <span className="truncate flex-1">{node.name}</span>
              {node.type === 'file' && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(node.path); }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 hover:text-red-400 rounded"
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
            {node.type === 'folder' && isExpanded && node.children && (
              <TreeView
                nodes={node.children} depth={depth + 1} activePath={activePath}
                onSelect={onSelect} expandedPaths={expandedPaths}
                toggleExpand={toggleExpand} onDelete={onDelete}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------- Device Frame ----------

const DEVICE_SIZES: Record<DeviceType, { width: number; height: number; label: string; icon: any; frame: string }> = {
  desktop: { width: 1280, height: 800, label: 'Desktop', icon: Monitor, frame: 'desktop' },
  tablet: { width: 768, height: 1024, label: 'Tablet', icon: Tablet, frame: 'tablet' },
  mobile: { width: 375, height: 667, label: 'Mobile', icon: Smartphone, frame: 'mobile' },
  free: { width: 0, height: 0, label: 'Serbest', icon: Maximize, frame: 'free' },
};

// ---------- Main Editor View ----------

export function Editor() {
  const activeProjectId = useStore((s) => s.activeProjectId);
  const activeProject = useStore((s) => s.activeProject);
  const setActiveProject = useStore((s) => s.setActiveProject);
  const files = useStore((s) => s.files);
  const setFiles = useStore((s) => s.setFiles);
  const updateFileContent = useStore((s) => s.updateFileContent);
  const activeFilePath = useStore((s) => s.activeFilePath);
  const setActiveFile = useStore((s) => s.setActiveFile);
  const openTabs = useStore((s) => s.openTabs);
  const openTab = useStore((s) => s.openTab);
  const closeTab = useStore((s) => s.closeTab);
  const chatMessages = useStore((s) => s.chatMessages);
  const addChatMessage = useStore((s) => s.addChatMessage);
  const updateChatMessage = useStore((s) => s.updateChatMessage);
  const clearChat = useStore((s) => s.clearChat);
  const model = useStore((s) => s.deepseekModel);
  const setModel = useStore((s) => s.setDeepseekModel);
  const setView = useStore((s) => s.setView);
  const deviceType = useStore((s) => s.deviceType);
  const setDeviceType = useStore((s) => s.setDeviceType);
  const diffMode = useStore((s) => s.diffMode);
  const setDiffMode = useStore((s) => s.setDiffMode);
  const activeSkillIds = useStore((s) => s.activeSkillIds);

  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['src', 'src/app', 'src/components']));
  const [rightTab, setRightTab] = useState<'chat' | 'preview' | 'diff'>('chat');
  const [previewKey, setPreviewKey] = useState(0);
  const [pendingDiffs, setPendingDiffs] = useState<FileDiff[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useViewportSize();
  const haptic = useHapticFeedback();

  // Listen for prompt injection from Dev Prompts view
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.user) {
        setChatInput(detail.user);
        toast.success('Dev prompt yüklendi — göndermeye hazır');
      }
    };
    window.addEventListener('ide:inject-prompt', handler);
    return () => window.removeEventListener('ide:inject-prompt', handler);
  }, []);

  // Listen for mobile chat send
  useEffect(() => {
    const handler = () => {
      const input = useStore.getState().chatInput;
      if (input) {
        setChatInput(input);
        setTimeout(() => handleSendChat(input), 100);
      }
    };
    window.addEventListener('ide:send-chat', handler);
    return () => window.removeEventListener('ide:send-chat', handler);
  }, []);

  useEffect(() => {
    if (activeProjectId && !activeProject) {
      fetch(`/api/projects/${activeProjectId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.project) {
            setActiveProject(d.project);
            setFiles(d.project.files || []);
          }
        });
    }
  }, [activeProjectId, activeProject, setActiveProject, setFiles]);

  useEffect(() => {
    if (activeProjectId && chatMessages.length === 0) {
      fetch(`/api/projects/${activeProjectId}/messages?limit=50`)
        .then((r) => r.json())
        .then((d) => {
          if (d.messages) {
            d.messages.forEach((m: any) => {
              addChatMessage({
                id: m.id, role: m.role, content: m.content,
                modelUsed: m.modelUsed || undefined, createdAt: new Date(m.createdAt),
              });
            });
          }
        });
    }
  }, [activeProjectId, chatMessages.length, addChatMessage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const tree = buildTree(files.map((f) => ({ path: f.path, language: f.language })));
  const activeFile = files.find((f) => f.path === activeFilePath);

  const toggleExpand = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const handleSelectFile = (node: FileNode) => {
    if (node.type === 'file') {
      setActiveFile(node.path);
      openTab(node.path);
    }
  };

  const handleDeleteFile = async (path: string) => {
    if (!activeProjectId) return;
    if (!confirm(`${path} dosyasını silmek istediğinize emin misiniz?`)) return;
    await fetch(`/api/projects/${activeProjectId}/files?path=${encodeURIComponent(path)}`, { method: 'DELETE' });
    useStore.getState().removeFile(path);
    if (activeFilePath === path) setActiveFile(null);
    toast.success('Dosya silindi');
  };

  const handleSaveFile = async () => {
    if (!activeProjectId || !activeFile) return;
    await fetch(`/api/projects/${activeProjectId}/files`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: activeFile.path, content: activeFile.content,
        language: getLanguageFromPath(activeFile.path),
      }),
    });
    toast.success('Kaydedildi: ' + activeFile.path);
  };

  const handleNewFile = async () => {
    if (!activeProjectId) { toast.error('Önce bir proje açın'); return; }
    const path = prompt('Yeni dosya yolu (örn: src/app/page.tsx):');
    if (!path) return;
    await fetch(`/api/projects/${activeProjectId}/files`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content: '', language: getLanguageFromPath(path) }),
    });
    useStore.getState().addFile({
      id: Math.random().toString(), path, content: '', language: getLanguageFromPath(path),
    });
    setActiveFile(path);
    openTab(path);
    toast.success('Dosya oluşturuldu');
  };

  // Listen for save event from command palette
  useEffect(() => {
    const handler = () => handleSaveFile();
    window.addEventListener('ide:save-file', handler);
    return () => window.removeEventListener('ide:save-file', handler);
  }, [activeFile]);

  // ---------- Smart Chat ----------

  const handleSendChat = async (overrideInput?: string) => {
    const inputText = overrideInput || chatInput;
    if (!inputText.trim() || !activeProjectId) {
      if (!activeProjectId) toast.error('Önce bir proje açın');
      return;
    }
    haptic.light();

    const userMsg: ChatMessage = {
      id: Math.random().toString(), role: 'user', content: inputText, createdAt: new Date(),
    };
    addChatMessage(userMsg);

    await fetch(`/api/projects/${activeProjectId}/messages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'user', content: inputText }),
    });

    const assistantId = Math.random().toString();
    addChatMessage({
      id: assistantId, role: 'assistant', content: '', pending: true,
      modelUsed: model, createdAt: new Date(), type: 'executing',
    });

    setChatInput('');
    setSending(true);

    // System prompt (skill-enhanced + multi-standards)
    const selectedStandards = useStore.getState().selectedStandards;
    const isAllStandards = selectedStandards.includes('all');
    const activeStandards = isAllStandards
      ? STANDARDS
      : STANDARDS.filter((s) => selectedStandards.includes(s.id));

    const standardsBlock = activeStandards.length > 0
      ? `AKTİF KURUMSAL STANDARTLAR (${activeStandards.length} ${isAllStandards ? '— TÜMÜ' : ''}):
${activeStandards.map((s, i) => `
${i + 1}. ${s.fullName} (${s.version})
   - Kategori: ${s.category}
   - Özet: ${s.description}
   - Prensipler: ${s.keyPrinciples.slice(0, 5).join(', ')}
   - Uygulama: ${s.promptTemplate.slice(0, 300)}...`).join('\n')}

Bu standartların TÜM prensiplerine uy. Çelişkiler varsa en katı olanı seç (örn: ISO 27001 > ISO 9001 güvenlik konularında).
`
      : '';

    const fileContext = files.slice(0, 5)
      .map((f) => `--- ${f.path} ---\n${f.content.slice(0, 800)}`).join('\n\n');

    const skillPrompt = buildSkillPrompt(activeSkillIds);

    const systemPrompt = `Sen DeepSeek App Studio'nun profesyonel AI kod asistanısın. TÜRKÇE yanıt ver.

${standardsBlock}
Proje: ${activeProject?.name || 'Bilinmeyen'}
Açıklama: ${activeProject?.description || '-'}

MEVCUT DOSYALAR (ilk 5):
${fileContext}

${skillPrompt}

DAVRANIŞ KURALLARI:
1. **Önce anla, sonra sor.** İsteğiniz belirsizse PROFESYONEL şekilde SORU SOR.
2. Soru sorarken JSON formatında yanıt ver:
\`\`\`json
{ "type": "question", "message": "...", "questions": [{ "id": "q1", "question": "...", "options": ["A", "B"], "required": true, "context": "..." }] }
\`\`\`
3. Maksimum 3 soru sor.
4. **Diff tercih et**: Mevcut dosyayı düzenlerken TAMAMEN yeniden yazma.
   - Değişen kısımlar için: \`\`\`diff path="src/..."
   - Yeni dosya için: \`\`\`tsx path="src/..."
5. Kurumsal standartlara ve skiller'e uy.
6. Kullanıcı "düzenle" derse, mevcut dosyaları okuyup diff oluştur.
7. Önce plan sun, sonra kod üret.`;

    try {
      const res = await fetch('/api/deepseek/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...chatMessages.filter((m) => !m.pending && !m.error).slice(-10)
              .map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: inputText },
          ],
          model, temperature: 0.4, max_tokens: 4000, stream: true, projectId: activeProjectId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'API hatası');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.delta) {
              fullContent += parsed.delta;
              updateChatMessage(assistantId, { content: fullContent, pending: false });
            }
          } catch {}
        }
      }

      // Parse smart response
      const smart = parseSmartResponse(fullContent);
      if (smart) {
        updateChatMessage(assistantId, {
          content: fullContent, pending: false,
          type: smart.type,
          questions: smart.questions,
          codeChanges: smart.codeChanges,
        });

        // Eğer kod değişikliği varsa, diff üret
        if (smart.codeChanges && smart.codeChanges.length > 0) {
          const diffs: FileDiff[] = smart.codeChanges.map((change) => {
            const existing = files.find((f) => f.path === change.path);
            const oldContent = existing?.content || '';
            return {
              path: change.path,
              hunks: [],
              additions: change.content.split('\n').length,
              deletions: oldContent.split('\n').length,
              status: !oldContent ? 'added' : 'modified',
              oldContent,
              newContent: change.content,
            };
          });
          setPendingDiffs(diffs);
          setRightTab('diff');
        }
      } else {
        updateChatMessage(assistantId, { pending: false, content: fullContent, type: 'complete' });
      }
    } catch (err) {
      updateChatMessage(assistantId, {
        pending: false, error: true, content: `Hata: ${(err as Error).message}`,
      });
      toast.error((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  // Apply pending diffs
  const handleApplyDiffs = async () => {
    if (!activeProjectId) return;
    for (const diff of pendingDiffs) {
      await fetch(`/api/projects/${activeProjectId}/files`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: diff.path, content: diff.newContent,
          language: getLanguageFromPath(diff.path),
        }),
      });
      // Update local state
      const existing = files.find((f) => f.path === diff.path);
      if (existing) {
        updateFileContent(diff.path, diff.newContent!);
      } else {
        useStore.getState().addFile({
          id: Math.random().toString(), path: diff.path,
          content: diff.newContent!, language: getLanguageFromPath(diff.path),
        });
      }
    }
    toast.success(`${pendingDiffs.length} dosya güncellendi`);
    setPendingDiffs([]);
    setRightTab('preview');
    setPreviewKey((k) => k + 1);
  };

  if (!activeProjectId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-center p-6">
        <div>
          <Code2 size={64} className="mx-auto mb-4 opacity-30" />
          <h2 className="text-xl font-semibold mb-2">Editör için bir proje seçin</h2>
          <p className="text-muted-foreground mb-4">
            Düzenlemeye başlamak için bir proje açın veya yeni oluşturun
          </p>
          <Button onClick={() => setView('projects')}>
            <Folder /> Projelere Git
          </Button>
        </div>
      </div>
    );
  }

  const previewHtml = files.find((f) => f.path === 'index.html')?.content
    || files.find((f) => f.path === 'public/index.html')?.content
    || `<!-- Önizleme için index.html gerekli -->
<!DOCTYPE html>
<html>
<head><title>Önizleme</title></head>
<body style="font-family: sans-serif; padding: 2rem; background: #1e1e1e; color: #d4d4d4;">
  <h1>Henüz önizlenebilir HTML yok</h1>
  <p>Bu projede bir <code>index.html</code> dosyası oluşturun.</p>
  <p>Mevcut dosyalar: ${files.map((f) => f.path).join(', ') || 'yok'}</p>
</body>
</html>`;

  const deviceSize = DEVICE_SIZES[deviceType];

  return (
    <div className="flex-1 flex bg-background overflow-hidden">
      {/* File Explorer Sidebar */}
      <aside className="w-48 md:w-60 border-r border-border flex flex-col bg-[#252526] flex-shrink-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Gezgin</span>
          <button onClick={handleNewFile} className="p-1 hover:bg-white/10 rounded" title="Yeni dosya">
            <FilePlus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-auto py-1">
          <TreeView
            nodes={tree} activePath={activeFilePath} onSelect={handleSelectFile}
            expandedPaths={expandedPaths} toggleExpand={toggleExpand} onDelete={handleDeleteFile}
          />
        </div>
        <div className="border-t border-border p-2">
          <MultiStandardSelector />
        </div>
      </aside>

      {/* Main Editor Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Multi-tab strip */}
        <div className="h-9 bg-[#252526] border-b border-border flex items-stretch text-xs overflow-x-auto">
          {openTabs.length === 0 ? (
            <div className="px-3 text-muted-foreground flex items-center">Dosya seçin...</div>
          ) : (
            openTabs.map((tabPath) => {
              const isActive = tabPath === activeFilePath;
              const fileName = tabPath.split('/').pop() || tabPath;
              return (
                <div
                  key={tabPath}
                  onClick={() => setActiveFile(tabPath)}
                  className={`ide-tab h-full flex items-center px-3 gap-2 cursor-pointer border-r border-[#1e1e1e] flex-shrink-0 group ${
                    isActive ? 'ide-tab-active text-white' : 'ide-tab-inactive text-gray-400 hover:text-white'
                  }`}
                >
                  {getFileIcon(fileName)}
                  <span className="hidden sm:inline">{fileName}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tabPath);
                    }}
                    className="hover:bg-white/10 rounded p-0.5 opacity-0 group-hover:opacity-100"
                  >
                    <X size={10} />
                  </button>
                </div>
              );
            })
          )}
          <div className="ml-auto flex items-center gap-1 px-2 flex-shrink-0">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleSaveFile} disabled={!activeFile}>
              <Save size={12} className="mr-1" /> <span className="hidden md:inline">Kaydet</span>
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 min-h-0">
          {activeFile ? (
            <MonacoEditor
              key={activeFile.path}
              height="100%"
              language={getLanguageFromPath(activeFile.path)}
              theme="vs-dark"
              value={activeFile.content}
              onChange={(val) => updateFileContent(activeFile.path, val || '')}
              options={{
                fontSize: 13,
                fontFamily: 'var(--font-geist-mono), JetBrains Mono, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                tabSize: 2,
                wordWrap: 'on',
                padding: { top: 8 },
                automaticLayout: true,
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FileText size={48} className="mx-auto mb-3 opacity-30" />
                <p>Bir dosya seçin veya yeni dosya oluşturun</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Right Panel: Chat + Preview + Diff — responsive */}
      <aside className="w-full md:w-[420px] max-w-full border-l border-border flex-col bg-[#252526] flex-shrink-0 hidden md:flex">
        {/* Tabs */}
        <div className="grid grid-cols-3 border-b border-border h-9 flex-shrink-0">
          <button
            type="button"
            onClick={() => setRightTab('chat')}
            className={cn(
              'flex items-center justify-center gap-1 text-xs border-r border-border',
              rightTab === 'chat' ? 'bg-background text-foreground' : 'bg-[#2d2d2d] text-muted-foreground hover:text-foreground'
            )}
          >
            <Bot size={12} /> <span className="hidden sm:inline">AI Sohbet</span>
          </button>
          <button
            type="button"
            onClick={() => setRightTab('preview')}
            className={cn(
              'flex items-center justify-center gap-1 text-xs border-r border-border',
              rightTab === 'preview' ? 'bg-background text-foreground' : 'bg-[#2d2d2d] text-muted-foreground hover:text-foreground'
            )}
          >
            <Eye size={12} /> <span className="hidden sm:inline">Önizleme</span>
          </button>
          <button
            type="button"
            onClick={() => setRightTab('diff')}
            className={cn(
              'flex items-center justify-center gap-1 text-xs',
              rightTab === 'diff' ? 'bg-background text-foreground' : 'bg-[#2d2d2d] text-muted-foreground hover:text-foreground'
            )}
          >
            <GitCompare size={12} /> <span className="hidden sm:inline">Diff</span>
            {pendingDiffs.length > 0 && (
              <Badge variant="destructive" className="text-[9px] ml-1 h-4 px-1">
                {pendingDiffs.length}
              </Badge>
            )}
          </button>
        </div>

        {/* Chat tab */}
        {rightTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-auto px-3 py-3 space-y-3 min-h-0">
              {chatMessages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
                  AI ile sohbet ederek kod üretin
                  <div className="mt-4 space-y-1 text-xs">
                    <div className="opacity-60">Örnek promptlar:</div>
                    <div className="text-blue-400">• "Bir SaaS dashboard tasarla"</div>
                    <div className="text-blue-400">• "TOGAF uyumlu mimari planla"</div>
                    <div className="text-blue-400">• "Bu projeyi ISO 27001'e göre audit et"</div>
                  </div>
                </div>
              ) : (
                chatMessages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'fade-in-up text-sm',
                      m.role === 'user' ? 'text-right' : 'text-left'
                    )}
                  >
                    <div
                      className={cn(
                        'inline-block max-w-[90%] px-3 py-2 rounded-lg',
                        m.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : m.error
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-[#2d2d2d] text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-1 text-[10px] opacity-70 mb-1">
                        {m.role === 'user' ? (
                          <><User size={10} /> Sen</>
                        ) : (
                          <>
                            <Bot size={10} /> {m.modelUsed || 'AI'}
                            {m.pending && <Loader2 size={10} className="animate-spin ml-1" />}
                            {m.type === 'question' && <HelpCircle size={10} className="ml-1 text-yellow-400" />}
                          </>
                        )}
                      </div>

                      {/* Soru tipinde mesaj */}
                      {m.type === 'question' && m.questions && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2 mt-2">
                          <div className="text-yellow-400 text-xs font-semibold mb-1 flex items-center gap-1">
                            <HelpCircle size={10} /> {m.content.split('```json')[0].trim() || 'Soru:'}
                          </div>
                          {m.questions.map((q) => (
                            <div key={q.id} className="mb-2">
                              <div className="text-white text-xs mb-1">{q.question}</div>
                              {q.options && (
                                <div className="flex flex-wrap gap-1">
                                  {q.options.map((opt) => (
                                    <button
                                      key={opt}
                                      onClick={() => {
                                        setChatInput(`${q.question} → ${opt}`);
                                        document.querySelector('textarea')?.focus();
                                      }}
                                      className="text-[10px] px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded"
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="whitespace-pre-wrap break-words text-xs">
                        {m.content || (m.pending ? 'Düşünüyor...' : '')}
                      </div>

                      {m.codeChanges && m.codeChanges.length > 0 && (
                        <div className="mt-2 text-[10px] text-blue-300">
                          ✓ {m.codeChanges.length} dosya değişikliği Diff sekmesinde
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Model selector + diff toggle */}
            <div className="px-3 py-2 border-t border-border flex items-center gap-2 flex-wrap">
              <Select value={model} onValueChange={(v) => setModel(v as DeepSeekModel)}>
                <SelectTrigger className="h-7 text-xs flex-1 min-w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEEPSEEK_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      {m.name} {m.maturity === 'beta' ? 'β' : m.maturity === 'preview' ? 'preview' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant={diffMode ? 'default' : 'outline'}
                className="h-7 text-xs"
                onClick={() => setDiffMode(!diffMode)}
                title="Diff modu — AI tam dosya yerine diff önersin"
              >
                <GitCompare size={12} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs px-2"
                onClick={() => { if (confirm('Sohbeti temizle?')) clearChat(); }}
                title="Sohbeti temizle"
              >
                <Trash2 size={12} />
              </Button>
            </div>

            {/* Chat input */}
            <div className="p-3 border-t border-border">
              <div className="relative">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="AI'a bir prompt yazın... (Ctrl+Enter ile gönder)"
                  rows={3}
                  className="text-xs resize-none pr-20"
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === 'Enter') {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                />
                <div className="absolute right-1 bottom-1 flex items-center gap-1">
                  <VoiceInputButton onTranscript={(text) => setChatInput(text)} size="sm" />
                  <Button
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleSendChat()}
                    disabled={sending || !chatInput.trim()}
                  >
                    {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview tab — Device framed */}
        {rightTab === 'preview' && (
          <div className="flex-1 flex flex-col bg-[#1e1e1e]">
            {/* Device selector */}
            <div className="flex items-center gap-1 p-2 border-b border-border bg-[#252526]">
              {(Object.keys(DEVICE_SIZES) as DeviceType[]).map((d) => {
                const Icon = DEVICE_SIZES[d].icon;
                return (
                  <button
                    key={d}
                    onClick={() => setDeviceType(d)}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors',
                      deviceType === d
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-400 hover:bg-white/5'
                    )}
                    title={DEVICE_SIZES[d].label}
                  >
                    <Icon size={12} />
                    <span className="hidden sm:inline">{DEVICE_SIZES[d].label}</span>
                  </button>
                );
              })}
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto h-7 text-xs px-2"
                onClick={() => setPreviewKey((k) => k + 1)}
                title="Yenile"
              >
                <RefreshCw size={12} />
              </Button>
            </div>

            {/* Preview area */}
            <div className="flex-1 overflow-auto flex items-start justify-center p-4 bg-[#0a0a0a]">
              {deviceType === 'free' ? (
                <iframe
                  key={previewKey}
                  srcDoc={previewHtml}
                  title="preview"
                  className="w-full h-full bg-white"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <DeviceFrame device={deviceType}>
                  <iframe
                    key={previewKey}
                    srcDoc={previewHtml}
                    title="preview"
                    className="w-full h-full bg-white"
                    style={{
                      width: deviceSize.width,
                      height: deviceSize.height,
                      transform: deviceType === 'mobile' ? 'scale(0.85)' : deviceType === 'tablet' ? 'scale(0.7)' : 'scale(0.55)',
                      transformOrigin: 'top center',
                      border: 'none',
                    }}
                    sandbox="allow-scripts allow-same-origin"
                  />
                </DeviceFrame>
              )}
            </div>
          </div>
        )}

        {/* Diff tab */}
        {rightTab === 'diff' && (
          <div className="flex-1 overflow-auto bg-[#1e1e1e]">
            {pendingDiffs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-center p-4">
                <div>
                  <GitCompare size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Bekleyen diff yok</p>
                  <p className="text-xs mt-2">
                    AI'a "bu dosyayı düzenle" deyin, önerileri burada görünecek
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {pendingDiffs.length} dosya değişti
                  </Badge>
                  <Button size="sm" onClick={handleApplyDiffs}>
                    <Check size={12} className="mr-1" /> Tümünü Uygula
                  </Button>
                </div>
                {pendingDiffs.map((diff, i) => (
                  <DiffCard key={i} diff={diff} onApply={() => {
                    setPendingDiffs((prev) => prev.filter((_, idx) => idx !== i));
                  }} onReject={() => {
                    setPendingDiffs((prev) => prev.filter((_, idx) => idx !== i));
                  }} />
                ))}
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

// ---------- Device Frame ----------

function DeviceFrame({ device, children }: { device: DeviceType; children: React.ReactNode }) {
  if (device === 'desktop') {
    return (
      <div className="rounded-lg border-4 border-[#3c3c3c] bg-[#3c3c3c] shadow-2xl overflow-hidden" style={{ maxWidth: '100%' }}>
        <div className="flex items-center gap-1 px-2 py-1 bg-[#2d2d2d]">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <div className="bg-white overflow-auto">{children}</div>
      </div>
    );
  }
  if (device === 'tablet') {
    return (
      <div className="rounded-[2rem] border-4 border-[#1a1a1a] bg-[#1a1a1a] shadow-2xl p-2" style={{ width: 540 }}>
        <div className="bg-white rounded-[1.5rem] overflow-hidden">{children}</div>
      </div>
    );
  }
  if (device === 'mobile') {
    return (
      <div className="rounded-[2rem] border-4 border-[#1a1a1a] bg-[#1a1a1a] shadow-2xl p-2" style={{ width: 320 }}>
        <div className="flex justify-center mb-1">
          <div className="w-12 h-1 rounded-full bg-gray-700" />
        </div>
        <div className="bg-white rounded-[1.5rem] overflow-hidden">{children}</div>
        <div className="flex justify-center mt-1">
          <div className="w-8 h-8 rounded-full border-2 border-gray-700" />
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

// ---------- Diff Card ----------

function DiffCard({ diff, onApply, onReject }: { diff: FileDiff; onApply: () => void; onReject: () => void }) {
  const lines = parseDiffToLines(diff);

  return (
    <div className="mb-3 border border-border rounded overflow-hidden">
      <div className="flex items-center justify-between bg-[#2d2d2d] px-2 py-1.5">
        <div className="flex items-center gap-2">
          <FileCode size={12} className="text-blue-400" />
          <span className="text-xs font-mono">{diff.path}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <Badge variant="outline" className="text-green-400 border-green-500/30">+{diff.additions}</Badge>
          <Badge variant="outline" className="text-red-400 border-red-500/30">-{diff.deletions}</Badge>
        </div>
      </div>
      <div className="font-mono text-[10px] max-h-60 overflow-auto">
        {lines.slice(0, 50).map((line, i) => (
          <div
            key={i}
            className={cn(
              'px-2 py-0.5 flex',
              line.type === 'add' && 'bg-green-500/10 text-green-300',
              line.type === 'remove' && 'bg-red-500/10 text-red-300',
              line.type === 'context' && 'text-gray-500',
              line.type === 'header' && 'bg-blue-500/10 text-blue-300'
            )}
          >
            <span className="w-8 text-gray-600 flex-shrink-0">
              {line.oldLineNo || ''}
            </span>
            <span className="w-8 text-gray-600 flex-shrink-0">
              {line.newLineNo || ''}
            </span>
            <span className="flex-shrink-0 w-3">
              {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
            </span>
            <span className="whitespace-pre-wrap break-all">{line.content}</span>
          </div>
        ))}
        {lines.length > 50 && (
          <div className="px-2 py-1 text-gray-500 italic">
            ... {lines.length - 50} satır daha
          </div>
        )}
      </div>
      <div className="flex gap-1 p-2 bg-[#2d2d2d]">
        <Button size="sm" variant="default" className="h-7 text-xs flex-1" onClick={onApply}>
          <Check size={12} className="mr-1" /> Uygula
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onReject}>
          <X size={12} />
        </Button>
      </div>
    </div>
  );
}

// ---------- Multi-Standard Selector ----------

function MultiStandardSelector() {
  const selectedStandards = useStore((s) => s.selectedStandards);
  const toggleStandard = useStore((s) => s.toggleStandard);
  const selectAllStandards = useStore((s) => s.selectAllStandards);
  const clearStandards = useStore((s) => s.clearStandards);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = STANDARDS.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.fullName.toLowerCase().includes(q);
  });

  const isAllSelected = selectedStandards.includes('all');
  const selectedCount = selectedStandards.length;
  const selectedNames = isAllSelected
    ? 'Tüm Standartlar'
    : selectedCount === 0
    ? 'Standart yok'
    : selectedCount === 1
    ? STANDARDS.find((s) => s.id === selectedStandards[0])?.name || '1 standart'
    : `${selectedCount} standart`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="w-full flex items-center justify-between px-2 py-1.5 rounded border border-border bg-[#3c3c3c] hover:bg-[#4c4c4c] text-xs">
          <span className="flex items-center gap-1 min-w-0">
            <BookMarked size={10} className="text-muted-foreground flex-shrink-0" />
            <span className="truncate">{selectedNames}</span>
          </span>
          <ChevronDown size={10} className="text-muted-foreground flex-shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 bg-[#1a1a2e] border-white/20" align="start">
        {/* Search */}
        <div className="p-2 border-b border-white/10">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Standart ara..."
            className="h-7 text-xs bg-[#0d0d18] border-white/10"
          />
        </div>
        {/* Select All / Clear */}
        <div className="flex gap-1 p-2 border-b border-white/10">
          <button
            onClick={() => selectAllStandards()}
            className={`flex-1 px-2 py-1 text-[10px] rounded ${
              isAllSelected ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Tümünü Seç ({STANDARDS.length})
          </button>
          <button
            onClick={() => clearStandards()}
            className="px-2 py-1 text-[10px] rounded bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400"
          >
            Temizle
          </button>
        </div>
        {/* Standards list */}
        <div className="max-h-60 overflow-auto py-1">
          {filtered.map((s) => {
            const isSelected = isAllSelected || selectedStandards.includes(s.id);
            const cat = STANDARD_CATEGORIES.find((c) => c.id === s.category);
            return (
              <button
                key={s.id}
                onClick={() => toggleStandard(s.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs hover:bg-white/5 ${
                  isSelected ? 'bg-blue-500/10' : ''
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                    isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-500'
                  }`}
                >
                  {isSelected && <Check size={10} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">{s.name}</div>
                  <div className="text-[9px] text-gray-500 truncate">{s.fullName}</div>
                </div>
                <Badge
                  variant="outline"
                  className="text-[8px] px-1 py-0 flex-shrink-0"
                  style={{ color: cat?.color, borderColor: `${cat?.color}40` }}
                >
                  {cat?.label}
                </Badge>
              </button>
            );
          })}
        </div>
        {/* Footer */}
        <div className="p-2 border-t border-white/10 text-[10px] text-gray-500 text-center">
          {selectedCount} / {STANDARDS.length} seçili
        </div>
      </PopoverContent>
    </Popover>
  );
}
