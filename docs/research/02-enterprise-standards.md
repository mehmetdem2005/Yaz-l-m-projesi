# Kurumsal Standartlar — Kapsamlı Araştırma

> Bu doküman, AI Kod Üretim Stüdyosu (DeepSeek App Studio) projesi kapsamında, uygulanacak kurumsal mimari, güvenlik, kalite, veri koruma, yazılım geliştirme, AI/ML, DevOps ve SRE standartlarının derinlemesine araştırmasını içerir. Hedef, FAZ 2'de yazılacak 20 politika dosyası için referans çerçevesi sağlamaktır.

---

## 1. Giriş

### 1.1 Kurumsal Mimari Standartları Neden Gerekli?

Bir AI kod üretim stüdyosu, çok sayıda yüksek riskli alanı aynı anda yönetir: üçüncü taraf LLM API'leri (DeepSeek), kullanıcı kodu yürütme (sandbox), bulut barındırma, müşteri veri saklama, faturalandırma ve denetlenebilirlik. Bu karmaşıklık, kurumsal standartların olmaması durumunda aşağıdaki riskleri doğurur:

- **Görünürlük eksikliği**: Mimari kararların nerede, neden ve kim tarafından alındığı belgelenmezse, teknik borç büyür ve "spagetti mimari" oluşur.
- **Uyumluluk cezaları**: GDPR (4% küresel ciro veya 20M €), PCI-DSS (aylık 5.000–100.000 USD), HIPAA (ihlal başına 100–50.000 USD) cezaları ciddi finansal tehditlerdir.
- **Güvenlik açıkları**: Sistematik bir çerçeve olmadan OWASP Top 10'a girme olasılığı %70'in üzerindedir.
- **Müşteri güven kaybı**: Kurumsal müşteriler SOC 2 Type II raporu olmadan satın alma yapmazlar; bu da pazar erişimini kısıtlar.
- **Operasyonel kırılganlık**: SRE/SLO kültürü yoksa, incident response süreleri saatler yerine günler olabilir.
- **AI'ya özgü riskler**: Halüsinasyon, bias, prompt injection, model poisoning, veri sızıntısı gibi AI'a özgü tehditler ISO/IEC 42001 ve NIST AI RMF olmadan yönetilemez.

Kurumsal standartlar bu riskleri **ölçülebilir, denetlenebilir ve sürekli iyileştirilebilir** bir çerçeveye oturtarlar. Standartlar bir maliyet değil, bir **sigorta** ve **pazar erişim enstrümanıdır**.

### 1.2 AI Kod Üretim Stüdyosunda Hangi Standartlar Uygulanır?

AI stüdyosunun her katmanı için farklı standartlar geçerlidir:

| Katman | İlgili Standartlar |
|---|---|
| Strateji & Mimari | TOGAF 10, Zachman, ArchiMate, C4 Model |
| Bilgi Güvenliği Yönetimi | ISO/IEC 27001, NIST CSF 2.0, SOC 2 |
| Kalite Yönetimi | ISO 9001, ISO/IEC 25010 |
| AI Yönetimi | ISO/IEC 42001, NIST AI RMF, EU AI Act |
| Yazılım Güvenliği | OWASP Top 10, ASVS, SAMM, CWE Top 25 |
| Veri Koruma | GDPR, CCPA/CPRA, HIPAA, PCI-DSS |
| Bulut Güvenliği | ISO 27017, ISO 27018, FedRAMP, CIS Controls |
| IT Governance | COBIT 2019, ITIL 4 |
| DevOps/SRE | DORA Metrics, SRE Principles |
| İş Sürekliliği | ISO 22301 |

Bu dokümanın amacı, her bir standardın ne olduğunu, nasıl uygulanacağını ve AI stüdyosuna özgü hangi pratiklerin gerekli olduğunu detaylandırmaktır.

---

## 2. Mimari Standartlar

### 2.1 TOGAF (The Open Group Architecture Framework)

**Sürüm**: TOGAF 10 (2022 yayını; TOGAF 9.2'nin halefi). TOGAF 10, iki ana yapıdan oluşur: **Foundation Documents** (temel kavramlar) ve **Series Guides** (uygulama rehberleri).

#### 2.1.1 ADM (Architecture Development Method) — 8 Faz

ADM, TOGAF'ın kalbidir ve kurumsal mimariyi geliştirmek için tekrarlanabilir bir döngü sağlar:

1. **Preliminary (Hazırlık)**: Mimari vizyon, stakeholder analizi, organizasyonel bağlam, framework özelleştirme.
2. **Phase A — Architecture Vision**: İş sorunları, stakeholder concerns, baseline ve target vision.
3. **Phase B — Business Architecture**: İş süreçleri, organizasyon, fonksiyonel decomposition.
4. **Phase C — Information Systems Architectures**: Data Architecture + Application Architecture.
5. **Phase D — Technology Architecture**: Altyapı, platform, ağ, depolama.
6. **Phase E — Opportunities & Solutions**: Gap analizi, çözüm alternatifleri, roadmap.
7. **Phase F — Migration Planning**: Uygulama projeleri, dependency, maliyetlendirme.
8. **Phase G — Implementation Governance**: Proje yönetimi, compliance, architectural review.
9. **Phase H — Architecture Change Management**: Değişiklik talepleri, güncelleme.

**Requirements Management** çapraz faz olarak tüm döngüyü sarar.

#### 2.1.2 Content Framework

TOGAF Content Framework, mimari çıktıların (artifact) yapısını tanımlar:

- **Architecture Building Blocks (ABB)**: Yeniden kullanılabilir mimari bileşenler.
- **Solution Building Blocks (SBB)**: Somut ürün/servis karşılıkları.
- **Artifact types**: Catalog, Matrix, Diagram.
- **Metamodel**: Actor, Business Service, Application Component, Data Entity, Node, Technology Service.

#### 2.1.3 Enterprise Continuum

Mimari varlıkların soldan sağa giderek daha somutlaştığı spektrum:

```
Generic → Industry → Organization-Specific → Solution-Specific
Foundation Architectures → Common Systems Architectures → Industry Architectures → Organization-Specific Architectures
```

#### 2.1.4 AI Stüdyosunda Kullanımı

AI stüdyosu için TOGAF uygulama örneği:

- **Phase A**: "Geliştiriciler için çok-model AI kod üretim platformu" vizyonu; müşteri segmentleri (bireysel, ekip, enterprise).
- **Phase B**: İş süreçleri — prompt alımı, model routing, kod üretimi, sandbox yürütme, sonuç doğrulama, teslim.
- **Phase C (Data)**: Prompt logları, kullanıcı workspace'leri, model çağrı logları, faturalandırma verileri; (Application) — Next.js frontend, API gateway, model router, sandbox runner, billing service.
- **Phase D**: Kubernetes cluster, GPU node pool (isteğe bağlı), Redis cache, PostgreSQL/SQLite, S3 uyumlu depolama.
- **Phase E**: Build vs buy kararları (sandbox için Firecracker vs gVisor vs Docker), LLM gateway çözümü (LiteLLM vs Kong AI Gateway).
- **Phase F**: 12 aylık roadmap — Q1 MVP, Q2 sandbox, Q3 enterprise, Q4 SOC 2 Type II.
- **Phase G**: Her sprint için Architecture Review Board (ARB) onayı.
- **Phase H**: Yeni model ekleme (DeepSeek V5) için change management süreci.

### 2.2 Zachman Framework

John Zachman tarafından 1987'de tanıtılan, kurumsal mimari için **ontoloji**. 6 sorgu × 6 perspektif = 36 hücreden oluşur.

**6 Soru (Kolonlar)**:
1. **What** (Data/Entity) — Veri
2. **How** (Function/Process) — Fonksiyon
3. **Where** (Network/Distribution) — Ağ
4. **Who** (People/Org) — İnsan
5. **When** (Time) — Zaman
6. **Why** (Motivation) — Motivasyon

**6 Perspektif (Satırlar)**:
1. **Planner's View** (Scope) — Bağlam
2. **Owner's View** (Business Model) — Konsept
3. **Designer's View** (System Model) — Lojik
4. **Implementer's View** (Technology Model) — Fiziksel
5. **Builder's View** (Detailed Representations) — Bileşen
6. **Subcontractor's View** (Functioning Enterprise) — Operasyonel

**Stakeholder Mapping**: AI stüdyosunda her hücre bir takım sahibidir:
- Planner → CEO, CTO, yatırımcılar
- Owner → Ürün yöneticileri, iş analistleri
- Designer → Mimarlardan sorumlu baş mühendis
- Implementer → DevOps, platform mühendisleri
- Builder → Yazılım geliştiriciler
- Subcontractor → Operasyon, SRE ekibi

### 2.3 ArchiMate

The Open Group'ün sponsorladığı, kurumsal mimari için **görsel modelleme dili**. UML'in aksine iş katmanından teknoloji katmanına kadar tutarlı bir gösterim sunar.

**3 Ana Katman**:
1. **Business Layer**: Business Actor, Role, Business Service, Business Process, Business Object.
2. **Application Layer**: Application Component, Application Service, Data Object, Interface.
3. **Technology Layer**: Node, Device, System Software, Network, Infrastructure Service, Artifact.

**Ek katmanlar**: Strategy (Resource, Capability, Course of Action, Value Stream), Physical (Equipment, Facility, Distribution Network), Motivation (Stakeholder, Driver, Assessment, Goal, Requirement, Constraint), Implementation & Migration (Work Package, Deliverable, Gap, Plateau).

**Modeling Notation Özellikleri**: Yuvarlak köşeli kutular, ok tipleri (serving, realization, assignment, aggregation, composition, triggering, flow, access, association), renk kodlaması katmanları belirtir.

AI stüdyosu örneği:
- Business Actor: "Geliştirici"
- Business Service: "Kod Üretimi"
- Application Component: "Model Router", "Sandbox Runner"
- Data Object: "Prompt", "Generated Code"
- Node: "K8s Worker Node"
- Artifact: "Docker Image", "Build Artifact"

### 2.4 C4 Model

Simon Brown tarafından geliştirilen, yazılım mimarisini 4 zoom seviyesinde anlatan yaklaşım. UML'in karmaşıklığına karşı bir tepkidir.

**4 Seviye**:
1. **Context**: Sistem ve dış aktörler (kullanıcılar, harici sistemler). AI stüdyosu için: Geliştirici → AI Studio → DeepSeek API, GitHub, Stripe.
2. **Container**: Deployable birimler (web app, API, database, message broker). AI stüdyosu için: Next.js Web, API Gateway, Postgres, Redis, Sandbox Pool, Billing Worker.
3. **Component**: Container içindeki modüller. API Gateway içinde: Auth Service, Rate Limiter, Model Router, Prompt Sanitizer.
4. **Code**: Sınıf ve interface seviyesi (opsiyonel, generated).

**AI Stüdyosunda Uygulama**:

```
Level 1 — Context:
  [Developer] --> [AI Studio] --> [DeepSeek API]
                              --> [GitHub API]
                              --> [Stripe]
                              --> [AWS S3]

Level 2 — Container:
  [Browser SPA] <--> [Next.js App]
                     [API Gateway] <--> [Postgres]
                                       [Redis]
                                       [Sandbox Runner] (gVisor)
                                       [Billing Worker]
                                       [LLM Proxy]

Level 3 — Component (API Gateway):
  - AuthMiddleware
  - RateLimiter
  - PromptSanitizer
  - ModelRouter (DeepSeek chat / reasoner / V4 Pro / V4 Flash)
  - ResponseValidator
  - UsageLogger
```

---

## 3. ISO Standartları

### 3.1 ISO/IEC 27001 — Information Security Management

ISO 27001, bir kurumun **Bilgi Güvenliği Yönetim Sistemi (ISMS)** kurması ve sürdürmesi için uluslararası standarttır. 2022 versiyonu günceldir (ISO/IEC 27001:2022).

**ISMS Yapısı (High-Level Structure, Annex SL)**:
- Clause 4: Context of the organization
- Clause 5: Leadership
- Clause 6: Planning (risk assessment)
- Clause 7: Support (resources, competence, awareness, communication, documented information)
- Clause 8: Operation
- Clause 9: Performance evaluation
- Clause 10: Improvement

**Annex A Kontrolleri (2022 — 93 kontrol)**: Eski 114 kontrol 93'e düşürüldü, 11 yeni eklendi. 4 tema:
1. **Organizational controls** (37 kontrol)
2. **People controls** (8 kontrol)
3. **Physical controls** (14 kontrol)
4. **Technological controls** (34 kontrol)

Önemli yeni kontroller:
- A.5.7 Threat intelligence
- A.5.23 Information security for use of cloud services
- A.8.9 Configuration management
- A.8.10 Information deletion
- A.8.11 Data masking
- A.8.12 Data leakage prevention
- A.8.16 Monitoring activities
- A.8.23 Web filtering
- A.8.25 Secure development life cycle
- A.8.28 Secure coding

**Risk Assessment Metodolojisi**:
1. Varlık tespiti (information assets)
2. Tehdit ve zafiyet analizi
3. Risk = Likelihood × Impact matrisi
4. Risk treatment: Accept / Mitigate / Transfer / Avoid
5. Statement of Applicability (SoA) — hangi kontrollerin uygulanacağı

AI stüdyosu için temel varlıklar: prompt veritabanı, model API key'leri, kullanıcı kodu, sandbox çıktıları, müşteri fatura verileri, loglar.

### 3.2 ISO/IEC 9001 — Quality Management

Kalite yönetim sistemi standardı. 2015 versiyonu günceldir.

**PDCA Döngüsü (Plan-Do-Check-Act)**:
- **Plan**: Hedefleri belirle, süreçleri tasarla
- **Do**: Uygula
- **Check**: İzle, ölç, denetle
- **Act**: İyileştir

**7 Kalite Prensibi**:
1. Customer focus
2. Leadership
3. Engagement of people
4. Process approach
5. Improvement
6. Evidence-based decision making
7. Relationship management

**Süreç Yaklaşımı**: Girdi → Süreç → Çıktı → Ölçüm → İyileştirme döngüsü. AI stüdyosunda her özellik için: gereksinim (input) → geliştirme (process) → release (output) → DORA metrics (measure) → retrospektif (improve).

### 3.3 ISO/IEC 27017 — Cloud Security

Bulut servis sağlayıcılar ve müşterileri için ISO/IEC 27002'yi genişletir. 37 ek kontrol içerir:

- **CLD.5.1**: Bulut servis sağlayıcı ve müşteri arasındaki sorumluluk paylaşımı
- **CLD.6.3**: Müşteri sanal ortamının segregasyonu
- **CLD.6.4**: Sanal ortamın sanal makine ve sanal ağ segregasyonu
- **CLD.8.5**: Müşteri verisinin ayrılması
- **CLD.9.5**: Sanval makine lifecycle
- **CLD.12.1**: Bulut servisi için identity ve access management
- **CLD.12.3**: Müşteri arasında segregasyon
- **CLD.13.1**: SaaS, PaaS, IaaS için farklı SANS

AI stüdyosu SaaS olarak sunulduğunda ISO 27017 uyumu, müşteri verilerinin ayrılması ve tenant isolation için kritiktir.

### 3.4 ISO/IEC 27018 — PII Protection in Cloud

Bulut ortamında kişisel veri (PII) işleyen servis sağlayıcılar için ISO/IEC 27002'yi genişletir. 25 kontrol içerir:

- A.1.1: Müşterinin PII işleme amaçının netleştirilmesi
- A.2.1: PII'nin yeniden kullanılmaması
- A.4.1: Veri transferi kısıtlamaları
- A.5.1: Alt-işlemci onayı
- A.6.1: PII return/transfer/deletion süreci
- A.7.2: PII erişimine ilişkin disclosure
- A.8.4: Disclosed PII için işleme kaydı

GDPR ile yüksek oranda uyumludur; ikisi birlikte uygulanmalıdır.

### 3.5 ISO/IEC 42001 — AI Management System

**Yayın**: Aralık 2023. Dünyanın ilk AI yönetim sistemi standardı.

ISO 27001 ile aynı High-Level Structure (Annex SL) kullanır; bu nedenle entegrasyonu kolaydır.

**Ana unsurlar**:
- AI policy ve AI governance committee
- AI risk ve impact assessment
- AI system lifecycle yönetimi (data, model, deployment, monitoring, retirement)
- Transparency ve explainability
- Human oversight
- AI incident response

**AI Risk Yönetimi**: ISO/IEC 23894 ile birlikte uygulanır. AI'a özgü riskler:
- Bias ve discrimination
- Hallucination
- Robustness eksikliği (adversarial attack)
- Privacy leakage (model inversion, membership inference)
- Concept drift
- Model poisoning
- Prompt injection
- Data poisoning

AI stüdyosu hem tedarikçi (müşterilere AI sunar) hem de tüketicidir (DeepSeek modellerini kullanır); bu yüzden ISO 42001 çift taraflı geçerlidir.

### 3.6 ISO/IEC 25010 — Software Quality Model

SQuaRE (Software product Quality Requirements and Evaluation) ailesinin çekirdek standardı. Yazılım kalitesini **8 karakteristik** ile tanımlar:

1. **Functional suitability** — Functional completeness, correctness, appropriateness
2. **Performance efficiency** — Time behavior, resource utilization, capacity
3. **Compatibility** — Co-existence, interoperability
4. **Usability** — Appropriateness recognizability, learnability, operability, user error protection, user interface aesthetics, accessibility
5. **Reliability** — Maturity, availability, fault tolerance, recoverability
6. **Security** — Confidentiality, integrity, non-repudiation, accountability, authenticity
7. **Maintainability** — Modularity, reusability, analysability, modifiability, testability
8. **Portability** — Adaptability, installability, replaceability

AI stüdyosu için metrik örnekleri:
- Performance: P95 yanıt süresi < 3 sn, saniyede 100 prompt
- Reliability: %99.9 uptime, otomatik fallback
- Security: OWASP Top 10'a %0 güvenlik açığı
- Maintainability: %80+ test coverage, cyclomatic complexity < 15

### 3.7 ISO 22301 — Business Continuity

İş sürekliliği yönetim sistemi (BCMS) standardı. 2019 versiyonu günceldir.

**Lifecycle**:
1. Business Impact Analysis (BIA) — RTO (Recovery Time Objective), RPO (Recovery Point Objective)
2. Risk assessment
3. Business continuity strategy
4. Business Continuity Plan (BCP)
5. Disaster Recovery Plan (DRP)
6. Test, exercise, maintenance

AI stüdyosu için BCP örnekleri:
- DeepSeek API kesintisi → Anthropic / OpenAI fallback
- Bulut region çökmesi → multi-region failover
- Veritabanı kaybı → point-in-time recovery (PITR), RPO 5 dk
- DNS劫持 → DNSSEC, secondary DNS

---

## 4. Güvenlik & Compliance Standartları

### 4.1 SOC 2 (System and Organization Controls 2)

AICPA (American Institute of CPAs) tarafından yayınlanmıştır. **Trust Services Criteria (TSC)** üzerine kuruludur.

**5 Kriter**:
1. **Security** (zorunlu) — Confidencialité, intégrité, disponibilité
2. **Availability** — Sistemin erişilebilirliği
3. **Processing Integrity** — Verinin doğru, tam ve zamanında işlenmesi
4. **Confidentiality** — Gizli bilgilerin korunması
5. **Privacy** — PII'nin toplanması, kullanımı, saklanması, açıklanması, imhası

**İki Rapor Tipi**:
- **Type I**: Belirli bir anda tasarımın uygunluğu (point-in-time)
- **Type II**: En az 6 ay süresince tasarımın VE işletimin etkinliği

Süreç: Readiness assessment → 6-12 ay gözlem dönemi → Audit → Report.

AI stüdyosu için SOC 2 Type II minimum gerekliliktir; müşteri sözleşmelerinde sıkça istenir.

### 4.2 NIST Cybersecurity Framework (CSF) 2.0

Şubat 2024'te yayınlandı; 2014 v1.1'in yerine geçti. En önemli değişiklik: **Govern** fonksiyonunun eklenmesi ve supply chain risk yönetimi.

**6 Fonksiyon**:
1. **Govern (GV)** — Strategy, policy, risk management, roles, supply chain risk
2. **Identify (ID)** — Asset management, risk assessment, improvements
3. **Protect (PR)** — Identity management, awareness, data security, platform security
4. **Detect (DE)** — Continuous monitoring, adverse event analysis
5. **Respond (RS)** — Incident management, analysis, mitigation, reporting
6. **Recover (RC)** — Incident recovery, improvements

Her fonksiyon **Categories** ve **Subcategories**'e ayrılır; örnek: PR.AA ("Identity Management, Authentication, and Access Control") altında PR.AA-01, PR.AA-02 vb.

**Implementation Tiers** (1-4): Partial, Risk Informed, Repeatable, Adaptive.

**Profiles**: Current Profile vs Target Profile ile gap analizi yapılır.

### 4.3 NIST SP 800-53

Federal sistemler için güvenlik ve privacy kontrol kataloğu. Rev. 5 (2020) günceldir. **18 kontrol ailesi**, 1000+ kontrol içerir:

- AC (Access Control)
- AT (Awareness and Training)
- AU (Audit and Accountability)
- CA (Assessment, Authorization, Monitoring)
- CM (Configuration Management)
- CP (Contingency Planning)
- IA (Identification and Authentication)
- IR (Incident Response)
- MA (Maintenance)
- MP (Media Protection)
- PE (Physical and Environmental Protection)
- PL (Planning)
- PS (Personnel Security)
- PT (PII Processing and Transparency)
- RA (Risk Assessment)
- SA (System and Services Acquisition)
- SC (System and Communications Protection)
- SI (System and Information Integrity)

**Control Enhancement**: Her kontrolün low/moderate/high baseline seviyeleri vardır. AI stüdyosu moderate baseline'ı hedeflemelidir (SI-4 entropy, AU-12 audit record, vb.).

### 4.4 NIST AI RMF (AI Risk Management Framework)

Ocak 2023'te yayınlandı. Voluntary framework. **4 Fonksiyon**:

1. **Govern (GV)** — Culture, policy, governance structure
2. **Map (MP)** — Context, impact, stakeholders
3. **Measure (MS)** — Performance, robustness, bias, fairness
4. **Manage (MG)** — Risk treatment, response

Her fonksiyon için kategoriler ve alt kategoriler. AI stüdyosu için Map aşamasında DeepSeek modellerinin eğitim verisi, kullanım alanı, sınırları belgelenmelidir.

### 4.5 COBIT 2019

ISACA'nın IT governance framework'ü. COBIT 5'in halefi.

**5 Governance Principles**:
1. Provide stakeholder value
2. Holistic approach (end-to-end)
3. Dynamic governance system
4. Tailored to enterprise needs
5. End-to-end governance system

**Design Factors** (7 faktör):
1. Enterprise strategy
2. Enterprise goals
3. Risk profile
4. IT-related issues
5. Threat landscape
6. Compliance requirements
7. Use of technology

**40 Governance and Management Objectives (GMO)** — domains EDM, APO, BAI, DSS, MEA. Her GMO için RACI, goals, metrics.

AI stüdyosu için: APO03 (Enterprise architecture), BAI03 (Managed solutions identification and build), DSS06 (Managed business process controls), MEA01 (Managed performance and conformance) kritik.

### 4.6 ITIL 4

AXELOS'un IT service management framework'ü. 2019'da yayınlandı.

**Service Value System (SVS)**: Opportunity, demand → Value. Bileşenler:
- Guiding principles
- Governance
- Service value chain
- Practices
- Continual improvement

**7 Guiding Principles**:
1. Focus on value
2. Start where you are
3. Progress iteratively with feedback
4. Collaborate and promote visibility
5. Think and work holistically
6. Keep it simple and practical
7. Optimize and automate

**34 Management Practices** — 14 general, 17 service, 3 technical management practice. Önemlileri:
- Incident management
- Problem management
- Change enablement
- Service level management
- Service desk
- Release management
- Deployment management
- Monitoring and event management
- Information security management
- Continual improvement

AI stüdyosu için ITIL 4 ile service desk (Zendesk/Linear), incident response runbook, change advisory board (CAB) süreçleri kurulur.

---

## 5. Veri Koruma & Gizlilik

### 5.1 GDPR (General Data Protection Regulation)

Avrupa Birliği genel veri koruma yönetmeliği. 25 Mayıs 2018'de yürürlüğe girdi. Tüm AB sakinlerine uygulandığı için global önem taşır.

**7 Prensip (Article 5)**:
1. Lawfulness, fairness, transparency
2. Purpose limitation
3. Data minimisation
4. Accuracy
5. Storage limitation
6. Integrity and confidentiality
7. Accountability

**8 Veri Sahibi Hakkı (Data Subject Rights)**:
1. Right to be informed (Articles 13-14)
2. Right of access (Article 15)
3. Right to rectification (Article 16)
4. Right to erasure (Article 17) — "right to be forgotten"
5. Right to restrict processing (Article 18)
6. Right to data portability (Article 20)
7. Right to object (Article 21)
8. Rights related to automated decision-making including profiling (Article 22)

**DPIA (Data Protection Impact Assessment) Süreci** (Article 35):
1. Risk identification
2. Risk evaluation (likelihood, severity)
3. Mitigation measures
4. Consultation with DPO
5. Supervisory authority consultation (yüksek risk varsa)

**ROPA (Records of Processing Activities)** (Article 30): Her veri işleme aktivitesi için kayıt tutulmalı:
- Processing purpose
- Data categories
- Data subjects
- Recipients
- International transfers
- Retention period
- Security measures

AI stüdyosu için kritik noktalar:
- Prompt'larda PII işlenebilir → data minimisation zorunlu
- Kullanıcı kodu silebilir → erasure right otomasyonu
- Model eğitimi için prompt kullanımı → purpose limitation
- DeepSeek (Çin) API çağrısı → international transfer (SCC gerekli)

### 5.2 CCPA / CPRA (California Consumer Privacy Act / California Privacy Rights Act)

California'da 1 Ocak 2020 (CCPA) ve 1 Ocak 2023 (CPRA) yürürlük. AB dışındaki en güçlü gizlilik yasası.

**Kapsam**: Yıllık 25 M+ USD ciro, 100.000+ tüketici verisi, veya 50%+ gelir veri satışından.

**Tüketici Hakları**:
1. Right to know (collection, sale, disclosure)
2. Right to delete
3. Right to opt-out of sale
4. Right to opt-out of targeted advertising (CPRA)
5. Right to limit use of sensitive personal information (CPRA)
6. Right to non-discrimination
7. Right to correct (CPRA)

**Sensitive Personal Information (SPI)**: SSN, driver's license, financial account, precise geolocation, racial/ethnic origin, religious beliefs, biometric, health, sex life/orientation.

### 5.3 HIPAA (Health Insurance Portability and Accountability Act)

ABD'de 1996'da yürürlüğe girdi. **Protected Health Information (PHI)** korur.

**Ana Kurallar**:
1. **Privacy Rule** — 45 CFR 164.500: PHI'nin kullanımı ve açıklanması
2. **Security Rule** — 45 CFR 164.302: ePHI (electronic PHI) teknik, fiziksel, idari korumalar
3. **Breach Notification Rule** — 60 gün içinde bildirim
4. **Omnibus Rule** — Business Associate (BA) sorumlulukları

**Security Rule 3 Kategori**:
- **Administrative safeguards** (45 CFR 164.308): Risk assessment, training, contingency plan
- **Physical safeguards** (45 CFR 164.310): Facility access, workstation security, device controls
- **Technical safeguards** (45 CFR 164.312): Access control, audit controls, integrity, authentication, transmission security

**Business Associate Agreement (BAA)**: HIPAA-covered entity'nin vendor'ı ile imzalaması zorunlu. AI stüdyosu sağlık alanında müşteri varsa BAA sunmalı; DeepSeek BAA imzalamayabilir, bu durumda architectural workaround gerekir (örneğin PHI'siz prompt'lar).

### 5.4 PCI-DSS v4.0

Payment Card Industry Data Security Standard. Mart 2022'de yayınlandı (v3.2.1'in halefi). Tüm ödeme kartı verisi işleyen kuruluşlar için zorunlu.

**12 Requirement (v4.0)**:

1. Install and maintain network security controls (firewalls)
2. Apply secure configurations to all network components
3. Protect stored account data
4. Protect cryptographic keys used for account data
5. Protect all systems and networks from malicious software
6. Develop and maintain secure systems and software
7. Enforce access control measures
8. Identify users and authenticate access
9. Restrict physical access
10. Log and monitor all access
11. Test security regularly
12. Support information security with organizational policy

**Cardholder Data (CHD)**: Primary Account Number (PAN), cardholder name, expiration date, service code. **Sensitive Authentication Data (SAD)**: full magnetic stripe, CVV/CVC, PIN — bunlar saklanamaz (authorization sonrası imha).

**Tokenization**: AI stüdyosu Stripe / Adyen gibi PCI-compliant processor kullanırsa, kendi PCI scope'unu minimize eder. Sağlanması gereken: SAQ-A (en düşük scope).

### 5.5 FedRAMP (Federal Risk and Authorization Management Program)

ABD federal bulut servisleri için yetkilendirme programı. 2011'de kuruldu.

**3 Impact Level**:
- **Low**: Non-sensitive data
- **Moderate**: CUI (Controlled Unclassified Information) — majority of agencies
- **High**: En sensitive CUI, mission critical

Süreç: 3PAO (Third-Party Assessment Organization) denetimi → JAB (Joint Authorization Board) veya agency authorization → continuous monitoring.

AI stüdyosu federal müşteri hedefliyorsa FedRAMP Moderate minimumdur. Maliyet: 1-3 M USD, 12-24 ay.

---

## 6. Yazılım Geliştirme Standartları

### 6.1 OWASP Top 10 (2021)

Web uygulamaları için en kritik 10 güvenlik riski.

- **A01: Broken Access Control** — IDOR, missing function level authorization. Mitigation: server-side authorization, deny by default, JWT validation.
- **A02: Cryptographic Failures** — Plaintext transmission, weak algorithms. Mitigation: TLS 1.3, AES-256, no MD5/SHA1, KMS-managed keys.
- **A03: Injection** — SQL, NoSQL, OS command, LDAP. Mitigation: parameterized queries, ORM, input validation.
- **A04: Insecure Design** — Threat modeling eksikliği. Mitigation: STRIDE, secure design patterns.
- **A05: Security Misconfiguration** — Default credentials, verbose errors. Mitigation: hardened baselines, IaC scanning.
- **A06: Vulnerable and Outdated Components** — Eski paketler. Mitigation: SCA (Snyk, Dependabot), SBOM.
- **A07: Identification and Authentication Failures** — Weak passwords, session fixation. Mitigation: MFA, bcrypt/Argon2, secure cookies.
- **A08: Software and Data Integrity Failures** — Unsigned updates, insecure deserialization. Mitigation: signed artifacts, Sigstore.
- **A09: Security Logging and Monitoring Failures** — Audit log eksikliği. Mitigation: SIEM, alerting.
- **A10: Server-Side Request Forgery (SSRF)** — Sunucunun harici URL fetch etmesi. Mitigation: allowlist DNS, network policy, metadata endpoint block.

AI stüdyosu için ek riskler (OWASP LLM Top 10 — 2023): Prompt injection, insecure output handling, training data poisoning, model DoS, supply chain vulnerabilities, sensitive info disclosure, insecure plugin design, excessive agency, overreliance, model theft.

### 6.2 OWASP ASVS (Application Security Verification Standard)

Uygulama güvenlik doğrulama standardı. v4.0.3 günceldir. **3 Level**:

- **Level 1**: Opportunistic attackers'a karşı temel güvenlik.低保. ~110 requirement.
- **Level 2**: Standard security. Most applications. ~250 requirement.
- **Level 3**: High-security applications (bankacılık, sağlık, askeri). ~286 requirement.

**14 Bölüm**: V1 Architecture, V2 Authentication, V3 Session Management, V4 Access Control, V5 Validation, V6 Cryptography, V7 Error Handling, V8 Data Protection, V9 Communications, V10 Malicious Code, V11 Business Logic, V12 Files & Resources, V13 API & Web Service, V14 Configuration.

AI stüdyosu için V4 (Access Control), V5 (Validation — prompt injection), V12 (Files — sandbox), V13 (API — model API) kritiktir. Hedef: ASVS Level 2.

### 6.3 OWASP SAMM (Software Assurance Maturity Model)

Yazılım güvenliği olgunluk modeli. v2 güncel.

**5 Business Function**:
1. **Governance**: Strategy & Metrics, Policy & Compliance, Education & Guidance
2. **Design**: Threat Assessment, Security Requirements, Secure Architecture
3. **Implementation**: Secure Build, Secure Deployment, Defect Management
4. **Verification**: Architecture Assessment, Requirements-driven Testing, Security Testing
5. **Operations**: Incident Management, Operational Management, Environment Management

**15 Security Practice** — her biri için 3 maturity level (1-3) ve 2 stream. AI stüdyosu SAMM ile 12 aylık yol haritası çıkarır.

### 6.4 CWE — Common Weakness Enumeration

MITRE tarafından geliştirilen yazılım zafiyet kategorileri taksonomisi. 1400+ CWE var.

**CWE Top 25 Most Dangerous Software Weaknesses (2024)**:
1. CWE-78 OS Command Injection
2. CWE-79 Cross-site Scripting
3. CWE-89 SQL Injection
4. CWE-20 Improper Input Validation
5. CWE-22 Path Traversal
6. CWE-787 Out-of-bounds Write
7. CWE-125 Out-of-bounds Read
8. CWE-287 Improper Authentication
9. CWE-416 Use After Free
10. CWE-352 CSRF
11. CWE-190 Integer Overflow
12. CWE-862 Missing Authorization
13. CWE-476 NULL Pointer Dereference
14. CWE-306 Missing Authentication for Critical Function
15. CWE-119 Memory Buffer Errors
16. CWE-200 Information Exposure
17. CWE-732 Incorrect Permission Assignment
18. CWE-522 Insufficiently Protected Credentials
19. CWE-798 Hard-coded Credentials
20. CWE-502 Deserialization of Untrusted Data
21. CWE-269 Improper Privilege Management
22. CWE-863 Incorrect Authorization
23. CWE-285 Improper Authorization
24. CWE-918 SSRF
25. CWE-295 Improper Certificate Validation

### 6.5 CIS Controls v8

Center for Internet Security tarafından yayınlanan. 18 kontrol, 153 safeguard (Implementation Group 1-3).

**18 Kontrol**:
1. Inventory and Control of Enterprise Assets
2. Inventory and Control of Software Assets
3. Data Protection
4. Secure Configuration of Enterprise Assets and Software
5. Account Management
6. Access Control Management
7. Continuous Vulnerability Management
8. Audit Log Management
9. Email and Web Browser Protections
10. Malware Defenses
11. Data Recovery
12. Network Infrastructure Management
13. Network Monitoring and Defense
14. Security Awareness and Skills Training
15. Service Provider Management
16. Application Software Security
17. Incident Response Management
18. Penetration Testing

Implementation Groups:
- **IG1**: SMB, basit
- **IG2**: Orta ölçek
- **IG3**: Mature, kurumsal

AI stüdyosu IG2 minimum, enterprise tier için IG3 hedef.

---

## 7. AI/ML Standartları

### 7.1 EU AI Act

Avrupa Birliği AI Yasası. Mart 2024'te kabul edildi; aşamalı yürürlük (2025-2027).

**Risk-Based 4 Seviye**:

1. **Unacceptable risk** (yasak): Sosyal skorlama, manipülatif AI, gerçek zamanlı biyometrik tanımlama (istisnalar hariç). Yürürlük: 6 ay sonra.
2. **High-risk** (katı yükümlülük): Kritik altyapı, eğitim, istihdam, essential services, kolluk kuvvetleri, göçmenlik, adalet, demokratik süreçler. Yükümlülükler: risk assessment, veri kalitesi, log, transparency, human oversight, accuracy, robustness, cybersecurity. Yürürlük: 24 ay sonra.
3. **Limited risk** (transparency): Chatbotlar, deepfake, emotion recognition. Yükümlülük: kullanıcının AI ile etkileşimde olduğunu bilgilendirme.
4. **Minimal risk** (serbest): Spam filtreleri, oyun AI, vb.

**GPAI (General Purpose AI) Model Özel Kurallar**: GPT-4, DeepSeek gibi modeller için ek yükümlülükler: teknik dokümantasyon, training data özeti, copyright compliance. **Systemic risk** (10^25 FLOPS eğitilmiş) için ek yükümlülükler.

AI stüdyosu GPAI dağıtıcı olarak sınıflandırılır; bu yüzden model cards, training data summaries, downstream compliance gerekir.

### 7.2 NIST AI RMF

(4.4'te detaylandırıldı.) AI lifecycle: Plan, Design, Develop, Validate, Deploy, Operate, Monitor, Retire. AI RMF her fazda uygulanır.

**AI RMF Playbook**: NIST 2024'te Generative AI Profile (NIST AI 600-1) yayınladı. 12 risk kategorisi: CBRN information, confabulation, dangerous/violent/hateful content, data privacy, environmental impact, harmful bias, human-AI configuration, information integrity, information security, intellectual property, obscene/degrading/abusive content, value chain & component integration.

### 7.3 ISO/IEC 23894 — AI Risk Management

Şubat 2023. ISO 31000 (risk management) temelinde AI'a uyarlanmış. ISO 42001 ile birlikte kullanılır.

**Risk Yönetim Süreci**:
1. Communication & consultation
2. Scope, context, criteria
3. Risk assessment (identification, analysis, evaluation)
4. Risk treatment
5. Monitoring & review
6. Recording & reporting

**AI'a özgü risk kaynakları**: training data, model architecture, deployment environment, downstream usage, supply chain.

### 7.4 IEEE 7000 Series — Ethical AI

IEEE Ethically Aligned Design girişimi. Çok sayıda spesifik standardın kümesi:

- **IEEE 7000-2021**: Model Process for Addressing Ethical Concerns During System Design
- **IEEE 7001-2021**: Transparency of Autonomous Systems
- **IEEE 7002-2021**: Data Privacy Process
- **IEEE 7003-2024**: Algorithmic Bias Considerations
- **IEEE 7004-2021**: Child & Student Data Governance
- **IEEE 7005-2021**: Employer Data Governance
- **IEEE 7010-2020**: Wellbeing Impact Assessment
- **IEEE 7011-2023**: Procurement
- **IEEE 7012-2024**: Machine Readable Privacy Terms
- **IEEE 7014-2020**: Empathic AI
- **IEEE 7102-2024**: Neurotechnological governance

### 7.5 Partnership on AI Tenets

Partnership on AI (PAI) — Google, Amazon, Meta, Microsoft, Apple gibi şirketler tarafından 2016'da kuruldu. **8 Tenet**:

1. AI insanlık için faydalı olmalı
2. Adil, şeffaf, açıklanabilir
3. Araştırmacılar arasında iş birliği
4. Şeffaf ve sorumlu paylaşım
5. Topluma fayda
6. AI güvenliği ve güvenilirliği
7. AI risk ve fırsatların anlaşılması
8. İnsan onayı ve hesap verebilirlik

AI stüdyosu kendi AI ilkelerini PAI Tenets üzerine kurabilir.

---

## 8. DevOps & SRE

### 8.1 SRE (Site Reliability Engineering)

Google tarafından 2003'te başlatılan disiplin. "Bir mühendislik problemi olarak operasyon".

**SLI (Service Level Indicator)**: Ölçülebilir metrik. Örnek: HTTP 200 oranı, P95 latency, hata oranı.

**SLO (Service Level Objective)**: İç hedef. Örnek: 30 günde %99.9 başarı oranı, P95 < 500 ms.

**SLA (Service Level Agreement)**: Müşteri sözleşmesi. Örnek: %99.5 aylık uptime, aksi halde %10 service credit.

**Error Budget**: SLO %99.9 ise %0.1 error budget. Budget tükenirse feature freeze, sadece stability çalışması.

**Toil Reduction**: Toil = otomatik, tekrarlayan, değer üretmeyen iş. Hedef: toil < %50 ops zamanı. Her toil için automation backlog'a eklenir.

**SRE Practice for AI Studio**:

```yaml
service: ai-studio-frontend
SLI:
  - request_success_rate >= 0.999
  - p95_latency_ms <= 500
  - p99_latency_ms <= 1500
SLO: 30-day window
SLA: 99.5% uptime monthly (signed with customer)
error_budget_remaining: 43 minutes/month
```

### 8.2 DORA Metrics

Google'ın DORA (DevOps Research and Assessment) ekibi tarafından tanımlandı. 4 temel metrik:

1. **Deployment Frequency** — Ne sıklıkta production deploy. Elite: multiple per day.
2. **Lead Time for Changes** — Commit → production. Elite: < 1 hour.
3. **Change Failure Rate** — Fail eden deploy oranı. Elite: < 15%.
4. **Mean Time to Recovery (MTTR)** — Incident → restore. Elite: < 1 hour.

2021'de 2 ek metrik: **Reliability** (SLO adherence) ve **Security** (shift-left effectiveness).

AI stüdyosu hedefleri:
- Daily deploy (CI/CD pipeline with auto-tests)
- Lead time < 2 saat (PR → merge → deploy)
- CFR < 10% (blue-green + canary)
- MTTR < 30 dk (runbook-driven incident response)

### 8.3 DevSecOps

DevOps'a güvenlik entegrasyonu. **Shift-left security**: Güvenliği SDLC'nin sonundan başına taşır.

**Pipeline Aşamaları**:

1. **Plan**: Threat modeling (STRIDE), abuse case analysis
2. **Code**: IDE plugins (Snyk, SonarLint), secret scanning (gitleaks), pre-commit hooks
3. **Build**: SAST (SonarQube, Semgrep), SCA (Snyk, Dependabot), license compliance
4. **Test**: DAST (OWASP ZAP, Burp), fuzzing, API security testing
5. **Deploy**: Container scanning (Trivy, Grype), IaC scanning (Checkov, tfsec), policy-as-code (OPA)
6. **Operate**: Runtime protection (Falco), WAF, EDR, SIEM
7. **Monitor**: Threat intelligence, anomaly detection, SOC

**AI Stüdyosu Pipeline Örneği**:

```yaml
# .github/workflows/security.yml
name: DevSecOps Pipeline
on: [push, pull_request]
jobs:
  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: gitleaks/gitleaks-action@v2
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: SonarSource/sonarqube-scan-action@v2
  sca:
    runs-on: ubuntu-latest
    steps:
      - uses: snyk/actions/node@v0.4.0
  container-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ github.repository }}:latest
  iac-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: bridgecrewio/checkov-action@v12
  dast:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: zaproxy/action-baseline@v0.7.0
```

---

## 9. AI Stüdyosu İçin Uygulanabilir Standart Matrisi

| Senaryo | Mimari | Güvenlik | Kalite | Veri Koruma | Yazılım Güvenliği | AI Yönetimi | DevOps |
|---|---|---|---|---|---|---|---|
| **Hızlı prototip (MVP)** | C4 Model (Level 1-2) | ISO 27001 (temel), CIS IG1 | ISO 25010 (temel) | GDPR temel | OWASP Top 10 | NIST AI RMF (Map) | DORA (ortalama) |
| **Kurumsal prod (genel)** | TOGAF ADM (Phase A-H), ArchiMate | ISO 27001, NIST CSF 2.0, SOC 2 Type II | ISO 9001, ISO 25010 | GDPR + CCPA | OWASP Top 10 + ASVS L2 + SAMM | ISO 42001, NIST AI RMF (tüm) | SRE (SLO/SLA) + DORA (Elite) |
| **Fintech** | TOGAF + Zachman | ISO 27001, NIST CSF, NIST 800-53 moderate | ISO 9001, ISO 25010 (yüksek) | GDPR + PCI-DSS v4.0 + SOX | OWASP ASVS L3, CWE Top 25 | ISO 42001 + EU AI Act (high-risk) | DORA Elite + SRE (high SLO) |
| **HealthTech** | TOGAF, ArchiMate | ISO 27001 + NIST CSF + NIST 800-53 high | ISO 9001 + ISO 13485 (medical software) | GDPR + HIPAA + HITECH | OWASP ASVS L3 + FDA premarket cybersecurity | ISO 42001 + FDA AI/ML guidance | SRE + ISO 14971 (risk) |
| **SaaS (genel)** | C4 Model + ArchiMate | ISO 27001 + SOC 2 Type II + ISO 27017 | ISO 9001 + ISO 25010 | GDPR + CCPA + ISO 27018 | OWASP Top 10 + ASVS L2 | ISO 42001 | DORA + SRE |
| **Devre dışı/Local-First** | C4 Model (Level 1-2) | CIS IG1 | ISO 25010 (uygulanabilir) | GDPR (local) | OWASP Top 10 (uygulanabilir) | NIST AI RMF (light) | Basic CI/CD |
| **EU Customer** | TOGAF | ISO 27001 + ISO 27017 | ISO 9001 | GDPR + EU AI Act | OWASP ASVS L2 | ISO 42001 + EU AI Act | SRE + DORA |
| **US Federal** | TOGAF + FEA | FedRAMP Moderate + NIST 800-53 | ISO 9001 + FISMA | Privacy Act + FERPA (if applicable) | NIST 800-218 (SSDF) | NIST AI RMF + OMB M-24-10 | SRE + DORA |
| **EU Government** | TOGAF + EUPL | ENS High (Spain) / BSI (Germany) | ISO 9001 + EN 301 549 | GDPR + EU AI Act | OWASP ASVS L2 | EU AI Act + ISO 42001 | SRE |
| **B2B Enterprise (BANK)** | TOGAF + Zachman | ISO 27001 + NIST CSF + PCI-DSS | ISO 9001 + CMMI L3 | GDPR + PCI-DSS + SOX | OWASP ASVS L3 + PCI 6.5 | EU AI Act (high-risk) + ISO 42001 | SRE + DORA Elite + COBIT 2019 |

### Senaryoya Göre Uygulama Detayı

**Hızlı Prototip**: Sadece C4 Level 1-2 diagram, GitHub Actions CI, Dependabot, basic rate limiting. Hedef: 1 ayda MVP. Maliyet minimum.

**Kurumsal Prod**: TOGAF Phase A-B-C-D dokümante, ISO 27001 ISMS kurulu, SOC 2 Type II hazırlığı 12 ay, OWASP ASVS L2 doğrulama, DORA Elite hedefi.

**Fintech**: PCI-DSS SAQ-A (Stripe ile), ASVS L3 (bankacılık seviyesi), SOX ITGC, audit log 7 yıl saklama, EU AI Act high-risk AI obligations (kredi skorlama AI ise).

**HealthTech**: HIPAA BAA müşteri ile, AWS HIPAA-eligible services, audit log 6 yıl, OCR Breach Notification 60 gün, FDA AI/ML SaMD gereksinimleri.

**SaaS**: Multi-tenant isolation, SOC 2 Type II raporu, ISO 27001 + 27017 + 27018 üçlüsü, GDPR DPA müşteri ile, uptime SLO %99.9.

---

## 10. Politika Dosyaları İçin Şablon Yapısı

Her standart için politika dosyası, aşağıdaki tutarlı şablonu izlemelidir:

### 10.1 Şablon Yapısı

```markdown
# [POLİTİKA ADI] Politikası

## Header
- Belge ID: POL-XXX-NNN
- Versiyon: 1.0.0
- Yayın tarihi: YYYY-MM-DD
- Son güncelleme: YYYY-MM-DD
- Sonraki gözden geçirme: YYYY-MM-DD
- Sahip: [Role / Departman]
- Onaylayan: [Executive sponsor]
- Sınıflandırma: Internal / Confidential / Public
- İlgili standartlar: [örn. ISO 27001 A.5.1, NIST CSF PR.AC-1]

## 1. Amaç
Bu politikanın varlık nedeni, hangi riskleri azalttığı, hangi iş hedefine hizmet ettiği.

## 2. Kapsam
- Kapsam içi: Hangi sistemler, ekipler, veriler, üçüncü taraflar
- Kapsam dışı: Açıkça nelerin bu politikaya tabi olmadığı

## 3. Tanımlar
Terim sözlüğü — PII, PHI, CHD, SLA, SLO, RTO, RPO, DPIA, DPA, vb.

## 4. Roller & Sorumluluklar
RACI matrisi:

| Aktivite | Sahip | Sorumlu | Danışılan | Bilgilendirilen |
|---|---|---|---|---|
| Policy approval | CISO | Security team | Legal, DPO | All staff |
| Implementation | Eng Manager | Engineers | Security team | Stakeholders |
| Monitoring | SOC Lead | SOC Analysts | SRE | CISO |
| Review | CISO | Security team | All | Exec |

## 5. Politika Maddeleri
Numaralı, ölçülebilir, denetlenebilir maddeler:

### 5.1 [Konu Başlığı]
5.1.1 Şart...
5.1.2 Şart...

### 5.2 [Konu Başlığı]
5.2.1 Şart...

## 6. Prosedürler & Süreçler
Politika maddelerinin nasıl yerine getirileceğine dair adım adım süreç. Flowchart, checklist, link to runbook.

## 7. Ölçümler & Metrikler
- Leading indicators (örn. % çalışan security training tamamlama)
- Lagging indicators (örn. # incidents/quarter)
- KPI'lar ve hedef değerler

## 8. Compliance Monitoring
- Denetim sıklığı (örn. yıllık internal, 3 yılda bir external)
- Denetim kriterleri
- Non-compliance escalation flow
- İhlal cezaları

## 9. İstisnalar
- İstisna talep süreci
- Risk acceptance form
- Maksimum istisna süresi
- Yıllık istisna limiti

## 10. İlgili Dokümanlar
- Üst politika
- Alt prosedürler
- Standartlar (link, sürüm)
- Runbook'lar

## 11. Onay & Revizyon Geçmişi

| Versiyon | Tarih | Değişiklik | Sahip | Onaylayan |
|---|---|---|---|---|
| 1.0.0 | 2026-06-21 | İlk yayın | CISO | CEO |
| 1.1.0 | YYYY-MM-DD | ... | ... | ... |

## 12. Ekler
Ek A: Şablon formlar
Ek B: Decision trees
Ek C: Glossary
```

### 10.2 Örnek Politika: AI Model Kullanım Politikası (Özet)

```markdown
# AI Model Kullanım Politikası

## Header
- Belge ID: POL-AI-001
- Versiyon: 1.0.0
- Yayın tarihi: 2026-06-21
- Sahip: Head of AI
- Onaylayan: CTO
- İlgili standartlar: ISO 42001, NIST AI RMF, EU AI Act

## 1. Amaç
AI modellerinin güvenli, etik ve uyumlu kullanımını sağlamak; hallucination, bias, prompt injection ve veri sızıntısı risklerini azaltmak.

## 2. Kapsam
Kapsam içi: DeepSeek API (chat, reasoner, V4 Pro, V4 Flash), tüm prompt ve response handling, model routing, fine-tuning (gelecekte).

Kapsam dışı: Customer-chosen BYOK (Bring Your Own Key) — kullanıcı sorumluluğundadır.

## 3. Tanımlar
- Prompt Sanitization: Kullanıcı prompt'undan PII ve zararlı içeriğin temizlenmesi.
- Model Routing: Maliyet/performans matrisine göre model seçimi.
- Hallucination Check: Üretilen çıktının tutarlılık doğrulaması.

## 4. Roller & Sorumluluklar
[...]

## 5. Politika Maddeleri
5.1.1 Tüm prompt'lar sanitize edilmeden modele gönderilemez.
5.1.2 PII otomatik maskelenecektir (regex + NER).
5.1.3 Kullanıcı kodu sandbox dışına yazılamaz.
5.1.4 Model yanıtları PII filtresinden geçirilir.
5.1.5 Model seçimi maliyet-optimizasyon algoritmasına tabidir.
5.1.6 Tüm model çağrıları loglanır (PII maskeli).
5.1.7 Prompt injection girişimi tespit edilirse request bloklanır ve SOC'a alert gönderilir.

[...]
```

### 10.3 Politika Yazımı İlkeleri

1. **SMART**: Specific, Measurable, Achievable, Relevant, Time-bound.
2. **Denetlenebilir**: Her madde için evidence (log, screenshot, ticket) elde edilebilir olmalı.
3. **Sürdürülebilir**: Çok fazla politika → bureaucracy. Az ama öz.
4. **Versiyonlanmış**: Semantic versioning (MAJOR.MINOR.PATCH).
5. **Erişilebilir**: Tüm çalışanlar Confluence/Notion'dan erişebilir.
6. **Eğitimli**: Her politika için onboarding training modülü.
7. **Test edilebilir**: Tabletop exercise ile yıllık test.
8. **Uyumlu**: Üst standart referansları (ISO 27001 clause, NIST CSF subcategory) explicit.
9. **Çok dilli**: Enterprise müşteri için İngilizce + Türkçe.
10. **Otomatik**: Mümkün olduğunda policy-as-code (OPA/Rego) ile enforcement.

### 10.4 Politika Yaşam Döngüsü

```
Draft → Review (DPO, Legal, Security) → Approve (Sponsor) → Publish → Communicate → Train → Enforce → Monitor → Audit → Review (yıllık) → Revise
```

Her politika için yıllık gözden geçirme zorunludur. Major incident sonrası veya standart değişikliğinde out-of-cycle review yapılır.

---

## Sonuç

Bu doküman, AI Kod Üretim Stüdyosu için uygulanabilir tüm kurumsal standartları derinlemesine ele aldı. FAZ 2'de yazılacak 20 politika dosyası bu çerçeveye dayanacaktır. En kritik standartlar:

1. **ISO/IEC 27001** — Bilgi güvenliği omurgası
2. **SOC 2 Type II** — Pazar erişim şartı
3. **GDPR** — AB pazar erişimi
4. **ISO/IEC 42001** — AI yönetimi (fark yaratıcı)
5. **OWASP Top 10 + LLM Top 10** — Yazılım güvenliği
6. **NIST AI RMF** — AI risk yönetimi
7. **EU AI Act** — AB AI pazar erişimi
8. **DORA Metrics + SRE** — Operasyonel mükemmellik

Bu standartların entegrasyonu, AI stüdyosunu sadece güvenli ve uyumlu değil, aynı zamanda **ölçeklenebilir, denetlenebilir ve müşteri güveni yüksek** bir platform haline getirecektir.

---

**Referanslar**:
- The Open Group, "TOGAF Standard, 10th Edition" (2022)
- ISO/IEC 27001:2022, "Information security management systems"
- ISO/IEC 42001:2023, "AI management system"
- NIST CSF 2.0 (February 2024)
- NIST AI 100-1, "AI Risk Management Framework" (January 2023)
- ISACA, "COBIT 2019"
- AXELOS, "ITIL 4 Foundation"
- AICPA, "Trust Services Criteria"
- OWASP, "Top 10:2021", "ASVS v4.0.3", "SAMM v2", "LLM Top 10"
- PCI Security Standards Council, "PCI-DSS v4.0" (March 2022)
- European Parliament, "Regulation (EU) 2024/1689 — AI Act" (June 2024)
- CIS, "CIS Controls v8"
- Google, "Site Reliability Engineering" (O'Reilly, 2016)
- DORA, "Accelerate State of DevOps" reports
- Simon Brown, "The C4 Model for Software Architecture"
- The Open Group, "ArchiMate 3.2 Specification"
- John Zachman, "The Zachman Framework for Enterprise Architecture"
- IEEE, "IEEE 7000 Series Standards"
- Partnership on AI, "Tenets"

---

*Doküman sürümü: 1.0.0 | Tarih: 2026-06-21 | Sahip: Research subagent (Enterprise standards)*
