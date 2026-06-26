# Kurumsal Politika Dosyası — Faz 4 (Politikalar 16–20)

Bu doküman, AI Kod Üretici Stüdyosu (DeepSeek tabanlı) projesinin Faz 2 kapsamında üretilen 16–20 numaralı politikaları içermektedir. Her politika; amaç, kapsam, tanımlar, roller, politika maddeleri, prosedürler, uyumluluk, yaptırımlar, istisnalar, ilgili standartlar ve onay/revizyon geçmişi bölümlerinden oluşmaktadır. Politikalar ISO/IEC 27001:2022, NIST CSF 2.0, ITIL 4, NIST SP 800-92, SLSA v1.0 ve EO 14028 referanslarıyla uyumlu olarak hazırlanmıştır.

---

## Politika No: 16 — Loglama, İzleme & Denetim Politikası

### 1. Amaç

Bu politikanın temel amacı; kurumun bilgi sistemleri, uygulamaları, ağ cihazları, bulut kaynakları ve güvenlik bileşenleri tarafından üretilen log kayıtlarının toplanması, taşınması, saklanması, analizi ve imha edilmesi süreçlerini standartlaştırmaktır. NIST SP 800-92 "Guide to Computer Security Log Management" yayınına paralel olarak, kurum log yönetimi yaşam döngüsünün (oluşturma, toplama, normalizasyon, indeksleme, analiz, raporlama, arşivleme, imha) tüm aşamalarını yönetişim altına alır. Politika; güvenlik olaylarının tespiti, olay müdahalesi (incident response), adli analiz (forensics), mevzuat uyumluluğu (GDPR, KVKK, PCI-DSS, SOX) ve operasyonel görünürlük için tek doğruluk kaynağı (single source of truth) oluşturmayı hedefler. Ayrıca denetim izlerinin (audit trail) değiştirilemezliğini (immutability), zaman senkronizasyonunu ve WORM (Write Once Read Many) depolama gereksinimlerini tanımlayarak log bütünlüğünü garanti altına alır.

### 2. Kapsam

Politika; kurumun sahip olduğu, işlettiği veya kullandığı tüm üretim ve üretim dışı (staging, test, geliştirme) ortamlarındaki sistem ve bileşenleri kapsar. Kapsama dâhildir: işletim sistemleri (Linux, Windows), konteyner çalışma zamanları (Docker, containerd), orkestrasyon platformları (Kubernetes), veritabanları (PostgreSQL, MongoDB, Redis), mesaj kuyrukları (Kafka, RabbitMQ), API gateway'ler, yük dengeleyiciler, güvenlik duvarları, IDS/IPS, WAF, EDR/XDR çözümleri, kimlik erişim yönetimi (IAM) sistemleri (Active Directory, Okta, Keycloak), SaaS uygulamaları (Microsoft 365, Google Workspace, Slack, GitHub, Jira), bulut sağlayıcıları (AWS CloudTrail, Azure Activity Log, GCP Audit Logs) ve fiziksel güvenlik sistemleri (kapı geçiş, CCTV olay logları). Kurum çalışanları, taşeronlar, danışmanlar ve üçüncü taraf hizmet sağlayıcılar bu politikaya uymakla yükümlüdür.

### 3. Tanımlar

- **Log:** Bir sistem veya uygulama tarafından belirli bir olayın gerçekleştiğini kanıtlayan, zaman damgalı, yapılandırılmış veya yapılandırılmamış veri kaydıdır.
- **SIEM (Security Information and Event Management):** Log toplama, normalizasyon, korelasyon, anomali tespiti ve alarm üretme yeteneklerini birleştiren merkezi güvenlik izleme platformudur (Splunk, Elastic SIEM, Microsoft Sentinel, IBM QRadar).
- **CEF (Common Event Format):** Çoklu güvenlik cihazlarından gelen olayların standart biçimde ifade edilmesi için kullanılan syslog tabanlı şemadır.
- **JSON Log Formatı:** Yapılandırılmış loglama için anahtar-değer çiftleri içeren, makinece okunabilir log formatıdır.
- **WORM Storage:** Verinin yalnızca bir kez yazılabilir ve sonradan değiştirilemez olduğu depolama türüdür (S3 Object Lock, Azure Immutable Blob).
- **UEBA (User and Entity Behavior Analytics):** Kullanıcı ve varlık davranışlarını makine öğrenmesi ile analiz ederek anormallikleri tespit eden teknolojidir.
- **Audit Trail:** Bir işlemin başlangıcından sonuna kadar izlenebilirliğini sağlayan, değiştirilemez kronolojik kayıtlar bütünüdür.
- **Hot / Cold / Archive Storage:** Hot (sık erişimli, hızlı sorgu), Cold (seyrek erişim, maliyet optimize), Archive (uzun süreli saklama, nadiren erişim) katmanlarıdır.
- **NTP (Network Time Protocol):** Ağ üzerindeki tüm sistemlerin aynı zaman kaynağına senkronize edilmesini sağlayan protokoldür.
- **MTTD / MTTR:** Sırasıyla Mean Time To Detect (Ortalama Tespit Süresi) ve Mean Time To Respond (Ortalama Müdahale Süresi) metrikleridir.

### 4. Roller & Sorumluluklar

- **CISO (Chief Information Security Officer):** Loglama ve izleme programının stratejik sahibidir; bütçe, kadro ve araç seçiminden sorumludur.
- **SOC (Security Operations Center) Ekibi:** 7/24 SIEM konsolunu izler, alarmları triaj eder, olay müdahalesini yürütür ve threat hunting gerçekleştirir.
- **Log Yöneticisi (Log Manager):** Log kaynaklarının envanterini tutar, topolojiyi yönetir, retention kurallarını uygular ve WORM politikalarını denetler.
- **Sistem & Uygulama Sahipleri:** Kendi sistemlerinde log üretimini etkinleştirmek, log formatını standarda uygun hale getirmek ve log bütünlüğünden sorumludur.
- **DevOps/Platform Ekibi:** Merkezi log toplama altyapısını (Logstash, Fluent Bit, OpenTelemetry Collector) işletir ve Kubernetes/manifest log toplayıcılarını yönetir.
- **Veri Koruma Sorumlusu (DPO):** Loglardaki kişisel verilerin GDPR/KVKK uyumluluğunu, maskeleme ve anonimleştirme gereksinimlerini denetler.
- **İç Denetim:** Log değiştirilemezliği, retention süreleri ve erişim kontrollerinin periyodik denetimini gerçekleştirir.
- **Olay Müdahale Ekibi (CSIRT):** Olay anında logları toplar, korelasyon kurar ve adli kanıt zincirini (chain of custody) korur.

### 5. Politika Maddeleri

1. Tüm üretim sistemleri ve kritik uygulamalar yapılandırılmış (JSON) log formatında, en az "info" seviyesinde log üretmek zorundadır. Yapılandırılmamış (düz metin) loglar kabul edilmez.
2. Log kayıtlarında en az şu alanlar bulunmalıdır: timestamp (ISO 8601, UTC, milisaniye hassasiyetinde), source IP, destination IP, user ID, event type, outcome (success/failure), resource ID, request ID/trace ID ve correlation ID.
3. Her log kaydı merkezi SIEM platformuna en fazla 5 dakika gecikme ile iletilmelidir. Gecikme süresi aşıldığında sistem otomatik olarak uyarı üretmelidir.
4. Tüm sistemler NTP üzerinden aynı zaman kaynağına (örn. stratum-1 NTP sunucusu, GPS kaynaklı) senkronize edilmelidir. Maksimum tolerans ±50 milisaniyedir.
5. Log retention süreleri aşağıdaki gibi uygulanır: Hot storage 90 gün (canlı sorgulanabilir), Cold storage 1 yıl (compressed, endekslenmiş), Archive storage 7 yıl (WORM, şifreli, offline erişim).
6. Kritik denetim logları (kimlik doğrulama, yetki değişikliği, finansal işlemler, PII erişimi) WORM depolamada tutulmalı ve hiçbir koşulda değiştirilememelidir. S3 Object Lock "Compliance Mode" veya eşdeğeri kullanılmalıdır.
7. SIEM platformunda kullanıcı bazında RBAC uygulanmalıdır; log okuma, sorgulama ve export işlemleri ayrıcalıklı rollere atanmalıdır.
8. Korelasyon kuralları, MITRE ATT&CK tekniğiyle eşleştirilmiş şekilde yazılmalı ve her kural için sigma rule eşdeğeri oluşturulmalıdır.
9. UEBA modülü etkinleştirilmeli ve baseline sapmaları (impossible travel, mass download, off-hours erişim) otomatik olarak yüksek öncelikli alarm üretmelidir.
10. Alarm taksonomisi üç seviyelidir: "Info" (kayıt amaçlı, otomatik kapatılabilir), "Warning" (araştırma gerekir, 4 saat içinde triaj), "Critical" (anlık müdahale, 15 dakika içinde yanıt). Her seviye için PagerDuty/On-call rotasyonu tanımlanmalıdır.
11. Hassas veriler (şifreler, tokenlar, kredi kartı numaraları, tam T.C. kimlik numaraları) log kayıtlarına yazılmamalıdır; yanlışlıkla yazıldığında otomatik maskeleme veya redaction uygulanmalıdır.
12. Log erişimleri kendi başına loglanmalıdır (meta-log); "kim hangi logu ne zaman sorguladı" kaydı 1 yıl boyunca saklanmalıdır.
13. Dış paydaşlara (denetçi, hukuk, regulator) log paylaşımı yalnızca CISO ve Hukuk departmanının ortak onayıyla yapılabilir; paylaşım öncesi PII maskeleme uygulanmalıdır.
14. Tüm güvenlik cihazlarından (firewall, IDS/IPS, WAF, EDR) en az "warning" seviyesinde olaylar SIEM'e iletilmelidir. Cihaz log kaynak eksikliği SLA ihlali sayılır.
15. Bulut sağlayıcı audit logları (AWS CloudTrail, Azure Activity, GCP Audit Logs) sürekli toplanmalı ve tüm yazma işlemleri (write/delete) izlenmelidir.
16. Log toplama altyapısının kendisi yüksek erişilebilir olmalıdır (multi-AZ dağıtım, RPO≤5dk, RTO≤1saat). SIEM arızası 30 dakikadan uzun sürerse CISO'ya otomatik bildirim yapılmalıdır.
17. Yılda en az bir kez log envanteri gözden geçirilmeli, kullanılmayan kaynaklar kaldırılmalı, yeni sistemler için log standartları tanımlanmalıdır.
18. Adli analiz gerektiren olaylarda loglar ayrı bir forensics kopya olarak sha256 hash değeriyle birlikte imzalanarak saklanmalıdır.

### 6. Prosedürler & İş Akışları

**Log Kaynağı Onboarding Prosedürü:** Yeni bir sistem prodüksiyona alınmadan önce sistem sahibi, "Log Source Registration Form" doldurarak SIEM ekibine iletir. Formda log türü (syslog/Filebeat/API), format (JSON/CEF/raw), beklenen hacim (EPS — events per second), retention ihtiyacı ve kritiklik seviyesi belirtilir. SIEM ekibi 5 iş günü içinde log toplamayı test eder, normalize eder ve ilk korelasyon kurallarını yazar. Onboarding'in tamamlanması, sistem prodüksiyona geçişinin (go-live) ön koşuludur.

**Alarm Triyaj İş Akışı:** SIEM alarm ürettiğinde, otomasyon (SOAR) ilk yanıtı tetikler: ilgili kullanıcı ve IP için zenginleştirme (enrichment) yapar, geçmiş olayları çeker ve watchlist kontrolü yapar. L1 analisti 15 dakika (critical) veya 4 saat (warning) içinde triaj gerçekleştirir. False positive ise kural iyileştirme talebi (tuning request) açılır. True positive ise CSIRT süreç başlatır ve ilgili sistem sahibine haber verilir.

**Log Arşivleme ve İmha:** Hot storage 90 günün sonunda otomatik olarak cold storage'a taşınır. Cold storage 1 yıl sonunda archive'e sıkıştırılarak (zstd) aktarılır. 7 yılın sonunda archive WORM immutability süresi dolar ve veriler güvenli şekilde silinir (cryptographic erase). İmha işlemi "Certificate of Destruction" ile belgelenir.

**Adli Kanıt Toplama:** Olay anında SOC ekibi, etkilenen sistemlerin loglarını salt-okunur snapshot olarak alır, sha256 hash hesaplar, hash değerini kurumun hardware HSM'i ile imzalar ve chain of custody formunu doldurur. Kanıt boyunca loglara yalnızca "forensics-analyst" rolü erişebilir.

### 7. Uyumluluk & İzleme

KPI'lar: SIEM log coverage oranı (hedef ≥%95), log gecikme süresi (hedef P95 ≤5dk), alarm false positive oranı (hedef <%15), MTTD (hedef ≤30dk), MTTR (hedef ≤4 saat), log bütünlüğü denetim hatası (hedef 0), retention compliance (hedef %100). Bu metrikler aylık SOC raporunda ve kurumsal dashboard'da gösterilir. Üçüncü taraf denetimlerde (SOC 2 Type II, ISO 27001) log yönetimi süreci örneklem denetime tabidir. PCI-DSS Req. 10 gereği kart verisi envanterine erişen tüm sistemlerin logları en az 1 yıl online, 1 yıl da offline saklanır. GDPR md. 30 (kayıt tutma yükümlülüğü) ve md. 32 (güvenlik) gereği işleme faaliyetleri izlenebilir olmalıdır. Yıllık log management denetimi iç denetim birimi tarafından yürütülür ve bulgular risk komitesine sunulur.

### 8. İhlal Yaptırımları

Politika ihlalleri; ihlalin kastı, tekrar sıklığı ve etkisine göre üç seviyede ele alınır. Hafif ihlaller (örn. log format uyumsuzluğu, gecikmiş onboarding) yazılı uyarı ve 15 günlük düzeltme süresiyle sonuçlanır. Orta ihlaller (örn. log maskeleme eksikliği, retention süresi ihlali) disiplin kuruluna sevk edilir, sorumlunun performans değerlendirmesine yansır. Ağır ihlaller (örn. log tahrifatı, WORM depolamayı atlatma, kasıtlı log silme) derhal işten çıkarma, hukuki süreç ve gereğinde suç duyurusu ile sonuçlanır. Üçüncü taraf sağlayıcıların ihlalleri sözleşmeye aykırılık sayılır ve SLA ceza uygulanır.

### 9. İstisnalar

Aşağıdaki durumlar istisna kapsamındadır ancak CISO onayı ve risk değerlendirmesiyle geçerlidir: (a) Devre dışı bırakılmış (decommissioned) sistemlerin geçmiş loglarının yalnızca arşiv katmanında tutulması, (b) Kişisel cihazlarda (BYOD) kurumsal veri işlenmediği sürece log toplama yapılmaması, (c) Sözleşmesel olarak log paylaşımına izin vermeyen SaaS uygulamalarında yalnızca SaaS sağlayıcının kendi loglarının kullanılması, (d) Yıllık bakım pencerelerinde planlı log toplama kesintileri (72 saati aşmamak kaydıyla). Tüm istisnalar yıllık olarak gözden geçirilir.

### 10. İlgili Standartlar

NIST SP 800-92 "Guide to Computer Security Log Management"; NIST SP 800-53 Rev. 5 AU ailesi (AU-2, AU-3, AU-6, AU-12); ISO/IEC 27001:2022 Annex A.8.15 (Logging), A.8.16 (Monitoring activities), A.8.17 (Clock synchronization); PCI-DSS v4.0 Req. 10; GDPR md. 30/32; SOC 2 CC7.2 (Monitoring); MITRE ATT&CK; OWASP Logging Cheat Sheet; CIS Controls v8 Control 8 (Audit Log Management); ISO/IEC 27037 (Digital Evidence).

### 11. Onay & Revizyon Geçmişi

| Versiyon | Tarih | Hazırlayan | Onaylayan | Değişiklik |
|----------|-------|------------|-----------|------------|
| 1.0 | 2026-06-21 | Politika Subagent (2-D) | CISO | İlk yayın |
| 0.9 | 2026-06-15 | SOC Lead | CISO | Taslak gözden geçirme |

Bu politika yıllık olarak veya büyük teknoloji/tehdit peyzajı değişikliklerinde revize edilir. Onay, CISO ve İç Denetim Başkanının ortak imzasıyla yürürlüğe girer.

---

## Politika No: 17 — Değişiklik Yönetimi (Change Management) Politikası

### 1. Amaç

Bu politika, kurumun üretim ortamındaki tüm BT altyapısı, uygulama, konfigürasyon ve güvenlik bileşenlerinde gerçekleştirilen değişikliklerin kontrollü, izlenebilir, denetlenebilir ve düşük riskli bir şekilde uygulanmasını sağlar. ITIL 4 "Change Enablement" pratiği temel alınarak, değişiklik türlerinin (standard, normal, emergency) netleştirilmesi, Change Advisory Board (CAB) yapısının kurulması, Request for Change (RFC) sürecinin standartlaştırılması, etki ve risk değerlendirmesi yöntemlerinin belirlenmesi ve rollback planı zorunluluğunun uygulanması hedeflenir. Politika; değişiklik nedenli kesintileri (change-induced incidents) azaltmayı, change failure rate (CFR) metriklerini düşürmeyi, deployment lead time'ı optimize etmeyi ve CI/CD pipeline'larıyla entegrasyonu kurumsal yönetişim altına almayı amaçlar. Nihai hedef; değişikliklerin güvenli ve sürdürülebilir bir tempoda prodüksiyona ulaşmasını sağlamaktır.

### 2. Kapsam

Politika; kurumun tüm üretim ve üretim öncesi (staging, UAT) ortamlarında yapılan her türlü değişikliği kapsar. Kapsama dâhildir: uygulama kod dağıtımları (deployment), altyapı kodu (IaC) değişiklikleri (Terraform, Pulumi), Kubernetes manifest güncellemeleri, veritabanı şema migrasyonları, konfigürasyon değişiklikleri (feature flag, environment variable, secrets rotation), güvenlik duvarı/WAF kural değişiklikleri, IAM politika/rol güncellemeleri, patch management (işletim sistemi, kütüphane), DNS değişiklikleri, sertifikasyon yenilemeleri, üçüncü taraf SaaS konfigürasyonları, bulut kaynak sağlama/silme, ve küçük görünse de üretimi etkileyebilecek her türlü operational değişiklik. Kapsam dışı: bireysel geliştiricinin yerel makinesindeki değişiklikler ve henüz merge edilmemiş branch'ler.

### 3. Tanımlar

- **Change (Değişiklik):** Üretim ortamına veya üretim davranışına etki edebilecek herhangi bir ekleme, modifikasyon veya kaldırma işlemidir.
- **Standard Change (Standart Değişiklik):** Önceden onaylanmış, düşük risk, tekrarlanan, prosedürü tanımlanmış ve CAB onayı gerektirmeyen değişiklik türüdür (örn. rutin patch, otomatik scaling).
- **Normal Change (Normal Değişiklik):** Etki ve risk değerlendirmesi gerektiren, CAB onayına tabi olan değişiklik türüdür.
- **Emergency Change (Acil Değişiklik):** Üretim kesintisini gidermek veya kritik güvenlik açığını kapatmak için hızlı süreçten geçen, ECAB (Emergency CAB) tarafından onaylanan değişiklik türüdür.
- **RFC (Request for Change):** Değişiklik talebinin resmi olarak kaydedildiği, ITSM platformundaki (ServiceNow, Jira Service Management) kayıttır.
- **CAB (Change Advisory Board):** Normal değişiklikleri değerlendiren, çok disiplinli (BT, güvenlik, iş birimleri, DR temsilcisi) onay kuruludur.
- **Rollback Plan:** Değişiklik başarısız olduğunda sistemi önceki çalışır haline döndürmek için önceden hazırlanmış adımlar bütünüdür.
- **Change Freeze:** Belirli dönemlerde (yıl sonu, kritik satış dönemi, black friday) değişiklik yapılmasını kısıtlayan dondurma dönemidir.
- **Deployment Window:** Değişikliklerin uygulandığı, iş etkisi minimum olan önceden tanımlı zaman penceresidir.
- **PIR (Post-Implementation Review):** Değişiklik sonrası yapılan, başarı/fail değerlendirmesi ve ders çıkarımı toplantısıdır.
- **CFR (Change Failure Rate):** Üretimde hataya neden olan değişiklik oranıdır (DORA metriklerinden biri).
- **Lead Time for Changes:** Kod commit'inden prodüksiyona kadar geçen süredir.

### 4. Roller & Sorumluluklar

- **Change Manager:** RFC'leri triaj eder, CAB toplantılarını düzenler, change calendar'ı yönetir, change freeze dönemlerini ilan eder.
- **Change Requester (İstek Sahibi):** RFC'yi yazar, etki/risk analizini yapar, rollback planı hazırlar, test sonuçlarını ekler.
- **CAB Üyeleri:** Teknik değerlendirme yapar, riski onaylar/reddeder; üyeler arasında mimar, SRE, güvenlik mühendisi, DBA, iş birimi temsilcisi bulunur.
- **ECAB (Emergency CAB):** Acil değişiklikleri değerlendiren küçük ve hızlı karar veren kurul; en az Change Manager + CISO vekili + SRE on-call.
- **Release Engineer:** Dağıtımı CI/CD pipeline üzerinden uygular, canary/blue-green deployment yönetir.
- **SRE On-call:** Dağıtım sırasında metrikleri izler, anomali tespit ederse rollback tetikler.
- **Sistem/Uygulama Sahibi:** Değişikliğin kendi alanına etkisini değerlendirir, PIR'e katılır.
- **İç Denetim:** Değişiklik süreçlerinin yürütüldüğünü örnekleme yöntemiyle denetler.

### 5. Politika Maddeleri

1. Üretim ortamındaki tüm değişiklikler bir RFC ile başlatılmalıdır; RFC olmadan doğrudan prodüksiyona müdahale yasaktır ("no ticket, no touch" prensibi).
2. Değişiklikler üç türde sınıflandırılır: Standard (önceden onaylı şablon, otomatik), Normal (CAB onayı gerekli), Emergency (ECAB onayı, hızlı süreç). Her RFC tür belirtilmeden onaylanamaz.
3. Standard change'ler için bir "Standard Change Template" tanımlanmalıdır; şablon risk seviyesi, etki alanı, otomasyon referansı ve rollback otomasyonunu içermelidir.
4. Normal change'ler için en az 5 iş günü önceden RFC açılmalıdır. CAB haftalık toplanır ve backlog'u masaya yatırar.
5. Her Normal change RFC'si şu unsurları içermelidir: değişiklik açıklaması, etki alanı (kullanıcı sayısı, sistem sayısı), risk skoru (low/medium/high), test sonuçları, rollback planı, communication planı, deployment window.
6. Rollback planı zorunludur. Rollback otomatik olabiliyorsa (blue/green switch, feature flag toggle) tercih edilir; manuel rollback adımları yazılı belgelenmelidir.
7. Acil değişiklikler, ECAB onayı sonrası uygulanır; ancak 5 iş günü içinde retrospektif RFC açılmalı ve neden acil olduğu belgelenmelendir.
8. Change freeze dönemleri (örn. yıl sonu 15 Aralık–5 Ocak, kritik kampanya dönemleri) ilan edilir; freeze sırasında yalnızca P1 incident çözümü veya kritik güvenlik yaması uygulanır.
9. Deployment window dışı (örn. mesai saatleri, cuma akşamı sonrası) dağıtım yapmak ek onay gerektirir; cuma akşamı 17:00 sonrası dağıtım varsayılan olarak yasaktır.
10. CI/CD pipeline'ı her dağıtımı otomatik olarak ITSM platformuna RFC olarak kaydetmelidir; manuel RFC açılması yalnızız Normal change'ler için geçerlidir.
11. Her dağıtımda otomatik sağlık kontrolü (health check, smoke test, canary metrik kontrolü) yapılmalıdır; metrikler eşik aşarsa otomatik rollback tetiklenmelidir.
12. Veritabanı şema değişiklikleri özel prosedüre tabidir; "expand-then-contract" pattern uygulanmalı, backward-compatible migrasyon zorunludur.
13. Tüm değişiklik kayıtları 7 yıl boyunca saklanmalı; kim/ne zaman/ne değiştirdi izlenebilir olmalıdır.
14. Change success metrikleri aylık takip edilmelidir: CFR (hedef <%15), Lead Time (hedef <24 saat normal change için), CAB onay süresi (hedef <5 iş günü), deployment frequency (günlük hedef).
15. Her başarısız veya kısmi başarılı değişiklik için PIR toplantısı 5 iş günü içinde yapılmalıdır; root cause analysis (RCA) ve düzeltici aksiyon (CAPA) belgelenmelidir.
16. Değişiklik prosedürüne uymadan prodüksiyona müdahale eden kişiler disiplin sürecine tabidir; tekrarlayan ihlaller performans değerlendirmesine yansır.
17. Üçüncü taraf sağlayıcıların (SaaS, MSP) kurumsal ortama etki eden değişiklikleri change calendar'a önceden bildirilmelidir; bildirim olmaksızın yapılan değişiklikler SLA ihlali sayılır.
18. Change enablement otomasyonu (GitHub Actions, GitLab CI, Argo CD) ITSM API'leriyle entegre olmalı; otomatik RFC oluşturma ve durum güncelleme akışı kurulmalıdır.

### 6. Prosedürler & İş Akışları

**Normal Change Süreci:** İstek sahibi RFC'yi açar (T-5 gün). Change Manager 24 saat içinde triaj eder, kategoriyi ve CAB gündemine alır. Sistem sahibi ve güvenlik ekibi teknik değerlendirme yapar (T-3 gün). CAB toplantısında RFC masaya yatırılır; onay/red/revize kararı verilir. Onaylanan RFC deployment window'da uygulanır. Dağıtım öncesi "Change Go/No-Go" toplantısı yapılır; SRE on-call ve Change Manager son onayı verir. Dağıtım sonrası 1 saatlik stabilization periyodu takip edilir. Başarı durumunda RFC "Closed — Successful" olarak kapatılır; fail durumunda rollback uygulanır ve PIR planlanır.

**Emergency Change Süreci:** P1/P2 incident anında on-call SRE, ECAB'i (Change Manager + CISO vekili + SRE lead) konferans çağrısıyla toplar. Etki değerlendirmesi yapılır, en az riskli çözüm seçilir. ECAB karar toplantısı 30 dakikayı geçmemelidir. Dağıtım sonrası 48 saat içinde retrospektif RFC açılır; süreç kalitesi değerlendirilir ve gerekirse süreç iyileştirme önerisi oluşturulur.

**Standard Change Otomasyonu:** Standard change'ler pre-approved automation olarak CI/CD pipeline'ında tanımlanır. Tetikleyici (schedule, commit, manual) belirlenir. Dağıtım otomatik loglanır, RFC "auto-created" statüsünde açılır. Başarı/başarısızlık durumu otomatik RFC'ye yansır.

**PIR Süreci:** Toplantıya change requester, change manager, SRE, sistem sahibi ve etkilenen iş birimi katılır. Toplantıda: ne oldu, neden oldu, ne öğrenildi, ne yapılacak soruları yanıtlanır. CAPA listesi oluşturulur, aksiyon sahibi ve takip tarihi atanır. PIR belgesi RFC'ye eklenir.

### 7. Uyumluluk & İzleme

KPI'lar: Change Failure Rate (hedef <%15, DORA "elite" eşiği <%15), Lead Time for Changes (hedef <24 saat normal, <1 saat standard), Deployment Frequency (günlük hedef), CAB onay süre ortalaması (hedef <5 iş günü), Emergency change oranı (hedef <%5 toplam change), Change-induced incident oranı (hedef <%10), PIR completion rate (hedef %100). Bu metrikler aylık Change Management raporunda sunulur. ISO/IEC 20000-1 (IT Service Management) ve ISO/IEC 27001 Annex A.8.32 (Change management) gereksinimleri karşılanır. SOC 2 CC8.1 (Change Management) kontrolü örnekleme yöntemiyle denetlenir. ITIL 4 "Change Enablement" pratiği成熟度 (maturity) yıllık ölçülür; hedef maturity seviyesi 3.5/5'tir.

### 8. İhlal Yaptırımları

Değişiklik yönetimi ihlalleri kademeli ele alınır. Hafif ihlaller (örn. geç RFC açma, eksik PIR) yazılı uyarı ve 10 günlük düzeltme ile sonuçlanır. Orta ihlaller (RFC olmadan dağıtım, change freeze ihlali) disiplin kuruluna sevk edilir, sorumlunun deployment yetkisi geçici olarak askıya alınır. Ağır ihlaller (kasıtlı bypass, üretim verisi kaybına neden olan yetkisiz değişiklik, denetim izini gizleme) işten çıkarma ve hukuki süreçle sonuçlanır. Üçüncü taraf sağlayıcıların izinsiz değişiklikleri SLA ceza uygulanır, tekrarında sözleşme feshi gündeme gelir.

### 9. İstisnalar

İstisnalar yalnızca CISO + CIO ortak onayıyla geçerlidir: (a) Sıfır-downtime gerektiren ve tamamen otomatik rollback garantisi olan gradual rollout'lar (advanced deployment pattern), (b) Yeni ürün launch'larında ilk 30 gün "ramp-up" periyodu (kontrollü esneklik), (c) Felaket kurtarma (DR) tatbikatları sırasında DR ortamındaki değişiklikler (prod dışı olduğu için RFC şablonu yeterli). Tüm istisnalar aylık CAB raporunda şeffaf şekilde paylaşılır.

### 10. İlgili Standartlar

ITIL 4 Foundation "Change Enablement" practice; ISO/IEC 20000-1 Clause 8.5 (Change Management); ISO/IEC 27001:2022 Annex A.8.32 (Change management); NIST SP 800-128 (Configuration Management); SOC 2 CC8.1 (The entity authorizes, designs, develops, configures, tests…changes); COBIT 2019 DSS06 (Manage changes); CMMI SVC CM SG 2; PCI-DSS v4.0 Req. 6.5 (Change management procedures); DORA Four Keys (Lead Time, Deploy Frequency, CFR, MTTR).

### 11. Onay & Revizyon Geçmişi

| Versiyon | Tarih | Hazırlayan | Onaylayan | Değişiklik |
|----------|-------|------------|-----------|------------|
| 1.0 | 2026-06-21 | Politika Subagent (2-D) | CIO + CISO | İlk yayın |
| 0.9 | 2026-06-10 | Change Manager | CIO | Taslak |

Politika yılda en az bir kez ve ITSM aracı değişikliğinde revize edilir. Yürürlük CIO ve CISO ortak imzasıyla başlar.

---

## Politika No: 18 — İnsan Kaynakları Güvenliği Politikası

### 1. Amaç

Bu politika; kurumun en kritik varlıklarından biri olan insan kaynaklarının güvenliğini, işe alım öncesinden ayrılış sonrasına kadar tüm istihdam yaşam döngüsü boyunca ele alır. Amaç; çalışanların güvenlik farkındalığı yüksek, tehditlere karşı dirençli, insider tehditlere karşı korunmuş ve mevzuata (GDPR, KVKK, İş Kanunu) uyumlu bir şekilde yönetilmesini sağlamaktır. Politika; pre-employment screening, NDA & gizlilik sözleşmeleri, rol bazlı güvenlik eğitimi, yıllık güvenlik farkındalık eğitimi, kabul edilebilir kullanım politikası (AUP), temiz masa & boş ekran (clean desk & clear screen), ayrılış süreçleri (leaver process) ve insider threat programını bir bütün olarak ele alır. ISO/IEC 27001 Annex A.6 (People controls) ve A.7 (Human resource security) gereksinimlerini karşılar.

### 2. Kapsam

Politika; kurumun tüm çalışanlarını (tam zamanlı, yarı zamanlı, sözleşmeli), stajyerleri, danışmanları, taşeronları, geçici personelini ve bordrolu olmayan ancak kurumsal sistemlere erişimi olan tüm kişileri kapsar. İstihdam yaşam döngüsünün üç fazını ele alır: (1) İş öncesi (pre-employment) — başvuru, mülakat, background check, offer; (2) İstihdam sırasında (during employment) — onboarding, eğitim, performans, davranış; (3) İş sonu (post-employment) — istifa, çıkarma, emeklilik, contract termination. Ayrıca içeri ve dışarı taşınan personel (intra-company transfer) ve uzun süreli izinli personel (sabbatical, uzun hastalık) için de geçerlidir.

### 3. Tanımlar

- **Pre-employment Screening:** İşe alım öncesinde adayın kimlik, eğitim, deneyim, sabıka ve referans bilgilerinin doğrulanması sürecidir.
- **NDA (Non-Disclosure Agreement):** Çalışanın kurumsal gizli bilgilere erişimini ve bu bilgilerin gizliliğini koruma yükümlülüğünü düzenleyen sözleşmedir.
- **Security Awareness Training:** Tüm çalışanlara verilen, genel güvenlik tehditleri ve savunma davranışları konulu eğitimdir.
- **Role-Based Security Training:** Görev bazlı özel güvenlik eğitimidir (developer secure coding, sysadmin hardening, executive phishing, finance fraud).
- **AUP (Acceptable Use Policy):** Çalışanların kurumsal cihaz, ağ, e-posta ve uygulamalarını kabul edilebilir kullanım kurallarını tanımlayan belgedir.
- **Clean Desk Policy:** Masaüstünde gizli belge bırakmama, kilitli çekmece kullanma zorunluluğu politikasıdır.
- **Clear Screen Policy:** Bilgisayar ekranını kullanmadığında kilitleme (Win+L, Ctrl+Cmd+Q) zorunluluğudur.
- **Leaver Process:** Çalışanın işten ayrılması durumunda erişim iptali, ekipman iadesi, bilgi aktarımı gibi adımları içeren süreçtir.
- **Insider Threat Program:** İçeriden gelen tehditleri (kötü niyetli veya ihmalkar) tespit ve önleme programıdır.
- **Background Check:** Sabıka kaydı, kredi skoru (finansal roller için), eğitim doğrulama, referans kontrolü içeren arka plan araştırmasıdır.
- **Joiner-Mover-Leaver (JML):** IAM lifecycle'ın üç temel fazını ifade eden kısaltmadır.

### 4. Roller & Sorumluluklar

- **İK Departmanı (HR):** Screening, onboarding, eğitim takibi, leaver process yürütme, performans/behavior kayıtları tutma.
- **CISO / Güvenlik Ekibi:** Güvenlik eğitimi içerik sağlama, insider threat program yönetimi, erişim iptali onayı.
- **IT / IAM Ekibi:** Joiner-Mover-Leaver workflow otomasyonu, erişim izinleri provisioning/deprovisioning.
- **Doğrudan Yönetici (Line Manager):** Ekibinin AUP'ye uymasını sağlama, güvenlik eğitimlerini tamamlattırma, davranışsal değişiklikleri raporlama.
- **Hukuk Departmanı:** NDA ve gizlilik sözleşmeleri hazırlama, ihlal durumunda hukuki süreç yürütme.
- **DPO (Veri Koruma Sorumlusu):** Screening süreçlerinde kişisel verilerin korunması, KVKK/GDPR uyumluluğu.
- **Insider Threat Working Group:** Çok disiplinli (HR + Güvenlik + Hukuk + IT) kurul; aylık risk değerlendirmesi yapar.
- **Çalışan:** Politika maddelerine uyma, eğitimleri tamamlama, gördüğü riskleri raporlama.

### 5. Politika Maddeleri

1. Tüm adaylar işe başlamadan önce pre-employment screening tamamlanmalıdır; minimum kapsamda kimlik doğrulama, eğitim derecesi doğrulama ve 2 profesyonel referans kontrolü yapılmalıdır.
2. Finans, güvenlik, üst düzey yöneticilik ve kritik altyapı rolleri için ekstra screening uygulanır: sabıka kaydı, kredi skoru, medya/itibar kontrolü, 5 yıllık iş deneyimi doğrulama. Bu roller için screening 5 yılda bir yenilenir.
3. Tüm çalışanlar işe başlamadan önce NDA ve gizlilik sözleşmesi imzalamalıdır; sözleşmeler dijital imzalı (e-imza) olarak saklanır ve 7 yıl boyunca muhafaza edilir.
4. Onboarding sırasında ilk 5 iş günü içinde zorunlu "Security Awareness 101" eğitimi tamamlanmalıdır; tamamlamayanın sistem erişimi askıya alınır.
5. Yıllık güvenlik farkındalık eğitimi tüm çalışanlar için zorunludur; eğitim 90 dakika sürer ve sonunda test (>%80 geçme şartı) yapılır.
6. Rol bazlı güvenlik eğitimi yıllık verilir: developer'lar OWASP Top 10 + secure coding, sistem yöneticileri hardening + IAM, yöneticiler (executive) whaling phishing + social engineering, finans ekibi fraud + BEC.
7. AUP (Acceptable Use Policy) tüm çalışanlar tarafından imzalanmalıdır; kurumsal cihazların kişisel kullanımı, sosyal medya, e-posta, internet kullanım kuralları AUP'de tanımlanır.
8. Clean desk policy uygulanır: gizli belgeler kullanım sırasında bile mümkün olduğunca gizli tutulmalı, masaüstünde unutmamalı, mesai sonunda kilitli dolaba konmalıdır.
9. Clear screen policy uygulanır: çalışan masadan kalktığında ekranı kilitlemek zorundadır; otomatik ekran kilidi 5 dakika olarak ayarlanır. Kilitlemeyenler uyarı alır.
10. Leaver process 24 saat içinde tamamlanmalıdır: tüm sistem erişimleri iptal edilir (SSO, VPN, bulut, SaaS), kurumsal ekipmanlar (laptop, telefon, badge, token) iadesi alınır, bilgi aktarımı (knowledge transfer) belgelenir.
11. Düşmanca ayrılma (hostile termination) durumunda erişimler ayrılık anında önceden iptal edilir (pre-emptive revocation); IT ve güvenlik ekibi önceden hazırlık yapar.
12. Insider threat programı kapsamında SIEM'de UEBA modülü çalışır; aşırı veri indirme, off-hours erişim, mass file copy, privileged command anomalileri tespit edilir.
13. Çalışanların güvenlik olaylarını raporlaması için anonim hotline ve e-posta kanalı (security@) mevcuttur; iyi niyetli raporlama asla cezalandırılmaz.
14. Background check sonuçlarında yalan beyan tespit edilirse işe alım iptal edilir; mevcut çalışan için ise disiplin süreci başlatılır.
15. Personel transferi (role change) 5 iş günü içinde IAM güncellenmesini gerektirir; eski rolün erişimleri kaldırılır, yeni rolün erişimleri verilir (least privilege).
16. Uzun süreli izin (sabbatical, 30+ gün hastalık) durumunda erişimler askıya alınır, dönüşte yeniden değerlendirme yapılır.
17. Çalışanların şirket cihazlarında yalnızca onaylı yazılımlar çalıştırılabilir; shadow IT (onaysız SaaS, kişisel bulut sync) yasaktır.
18. Üçüncü taraf personel (taşeron, danışman) aynı güvenlik kurallarına tabidir; sözleşmede security clause ve audit hakkı bulunmalıdır.

### 6. Prosedürler & İş Akışları

**Joiner Süreci:** HR teklif sonrası background check başlatır (3-5 iş günü). Sonuçlar temizse, IT'ye provisioning talebi açılır. İlk günde çalışan: (1) NDA + AUP imzalar, (2) güvenlik oryantasyon eğitimi alır, (3) hardware teslim alır (laptop, MFA token), (4) SSO ve email hesabı açılır, (5) role-based access provisioning tamamlanır. 5. günde "Security Awareness 101" eğitimi tamamlanır.

**Mover Süreci:** Rol değişikliği bildirimi HR'den IT'ye gelir. Eski rolün erişimleri 48 saat içinde kaldırılır. Yeni rol için erişim talebi yönetici onayıyla yapılır. Rol bazlı güvenlik eğitimi 30 gün içinde tamamlanır. Eğitim tamamlanmazsa yeni rolün ekstra erişimleri askıya alınır.

**Leaver Süreci:** Ayrılık bildirimi HR'ye gelir. Hostile değilse: son iş gününde 17:00'da erişimler iptal edilir. Hostile ise: bildirim anında erişim iptali. Ekipman iadesi için "Equipment Return Checklist" doldurulur. Knowledge transfer: çalışan 1-2 hafta önce belgeleme yapar, handover toplantısı düzenlenir. Email forward 30 gün için yöneticiye yönlendirilebilir. Son olarak exit interview yapılır, NDA hatırlatması imzalatılır.

**Insider Threat Detection Workflow:** UEBA anomali tespit eder → SOC L1 triaj eder → yüksek riskliyse Insider Threat Working Group'a iletilir → aylık toplantıda değerlendirilir → gerekiyorsa araştırma başlatılır (forensics, legal review) → disiplin/hukuki aksiyon kararlaştırılır.

### 7. Uyumluluk & İzleme

KPI'lar: Onboarding security training completion rate (hedef %100 ilk 5 gün), Yıllık güvenlik eğitimi tamamlama oranı (hedef ≥%95), Phishing simulation click rate (hedef <%5), Leaver access revocation SLA (hedef %100 24 saat içinde), Insider threat false positive oranı (hedef <%20), Background check tamamlama oranı (hedef %100 işe başlamadan önce), AUP imza oranı (hedef %100). Metrikler aylık HR-Güvenlik ortak raporunda sunulur. ISO/IEC 27001 Annex A.6.1 (Screening), A.6.2 (Terms and conditions of employment), A.6.3 (Information security awareness, education and training), A.6.4 (Disciplinary process), A.7.2 (During employment), A.7.3 (Termination or change of employment) gereksinimleri karşılanır. SOC 2 CC1.4 (Competence and Accountability), CC1.5 (Enforce Accountability) kontrol özellikleri. GDPR md. 5, 32, 39; KVKK md. 12, 17. NIST SP 800-16 (Information Security Training Requirements), NIST SP 800-50 (Building an Information Technology Security Awareness Program).

### 8. İhlal Yaptırımları

Güvenlik ihlalleri üç seviyede sınıflandırılır. Hafif ihlaller (örn. ekran kilitlememe, temiz masa ihlali, geç eğitim): yazılı uyarı, 30 günlük düzeltme süresi. Orta ihlaller (örn. AUP ihlali, onaysız yazılım kurma, NDA ihlali tehdidi): disiplin kuruluna sevk, performansa yansıma, geçici erişim kısıtlaması. Ağır ihlaller (örn. veri sızıntısı, insider kötüye kullanım, NDA kasıtlı ihlali, sabotaj): derhal işten çıkarma, hukuki süreç, suç duyurusu (TCK md. 243-244, 5651). Ceza unutulmamalı: iyi niyetli bildirim (whistleblowing) asla cezalandırılmaz.

### 9. İstisnalar

İstisnalar CHRO + CISO ortak onayıyla: (a) Acil teknik pozisyon doldurma durumunda screening 30 gün sonrasına ertelenebilir (conditional offer), (b) Eski çalışanın 90 gün içinde yeniden işe alınmasında screening yenilenmez, (c) Stajyerler için sınırlı screening yeterli sayılır, (d) Sözleşmeli kısa süreli danışmanlar için NDA + AUP yeterli, background check opsiyonel. Tüm istisnalar risk komitesinde aylık olarak gözden geçirilir.

### 10. İlgili Standartlar

ISO/IEC 27001:2022 Annex A.6 (People controls), A.7 (Human resource security — formerly A.7 in 2013); NIST SP 800-16, 800-50, 800-181 (NICE Framework); SOC 2 CC1.4-1.5; GDPR md. 5, 32, 39; KVKK md. 12, 17; 5651 Sayılı Kanun; TCK md. 243-244 (bilişim suçları); ISO/IEC 27018 (PII in public cloud); NIST Insider Threat Guide (CMU SEI CERT); US CERT Insider Threat; PREVENT (Insider Threat Program Standard).

### 11. Onay & Revizyon Geçmişi

| Versiyon | Tarih | Hazırlayan | Onaylayan | Değişiklik |
|----------|-------|------------|-----------|------------|
| 1.0 | 2026-06-21 | Politika Subagent (2-D) | CHRO + CISO | İlk yayın |
| 0.9 | 2026-06-08 | HR Director | CHRO | Taslak |

Yıllık gözden geçirme ve İş Kanunu/KVKK değişikliklerinde revizyon yapılır.

---

## Politika No: 19 — Fiziksel Güvenlik Politikası

### 1. Amaç

Bu politika; kurumun fiziksel varlıklarının (veri merkezi, ofis, sunucu odası, network kabinleri, donanım ekipmanları), personelinin ve ziyaretçilerinin fiziksel güvenliğini sağlamayı amaçlar. ISO/IEC 27001:2022 Annex A.11 (Physical and environmental security) referans alınarak; site güvenliği (perimeter, access control), badge sistemi, ziyaretçi yönetimi, veri merkezi güvenliği (mantrap, biyometrik, CCTV), çevresel kontroller (HVAC, yangın söndürme — inert gas, su sızıntısı tespiti), güç yedekliliği (UPS, jeneratör) ve güvenli imha (shredder, e-waste vendor) süreçlerini standartlaştırır. Bilgi güvenliğinin fiziksel katmanı, siber güvenlik kontrollerinin tamamlayıcısıdır; en güçlü şifreleme bile fiziksel erişim elde edilmiş bir saldırganın önünde işlevsiz kalabilir. Bu nedenle politika; fiziksel tehditleri (yetkisiz giriş, hırsızlık, sabotaj, çevresel afet, yangın, su baskını, güç kesintisi) önlemeyi, tespit etmeyi ve müdahale etmeyi hedefler.

### 2. Kapsam

Politika; kurumun sahip olduğu, kiraladığı veya kullandığı tüm fiziksel mekanları kapsar: kurum merkezi ofis, şube ofisleri, veri merkezleri (owned veya colocation), sunucu odaları, telekom odaları (IDF/MDF), network kabinleri, depolama alanları, arşiv odaları, üretim alanları (varsa) ve uzak çalışanların ev ofisleri (BYOD hariç, kurumsal cihazların fiziksel güvenliği için). Ayrıca kuruma ait tüm donanım (sunucu, network cihazı, storage, laptop, mobil cihaz, yazıcı, IoT cihazı), ziyaretçiler, taşeronlar, temizlik personeli ve teslimat personeli politika kapsamındadır. Bulut sağlayıcı veri merkezleri için sağlayıcının kendi fiziksel güvenlik sertifikaları (SOC 2 Type II, ISO 27001, PCI-DSS) kabul edilir ancak kurum denetim hakkını saklı tutar.

### 3. Tanımlar

- **Perimeter Security:** Bir tesisin dış sınır güvenliğidir; çit, kamera, hareket sensörü, security patrol içerir.
- **Access Control System:** Yetkili kişilerin geçişine izin veren, yetkisizleri engelleyen sistemdir (badge reader, biyometrik, PIN pad).
- **Badge:** Çalışan veya ziyaretçi kimlik doğrulama için taşıdığı kart/biletlemedir (RFID, smart card, QR code).
- **Mantrap:** İki kapılı, aynı anda yalnızca bir kişinin geçtiği, "anti-passback" mekanizması içeren geçiş bölmesidir.
- **Biometric Authentication:** Parmak izi, avuç içi, iris, yüz tanıma gibi biyolojik özelliklere dayalı kimlik doğrulamadır.
- **CCTV (Closed-Circuit Television):** Kapalı devre kamera izleme sistemidir; kurumda 90 gün kayıt saklanır.
- **HVAC (Heating, Ventilation, Air Conditioning):** Isıtma, havalandırma ve iklimlendirme sistemleridir; veri merkezi için sıcaklık 18-27°C, nem %40-60 aralığında tutulur.
- **Inert Gas Fire Suppression:** Yangını oksijen boğmasıyla söndüren, su hasarı vermeyen gaz söndürme sistemidir (FM-200, Novec 1230, Inergen, Argonite).
- **UPS (Uninterruptible Power Supply):** Kesintisiz güç kaynağı; short-term güç yedeklemesi sağlar.
- **Generator:** Uzun süreli güç kesintilerinde devreye giren diesel veya gaz jeneratörüdür.
- **WORM Storage for CCTV:** CCTV kayıtlarının değiştirilemez saklandığı depolamadır.
- **E-Waste Vendor:** Elektronik atık güvenli imha sertifikalı tedarikçidir (R2, e-Stewards sertifikalı).
- **Secure Disposal:** Donanımın veri kalıntısı kalmayacak şekilde yok edilmesidir (shredding, degaussing, cryptographic wipe).

### 4. Roller & Sorumluluklar

- **Facility Manager:** Tesisin fiziksel güvenlik sistemlerinin (kamera, badge, alarm) işletilmesi, vendor yönetimi.
- **Physical Security Officer:** Güvenlik görevlilerinin yönetimi, incident response, CCTV monitoring.
- **CISO / Information Security:** Politikayı sahiplenir, risk değerlendirmesi yapar, audit yapar.
- **IT Operations:** Veri merkezi HVAC, UPS, jeneratör, yangın söndürme sistemlerinin teknik işletilmesi.
- **Reception / Front Desk:** Ziyaretçi karşılama, badge dağıtım, escort koordinasyonu.
- **Health & Safety Officer:** Acil tahliye, yangın drill, ilk yardım süreçleri.
- **Çalışanlar:** Badge'lerini kullanma, escort sorumluluğu, hijyen kuralları, çevresel uyanlar.
- **Ziyaretçiler:** Sign-in yapma, escort kuralına uyma, kuralları izleme.
- **E-Waste Vendor:** Sertifikalı güvenli imha sürecini yürütme, "Certificate of Destruction" sağlama.

### 5. Politika Maddeleri

1. Tüm tesisler en az üç katmanlı fiziksel güvenlik ile korunmalıdır: outer perimeter (çit, kamera), building shell (kilitli kapı, badge reader), secure zone (mantrap, biyometrik).
2. Çalışanlara kurum kimlik badge'i verilir; badge fotoğraflı, RFID çipli ve renk kodludur (çalışan, taşeron, ziyaretçi). Badge başkasına devredilemez.
3. Badge erişim seviyeleri role-based tanımlanır; "least access" prensibi uygulanır. Veri merkezine yalnızca onaylı küçük liste erişir (whitelist).
4. Ziyaretçiler resepsiyonda sign-in yapar, fotoğraflı ziyaretçi badge'i alır ve bir çalışan tarafından escort edilir. Ziyaretçi badge'i aynı gün iade edilir; escort yapılmadan secure zone'a geçilemez.
5. Veri merkezi girişinde mantrap + çok faktörlü kimlik doğrulama (badge + biyometrik) zorunludur. Anti-passback aktiftir; tailgating (yakından izleme) engellenir.
6. CCTV kameraları tüm giriş/çıkış noktalarını, koridorları, veri merkezini ve kritik alanları 7/24 izler. Kayıtlar WORM depolamada 90 gün saklanır; adli olaylarda 7 yıla uzatılır.
7. Veri merkezi çevresel kontrolleri: sıcaklık 18-27°C (ASHRAE TC 9.9), nem %40-60, dew point monitoring. Sapma durumunda BMS (Building Management System) otomatik alarm üretir.
8. Yangın söndürme sistemi inert gaz (FM-200, Novec 1230, Inergen) olmalıdır; su sprinkler yalnızca ofis alanlarında, veri merkezinde kullanılmaz. Sistem yıllık test edilir.
9. Su sızıntısı tespiti zemin altı sensörlerle yapılır; klima suyu ve çatı sızıntısı için early warning alarmı kurulur.
10. Güç yedekliliği: UPS minimum 15 dakika full load, jeneratör minimum 48 saat full load. Jeneratör haftalık test, UPS aylık battery test yapılır.
11. Donanımın secure disposal'ı sertifikalı e-waste vendor tarafından yapılır; hard disk shredding (parçalama) veya degaussing zorunludur. "Certificate of Destruction" 7 yıl saklanır.
12. Temizlik personeli ve taşeronlar güvenlik kontrolünden geçer, escort edilir; secure zone'a yalnızız güvenlik görevlisi eşliğinde girer.
13. Lost/stolen badge 4 saat içinde IT'ye bildirilir; badge anında iptal edilir, yenisinin çıkması 1 iş gününü geçmez.
14. Tailgating/piggybacking (yetkili kişinin arkasından izinsiz geçiş) yasaktır; çalışanlar bu durumu engellemek ve raporlamakla yükümlüdür. Test için periodic security drill yapılır.
15. Üretim dışı saatlerde (mesai dışı, hafta sonu) veri merkezine erişim ek onay gerektirir; sistem "after-hours access" logunu SIEM'e gönderir.
16. Acil durum (yangın, deprem, bomba tehdidi) prosedürleri yazılı ve görsel olarak her katta asılıdır; yıllık tahliye tatbikatı zorunludur.
17. Üçüncü taraf servis personeli (HVAC, security system, janitorial) için background check zorunludur; servis anında escort edilir.
18. Fiziksel güvenlik olayları (yetkisiz giriş girişimi, hırsızlık, çevresel alarm) 24 saat içinde CISO'ya raporlanır; major olaylar (yangın, su baskını) anında.

### 6. Prosedürler & İş Akışları

**Ziyaretçi Yönetimi Prosedürü:** Ziyaretçi resepsiyonda geçerli kimlik sunar (T.C. kimlik, pasaport). Resepsiyon ziyaretçi kaydını VMS'ye (Visitor Management System) girer, host çalışana onay talebi gönderir. Host onaylar, ziyaretçi badge'i basılır (fotoğraflı). Ziyaretçi host tarafından karşılanır ve tüm süreçte escort edilir. Çıkışta badge iade edilir, VMS çıkış zamanı otomatik kaydedilir.

**Veri Merkezi Erişim Prosedürü:** Veri merkezine erişim ihtiyacı olan çalışan "DC Access Request" formu doldurur, yöneticisi + DC manager onayı gerekir. Erişim badge + biyometrik (parmak izi veya avuç içi) ile mantrap üzerinden yapılır. İçeride geçen süre, hareket kamera ile kaydedilir. Erişim logları SIEM'e gönderilir, anomali (uzun süreli kalma, off-hours) alarm üretir.

**Çevresel Olay Müdahalesi:** HVAC arızası → BMS alarm → IT on-call uyarılır → 30 dakika içinde müdahale. Sıcaklık 30°C'yi aşarsa otomatik shutdown prosedürü tetiklenir. Yangın alarmı → inert gaz otomatik discharge → itfaiye + CR team uyarılır → tahliye → hasar değerlendirme. Su sızıntısı → yedek klima devreye alınır, su kaynağı kapatılır.

**Secure Disposal Prosedürü:** Donanım "retired" olarak işaretlenir. Veri silme: cryptographic wipe (NIST SP 800-88 Clear/Purge) uygulanır. Doğrulama: %10 sample test. Daha sonra sertifikalı e-waste vendor çağrılır, shredding/degaussing yapılır. Vendor "Certificate of Destruction" verir. Süreç tamamlanınca donanım envanterden düşülür, kayıtlar 7 yıl saklanır.

### 7. Uyumluluk & İzleme

KPI'lar: Unauthorized access attempt oranı (hedef <5/ay), Badge tailgating incident (hedef 0), CCTV uptime (hedef ≥%99), HVAC temperature compliance (hedef ≥%99 saat uyumlu), Fire suppression system test pass (hedef %100 yıllık), UPS battery health (hedef ≥%90 kapasite), Generator test pass (hedef %100), Secure disposal certificate completion (hedef %100). Metrikler aylık Facility + Security raporunda sunulur. ISO/IEC 27001:2022 Annex A.11.1 (Site and facility security), A.11.2 (Equipment) gereksinimleri karşılanır. SOC 2 CC6.4 (Logical and Physical Access), CC7.4 (Environmental Protections). TIA-942 (Data Center Standards), Uptime Institute Tier Rating (kurum Tier III hedefli). PCI-DSS Req. 9 (Restrict physical access). OSHA (worker safety). Türk Standartları Enstitüsü (TSE) yangın güvenliği.

### 8. İhlal Yaptırımları

Fiziksel güvenlik ihlalleri: Hafif (örn. badge unutma, escortu 5 dk terk etme) — yazılı uyarı. Orta (tailgating yapma, badge paylaşma, CCTV görüntüsünü engelleme) — disiplin kuruluna sevk, badge geçici iptal, ek eğitim. Ağır (yetkisiz veri merkezi girişi, donanım hırsızlığı, sabotage, badge sahteciliği) — işten çıkarma, hukuki süreç, suç duyurusu (TCK md. 154 hırsızlık, md. 170 iş ve ticaret sırrı). E-waste vendor'ın sertifikasyon dışı imha yaptığı tespit edilirse sözleşme feshi ve yasal süreç.

### 9. İstisnalar

İstisnalar Facility Manager + CISO onayıyla: (a) Kurtarma çalışmaları sırasında (disaster recovery) geçici ek erişim, (b) Bakım penceresinde sertifikalı vendor'a sınırlı erişim, (c) Toplu etkinliklerde (yıllık toplantı) lobby ve ortak alanlarda esnek ziyaretçi yönetimi, (d) Üretim dışı ofislerde (small branch) badge + PIN kombinasyonu yeterli sayılabilir. Tüm istisnalar risk komitesinde değerlendirilir.

### 10. İlgili Standartlar

ISO/IEC 27001:2022 Annex A.11 (Physical and environmental security); ISO/IEC 27037 (Digital evidence); TIA-942 (Telecom Infrastructure Standard for Data Centers); Uptime Institute Tier Standard; ASHRAE TC 9.9 (Data Center Thermal Guidelines); NFPA 75 (Fire Protection for IT Equipment), NFPA 76 (Fire Protection for Telecommunications); NIST SP 800-88 (Media Sanitization); SOC 2 CC6.4, CC7.4; PCI-DSS v4.0 Req. 9; OSHA (US worker safety); TSE yangın yönetmelikleri; TCK md. 154, 170.

### 11. Onay & Revizyon Geçmişi

| Versiyon | Tarih | Hazırlayan | Onaylayan | Değişiklik |
|----------|-------|------------|-----------|------------|
| 1.0 | 2026-06-21 | Politika Subagent (2-D) | COO + CISO | İlk yayın |
| 0.9 | 2026-06-12 | Facility Manager | COO | Taslak |

Yıllık gözden geçirme, tesis değişikliği veya yeni veri merkezi açılışında revizyon yapılır.

---

## Politika No: 20 — Tedarik Zinciri Yazılım Güvenliği (SBOM/SLSA) Politikası

### 1. Amaç

Bu politika; kurumun geliştirdiği, kullandığı ve tedarik ettiği yazılımların tedarik zinciri güvenliğini sağlamayı amaçlar. ABD Başkanlık Yönergesi EO 14028 "Improving the Nation's Cybersecurity" ve SLSA (Supply-chain Levels for Software Artifacts) v1.0 framework'ü temel alınarak; SBOM (Software Bill of Materials) üretimi, bağımlılık sabitleme (pinning), imzalı artifact'lar (Sigstore, cosign), build provenance, reproducible builds, bağımlılık güvenlik açığı taraması ve lisans uyumluluğu süreçlerini standartlaştırır. SolarWinds (2020), Log4Shell (2021), XZ Utils (2024) gibi büyük tedarik zinciri saldırılarından ders çıkarılarak, kurumun yazılım tedarik zincirine yönelik riskleri azaltmayı, transitive (4th-party) bağımlılık risklerini görünürlüğü artırmayı ve "trust but verify" prensibiyle tedarikçilerden güvenli yazılım teslimi talep etmeyi hedefler. Politika, DevSecOps pipeline'ı ile entegredir.

### 2. Kapsam

Politika; kurumun geliştirdiği tüm yazılım (mikroservisler, frontend uygulamaları, CLI araçları, altyapı kodu, ML modelleri), kullandığı açık kaynak paketler (npm, PyPI, Maven, Go modules, Cargo, NuGet), satın aldığı/kiraladığı ticari yazılımlar (COTS, SaaS) ve dış kaynaklı geliştirme hizmetleri (outsourced development) kapsar. Kapsamdaki yaşam döngüsü aşamaları: bağımlılık seçimi, dependency resolution, build, package, sign, publish, deploy, runtime monitoring. Kullanılan tüm programlama dilleri (TypeScript, Python, Go, Rust, Java) ve build sistemleri (Bazel, Make, npm, pip, Poetry, Gradle) politika kapsamındadır. Container imajları (Dfile, base image), IaC modülleri (Terraform modules) ve ML model artifact'leri (Hugging Face, ONNX) dahildir. Kapsam dışı: çalışanların kişisel projeleri (kurumsal cihazda değilse) ve henüz prototip aşamasındaki deneysel kod (sponsor onayı olmadan prodüksiyona taşınmaz).

### 3. Tanımlar

- **SBOM (Software Bill of Materials):** Bir yazılımı oluşturan tüm bileşenlerin (doğrudan ve geçişli bağımlılıklar) listesidir; sürüm, lisans, hash ve vulnerability bilgisi içerir.
- **SPDX (Software Package Data Exchange):** Linux Foundation tarafından geliştirilen SBOM standardıdır (ISO/IEC 5962:2021).
- **CycloneDX:** OWASP tarafından geliştirilen, JSON/XML formatında SBOM standardıdır.
- **SLSA (Supply-chain Levels for Software Artifacts):** Google'ın öncülük ettiği, tedarik zinciri güvenliğini 4 seviyede değerlendiren framework'tür.
- **Build Provenance:** Bir artifact'ın nasıl, nerede, ne zaman, hangi kaynaklardan build edildiğine dair kanıt kümesidir (in-toto attestation).
- **Reproducible Build:** Aynı kaynak koddan byte-level aynı artifact üretilebilmesi özelliğidir.
- **Dependency Pinning:** Bağımlılığın sürüm ve hash değeriyle sabitlenmesidir (lockfile + checksum).
- **Sigstore / Cosign:** Artifact imzalamak için kullanılan CNCF açık kaynak araç setidir (keyless signing, transparency log — Rekor).
- **Transitive (4th-party) Dependency:** Doğrudan bağımlılığın bağımlılığıdır; dolaylı, derin bağımlılık.
- **Provenance Attestation:** Build sürecinin güvenilir kaynakta gerçekleştiğine dair kriptografik kanıttır.
- **FOSS (Free and Open Source Software):** Özgür ve açık kaynak yazılım; lisans uyumluluğu gerektirir (MIT, Apache-2.0, GPL, AGPL, BSD vb.).
- **CVE / GHSA:** Bilinen güvenlik açığı tanımlayıcıları (CVE database, GitHub Security Advisory).
- **Trusted Builder:** SLSA Level 3+ gereği, izole ve denetlenebilir build ortamı sağlayan sistem (GitHub Actions hosted runner, Cloud Build).

### 4. Roller & Sorumluluklar

- **CISO / AppSec Lead:** Politikanın sahibi, SLSA seviye hedeflerini belirler, vendor security review yapar.
- **DevSecOps Engineer:** Pipeline'a SBOM generation, signing, scanning entegre eder; toolchain yönetir (cosign, syft, grype, Dependabot, Snyk).
- **Geliştirici (Developer):** Bağımlılık seçiminde güvenlik politikalarına uyar, lockfile güncel tutar, CVE'leri zamanında patch eder.
- **Release Manager:** Sürüm çıkışında SBOM yayımlar, imzalı artifact'ları artifact registry'ye yükler, provenance attestation'ı doğrular.
- **Tedarik Yönetimi (Procurement):** Satın alınan yazılımlar için SBOM talep eder, vendor güvenlik anketesi uygular, sözleşmelere security clause ekler.
- **Hukuk Departmanı:** FOSS lisans uyumluluğu, AGPL/GPL infektif lisans risk değerlendirmesi, vendor sözleşme review.
- **Vulnerability Management Team:** Açık kaynak CVE'leri izler, risk skoru (CVSS + EPSS + exploitability) hesaplar, patch SLA'sını uygular.
- **Üçüncü Parti Yazılım Sahibi:** Tedarik edilen yazılım için SBOM, imza, provenance sağlamakla yükümlü.

### 5. Politika Maddeleri

1. Kurumun geliştirdiği tüm üretim yazılımları için SBOM üretimi zorunludur. SBOM hem SPDX hem CycloneDX formatında, her release ile artifact registry'ye yüklenir.
2. SBOM minimum içerik: NTIA minimum elements (component name, version, supplier, unique identifier, dependency relationship, SBOM author, timestamp). Ek olarak: hash (SHA-256), license, CVE referansları.
3. SLSA seviye hedefleri: Yeni geliştirilen kritik uygulamalar SLSA Level 3+ uyumlu olmalıdır. İç araçlar Level 2 yeterlidir. SLSA Level 4 (two-party reviewed builds) uzun vadeli hedeftir.
4. Build provenance zorunludur; her artifact için in-toto attestation üretilmelidir. Attestation, build source, builder, materials, build steps içermelidir ve cosign ile imzalanmalıdır.
5. Tüm artifact'lar (container image, binary, package) Sigstore cosign ile imzalanmalıdır. İmzasız artifact production deploy edilemez. İmza doğrulaması admission webhook ile cluster seviyesinde yapılır.
6. Bağımlılık pinning zorunludur: package-lock.json, poetry.lock, go.sum, Cargo.lock, requirements.txt + hash pip format kullanılmalıdır. "latest" veya caret range (^1.2) production'da yasaktır.
7. Bağımlılık güvenlik açığı taraması (Snyk, Dependabot, Trivy, Grype) CI pipeline'ına entegre edilir. Yeni eklenen critical/high CVE'ler build'i kırar (break-the-build).
8. Reproducible build hedeflenir; deterministic build environment (Bazel, Nix) kullanılır. Reproducibility doğrulaması aylık sample testle yapılır.
9. Transitive (4th-party) bağımlılıklar dahil tüm bağımlılık ağacı görünürlüğü SBOM ile sağlanır. Derinlik sınırı yoktur; tüm seviyeler taranır.
10. FOSS lisans uyumluluğu yazılım lifecycle'ına entegredir. Blacklist: AGPL (kurum dışı servis riski), SSPL, BUSL. Whitelist: MIT, Apache-2.0, BSD-2/3, ISC. GPL/LGPL hukuk onayı gerekir.
11. Yeni bağımlılık ekleme "dependency acceptance" review'ından geçer; popülerlik, bakım durumu, güvenlik geçmişi, lisans değerlendirilir. abandonware (son 2 yıl güncellenmemiş) paketler reddedilir.
12. Vendor'lardan satın alınan ticari yazılım için SBOM teslimi sözleşmeye konur. SBOM olmayan vendor'lar kabul edilmez; alternatif değerlendirilir.
13. Vendor güvenlik açığı bildirim SLA'sı sözleşmede tanımlanır: critical CVE 7 gün, high 30 gün, medium 90 gün patch SLA'sı.
14. Container base image'lar distroless veya minimal Alpine tabanlı tercih edilir. Latest tag kullanılamaz; specific digest ile pull yapılır.
15. CI/CD pipeline'ında her PR'da otomatik: dependency scan, license scan, SBOM diff, SAST, secret scan çalışır. Failed check'ler merge'i engeller.
16. Üretilen SBOM'lar 7 yıl boyunca saklanır; adli analiz ve incident response için historical lookup yapılabilir.
17. ML modelleri için "Model Card" + "Dataset Card" + "Model SBOM" üretilir; Hugging Face Hub veya internal model registry'de publish edilmeden önce imzalanır.
18. Tedarik zinciri güvenlik olayları (kötü niyetli commit, compromised package, typosquatting detection) 1 saat içinde CSIRT'e bildirilir; affected system izole edilir.

### 6. Prosedürler & İş Akışları

**SBOM Üretim İş Akışı:** Geliştirici PR açar → CI'da syft (CycloneDX) çalışır → SBOM artifact olarak saklanır → vulnerability scan (grype) çalışır → license scan (syft + fossa) çalışır → sonuçlar PR comment olarak görünür. Tüm check'ler geçerse merge edilir. Release pipeline'ında nihai SBOM cosign ile imzalanır, OCI artifact olarak registry'ye push edilir, transparency log'a (Rekor) kaydedilir.

**SLSA Level 3 Build Pipeline:** Source code GitHub monorepo'dan çekilir (commit SHA pinned). GitHub Actions hosted runner (Trusted Builder) build başlatır. Build adımları izole, network erişimi kısıtlı (hermetic build). Build sonunda cosign attestation üretilir, builder identity (OIDC token) ile imzalanır. Attestation, SLSA provenance formatına (slsa.dev/v1) uygundur. Deploy aşamasında policy controller (Kyverno, OPA Gatekeeper) attestations doğrular; geçersiz veya eksik imza deployment'ı reddeder.

**Bağımlılık Güncelleme (Dependabot/Renovate) Workflow:** Bot haftalık bağımlılık güncellemeleri için PR açar. PR'da otomatik: test, SAST, vulnerability scan, SBOM diff. Major version güncellemeleri manuel review gerektirir. Patch/minor otomatik merge (auto-merge enabled) yapılabilir (CODEOWNERS onayı sonrası). Güncelleme 30 gün içinde merge edilmezse PR kapatılır, tekrar açılır.

**Vendor SBOM Review Prosedürü:** Tedarik departmanı vendor'dan SBOM (SPDX/CycloneDX) ister. SBOM kurumsal SBOM yönetim platformuna (Dependency-Track, Anchore Enterprise) yüklenir. Otomatik analiz: critical CVE var mı, blacklist lisans var mı, abandonware bağımlılık var mı. Sonuç kurumsal risk skoruna eklenir. Risk skoru kırmızı ise satın alma durdurulur, vendor remediation planı sunar.

**Olay Müdahalesi — Compromised Dependency:** CVE yayınlanır → vulnerability management ekibi etkilenen sistemleri SBOM lookup ile tespit eder → etkilenen uygulamalar belirlenir → CSIRT uyarılır → patch veya mitigasyon (WAF kuralı, runtime protection) uygulanır → post-incident review SBOM coverage'ı değerlendirir.

### 7. Uyumluluk & İzleme

KPI'lar: SBOM coverage (hedef %100 production software), SLSA Level 3 compliance (hedef ≥%80 kritik uygulamalar), Critical CVE mean time to remediate (hedef ≤7 gün), High CVE MTTR (hedef ≤30 gün), Vulnerable dependency oranı (hedef <%5), License compliance violation (hedef 0), Signed artifact ratio (hedef %100 production), Reproducibility rate (hedef ≥%95), Vendor SBOM submission rate (hedef %100). Metrikler aylık AppSec raporunda sunulur. EO 14028 Section 4 (Software Supply Chain Security) gereksinimleri karşılanır. NIST SP 800-218 (Secure Software Development Framework — SSDF) uyumu. NTIA Minimum Elements for SBOM. FDA Pre-Market Guidance for Cybersecurity in Medical Devices (varsa). CIS Software Supply Chain Security Guide v1.0. ISO/IEC 27001:2022 Annex A.5.20 (Information security in supplier relationships), A.5.21-23 (Supplier processes, cloud services), A.8.25 (Secure development lifecycle), A.8.28 (Secure coding).

### 8. İhlal Yaptırımları

Tedarik zinciri güvenlik ihlalleri: Hafif (örn. SBOM üretmeme, pinning eksikliği) — yazılı uyarı, 15 gün düzeltme. Orta (imzasız artifact deploy, blacklist lisans kullanma, vendor SBOM talep etmeme) — disiplin süreci, sorumlunun deploy yetkisi askıya alınır, ek eğitim. Ağır (kasıtlı tedarik zinciri zayıflatma, vulnerability gizleme, vendor ile gizli anlaşma, compromised package bilerek kullanma) — işten çıkarma, hukuki süreç, gereğinde suç duyurusu. Vendor ihlalleri: SLA ceza, sözleşme feshi, kara listeye alma. Lisans ihlali tespit edilirse (örn. AGPL violation) hukuki süreç acil başlatılır, kod ya açık kaynaklanır ya da kaldırılır.

### 9. İstisnalar

İstisnalar CISO + Hukuk ortak onayıyla: (a) Eski (legacy) sistemlerde kademeli geçiş (12 ay uyum süresi), (b) Araştırma & geliştirme amaçlı deneysel kod (prod dışı), (c) Belli kütüphanelerin (hard fork) imkânsızlığında risk kabul belgesi (risk acceptance form), (d) Belirli COTS yazılımlarda vendor SBOM desteklemiyorsa compensating control (network segmentation + extra monitoring), (e) Acil security patch durumunda geçici olarak pinning esnetilebilir (72 saat içinde kalıcı çözüm). Tüm istisnalar risk komitesinde aylık gözden geçirilir.

### 10. İlgili Standartlar

EO 14028 "Improving the Nation's Cybersecurity" (US Presidential Executive Order, May 2021); SLSA v1.0 (Supply-chain Levels for Software Artifacts, slsa.dev); SPDX ISO/IEC 5962:2021; CycloneDX 1.5 (OWASP); NIST SP 800-218 (SSDF); NIST SP 800-161 Rev. 1 (Supply Chain Risk Management); NTIA Minimum Elements for SBOM; in-toto Specification; Sigstore (cosign, Rekor, Fulcio); CNCF Software Supply Chain Best Practices White Paper; CIS Software Supply Chain Security Guide; OpenSSF Scorecard; ISO/IEC 27001:2022 Annex A.5.20-23, A.8.25, A.8.28; OWASP Top 10 A06:2021 (Vulnerable and Outdated Components); EU Cyber Resilience Act (CRA, 2024); FDA Pre-Market Cybersecurity Guidance.

### 11. Onay & Revizyon Geçmişi

| Versiyon | Tarih | Hazırlayan | Onaylayan | Değişiklik |
|----------|-------|------------|-----------|------------|
| 1.0 | 2026-06-21 | Politika Subagent (2-D) | CISO + CTO | İlk yayın |
| 0.9 | 2026-06-14 | AppSec Lead | CTO | Taslak |

Yıllık ve büyük tedarik zinciri olaylarında (örn. yeni SLSA sürümü, yeni regülasyon) revize edilir. Yürürlük CISO ve CTO ortak imzasıyla başlar.

---

*Bu doküman 5 politikayı içermektedir. Politikalar 1–15 diğer faz dosyalarında yer almaktadır. Tüm politikalar birbiriyle çapraz referanslıdır ve kurumsal ISMS (Information Security Management System) çerçevesinin parçasıdır.*
