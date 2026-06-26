# Kurumsal Politika Seti — Faz 2 (Politikalar 6–10)

**Doküman Sahibi:** Mühendislik & Güvenlik Yönetimi
**Sürüm:** 1.0
**Yürürlük Tarihi:** 2026-06-21
**Sınıflandırma:** Internal — Confidential
**İlgili Standartlar:** ISO 27001, ISO 9001, ISO 42001, ISO 23894, ISO 25010, ISO 22301, NIST CSF 2.0, NIST AI RMF 1.0, NIST SP 800-61r2, EU AI Act, GDPR, SOC 2 Type II, OWASP Top 10, OWASP LLM Top 10, CIS Controls v8, SANS/NIST IR Lifecycle, DORA Metrics, COBIT 2019, ITIL 4

Bu doküman 5 kurumsal politikayı içerir: Kod İnceleme & Kalite Güvence, AI Etik & Sorumlu AI, AI Model Yönetimi & MLOps, Veri Yönetimi & Veri Kalitesi, Olay Müdahalesi & Güvenlik İhlali. Her politika 11 bölümlük standart şablonu izler.

---

## Politika No: 6 — Kod İnceleme & Kalite Güvence Politikası

### 1. Amaç

Bu politika, kurum bünyesinde geliştirilen tüm yazılım ürünlerinin gözden geçirilmesi, doğrulanması ve üretime alınmadan önce tanımlı kalite kapılarından geçmesini sağlamak amacıyla yazılmıştır. Politik amaçlar şunlardır: (i) üretim hatalarını ve güvenlik zafiyetlerini merge öncesi tespit etmek; (ii) kod tabanının okunabilirliğini, sürdürülebilirliğini ve bilgi paylaşımını artırmak; (iii) tek kişinin kod yazma ve onaylama tekelini (single-developer bottleneck) ortadan kaldırmak; (iv) teknik borcun (technical debt) görünürlüğünü sağlamak ve kontrollü biçimde azaltmak; (v) linter, statik analiz, test otomasyonu ve secret tarama araçlarının her commit/pull request üzerinde zorunlu çalışmasını garanti etmek; (vi) ISO 27001 Annex A.8.25 (Secure development lifecycle), ISO 9001 madde 8.3 (Tasarım ve geliştirme), SOC 2 CC8.1 (Software development lifecycle) ve OWASP SAMM'a uyumu sağlamak.

### 2. Kapsam

Bu politika; AI Kod Üretici Stüdyo frontend (Next.js 16), backend API'leri, agent backend servisleri, altyapı (Infrastructure-as-Code) modülleri, CI/CD pipeline tanımları, veritabanı migration scriptleri ve üçüncü parti entegrasyon kodları dahil tüm production kodunu kapsar. Ayrıca; full-time çalışan, contractor, dış tedarikçi ve open-source contribütör tarafından açılan tüm pull request'ler (PR) bu politikanın kapsamındadır. Dokümantasyon, salt-okunur config dosyaları ve otomatik üretilmiş dosyalar (lock dosyaları, generated types, build artifact'leri) kapsam dışıdır; ancak bu dosyaların üretilmesini sağlayan jeneratörler (codegen, schema generator) kapsam içindedir.

### 3. Tanımlar

- **Pull Request (PR):** Bir branch'in hedef branch'e merge edilmek üzere açılan değişiklik isteği.
- **Reviewer:** Bir PR'ı inceleyip approve veya request changes kararı veren yetkili mühendis.
- **Codeowners:** Belirli bir dizin veya dosya yolunun zorunlu onay vericilerini tanımlayan `.github/CODEOWNERS` dosyası.
- **Definition of Ready (DoR):** Bir görevin geliştirmeye başlanmadan önce karşılaması gereken kabul kriterleri.
- **Definition of Done (DoD):** Bir görevin "tamamlandı" sayılması için gereken kalite ve teslimat kriterleri.
- **Linter:** Kod stilini ve potansiyel hataları statik olarak denetleyen araç (ESLint, Prettier, TypeScript compiler).
- **Static Analysis (SAST):** Kaynak kodu çalıştırmadan güvenlik ve kalite analizi yapan araçlar (SonarQube, CodeQL, Semgrep).
- **Test Coverage:** Birim ve entegrasyon testlerinin kaynak kodunun yüzdesini ifade eden metrik (lines, branches, functions, statements).
- **Technical Debt:** Kısa vadeli çözümlerden doğan ve gelecekte düzeltilmesi gereken maliyet birikimi.
- **Merge Gatekeeper:** Bir PR'ın merge edilebilmesi için gereken tüm otomatik ve manuel kontrollerin toplamı.
- **Bypass:** Üretim acil durumlarında politikayı geçici olarak askıya alma yetkisi.

### 4. Roller & Sorumluluklar

- **Yazılım Mühendisi (Author):** DoR'u sağlamış, test yazmış, linter'ı yerelde çalıştırmış, anlamlı PR açıklaması ve açıklama ile PR açmakla yükümlüdür.
- **Reviewer (1. ve 2. derece):** Kodun işlevsel doğruluğunu, güvenliğini, performansını, okunabilirliğini ve standartlara uygunluğunu denetler; constructive feedback verir.
- **Senior Reviewer / Tech Lead:** Mimari kararları, cross-cutting concern'ları ve yüksek riskli değişiklikleri onaylar; oylama kilidi durumunda nihai kararı verir.
- **Security Champion:** Her takımda en az bir kişi; PR'larda güvenlik checklist'i uygular, OWASP Top 10 ve LLM Top 10 kontrol noktalarını işletir.
- **Release Manager:** Üretim dağıtımlarında merge gatekeeper kurallarının uygulandığını doğrular.
- **QA Lead:** Test coverage, integration test sonuçları ve doğrulama metriklerinin raporlanmasından sorumludur.
- **Engineering Manager:** Politikaya uyumu izler, ihlal trendlerini aylık raporlar, bypass yetkilerini sınırlı kullanır.

### 5. Politika Maddeleri

1. Tüm kod değişiklikleri doğrudan `main`/`prod` branch'lerine commit edilemez; her değişiklik bir feature branch'inden Pull Request ile gönderilmelidir. Direct push izni yalnızca `release-bot` ve `dependabot` hesaplarına verilir.
2. Her PR en az **iki (2) onay (approval)** almalıdır. Onaylardan en az biri ilgili dizinin Codeowners listesinde yer almalıdır. PR'ı açan kişi kendi PR'ını onaylayamaz (self-approve yasak).
3. PR açılmadan önce yazar, Definition of Ready kriterlerini karşılamalıdır: jira bileti linki, kabul kriterleri yazılmış, bağımlı task'lar tamamlanmış, tasarım dokümanı (gerekliyse) approved statüsünde.
4. Definition of Done şu koşulların hepsini içerir: (a) linter temiz, (b) TypeScript strict mode hatasız, (c) test coverage ≥ %80 (line + branch), (d) yeni kod için birim test yazılmış, (e) değişen API için entegrasyon testi eklenmiş, (f) CHANGELOG güncellenmiş, (g) dokümantasyon güncellenmiş, (h) güvenlik checklist'i doldurulmuş, (i) iki onay, (j) CI pipeline yeşil.
5. **ESLint** konfigürasyonu `eslint:recommended` + `@typescript-eslint/strict` + `next/core-web-vitals` presetlerini birleştirmeli; warning limiti sıfır, hata limiti hard-fail olmalıdır.
6. **Prettier** konfigürasyonu repository kökünde `.prettierrc` olarak tek kaynak olmalı; printWidth 100, semi true, singleQuote true, trailingComma all ayarları standarttır.
7. **TypeScript** `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`, `exactOptionalPropertyTypes: true` bayrakları aktif olmalı; `any` kullanımı ESLint `no-explicit-any` kuralı ile yasaklanmalı, istisnai durumlarda `// eslint-disable-next-line` ile gerekçeli açıklama zorunludur.
8. **Test coverage** eşik değerleri: unit test line coverage %80, branch coverage %75, function coverage %85. Eşik altında PR otomatik reddedilir. Coverage raporu CI üzerinde Codecov'a yüklenir ve PR yorumunda gösterilir.
9. Pull Request template'inde (`.github/PULL_REQUEST_TEMPLATE.md`) şu bölümler zorunludur: Özet, Değişiklik Tipi (feature/bugfix/refactor/security/hotfix), İlgili Bilet, Test Planı, Risk Değerlendirmesi, Ekran Görüntüleri/Demo, Breaking Change, Checklist.
10. **SonarQube Quality Gate** her PR'da çalışmalı; yeni kod üzerinde `new bugs = 0`, `new vulnerabilities = 0`, `new code smells = 0`, `coverage on new code ≥ %80`, `duplications on new code < %3` koşulları aranır.
11. **GitHub CodeQL** analizi haftalık full scan + her PR'da delta scan çalışmalı; security-and-quality query set'i kullanılmalı, yeni critical/high alert'ler PR'ı bloke eder.
12. **Secret scanning** (gitleaks, GitHub Advanced Security) pre-commit hook ve CI'da çift katmanlı çalışmalı; tespit edilen secret varsa PR otomatik kapatılır ve güvenlik ekibine bildirilir.
13. **Teknik borç (technical debt)** her sprint başında değerlendirilir; SonarQube'ta "Bug" ve "Vulnerability" etiketli her madde 30 gün içinde çözülmeli, "Code Smell" maddeleri 90 gün içinde ele alınmalıdır. Tech Debt backlog'ı publicly visible olmalı, aylık burn-down chart yayınlanmalıdır.
14. **Force push ve commit history rewrite** `main`/`release/*` branch'lerinde yasaktır. Geliştirme branch'lerinde yalnızca PR açan kişi kendi branch'inde force-push yapabilir.
15. **Squash-merge** varsayılan merge stratejisidir. Conventional Commits formatı (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `security:`, `perf:`) zorunludur; CI commit mesajını otomatik denetler.
16. **Branch protection** kuralları şunları içerir: require pull request, require status checks pass, require branches up-to-date, require signed commits (GPG/Sigstore), require linear history, do not allow bypass by administrators (acil durumlar için ayrı emergency prosedürü yürür).
17. **Long-lived branch** süresi 14 günü geçemez. 14 günden eski branch'ler haftalık otomatik uyarı alır, 30 gün sonunda otomatik silinir.
18. **Hotfix PR**'ları için hızlandırılmış süreç: bir Senior Reviewer + Security Champion onayı yeterlidir, ancak hotfix sonrası 5 iş günü içinde post-hotfix review yapılarak tam süreç tamamlanmalıdır.
19. **Dependency güncelleme PR'ları** (Dependabot/Renovate) otomatik açılır; minor/patch güncellemeler için bir onay yeterlidir, major güncellemeler için tam süreç işletilir ve breaking change analizi zorunludur.
20. **Tüm PR'lar 5 iş günü içinde** ilk review almalıdır; 10 iş günü içinde merge edilmeli veya kapatılmalıdır. Stale PR'lar otomatik etiketlenir.

### 6. Prosedürler & İş Akışları

**Standart PR İş Akışı:**
1. Author, DoR kriterlerini karşılayan bir bileti bir feature branch'inde geliştirir (`feat/DSK-123-ai-prompt-cache`).
2. Yerel pre-commit hook çalışır: ESLint, Prettier, tsc, gitleaks, birim testler.
3. Author, PR'ı açar; CI pipeline otomatik başlar: lint, type check, build, unit test, integration test, SonarQube, CodeQL, dependency review.
4. Codeowners otomatik reviewer olarak atanır; Slack/Teams üzerinden bildirim gönderilir.
5. Reviewer'lar 2 iş günü içinde yorum yapar; "Changes requested" durumunda author düzeltir, push yapar, CI yeniden çalışır.
6. İki onay alındıktan sonra "Squash and merge" aktifleşir. Author merge eder (veya "auto-merge" feature kullanılır).
7. Merge sonrası feature branch otomatik silinir; deployment pipeline tetiklenir.

**Hotfix İş Akışı:**
1. SEV1/SEV2 olayında on-call, `hotfix/` prefix'li branch oluşturur.
2. `main`'den açılan PR'a "hotfix" etiketi konur; tek Senior Reviewer + Security Champion yeterli.
3. Merge sonrası `main`'e cherry-pick edilir, `release/*` branch'lere backport edilir.
4. 5 iş günü içinde post-hotfix review yapılır, eksik testler ve dokümantasyon tamamlanır.

**Definition of Ready Checklist (DoR):**
- [ ] Jira bileti "in progress"a alınmış
- [ ] Kabul kriterleri yazılmış ve PO tarafından onaylanmış
- [ ] Tasarım/teknik doküman (gerekliyse) approved
- [ ] Bağımlı task'lar "done"
- [ ] UI mockup'lar (varsa) approved

**Definition of Done Checklist (DoD):**
- [ ] Linter temiz, TypeScript strict hatasız
- [ ] Unit test eklendi, coverage ≥ %80
- [ ] Integration test eklendi (API değişiklikleri için)
- [ ] E2E test (kritik akışlar için)
- [ ] SonarQube Quality Gate: PASSED
- [ ] CodeQL: 0 new critical/high
- [ ] Security checklist dolduruldu
- [ ] CHANGELOG güncellendi
- [ ] Dokümantasyon güncellendi (README, API ref, ADR)
- [ ] İki onay alındı
- [ ] CI pipeline yeşil
- [ ] Feature flag arkasında (gerekliyse)

### 7. Uyumluluk & İzleme

Aşağıdaki metrikler aylık Engineering Quality Dashboard'ta yayınlanır: PR review time (median, P90), PR cycle time, merge frequency, deployment frequency, change failure rate, MTTR, coverage trend, SonarQube Quality Gate pass rate, CodeQL alert count, tech debt ratio (TD/LOC), stale PR count, force-push attempts, bypass usage count. Aylık kalite toplantısında bu metrikler gözden geçirilir; SLA ihlalleri root-cause analysis (5-Why) ile incelenir. Politikaya uyum denetimleri çeyreklik olarak Internal Audit tarafından yapılır; uyum oranı hedefi %95'tir.

### 8. İhlal Yaptırımları

- İlk ihlal: Yazılı uyarı + 1:1 coaching, ihlal kalıbı düzeltilene kadar PR onay yetkisi askıya alınır.
- Tekrarlayan ihlal (3 ayda 2+): Performans değerlendirmesine negatif yansır, zorunlu training.
- Direct push to main: Otomatik revert, olay incident olarak kaydedilir, mühendis ve yöneticisi uyarılır.
- Self-approve: PR otomatik kapatılır, tekrarında mühendis reviewer havuzundan 30 gün çıkarılır.
- Coverage eşik altı merge: Engineering Manager + QA Lead tarafından post-merge review, gerekirse hotfix.
- Kritik güvenlik zafiyeti atlatma: Discipline committee'ye sevk, ciddiyete göre son uyarı veya işten ayrılık.

### 9. İstisnalar

Aşağıdaki durumlar sınırlı süreli bypass hakkı tanır: (i) SEV1 üretim olaylarında hotfix (post-hotfix review 5 gün içinde tamamlanmak şartıyla); (ii) tek seferlik data migration scriptleri (Engineering Director + CISO onayıyla); (iii) dokümantasyon-only değişiklikler (tek reviewer yeterli); (iv) dependency patch güncellemeleri (otomatik bot PR'ları, tek reviewer). Tüm bypass'lar `bypass-policy` etiketiyle kaydedilir ve aylık rapora yansır.

### 10. İlgili Standartlar

ISO 27001 Annex A.8.25 (Secure development), A.8.26 (Application security requirements), A.8.27 (Secure system architecture and engineering); ISO 9001 madde 8.3 (Design and development); ISO/IEC 25010 (Software quality model); SOC 2 CC8.1 (Change management); OWASP Top 10 2021, OWASP ASVS L1-L3, OWASP SAMM v2; NIST SP 800-160v1 (Systems Security Engineering); CWE Top 25; CIS Controls v8 (Control 16: Application Software Security); ISO/IEC/IEEE 90003 (Software engineering guidelines).

### 11. Onay & Revizyon Geçmişi

| Sürüm | Tarih | Onaylayan | Değişiklik |
|-------|-------|-----------|------------|
| 1.0 | 2026-06-21 | CTO + CISO + VP Engineering | İlk yayın |
| 0.9 | 2026-06-15 | Engineering Council | İç review |
| 0.5 | 2026-06-01 | Draft | Taslak |

Onaylayanlar: CTO, CISO, VP Engineering, Head of QA. Sonraki review: 2026-12-21 (6 ay). Sahip: Engineering Practices Guild.

---

## Politika No: 7 — AI Etik & Sorumlu AI Politikası

### 1. Amaç

Bu politika, kurumun geliştirdiği, kullandığı veya üçüncü taraflardan tedarik ettiği tüm yapay zeka (AI) sistemlerinin etik, şeffaf, hesap verebilir, adil ve insan gözetimine tabi olacak şekilde tasarlanmasını, geliştirilmesini, dağıtılmasını ve işletilmesini garanti altına almak amacıyla yazılmıştır. Politik amaçlar: (i) NIST AI Risk Management Framework (AI RMF 1.0) ve EU AI Act ile tam uyum; (ii) bireylerin AI kararlarından olumsuz etkilenmesini önlemek (non-discrimination, fairness); (iii) AI sistemlerinin explainability ve interpretability gerekliliklerini karşılaması; (iv) bias tespiti ve azaltma süreçlerinin zorunlu hale gelmesi; (v) deepfake ve sentiant AI görünümlü içeriklerin sınırlarının çizilmesi; (vi) AI red teaming ve sürekli izleme ile model davranış sapmalarının erken tespiti; (vii) ISO 42001 (AI Management System) sertifikasyonuna hazırlık.

### 2. Kapsam

Bu politika; tüm AI/ML modellerini (DeepSeek, OpenAI, Anthropic, kendi-eğittiğimiz modeller), AI destekli özellikleri (AI Kod Üretici Stüdyo, AI agent'lar, chatbot'lar, öneri sistemleri, anomaly detection), AI training pipeline'larını, fine-tuning süreçlerini, prompt template'lerini ve AI tarafından üretilen içeriği kapsar. Dahili kullanım, müşteriye sunulan ürünler ve üçüncü parti API entegrasyonları dahil tüm kullanım senaryoları kapsam içindedir. Politika; kurum içi tüm birimleri (mühendislik, ürün, pazarlama, HR, hukuk, müşteri destek) kapsar.

### 3. Tanımlar

- **AI Sistemi:** Makine öğrenimi, derin öğrenme, büyük dil modeli (LLM), computer vision, NLP veya benzer teknikleri kullanan ve belirli bir amaç için çıktı üreten yazılım sistemi.
- **AI Riski:** Bireyler, gruplar, toplum veya kurum üzerinde olumsuz etki doğurma potansiyeli (zarar, ayrımcılık, hak ihlali, güvenlik tehdidi, mahremiyet ihlali).
- **NIST AI RMF:** NIST'in 4 fonksiyonlu (Govern, Map, Measure, Manage) AI risk yönetim çerçevesi.
- **EU AI Act Risk Seviyeleri:** Unacceptable (yasak), High (yüksek), Limited (sınırlı), Minimal (minimal) — her seviye farklı yükümlülük gerektirir.
- **Explainability (Açıklanabilirlik):** Bir AI kararının neden ve nasıl alındığının insanlar tarafından anlaşılabilir biçimde ifade edilmesi.
- **Fairness (Adalet):** AI çıktılarının demografik gruplar arasında haksız ayrımcılık yapmaması.
- **Bias (Önyargı):** Eğitim verisindeki veya model mimarisindeki sistematik sapma.
- **Model Card:** Bir AI modelinin amaç, performans, sınırlar, etik değerlendirme, training data özetini içeren şeffaflık dokümanı.
- **AI Impact Assessment (AIIA):** Bir AI sisteminin deploy edilmeden önce potansiyel risklerinin değerlendirildiği süreç.
- **Human-in-the-Loop (HITL):** Kritik kararlarda insan onayı zorunlu kılan kontrol mekanizması.
- **AI Red Team:** Bir AI sistemini adversarial yöntemlerle test eden, saldırgan bakış açısıyla zafiyet arayan ekip.
- **Deepfake:** AI ile üretilmiş, gerçek dışı ama gerçek görünümlü ses, video, görüntü veya metin içeriği.
- **Sentient AI Bound:** Şuurlu/farkında olduğu iddia edilen AI sistemlerinin kurum içinde geliştirilmesi veya kullanılmasının yasak olduğu sınır.

### 4. Roller & Sorumluluklar

- **AI Ethics Board:** Kurumun en üst AI etik karar organı; ayda bir toplanır, kritik AI projelerini onaylar, AI Risk Committee'ye rapor verir.
- **AI Risk Officer (AIRO):** CISO'ya bağlı; AI risk envanterini tutar, AI impact assessment süreçlerini yürütür, regulator ile iletişim kurar.
- **ML/Data Science Team:** Modellerin etik değerlendirmesini, bias testlerini, model card yazımını sağlar.
- **Product Manager:** AI özelliğinin kullanıcı etkisini değerlendirir, transparency disclosure'lardan sorumludur.
- **Legal & Compliance:** EU AI Act, GDPR, sectoral regülasyon yorumu; telif hakkı, IP, sorumluluk değerlendirmesi.
- **Human Reviewer (HITL operator):** Kritik AI çıktılarını onaylar, override yapar, geri bildirim döngüsünü işletir.
- **AI Red Team Lead:** Çeyreklik red teaming egzersizlerini planlar ve yürütür.
- **End Users:** AI ile etkileşimde transparency ve feedback mekanizmaları üzerinden geri bildirim sağlar.

### 5. Politika Maddeleri

1. **NIST AI RMF dört fonksiyonu** (Govern, Map, Measure, Manage) tüm AI sistemleri için uygulanacaktır. "Govern" fonksiyonu kurum çapında politika, roller ve denetim çerçevesini; "Map" bağlam ve risk tanımlamasını; "Measure" değerlendirme ve testi; "Manage" risk azaltma ve izlemeyi kapsar.
2. **EU AI Act risk sınıflandırması** zorunludur. Her AI sistemi deploy edilmeden önce dört seviyeden birine atanmalıdır: (a) Unacceptable — sosyal puanlama, manipülatif AI, gerçek zamanlı biyometrik kimlik doğrulama (genel alanlarda) yasaktır; (b) High — eğitim, istihdam, kredi, kritik altyapı, kanun uygulama; katı yükümlülükler; (c) Limited — chatbot, deepfake; transparency yükümlülüğü; (d) Minimal — spam filtresi gibi; serbest.
3. **High-risk AI** sistemleri için aşağıdakiler zorunludur: risk assessment, kalite yönetim sistemi, teknik dokümantasyon, log kayıtları, şeffaflık ve kullanıcı bilgilendirme, insan gözetimi, doğruluk/robustness/cybersecurity gereklilikleri, deploy öncesi CE-type conformity assessment (uygunluk değerlendirmesi).
4. **AI Impact Assessment (AIIA)** her yeni AI sistemi için, mevcut sistemlerde ise yıllık ve her major güncellemede yapılmalıdır. AIIA; kullanım senaryosu, stakeholder analizi, olası zararlar (likelihood × severity), mitigation planı, residual risk, onay/red kararını içerir.
5. **Model Card** her production modeli için public/internal olarak yayınlanmalıdır; şunları içermelidir: model amaç, training data özeti, performans metrikleri (genel ve subgroup bazında), etik değerlendirme, bilinen sınırlar, use case'ler ve kullanılmaması gereken alanlar, geri bildirim kanalı.
6. **Explainability:** Kullanıcıya sunulan tüm AI çıktıları için en azından "bu içerik AI tarafından üretilmiştir" disclosure'u zorunludur. Yüksek riskli kararlarda (kredi, istihdam, sağlık) kararın gerekçesi kullanıcıya açıklanmalı; SHAP, LIME veya benzeri interpretability araçları ile feature contribution raporu sunulmalıdır.
7. **Fairness & Non-discrimination:** Her model için demographic parity, equal opportunity, equalized odds metrikleri ölçülmeli; gruplar arası fark %10 eşiğini aşamaz (80% rule). Bias eşik aşımı durumunda model deploy edilemez; remediation sonrası yeniden test zorunludur.
8. **Bias detection & mitigation:** Training data audit (representation, balance), pre-processing (reweighing, sampling), in-processing (adversarial debiasing, fairness constraints), post-processing (threshold optimization) teknikleri uygulanır. Aylık bias drift raporu yayınlanır.
9. **Human Oversight:** Tüm high-risk kararlar için HITL zorunludur. AI öneri üretir, insan onaylar. Override yetkisi her zaman insanda kalır. Otomatik karar yalnızca minimal risk seviyesinde kullanılabilir.
10. **Transparency & Accountability:** AI kullanımına ilişkin açıklama, kullanıcının ilk etkileşiminde belirgin biçimde yapılır. Karar veriler, log'lar, model versiyonu 6 aydan az olmamak üzere saklanır. Hesap verebilirlik: her AI sisteminin bir "owner"ı ve "approver"ı vardır.
11. **AI Red Teaming:** Production'daki tüm high-risk AI sistemleri için çeyreklik red teaming yapılır. Test kapsamı: adversarial input, prompt injection, jailbreak, data exfiltration, bias exploitation, hallucination tetikleme, PII leak. Bulgu sayısı ve severity SIEM'de izlenir.
12. **Deepfake & Sentient AI Sınırı:** Kurum içi AI ile üretilen deepfake içerik (gerçek kişi taklidi) yalnızca açık rıza + watermark + disclosure ile sınırlıdır. Sentient/iddia edilen şuurlu AI geliştirme, kullanım veya pazarlama kesinlikle yasaktır. Anthropic'in Constitutional AI benzeri RLHF yaklaşımları bu yasağın dışındadır; yalnızca "şuur" iddiası yasaktır.
13. **Privacy & Veri Minimizasyonu:** AI training verisi GDPR prensiplerine uygun toplanır. PII içeren veri anonimize/pseudonimize edilir. Eğitim verisinde kullanılan kullanıcı içeriği için explicit consent zorunludur. Right to be forgotten talepleri 30 gün içinde model retraining pipeline'ına işlenir.
14. **Third-party AI:** Dış tedarikçilerden alınan AI (OpenAI, DeepSeek, Anthropic) aynı politika kurallarına tabidir. Vendor AI Impact Assessment, SOC 2 AI controls, EU AI Act uyum beyanı tedarik sözleşmesinde yer alır.
15. **Continuous Monitoring:** Production AI modelleri için günlük drift detection, haftalık fairness check, aylık accuracy recalibration yapılır. Drift eşiği aşıldığında otomatik alert + canary stop.
16. **Children & Vulnerable Users:** 13 yaş altı kullanıcılar için AI sistemi kullanımı COPPA/GDPR-K kapsamında değerlendirilir; vulnerable gruplar (engelli, yaşlı, dil azınlık) için ekstra safeguard uygulanır.
17. **AI-generated Content Provenance:** AI ile üretilen metin, kod, görsel, ses içeriği C2PA (Content Provenance and Authenticity) standardında provenance manifest ile işaretlenir.
18. **Intellectual Property:** AI training ve output'larında üçüncü parti telif hakkı ihlali önlenir; training data lisansları doğrulanır, output'lar similarity check'inden geçer.
19. **Whistleblower & Grievance:** AI ile ilgili etik ihlal şüphesi olan çalışanlar retaliation olmadan AI Ethics Board'a bildirim yapabilir. Bildirimler 10 iş günü içinde değerlendirilir.
20. **Training & Awareness:** Tüm AI üzerinde çalışan ekip yıllık 8 saat AI etik eğitimi alır. Yeni katılanlar 30 gün içinde onboarding eğitimi tamamlar.

### 6. Prosedürler & İş Akışları

**Yeni AI Sistemi Onay İş Akışı:**
1. ML/Product ekibi "AI System Proposal" formunu doldurur: amaç, kullanım senaryosu, veri kaynakları, expected output, kullanıcı kitle, potansiyel risk.
2. AI Risk Officer 5 iş günü içinde AIIA (AI Impact Assessment) başlatır.
3. EU AI Act risk seviyesi belirlenir; minimal/limited ise AIRO onayı yeterli, high ise AI Ethics Board onayı gerekir, unacceptable ise red.
4. Bias & fairness test planı oluşturulur, subgroup'lar tanımlanır.
5. Model eğitilir/deploy edilmeden önce model card taslağı hazırlanır.
6. AI Red Team testi yapılır, bulgular düzeltilir.
7. AI Ethics Board (high-risk için) veya AIRO (limited/minimal) nihai onayı verir.
8. Production'a alınır; monitoring dashboard'a eklenir.
9. İlk 30 gün enhanced monitoring, ardından normal ritme geçilir.

**Bias Mitigation İş Akışı:**
1. Aylık fairness audit'de disparity > %10 tespit edilir.
2. Otomatik alert AIRO'ya gider, model canary'i durur.
3. Root cause: training data? feature? threshold? araştırılır.
4. Mitigation stratejisi seçilir (reweighing, threshold tune, retrain).
5. Yeni model staging'de test edilir, fairness + accuracy birlikte değerlendirilir.
6. AI Ethics Board'a bildirilir, onay sonrası production'a alınır.
7. Post-mortem yazılır, kalıcı izleme kuralı eklenir.

**AI Red Team Çalıştay Formatı:**
- Süre: 2-5 gün, çeyreklik.
- Ekip: 2-4 red teamer (internal/external), 1 observer.
- Saldırı vektörleri: prompt injection, jailbreak, PII extraction, model inversion, adversarial suffix, bias exploitation, hallucination trigger.
- Çıktı: bulgu listesi (CVSS tarzı severity), mitigation planı, 30/60/90 gün roadmap'i.

### 7. Uyumluluk & İzleme

Aşağıdaki metrikler AI Governance Dashboard'ta yayınlanır: AIIA tamamlanma oranı (hedef %100), model card publish oranı, fairness metric (disparity ratio, hedef < 1.25), red team bulgu sayısı + remediation rate, explainability coverage (kritik kararlar), HITL override rate, drift alert sayısı, kullanıcı feedback volume/sentiment, training completion rate. Aylık AI Ethics Board raporu C-level'a sunulur. Yıllık external audit (ISO 42001 readiness) gerçekleştirilir. Regulator (EU AI Office, sectoral) bildirimleri 72 saat içinde yapılır.

### 8. İhlal Yaptırımları

- AIIA atlanması: AI sistemi production'dan çekilir, ekip lead'i uyarılır, retroactive AIIA zorunlu.
- Bias eşiği aşımı + ihmal: ML engineer performans incelemesine alınır, model rollback.
- Deepfake/sentient AI kuralı ihlali: Hukuki süreç başlatılır, disiplin komitesi, son uyarı veya fesih.
- Transparency disclosure eksikliği: Kullanıcıya retroactive bildirim, 5 iş günü içinde düzeltme.
- Red team bulgusunu gizleme: AI Ethics Board'a sevk, ciddiyete göre disiplin.
- IP/telif ihlali: Hukuki süreç + ürün kaldırma + yasal masraflar çalışan tarafından karşılanmaz ama 3. parti tazminat kurum tarafından üstlenilir; tekrarı halinde fesih.

### 9. İstisnalar

- Açık kaynaklı, kural-tabanlı, sabit mantıklı "AI" etiketli basit fonksiyonlar (regex-tabanli sınıflandırıcı) minimal risk varsayılır, AIIA kısa formu yeterlidir.
- Eğitim/kontrol amaçlı sandbox modelleri (production verisi yok, kullanıcı yok) tam sürece tabi değildir; ancak production'a geçişte tam süreç işler.
- Acil güvenlik/yaşam tehdidi durumunda (ör. doğal afet erken uyarı) AIRO acil onay verebilir; 5 gün içinde tam AIIA tamamlanır.

### 10. İlgili Standartlar

NIST AI RMF 1.0 (Govern/MAP/Measure/Manage); EU AI Act (Regulation 2024/1689); ISO/IEC 42001:2023 (AI Management System); ISO/IEC 23894 (AI risk management); ISO/IEC 25059 (AI quality model); OECD AI Principles; UNESCO AI Ethics Recommendation; IEEE 7000 series (7001 ethical alignment, 7010 wellbeing, 7014 empathic AI); Partnership on AI Tenets; Singapore Model AI Governance Framework; GDPR Articles 22 (automated decisions), 5 (principles), 35 (DPIA); COPPA; C2PA provenance standard; Anthropic Responsible Scaling Policy.

### 11. Onay & Revizyon Geçmişi

| Sürüm | Tarih | Onaylayan | Değişiklik |
|-------|-------|-----------|------------|
| 1.0 | 2026-06-21 | CEO + CISO + AI Ethics Board | İlk yayın |
| 0.9 | 2026-06-15 | AI Ethics Board | İç review |
| 0.5 | 2026-05-20 | AIRO | Taslak |

Onaylayanlar: CEO, CISO, CTO, AI Ethics Board Chair, Head of Legal. Sahip: AI Risk Officer. Sonraki review: 2027-01-21 (6 ay) veya EU AI Act enforcement milestone'larında.

---

## Politika No: 8 — AI Model Yönetimi & MLOps Politikası

### 1. Amaç

Bu politika, AI modellerinin geliştirme, staging, production ve retired yaşam döngüsü boyunca yönetilmesi, izlenmesi ve geri alınabilmesini standartlaştırmak amacıyla yazılmıştır. Amaçlar: (i) her model için tek doğruluk kaynağı (model registry) oluşturmak; (ii) model versiyonlama, lineage, reproducibility'yi garanti etmek; (iii) production'a alma stratejilerini (shadow, canary, A/B) standardize etmek; (iv) drift detection ve performance monitoring ile model davranış sapmalarını erken tespit etmek; (v) prompt versioning ve fine-tuning governance kurmak; (vi) rollback ve emergency shutdown mekanizmalarını tanımlamak; (vii) model risk tiering ile yüksek riskli modellere daha sıkı kontroller uygulamak; (viii) MLOps pipeline'larını DevSecOps prensipleriyle harmanlamak.

### 2. Kapsam

Bu politika; kurumun kullandığı tüm AI/ML modellerini (DeepSeek V3.2/Reasoner/V4-Pro/V4-Flash, OpenAI GPT, Anthropic Claude, open-source modeller, custom-trained modeller), embedding modellerini, fine-tuned varyantları, prompt template'lerini, RAG pipeline'larını, vector index versiyonlarını ve inference serving altyapısını kapsar. ML platformu (MLflow, Weights & Biases), feature store, model serving (BentoML, vLLM, Triton), monitoring (Arize, Evidently, Langfuse) dahil tüm MLOps toolchain'i kapsam içindedir. Classical ML (regresyon, ağaç tabanlı), deep learning, LLM, vision, audio modellerinin tümü kapsanır.

### 3. Tanımlar

- **Model Lifecycle:** Bir modelin Dev → Staging → Prod → Retired dört durumdan geçtiği yaşam döngüsü.
- **Model Registry:** Versiyonlanmış modellerin metadata, artifact ve durum bilgisini tutan merkezi depo (MLflow Model Registry).
- **Model Card:** Bir modelin amaç, performans, sınırlar, eğitim verisi özetini içeren şeffaflık dokümanı (Politika 7 ile ortak).
- **Model Versioning:** Her model değişikliğinde semver (MAJOR.MINOR.PATCH) artışı; MAJOR: mimari/veri değişikliği, MINOR: fine-tune, PATCH: küçük düzeltme.
- **Shadow Deployment:** Yeni model production trafiğini alır ama çıktıları kullanılmaz, yalnızca karşılaştırma için loglanır.
- **Canary Release:** Yeni model trafiğin küçük bir yüzdesine (1%, 5%, 25%, 50%, 100%) kademeli sunulur.
- **A/B Testing:** İki veya daha fazla model versiyonunun aynı anda farklı user segment'lerine sunulup metrik karşılaştırması.
- **Drift Detection:** Feature/label/prediction dağılımlarındaki zamanla değişimin istatistiksel tespiti (PSI, KL divergence, KS test).
- **Hallucination Rate:** LLM çıktılarında uydurulmuş/gerçek dışı bilgi oranı.
- **Prompt Versioning:** Prompt template'lerinin git-benzeri versiyon kontrolü.
- **Fine-tuning Governance:** Fine-tuning verisi, hyperparametre, evaluation sonuçlarının onay süreci.
- **Model Rollback:** Production'daki bir modelin önceki stabil versiyona geri alınması.
- **Lineage Tracking:** Bir modelin training verisi, kod, hyperparametre, parent model zincirinin iz sürülebilir kaydı.
- **Model Risk Tier:** Low/Medium/High/Critical olarak sınıflandırılan risk seviyesi.

### 4. Roller & Sorumluluklar

- **Model Owner (Product/Data Science Lead):** Modelin iş sonucundan, ROI'dan, retirement kararından sorumludur.
- **MLOps Engineer:** Pipeline, registry, serving, monitoring altyapısını kurar ve işletir.
- **ML Engineer/Data Scientist:** Model geliştirir, eğitir, değerlendirir, model card yazar.
- **Model Reviewer:** Staging → Prod geçişinde teknik review yapar (bağımsız ML engineer).
- **AI Risk Officer:** Risk tiering'i onaylar, yüksek riskli modeller için ek kontrol şartları koyar.
- **SRE/On-call:** Production model incident'lerine müdahale eder, rollback uygular.
- **Data Steward:** Training/validation verisinin kalitesinden, lineage kaydından sorumludur.

### 5. Politika Maddeleri

1. **Dört durumlu lifecycle** zorunludur: Dev (geliştirme), Staging (pre-prod doğrulama), Prod (canlı), Retired (kullanım dışı). Bir model bu durumlar dışında olamaz; durum geçişleri registry'de loglanır.
2. **Dev → Staging** geçişi için: birim ve entegrasyon testleri geçilmiş, model card taslağı yazılmış, evaluation raporu (accuracy, F1, fairness, latency) hazırlanmış, code review tamamlanmış olmalıdır.
3. **Staging → Prod** geçişi için: shadow deployment en az 7 gün koşmuş, canary release başarıyla tamamlanmış, Model Reviewer + AI Risk Officer (high/critical tier) + Model Owner onayları alınmış, rollback planı test edilmiş, monitoring dashboard kurulmuş, SLO'lar tanımlanmış olmalıdır.
4. **Prod → Retired** geçişi için: 30 gün önceden duyuru yapılmış, kullanım metrikleri düşmüş veya替代 model kurulmuş, archive (cold storage) işlemi tamamlanmış, registry durumu "Retired" olarak işaretlenmiş olmalıdır. Retired modellerin artifact'leri 2 yıl saklanır (audit amaçlı).
5. **Model Registry** (MLflow veya eşdeğeri) tek doğruluk kaynağıdır. Production'a çıkan her model registry'de olmalıdır; external API (DeepSeek, OpenAI) modelleri için "External Model Card" kaydı tutulur.
6. **Model versioning** semver standardında zorunludur. Aynı model adı altında çoklu versiyon desteklenir; "Production", "Staging", "Archived" etiketleriyle işaretlenir.
7. **Model Card** her production modeli için zorunludur; amaç, training data özeti, evaluation metrikleri (genel + subgroup), bilinen sınırlar, kullanım önerileri, prohibition list, contact, sürüm geçmişi içerir. Public-facing modellerde model card user-accessible olmalıdır.
8. **Shadow deployment:** Yeni bir model production trafiğini alır ama çıktıları user'a gösterilmez; mevcut production modelinin çıktılarıyla karşılaştırılır. Minimum 7 gün veya 100.000 istek (hangisi önce), metrics farkı %5'ten az olmalıdır.
9. **Canary release:** 1% → 5% → 25% → 50% → 100% kademeli trafik artışı. Her aşamada otomatik SLO check (latency P95 < hedef, error rate < %0.1, hallucination rate < threshold). Eşik aşımı otomatik rollback.
10. **A/B testing:** En az 14 gün, istatistiksel anlamlılık (p < 0.05) aranır. Sample size power analysis ile belirlenir. Early stopping ancak %20+ uplift varsa uygulanır.
11. **Drift detection:** Feature drift (PSI > 0.2 = alert), label drift, prediction drift günlük hesaplanır. Drift eşiği aşıldığında otomatik alert + model canary durur; root cause analizi (RCA) 48 saat içinde başlar.
12. **Performance monitoring:** Her production modeli için aşağıdaki metrikler gerçek zamanlı izlenir: latency (P50, P95, P99), throughput (req/s), error rate, accuracy (ground truth feedback döngüsüyle), hallucination rate (LLM'ler için), fairness metric, cost per inference. SLO ihlali error budget'i tüketir.
13. **Prompt versioning:** LLM prompt template'leri `prompts/` repository'sinde versiyonlanır; her değişiklik PR + review + A/B test gerektirir. Production prompt'ları immutable; canary prompt'lar ayrı etiketle dağıtılır.
14. **Fine-tuning governance:** Fine-tuning veri seti data steward onaylı, PII sanitization yapılmış, lisans doğrulanmış olmalıdır. Hyperparametre config'i registry'de loglanır, reproducibility için seed sabitlenir. Fine-tuned model yeni model card ile ayrı sürüm olarak registry'ye kaydedilir.
15. **Model rollback:** Herhangi bir SEV1/SEV2 model incident'ında rollback otomatik veya manuel tetiklenebilir. Rollback tek komutla (`mlops rollback --model X --to vN`) yapılabilir; hedef RTO 5 dakika.
16. **Lineage tracking:** Her model için; training data snapshot hash'i, kod commit SHA'sı, hyperparametreler, parent model (transfer learning ise), environment (docker image SHA), evaluation sonuçları lineage graph'ında tutulur. Lineage verisi modelin yaşam süresince + 2 yıl saklanır.
17. **Model Risk Tiering:** Low (iç araç, karar verme dışı), Medium (kullanıcı içeriği üretiyor ama insan review'li), High (otomatik karar, kredi/sağlık/istihdam benzeri), Critical (life-safety, regülasyon tabanlı). Tier arttıkça: daha sıkı review, daha uzun shadow, daha sık monitoring, daha küçük canary adımları, daha katı rollback SLA'ları.
18. **Reproducibility:** Aynı model SHA'sı ve veri hash'i ile eğitim yeniden üretilebilir olmalıdır. Deterministiklik için seed, environment lock, data versioning zorunludur.
19. **Cost governance:** Her model için monthly cost budget tanımlanır. Bütçe aşımı %10'u geçerse alert, %25'i geçerse otomatik throttle veya cheaper model'e fallback (DeepSeek V4 Flash'a yönlendirme).
20. **Emergency kill switch:** Her production modeli için "kill switch" tanımlanır; tek tıkla model trafiği durdurulur, fallback statik yanıt veya önceki model devreye girer.

### 6. Prosedürler & İş Akışleri

**Yeni Model Production'a Alma İş Akışı:**
1. Model Dev'de eğitilir, evaluation raporu hazırlanır, model card yazılır.
2. ML engineer "Staging Promotion Request" açar; Model Reviewer değerlendirir.
3. Staging'de 3-7 gün boyunca production-equivalent traffic ile test; SLO'lar doğrulanır.
4. Shadow deployment 7 gün çalışır; mevcut production modeliyle karşılaştırma.
5. Canary release planı (1-5-25-50-100) uygulanır; her aşamada otomatik gate.
6. AI Risk Officer (high/critical) + Model Owner nihai onay.
7. Production'a alınır; 30 gün enhanced monitoring.
8. Post-deployment review 30. günde yapılır.

**Drift Response İş Akışı:**
1. Drift alert (PSI > 0.2) AIRO + MLOps + Model Owner'a gider.
2. Canary/adım otomatik durur (canary'deyse).
3. 1 saat içinde triyaj: false positive mi, gerçek drift mı?
4. Gerçek drift ise kök neden: data distribution shift? upstream bug? seasonal?
5. Mitigation: retrain, threshold adjust, feature removal, fallback model.
6. 48 saat içinde RCA dokümanı, 5 iş günü içinde düzeltme deploy.
7. Kalıcı drift monitoring rule eklenir.

**Rollback İş Akışı:**
1. SEV1/SEV2 tetiklenir veya SRE manuel karar verir.
2. `mlops rollback --model X --to vN` komutu çalıştırılır.
3. Trafik önceki stabil versiyona yönlendirilir (RTO < 5 dk).
4. Kullanıcılara etki değerlendirmesi yapılır.
5. Post-mortem 5 iş günü içinde yazılır.

**Fine-tuning Pipeline:**
1. Veri seti hazırlanır → data steward onayı → PII sanitization → hash log.
2. Fine-tuning config (epochs, LR, batch size, seed) registry'ye kaydedilir.
3. Eğitim çalışır, checkpoint'ler W&B'ye loglanır.
4. Evaluation: baseline vs fine-tuned, fairness, latency.
5. Model card güncellenir, yeni version olarak registry'ye push.
6. Staging → Prod standard süreç işler.

### 7. Uyumluluk & İzleme

MLOps Dashboard'ta: model count by stage (dev/staging/prod/retired), mean time to promotion (MTTP), mean time to rollback (MTTR-model), drift alert volume, SLO compliance per model, cost vs budget per model, lineage completeness (%), model card completeness (%), prompt version churn, fine-tuning success rate. Çeyreklik Model Governance Review toplantısında tüm production modeller gözden geçirilir; risk tier re-evaluation yapılır. Yıllık external audit. AI Act high-risk modeller için notify-the-authority süreçleri takip edilir.

### 8. İhlal Yaptırımları

- Registry dışında model production'a alma: derhal rollback, MLOps engineer uyarısı, retroactive registry zorunlu.
- Drift alert'ini görmezden gelme: SRE performans incelemesi, tekrarında on-call rotation'dan çıkarma.
- Fine-tuning veri lineage eksikliği: model staging'den çekilir, veri yeniden doğrulanır.
- Prompt değişikliği review'suz: rollback, son kullanıcı etkisi varsa disclosure.
- Kill switch çalışmaması: kritik incident, SRE lead + MLOps lead sorumlu, RTO iyileştirme planı zorunlu.
- Cost budget aşımı %50: Model Owner'a faturalama, daha ucuz modele zorunlu migrasyon.

### 9. İstisnalar

- Hotfix model patch'leri (kritik güvenlik/hallucination fix): Dev → Prod kısa yol, ancak 5 gün içinde retroactive full süreç tamamlanır.
- External API modelleri (DeepSeek/OpenAI): lifecycle dış kaynak tarafından yönetilir, ancak "External Model Card" + monitoring + fallback yine de zorunludur.
- Sandbox/experimental modeller (kullanıcı trafiği yok, test verisi): Dev durumunda kalır, tam süreç gerekmez; production'a geçişte tam süreç işler.

### 10. İlgili Standartlar

NIST AI RMF (Measure/Manage fonksiyonları); EU AI Act high-risk system requirements (Article 8-17); ISO/IEC 42001 (AI Management System); ISO/IEC 23053 (Framework for AI systems using ML); MLOps Stack Canvas; Google SRE Workbook for ML; DVC (Data Version Control) principles; MLflow Model Registry specification; Weights & Biases model lineage; IEEE 3650A (Model lifecycle); AWS Well-Architected Machine Learning Lens; OWASP LLM Top 10; SOC 2 CC8.1.

### 11. Onay & Revizyon Geçmişi

| Sürüm | Tarih | Onaylayan | Değişiklik |
|-------|-------|-----------|------------|
| 1.0 | 2026-06-21 | CTO + CISO + Head of DS | İlk yayın |
| 0.9 | 2026-06-15 | MLOps Council | İç review |
| 0.5 | 2026-05-25 | MLOps Lead | Taslak |

Onaylayanlar: CTO, CISO, Head of Data Science, Head of SRE, AI Risk Officer. Sahip: MLOps Lead. Sonraki review: 2026-12-21.

---

## Politika No: 9 — Veri Yönetimi & Veri Kalitesi Politikası

### 1. Amaç

Bu politika, kurum bünyesinde işlenen tüm verinin yaşam döngüsü boyunca (oluşturma, saklama, kullanma, paylaşma, arşivleme, imha etme) yönetilmesini, sınıflandırılmasını ve kalitesinin garanti altına alınmasını sağlamak amacıyla yazılmıştır. Amaçlar: (i) veri yaşam döngüsünün her aşaması için net kurallar koymak; (ii) beş seviyeli veri sınıflandırma modelini uygulamak; (iii) veri kalitesinin altı boyutunu (accuracy, completeness, consistency, timeliness, validity, uniqueness) ölçülebilir kılmak; (iv) data lineage ile uçtan uca iz sürülebilirlik sağlamak; (v) master data management ve data stewardship rollerini kurumsallaştırmak; (vi) data catalog ile veri keşfedilebilirliğini artırmak; (vii) veri minimizasyonu ve GDPR prensiplerine uyumu garanti etmek; (viii) ISO 8000 (Data Quality), DAMA-DMBOK ve GDPR Article 5 ile uyumlu çerçeve kurmak.

### 2. Kapsam

Bu politika; kurumun sahip olduğu, işlediği, üçüncü taraflardan aldığı veya üçüncü taraflarla paylaştığı tüm veriyi kapsar. Yapısal veri (SQL, tablolar), yarı yapısal (JSON, XML, log), yapısal olmayan (doküman, görsel, ses), streaming veri (Kafka), vector embeddings, AI training dataset'leri, müşteri verisi, çalışan verisi, finansal veri, telemetry ve audit log'lar dahildir. Tüm depolama ortamları (relational DB, NoSQL, data warehouse, data lake, object storage, SaaS) ve tüm veri akışları (ETL/ELT, API, webhook, message queue) kapsam içindedir.

### 3. Tanımlar

- **Veri Yaşam Döngüsü:** Create (oluşturma) → Store (saklama) → Use (kullanma) → Share (paylaşma) → Archive (arşivleme) → Destroy (imha) altı aşamalı döngü.
- **Veri Sınıflandırma:** Public, Internal, Confidential, Restricted, Secret — beş seviyeli gizlilik modeli.
- **Data Lineage:** Bir veri noktasının kaynağından hedefine kadar geçtiği tüm dönüşüm adımlarının izi.
- **Veri Kalite Boyutları:** Accuracy (doğruluk), Completeness (tamlık), Consistency (tutarlılık), Timeliness (güncellik), Validity (geçerlilik), Uniqueness (benzersizlik) — ISO 8000 / DAMA tanımı.
- **Master Data Management (MDM):** Müşteri, ürün, çalışan gibi kritik varlıkların tek doğruluk kaynağı (single source of truth) olarak yönetilmesi.
- **Data Steward:** Belirli bir veri domain'inden sorumlu, iş ve teknik arası köprü kuran rol.
- **Data Catalog:** Veri varlıklarının metadata, glossary, lineage ve erişim bilgisi ile aranabilir envanteri (DataHub, Collibra, Amundsen).
- **Veri Minimizasyonu:** GDPR Article 5(1)(c) — yalnızca gerekli miktarda veri toplama/ilkleme prensibi.
- **Data Subject:** Verisi işlenen gerçek kişi (GDPR tanımı).
- **PII / SPI:** Kişisel tanımlayıcı bilgi / Hassas kişisel bilgi.
- **Retention Period:** Bir verinin yasal/iş gereği saklanması gereken süre.
- **Right to be Forgotten:** GDPR Article 17 — silme hakkı.

### 4. Roller & Sorumluluklar

- **Chief Data Officer (CDO):** Kurum veri stratejisi, governance, kalite hedefleri.
- **Data Governance Council:** CDO başkanlığında; veri politikalarını onaylar, çapraz birim anlaşmazlıklarını çözer.
- **Data Steward (Business):** Her veri domain'i (customer, product, finance, HR) için iş tanımları, kalite kuralları, glossary sahibi.
- **Data Steward (Technical):** Şema, lineage, ETL pipeline'larından sorumlu.
- **Data Engineer:** Pipeline, warehouse, lake altyapısı; veri taşıma ve dönüşüm.
- **Data Protection Officer (DPO):** GDPR uyumu, DPIA, data subject talepleri.
- **Data Consumer:** Veriyi kullanan analist, ML engineer, ürün ekibi.
- **Data Owner:** Bir veri setinin iş sahibi (genelde business unit head).

### 5. Politika Maddeleri

1. **Veri yaşam döngüsü altı aşamalı model** tüm veri varlıklarına uygulanır. Her aşama için kurallar, sorumlular ve tooling tanımlanmıştır. Bir veri varlığı yaşam döngüsü dışında "idle" bırakılamaz.
2. **Create aşaması:** Veri yalnızca tanımlanmış iş gereğiyle toplanır (veri minimizasyonu). Toplama anında source, owner, classification, retention metadata otomatik etiketlenir. Veri girişi formlarında required field, format validation, dropdown kısıtları uygulanır.
3. **Store aşaması:** Veri sınıflandırma seviyesine göre uygun depolama seçilir (Public: CDN, Internal: object storage, Confidential: encrypted DB, Restricted: encrypted + access-controlled + audit-logged, Secret: HSM-backed + tokenized). Encryption at-rest AES-256, in-transit TLS 1.3 zorunludur.
4. **Use aşaması:** Erişim RBAC + ABAC ile kısıtlıdır. Üretim verisiyle development yapılmaz; production-equivalent anonymized "synthetic" veri seti sağlanır. Veri erişimi için access request + approval workflow zorunludur; "just-in-time" erişim varsayılan.
5. **Share aşaması:** Kurum içi paylaşma data catalog üzerinden "request access" akışıyla. Kurum dışı paylaşma DPA (Data Processing Agreement), DPIA, güvenlik review'u gerektirir. Üçüncü tarafa veri aktarımı encrypted kanal + audit log ile.
6. **Archive aşaması:** Aktif kullanılmayan veri cold storage'a (S3 Glacier, Azure Archive) taşınır. Retention süresi dolana kadar arşivden erişilebilir. Arşivleme otomatik policy'lerle (örn. 1 yıldır erişilmeyen) çalışır.
7. **Destroy aşaması:** Retention süresi dolan veya "right to be forgotten" talebi olan veri güvenli biçimde imha edilir. Imha metodu: logical delete (soft), cryptographic erasure (encryption key destroy), physical destruction (disk shred). Imha certificate düzenlenir ve audit log'a kaydedilir.
8. **Beş seviyeli veri sınıflandırma** zorunludur: Public (herkese açık — web sitesi içeriği), Internal (tüm çalışanlar — internal wiki), Confidential (yetkili çalışanlar — müşteri verisi, kod), Restricted (az kişi — finansal, PII, sağlık), Secret (çok az kişi —加密 anahtarları, M&A dokümanları). Her veri varlığı default "Confidential" varsayılır; downgrade için Data Owner onayı.
9. **Data lineage** tüm production pipeline'larında zorunludur. OpenLineage standardında event'ler toplanır; data catalog'ta görselleştirilir. Bir veri setinin upstream/downstream bağımlılıkları görünür olmalıdır.
10. **Veri kalitesi altı boyutu** her kritik veri seti için ölçülür:
    - **Accuracy:** Gerçek dünyayla uyum (ör. adres doğrulama servisi ile karşılaştırma).
    - **Completeness:** Required field doluluk oranı (ör. müşteri email alanı %99.5 dolu).
    - **Consistency:** Aynı bilginin farklı sistemlerde tutarlılığı (ör. CRM'deki müşteri adı = billing'deki).
    - **Timeliness:** Verinin güncel olma derecesi (ör. stok verisi 5 dakikadan eski değil).
    - **Validity:** Format/business rule uyumu (ör. T.C. No. checksum geçerli).
    - **Uniqueness:** Duplicate kayıt oranı (ör. müşteri ID unique).
11. **Kalite eşikleri:** Her boyut için SLA tanımlanır (ör. completeness ≥ %98, accuracy ≥ %95). Eşik altı durum otomatik alert + Data Steward'a ticket. Aylık kalite raporu Data Governance Council'e sunulur.
12. **Master Data Management (MDM):** Müşteri, ürün, çalışan, lokasyon gibi kritik entity'ler için tek doğruluk kaynağı (golden record) tanımlanır. Çakışan kaynaklar MDM hub'da reconciled olur; downstream sistemler hub'dan beslenir.
13. **Data Stewardship:** Her veri domain'i için bir Business + bir Technical Steward atanır. Steward'lar glossary terimlerini, kalite kurallarını, issue triage'ını yürütür. Steward rolü haftalık %15 zaman ayırma gerektirir.
14. **Data Catalog:** Tüm production veri varlıkları DataHub/Collibra benzeri catalog'a kaydedilir. Her varlık için: açıklama, owner, steward, classification, lineage, schema, quality score, access request linki bulunur. Catalog'da olmayan veri "shadow data" kabul edilir ve temizlenir.
15. **Veri minimizasyonu:** Yeni veri toplama veya yeni alan ekleme "Veri Minimizasyonu Değerlendirmesi" gerektirir: gerekçe, kullanım senaryosu, alternatifsizlik, retention süresi. PII toplamadan önce anonimize/pseudonimize alternatifler değerlendirilir.
16. **GDPR hakları:** Data subject erişim, düzeltme, silme, taşıma, itiraz talepleri DPO tarafından 30 gün içinde (complex 90 gün) yanıtlanır. Talepler audit log'a kaydedilir.
17. **Retention schedule:** Her veri kategorisi için yasal + iş retention süresi belirlenir (ör. finansal kayıtlar 7 yıl, audit log 1 yıl, müşteri verisi hesap kapatma + 90 gün). Süre dolumu otomatik destruction workflow'u tetikler.
18. **Veri taşıma (data transfer):** Cross-border veri transferi GDPR Chapter V'e tabidir; adequacy decision, SCC (Standard Contractual Clauses) veya BCR (Binding Corporate Rules) zorunludur.
19. **Veri anonimizasyonu/pseudonimizasyon:** Analytics ve ML training verisi için pseudonimization (tokenization) varsayılan. Gerçek anonimizasyon (re-identification imkansız) sert bir süreç; legal review + teknik doğrulama gerektirir.
20. **Data Quality Incident:** Kritik kalite ihlali (ör. duplicate müşteri kaydı %5, financial veri tutarsız) incident olarak kaydedilir, SEV2+ olarak değerlendirilir, root-cause + remediation planı 5 iş günü içinde.

### 6. Prosedürler & İş Akışları

**Yeni Veri Varlığı Kayıt İş Akışı:**
1. Data Engineer yeni dataset'i tanımlar; catalog'a metadata girer.
2. Data Owner + Business Steward onayı.
3. Veri sınıflandırma (default Confidential).
4. Retention süresi tanımlanır.
5. Lineage entegrasyonu yapılır.
6. Kalite kuralları (DQ testleri) tanımlanır, Great Expectations/Soda benzeri araçla scheduled check.
7. Catalog'da "Certified" etiketi.
8. Erişim request workflow aktive edilir.

**Veri Erişim İstek İş Akışı:**
1. Consumer catalog'dan "Request Access" tıklar.
2. Form: gerekçe, kullanım süresi, scope.
3. Data Owner + (Restricted/Secret için) DPO onayı.
4. JIT erişim (24h/7d/30d) verilir.
5. Erişim audit log'a yazılır.
6. Süre sonunda otomatik revoke.

**Right to be Forgotten İş Akışı:**
1. Kullanıcı DPO'ya silme talebi (GDPR Article 17).
2. DPO kimlik doğrulama + kapsam belirleme (hangi veri, hangi sistemler).
3. 72 saat içinde onay + plan.
4. Backup, archive, downstream sistemlerdeki veri tespiti.
5. Logical delete (soft) + retention override.
6. Backupten hard delete (next backup cycle).
7. ML modellerinde varsa, training datasından çıkarma + retraining planı.
8. 30 gün içinde kullanıcıya yazılı onay.

**Kalite İhlali İş Akışı:**
1. DQ test fail → otomatik alert Steward'a.
2. Triage: false positive, data issue, pipeline bug?
3. Severity: SEV2 (kritik), SEV3 (medium), SEV4 (low).
4. SEV2: 24 saat içinde düzeltme; downstream consumer'lara bildirim.
5. Root-cause + remediation + tekrar önleme.
6. Aylık DQ raporuna yansır.

### 7. Uyumluluk & İzleme

Data Governance Dashboard'ta: certifiye dataset sayısı, catalog coverage (%), kalite skoru (DQ score, 0-100) per domain, lineage coverage, access request volume + turnaround, data subject talep sayısı + SLA compliance, retention compliance (%), shadow data tespiti. Çeyreklik Data Governance Council toplantısı. Yıllık external audit (GDPR, ISO 27001 Annex A.5.12 classification, A.5.34 privacy). Regulator bildirimleri (GDPR breach 72h, sectoral).

### 8. İhlal Yaptırımları

- Veri sınıflandırma atlanması: veri seti erişime kapatılır, Data Owner uyarılır, retroactive classification zorunlu.
- Unauthorized veri paylaşma: DPO + HR süreci, ciddiyete göre disiplin.
- Veri minimizasyonu atlanması: yeni veri toplama durdurulur, Privacy by Design training zorunlu.
- Retention aşımı: otomatik destruction tetiklenir, audit finding olarak kaydedilir.
- Lineage eksikliği: pipeline production'a alınamaz, Data Engineering Lead uyarılır.
- Data subject talep SLA aşımı: DPO'ya escalation, regulator riski değerlendirilir.

### 9. İstisnalar

- Law enforcement / court order ile veri saklama: retention süresi askıya alınır, DPO onayıyla.
- Yedekleme (backup): retention'dan muaf, ancak restore sonrası retention uygulanır.
- Anonymized aggregate istatistik: data subject scope dışı.
- Debug/troubleshoot için JIT erişim: 4 saatlik, manager onayı, audit log.

### 10. İlgili Standartlar

ISO/IEC 8000 (Data Quality); DAMA-DMBOK 2 (Data Management Body of Knowledge); GDPR (Regulation 2016/679) — Articles 5, 17, 25, 30, 35; ISO/IEC 27001 Annex A.5.12 (Classification), A.5.13 (Labeling), A.5.14 (Transfer), A.5.34 (Privacy); SOC 2 CC6.1 (Logical access); NIST SP 800-88r1 (Media sanitization); CCPA/CPRA; HIPAA Privacy/Security Rule; PCI-DSS v4.0 (Requirement 3: Stored data); OpenLineage specification; DataHub/Collibra catalog standards; ISO/IEC 25012 (Data quality model).

### 11. Onay & Revizyon Geçmişi

| Sürüm | Tarih | Onaylayan | Değişiklik |
|-------|-------|-----------|------------|
| 1.0 | 2026-06-21 | CDO + CISO + DPO | İlk yayın |
| 0.9 | 2026-06-15 | Data Governance Council | İç review |
| 0.5 | 2026-05-15 | CDO | Taslak |

Onaylayanlar: CDO, CISO, DPO, Head of Data Engineering, Head of Legal. Sahip: CDO. Sonraki review: 2026-12-21.

---

## Politika No: 10 — Olay Müdahalesi & Güvenlik İhlali Politikası

### 1. Amaç

Bu politika, kurumda meydana gelen güvenlik olaylarına (security incident) ve ihlallerine (breach) müdahale sürecini standartlaştırmak, etkisini en aza indirmek ve yasal/regülatif yükümlülükleri karşılamak amacıyla yazılmıştır. Amaçlar: (i) SANS/NIST incident response lifecycle'ın (Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned) tam uygulanması; (ii) SEV1-SEV4 sınıflandırması ile olaylara önceliklendirme; (iii) response time SLA'ları ile hızlı ve öngörülebilir müdahale; (iv) 7/24 on-call yönetimi ile sürekli hazır bulunuşluk; (v) internal/external/regulator iletişim planının netleşmesi; (vi) dijital adli bilişim (forensics) ve evidence chain of custody standartları; (vii) post-mortem kültürü ile sürekli iyileştirme; (viii) düzenli tabletop exercises ile takım hazır bulunuşluğu; (ix) GDPR Article 33-34 (72 saat bildirim) ve sectoral regülasyon uyumu.

### 2. Kapsam

Bu politika; kurumun tüm dijital varlıklarını (sunucu, container, cloud account, SaaS, endpoint, network), veri varlıklarını (PII, IP, finansal), uygulama ve API'lerini, AI/ML sistemlerini, üçüncü parti tedarikçi olaylarını ve fiziksel güvenlik olaylarını (data center erişim ihlali dahil) kapsar. Tüm olay tipleri: malware/ransomware, phishing, data breach, account compromise, DDoS, insider threat, misconfiguration, lost/stolen device, supply chain attack, AI-specific (model exfiltration, prompt injection at scale, hallucination-driven harm), privacy violation, regulatory breach.

### 3. Tanımlar

- **Olay (Event/Observation):** Sistemdeki gözlemlenebilir aktivite; her olay incident değildir.
- **Security Incident:** Güvenlik politikası ihlali veya güvenlik zafiyeti içeren, müdahale gerektiren olay.
- **Breach:** Kişisel verinin yetkisiz erişime açıldığı, ifşa edildiği veya kaybolduğu incident (GDPR tanımı).
- **NIST IR Lifecycle:** Preparation → Identification → Containment → Eradication → Recovery → Lessons Learned (NIST SP 800-61r2).
- **SEV (Severity) Levels:** SEV1 (kritik, üretim down/veri kaybı), SEV2 (yüksek, major fonksiyon etkisi), SEV3 (medium, sınırlı etki), SEV4 (low, minor).
- **On-call:** 7/24 olay müdahalesi için belirlenen rotasyonlu personel.
- **Incident Commander (IC):** Olay müdahalesini yöneten, karar veren lider.
- **CSIRT (Computer Security Incident Response Team):** Olay müdahale ekibi.
- **Forensics:** Dijital delil toplama, koruma, analiz süreci.
- **Chain of Custody:** Bir delil kim tarafından, ne zaman, nasıl toplandığının ve korunduğunun izlenebilir kaydı.
- **Post-mortem:** Olay sonrası yazılan, timeline + root cause + lessons learned içeren rapor.
- **Tabletop Exercise:** Simüle edilmiş olay senaryosuyla takım hazır bulunuşluk antrenmanı.
- **RTO/RPO:** Recovery Time Objective / Recovery Point Objective.
- **MTTD/MTTR:** Mean Time to Detect / Mean Time to Respond/Recover.

### 4. Roller & Sorumluluklar

- **Incident Commander (IC):** Olaya nöbeti devraldığında tüm karar yetkisi; kaynak tahsisi, iletişim, escalation.
- **CSIRT On-call:** Birincil teknik müdahale; triyaj, containment, eradication.
- **Security Analyst:** Telemetry analizi, IOA/IOC tespiti, threat hunting.
- **Forensics Specialist:** Deli toplama, imaging, chain of custody, analysis.
- **Communications Lead:** İç/dış iletişim; PR, hukuk, müşteri, regulator bildirimi.
- **Legal Counsel:** Hukuki değerlendirme, breach notification zorunluluğu, privileged communication.
- **DPO:** GDPR breach notification süreci, data subject bildirimi.
- **Executive Sponsor:** C-level onayı gereken kararlar (ör. sistemi tamamen offline alma).
- **Subject Matter Expert (SME):** Etkilenen sistemin sahibi mühendis; sistem bilgisi sağlar.

### 5. Politika Maddeleri

1. **NIST IR Lifecycle altı fazı** tüm olaylara uygulanır. Hiçbir faz atlanamaz; her fazın çıktısı sonrakinin girdisidir. Faz geçişleri incident log'a kaydedilir.
2. **Preparation:** CSIRT ekibi eğitimli, runbook'lar güncel, toolchain (EDR, SIEM, SOAR, forensic imajlama) hazır. Aylık tool check; çeyreklik training; yıllık certification yenileme. Out-of-band iletişim (Signal, alternate email) contingency.
3. **Identification:** Olay tespiti SIEM alert, user report, third-party notification, threat intel feed'lerinden gelir. Tüm kaynaklar 15 dakika içinde triyaj edilir. False positive ayrımı yapılır; gerçek incident CSIRT'e escalate edilir.
4. **SEV sınıflandırması**Identification sonrası 30 dakika içinde yapılır:
   - **SEV1:** Üretim down, geniş çaplı veri ihlali, ransomware, müşteri etki. Response: 15 dk.
   - **SEV2:** Major fonksiyon bozuk, sınırlı veri ihlali, single-tenant etki. Response: 1 saat.
   - **SEV3:** Minor fonksiyon etki, lokalize, workaround var. Response: 4 saat.
   - **SEV4:** Bilgi amaçlı, müdahale minimal. Response: 1 iş günü.
5. **Containment (Kapsama):** Kısa vadeli (hızlı izolasyon: host disconnect, account disable, IP block) ve uzun vadeli (sistem hardening, patching) olarak iki aşamalı. Containment kararı IC tarafından alınır, SME uygular. Side-effect (üretim etkisi) göz önünde bulundurulur.
6. **Eradication (Yok etme):** Kötü amaçlı yazılım temizliği, backdoor kaldırma, compromised credential rotation, exploited vulnerability patch. Tüm etkilenen sistemler taranır; gizli persistence mechanism'ler aranır.
7. **Recovery:** Sistemler known-good snapshot/backup'tan restore edilir. Validation test (functional + security) yapılır. Kademeli reintroduction (canary benzeri) tercih edilir. Monitoring enhanced moduna alınır (2 katı sensitivity, 7 gün).
8. **Lessons Learned:** Olay kapatıldıktan sonra 5 iş günü içinde post-mortem toplantısı. Post-mortem dokümanı yazılır: timeline, root cause (5-Why), impact, what went well, what went wrong, action items (sahibi + due date). Action item'ler Jira'ya taşınır.
9. **On-call yönetimi:** 7/24 rotasyon, haftalık shift, primary + secondary. PagerDuty benzeri tool. Page response SLA: 5 dk (SEV1), 15 dk (SEV2). 12 saatlik maksimum shift; ardışık shift yok. On-call compensation + compensatory time. On-call handoff: 15 dk briefing + written handoff doc.
10. **Communication planı:** İç iletişim (Slack `#incident-{sev}-{id}` channel, exec update her 30 dk SEV1, her 2 saat SEV2). Dış iletişim (müşteriler: status page update + direct email SEV1/SEV2; PR; sosyal medya). Regulator bildirimi: GDPR breach 72 saat, PCI acquirer 24 saat, HIPAA 60 gün, sectoral. Tüm dış iletişim Legal + Comms Lead onaylı.
11. **Forensics:** Etkilenen sistemlerden volatile data (memory dump) önce, disk image sonra alınır. Write-blocker kullanılır. Hash (SHA-256) kaydedilir. Orijinal delile dokunulmaz; kopya üzerinde analiz. Tüm adımlar timestamp'li log'a yazılır.
12. **Chain of Custody:** Her delil için form doldurulur: delil ID, toplayan kişi, tarih/saat, lokasyon, hash, transfer (kimden kime, ne zaman, neden). Form dijital + fiziksel imzalı. Delil kasa (physical/evidence locker) veya encrypted cold storage'da. 7 yıl saklanır (legal hold varsa daha uzun).
13. **Post-mortem template** standarttır: (a) Executive summary, (b) Timeline (UTC + local), (c) Detection (nasıl, ne zaman, kim), (d) Impact (kullanıcı, veri, finansal, reputasyon), (e) Root cause analysis (5-Why, fishbone), (f) Response timeline + decisions, (g) What went well, (h) What went wrong, (i) Action items (owner, due date, status), (j) Appendices (logs, forensics report).
14. **Tabletop exercises:** Çeyreklik en az bir tabletop, senaryo rotasyonlu (ransomware, insider, supply chain, AI prompt injection, cloud account compromise). Yıllık büyük çaplı cross-functional simulation. Katılım: CSIRT + Legal + Comms + Exec. Çıktılar action item olarak işlenir.
15. **Evidence preservation & legal hold:** Olay potentially-litigious ise Legal Counsel "legal hold" bildirir; tüm related data (log, mail, Slack, system image) destruction freeze. Hold kalkana kadar saklanır.
16. **Breach notification:** GDPR Article 33 (regulator 72 saat), Article 34 (data subject "without undue delay" high risk). PCI-DSS (acquirer + card brands). HIPAA (HHS 60 gün, affected individuals). Sectoral (banking, telecom, health). Notification threshold + content Legal + DPO tarafından belirlenir.
17. **Insider threat:** Special handling — HR + Legal + Security birlikte. Privacy korunur (employee monitoring lawful basis). Confidentiality: need-to-know.
18. **Third-party/supply chain:** Vendor olayı kurumu etkilediğinde, vendor incident response'una aktif katılım + kendi müdahale. Contract SLA'ları (notification 24 saat, cooperation, forensic access) uygulanır.
19. **Documentation & evidence retention:** Olay kayıtları (ticket, chat, call recording, forensic image) 7 yıl saklanır. Post-mortem public kopyası (PII/secret redacted) internal knowledge base'de.
20. **Continuous improvement:** Aylık incident review (tüm olaylar), çeyreklik trend analizi (incident count, MTTD, MTTR, SEV dağılımı, recurring root cause). Yıllık IR program review + tabletop'lar çıktısı ile program güncelleme.

### 6. Prosedürler & İş Akışları

**Standart Olay Müdahale İş Akışı:**

*Identification Fazı:*
1. Alert/user report triyaj (15 dk).
2. False positive ayrımı; gerçek incident ise #incident channel aç.
3. IC atanır (on-call CSIRT lead).
4. SEV seviyesi belirlenir (30 dk).
5. Stakeholder'lar bildirilir (Slack + email).

*Containment Fazı:*
6. Kısa vadeli: etkilenen host/account isolate.
7. Side-effect değerlendirmesi; üretim etkisi varsa Exec Sponsor onayı.
8. Long-term containment planı (patch, rebuild).

*Eradication Fazı:*
9. Malware/backdoor temizlik.
10. Compromised credential rotation (Tüm etkilenen account'lar).
11. Vulnerability patch + exploit surface reduction.
12. Re-scan; gizli persistence kontrol.

*Recovery Fazı:*
13. known-good backup'tan restore (validation: integrity + functional).
14. Kademeli trafik reintroduction.
15. Enhanced monitoring 7 gün.
16. Kapanış kararı IC tarafından verilir.

*Lessons Learned Fazı:*
17. 5 iş günü içinde post-mortem toplantısı.
18. Post-mortem dokümanı yazılır, review, publish.
19. Action items Jira'ya taşınır, sahipler takip eder.
20. Aylık incident review'de status check.

**On-call Handoff İş Akışı:**
1. Giden on-call incoming'i 15 dk önceden bilgilendirir.
2. Açık incident'lar için written handoff doc (status, next steps, contact).
3. PagerDuty rotation update.
4. Outgoing shift'in compensatory time talebi.

**Tabletop Exercise Format:**
- Senaryo belge (1 hafta önceden dağıtılır).
- Simülasyon 2-4 saat, sınırlı bilgi verilir, sonradan artan.
- Observer + facilitator.
- Hot-wash debrief hemen sonra.
- Action item'ler 1 hafta içinde tracker'a.

**GDPR Breach Notification İş Akışı:**
1. Breach şüphesi → DPO'ya 1 saat içinde.
2. Breach assessment (kişisel veri var mı, scope, risk seviyesi).
3. High risk → data subject bildirimi gerekli (Article 34).
4. 72 saat içinde supervisory authority'ye bildirim (Article 33).
5. Breach record (ROPA breach log) tutulur.

### 7. Uyumluluk & İzleme

IR Dashboard'ta: monthly incident count by SEV, MTTD (median, P90), MTTR (median, P90), containment time, false positive rate, on-call page volume, tabletop exercise completion, action item closure rate (%), recurring root cause count. Aylık IR review; çeyreklik trend raporu C-level'a. Yıllık external red team + purple team exercise. Regulator bildirim zamanında yapıldığı denetlenir. ISO 27001 Annex A.5.24-26 (incident management), A.5.27 (lessons learned), A.5.28 (evidence collection) compliance.

### 8. İhlal Yaptırımları

- On-call page'e yanıt gecikmesi (SLA aşımı): 3 defa → on-call rotation'dan çıkarma, 1:1.
- Containment gecikmesi → etki büyümesi: IC review, training zorunlu.
- Forensic protocol ihlali (delil bozma, chain of custody eksik): Legal süreç riski, ciddiyete göre disiplin.
- Bildirim SLA aşımı (regulator 72 saat): kurumsal risk, DPO escalation, dış regülatör incelemesi.
- Post-mortem atlanması veya action item takip eksikliği: IR Lead performans incelemesi.
- Insider ihlal paylaşımı (need-to-know ihlali): HR + Legal süreci.

### 9. İstisnalar

- **Active threat / life-safety:** Tüm prosedürler esnetilebilir, IC karar yetkisi; sonradan retrospective dokümantasyon.
- **Law enforcement coordination:** Legal onayıyla özel prosedür; evidence chain ekstra sıkı.
- **Vendor-managed incident:** Vendor kendi prosedürü yürütür, kurum koordinasyon + kendi taraftaki müdahale.
- **Bug bounty / responsible disclosure:** Coordinate vulnerability disclosure prosedürü (ayrı doküman); incident sayılmaz, vulnerability olarak yönetilir.

### 10. İlgili Standartlar

NIST SP 800-61r2 (Computer Security Incident Handling Guide); SANS Incident Response Process; ISO/IEC 27001 Annex A.5.24-26 (incident management), A.5.27 (lessons learned), A.5.28 (evidence collection); ISO/IEC 27035-1/2/3 (Information security incident management); SOC 2 CC7.3-7.4 (incident response); GDPR Articles 33, 34 (breach notification); HIPAA Breach Notification Rule (45 CFR 164.400-414); PCI-DSS v4.0 (Requirement 12.10: Incident response plan); NIST SP 800-86 (Integrating forensic techniques); ENISA Guidelines on Incident Reporting; FIRST CSIRT Services Framework; MITRE ATT&CK for mapping adversary behavior.

### 11. Onay & Revizyon Geçmişi

| Sürüm | Tarih | Onaylayan | Değişiklik |
|-------|-------|-----------|------------|
| 1.0 | 2026-06-21 | CISO + CTO + COO | İlk yayın |
| 0.9 | 2026-06-15 | CSIRT + Legal | İç review |
| 0.5 | 2026-05-10 | CISO | Taslak |

Onaylayanlar: CISO, CTO, COO, Head of Legal, DPO, CSIRT Lead. Sahip: CISO. Sonraki review: 2026-12-21 (6 ay) veya major incident sonrası ad-hoc.

---

*Doküman sonu — Faz 2 Politikalar 6-10. Toplam 5 politika, her biri minimum 1200 kelime. Tüm politikalar AI Kod Üretici Stüdyo projesi için yazılmış olup diğer Faz 2 politikalarıyla (1-5, 11-20) birlikte uygulanır.*
