/**
 * Politika dosyaları metadata kütüphanesi
 * 20 derin politika dosyasının indekslenmesi için
 */

export interface PolicyMeta {
  id: number;
  phase: 1 | 2 | 3 | 4;
  title: string;
  category: 'security' | 'privacy' | 'development' | 'ai' | 'data' | 'ops' | 'infra' | 'governance' | 'physical' | 'supply-chain';
  standards: string[]; // ilişkili standart ID'leri
  applicableScenarios: string[];
  summary: string;
  file: string; // markdown dosya yolu
}

export const POLICIES: PolicyMeta[] = [
  // Phase 1 (1-5)
  {
    id: 1,
    phase: 1,
    title: 'Bilgi Güvenliği Politikası (ISO 27001)',
    category: 'security',
    standards: ['iso-27001', 'nist-csf'],
    applicableScenarios: ['Kurumsal ISMS kurulumu', 'Varlık envanteri', 'Risk değerlendirme'],
    summary:
      'ISO/IEC 27001:2022 uyumlu Bilgi Güvenliği Yönetim Sistemi (ISMS). CIA üçlüsü, risk değerlendirme, Annex A kontrolleri, varlık envanteri ve güvenlik bilinci eğitimi.',
    file: 'docs/policies/policies-phase-1.md',
  },
  {
    id: 2,
    phase: 1,
    title: 'Veri Gizliliği & KVKK/GDPR Politikası',
    category: 'privacy',
    standards: ['gdpr'],
    applicableScenarios: ['AB/KVKK kullanıcı verisi işleme', 'Privacy programı', 'DSAR yönetimi'],
    summary:
      'GDPR 7 prensip + 8 data subject hak. ROPA, DPIA, 72 saat ihlal bildirimi, veri saklama süreleri, anonimleştirme & psödönimzasyon.',
    file: 'docs/policies/policies-phase-1.md',
  },
  {
    id: 3,
    phase: 1,
    title: 'Erişim Kontrol Politikası (RBAC + ABAC)',
    category: 'security',
    standards: ['iso-27001', 'nist-csf'],
    applicableScenarios: ['Kimlik yönetimi', 'Least privilege', 'Privileged account management'],
    summary:
      'En az ayrıcalık, RBAC + ABAC hibrit model, MFA zorunluluğu, NIST 800-63B parola politikaları, PAM, JIT access, session yönetimi, segregation of duties.',
    file: 'docs/policies/policies-phase-1.md',
  },
  {
    id: 4,
    phase: 1,
    title: 'Şifreleme & Anahtar Yönetimi Politikası',
    category: 'security',
    standards: ['iso-27001', 'pci-dss', 'hipaa'],
    applicableScenarios: ['Veri şifreleme', 'Anahtar yaşam döngüsü', 'HSM yönetimi'],
    summary:
      'AES-256, RSA-2048+, ECC, TLS 1.3, CA yönetimi, anahtar yaşam döngüsü (generation, rotation, revocation, destruction), HSM, BYOK, quantum-safe hazırlık.',
    file: 'docs/policies/policies-phase-1.md',
  },
  {
    id: 5,
    phase: 1,
    title: 'Yazılım Geliştirme Yaşam Döngüsü (SDLC) Politikası',
    category: 'development',
    standards: ['iso-9001', 'iso-25010', 'owasp-top10'],
    applicableScenarios: ['Yeni ürün geliştirme', 'Secure-by-design', 'CI/CD security'],
    summary:
      '7 faz (requirement → retirement), secure-by-design, STRIDE threat modeling, SAST/DAST/SCA/IAST, secret scanning, code review, branching strategy, SBOM.',
    file: 'docs/policies/policies-phase-1.md',
  },

  // Phase 2 (6-10)
  {
    id: 6,
    phase: 2,
    title: 'Kod İnceleme & Kalite Güvence Politikası',
    category: 'development',
    standards: ['iso-9001', 'iso-25010'],
    applicableScenarios: ['Mandatory review', 'Linter konfigürasyonu', 'Test coverage'],
    summary:
      'Mandatory code review, minimum 2 reviewer, ESLint/Prettier/TypeScript strict, %80 coverage threshold, PR template, codeowners, SonarQube/CodeQL, technical debt.',
    file: 'docs/policies/policies-phase-2.md',
  },
  {
    id: 7,
    phase: 2,
    title: 'AI Etik & Sorumlu AI Politikası',
    category: 'ai',
    standards: ['eu-ai-act', 'nist-ai-rmf', 'iso-42001'],
    applicableScenarios: ['AI ürün governance', 'Bias detection', 'AI red teaming'],
    summary:
      'NIST AI RMF 4 fonksiyon, EU AI Act risk seviyeleri, explainability, fairness, human oversight, transparency, bias mitigation, model card, AI impact assessment.',
    file: 'docs/policies/policies-phase-2.md',
  },
  {
    id: 8,
    phase: 2,
    title: 'AI Model Yönetimi & MLOps Politikası',
    category: 'ai',
    standards: ['eu-ai-act', 'nist-ai-rmf'],
    applicableScenarios: ['Model lifecycle', 'A/B test', 'Drift detection'],
    summary:
      'Model lifecycle (dev→staging→prod→retired), model registry, versioning, model card, A/B testing, shadow deploy, canary release, drift detection, prompt versioning, rollback.',
    file: 'docs/policies/policies-phase-2.md',
  },
  {
    id: 9,
    phase: 2,
    title: 'Veri Yönetimi & Veri Kalitesi Politikası',
    category: 'data',
    standards: ['iso-9001', 'gdpr'],
    applicableScenarios: ['Veri sınıflandırma', 'Data lineage', 'Master data management'],
    summary:
      'Veri yaşam döngüsü, 5 seviye sınıflandırma (public→secret), data lineage, 6 kalite boyutu (accuracy, completeness, consistency, timeliness, validity, uniqueness).',
    file: 'docs/policies/policies-phase-2.md',
  },
  {
    id: 10,
    phase: 2,
    title: 'Olay Müdahalesi & Güvenlik İhlali Politikası',
    category: 'ops',
    standards: ['iso-27001', 'nist-csf', 'soc2'],
    applicableScenarios: ['SEV1-SEV4 olay yönetimi', 'Forensics', 'Tabletop'],
    summary:
      'SANS/NIST 6 fazlı IR lifecycle, SEV1-SEV4 sınıflandırma, response SLA, on-call, communication plan, forensics, evidence chain of custody, post-mortem.',
    file: 'docs/policies/policies-phase-2.md',
  },

  // Phase 3 (11-15)
  {
    id: 11,
    phase: 3,
    title: 'İş Sürekliliği & Felaket Kurtarma (BCP/DRP)',
    category: 'ops',
    standards: ['iso-27001'],
    applicableScenarios: ['BIA', 'Multi-region failover', 'Yıllık DR test'],
    summary:
      'ISO 22301 framework, BIA, RTO/RPO, failover stratejileri (active-active, multi-region), 3-2-1 backup rule, DR test türleri (tabletop→full interruption).',
    file: 'docs/policies/policies-phase-3.md',
  },
  {
    id: 12,
    phase: 3,
    title: 'Bulut Güvenliği Politikası',
    category: 'infra',
    standards: ['iso-27001', 'soc2', 'pci-dss'],
    applicableScenarios: ['Cloud vendor due diligence', 'CSPM', 'Container security'],
    summary:
      'ISO/IEC 27017, CSA CCM v4, shared responsibility, CSPM, IaC security (Terraform), container/K8s hardening (CIS), serverless, multi-cloud strategy.',
    file: 'docs/policies/policies-phase-3.md',
  },
  {
    id: 13,
    phase: 3,
    title: 'Üçüncü Taraf & Tedarikçi Risk Yönetimi',
    category: 'governance',
    standards: ['iso-27001', 'soc2'],
    applicableScenarios: ['Vendor onboarding', 'Due diligence', '4th-party risk'],
    summary:
      'Vendor lifecycle, due diligence checklist, risk tiering (low→critical), SLA monitoring, right-to-audit, subprocessor, SIG/CAIQ questionnaire, ESCROW.',
    file: 'docs/policies/policies-phase-3.md',
  },
  {
    id: 14,
    phase: 3,
    title: 'Donanım & Cihaz Yönetimi Politikası',
    category: 'infra',
    standards: ['iso-27001', 'nist-csf'],
    applicableScenarios: ['MDM/UEM', 'BYOD', 'Endpoint security'],
    summary:
      'Asset lifecycle, MDM (Intune, Jamf), full disk encryption, remote wipe, BYOD policy, USB control, EDR, patch management, NIST 800-88 decommissioning.',
    file: 'docs/policies/policies-phase-3.md',
  },
  {
    id: 15,
    phase: 3,
    title: 'Ağ Güvenliği Politikası',
    category: 'infra',
    standards: ['iso-27001', 'nist-csf', 'pci-dss'],
    applicableScenarios: ['Zero trust', 'Network segmentation', 'WAF/DDoS'],
    summary:
      'Defense in depth, zero trust (NIST 800-207), segmentation, firewall rules lifecycle, IDS/IPS, WAF, DDoS, VPN/ZTNA, DNSSEC, Bastion, NAC, TLS inspection.',
    file: 'docs/policies/policies-phase-3.md',
  },

  // Phase 4 (16-20)
  {
    id: 16,
    phase: 4,
    title: 'Loglama, İzleme & Denetim Politikası',
    category: 'security',
    standards: ['iso-27001', 'soc2', 'pci-dss'],
    applicableScenarios: ['SIEM', 'Audit trail', 'UEBA'],
    summary:
      'NIST SP 800-92, log kaynakları, JSON/CEF format, SIEM (Splunk, Elastic), retention (90 gün hot, 1 yıl cold, 7 yıl archive), WORM storage, UEBA, NTP.',
    file: 'docs/policies/policies-phase-4.md',
  },
  {
    id: 17,
    phase: 4,
    title: 'Değişiklik Yönetimi (Change Management)',
    category: 'governance',
    standards: ['itil', 'iso-27001'],
    applicableScenarios: ['CAB', 'RFC', 'Change freeze'],
    summary:
      'ITIL 4 change enablement, 3 change type (standard, normal, emergency), CAB, RFC, impact/risk assessment, rollback plan, change freeze, PIR.',
    file: 'docs/policies/policies-phase-4.md',
  },
  {
    id: 18,
    phase: 4,
    title: 'İnsan Kaynakları Güvenliği Politikası',
    category: 'governance',
    standards: ['iso-27001', 'soc2'],
    applicableScenarios: ['Pre-employment screening', 'Security awareness', 'Insider threat'],
    summary:
      'Background check, NDA, security awareness training (annual + onboarding), role-based training, AUP, clean desk, leaver process (24h revocation), insider threat.',
    file: 'docs/policies/policies-phase-4.md',
  },
  {
    id: 19,
    phase: 4,
    title: 'Fiziksel Güvenlik Politikası',
    category: 'physical',
    standards: ['iso-27001'],
    applicableScenarios: ['Site security', 'Data center', 'Environmental controls'],
    summary:
      'ISO 27001 Annex A.11, perimeter, badge, visitor management, data center (mantrap, biometric, CCTV 90 gün), HVAC, fire suppression (inert gas), UPS/generator.',
    file: 'docs/policies/policies-phase-4.md',
  },
  {
    id: 20,
    phase: 4,
    title: 'Tedarik Zinciri Yazılım Güvenliği (SBOM/SLSA)',
    category: 'supply-chain',
    standards: ['owasp-top10', 'iso-27001'],
    applicableScenarios: ['SBOM generation', 'SLSA levels', 'Signed artifacts'],
    summary:
      'EO 14028, SLSA levels 1-4, SBOM (SPDX, CycloneDX), dependency pinning, signed artifacts (Sigstore/cosign), build provenance, reproducible builds, transitive risk.',
    file: 'docs/policies/policies-phase-4.md',
  },

  // Phase 6 — 3D Production (31-40)
  {
    id: 31, phase: 6, title: '3D Asset Guvenligi Politikasi', category: 'security',
    standards: ['iso-27001', 'nist-csf'],
    applicableScenarios: ['3D model DoS korumasi', 'Malicious geometry', 'Sandbox rendering'],
    summary: '3D model DoS korumasi, polygon/texture/memory limitleri, file validation, sandbox rendering.',
    file: 'docs/policies/policies-phase-6-3d-production.md',
  },
  {
    id: 32, phase: 6, title: 'Model Dogrulama & Kalite Kontrol', category: 'quality',
    standards: ['iso-9001', 'iso-25010'],
    applicableScenarios: ['Polygon count', 'UV integrity', 'Topology', 'Naming convention'],
    summary: 'Polygon count limits, UV integrity, topology check, naming convention, LOD compliance.',
    file: 'docs/policies/policies-phase-6-3d-production.md',
  },
  {
    id: 33, phase: 6, title: '3D Dosya Format Standartlari', category: 'governance',
    standards: ['iso-27001'],
    applicableScenarios: ['glTF 2.0', 'FBX legacy', 'USD enterprise', 'Blend source'],
    summary: 'glTF 2.0 preferred, FBX legacy, USD enterprise, blend source, OBJ/STL print, conversion pipeline.',
    file: 'docs/policies/policies-phase-6-3d-production.md',
  },
  {
    id: 34, phase: 6, title: 'Rig & Skeleton Guvenligi', category: 'security',
    standards: ['iso-27001'],
    applicableScenarios: ['Bone hierarchy', 'Weight paint limits', 'Naming convention'],
    summary: 'Bone hierarchy validation, max 4 bones/vertex, naming convention, deformation check.',
    file: 'docs/policies/policies-phase-6-3d-production.md',
  },
  {
    id: 35, phase: 6, title: 'Animation Pipeline', category: 'development',
    standards: ['iso-9001', 'iso-25010'],
    applicableScenarios: ['Keyframe', 'FPS (24/30/60)', 'IK/FK', 'Retargeting', 'Motion capture'],
    summary: 'Keyframe standards, FPS, interpolation, IK/FK switching, retargeting, motion capture validation.',
    file: 'docs/policies/policies-phase-6-3d-production.md',
  },
  {
    id: 36, phase: 6, title: 'Texture & Material Guvenligi', category: 'security',
    standards: ['iso-27001', 'owasp-top10'],
    applicableScenarios: ['PBR workflow', 'Texture resolution', 'Compression', 'Color space'],
    summary: 'PBR metallic-roughness, texture resolution limits, compression, color space management.',
    file: 'docs/policies/policies-phase-6-3d-production.md',
  },
  {
    id: 37, phase: 6, title: '3D Render Farm Guvenligi', category: 'ops',
    standards: ['iso-27001', 'soc2'],
    applicableScenarios: ['Distributed rendering', 'Priority management', 'Failover'],
    summary: 'Distributed rendering queue, priority, resource allocation, failover, cost tracking.',
    file: 'docs/policies/policies-phase-6-3d-production.md',
  },
  {
    id: 38, phase: 6, title: '3D Asset Versioning & IP', category: 'governance',
    standards: ['iso-27001', 'gdpr'],
    applicableScenarios: ['Semantic versioning', 'Git-LFS', 'DMCA', 'License management'],
    summary: 'Semantic versioning, git-lfs, DMCA, watermark, provenance, license management.',
    file: 'docs/policies/policies-phase-6-3d-production.md',
  },
  {
    id: 39, phase: 6, title: 'Real-time 3D Performance', category: 'devops',
    standards: ['iso-25010', 'dora'],
    applicableScenarios: ['Draw call budget', 'Texture memory', 'Shader complexity', 'LOD'],
    summary: 'Draw call budget, texture memory, shader complexity, LOD, occlusion culling, instancing.',
    file: 'docs/policies/policies-phase-6-3d-production.md',
  },
  {
    id: 40, phase: 6, title: '3D Collaboration & Review', category: 'governance',
    standards: ['iso-27001', 'soc2'],
    applicableScenarios: ['Multi-user editing', 'Annotation', 'Review cycle', 'Approval'],
    summary: 'Multi-user editing, annotation, review cycle, approval workflow, version comparison.',
    file: 'docs/policies/policies-phase-6-3d-production.md',
  },
];

export const POLICY_CATEGORIES: { id: PolicyMeta['category']; label: string; color: string }[] = [
  { id: 'security', label: 'Güvenlik', color: 'red' },
  { id: 'privacy', label: 'Gizlilik', color: 'purple' },
  { id: 'development', label: 'Geliştirme', color: 'blue' },
  { id: 'ai', label: 'AI', color: 'cyan' },
  { id: 'data', label: 'Veri', color: 'green' },
  { id: 'ops', label: 'Operasyon', color: 'amber' },
  { id: 'infra', label: 'Altyapı', color: 'pink' },
  { id: 'governance', label: 'Yönetişim', color: 'orange' },
  { id: 'physical', label: 'Fiziksel', color: 'slate' },
  { id: 'supply-chain', label: 'Tedarik Zinciri', color: 'teal' },
];

export function getPoliciesByPhase(phase: 1 | 2 | 3 | 4 | 5 | 6): PolicyMeta[] {
  return POLICIES.filter((p) => p.phase === phase);
}

export function getPolicyById(id: number): PolicyMeta | undefined {
  return POLICIES.find((p) => p.id === id);
}
