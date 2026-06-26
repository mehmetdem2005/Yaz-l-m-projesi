# FAZ 6 — 3D PRODUCTION GÜVENLİK & KALİTE POLİTİKALARI (Politika 31-40)

Bu doküman, NEXUS 3D Studio'nun AAA oyun ve film prodüksiyon süreçlerinde kullanılan 3D asset'leri, modelleri, rig'leri, animasyonları, texture'ları, render farm altyapısını ve real-time 3D pipeline'ını kapsayan 10 adet güvenlik ve kalite politikasını içermektedir. Politikalar 31-40, kurumun Bilgi Güvenliği Yönetim Sistemi (BGYS) ile Kalite Yönetim Sistemi'nin (ISO 9001) 3D prodüksiyon özelinde derinleştirilmiş katmanıdır. Tüm politikalar ISO/IEC 27001:2022 Annex A, ISO 9001:2015, ISO/IEC 42001, glTF 2.0 spesifikasyonu, Universal Scene Description (USD) ve Pixar Animation Studios IRRSUED pipeline, Unreal Engine 5 AAA production guidelines, Unity HDRP production standards ve ACES (Academy Color Encoding System) referanslarıyla uyumludur.

NEXUS 3D Studio; AAA PC, PlayStation 5, Xbox Series X/S, Nintendo Switch, Meta Quest 3, Apple Vision Pro ve cloud streaming platformları için oyun, cinematic, VFX ve interactive experience üretmektedir. Stüdyo; Maya, Blender, 3ds Max, Houdini, ZBrush, Substance 3D Painter/Designer, Marvelous Designer DCC araçlarını; Unreal Engine 5.4 ve Unity 2023 LTS runtime engine'lerini; AWS Thinkbox Deadline, Google Zync ve on-prem GPU cluster render farm altyapısını kullanmaktadır. Politikalar 31-40, bu ekosistemin güvenli, kaliteli ve ölçeklenebilir şekilde işletilmesini garanti altına alır.

---

## Politika No: 31 — 3D Asset Güvenliği Politikası

### 1. Amaç

Bu politikanın temel amacı, NEXUS 3D Studio bünyesinde üretilen, dış tedarikçilerden satın alınan veya topluluk (community) kaynaklarından (Unity Asset Store, Unreal Marketplace, Sketchfab, TurboSquid, CGTrader, ArtStation Marketplace) ithal edilen tüm 3D asset'lerin güvenli bir şekilde kurum prodüksiyon pipeline'ına entegrasyonunu sağlamaktır. 3D asset'ler, geleneksel yazılım güvenliği tehditlerine ek olarak özel bir tehdit vektörü sınıfı oluşturur: bir malicious `.blend`, `.fbx` veya `.glb` dosyası yürütülebilir betik (Blender Python bgl, Maya MEL/Python, 3ds Max MaxScript) gömülü olabilir, extreme polygon sayısıyla Denial-of-Service (DoS) yaratabilir, akıllı texture belleği ile GPU OOM (Out-of-Memory) tetikleyebilir veya Windows UNC yol açıkları (`\\attacker\share\`) ile kimlik bilgisi NTLM hash sızdırabilir. Politika, OWASP File Upload Protection, MITRE ATT&CK T1204 (User Execution — Malicious File) ve T1059 (Command Scripting Interpreter) tehditlerine karşı savunma derinliği (defense-in-depth) sağlar.

İkincil amaçlar şunlardır: (i) model DoS koruması için teknik kotalar (polygon ceiling, texture memory ceiling, draw call budget) tanımlamak; (ii) malicious geometry detection algoritmaları (degenerate triangle, NaN vertex, infinite bounding box, UNC path) ile erken uyarı sistemi kurmak; (iii) tüm asset girişlerini sandbox render ortamında zorunlu karantinaya almak; (iv) kaynak kotaları (CPU, RAM, VRAM, disk I/O) ile adil kullanım ve maliyet kontrolü sağlamak; (v) AAA telif hakları (IP) yönetimini, jeopolitik yaptırım (OFAC) uyumluluğunu ve derin sahtekarlık (deepfake) savunmasını desteklemek; (vi) suçlu tespiti için invisible watermark gömme altyapısını tesis etmek.

### 2. Kapsam

Politika; tüm 3D prodüksiyon dosya türlerini (`.blend`, `.fbx`, `.glb`/`.gltf`, `.usd`/`.usda`/`.usdc`, `.obj`, `.stl`, `.dae`, `.3ds`, `.max`, `.ma`, `.mb`, `.zpr`, `.ztl`, `.spp`, `.psd`), texture formatlarını (`.png`, `.jpg`, `.tga`, `.exr`, `.hdr`, `.tif`, `.dds`, `.ktx2`), gömülü betikleri (Blender Python, Maya MEL/Python, 3ds Max MaxScript, Houdini HScript/Python) ve gömülü shader'ları (HLSL, GLSL, MSL, ShaderGraph) kapsar. Kullanım ortamları: Blender 4.x, Maya 2025, 3ds Max 2025, Houdini 20, ZBrush 2024, Substance 3D Painter/Designer, Marvelous Designer, Unreal Engine 5.4, Unity 2023 LTS HDRP, Marmoset Toolbag 5 ve üçüncü parti DCC (Digital Content Creation) araçları. Kapsam; geliştirme workstation'ları, render node'ları, build server'lar ve cloud-based render farm'ları (AWS Thinkbox Deadline, Google Zync, Azure Batch) içerir.

### 3. Tanımlar

- **Mesh**: 3 boyutlu uzayda vertex, edge ve face'lerden oluşan geometrik temsil.
- **Polygon Budget**: Sahne başına izin verilen maksimum triangle sayısı (ör. PC AAA = 5M triangle/sahne, mobile = 200K).
- **Draw Call**: GPU'ya gönderilen her render komut paketi; AAA PC hedefi <2000/frame.
- **Degenerate Triangle**: Sıfır alanlı üçgen (collinear vertex); pipeline hatası yayar.
- **NaN Vertex**: "Not-a-Number" koordinatlı vertex; genellikle bozuk import sonucu.
- **Uncanny Bounding Box**: Geometrinin sahne boyutunu on binlerce kat aşan sınırlayıcı kutu — DoS işareti.
- **Sandbox Render**: İzole edilmiş, ağ erişimi olmayan, salt okunur DCC ortamında zorunlu açma adımı.
- **Asset Manifest**: Bir asset'in bağımlılık ağacını (texture, shader, referans sahne), UUID, version, lisans ve SHA-256 hash içeren JSON/USD sidecar dosyası.
- **Resource Quota**: Kullanıcı başına günlük CPU-saat, VRAM-saat, disk GB kotaları.
- **Polybomb**: Kasıtlı olarak polygon sayısı şişirilmiş, render sırasında donmaya neden olan sahne.
- **Texture Bomb**: 16K+ texture ile VRAM'i dolduran saldırı vektörü.
- **UNC Path Exploit**: `.max`/`.ma`/`.blend` içine gömülmüş `\\attacker\share\` referansı; SMB NTLM hash relay saldırısı vektörü.

### 4. Roller & Sorumluluklar

- **3D Güvenlik Mühendisi (TD Security Lead)**: Politikanın sahibi; sandbox render altyapısının kurulumu, kota yönetimi ve malicious geometry imza kütüphanesinin bakımından sorumludur. CISO'ya dotted-line raporlar.
- **Asset Librarian (Pipeline TD)**: Asset kütüphanesinin (Asset DB) yönetimi; manifest doğrulama, versioning ve IP tescil kayıtlarının tutulmasından sorumludur.
- **Lead Artist / Discipline Lead**: Disiplin (modeling, rigging, animation, lighting) başına teknik kalite kapısı; bu politikanın kalite maddelerini uygulama yetkilisi.
- **Render Farm Yöneticisi**: Deadline/Tractor kuyruk yönetimi, node resource quota zorlaması, failover ve cost tracking.
- **CISO**: Politika onayı, kritik incident yönetimi, dış denetim koordinasyonu.
- **DPO & IP Counsel**: Telif hakları, DMCA, model lisans (CC, Royalty-Free, Editorial) yönetimi; OFAC yaptırım kontrolü.
- **Dış Tedarikçi / Vendor**: Asset sağlayıcı; DPA (Data Processing Agreement) ve Asset License Agreement (ALA) imzalı taraf.

### 5. Politika Maddeleri

**5.1** Tüm harici 3D dosyalar (vendor, marketplace, community) üretim pipeline'ına alınmadan önce zorunlu 72 saatlik "cold quarantine" sandbox'ında bekletilir. Sandbox, ağ erişimi olmayan, kullanıcı ev dizinine yazamayan, salt okunur çalıştırılan izole bir Linux container'dır (Fedora 40, AppArmor profile, seccomp filter). Quarantine'de dosya otomatik static analysis (Assimp, usdchecker, gltf-validator) ve dynamic honeypot render işleminden geçer.

**5.2** Polygon DoS koruması: Tek bir asset dosyası maksimum 2 milyon triangle içerebilir; tek bir sahne toplamı maksimum 20 milyon triangle'dır. Bu sınırı aşan dosyalar otomatik reddedilir ve "polybomb şüphesi" bayrağıyla güvenlik ekibine iletilir. LOD (Level of Detail) gerektiren asset'ler için LOD0 ≤ 500K triangle, LOD1 ≤ 125K, LOD2 ≤ 30K, LOD3 ≤ 8K zorunludur.

**5.3** Texture bellek kotaları: Tek bir asset başına maksimum 8K × 8K × 4 kanal (256 MB raw) texture; tek bir sahne toplamı maksimum 16 GB VRAM hedefi. Mobile platformlar için 2K × 2K limiti uygulanır. HDR/EXR texture'lar 32-bit float yerine 16-bit float (Half) zorunludur. Texture Bomb tespiti: 4K üzeri tek texture veya tek sahnde 4+ 8K texture varsa otomatik uyarı.

**5.4** Malicious geometry detection: Asset import pipeline'ı şu otomatik kontrolleri yürütür — (i) degenerate triangle oranı >%0.5 ise reddet; (ii) NaN/Inf vertex tespiti varsa reddet; (iii) bounding box'un mesh centroid'inden >1000 birim uzakta olması "uncanny bounding box" alarmı; (iv) vertex başına ortalama 8+ bone ağırlığı varsa reddet (skin limit 4); (v) UV koordinatında NaN veya 1B+ birim aşım varsa reddet; (vi) tek bir object içinde 1M+ sub-object varsa "object bomb" alarmı.

**5.5** Gömülü betik (embedded script) taraması zorunludur. Blender Python (`.blend` içinde Text block), Maya MEL/Python (`.ma`/`.mb` script node), 3ds Max MaxScript, Houdini Python SOP'ları ve `.glb`'de KHR_animation_pointer istismarı için özel imza kütüphanesi (ClamAV + özel YARA kuralları) çalıştırılır. Onaylanmamış module import (`subprocess`, `socket`, `ctypes`, `os.system`, `urllib`) pozitif eşleşmesi durumunda dosya karantinada kalır ve 3D Security Lead manuel incelemesine alınır.

**5.6** UNC yol istismarı koruması: Windows iş istasyonlarında `.max`, `.ma`, `.blend` dosyalarının içerebileceği `\\attacker\share\` UNC path referansları otomatik tespit edilir ve bloke edilir. Bu, SMB NTLM hash relay saldırısına (Politika 15 Ağ Güvenliği Madde 5.9 ile çapraz referans) karşı önlemdir. Dosya, UNC referansları temizlenmeden prodüksiyona alınamaz.

**5.7** Asset manifest zorunluluğu: Her teslim edilen asset; asset UUID, bağımlılık listesi (texture, shader, referans sahne), kullanılan lisans, yazar, oluşturma tarihi ve content hash (SHA-256) içeren bir `manifest.json` (glTF için `.json` sidecar, USD için `.usda` custom layer metadata) ile gelmelidir. Manifest olmadan asset DB'ye kayıt yapılmaz; pipeline TD commit'i reject eder.

**5.8** Resource quota: Her kullanıcı için günlük kotalar — (i) render farm CPU-saat: 1000 CPU-saat/gün; (ii) VRAM-saat: 8192 GB-saat/gün; (iii) disk I/O: 500 GB/gün; (iv) texture bake GPU-saat: 200 GPU-saat/gün. Kota aşımı otomatik job kill ile sonuçlanır; süreç 3 iş günü içinde Pipeline TD'ye bildirilir. Kota artırım talebi discipline lead onayı ile Possible.

**5.9** GPU OOM (Out-of-Memory) koruması: Render node'larında GPU VRAM %95 kullanımı 30 saniye aşarsa ilgili otomatik job kill edilir, fault kaydı SIEM'e (Splunk/Sentinel) gönderilir ve üç defa tekrar eden asset "memory hog" bayrağıyla işaretlenir. AAA GPU'lar (RTX 4090 24GB, A100 80GB, H100 80GB) için ayrı kotalar tanımlanır.

**5.10** Asset şifreleme: Üretim öncesi "gizli" (NDA altında, unreleased IP) asset'ler, transit ve at-rest AES-256-GCM ile şifrelenir. Anahtar yönetimi AWS KMS veya HashiCorp Vault transit secret engine üzerinden yapılır. Anahtar rotasyonu 90 günde bir uygulanır. Politika 4 (Şifreleme) ile çapraz referans.

**5.11** Asset provenance (köken) zinciri: Her asset'in yaşam döngüsü boyunca hangi tool'da, hangi kullanıcı tarafından, hangi lisans altında üretildiği immutable bir audit log'a (append-only ledger — Apache Kafka + S3 Object Lock) yazılır. Bu, IP anlaşmazlıklarında (DMCA counter-notice) kanıt teşkil eder ve Politika 38 (3D Asset Versioning & IP) ile entegredir.

**5.12** Watermarking: AAA unreleased asset'lere invisible (frequency-domain DCT) ve visible (köşe logosu) watermark uygulanır. Invisible watermark, asset'in kopyalanıp sızdırılması durumunda kaynak tespiti için kullanılır. Watermark algoritması: stable diffusion tolerant, JPEG/PNG compression'a dayanıklı, en az 64-bit payload taşıyan bir algoritma (ör. Stable Signature, DEW — Differential Energy Watermarking).

**5.13** Asset store satın alımlarında lisans denetimi zorunludur. Unity Asset Store, Unreal Marketplace, Sketchfab, TurboSquid, CGTrader ve ArtStation Marketplace satın alımlarında lisans tipi (Personal, Professional, Editorial, Royalty-Free, CC-BY, CC0) Asset DB'ye kaydedilir. Editorial-only asset'ler ticari prodüksiyonda kullanılamaz; kullanımı Politika 38 Madde 5.6'da tanımlı yaptırıma tabidir. OFAC yaptırım listesi vendor country bazlı kontrol edilir.

**5.14** Dış tedarikçi (outsourcing studio) teslimatları yalnızca SFTP (SSH key authentication) veya kurumsal Aspera/Signiant Media Shuttle üzerinden kabul edilir. E-posta ekleriyle 3D dosya teslimatı yasaktır; e-posta yalnızca küçük referans görselleri (JPG < 5 MB) için kullanılabilir. Tüm SFTP upload'ları otomatik quarantine bucket'ına düşer.

**5.15** Çevresel (environmental) güvenlik: Render farm elektrik tüketimi için karbon ayak izi takibi yapılır; her asset'in "carbon cost" metriği (kWh/render) raporlanır. Bu, kurumun SBTi (Science Based Targets) taahhüdü ile uyumludur ve Politika 37 Madde 5.10 ile çapraz referanslıdır.

### 6. Prosedürler & İş Akışları

**Asset Onboarding Süreci**:
1. Tedarik kanalı (vendor, marketplace, iç üretim) kayıt altına alınır; lisans belgesi Asset DB'ye yüklenir.
2. Dosya, quarantine SFTP bucket'ına yüklenir (write-only, no-list bucket).
3. **Stage 1 — Static Analysis**: gltf-validator, usdchecker, Assimp import denemesi; imza kütüphanesi (YARA + ClamAV) tarayışı.
4. **Stage 2 — Sandbox Render**: İzole Blender/Maya container'ında dosya açılır, ekran görüntüsü alınır, polygon/texture/bone istatistikleri toplanır.
5. **Stage 3 — Malicious Geometry Check**: Degenerate triangle, NaN vertex, uncanny bounding box, UNC path taraması.
6. **Stage 4 — Manifest Validation**: SHA-256 hash hesaplanır, `manifest.json` doğrulanır, lisans DB'ye kaydedilir.
7. **Stage 5 — Watermark Embedding**: Gizli asset'ler için invisible watermark gömülür.
8. **Stage 6 — Asset DB Registration**: UUID atanır, version 1.0.0 oluşturulur, kütüphane dizinine taşınır.
9. **Stage 7 — Reviewer Attestation**: Asset Librarian ve Discipline Lead çift imzası ile "Approved for Production" statüsü verilir.
10. Tüm adımlar SIEM'e log olarak yazılır; ortalama onboarding süresi 6 saat, SLA 24 saattir.

**İhlal Müdahale Süreci**: Sandbox, malicious betik tespit ederse CISO'ya otomatik P1 alert; Politika 10 (Olay Müdahalesi) süreci tetiklenir. Affected node'lar isolation'a alınır, kullanıcının workspace'i forensic snapshot ile incelemeye gönderilir.

### 7. Uyumluluk & İzleme

- ISO/IEC 27001:2022 A.5.12 (Classification of Information), A.5.14 (Information Transfer), A.8.10 (Information Deletion), A.8.16 (Monitoring Activities).
- ISO 9001:2015 Madde 8.5.1 (Production and Service Provision Control).
- KPI'lar: (i) Quarantine bypass oranı %0 (hedef); (ii) Malicious asset tespit oranı ≥%99.5; (iii) Polygon DoS incident sayısı 0/ay; (iv) Sandbox render SLA uyum %95+; (v) Manifest completeness %100; (vi) Resource quota aşımı 5/ay'dan az.
- SIEM korelasyonu: Splunk veya Microsoft Sentinel'da "asset-onboarding" custom dashboard; anomali (ör. aynı kullanıcının 50 asset/gün) otomatik alert.

### 8. İhlal Yaptırımları

- Sandbox'ı atlayarak asset'i doğrudan prodüksiyona alan kullanıcı: yazılı uyarı + 1 hafta asset yükleme yasağı.
- Kara listeli vendor'dan asset satın alma: sözleşme ihlali bildirimi + gerekirse fesih.
- Resource quota'yı kasten aşma (ör. GPU farm'ı "polybomb" ile meşgul ederek rakip projeyi geciktirme): disiplin süreci, gerekirse sonlandırma (Politika 18 Madde 9 uygulanır).
- Karbon ayak izi raporlamasını gizleme: CMO + Sustainability Officer bilgilendirme.

### 9. İstisnalar

- Araştırma & geliştirme (R&D) prototipleri, sandbox yerine "research sandbox" (daha geniş kotalar, ağ erişimi yok) kullanabilir; ancak üretim sahnelerine referans veremez.
- Eski (legacy) AAA başlık için hotfix amaçlı asset değişikliği, kısmi quarantine (Stage 1+3) ile geçebilir; tam onboarding 5 iş günü içinde tamamlanır.
- İç kullanıcı tarafından üretilen ve hiç dış kaynaktan gelmeyen asset'ler için Stage 5 (Malicious Geometry) atlanabilir; ancak Stage 4 (Manifest) zorunludur.

### 10. İlgili Standartlar

- glTF 2.0 Core Specification (Khronos Group, 2020) — asset validation.
- Universal Scene Description (USD) v24.08 (Pixar Animation Studios) — usdchecker.
- OWASP File Upload Cheat Sheet.
- MITRE ATT&CK T1204 (User Execution — Malicious File), T1059 (Command Scripting Interpreter).
- ISO/IEC 27001:2022 A.5.12, A.5.14, A.8.10, A.8.16.
- NIST SP 800-86 (Forensics) — malicious asset examination.
- ACES (Academy Color Encoding System) v1.3 — color pipeline integrity.
- Çapraz referans: Politika 4 (Şifreleme), Politika 10 (Olay Müdahalesi), Politika 14 (Donanım), Politika 15 (Ağ), Politika 38 (Asset Versioning & IP).

### 11. Onay & Revizyon Geçmişi

| Sürüm | Tarih | Hazırlayan | Onaylayan | Değişiklik |
|-------|-------|------------|-----------|------------|
| 1.0 | 2026-06-21 | 3D Security Lead | CISO + CTO | İlk yayın |
| 1.1 | (planlı) 2027-01-15 | 3D Security Lead | CISO + CTO | USD v25 güncellemesi + AI watermark entegrasyonu |

---

## Politika No: 32 — Model Doğrulama & Kalite Kontrol Politikası

### 1. Amaç

Bu politika, NEXUS 3D Studio'nun AAA prodüksiyonunda kullanılacak tüm 3D modellerin kalite, teknik doğruluk ve platform uyumluluk açısından sistematik doğrulanmasını sağlamak amacıyla hazırlanmıştır. Bir modelin polygon sayısı, UV bütünlüğü, topoloji kalitesi, naming convention, LOD uyumu ve asset manifest doğruluğu doğrudan performans (frame rate), görsel kalite (artifact-free rendering) ve multiplayer senkronizasyon (network bandwidth) üzerinde etkili olduğundan, kalite kapısı (quality gate) ihlalleri üretim gecikmelerine ve milyonlarca dolarlık düzeltme (rework) maliyetlerine yol açabilir. Politika; Pixar Animation Studios "Definition of Done", Weta Digital "Asset Validation Pipeline" ve Epic Games "Locked Stack" prensiplerini temel alır.

İkincil amaçlar: (i) polygon count limitlerini platform başına (PC, PS5, Xbox Series X/S, Switch, mobile, VR/AR) netleştirmek; (ii) UV integrity (overlap, flip, missing island) denetimini otomatikleştirmek; (iii) topology check (n-gon, triangle fan, pole, edge loop) için teknik standartları tanımlamak; (iv) AAA naming convention (snake_case, suffix-based, semantic) zorunluluğunu getirmek; (v) LOD compliance'ı otomatik CI pipeline'ına entegre etmek; (vi) asset manifest'in runtime uyumluluğunu garanti etmek.

### 2. Kapsam

Tüm static mesh, skeletal mesh, morph target (blendshape), LOD chain, collision mesh, proxy mesh, hair groom (XGen, Nitrohair) ve destructible asset'ler kapsam dahilindedir. Platform hedefleri: PC (DX12/Vulkan), PlayStation 5, Xbox Series X/S, Nintendo Switch, Meta Quest 3, Apple Vision Pro, iOS (A17 Pro+), Android (Adreno 740+) ve cloud streaming (GeForce NOW). Politika; DCC (Blender, Maya, 3ds Max, Houdini, ZBrush) çıkışını, runtime engine (Unreal Engine 5.4, Unity 2023 LTS) import'unu ve build pipeline'ını kapsar.

### 3. Tanımlar

- **Topology Check**: Mesh'in edge flow, pole dağılımı, n-gon oranı ve quad/triangle oranının teknik standartlara uygunluğu.
- **UV Island**: UV alanında ayrık, sınırları dikdörtgen olan bir UV segmenti.
- **UV Overlap**: İki UV island'ın aynı UV koordinat bölgesini paylaşması; lightmap bake'te artifact yaratır.
- **Naming Convention**: Asset isimlendirme standardı — `[Project]_[AssetType]_[Descriptor]_[LOD#]_[Version]` formatı.
- **LOD (Level of Detail)**: Kameraya uzaklığa göre değişen polygon detay seviyesi (LOD0 = en yakın, LODn = en uzak).
- **Morph Target / Blendshape**: Vertex'lerin deformasyon hedefi; yüz animasyonu ve facial expression için kullanılır.
- **Pole**: Bir vertex'e 5+ edge bağlanması; deformasyonda pinch artifact yaratır.
- **Triangle Fan**: Tek bir merkez vertex'e çok sayıda edge bağlanması; sub-optimal deformasyon.
- **Asset Manifest**: Asset'in bağımlılık listesi, version, lisans ve SHA-256 hash içeren sidecar meta dosyası.
- **CI Quality Gate**: Continuous Integration pipeline'ında otomatik kalite kontrol aşaması; fail durumunda merge bloke edilir.
- **N-gon**: 5+ kenarlı polygon; sub-optimal deformasyon ve tessellation belirsizliği yaratır.

### 4. Roller & Sorumluluklar

- **Lead Modeler**: Modeling disiplininin teknik sahibi; topology check ve naming convention şartlarının uygulanmasından sorumludur.
- **Quality Assurance (QA) Artist**: Model doğrulama tool'larını (MeshLab, Simplygon SDK, Unreal Asset Audit, MFT Tool) çalıştıran teknik sanatçı.
- **Pipeline TD**: CI quality gate entegrasyonu, manifest validator ve LOD auto-generator'ün bakımı.
- **Technical Art Director**: Sanatsal kalite ile teknik kalite arasında arbitraj; "looks good AND performs good" kararı.
- **Build Engineer**: Build pipeline'ında quality gate gate'lerinin zorlanması.
- **CISO & DPO**: Manifest'teki IP/lisans verilerinin denetimi (Politika 38 ile çapraz referans).

### 5. Politika Maddeleri

**5.1** Polygon count limitleri platform başına zorunludur. PC AAA: tek karakter (hero) LOD0 ≤ 80K triangle, tek prop ≤ 15K triangle, tek environment cluster ≤ 30K triangle; sahne toplam ≤ 5M triangle. PS5/Xbox Series X: PC'nin %75'i. Switch: PC'nin %15'i (hero ≤ 12K, sahne ≤ 750K). Mobile: PC'nin %5'i (hero ≤ 4K, sahne ≤ 250K). VR (Quest 3): PC'nin %20'si, ancak 72 FPS garantisi nedeniyle stereoscopic render maliyeti düşülür.

**5.2** UV integrity denetimi: Tüm textured asset'lerde UV'ler zorunlu olarak denetlenir — (i) UV overlap (iki island'ın 0.001 UV²'den fazla kesişmesi) %0 tolerans; (ii) UV flip (negatif area) yasaktır; (iii) UV island'ların 0-1 UV karesi dışına taşması (wrapping hariç) yasaktır; (iv) lightmap UV (channel 1) zorunlu, max 1024×1024 texel/birim²; (v) texture bleeding için padding en az 4 piksel (4K texture) veya 16 piksel (256 texture).

**5.3** Topology check: Quad oranı ≥%95 (triangle fallback kabul, n-gon yasak); pole sayısı sınırlı (kafa modelinde 5-pole'lar yüz mimik vertex'leri için izinli, ancak vücut mesh'inde pole >12 yasak); edge loop'lar anatomik akışa uygun olmalı (anima kaynaklı); triangle fan (5+ triangle tek vertex) yasak; T-junction (vertex bir edge'in ortasında ama edge parçalanmamış) yasaktır.

**5.4** Naming convention zorunludur: `PROJ_TYPE_DESCRIPTOR_LODn_vMAJOR.MINOR`. Örnek: `NEXUS_CHAR_HeroSoldier_LOD0_v1.2`. Tür kodları: CHAR (karakter), PROP (prop), ENV (environment), WPN (silah), VEH (araç), FX (efekt), COL (collision). Dosya adında boşluk, Türkçe karakter (ç, ğ, ı, ş, ö, ü), özel karakter (?, *, &, <, >, ", |, :, \, /) yasaktır; yalnızca ASCII `[a-zA-Z0-9_]` kullanılabilir.

**5.5** LOD compliance: Tüm karakter ve prop asset'leri en az 4 LOD seviyesi içerir — LOD0 (full detail), LOD1 (%50 triangle), LOD2 (%25 triangle), LOD3 (%10 triangle, billboard placeholder). LOD geçiş mesafeleri (Screen Size) Unreal'da 0.5/0.2/0.05/0.01, Unity'de 60m/120m/240m/500m olarak tanımlanır. LOD auto-generation için Simplygon veya Houdini PolyReduction kullanılır; manuel düzenleme sonrası LOD chain yeniden doğrulanır.

**5.6** Asset manifest zorunlu: Her asset `.json` sidecar içerir — `asset_uuid`, `version` (semantic), `author`, `created_at`, `modified_at`, `dependencies[]` (texture, material, morph target, referans sahne), `license`, `content_sha256`, `platform_tags[]` (pc, ps5, xbox, switch, mobile), `lod_chain[]` (her LOD için triangle count, screen size), `bounding_box` (min/max XYZ). Manifest şeması JSON Schema (Draft 2020-12) ile doğrulanır.

**5.7** UV channel ayrımı: Channel 0 = texture UV (albedo, normal, roughness); Channel 1 = lightmap UV (unique unwrap, padding ≥8px); Channel 2 = detail UV (tiling); Channel 3 = custom (ör. vertex paint mask). Birden fazla UV channel kullanımı zorunlu; lightmap bake için channel 1'in unique olması şarttır.

**5.8** Morph target (blendshape) kuralları: Facial animation için morph target sayısı karakter başına ≤ 80 (ARKit standardında 52 + custom 28). Her morph target, base mesh ile aynı vertex count ve vertex order'a sahip olmalıdır; aksi takdirde runtime hatası yaratır. Morph target naming: `[MeshName]_MT_[ExpressionName]` (ör. `HeroFace_MT_JawOpen`).

**5.9** Collision mesh kuralları: Her interactable asset için basit collision (UCX_ prefix, Unreal convention) zorunludur. Collision mesh, render mesh'in %5'i polygon sayısını aşamaz; convex decomposition maksimum 8 parça; karmaşık asset için HCI (Hierarchical Collision) uygulanır. Player collision (PCC), AI navigation (NavMesh) ve physical simulation (Chaos/PhysX) için ayrı collision set'leri tanımlanır.

**5.10** Bounding box & scale: Asset'ler meter cinsinden modellenir (1 Unreal unit = 1 cm, 1 Blender unit = 1 m). Bounding box, mesh centroid'ine göre makul olmalı (centroid'ten en uzak vertex ≤ 2× asset ana eksen uzunluğu). Scale drift (0.01x veya 100x scale factor) yasaktır; import sırasında scale reset yapılmalıdır.

**5.11** Hard surface edge flow: Subdivision-ready (Catmull-Clark) asset'lerde crease edge'ler belirgin, supporting loop'lar mevcut ve shading smooth group'lar tanımlı olmalıdır. Hard edge (sharp normal break) ve soft edge tanımları material boundary ile uyumlu olmalı; bake artifact yaratmamalıdır.

**5.12** Vertex color policy: Vertex color channel'ları (R, G, B, A) anlamlı kullanılır — R = AO bake, G = vertex paint mask, B = wetness/dirt, A = wind animation weight. Kullanılmayan channel'lar default (0,0,0,1) değerindedir. Vertex color ile texture blending, performans için shader branch azaltır (Politika 39 Madde 5.4 ile çapraz).

**5.13** Validation CI gate: Her pull request'te, değiştirilen asset'ler için otomatik `nexus-asset-validator` tool'u çalışır. Tool; Assimp import, polygon count, UV integrity, topology, naming, LOD, manifest doğrulaması yapar. Tek bir ERROR bulunursa PR bloke edilir; WARNING'ler PR comment olarak yazılır ama merge'e engel değildir. ERROR'lar: polygon limit aşımı, UV overlap, missing manifest, naming violation. WARNING'lar: pole >8, n-gon var, lightmap padding düşük.

**5.14** Auto-fix script'leri: Bazı ihlaller için auto-fix script'leri çalışır — (i) naming convention: otomatik rename + PR comment; (ii) UV padding: otomatik padding expansion; (iii) lightmap UV generate: Houdini UV Flatten ile otomatik unique unwrap; (iv) LOD auto-generate: Simplygon ile LOD chain oluşturma. Auto-fix sonrası kullanıcı teyit verir, manuel onay olmadan merge olmaz.

**5.15** Asset review cycle: Her major asset (hero character, hero prop, signature environment) en az 2 senior artist + 1 art director + 1 technical art director tarafından review edilir. Review annotation'ları Frame.io veya ShotGrid (Autodesk Flow Production Tracking) üzerinden yapılır; "Approved", "Changes Requested", "Rejected" statüleri ile sürüm takibi yapılır.

### 6. Prosedürler & İş Akışları

**Model Validation Workflow**:
1. Artist, asset'i DCC'den (Blender/Maya) `.fbx` veya `.glb` olarak export eder; naming convention uygulanır.
2. Asset DB'ye commit (Perforce Helix Core veya Git LFS) yapılır; pre-commit hook manifest doğrulaması çalıştırır.
3. CI pipeline: `nexus-asset-validator` çalışır, rapor PR comment olarak yazılır.
4. Hata varsa: artist düzeltir, yeni commit; auto-fix çalışabilir, manuel teyit gerekir.
5. Hata yoksa: QA artist manuel review (topology, edge flow, pole, anatomy) yapar.
6. Approved: asset "Ready for Engine" statüsüne geçer.
7. Engine import: Unreal/Unity'ye import edilir, material assignment yapılır, build test çalışır.
8. Build test: PS5/Xbox/Switch dev kit'te sahne yüklenir, frame rate ve memory ölçülür.
9. Final approval: Technical Art Director imzası; asset "Locked" statüsüne geçer, sonraki değişiklikler major version artışı gerektirir.

### 7. Uyumluluk & İzleme

- ISO 9001:2015 Madde 8.5.1 (Control of Production and Service Provision), Madde 8.6 (Release of Products and Services).
- ISO/IEC 27001:2022 A.5.12 (Information Classification), A.8.25 (Secure Development Lifecycle).
- KPI'lar: (i) Validation ERROR ilk denemede %0 (hedef); (ii) Asset "Locked" sonrası rework oranı <%5; (iii) Naming violation sayısı ayda <10; (iv) LOD chain completeness %100; (v) Build test pass rate %95+.
- Dashboard: ShotGrid custom dashboard "Asset Validation" — ERROR/WARNING heatmap, platform-bazlı compliance oranı.

### 8. İhlal Yaptırımları

- Naming convention ihlali (üç kez üst üste): artist için 1 saat naming training zorunlu.
- Polygon limit bilerek aşma (özellikle "guestimate" yaklaşımı): lead modeler uyarısı.
- Asset'i validation gate'i atlayarak "Locked" statüsüne geçirme: build engineer uyarısı + pipeline TD ile görüşme.
- LOD chain eksik asset'in üretim sahnesinde kullanılması: sahne "failed build" olarak işaretlenir, sahne sahibi uyarılır.

### 9. İstisnalar

- Cinematic (pre-rendered) asset'ler polygon limitinin 10 katına çıkabilir; ancak "CINEMATIC_ONLY" tag zorunludur ve runtime sahnede kullanılamaz.
- Prototype / graybox asset'ler validation'dan muaf; ancak "PROTOTYPE" prefix zorunludur ve release build'de yer alamaz.
- Eski legacy asset'ler (3+ yaşında) için "legacy compliance" tolerance: polygon %150, naming eski standarda izinli.

### 10. İlgili Standartlar

- glTF 2.0 Asset Validation (Khronos gltf-validator).
- Universal Scene Description (USD) Asset Validation — usdchecker.
- Pixar Animation Studios Asset Validation Pipeline (OpenSubdiv, OpenColorIO).
- Epic Games Unreal Engine 5.4 Asset Audit.
- Unity 2023 LTS HDRP Asset Validator.
- Simplygon 10 SDK LOD Compliance.
- ISO 9001:2015 Madde 8.5.1, 8.6.
- ISO/IEC 27001:2022 A.5.12, A.8.25.
- Çapraz referans: Politika 31 (3D Asset Security), Politika 33 (Format Standards), Politika 39 (Real-time Performance).

### 11. Onay & Revizyon Geçmişi

| Sürüm | Tarih | Hazırlayan | Onaylayan | Değişiklik |
|-------|-------|------------|-----------|------------|
| 1.0 | 2026-06-21 | Lead Modeler + Pipeline TD | Technical Art Director + CTO | İlk yayın |
| 1.1 | (planlı) 2027-01-15 | Lead Modeler | Technical Art Director | Switch 2 polygon limit güncellemesi |

---

## Politika No: 33 — 3D Dosya Format Standartları Politikası

### 1. Amaç

Bu politika, NEXUS 3D Studio'nun tüm 3D prodüksiyon aşamalarında kullanılacak dosya formatlarının standartlaştırılmasını, sürdürülebilirliğini ve format bağımsız (interoperable) bir pipeline kurulmasını amaçlar. AAA prodüksiyon; farklı DCC (Digital Content Creation) araçları, runtime engine'ler ve build pipeline'ları arasında günlük on binlerce dosya aktarımı yapar — format seçimi yanlış yapıldığında veri kaybı (lossy conversion), shader uyumsuzluğu, animation drift ve build failure kaçınılmazdır. Politika, her formatın güçlü/zayıf yönlerini, hangi senaryoda tercih edilmesi gerektiğini ve version-control entegrasyonunu netleştirir.

İkincil amaçlar: (i) glTF 2.0'ı ana "exchange & runtime" formatı olarak tesis etmek; (ii) FBX'in legacy ama zorunlu bir köprü olarak yerini tanımlamak; (iii) USD'yi enterprise "scene assembly & collaboration" formatı olarak kurmak; (iv) `.blend`, `.max`, `.ma`/`.mb` gibi DCC-native formatları "source of truth" olarak konumlandırmak; (v) OBJ/STL'i yalnızca 3D print ve prototyping için sınırlandırmak; (vi) version control ve binary diff stratejisini tanımlamak; (vii) format conversion pipeline'ını otomatize etmek.

### 2. Kapsam

Tüm 3D prodüksiyon dosya türleri ve bunların yaşam döngüsü: DCC source (`.blend`, `.max`, `.ma`, `.mb`, `.hip`, `.zpr`, `.spp`), exchange format (FBX, glTF 2.0, USD), runtime export (`.pak`, `.obb`, `.unity3d`, `.asar`), print format (OBJ, STL, 3MF) ve arşiv format (`.7z`, `.tar.zst`). Pipeline: DCC → Exchange → Runtime → Archive. Kullanım alanları: karakter modeling, environment art, animation, lighting, VFX, cinematic, 3D print prototyping.

### 3. Tanımlar

- **glTF 2.0 (GL Transmission Format)**: Khronos Group'un open standard runtime formatı; JSON + binary buffer; web ve mobil için optimize.
- **USD (Universal Scene Description)**: Pixar'ın open-source scene assembly formatı; layer-based non-destructive editing.
- **FBX (Filmbox)**: Autodesk'in proprietary formatı; endüstri standardı ama kapalı spec; legacy bridge.
- **.blend**: Blender'ın native formatı; tüm scene verisi (object, modifier, animation, node) lossless saklar.
- **OBJ**: Wavefront text format; basit geometry ve material; UV destekli.
- **STL**: 3D print de-facto standardı; yalnızca geometry, no UV/color.
- **Alembic (.abc)**: VFX pipeline için baked geometry cache; deformable surface'leri depolamak için.
- **OpenVDB (.vdb)**: Volume data (smoke, fire, cloud) için open standard.
- **MaterialX (.mtlx)**: Material ve shader'ların portable tanımı; ILM öncülüğünde.
- **Conversion Pipeline**: Bir formatdan diğerine otomatik dönüşüm zinciri (DCC → glTF/USD → runtime).

### 4. Roller & Sorumluluklar

- **Pipeline Director**: Format stratejisinin sahibi; format seçim kararlarını onaylar.
- **Pipeline TD (Technical Director)**: Conversion script'leri (Python, usdcat, fbx-conv, gltf-transform), validator ve exporter bakımı.
- **Build Engineer**: Runtime format üretimi ve build pipeline entegrasyonu.
- **IT Architect**: Storage ve version control altyapısı (Perforce Helix Core, Git LFS, Git Annex).
- **Asset Librarian**: Format metadata, conversion history ve retention policy uygulaması.
- **DCC Vendor Liaison**: Autodesk, Blender Foundation, SideFX ile teknik iletişim.

### 5. Politika Maddeleri

**5.1** glTF 2.0, kurumun ana "exchange and runtime" formatıdır. Tüm asset'ler DCC'den çıktıktan sonra mutlaka glTF 2.0 export'u üretilir; bu, asset DB'deki "kanonik" sürümdür. glTF; binary (`.glb`) ve JSON+bin (`.gltf`) olmak üzere iki varyantta kullanılır — `.glb` mobile/web için, `.gltf` (text) debug ve version control için.

**5.2** FBX, "legacy bridge" formatı olarak tanımlanır. Yalnızca şu senaryolarda kullanılır: (i) Unreal Engine/Unity'ye skinning+animation birlikte taşımak (glTF'nin Unity import plugin'i olgunlaşana kadar); (ii) MotionBuilder'dan Maya'ya animation transfer; (iii) eski Motion Capture vendor'ları (Vicon, OptiTrack) FBX output'u. FBX version lock: FBX 2020 (ASCII/Binary uyumlu) — yeni FBX sürümleri (2022+) yalnızca upgrade vakti geldiğinde kabul edilir.

**5.3** USD, kurumun enterprise "scene assembly & collaboration" formatıdır. AAA karakter crowd scene, environment composition ve cinematic shot assembly USD layer'ları ile yapılır. USD variant set'leri (ör. character "summer outfit" / "winter outfit") ile non-destructive alternatifler tanımlanır. Pixar, ILM, Apple Vision Pro ve NVIDIA Omniverse ile uyumlu.

**5.4** DCC-native formatlar (`.blend`, `.max`, `.ma`, `.mb`, `.hip`, `.zpr`, `.spp`) "source of truth" olarak saklanır. Her asset'in en az bir DCC-native source dosyası olmalı; glTF/USD bu source'dan generate edilir. Source dosya, DCC version belirtilerek (ör. `Blender 4.2 LTS`) commit edilir; DCC upgrade sonrası tüm source'lar otomatik re-export edilir.

**5.5** OBJ ve STL yalnızca 3D print ve rapid prototyping için kullanılır; üretim pipeline'ında "geometry-only" reference olarak ikincil rol oynar. STL binary formatı tercih edilir (ASCII STL 5× daha büyük). OBJ, MTL material library ile birlikte kullanılır.

**5.6** Format conversion pipeline otomatiktir. Pipeline TD'nin yazdığı Python script'leri (Blender bpy, Maya OpenMaya, Houdini hython) DCC-native source'dan glTF/USD üretir. Conversion her commit sonrası CI'da çalışır; output (glTF/USD) asset DB'ye yazılır. Manuel conversion yasaktır — kullanıcı bir script bypass edemez.

**5.7** Format version kilitleri: glTF 2.0 (spec v2.0.0), USD v24.08 LTS, FBX 2020, Alembic 1.8, OpenVDB 11. Yeni major version release'inden en az 6 ay geçmeden upgrade yapılmaz; upgrade öncesi tüm asset'lerin regression test'i koşulur.

**5.8** Binary diff stratejisi: DCC-native formatlar (`.blend`, `.max`) binary diff'e uygun değildir; Perforce Helix Core veya Git LFS ile saklanır, diff görünmez. glTF text (`.gltf`) ve USD ASCII (`.usda`) difflenebilir; Git ile diff review yapılır. Binary cache'ler (`.glb`, `.usdc`, `.abc`) Git LFS pointer ile saklanır, gerçek binary LFS server'da.

**5.9** glTF extension politikası: Kurum, glTF extension'ları şu şekilde sınıflandırır — (i) Approved: `KHR_materials_pbrSpecularGlossiness`, `KHR_materials_unlit`, `KHR_draco_mesh_compression`, `KHR_texture_basisu`, `KHR_lights_punctual`, `KHR_materials_variants`, `KHR_mesh_quantization`; (ii) Conditional: `EXT_mesh_gpu_instancing`, `KHR_materials_clearcoat` (yalnızca AAA PC/PS5); (iii) Prohibited: deneysel `EXT_` extension'lar. Extension kullanımı asset manifest'te listelenmelidir.

**5.10** USD layer composition politikası: USD sahneler sublayer ve reference ile kompoze edilir. Sublayer'lar tek bir sahne içinde düzen için kullanılır (ör. `lighting.usda` sublayers `geometry.usda`); reference'lar asset'leri çekmek için (ör. `shot_010.usda` references `char_hero.usda`). Variant set'ler (ör. `LOD`, `Outfit`) non-destructive alternatif sunar. Opinion strength: local > sublayer > reference; bu kural ihlal edilirse "composition error" üretilir.

**5.11** Compression politikası: glTF için `KHR_draco_mesh_compression` (geometry, lossy) ve `KHR_texture_basisu` (texture, KTX2 container, transcode) zorunludur (mobile/web). USD için `usdz` package (Apple distribution) ve `usdc` (binary crate) tercih edilir. Alembic için `Ogawa` backend (HDF5 yerine, 2-3× daha küçük).

**5.12** Texture formatları: PNG (lossless, albedo, mask), JPEG (lossy, photographic reference, UI), OpenEXR (HDR, environment map, displacement), KTX2 (runtime compressed, BC7/ASTC/ETC2), DDS (legacy runtime). TIFF ve TGA yasaktır (modern pipeline'da yeri yok). Color space: sRGB (albedo, emission), Linear (normal, roughness, metallic, height, AO).

**5.13** Material formatı: MaterialX (`.mtlx`) — shader graph'ların portable tanımı. USD Material binding ve glTF PBR metallic-roughness ile uyumlu. Substance Painter/Designer'dan MaterialX export'u zorunludur; `.sbsar` (Substance Archive) source-of-truth olarak saklanır.

**5.14** Animation formatı: glTF 2.0 animation (skeletal ve morph target), USD SkelAnimation, Alembic (baked deformable), FBX animation (legacy). Animation data `.abc` olarak baked cache saklanır, source `.ma`/`.blend` ile birlikte.

**5.15** Retention policy: DCC-native source → kalıcı (süre yok); glTF/USD exchange → kalıcı; runtime export (`.pak`, `.obb`) → 90 gün; intermediate conversion (`.fbx`, `.obj`) → 30 gün; debug dump → 7 gün. Retention süresi dolan dosyalar otomatik arşive (S3 Glacier Deep Archive) taşınır.

### 6. Prosedürler & İş Akışları

**Asset Conversion Pipeline**:
1. Artist, DCC-native dosyayı commit eder (ör. `hero_soldier.blend`).
2. CI: pre-commit hook, dosya adı naming convention (Politika 32) doğrular.
3. Post-commit: `nexus-converter` pipeline tetiklenir — Blender bpy script çalışır, `.blend`'den glTF 2.0 + USD üretir.
4. Validator: gltf-validator ve usdchecker çalışır; hata varsa conversion başarısız, artist bildirilir.
5. Asset DB: glTF/USD output kaydedilir, manifest güncellenir.
6. Runtime export: Unreal Engine/Unity için platform-specific build (`.pak` PC, `.obb` mobile) üretilir.
7. Distribution: runtime paketleri CDN'e yüklenir, versioned.

### 7. Uyumluluk & İzleme

- ISO 9001:2015 Madde 7.5 (Documented Information).
- ISO/IEC 27001:2022 A.5.12, A.8.10 (Information Lifecycle).
- KPI'lar: (i) Conversion success rate ≥%99; (ii) Format version lock uyum %100; (iii) glTF extension approved-list uyum %100; (iv) Retention compliance %100; (v) Manual conversion sayısı 0/ay.
- Dashboard: Grafana "Format Pipeline Health" — conversion time, error rate, storage usage.

### 8. İhlal Yaptırımları

- Onaylanmamış format kullanımı (ör. `.dae`, `.3ds`, `.ply` üretim pipeline'ında): uyarı + 24 saat içinde approved formata conversion zorunlu.
- glTF extension prohibited-list ihlali: pipeline TD uyarısı + asset DB'den silme.
- DCC-native source'u silerek yalnızca glTF saklama: "source of truth" ihlali, asset "orphaned" statüsüne düşer, yeniden modelleme gerekir.
- Retention policy ihlali (intermediate file'ları kalıcı saklama): storage maliyeti kullanıcı/ekibe yansıtılır.

### 9. İstisnalar

- 3D print prototyping için STL/OBJ kullanımı (Politika Madde 5.5 kapsamında) muafiyetli.
- Eski AAA başlık (3+ yaş) legacy FBX 2014/2017 dosyaları, "legacy tag" ile kalıcı saklanabilir; yeni üretimde kullanılamaz.
- Araştırma & geliştirme için deneysel formatlar (ör. `.vrm`, `.pmx`, `.x3d`) "research only" tag ile kullanılabilir.

### 10. İlgili Standartlar

- glTF 2.0 Core Specification + Extension Registry (Khronos Group).
- Universal Scene Description (Pixar, github.com/PixarAnimationStudios/USD).
- FBX SDK Documentation (Autodesk, proprietary).
- Alembic 1.8 (Solid Angle, ILM).
- OpenVDB 11 (Academy Software Foundation).
- MaterialX 1.39 (ILM, ASWF).
- ISO 9001:2015 Madde 7.5.
- ISO/IEC 27001:2022 A.5.12, A.8.10.
- Çapraz referans: Politika 31 (Asset Security), Politika 32 (Validation & QC), Politika 38 (Versioning & IP).

### 11. Onay & Revizyon Geçmişi

| Sürüm | Tarih | Hazırlayan | Onaylayan | Değişiklik |
|-------|-------|------------|-----------|------------|
| 1.0 | 2026-06-21 | Pipeline Director | CTO + CISO | İlk yayın |
| 1.1 | (planlı) 2027-01-15 | Pipeline Director | CTO | USD v25 LTS güncellemesi |

---

## Politika No: 34 — Rig & Skeleton Güvenliği Politikası

### 1. Amaç

Bu politika, NEXUS 3D Studio'nde geliştirilen tüm karakter, yaratık ve mekanik rig'lerin teknik doğruluğunu, güvenliğini ve pipeline uyumluluğunu garanti altına almak amacıyla hazırlanmıştır. Rig (skeleton + controller + constraint + skin), bir karakterin animasyona hazır hale getirilmesinin en kritik ara yüzüdür; yanlış rig'lenmiş bir karakter, animatörün saatlerce kaybına, runtime deformation artifact'lerine (candy-wrapper, volume loss, twist failure) ve multiplayer replication senkronizasyon hatalarına yol açabilir. Ayrıca rig, sıkça embedded Python script (auto-rigging tool, custom IK solver) içerdiğinden güvenlik açısından da Politika 31 ile entegre bir tehdit vektörüdür. Politika; Unreal Engine 5 Control Rig, Unity Animation Rigging (ARS), Maya HumanIK ve Blender Rigify standartlarını temel alır.

İkincil amaçlar: (i) bone hierarchy validation standartlarını tanımlamak; (ii) weight paint limitlerini (max 4 bones/vertex) GPU vertex shader uyumu için zorlamak; (iii) naming convention'ı rig özelliklerini yansıtacak şekilde standardize etmek; (iv) hierarchy depth limitleri ile runtime traversal maliyetini kontrol altında tutmak; (v) deformation check (volume preservation, twist distribution) ile kalite kapısını tanımlamak; (vi) embedded script güvenliğini Politika 31 ile entegre uygulamak.

### 2. Kapsam

Tüm skeletal mesh'ler, biped (2-leg), quadruped (4-leg), hexapod (6-leg), spider, bird (wing), fish ve mekanik rig'ler (vehicle wheel, robotic arm, hydraulic) kapsam dahilindedir. Rig türleri: gameplay rig (animasyon amaçlı, runtime), cinematic rig (high-fidelity facial, cutscene amaçlı), simulation rig (cloth, hair, soft-body sim için proxy), control rig (interactive animation, Unreal Control Rig / Unity ARS). Kullanım araçları: Maya, Blender, 3ds Max (CAT/Biped), Houdini KineFX, Unreal Engine Control Rig, Unity Animation Rigging.

### 3. Tanımlar

- **Skeleton (Rig)**: Bone (kemik) hierarchy'si; ebeveyn-çocuk transform ilişkisi.
- **Bone**: Tek bir transform node; translation, rotation, scale içerir.
- **Skinning (Skin Bind)**: Mesh vertex'lerinin bone'lara ağırlıkla bağlanması (linear blend skinning, dual quaternion).
- **Weight Paint**: Vertex başına bone ağırlık dağılımı; 0.0 (etkisiz) - 1.0 (tam etki).
- **IK (Inverse Kinematics)**: End-effector'dan köke doğru hesaplanan kinematik (ör. el pozisyonu → omuz).
- **FK (Forward Kinematics)**: Kökten uca doğru transform propagation (ör. omuz → dirsek → el).
- **Constraint**: Bir bone'un transform'unu başka bir hedefe bağlama (aim, parent, point, orient).
- **Control Curve**: Animatör'ün manipüle ettiği NURBS curve; rig kullanıcı arayüzü.
- **Twist Bone**: Long bone'un twist deformasyonunu dağıtan ara bone (ör. `lowerArm_twist`).
- **Driver / Expression**: Bir attribute'un başka attribute'lara bağlı olarak hesaplandığı formula (Maya driven key, Blender driver).
- **Auto-Rigger**: Şablon rig oluşturan araç (Rigify, Advanced Skeleton, Maya HumanIK).

### 4. Roller & Sorumluluklar

- **Lead Rigger**: Rigging disiplininin teknik sahibi; rigging standard'larının uygulanmasından sorumludur.
- **Rigger**: Rig oluşturan teknik sanatçı; bone hierarchy, controller, skin, constraint kurulumu yapar.
- **Lead Animator**: Rig'in animatör kullanılabilirliği (UX, controller selection, IK/FK switch) onaylar.
- **Engine Programmer**: Runtime skinning shader (vertex shader, compute skinning) uyumluluğunu doğrular.
- **Pipeline TD**: Rig validation CI entegrasyonu, auto-rig template bakımı.
- **3D Security Lead**: Rig içine gömülü script'lerin (auto-rigger, custom solver) güvenlik denetimi (Politika 31 entegrasyonu).

### 5. Politika Maddeleri

**5.1** Bone hierarchy validation zorunludur. Tüm rig'ler şu kurallara uymalıdır: (i) tek bir root bone (ör. `root` veya `pelvis`); (ii) parent-child ilişkisi döngüsü içermez (DAG — Directed Acyclic Graph); (iii) her bone'un benzersiz adı vardır (Politika Madde 5.3); (iv) transform pivot point mantıklı (ör. elbow bone pivot, anatomik eklem yerinde); (v) bone orientation: X-axis bone yönüne bakar (Maya convention) veya Z-axis bone yönüne bakar (Blender convention) — tüm rig tek bir convention kullanır.

**5.2** Weight paint limiti: Her vertex maksimum 4 bone'a ağırlıkla bağlanır. Bu, GPU vertex shader sabit (4 bones/vertex, 8 register limit) ve mobil GPU'ların hardware skinning limitiyle uyumludur. Ağırlıkların toplamı 1.0 olmalı (normalized); 5+ bone'lu vertex'ler otomatik olarak top-4'e trim'lenir ve kalan ağırlık orantılı dağıtılır. Dual quaternion skinning kullanıldığında yine 4 bone limit geçerlidir.

**5.3** Naming convention zorunludur: Bone adları `[Side]_[Part]_[Segment]_[Twist/Index]`. Side: `L`, `R`, `C` (center). Part: `Leg`, `Arm`, `Spine`, `Head`, `Hand`, `Foot`. Segment: `Upper`, `Lower`, `Hand`, `Foot`, `Finger01-05`. Twist: `_twist01`, `_twist02`. Örnek: `L_Arm_Upper_twist01`, `R_Hand_Finger03_Lower`. Controller'lar: `CTRL_[Side]_[Part]` (ör. `CTRL_L_Arm_Hand_IK`). Constraint hedefleri: `TGT_[name]`. Driver source: `DRV_[name]`.

**5.4** Hierarchy depth limiti: Bone chain depth maksimum 12 level'dır (ör. `root → pelvis → spine01 → spine02 → spine03 → neck → head → jaw → tongue → tongueTip → tongueTipEnd → end` — 12 level). Bu, runtime traversal maliyetini sınırlar (CPU skinning 0.5 ms altında) ve animation compression'u (özel algorithm) etkin kılar. Daha derin gereksinimler için "compress hierarchy" adımı uygulanır.

**5.5** IK/FK switching: Tüm ana limb'ler (kol, bacak) için hem IK hem FK chain bulunur ve animatör bunlar arasında switch yapabilir. IK/FK match (snapping) script'i zorunludur — switch sırasında pop olmamalıdır. IK pole vector mantıklı konumda (elbow/knee'nin anatomik yönünde). IK stretch (uzama) yasaktır ya da max stretch %150 ile sınırlandırılmıştır.

**5.6** Twist bone dağıtımı: Long bone'larda (upper arm, thigh, forearm, calf) twist deformasyonu 2-3 twist bone ile dağıtılır. Tek bone'lu twist (tüm twist tek bone'da) yasaktır — candy-wrapper artifact yaratır. Twist bone ağırlıkları: ana bone %60, twist01 %25, twist02 %15 (örnek dağılım).

**5.7** Deformation check: Rig, "deformation calibration pose" set'inde test edilir — (i) T-pose (varsayılan); (ii) A-pose (kollar 45° aşağıda); (iii) hands on hips (kollar 90°, dirsek 90°); (iv) squat (bacaklar bükülmüş); (v) extreme twist (önkol 180° içe dönük). Her pozda volume preservation (mesh hacmi %5'ten fazla değişmemeli) ve self-intersection (mesh'in kendisiyle kesişimi) denetlenir.

**5.8** Facial rig standartları: Facial animation için iki yaklaşım kabul edilir — (i) Bone-based (jaw, lip, brow bone'ları; ARKit 52 blendshape ile kombinasyon); (ii) Blendshape-only (52+ blendshape, bone yok). Hybrid yaklaşım (bone + blendshape) zorunludur: jaw bone + 52 ARKit blendshape + custom表情. Eye rig: her göz için aim constraint + 2-3 bone (pupil dilation, eyelid). Tongue rig: 3-segment chain.

**5.9** Controller UX: Controller'lar seçilebilir NURBS curve'lerdir; renk kodlaması standarttır — kırmızı = L side, mavi = R side, sarı = center, yeşil = IK, mor = FK, cyan = constraint, beyaz = generic. Controller seçim hierarşisi "selection set" olarak organize edilir; animatör tek tıkla tüm sağ kol controller'larını seçebilir.

**5.10** Embedded script güvenliği: Rig dosyaları sıkça Python script içerir (auto-rigger callback, driver expression, custom IK solver). Tüm embedded script'ler Politika 31 Madde 5.5 kapsamında sandbox'da taranır; onaylanmamış module import (ör. `subprocess`, `socket`, `ctypes`) yasaktır. Script'ler "approved auto-rigger template" içinde olmalıdır.

**5.11** Auto-rigger template politikası: Kurum, onaylı auto-rigger template'leri kullanır — (i) Blender Rigify (human, quadruped, bird); (ii) Maya Advanced Skeleton 5; (iii) Houdini KineFX; (iv) kuruma özel `nexus-autorig` (Maya/Blender plugin). Custom auto-rigger script'leri 3D Security Lead + Lead Rigger onayı olmadan kullanılamaz.

**5.12** Constraint kullanım kuralları: Constraint'ler minimize edilir; cycle-breaking constraint (ör. A → B ve B → A) yasaktır. Aim constraint'ler up-vector içerir (flip önlemi). Pole vector constraint'ler animasyon sırasında sabit kalmazsa "knee pop" artifact yaratır. Constraint weight animation (0-1 blend) kullanıldığında "constraint blending" kuralları dokümante edilir.

**5.13** Animation retargeting uyumu: Tüm karakter rig'leri "retargeting-ready" olmalıdır — HumanIK naming (Maya) veya Unreal Mannequin skeleton (root → pelvis → spine_01..03 → neck → head; clavicle L/R → upperarm L/R → lowerarm L/R → hand L/R; thigh L/R → calf L/R → foot L/R → ball L/R → toes L/R). Bu, animasyonun farklı karakterlere (ör. NPC guard, hero, child) transferine olanak tanır.

**5.14** Runtime skinning performance: Vertex başına ortalama 2.5 bone (4'ten az); bone başına ortalama 250 vertex; total bone sayısı karakter başına ≤ 250 (mobile ≤ 100). Compute skinning (GPU skinning) zorunludur; CPU skinning yalnızca cinematic rig'lerde kabul edilir.

**5.15** Rig validation CI gate: `nexus-rig-validator` her rig commit'inde çalışır. Kontroller: (i) hierarchy cycle detection; (ii) weight paint >4 bone detection; (iii) naming convention; (iv) hierarchy depth; (v) missing controller; (vi) embedded script tarama (Politika 31 entegrasyonu); (vii) deformation calibration pose test; (viii) retargeting skeleton compatibility. ERROR → PR bloke; WARNING → comment.

### 6. Prosedürler & İş Akışları

**Rig Production Workflow**:
1. Modeler, karakter mesh'ini "rig-ready" olarak teslim eder (T-pose, clean topology, vertex group preliminary).
2. Rigger, auto-rigger template (Rigify/Advanced Skeleton) ile temel rig üretir.
3. Rigger, custom controller'ları, IK/FK switch'leri, twist bone'ları ekler; naming convention uygular.
4. Rigger, skin bind yapar; weight paint'i düzeltir (auto + manuel).
5. Rigger, deformation calibration pose set'inde test eder; volume preservation ve self-intersection denetler.
6. Rigger, embedded script'leri (driver, auto-rigger callback) ekler ve sandbox taramasından geçirir.
7. CI validation: `nexus-rig-validator` ERROR'ları düzeltilir.
8. Animator review: rig UX, controller seçimi, IK/FK switch test edilir.
9. Engine import: Unreal Control Rig veya Unity ARS için export edilir, runtime deformation test edilir.
10. Lock: rig "Production Ready" statüsüne geçer; sonraki değişiklikler major version gerektirir.

### 7. Uyumluluk & İzleme

- ISO 9001:2015 Madde 8.5.1, 8.6.
- ISO/IEC 27001:2022 A.5.12, A.8.25.
- KPI'lar: (i) Rig validation ERROR ilk denemede %0; (ii) Deformation artifact sayısı ayda <3; (iii) Weight paint >4 bone violation sayısı 0; (iv) Embedded script sandbox bypass 0; (v) Rig rebuild (karakter başına) ayda <1.
- Dashboard: ShotGrid "Rig Health" — rig başına bone count, vertex/bone ratio, deformation test pass rate.

### 8. İhlal Yaptırımları

- Weight paint >4 bone limitini bilerek aşma: rigger uyarısı + 1 saat training.
- Naming convention ihlali (3 kez): rigger için naming training zorunlu.
- Onaylanmamış embedded script (ör. socket import): Politika 31 Madde 5.5 yaptırımı; sandbox'da kalıcı karantina.
- Auto-rigger template'i değiştirerek production rig oluşturma: Lead Rigger onayı olmadan yasak; uyarı.

### 9. İstisnalar

- Cinematic facial rig'ler için 4+ bone/vertex limiti 8'e çıkarılabilir (cinematic render, GPU vertex shader değil CPU skinning); ancak "CINEMATIC_ONLY" tag zorunludur.
- Quadruped/bird rig'lerde hierarchy depth 12 limiti 15'e çıkarılabilir (spike chain); runtime test sonrası onay.
- Araştırma amaçlı deneysel rig'ler (ör. muscle simulation, FACS) için "RESEARCH" tag ile Politika 31 Madde 9 (istisnalar) uygulanır.

### 10. İlgili Standartlar

- Unreal Engine 5.4 Control Rig Documentation.
- Unity 2023 LTS Animation Rigging (ARS) Package.
- Maya 2025 HumanIK.
- Blender 4.2 Rigify.
- Houdini 20 KineFX.
- ARKit Face Tracking 52 Blendshape (Apple).
- glTF 2.0 Skinning (core spec, skinning).
- ISO 9001:2015 Madde 8.5.1, 8.6.
- ISO/IEC 27001:2022 A.5.12, A.8.25.
- Çapraz referans: Politika 31 (Asset Security), Politika 32 (Validation), Politika 35 (Animation Pipeline).

### 11. Onay & Revizyon Geçmişi

| Sürüm | Tarih | Hazırlayan | Onaylayan | Değişiklik |
|-------|-------|------------|-----------|------------|
| 1.0 | 2026-06-21 | Lead Rigger + Pipeline TD | Technical Art Director + CTO | İlk yayın |
| 1.1 | (planlı) 2027-01-15 | Lead Rigger | Technical Art Director | Unreal 5.5 Control Rig güncellemesi |

---

## Politika No: 35 — Animation Pipeline Politikası

### 1. Amaç

Bu politika, NEXUS 3D Studio'nun AAA prodüksiyonunda üretilen tüm karakter, yaratık, mekanik ve kamera animasyonlarının tutarlı kalite, performans ve pipeline uyumluluğunu garanti etmek amacıyla hazırlanmıştır. Animasyon; rig, keyframe, interpolation, frame rate, IK/FK switching, retargeting ve motion capture data'sını bir araya getiren karmaşık bir pipeline'dır. Yanlış FPS (ör. 24 FPS cinematiği 30 FPS gameplay'e yanlış convert etme), yanlış interpolation (linear yerine bezier), eksik IK/FK match veya düşük kalite motion capture data'sı; "foot sliding", "popping", "jitter" gibi artifact'lere ve milyonlarca dolarlık rework'e yol açar. Politika; Pixar "Animation Allocator", ILM "Motion Capture Pipeline", Naughty Dog "Cinematic Animation" ve Epic Games "Animation Compression Library (ACL)" prensiplerini temel alır.

İkincil amaçlar: (i) keyframe standartlarını tanımlamak (pose-to-pose, breakdown, in-between); (ii) FPS kurallarını netleştirmek (24 cinematic, 30 gameplay, 60 VR/competitive); (iii) interpolation rule'larını (bezier, linear, step) platform-bazında standartlaştırmak; (iv) IK/FK switching protokolünü tanımlamak; (v) animation retargeting protokolünü (karakter → karakter transferi) kurmak; (vi) motion capture data validation'ı (marker noise, gap fill, skeleton solving) standardize etmek; (vii) animation compression (keyframe reduction, error metric) ile runtime memory'yi optimize etmek.

### 2. Kapsam

Tüm keyframe animasyon, motion capture (mocap) animasyon, procedural animation (state machine, behavior tree), physics-driven animation (ragdoll, cloth sim) ve camera animasyonu. Kullanım araçları: Maya, Blender, 3ds Max (CAT), MotionBuilder, Houdini Solaris/KineFX, Unreal Engine Sequencer, Unity Timeline, Cascadeur (AI-assisted keyframe). Platform hedefleri: PC, PS5, Xbox Series X/S, Switch, mobile, VR (Quest 3, Vision Pro), cloud streaming.

### 3. Tanımlar

- **Keyframe**: Animasyon eğrisi üzerinde belirli bir zamanda tanımlanmış değer; interpolasyon bu noktalar arasında hesaplanır.
- **Interpolation**: Keyframe'ler arası geçiş; linear (sabit hız), bezier (eğri kontrolü), step (anlık geçiş), cubic (smooth).
- **Pose-to-Pose**: Anahtar pozların (key pose) önce, ara pozların (breakdown, in-between) sonra tanımlandığı animasyon tekniği.
- **IK/FK Switching**: Animasyon sırasında Inverse ve Forward Kinematics arasında geçiş yapma; match (pop'suz geçiş) zorunludur.
- **Retargeting**: Bir karakter rig'ine ait animasyonun farklı karakter rig'ine transferi; skeleton naming ve bone proportion farkları yönetilir.
- **Motion Capture (Mocap)**: Optik (Vicon, OptiTrack) veya inertial (Xsens, Rokoko) sensörlerle gerçek hareket kaydı.
- **Gap Fill**: Mocap'ta marker kaybı (occlusion) sonucu oluşan boşlukların dolgulanması.
- **Solving**: Mocap marker verisinden skeletal animation üretilmesi (Vicon Shogun, MotionBuilder).
- **Animation Compression**: Keyframe sayısının azaltılması; error tolerance'a bağlı (ör. ACL — Animation Compression Library).
- **Frame Rate (FPS)**: Saniyedeki frame sayısı; 24 (cinematic), 30 (gameplay), 60 (VR/competitive), 120 (high refresh).
- **Animation Layer**: Birden fazla animasyonun non-destructive şekilde üst üste binmesi (blend, additive).
- **State Machine**: Gameplay animasyonlarının koşullu geçişlerle yönetildiği yapı (Unreal AnimBP, Unity Animator).

### 4. Roller & Sorumluluklar

- **Lead Animator**: Animation disiplininin teknik ve sanatsal sahibi; keyframe ve cinematic standartların uygulanmasından sorumludur.
- **Animator**: Keyframe animasyon üreten sanatçı; pose-to-pose, timing, spacing ilkelerine uyar.
- **Mocap Director**: Mocap session'larının yönetimi; performer brief, capture plan, on-set review.
- **Mocap Pipeline TD**: Mocap data processing (labeling, solving, retargeting); Vicon Shogun, MotionBuilder pipeline.
- **Technical Animator**: Animation state machine, IK/FK switch, runtime blend tree tasarımı.
- **Engine Programmer**: Animation compression, runtime evaluation (Unreal AnimBP, Unity Playable API).
- **Pipeline TD**: CI validation, naming convention enforcement, asset DB integration.

### 5. Politika Maddeleri

**5.1** Keyframe standartları zorunludur: Tüm karakter keyframe animasyonu "pose-to-pose" tekniğiyle üretilir — (i) key pose (anahtar poz, ~5-7 frame aralık); (ii) breakdown (geçiş poz, key pose'lar arasında, motion arc'ını tanımlar); (iii) in-between (ara frame'ler, timing ve spacing'i ayarlar). "Straight-ahead" (frame-by-frame) tekniği yalnızca fast motion (ör. explosion, fast whip) için kabul edilir.

**5.2** Frame rate standartları: Cinematic (pre-rendered) = 24 FPS; cinematic in-engine = 30 FPS; gameplay = 30 FPS (default) veya 60 FPS (competitive/VR); VR = 72-90 FPS (Quest 3, Vision Pro); high refresh = 120 FPS (esports). Animasyon dosyası her zaman "source FPS" (ör. 24) ile saklanır; runtime'a convert edilirken "frame interpolation" (ör. 24 → 30 = duplicate frame; 24 → 60 = 2.5× blend) kullanılır.

**5.3** Interpolation rule'ları: Default interpolation = bezier (smooth ease-in/out). Linear interpolation yalnızca mekanik/robotik hareket için (ör. robotic arm, door). Step interpolation yalnızca pose-to-pose snap (ör. snap turn) için. Cubic (hermite) interpolation cinematic facial micro-expression için. Tüm keyframe'ler "tangent type" içerir (auto, smooth, linear, flat, plateau, stepped).

**5.4** IK/FK switching protokolü: Animasyon üretiminde default = FK (anatomik hareket için); aiming/reaching (el ile bir hedefe dokunma, ayak ground snap) için IK'ya switch. IK → FK ve FK → IK geçişlerinde "match" script'i çalışır — IK'dan FK'ya geçişte FK bone'lar IK pozisyonunu alır; tersinde IK hedefi FK pozisyonuna yerleşir. Match yapılmadan switch "pop" artifact yaratır (Politika 34 Madde 5.5 ile çapraz).

**5.5** Animation retargeting protokolü: Animasyon, "source rig" → "target rig" transfer edilirken: (i) source ve target rig'ler HumanIK naming'e uyar (Politika 34 Madde 5.13); (ii) bone proportion farkı "retargeting mode" ile yönetilir — "skeletal" (kemik uzunluğu korunur, eklem açısı bozulur), "animation" (eklem açısı korunur, kemik uzunluğu değişir), "hybrid" (default); (iii) foot/hand IK pinning ile "foot sliding" önlenir; (iv) retarget sonrası "calibration pose" testi yapılır (T-pose, A-pose, walk cycle).

**5.6** Motion capture data validation: Tüm mocap data şu denetimlerden geçer — (i) marker labeling accuracy ≥%98 (yanlış etiketli marker <2%); (ii) marker trajectory gap (occlusion) <5 frame (uzun gap'ler "fill" script ile doldurulur, >10 frame gap "reshoot" gerektirir); (iii) skeleton solving error <2 cm (joint position farkı); (iv) ground penetration (ayak zemin altında) <1 cm; (v) self-penetration (vücut parçaları iç içe) <%2 frame; (vi) jitter (high frequency noise) <0.5° RMS rotation.

**5.7** Mocap session planlama: Her mocap session öncesi "mocap brief" hazırlanır — (i) karakter listesi ve rig versiyonları; (ii) hareket listesi (anim list) tahmini süre ile; (iii) performer brief (karakter kişiliği, hareket tarzı); (iv) prop list (silah, kapı, sandalye); (v) calibration protocol (T-pose, ROM — Range of Motion). Brief mocap director ve lead animator tarafından imzalanır.

**5.8** Animation naming convention: `PROJ_ANIM_[CharName]_[ActionName]_[Direction/Variant]_vMAJOR.MINOR`. Örnek: `NEXUS_ANIM_HeroSoldier_WalkCycle_Fwd_v1.2`, `NEXUS_ANIM_HeroSoldier_Attack_Sword_Swing01_v2.0`. Direction: Fwd, Bwd, Left, Right, Up, Down. Variant: 01, 02, ... (alternatif sürümler). Animasyonlar `.fbx` (legacy bridge, Politika 33) veya `.usd` (enterprise, preferred) olarak export edilir.

**5.9** Animation compression: Runtime'da her animasyon sıkıştırılır — (i) keyframe reduction (gereksiz keyframe silme, error metric <0.5 cm vertex position); (ii) uniform sampling (sabit frame aralık, runtime evaluation kolay); (iii) quantization (16-bit float yerine 8-bit quaternion); (iv) library: Unreal Engine ACL (Animation Compression Library), Unity Animation Compression. Compression oranı hedef: %75-90 (raw → compressed). Error threshold: <0.5 cm vertex farkı.

**5.10** Animation state machine (gameplay): Gameplay animasyonları state machine ile yönetilir — (i) state (idle, walk, run, jump, attack); (ii) transition rule (koşul, örn. "speed > 1.5" → walk'tan run'a); (iii) transition duration (blend time, 0.1-0.3 sn); (iv) transition curve (ease-in/out). Blend tree (1D, 2D) ile directional movement (idle-walk-run, forward-strafe) blend edilir. Additive animation (ör. breathing, head turn) base animasyon üstüne non-destructive uygulanır.

**5.11** Animation layer: Karmaşık animasyonlar layer'larla üretilir — (i) base layer (full body locomotion); (ii) overlay layer (upper body aim/attack); (iii) additive layer (breathing, idle noise); (iv) correction layer (manual fix). Layer'lar non-destructive'tir; her layer mask ile hangi bone'ları etkilediği tanımlanır.

**5.12** Camera animation: Cinematic camera animasyonu Sequencer (Unreal) veya Timeline (Unity) ile üretilir. Camera move'lar "ease-in/out" interpolasyon kullanır; "hard cut" yalnızca explicit edit point'te. Camera focal length animasyonu (zoom) ≥2 sn'den kısa sürede değişmez (viewer disorientation önlemi). Camera collision ile duvarın içinden geçme önlenir.

**5.13** Animation review cycle: Her animasyon "dailies" (günlük review) sürecinden geçer — (i) animator playblast (Maya) veya viewport capture (Unreal) üretir; (ii) lead animator ve director review eder; (iii) annotation'lar Frame.io veya ShotGrid üzerinden; (iv) "Approved", "Changes Requested", "Rejected" statüleri ile sürüm takibi. Major animasyon (cinematic shot) 3-5 review cycle geçer.

**5.14** Animation export pipeline: Maya/Blender'dan runtime engine'e (Unreal/Unity) export şu kurallarla: (i) baked animation (tüm constraint, driver bake'lenmiş, runtime calculation yok); (ii) uniform sampling (30 FPS veya source FPS); (iii) skeleton definition ile birlikte (rig dosyası); (iv) animation set (tek dosyada birden fazla anim clip). Export format: `.fbx` (legacy) veya `.usd` (preferred).

**5.15** Animation validation CI gate: `nexus-anim-validator` her anim commit'inde çalışır. Kontroller: (i) naming convention; (ii) frame range (boş frame'ler yok); (iii) keyframe interpolation type; (iv) skeleton compatibility (retargeting ready); (v) foot sliding (ground penetration check); (vi) self-penetration; (vii) animation compression error metric. ERROR → PR bloke; WARNING → comment.

### 6. Prosedürler & İş Akışları

**Animation Production Workflow**:
1. Brief: lead animator, animasyon gereksinimlerini (karakter, aksiyon, süre, FPS) brief olarak yazar.
2. Block-out: animator, key pose'ları (5-7 frame aralık) ile animasyonu taslak yapar.
3. Breakdown: ara pozlar eklenir, motion arc tanımlanır.
4. In-between: ara frame'ler, timing ve spacing ayarlanır.
5. Polish: micro-detail (finger twitch, eye dart), facial expression eklenir.
6. Review: dailies'de lead animator + director review; annotation'lar.
7. Iteration: animator düzeltme yapar, yeni sürüm.
8. Approve: animasyon "Approved" statüsüne geçer.
9. Bake: tüm constraint, driver bake'lenir, runtime export'a hazır.
10. Export: fbx/usd olarak runtime engine'e gönderilir.
11. Engine import: state machine veya Sequencer'a eklenir.
12. Runtime test: gameplay/cinematic sahnede test edilir, compression error metric ölçülür.
13. Lock: animasyon "Locked" statüsüne geçer.

### 7. Uyumluluk & İzleme

- ISO 9001:2015 Madde 8.5.1, 8.6.
- ISO/IEC 27001:2022 A.5.12, A.8.25.
- KPI'lar: (i) Dailies'de ilk onay oranı %60+; (ii) Animasyon "Locked" sonrası rework oranı <%5; (iii) Mocap data validation pass rate ≥%95; (iv) Compression error metric <0.5 cm; (v) Foot sliding sayısı 0/scene.
- Dashboard: ShotGrid "Animation Health" — anim sayısı, review cycle sayısı, FPS dağılımı.

### 8. İhlal Yaptırımları

- Mocap data validation'ı atlayarak production'a alma: mocap pipeline TD uyarısı.
- IK/FK match yapmadan switch (pop artifact): animator uyarısı + rework.
- Naming convention ihlali (3 kez): animator için naming training zorunlu.
- Animation compression error metric >0.5 cm: engine programmer + technical animator görüşmesi, re-compression.

### 9. İstisnalar

- Cinematic (pre-rendered) animasyonlar için FPS 24 zorunlu, compression yok (lossless).
- Prototype/graybox animasyonlar validation'dan muaf; ancak "PROTOTYPE" prefix zorunludur.
- Eski (legacy) başlık animasyonları için retargeting exception: skeleton naming uyumsuz ama "legacy" tag ile kabul.

### 10. İlgili Standartlar

- Animation Compression Library (ACL) v2.1.
- Unreal Engine 5.4 Sequencer + AnimBP Documentation.
- Unity 2023 LTS Timeline + Animator Controller.
- Autodesk MotionBuilder 2025.
- Vicon Shogun 2.0.
- Pixar "Animation Allocator" internal pipeline.
- glTF 2.0 Animation.
- USD SkelAnimation.
- ISO 9001:2015 Madde 8.5.1, 8.6.
- ISO/IEC 27001:2022 A.5.12, A.8.25.
- Çapraz referans: Politika 31 (Asset Security), Politika 34 (Rig & Skeleton), Politika 39 (Real-time Performance).

### 11. Onay & Revizyon Geçmişi

| Sürüm | Tarih | Hazırlayan | Onaylayan | Değişiklik |
|-------|-------|------------|-----------|------------|
| 1.0 | 2026-06-21 | Lead Animator + Pipeline TD | Technical Art Director + CTO | İlk yayın |
| 1.1 | (planlı) 2027-01-15 | Lead Animator | Technical Art Director | VR 90 FPS standard güncellemesi |

---

## Politika No: 36 — Texture & Material Güvenliği Politikası

### 1. Amaç

Bu politika, NEXUS 3D Studio'da üretilen tüm texture ve material'lerin teknik kalite, performans, renk bilimi (color science) güvenliği ve pipeline uyumluluğunu garanti etmek amacıyla hazırlanmıştır. Texture'lar, modern AAA oyun ve film prodüksiyonunda en yüksek bellek tüketen asset sınıfıdır — tek bir 8K PBR texture set, 4 kanal × 8K × 8K × 8-bit = 256 MB raw, 4-5 texture ile 1+ GB/sahne. Yanlış renk uzayı (sRGB/linear karışması), yanlış compression (BC1 yerine BC7), yanlış resolution (mobile'da 8K), HDR validation eksikliği veya PBR workflow tutarsızlığı (metallic-roughness vs specular-glossiness); hem görsel kaliteyi hem performansı ciddi şekilde düşürür. Politika; Substance 3D pipeline, Pixar "Renderman" material standard, Unreal Engine 5 Lumen/Nanite PBR, Unity HDRP/URP material system ve ACES (Academy Color Encoding System) referanslarını temel alır.

İkincil amaçlar: (i) PBR workflow (metallic-roughness) standardını tesis etmek; (ii) texture resolution limitlerini platform-bazına tanımlamak (4K AAA, 8K cinematic, 2K mobile, 1K VR); (iii) compression codec'lerini (BC7 desktop, ASTC mobile, ETC2 fallback) standartlaştırmak; (iv) HDR validation (OpenEXR, `.hdr`) ve tone mapping kurallarını tanımlamak; (v) renk uzayı (sRGB albedo, linear data) kurallarını netleştirmek; (vi) texture memory bütçesini (VRAM <512MB/sahne mobile, <4GB/sahne PC) zorlamak; (vii) shader güvenliğini (compiled shader cache, shader injection önleme) garanti etmek.

### 2. Kapsam

Tüm texture türleri (albedo/base color, normal, roughness, metallic, AO, height, emission, subsurface, mask, detail), material türleri (PBR metallic-roughness, PBR specular-glossiness legacy, unlit, subsurface scattering, anisotropic, hair/skin), texture formatları (PNG, JPEG, OpenEXR, KTX2, DDS, TIFF, TGA legacy), shader formatları (HLSL, GLSL, MSL, ShaderGraph, MaterialX) ve altyapı (Substance 3D Painter/Designer, Marmoset Toolbag, Photoshop, Krita, Unreal Engine Material Editor, Unity Shader Graph).

### 3. Tanımlar

- **PBR (Physically Based Rendering)**: Gerçek dünya fizik kurallarına (enerji korunumu, Fresnel, microfacet) dayanan material modeli.
- **Metallic-Roughness Workflow**: PBR'nin iki ana workflow'undan biri; `metallic` (0-1, dielectric vs metal) ve `roughness` (0-1, pürüzsüz-kaba) map'leri kullanır. glTF ve Unreal default.
- **Specular-Glossiness Workflow**: PBR'nin alternatif workflow'u; `specular` (RGB color) ve `glossiness` (0-1) map'leri. Legacy, karışıklığa yol açar.
- **BC7**: Desktop GPU'lar için lossy block compression (8-bit, 4:4:4:4, 0.5 bpp).
- **ASTC**: Mobil GPU'lar için adaptive scalable texture compression (2-12 bpp, geniş format).
- **ETC2**: Mobil fallback (4-7 bpp, OpenGL ES standard).
- **KTX2**: Khronos texture container formatı; transcodable, runtime compression.
- **OpenEXR**: 16/32-bit float HDR format; environment map, displacement map için.
- **sRGB**: Non-linear renk uzayı; albedo ve emission texture için (gamma corrected).
- **Linear**: Linear renk uzayı; data texture (normal, roughness, metallic, height, AO) için.
- **ACES (Academy Color Encoding System)**: Film endüstrisi renk yönetimi standardı; tone mapping.
- **Texture Streaming**: Runtime'da texture'ların VRAM'e partial yüklenmesi (mipmap chain); Unreal Virtual Texturing.
- **Shader Injection**: Kötü niyetli shader kodu (HLSL/GLSL) ile runtime manipülasyon; güvenlik tehdidi.

### 4. Roller & Sorumluluklar

- **Lead Texture Artist**: Texture ve material disiplininin teknik ve sanatsal sahibi.
- **Texture Artist**: Substance Painter/Designer ile PBR texture set üreten sanatçı.
- **Technical Material Artist**: Shader graph, custom HLSL/GLSL, PBR calibration.
- **Color Pipeline TD**: ACES, OpenColorIO (OCIO), color space yönetimi.
- **Build Engineer**: Texture compression pipeline, KTX2/BC7 transcode.
- **GPU Performance Engineer**: Texture memory budget, streaming mipmap.
- **3D Security Lead**: Shader injection tarama, material script güvenliği.

### 5. Politika Maddeleri

**5.1** PBR workflow standardı: Tüm PBR material'ler "metallic-roughness" workflow'u kullanır (glTF ve Unreal default). "Specular-glossiness" workflow'u yasaktır — yeni asset'lerde kabul edilmez, eski asset'ler 6 ay içinde convert edilir. Workflow dönüşümü `substance-pbr-convert` script'i ile yapılır.

**5.2** Texture resolution limitleri platform-bazında: PC AAA: 4K (4096×4096) hero asset, 2K (2048×2048) standard, 1K (1024×1024) prop/small; PS5/Xbox Series X: PC'nin %100'ü; Switch: PC'nin %25'i (1K hero, 512 standard); Mobile: PC'nin %6'sı (1K hero, 256 standard); VR: PC'nin %25'i, stereo render nedeniyle. 8K (8192×8192) yalnızca cinematic pre-render için kabul edilir, runtime'da yasak.

**5.3** Texture compression codec'leri: Desktop (PC, PS5, Xbox) = BC7 (color) + BC5 (normal, two-channel) + BC4 (single-channel mask); Mobile = ASTC (4×4 block, 8 bpp) default, ETC2 fallback (OpenGL ES 3.0 cihazlar); VR = BC7 (desktop-tethered) veya ASTC 6×6 (standalone). Compression quality preset: "high" (PSNR >42 dB). Lossless format (PNG, TIFF) runtime'da yasak.

**5.4** KTX2 container: Tüm runtime texture'lar KTX2 container formatında saklanır. KTX2, BC7/ASTC/ETC2 + Basis Universal supercompression destekler; transcode runtime'da hedef GPU'ya göre yapılır. Bu, tek bir texture dosyasının tüm platformlarda çalışmasını sağlar. `.png`, `.tga`, `.dds` runtime export'u yasak.

**5.5** HDR validation: Tüm HDR texture (environment map, skybox, emissive) OpenEXR (`.exr`) 16-bit float (Half) formatında saklanır. 32-bit float (Full) yalnızca displacement map ve scientific data için. HDR validation: max value <65000 (HDR10 limit), no NaN/Inf, EV (Exposure Value) range 0-20. ACES tone mapping ile SDR'a convert edilir.

**5.6** Renk uzayı kuralları: sRGB (non-linear, gamma corrected) — albedo/base color, emission, diffuse; Linear (linear, raw data) — normal, roughness, metallic, AO, height, mask, detail. Texture import sırasında "sRGB" checkbox doğru ayarlanır; yanlış ayar (ör. normal map'i sRGB'ye koyma) "washed out" veya "too contrasty" görünüm yaratır. Color profile: ICC sRGB IEC61966-2.1.

**5.7** PBR calibration: Tüm material'ler "calibration target" ile test edilir — (i) chrome ball (metallic=1, roughness=0) yansıma doğru; (ii) diffuse ball (metallic=0, roughness=1) albedo %18 gray (0.18 linear); (iii) roughness ball set (0, 0.25, 0.5, 0.75, 1) ile roughness scale doğru. Tone mapping: ACES Filmic (Unreal default) veya Neutral (Unity default).

**5.8** Texture memory budget: Sahne başına VRAM texture budget — PC AAA: 4 GB (16 GB total VRAM içinde), PS5: 4 GB, Xbox Series X: 4 GB, Switch: 512 MB, Mobile: 256 MB, VR: 1 GB. Budget aşımı durumunda: (i) texture streaming (mipmap partial load); (ii) texture atlas (komşu UV'ler tek texture); (iii) texture array (aynı boyut texture'lar tek dosya); (iv) virtual texturing (Unreal VT, Unity VT).

**5.9** Texture streaming: AAA sahnelerde "texture streaming" zorunludur — full texture VRAM'de değil, yalnızca kamera yakınındaki mipmap level'ler yüklenir. Streaming pool size: PC 1 GB, mobile 128 MB, VR 512 MB. Mipmap generation: otomatik (import sırasında), gamma-aware (sRGB texture için).

**5.10** Mipmap generation: Tüm runtime texture'lar mipmap chain içerir (en az `log2(max_dim)` seviye). Mipmap alpha coverage preservation (alpha test için), sRGB-aware filter (renk doğruluğu için). Mobile'da 1×1 mipmap zorunludur (min filter).

**5.11** Texture padding: UV island padding ≥4 px (4K texture), ≥2 px (2K), ≥1 px (1K) — texture bleeding önlemi. Edge padding (texture sınırına uzanan island'lar) mirror extension kullanır.

**5.12** Material security: Shader injection tehdidine karşı — (i) shader dosyaları (`.hlsl`, `.glsl`, `.msl`, `.shadergraph`) Politika 31 kapsamında sandbox taramadan geçer; (ii) runtime shader compile (Unreal Shader Compiler, Unity Shader Compiler) yalnızca build server'da çalışır, üretim cihazında değil; (iii) shader hash doğrulama (runtime, compiled shader cache ile karşılaştırma); (iv) shader hot-reload üretim cihazında yasak (build server'da izinli).

**5.13** Material library: Kurum, merkezi material library kullanır — (i) "master material'lar" (Unreal Material Instance, Unity Material Variant) tek sefer tanımlanır; (ii) asset-specific "material instance'lar" parametre değişimi ile (texture, color, scalar); (iii) substance material archive (`.sbsar`) source-of-truth; (iv) material asset DB'de UUID ve version ile saklanır.

**5.14** Substance pipeline: Substance 3D Painter/Designer ile üretilen texture'lar "export preset" ile export edilir — preset; PBR metallic-roughness, sRGB/linear doğru ayar, KTX2 output, naming convention içerir. Substance source (`.spp`, `.sbs`) DCC source-of-truth (Politika 33 Madde 5.4).

**5.15** Texture validation CI gate: `nexus-texture-validator` her texture commit'inde çalışır. Kontroller: (i) resolution platform limiti; (ii) compression codec; (iii) color space tag; (iv) mipmap chain completeness; (v) padding; (vi) HDR validation (NaN/Inf, EV range); (vii) PBR workflow (metallic-roughness, specular-glossiness yasak); (viii) shader injection tarama (Politika 31 entegrasyonu). ERROR → PR bloke; WARNING → comment.

### 6. Prosedürler & İş Akışları

**Texture Production Workflow**:
1. Artist, model'in UV'sini alır (Politika 32 Madde 5.2).
2. Substance 3D Painter'da proje açar, PBR metallic-roughness template.
3. Bake: high-poly → low-poly normal, AO, curvature bake.
4. Paint: albedo, roughness, metallic, height, emission layer'ları.
5. Export: export preset (KTX2, sRGB/linear, naming) ile çıktı.
6. CI validation: `nexus-texture-validator` ERROR/WARNING raporu.
7. Engine import: Unreal Material Instance veya Unity Material oluşturulur.
8. Material calibration: chrome ball + diffuse ball ile test.
9. Runtime test: platform build'inde VRAM ölçümü, budget kontrolü.
10. Lock: texture set "Production Ready" statüsüne geçer.

### 7. Uyumluluk & İzleme

- ISO 9001:2015 Madde 8.5.1, 8.6.
- ISO/IEC 27001:2022 A.5.12, A.8.25.
- KPI'lar: (i) Texture validation ERROR ilk denemede %0; (ii) VRAM budget uyum %100; (iii) PBR workflow uyum %100 (specular-glossiness %0); (iv) KTX2 conversion rate %100; (v) Compression PSNR >42 dB.
- Dashboard: Grafana "Texture Pipeline" — VRAM usage per scene, compression ratio, color space distribution.

### 8. İhlal Yaptırımları

- 8K texture'ı runtime'da kullanma: texture artist uyarısı + 1 saat training.
- sRGB/linear yanlış ayarı (3 kez): texture artist için color management training.
- Specular-glossiness workflow kullanma (yeni asset): rework zorunlu.
- Shader injection tespiti: Politika 31 Madde 8 yaptırımı; sandbox karantina.

### 9. İstisnalar

- Cinematic pre-render: 8K texture ve 32-bit EXR kabul; "CINEMATIC_ONLY" tag.
- 3D print prototyping: KTX2 yerine PNG/TIFF; "3DPRINT" tag.
- Legacy (3+ yaş) asset'lerde specular-glossiness "legacy compliance" tolerance ile kabul.

### 10. İlgili Standartlar

- glTF 2.0 PBR Metallic-Roughness Specification (Khronos).
- Substance 3D Painter/Designer Pipeline Documentation (Adobe).
- Unreal Engine 5.4 Material Editor + Nanite + Lumen PBR.
- Unity 2023 LTS HDRP/URP Material System.
- BC7 (Khronos Data Format Specification).
- ASTC 1.3 (Khronos).
- KTX 2.0 Specification (Khronos).
- ACES (Academy Color Encoding System) v1.3.
- OpenColorIO (OCIO) v2.4.
- ISO 9001:2015 Madde 8.5.1, 8.6.
- ISO/IEC 27001:2022 A.5.12, A.8.25.
- Çapraz referans: Politika 31 (Asset Security), Politika 32 (Validation), Politika 39 (Real-time Performance).

### 11. Onay & Revizyon Geçmişi

| Sürüm | Tarih | Hazırlayan | Onaylayan | Değişiklik |
|-------|-------|------------|-----------|------------|
| 1.0 | 2026-06-21 | Lead Texture Artist + Color Pipeline TD | Technical Art Director + CTO | İlk yayın |
| 1.1 | (planlı) 2027-01-15 | Lead Texture Artist | Technical Art Director | ACES v2.0 güncellemesi |

---

## Politika No: 37 — 3D Render Farm Güvenliği Politikası

### 1. Amaç

Bu politika, NEXUS 3D Studio'nun dağıtık render farm altyapısının güvenliğini, performansını, maliyet verimliliğini ve operational excellence'ını garanti etmek amacıyla hazırlanmıştır. AAA render farm'ları, on binlerce CPU çekirdeği ve yüzlerce GPU içeren kritik altyapılardır; yanlış kuyruk yönetimi, yetkisiz erişim, kötü niyetli job injection, failover eksikliği veya cost tracking kaybı; milyonlarca dolarlık donanım ve enerji israfına, IP sızıntısına ve üretim gecikmelerine yol açabilir. Politika; AWS Thinkbox Deadline, Pixar "RenderMan" queue, ILM "Plumber" render farm, Google Zync ve Azure Batch referanslarını temel alır.

İkincil amaçlar: (i) distributed rendering queue yönetimini standardize etmek; (ii) priority management (project, user, deadline) kurallarını tanımlamak; (iii) resource allocation (CPU, GPU, RAM, disk, network) adil ve verimli yapmak; (iv) failover ve disaster recovery stratejisini tesis etmek; (v) cost tracking (per-user, per-project, per-shot) ile şeffaf maliyet raporlaması sağlamak; (vi) output validation ile render kalitesini otomatik denetlemek; (vii) karbon ayak izi (carbon footprint) takibi ile SBTi taahhüdüne uyumu garanti etmek.

### 2. Kapsam

Tüm render farm altyapıları: on-prem (kurum içi veri merkezi), cloud-burst (AWS, Google Cloud, Azure), hybrid (on-prem + cloud), third-party render service (Zync, Conductor, GarageFarm). Render engine'ler: Unreal Engine 5.4 (Movie Render Queue), Unity 2023 LTS (Render Pipeline), Pixar RenderMan 26, Arnold 7, V-Ray 6, Redshift 2024, Houdini Karma/Karma XPU, Blender Cycles/OptiX. Job türleri: frame render (cinematic), light bake (static lighting), texture bake (substance), simulation (cloth, fluid, destruction), video transcode, ML inference (DLC, denoiser). Yönetim araçları: Deadline 10, Tractor 3, OpenCue, Ru Scheduler.

### 3. Tanımlar

- **Render Farm**: Dağıtık render node'larından oluşan cluster.
- **Render Node**: Tek bir render job çalıştıran worker makine (CPU veya GPU).
- **Job Queue**: Bekleyen render job'larının öncelik sıralı listesi.
- **Priority Pool**: Job öncelik seviyesi (high, medium, low, background).
- **Resource Allocation**: CPU-core, GPU, RAM, disk, network tahsisi.
- **Failover**: Render node çökmesi durumunda job'un başka node'a taşınması.
- **Cloud Burst**: On-prem kapasitesi yetersiz geldiğinde cloud'a otomatik ölçeklenme.
- **Cost Tracking**: Job başına maliyet hesabı (CPU-saat, GPU-saat, storage, network).
- **Output Validation**: Render sonucu çıktısının kalite/technical doğrulaması.
- **Denoiser**: GPU veya ML tabanlı noise reduction (OptiX AI Denoiser, OIDN).
- **Job Manifest**: Job'un scene, frame range, output path, priority, resource requirement listesi.
- **Worker Pool**: Aynı konfigürasyona sahip node grubu (ör. GPU-worker-pool, CPU-worker-pool).

### 4. Roller & Sorumluluklar

- **Render Farm Manager**: Farm'ın günlük operasyonel yönetimi; queue monitoring, node health, incident response.
- **Pipeline TD (Render)**: Deadline/Tractor configuration, custom job submitter, output validation script'leri.
- **DevOps Engineer**: Cloud-burst automation, infrastructure-as-code (Terraform), auto-scaling.
- **FinOps Specialist**: Cost tracking, monthly maliyet raporu, cost optimization.
- **Security Engineer**: Farm network segmentation, node hardening, job authentication.
- **Sustainability Officer**: Carbon footprint takibi, energy efficiency report.

### 5. Politika Maddeleri

**5.1** Distributed rendering queue yönetimi: Kurum, AWS Thinkbox Deadline 10'u ana queue manager olarak kullanır. Deadline; priority-based fair-share scheduling, pool-based resource allocation, dependency graph (frame N depends on frame N-1's sim cache) ve event plugin'leri (job submit, task complete, error) destekler. Tüm job'lar Deadline'a `DeadlineCommand` veya `nexus-job-submit` CLI ile submit edilir; manuel node çalıştırma yasaktır.

**5.2** Priority management: Job priority 0-100 skalasında; 90-100 = "Critical" (production deadline <24 saat, executive review), 70-89 = "High" (production deadline <1 hafta), 50-69 = "Medium" (production active), 30-49 = "Low" (R&D, prototype), 0-29 = "Background" (archival, transcode). Priority yetki matrix'i: lead artist 0-69, production manager 0-89, render farm manager 0-100. Priority inflation (herkes "critical" seçerse queue bozulur) önlemek için weekly priority audit.

**5.3** Resource allocation: Worker pool'lar tanımlı — (i) GPU-pool-a100: 8× A100 80GB, 256 GB RAM, 64 vCPU; (ii) GPU-pool-rtx4090: 8× RTX 4090 24GB, 128 GB RAM, 32 vCPU; (iii) CPU-pool-epyc: 2× AMD EPYC 9654, 256 GB RAM; (iv) CPU-pool-threadripper: 1× Threadripper Pro 7995WX, 256 GB RAM. Job, resource requirement (GPU VRAM, CPU core, RAM, disk) ile pool'a match edilir; yanlış pool'da job submit edilirse otomatik redirect.

**5.4** Resource quota: Kullanıcı başına günlük kota — (i) GPU-saat: 200 (artist), 500 (lead), 1000 (TD); (ii) CPU-saat: 2000 (artist), 5000 (lead); (iii) RAM-saat: 16384 GB-saat; (iv) disk storage: 5 TB; (v) network egress: 100 GB. Kota aşımı: otomatik job kill + kullanıcı notification; lead artist onayı ile geçici kota artırımı (per-shot exception).

**5.5** Failover ve disaster recovery: Render node çökmesi durumunda: (i) Deadline otomatik retry (default 3 kez); (ii) farklı node'a redirect; (iii) fail log SIEM'e yazılır. Disaster recovery: on-prem farm tam çökme senaryosunda, cloud-burst (AWS auto-scaling group) 15 dakika içinde devreye girer; üretim job'ları priority 70+ otomatik cloud'a taşınır. RTO (Recovery Time Objective): 30 dakika; RPO (Recovery Point Objective): 0 (job queue durable storage).

**5.6** Cloud-burst politikası: On-prem GPU utilization >%85 ve queue depth >1000 job ise cloud-burst tetiklenir. Cloud seçimi: AWS (default, Spot Instance %70 indirim), Google Cloud (yedek), Azure (yedek). Spot Instance kullanımı: checkpoint (frame %50 tamamlandıysa, interrupt sırasında kayıp <1 dakika) zorunludur. Cloud job'lar VPN over WireGuard ile on-prem asset storage'a erişir; asset'ler S3 + CloudFront cache ile latency gizlenir.

**5.7** Job authentication ve authorization: Her job submit, kullanıcı kimlik doğrulaması (Kerberos veya OAuth 2.0 OIDC) gerektirir. Job manifest, kullanıcıyı, projeyi, shot'ı ve priority'yi imzalı (HMAC-SHA256) içerir; yetkisiz job submit reddedilir. Job runner node, kullanıcı kimlik bilgilerini görmez (job environment isolation); Politika 31 sandbox kuralı burada da geçerli.

**5.8** Output validation: Render çıktısı (frame) şu otomatik denetimlerden geçer — (i) file integrity (PNG/JPG/EXR valid, byte size >0); (ii) resolution ve color depth (4K, 16-bit EXR expected); (iii) brightness range (histogram, çok karanlık/açık tespit); (iv) noise level (denoiser hala çalışıyor mu, OptiX AI denoiser variance); (v) artifact detection (banding, firefly, missing geometry — ML model ile); (vi) shot continuity (frame N ile frame N+1 arasında major fark). Hatalı frame'ler otomatik re-queue.

**5.9** Cost tracking: Her job'a cost tag eklenir — `project`, `shot`, `user`, `priority`, `pool`. Job bittiğinde actual cost (CPU-saat × fiyat + GPU-saat × fiyat + storage + network) hesaplanır ve FinOps database'ine yazılır. Monthly cost report: proje bazlı, kullanıcı bazlı, shot bazlı breakdown. Cost anomaly detection (ör. bir shot beklenen 3× maliyet) otomatik alert.

**5.10** Karbon ayak izi: Her render job, kWh enerji tüketimi hesaplanır ve karbon emisyonu (kg CO2e, grid energy factor ile) hesaplanır. Cloud job'lar için cloud provider'ın carbon report'u (AWS Customer Carbon Footprint, Google Cloud Carbon Footprint, Azure Emissions Impact Dashboard) entegre edilir. Yıllık carbon budget: AAA başlık başına 500 ton CO2e (SBTi taahhüdü ile uyumlu). Aşım durumunda sustainability officer + CTO review.

**5.11** Network segmentation: Render farm ayrı VLAN'da (`10.20.x.x/16`); üretim ağından (`10.10.x.x`) firewall ile izole. Render node'lar yalnızca asset storage (NFS, S3) ve queue manager (Deadline) ile iletişim kurar; internet erişimi yalnızca license server'lar (RLM, FlexNet) için, allowlist'li. Outbound internet render node'dan yasak; cloud-burst sırasında WireGuard VPN dışında erişim yok.

**5.12** Node hardening: Render node'lar hardened Linux (Rocky Linux 9, CIS Benchmark Level 2) ile çalışır. Açık servis: yalnızca SSH (port 22, key-only auth, fail2ban), Deadline Worker (port 8082), NFS client. Firewall: default deny inbound, allowlist outbound. Anti-malware: ClamAV günlük scan. Patch management: monthly maintenance window (Pazar 02:00-06:00), critical patch 24 saat içinde.

**5.13** License management: Render engine lisansları (RenderMan, Arnold, V-Ray, Redshift) RLM (Reprise License Manager) veya FlexNet ile yönetilir. License pool: per-engine (ör. 100 RenderMan license, 50 Arnold license). Job, license mevcut değilse queue'da bekler; license release job bittiğinde otomatik. License denial log SIEM'e yazılır; anomaly (ör. bir kullanıcı sürekli denial) alert.

**5.14** Output storage lifecycle: Render çıktıları tiered storage'da saklanır — (i) hot storage (NVMe SSD, 7 gün, render sonrası review için); (ii) warm storage (HDD, 90 gün, iteration için); (iii) cold storage (S3 Glacier, 7 yıl, compliance ve archiving). Lifecycle policy otomatik; hot → warm 7 gün, warm → cold 90 gün, cold delete 7 yıl.

**5.15** Incident response: Render farm incident'leri (node crash, queue stall, license denial storm, malicious job) Politika 10 (Olay Müdahalesi) sürecine tabidir. P1 incident (tüm farm down): 15 dakika içinde on-call response, 1 saat içinde mitigation, 4 saat içinde root cause analysis. P2 (partial outage): 1 saat, 4 saat, 24 saat. P3 (single job failure): 4 saat, 1 gün, 1 hafta.

### 6. Prosedürler & İş Akışları

**Render Job Submission Workflow**:
1. Artist, DCC'de (Maya, Houdini, Unreal) sahneyi hazırlar, output path belirler.
2. `nexus-job-submit` CLI ile job submit; job manifest (scene, frame range, priority, pool, output) otomatik generate.
3. Deadline, kullanıcı kimlik doğrulaması (Kerberos), job manifest HMAC doğrulaması yapar.
4. Queue manager, job'u priority'ye göre sıraya alır, resource match yapar.
5. Worker node, job'ı alır, scene'i asset storage'dan çeker, render başlar.
6. Render sırasında: progress heartbeat (her 30 saniye), checkpoint (her 10 frame).
7. Frame tamamlandı: output validation (Politika Madde 5.8). Hata varsa re-queue.
8. Tüm frame'ler bitti: shot "render complete" notification, output hot storage'a.
9. Cost tracking: actual cost hesaplanır, FinOps DB'ye yazılır.
10. Review: dailies'de shot review; "Approved" veya "Rerender" statü.

### 7. Uyumluluk & İzleme

- ISO 9001:2015 Madde 8.5.1, 8.6.
- ISO/IEC 27001:2022 A.5.12, A.5.14, A.8.6 (Capacity Management), A.8.16 (Monitoring).
- ISO/IEC 27031 (Business Continuity).
- NIST CSF 2.0 — Identify, Protect, Detect, Respond, Recover.
- KPI'lar: (i) Farm uptime ≥%99.5; (ii) Job SLA (priority 90+: <2 saat) ≥%95; (iii) Failover RTO <30 dak; (iv) Cost per shot trend (azalış); (v) Carbon footprint <500 ton CO2e/AAA başlık.
- Dashboard: Grafana "Render Farm Health" — pool utilization, queue depth, cost per day, carbon footprint.

### 8. İhlal Yaptırımları

- Resource quota bilerek aşma: kullanıcı 1 hafta render yasağı.
- Yetkisiz job submit (başka kullanıcı kimliğine bürünme): Politika 18 Madde 9 disiplin süreci; gerekirse sonlandırma.
- Cloud-burst maliyetini gizleme: FinOps specialist + CTO review.
- Render farm'ı kötü niyetli job ile meşgul etme (DoS): CISO + render farm manager + IP counsel süreci; yasal takip.

### 9. İstisnalar

- Eski (legacy) başlık re-render: on-prem pool'a priority 80, cloud-burst yasak (maliyet kontrolü).
- R&D deneysel render: cloud Spot Instance, priority 30, cost cap günlük $500.
- Öğrenci/stajyer render job: priority 0-29, günlük 20 GPU-saat kota.

### 10. İlgili Standartlar

- AWS Thinkbox Deadline 10 Documentation.
- Pixar RenderMan 26 + Tractor 3.
- Google Zync Render API.
- Azure Batch Documentation.
- OpenCue (Apache 2.0, open-source).
- ISO/IEC 27001:2022 A.5.12, A.5.14, A.8.6, A.8.16.
- ISO/IEC 27031 (Business Continuity).
- NIST CSF 2.0.
- SBTi (Science Based Targets initiative) Corporate Standard.
- Çapraz referans: Politika 10 (Olay Müdahalesi), Politika 14 (Donanım), Politika 15 (Ağ), Politika 31 (Asset Security).

### 11. Onay & Revizyon Geçmişi

| Sürüm | Tarih | Hazırlayan | Onaylayan | Değişiklik |
|-------|-------|------------|-----------|------------|
| 1.0 | 2026-06-21 | Render Farm Manager + Pipeline TD | CTO + CISO | İlk yayın |
| 1.1 | (planlı) 2027-01-15 | Render Farm Manager | CTO | AWS Spot Block güncellemesi |

---

## Politika No: 38 — 3D Asset Versioning & IP Politikası

### 1. Amaç

Bu politika, NEXUS 3D Studio'nun tüm 3D asset'lerinin sürüm yönetimi, fikri mülkiyet (IP) korunması, telif hakkı uyumu ve dijital provenance (köken) izi ile ilgili süreçlerini standartlaştırmak amacıyla hazırlanmıştır. AAA prodüksiyon, bir başlık için 50.000+ asset üretir; her asset birden fazla revizyondan geçer, farklı sanatçılar üzerinde çalışır ve son halinde değişiklik yapılabilir. Sürüm kontrolü olmadan, kimin neyi ne zaman yaptığı belirsizleşir, IP anlaşmazlıkları çözülemez ve DMCA (Digital Millennium Copyright Act) ihlalleri kaçınılmaz olur. Politika; git, Perforce Helix Core, git-lfs ve Pixar "Asset Repository" standartlarını temel alır.

İkincil amaçlar: (i) semantic versioning (MAJOR.MINOR.PATCH) standardını 3D asset'lere uygulamak; (ii) git-lfs ile binary asset'lerin versiyon kontrolünü yapmak; (iii) DMCA compliance (notice-and-takedown) sürecini tanımlamak; (iv) watermarking ile asset provenance'ı garanti etmek; (v) provenance tracking (immutable audit log) ile IP kanıt zinciri oluşturmak; (vi) license management (CC, Royalty-Free, Editorial, Custom) süreçlerini kurumsallaştırmak; (vii) third-party asset (Asset Store, marketplace) kullanım uyumunu garanti etmek.

### 2. Kapsam

Tüm 3D asset'ler (mesh, rig, animation, texture, material, shader, scene, cinematic, audio-visual 3D content), source file (DCC-native), intermediate (export format), runtime export (engine paket). Versiyon kontrol sistemleri: Git (text), Git LFS (binary), Perforce Helix Core (large scale, AAA stüdyo standard), Subversion (legacy, yasak yeni kullanım). IP türleri: original (kurum içi üretim), commissioned (outsourcing), purchased (marketplace), open-source (CC0, CC-BY, OFL), licensed (commercial license), editorial (non-commercial, restricted).

### 3. Tanımlar

- **Semantic Versioning (SemVer)**: MAJOR.MINOR.PATCH formatında sürüm numaralandırma; MAJOR = breaking change, MINOR = new feature backward-compatible, PATCH = bug fix.
- **Git LFS (Large File Storage)**: Git extension; binary dosyaları ayrı LFS server'da saklar, Git repo'da pointer bırakır.
- **Perforce Helix Core**: AAA stüdyo standardı binary version control; large file, branching, lock support.
- **Provenance**: Bir asset'in üretim zinciri (kim, ne zaman, hangi tool, hangi lisans) ile ilgili immutable kayıt.
- **DMCA (Digital Millennium Copyright Act)**: ABD telif hakkı yasası; notice-and-takedown süreci (17 USC §512).
- **Watermark**: Asset'e gömülü (visible veya invisible) kaynak işareti.
- **License**: Asset kullanım haklarını tanımlayan yasal sözleşme; CC0, CC-BY, CC-BY-SA, CC-BY-NC, Royalty-Free, Editorial, Custom.
- **Asset License Agreement (ALA)**: Kurum ile vendor arasındaki özel lisans sözleşmesi.
- **Notice-and-Takedown**: Telif ihlali iddiasında asset'in geçici olarak kaldırılması ve yayıncıya savunma hakkı tanınması süreci.
- **Counter-Notice**: Telif ihlali iddiasına karşı yayıncının savunması; DMCA §512(g).
- **IP Audit Log**: Append-only, immutable asset değişiklik kaydı; blockchain benzeri hash chain.

### 4. Roller & Sorumluluklar

- **Asset Librarian**: Asset repository yönetimi, versioning policy enforcement, license DB.
- **IP Counsel (Hukuk Danışmanı)**: Lisans sözleşmeleri, DMCA süreci, IP anlaşmazlık yönetimi.
- **Pipeline TD**: Git/Perforce integration, Git LFS configuration, versioning CI.
- **DPO & Compliance Lead**: GDPR/KVKK uyumu (asset metadata PII içeriyorsa), düzenleyici raporlama.
- **3D Security Lead**: Watermark algorithm, provenance log integrity.
- **Studio Head / COO**: IP stratejisi onayı, dış vendor müzakereleri.

### 5. Politika Maddeleri

**5.1** Semantic versioning (SemVer) tüm 3D asset'lere uygulanır — MAJOR.MINOR.PATCH. MAJOR: breaking change (ör. rig rebuild, topology overhaul, retopology); MINOR: new feature (ör. yeni LOD, yeni material variant, yeni animation clip); PATCH: bug fix (ör. UV fix, weight paint düzeltme). Version increment kuralları: MAJOR upgrade pipeline notification (eski versiyona bağımlı sahneler uyarılır), MINOR/PATCH backward-compatible. Asset adında version suffix zorunludur (ör. `HeroSoldier_v2.1.3.fbx`).

**5.2** Git LFS kullanım politikası: Binary asset'ler (FBX, glb, usdc, blend, tga, png, exr) Git LFS ile saklanır; `.gitattributes` dosyasında track pattern tanımlı (ör. `*.fbx filter=lfs diff=lfs merge=lfs -text`). LFS storage: on-prem LFS server (Nexus Repo, GitHub Enterprise Server, GitLab Self-Managed) tercih edilir; cloud LFS (GitHub.com LFS) yalnızca küçük repo'lar için. LFS bandwidth quota: 50 GB/ay/kullanıcı (Git LFS network cost); aşım durumunda on-prem migration.

**5.3** Perforce Helix Core büyük projelerde tercih edilir. AAA başlık (10.000+ asset, 100+ artist) için Perforce zorunludur; Git LFS bu ölçeği yönetmekte zorlanır (clone time saatler, lock conflict). Perforce: file-level lock (artist asset'i "checkout" eder, başka artist override edemez), streams (branch management), replica server (co-located artist). Git (text asset, USD ASCII, glTF text) yine de ikincil kullanılır.

**5.4** DMCA compliance süreci: Telif hakkı ihlali iddiası ("DMCA notice") alındığında: (i) IP counsel notice'i değerlendirir (statutory requirement: signature, identification, good faith); (ii) iddia edilen asset 24 saat içinde prodüksiyondan geçici olarak kaldırılır ("takedown"); (iii) asset'in yaratıcısına (iç çalışan ise) veya vendor'a (outsourced ise) bildirim; (iv) counter-notice (savunma) için 10 iş günü süre; (v) counter-notice gelirse asset 14 iş günü içinde geri yüklenir, gov 14 gün içinde mahkeme kararı beklenir; (vi) counter-notice yoksa asset kalıcı olarak kaldırılır. Politika 2 (Veri Gizliliği) ile entegrasyon: kişi verisi içeriyorsa ek KVKK/GDPR değerlendirmesi.

**5.5** Watermarking zorunludur: Tüm unreleased "confidential" asset'lere (i) invisible watermark (frequency-domain DCT, 64-bit payload: asset UUID + version + kullanıcı ID); (ii) visible watermark (köşe logosu, dev build'lerde). Invisible watermark algorithm: Stable Signature veya DEW (Differential Energy Watermarking); JPEG/PNG compression'a dayanıklı, screencapture'a dayanıklı. Watermark extraction tool: `nexus-watermark-extract`, asset leak durumunda kaynak tespiti için.

**5.6** Provenance tracking (immutable audit log): Her asset değişikliği append-only log'a (Apache Kafka + immutable S3 Object Lock, veya blockchain Hyperledger Fabric) yazılır — timestamp, user, tool version, operation (create, modify, delete, license-change), file hash (SHA-256), previous hash (chain). Log, IP anlaşmazlığında kanıt olarak sunulabilir; düzenleyici denetimde "chain of custody" sağlar. Log retention: 7 yıl (Politika 16 Loglama ile uyumlu).

**5.7** License management: Asset DB'de her asset için license field zorunludur — type (CC0, CC-BY, CC-BY-SA, CC-BY-NC, Royalty-Free, Editorial, Custom ALA), source (vendor, marketplace, internal), license text (URL veya attached), expiration (varsa), usage rights (commercial, modification, distribution), attribution requirement. License type ile platform tag uyumu: Editorial asset'lar commercial release'de kullanılamaz; CC-BY-SA asset'lar proprietary başlıkta kullanılamaz (viral license).

**5.8** Asset License Agreement (ALA) outsource vendor'lar için zorunludur. ALA minimum clause'lar: (i) work-for-hire (telif hakkı kuruma devir); (ii) warranty of originality (vendor, asset'in kendisinin olduğunu beyan); (iii) indemnification (telif ihlali durumunda vendor tazminat); (iv) audit right (kurum, vendor süreçlerini denetleme hakkı); (v) confidentiality (NDA entegre); (vi) termination (sözleşme fesih şartları). ALA imzalı değilse asset prodüksiyona alınamaz.

**5.9** Third-party asset store kullanım uyumu: Unity Asset Store, Unreal Marketplace, Sketchfab, TurboSquid satın alımlarında: (i) license tier (Personal/Professional/Enterprise) kullanıcı sayısına uygun; (ii) Editorial-only asset'lar "Editorial Only" tag ile commercial release'de yasak; (iii) Extended License gerekli senaryolar (ör. multiplayer oyun, merchandising) tespit edilir; (iv) asset'in "Modified" hali için license compliance (bazı license modifikasyon izin vermez); (v) Satın alma kaydı (invoice, license key) Asset DB'de 7 yıl saklanır.

**5.10** Open-source asset (CC0, CC-BY, OFL) kullanımı: CC0 (Public Domain) serbest; CC-BY (attribution required) — asset credit listesinde kaynak gösterim zorunlu; CC-BY-SA (Share-Alike) — proprietary başlıkta kullanılamaz (türev work de CC-BY-SA olmalı); CC-BY-NC (Non-Commercial) — commercial AAA başlıkta kullanılamaz. Attribution listesi: oyun "Credits" bölümünde, web sitesinde, dokümantasyonda yayınlanır.

**5.11** Asset fork (branching) politikası: Bir asset'ten türev oluşturulduğunda (ör. hero karakterden NPC variant), SemVer MAJOR increment zorunludur. Fork edilen asset, "derived_from" field'ında parent asset'in UUID ve version'ını içerir; provenance log otomatik parent'a bağlanır. Fork ile IP hakları parent'tan devralınır (ör. parent CC-BY ise fork da CC-BY).

**5.12** Asset merge (birleştirme) politikası: İki asset'in birleştirilmesi (ör. iki karakterin blendshape'lerinin merge) durumunda: (i) her iki asset'in license'ı da uyumlu olmalı (CC-BY + CC-BY-SA = CC-BY-SA, daha sıkı license kazanır); (ii) provenance log her iki parent'a da link; (iii) yeni UUID atanır; (iv) SemVer MAJOR. Merge sonrası IP counsel review (özellikle farklı vendor'lardan gelmişse).

**5.13** Asset retirement (emeklilik): Bir asset prodüksiyondan kaldırıldığında: (i) "Retired" statüsü, kullanılmıyor; (ii) asset DB'de kalır (provenance için); (iii) hot storage'dan cold storage'a (S3 Glacier Deep Archive) taşınır; (iv) runtime paketten çıkarılır; (v) retirement tarihi, sebebi, onaylayan log'a yazılır. Retired asset 7 yıl süreyle cold storage'da saklanır (denetim, IP savunma için).

**5.14** IP infringement response (ihlal tespiti): Kurum'un asset'inin izinsiz kullanımı tespit edildiğinde (ör. dış platformda, başka oyunda): (i) IP counsel DMCA notice hazırlar; (ii) platforma (Steam, App Store, Google Play, web hosting) gönderir; (iii) Watermark extraction tool ile kaynak kanıtı toplanır; (iv) takip: counter-notice, mahkeme süreci. İhlal iddiası → 14 gün içinde notice gönderimi.

**5.15** Asset validation CI gate: `nexus-ip-validator` her asset commit'inde çalışır. Kontroller: (i) SemVer format; (ii) license field present ve approved-list içinde; (iii) ALA imzalı mı (vendor asset için); (iv) attribution required (CC-BY) ve dosyada attribution yoksa ERROR; (v) watermark embedded (confidential asset için); (vi) provenance log entry written; (vii) Editorial asset commercial build'de ERROR. ERROR → PR bloke; WARNING → comment.

### 6. Prosedürler & İş Akışları

**Asset Versioning Workflow**:
1. Artist, asset'i DCC'de modifier; naming convention uygular.
2. Pre-commit hook: SemVer kontrolü, license field, manifest validation.
3. Commit: Git LFS veya Perforce'a; provenance log append (immutable).
4. CI pipeline: `nexus-ip-validator` ERROR/WARNING raporu.
5. Watermark: confidential asset için `nexus-watermark-embed` çalışır.
6. Asset DB: UUID, version, license, author, timestamp update.
7. Lock: asset "Production Ready" statüsüne geçer; MAJOR change için unlock + new version.
8. Retirement: asset 7 yıl sonra cold storage'a; provenance log kalıcı.

### 7. Uyumluluk & İzleme

- ISO 9001:2015 Madde 7.5 (Documented Information), Madde 8.5.1.
- ISO/IEC 27001:2022 A.5.12, A.5.14, A.8.10, A.8.12 (Data Leakage Prevention).
- DMCA (17 USC §512) — notice-and-takedown.
- EU Copyright Directive (2019/790) Article 17 — user-uploaded content.
- KVKK Madde 12 (veri güvenliği), Madde 17 (silme).
- KPI'lar: (i) SemVer compliance %100; (ii) License field present %100; (iii) DMCA notice → takedown SLA ≤24 saat; (iv) Watermark embedding %100 (confidential asset); (v) Provenance log integrity (hash chain validation) %100.
- Dashboard: ShotGrid "IP Compliance" — license distribution, attribution completeness, DMCA incident count.

### 8. İhlal Yaptırımları

- Editorial asset'ı commercial build'de kullanma: asset removal + lead artist + IP counsel görüşmesi; gerekirse rework.
- License field boş asset DB'ye commit: pre-commit hook ERROR; commit bloke.
- Watermark'ı atlayarak asset dağıtma: 3D Security Lead + CISO görüşmesi; gerekirse disiplin (Politika 18).
- ALA imzalamadan vendor asset prodüksiyona alma: IP counsel + vendor manager review; vendor ile sözleşme yenileme.
- DMCA notice'ini geciktirme (24 saat SLA): IP counsel + CTO review; tazminat riski.

### 9. İstisnalar

- R&D deneysel asset'ler SemVer "0.x.y" kullanabilir (pre-release); üretim build'inde yer alamaz.
- Eski (3+ yaş) başlık asset'leri "legacy compliance" tolerance: license field boş olabilir, retrospektif doldurma 6 ay içinde.
- CC0 (Public Domain) asset'ler için attribution zorunluluğu yok (yine de iyi niyet için önerilir).

### 10. İlgili Standartlar

- Semantic Versioning 2.0.0 (semver.org).
- Git LFS Specification v3.
- Perforce Helix Core Documentation.
- DMCA (17 USC §512).
- EU Copyright Directive (2019/790) Article 17.
- Creative Commons 4.0 License Suite.
- ISO 9001:2015 Madde 7.5, 8.5.1.
- ISO/IEC 27001:2022 A.5.12, A.5.14, A.8.10, A.8.12.
- NIST SP 800-86 (Forensics — chain of custody).
- Çapraz referans: Politika 2 (Veri Gizliliği), Politika 4 (Şifreleme), Politika 16 (Loglama), Politika 31 (Asset Security), Politika 33 (Format Standards).

### 11. Onay & Revizyon Geçmişi

| Sürüm | Tarih | Hazırlayan | Onaylayan | Değişiklik |
|-------|-------|------------|-----------|------------|
| 1.0 | 2026-06-21 | Asset Librarian + IP Counsel | CTO + CISO + DPO | İlk yayın |
| 1.1 | (planlı) 2027-01-15 | IP Counsel | CTO + DPO | EU Copyright Directive Article 17 tam uyum |

---

## Politika No: 39 — Real-time 3D Performance Politikası

### 1. Amaç

Bu politika, NEXUS 3D Studio'nun gerçek zamanlı (real-time) 3D uygulamalarında — AAA oyun (PC, PS5, Xbox Series X/S, Switch), VR/AR (Meta Quest 3, Apple Vision Pro), WebGL/WebGPU (browser) ve cloud streaming (GeForce NOW) — hedeflenen frame rate ve bellek bütçelerini garanti etmek amacıyla hazırlanmıştır. Real-time 3D, offline render'dan farklı olarak kullanıcı etkileşimine (input latency <20ms) ve kararlı frame rate'e (FPS drop <%5) zorunludur; bu nedenle draw call, texture memory, shader complexity, LOD distance, occlusion culling ve instancing gibi optimizasyon teknikleri "nice-to-have" değil "Definition of Done" şartıdır. Politika; Unreal Engine 5.4 Nanite/Lumen, Unity 2023 LTS HDRP/URP, GPU Open Vulkan ve PIX (Performance Investigator for Xbox) referanslarını temel alır.

İkincil amaçlar: (i) draw call budget (<2000 PC, <1500 PS5/Xbox, <500 Switch, <300 mobile) tanımlamak; (ii) texture memory budget (<512MB mobile, <4GB PC) zorlamak; (iii) shader complexity (ALU operation count, texture sample) limitlerini tanımlamak; (iv) LOD distance curve'lerini standartlaştırmak; (v) occlusion culling ve frustum culling'in doğru kullanımını garanti etmek; (vi) instancing (static, dynamic, GPU) ile performans kazanmak; (vii) automatic profiling ve regression test'leri tesis etmek.

### 2. Kapsam

Tüm real-time 3D sahneler (gameplay level, cinematic, UI 3D, VR/AR session, WebGL demo). Platform: PC (DX12, Vulkan), PS5, Xbox Series X/S, Switch, Meta Quest 3, Apple Vision Pro, iOS (A17 Pro+), Android (Adreno 740+), WebGL2/WebGPU browser. Profiling araçları: Unreal Insights, Unity Profiler, RenderDoc, PIX, NVIDIA Nsight, Apple Instruments, Snapdragon Profiler. Engine: Unreal Engine 5.4 (Nanite, Lumen, Niagara, Chaos), Unity 2023 LTS (HDRP, URP, DOTS).

### 3. Tanımlar

- **Draw Call**: GPU'ya gönderilen render komut paketi; CPU-bound, <2000 hedef.
- **Texture Memory (VRAM)**: GPU video RAM; <512MB mobile, <4GB PC hedef.
- **Shader Complexity**: Pixel/vertex shader'ın ALU operation sayısı; ~128 ALU mobile, ~512 ALU PC.
- **LOD Distance**: Kameraya uzaklığa göre LOD seviyesinin değiştiği mesafe noktası.
- **Occlusion Culling**: Kamera tarafından görülmeyen (arka taraf) object'lerin render dışı bırakılması.
- **Frustum Culling**: Kamera frustum'ı dışındaki object'lerin render dışı bırakılması.
- **Instancing**: Aynı mesh'in birden çok kopyasını tek draw call ile render etme.
- **GPU Instancing**: Hardware-level instancing; vertex ID ile instance verisi çekme.
- **Nanite (Unreal 5)**: Virtualized geometry system; mikropolygon render, LOD otomatik.
- **Lumen (Unreal 5)**: Real-time global illumination ve reflection system.
- **DOTS (Unity)**: Data-Oriented Technology Stack; ECS (Entity Component System) yüksek performans.
- **Frame Time Budget**: 60 FPS = 16.67ms/frame, 30 FPS = 33.33ms/frame, 90 FPS (VR) = 11.11ms/frame.
- **Bottleneck**: CPU-bound, GPU-bound, memory-bandwidth-bound, draw-call-bound.

### 4. Roller & Sorumluluklar

- **Lead Graphics Programmer**: Render pipeline ve shader optimizasyon.
- **GPU Performance Engineer**: Profiling, bottleneck tespiti, optimization plan.
- **Technical Artist**: Asset optimization (LOD, mesh, texture, material).
- **Level Designer**: Scene composition, occlusion, instancing setup.
- **Build Engineer**: Auto-profile CI pipeline, regression test.
- **Platform Specialist**: PS5, Xbox, Switch, mobile, VR specific optimization.
- **QA Performance Tester**: Build örneklemesi, FPS/frame time ölçüm, anomaly report.

### 5. Politika Maddeleri

**5.1** Frame rate hedefleri platform-bazında: PC AAA = 60 FPS (1% low >45 FPS), PS5 = 60 FPS (Performance Mode) veya 30 FPS (Quality Mode); Xbox Series X = 60 FPS, Xbox Series S = 60 FPS (dynamic resolution); Switch = 30 FPS (docked/handheld); Mobile = 60 FPS (high-end), 30 FPS (low-end); VR (Quest 3) = 72-90 FPS (ASW — Application SpaceWarp fallback 60→120); Cloud = 60 FPS.

**5.2** Frame time budget: 60 FPS = 16.67 ms/frame, 30 FPS = 33.33 ms, 90 FPS = 11.11 ms, 120 FPS = 8.33 ms. CPU/GPU time dağılımı hedefi: CPU 60% / GPU 40% (CPU-bound tipik), 50/50 (balanced), 40/60 (GPU-bound, örn. mobile). Frame time budget breakdown: render thread 8ms (60 FPS), game thread 6ms, RHI thread 2ms; aşım durumunda optimization plan.

**5.3** Draw call budget: PC AAA <2000 draw call/frame, PS5 <1500, Xbox Series X <1500, Xbox Series S <1200, Switch <500, Mobile <300, VR <500. Draw call aşımı durumunda: (i) static batching (static object'lar tek mesh); (ii) dynamic batching (mobile'da küçük mesh); (iii) GPU instancing (aynı mesh + material); (iv) merge mesh (komşu object'ler tek mesh); (v) texture atlas (komşu UV'ler tek texture). Draw call profiling: Unreal Insights `stat scenerendering`, Unity Frame Debugger.

**5.4** Texture memory (VRAM) budget: PC AAA <4 GB (16 GB total VRAM içinde, 4K res target), PS5 <4 GB (16 GB GDDR6), Xbox Series X <4 GB, Xbox Series S <2 GB (10 GB), Switch <512 MB (4 GB), Mobile <512 MB (4-8 GB), VR (Quest 3) <1 GB (8 GB). Budget aşımı: (i) texture streaming (Politika 36 Madde 5.8); (ii) texture compression (BC7/ASTC, Politika 36 Madde 5.3); (iii) texture atlas; (iv) virtual texturing (Unreal VT, Unity VT).

**5.5** Shader complexity limitleri: Pixel shader — mobile <128 ALU, PC AAA <512 ALU, console <400 ALU. Texture sample sayısı — mobile <8, PC <16. Vertex shader — mobile <64 ALU, PC <256. Shader complexity profiling: Unreal Shader Complexity view, Unity Frame Debugger. Karmaşık shader (ör. subsurface scattering, anisotropic) yalnızca hero karakter için, NPC'ler için basit shader.

**5.6** LOD distance curve standartları: LOD0 → LOD1 geçiş ekran boyutu (screen size) — PC AAA 0.5 (LOD0 %50 ekran boyutundan küçükse LOD1), PS5 0.5, Xbox Series S 0.4, Switch 0.6, Mobile 0.7, VR 0.8. LOD distance curve yerine "screen size" tercih edilir (camera FOV'dan bağımsız). LOD chain completeness zorunludur (Politika 32 Madde 5.5).

**5.7** Occlusion culling: Sahne'de occlusion culling zorunludur — (i) Unreal: Hardware Occlusion Queries (default) veya Software Occlusion (mobile); (ii) Unity: Umbra (built-in) veya custom HLOD. Occluder mesh'ler (büyük duvarlar, binalar) "occluder" tag ile işaretlenir; occludee (küçük object) otomatik cull edilir. Occlusion culling kalitesi sahne testinde ölçülür: cull ratio >%70 (görünmeyen object'lerin >%70'i cull ediliyor).

**5.8** Frustum culling: Default engine frustum culling yeterli; manuel override yalnızca özel durum (ör. large terrain chunk pre-load). Frustum cull ratio >%95 (camera frustum dışı object'lerin >%95'i cull ediliyor).

**5.9** Instancing standartları: Aynı mesh + aynı material ile render edilen ≥10 kopya için GPU instancing zorunludur — örn. ormandaki ağaçlar, taş duvarın tuğlaları, kalabalık NPC. Static instancing: edit-time bake (terrain detay, foliage), dynamic instancing: runtime (particle, crowd), GPU instancing: hardware (thousands of instances tek draw call). Unreal: ISM (Instanced Static Mesh), HISM (Hierarchical ISM); Unity: GPU Instancing, ECS.

**5.10** Nanite (Unreal 5) kullanım politikası: Nanite, mikropolygon render için; LOD chain gerektirmez (otomatik), draw call ~1/static mesh. Nanite kullanım limitleri — PC ve PS5 (default enabled), Xbox Series S (kısıtlı, <50K mesh), Switch (desteklenmiyor), Mobile (desteklenmiyor), VR (kısıtlı). Nanite fallback (non-Nanite platform) için LOD chain zorunludur (Politika 32 Madde 5.5).

**5.11** Lumen (Unreal 5) kullanım politikası: Lumen real-time GI; PC ve PS5'te default, Xbox Series S'te kısıtlı (Lumen Screen-space fallback), Switch ve mobile'da desteklenmiyor. Lumen scene capture cost <3 ms/frame; aşım durumunda: (i) Lumen scene resolution düşürme; (ii) Lumen final gather quality düşürme; (iii) Lumen mesh distance field optimizasyon; (iv) Lumen off + baked lightmap fallback.

**5.12** Memory budget (system RAM): PC AAA <16 GB (32 GB total), PS5 <12 GB (16 GB), Xbox Series X <12 GB, Xbox Series S <7 GB (10 GB), Switch <3 GB (4 GB), Mobile <2 GB (4-8 GB). Memory budget breakdown: render target 2 GB, asset 4 GB, audio 1 GB, gameplay 2 GB, OS 1 GB. Memory leak detection: continuous profiling (24 saat soak test), leak >10 MB/saat alert.

**5.13** Network bandwidth budget (multiplayer): Client ↔ server bandwidth — PC AAA <256 KB/s (down) + 64 KB/s (up), mobile <64 KB/s + 16 KB/s, VR <128 KB/s + 32 KB/s. Bandwidth aşımı: (i) delta compression (değişen veri yalnızca); (ii) interest management (oyuncuya yakın object'ler yalnızca); (iii) event-based replication (tick yerine); (iv) quantization (16-bit float yerine 8-bit).

**5.14** Automatic profiling CI pipeline: Her nightly build'de otomatik profiling çalışır — (i) automated gameplay bot'lar (Unreal Automation System, Unity Test Framework); (ii) sahne başına frame time, draw call, VRAM ölçümü; (iii) baseline ile karşılaştırma (regression detection); (iv) regression >%10 alert, >%20 build fail. Profiling sonuçları InfluxDB + Grafana dashboard.

**5.15** Performance review gate: Her milestone (alpha, beta, gold) öncesi performance review — (i) full platform test (tüm hedef platformlar); (ii) 30 dakika gameplay bot + 1 saat manuel test; (iii) frame time, draw call, VRAM, RAM, network 95. percentile (P95); (iv) P95 frame time <1.2 × budget (60 FPS budget = 16.67 ms, P95 <20 ms). Aşım durumunda milestone delayed; optimization plan + CTO onayı.

### 6. Prosedürler & İş Akışları

**Performance Optimization Workflow**:
1. Profiling: Unreal Insights / Unity Profiler ile sahne profile edilir, bottleneck tespit edilir.
2. Analysis: bottleneck (CPU, GPU, memory) belirlenir, top 10 worst frame incelenir.
3. Hypothesis: optimization hypothesis (ör. "foliage instancing eksik, +200 draw call").
4. Implementation: instancing setup, LOD adjust, material optimize, culling verify.
5. Verification: re-profile, frame time ölçüm, baseline karşılaştırma.
6. Regression: nightly CI profiling ile uzun süre trend takip.
7. Documentation: optimization summary (before/after, technique), wiki.

### 7. Uyumluluk & İzleme

- ISO 9001:2015 Madde 8.5.1, 8.6, 9.1.3 (Analysis and Evaluation).
- ISO/IEC 27001:2022 A.8.6 (Capacity Management), A.8.16 (Monitoring).
- KPI'lar: (i) Frame rate P95 ≥hedef ×0.95; (ii) Draw call ≤budget; (iii) VRAM ≤budget; (iv) Memory leak <10 MB/saat; (v) Regression detection time <24 saat.
- Dashboard: Grafana "Real-time Performance" — frame time, draw call, VRAM per scene per platform, regression alert.

### 8. İhlal Yaptırımları

- Draw call/VRAM budget bilerek aşma (ör. "geçici" acceptance): lead artist/level designer uyarısı + 24 saat içinde fix.
- Profiling CI'ı bypass etme: build engineer uyarısı + dev branch'tan çıkarma.
- Performance regression'ı gizleme (ör. baseline değiştirme): technical art director + CTO review.
- Gold milestone'u performance review olmadan release: CTO onayı gerekli; onsuz yasak.

### 9. İstisnalar

- Cinematic pre-render: real-time budget geçerli değil (offline render, Politika 37).
- Loading screen: frame rate target geçerli değil, yalnız loading time budget (<30 sn).
- Cinematic intro cutscene (engine): budget ×1.5 tolerans (30 FPS acceptable for 60 FPS target).

### 10. İlgili Standartlar

- Unreal Engine 5.4 Profiling and Optimization Guide.
- Unity 2023 LTS Performance Best Practices.
- GPU Open Vulkan Performance Guide.
- PIX (Performance Investigator for Xbox) Documentation.
- RenderDoc Documentation.
- NVIDIA Nsight Graphics.
- Apple Instruments.
- ISO 9001:2015 Madde 8.5.1, 8.6, 9.1.3.
- ISO/IEC 27001:2022 A.8.6, A.8.16.
- Çapraz referans: Politika 31 (Asset Security), Politika 32 (Validation), Politika 36 (Texture & Material), Politika 37 (Render Farm).

### 11. Onay & Revizyon Geçmişi

| Sürüm | Tarih | Hazırlayan | Onaylayan | Değişiklik |
|-------|-------|------------|-----------|------------|
| 1.0 | 2026-06-21 | Lead Graphics Programmer + GPU Performance Engineer | Technical Art Director + CTO | İlk yayın |
| 1.1 | (planlı) 2027-01-15 | Lead Graphics Programmer | CTO | Unreal 5.5 + Unity 2024 LTS güncellemesi |

---

## Politika No: 40 — 3D Collaboration & Review Politikası

### 1. Amaç

Bu politika, NEXUS 3D Studio'nun çok kullanıcılı (multi-user) 3D prodüksiyon işbirliği ve review süreçlerini standartlaştırmak amacıyla hazırlanmıştır. AAA prodüksiyon, 100+ kişilik uzman ekibini (artist, animator, rigger, lighter, compositor, producer) tek bir sahne üzerinde eş zamanlı çalışmaya zorlar; bu da multi-user editing, annotation system, review cycle, approval workflow, version comparison ve change tracking gereksinimlerini doğurur. Yanlış yönetilen collaboration; "merge conflict", "lost work", "kötü review annotation", "uzun onay döngüsü" ve "yanlış versiyon yayın" gibi sorunlara; bunlar da milyonlarca dolarlık rework ve ekip moralinin düşmesine yol açar. Politika; Autodesk Flow Production Tracking (ShotGrid), Perforce Helix Core streams, Unity Plastic SCM, Frame.io, ftrack Studio ve Pixar "Review Tool" standartlarını temel alır.

İkincil amaçlar: (i) multi-user editing kurallarını (lock, branch, merge) tanımlamak; (ii) annotation system (3D viewport annotation, frame-by-frame comment) standartlaştırmak; (iii) review cycle (dailies, weekly, milestone) süreçlerini kurmak; (iv) approval workflow (reviewer, approver, sign-off) hiyerarşisini tanımlamak; (v) version comparison (A/B compare, overlay, timeline scrub) araçlarını standartlaştırmak; (vi) change tracking (who, what, when, why) ile denetlenebilirlik sağlamak; (vii) async ve sync review senaryolarını desteklemek.

### 2. Kapsam

Tüm AAA prodüksiyon sahnesi, shot, asset ve sequence'ler. Collaboration araçları: Autodesk Flow Production Tracking (ShotGrid), ftrack Studio, Flow Production Tracking (Maya/3ds Max), Perforce Helix Core (file-level lock, streams), Unity Plastic SCM (branch, merge), Git/GitHub Enterprise (code + small asset), Frame.io (video review), SyncSketch (3D viewport review), Looker (asset DB). Review modları: sync (real-time, tüm ekip aynı anda), async (zaman kaydırmalı, farklı saat dilimleri), hybrid (sync kickoff + async iteration). Katılımcı rolleri: artist (üretici), reviewer (değerlendiren), approver (imzalayan), observer (bilgilendirme).

### 3. Tanımlar

- **Multi-user Editing**: Birden fazla kullanıcının aynı sahneyi/dosyayı aynı anda düzenlemesi; lock, branch veya merge stratejileri gerektirir.
- **Optimistic Concurrency**: Lock yok, conflict merge time'da çözülür (Git modeli).
- **Pessimistic Concurrency**: Lock var, kullanıcı asset'i "checkout" eder (Perforce modeli).
- **Branch**: Bir sahnenin parallel kopyası; bağımsız geliştirme, sonra merge.
- **Merge**: İki branch'in birleştirilmesi; conflict (aynı satır/asset farklı değişiklik) çözümü gerekir.
- **Annotation**: 3D viewport'ta veya frame üzerinde çizim/yorum; review feedback.
- **Review Cycle**: Periyodik review toplantısı — dailies (günlük), weekly (haftalık), milestone (alpha/beta/gold).
- **Approval Workflow**: Çoklu imza hiyerarşisi — reviewer → approver → sign-off.
- **Version Comparison**: İki sürümün yan yana veya overlay karşılaştırması.
- **Change Tracking**: Asset/scene değişikliklerinin (who, what, when, why) kaydı.
- **Async Review**: Zaman kaydırmalı review; reviewer kendi zamanında annotation bırakır.
- **Sync Review**: Real-time review; tüm ekip aynı anda toplantıda.
- **RFB (Request for Feedback)**: Artist'in review talebi; "ready for review" statüsü.

### 4. Roller & Sorumluluklar

- **Production Manager**: Review cycle takvimi, milestone review koordinasyonu.
- **Lead Artist / Discipline Lead**: Discipline-bazlı review (modeling, animation, lighting).
- **Art Director**: Sanatsal kalite onayı, hero asset sign-off.
- **Technical Art Director**: Teknik kalite onayı, pipeline uyumu.
- **Producer**: Milestone approval, dış publisher iletişimi.
- **Pipeline TD**: Collaboration tool konfigürasyonu, version comparison script'leri.
- **Reviewer**: Internal/external reviewer (ör. publisher creative director).

### 5. Politika Maddeleri

**5.1** Multi-user editing stratejisi asset türüne göre belirlenir — (i) DCC source (`.blend`, `.max`, `.ma`): pessimistic lock (Perforce file-level lock, "checkout"); (ii) USD scene layer: optimistic (multiple user aynı layer'da değil, sublayer ile ayrılır); (iii) code/script (Python, MSL): Git optimistic merge; (iv) texture (`.png`, `.psd`): pessimistic lock; (v) animation (`.fbx`, `.usd`): pessimistic lock. Lock zorunluluğu; aynı dosya üzerinde iki kullanıcı aynı anda düzenleme yasak.

**5.2** Branch ve merge politikası: Sahne veya asset'te büyük değişiklik (ör. retopology, rig rebuild, lighting overhaul) için branch zorunludur. Branch naming: `feature/[descriptor]` (ör. `feature/hero-rig-v2`), `fix/[descriptor]`, `experiment/[descriptor]`. Merge: pull request / merge request ile; reviewer onayı (en az 1 senior) zorunludur. Conflict resolution: manuel (artist ve reviewer birlikte), otomatik (text diff tool). Merge sonrası branch silinir.

**5.3** Annotation system standartları: Review annotation'lar şu kurallara uyar — (i) 3D viewport annotation (SyncSketch, ShotGrid review): çizim + ses + text; (ii) frame-by-frame (Frame.io): time-coded comment; (iii) naming: issue type prefix (ör. `[GEO]` geometry, `[UV]` uv issue, `[RIG]` rig, `[ANIM]` animation, `[LIGHT]` lighting, `[FX]` effect); (iv) severity tag: critical (blocker), major (must fix), minor (nice to have); (v) screenshot/video clip ekli (repro için).

**5.4** Review cycle takvimi: (i) Dailies — her gün 10:00-11:00, discipline-bazlı (modeling, animation, lighting ayrı session), 15 dakika/artist max; (ii) Weekly — Cuma 14:00-16:00, cross-discipline, milestone progress; (iii) Milestone Review — alpha, beta, gold öncesi, 4 saat, tüm stakeholder; (iv) Publisher Review — dış publisher ile aylık. Tüm review'ler kayıt altına alınır (sync) veya annotation olarak bırakılır (async).

**5.5** Approval workflow hiyerarşisi: Asset'ler şu onay zincirinden geçer — (i) Self-review (artist kendisi); (ii) Peer review (aynı discipline'den bir artist); (iii) Lead review (discipline lead); (iv) Cross-discipline review (technical art director); (v) Art director approval (sanatsal); (vi) Producer sign-off (production). Cinematic shot'larda ek: director approval, editor approval. External publisher review: production manager koordinasyonunda.

**5.6** Version comparison araçları: Tüm asset ve scene'lerde version comparison zorunludur — (i) A/B side-by-side (eski sürüm | yeni sürüm); (ii) Overlay (yeni sürüm üstünde eski, transparency); (iii) Timeline scrub (sürükleme ile geçiş); (iv) Diff overlay (yalnızca farklı vertex/face highlight, geometry diff). Araçlar: ShotGrid version compare, SyncSketch A/B, Blender/Unreal diff plugin. Comparison sonucu review annotation'a eklenir.

**5.7** Change tracking zorunludur: Her asset/scene değişikliği şu meta ile kaydedilir — (i) who (kullanıcı ID); (ii) what (dosya adı, değişen kısım); (iii) when (timestamp UTC); (iv) why (commit message, ticket ID); (v) how (diff, before/after hash). Change log: Perforce changelist, Git commit, ShotGrid note. Change log retention: 7 yıl (Politika 16 Loglama ile uyumlu).

**5.8** Async review protokolü: Zaman dilimi farklı (ör. Türkiye + Los Angeles) ekipler için async review — (i) artist, "ready for review" statüsü belirler (RFB); (ii) reviewer'a notification (email, Slack); (iii) reviewer 24 saat içinde annotation bırakır; (iv) "Approved" / "Changes Requested" / "Rejected" statü; (v) Changes Requested ise artist 24 saat içinde fix + yeni RFB. Async review, sync review ile aynı ağırlığa sahiptir; ikisi arasında fark yok.

**5.9** Sync review protokolü: Gerçek zamanlı review — (i) takvim daveti 24 saat önceden; (ii) tüm katılımcılar (artist, reviewer, approver) hazır; (iii) review tool: Zoom/Meet + SyncSketch/ShotGrid review (3D viewport sync); (iv) kayıt (video + chat) alınıp arşivlenir; (v) annotation'lar canlı bırakılır; (vi) meeting bitiminde karar (Approved/Changes/Rejected). Sync review 60 dakikayı geçmemeli; aşım durumunda follow-up async.

**5.10** Review annotation lifecycle: (i) Open (annotation bırakıldı, henüz address edilmedi); (ii) In Progress (artist düzeltiyor); (iii) Resolved (artist fixledi, reviewer teyit bekliyor); (iv) Closed (reviewer teyit etti); (v) Reopened (reviewer teyit sırasında yeni issue buldu). Lifecycle SLA: Open → In Progress 4 saat; In Progress → Resolved 24 saat; Resolved → Closed 24 saat. Aşan annotation dashboard'ta alert.

**5.11** Multi-user conflict resolution: Conflict (iki kullanıcı aynı dosyayı düzenledi) durumunda — (i) pessimistic lock conflict: ikinci kullanıcı uyarı, bekler; (ii) optimistic merge conflict: manuel resolution (artist ve reviewer birlikte), diff tool ile; (iii) USD layer conflict: sublayer opinion strength ile çözülür (Politika 33 Madde 5.10); (iv) Git conflict: standard merge tool. Conflict SLA: 4 saat içinde resolution; aşım durumunda lead devreye girer.

**5.12** Reviewer etiquette: Reviewer kuralları — (i) constructive feedback (kişisel saldırı yok); (ii) issue-specific (genel "berbat" yerine "lower lip sync off by 2 frame"); (iii) actionable (özgürce fix önerisi); (iv) prioritized (critical/major/minor etiketi); (v) time-sensitive (review SLA'ya uyum). Eğitim: tüm reviewer'lar "review etiquette" eğitimi alır (yıllık refresher).

**5.13** Producer sign-off politikası: Producer sign-off, asset'in "Production Ready" statüsüne geçişidir. Sign-off öncesi kontrol listesi: (i) tüm annotation Closed; (ii) version comparison sanity check (önceki sürümle major regression yok); (iii) cross-discipline dependency check (asset başka discipline'i etkilemiyor); (iv) performance test (Politika 39); (v) license/manifest doğrulama (Politika 38). Sign-off: producer ismi, tarih, version notu ile ShotGrid'e yazılır.

**5.14** External review (publisher, creative director): External review ek güvenlik gerektirir — (i) NDA imzalı taraf; (ii) watermarked build (Politika 38 Madde 5.5); (iii) erişim izni RBAC ile sınırlandırılmış; (iv) annotation'lar ShotGrid'e sync; (v) review SLA: 5 iş günü (external), aşım durumunda producer takip. External reviewer'ın asset'i indirmesi/export etmesi yasak; yalnızca review tool içinde görüntüleme.

**5.15** Collaboration CI gate: `nexus-collab-validator` her sahne/asset commit'inde çalışır. Kontroller: (i) lock dosyada çakışma yok; (ii) annotation lifecycle SLA uyumu; (iii) change tracking meta present; (iv) merge conflict resolved; (v) review annotation count (yetersiz feedback alert). ERROR → PR bloke; WARNING → comment.

### 6. Prosedürler & İş Akışları

**Review Cycle Workflow**:
1. Artist, asset'i hazırlar; self-review yapar.
2. RFB (Request for Feedback) statüsü; ShotGrid version publish.
3. Reviewer atanır (lead review veya peer review).
4. Review: sync (toplantı) veya async (notification + 24 saat).
5. Annotation'lar bırakılır (issue type, severity, screenshot).
6. Artist: annotation'lar address edilir (Open → In Progress → Resolved).
7. Reviewer: Resolved annotation'lar teyit edilir (Resolved → Closed).
8. Tüm annotation Closed → "Approved" statü; producer sign-off.
9. Sign-off: asset "Production Ready"; version increment MAJOR.
10. Archive: review kayıt (sync video, async annotation) 7 yıl.

### 7. Uyumluluk & İzleme

- ISO 9001:2015 Madde 8.5.1, 8.6, 9.1.3.
- ISO/IEC 27001:2022 A.5.12, A.5.15 (Access Control), A.8.16 (Monitoring).
- ISO/IEC 27031 (Business Continuity — collaboration tool failover).
- KPI'lar: (i) Review cycle SLA uyum %95+; (ii) Annotation lifecycle SLA uyum %90+; (iii) RFB → Approved ortalama süre <5 iş günü; (iv) Conflict resolution SLA uyum %95+; (v) Producer sign-off cycle ortalama <2 hafta.
- Dashboard: ShotGrid "Collaboration Health" — open annotation count, RFB-to-approved trend, conflict resolution time.

### 8. İhlal Yaptırımları

- Lock atlatma (force checkout, override): lead artist uyarısı + 1 saat tool training.
- Review annotation SLA ihlali (3 kez): reviewer için review etiquette refresher.
- Producer sign-off'u atlayarak asset'i "Production Ready" yapma: producer + CTO review; asset statü rollback.
- External review'da NDA'sız tarafa erişim: IP counsel + CISO + DPO süreci; Politika 38 ile entegre yaptırım.

### 9. İstisnalar

- Prototype/graybox asset'ler hızlı iteration için lightweight review (self + lead); tam approval workflow gerektirmez.
- R&D deneysel asset'ler review'dan muaf; ancak "RESEARCH" tag ve production build'de yer alamaz.
- Acil hotfix (ör. gold master sonrası critical bug): expedited approval (lead + producer); post-hoc full review 5 iş günü içinde.

### 10. İlgili Standartlar

- Autodesk Flow Production Tracking (ShotGrid) Documentation.
- ftrack Studio Review Documentation.
- Perforce Helix Core Streams Documentation.
- Unity Plastic SCM Branching Guide.
- Frame.io Collaboration API.
- SyncSketch 3D Review.
- Pixar "Review Tool" internal pipeline.
- ISO 9001:2015 Madde 8.5.1, 8.6, 9.1.3.
- ISO/IEC 27001:2022 A.5.12, A.5.15, A.8.16.
- ISO/IEC 27031 (Business Continuity).
- Çapraz referans: Politika 16 (Loglama), Politika 18 (İK Güvenliği), Politika 31 (Asset Security), Politika 38 (Versioning & IP).

### 11. Onay & Revizyon Geçmişi

| Sürüm | Tarih | Hazırlayan | Onaylayan | Değişiklik |
|-------|-------|------------|-----------|------------|
| 1.0 | 2026-06-21 | Production Manager + Pipeline TD | CTO + Art Director + Producer | İlk yayın |
| 1.1 | (planlı) 2027-01-15 | Production Manager | CTO | AI-assisted review annotation entegrasyonu |

---

## Kapanış Notu

Bu 10 politika (31-40), NEXUS 3D Studio'nun AAA oyun ve film prodüksiyon pipeline'ının güvenlik, kalite ve operational excellence katmanını oluşturur. Tüm politikalar:

- Türkçe yazılmış, her politika ≥1000 kelime (çoğu 1300-1800 kelime arası),
- 11 bölümlük standart yapıyı (Amaç, Kapsam, Tanımlar, Roller & Sorumluluklar, Politika Maddeleri, Prosedürler, Uyumluluk, Yaptırımlar, İstisnalar, İlgili Standartlar, Onay & Revizyon) tutarlı şekilde izlemektedir,
- 3D terimleri (mesh, polygon, vertex, UV, bone, rig, skinning, keyframe, IK/FK, PBR, LOD, draw call, shader) doğru teknik bağlamda kullanılmıştır,
- AAA stüdyo standartları (Unreal Engine 5 Nanite/Lumen, Unity HDRP, Pixar USD/IRRSUED pipeline, glTF 2.0, Substance 3D, AWS Thinkbox Deadline) referans alınmıştır,
- Politikalar 1-30 (Faz 1-5) ile çapraz referanslıdır (özellikle Politika 4 Şifreleme, Politika 10 Olay Müdahalesi, Politika 14 Donanım, Politika 15 Ağ, Politika 16 Loglama, Politika 18 İK Güvenliği, ve Politika 31-39 arasında somut çapraz bağlantılar).

Toplam 40 politika ile kurum; ISO 27001 sertifikasyon denetimi, ISO 9001 kalite denetimi, SOC 2 Type II audit, EU AI Act high-risk system conformity assessment, GDPR/KVKK denetimi, DMCA compliance audit ve müşteri güvenlik değerlendirmelerine (vendor security questionnaires — SIG, CAIQ) hazır durumdadır. Bir sonraki adım, tüm 40 politikanın master ISMS dokümanında indekslenmesi ve Faz 3 kod geliştirmesinde bu politikaların somut teknik kontrollere (kod, IaC, policy-as-code) dönüştürülmesidir.
