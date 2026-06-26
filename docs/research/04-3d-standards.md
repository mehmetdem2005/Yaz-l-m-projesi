# 3D Production Standartları — NEXUS 3D Studio

> Bu doküman, NEXUS 3D Studio isimli web tabanlı AAA-standart 3D üretim
> platformunun teknik standartlarını belirlemek amacıyla hazırlanmıştır.
> Hedef; Pixar, Industrial Light & Magic (ILM), Epic Games, Unity Technologies,
> Autodesk ve SideFX gibi AAA stüdyolarının üretim boru hatlarında (pipeline)
> kullandığı dosya formatlarını, PBR (Physically Based Rendering) kurallarını,
> isimlendirme (naming) standartlarını, polygon bütçelerini, performans
> eşiklerini ve skeletal animasyon normlarını tek bir referansta toplamaktır.

Tarih: 2026-06-21
Yazar: 3D Standards subagent
Sürüm: 1.0
Kapsam: 15 ana bölüm, ~50 alt başlık

---

## İçindekiler

1. glTF 2.0 (GL Transmission Format)
2. USD (Universal Scene Description)
3. FBX (Autodesk)
4. BLEND (Blender native)
5. OBJ + MTL (Wavefront)
6. STL (3D printing)
7. Alembic (.abc)
8. OpenVDB (volumetric)
9. PBR (Physically Based Rendering)
10. Skeletal Animation Standards
11. LOD (Level of Detail)
12. Texel Density
13. Naming Conventions
14. Polygon Budgets (AAA)
15. Performance Standards

---

## 1. glTF 2.0 (GL Transmission Format)

### 1.1 Genel Bakış

glTF (GL Transmission Format), Khronos Group tarafından geliştirilen açık
3D sahnesi aktarım standardıdır. 2015'te glTF 1.0, 2017'de glTF 2.0
yayınlanmıştır. WebGL, WebGPU, Three.js, Babylon.js, PlayCanvas, Cesium,
Microsoft Mesh, Facebook 3D Posts ve Google Search altyapıları tarafından
doğal (native) desteklenir. "3D için JPEG" olarak konumlandırılır.

### 1.2 Mimari

glTF bir **JSON belge + binary buffer** mimarisine sahiptir:

- **JSON belge (.gltf)** — Sahnede yer alan node'ları, mesh'leri, materyalleri,
  dokuları, animasyonları, kamera ve ışıkları tanımlayan insan-okunabilir
  metadata. İndeks yoluyla buffer'lara referans verir.
- **Binary buffer (.bin)** — Geometri (pozisyon, normal, UV, renk, teğet),
  animasyon (anahtar kare zamanları, değerler, kemik ağırlıkları) ve görüntü
  verisini raw byte dizisi olarak içerir. Little-endian, aligned'tır.
- **GLB (Binary glTF)** — JSON + binary + gömülü görseller tek `.glb`
  dosyasında paketlenir. Web dağıtımı için idealdir; tek HTTP isteği ile
  indirilir. Magic header: `0x46546C67` ("glTF" ASCII).

### 1.3 PBR Materyal Modeli

glTF 2.0 çekirdeği **metallic-roughness** iş akışını destekler. Her materyal
aşağıdaki parametreleri içerebilir:

- `baseColorFactor` (RGBA, linear) ve `baseColorTexture` (sRGB)
- `metallicFactor` (0-1) ve `roughnessFactor` (0-1)
- `metallicRoughnessTexture` (linear, G kanalı = metallic, B kanalı = roughness)
- `normalTexture` (linear, BC5/BC1)
- `occlusionTexture` (linear, R kanalı)
- `emissiveFactor` (linear RGB) ve `emissiveTexture` (sRGB)
- `alphaMode` (`OPAQUE`, `MASK`, `BLEND`) ve `alphaCutoff` (varsayılan 0.5)
- `doubleSided` (boolean)

### 1.4 Animasyon Desteği

- **Transform animasyonu** — Node'ların translation, rotation, scale değerleri
  için anahtar kademeler (keyframes). Linear, STEP, CUBICSPLINE interpolasyon.
- **Skeletal animasyon** — Skin (joint hierarchy) + inverse bind matrices +
  weights/ joints vertex attribute (max 4 joint/vertex).
- **Morph target animasyon** — Mesh başına birden fazla hedef deformasyon,
  ağırlıkları anahtar kademelerle süreklileştirilir.

### 1.5 Extensions

glTF çekirdeğine ek yetenekler extension mekanizması ile eklenir:

- `KHR_materials_pbrSpecularGlossiness` — Legacy specular-glossiness iş akışı.
- `KHR_materials_unlit` — Shader gerektirmeyen düz renk materyaller (UI, billboard).
- `KHR_materials_clearcoat` — Otomotiv boya / vernik efekti.
- `KHR_materials_transmission` — Cam benzeri geçirgenlik (refraksiyon için).
- `KHR_materials_volume` — Işık saçılımı olan kalın camsı malzemeler.
- `KHR_materials_ior` — Kırılma indisi özelleştirme.
- `KHR_materials_sheen` — Kadife/dokuma bezi efekti.
- `KHR_materials_emissive_strength` — HDR bloom için yüksek emisif değer.
- `KHR_materials_specular` — F0 kontrolü.
- `KHR_lights_punctual` — Directional, point, spot ışıkları.
- `KHR_texture_basisu` — KTX2 + Basis Universal texture sıkıştırma.
- `KHR_texture_transform` — UV offset, rotation, scale, texcoord indeks.
- `KHR_mesh_quantization` — 16-bit / 8-bit quantized vertex verisi.
- `EXT_mesh_gpu_instancing` — GPU instancing için instance matrix attrib.
- `EXT_meshopt_compression` — meshoptimizer tabanlı vertex sıkıştırma.
- `KHR_draco_mesh_compression` — Google Draco geometri sıkıştırma.
- `MSFT_lod` — Microsoft LOD zinciri tanımı.

### 1.6 VRM ile İlişki

VRM, glTF 2.0 üzerine kurulu VR/avatar formatıdır. VRoid Studio ve VTuber
ekosistemi tarafından benimsenmiştir. Spring bone, expression (blendshape
preset), look-at (gaze), humanoid bone mapping içerir. VRM 0.x ve VRM 1.0
sürümleri mevcuttur.

### 1.7 Avantajları & Dezavantajları

**Avantajlar:**
- Web-native; tarayıcı doğal destek.
- Kompakt binary paket (GLB).
- Açık spesifikasyon; royalty-free.
- PBR standardı çekirdekte.
- Geniş araç desteği (Blender, Maya, Substance, 3ds Max exporter).

**Dezavantajlar:**
- Layer-based composition desteklemez (USD gibi).
- Karakter rig karmaşıklığı sınırlı (constraint'ler tam değil).
- NURBS, particle, fluid içermez — yalnızca polygon mesh.
- DCC tool arası round-trip kayıplı olabilir.

### 1.8 Validation

`glTF-Validator` (Rust tabanlı, Khronos) hem CLI hem web arayüzü ile her
glTF/GLB dosyasının spesifikasyon uyumluluğunu denetler. Hata kodları:
`ACCESSOR_OUT_OF_BOUNDS`, `INVALID_IBM`, `NODE_LOOP`, `MISSING_REQUIRED`,
`UNUSED_OBJECT` vb. AAA pipeline'ında CI adımı olarak zorunludur.

---

## 2. USD (Universal Scene Description)

### 2.1 Tarihçe ve Pozisyon

USD, Pixar Animation Studios tarafından geliştirilmiş ve 2016'da open-source
edilmiş bir sahne tanımlama çerçevesidir. Pixar'ın "Inside Out", "Coco",
"Toy Story 4" gibi tüm filmlerinde pipeline omurgasıdır. ILM, Disney,
Weta Digital, DNEG, Method Studios ve Epic Games (Unreal Engine 4.25+) USD'yi
benimsemiştir. Alliance for OpenUSD (AOUSD) 2023'te kurulmuş; Apple, Autodesk,
NVIDIA, Adobe ve Pixar üyeleridir.

### 2.2 Dosya Biçimleri

- `.usd` — Binary, kompakt. Default format.
- `.usda` — ASCII, insan-okunabilir. Diff review için.
- `.usdz` — Apple'ın AR paketi (iOS Quick Look, visionOS). Tek dosyada
  geometri + doku + material gömülüdür.
- `.usdc` — Crate (binary, eski sürüm).

### 2.3 Layer-Based Composition

USD'nin en güçlü özelliği **non-destructive composition**'dur. Bir sahne
birden fazla layer'dan oluşur; her layer bağımsız olarak editlenebilir.
Composition engine şu opcodes ile layer'ları birleştirir:

- **Sublayers** — Bir layer'ı stack'e dahil eder (öncelik: en üstteki kazanır).
- **References** — Dış bir asset'i payload ile bağlar.
- **Payloads** — Lazy-loaded reference (sadece kamera kesiminde yüklenir).
- **Variants** — Aynı asset'in alternatif varyasyonları (örn. kapı açık/kapalı).
- **Inherits** — Sınıf (class) kalıtımı.
- **Specializes** — Ana varyanttan türetme.
- **Set opinions by edit target** — Aktif layer seçilebilir.

### 2.4 Stage, Prim, Property

- **Stage** — Bir sahnenin kök context'i (USD scene graph).
- **Prim** (Scene Description Object) — Bir node; tipi bir **Schema** ile
  tanımlı (Mesh, Xform, Camera, Light, Material, SkelAnimation, vb.).
- **Property** — Attribute (zaman-sampled olabilir) veya relationship
  (diğer prim'lere referans).
- **TimeCode** — Animasyon frame'i (float, default 24 fps).

### 2.5 Hydra Render Delegate

Hydra, USD sahnesini render eden bir render architecture'dır. Delegate
pattern; her renderer kendi delegate'ini yazar: `HdStorm` (rasterization,
Pixar), `HdKarma` (Karma, SideFX), `HdRPR` (Radeon ProRender), `HdCycles`
(Blender Cycles), `HdUE` (Unreal Engine). HdStorm gerçek-zamanlı preview
için pixel-accurate'tir.

### 2.6 Solaris (Houdini), Maya, Katana

- **Houdini Solaris** — SideFX'in USD-native sahne kurma aracı. LOP (Lighting
  Operator) ağları ile USD sahnesi procedural olarak inşa edilir.
- **Maya USD Plugin** — Autodesk'in resmi USD entegrasyonu; Maya 2022+
  ile birlikte gelir. Stage editable, edit target ayarlanabilir.
- **Katana** — Foundry; ILM'in geliştirdiği lighting & look-dev aracı, USD'yi
  native scene format olarak kullanır.

### 2.7 USD Variants Örneği

```usda
over "Building" {
    variantSets = ["condition"]
    over "condition" {
        variants {
            string new = ""
            string old = ""
        }
    }
}
```

Bu sayede "Building" bir kez yüklenir, durumu (yeni/harabe) runtime'da
seçilir. AAA oyunlarda destruction pipeline için kritik.

### 2.8 USD ile glTF Karşılaştırması

| Özellik | USD | glTF 2.0 |
|---|---|---|
| Composition | Layer-based (non-destructive) | Tek dosya (monolithic) |
| Variant sets | Var | Yok |
| Lazy loading (payload) | Var | Yok |
| Web desteği | Sınırlı (WASM port) | Mükemmel |
| Animasyon zenginliği | Yüksek | Orta |
| PBR | UsdPreviewSurface + MaterialX | Metallic-roughness |
| Hedef kitle | Film, AAA game | Web, mobile, AR/VR |

---

## 3. FBX (Autodesk)

### 3.1 Pozisyon

FBX (.fbx), Kaydara tarafından geliştirilmiş, 2006'da Autodesk tarafından
satın alınmış sahne değişim formatıdır. Maya, 3ds Max, MotionBuilder, ZBrush,
Blender, Cinema 4D, Unity ve Unreal Engine tarafından okunup yazılır. 20 yılı
aşkın süredir oyun ve animasyon endüstrisinin fiili (de-facto) standardıdır.

### 3.2 Format Detayları

- Hem **binary** (kompakt, hızlı) hem **ASCII** (debug amaçlı) formatlar.
- Magic header binary: `Kaydara FBX Binary  \x00\x1A\x00`.
- Sürüm numarası (7000+ yaygın; 7400, 7500 modern).
- Veri blokları: header, definitions, objects, connections, takes.

### 3.3 Desteklenen Veri Tipleri

- Mesh geometri (polygon, N-gon, quads, triangles)
- Vertex color, UV (birden fazla UV set), normal, binormal, tangent
- Materyaller (Phong, Lambert, PBR maya-style)
- Texture dosya referansları
- Skeletal sistem (bone hierarchy, link deformations)
- Skin (cluster, weights)
- Morph target (blend shape / shape)
- Constraint (aim, parent, point, orient, scale)
- Animation take (keyframe, curve)
- Kamera (perspective, orthographic)
- Işık (point, spot, directional, area, volume)

### 3.4 Sınırlamalar

- **Proprietary format**: Spesifikasyon tamamen açık değildir; Autodesk
  SDK'sı dışında erişim zordur. Çeşitli open-source parser'lar (FBX2glTF,
  Assimp, fbx-sdk-python) kısıtlı uyumluluk sunar.
- **Sürüm uyumsuzluğu**: Maya 2023 ile 2018 arasında FBX çıkarırken
  materyal kaybı olabilir.
- **Tamsayı koordinat sistemi**: Up-axis (Y-up/Z-up) ve unit (cm/m) karışıklığı.
- **Binary parsing karmaşıklığı**: Reverse engineering yavaş, hata türleri
  belirsiz.
- **Royalty/SDK dependency**: Ticari dağıtım için FBX SDK lisansı gerekir.

### 3.5 NEXUS Yaklaşımı

NEXUS 3D Studio FBX'i **import-only** modda destekleyecektir. İçe aktarılan
FBX verisi USD'ye (alt sahne olarak) veya glTF'ye (export) dönüştürülür.
Çift yönlü (round-trip) FBX yazımı Autodesk SDK lisans gerektirdiği için
ilk fazda kapsam dışıdır.

---

## 4. BLEND (Blender Native)

### 4.1 Genel Bakış

BLEND (.blend), Blender Foundation'ın açık kaynak 3D paketi Blender'ın native
formatıdır. Dosya yapısı tamsayı-bloklar (SDNA — Struct DNA) halinde organize
edilmiştir. Sürüm 2.4x'ten 4.x'e kadar geriye dönük uyumluluk korunmaya
çalışılır ama her büyük sürümde ufak kırılmalar olur.

### 4.2 İçerdiği Veri Türleri

- Tüm sahne objeleri (mesh, curve, surface, metaball, text)
- Materyaller, node groups, textures
- Particle system (hair, emitter)
- Hair (curves geometry, Blender 3.3+)
- Physics (rigid body, cloth, fluid Mantaflow, smoke, soft body)
- Light probes, world settings
- Compositor node ağları
- Grease pencil
- Drivers (Python expression animasyon)
- Add-on metadata

### 4.3 Python API ile Programatik Erişim

Blender Python API (`bpy`), headless modda (`blender --background --python`)
kullanılarak batch işleme yapılabilir. NEXUS, konteynerize edilmiş bir
Blender headless service çalıştırır:

```bash
blender --background input.blend --python export_to_glb.py -- --out model.glb
```

Bu sayede karmaşık BLEND dosyaları NEXUS için glTF/USD'ye dönüştürülür.

### 4.4 Sürüm Uyumluluk Sorunları

- 2.79 → 2.80: Eevee materyalleri yeniden yazıldı.
- 2.92 → 3.0: Cycles shader node isimleri değişti.
- 3.6 → 4.0: Principled BSDF parametre isimleri değişti (Specular → IOR Level).
- 4.x → 5.x (gelecek): Asset Browser schema değişiklikleri bekleniyor.

NEXUS, Blender 4.2 LTS'yi sabit referans sürüm olarak kullanacaktır.

---

## 5. OBJ + MTL (Wavefront)

### 5.1 Format

OBJ, 1990'da Wavefront Technologies tarafından geliştirilen, en eski ve en
basit 3D geometri formatıdır. ASCII tabanlıdır; her satır bir vertex/yüzey
komutudur:

```
v 1.0 2.0 3.0      # vertex position
vt 0.5 0.5         # texture coordinate
vn 0.0 0.0 1.0     # vertex normal
f 1/1/1 2/2/1 3/3/1  # face (v/vt/vn index)
```

### 5.2 MTL Materyal

MTL (.mtl) basit materyal tanımı içerir:

- `Ka` ambient color
- `Kd` diffuse color
- `Ks` specular color
- `Ns` shininess
- `d` dissolve (alpha)
- `map_Kd` diffuse texture
- `map_Bump` / `bump` normal map
- `map_Ks` specular map

PBR desteklemez; modern oyun için yetersizdir. NEXUS yalnızca import amaçlı
destekler; export için kullanılmaz.

### 5.3 Kullanım Senaryosu

- Hızlı mock-up ve prototype için.
- 3D printing slicer programları ile uyum.
- Eski geometriyi pipeline'a dahil etme.
- Quixel Megascans ile bazı varlıkların hızlı aktarımı.

---

## 6. STL (Stereolithography)

### 6.1 Tanım

STL (.stl), 3D Systems tarafından 1987'de geliştirilen 3D baskı standardıdır.
Yalnızca **üçgen geometri** içerir; renk, doku, materyal veya animasyon
desteklemez.

### 6.2 Formatlar

- **ASCII STL** — İnsan-okunabilir, her üçgen için `facet normal` + 3 `vertex`
  satırı. Boyut binary'den 4-6 kat büyük.
- **Binary STL** — 80-byte header + 4-byte face count + (50 byte/face) üçgen.
  Header genellikle boş; bazı yazıcılar metadata için kullanır.

### 6.3 Renkli STL Varyantları

- **VisCAM / SolidView** — Binary header'da her üçgene 2-byte RGB renk.
- **Materialise Magics** — Benzer mekanizma.

### 6.4 NEXUS Stratejisi

STL yalnızca **3D baskı dışa aktarım** modülünde desteklenir. Mesh repair
(Meshlab benzeri) algoritması ile manifold denetimi yapılır; gerekirse
otomatik onarım uygulanır. Baskı için slice desteklenmez — Cura/PrusaSlicer
entegrasyonu kullanıcıya bırakılır.

---

## 7. Alembic (.abc)

### 7.1 Tarihçe

Alembic, Sony Pictures Imageworks ve ILM tarafından 2010-2011'de geliştirilen
açık kaynak (BSD lisanslı) cache formatıdır. Amaç; farklı DCC araçları
(Maya, Houdini, Nuke, Katana, Blender) arasında **baked geometri** ve **time-sampled
scene data** değişimini standartlaştırmaktır.

### 7.2 Mimari

- HDF5 tabanlı (eski) veya Ogawa backend (yeni, daha hızlı).
- **Time-sampled data**: Her frame için değer saklanır.
- **Hierarchy**: USD benzeri (Xform, PolyMesh, SubD, Curves, Points, NuPatch,
  Camera, Light).
- **Arbitrary Geometry Parameters (ArbGeomParams)**: Renk, hız, özel attrib.

### 7.3 Kullanım Senaryoları

- Simülasyon cache (su, duman, yıkım, cloth).
- Karakter animasyon bake (rig'i kaldırır, sadece mesh deformasyonu kalır).
- Crowd sim cache.
- Camera ve light animasyon aktarımı.
- VFX plate gönderim (vendor'lar arası).

### 7.4 Performans

Alembic, **massive scene** desteği için tasarlanmıştır. Weta'nın "Avatar"
filminde milyonlarca polygon içeren sahneler Alembic ile cache'lendi.
Lazy loading ve frame-range streaming desteklenir. NEXUS'ta animasyon
cache ve simülasyon sonucu için birincil format olacaktır.

---

## 8. OpenVDB

### 8.1 Tanım

OpenVDB, DreamWorks Animation'ın 2005'te geliştirdiği, 2012'de Academy
Scientific and Technical Award kazanan açık kaynak **hacimsel (volumetric)**
veri kütüphanesidir. NVIDIA, SideFX ve Autodesk ana katkıda bulunur.
`.vdb` uzantılı dosyalar sparse voxel hiyerarşisi içerir.

### 8.2 Mimari

- **B+tree** yapısında 3-boyutlu voxel grid (5-level: root, internal ×2,
  leaf).
- Aktif voxeller leaf node'larda (8×8×8 = 512 voxel) tutulur.
- Boş alan memory'de yer kaplamaz (sparse).
- Her voxel için değer (density, temperature, velocity, color) saklanabilir.
- Level set (signed distance field) için optimize edilmiş.

### 8.3 Kullanım Alanları

- **Cloud / smoke / fire** simülasyonu (Houdini PyroFX).
- **Water simülasyonu** (level set, FLIP).
- **Fog, atmospheric scattering**.
- **Displacement mapping** (high-detail).
- **Ray marching** render için density field.

### 8.4 NEXUS Pipeline

NEXUS, OpenVDB'yi iki şekilde kullanır:

1. **Import**: Houdini'den gelen .vdb dosyaları sahneye volumetric asset
   olarak eklenir; viewport'ta ray-marched preview gösterilir.
2. **Export**: Simülasyon sonucunu .vdb olarak dışa aktarma (render farm için).

WebGL/WebGPU'da OpenVDB rendering için sparse texture atlas ve ray-march
shader kullanılır. Performans için downsample önerilir.

---

## 9. PBR (Physically Based Rendering)

### 9.1 Tarihçe ve Teori

PBR, fizik tabanlı ışık-malzeme etkileşimini simüle eden rendering yaklaşımıdır.
Disney Animation Studios, "Principled BRDF" (2012, Brent Burley) ile modern
PBR'ın temelini attı. Ardından Unreal Engine 4 (2013) ve Substance Painter
benimsedi; günümüzde AAA standart'tır.

Temel ilkeler:
1. **Enerji korunumu** — Reflekte edilen ışık, gelen ışıktan fazla olamaz.
2. **Microfacet teorisi** — Yüzey, mikroskobik aynalar (microfacet) olarak
   modellenir. Roughness bu aynaların dağılımını belirler.
3. **Fresnel** — Görüş açısı dikleştikçe refleksiyon artar.
4. **Metallicity** — Metal yüzeyler (metallic=1) renk absorbe eder; dielektrik
   yüzeyler (metallic=0) yalnızca specular yansıtır.

### 9.2 BRDF Modeli

glTF ve çoğu modern motor **Cook-Torrance BRDF** kullanır:

```
f_r = kD * diffuse / π + kS * (D * G * F) / (4 * (N·L) * (N·V))
```

- D — Normal Distribution Function (GGX/Trowbridge-Reitz)
- G — Geometry Shadowing (Smith, Schlick-GGX)
- F — Fresnel (Schlick approx)
- kD, kS — diffuse/specular ağırlık (enerji korunumu: kD = 1 - kS)

### 9.3 İş Akışları

**Metallic-Roughness (glTF default)**:
- `baseColor` (sRGB) — Dielektrik için albedo, metal için F0 rengi.
- `metallic` (Linear, 0-1) — 0 = dielektrik, 1 = metal.
- `roughness` (Linear, 0-1) — Pürüzlülük.

**Specular-Glossiness (legacy, KHR_materials_pbrSpecularGlossiness)**:
- `diffuse` (sRGB) — Albedo.
- `specular` (sRGB) — F0 rengi.
- `glossiness` (Linear, 0-1) — 1 - roughness.

NEXUS, çekirdek olarak **metallic-roughness** iş akışını zorunlu kılar.

### 9.4 Texture Map Set

AAA PBR asset'leri aşağıdaki map set'ini içerir:

| Map | Renk Uzayı | Kanal | Açıklama |
|---|---|---|---|
| Albedo / BaseColor | sRGB | RGB | Saflaştırılmış renk (gölge/highlight yok) |
| Normal | Linear | RGB (tangent-space) | Yüzey detayı |
| Metallic | Linear | R | Metal/dielektrik maske |
| Roughness | Linear | G | Mikro yüzey pürüzlülüğü |
| Ambient Occlusion | Linear | R | Mikro occlusion |
| Emissive | sRGB | RGB | Yayılan renk (HDR olabilir) |
| Height | Linear | R | Displacement için |
| Opacity | Linear | A | Alpha blend/mask |
| Subsurface | Linear | RGB | Deri/et saçılımı |
| Clearcoat | Linear | R | Vernik katmanı |

### 9.5 Renk Uzayı Kuralları

- **sRGB (gamma)**: Albedo, emissive, base color — insan gözü algısına yakın.
- **Linear**: Normal, metallic, roughness, AO, height, opacity — veri map'leri,
  hesap amaçlı doğrusal.
- **HDR/Linear (float)**: IBL (image-based lighting), environment map, light
  intensity.

Renderer'a gönderimde tüm texture'lar linear'a çevrilir (GPU sRGB sampling).
Yanlış renk uzayı = "çamurlu" veya "fluoresan" materyaller.

### 9.6 IBL (Image-Based Lighting)

PBR sahnede çevresel aydınlatma için **cubemap** veya **equirectangular HDR**
kullanılır. Pipeline:

1. Capture HDR environment (8K, 32-bit float).
2. Prefilter (roughness başına mipmap level).
3. Irradiance map (diffuse convolution).
4. BRDF LUT (2D lookup texture, integrate over N·V and roughness).

NEXUS, sahneye drop edilen HDR'yi otomatik prefilter'lar.

### 9.7 Texel Density

Bkz. Bölüm 12.

---

## 10. Skeletal Animation Standards

### 10.1 Bone Hierarchy

Karakter rig'i, **parent-child bone ilişkileri** ile tanımlanır. Her bone bir
transform (translation + rotation + scale) taşır. Kök bone (root) genellikle
pelvis'tir. Hiyerarşi **forward kinematics** ile iteratif hesaplanır:
her bone'un world matrix'i = parent_world × local_matrix.

### 10.2 Skin Weights

Mesh vertex'leri bone'lara **skinning weights** ile bağlanır. AAA standardı:
**maksimum 4 bone/vertex** (GPU vertex shader donanım limiti). Bazı modern
pipeline'lar 8 destekler (DX12/Vulkan). Weight'ler normalize edilmelidir
(toplam = 1.0). Blender, Maya, 3ds Max otomatik normalize eder.

### 10.3 IK (Inverse Kinematics)

IK, hedef pozisyonu verildiğinde eklem açılarını çözer. Yaygın algoritmalar:

- **CCD (Cyclic Coordinate Descent)** — Her eklem sırayla hedefe döndürülür.
  Basit, hızlı; kısıtlı konverjans.
- **FABRIK (Forward And Backward Reaching Inverse Kinematics)** — İleri-geri
  iterasyon. Daha doğal sonuç; AAA standartı.
- **Analytic IK** — Kapalı form çözüm (2-bone, 3-bone). Tam, hızlı; sınırlı
  kullanım (kol/bacak).
- **Jacobian-based** — Matris tabanlı, accurate ama yavaş; research.

NEXUS hem CCD hem FABRIK sunar; constrain'lerle (pole vector, angle limit)
kombinlenir.

### 10.4 FK (Forward Kinematics)

FK, her bone'un rotasyonu manuel belirlenir; uç efektör pozisyonu hesaplanır.
Animatörün ince kontrol için tercih ettiği yöntemdir (örn. el pozisyonu).

### 10.5 Retargeting

Farklı iskelet boyutlarına animasyon kopyalama işlemidir:

- **HumanIK (Autodesk)** — Maya, MotionBuilder native. Standart humanoid
  skeleton (35 bone) gerektirir.
- **Unreal Mannequin** — UE default skeleton (65 bone). IK Rig + IK Retargeter.
- **Mixamo** — Adobe online servis; otomatik rig + retarget.
- **AccLip / MotionBuilder Story Tool** — Pro pipeline.

Retargeting sırasında **T-pose** referans alınır. Foot/hand lock ile地面
penetrasyonu engellenir.

### 10.6 Motion Capture Formatları

- **BVH (Biovision Hierarchy)** — ASCII; bone hierarchy + motion data. Yaygın
  ama eski; CMU MoCap dataset BVH kullanır.
- **C3D** — Binary; biomechanics endüstrisi standardı. Marker positions + analog
  force plate data içerir. Vicon, OptiTrack çıkış formatı.
- **FBX** — DCC'ye en doğal; ancak binary parsing zor.
- **TRC** — Track Row Column; Motion Analysis Corporation.
- **HTR / TRC / ASF+AMC** — Alternatif formatlar.

NEXUS, BVH ve C3D import'u destekler. Otomatik retarget ile humanoid
karakterlere uygulanır.

### 10.7 Blend Shapes (Morph Targets)

Yüz ifadeleri ve phoneme (konuşma) animasyonu için blend shape kullanılır.
Her shape bir mesh deformasyonudur; ağırlık 0-1 arasında interpolate edilir.
ARKit (Apple) 52 blend shape standardını tanımlar (blendShapeBasis). Oculus
Lipsync 15 viseme tanımlar. NEXUS her ikisini de destekler.

---

## 11. LOD (Level of Detail)

### 11.1 Kavram

LOD, kameradan uzaklaşan nesnelerin daha az polygonlu versiyonunu göstererek
performans kazanma tekniğidir. Klasik AAA zincir:

| LOD | Polygon % | Switch Distance (m) |
|---|---|---|
| LOD0 | 100% | 0–10 |
| LOD1 | 50% | 10–25 |
| LOD2 | 25% | 25–50 |
| LOD3 | 12.5% | 50–100 |
| LOD4 (billboard) | 5% / sprite | 100+ |

### 11.2 Üretim Yöntemleri

- **Manuel** — Sanatçı her LOD'yi ayrı modeller. En kaliteli; AAA hero asset.
- **Procedural decimation** — Quadric Edge Collapse, Shortest Edge Collapse.
  Maya, Houdini, Blender (Decimate mod.), Simplygon.
- **Auto LOD** — Unity, Unreal pipeline entegrasyonu.
- **Nanite (Unreal 5)** — Virtualized geometry; tek bir yüksek-poly mesh
  (~20M triangle), LOD yok. GPU'da cluster culling + visibility buffer.

### 11.3 Switching Stratejileri

- **Distance-based** — Kamera-nesne mesafesi eşiği. En basit, en yaygın.
- **Screen-size-based** — Nesnenin ekrandaki kapladığı alan (pixel²). Daha
  tutarlı; Unity bu yöntemi kullanır.
- **Hysteresis** — Switch-in ve switch-out mesafeleri farklı; pop-flicker
  önlenir.
- **Dithered transition** — LOD'ler arasında cross-fade; görsel geçiş yumuşak.

### 11.4 NEXUS LOD Pipeline

1. Yüksek-poly mesh içe aktarılır.
2. Quadric Edge Collapse ile LOD1-4 üretilir.
3. Screen-size eşiği atanır (varsayılan: %30, %15, %7, %3).
4. UV ve material korunur; normal map bake'lenir.
5. Hysteresis mesafesi (5%) ayarlanır.
6. glTF'ye `MSFT_lod` extension ile gömülür.

---

## 12. Texel Density

### 12.1 Tanım

Texel density, bir texture'ın 3D dünyada 1 metre için kaç piksel harcadığını
ifade eder. Birim: **px/m** (piksel/metre).

```
texel_density = texture_size_px / world_size_m
```

Örnek: 2048×2048 texture, 2m×2m obje → 2048/2 = 1024 px/m.

### 12.2 Standartlar

| Motor / Stüdyo | Standart (px/m) |
|---|---|
| Unreal Engine | 1024 |
| Unity (URP/HDRP) | 2048 |
| Cinematic (4K) | 4096+ |
| Mobile | 512–1024 |
| VR (close-up) | 2048–4096 |

### 12.3 Neden Önemli?

- **Görsel tutarlılık**: Aynı sahnede iki farklı texel density'li obje varsa,
  birisi "fluoresan net", diğeri "bulanık" görünür.
- **Memory bütçesi**: Texel density → texture boyutu → VRAM.
- **Mipmap kalitesi**: Density çok yüksekse gereksiz memory; çok düşükse
  yakında bulanık.

### 12.4 Hesaplama & Pipeline

- Blender eklentisi: "Texel Density Checker".
- Maya: "Texel Density Tool".
- Houdini: VOP network ile otomatik.
- Substance Painter: UV tile başına density görüntüleme.

NEXUS'ta **asset import** aşamasında texel density otomatik hesaplanır; standard
1024 px/m'den sapma varsa uyarı verilir.

### 12.5 UV Tile (UDIM) Desteği

UDIM (U-DIM), bir mesh için birden fazla UV tile (10×10 grid) kullanma
standardıdır. Her tile 0-1 UV uzayında ayrı bir texture'dur. Mari, Substance
Painter, Houdini, Maya UDIM'i native destekler. AAA hero asset'ler genellikle
4-16 UDIM tile kullanır (örn. 8K karakter).

---

## 13. Naming Conventions

### 13.1 Önek Sistemi

AAA stüdyolar (Epic, Naughty Dog, Ubisoft) tutarlı önek (prefix) sistemi
kullanır. Bu, asset browser'da filtreleme, validation ve CI denetimini
kolaylaştırır.

### 13.2 Mesh İsimlendirme

| Önek | Anlamı |
|---|---|
| `SM_` | Static Mesh |
| `SK_` | Skeletal Mesh |
| `SKM_` | Skeletal Mesh (alternatif) |
| `PM_` | Procedural Mesh |
| `MI_` | Material Instance |
| `M_` | Material (master) |
| `MF_` | Material Function |

Örnek: `SM_Barrel_Wood_01`, `SK_Hero_Male_01`.

### 13.3 Texture İsimlendirme

Sonek (suffix) yaklaşımı:

| Sonek | Anlamı |
|---|---|
| `_D` | Diffuse / Albedo |
| `_N` | Normal |
| `_M` | Metallic |
| `_R` | Roughness |
| `_A` | Ambient Occlusion |
| `_E` | Emissive |
| `_H` | Height |
| `_ORM` | Occlusion-Roughness-Metallic (packed) |
| `_Mask` | Generic maske |
| `_T` | Tangent (binormal) |

Örnek: `T_Barrel_Wood_01_D.tga`, `T_Barrel_Wood_01_N.tga`.

### 13.4 Bone İsimlendirme

- CamelCase, boşluksuz, anlamlı.
- Side prefix: `L_` / `R_` (sol/sağ).
- Index suffix: `Finger_01`, `Finger_02`.
- Standard humanoid (Mixamo/Unreal Mannequin uyumlu):
  - `Root` → `Pelvis` → `Spine_01` → `Spine_02` → `Spine_03` → `Neck` → `Head`
  - `L_Clavicle` → `L_UpperArm` → `L_Forearm` → `L_Hand` → `L_Finger_Index_01`
  - `L_Thigh` → `L_Calf` → `L_Foot` → `L_Toe`

### 13.5 Animation İsimlendirme

`Anim_[Karakter]_[Aksiyon]_[Yön]_[Versiyon]`

Örnek: `Anim_Hero_Walk_F_01`, `Anim_NPC_Attack_Slash_v2`.

State machine key'leri için prefix:
- `Idle_` — Bekleme varyasyonları
- `Walk_` — Yürüme
- `Run_` — Koşma
- `Jump_` — Zıplama (Start/Loop/End)
- `Attack_` — Saldırı
- `Death_` — Ölüm

### 13.6 Klasör Yapısı

```
/Assets
  /Characters
    /Hero
      /Mesh
      /Texture
      /Material
      /Animation
      /Rig
  /Environment
    /Props
    /Architecture
  /VFX
  /Audio
```

### 13.7 Validation Script

NEXUS, asset import'ta isim regex denetimi yapar:

```python
PATTERNS = {
  "static_mesh": r"^SM_[A-Z][a-zA-Z0-9_]*$",
  "skeletal_mesh": r"^SK_[A-Z][a-zA-Z0-9_]*$",
  "texture": r"^T_[A-Z][a-zA-Z0-9_]*_(D|N|M|R|A|E|H|ORM)$",
  "material": r"^M_[A-Z][a-zA-Z0-9_]*$",
  "material_instance": r"^MI_[A-Z][a-zA-Z0-9_]*$",
  "animation": r"^Anim_[A-Z][a-zA-Z0-9_]*$",
}
```

Uymayan asset'ler reject edilir; CI build kırılır.

---

## 14. Polygon Budgets (AAA)

### 14.1 Karakter Bütçeleri

| Karakter Tipi | LOD0 Triangle | LOD1 | LOD2 | LOD3 |
|---|---|---|---|---|
| Hero (PC/console) | 80K–150K | 40K–75K | 20K–38K | 10K–19K |
| NPC | 15K–30K | 8K–15K | 4K–7K | 2K–3K |
| Crowd (background) | 2K–5K | 1K | 500 | billboard |
| Cinematic (hero) | 200K–500K | — | — | — |
| VR character | 20K–40K | 10K | 5K | — |

### 14.2 Çevre (Environment)

| Obje Tipi | LOD0 Triangle |
|---|---|
| Hero prop (yakın) | 10K–30K |
| Standart prop | 1K–10K |
| Architectural element | 5K–50K |
| Tree (foliage card) | 2K–10K + alpha |
| Vehicle (car) | 30K–60K |
| Vehicle (tank) | 80K–120K |
| Building (large) | 50K–200K |

### 14.3 Sahne Bütçesi (frame başına görünür)

| Hedef | Triangle | Draw call | Texture memory |
|---|---|---|---|
| Mobile (60 fps) | 2M | 2K | 512 MB |
| PC Low | 3M | 3K | 1 GB |
| PC Mid | 5M | 5K | 2 GB |
| PC High | 8M | 8K | 4 GB |
| Console (PS5/XSX) | 10M | 10K | 6 GB |
| Cinematic (offline) | 50M+ | — | — |

### 14.4 LOD Tris Reduction Oranı

Epic'in önerdiği standart:

- LOD0 → LOD1: %50
- LOD1 → LOD2: %50 (yani LOD0'ın %25'i)
- LOD2 → LOD3: %50 (LOD0'ın %12.5'i)
- LOD3 → LOD4: %50 (LOD0'ın %6.25'i)

Hatalı: her seviyede %50 değil, toplamın yarısı.

### 14.5 Özel: Nanite (UE5)

Nanite ile polygon budget kavramı değişir. Single high-poly mesh (~20M
triangle) runtime'da virtualized geometry olarak işlenir. LOD zinciri
üretilmez; otomatik cluster-based culling uygulanır. Ancak Nanite yalnızca
statik mesh'lerde çalışır; skeletal mesh'lerde hala LOD gerekir. NEXUS'ta
Nanite-benzeri yaklaşım WebGPU ile deneysel olarak planlanır (Sprint 30).

---

## 15. Performance Standards

### 15.1 Frame Time Bütçesi

| Hedef FPS | Frame Budget | Kullanım |
|---|---|---|
| 30 fps | 33.33 ms | Console sinematik |
| 60 fps | 16.67 ms | Standart AAA |
| 90 fps | 11.11 ms | VR (Oculus Quest) |
| 120 fps | 8.33 ms | PS5/XSX yüksek yenileme |
| 144 fps | 6.94 ms | PC oyuncu |

**2 ms kuralı**: Bir subsystem (örn. particle), frame budget'ın %12'sinden
fazlasını (60 fps için 2 ms) yiyemez. Aşarsa optimize edilir veya kapatılır.

### 15.2 Draw Call Bütçesi

| Platform | Draw call / frame |
|---|---|
| Mobile (iOS/Android) | < 2000 |
| PC Low | < 3000 |
| PC Mid | < 5000 |
| PC High | < 8000 |
| Console | < 10000 |
| Cinematic | sınırsız (offline) |

**Batching stratejileri**:
- Static batching — Statik mesh'leri tek buffer'a birleştir.
- Dynamic batching — Küçük mesh'leri CPU'da birleştir (mobile).
- GPU instancing — Aynı mesh + materyal, instance matrix attrib.
- SRP Batcher (Unity) — Aynı shader'lı objeleri batch.
- Mesh shader (DX12 Ultimate) — Meshlet culling.

### 15.3 Texture Memory (VRAM)

| Platform | Texture Memory |
|---|---|
| Mobile | < 512 MB |
| PC Low (4 GB VRAM) | < 1 GB |
| PC Mid (8 GB VRAM) | < 2 GB |
| PC High (12 GB VRAM) | < 4 GB |
| Console (16 GB unified) | < 6 GB |

**Sıkıştırma formatları**:
- BC1 (DXT1) — 4:1, diffuse (1-bit alpha)
- BC3 (DXT5) — 4:1, diffuse + alpha
- BC5 (ATI2/3Dc) — 4:1, normal map (2 kanal)
- BC7 — 3:1, yüksek kalite diffuse/normal
- ASTC (mobile) — 4:1 – 12:1 ayarlanabilir
- ETC2 (mobile, OpenGL ES) — 4:1
- KTX2 + Basis Universal (web, cross-platform)

NEXUS, import sırasında texture'ları otomatik BC7/ASTC'ye compress eder;
KTX2 ile paketler.

### 15.4 Shader Complexity (ALU)

Pixel shader başına matematiksel işlem sayısı (ALU — Arithmetic Logic Unit):

| Platform | ALU / pixel |
|---|---|
| Mobile (GLES3) | < 500 |
| Mobile (Vulkan) | < 800 |
| PC Low | < 1000 |
| PC Mid | < 2000 |
| PC High | < 4000 |
| Console | < 5000 |
| Cinematic (offline) | sınırsız |

NEXUS shader graph'ta her node için ALU maliyeti hesaplanır; toplam
sınır aşımı uyarı verir.

### 15.5 Triangle Budget (görünür)

| Platform | Görünür triangle / frame |
|---|---|
| Mobile | < 2M |
| PC Low | < 3M |
| PC Mid | < 5M |
| PC High | < 10M |
| Console | < 15M |
| Cinematic | 50M+ |

### 15.6 GPU Profiling

- **RenderDoc** — Frame capture, draw call inspection.
- **Pix (Windows)** — DX12 profiling.
- **Xcode GPU Frame Capture** — Metal.
- **NVIDIA Nsight Graphics** — GPU trace, shader latency.
- **Intel Graphics Performance Analyzer** — Integrated GPU.

NEXUS, render frame analizini built-in render graph viewer ile sağlar.

### 15.7 Memory Profiling

- **Heap dump** — Asset başına VRAM/RAM kullanımı.
- **Texture streaming** — Mip seviyesi kameraya göre yüklenir.
- **Geometry streaming** — LOD swap, occlusion culling.
- **Async load** — Asset pre-fetch.

### 15.8 Asset Validation Pipeline

CI sürecinde her asset şu testlerden geçer:

1. Polygon count < bütçe (LOD başına).
2. Draw call sayısı (materyal sayısı ≤ 1).
3. Texture memory kullanımı < limit.
4. Texel density standart sapması < %15.
5. Naming convention uyumu.
6. glTF validator geçer.
7. UV unwrap kalitesi (overlap, distortion).
8. Normal map handedness (OpenGL vs DirectX).
9. Bone weight normalize (toplam = 1.0, max 4 joint).
10. Animation frame rate (30/60 fps).

Başarısız asset'ler **reject**; sanatçıya uyarı gönderilir. Tüm asset'ler
onaylanana kadar release branch'e merge edilmez.

---

## Ek: AAA Stüdyo Referansları

| Stüdyo | Öne Çıkan Pipeline Standartı |
|---|---|
| Pixar | USD (Hyperion render, Presto) |
| ILM | USD + Alembic + proprietary Stage |
| Disney Animation | USD + Hyperion + Look Dev |
| Weta Digital | Loki (USD-like) + Alembic + Manuka |
| DreamWorks | OpenVDB + MoonRay (USD) |
| Epic Games | Nanite + Lumen + UE5 (USD) |
| Unity Technologies | HDRP + Shader Graph + DOTS |
| Autodesk | FBX + Maya USD + Arnold |
| SideFX | Houdini Solaris + Karma (USD) |
| Adobe | Substance Painter + Substance Designer |
| Quixel | Megascans library + PBR standard |
| Blur Studio | Maya + V-Ray + Alembic |
| Naughty Dog | Proprietary engine + ICE |
| Ubisoft | AnvilNext + Snowdrop pipeline |
| CD Projekt Red | REDengine 4 + proprietary asset |

---

## Sonuç

NEXUS 3D Studio, yukarıdaki standartların bir sentezi olarak aşağıdaki
pipeline mimarisini benimser:

- **Ana sahne formatı**: USD (composition, variant, payload için).
- **Web dağıtım formatı**: glTF 2.0 / GLB (KTX2, Draco, MSFT_lod ile).
- **Cache formatı**: Alembic (animasyon, simülasyon).
- **Volumetric**: OpenVDB.
- **Import kaynakları**: FBX, BLEND, OBJ, STL, BVH, C3D.
- **PBR iş akışı**: Metallic-roughness, sRGB/Linear ayrımı net.
- **Naming**: SM_/SK_/T_/M_/Anim_ regex zorunlu.
- **LOD**: 4 seviye, %50 reduction, screen-size hysteresis.
- **Texel density**: 1024 px/m (Unreal), 2048 px/m (Unity) opsiyonel.
- **Polygon budget**: Hero 80K–150K, NPC 15K–30K, prop 1K–10K.
- **Frame budget**: 16.67 ms (60 fps), draw call < 5K, triangle < 5M (PC Mid).

Sonraki adım: Bu standartları **40 sprint roadmap**'inde (bkz.
`nexus-3d-studio-roadmap.md`) somut geliştirme görevlerine dönüştürmek.

---

*Bu doküman NEXUS 3D Studio çekirdek ekibi tarafından canlı referans olarak
kullanılır. Her sprint başında gözden geçirilir, gerektiğinde sürüm yükseltilir.*
