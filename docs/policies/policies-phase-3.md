# Kurumsal Politika Seti — Faz 3 (Politika 11–15)

Bu doküman, DeepSeek AI Kod Üretici Stüdyosu kurumsal altyapısının güvenli, sürekli ve denetlenebilir şekilde işletilmesi için tanımlanan 5 derin politika dosyasını içermektedir. Tüm politikalar ISO 27001:2022 Annex A, ISO 22301, ISO/IEC 27017, NIST CSF 2.0, NIST SP 800-53 Rev. 5, NIST SP 800-207 (Zero Trust), NIST SP 800-88 Rev. 1, CSA CCM v4, CIS Controls v8 ve SOC 2 Type II referanslarıyla uyumludur. Her politika zorunlu 11 bölüm yapısını izler ve bağımsız olarak denetlenebilir.

---

## Politika No: 11 — İş Sürekliliği & Felaket Kurtarma (BCP/DRP) Politikası

### 1. Amaç

Bu politika; DeepSeek AI Kod Üretici Stüdyosunun kritik iş süreçlerini, bilgi sistemlerini ve veri varlıklarını etkileyebilecek tüm kesinti senaryolarına (doğal afet, siber saldırı, donanım arızası, insan kaynaklı hata, tedarikçi iflası, kamu düzeni kesintileri, pandemi gibi biyolojik olaylar ve enerji/telekom arızaları) karşı kurumun dayanıklılığını güvence altına almak amacıyla yazılmıştır. Politika; ISO 22301:2019 "Security and resilience — Business continuity management systems" standardı ile uyumlu bir İş Sürekliliği Yönetim Sistemi (BCMS) kurulmasını, sürdürülmesini ve sürekli iyileştirilmesini zorunlu kılar. Amaç; kesinti durumunda müşteri sözleşmelerinde taahhüt edilen RTO/RPO hedeflerinin tutturulması, regulatif yükümlülüklerin (KVKK, GDPR, PCI-DSS, SOC 2) kesintisiz yerine getirilmesi, marka itibarının korunması, finansal kaybın minimize edilmesi ve personel güvenliğinin sağlanmasıdır.

### 2. Kapsam

Bu politika; şirketin tüm tüzel varlıkları, iştirakleri, fiziksel ve sanal veri merkezleri, public/private/hybrid bulut ortamları (AWS, GCP, Azure, on-prem vCenter clusterları), tüm SaaS kritik tedarikçileri, müşteri veri işleme pipeline'ları, AI model eğitim/servis sistemleri, geliştirici ve operasyon personeli, kriz yönetimi ekibi üyeleri ve taşeron hizmet sağlayıcıları için geçerlidir. Kapsam; üretim (production), ön-prod (staging), disaster recovery (DR) ortamlarını ve tüm yedekleme sistemlerini (backup, archive, replicated) içerir. Kapsam dışı: kişisel cihazlardaki kişisel veriler (BYOD kapsamındaki veriler Politika 14'e tabidir) ve münhasıran araştırma amaçlı sandbox ortamları.

### 3. Tanımlar

- **BCP (Business Continuity Plan):** Kesinti sonrası iş süreçlerinin devamı için strateji ve prosedürler bütünü.
- **DRP (Disaster Recovery Plan):** IT sistemlerinin ve verilerinin yeniden ayağa kaldırılması için teknik plan.
- **BIA (Business Impact Analysis):** Kesintinin iş üzerindeki finansal ve operasyonel etkisinin ölçüldüğü analiz.
- **RTO (Recovery Time Objective):** Bir sistemin kesintiden sonra yeniden çalışır hale gelmesi için izin verilen maksimum süre.
- **RPO (Recovery Point Objective):** Kabul edilebilir maksimum veri kaybı süresi (geriye dönük yedekleme penceresi).
- **MTPD (Maximum Tolerable Period of Disruption):** Kurumun kesintiyi tolere edebileceği maksimum süre.
- **Failover:** Bir sistemin çalışır ikincil sisteme otomatik geçişi.
- **Active-Active:** İki veya daha fazla bölgenin eşzamanlı üretim trafiği işlemesi.
- **Active-Passive:** Bir bölgenin aktif, diğerinin beklemede (warm/cold standby) olduğu model.
- **3-2-1 Kuralı:** 3 kopya veri, 2 farklı medya, 1 off-site kopya.
- **Tabletop Test:** Masa başı senaryo tartışması ile yapılan test.
- **Parallel Test:** DR ortamında üretim paralelinde çalıştırılan test.
- **Full Interruption Test:** Üretim sisteminin gerçekten kapatıldığı test.
- **CMT (Crisis Management Team):** Kriz yönetimi ekibi.
- **Warm Standby:** Veri replike olan ancak trafiği almayan ikincil sistem.

### 4. Roller & Sorumluluklar

- **Yönetim Kurulu:** BCMS programının sponsorluğunu üstlenir, BCP bütçesini onaylar, kritik kararları alır.
- **BCP Yöneticisi (Business Continuity Manager):** ISO 22301 BCMS'in günlük operasyonundan sorumludur; BIA güncellemeleri, plan revizyonları, test takvimi yönetimi.
- **DRP Yöneticisi (IT Disaster Recovery Manager):** Teknik DR altyapısından, replikasyon job'larından, failover otomasyonundan sorumludur.
- **CMT (Crisis Management Team):** CEO (başkan), CTO, CISO, COO, Hukuk Müdürü, İK Direktörü, İletişim Direktörü, BCP Yöneticisi'nden oluşur; kriz anında tüm karar merciidir.
- **Sistem Sahipleri (System Owners):** Kendi sistemlerinin RTO/RPO hedeflerinin tutturulmasından, sistem özelinde DR planlarının yazılmasından sorumludur.
- **Tüm Personel:** Kendi rolüne ait BCP prosedürlerini bilmek, kriz anında CMT talimatlarına uymakla yükümlüdür.

### 5. Politika Maddeleri

1. Şirket, ISO 22301:2019 standardına uyumlu bir BCMS işletecek ve yılda en az bir kez third-party sertifikasyon denetimine girecektir.
2. Her kritik iş süreci için BIA yürütülecek; her süreç için RTO, RPO, MTPD ve kritiklik seviyesi (Critical, High, Medium, Low) tanımlanacaktır.
3. BIA çıktıları en az yılda bir kez ve büyük organizasyonel/mimari değişikliklerden sonra güncellenecektir.
4. Kritik sistemler için RTO maksimum 4 saat, RPO maksimum 15 dakika olarak hedeflenecektir. Yüksek öncelikli sistemler için RTO 8 saat / RPO 1 saat; orta öncelikli için RTO 24 saat / RPO 4 saat olarak belirlenmiştir.
5. Tüm üretim sistemleri için multi-region failover mimarisi kurulacaktır. Kritik tier-1 sistemler active-active, tier-2 sistemler active-passive (warm standby) olarak tasarlanacaktır.
6. Veri yedekleme stratejisi 3-2-1 kuralına uygun olacak: 3 kopya, 2 farklı medya (disk + object storage), 1 off-site (farklı cloud region veya co-location).
7. Yedekler encrypted (AES-256) olarak saklanacak, immutable (WORM) backup hedefleri kullanılacaktır. Ransomware'e karşı air-gapped yedekleme için en az bir kopya offline/belt-and-suspenders ortamda tutulacaktır.
8. Yıllık DR test takvimi oluşturulacak; her kritik sistem için yılda en az 1 tam DR testi, 2 tabletop test, 4 parallel/simulation test yapılacaktır.
9. DR test sonuçları resmi raporlanacak, gap'ler tespit edilecek ve 90 gün içinde düzeltici aksiyon (CAPA) kapatılacaktır.
10. Failover mekanizmaları otomatik (automated failover) olacak; manuel failover yalnızca CMT onayıyla tetiklenebilecektir. Failback prosedürleri her failover için önceden yazılmış olacaktır.
11. Kriz yönetimi ekibi (CMT) 7/24 ulaşılabilir olacak; her üye için yedek (backup) belirlenecektir. CMT yılda en az 2 kez kriz simülasyonu yapacaktır.
12. Personel güvenliği önceliklidir; doğal afet/terör/salgin gibi durumlarda fiziksel ofise erişim CMT kararıyla askıya alınabilir, uzaktan çalışma varsayılacaktır.
13. Müşterilere ve regulatörlere iletişim protokolü tanımlanacaktır. SOC 2 Type II ve KVKK gereği major incident'ler 72 saat içinde ilgili makamlara bildirilecektir.
14. Tedarikçilerin BCP/DR yetkinlikleri onboarding aşamasında değerlendirilecek; kritik tedarikçiler yıllık olarak DR test kanıtı sunacaktır.
15. Yedekleme ve replikasyon job'ları 24 saatlik pencerede en az bir kez monitor edilecek, failure durumunda 1 saat içinde NOC ekibine alarm basılacaktır.
16. Tüm DR plan dokümanları sürüm kontrollü olarak Confluence/SharePoint'te tutulacak, yazılımlaştırılmış (Infrastructure as Code) DR ortamı kurulumu Terraform modülleriyle sağlanacaktır.
17. Cyber incident (ransomware, veri sızıntısı) senaryosu için special-case DR planı; IRP (Politika 7) ile entegre çalışacak, law enforcement ve siber sigorta süreçlerini tetikleyecektir.

### 6. Prosedürler & İş Akışları

**BIA Prosedürü:** Süreç sahibi → süreci haritalar → bağımlılıkları (sistem, tedarikçi, personel) listeler → kesinti maliyetini (finansal + regulatif + reputational) hesaplar → RTO/RPO önerir → BCP Yöneticisi onaylar → BIA kayıt defterine işlenir.

**DR Test Prosedürü:**
1. Test planı yazılır (kapsam, senaryo, success criteria, rollback).
2. CMT onayı alınır, müşteri iletişimi planlanır (maintenance window).
3. Test öncesi snapshot/backup doğrulanır.
4. Tabletop → Simulation → Parallel → Full Interruption sırasıyla ilerlenir.
5. Test sırasında observer (denetçi) ataması yapılır, timeline kayıt altına alınır.
6. Test sonrası RTO/RPO gerçek değeri ölçülür, gap analizi yapılır.
7. 10 iş günü içinde DR Test Raporu yayınlanır, CAPA tracker'a yazılır.

**Kriz Müdahale İş Akışı:** Tespit → Sınıflandırma (severity 1-4) → CMT aktivasyonu → İletişim (internal + external + regulative) → Müdahale → Stabilizasyon → Failback → Post-incident review (72 saat içinde).

### 7. Uyumluluk & İzleme

KPI'lar: RTO compliance %, RPO compliance %, DR test başarım oranı, yedekleme job başarım %, CMT eğitim tamamlanma %, BIA güncelliği % (90 gün içinde güncellenmiş süreçler). Bu metrikler aylık ISMS komitesine, üç ayda bir yönetim kuruluna raporlanır. ISO 22301 internal audit yılda 1, certification audit 3 yılda 1 (surveillance yıllarda 1) yapılır. SOC 2 Type II auditor'ı DR test raporlarını gözden geçirir. Splunk/Datadog ile replikasyon lag, backup success, failover otomasyon health dashboard'ları 7/24 monitor edilir.

### 8. İhlal Yaptırımları

RTO/RPO ihlali (müşteri sözleşmesi ihlali), test takvimine uymama, yedekleme job failure'ının bildirilmemesi, BIA güncellemesinin geciktirilmesi durumlarında: ilk ihlalde yazılı uyarı, tekrarında performans değerlendirme düşürme, kasıtlı ve kurumsal zarar oluşturan ihlallerde sonlandırma. Sözleşmeye bağlı tedarikçiler için SLA ceza mekanizması uygulanır.

### 9. İstisnalar

- Araştırma/POC ortamları BCP kapsamı dışındadır.
- Legacy sistemler (decommission planı olan) için geçici istisna, BCP Yöneticisi + CISO ortak onayıyla 6 aya kadar verilebilir.
- Müşteri özelinde RTO/RPO değişikliği sadece sözleşme değişikliği ile geçerlidir.

### 10. İlgili Standartlar

ISO 22301:2019, ISO 27031 (ICT readiness for business continuity), NIST SP 800-34 Rev. 1 (Contingency Planning), NIST SP 800-53 CP ailesi (CP-2, CP-9, CP-10), SOC 2 CC7.3/CC7.4, PCI-DSS v4.0 Req 12.10, CSA CCM v4 BCR domain, ITIL 4 Service Continuity practice.

### 11. Onay & Revizyon Geçmişi

- v1.0 — 2026-06-21 — İlk yayın. Onaylayan: CEO + CISO + BCP Yöneticisi.
- v1.1 — Yıllık gözden geçirme periyodu: her Ocak. İlgili değişiklikler revizyon tablosuna işlenir.
- Sonraki planlanan revizyon: 2027-01-15.

---

## Politika No: 12 — Bulut Güvenliği Politikası

### 1. Amaç

Bu politika; DeepSeek AI Kod Üretici Stüdyosunun public cloud (AWS, GCP, Azure), private cloud (vSphere/OpenStack) ve hybrid/multi-cloud ortamlarında işlettiği tüm bilgi sistemlerinin güvenli şekilde tasarlanması, dağıtılması, izlenmesi ve yönetilmesini güvence altına almak amacıyla yazılmıştır. Politika; ISO/IEC 27017:2015 (Cloud security), ISO/IEC 27018:2019 (PII in public cloud), CSA CCM v4, NIST SP 800-144, NIST SP 500-299 (NIST Cloud Security Standards) ve her bulut sağlayıcının güvenlik best practice'leri (AWS Well-Architected Security Pillar, GCP Security Foundations Blueprint, Azure Cloud Adoption Framework) ile uyumludur. Amaç; shared responsibility modelini doğru anlamak, CSPM ile bulut posture'unu sürekli izlemek, IaC security ile shift-left güvenliği sağlamak, container ve Kubernetes ortamlarını CIS benchmark'larına göre sertleştirmek, multi-cloud stratejisinde vendor lock-in riskini yönetmek ve bulut-native tehditlere (misconfiguration, exposed storage, IAM privilege escalation, supply chain) karşı koruma sağlamaktır.

### 2. Kapsam

Bu politika; tüm IaaS (VM, network, storage), PaaS (managed DB, app services, queues), SaaS (CRM, ITSM, IDE) ve FaaS (Lambda, Cloud Functions, Azure Functions) servislerini kapsar. Kapsamda; tüm cloud account'ları (organization/root, member accounts, sandbox), tüm region'lar, tüm IAM identity'leri (user, role, service account, machine identity), tüm network kaynakları (VPC, VNet, subnet, security group, NSG, NACL), tüm storage kaynakları (S3, GCS, Azure Blob, EBS, managed disk), tüm compute (EC2, GCE, Azure VM, ECS, EKS, GKE, AKS, Fargate, Cloud Run), tüm database (RDS, Cloud SQL, Cosmos DB, DynamoDB, Spanner), tüm AI/ML servisleri (Bedrock, Vertex AI, Azure OpenAI, Sagemaker) bulunur. Kapsam dışı: şirket içi LAN cihazları (Politika 15), uç noktalar (Politika 14).

### 3. Tanımlar

- **Shared Responsibility Model:** CSP ve müşterinin güvenlik sorumluluklarını paylaştığı model; IaaS'ta müşteri daha fazla, SaaS'ta CSP daha fazla sorumludur.
- **CSPM (Cloud Security Posture Management):** Bulut kaynaklarının konfigürasyonunu sürekli tarayan ve best practice'den sapmaları raporlayan araç.
- **CWPP (Cloud Workload Protection Platform):** VM, container, serverless workload'ları için runtime güvenlik.
- **CNAPP (Cloud-Native Application Protection Platform):** CSPM + CWPP + CIEM + KSPM bütünleşik platform.
- **IaC (Infrastructure as Code):** Terraform, Pulumi, CloudFormation, Bicep ile altyapı tanımı.
- **Admission Controller:** Kubernetes'te pod oluşturulmadan önce policy enforcement yapan webhook.
- **CIS Benchmark:** Center for Internet Security tarafından yayınlanan sertleştirme rehberleri.
- **CIEM (Cloud Infrastructure Entitlement Management):** IAM yetki yönetimi ve least privilege enforcenment.
- **KSPM (Kubernetes Security Posture Management):** K8s cluster posture yönetimi.
- **Multi-Cloud:** Birden fazla CSP'nin stratejik kullanımı.
- **Vendor Lock-In:** Bir CSP'ye bağımlılık riski.

### 4. Roller & Sorumluluklar

- **Cloud Center of Excellence (CCoE):** Bulut stratejisini belirler, landing zone tasarlar, guardrail'leri yazar.
- **Cloud Security Engineer:** CSPM kuralları yazar, IaC scan pipeline kurar, misconfig alert'lerini triaj eder.
- **DevOps/Platform Engineer:** IaC modüllerini yazar, CI/CD pipeline'ına security gate'leri ekler.
- **Cloud Account Owner:** Hesap seviyesinde sorumlu; IAM, billing, quota yönetimi.
- **CISO:** Cloud güvenlik stratejisini onaylar, risk kabul seviyelerini belirler.
- **Tedarikçi (CSP):** Sözleşmeye bağlı fiziksel/altyapısal güvenlik sorumluluğu.

### 5. Politika Maddeleri

1. Şirket; AWS, GCP ve Azure olmak üzere 3 CSP ile multi-cloud stratejisi yürütecektir. Multi-cloud; vendor lock-in'i azaltmak, region bazlı regülasyon uyumu (KVKK veri ikametgâhı) ve BCP/DR için kullanılacaktır.
2. Her CSP organizasyonu için CIS Foundations Benchmark uyumlu landing zone kurulacaktır. AWS Control Tower / GCP Anthos / Azure Landing Zone kullanılacaktır.
3. Root account credentials fiziksel kasada (offline) saklanacak, yalnızca acil break-glass senaryosunda kullanılacaktır. Root login'ler CSPM ile izlenecek, kullanım durumunda otomatik alarm basılacaktır.
4. Tüm IAM user'lar MFA zorunlu, password policy minimum 14 karakter, key rotation 90 gün olacaktır. Long-lived access key kullanımı yasaktır; short-lived STS token veya workload identity kullanılacaktır.
5. IAM permission'lar least privilege ilkesine uygun olacak, CIEM aracı (Microsoft Defender for Cloud, Wiz, Prisma Cloud) ile quarterly access review yapılacaktır. Wildcard (*) permission sadece auditlenmiş service role'lerde kabul edilir.
6. Tüm bulut kaynakları etiketlenecektir (mandatory tags: Owner, Environment, CostCenter, DataClassification, ExpiryDate). Etiketsiz kaynaklar CSPM tarafından 7 gün sonra silinir (auto-remediation).
7. Public exposure: S3/GCS/Blob bucket default private olacak; public erişim CSPM tarafından tespit edildiğinde otomatik olarak kapatılacaktır. Public bucket istisnası sadece CISO onayıyla, signed URL/CloudFront arkasında kullanılabilir.
8. Encryption: Tüm storage (block, object, file) ve database'ler at-rest encryption (AES-256, KMS-managed key) ile korunacaktır. In-transit TLS 1.2+ zorunludur.
9. Network: Tüm production VPC'ler private subnet + NAT gateway pattern'i kullanacaktır. Direct internet exposure için sadece CDN/WAF arkasında public endpoint izin verilir. VPC peering/Transit Gateway ile merkezi egress firewall kullanılacaktır.
10. IaC güvenliği: Terraform/Bicep/Pulumi kodu git reposunda versiyonlanacak, pre-commit hook (tfsec, checkov, KICS) + CI pipeline (Terrascan, Snyk IaC) ile taranacaktır. IaC'yapmadan portal/console'dan manuel kaynak oluşturma yasaktır.
11. Container güvenliği: Tüm container image'lar private registry'den (ECR, GAR, ACR) çekilecek, her image build'inde vulnerability scan (Trivy, Snyk, Aqua) çalıştırılacaktır. Critical CVE içeren image'lar deploy edilemez; admission controller (Kyverno, OPA Gatekeeper) ile enforce edilir.
12. Kubernetes hardening: CIS Kubernetes Benchmark uyumu KSPM aracı ile sürekli izlenecektir. Pod Security Standards (restricted), NetworkPolicy (default deny), RBAC (least privilege), etcd encryption, audit logging zorunludur. Privileged container, hostPath, hostNetwork yasaktır.
13. Serverless güvenliği: FaaS function'lar minimal IAM role, environment variable encryption, private VPC config (database erişimi için), execution timeout ve memory limit ile yazılacaktır. Function code SAST ile taranır.
14. CSPM aracı (Wiz, Prisma Cloud, Defender for Cloud) tüm cloud account'larda 7/24 çalışacak, critical finding'ler 24 saat, high 72 saat, medium 7 gün içinde kapatılacaktır.
15. Veri ikametgâhı: KVKK/GDPR kapsamındaki kişisel veriler Türkiye/EU region'larında saklanacaktır. Cross-region replikasyon veri sınıflandırma politikası (Politika 5) ile uyumlu olmalıdır.
16. CSP değişiklikleri (servis sunumu, region, pricing) ile ilgili quarterly vendor review yapılacaktır. CSP SOC 2 Type II raporu ve ISO 27017 sertifikası yıllık gözden geçirilir.
17. Cloud cost security: Cost anomaly'leri anomali tespiti ile izlenecek, cryptojacking (unauthorized mining) CSPM ve billing alert ile erken tespit edilecektir.

### 6. Prosedürler & İş Akışları

**Yeni Cloud Account Açma:** Talep → CCoE değerlendirme → Landing Zone provisioning (Terraform) → Baseline guardrail'ler (SCP, Azure Policy, Org Policy) → CSPM enrollment → Account owner ataması → Documentation.

**IaC Pipeline:** Developer PR açar → Pre-commit hook (tfsec/checkov) → CI: SAST + secret scan + IaC scan → Plan review → Peer review → Merge → Apply (Terraform Cloud/Atlantis) → CSPM post-deploy scan → Drift detection.

**Container Image Pipeline:** Developer push → CI build → Trivy + Snyk scan → Cosign signing → ECR/GAR push → Admission controller doğrulama → Deploy. Critical CVE varsa deploy block.

**Misconfig Triage:** CSPM detection → Slack/Teams alert → Cloud Security Engineer triaj → False positive ise suppress (justification gerekli) → True positive ise JIRA ticket → Remediation SLA → Closure verification.

### 7. Uyumluluk & İzleme

KPI'lar: CSPM finding closure SLA compliance %, IaC scan coverage %, image scan coverage %, KSPM CIS compliance score, MFA coverage % (IAM user), public exposure finding sayısı, drift detection incident sayısı. Dashboard'lar: Wiz/Prisma posture dashboard, Grafana CSPM metrikleri, AWS Security Hub, GCP Security Command Center. Aylık cloud security raporu CISO'ya, üç aylık rapor yönetim kuruluna sunulur. SOC 2 Type II auditor CSPM log'larını ve IaC pipeline kanıtlarını gözden geçirir.

### 8. İhlal Yaptırımları

Public bucket exposure, root account günlük kullanımı, hardcoded credential, privileged container deploy, manuel portal değişikliği, CSPM finding SLA ihlali: ilk ihlalde yazılı uyarı + 30 günlük eğitim zorunluğu, tekrarında performans notu düşürme, kritik veri sızıntısına yol açan ihlallerde sonlandırma + yasal süreç. CSP ile SLA ihlali durumunda sözleşmedeki ceza maddeleri uygulanır.

### 9. İstisnalar

- Sandbox/POC account'ları CCoE onayıyla bazı guardrail'lerden muaf tutulabilir, ancak yine de encryption + MFA zorunludur.
- Legacy Lift-and-Shift workload'lar için KSPM geçiş planı 12 aya kadar onaylanabilir.
- Academic/research workload'lar için cost optimizasyon amaçlı sınırlı public exposure CISO + CCoE onayıyla verilebilir.

### 10. İlgili Standartlar

ISO/IEC 27017:2015, ISO/IEC 27018:2019, ISO/IEC 27036-2 (supplier relationship), NIST SP 800-144, NIST SP 500-299, NIST SP 800-53 Rev. 5 (SC, AC, AU aileleri), CSA CCM v4, CIS AWS/GCP/Azure Foundations Benchmark, CIS Kubernetes Benchmark, SOC 2 CC6.1/CC6.6, PCI-DSS v4.0 Req 2/3/8/10, GDPR Art. 28 (processor), KVKK Madde 12.

### 11. Onay & Revizyon Geçmişi

- v1.0 — 2026-06-21 — İlk yayın. Onaylayan: CISO + CTO + CCoE Başkanı.
- Yıllık gözden geçirme: her Şubat.
- Sonraki planlanan revizyon: 2027-02-15.

---

## Politika No: 13 — Üçüncü Taraf & Tedarikçi Risk Yönetimi Politikası

### 1. Amaç

Bu politika; DeepSeek AI Kod Üretici Stüdyosunun iş süreçlerinde, veri işlemede ve IT altyapısında kullandığı tüm üçüncü taraf hizmet sağlayıcıların (vendor, supplier, contractor, subprocessor) güvenlik, compliance ve operasyonel risk açısından yönetilmesini güvence altına almak amacıyla yazılmıştır. Amaç; tedarikçi kaynaklı veri ihlallerini (SolarWinds, Kaseya, MOVEit tipi supply-chain saldırıları) önlemek, regulatif uyumluluğu (GDPR Art. 28 processor obligation, KVKK Madde 12/13, SOC 2 CC9.2 vendor management, PCI-DSS Req 12.8) sağlamak, SLA performansını izlemek, dördüncü taraf (vendor'ın vendor'ı) riskini yönetmek, ESCROW ve right-to-audit haklarını kullanılabilir kılmak ve tedarikçi yaşam döngüsü (onboarding → ongoing → offboarding) boyunca tutarlı risk yönetimi yapmaktır. Politika NIST SP 800-161 Rev. 1 (Supply Chain Risk Management) ile ISO/IEC 27036 ailesine dayanır.

### 2. Kapsam

Bu politika; şirketle sözleşmesi olan tüm üçüncü tarafları kapsar: SaaS sağlayıcılar, cloud CSP'ler, MSP/ MSSP'ler, IT konsültanları, freelance contractor'lar, payroll/HR outsource firmaları, fintech bank partner'leri, AI model API sağlayıcıları (DeepSeek, OpenAI, Anthropic, Google), CDN/DNS sağlayıcılar, donanım tedarikçileri, lojistik firmaları, veri center co-location sağlayıcıları, payment processor'lar, KYC/AML servisleri, escrow agent'lar. Kapsam; ticari ilişkinin boyutu无关 olarak tüm vendor'ları kapsar; ancak risk seviyesine göre farklı due diligence derinliği uygulanır. Kapsam dışı: şirket içi İK ve personel (Politika 1, 2, 14).

### 3. Tanımlar

- **Vendor (Tedarikçi):** Şirkete ürün/hizmet sağlayan üçüncü taraf kuruluş.
- **Subprocessor:** Bir vendor'ın hizmet sunumunda kullandığı alt tedarikçi.
- **Fourth-Party Risk:** Subprocessor'lar üzerinden gelen risk (vendor'ın vendor'ı).
- **Vendor Risk Tier:** Low / Medium / High / Critical olarak 4 seviyeli risk sınıflandırması.
- **Due Diligence:** Sözleşme öncesi risk değerlendirme süreci.
- **Right-to-Audit:** Sözleşmede yer alan, vendor'ı denetleme hakkı.
- **SLA (Service Level Agreement):** Hizmet seviyesi taahhüdü.
- **SIG (Standardized Information Gathering):** Shared Assessments standardı vendor güvenlik anketi.
- **CAIQ (Consensus Assessments Initiative Questionnaire):** CSA'nın vendor değerlendirme anketi.
- **ESCROW Agreement:** Kaynak kodun/sanat eserinin üçüncü tarafta saklandığı, vendor iflası durumunda müşteriye devredildiği sözleşme.
- **VRM (Vendor Risk Management):** Genel tedarikçi risk yönetimi programı.
- **TPRM (Third-Party Risk Management):** VRM ile eşanlamlı.

### 4. Roller & Sorumluluklar

- **VRM Yöneticisi:** TPRM programının sahibi; vendor envanterini, risk tiering'i, due diligence sürecini, monitoring cadence'ını yönetir.
- **Sözleşme Sahibi (Contract Owner):** İş biriminin vendor ile ilişkisinden sorumlu kişi; SLA izleme, yenileme, offboarding başlatma.
- **Bilgi Güvenliği Ekibi:** Vendor security questionnaire'lerini değerlendirir, security review yapar, continuous monitoring alert'lerini triaj eder.
- **Hukuk:** Sözleşme clause'larını (right-to-audit, indemnification, data processing agreement, breach notification, ESCROW) yazar.
- **Satın Alma (Procurement):** Ticari müzakereyi yürütür, RFx süreçlerini yönetir.
- **Veri Sahibi (Data Owner):** Vendor'a veri aktarımını onaylar, veri sınıflandırma ile uyumu sağlar.
- **CISO:** High/Critical tier vendor'lar için nihai risk kabul/onay merciidir.

### 5. Politika Maddeleri

1. Tüm vendor'lar merkezi Vendor Inventory (ServiceNow VRM, OneTrust, Risk Recon) içinde kayıt altına alınacaktır. Envanter; şirket adı, hizmet tipi, veri erişim seviyesi, sözleşme tarihi, yenileme tarihi, tier, contract owner, subprocessor listesi içerecektir.
2. Her vendor; veri erişim seviyesi, hizmet kritikliği, finansal etki ve regulatif etki faktörlerine göre 4 tier'a ayrılacaktır:
   - **Critical:** Kişisel/özel nitelikli veri, kritik altyapı, üretim hattı; yıllık full review.
   - **High:** Hassas veri, iş kritik sistem; yıllık review.
   - **Medium:** Sınırlı hassas veri, destekleyici servis; 2 yılda bir review.
   - **Low:** Hassas veri yok, ofis tedarikleri; 3 yılda bir review.
3. Onboarding sırasında due diligence checklist'i doldurulacaktır:
   - SIG-Lite veya CAIQ v4 anketi (High/Critical için tam SIG)
   - SOC 2 Type II raporu (yeni değilse ISO 27001 sertifika)
   - SOC 2 / ISO 27017 (cloud vendor için)
   - PCI-DSS AOC (payment vendor için)
   - GDPR Art. 28 uyumlu DPA (Data Processing Agreement)
   - Financial stability kanıtı (D&B raporu, son 2 yıl bilanço)
   - Insurance certificate (cyber liability min. 5M USD)
   - Subprocessor listesi ve fourth-party disclosure
4. Tüm vendor sözleşmelerinde aşağıdaki clause'lar zorunludur:
   - Right-to-audit (yıllık 1, 30 gün önceden bildirimli)
   - Breach notification (72 saat içinde)
   - Security requirements (ISO 27001/SOC 2 ya da eşdeğer)
   - Data return/destruction at termination
   - Subprocessor change notification (60 gün)
   - Indemnification (data breach için)
   - SLA with credits (service credit)
   - Termination for cause (security ihlali durumunda)
5. Kritik software vendor'lar için Source Code ESCROW agreement kurulacaktır. Vendor iflası, support kesintisi veya M&A sonrası support sonlandırması durumunda kaynak kodu release edilecektir.
6. Vendor SLA performansı aylık olarak izlenecektir. Kritik vendor'lar için SLA dashboard (Datadog, Power BI) kurulacaktır. Üst üste 3 ay SLA breach durumunda contract review toplantısı yapılacaktır.
7. Continuous monitoring (BitSight, SecurityScorecard, Risk Recon) tüm High/Critical vendor'lar için 7/24 çalışacaktır. Security score düşüşü (10 puan+), breach haber bildirimi, CVE exposure alert'leri otomatik Slack/Teams kanalına iletilir.
8. Subprocessor yönetimi: Vendor, yeni subprocessor eklemeden önce 60 gün önceden bildirim yapacaktır. Şirketin itiraz hakkı vardır. Subprocessor listesi vendor envanterinde fourth-party risk değerlendirmesi ile kayıt altına alınır.
9. Vendor'a veri aktarımı sadece Veri Sınıflandırma Politikası (Politika 5) ile uyumlu veri tipi için onaylanabilir. Critical ve High tier veri için DPA + SCC (Standard Contractual Clauses) zorunludur.
10. Cross-border veri transferi (Türkiye dışı) için KVKK Madde 9 uygun veri transfer mekanizmaları (yeterlilik kararı, BCR, SCC) kullanılır.
11. Yıllık vendor risk review: Her High/Critical vendor için contract owner, security, legal, business sponsor katılımıyla toplantı yapılır; hizmet kalitesi, security posture, finansal durum, regulatory değişiklikler değerlendirilir.
12. Vendor offboarding süreci: Hizmet sonlandırma kararı → Veri iadesi/silme sertifikası → Account/closure deactivation → Asset return → Final invoice → Knowledge transfer → Vendor inventory kapatma. Tüm adımlar checklist ile belgelenir.
13. Vendor security incident response: Vendor tarafından bildirilen breach'ler şirket IRP (Politika 7) ile entegre çalışır; müşteri/regulator bildirimi 72 saat içinde yapılır. Vendor breach'i nedeniyle oluşan şirket zararı sigarta/indemnification yoluyla telafi edilir.
14. AI model API vendor'ları (DeepSeek, OpenAI, Anthropic): Özel ek clause — model eğitiminde müşteri verisi kullanılmaması (no training on customer data), data retention maksimum 30 gün, prompt/response logging encrypted, region-specific data residency.
15. Conflict mineral, modern slavery, anti-bribery (FCPA, UK Bribery Act) vendor v Declaration'ları High/Critical vendor'larda zorunludur.
16. Vendor concentring risk: Tek bir vendor'a bağımlılık (single point of failure) критik servisler için yasaktır; alternatif vendor planı (exit strategy) yazılı olmalıdır.

### 6. Prosedürler & İş Akışları

**Onboarding Workflow:** İş ihtiyacı tanımı → RFx → Vendor longlist → İlk değerlendirme (security questionnaire) → Shortlist → Detaylı due diligence → Risk tiering → Sözleşme müzakere → DPA imza → Security review onayı → Inventory kayıt → Go-live.

**Annual Review Workflow:** Contract owner hatırlatma → Security questionnaire güncelleme → SOC 2 rapor yenileme kontrol → Continuous monitoring skor review → SLA performans review → Risk re-tiering → Yenileme/onay/sonlandırma kararı.

**Offboarding Workflow:** Sonlandırma kararı → 90 gün notice → Veri export → Vendor tarafında veri silme sertifikası (NIST 800-88) → Internal account deactivation → Knowledge transfer dokümantasyonu → Vendor inventory closed status → Post-mortem (High/Critical için).

**Subprocessor Change Workflow:** Vendor 60 gün önceden bildirim → VRM Yöneticisi değerlendirme → Fourth-party risk analiz → İtiraz gerekçesi (varsa) → 30 gün içinde vendor'a yanıt → Onay/reddetme → Inventory güncelleme.

### 7. Uyumluluk & İzleme

KPI'lar: Vendor inventory completeness %, due diligence on-time completion %, SLA compliance %, continuous monitoring coverage %, ESCROW coverage % (critical software vendor), annual review on-time %, vendor incident count. Bu metrikler aylık TPRM komitesine, üç ayda bir yönetim kuruluna raporlanır. SOC 2 Type II ve ISO 27001 auditor'ları vendor envanterini ve due diligence kanıtlarını gözden geçirir. GDPR denetimlerinde processor sözleşmeleri (DPA) örneklemi kontrol edilir. BitSight/SecurityScorecard skorları aylık raporlanır.

### 8. İhlal Yaptırımları

Due diligence atlanarak vendor onboarding, DPA imzalanmadan veri paylaşımı, subprocessor izinsiz değişiklik, SLA breach bildirilmemesi, vendor offboarding checklist'i atlanması: ilk ihlalde yazılı uyarı + 30 günlük.vendor güvenlik eğitimi zorunluğu, tekrarında performans notu düşürme, kurumsal zarara yol açan ihlallerde sonlandırma + yasal süreç. Vendor'a karşı SLA ihlali ve breach durumunda sözleşmedeki ceza ve indemnification maddeleri uygulanır; gerekirse tahkim/yargı yoluna gidilir.

### 9. İstisnalar

- Low tier vendor'lar (ofis tedarikleri) için due diligence checklist sadeleştirilmiş versiyon uygulanır.
- Acil durum (üretim down) kurtarma için geçici vendor kullanımı CISO onayıyla 30 güne kadar, sonrasında due diligence tamamlanmak şartıyla mümkündür.
- Aynı grup şirketi içi vendor'lar için grup-level SOC 2 raporu kabul edilir.
- Regüle sektör (bankacılık, sağlık) vendor'ları için ek sektör-spesifik due diligence (PCI DSS, HIPAA) uygulanır.

### 10. İlgili Standartlar

ISO/IEC 27036-1/2/3/4 (Supplier relationship security), ISO/IEC 27001:2022 Annex A.5.19-A.5.23 (supplier relationships), NIST SP 800-161 Rev. 1 (Supply Chain Risk Management), NIST SP 800-53 Rev. 5 SR ailesi (SR-1 to SR-12), SOC 2 CC9.2, PCI-DSS v4.0 Req 12.8/12.9, GDPR Art. 28/29/32, KVKK Madde 12/13, Shared Assessments SIG, CSA CAIQ v4, FCPA (US Foreign Corrupt Practices Act), UK Bribery Act 2010, EU AI Act (high-risk AI system providers).

### 11. Onay & Revizyon Geçmişi

- v1.0 — 2026-06-21 — İlk yayın. Onaylayan: CISO + CFO + Hukuk Müdürü + COO.
- Yıllık gözden geçirme: her Mart.
- Sonraki planlanan revizyon: 2027-03-15.

---

## Politika No: 14 — Donanım & Cihaz Yönetimi Politikası

### 1. Amaç

Bu politika; DeepSeek AI Kod Üretici Stüdyosunda kullanılan tüm fiziksel donanım (laptop, desktop, sunucu, mobil cihaz, tablet, IoT cihazı, ağ cihazı) ve uç noktaların güvenli şekilde temini, kaydı, izlenmesi, yönetimi ve kullanım dışı bırakılması (decommissioning) süreçlerini güvence altına almak amacıyla yazılmıştır. Politika; CIS Controls v8 (Control 1-2 inventory, Control 4 secure configuration, Control 7 continuous vulnerability management, Control 10 malware defense, Control 12 network infrastructure), NIST SP 800-88 Rev. 1 (Media Sanitization), NIST SP 800-53 Rev. 5 (CM, MP, AC aileleri) ve ISO 27001:2022 Annex A.7 (asset management), A.8.7 (malware), A.8.10 (information deletion), A.8.19 (mobile software) ile uyumludur. Amaç; cihaz envanterinin %100 doğruluğunu sağlamak, full disk encryption ile veri ifşa riskini azaltmak, EDR ile gelişmiş tehdit tespiti yapmak, MDM/UEM ile merkezi yönetim kurmak, BYOD riskini yönetmek, USB ve çıkarılabilir medya riskini kontrol altına almak, patch management ile known vulnerability'ları kapatmak ve kullanım dışı cihazlardaki verilerin geri dönüşümsüz şekilde silinmesini (NIST 800-88 Purge) sağlamaktır.

### 2. Kapsam

Bu politika; şirketin sahip olduğu, kiraladığı veya BYOD kapsamında kullandığı tüm cihazları kapsar: şirket laptop'ları (macOS, Windows, Linux), desktop workstation'lar, mobil telefonlar (iPhone, Android), tablet'ler, sunucular (fiziksel ve sanal), network cihazları (switch, router, firewall, AP), IoT cihazları (yazıcı, smart TV, kamera, sensör), USB/removable media, harici diskler, akıllı kartlar/USB token'lar. Kapsam; cihaz yaşam döngüsünün tüm aşamalarını (procurement, enrollment, monitoring, retirement) ve tüm kullanıcı gruplarını (tüm personel, contractor, intern) içerir. Kapsam dışı: kişisel cihazlardaki kişisel veriler (ancak BYOD ile şirket verisine erişen cihazlar kapsamdadır); veri merkezi fiziksel altyapı (Politika 15 ve 11 ile ortak).

### 3. Tanımlar

- **MDM (Mobile Device Management):** Mobil cihazların merkezi yönetimi.
- **UEM (Unified Endpoint Management):** Mobil + desktop + IoT cihazların tek platformda yönetimi.
- **EDR (Endpoint Detection & Response):** Uç noktada gelişmiş tehdit tespiti ve otomatik müdahale.
- **XDR (Extended Detection & Response):** EDR + network + cloud + email entegrasyonu.
- **FDE (Full Disk Encryption):** Tüm diskin şifrelenmesi (BitLocker, FileVault, LUKS).
- **TPM (Trusted Platform Module):** Donanım tabanlı güvenli anahtar deposu.
- **Remote Wipe:** Uzaktan veri silme.
- **BYOD (Bring Your Own Device):** Kişisel cihazın iş amaçlı kullanımı.
- **COBO (Corporate Owned, Business Only):** Şirket cihazı, sadece iş amaçlı.
- **COPE (Corporate Owned, Personally Enabled):** Şirket cihazı, kişisel kullanıma da açık.
- **MDM Enrollment:** Cihazın MDM sistemine kaydedilmesi.
- **Patch Management:** Güvenlik güncellemelerinin dağıtımı.
- **Sanitization:** Verinin geri dönüşümsüz silinmesi (NIST 800-88: Clear, Purge, Destroy).
- **Bastion Host / Jump Server:** Privileged erişim için aracı sunucu (Politika 15).
- **NAC (Network Access Control):** Ağa katılmadan cihaz posture kontrolü.

### 4. Roller & Sorumluluklar

- **IT Asset Manager:** Cihaz envanterinin tutulması, lifecycle koordinasyonu, asset tag yönetimi.
- **Endpoint Security Engineer:** EDR policy'leri, MDM profile'ları, hardening standard'ları.
- **IT Support / Help Desk:** Cihaz dağıtımı, enrollment, troubleshooting.
- **Sistem Yöneticisi:** Sunucu hardening, patch management.
- **Kullanıcı:** Cihazın fiziksel güvenliği, security policy'lere uyum, kayıp/çalıntı bildirimi.
- **CISO:** Endpoint security stratejisini onaylar, BYOD risk kabul seviyelerini belirler.
- **Satın Alma:** Donanım temini, vendor SLA yönetimi.
- **Çevre/Atık Yönetimi Ekibi:** E-waste, decommissioned cihazların çevre dostu imhası.

### 5. Politika Maddeleri

1. Tüm şirket cihazları merkezi CMDB (ServiceNow, Snipe-IT, Lansweeper) envanterinde %100 doğru şekilde kayıt altına alınacaktır. Envanter; asset tag, SN, model, kullanıcı, location, OS, encryption status, last check-in, warranty end bilgilerini içerecektir.
2. Cihaz temini sadece onaylı vendor ve modellerden yapılacaktır (standartlaştırılmış donanım listesi). TPM 2.0 ve Secure Boot desteği zorunludur.
3. Tüm laptop/desktop cihazlar UEM (Microsoft Intune, Jamf Pro, VMware Workspace ONE) ile yönetilecektir. UEM enrollment olmadan üretim ağına erişim yasaktır.
4. Full disk encryption tüm cihazlarda zorunludur: Windows BitLocker, macOS FileVault 2, Linux LUKS. Recovery key UEM/AD'de escrow edilecek, kullanıcı erişimine kapalı saklanacaktır.
5. Tüm cihazlarda EDR (Microsoft Defender for Endpoint, CrowdStrike Falcon, SentinelOne) yüklü ve aktif olacaktır. EDR disabled durumu 24 saatten fazla sürerse cihaz ağdan otomatik izole edilir.
6. Operating system ve uygulama patch yönetimi: Critical patch 7 gün, High 30 gün, Medium 90 gün, Low 180 gün içinde uygulanır. Otomatik patch dağıtımı (WUfB, Jamf Pro patch management) tercih edilir.
7. Hardening standard'ları: Windows CIS Benchmark, macOS CIS Benchmark, Linux STIG uygulanır. Local admin hakları kısıtlı (just-in-time JIT model); normal kullanıcılar standart user, privileged erişim PAM (Privileged Access Management) ile verilir.
8. Screen lock: 5 dakika idle sonrası otomatik lock, password/PIN/biometric unlock zorunlu. Screen share esnasında hassas veri görünürlüğü engellenir.
9. USB ve çıkarılabilir medya: Varsayılan olarak block; sadece onaylı encrypted USB (IronKey, Kingston Encrypted) kullanılabilir. BYOD USB yasak. File transfer şirket onaylı yöntemle (OneDrive, Google Drive, SharePoint) yapılır.
10. BYOD politikası: Sadece COPE modeli desteklenir. BYOD cihazlar MDM enrollment (work profile/Android Enterprise, iOS User Enrollment) ile yönetilir. Şirket verisi encrypted container'da tutulur, personal veriye şirket erişimi yoktur. Lost/stolen durumunda sadece şirket container'ı remote wipe edilir.
11. Cihaz kayıp/çalıntı 24 saat içinde IT'ye bildirilmelidir. IT 1 saat içinde remote lock, 4 saat içinde remote wipe (gerekirse) uygular. Local compliance policy breach durumunda da cihaz otomatik quarantine'ye alınır.
12. Mobil cihazlar: iOS 15+ ve Android 11+ minimum. Rooted/jailbroken cihaz tespit edilirse otomatik olarak şirket e-posta/MFA erişimi kapatılır.
13. Sunucu hardening: Tüm sunucular golden image (Packer) ile deploy edilir. Image CIS Benchmark ile hardened, latest patches içerecek, EDR agent yüklü olacak şekilde build'lenir. Configuration drift Ansible/Chef/Puppet ile düzeltilir.
14. IoT cihazları: Ayrı VLAN'da (Politika 15), internet erişimi default deny, sadece gerekli port/IP'ye izin. Default credential değiştirme zorunlu, firmware güncellemeleri yıllık review.
15. Decommissioning: Cihaz退役 öncesi NIST SP 800-88 uyumlu sanitization uygulanır:
    - **Clear:** Sıfırlama (factory reset, OS reinstall) — Low sensitivity veri için.
    - **Purge:** Disk wipe (DoD 5220.22-M, NIST 800-88 Purge) veya cryptographic erase — Medium/High sensitivity.
    - **Destroy:** Fiziksel imha (shred, crush, degauss) — Critical/KVKK veri içeren diskler için.
    Sanitization sertifikası (certificate of destruction) issued vendor tarafından imzalanır, 7 yıl saklanır.
16. Cihaz transferi (kullanıcı değişimi, departman transferi) öncesinde mutlaka sanitization yapılır. Cihazlar dış kuruluşa bağışlanmadan önce Purge+Destroy uygulanır.
17. Asset tag ve SN envanter ile fiziksel cihaz uyumu yıllık physical audit ile doğrulanır. %98+ accuracy hedeflenir.

### 6. Prosedürler & İş Akışları

**Cihaz Temin Workflow:** Talep (JIRA) → IT manager onayı → Satın alma → Vendor → Cihaz alım → Asset tag basımı → CMDB kayıt → UEM enrollment → EDR agent yükleme → FDE enable → Hardening profile deploy → Kullanıcı teslim → Receipt imza.

**BYOD Enrollment Workflow:** Kullanıcı self-service portal talebi → IT onayı → MDM profil install → Work profile/container oluşturma → Şirket app install (e-posta, Teams, MFA) → Compliance check → Ağ erişim izni → Quarterly compliance re-check.

**Patch Management Workflow:** Vendor Patch Tuesday → Patch sandbox test (7 gün) → Pilot grup dağıtım → Validation → Broad deployment (14 gün) → Compliance report → Failed patch triaj.

**Decommissioning Workflow:** Talep (retirement/resignation) → Data backup → License deactivation → NIST 800-88 sanitization (Clear/Purge/Destroy) → Sertifika → E-waste vendor → Asset retirement in CMDB → Audit log.

**Lost/Stolen Workflow:** Kullanıcı bildirim (24 saat) → IT ticket → UEM remote lock → Veri sızıntısı riski değerlendirme → Gerekirse remote wipe → Password reset → MFA re-enrollment → IRP entegrasyonu (Politika 7) → Police report (gerekirse).

### 7. Uyumluluk & İzleme

KPI'lar: Envanter doğruluğu %, MDM enrollment coverage %, FDE coverage %, EDR coverage %, patch compliance (7/30/90 gün SLA) %, USB block compliance %, BYOD container compliance %, decommission SLA compliance %, sanitization certificate completeness %. Dashboard'lar: Intune/Jamf compliance dashboard, Defender for Endpoint console, Lansweeper/ServiceNow asset reports. Aylık endpoint security raporu CISO'ya, üç aylık yönetim kuruluna sunulur. SOC 2 Type II auditor MDM enrollment kanıtlarını, patch SLA raporlarını, sanitization sertifikalarını inceler. ISO 27001 Annex A.7 denetimleri için asset register örneklemesi yapılır.

### 8. İhlal Yaptırımları

MDM/EDR/FDE disabled bırakma, USB block bypass, jailbreak/root girişimi, şirket cihazını yetkisiz bölgeye götürme, sanitization atlanması, kayıp cihazın zamanında bildirilmemesi: ilk ihlalde yazılı uyarı + 30 günlük security training, tekrarında performans düşürme, kasıtlı ve veri sızıntısına yol açan ihlallerde sonlandırma + yasal süreç. E-waste vendor SLA ihlali durumunda sözleşme cezaları uygulanır.

### 9. İstisnalar

- Air-gapped Araştırma/lab cihazları için MDM/EDR muafiyeti CISO onayıyla verilebilir, ancak FDE zorunludur.
- Executive cihazları için JIT local admin modeli uygulanabilir.
- Sabit fonksiyonlu kiosk cihazları için sınırlı hardening profili (kiosk mode) onaylanabilir.
- Geçici contractor cihazları 30 güne kadar limited access VLAN'ında çalışabilir.

### 10. İlgili Standartlar

CIS Controls v8 (1-2-4-7-10-12), NIST SP 800-88 Rev. 1 (Media Sanitization), NIST SP 800-53 Rev. 5 (CM-7, CM-8, CM-10, CM-11, MP-6, MP-7, AC-19, AC-20), ISO/IEC 27001:2022 Annex A.5.9 (inventory), A.7.9-A.7.10 (storage), A.8.2 (privileged access), A.8.7 (malware), A.8.10 (information deletion), A.8.19 (mobile software), A.8.22 (segregation of networks), SOC 2 CC5.3/CC6.1/CC6.6, PCI-DSS v4.0 Req 5 (anti-malware), Req 6 (patch management), GDPR Art. 32 (security of processing).

### 11. Onay & Revizyon Geçmişi

- v1.0 — 2026-06-21 — İlk yayın. Onaylayan: CISO + IT Direktörü + İK Direktörü.
- Yıllık gözden geçirme: her Nisan.
- Sonraki planlanan revizyon: 2027-04-15.

---

## Politika No: 15 — Ağ Güvenliği Politikası

### 1. Amaç

Bu politika; DeepSeek AI Kod Üretici Stüdyosunun tüm ağ altyapısının (LAN, WAN, datacenter network, cloud VPC, VPN, wireless, internet edge) güvenli şekilde tasarlanması, işletilmesi ve izlenmesi için stratejik ve operasyonel kuralları belirlemek amacıyla yazılmıştır. Politika; NIST SP 800-207 (Zero Trust Architecture), NIST SP 800-53 Rev. 5 SC (System and Communication Protection) ailesi, ISO/IEC 27001:2022 Annex A.8.20-A.8.23 (network security), ISO/IEC 27033 ailesi (network security), CIS Controls v8 Control 12 (Network Infrastructure Management) ve defense-in-depth prensibi ile uyumludur. Amaç; zero trust modeline geçiş yaparak "never trust, always verify" prensibini uygulamak, network segmentation ile lateral movement'i sınırlamak, firewall/IDS/IPS/WAF/DDoS koruma ile çok katmanlı savunma kurmak, DNS security ile domain tabanlı tehditleri engellemek, TLS inspection ile şifreli trafiği denetlemek, NAC ile managed cihazları ağa kabul etmek, bastion/jump server ile privileged erişimi denetlemektir.

### 2. Kapsam

Bu politika; tüm şirket ağ altyapısını kapsar: ofis LAN (kablolu/kablosuz), veri merkezi network (spine-leaf, traditional 3-tier), bulut VPC/VNet, hybrid connectivity (ExpressRoute, Direct Connect, VPN), SD-WAN, internet edge, perimeter security, DMZ, management network, out-of-band management (OOBM), Wi-Fi (corporate, guest, IoT), VPN gateway, ZTNA (Zero Trust Network Access) platformu, BGP/OSPF routing, DNS altyapısı (internal resolver, public DNS, conditional forwarder), load balancer (L4/L7), reverse proxy, CDN edge. Kapsam; tüm ağ cihazlarını (switch, router, firewall, AP, load balancer, IPS), ağ hizmetlerini (DHCP, DNS, NTP, RADIUS), ağ güvenlik araçlarını (NAC, IDS/IPS, WAF, DDoS, SIEM) içerir. Kapsam dışı: cihaz endpoint güvenliği (Politika 14), BCP/DR (Politika 11).

### 3. Tanımlar

- **Defense in Depth:** Çok katmanlı güvenlik yaklaşımı; her katmanı aşan saldırgan bir sonraki katmanla karşılaşır.
- **Zero Trust (ZTA):** "Asla güvenme, her zaman doğrula" prensibi; her erişim isteği authentication + authorization + context-aware değerlendirmeden geçer.
- **ZTNA (Zero Trust Network Access):** VPN yerine identity + device + context bazlı uygulama erişimi.
- **Network Segmentation:** Ağın güvenlik amaçlı bölümlere ayrılması.
- **Microsegmentation:** Workload seviyesinde (host/host group) granüler segmentation.
- **VLAN (Virtual LAN):** Layer-2 segmentation aracı.
- **Firewall:** L3/L4/L7 traffic filtering cihazı (NGFW: Next-Gen Firewall).
- **IDS (Intrusion Detection System):** Saldırı tespit sistemi (passive).
- **IPS (Intrusion Prevention System):** Saldırı önleme sistemi (active block).
- **WAF (Web Application Firewall):** L7 / OWASP Top 10 koruması.
- **DDoS Protection:** Dağıtık service Redial of Service saldırılarına karşı koruma.
- **VPN (Virtual Private Network):** Şifreli tünel ile uzaktan erişim.
- **DNSSEC:** DNS yanıtının kriptografik imzası.
- **DoH/DoT:** DNS over HTTPS / DNS over TLS — DNS trafiğinin şifrelenmesi.
- **Bastion Host / Jump Server:** Privileged erişim için aracı sunucu.
- **NAC (Network Access Control):** Cihaz posture kontrolü ile ağa kabul/reddetme.
- **TLS Inspection (SSL Decryption):** Şifreli trafiğin arada deşifre edilerek denetlenmesi.
- **East-West Traffic:** Data center içi (sunucular arası) trafik.
- **North-South Traffic:** İçeriden dışarıya / dışarıdan içeriye trafik.

### 4. Roller & Sorumluluklar

- **Network Architecture Team:** Ağ topolojisini, segmentation stratejisini, IP planını tasarlar.
- **Network Security Engineer:** Firewall rule'ları, IPS signature'ları, WAF policy'leri yazar ve uygular.
- **Network Operations (NOC):** 7/24 network monitoring, incident triaj, change implementation.
- **Sistem Yöneticisi:** Sunucu network konfigürasyonu, host-based firewall.
- **Cloud Network Engineer:** VPC/VNet design, transit gateway, peering.
- **CISO:** Ağ güvenliği stratejisini onaylar, zero trust roadmap'ini yönetir.
- **Change Advisory Board (CAB):** Tüm ağ değişikliklerini review ve onaylar.
- **ISP/MSSP:** Dış servis sağlayıcılar, upstream DDoS scrubbing.

### 5. Politika Maddeleri

1. Şirket, NIST SP 800-207 uyumlu Zero Trust Architecture'a geçiş yapacaktır. 2027 sonuna kadar VPN yerine ZTNA (Zscaler ZIA/ZPA, Cloudflare Access, Akamai Enterprise Access) kullanılacaktır. Her erişim requesti identity + device posture + risk score + context bazlı değerlendirilecektir.
2. Defense-in-depth prensibi uygulanacaktır: perimeter (DDoS, edge firewall) → DMZ (WAF, reverse proxy) → internal (segmentation, internal firewall) → host (host firewall, EDR) → application (RBAC, input validation) → data (encryption).
3. Network segmentation: Tüm ağ en az 7 VLAN'a bölünecektir:
   - **Servers-Prod** (üretim sunucuları)
   - **Servers-Management** (yönetim arayüzleri, OOBM)
   - **Workstations-Corporate** (ofis PC'leri)
   - **Wireless-Corporate** (kurumsal Wi-Fi)
   - **Wireless-Guest** (misafir Wi-Fi, internet only)
   - **IoT/OT** (yazıcı, kamera, sensör)
   - **Quarantine** (compliance dışı cihazlar)
   VLAN'lar arası trafik internal firewall (L3) ve ACL (L2/L3) ile kontrol edilir.
4. Microsegmentation: Üretim data center'da VMware NSX / Cisco ACI / Illumio ile workload seviyesinde segmentation uygulanacaktır. Default-deny policy; sadece white-list iletişime izin verilir.
5. Firewall rule lifecycle: Tüm firewall rule'lar CAB onaylı, ticket bazlı eklenir. Her rule için; owner, business justification, expiration date (maks 1 yıl) zorunludur. Yıllık firewall rule review yapılarak unused/expired rule'lar silinir. "Any-any" rule yasaktır.
6. NGFW (Palo Alto, Fortinet, Check Point) her segment boundary'de konuşlandırılır. IPS, URL filtering, sandboxing (cloud-delivered), threat intelligence subscription aktif olacaktır.
7. IDS/IPS: Tüm internet edge ve data center critical segment'lerde IDS (Snort/Suricata passive) ve IPS (NGFW inline) çalışacaktır. Signature'lar haftalık güncellenir, custom rule'lar SOC tarafından yazılır.
8. WAF: Tüm web uygulama ve API'ler WAF (Cloudflare, AWS WAF, F5 ASM, Imperva) arkasında sunulur. OWASP Core Rule Set + custom rule'lar, bot management, rate limiting aktiftir. WAF block mode'da çalışır; false positive triaj SLA 4 saat.
9. DDoS Protection: Internet edge L3/L4 DDoS (Cloudflare Magic Transit, AWS Shield Advanced, Arbor) + L7 DDoS (WAF rate limit) korunacaktır. Scrubbing center failover testi yılda 1 yapılır.
10. VPN/ZTNA: Kullanıcı uzaktan erişimi için ZTNA tercih edilir. Legacy VPN (IKEv2/IPsec) yalnızca ZTNA desteklemeyen sistemler için, MFA + device certificate ile, süresi 8 saat ile sınırlandırılır. Split-tunneling yasak; full-tunnel zorunlu.
11. DNS Security: Tüm internal DNS resolver'lar DNSSEC doğrulaması yapar. DoH/DoT external DNS sorguları için zorunludur. RPZ (Response Policy Zone) ile malicious domain'ler block edilir. DNS logs SIEM'e gönderilir, DGA (Domain Generation Algorithm) tespiti yapılır.
12. Bastion Host / Jump Server: Tüm privileged erişim (sunucu SSH/RDP, network cihazı CLI, DB admin) jump server (Teleport, Boundary, native bastion) üzerinden yapılır. Session recording, MFA, just-in-time access zorunludur. Direct SSH/RDP yasaktır.
13. NAC: Tüm network access point'lerde NAC (Cisco ISE, Aruba ClearPass, Forescout) çalışır. 802.1X authentication (certificate-based) zorunludur; MAB (MAC Authentication Bypass) yalnızca printer/IoT için. Compliance check (antivirus, patch level, encryption) başarısızsa cihaz Quarantine VLAN'a alınır.
14. TLS Inspection: Tüm internet-bound HTTPS trafik (exit proxy) TLS decryption (Palo Alto SSL Decryption, Netskope, Zscaler) ile denetlenir. Privacy缘故, kişisel banking/health/category-based BYPASS listesi uygulanır. CA certificate IT tarafından distribute edilir, certificate pinning siteleri bypass edilir.
15. Wireless Security: WPA3-Enterprise + 802.1X (EAP-TLS) corporate Wi-Fi. Open/Guest Wi-Fi internet only, captive portal + zaman sınırlı (4 saat). Rogue AP tespiti WIPS (Wireless IPS) ile yapılır.
16. Network Monitoring: NetFlow/sFlow + packet capture (PCAP) + SNMP + sys-log SIEM'e (Splunk, Sentinel, Elastic) gönderilir. NDR (Network Detection & Response - ExtraHop, Vectra, Darktrace) east-west anomali tespiti için kullanılır. Anomali alert'leri SOC'a 15 dakika içinde iletilir.
17. Out-of-Band Management (OOBM): Tüm ağ cihazları ve sunucular için ayrı OOBM ağı kurulur. Production traffic ile izole, sadece jump server üzerinden erişilebilir.
18. BGP/Routing Security: BGP session'lar TCP-AO/MD5 authentication, prefix-limit, RPKI (Resource Public Key Infrastructure) ROA validation ile korunur. Route leak/bgp hijack tespiti MONROE/BGPmon benzeri servislerle izlenir.

### 6. Prosedürler & İş Akışları

**Firewall Rule Ekleme Workflow:** Talep (JIRA, business justification) → Network Security review → Risk değerlendirme (least privilege principle) → CAB onayı → Implementation (change window) → Validation (traffic log) → Documentation (rule entry with expiry) → 1 yıl sonra review.

**ZTNA Onboarding Workflow:** Uygulama sahibi talep → ZTNA policy yazma (identity + device + context) → Test (pilot grup) → Cutover → VPN decommissioning → Monitoring.

**NAC Quarantine Workflow:** Cihaz bağlanır → 802.1X authentication → Posture check → Fail → Quarantine VLAN → Kullanıcıya remediation notification → IT ticket → Fix (patch/antivirus update) → Re-authentication → Compliance → Corporate VLAN.

**Incident Response Workflow (Network):** NDR/IDS alert → SOC triaj (5 dk) → Severity classification → Containment (block IP, isolate host) → Forensics (PCAP analysis) → IRP (Politika 7) entegrasyon → Eradication → Recovery → Lessons learned.

**TLS Inspection Bypass Workflow:** Site sahibi talebi (banking, healthcare, cert-pinned app) → Privacy + security review → Bypass listeye ekleme → Quarterly review (gereksiz bypass kaldırma).

### 7. Uyumluluk & İzleme

KPI'lar: Firewall rule cleanup % (yıllık review), IDS/IPS signature up-to-date %, WAF block rate (false positive <2%), NAC compliance %, ZTNA adoption %, TLS inspection coverage % (hedef %80+, bypass listesi <5%), DNS security coverage %, segmentasyon policy violation count, MTTR network incident <4 saat. Dashboard'lar: SIEM network dashboard, NGFW panorama, NDR heatmap, ZTNA admin console. Aylık network security raporu CISO'ya, üç aylık yönetim kuruluna sunulur. SOC 2 Type II auditor firewall rule review kanıtlarını, NAC compliance raporlarını, WAF log'larını inceler. PCI-DSS Req 1 (firewall), Req 4 (encryption), Req 10 (logging), Req 11 (testing) denetimleri yapılır.

### 8. İhlal Yaptırımları

Yetkisiz firewall rule ekleme, "any-any" rule kullanımı, VPN split-tunneling, jump server bypass, NAC bypass, TLS inspection CA removal, rogue AP kurma, BYOD cihazın corporate Wi-Fi'ye bağlanması, OOBM ağının production'a bağlanması: ilk ihlalde yazılı uyarı + 30 günlük network security training, tekrarında performans düşürme, kasıtlı ve veri sızıntısına yol açan ihlallerde sonlandırma + yasal süreç. ISP/MSSP SLA ihlalleri sözleşmedeki ceza maddeleri ile yaptırımlanır.

### 9. İstisnalar

- Legacy OT/ICS network'ler için segmentasyon geçişi 24 aya kadar onaylanabilir.
- Academic/research lab network'ü için sınırlı segmentation modeli CISO onayıyla verilebilir.
- Acil incident response esnasında temporary "any" rule, CISO onayıyla 24 saate kadar açılabilir, sonra mutlaka kapatılır.
- Regüle sektör (bankacılık) data center'larında ek KVKK/CBDDO gereksinimleri uygulanır.

### 10. İlgili Standartlar

NIST SP 800-207 (Zero Trust Architecture), NIST SP 800-53 Rev. 5 SC ailesi (SC-7 boundary protection, SC-8 transmission confidentiality, SC-12 cryptographic key, SC-20 secure name resolution, SC-35 intrusion detection, SC-36 distributed filtering), ISO/IEC 27001:2022 Annex A.8.20 (networks security), A.8.21 (network services security), A.8.22 (segregation of networks), A.8.23 (web filtering), ISO/IEC 27033-1/2/3/4/5/6 (network security), CIS Controls v8 Control 12 (Network Infrastructure Management) + Control 13 (Network Monitoring and Defense), SOC 2 CC6.1/CC6.6/CC7.1, PCI-DSS v4.0 Req 1 (firewall/router), Req 4 (encrypt transmission), Req 10 (audit trails), Req 11 (testing security), GDPR Art. 32 (security of processing).

### 11. Onay & Revizyon Geçmişi

- v1.0 — 2026-06-21 — İlk yayın. Onaylayan: CISO + CTO + Network Architecture Lead.
- Yıllık gözden geçirme: her Mayıs.
- Sonraki planlanan revizyon: 2027-05-15.

---

*Bu doküman (Politika 11–15) DeepSeek AI Kod Üretici Stüdyosu Faz 3 politika setinin bir parçasıdır. Tüm politikalar Faz 1 araştırma dokümanları (01-deepseek-models.md, 02-enterprise-standards.md, 03-agent-backend-standards.md) ile uyumludur ve Faz 2 politika seti (Politika 1–10) ile birlikte çalışacak şekilde tasarlanmıştır. Politika sahibi: CISO Ofisi. Gizlilik seviyesi: Internal.*
