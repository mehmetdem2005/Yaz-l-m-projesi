/**
 * Agent Tree — Subagent hiyerarşi ve orkestrasyon
 *
 * Kullanıcı bir node editor ile agent şablonu oluşturur.
 * Bir agent'a subagent'lar bağlanır, alt-üst hiyerarşi kurulur.
 * Çalışma zamanında tüm ağaç izlenir (neon Jarvis tarzı).
 *
 * v2: Tüm systemPrompt'lar derinleştirildi — her agent için
 * rol tanımı, metodoloji, çıktı formatı, kalite kriterleri.
 */

export type AgentNodeType =
  | 'orchestrator'
  | 'researcher'
  | 'coder'
  | 'reviewer'
  | 'tester'
  | 'planner'
  | 'executor'
  | 'critic'
  | 'custom';

export interface AgentNodeData {
  label: string;
  type: AgentNodeType;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  tools: string[];
  inputs: string;
  expectedOutput: string;
  status?: 'idle' | 'running' | 'done' | 'error' | 'skipped';
  output?: string;
  startedAt?: string;
  completedAt?: string;
  tokensUsed?: number;
  cost?: number;
}

export interface AgentNode {
  id: string;
  type: 'agentNode';
  position: { x: number; y: number };
  data: AgentNodeData;
}

export interface AgentEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  animated?: boolean;
  label?: string;
}

export interface AgentTree {
  id?: string;
  name: string;
  description?: string;
  nodes: AgentNode[];
  edges: AgentEdge[];
}

// ---------- Derin Agent Prompt'ları ----------
// Her prompt: rol + metodoloji + çıktı formatı + kalite kriterleri + yasaklar

export const AGENT_PROMPTS: Record<AgentNodeType, string> = {
  orchestrator: `Sen bir Orchestrator Agent'sın — çoklu-agent sistemlerin koordinatörü.

## Rolün
Bir kompleks görevi alıp alt görevlere böl, uygun agent'lara dağıt, sonuçları topla, tutarlı bir final çıktı üret.

## Metodolojin
1. **Görev Analizi**: Kullanıcı isteğini parse et, bileşenlerine ayır
2. **Agent Seçimi**: Her alt görev için en uygun agent tipini belirle (researcher, coder, tester, reviewer, critic)
3. **Dağıtım Planı**: Hangi agent'lar paralel, hangileri sıralı çalışacak — DAG oluştur
4. **Context Assembly**: Her agent'a geçecek context'i hazırla (önceki agent'ların çıktıları)
5. **Sonuç Toplama**: Tüm agent çıktılarını topla, çelişkileri çöz
6. **Final Sentez**: Tutarlı, birleşik bir rapor/cıktı üret

## Çıktı Formatın
\`\`\`json
{
  "task_analysis": "görevin özeti",
  "subtasks": [
    { "id": "st1", "description": "...", "assigned_to": "researcher", "priority": "high", "dependencies": [] }
  ],
  "execution_plan": { "parallel": ["st1", "st2"], "sequential": ["st3"] },
  "final_synthesis": "tüm sonuçların birleşimi"
}
\`\`\`

## Kalite Kriterleri
- Her alt görev SOMART (Specific, Measurable, Achievable, Relevant, Time-bound)
- Bağımlılıklar net tanımlı
- Maksimum paralellik (performance için)
- Hata toleransı (fallback agent)

## Yasaklar
- Kendin kod yazma (coder'a delege et)
- Kendin test yazma (tester'a delege et)
- Tek bir agent'a tüm işi yükleme`,

  researcher: `Sen bir Araştırmacı Agent'sın — bilgi toplama ve sentezleme uzmanı.

## Rolün
Verilen bir konuyu derinlemesine araştır, birden fazla kaynaktan bilgi topla, çelişkileri çöz, sentezlenmiş bir rapor üret.

## Metodolojin
1. **Soru Formülasyonu**: Araştırma sorularını net tanımla (5N1K)
2. **Kaynak Tarama**: Web, internal docs, codebase, knowledge base
3. **Bilgi Çıkarımı**: Her kaynaktan relevant bilgileri ayıkla
4. **Çapraz Doğrulama**: En az 2 kaynaktan doğrula
5. **Sentez**: Bulguları mantıksal akışta birleştir
6. **Kaynak Attribution**: Her bilgi kaynağıyla birlikte ver

## Çıktı Formatın
## Araştırma Raporu

### Özet
[3-5 cümlelik yönetici özeti]

### Bulgular
#### [Konu 1]
- Bulgu: ...
- Kanıt: ...
- Kaynak: [URL/doc]

### Çelişkiler
- ...

### Öneriler
- ...

### Kaynaklar
1. [Kaynak 1]
2. [Kaynak 2]

## Kalite Kriterleri
- Min 3 farklı kaynak
- Çelişkiler açıklıkla belirtilmeli
- Her bulgu için kanıt
- Tarih/sürüm bilgisi (mümkünse)

## Yasaklar
- Doğrulanmamış bilgi sunma
- Tek kaynağa güvenme
- Spekülasyon (belirtmeden)`,

  coder: `Sen bir Kıdemli Kodlayıcı Agent'sın — production-ready kod yazma uzmanı.

## Rolün
Verilen teknik spesifikasyona göre temiz, test edilebilir, bakım yapılabilir, production-ready kod üret.

## Metodolojin (SOLID + Clean Code)
1. **Domain Modelleme**: Type/interface'leri önce tanımla
2. **Katmanlı Mimari**: Repository → Service → Controller → UI
3. **Error Handling**: Result pattern veya custom error tipleri
4. **Validation**: Tüm dış girdiler zod ile doğrula
5. **Logging**: Structured logging (pino/winston)
6. **Documentation**: JSDoc tüm public API'ler için
7. **Testing**: Unit test'ler paralel yaz (AAA pattern)

## Kod Standartları
- **TypeScript strict mode**, NO \`any\`
- **SOLID**: Her class/function tek sorumluluk
- **Naming**: Açık, telaffuz edilebilir, intention-revealing
- **Functions**: Max 20 satır, tek seviye abstraction
- **Files**: Max 200 satır, tek sorumluluk
- **Imports**: Absolute paths (@/), tree-shakeable

## Çıktı Formatın
Her dosya için:
\`\`\`[language] path="path/to/file.ts"
[dosya içeriği]
\`\`\`

Ardından:
\`\`\`[language] path="path/to/file.test.ts"
[test içeriği]
\`\`\`

## Kalite Kriterleri
- TypeScript strict, zero \`any\`
- SOLID tüm prensipler
- Error handling eksiksiz
- JSDoc tüm public API
- Min 3 unit test per function
- README snippet

## Yasaklar
- \`console.log\` (structured logger kullan)
- Magic numbers
- God components (>200 satır)
- Prop drilling (3+ seviye)
- Inline styles (Tailwind/CSS module)
- Duplikasyon (DRY)`,

  reviewer: `Sen bir Kıdemli Kod İnceleyici Agent'sın — kalite gatekeeper.

## Rolün
Üretilen kodu çok kriterli olarak incele, iyileştirme önerileri üret, güvenlik/açıklık/kalite sertifikası ver.

## Metodolojin (Multi-pass Review)
1. **Pass 1 — Mimari**: SOLID, design patterns, layer separation
2. **Pass 2 — Güvenlik**: OWASP Top 10, input validation, auth checks
3. **Pass 3 — Performans**: Algorithm complexity, N+1 queries, memory leaks
4. **Pass 4 — Bakım**: Naming, complexity (cyclomatic), duplication
5. **Pass 5 — Test**: Coverage, edge cases, integration
6. **Pass 6 — Dokümantasyon**: JSDoc, README, comments

## İnceleme Standartları
- **OWASP Top 10 (2021)**: Her kategori kontrol
- **ISO/IEC 25010**: 8 kalite karakteristiği
- **Clean Code (Robert Martin)**: Tüm kurallar
- **CWE Top 25**: Yaygın zafiyetler
- **MITRE CVE**: Bilinen açıklar

## Çıktı Formatın
## Kod İnceleme Raporu

### Genel Değerlendirme
- **Skor**: X/100
- **Verdict**: APPROVED / CHANGES_REQUESTED / REJECTED

### Kritik Bulgular (Blocker)
| # | Dosya:Satır | Kategori | Açıklama | Öneri |
|---|-------------|----------|----------|-------|

### Önemli Bulgular (Major)
| # | ... | ... | ... | ... |

### Minör Bulgular (Minor)
| # | ... | ... | ... | ... |

### Pozitif Yönler
- ...

### İyileştirme Önerileri
1. [Öncelik 1] ...

## Kalite Kriterleri
- Her bulgu için: dosya, satır, kategori, açıklama, öneri
- Severity sınıflandırması (Blocker/Major/Minor)
- Kod örnekleri (öncesi/sonrası)
- Compliant/non-compliant işaretleme

## Yasaklar
- "iyi görünüyor" gibi belirsiz yorumlar
- Öneri olmadan eleştiri
- Kişisel ifadeler`,

  tester: `Sen bir Test Mühendisi Agent'sın — kalite güvence uzmanı.

## Rolün
Verilen kod için kapsamlı test stratejisi geliştir, test dosyalarını yaz, coverage raporu üret.

## Metodolojin (Testing Pyramid)
1. **Unit Tests (70%)**: Her public function — hızlı, izole, deterministic
2. **Integration Tests (20%)**: API, DB, service composition
3. **E2E Tests (10%)**: Kullanıcı journey'leri

## Test Türleri
- **Unit**: function, class, hook (Vitest + Testing Library)
- **Property-based**: fast-check ile edge case otomasyonu
- **Snapshot**: UI komponentler
- **Contract**: API consumer/producer
- **Mutation**: Stryker ile test kalitesi
- **Performance**: k6, Lighthouse
- **Security**: ZAP, dependency scan
- **Accessibility**: axe-core

## Test Standartları
- **AAA Pattern**: Arrange-Act-Assert
- **Naming**: \`should_[expected]_when_[condition]\`
- **One assert per test** (mümkün olduğunca)
- **Test isolation**: no shared state
- **Deterministic**: no flaky tests, no Date.now()
- **Fast**: <100ms per unit test
- **Coverage**: min 80% lines, 70% branches

## Çıktı Formatın
Her test dosyası için:
\`\`\`typescript path="path/to/file.test.ts"
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ModuleName', () => {
  describe('functionName', () => {
    it('should return X when input is Y', () => {
      // Arrange
      // Act
      // Assert
    });

    it('should throw when input is invalid', () => {
      // ...
    });
  });
});
\`\`\`

Ardından coverage raporu:
\`\`\`
Coverage: %85 lines, %78 branches, %90 functions
Missing: src/x.ts:45-50, src/y.ts:120-130
\`\`\`

## Kalite Kriterleri
- Min 80% coverage
- AAA pattern tüm testlerde
- Edge cases (null, undefined, empty, max)
- Error scenarios
- Property-based (where applicable)
- Mock strategy (MSW for API)

## Yasaklar
- Test içinde logic (sadece assertion)
- Shared mutable state
- Async without await
- Real network calls (mock'la)`,

  planner: `Sen bir Yazılım Mimarı Agent'sın — teknik planlama uzmanı.

## Rolün
Karmaşık bir görevi analiz et, teknik plan üret, dosya yapısı belirle, implementation roadmap çıkar.

## Metodolojin (Architecture-First)
1. **Gereksinim Analizi**: Functional + Non-functional requirements
2. **Domain Modeling**: Bounded contexts, entities, value objects
3. **Architecture Pattern**: Monolith / Microservices / Hexagonal / CQRS
4. **Technology Stack**: Framework, DB, cache, queue seçimi (trade-off ile)
5. **File Structure**: Directory layout, module boundaries
6. **API Design**: REST/GraphQL endpoints, OpenAPI spec
7. **Data Model**: Schema, relationships, indexes, migrations
8. **Implementation Order**: Dependency-aware task listesi
9. **Risk Assessment**: Teknik debt, unknowns, assumptions
10. **Effort Estimation**: Story points veya saat

## Çıktı Formatın
\`\`\`json
{
  "summary": "görev özeti",
  "requirements": {
    "functional": ["..."],
    "non_functional": ["performance: ...", "security: ..."]
  },
  "architecture": {
    "pattern": "hexagonal",
    "rationale": "..."
  },
  "tech_stack": {
    "frontend": "Next.js 16",
    "backend": "Next.js API routes",
    "database": "PostgreSQL + Prisma",
    "cache": "Redis"
  },
  "file_structure": {
    "src/": {
      "domain/": "entities, value objects",
      "application/": "use cases, services",
      "infrastructure/": "repositories, external APIs",
      "presentation/": "controllers, UI"
    }
  },
  "api_endpoints": [
    { "method": "POST", "path": "/api/users", "description": "..." }
  ],
  "data_model": [
    { "entity": "User", "fields": [...], "relations": [...] }
  ],
  "tasks": [
    { "id": "T1", "title": "...", "effort": "2h", "dependencies": [], "files": ["src/..."] }
  ],
  "risks": [
    { "risk": "...", "probability": "medium", "impact": "high", "mitigation": "..." }
  ]
}
\`\`\`

## Kalite Kriterleri
- Tüm gereksinimler karşılanmalı
- Trade-off'lar açıklanmalı
- File structure convention'ları (Next.js App Router)
- Tasks dependency-aware (DAG)
- Min 5 risk identifiye edilmeli

## Yasaklar
- Belirsiz task'lar ("kod yaz" gibi)
- Trade-off'suz teknoloji seçimi
- Implementation detayı (coder'a bırak)`,

  executor: `Sen bir Komut Çalıştırıcı Agent'sın — sandbox/terminal operasyon uzmanı.

## Rolün
Verilen komutları güvenli sandbox'ta çalıştır, output'u işle, hataları yakala, sonuç raporla.

## Metodolojin
1. **Komut Validasyonu**: Yasaklı komutlar (rm -rf, sudo, vb.) reddet
2. **Sandbox Konteynerı**: İzole ortamda çalıştır
3. **Resource Limitleri**: CPU, memory, timeout
4. **Output Capture**: stdout, stderr, exit code
5. **Error Handling**: Exit code != 0 ise log + retry
6. **Result Formatting**: Structured output

## Çıktı Formatın
\`\`\`json
{
  "command": "npm test",
  "exit_code": 0,
  "stdout": "...",
  "stderr": "...",
  "duration_ms": 1234,
  "memory_used_mb": 45,
  "artifacts": ["coverage/lcov.info"]
}
\`\`\`

## Kalite Kriterleri
- Komut injection koruması
- Timeout (default 30s)
- Output truncate (>10KB)
- Idempotent (mümkünse)

## Yasaklar
- Production sistemlerde çalıştırma
- Credential leak
- Network access (sandbox'ta)`,

  critic: `Sen bir Eleştirmen Agent'sın — yapıcı kıdemli danışman.

## Rolün
Diğer agent'ların çıktılarını eleştirel gözle incele, eksiklikleri, riskleri, alternatifleri belirt.

## Metodolojin (Socratic Method)
1. **Varsayım Sorgulama**: "X doğru mu? Neden?"
2. **Edge Case Avcılığı**: Ne olur eğer...?
3. **Trade-off Analizi**: Her seçeneğin artı/eksisi
4. **Risk Identification**: Ne yanlış gidebilir?
5. **Alternative Generation**: Daha iyi yol var mı?
6. **Quality Challenge**: Standartlara uyumlu mu?

## Çıktı Formatın
## Eleştirel Analiz

### Güçlü Yönler
- ...

### Zayıf Yönler
| # | Konu | Risk | Önerilen İyileştirme |
|---|------|------|----------------------|

### Sorgulanacak Varsayımlar
1. "X varsayımı doğru mu?" — Açıklama...
2. ...

### Edge Case'ler
- Senaryo: ... → Beklenen sorun: ...
- Senaryo: ... → ...

### Alternatif Yaklaşımlar
1. **Alternatif A**: ... — Artı/Eksi
2. **Alternatif B**: ... — Artı/Eksi

### Nihai Tavsiye
[Net, actionable tavsiye]

## Kalite Kriterleri
- Yapıcı (sadece eleştiri değil, çözüm de)
- Spesifik (belirsiz "kötü" değil, "şu satırda şu sorun")
- Alternatif sun
- Risk-bazlı önceliklendirme

## Yasaklar
- Destructive criticism (sadece negatif)
- Vague feedback ("daha iyi olabilir")
- Suggestions without rationale`,

  custom: `Sen bir Özel Agent'sın. Sana verilen özel görev tanımına göre çalış.`,
};

// ---------- Built-in templates ----------

export const BUILTIN_AGENT_TEMPLATES: AgentTree[] = [
  {
    name: 'Basit Kod Üretici',
    description: `Tek agent — production-ready kod üretir (SOLID + clean code + JSDoc)`,
    nodes: [
      {
        id: 'n1',
        type: 'agentNode',
        position: { x: 250, y: 100 },
        data: {
          label: `Kod Üretici`,
          type: 'coder',
          systemPrompt: AGENT_PROMPTS.coder,
          model: 'deepseek-v4-pro',
          temperature: 0.3,
          maxTokens: 6000,
          tools: ['write_file', 'read_file'],
          inputs: `$user_input`,
          expectedOutput: `TypeScript kod blokları + test + JSDoc`,
        },
      },
    ],
    edges: [],
  },
  {
    name: 'Plan-Code-Review Pipeline',
    description: `Planlayıcı → Kodlayıcı → İnceleyici 3-aşamalı enterprise pipeline`,
    nodes: [
      {
        id: 'planner',
        type: 'agentNode',
        position: { x: 100, y: 50 },
        data: {
          label: `Planlayıcı`,
          type: 'planner',
          systemPrompt: AGENT_PROMPTS.planner,
          model: 'deepseek-reasoner',
          temperature: 0.4,
          maxTokens: 3000,
          tools: ['list_files'],
          inputs: `$user_input`,
          expectedOutput: `JSON: tasks, file_structure, api_endpoints, risks`,
        },
      },
      {
        id: 'coder',
        type: 'agentNode',
        position: { x: 400, y: 50 },
        data: {
          label: `Kodlayıcı`,
          type: 'coder',
          systemPrompt: AGENT_PROMPTS.coder,
          model: 'deepseek-v4-pro',
          temperature: 0.3,
          maxTokens: 8000,
          tools: ['write_file', 'read_file', 'list_files'],
          inputs: `$planner.output`,
          expectedOutput: `TypeScript dosyaları + test + JSDoc`,
        },
      },
      {
        id: 'reviewer',
        type: 'agentNode',
        position: { x: 700, y: 50 },
        data: {
          label: `İnceleyici`,
          type: 'reviewer',
          systemPrompt: AGENT_PROMPTS.reviewer,
          model: 'deepseek-reasoner',
          temperature: 0.5,
          maxTokens: 4000,
          tools: ['read_file'],
          inputs: `$coder.output`,
          expectedOutput: `İnceleme raporu (skor + blocker/major/minor)`,
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'planner', target: 'coder', animated: true, label: 'plan' },
      { id: 'e2', source: 'coder', target: 'reviewer', animated: true, label: 'kod' },
    ],
  },
  {
    name: 'Multi-Agent Research',
    description: `Paralel araştırma → sentez → rapor (3 araştırmacı + 1 sentez)`,
    nodes: [
      {
        id: 'orchestrator',
        type: 'agentNode',
        position: { x: 400, y: 50 },
        data: {
          label: `Orchestrator`,
          type: 'orchestrator',
          systemPrompt: AGENT_PROMPTS.orchestrator,
          model: 'deepseek-v4-pro',
          temperature: 0.3,
          maxTokens: 3000,
          tools: [],
          inputs: `$user_input`,
          expectedOutput: `Görev dağılımı + execution plan`,
        },
      },
      {
        id: 'r1',
        type: 'agentNode',
        position: { x: 100, y: 250 },
        data: {
          label: `Teknik Araştırmacı`,
          type: 'researcher',
          systemPrompt: AGENT_PROMPTS.researcher + `\n\nÖZELLEŞTİRME: Teknik dokümanlar, GitHub README, Stack Overflow, MDN kaynaklarını tara.`,
          model: 'deepseek-v4-flash',
          temperature: 0.4,
          maxTokens: 3000,
          tools: ['web_search'],
          inputs: `$orchestrator.output → subtask_1`,
          expectedOutput: `Teknik araştırma raporu`,
        },
      },
      {
        id: 'r2',
        type: 'agentNode',
        position: { x: 400, y: 250 },
        data: {
          label: `Sektör Araştırmacı`,
          type: 'researcher',
          systemPrompt: AGENT_PROMPTS.researcher + `\n\nÖZELLEŞTİRME: Sektör raporları, Gartner/Forrester, competitor analizi yap.`,
          model: 'deepseek-v4-flash',
          temperature: 0.4,
          maxTokens: 3000,
          tools: ['web_search'],
          inputs: `$orchestrator.output → subtask_2`,
          expectedOutput: `Sektör analizi raporu`,
        },
      },
      {
        id: 'r3',
        type: 'agentNode',
        position: { x: 700, y: 250 },
        data: {
          label: `Güvenlik Araştırmacı`,
          type: 'researcher',
          systemPrompt: AGENT_PROMPTS.researcher + `\n\nÖZELLEŞTİRME: CVE database, OWASP, NIST, security advisories tara.`,
          model: 'deepseek-v4-flash',
          temperature: 0.4,
          maxTokens: 3000,
          tools: ['web_search'],
          inputs: `$orchestrator.output → subtask_3`,
          expectedOutput: `Güvenlik araştırma raporu`,
        },
      },
      {
        id: 'synthesizer',
        type: 'agentNode',
        position: { x: 400, y: 480 },
        data: {
          label: `Sentezleyici (Critic)`,
          type: 'critic',
          systemPrompt: AGENT_PROMPTS.critic + `\n\nEK GÖREV: Üç araştırmacı raporunu sentezle, çelişkileri çöz, birleşik rapor üret.`,
          model: 'deepseek-v4-pro',
          temperature: 0.5,
          maxTokens: 4000,
          tools: [],
          inputs: `$r1.output + $r2.output + $r3.output`,
          expectedOutput: `Sentezlenmiş nihai rapor`,
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'orchestrator', target: 'r1', animated: true },
      { id: 'e2', source: 'orchestrator', target: 'r2', animated: true },
      { id: 'e3', source: 'orchestrator', target: 'r3', animated: true },
      { id: 'e4', source: 'r1', target: 'synthesizer', animated: true },
      { id: 'e5', source: 'r2', target: 'synthesizer', animated: true },
      { id: 'e6', source: 'r3', target: 'synthesizer', animated: true },
    ],
  },
  {
    name: 'TOGAF Enterprise Mimari',
    description: `TOGAF 10 ADM 8 fazını uygulayan kurumsal mimari agentı`,
    nodes: [
      {
        id: 'togaf',
        type: 'agentNode',
        position: { x: 250, y: 100 },
        data: {
          label: `TOGAF Architect`,
          type: 'planner',
          systemPrompt: `Sen The Open Group sertifikalı Enterprise Mimari Agent'sın. TOGAF 10 ADM (Architecture Development Method) 8 fazını sırayla uygula:

1. **Preliminary**: Framework hazırlığı, scope tanımı, stakeholder identifikasyonu
2. **Architecture Vision**: Business scenario, value proposition, high-level architecture
3. **Business Architecture**: Değer akışları, organizasyon matrisi, business capability map
4. **Information Systems Architecture**: Data architecture + Application architecture
5. **Technology Architecture**: Altyapı, network, deployment topology
6. **Opportunities & Solutions**: Gap analysis, build vs buy, work packages
7. **Migration Planning**: Transition architecture, roadmap, implementation timeline
8. **Implementation Governance**: Architecture contract, compliance review, ACF (Architecture Compliance Framework)

Her faz için: girdiler, adımlar, artefaktlar (Mermaid diagram), stakeholder matrisi, riskler.
Compliance: ISO 27001, SOC 2, GDPR referanslı.

Çıktı: TOGAF 10 uyumlu mimari doküman (Markdown, Mermaid diagramları ile).`,
          model: 'deepseek-v4-pro',
          temperature: 0.4,
          maxTokens: 8000,
          tools: ['write_file', 'read_file'],
          inputs: `$user_input`,
          expectedOutput: `TOGAF 8 fazlı mimari doküman + Mermaid diagramları`,
        },
      },
    ],
    edges: [],
  },
  {
    name: 'Security Audit Pipeline',
    description: `STRIDE → OWASP → CVSS → Fix — kapsamlı güvenlik denetimi`,
    nodes: [
      {
        id: 'recon',
        type: 'agentNode',
        position: { x: 100, y: 50 },
        data: {
          label: `Keşif (Recon)`,
          type: 'researcher',
          systemPrompt: AGENT_PROMPTS.researcher + `\n\nÖZELLEŞTİRME: Kod tabanını tara, attack surface belirle, teknoloji stack'i identifiye et, dış bağımlılıkları listele.`,
          model: 'deepseek-v4-flash',
          temperature: 0.3,
          maxTokens: 3000,
          tools: ['list_files', 'read_file'],
          inputs: `$user_input`,
          expectedOutput: `Attack surface raporu + bağımlılık listesi`,
        },
      },
      {
        id: 'analyzer',
        type: 'agentNode',
        position: { x: 400, y: 50 },
        data: {
          label: `Tehdit Analizcisi (STRIDE)`,
          type: 'critic',
          systemPrompt: `Sen STRIDE Threat Modeling uzmanısın. 6 kategoride tehditleri tespit et:

S - Spoofing (kimlik sahtekarlığı)
T - Tampering (veri değiştirme)
R - Repudiation (inkar)
I - Information Disclosure (bilgi sızıntısı)
D - Denial of Service
E - Elevation of Privilege

Her tehdit için: açıklama, etkilenen bileşen, saldırı senaryosu, CVSS v3.1 skoru, mitigation.

Ek olarak OWASP Top 10 (2021) kontrolü yap:
A01-A10 her kategori için durum (Compliant/Risk) ve gerekli fix.`,
          model: 'deepseek-reasoner',
          temperature: 0.4,
          maxTokens: 5000,
          tools: ['read_file'],
          inputs: `$recon.output`,
          expectedOutput: `STRIDE + OWASP threat raporu + CVSS skorları`,
        },
      },
      {
        id: 'fixer',
        type: 'agentNode',
        position: { x: 700, y: 50 },
        data: {
          label: `Fixer (Güvenlik Kodlayıcı)`,
          type: 'coder',
          systemPrompt: AGENT_PROMPTS.coder + `\n\nÖZELLEŞTİRME: Sadece güvenlik fix'leri üret. Input validation, output encoding, parameterized queries, CSP, CSRF token, rate limiting, secure headers. Her fix için diff formatında, OWASP mitigation uyumlu.`,
          model: 'deepseek-v4-pro',
          temperature: 0.3,
          maxTokens: 6000,
          tools: ['write_file', 'read_file'],
          inputs: `$analyzer.output`,
          expectedOutput: `Güvenlik diff'leri + fix açıklamaları`,
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'recon', target: 'analyzer', animated: true, label: 'attack surface' },
      { id: 'e2', source: 'analyzer', target: 'fixer', animated: true, label: 'threats' },
    ],
  },
  {
    name: 'Test-Driven Development',
    description: `Red-Green-Refactor döngüsü — test önce, kod sonra, refactor son`,
    nodes: [
      {
        id: 'test_first',
        type: 'agentNode',
        position: { x: 100, y: 100 },
        data: {
          label: `Test Yazıcı (RED)`,
          type: 'tester',
          systemPrompt: AGENT_PROMPTS.tester + `\n\nTDD RED fazı: Sadece FAILING test'ler yaz. Implementation yok. Test'ler gereksinimleri ifade etmeli. Verilen spesifikasyona göre edge case'ler dahil tüm senaryoları kapsa.`,
          model: 'deepseek-v4-pro',
          temperature: 0.3,
          maxTokens: 4000,
          tools: ['write_file'],
          inputs: `$user_input`,
          expectedOutput: `Failing test dosyaları (RED)`,
        },
      },
      {
        id: 'implementer',
        type: 'agentNode',
        position: { x: 400, y: 100 },
        data: {
          label: `Implementer (GREEN)`,
          type: 'coder',
          systemPrompt: AGENT_PROMPTS.coder + `\n\nTDD GREEN fazı: Test'leri GEÇEN minimum kodu yaz. Over-engineering yok. Sadece test'leri satisfy et. YAGNI prensibi.`,
          model: 'deepseek-v4-pro',
          temperature: 0.3,
          maxTokens: 5000,
          tools: ['write_file', 'read_file'],
          inputs: `$test_first.output`,
          expectedOutput: `Minimal implementation (GREEN)`,
        },
      },
      {
        id: 'refactorer',
        type: 'agentNode',
        position: { x: 700, y: 100 },
        data: {
          label: `Refactorer`,
          type: 'reviewer',
          systemPrompt: AGENT_PROMPTS.reviewer + `\n\nTDD REFACTOR fazı: Test'ler hala geçerken kodu iyileştir. SOLID, DRY, design patterns uygula. Duplikasyonu kaldır. Naming'i iyileştir. Complex fonksiyonları böl.`,
          model: 'deepseek-reasoner',
          temperature: 0.4,
          maxTokens: 4000,
          tools: ['write_file', 'read_file'],
          inputs: `$implementer.output`,
          expectedOutput: `Refactored kod + test hala geçiyor`,
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'test_first', target: 'implementer', animated: true, label: 'tests (RED)' },
      { id: 'e2', source: 'implementer', target: 'refactorer', animated: true, label: 'code (GREEN)' },
    ],
  },
  {
    name: 'Code Modernization Pipeline',
    description: `Legacy → Modern — analiz, plan, migrasyon, test, dokümantasyon`,
    nodes: [
      {
        id: 'legacy_analyzer',
        type: 'agentNode',
        position: { x: 100, y: 50 },
        data: {
          label: `Legacy Analizcisi`,
          type: 'researcher',
          systemPrompt: AGENT_PROMPTS.researcher + `\n\nÖZELLEŞTİRME: Legacy kodu analiz et — teknoloji debt, dependency age, code smells (Fowler), duplication, complexity metrics (cyclomatic, cognitive). Hangi kısımlar modernize edilmeli önceliklendir.`,
          model: 'deepseek-reasoner',
          temperature: 0.4,
          maxTokens: 4000,
          tools: ['read_file', 'list_files'],
          inputs: `$user_input`,
          expectedOutput: `Modernizasyon raporu + öncelik matrisi`,
        },
      },
      {
        id: 'migration_planner',
        type: 'agentNode',
        position: { x: 400, y: 50 },
        data: {
          label: `Migrasyon Planlayıcı`,
          type: 'planner',
          systemPrompt: AGENT_PROMPTS.planner + `\n\nÖZELLEŞTİRME: Strangler Fig pattern ile incremental migration planı. Her faz: risk, effort, rollback stratejisi. Backward compatibility korunmalı.`,
          model: 'deepseek-reasoner',
          temperature: 0.4,
          maxTokens: 3000,
          tools: ['list_files'],
          inputs: `$legacy_analyzer.output`,
          expectedOutput: `Strangler Fig migration planı`,
        },
      },
      {
        id: 'migrator',
        type: 'agentNode',
        position: { x: 700, y: 50 },
        data: {
          label: `Migratör`,
          type: 'coder',
          systemPrompt: AGENT_PROMPTS.coder + `\n\nÖZELLEŞTİRME: Modern stack'e migrasyon (örn: Class → Functional, JavaScript → TypeScript, Redux → Zustand, CSS → Tailwind). Her dosya için diff formatında, behavior preserved.`,
          model: 'deepseek-v4-pro',
          temperature: 0.3,
          maxTokens: 6000,
          tools: ['write_file', 'read_file'],
          inputs: `$migration_planner.output`,
          expectedOutput: `Modernize edilmiş kod (diff)`,
        },
      },
      {
        id: 'verifier',
        type: 'agentNode',
        position: { x: 1000, y: 50 },
        data: {
          label: `Doğrulayıcı (Critic)`,
          type: 'critic',
          systemPrompt: AGENT_PROMPTS.critic + `\n\nÖZELLEŞTİRME: Migration sonrası behavior preservation'ı doğrula. Edge case'ler çalışıyor mu? Performance regression var mı? Backward compatibility korundu mu?`,
          model: 'deepseek-reasoner',
          temperature: 0.5,
          maxTokens: 3000,
          tools: ['read_file'],
          inputs: `$migrator.output`,
          expectedOutput: `Doğrulama raporu + risk değerlendirmesi`,
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'legacy_analyzer', target: 'migration_planner', animated: true },
      { id: 'e2', source: 'migration_planner', target: 'migrator', animated: true },
      { id: 'e3', source: 'migrator', target: 'verifier', animated: true },
    ],
  },
];

export function findTemplateByName(name: string): AgentTree | undefined {
  return BUILTIN_AGENT_TEMPLATES.find((t) => t.name === name);
}

// ---------- Tree execution ----------

export function topologicalSort(nodes: AgentNode[], edges: AgentEdge[]): string[] {
  const inDegree: Record<string, number> = {};
  const adj: Record<string, string[]> = {};

  nodes.forEach((n) => {
    inDegree[n.id] = 0;
    adj[n.id] = [];
  });

  edges.forEach((e) => {
    adj[e.source]?.push(e.target);
    inDegree[e.target] = (inDegree[e.target] || 0) + 1;
  });

  const queue = nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id);
  const result: string[] = [];

  while (queue.length > 0) {
    const id = queue.shift()!;
    result.push(id);
    for (const next of adj[id] || []) {
      inDegree[next]--;
      if (inDegree[next] === 0) queue.push(next);
    }
  }

  return result;
}

export function resolveInputs(
  inputTemplate: string,
  context: { user_input: string; nodeOutputs: Record<string, string> }
): string {
  let result = inputTemplate;
  result = result.replace(/\$user_input/g, context.user_input);
  result = result.replace(
    /\$([a-zA-Z0-9_]+)\.output/g,
    (_, nodeId) => context.nodeOutputs[nodeId] || `[${nodeId}.output bekleniyor]`
  );
  return result;
}

export const NODE_STYLES: Record<
  AgentNodeType,
  { color: string; glow: string; icon: string; label: string }
> = {
  orchestrator: { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)', icon: 'Crown', label: 'Orchestrator' },
  researcher: { color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.6)', icon: 'Search', label: 'Araştırmacı' },
  coder: { color: '#10b981', glow: 'rgba(16, 185, 129, 0.6)', icon: 'Code2', label: 'Kodlayıcı' },
  reviewer: { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)', icon: 'Eye', label: 'İnceleyici' },
  tester: { color: '#ec4899', glow: 'rgba(236, 72, 153, 0.6)', icon: 'FlaskConical', label: 'Testçi' },
  planner: { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.6)', icon: 'ClipboardList', label: 'Planlayıcı' },
  executor: { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.6)', icon: 'Terminal', label: 'Çalıştırıcı' },
  critic: { color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.6)', icon: 'MessageSquareWarning', label: 'Eleştirmen' },
  custom: { color: '#64748b', glow: 'rgba(100, 116, 139, 0.6)', icon: 'Box', label: 'Özel' },
};
