# Kurumsal Politika Seti — Faz 1 (Politikalar 1–5)

**Sürüm:** 1.0
**Yayın Tarihi:** 2026-06-21
**Sahip:** Bilgi Güvenliği & Risk Komitesi
**Sınıflandırma:** İç — Kurumsal
**Uygulama Kapsamı:** Tüm birimler, tüm çalışanlar, yükleniciler, tedarikçiler ve iş ortakları

Bu doküman, kurum genelinde yürütülen bilgi teknolojileri, yazılım geliştirme, veri işleme ve güvenlik operasyonlarını standartlaştırmak amacıyla hazırlanmış Faz 1 politika setidir. Aşağıdaki beş politika birbirini tamamlayıcı niteliktedir ve birlikte ISO/IEC 27001:2022 BGYS (Bilgi Güvenliği Yönetim Sistemi) çatısının çekirdeğini oluşturur:

1. Bilgi Güvenliği Politikası (ISO/IEC 27001)
2. Veri Gizliliği & KVKK/GDPR Politikası
3. Erişim Kontrol Politikası (RBAC + ABAC)
4. Şifreleme & Anahtar Yönetimi Politikası
5. Yazılım Geliştirme Yaşam Döngüsü (SDLC) Politikası

Her politika 11 standart bölümden oluşur: Amaç, Kapsam, Tanımlar, Roller & Sorumluluklar, Politika Maddeleri, Prosedürler & İş Akışları, Uyumluluk & İzleme, İhlal Yaptırımları, İstisnalar, İlgili Standartlar ve Onay & Revizyon Geçmişi. Politika maddeleri en az 15 madde içerecek şekilde detaylandırılmış ve her madde için uygulanabilir alt kurallar belirtilmiştir.

---

## Politika No: 1 — Bilgi Güvenliği Politikası (ISO/IEC 27001)

### 1. Amaç

Bu politikanın temel amacı, kuruma ait tüm bilgi varlıklarının gizliliği (Confidentiality), bütünlüğü (Integrity) ve erişilebilirliği (Availability) — kısa adıyla CIA üçlüsü — üzerinde sürekli ve denetlenebilir bir güvence sağlamaktır. Kurum, ISO/IEC 27001:2022 standardı çerçevesinde bir Bilgi Güvenliği Yönetim Sistemi (BGYS / ISMS) kurmakta ve bu sistemi Deming döngüsü (Plan-Do-Check-Act) yaklaşımıyla sürekli iyileştirmektedir. Politika; bilgi güvenliği risklerini sistematik biçimde tanımlamak, değerlendirmek ve kabul edilebilir bir seviyeye indirmek, ayrıca tüm çalışanların, tedarikçilerin ve iş ortaklarının bilgi güvenliği sorumluluklarını netleştirmek için hazırlanmıştır. Politika aynı zamanda yönetim tarafından bilgilerin yetkisiz erişim, ifşa, değiştirme, imha veya kesintiye uğramasına karşı korunması gerektiği yönündeki taahhüdün yazılı ifadesidir.

### 2. Kapsam

Bu politika, kurumun sahip olduğu, kontrol ettiği veya işlediği tüm bilgi varlıklarını — dijital, fiziksel, sözlü veya yazılı — kapsar. Kapsam; tüm departmanları, iştirakleri, yurt içi ve yurt dışı ofisleri, uzaktan çalışan personeli, geçici atamalı yöneticileri, stajyerleri, sözleşmeli danışmanları, tedarikçileri ve kurum adına işlem yapan üçüncü tarafları kapsar. Bilgi işlem altyapısı (sunucular, ağ cihazları, son kullanıcı cihazları, mobil cihazlar), bulut hizmetleri, SaaS uygulamaları, fiziksel arşivler, yazılı belgeler, ses ve görüntü kayıtları ile sözlü iletişimler politikaya tabidir. Kurumun müşterilerine sunduğu ürün ve hizmetlerin bilgi güvenliği boyutları da bu politikanın kapsamındadır.

### 3. Tanımlar

- **BGYS (ISMS):** Bilgi Güvenliği Yönetim Sistemi; ISO/IEC 27001 standardına dayalı, risk temelli, sürekli iyileştirme yaklaşımıyla yönetilen sistem.
- **CIA Üçlüsü:** Gizlilik, Bütünlük, Erişilebilirlik — bilgi güvenliğinin üç temel hedefi.
- **Varlık (Asset):** Kuruma değer katan ve korunması gereken her türlü bilgi, donanım, yazılım, hizmet, insan veya tesis.
- **Risk:** Bir tehdidin bir zafiyetten yararlanarak bir varlığa zarar verme olasılığı ile bu zararın etkisinin bileşimi.
- **Annex A:** ISO/IEC 27001:2022 standardının Ek A'sında listelenen 93 bilgi güvenliği kontrolü (93 kontroller 4 tema altında organize edilmiştir: Organizasyonel, İnsan, Fiziksel, Teknolojik).
- **SoA (Statement of Applicability):** Uygulanabilirlik Beyanı — hangi Annex A kontrollerinin uygulandığı, uygulanmadığı ve gerekçelerinin yer aldığı resmi doküman.
- **ISMS Kapsam Beyanı:** BGYS'nin sınırlarını, içerdiği birimleri ve dışlanan kısımları tanımlayan doküman.
- **CISO:** Baş Bilgi Güvenliği Sorumlusu (Chief Information Security Officer).
- **Güvenlik Olayı (Security Event):** Bir sistem veya ağda gözlemlenen ve güvenlik açısından anlamlı herhangi bir durum.
- **Güvenlik İhlali (Security Incident):** Gerçekten zarara yol açan veya açma potansiyeli taşıyan güvenlik olayı.

### 4. Roller & Sorumluluklar

- **Üst Yönetim (Board / CEO):** Bilgi güvenliği politikasını onaylar, kaynak tahsis eder, risk iştahını belirler ve politikanın etkinliğini yıllık olarak gözden geçirir. ISO 27001 Clause 5 (Leadership) gereği liderlik taahhüdünü gösterir.
- **Bilgi Güvenliği & Risk Komitesi:** BGYS'nin stratejik yönünü belirler, risk değerlendirme sonuçlarını gözden geçirir, önemli kararları alır ve üst yönetime raporlar. Aylık toplanır.
- **CISO:** BGYS'nin günlük işletilmesinden sorumludur. Risk değerlendirme süreçlerini koordine eder, kontrollerin etkinliğini izler, güvenlik olaylarını yönetir ve iç/dış denetimlere hazırlık yapar.
- **Bilgi Varlığı Sahibi (Asset Owner):** Her bilgi varlığı için atanmış sahiptir. Varlığın sınıflandırılması, erişim yetkilendirilmesi ve korunmasından sorumludur.
- **IT Departmanı:** Teknik kontrollerin (firewall, EDR, yedekleme, kimlik doğrulama sistemleri vb.) uygulanması, yapılandırılması ve işletilmesinden sorumludur.
- **İnsan Kaynakları:** İşe alım süreçlerinde güvenlik taraması yapar, gizlilik sözleşmelerini imzalatır, ayrılan personelin erişimlerini kapatır ve güvenlik bilinci eğitimlerini koordine eder.
- **Tüm Çalışanlar:** Bu politikaya uymakla, güvenlik olaylarını bildirmekle ve kendilerine atanan varlıkları korumakla yükümlüdür.
- **İç Denetim:** BGYS'nin bağımsız denetimini yıllık olarak gerçekleştirir ve iyileştirme önerileri sunar.

### 5. Politika Maddeleri

5.1 **Üst Yönetim Taahhüdü:** Üst yönetim, bilgi güvenliği yönetim sisteminin kurulması, uygulanması, sürdürülmesi ve sürekli iyileştirilmesi için gerekli tüm kaynakları tahsis eder. Bilgi güvenliği hedefleri, kurumsal strateji ile uyumlu olacak şekilde yıllık olarak belirlenir ve yönetim gözden geçirme toplantılarında değerlendirilir.

5.2 **BGYS Kapsamı:** BGYS'nin kapsamı, kurumun tüm birimlerini, kritik iş süreçlerini ve destekleyici BT altyapısını kapsayacak şekilde "ISMS Kapsam Beyanı" dokümanında resmi olarak tanımlanır. Kapsam değişiklikleri yalnızca Bilgi Güvenliği & Risk Komitesi onayı ile yapılır.

5.3 **Risk Değerlendirme Yaklaşımı:** Kurum, ISO 27005 standardına dayalı risk değerlendirme metodolojisi uygular. Riskler; varlık değerinin, tehdit olasılığının ve zafiyet derecesinin kombinasyonu olarak hesaplanır. Risk değerlendirmesi yılda en az bir kez ve major değişikliklerde (yeni sistem devreye alma, organizasyonel değişiklik, büyük olay sonrası) yeniden yapılır.

5.4 **Risk Tedavi Planı:** Belirlenen her risk için dört tedavi seçeneğinden biri seçilir: riski azaltmak (mitigate), riski transfer etmek (transfer — örn. sigorta), riski kabul etmek (accept) veya riskten kaçınmak (avoid). Risk tedavi planı (RTP) CISO tarafından izlenir ve aylık raporlanır.

5.5 **Uygulanabilirlik Beyanı (SoA):** Annex A'daki 93 kontrolün her biri için uygulanıp uygulanmadığı, uygulanıyorsa nasıl uygulandığı ve uygulanmıyorsa gerekçesi SoA dokümanında yer alır. SoA yıllık olarak güncellenir ve dış denetimin temel girdisidir.

5.6 **Bilgi Varlık Envanteri:** Tüm bilgi varlıkları (donanım, yazılım, veri, hizmet, personel, tesis) merkezi bir CMDB'de envanteri alınır. Her varlığın bir sahibi, sınıflandırması ve kritiklik seviyesi tanımlanır. Envanter季度 olarak doğrulanır ve "sahipsiz varlık" bırakılmaz.

5.7 **Bilgi Sınıflandırma Şeması:** Bilgiler dört seviyede sınıflandırılır: Halka Açık, İç, Gizli, Çok Gizli. Her sınıf için işleme, saklama, aktarım ve imha kuralları ayrı bir prosedürde tanımlanır. Tüm belgeler varsayılan olarak "İç" sınıfında kabul edilir ve yükseltme gerekçelendirilir.

5.8 **Güvenlik Bilinci Eğitimi:** Tüm çalışanlar işe başladıklarında ilk 30 gün içinde bilgi güvenliği farkındalık eğitimi alır ve yılda en az bir kez tekrar eğitime tabi tutulur. Eğitim içeriği; phishing, sosyal mühendislik, parola güvenliği, veri sınıflandırma, olay bildirme, fiziksel güvenlik ve Kabul Edilebilir Kullanım Politikası konularını kapsar. Eğitim completion oranları %95 hedefinin altına düşemez.

5.9 **Phishing Simülasyonları:** Kurum, çalışanları düzenli olarak phishing simülasyonlarına tabi tutar (aylık veya çeyreklik). Tekrarlayan başarısızlık performans yönetimi sürecine girer. Yüksek riskli gruplar için hedeflenmiş eğitim verilir.

5.10 **Fiziksel Güvenlik:** Veri merkezleri, sunucu odaları ve kritik tesislere erişim badge + PIN/biyometrik iki faktörlü kontrol ile sınırlanır. Ziyaretçi erişimi kayıt altına alınır ve escort zorunludur. Çalışma alanları tailgating önleyici turnike veya guard ile korunur.

5.11 **Ağ Güvenliği:** Ağ; DMZ, üretim, ofis ve misafir ağlarına segmente edilir. Üretim ağına erişim jump host üzerinden yapılır. Tüm trafiği izlemek için SIEM ve NDR (Network Detection & Response) çözümleri kullanılır. Egress filtering ve DNS filtreleme uygulanır.

5.12 **Uç Nokta Koruması:** Tüm son kullanıcı cihazlarına EDR (Endpoint Detection & Response) yüklenir. Cihazlar disk şifrelemeli (AES-256), otomatik ekran kilidi (5 dk) ve root/jailbreak tespiti ile yönetilir. Kişisel cihazlarla çalışma (BYOD) yalnızca MDM enrollment koşuluyla kabul edilir.

5.13 **Güvenlik Olay Yönetimi:** Güvenlik olayları 24/7 SOC (Security Operations Center) tarafından izlenir. Olaylar SEV-1 (kritik) ila SEV-4 (düşük) arasında sınıflandırılır. SEV-1 olaylar için RTO (Recovery Time Objective) 4 saat, RPO (Recovery Point Objective) 15 dakikadır. Olay yönetim süreci ITIL Incident Management ile entegredir.

5.14 **İş Sürekliliği & Felaket Kurtarma:** Kritik sistemler için BCP (Business Continuity Plan) ve DRP (Disaster Recovery Plan) dokümante edilmiştir. Yıllık DR tatbikatı yapılır, RTO/RPO hedefleri ölçülür ve sapmalar düzeltici eylemlerle giderilir. Yedeklemeler 3-2-1 kuralına (3 kopya, 2 farklı ortam, 1 off-site) uygun yapılır.

5.15 **Tedarikçi Güvenliği:** Tedarikçilerle yapılan sözleşmelerde bilgi güvenliği maddeleri (gizlilik, ihlal bildirimi, denetim hakkı, alt yüklenici kısıtlamaları) yer alır. Yüksek riskli tedarikçiler yıllık güvenlik değerlendirmesine (örn. SIG, CAIQ) tabi tutulur. Bulut hizmet sağlayıcıları için SOC 2 Type II raporu veya ISO 27001 sertifikası zorunludur.

5.16 **Kriptografi:** Şifreleme ve anahtar yönetimi, ayrı "Şifreleme & Anahtar Yönetimi Politikası" (Politika No: 4) ile düzenlenir. Bu politika, kriptografik kontrollerin ISMS içindeki yerini belirler.

5.17 **Sürekli İyileştirme:** BGYS, PDCA döngüsüyle sürekli iyileştirilir. İç denetim bulguları, olay post-mortem analizleri, KPI sapmaları ve dış denetim bulguları düzeltici ve önleyici eylem (CAPA) sürecine girer.

5.18 **İletişim & Şeffaflık:** Politikanın bir kopyası tüm çalışanların erişimine açık intranette yayımlanır. Önemli güncellemeler e-posta ve haber bülteni ile duyurulur. Müşteriler ve regülatörler, talep etmesi halinde politikanın yürürlükte olduğuna dair yazılı teyit alır.

### 6. Prosedürler & İş Akışları

- **Risk Değerlendirme Prosedürü (PR-ISMS-01):** Varlık tespiti → tehdit analizi → zafiyet analizi → risk skoru hesaplama → tedavi kararı → RTP oluşturma → izleme. Yıllık döngü + tetiklenen revizyonlar.
- **SoA Güncelleme Prosedürü (PR-ISMS-02):** Risk değerlendirme sonuçlarına dayalı kontrol seçimi → komite onayı → SoA güncellemesi → doküman kontrol.
- **Güvenlik Olay Müdahale Prosedürü (PR-ISMS-03):** Tespit → triyaj → containment → eradication → recovery → lessons learned. IR planı yıllık güncellenir.
- **Güvenlik Bilinci Eğitimi Prosedürü (PR-ISMS-04):** LMS entegrasyonu → onboarding eğitimi → yıllık tekrar → phishing simülasyonu → raporlama.
- **Tedarikçi Güvenlik Değerlendirme Prosedürü (PR-ISMS-05):** Tedarikçi risk skoru → anket dağıtımı → rapor incelemesi → sözleşme maddeleri → yıllık izleme.
- **Yönetim Gözden Geçirme Prosedürü (PR-ISMS-06):** Girdi toplanması (iç denetim, KPI, olaylar, risk durumu) → toplantı → kararlar → aksiyon izleme.

### 7. Uyumluluk & İzleme

BGYS'nin etkinliği aşağıdaki KPI'larla izlenir: kritik güvenlik olay sayısı (aylık, hedef 0), ortalama tespit süresi MTTD (hedef <15 dk), ortalama müdahale süresi MTTR (hedef <60 dk), phishing simülasyonu tıklama oranı (hedef <%5), güvenlik eğitimi tamamlama oranı (hedef %95+), açık vulnerability sayısı (kritik <5, yüksek <25), yedekleme başarı oranı (hedef %100), iç denetim bulguları (kritik 0). Bu metrikler aylık ISMS dashboard'ında gösterilir ve üç ayda bir yönetim gözden geçirme toplantısında sunulur. ISO 27001 dış denetimi yıllık yapılır; sertifika geçerlilik süresi 3 yıldır ve 12 aylık surveillance denetimlerle sürdürülür.

### 8. İhlal Yaptırımları

Politika ihlalleri; kasıt, etki ve tekrar derecesine göre sınıflandırılır. Bilerek veri ifşası, izinsiz sistem erişimi, güvenlik kontrollerini bypass etme gibi ağır ihlaller derhal disiplin sürecine (yazılı uyarı → geçici uzaklaştırma → iş sözleşmesinin feshi) konu olur ve gerektiğinde yasal yollara başvurulur. Hafif ihlaller (örn. ekran kilidi unutma) coaching ve ek eğitimle sonuçlanır. Tüm ihlaller kayıt altına alınır ve HR+IT güvenlik tarafından ortak değerlendirilir. CISO, olayın niteliğine göre yönetim kurulunu bilgilendirmekle yükümlüdür. Tedarikçi ihlalleri sözleşmesel yaptırımlara (para cezası, sözleşme feshi, tazminat) yol açar.

### 9. İstisnalar

Politika istisnaları, yalnızca iş gerekçesi ile BCR (Business Case & Risk) formu doldurularak talep edilebilir. İstisna talebi; varlık sahibi, IT ve CISO tarafından risk değerlendirmesine tabi tutulur,补偿 kontrol (compensating control) tanımlanır ve Bilgi Güvenliği & Risk Komitesi tarafından onaylanır. Tüm istisnalar maksimum 12 ay süreyle geçerlidir ve sonunda ya kapatılır ya da yeniden değerlendirilir. İstisna kayıt defteri (exception register) CISO tarafından tutulur ve iç/dış denetime sunulur. Acil durum istisnaları (örn. üretim kesintisi çözümü için geçici erişim) CISO tarafından sonradan onaylanmak üzere verilebilir, ancak 72 saat içinde resmi süreç tamamlanmalıdır.

### 10. İlgili Standartlar

- ISO/IEC 27001:2022 — Bilgi Güvenliği Yönetim Sistemi gereksinimleri
- ISO/IEC 27002:2022 — Bilgi güvenliği kontrolleri için rehber
- ISO/IEC 27005 — Bilgi güvenliği risk yönetimi
- ISO 22301 — İş sürekliliği yönetim sistemi
- NIST Cybersecurity Framework 2.0
- CIS Critical Security Controls v8
- SOC 2 Trust Services Criteria (Security kategorisi)
- ISO/IEC 27017 (bulut güvenliği) ve ISO/IEC 27018 (bulutta kişisel veri koruma)

### 11. Onay & Revizyon Geçmişi

| Sürüm | Tarih | Hazırlayan | Onaylayan | Değişiklik |
|-------|-------|------------|-----------|------------|
| 1.0 | 2026-06-21 | CISO Ofisi | CEO & Bilgi Güvenliği Komitesi | İlk yayın |

**Sonraki gözden geçirme:** 2027-06-21 (yıllık) veya major değişiklik halinde daha erken.

---

## Politika No: 2 — Veri Gizliliği & KVKK/GDPR Politikası

### 1. Amaç

Bu politika, kurumun işlediği tüm kişisel verilerin korunması, kişilerin gizlilik haklarının güvence altına alınması ve KVKK (6698 Sayılı Kişisel Verilerin Korunması Kanunu) ile GDPR (EU 2016/679) başta olmak üzere yürürlükteki tüm veri koruma mevzuatına uyumun sağlanması amacıyla hazırlanmıştır. Politika, "data protection by design and by default" ilkesini kurum kültürüne yerleştirmeyi, veri ihlallerinin önlenmesini ve meydana geldiğinde hızlı bildirim yapılmasını, ayrıca veri sorumlusu (controller) ve veri işleyen (processor) rollerinin net biçimde ayrılmasını hedefler. Kurum, gizliliği temel bir insan hakkı olarak kabul eder ve bu yaklaşımı ürün tasarımından çalışan eğitimine kadar tüm süreçlere yansıtır.

### 2. Kapsam

Politika; kurumun veri sorumlusu veya veri işleyen sıfatıyla işlediği tüm kişisel verileri kapsar. Bu veriler; çalışan kişisel verileri, müşteri/aday kişisel verileri, ziyaretçi verileri, çerezlerle toplanan veriler, CCTV kayıtları, biyometrik veriler, sağlık verileri (özel nitelikli kişisel veriler) ve gözlemlenen davranışsal verileri içerir. Coğrafi kapsam; Türkiye, Avrupa Ekonomik Alanı (EEA), İngiltere ve kurumun faaliyet gösterdiği diğer yargı bölgelerini kapsar. Kapsam ayrıca tedarikçiler, alt işleyenler ve cloud sağlayıcıları aracılığıyla işlenen verileri de kapsar. Anonimleştirilmiş veriler bu politikanın kapsamı dışındadır; ancak anonimleştirme süreci Politika No: 4 ile entegre şekilde yürütülür.

### 3. Tanımlar

- **Kişisel Veri:** Kimliği belirli veya belirlenebilir gerçek kişiye ilişkin her türlü bilgi.
- **Özel Nitelikli Kişisel Veri:** Ir, etnik köken, siyasi düşünce, felsefi inanç, din, mezhep veya diğer inançlar, kılık kıyafet, dernek vakıf üyeliği, sağlık, cinsel hayat, ceza mahkumiyeti, güvenlik tedbiri verileri ile biyometrik ve genetik veriler.
- **Veri Sorumlusu (Controller):** Veri işleme amaçlarını ve yöntemlerini belirleyen kurum.
- **Veri İşleyen (Processor):** Veri sorumlusu adına veri işleyen kişi veya kurum.
- **ROPA (Records of Processing Activities):** Veri işleme faaliyetleri kaydı — GDPR Madde 30 gereği tutulan envanter.
- **DPIA (Data Protection Impact Assessment):** Veri koruma etki değerlendirmesi — yüksek riskli işleme faaliyetleri için zorunlu.
- **DPO (Data Protection Officer):** Veri koruma yetkilisi — bağımsız gözetim rolü.
- **Veri İhlali (Personal Data Breach):** Kişisel verilerin yetkisiz erişime, ifşaya, değiştirilmesine veya imhasına uğraması.
- **Psödönmizasyon:** Verilerin, ek bilgiler olmadan belirli bir veri sahibine ilişkilendirilemeyecek şekilde işlenmesi (ancak bu ek bilgiler ayrı tutularak yeniden ilişkilendirme mümkündür).
- **Anonimleştirme:** Verinin bir daha kimseyle ilişkilendirilemeyecek şekilde değiştirilmesi; bu durumda veri artık "kişisel veri" statüsünden çıkar.
- **Açık Rıza (Consent):** Veri sahibinin kendi iradesiyle, bilgilendirilmiş olarak ve belirli bir amaç için verdiği rıza.

### 4. Roller & Sorumluluklar

- **Üst Yönetim:** Veri koruma kültürünü kurar, kaynak tahsis eder, düzenleyici ile ilişkileri yürütür.
- **DPO:** GDPR Madde 37-39 kapsamında bağımsız görev yapar. ROPA'yı tutar, DPIA süreçlerini yönetir, çalışan eğitimlerini verir, KVKK Kurulu ve DPAs (Data Protection Authorities) ile tek iletişim noktasıdır, ihlalleri değerlendirir.
- **Veri Sahibi (Data Owner):** Her veri kategorisi için atanmış iş sahibi; işleme amaçlarını tanımlar, saklama sürelerini belirler, erişim yetkilerini onaylar.
- **IT Güvenlik:** Teknik güvenlik önlemlerini uygular (şifreleme, erişim kontrolü, loglama, DLP), ihlal tespiti yapar.
- **Hukuk Departmanı:** Sözleşme maddelerini (DPA — Data Processing Agreement) hazırlar, regülatif bildirimlerde DPO'ya destek verir.
- **İK:** Çalışan verilerini işler, gizlilik sözleşmelerini imzalatır, ayrılan çalışan verilerini arşivler/imha eder.
- **Pazarlama:** Çerez yönetimi, rıza yönetimi, abonelik iptal süreçlerini yürütür.
- **Tüm Çalışanlar:** KVKK/GDPR sorumluluklarını bilir, verileri minimum düzeyde işler, ihlalleri 1 saat içinde DPO'ya bildirir.

### 5. Politika Maddeleri

5.1 **GDPR 7 Temel İlkenin Uygulanması:** Kurum, GDPR Madde 5'te yer alan yedi ilkeye uyar: (i) Yasallık, adalet ve şeffaflık — veriler yasal dayanakla, adil ve veri sahibine şeffaf biçimde işlenir; (ii) Amaç sınırlılığı — yalnızca belirli, açık ve meşru amaçlar için; (iii) Veri minimizasyonu — amaç için gerekli olanla sınırlı; (iv) Doğruluk — yanlış veriler düzeltilir; (v) Saklama sınırlılığı — gereksinim süresince muhafaza edilir; (vi) Bütünlük ve gizlilik — uygun güvenlik ile korunur; (vii) Hesap verebilirlik — kurum uyumu gösterebilir.

5.2 **İşleme Meşruiyet Dayanakları:** Her veri işleme faaliyeti için KVKK Madde 5/6 veya GDPR Madde 6'da sayılan dayanaklardan en az birine dayanır: açık rıza, sözleşmenin ifası, yasal yükümlülük, meşru menfaat, hayati korunma, kamu görevi, özel nitelikli veriler için açık rıza (sağlık verileri için ayrıca sağlık gizliliği kuralları). Meşru menfaat dayanağı kullanılıyorsa LIA (Legitimate Interests Assessment) yapılır.

5.3 **Veri Sahibi Hakları (Data Subject Rights):** Aşağıdaki sekiz hak güvence altına alınmıştır: (1) bilgilendirilme, (2) erişim, (3) düzeltme, (4) silme ("unutulma hakkı"), (5) işlemenin sınırlandırılması, (6) veri portabilitesi, (7) itiraz etme, (8) otomatik karar almaya itiraz. Talepler 30 gün içinde (KVKK 30 gün, GDPR 1 ay) ücretsiz olarak karşılanır; karmaşık taleplerde süre +2 ay uzatılabilir ve veri sahibine yazılı gerekçe bildirilir.

5.4 **ROPA Tutulması:** GDPR Madde 30 gereği tüm veri işleme faaliyetleri kayıt altına alınır. ROPA; işleme amaçları, veri kategorileri, veri sahipleri, alıcılar, yurtdışı aktarımlar, saklama süreleri ve güvenlik önlemlerini içerir. ROPA yıllık olarak gözden geçirilir ve her yeni işleme faaliyeti eklenmeden önce güncellenir.

5.5 **DPIA Zorunluluğu:** Aşağıdaki yüksek riskli durumlarda DPIA yapılması zorunludur: (a) büyük ölçekli özel nitelikli veri işleme, (b) sistematik ve kapsamlı otomatik profil oluşturma, (c) büyük ölçekli kamu alanı gözlemi (CCTV vb.), (d) yeni teknolojiler kullanılması. DPIA; risk tanımlama, etkilerin değerlendirilmesi ve risk azaltma önlemlerini içerir. Yüksek riskin giderilemediği durumlarda KVKK Kurulu/DPA ile önceden istişare zorunludur.

5.6 **Açık Rıza Yönetimi:** Açık rıza; serbest, belirli, bilgilendirilmiş ve unambiguous olmalıdır. Aydınlatma metni açık ve sade dille yazılır. Rıza her zaman geri alınabilmeli ve geri alma, verme kadar kolay olmalıdır. Çocuklar (16 yaş altı) için veli onayı zorunludur. Rızalar consent management platformunda (CMP) kayıt altında tutulur ve denetime hazırdır.

5.7 **Çerez Yönetimi:** Web sitesinde kullanılan tüm çerezler envanteri çıkarılmış ve kategorize edilmiştir (kesinlikle gerekli, fonksiyonel, analitik, pazarlama). Ziyaretçilere ilk ziyarette çerez banner'ı gösterilir; yalnızca kesinlikle gerekli çerezler varsayılan olarak açıktır, diğerleri için opt-in zorunludur. Çerez tercihleri 12 ay sonra yenilenir. Banner, TCF 2.2 ve ePrivacy Directive ile uyumludur.

5.8 **Veri İhlali Bildirimi:** Veri ihlali tespit edildiğinde, DPO 1 saat içinde bilgilendirilir. Kişisel veri güvenliğini tehdit eden ihlaller; KVKK Madde 12 gereği "en kısa sürede" ilgili kişilere ve KVKK Kurulu'na, GDPR Madde 33-34 gereği yetkili denetleyici makama 72 saat içinde, ayrıca yüksek riskliyse ilgili kişilere "gecikmeksizin" bildirilir. Bildirilmeme kararı gerekçelendirilmeli ve kayıt altına alınmalıdır. İhlal kayıt defteri (breach register) zorunludur ve denetimlere hazırdır.

5.9 **Veri Saklama Süreleri:** Her veri kategorisi için yasal ve iş gereksinimlerine dayalı saklama süresi belirlenir (saklama ve imha politikası). Süre dolduğunda veriler otomatik olarak anonimleştirilir veya güvenli biçimde imha edilir. Çalışan verileri 10 yıl (mecburien SGK vergi mevzuatı), müşteri sözleşme verileri sözleşme + 7 yıl, pazarlama verileri rıza geri çekilene kadar, CCTV kayıtları 30 gün (suç delili ise adliyeye teslim edilir) saklanır.

5.10 **Psödönmizasyon & Anonimleştirme:** Mümkün olduğu her durumda veriler psödönimize edilir (örn. kullanıcı yerine user_id). Üçüncü taraflara aktarımarda doğrudan tanımlayıcılar yerine token kullanılır. Anonimleştirme için k-anonymity (k≥5), l-diversity ve t-closeness teknikleri uygulanır. Anonimleştirme işleminin geri alınamaz olduğu "motivated intruder testi" ile doğrulanır.

5.11 **Uluslararası Veri Aktarımı:** Yurtdışına kişisel veri aktarımı yalnızca yeterli koruma sağlayan ülkelere (KVKK uygun ilan edilen veya GDPR adequacy kararı olan), uygun güvencelerle (SCC — Standard Contractual Clauses, BCR — Binding Corporate Rules) veya açık rıza/şirket içi aktarım istisnalarıyla yapılır. Aktarımdan önce TIA (Transfer Impact Assessment) yapılır. Bulut sağlayıcılarının veri merkezleri tercih sırasında EEA/Türkiye içinde olacak şekilde seçilir.

5.12 **Tedarikçi & Veri İşleyen Yönetimi:** Her veri işleyen ile Veri İşleme Sözleşmesi (DPA) imzalanır; sözleşmede amaç sınırlılığı, gizlilik, güvenlik önlemleri, alt işleyen onayı, denetim hakkı, ihlal bildirimi, dönüşüm/return/erasure yükümlülükleri yer alır. Yüksek riskli işleyenler yıllık denetime tabi tutulur.

5.13 **Çalışan İzleme & İşçilik Hakları:** Çalışan izleme (e-posta, web, CCTV) yalnızca meşru amaçla, orantılı ve şeffaf biçimde yapılır. İzleme önceden duyurulur, toplanan veriler minimum düzeyde tutulur. Üye devletlerin işçilik mevzuatı (örn. Fransa CNIL, Almanya BDSG) gözetilir.

5.14 **Otomatik Karar Alma & Profil Oluşturma:** Yalnızca açık rıza veya yasal yükümlülük ile ve sözleşmesel gerekçelerle otomatik karar alma yapılabilir. Karar sonucu hakkında veri sahibine bilgi verilir ve itiraz hakkı tanınır. AI tabanlı kararlar için ek olarak "AI Sistemleri Politika ve Etik Dokümanı" uygulanır.

5.15 **Veri Koruma By Design & By Default:** Yeni ürün/hizmet tasarımında gizlilik varsayılan olur. Minimum veri toplanir, maksimum koruma uygulanır. Privacy design review her sprint'te yapılır. Yeni başlayan her proje için "gizlilik taraması" (privacy scan) zorunludur.

5.16 **Gizlilik Eğitimi:** Tüm çalışanlar yıllık veri koruma eğitimi alır; hassas veri işleyenler (HR, IT, pazarlama, müşteri hizmetleri) ek modüller alır. Eğitim içeriği; rıza yönetimi, ihlal bildirimi, veri sahibi talepleri, sosyal mühendislik, phishing konularını kapsar.

5.17 **Kayıt & Denetlenebilirlik:** Tüm veri işleme kararları, rıza kayıtları, ihlal bildirimleri ve veri sahibi talepleri kayıt altına alınır. Kayıtlar 5 yıl saklanır. DPO iç denetimleri yılda bir kez yapar ve sonuçları yönetime sunar.

### 6. Prosedürler & İş Akışları

- **Veri Sahibi Talep Yönetimi (PR-PRIV-01):** Talep alımı (web formu/e-posta) → kimlik doğrulama → talep sınıflandırması → veri toplama (30 gün) → yanıt hazırlama → yanıt gönderme + kayıt.
- **Veri İhlali Müdahale Prosedürü (PR-PRIV-02):** Tespit (1 saat içinde DPO) → containment → etki değerlendirmesi → 72 saat içinde regülatöre bildirim kararı → etkilenen kişilere bildirim → düzeltici eylem → breach register'a kayıt.
- **DPIA Prosedürü (PR-PRIV-03):** Tetikleyici kontrol (yeni proje screening) → DPIA ekibi kurulması → risk tanımlama → mitigasyon planı → DPO görüşü → karar → izleme.
- **Çerez Yönetimi Prosedürü (PR-PRIV-04):** Çerez envanteri → kategorizasyon → banner konfigürasyonu → tercih kayıt → 12 ayda bir yenileme → log saklama.
- **Tedarikçi DPA Prosedürü (PR-PRIV-05):** Tedarikçi risk skoru → DPA şablon gönderimi → hukuk görüşü → imza → izleme (yıllık denetim).
- **Rıza Yönetimi Prosedürü (PR-PRIV-06):** Aydınlatma metni hazırlama → CMP'ye kayıt → rıza toplama → geri çekme → silme/imha.

### 7. Uyumluluk & İzleme

Aşağıdaki KPI'lar aylık olarak izlenir: veri sahibi taleplerine ortalama yanıt süresi (hedef <15 gün), zamanında kapatılan talep oranı (hedef %100), 72 saat içinde bildirilen ihlal oranı (hedef %100), DPIA tamamlanma oranı yeni projelerde (hedef %100), rıza kaybı oranı (yıllık baseline'a göre), çerez opt-in oranı, çalışan eğitimi tamamlama oranı (hedef %95+), tedarikçi DPA imza oranı (hedef %100). DPO üç ayda bir yönetim raporu sunar; yıllık dış denetim (SOC 2 veya GDPR gap assessment) gerçekleştirilir. KVKK'ya uyum için "VERBİS" kaydı yıllık güncellenir.

### 8. İhlal Yaptırımları

Politika ihlalleri; yetkisiz veri paylaşımı, gereksiz veri toplama, rıza alınmadan pazarlama, ihlali zamanında bildirmeme, DPIA yapılmadan yüksek riskli işlem başlatma gibi durumları kapsar. Çalışanlar için disiplin süreci (yazılı uyarı → fesih) uygulanır; kasıtlı veri ifşası derhal fesih ve yasal süreçle sonuçlanır. Kurumsal olarak regülatör tarafından GDPR Madde 83 kapsamında yıllık global cironun %4'üne veya 20 milyon €'a kadar (hangisi yüksekse), KVKK Madde 18 kapsamında 5 milyon TL'ye kadar idari para cezası uygulanabilir. Üst yönetim doğrudan sorumludur.

### 9. İstisnalar

İstisnalar; ulusal güvenlik, adli soruşturma, ifade özgürlüğü (Gazetecilik), akademik araştırma, kişisel kullanım istisnaları için mevzuatta tanımlanmıştır. Bu istisnaların kullanımı DPO ve Hukuk tarafından onaylanmalı, gerekçesi yazılı olarak kaydedilmelidir. İş gerekçesi ile istisna talepleri (örn. veri saklama süresini uzatma) Bilgi Güvenliği & Risk Komitesi tarafından değerlendirilir. İstisna kayıtları 5 yıl saklanır.

### 10. İlgili Standartlar

- GDPR (EU 2016/679) — Avrupa Genel Veri Koruma Yönetmeliği
- KVKK (6698 Sayılı Kanun) — Türkiye Kişisel Verilerin Korunması Kanunu
- ePrivacy Directive 2002/58/EC — Çerez ve elektronik iletişim
- ISO/IEC 27701:2019 — Privacy Information Management System (PIMS)
- ISO/IEC 27018:2019 — Bulutta kişisel veri koruma
- TCF 2.2 — IAB Transparency and Consent Framework
- CCPA/CPRA — California Consumer Privacy Act
- LYD (KVKK Veri Sahibi Hakları) Yönetmeliği
- Düzenleyici kararlar: Schrems II, EU-US Data Privacy Framework

### 11. Onay & Revizyon Geçmişi

| Sürüm | Tarih | Hazırlayan | Onaylayan | Değişiklik |
|-------|-------|------------|-----------|------------|
| 1.0 | 2026-06-21 | DPO Ofisi | CEO & Hukuk Direktörü | İlk yayın |

**Sonraki gözden geçirme:** 2027-06-21 veya mevzuat değişikliğinde daha erken.

---

## Politika No: 3 — Erişim Kontrol Politikası (RBAC + ABAC)

### 1. Amaç

Bu politika, kurumdaki tüm bilgi sistemlerine, uygulamalarına, verilerine ve fiziksel varlıklarına erişimin "en az ayrıcalık" (Least Privilege) ve "ihtiyaç temelli" (Need-to-Know) prensiplerine dayalı olarak yönetilmesini sağlamak amacıyla hazırlanmıştır. Erişim kararlarının hem rol bazlı (RBAC — Role-Based Access Control) hem de öznitelik bazlı (ABAC — Attribute-Based Access Control) mantıkla verilmesi, böylece statik ve dinamik bağlamın birlikte değerlendirilmesi hedeflenir. Politika; yetkisiz erişimi önlemek, insider tehditleri azaltmak, denetlenebilirliği artırmak ve düzenleyici uyumluluğu (SOX, SOC 2, ISO 27001 A.5.15-A.5.18, PCI-DSS Req 7-8) sağlamak için tasarlanmıştır. Temel felsefe: erişim bir hak değil, geçici ve izlenen bir yetkidir.

### 2. Kapsam

Politika; kurumun sahip olduğu veya kullandığı tüm dijital ve fiziksel sistemlerdeki erişimi kapsar. Dijital kapsam; işletim sistemleri (Linux, Windows), bulut platformları (AWS, Azure, GCP), SaaS uygulamaları, veritabanları, kod depoları (GitHub, GitLab), CI/CD sistemleri, ağ cihazları, EDR/SIEM konsolları ve İD yönetimi sistemlerini kapsar. Fiziksel kapsam; veri merkezi, sunucu odası, kritik ofis alanları ve cabinet erişimlerini içerir. Kullanıcı kapsamı; tüm çalışanlar, yükleniciler, stajyerler, tedarikçi kullanıcıları, service account'lar, API key'leri ve machine identity'leri. Politika ayrıca müşteri ve partnerlerin kurum sistemlerine (self-servis portallar) erişimini de kapsar.

### 3. Tanımlar

- **RBAC (Role-Based Access Control):** Kullanıcıların rol tanımlarına göre yetkilendirildiği model; rol-permission mapping merkezidir.
- **ABAC (Attribute-Based Access Control):** Kullanıcı, kaynak, ortam ve işlem özniteliklerine dayalı politikalarla dinamik yetkilendirme (örn. "yüksek riskli işlem yalnızca IP whitelist + iş saatleri + MFA ile").
- **Least Privilege:** Kullanıcının yalnızca görevini yapması için gereken en düşük yetkiyi alması prensibi.
- **Need-to-Know:** Bilgiye erişimin yalnızca görev gereği gerekli olduğu durumlarla sınırlı olması.
- **SoD (Segregation of Duties):** Kritik işlemlerin tek bir kişi tarafından uçtan uca yapılamayacak şekilde ayrılması (örn. geliştiren dağıtmaz, onaylayan işleyen değildir).
- **MFA (Multi-Factor Authentication):** İki veya daha fazla farklı faktörle (something you know, have, are) kimlik doğrulama.
- **PAM (Privileged Account Management):** Yönetici hesapları için özel korunmuş kasa (vault), oturum kaydı, JIT erişim sağlayan sistem.
- **JIT (Just-in-Time) Access:** Yönetici yetkilerin yalnızca ihtiyaç anında, sınırlı süreyle verilmesi.
- **SSO (Single Sign-On):** Tek kimlik doğrulama ile birden çok sisteme erişim.
- **SCIM (System for Cross-domain Identity Management):** Identity provisioning otomasyon standardı.
- **Service Account:** İnsan olmayan, hizmetler arası kimlik.

### 4. Roller & Sorumluluklar

- **Identity & Access Management (IAM) Ekibi:** Rol kütüphanesini tasarlar, erişim politikalarını uygular, SSO/MFA altyapısını işletir, erişim doğrulama (access review) süreçlerini yürütür.
- **CISO:** Erişim kontrol stratejisini onaylar, PAM ve ABAC politikalarının etkinliğini izler, kritik istisnaları değerlendirir.
- **Uygulama & Veri Sahibi (Application/Data Owner):** Uygulama için yetki matrisini tanımlar, RBAC rollerini onaylar, erişim taleplerini ikinci onayçı olarak değerlendirir.
- **Yönetici (Manager):** Ekibinin erişim taleplerini onaylar, ayrılan/yer değiştiren personel için revizyon talep eder, erişim gözden geçirmelerinde onay verir.
- **IT Servis Masası:** Standart erişim taleplerini uygular, parola sıfırlama yapar (MFA ile doğrulama sonrası).
- **İç Denetim:** SoD ihlallerini, erişim anomalilerini ve quarterly access review'leri denetler.
- **Tüm Kullanıcılar:** Kendi hesaplarını korur, parolalarını paylaşmaz, şüpheli aktiviteyi bildirir, ayrıcalıklı erişim süresi dolunca otomatik iadeyi sağlar.

### 5. Politika Maddeleri

5.1 **En Az Ayrıcalık Prensibi:** Tüm kullanıcılar, service account'lar ve machine identity'ler için yalnızca görevini yerine getirmesi için gereken minimum yetki atanır. Varsayılan yetki "yok"tur (default deny). Yetki artırımı, gerekçe ve süre belirtilerek talep edilir.

5.2 **Need-to-Know Prensibi:** Bilgi sınıflandırması (Politika No: 1, Madde 5.7) ile entegre çalışır. Aynı role sahip iki kullanıcı farklı projelerde çalışıyorsa, yalnızca kendi projesinin verisine erişebilir. Project-based access group'lar ile izolasyon sağlanır.

5.3 **RBAC Modeli:** Kurum, role tanımlarını merkezi role kütüphanesinde tutar. Her rol; işlevi, içerdiği izinler ve atama kuralları ile tanımlanır. Roller hiyerarşik olabilir (senior rol junior rolün yetkilerini miras alır) ancak SoD ihlali oluşturacak miras yasaktır. Rol sayısı makul tutulur (kurum geneli <200 rol), "rol patlaması" önlenir.

5.4 **ABAC Politikaları:** Statik rol yetmez; dinamik bağlam ile birlikte değerlendirilir. Örnek ABAC kuralları: (a) "PROD veritabanına yazma yalnızca iş saatleri içinde, şirket IP'sinden, MFA doğrulanmış, onaylanmış değişiklik bileti ile"; (b) "özel nitelikli veriye erişim yalnızca PCI-DSS eğitimi tamamlamış, background check'i temiz kullanıcı için"; (c) "production deployment yalnızca approver onayından sonra, belirli CI/CD pipeline'ından". ABAC motoru (OPA, Cedar, AWS IAM Conditions) tarafından runtime'da değerlendirilir.

5.5 **MFA Zorunluluğu:** Tüm sistemlere (VPN, SaaS, SSH, RDP, admin console, production DB) erişim için MFA zorunludur. Tercihen phishing-resistant MFA (FIDO2/WebAuthn, YubiKey, Windows Hello for Business) kullanılır; SMS-OTP yalnızca yedek yöntem olarak kabul edilir ve yüksek riskli sistemlerde yasaktır. MFA bypass veya exception yalnızca CISO onayıyla geçici olarak verilebilir.

5.6 **Parola Politikası (NIST 800-63B):** Parola uzunluğu minimum 14 karakter (yönetici hesaplar 16+); karmaşıklık zorunluluğu kaldırılmıştır ancak length-based entropy yeterlidir. Parola geçmişi son 24 parola tutulur, tekrar yasaktır. Otomatik parola sıfırlama yearly veya compromise durumunda. Breach'ten etkilenmiş parolalar (HaveIBeenPwned API) yasaktır. Rate limiting (5 deneme sonra lockout 15 dk) ve MFA combine edilir. Passkey / passwordless authentication tüm SSO destekli sistemlerde varsayılan yöntemdir.

5.7 **Privileged Account Management (PAM):** Tüm yönetici hesapları (root, domain admin, cloud root, DBA, k8s cluster-admin) PAM vault'unda korunur. Yönetici parolaları never shared, rotating (session sonrası otomatik rotation), ve per-session çekilir. Privileged session recording (keystroke + video) zorunludur, kayıtlar 90 gün saklanır. PAM ayrıcalıklarına erişim yalnızca onaylı ticket ile verilir.

5.8 **Just-in-Time (JIT) Erişim:** Sürekli ayrıcalık yoktur. Production erişimi, DBA yetkisi, cloud admin rolü; yalnızca talep anında, belirli süre (maksimum 4 saat) için, onaylı onay zinciri ile verilir. Süre sonunda otomatik revoke edilir. JIT erişim her 6 ayda bir periodic review'dan geçer.

5.9 **Segregation of Duties (SoD):** Kritik işlemler için görev ayrımı uygulanır. Örnek kurallar: (a) kod yazan deploy edemez; (b) Satınalma siparişi oluşturan onaylayamaz; (c) kullanıcı oluşturan erişim yetkilendirmesi yapamaz; (d) üretim verisi değiştiren audit log'u silemez. SoD matrisi IAM sisteminde tanımlanır ve conflict detection yeni atamada otomatik çalışır.

5.10 **Onboarding & Provisioning:** Yeni çalışanlar SCIM ile otomatik olarak rol bazlı provisioning edilir. Manager onayı + HR kaydı tamamlandıktan sonra 4 saat içinde standart erişimler açılır. "Standing access" önlenir; olabildiğince group-based otomatik üyelik kullanılır. JIT erişimler onboarding'de verilmez, ihtiyaç anında talep edilir.

5.11 **Offboarding & De-provisioning:** Çalışan ayrıldığında HR bildirimiyle tüm erişimler 1 saat içinde kapatılır (hesap disable + cihaz wipe + session revoke). 7 gün sonra hesap tamamen silinir, verileri sahibine transfer edilir.Önemli: PAM erişimleri, SSO session'ları, API key'leri, SSH key'leri, VPN certificate'ları hepsi revoke edilir. Offboarding checklist otomatik çalışır ve İç Denetim tarafından örneklenir.

5.12 **Transfer & Role Değişikliği:** Çalışanın rolü değiştiğinde eski rolün tüm yetkileri 24 saat içinde kaldırılır, yeni rolün yetkileri eklenir. "Yetki birikimi" (privilege creep) önlenir. Annual access certification'da her manager ekibinin tüm yetkilerini onaylar/reddeder.

5.13 **Service Account & Machine Identity Yönetimi:** Service account'lar için kişisel sahiplik yasaktır; ekip sahipliği tanımlanır. Parolalar/secret'lar en az 90 günde bir rotate edilir, secret manager (HashiCorp Vault, AWS Secrets Manager) içinde tutulur, plain text kaydedilmez. Machine identity (mTLS sertifika, OAuth client, SPIFFE) kısa ömürlü (24 saat max) tutulur.

5.14 **Erişim Doğrulama (Access Review):** Tüm sistemler için quarterly access review zorunludur. Manager + uygulama sahibi ortak onayı gerekir. Reddedilen erişimler 48 saat içinde revoke edilir. Privileged erişimler aylık review'dan geçer. Yönetici erişimleri altı aylık full audit'e tabidir.

5.15 **Konuk & Dış Kullanıcı Erişimi:** Tedarikçi/partner kullanıcıları ayrı tenant/segmentte tutulur (B2B collaboration). MFA zorunlu, süreli (maksimum 90 gün, yenilenebilir) ve sponsor onayı gereklidir. Süre sonunda otomatik disable edilir. Konuk kullanıcıların production verisine doğrudan erişimi yasaktır; yalnızca jump host üzerinden ve session recording ile.

5.16 **Oturum Yönetimi (Session Management):** Idle timeout 15 dakika (yönetici konsollar 5 dakika), absolute timeout 8 saat (privileged session 4 saat) uygulanır. Concurrent login sınırı (kullanıcı başına 2 cihaz) uygulanır. Yönetici oturumları PAM gateway'inden geçer ve gerçek zamanlı izlenir; şüpheli aktivitede otomatik sonlandırma tetiklenir.

5.17 **Denetim & Loglama:** Tüm authentication ve authorization kararları (izin verilen ve reddedilen) log'lanır, SIEM'e gönderilir ve immutable WORM storage'da 1 yıl (yönetici işlemler 7 yıl) saklanır. Anomali tespiti (impossible travel, brute force, privilege escalation) UEBA motoruyla gerçek zamanlı yapılır ve alert tetiklenir.

5.18 **Self-Servis & Otomasyon:** Çalışanlar self-servis portalından JIT erişim talep edebilir, parola sıfırlama (MFA ile), MFA cihaz yönetimi yapabilir. Approver mobil onay (push notification) ile hızlı karar verebilir. Tüm süreç SLA ile izlenir: standart talep 4 saat, JIT 15 dakika, privileged 30 dakika.

### 6. Prosedürler & İş Akışları

- **Onboarding Provisioning (PR-IAM-01):** HR kayıt → manager rol ataması → SCIM provisioning → standart yetkiler → MFA enrollment → first login.
- **JIT Access Workflow (PR-IAM-02):** Kullanıcı talebi (bilet gerekçeli) → manager onayı → application owner onayı (yüksek riskli) → PAM rolü 4 saatliğine atama → session recording → süre sonu auto-revoke.
- **Offboarding Workflow (PR-IAM-03):** HR trigger → 1 saat içinde disable + wipe + revoke → 7 gün sonra delete → data transfer → audit log saklama.
- **Quarterly Access Review (PR-IAM-04):** IAM sistemi access raporu üretir → manager onayı (15 gün) → reddedilenlerin revoke edilmesi → iç denetim örnekleme.
- **PAM Session Flow (PR-IAM-05):** PAM vault'tan credential çek → target sisteme login → session recording başlar → real-time monitoring → şüpheli aktivitede kill → session archive.
- **Service Account Rotation (PR-IAM-06):** 90 günde otomatik tetik → secret manager yeni key üretir → consumer update → eski key revoke → log.

### 7. Uyumluluk & İzleme

İzlenen KPI'lar: MFA adoption oranı (hedef %100), quarterly access review tamamlama (hedef %100), ortalama JIT erişim onay süresi (hedef <30 dk), orphaned account sayısı (hedef 0), SoD ihlali sayısı (hedef 0), PAM kapsama oranı (hedef %100 privileged hesap), shared account sayısı (hedef 0), parola breach yakalama oranı, failed login anomaly alerts (her biri triyaj edilmiş). IAM sistemi SOC'e dashboard sağlar; anormal authentication paternleri otomatik alert üretir. Yıllık internal access audit + 18 aylık SOC 2 Type II denetimi yapılır. SOX required controls için quarterly key control test gerçekleştirilir.

### 8. İhlal Yaptırımları

İhlaller; parola paylaşma, MFA bypass,Yetkisiz erişim talebi, erişim review'ünde gerçeği saptırma, yetkili olmadığı sisteme erişme gibi durumları kapsar. Disiplin süreci (yazılı uyarı → fesih) ve gerektiğinde yasal süreç uygulanır. Yetkisiz erişim sonrası veri ifşasıPolitika No: 2 ihlal prosedürünü de tetikler. Tedarikçi kullanıcılarının ihlali sponsor kurum çalışanı için sorumluluk doğurur ve tedarikçi sözleşmesinde yaptırım uygulanır. CISO, kritik ihlalleri 24 saat içinde yönetim kuruluna raporlar.

### 9. İstisnalar

İstisnalar yalnızca iş gerekçesi ve risk değerlendirmesi ile CISO tarafından onaylanır. Tüm istisnalar maksimum 90 gün geçerlidir, sonunda ya kapatılır ya yenilenir. İstisna için compensating control (örn. JIT yerine quarterly review + session recording) tanımlanır. Acil production erişimi (SEV-1 olay) için CISO veya vekili 4 saatlik JIT verebilir, sonradan onay formalize edilir. İstisna kayıt defteri (exception register) IAM sistemi içinde tutulur ve iç denetime sunulur.

### 10. İlgili Standartlar

- ISO/IEC 27001:2022 Annex A.5.15 (Access control), A.5.16 (Identity management), A.5.17 (Authentication information), A.5.18 (Access rights)
- NIST SP 800-63B — Digital Identity Guidelines (AAL/IAL/FAL)
- NIST SP 800-207 — Zero Trust Architecture
- PCI-DSS v4.0 Req 7 (Restrict access), Req 8 (Identify users)
- SOC 2 CC6.1-CC6.3 — Logical and physical access controls
- SOX Section 404 — IT general controls
- RFC 6749 (OAuth 2.0), RFC 7519 (JWT), OpenID Connect Core 1.0, SAML 2.0
- FIDO2 / WebAuthn (W3C Recommendation)
- CIS Controls v8 — Control 5 (Account Management), Control 6 (Access Control Management)

### 11. Onay & Revizyon Geçmişi

| Sürüm | Tarih | Hazırlayan | Onaylayan | Değişiklik |
|-------|-------|------------|-----------|------------|
| 1.0 | 2026-06-21 | IAM Ekibi & CISO | CIO & CISO | İlk yayın |

**Sonraki gözden geçirme:** 2027-06-21 veya major sistem değişikliğinde.

---

## Politika No: 4 — Şifreleme & Anahtar Yönetimi Politikası

### 1. Amaç

Bu politika, kurumdaki tüm verilerin — beklenirken (data at rest), aktarılırken (data in transit) ve kullanımda (data in use) — uygun ve modern kriptografik yöntemlerle korunmasını, kriptografik anahtarların tüm yaşam döngüsü boyunca (üretim, dağıtım, rotasyon, depolama, yedekleme, iptal, imha) güvenli biçimde yönetilmesini ve geleceğin kuantum bilgisayar tehditlerine karşı hazırlıklı olunmasını sağlamak amacıyla yazılmıştır. Politika, kriptografik kontrollerin uygun, ölçülü ve tutarlı kullanımını güvence altına alır; zayıf algoritmaların kullanımını yasaklar ve kurumun kriptografik çevikliğini (cryptographic agility) artırır. Temel felsefe: "şifreleme tek başına yeterli değildir; anahtar güvenliği şifrelemenin kendisinden daha kritiktir."

### 2. Kapsam

Politika; kurumun sahip olduğu, işlettiği veya kullandığı tüm sistemlerdeki veri şifreleme ve anahtar yönetimi süreçlerini kapsar. Dijital kapsam: sunucu diskleri, veritabanları (column-level encryption), nesne depolama (S3, Blob), mesaj kuyrukları, ağ trafiği (TLS, mTLS, IPsec), e-posta (S/MIME, PGP), VPN, kod imzalama, container image signing, OCI artifact signing, belge şifreleme, yedekleme medyası, HSM ve KMS cihazları. Anahtar kapsamı: simetrik anahtarlar, asimetrik anahtar çiftleri, dijital sertifikalar (X.509), TLS sunucu sertifikaları, CA private key'leri, SSH key'leri, API secret'ları, JWT signing key'leri, database TDE master key'leri, BYOK anahtarları. Tüm tedarikçilerin şifreleme uygulamaları da sözleşmelerle bu politikaya tabi tutulur.

### 3. Tanımlar

- **Simetrik Şifreleme:** Aynı anahtarın şifreleme ve çözme için kullanıldığı algoritmalar (AES, ChaCha20).
- **Asimetrik Şifreleme:** Public-private anahtar çifti kullanan algoritmalar (RSA, ECC, Ed25519).
- **Hash Fonksiyonu:** Tek yönlü özet fonksiyonu (SHA-256, SHA-3, BLAKE2/3).
- **MAC/HMAC:** Mesaj doğrulama kodu; bütünlük ve özgünlük sağlar.
- **AEAD:** Authenticated Encryption with Associated Data (AES-GCM, ChaCha20-Poly1305).
- **TLS (Transport Layer Security):** Ağ trafiği şifreleme protokolü; TLS 1.3 önerilir.
- **HSM (Hardware Security Module):** Anahtarların fiziksel olarak korunmuş donanımsal kasada saklanması ve kriptografik işlemlerin HSM içinde yapılması.
- **KMS (Key Management Service):** Yazılım tabanlı anahtar yönetim servisi (AWS KMS, Azure Key Vault, GCP KMS).
- **CA (Certificate Authority):** Dijital sertifika veren güven kökü.
- **BYOK (Bring Your Own Key):** Müşterinin kendi anahtarını bulut sağlayıcıya getirmesi.
- **HYOK (Hold Your Own Key):** Anahtarın şirket içi HSM'de tutulup bulut tarafında kullanılması (gateway pattern).
- **PQC (Post-Quantum Cryptography):** Kuantum bilgisayarlara dayanıklı algoritmalar (Kyber/ML-KEM, Dilithium/ML-DSA, Falcon, SPHINCS+).
- **Cryptographic Agility:** Şifreleme algoritmalarını/anahtarları minimum etkiyle değiştirebilme yeteneği.

### 4. Roller & Sorumluluklar

- **Kripto Yöneticisi (Crypto Officer):** Kriptografik standartları belirler, algoritma ve anahtar uzunluk politikalarını uygular, kriptografi envanterini tutar, zafiyet ve sertifikasyon sürecini yönetir.
- **CISO:** Politikanın sahibidir; istisnaları onaylar, üst yönetime raporlar.
- **PKI Yöneticisi:** CA altyapısını işletir, sertifika yaşam döngüsünü yönetir, CRL/OCSP sağlar.
- **HSM Yöneticisi:** HSM cihazlarını yönetir, M-of-N quorum kontrolünü uygular, fiziksel erişim ve şifreleme operasyonlarını denetler.
- **Uygulama Ekipleri:** Şifreleme gereksinimlerini doğru uygular, hardcoded secret kullanmaz, secret manager entegrasyonu yapar, anahtar rotasyonunu takip eder.
- **IT Operasyon:** Disk şifrelemesini (BitLocker, LUKS) uygular, TLS yapılandırmasını yönetir, sertifikaları izler ve yeniler.
- **İç Denetim:** Yıllık kriptografi denetimi yapar; anahtar yedekleme, rotasyon, imha süreçlerini örnekler.
- **Dış Denetim / Penetrasyon Testi:** Yıllık kriptografik zafiyet testi (CryptoAudit) gerçekleştirir.

### 5. Politika Maddeleri

5.1 **Onaylı Algoritmalar:** Kurumda yalnızca şu algoritmalar kullanılabilir:
- Simetrik: AES-256 (AES-128 ancak performans kritik ve veri düşük hassasiyette ise), ChaCha20-Poly1305.
- Asimetrik: RSA-2048+ (yeni kullanım için RSA-3072 önerilir), ECC (P-256, P-384, P-521), Ed25519 (tercih edilen imza algoritması).
- Hash: SHA-256, SHA-384, SHA-512, SHA-3, BLAKE2/3.
- AEAD: AES-GCM-256, ChaCha20-Poly1305.
- KDF: PBKDF2 (≥600k iterasyon), scrypt, Argon2id (tercih), HKDF.
MD5, SHA-1, DES, 3DES, RC4, RSA-1024 ve aşağısı, Elliptic Curve secp256k1 (Bitcoin hariç) **kesinlikle yasaktır**.

5.2 **Anahtar Uzunlukları:** Simetrik anahtarlar min 256 bit, RSA min 2048 (yeni 3072), ECC min 256 bit (P-256), Ed25519 256 bit, HMAC-SHA256 anahtar min 256 bit. Kurum içi quantum-safe geçiş süreci için yeni anahtarlar min 3072-bit RSA veya P-384 ECC kullanır.

5.3 **TLS Yapılandırması:** Tüm HTTPS ve inter-service iletişimde TLS 1.3 zorunludur. TLS 1.2 yalnızca legacy sistemler için (politikaya istisna ile) kabul edilir ve yalnızca güçlü cipher suite'leri (ECDHE-ECDSA-AES256-GCM-SHA384 gibi) ile. TLS 1.0/1.1, SSLv2/v3 kesinlikle yasaktır. HSTS (max-age ≥1 yıl, includeSubDomains, preload) zorunludur. Certificate Transparency (CT) logging zorunludur.

5.4 **Sertifika Yönetimi:** TLS sertifikaları yalnızca kurum onaylı CA'lerden alınır (kurum içi CA, Let's Encrypt ACME, veya onaylı public CA). Sertifikalar maksimum 90 gün geçerlidir (kısa ömür), ACME ile otomatik yenilenir. Sertifika imza algoritması SHA-256+. Wildcard sertifikalar yalnızca internal kullanım için ve istisna ile kabul edilir. EV (Extended Validation) sertifikaları yüksek riskli finansal uygulamalar için tercih edilir.

5.5 **CA Yönetimi:** Kurum içi PKI iki katmanlıdır: Offline Root CA (HSM korumalı, yıllık aktive), Online Issuing CA'lar (intermediate). Root CA private key HSM içinde, quorum (M-of-N) ile aktive edilir. CA operasyonları çift kişilik kontrol (dual control) gerektirir. CRL ve OCSP her public CA için zorunludur. CA sertifikaları 20 yıl (root), 10 yıl (intermediate) geçerlidir.

5.6 **Anahtar Yaşam Döngüsü — Generation:** Anahtarlar yalnızca onaylı kriptografik kütüphanelerle (OpenSSL 3+, BoringSSL, libsodium, Tink) ve NIST SP 800-90A compliant DRBG ile üretilir. Production anahtarlar HSM veya KMS içinde üretilir; export edilemez (non-extractable). Software fallback yalnızız test/geliştirme ortamı için, orada da secret manager kullanılır.

5.7 **Anahtar Yaşam Döngüsü — Distribution:** Anahtar dağıtımı yalnızca güvenli kanallarla (mTLS, KMS API, Vault transit secret engine) yapılır. E-posta, Slack, plain text config, source code içinde anahtar taşınması yasaktır. Public key dağıtımı yine de fingerprint doğrulaması ile yapılır.

5.8 **Anahtar Yaşam Döngüsü — Storage:** Production anahtarlar HSM (FIPS 140-2 Level 3+ veya FIPS 140-3) içinde tutulur. Yazılım tabanlı KMS anahtarları KMS içinde CMK (Customer Master Key) olarak, envelope encryption ile veri şifreleme anahtarları (DEK)包装 edilir. Secret manager (HashiCorp Vault, AWS Secrets Manager) uygulama secret'ları için kullanılır; secret'lar disk'e yazılmaz, RAM'de tutulur.

5.9 **Anahtar Yaşam Döngüsü — Rotation:** Anahtar rotasyon periyodları:
- TLS sertifikaları: 90 gün (otomatik ACME).
- Application secret'ları (API key, JWT signing key): 90 gün.
- Service account parolaları: 90 gün.
- Database TDE master key: 12 ay.
- SSH user key'leri: 12 ay (kullanıcı değişiminde hemen).
- CA private key'leri: 5 yıl (root), 3 yıl (intermediate).
- Long-term archive key'leri: belge saklama süresi boyunca + 5 yıl.
Kompromize şüphesi durumunda immediate rotation zorunludur.

5.10 **Anahtar Yaşam Döngüsü — Revocation:** Sertifika iptali CRL + OCSP ile yayınlanır. Kompromize root veya intermediate CA acil durum prosedürünü (CA Compromise Incident Plan) tetikler. SSH key iptali SSH CA revoke serial ile yapılır; tüm host'lar iptali uygular. JWT için short-lived token (15 dk) + refresh token + revocation list kullanılır.

5.11 **Anahtar Yaşam Döngüsü — Destruction:** Anahtarlar imha edilirken crypto-erasure (anahtarı silerek veriyi geri dönüşsüz yapma) veya HSM zeroize komutu kullanılır. HSM cihazı retirement'a gönderildiğinde tampered key store + fiziksel imha prosedürü uygulanır. Yedek medyalar (magnetic tape, SSD) end-of-life'da physically destroyed + certificate of destruction alınır.

5.12 **HSM Kullanımı:** Üretim HSM'leri FIPS 140-2 Level 3 (tercihen Level 4) veya FIPS 140-3 sertifikalıdır. HSM erişimi PAM + quorum (M-of-N, örn. 3-of-5) gerektirir. HSM operasyon log'ları SIEM'e gönderilir, anomali detection uygulanır. HSM'ler high availability cluster olarak kurulur, RTO <1 saat. Yedek HSM ile异地 disaster recovery sağlanır.

5.13 **Anahtar Yedekleme:** Anahtar yedekleri ayrı bir HSM veya KMS'te, ayrı coğrafi bölgede tutulur. Yedek şifrelemesi için ayrı bir backup master key (yine HSM korumalı) kullanılır. Yedeklerin restore testi yıllık yapılır. Anahtar yedekleri export edilemez formatta olmalı; yalnızca HSM-to-HSM clone işlemiyle taşınmalı.

5.14 **BYOK (Bring Your Own Key):** Bulut hizmetlerinde müşteri/uygulama verileri için BYOK zorunludur: anahtar kurum HSM'inde üretilir, bulut KMS'ine wrapped olarak import edilir, bulut kullanım sonrası anahtar "killed" edilebilir (key deletion = veri erişimsizlik). HYOK (Hold Your Own Key) yüksek hassasiyetli veriler için gateway pattern ile kullanılır. Anahtar değişimi her 12 ayda yapılır.

5.15 **Disk & Veritabanı Şifrelemesi:** Tüm üretim diskleri tam disk şifrelemeli (AES-XTS-256). Veritabanlarında TDE (Transparent Data Encryption) zorunludur. Özel nitelikli ve finansal veriler için ek olarak column-level encryption (AES-GCM-256) uygulanır. Yedekler her zaman şifreli (KMS-managed key ile). Snapshot'lar KMS-CMK ile şifrelenir.

5.16 **Secret Tarama & Hardcoded Secret Yasağı:** Tüm kod depolarında (private/public) pre-commit hook + CI pipeline içinde secret scanning (gitleaks, truffleHog, GitHub Advanced Security) zorunludur. Hardcoded secret bulunduğunda build fail olur, secret rotate edilir, historical git history'den BFG ile temizlenir. Developer'lar için lokal CLI secret manager (1Password CLI, Vault agent) sağlanır.

5.17 **Quantum-Resistant Cryptography Hazırlığı:** Kurum, NIST PQC standardizasyon sürecini (ML-KEM, ML-DSA, SLH-DSA) takip eder. Yeni crypto satın alımlarında "quantum-ready" özelliği tercih kriteri olur. Hybrid TLS (X25519 + ML-KEM-768) pilotları 2027 yılında başlatılır. Crypto inventory'de her anahtar için "quantum-vulnerable" etiketi konur; migration planı 2028 sonuna kadar tamamlanır. Long-term archive'lar (10+ yıl saklanacak) için quantum-safe algoritmalar bugünden tercih edilir.

5.18 **Kriptografi Envanteri & Agility:** Tüm kriptografik varlıklar (algoritmalar, anahtarlar, sertifikalar, HSM'ler) merkezi crypto inventory'de tutulur. Her algoritma için kullanım yeri, sorumlu, son değerlendirme tarihi kaydedilir. Crypto agility: her sistem algoritmayı/anahtarı ay içinde değiştirebilecek konfigürasyon mimarisinde olmalıdır (config-driven crypto).

### 6. Prosedürler & İş Akışları

- **Sertifika İstek Prosedürü (PR-CRYPTO-01):** CSR üretimi → CA'ye gönderim → CT log → sertifika dağıtım (ACME veya manuel) → monitoring'a kayıt → son kullanma tarihinden 14 gün önce yenileme alert.
- **Anahtar Rotasyon Prosedürü (PR-CRYPTO-02):** Rotasyon takvimi tetikleyici → yeni anahtar üretimi → dual-key dönemi (1 hafta) → eski anahtarı dekrete → archive (90 gün) → destroy.
- **HSM Operasyon Prosedürü (PR-CRYPTO-03):** Quorum çağrısı → HSM aktive → operasyon (key gen, sign) → log → HSM lock. Acil durum: HSM compromise → zeroize → restore from backup HSM.
- **Kompromite Anahtar Müdahalesi (PR-CRYPTO-04):** Tespit → impact analysis → yeni anahtar üret → tüm consumer update → revoke eski → etkilenen veriyi re-encrypt → breach değerlendirme (Politika No: 2 ile entegre).
- **Secret Scan & Remediation (PR-CRYPTO-05):** Pre-commit hook tespiti → commit block → developer rotate → CI secret scan → historical tarama → BFG cleanup.
- **CA Operasyon Prosedürü (PR-CRYPTO-06):** Root CA yearly activation ceremony → issuing CA daily ops → CRL/OCSP publishing → compromise plan drill yearly.

### 7. Uyumluluk & İzleme

KPI'lar: TLS 1.3 kullanım oranı (hedef %100), SHA-1/MD5 kullanımı (hedef 0), sertifikaların %90 gün altında oranı (hedef %100), HSM kapsama oranı production anahtar (hedef %100), expired sertifika sayısı (hedef 0), hardcoded secret tespit sayısı (hedef 0, 0'a doğru trend), anahtar rotasyon zamanında oran (hedef %95+), quantum-vulnerable anahtar envanteri (yıllık azalan trend), secret scan coverage (hedef %100 repo). Crypto inventory aylık olarak otomatik üretilen rapor ile CISO'ya sunulur. Yıllık dış kriptografi denetimi (örn. Cure53, NCC Group) gerçekleştirilir. PCI-DSS Req 3-4 uyumu, FIPS 140 sertifikasyon süreçleri izlenir.

### 8. İhlal Yaptırımları

Kriptografi politikası ihlalleri özellikle ciddi kabul edilir çünkü zayıf kriptografi tüm veri güvenliğini çökertir. İhlaller: onaylı olmayan algoritma kullanımı, hardcoded secret, anahtar paylaşma, HSM quorum atlatma, sertifikayı zamanında yenilememe, MD5/SHA-1 kullanımı. Hafif ihlaller (örn. bir sertifika yenilemeyi unutma) coaching + düzeltici eylem; ağır ihlaller (hardcoded production secret, anahtarı public repo'ya push) disiplin süreci → fesih ve hukuki süreç. Kriptografi zafiyetinden doğan veri ihlali en üst cezaya çıkarılır ve regülatör bildirimi Politika No: 2'ye göre yapılır.

### 9. İstisnalar

Kriptografi istisnaları çok sınırlıdır. Yasaklı algoritma (MD5, SHA-1) kullanımı yalnızca legacy protokol uyumluluğu için (örn. eski SOAP hizmeti) ve compensating kontrol (network segmentation + WAF) ile CISO onayıyla geçici kabul edilebilir; 6 ay içinde migration planı sunulmalıdır. BYOK kullanılamayan SaaS için HYOK gateway veya alternative product değerlendirmesi zorunludur. Kısa ömürlü sertifika kullanamayan eski IoT cihazları için 1 yıllık sertifika + ek ağ izolasyonu istisna olarak verilebilir.

### 10. İlgili Standartlar

- ISO/IEC 27001:2022 Annex A.8.24 (Cryptography) ve A.8.25 (Secure development)
- NIST SP 800-131A Rev. 2 — Cryptographic Key Length & Algorithm Transition
- NIST SP 800-57 Part 1 — Key Management Recommendation
- NIST SP 800-90A — Random Bit Generation
- NIST FIPS 140-3 — Cryptographic Module Security Requirements
- NIST FIPS 197 (AES), FIPS 198-1 (HMAC), FIPS 202 (SHA-3)
- NIST PQC Standardization (FIPS 203 ML-KEM, FIPS 204 ML-DSA, FIPS 205 SLH-DSA)
- PCI-DSS v4.0 Req 3 (Protect stored cardholder data), Req 4 (Encrypt transmission)
- CA/Browser Forum Baseline Requirements (TLS certificates)
- RFC 8446 (TLS 1.3), RFC 7748 (Curve25519), RFC 8032 (Ed25519)
- ENISA Algorithms Recommendations
- SOC 2 CC6.1 (encryption of sensitive data)

### 11. Onay & Revizyon Geçmişi

| Sürüm | Tarih | Hazırlayan | Onaylayan | Değişiklik |
|-------|-------|------------|-----------|------------|
| 1.0 | 2026-06-21 | Crypto Officer & CISO | CISO & CTO | İlk yayın |

**Sonraki gözden geçirme:** 2027-06-21 veya NIST PQC finalize sonrası major güncelleme.

---

## Politika No: 5 — Yazılım Geliştirme Yaşam Döngüsü (SDLC) Politikası

### 1. Amaç

Bu politika, kurumda geliştirilen, satın alınan veya dış kaynaklanan tüm yazılım ürünlerinin "secure-by-design" ve "secure-by-default" prensipleriyle geliştirilmesini, yaşam döngüsünün yedi fazında (requirement, design, implementation, testing, deployment, maintenance, retirement) güvenliğin yerleşik bir öncelik olmasını, ve hızlı teslimat (CI/CD, DevOps) ile güvenlik kontrollerinin dengelenmesini sağlamak amacıyla hazırlanmıştır. Politika; yazılım tedarik zinciri saldırılarına (SolarWinds, Log4Shell tarzı) karşı korunmayı, geliştiricilerin güvenli kod yazma becerilerini artırmayı, otomatik güvenlik testlerini CI/CD pipeline'ına entegre etmeyi ve SBOM (Software Bill of Materials) üretimini standartlaştırmayı hedefler. Temel felsefe: "güvenlik ürün sonunda eklenen bir özellik değil, her fazın içinde baştan tasarlanan temel bir niteliktir."

### 2. Kapsam

Politika; kurumun geliştirdiği tüm yazılımları — web uygulamaları, mobil uygulamalar (iOS/Android), API'ler, microservice'ler, CLI araçları, library'ler, infrastructure-as-code (Terraform, Pulumi), machine learning modelleri, AI agent sistemleri ve embedded firmware — kapsar. Ayrıca dış kaynaklanan yazılım, open-source komponent kullanımı, SaaS entegrasyonları, low-code/no-code platformlarda geliştirilen uygulamalar ve RPA script'leri de politikaya tabidir. Kullanıcı kapsamı: tüm developer'lar, devops engineer'lar, QA engineer'ları, SRE'ler, data scientist'ler, ML engineer'lar ve technical product manager'lar. Süreç kapsamı: tüm 7 faz (requirement, design, implementation, testing, deployment, maintenance, retirement) ve bu fazları birbirine bağlayan branching strategy, CI/CD pipeline, code review ve release management süreçleri.

### 3. Tanımlar

- **SDLC:** Yazılım Geliştirme Yaşam Döngüsü — yazılımın idea'dan retirement'a tüm yaşamı.
- **Secure-by-Design:** Güvenliğin tasarım fazından itibaren entegre edilmesi yaklaşımı.
- **Threat Modeling:** Sistemin olası tehditlerinin sistematik analizi; STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) en yaygın modeldir.
- **SAST (Static Application Security Testing):** Kaynak kodun statik analiziyle güvenlik açığı tespiti (Semgrep, CodeQL, SonarQube).
- **DAST (Dynamic Application Security Testing):** Çalışan uygulama üzerinde dışarıdan güvenlik testi (OWASP ZAP, Burp Suite).
- **IAST (Interactive Application Security Testing):** Çalışan uygulama içinde agent ile tespit.
- **SCA (Software Composition Analysis):** Üçüncü parti bağımlılıkların bilinen açıklarını (CVE) tespiti (Snyk, Dependabot, Trivy, OSV-Scanner).
- **Secret Scanning:** Kod/commit içinde secret (API key, parola, sertifika private key) taraması.
- **SBOM (Software Bill of Materials):** Yazılımın tüm komponentlerinin (direct + transitive) envanteri; format: SPDX, CycloneDX.
- **Definition of Done (DoD):** Bir kullanıcı hikayesinin veya PR'ın tamamlanmış sayılması için gereken kriterler.
- **GitFlow / Trunk-Based:** Branching stratejileri.
- **Pipeline:** CI/CD otomasyon zinciri.
- **Shift-Left:** Güvenlik testlerini erken fazlara çekme prensibi.

### 4. Roller & Sorumluluklar

- **CISO & AppSec Lead:** Politikanın sahibi, secure SDLC standardını belirler, toolchain seçer, security champion programını yönetir.
- **Product Owner (PO):** Güvenlik gereksinimlerini product backlog'a dahil eder, risk-ödün dengesinde karar verir, security debt'i iş olarak planlar.
- **Tech Lead / Architect:** Threat modeling yapar, secure design pattern'leri seçer, code review yapar, "definition of done"a güvenlik maddeleri ekler.
- **Developer:** Secure coding standartlarına uyar (OWASP ASVS, CERT), PR öncesi local test yapar, code review'da aktif katılır, security bulgularını zamanında fix eder.
- **QA Engineer:** Güvenlik test senaryolarını yazar, DAST tool'larını çalıştırır, regression test'lerine security case'leri ekler.
- **DevOps/SRE Engineer:** CI/CD pipeline'ına security tool'larını entegre eder, IaC scanning yapar, deployment security (container image scanning, admission controller) uygular, observability (logs, metrics, tracing) sağlar.
- **Security Champion:** Her takımda bir developer'ın security konularında takıma rehberlik ettiği rol; AppSec ekibine raporlar.
- **İç Denetim / Compliance:** SDLC adherence'ı örnekleme ile denetler, SOC 2 / ISO 27001 bulgularını raporlar.

### 5. Politika Maddeleri

5.1 **7 Faz Standardı:** Tüm yazılım geliştirme aşağıdaki yedi fazı izler: (1) Requirement, (2) Design, (3) Implementation, (4) Testing, (5) Deployment, (6) Maintenance, (7) Retirement. Fazlar waterfall değil; Agile/iteratif şekilde yürütülebilir, ancak her fazın çıktıları dokümante edilmiş olmalı ve denetlenebilir olmalıdır.

5.2 **Faz 1 — Requirement (Gereksinim):** Her ürün/özellik için güvenlik gereksinimleri iş gereksinimleriyle birlikte tanımlanır. OWASP ASVS L2 (tercihen L3 yüksek riskli uygulamalar) baz alınır. Gereksinimlerde; authentication, authorization, input validation, output encoding, session management, logging, error handling, data protection konuları belirtilir. Compliance gereksinimleri (KVKK/GDPR, PCI-DSS, HIPAA) PO tarafından eklenir. "Security stories" backlog'da "must-have" olarak işaretlenir.

5.3 **Faz 2 — Design (Tasarım):** Her yeni sistem veya major değişiklik için threat modeling zorunludur. STRIDE metodolojisi uygulanır; DFD (Data Flow Diagram) çizilir, trust boundary'ler tanımlanır, her trust boundary geçişinde tehditler listelenir, mitigasyonlar tasarlanır. Threat model dokümanı repo'da saklanır. Secure design pattern'ler (defense in depth, fail-safe, least privilege, complete mediation) uygulanır. Mimari kararlarda "Architecture Decision Record (ADR)" yazılır ve security dimension değerlendirilir.

5.4 **Faz 3 — Implementation (Gerçekleştirme):** Developer'lar OWASP Top 10, OWASP ASVS ve CERT secure coding standartlarına uyar. Secure coding guideline'lar her dil için dokümante edilmiştir (Python, TypeScript, Go, Java, Rust). Default olarak güvenli kütüphaneler kullanılır (örn. parameterized query, ORM, modern framework'lerin template engine'i). Input validation her zaman server-side'da yapılır. Output encoding OWASP cheat sheet'e uygun. Crypto için her zaman kütüphane kullanılır (Politika No: 4 ile uyumlu). "Hardcoded secret" kesinlikle yasaktır.

5.5 **Faz 4 — Testing (Test):** Aşağıdaki güvenlik testleri zorunludur:
- **SAST:** Her PR'da çalışır (Semgrep + CodeQL); merge gate'de "new finding = block".
- **SCA:** Her PR'da ve nightly çalışır (Snyk/Trivy); Critical CVE block, High CVE 7 gün içinde fix.
- **Secret Scanning:** Pre-commit hook + CI (gitleaks); tespit = block.
- **DAST:** Pre-production staging'de nightly; yeni endpoint'lerde release öncesi.
- **IAST:** Pre-production QA testleri sırasında; test coverage'i %80+.
- **Container Image Scanning:** Her image build'de (Trivy/Grype); Critical vuln block.
- **IaC Scanning:** Terraform/CloudFormation/K8s manifest'leri (Checkov/tfsec); misconfiguration block.
- **Penetration Test:** Production release öncesi (high-risk uygulamalar) ve yıllık tüm üretim uygulamaları için dış penetest firması.
- **Fuzz Testing:** Critical parser'lar için (libFuzzer, OSS-Fuzz).

5.6 **Faz 5 — Deployment (Dağıtım):** Deployment tamamen otomatik (CI/CD pipeline); manuel deployment yalnızca break-glass ile. Deployment ortamları dev → staging → pre-prod → prod şeklinde ayrılmış; her ortamın IAM izolasyonu var. Production deployment için "4-eyes principle" — code owner approval + SRE approval zorunlu. Progressive delivery: canary veya blue/green deployment; otomatik rollback SLO ihlalinde (hata oranı >%1, latency p99 >500ms). Container image'lar imzalanır (Cosign/Sigstore); admission controller (Kyverno/OPA Gatekeeper) imzasız image'ı reddeder.

5.7 **Faz 6 — Maintenance (Bakım):** Üretimdeki yazılım için sürekli güvenlik izleme: dependency CVE monitoring (Dependabot/Renovate), runtime threat detection (Falco runtime security), WAF (Cloudflare/AWS WAF) log'ları, anomaly detection. Security patch SLA'sı: Critical 24 saat, High 7 gün, Medium 30 gün, Low 90 gün. Her ay "security tech debt" review'u; PO ile backlog'da önceliklendirme.

5.8 **Faz 7 — Retirement (Sonlandırma):** Yazılım sonlandırılırken: (a) kullanıcılar 90 gün önceden bilgilendirilir, (b) veri migrasyon planı yapılır, (c) production ortam kapatılır (DNS, load balancer, CDN, certificates revoke), (d) veri güvenli imha (Politika No: 4 crypto-erasure), (e) source code archive'e taşınır (7 yıl saklanır), (f) post-mortem dokümanı yazılır.

5.9 **Definition of Done (DoD):** Bir PR'ın merge edilebilmesi için aşağıdakiler zorunludur:
- Code review en az 1 onaylı reviewer tarafından (high-risk: 2).
- Tüm SAST/SCA/secret scan bulguları fix veya risk kabul edilmiş.
- Unit test coverage ≥80% (yeni kod), integration test'leri geçiyor.
- Threat model güncellendiyse PR'a eklenmiş.
- Documentation (README, API doc, runbook) güncellenmiş.
- Security champion onayı (high-risk değişikliklerde).
- Change management ticket kapalı.

5.10 **Branching Strategy:** Tüm ekipler ya GitFlow (release-based ürünler) ya da Trunk-Based Development (SaaS, continuous delivery) kullanır. Long-lived feature branch yasaktır; branch ömrü maksimum 3 gün. main branch her zaman deployable. Feature flag'ler (LaunchDarkly, Unleash) ile yarım özellikler main'de güvenle yaşayabilir. Protected branch'lerde force-push yasaktır. Tüm commit'ler GPG/Sigstore imzalı. Conventional Commits standardı zorunludur.

5.11 **CI/CD Pipeline Security:** Pipeline kimlik doğrulaması OIDC tabanlı (long-lived token yok). Pipeline secret'ları vault'tan dinamik çekilir. Pipeline step'leri izole container'larda çalışır. Build reproducibility: her build belirli commit + dependency lockfile ile tekrar üretilebilir. SBOM her build'de üretilir ve artifact repository'ye kaydedilir. Pipeline telemetry SIEM'e gönderilir; anomali (gece yarısı deploy, yeni IP, yeni tool) alert üretir.

5.12 **Dependency Management & SBOM:** Tüm third-party bağımlılıklar envanteri SBOM olarak tutulur (CycloneDX veya SPDX format). SBOM artifact repository'de (JFrog/Artifactory) saklanır ve bir CVE yayınlandığında otomatik etki analizi yapılır (depend-on-dependabot-like otomasyon). Yeni bağımlılık eklenmeden önce license + security review (license scanning). End-of-life veya maintainer'sız bağımlılık kullanımı yasaktır; fork gerekiyorsa kurum internal fork sahipliği tanımlanır. Reproducible build için lockfile (lock.json, poetry.lock, Cargo.lock) zorunludur.

5.13 **Code Review:** Tüm PR'larda code review zorunludur. Reviewer; kod kalitesi, güvenlik, performans, test coverage ve standart uyumunu değerlendirir. High-risk değişiklikler (auth, crypto, payment, PII işleme) için "security reviewer" rozetli kişilerden onay zorunludur. Self-merge yasaktır. AI-assisted code review (CodeRabbit, GitHub Copilot review) tamamlayıcı olarak kullanılabilir ama insani review'ün yerini almaz.

5.14 **Secret Management in Code:** Tüm secret'lar runtime'da vault'tan (HashiCorp Vault, AWS Secrets Manager, cloud KMS) çekilir; environment variable bile plain text yazılmaz. Local development için 1Password CLI veya Vault dev mode. Pre-commit hook gitleaks çalışır. CI'da TruffleHog historical scan. Public repo'ya secret sızıntısı = derhal rotate + (varsa) public'leştirilmiş veri için Politika No: 2 ihlal prosedürü.

5.15 **Secure Coding Eğitimi:** Tüm developer'lar yıllık OWASP Top 10 eğitimi alır. Yeni başlayanlar ilk 30 günde "secure onboarding" modülü. Konu başına özelleştirilmiş eğitimler ( secure crypto API, SQL injection prevention, JWT security) çeyreklik sunulur. CTF (Capture The Flag) ve secure coding lab'ları teşvik edilir. Security Champion'lar için ileri eğitim (OffSec OSCP benzeri) sağlanır.

5.16 **Production Erişim Yönetimi:** Developer'ların production'a doğrudan erişimi yasaktır (Politika No: 3 JIT erişim). Production log'larına erişim read-only ve auditlenmiş. Production DB sorgusu JIT + onaylı ticket + audit log ile. Break-glass prosedürü dokümante, her kullanım post-incident review'a konu.

5.17 **Incident Response in SDLC:** Üretim güvenlik olaylarında "incident response runbook" hazır. Post-mortem her SEV-1/SEV-2 olay sonrası yazılır, blameless kültürü. Lessons learned SDLC süreçlerine (eğitim, test, threat model) geri beslenir. Root cause analysis (5-why, fishbone) yapılır.

5.18 **Metrics & Continuous Improvement:** Aşağıdaki metrikler takip edilir: Mean Time to Vulnerability Remediation (MTTV), security debt ratio (open high/critical vuln sayısı / closed), % PR with security review, % builds with SAST/SCA, deployment frequency (DORA), change failure rate, MTTR, SBOM coverage. Çeyreklik "DevSecOps maturity assessment" (Samm veya BSIMM) yapılır; maturity level hedefi yıllık artar.

### 6. Prosedürler & İş Akışları

- **Threat Modeling Prosedürü (PR-SDLC-01):** Tasarım fazında trigger → DFD çizimi → STRIDE analizi → mitigasyon tanımlama → review (AppSec + architect) → threat model repo'ya kayıt →迭代 updates her major değişiklikte.
- **PR Review Workflow (PR-SDLC-02):** Developer PR açar → CI çalışır (lint, test, SAST, SCA, secret scan) → reviewer atanır → 2 onay (high-risk) → security champion onayı → merge → canary deploy → SLO watch (30 dk) → progressive rollout.
- **Vulnerability Management (PR-SDLC-03):** CVE tespiti → etki analizi (SBOM sorgusu) → severity skoru → SLA ataması → fix branch → test → deploy → closure.
- **Release Management (PR-SDLC-04):** Release notes hazırlanır → SBOM üretilir → security sign-off (high-risk) → change advisory board → scheduled deployment → rollback plan hazır → post-deploy verification.
- **Penetration Test Prosedürü (PR-SDLC-05):** Yıllık planlama → dış firmaya scope → test → bulgu raporu → remediation plan (Critical 7 gün, High 30 gün) → re-test → closure report.
- **Software Retirement (PR-SDLC-06):** Retirement plan → kullanıcı iletişim → data migration → shutdown → crypto-erasure → archive → post-mortem.

### 7. Uyumluluk & İzleme

İzlenen KPI'lar: SAST coverage (%100 PR), SCA coverage (%100), secret scan coverage (%100 repo), MTTV — Critical (hedef <24 saat), High (<7 gün), Medium (<30 gün); PR review time (hedef <8 saat); deployment frequency (DORA elite: multiple per day); change failure rate (<15%); SBOM coverage (%100 production artifact); threat model coverage (%100 new product); security training completion (%95+); penetration test findings open ratio (Critical 0, High <5). SAMM maturity assessment yıllık; hedef: Development ve Verification domain'leri Level 3. SOC 2 Type II denetiminde SDLC kontrol'leri (CC8.1) örneklenir.

### 8. İhlal Yaptırımları

SDLC ihlalleri: threat model yapılmadan production'a gitme, CI gate bypass etme, hardcoded secret push, code review olmadan merge, açık CVE'li bağımlılığı bilerek kullanma, production'a direkt erişim. Hafif ihlaller coaching + training; ağır ihlaller (bilerek güvenlik gate'ini atlatma, production verisini dev ortamına kopyalama) disiplin sürecine konu. Tekrarlayan ihlaller "security champion" rozetini kaldırır. Ekibe yansıyan ihlaller (takım seviyesinde security debt birikmesi) engineering manager'ın performans değerlendirmesine girer. Üçüncü parti yazılım tedarikçisi ihlali sözleşme yaptırımı (para cezası, sözleşme feshi) tetikler.

### 9. İstisnalar

İstisnalar; hotfix (production SEV-1) durumunda CI gate bypass için CISO veya AppSec Lead onayı (sonradan 24 saat içinde normal süreç tamamlanır); POC/prototip için threat model light versiyonu (yine de SAST ve secret scan zorunlu); legacy uygulama için "compensating control" (WAF + network segmentation + monitoring) ile security test geçiş süresi uzatılabilir. Tüm istisnalar AppSec exception register'da 6 ay üst sınırıyla tutulur.

### 10. İlgili Standartlar

- ISO/IEC 27001:2022 Annex A.8.25 (Secure development), A.8.28 (Secure coding), A.8.29 (Security testing in development & acceptance)
- NIST SP 800-218 — Secure Software Development Framework (SSDF)
- NIST SP 800-160 v1 — Systems Security Engineering
- OWASP Top 10 (2021), OWASP ASVS L1-L3, OWASP SAMM v2, OWASP Top 10 LLM
- PCI-DSS v4.0 Req 6 (Develop and maintain secure systems and software)
- CWE Top 25 Most Dangerous Software Weaknesses
- SLSA Framework (Supply-chain Levels for Software Artifacts) — hedef SLSA Level 3
- Sigstore/Cosign for artifact signing
- CycloneDX (SBOM) ve SPDX (SBOM) standartları
- DORA Metrics (deployment frequency, lead time, change failure rate, MTTR)
- CIS Software Supply Chain Security Guide v1.0
- NIST AI RMF (AI modelleri geliştirme için ek)

### 11. Onay & Revizyon Geçmişi

| Sürüm | Tarih | Hazırlayan | Onaylayan | Değişiklik |
|-------|-------|------------|-----------|------------|
| 1.0 | 2026-06-21 | AppSec Ekibi & CTO | CTO & CISO | İlk yayın |

**Sonraki gözden geçirme:** 2027-06-21 veya OWASP Top 10 yeni sürümünde.

---

## Ek: Politika Seti Yönetişim Notları

- **Sahiplik:** Her politikanın sahibi bölüm başlığı altında belirtilmiştir; sahibi politikanın uygulanmasından ve güncellenmesinden sorumludur.
- **Yıllık Gözden Geçirme:** Tüm politikalar her Haziran ayında gözden geçirilir; major regülasyon/standart değişikliğinde daha erken.
- **Eğitim Cascade:** Her politika için yıllık training modülü LMS'te yayımlanır; completion oranı %95+ hedeflenir.
- **Etkileşim Matrisi:** Bu 5 politika birbirini referans alır — özellikle Politika No: 1 (BGYS) çatı görevi görür, Politika No: 4 (Kripto) ve No: 3 (Erişim) onun teknik uygulamasıdır, Politika No: 5 (SDLC) tüm geliştirme için zorunludur, Politika No: 2 (Gizlilik) tüm diğer politikaların üzerine bina edildiği yasal zeminir.
- **Faz 2 Önizleme:** Bu set Faz 1'dir. Faz 2'de ek politikalar (Olay Müdahale, Bulut Güvenliği, AI/ML Güvenliği, Tedarikçi Risk Yönetimi, İş Sürekliliği, Insider Threat, Mobile/BYOD, Loglama & İzleme, Vulnerability Management, Ağ Güvenliği) eklenecektir.
