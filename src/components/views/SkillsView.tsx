'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  Wand2,
  Shield,
  Code2,
  Building2,
  Bot,
  Check,
  X,
  FileText,
  Loader2,
} from 'lucide-react';
import {
  BUILTIN_SKILLS,
  SKILL_CATEGORIES,
  type Skill,
} from '@/lib/skills-data';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Sparkles,
  Wand2,
  Shield,
  Code2,
  Building2,
  Bot,
};

export function SkillsView() {
  const [skills, setSkills] = useState<Skill[]>(BUILTIN_SKILLS);
  const [selected, setSelected] = useState<Skill | null>(null);
  const [content, setContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);
  const activeSkillIds = useStore((s) => s.activeSkillIds);
  const toggleSkill = useStore((s) => s.toggleSkill);

  const openDetail = async (skill: Skill) => {
    setSelected(skill);
    setLoadingContent(true);
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: skill.id }),
      });
      const data = await res.json();
      setContent(data.content || 'İçerik yok');
    } catch {
      setContent('İçerik yüklenemedi');
    } finally {
      setLoadingContent(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="text-purple-400" /> Skill Kütüphanesi
            </h1>
            <p className="text-sm text-muted-foreground">
              AI'a uzmanlık kazandıran skiller — aktif olanlar sistem prompt'a enjekte edilir
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {activeSkillIds.length} aktif / {skills.length} toplam
          </Badge>
        </div>

        {/* Active skills summary */}
        {activeSkillIds.length > 0 && (
          <Card className="mb-4 bg-purple-500/5 border-purple-500/30">
            <CardContent className="py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-purple-400 font-semibold">Aktif:</span>
                {activeSkillIds.map((id) => {
                  const s = skills.find((x) => x.id === id);
                  if (!s) return null;
                  const Icon = ICONS[s.icon] || Sparkles;
                  return (
                    <Badge
                      key={id}
                      variant="default"
                      className="text-xs gap-1 cursor-pointer hover:bg-purple-600"
                      onClick={() => toggleSkill(id)}
                    >
                      <Icon size={10} />
                      {s.name}
                      <X size={10} className="ml-1" />
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skills grid by category */}
        <Tabs defaultValue="all">
          <TabsList className="flex-wrap h-auto mb-4">
            <TabsTrigger value="all" className="text-xs">Tümü ({skills.length})</TabsTrigger>
            {SKILL_CATEGORIES.map((c) => {
              const count = skills.filter((s) => s.category === c.id).length;
              if (count === 0) return null;
              return (
                <TabsTrigger key={c.id} value={c.id} className="text-xs">
                  {c.label} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((skill, i) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  active={activeSkillIds.includes(skill.id)}
                  onToggle={() => {
                    toggleSkill(skill.id);
                    toast.success(
                      activeSkillIds.includes(skill.id)
                        ? `${skill.name} devre dışı`
                        : `${skill.name} aktif`
                    );
                  }}
                  onClick={() => openDetail(skill)}
                  index={i}
                />
              ))}
            </div>
          </TabsContent>

          {SKILL_CATEGORIES.map((c) => (
            <TabsContent key={c.id} value={c.id}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills
                  .filter((s) => s.category === c.id)
                  .map((skill, i) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      active={activeSkillIds.includes(skill.id)}
                      onToggle={() => toggleSkill(skill.id)}
                      onClick={() => openDetail(skill)}
                      index={i}
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Detail dialog */}
        <Dialog open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-auto bg-card border-border">
            {selected && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: `${SKILL_CATEGORIES.find((c) => c.id === selected.category)?.color}20`,
                      }}
                    >
                      {(() => {
                        const Icon = ICONS[selected.icon] || Sparkles;
                        return (
                          <Icon
                            size={20}
                            className=""
                          />
                        );
                      })()}
                    </div>
                    <div>
                      <DialogTitle>{selected.name}</DialogTitle>
                      <CardDescription>{selected.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-[10px]">
                      v{selected.version}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      ~{selected.estimatedTokens} token
                    </Badge>
                    {selected.tags.map((t) => (
                      <Badge key={t} variant="outline" className="text-[10px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Yetkinlikler</h4>
                    <ul className="text-sm space-y-1">
                      {selected.capabilities.map((c, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check size={12} className="text-green-400 mt-1" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <FileText size={14} /> Skill Dokümanı
                    </h4>
                    {loadingContent ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin" size={20} />
                      </div>
                    ) : (
                      <pre className="bg-[#1e1e1e] border border-border p-4 rounded text-xs font-mono whitespace-pre-wrap max-h-[400px] overflow-auto">
                        {content}
                      </pre>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      toggleSkill(selected.id);
                      toast.success(
                        activeSkillIds.includes(selected.id)
                          ? 'Devre dışı bırakıldı'
                          : 'Aktif edildi'
                      );
                    }}
                    className="w-full"
                    variant={activeSkillIds.includes(selected.id) ? 'outline' : 'default'}
                  >
                    {activeSkillIds.includes(selected.id)
                      ? 'Devre Dışı Bırak'
                      : 'Aktif Et'}
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function SkillCard({
  skill,
  active,
  onToggle,
  onClick,
  index,
}: {
  skill: Skill;
  active: boolean;
  onToggle: () => void;
  onClick: () => void;
  index: number;
}) {
  const cat = SKILL_CATEGORIES.find((c) => c.id === skill.category);
  const Icon = ICONS[skill.icon] || Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={`bg-card border-border cursor-pointer transition-all hover:border-purple-500/50 ${
          active ? 'border-purple-500/50 bg-purple-500/5' : ''
        }`}
        onClick={onClick}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: `${cat?.color}20` }}
            >
              <Icon size={20} style={{ color: cat?.color }} />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className={`p-1 rounded transition-colors ${
                active
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-gray-500 hover:bg-white/10'
              }`}
            >
              {active ? <Check size={14} /> : <X size={14} />}
            </button>
          </div>
          <CardTitle className="text-base mt-2">{skill.name}</CardTitle>
          <CardDescription className="text-xs line-clamp-2">
            {skill.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <Badge variant="outline" className="text-[9px]">
              {cat?.label}
            </Badge>
            <span>~{skill.estimatedTokens} tok</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
