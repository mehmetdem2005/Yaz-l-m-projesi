/**
 * Kurumsal Standartlar Kütüphanesi
 *
 * TOGAF, ISO 27001, ISO 9001, SOC 2, NIST CSF, COBIT, ITIL, GDPR,
 * PCI-DSS, HIPAA, OWASP, CIS, EU AI Act, NIST AI RMF, ISO 42001 vb.
 *
 * Her standart için:
 * - Tanım
 * - Kategori
 * - Politika prompt şablonu
 * - Uygulama notları
 */

export interface EnterpriseStandard {
  id: string;
  name: string;
  fullName: string;
  category: 'architecture' | 'security' | 'quality' | 'privacy' | 'governance' | 'ai' | 'devops';
  version: string;
  issuer: string;
  description: string;
  keyPrinciples: string[];
  applicableScenarios: string[];
  promptTemplate: string;
  referenceUrl: string;
}

export const STANDARDS: EnterpriseStandard[] = [
  // ----- Mimari -----
  {
    id: 'togaf',
    name: 'TOGAF',
    fullName: 'The Open Group Architecture Framework',
    category: 'architecture',
    version: '10',
    issuer: 'The Open Group',
    description:
      'Kurumsal mimari geliştirmek için en yaygın framework. ADM (Architecture Development Method) ile 8 fazlı yapılandırılabilir süreç sunar.',
    keyPrinciples: [
      'ADM döngüsü (8 faz)',
      'Enterprise Continuum',
      'Content Framework (artefaktlar, deliverables, building blocks)',
      'Stakeholder management',
      'Gap analysis',
      'Architecture Repository',
    ],
    applicableScenarios: [
      'Yeni kurumsal sistem tasarımı',
      'Mimari dönüşüm projeleri',
      'Mikroservis geçişi',
    ],
    promptTemplate:
      `Bu projeyi TOGAF 10 ADM metodolojisine göre tasarla. Aşama 1 (Architecture Vision) çıktısı olarak: stakeholders, business scenarios, high-level architecture ve key concerns oluştur. Phase 2 (Business Architecture) için value stream ve organizasyon matrisi hazırla. Phase 3 (Information Systems Architecture) için data ve application architecture diagramları ver. Phase 4 (Technology Architecture) için altyapı bileşenlerini listele. Phase 7 (Implementation Governance) için compliance checklist oluştur.`,
    referenceUrl: 'https://www.opengroup.org/togaf',
  },
  {
    id: 'zachman',
    name: 'Zachman',
    fullName: 'Zachman Enterprise Framework',
    category: 'architecture',
    version: '3.0',
    issuer: 'Zachman International',
    description:
      '6 soru (What, How, Where, Who, When, Why) × 6 perspektif (Planner, Owner, Designer, Builder, Implementer, Worker) matrisi.',
    keyPrinciples: ['6×6 matris', 'Perspektif hiyerarşisi', 'İlkel modelleme'],
    applicableScenarios: ['Tüm enterprise perspektiflerini kapsama', 'Gap analysis'],
    promptTemplate:
      `Bu sistemi Zachman Framework 6×6 matrisine göre modellendir. Her hücre için artefakt üret: What (data entity), How (process), Where (network), Who (role), When (event), Why (motivation). 6 perspektif için (Context, Conceptual, Logical, Physical, Detailed, Operational) uygun detay seviyesini kullan.`,
    referenceUrl: 'https://www.zachman.com',
  },
  {
    id: 'c4',
    name: 'C4 Model',
    fullName: 'Context, Container, Component, Code',
    category: 'architecture',
    version: '2.0',
    issuer: 'Simon Brown',
    description:
      'Yazılım mimarisini 4 farklı zoom seviyesinde anlatan pragmatik model. Diagram-as-code yaklaşımıyla uyumlu.',
    keyPrinciples: ['4 katmanlı zoom', 'Simplicity first', 'PlantUML/Mermaid uyumu'],
    applicableScenarios: ['Microservice mimari dokümantasyonu', 'Onboarding'],
    promptTemplate:
      "Bu projeyi C4 modeline göre 4 seviyede diagram üretecek şekilde planla: Level 1 System Context (harici aktörler ve sistemler), Level 2 Container (deployable units, veritabanları, queue'lar), Level 3 Component (her container içindeki major componentler), Level 4 Code (sınıf diagramları — sadece kritik bileşenler için). Her seviye için Mermaid kodu üret.",
    referenceUrl: 'https://c4model.com',
  },

  // ----- Güvenlik -----
  {
    id: 'iso-27001',
    name: 'ISO 27001',
    fullName: 'ISO/IEC 27001 Information Security Management',
    category: 'security',
    version: '2022',
    issuer: 'ISO/IEC',
    description:
      'Bilgi güvenliği yönetim sistemi (ISMS) standardı. Annex A\'de 93 kontrol ile risk tabanlı yaklaşım sunar.',
    keyPrinciples: [
      'ISMS (Information Security Management System)',
      'Risk assessment & treatment',
      '93 Annex A kontrolü (4 tema: Organizational, People, Physical, Technological)',
      'PDCA döngüsü',
      'Sürekli iyileştirme',
      'Statement of Applicability (SoA)',
    ],
    applicableScenarios: [
      'Kurumsal güvenlik sertifikasyonu',
      'Yeni ürün güvenlik planı',
      'Vendor güvenlik değerlendirme',
    ],
    promptTemplate:
      `Bu proje için ISO/IEC 27001:2022 uyumlu ISMS uygulama planı hazırla. Tüm 93 Annex A kontrolünü 4 tema altında değerlendir (Organizational 37, People 8, Physical 14, Technological 34). Her kontrol için: uygulanabilirlik (Applicability), uygulama durumu, sorumlu, kanıt (evidence). SoA (Statement of Applicability) tablosu oluştur. Risk değerlendirme metodolojisini tanımla (asset-threat-vulnerability). Risk treatment planı üret.`,
    referenceUrl: 'https://www.iso.org/standard/27001',
  },
  {
    id: 'soc2',
    name: 'SOC 2',
    fullName: 'SOC 2 (System and Organization Controls 2)',
    category: 'security',
    version: 'TSC 2017',
    issuer: 'AICPA',
    description:
      'Service organizationların güvenilirliğini değerlendiren audit standardı. 5 Trust Services Criteria: Security, Availability, Processing Integrity, Confidentiality, Privacy.',
    keyPrinciples: [
      '5 Trust Services Criteria (TSC)',
      'Type I (design) vs Type II (operational effectiveness)',
      'Control activities',
      'Continuous monitoring',
    ],
    applicableScenarios: ['SaaS güvenilirlik kanıtı', 'Customer audit'],
    promptTemplate:
      `Bu SaaS ürünü için SOC 2 Type II uyum planı oluştur. 5 TSC (Security, Availability, Processing Integrity, Confidentiality, Privacy) için controls üret. Her control için: control description, design effectiveness, operating effectiveness evidence (logs, screenshots, tickets), testing procedure, frequency. 12 ay observation period planı yap. Bridge letter ve annual re-audit sürecini tanımla.`,
    referenceUrl: 'https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/sorhome.html',
  },
  {
    id: 'nist-csf',
    name: 'NIST CSF',
    fullName: 'NIST Cybersecurity Framework 2.0',
    category: 'security',
    version: '2.0',
    issuer: 'NIST',
    description:
      'Siber güvenlik risk yönetimi için 6 fonksiyonel framework: Govern, Identify, Protect, Detect, Respond, Recover.',
    keyPrinciples: [
      '6 Fonksiyon: Govern, Identify, Protect, Detect, Respond, Recover',
      'Profiles & Tiers',
      'Informative References',
      'Supply chain risk management',
    ],
    applicableScenarios: ['Siber güvenlik programı', 'Critical infrastructure'],
    promptTemplate:
      `Bu sistemi NIST CSF 2.0 fonksiyonlarına göre değerlendir. 6 fonksiyon (Govern, Identify, Protect, Detect, Respond, Recover) için subcategory başına: implementation status, gaps, action plan, priority. Current Profile ve Target Profile karşılaştırması yap. Tier seviyesini belirle (Partial, Risk Informed, Repeatable, Adaptive). Supply Chain Risk Management (SCRM) entegrasyonunu planla.`,
    referenceUrl: 'https://www.nist.gov/cyberframework',
  },
  {
    id: 'pci-dss',
    name: 'PCI-DSS',
    fullName: 'Payment Card Industry Data Security Standard',
    category: 'security',
    version: '4.0',
    issuer: 'PCI SSC',
    description: 'Kart sahibi verilerini korumak için 12 gereksinimlik ödeme güvenlik standardı.',
    keyPrinciples: [
      '12 requirement',
      'Cardholder data environment (CDE) scoping',
      'Network segmentation',
      'Quarterly ASV scan',
      'Annual penetration test',
    ],
    applicableScenarios: ['Ödeme sistemi', 'E-ticaret', 'SaaS handling card data'],
    promptTemplate:
      `Bu ödeme sistemi için PCI-DSS v4.0 uyum planı üret. 12 requirement için her biri: implementation, evidence, responsible party, testing frequency. CDE (Cardholder Data Environment) scope'unu network segmentation ile tanımla. P2PE (Point-to-Point Encryption) ve tokenization stratejisi uygula. ASV scan, penetration test ve quarterly vulnerability assessment takvimi oluştur. SAQ (Self-Assessment Questionnaire) tipini belirle.`,    referenceUrl: 'https://www.pcisecuritystandards.org',
  },
  {
    id: 'owasp-top10',
    name: 'OWASP Top 10',
    fullName: 'OWASP Top 10 (2021)',
    category: 'security',
    version: '2021',
    issuer: 'OWASP',
    description: 'Web uygulamaları için en kritik 10 güvenlik riski kataloğu.',
    keyPrinciples: [
      'A01 Broken Access Control',
      'A02 Cryptographic Failures',
      'A03 Injection',
      'A04 Insecure Design',
      'A05 Security Misconfiguration',
      'A06 Vulnerable & Outdated Components',
      'A07 Identification & Authentication Failures',
      'A08 Software & Data Integrity Failures',
      'A09 Security Logging & Monitoring Failures',
      'A10 Server-Side Request Forgery (SSRF)',
    ],
    applicableScenarios: ['Web app security review', 'Pre-launch checklist'],
    promptTemplate:
      `Bu kod tabanı için OWASP Top 10 (2021) denetimi yap. Her kategori (A01-A10) için: mevcut zafiyet örnekleri, kod-level remediation, test senaryosu, monitoring stratejisi. Ek olarak OWASP ASVS Level 2 gereksinimlerini kontrol et. Threat modeling (STRIDE) yap. SAST (SonarQube, CodeQL), DAST (ZAP, Burp), SCA (Dependabot, Snyk) pipeline entegrasyonu öner.`,
    referenceUrl: 'https://owasp.org/Top10',
  },

  // ----- Kalite -----
  {
    id: 'iso-9001',
    name: 'ISO 9001',
    fullName: 'ISO 9001 Quality Management System',
    category: 'quality',
    version: '2015',
    issuer: 'ISO',
    description: 'Kalite yönetim sistemi standardı. PDCA ve 7 kalite prensibi üzerine kuruludur.',
    keyPrinciples: [
      'Customer focus',
      'Leadership',
      'Engagement of people',
      'Process approach',
      'Improvement',
      'Evidence-based decision making',
      'Relationship management',
      'PDCA (Plan-Do-Check-Act)',
    ],
    applicableScenarios: ['Kalite yönetim sistemi kurulumu', 'Süreç iyileştirme'],
    promptTemplate:
      `Bu organizasyon için ISO 9001:2015 QMS uygulama planı üret. 7 kalite prensibi için organizasyonel uygulama stratejisi tanımla. Süreç haritası oluştur (core, support, management processes). PDCA döngüsü için her süreçte KPI'lar tanımla. Kalite politikası ve hedefleri yaz. Internal audit takvimi ve management review sürecini planla. Document control (sürüm, onay, dağıtım) prosedürünü tanımla.`,    referenceUrl: 'https://www.iso.org/standard/62085.html',
  },
  {
    id: 'iso-25010',
    name: 'ISO 25010',
    fullName: 'ISO/IEC 25010 Software Quality Model',
    category: 'quality',
    version: '2023',
    issuer: 'ISO/IEC',
    description: 'Yazılım kalitesini 8 karakteristikte değerlendiren model.',
    keyPrinciples: [
      'Functional suitability',
      'Performance efficiency',
      'Compatibility',
      'Usability',
      'Reliability',
      'Security',
      'Maintainability',
      'Portability',
    ],
    applicableScenarios: ['Yazılım kalite değerlendirme', 'Architecture review'],
    promptTemplate:
      `Bu yazılımı ISO/IEC 25010:2023 quality modeline göre değerlendir. 8 karakteristiğin her biri için subcharacteristic bazında metrik üret (örn Functional Completeness = %95, Mean Time Between Failures = 1000h). Hedef değer ve mevcut değer karşılaştırması yap. Her subcharacteristic için iyileştirme aksiyonu öner. Quality gate threshold'ları tanımla (production release için minimum kabul kriterleri).`,    referenceUrl: 'https://www.iso.org/standard/78176.html',
  },

  // ----- Gizlilik -----
  {
    id: 'gdpr',
    name: 'GDPR',
    fullName: 'General Data Protection Regulation',
    category: 'privacy',
    version: '2016/679',
    issuer: 'EU',
    description: 'Avrupa Birliği genel veri koruma yönetmeliği. 7 prensip ve 8 data subject hak.',
    keyPrinciples: [
      'Lawfulness, fairness, transparency',
      'Purpose limitation',
      'Data minimisation',
      'Accuracy',
      'Storage limitation',
      'Integrity & confidentiality',
      'Accountability',
      '8 data subject rights (access, rectification, erasure, restriction, portability, object, automated decision-making, withdraw consent)',
    ],
    applicableScenarios: ['AB kullanıcı verisi işleme', 'Privacy program setup'],
    promptTemplate:
      `Bu ürün için GDPR uyum planı üret. Önce veri işleme envanteri (ROPA - Record of Processing Activities) çıkar. Her processing activity için: lawful basis (consent, contract, legal obligation, vital interest, public task, legitimate interest), purpose, recipients, retention period, third country transfer mekanizması (SCC, BCR). 8 data subject right için prosedür tanımla (DSAR işlem süreci, 30 gün SLA). DPIA (Data Protection Impact Assessment) gereksinimlerini değerlendir. 72-hour breach notification sürecini kur.`,
    referenceUrl: 'https://gdpr.eu',
  },
  {
    id: 'hipaa',
    name: 'HIPAA',
    fullName: 'Health Insurance Portability and Accountability Act',
    category: 'privacy',
    version: '2013 Omnibus',
    issuer: 'HHS (US)',
    description: 'Sağlık bilgisi (PHI) koruma standardı. Privacy Rule ve Security Rule.',
    keyPrinciples: [
      'PHI (Protected Health Information)',
      'Privacy Rule',
      'Security Rule (administrative, physical, technical safeguards)',
      'Breach Notification Rule',
      'Business Associate Agreement (BAA)',
      'Minimum necessary standard',
    ],
    applicableScenarios: ['HealthTech ürünü', 'Sağlık verisi işleme'],
    promptTemplate:
      `Bu HealthTech ürünü için HIPAA uyum planı üret. PHI envanterini çıkar. Security Rule 3 safeguard kategorisinde (Administrative, Physical, Technical) kontroller üret. Her kontrol için: implementation, responsible role, monitoring. BAA (Business Associate Agreement) gereksinimleri olan tüm vendor'ları listele. Minimum necessary standard için RBAC matrisi oluştur. Breach notification sürecini tanımla (60 gün). Audit log 6 yıl saklama kuralını uygula.`,    referenceUrl: 'https://www.hhs.gov/hipaa',
  },

  // ----- Governance -----
  {
    id: 'cobit',
    name: 'COBIT',
    fullName: 'COBIT 2019',
    category: 'governance',
    version: '2019',
    issuer: 'ISACA',
    description: 'IT governance ve management framework. 5 governance principle, 40 governance objective.',
    keyPrinciples: [
      '5 governance principle',
      '40 governance objective',
      'Design factors',
      'Goals cascade',
      '7 enabler',
    ],
    applicableScenarios: ['IT governance kurulumu', 'Board-level IT oversight'],
    promptTemplate:
      `Bu organizasyon için COBIT 2019 IT governance framework uygula. 5 governance principle'ı organizasyona uyarla. 40 governance objective'den relevant olanları seç ve her biri için metric üret. Goals cascade yap (stakeholder needs → enterprise goals → IT-related goals → enabler goals). 7 enabler (principles/policies/framework, processes, organizational structures, culture/ethics/behavior, information, services/infrastructure/applications, people/skills/competencies) için değerlendirme yap. Design factor'lara göre framework boyutlandır.`,    referenceUrl: 'https://www.isaca.org/resources/cobit',
  },
  {
    id: 'itil',
    name: 'ITIL',
    fullName: 'ITIL 4',
    category: 'governance',
    version: '4',
    issuer: 'Axelos',
    description: 'IT service management best practice framework. Service Value System (SVS) ve 34 practice.',
    keyPrinciples: [
      'Service Value System (SVS)',
      '7 guiding principle',
      '34 management practice',
      'Four dimensions of service management',
      'Service value chain',
      'Continual improvement',
    ],
    applicableScenarios: ['ITSM transformasyonu', 'Service desk setup'],
    promptTemplate:
      `Bu organizasyon için ITIL 4 service management framework kur. SVS (Service Value System) tüm bileşenlerini tanımla. 7 guiding principle'ı organizasyonel context'e uyarla. 34 practice'den relevant olanları seç (general, service, technical) ve her biri için purpose, key activities, inputs/outputs, metrics üret. Service value chain 6 activity (plan, improve, engage, design/transition, obtain/build, deliver/support) için akış şeması oluştur. CSI (Continual Service Improvement) register tasarla.`,    referenceUrl: 'https://www.peoplecert.org/itil',
  },

  // ----- AI Standartları -----
  {
    id: 'eu-ai-act',
    name: 'EU AI Act',
    fullName: 'European Union AI Act',
    category: 'ai',
    version: '2024',
    issuer: 'EU Commission',
    description:
      'AI sistemlerini risk bazlı 4 seviyede sınıflandıran düzenleme: Unacceptable, High, Limited, Minimal.',
    keyPrinciples: [
      '4 risk seviyesi',
      'High-risk AI obligations (risk assessment, data quality, logging, transparency, human oversight, accuracy)',
      'Prohibited practices (social scoring, real-time biometric ID in public)',
      'Transparency obligation for general-purpose AI',
      'Conformity assessment',
      'Post-market monitoring',
    ],
    applicableScenarios: ['AB pazarına AI ürünü', 'AI governance'],
    promptTemplate:
      `Bu AI ürününü EU AI Act\'e göre değerlendir. 4 risk seviyesinden hangisine girdiğini belirle (Unacceptable, High, Limited, Minimal). High-risk ise: risk management system, data governance, technical documentation, record-keeping, transparency, human oversight, accuracy/robustness/cybersecurity gereksinimlerini uygula. Conformity assessment prosedürünü tanımla. CE marking sürecini planla. Post-market monitoring system kur. Notified body ile ilişkiyi yönet. AI Office ile kayıt sürecini başlat.`,    referenceUrl: 'https://artificialintelligenceact.eu',
  },
  {
    id: 'nist-ai-rmf',
    name: 'NIST AI RMF',
    fullName: 'NIST AI Risk Management Framework',
    category: 'ai',
    version: '1.0',
    issuer: 'NIST',
    description: 'AI sistemleri için risk yönetim framework. 4 fonksiyon: Govern, Map, Measure, Manage.',
    keyPrinciples: [
      '4 fonksiyon: Govern, Map, Measure, Manage',
      'AI lifecycle management',
      'Trustworthy AI 7 characteristic',
      'Stakeholder engagement',
    ],
    applicableScenarios: ['AI ürün risk yönetimi', 'Responsible AI programı'],
    promptTemplate:
      `Bu AI sistemi için NIST AI RMF uygula. Govern fonksiyonu için: governance structure, roles, policies, culture. Map fonksiyonu: context, stakeholders, potential benefits/harms, risk tolerance. Measure fonksiyonu: test, evaluate, verify, monitor (validity, reliability, safety, security, accountability, transparency, explainability, privacy, fairness). Manage fonksiyonu: risk response, mitigation, treatment. Trustworthy AI 7 characteristic için KPI üret. AI system card ve model card oluştur.`,
    referenceUrl: 'https://www.nist.gov/itl/ai-risk-management-framework',
  },
  {
    id: 'iso-42001',
    name: 'ISO 42001',
    fullName: 'ISO/IEC 42001 AI Management System',
    category: 'ai',
    version: '2023',
    issuer: 'ISO/IEC',
    description: 'AI yönetim sistemi için ilk uluslararası standart. AIMS kurulumu ve sertifikasyon.',
    keyPrinciples: [
      'AIMS (AI Management System)',
      'AI policy',
      'AI risk assessment',
      'AI impact assessment',
      'Annex A controls',
      'Plan-Do-Check-Act',
    ],
    applicableScenarios: ['AI governance sertifikasyonu', 'AI ürün compliance'],
    promptTemplate:
      `Bu organizasyon için ISO/IEC 42001:2023 AIMS kur. AI policy oluştur (scope, principles, roles). AI risk assessment metodolojisi tanımla (likelihood × impact × severity). AI impact assessment şablonu üret (stakeholder analysis, benefit/harm evaluation, mitigation plan). Annex A kontrollerini değerlendir. Internal audit ve management review sürecini planla. AI system registry kur (tüm AI sistemleri inventory). Continuous monitoring ve improvement loop kur.`,
    referenceUrl: 'https://www.iso.org/standard/81230.html',
  },

  // ----- DevOps -----
  {
    id: 'dora',
    name: 'DORA Metrics',
    fullName: 'DORA (DevOps Research and Assessment) Metrics',
    category: 'devops',
    version: '4 metrics',
    issuer: 'Google Cloud / DORA',
    description: 'DevOps olgunluğunu ölçen 4 temel metrik.',
    keyPrinciples: [
      'Deployment frequency',
      'Lead time for changes',
      'Mean time to recovery (MTTR)',
      'Change failure rate',
      'Elite performer threshold',
    ],
    applicableScenarios: ['DevOps transformasyonu', 'Engineering productivity'],
    promptTemplate:
      `Bu organizasyon için DORA metrics uygulama planı üret. 4 metrik (Deployment Frequency, Lead Time for Changes, MTTR, Change Failure Rate) için measurement planı yap. Elite/High/Medium/Low performer threshold'ları tanımla. CI/CD pipeline entegrasyonu için instrumentation stratejisi belirle (Jenkins, GitHub Actions, GitLab CI). Dashboard tasarımı yap (Grafana/Datadog). 12 aylık iyileştirme roadmap'i oluştur (her çeyrek için hedef). Reliability ek olarak SLO/Error Budget entegrasyonu öner.`,    referenceUrl: 'https://dora.dev',
  },
  {
    id: 'sre',
    name: 'SRE',
    fullName: 'Site Reliability Engineering',
    category: 'devops',
    version: '2023',
    issuer: 'Google',
    description: 'Yazılım mühendisliği yaklaşımlarını operasyon sorunlarına uygulama disiplini.',
    keyPrinciples: [
      'SLI (Service Level Indicator)',
      'SLO (Service Level Objective)',
      'SLA (Service Level Agreement)',
      'Error budget',
      'Toil reduction',
      'Blameless post-mortem',
      'Progressive rollout (canary, blue-green)',
    ],
    applicableScenarios: ['Reliability programı', 'Production operations'],
    promptTemplate:
      `Bu sistem için SRE framework kur. Her kritik servis için SLI (latency p95/p99, error rate, throughput, saturation) tanımla. SLO (örn 99.9% uptime) ve error budget hesapla. SLA (customer-facing) yaz. Toil hesabı yap ve %50 azaltma planı üret. Blameless post-mortem template oluştur. Incident response runbook yaz. Capacity planning metodolojisi tanımla. Progressive rollout (canary 1%-5%-25%-50%-100%) pipeline kur.`,
    referenceUrl: 'https://sre.google',
  },
];

export function getStandardById(id: string): EnterpriseStandard | undefined {
  return STANDARDS.find((s) => s.id === id);
}

export function getStandardsByCategory(cat: EnterpriseStandard['category']): EnterpriseStandard[] {
  return STANDARDS.filter((s) => s.category === cat);
}

export const STANDARD_CATEGORIES: { id: EnterpriseStandard['category']; label: string; color: string }[] = [
  { id: 'architecture', label: 'Mimari', color: 'blue' },
  { id: 'security', label: 'Güvenlik', color: 'red' },
  { id: 'quality', label: 'Kalite', color: 'green' },
  { id: 'privacy', label: 'Gizlilik', color: 'purple' },
  { id: 'governance', label: 'IT Governance', color: 'amber' },
  { id: 'ai', label: 'AI', color: 'cyan' },
  { id: 'devops', label: 'DevOps', color: 'pink' },
];
