# NEXUS 3D Studio — 40 Sprint Roadmap (AAA Professional)

> Bu doküman, NEXUS 3D Studio isimli web tabanlı AAA-standart 3D üretim
> platformunun 40 sprintlik (1 sprint = 1 hafta) geliştirme planını detaylandırır.
> Toplam süre ~9 ay (1 sprint = 1 hafta; 4 sprint = 1 ay). Hedef: Pixar, ILM,
> Epic Games ve Unity Technologies seviyesinde bir 3D üretim ortamını tarayıcı
> üzerinden sunmak.

Tarih: 2026-06-21
Yazar: 3D Standards subagent
Sürüm: 1.0
Toplam Sprint: 40 (≈ 9 ay)
Format: Her sprint için başlık, hedef, çıktılar, teknoloji, test kriterleri,
AAA referans stüdyo.

---

## Yol Haritası Genel Bakış

| Faz | Sprint'ler | Tema | Tahmini Süre |
|---|---|---|---|
| Faz 1 | 1–10 | Temel Altyapı (viewport, model yükleme, sahne ağacı) | 10 hafta |
| Faz 2 | 11–20 | Rigleme & Animasyon (skeleton, IK, keyframe, retarget) | 10 hafta |
| Faz 3 | 21–30 | AAA Features (LOD, baking, shader graph, ray tracing) | 10 hafta |
| Faz 4 | 31–40 | Enterprise & Collaboration (multi-user, version control, AI, cloud) | 10 hafta |

Her sprint sonunda **demo + retrospective + acceptance test** yapılır.
"Sprint tamamlanmış" sayılması için tüm test kriterleri yeşil olmalıdır.

---

# FAZ 1 — Sprint 1-10: Temel Altyapı

## Sprint 1: Three.js Viewport + Camera

### Hedef
Tarayıcı üzerinde donanım hızlandırmalı (WebGL2) 3D viewport oluşturmak;
orbit/pan/zoom kamera kontrolünü sağlamak.

### Çıktılar
- `/src/viewport/Viewport.ts` — Three.js WebGLRenderer sarmalayıcı.
- `/src/viewport/CameraController.ts` — OrbitControls tabanlı, buton-bazlı
  mod geçişleri (orbit, pan, zoom, fly).
- `/src/viewport/SceneEnvironment.ts` — Varsayılan grid, IBL HDR sky, ground
  plane.
- `/src/viewport/StatsOverlay.ts` — FPS, draw call, triangle count overlay.

### Teknoloji
- Three.js r160+
- TypeScript 5.x
- Web Workers (background asset loading)
- WebGL2 (WebGPU deneysel feature flag)

### Test Kriterleri
- 60 fps stabil (Chrome, 1080p, RTX 3060).
- 1M triangle test sahnesinde frame time < 16 ms.
- Camera orbit smooth (no jitter), pan invertible, zoom wheel & touch.
- Mobile (iOS Safari, Chrome Android) dokunmatik destek.
- Resize event'te renderer otomatik re-scale.

### AAA Referans
**Autodesk Maya / Blender** — Viewport 2.0 benzeri immediate-mode render.
**Unreal Engine** — Editor viewport camera control şeması.

---

## Sprint 2: GLB/glTF Model Yükleyici

### Hedef
glTF 2.0 ve GLB dosyalarını sahneye import etmek; tüm PBR materyalleri,
animasyonları ve extension'ları doğru yorumlamak.

### Çıktılar
- `/src/io/GLTFLoader.ts` — Three.js GLTFLoader sarmalayıcı.
- `/src/io/extension/` — KHR_materials_clearcoat, KHR_materials_transmission,
  KHR_texture_basisu, KHR_draco_mesh_compression, KHR_mesh_quantization,
  EXT_mesh_gpu_instancing, MSFT_lod extension handler'ları.
- `/src/io/GLTFValidator.ts` — glTF-Validator WASM entegrasyonu.
- `/src/io/AssetCache.ts` — LRU cache, GPU buffer reuse.

### Teknoloji
- Three.js GLTFLoader + Draco (draco3d npm)
- Basis Universal (KTX2) decoder WASM
- glTF-Validator (Rust → WASM)
- KTX2 loader

### Test Kriterleri
- Khronos sample modelleri (Avocado, BoomBox, DamagedHelmet, SciFiHelmet,
  Sponza) hatasız yüklenir.
- glTF-Validator raporu her import'ta gösterilir; hata varsa reject.
- 50 MB GLB < 3 sn yükleme (fiber bağlantı).
- Draco-compressed mesh doğru decode.
- Animasyon (skeletal + morph) otomatik oynatılır.

### AAA Referans
**Khronos Group** — Sample models registry. **Microsoft Babylon.js** — glTF
loader referans implementasyonu.

---

## Sprint 3: Sahne Ağacı (Scene Hierarchy)

### Hedef
USD benzeri layer-based olmasa da, sahne hiyerarşisini (parent-child)
görüntüleme, düzenleme ve sürükle-bırak ile yeniden düzenleme.

### Çıktılar
- `/src/scene/SceneGraph.ts` — Tree data structure.
- `/src/scene/Node.ts` — Object3D wrapper (transform, visibility, lock).
- `/src/ui/OutlinerPanel.ts` — Sidebar tree view (drag-drop reorder).
- `/src/scene/SceneSnapshot.ts` — Undo/redo için JSON snapshot.

### Teknoloji
- Three.js Object3D + Group
- Immer (immutable state updates)
- Zustand (state management)
- dnd-kit (drag-and-drop)

### Test Kriterleri
- 10.000 node içeren sahnede outliner < 100 ms render.
- Parent-child transform inheritance doğru.
- Undo/redo 50 step history.
- Drag-drop ile reparent hatasız.
- Search/filter, hide/isolate, rename inline.

### AAA Referans
**Unreal Engine** — World Outliner. **Maya** — Outliner + Node Editor.

---

## Sprint 4: Transform Gizmo (Move, Rotate, Scale)

### Hedef
Seleksiyona göre move/rotate/scale gizmo'su; snapping, axis lock, pivot
mode desteği.

### Çıktılar
- `/src/gizmo/TransformGizmo.ts` — Three.js TransformControls sarmalayıcı.
- `/src/gizmo/SnapSettings.ts` — Grid snap, angle snap, scale snap.
- `/src/gizmo/PivotMode.ts` — Bounding box center, origin, individual origin,
  3D cursor.
- `/src/gizmo/CoordinateSpace.ts` — World vs Local space toggle.

### Teknoloji
- Three.js TransformControls
- Custom shader (axis renkleri, hover highlight)
- Pointer Events API

### Test Kriterleri
- X/Y/Z eksen lock (keyboard shortcut).
- Grid snap (1 m), angle snap (5°), scale snap (10%).
- Pivot modları test senaryoları.
- Multi-selection → bounding center pivot.
- Ctrl+drag = duplicate; Shift+drag = snap.

### AAA Referans
**Blender** — Move/Rotate/Scale gizmo UX. **Unity** — Pivot/Center ve
Global/Local toggle.

---

## Sprint 5: Material Inspector (PBR)

### Hedef
glTF metallic-roughness PBR materyallerini görsel editör ile düzenlemek;
texture atama, factor ayarı, alpha mode kontrolü.

### Çıktılar
- `/src/material/MaterialInspector.ts` — Sidebar panel.
- `/src/material/PBRMaterial.ts` — Three.js MeshStandardMaterial wrapper.
- `/src/material/TextureSlot.ts` — Drag-drop texture atama.
- `/src/material/MaterialPreview.ts` — Sphere preview (IBL scene).
- `/src/material/MaterialPresets.ts` — Metal, plastic, wood, skin başlangıç.

### Teknoloji
- Three.js MeshStandardMaterial, MeshPhysicalMaterial
- React Hook Form
- Color picker (react-colorful)

### Test Kriterleri
- Disney BRDF referans sahnede doğru render.
- AlphaMode: OPAQUE / MASK / BLEND toggle.
- DoubleSided switch.
- Texture mapping (UV set 0/1).
- Tiling/offset (KHR_texture_transform).
- Materyal değişikliği anında viewport'a yansır.

### AAA Referans
**Substance Painter** — Material layer sistemi. **Marmoset Toolbag** —
PBR material preview.

---

## Sprint 6: Texture Viewer

### Hedef
Her texture slot (Albedo, Normal, Metallic, Roughness, AO, Emissive) için
önizleme; renk uzayı doğrulama, mip level inspection.

### Çıktılar
- `/src/texture/TextureViewer.ts` — Modal pencere.
- `/src/texture/TextureChannel.ts` — R/G/B/A kanal izolasyonu.
- `/src/texture/MipLevelSlider.ts` — Mip preview.
- `/src/texture/ColorSpaceBadge.ts` — sRGB/Linear doğrulama uyarısı.
- `/src/texture/TextureCompress.ts` — KTX2/BC7 export.

### Teknoloji
- Three.js DataTexture, CompressedTexture
- KTX2 encoder WASM
- sharp (image processing, Node)

### Test Kriterleri
- 8K texture akıcı pan/zoom.
- Kanal başına gri-tonu görüntüleme.
- sRGB texture linear'da gösterilirse uyarı.
- Mip level 0-10 slider.
- PNG/JPG/TGA/HDR/TIFF import.
- KTX2 export (%60-70 boyut azaltma).

### AAA Referans
**Adobe Substance Designer** — Texture inspect mode. **Quixel Megascans** —
PBR map preview.

---

## Sprint 7: FBX Import

### Hedef
FBX binary/ASCII dosyalarını sahneye aktarmak; geometri, UV, materyal,
skeletal, animasyon verilerini korumak.

### Çıktılar
- `/src/io/FBXLoader.ts` — Three.js FBXLoader sarmalayıcı (yalnız import).
- `/src/io/FBXToGLTF.ts` — FBX → glTF dönüştürücü (lossy fallback).
- `/src/io/FBXMaterialMap.ts` — Phong/Lambert → PBR dönüşüm.
- `/src/io/FBXAxisFix.ts` — Y-up/Z-up normalizasyon.

### Teknoloji
- Three.js FBXLoader (legacy, JavaScript)
- fbxsdk-py (Python, headless servis) — yedek
- Pfif (FBX → JSON parser, experimental)

### Test Kriterleri
- Mixamo FBX animasyonları hatasız yüklenir.
- Maya 2023 FBX export ile uyumlu.
- 3ds Max ve MotionBuilder çıkışları test.
- Up-axis otomatik tespit (Y-up vs Z-up).
- Skeleton + skin weights korundu.
- Materyal Phong → PBR dönüşümü makul.

### AAA Referans
**Autodesk FBX SDK** — Resmi parser. **Mixamo** — Online FBX animasyon
kütüphanesi.

---

## Sprint 8: OBJ/STL Import

### Hedef
Basit geometri formatlarını (OBJ, STL) import etmek; MTL materyal desteği
ve STL mesh repair.

### Çıktılar
- `/src/io/OBJLoader.ts` — OBJ + MTL loader.
- `/src/io/STLLoader.ts` — Binary & ASCII STL.
- `/src/io/MeshRepair.ts` — Manifold denetimi, hole fill, normal flip.
- `/src/io/STLExport.ts` — 3D printing için dışa aktarım.

### Teknoloji
- Three.js OBJLoader, STLLoader
- manifold (WASM) — geometry repair
- cgal-js (experimental)

### Test Kriterleri
- Stanford Bunny, Happy Buddha STL yüklenir.
- Non-manifold edge otomatik onarım.
- Inverted normal tespiti ve düzeltme.
- OBJ N-gon face triangulate.
- MTL texture ataması PBR'a map'lenir.
- STL export binary + ASCII.

### AAA Referans
**MeshLab** — Mesh repair referans. **PrusaSlicer** — STL preprocess.

---

## Sprint 9: USD Import (Experimental)

### Hedef
USD (.usd, .usda, .usdz) formatını read-only import etmek; layer composition
ve variant set'leri sınırlı destekle yorumlamak.

### Çıktılar
- `/src/io/USDLoader.ts` — USD WASM wrapper.
- `/src/io/USDComposition.ts` — Sublayer/reference resolver.
- `/src/io/USDVariantSelector.ts` — Variant set dropdown UI.
- `/src/io/USDZARPreview.ts` — Apple Quick Look uyumlu export.

### Teknoloji
- OpenUSD WASM build (emscripten)
- usd-ts (TypeScript binding, custom)
- Apple AR Quick Look (USDZ)

### Test Kriterleri
- Pixar "Kitchen" sample sahnesi yüklenir (limitli prim).
- USDA ASCII okuma.
- USDZ iOS'ta Quick Look ile açılır.
- Variant set seçimi sahneye yansır.
- Sublayer stack doğru birleşir.

### AAA Referans
**Pixar OpenUSD** — Resmi SDK. **Apple ARKit** — USDZ standardı.

---

## Sprint 10: Blend Import (via Blender Headless)

### Hedef
.blend dosyalarını headless Blender servisi üzerinden glTF'ye dönüştürerek
sahneye dahil etmek.

### Çıktılar
- `/src/io/BlendLoader.ts` — Frontend sarmalayıcı.
- `/services/blender-headless/` — Docker container (Blender 4.2 LTS).
- `/services/blender-headless/export_to_glb.py` — Python script.
- `/src/io/BlendMaterialConvert.ts` — Principled BSDF → glTF PBR map.

### Teknoloji
- Blender 4.2 LTS (Docker image)
- bpy Python API
- RabbitMQ (job queue)
- WebSocket (progress stream)

### Test Kriterleri
- Blender 4.2 .blend dosyaları dönüştürülür.
- Mesh + material + texture korunur.
- Particle system (hair) → curve → mesh fallback.
- 100 MB blend < 30 sn.
- Particle ve simülasyon cache atlanır (uyarı ile).

### AAA Referans
**Blender Foundation** — bpy referans. **Poliigon** — Blend → glTF pipeline.

---

# FAZ 2 — Sprint 11-20: Rigleme & Animasyon

## Sprint 11: Bone Hierarchy Editor

### Hedef
Sahne içine bone (joint) eklemek, parent-child ilişkisi kurmak, isimlendirme
standardına uymak.

### Çıktılar
- `/src/rig/BoneEditor.ts` — Bone ekleme/silme/aracı.
- `/src/rig/BoneHierarchy.ts` — Tree view, drag-drop reparent.
- `/src/rig/BoneVisualizer.ts` — Octahedron / stick render.
- `/src/rig/BoneNaming.ts` — Mixamo/Unreal Mannequin şablonu.

### Teknoloji
- Three.js SkeletonHelper (custom shader)
- Zustand (rig state)
- BFS traversal (hierarchy)

### Test Kriterleri
- Mixamo humanoid skeleton (65 bone) oluşturulabilir.
- Bone rotasyon/translation gizmo ile düzenlenebilir.
- L_/R_ side prefix otomatik (mirror).
- Bone isim regex: `^[A-Z][a-zA-Z0-9_]*$`.
- Mirror X-axis tool (left→right).

### AAA Referans
**Mixamo** — Humanoid rig standardı. **Unreal Engine** — Mannequin skeleton.

---

## Sprint 12: Skeleton Görselleştirme

### Hedef
Bone'ları viewport'ta editlenebilir görsel olarak render etmek; rest pose,
bind pose, current pose ayrımı.

### Çıktılar
- `/src/rig/SkeletonMesh.ts` — Bone başına octahedron mesh.
- `/src/rig/PoseMode.ts` — Rest/Bind/Current pose toggle.
- `/src/rig/BoneGizmo.ts` — Bone başına rotate handle.
- `/src/rig/SkinningPreview.ts` — Mesh deformasyon canlı önizleme.

### Teknoloji
- Three.js SkinnedMesh
- Custom bone shader (renkli stick)
- ShaderMaterial (skinning)

### Test Kriterleri
- 100 bone skeleton < 60 fps'te akıcı.
- Bone seçiminde highlight.
- Pose mode değişiminde mesh güncellenir.
- Bone length otomatik (parent-child mesafesi).
- Bone color: X=red, Y=green, Z=blue.

### AAA Referans
**Maya HumanIK** — Skeleton viz. **Blender** — Armature edit mode.

---

## Sprint 13: Weight Paint Tool

### Hedef
Mesh vertex'lerini bone'lara ağırlıkla bağlamak; fırça tabanlı weight
painting, mirror, normalize, smooth.

### Çıktılar
- `/src/rig/WeightPaintTool.ts` — Brush-based weight edit.
- `/src/rig/WeightBrush.ts` — Add/Subtract/Smooth/Replace modları.
- `/src/rig/WeightMirror.ts` — X-axis symmetric paint.
- `/src/rig/WeightNormalize.ts` — Toplam = 1.0 zorunlu.
- `/src/rig/WeightHeatmap.ts` — Color heatmap overlay.

### Teknoloji
- Three.js VertexColors + custom shader
- Pointer events (pen/stylus pressure)
- GPU compute shader (weight smoothing)

### Test Kriterleri
- Max 4 bone/vertex (5. ve sonrası truncate).
- Mirror paint sol-sağ simetri.
- Smooth filtresi 5 iterasyon.
- Normalize toggle.
- Heatmap renk: blue (0) → green (0.5) → red (1).
- Brush size/strength/falloff ayarlanabilir.

### AAA Referans
**Maya Paint Skin Weights Tool** — Weight brush UX. **Blender Weight Paint
mode** — Heatmap & mirror.

---

## Sprint 14: IK Solver (CCD, FABRIK)

### Hedef
Inverse Kinematics ile hedef pozisyonu verildiğinde eklem açılarını çözmek;
iki algoritma seçeneği sunmak.

### Çıktılar
- `/src/rig/IKSolver.ts` — Abstract solver interface.
- `/src/rig/CCDSolver.ts` — Cyclic Coordinate Descent.
- `/src/rig/FABRIKSolver.ts` — Forward And Backward Reaching IK.
- `/src/rig/IKConstraint.ts` — Pole vector, angle limit, soft constraint.
- `/src/rig/IKChainEditor.ts` — UI ile chain tanımlama.

### Teknoloji
- GLM (gl-matrix) — vector math
- Web Workers (parallel solve)
- Custom TypeScript (no Three.js dependency)

### Test Kriterleri
- 10-bone chain 100 iterasyon < 1 ms (WASM-optimized).
- Pole vector ile dirsek hizalama.
- Angle limit (±90°) uygulanır.
- CCD vs FABRIK karşılaştırma UI'sı.
- Multi-limb IK (kol+bacak aynı anda).
- Real-time interactive (mouse drag → solve).

### AAA Referans
**Unreal Engine Control Rig** — IK chain editor. **Maya HumanIK** — Pole
vector ve retarget.

---

## Sprint 15: FK Controls

### Hedef
Forward Kinematics için kontrol objeleri (NURBS curve benzeri) oluşturmak;
animatör ince kontrol için.

### Çıktılar
- `/src/rig/FKControl.ts` — Bone başına control curve.
- `/src/rig/ControlShape.ts` — Circle/Square/Diamond/Arrow shapes.
- `/src/rig/ControlColor.ts` — Renk kodu (FK=mavi, IK=kırmızı).
- `/src/rig/ControlLayer.ts` — Display layer visibility.

### Teknoloji
- Three.js Line + TubeGeometry
- Custom shader (always-on-top)
- Object3D group parenting

### Test Kriterleri
- Control seçimi ile bone rotate.
- Bone'a parent (constraint) link.
- Control visible/hidden toggle.
- Control shape boyutu dünya ölçeğinde sabit (screen-space).
- Color-coded by role.

### AAA ReferANS
**Maya** — NURBS control curve tradition. **Houdini KineFX** — Control
rigging.

---

## Sprint 16: Keyframe Animation System

### Hedef
Bone transforms için anahtar kare oluşturma, düzenleme, oynatma; interpolate
modları (linear, ease-in-out, cubic).

### Çıktılar
- `/src/anim/Keyframe.ts` — Veri modeli (time, value, interpolation).
- `/src/anim/AnimationTrack.ts` — Bone başına track (T/R/S).
- `/src/anim/AnimationClip.ts` — Sahne başına tüm track'ler.
- `/src/anim/AnimationPlayer.ts` — Oynatma kontrolü (play/pause/scrub/loop).
- `/src/anim/Interpolation.ts` — Linear, Step, Cubic (Bezier).

### Teknoloji
- Three.js AnimationMixer (extended)
- Custom cubic-bezier solver
- Web Audio API (frame timing)

### Test Kriterleri
- 1000 keyframe < 100 ms evaluate.
- Interpolation modları doğru (linear/step/cubic).
- Time scrub gerçek-zamanlı.
- Loop modes: once, loop, ping-pong.
- Frame rate 24/30/60 fps seçilebilir.
- Keyframe auto-key (record mode).

### AAA Referans
**Maya** — Time slider + auto-key. **Blender** — Pose mode + keyframe.

---

## Sprint 17: Animation Timeline (Dope Sheet)

### Hedef
Tüm keyframe'leri tablo halinde görüntüleme; drag ile taşıma, çoklu seçim,
scale, copy/paste.

### Çıktılar
- `/src/ui/Timeline.ts` — Horizontal scrubber.
- `/src/ui/DopeSheet.ts` — Track × time grid.
- `/src/ui/KeyframeHandle.ts` — Diamond shape, draggable.
- `/src/ui/TimeMarker.ts` — Frame marker, snap.
- `/src/ui/RangeSelector.ts` — Playback range, in/out.

### Teknoloji
- Canvas 2D (60 fps render)
- Immer (immutable updates)
- Pointer events (multi-touch)

### Test Kriterleri
- 100 track × 1000 keyframe akıcı scroll.
- Drag keyframe time değiştirir.
- Multi-select + bulk move.
- Snap to frame.
- Copy/paste keyframe'ler arası.
- Time signature (fps) değiştirilebilir.

### AAA Referans
**Maya** — Dope sheet. **Blender** — Dope sheet editor.

---

## Sprint 18: Curve Editor (Graph Editor)

### Hedef
Keyframe interpolasyon eğrilerini Bezier handle'ları ile düzenleme; ease
in/out, tangent kontrolü.

### Çıktılar
- `/src/ui/GraphEditor.ts` — 2D plot (time × value).
- `/src/ui/CurveHandle.ts` — Bezier tangent handle.
- `/src/ui/CurvePreset.ts` — Linear, ease, bounce, elastic presets.
- `/src/ui/CurveSnap.ts` — Grid snap, value snap.
- `/src/ui/CurveExtrapolation.ts` — Constant, linear, cycle.

### Teknoloji
- Canvas 2D
- Custom cubic Bezier solver (De Casteljau)
- WebGL fallback (for 10k+ curves)

### Test Kriterleri
- Bezier handle drag = eğri değişimi anlık.
- Multi-curve (T+R+S) overlay.
- Tangent modları: auto, smooth, linear, broken.
- Preset library (ease-in-out, bounce).
- Cycle extrapolation test.
- Zoom/pan smooth.

### AAA Referans
**Maya Graph Editor** — Bezier handle geleneksel standardı. **Unity
Animation Window** — Curve editor UX.

---

## Sprint 19: Animation Retargeting

### Hedef
Bir karakterin animasyonunu başka karaktere (farklı boyut/oran) aktarmak;
HumanIK tarzı otomatik mapping.

### Çıktılar
- `/src/anim/Retargeter.ts` — Bone mapping resolver.
- `/src/anim/HumanoidMapper.ts` — Mixamo/Unreal Mannequin şablonu.
- `/src/anim/FootLock.ts` — Yere temas koruması.
- `/src/anim/RetargetPreview.ts` — Side-by-side karşılaştırma.
- `/src/anim/MotionLibrary.ts` — Hazır animasyon kütüphanesi.

### Teknoloji
- Custom math (bone offset compensation)
- IK post-process (foot lock)
- WebGL instanced preview

### Test Kriterleri
- Mixamo anim → custom rig hatasız.
- T-pose referans ile retarget.
- Foot penetration < 1 cm.
- Hand ik ile etkileşim (kapı tutma).
- 10 farklı karakterde test.
- Motion library: walk, run, jump, idle, attack.

### AAA Referans
**Unreal IK Retargeter** — Skeleton mapping. **Mixamo Auto-Rigger** —
Humanoid rig + animasyon.

---

## Sprint 20: Motion Capture Import (BVH, C3D)

### Hedef
MoCap verisini içe aktarmak; skeleton'a otomatik bind, retarget ve cleanup
(foot sliding, jitter).

### Çıktılar
- `/src/io/BVHLoader.ts` — BVH parser (hierarchy + motion).
- `/src/io/C3DLoader.ts` — C3D binary parser (marker + analog).
- `/src/anim/MoCapRetarget.ts` — Marker → bone otomatik eşleştirme.
- `/src/anim/MoCapCleanup.ts` — Foot sliding fix, jitter filter.
- `/src/anim/LoopTrim.ts` — Animasyon loop trimming.

### Teknoloji
- TypeScript binary parser
- Kalman filter (jitter)
- Custom IK (foot lock)

### Test Kriterleri
- CMU MoCap dataset (BVH) import.
- Vicon C3D marker verisi okuma.
- Otomatik humanoid mapping > %80 accuracy.
- Foot sliding < 2 cm drift.
- Jitter filter sinyal-gürültü oranı iyileşmesi.
- Loop trim ile seamless tekrar.

### AAA Referans
**CMU Graphics Lab MoCap** — BVH dataset. **Vicon Shōgun** — C3D pipeline.

---

# FAZ 3 — Sprint 21-30: AAA Features

## Sprint 21: LOD Generator

### Hedef
Yüksek-poly mesh'ten otomatik LOD zinciri üretmek; %50 reduction, screen-size
threshold, hysteresis.

### Çıktılar
- `/src/lod/LODGenerator.ts` — Quadric Edge Collapse (meshopt).
- `/src/lod/LODChain.ts` — LOD0-4 zinciri yönetimi.
- `/src/lod/LODSwitcher.ts` — Screen-size threshold + hysteresis.
- `/src/lod/LODValidator.ts` — UV bozulması, silhouette kontrolü.
- `/src/lod/LODExport.ts` — glTF MSFT_lod extension.

### Teknoloji
- meshoptimizer (WASM)
- Quadric Edge Collapse (QEM)
- Custom screen-size calculator

### Test Kriterleri
- 100K tri → 50K/25K/12K/6K üretim < 5 sn.
- UV distortion < %5.
- Silhouette farkı perceptually küçük.
- Screen-size threshold ile switch.
- Hysteresis ile pop-flicker yok.
- MSFT_lod export validator geçer.

### AAA Referans
**Simplygon** — LOD pipeline standardı. **Unity LOD Group** — Screen-size
threshold.

---

## Sprint 22: Mesh Decimation

### Hedef
Manuel kontrol ile mesh sadeleştirme; vertex başına seçim, edge collapse
önizleme.

### Çıktılar
- `/src/mesh/DecimationTool.ts` — Brush-based vertex mark.
- `/src/mesh/EdgeCollapse.ts` — Edge seçimi ile collapse.
- `/src/mesh/SymmetryDecimate.ts` — Simetrik decimate.
- `/src/mesh/DecimationPreview.ts` — Before/after overlay.
- `/src/mesh/PreserveVolume.ts` — Silhouette koruma.

### Teknoloji
- Half-edge data structure
- Custom collapse algorithm
- WebGL instanced preview

### Test Kriterleri
- 1M tri mesh'te real-time brush.
- Edge collapse preview canlı.
- Simetri ile %50 zaman tasarrufu.
- Preserve boundary edges.
- Topology korunur (manifold).
- Vertex color/UV/normal korunur.

### AAA Referans
**ZBrush Decimation Master** — Artist-friendly decimation. **Houdini PolyReduce
SOP** — Procedural.

---

## Sprint 23: UV Unwrap Tool

### Hedef
Otomatik ve yarı-otomatik UV açma; seam selection, packing, distortion metric.

### Çıktılar
- `/src/uv/UVUnwrap.ts` — Automatic unwrap (LSCM/ABF++).
- `/src/uv/SeamEditor.ts` — Manual seam selection.
- `/src/uv/UVPack.ts` — Rectangle packing (max area).
- `/src/uv/UVIslands.ts` — Island ayırma ve düzenleme.
- `/src/uv/UVDistortion.ts` — Stretch heatmap.
- `/src/uv/UDIMSupport.ts` — Multi-tile UV (UDIM).

### Teknoloji
- xatlas (WASM) — uv unwrap
- LSCM (Least Squares Conformal Maps)
- Rectangle packing algorithm

### Test Kriterleri
- 10K tri mesh < 1 sn unwrap.
- Distortion < %10.
- Packing efficiency > %75.
- Seam editing with live preview.
- UDIM 10-tile destek.
- Stretch heatmap (green=good, red=bad).

### AAA Referans
**RizomUV** — AAA UV unwrap industry standard. **Maya UV Editor** — Manual
controls.

---

## Sprint 24: Texture Baking

### Hedef
Yüksek-poly detayını düşük-poly mesh üzerine texture olarak bake'lemek;
normal, AO, curvature, thickness, color maps.

### Çıktılar
- `/src/bake/BakeEngine.ts` — GPU-based bake (WebGPU compute).
- `/src/bake/NormalBaker.ts` — High → low normal transfer.
- `/src/bake/AOBaker.ts` — Ambient occlusion ray-march.
- `/src/bake/CurvatureBaker.ts` — Concave/convex map.
- `/src/bake/ColorBaker.ts` — Vertex color → texture.
- `/src/bake/BakeQueue.ts` — Multi-map parallel bake.

### Teknoloji
- WebGPU compute shader (fallback: WebGL2 transform feedback)
- xatlas UV (Sprint 23)
- OffscreenCanvas

### Test Kriterleri
- 4K texture bake < 30 sn (RTX 3060).
- High-poly 1M tri → low 10K tri.
- Normal map handedness (OpenGL/DirectX) seçilebilir.
- AO ray-march quality adjustable.
- Multi-map paralel (tüm map'ler tek seferde).
- Bake result preview overlay.

### AAA Referans
**Substance Painter Bake Textures** — Map seti standardı. **Marmoset Toolbag
Baker** — GPU bake hız referansı.

---

## Sprint 25: PBR Material Editor (Node-based)

### Hedef
Node tabanlı görsel materyal editörü; Substance Designer benzeri graph,
node kütüphanesi, real-time preview.

### Çıktılar
- `/src/material/MaterialGraph.ts` — DAG data structure.
- `/src/material/NodeLibrary.ts` — Texture, Math, Color, Blend, Procedural nodes.
- `/src/material/NodeEditor.ts` — Drag-drop canvas.
- `/src/material/NodeCompiler.ts` — Graph → shader code (GLSL).
- `/src/material/MaterialExport.ts` — glTF/Substance/MDL export.

### Teknoloji
- React Flow (node editor)
- GLSL generator (custom AST → string)
- Three.js ShaderMaterial

### Test Kriterleri
- 50 node graph < 5 ms compile.
- Real-time preview canlı.
- Procedural noise (Perlin, Worley, Voronoi).
- Math node'lar (add, multiply, lerp, clamp).
- Texture sample + UV transform.
- Export to glTF (KHR_materials_* extensions).

### AAA Referans
**Substance Designer** — Node graph standardı. **Blender Shader Editor** —
Node UX.

---

## Sprint 26: Shader Graph

### Hedef
Gelişmiş shader'lar için node graph; vertex/fragment stage ayrımı, custom
code injection, multi-pass.

### Çıktılar
- `/src/shader/ShaderGraph.ts` — Vertex + Fragment stage graph.
- `/src/shader/ShaderNode.ts` — Built-in node'lar (position, normal, uv, time).
- `/src/shader/CodeNode.ts` — Custom GLSL injection.
- `/src/shader/ShaderCompiler.ts` — AST → GLSL (vert/frag).
- `/src/shader/ShaderVariant.ts` — Multi-pass, multi-LOD variants.
- `/src/shader/ShaderValidator.ts` — Syntax + type check.

### Teknoloji
- Custom AST → GLSL transpiler
- TypeScript visitor pattern
- WebGL2/WebGL3 (WebGPU experimental)

### Test Kriterleri
- Shader compile < 10 ms.
- 100 node graph akıcı.
- Custom function injection.
- Type safety (float/vec3/mat4).
- Hot-reload on edit.
- Variant cache (permutation cache).

### AAA Referans
**Unity Shader Graph** — Visual shader standardı. **Unreal Material Editor** —
AAA shader graph UX.

---

## Sprint 27: Particle System

### Hedef
GPU tabanlı partikül sistemi; emitter, lifetime, force field, collision,
sub-emitter.

### Çıktılar
- `/src/particles/ParticleSystem.ts` — GPU instanced particle pool.
- `/src/particles/ParticleEmitter.ts` — Shape (sphere/box/cone), rate, burst.
- `/src/particles/ParticleModule.ts` — Lifetime, velocity, color, size, rotation.
- `/src/particles/ForceField.ts` — Gravity, vortex, attractor, turbulence.
- `/src/particles/ParticleCollision.ts` — Sphere/plane collision.
- `/src/particles/TrailRenderer.ts` — Particle trail ribbon.

### Teknoloji
- Three.js InstancedMesh + BufferGeometry
- WebGPU compute (fallback: transform feedback)
- GPGPU texture-based simulation

### Test Kriterleri
- 100K particle 60 fps.
- 10 emitter aynı sahnede.
- Collision detection sphere/plane.
- Trail ribbon smooth.
- Sort by depth (transparency).
- Sub-emitter (death → spawn).

### AAA Referans
**Unreal Niagara** — Modern particle system. **Unity VFX Graph** — GPU
particle referansı.

---

## Sprint 28: Physics Simulation

### Hedef
Rigid body, cloth, soft body, fluid simulasyonu; real-time preview.

### Çıktılar
- `/src/physics/PhysicsWorld.ts` — Rapier WASM dünya.
- `/src/physics/RigidBody.ts` — Static/Dynamic/Kinematic.
- `/src/physics/Collider.ts` — Box/Sphere/Mesh/Convex.
- `/src/physics/Cloth.ts` — Verlet cloth simulation.
- `/src/physics/SoftBody.ts` — Mass-spring soft body.
- `/src/physics/Fluid.ts` — SPH/FLIP simplified fluid.

### Teknoloji
- Rapier (Rust → WASM) — rigid body
- cannon-es (fallback)
- Custom Verlet integration (cloth)
- GPGPU (fluid)

### Test Kriterleri
- 1000 rigid body 60 fps.
- Cloth 10×10 grid real-time.
- Soft body deformasyon plausible.
- Fluid particle 5K preview.
- Collision response correct.
- Constraint (hinge, ball-socket).

### AAA Referans
**Houdini Vellum** — Cloth/soft body. **NVIDIA FleX** — GPU physics. **Unreal
Chaos** — Destruction physics.

---

## Sprint 29: Crowd Simulation

### Hedef
Yüzlerce NPC'nin sahnede yürümesi; navigation mesh, behavior tree, LOD.

### Çıktılar
- `/src/crowd/CrowdManager.ts` — Agent pool, instanced render.
- `/src/crowd/NavMesh.ts` — Recast/Detour navigation mesh.
- `/src/crowd/BehaviorTree.ts` — State machine, wander, avoid, follow.
- `/src/crowd/AgentAnimator.ts` — Anim sync (walk/run/idle).
- `/src/crowd/CrowdLOD.ts` — Distance-based LOD + impostor.

### Teknoloji
- recast-navigation (WASM)
- InstancedMesh (per-agent matrix)
- Behavior tree (custom)

### Test Kriterleri
- 1000 agent 60 fps.
- NavMesh otomatik üretim < 5 sn.
- Avoidance (RVO) collision-free.
- Animation sync (footstep timing).
- LOD swap smooth.
- Impostor billboard uzak agent.

### AAA Referans
**Golaem Crowd** — Film crowd standardı. **Massive** — Lord of the Rings
referansı. **Unreal Mass Entity** — Modern ECS crowd.

---

## Sprint 30: Real-Time Ray Tracing (WebGPU)

### Hedef
WebGPU ile donanım hızlandırmalı ışın izleme; reflection, refraction, soft
shadow, GI approximation.

### Çıktılar
- `/src/raytrace/RayTraceRenderer.ts` — WebGPU RT pipeline.
- `/src/raytrace/BLAS.ts` — Bottom-level acceleration structure.
- `/src/raytrace/TLAS.ts` — Top-level acceleration structure.
- `/src/raytrace/RTShader.ts` — Closest-hit, any-hit, miss shader.
- `/src/raytrace/Denoiser.ts` — SVGF veya OIDN denoising.
- `/src/raytrace/HybridRenderer.ts` — Raster + RT hybrid.

### Teknoloji
- WebGPU (Chrome 113+)
- WGSL (WebGPU Shading Language)
- BVH (custom build, SAH)
- SVGF (spatio-temporal variance-guided filter)

### Test Kriterleri
- Reflection: metal/roughness doğru.
- Soft shadow PCF benzeri quality.
- Denoising 4 sample → 60 fps.
- Hybrid mode (raster + RT selective).
- Fallback to raster (WebGL2) if no WebGPU.
- Comparison slider (raster vs RT).

### AAA Referans
**NVIDIA RTX** — RT donanım standardı. **Unreal Lumen** — Hybrid GI. **DXR
(DirectX Raytracing)** — RT API referansı.

---

# FAZ 4 — Sprint 31-40: Enterprise & Collaboration

## Sprint 31: Multi-User Editing (WebSocket)

### Hedef
Gerçek-zamanlı çok kullanıcılı sahne edit; Figma benzeri live cursor, lock,
presence.

### Çıktılar
- `/src/collab/CollabClient.ts` — WebSocket client.
- `/src/collab/CRDTScene.ts` — Conflict-free replicated data type.
- `/src/collab/LiveCursor.ts` — Diğer kullanıcı cursor'ları.
- `/src/collab/ObjectLock.ts` — Seçili obje lock/unlock.
- `/src/collab/PresenceIndicator.ts` — Avatar, role, status.
- `/src/collab/ChangeLog.ts` — Audit log (kim ne değiştirdi).

### Teknoloji
- WebSocket (socket.io)
- Yjs (CRDT library)
- Redis (server pub/sub)
- Node.js (backend)

### Test Kriterleri
- 10 eşzamanlı kullanıcı 60 fps.
- Conflict-free (CRDT) sync.
- Object lock 100 ms propagation.
- Live cursor 50 ms latency.
- Offline → reconnect auto-sync.
- Audit log queryable.

### AAA Referans
**Figma** — Multi-user live editing. **Autodesk Flow Production Tracking** —
AAA asset tracking + collaboration.

---

## Sprint 32: Version Control (git-lfs)

### Hedef
Sahne ve asset geçmişini tutmak; branch, merge, diff, time-travel.

### Çıktılar
- `/src/vcs/RepoManager.ts` — Git wrapper (isomorphic-git).
- `/src/vcs/LFSManager.ts` — Large file storage (.glb, .png, .blend).
- `/src/vcs/SceneDiff.ts` — Görsel sahne diff (before/after).
- `/src/vcs/BranchUI.ts` — Branch list, create, switch, merge.
- `/src/vcs/CommitHistory.ts` — Timeline view.
- `/src/vcs/AssetLock.ts` — Lock-based edit (artist lock).

### Teknoloji
- isomorphic-git (browser git)
- git-lfs (large file)
- Diff library (custom scene diff)
- SQLite (local cache)

### Test Kriterleri
- 1 GB repo clone < 30 sn (LFS).
- Commit/push/pull < 5 sn.
- Scene diff görsel karşılaştırma.
- Branch merge otomatik (when no conflict).
- Conflict resolver UI.
- History time-travel (any commit preview).

### AAA Referans
**Perforce Helix Core** — AAA stüdyo VCS standardı. **Autodesk ShotGrid
Version Control** — Asset history. **GitHub LFS** — Open-source LFS.

---

## Sprint 33: Asset Library

### Hedef
Yeniden kullanılabilir asset kütüphanesi; tag, search, preview, version.

### Çıktılar
- `/src/library/AssetLibrary.ts` — Browse + search.
- `/src/library/AssetTag.ts` — Tag system (semantic + free text).
- `/src/library/AssetPreview.ts` — Auto thumbnail (3D orbit).
- `/src/library/AssetVersion.ts` — Multi-version asset.
- `/src/library/AssetDependency.ts` — Dependency graph (texture → material → mesh).
- `/src/library/AssetPublish.ts` — Publish workflow (draft → review → published).

### Teknoloji
- PostgreSQL (metadata)
- MinIO/S3 (binary asset)
- Elasticsearch (search)
- Three.js (thumbnail render)

### Test Kriterleri
- 10K asset < 200 ms search.
- Tag-based filter (multi-select).
- Thumbnail 256×256 orbit preview.
- Version diff (side-by-side).
- Dependency graph visual.
- Publish workflow (approval chain).

### AAA Referans
**Quixel Megascans** — Asset library standardı. **Unreal Marketplace** —
Asset browser UX. **Autodesk Flow** — Asset management.

---

## Sprint 34: Render Farm Queue

### Hedef
Offline render job'larını dağıtık node'lara göndermek; priority, retry,
progress monitoring.

### Çıktılar
- `/src/farm/JobQueue.ts` — Priority queue (RabbitMQ).
- `/src/farm/WorkerNode.ts` — Worker (Docker container).
- `/src/farm/RenderJob.ts` — Frame range, output format, settings.
- `/src/farm/JobMonitor.ts` — Real-time progress UI.
- `/src/farm/OutputBucket.ts` — S3/MinIO output storage.
- `/src/farm/CostEstimator.ts` — Tahmini maliyet (saat × node sayısı).

### Teknoloji
- RabbitMQ (job queue)
- Docker (worker isolation)
- Kubernetes (orchestration)
- FFmpeg (frame → video)
- AWS Batch / GCP Cloud Run (cloud option)

### Test Kriterleri
- 100 frame job 10 node'da paralel.
- Job retry (3x failure).
- Progress % gerçek-zamanlı.
- Output PNG/EXR/MP4.
- Cost estimate < %10 error.
- Cancel job node'lara propagate.

### AAA Referans
**Deadline (Thinkbox/AWS)** — Render farm standardı. **Pixar Tractor** —
Stüdyo farm. **Qube!** — Pipeline render manager.

---

## Sprint 35: Review/Approval Workflow

### Hedef
Asset'in review cycle'ı; yorum, annotation, version compare, approve/reject.

### Çıktılar
- `/src/review/ReviewSession.ts` — Toplu inceleme oturumu.
- `/src/review/Annotation.ts` — 3D sahne üzerine çizim.
- `/src/review/CompareVersions.ts` — Side-by-side veya wipe slider.
- `/src/review/ApprovalChain.ts` — Multi-level approve (artist → lead → director).
- `/src/review/CommentThread.ts` — Frame-pinned yorum.
- `/src/review/ReviewReport.ts` — PDF export (comment + thumbnail).

### Teknoloji
- WebGL2 overlay (annotation)
- Socket.io (live review)
- jsPDF (report)
- Postgres (state machine)

### Test Kriterleri
- 10 reviewer eşzamanlı.
- Annotation 3D-anchored (perspective ile döner).
- Version wipe slider smooth.
- Approval state machine (artist → lead → director → done).
- Comment frame-pinned (timecode).
- PDF report (thumbnail + comment list).

### AAA Referans
**Autodesk ShotGrid Review** — AAA review tool. **ftrack Studio** — Review
+ approval. **SyncSketch** — Live annotation.

---

## Sprint 36: Plugin System (WASM)

### Hedef
Üçüncü parti geliştiricilerin NEXUS'a plugin yazabilmesi; WASM sandbox,
JS API, plugin marketplace.

### Çıktılar
- `/src/plugin/PluginLoader.ts` — WASM module loader.
- `/src/plugin/PluginSandbox.ts` — Security sandbox (no FS, no network by default).
- `/src/plugin/PluginAPI.ts` — Public API (scene, viewport, asset).
- `/src/plugin/PluginManifest.ts` — package.json manifest (name, version, permissions).
- `/src/plugin/PluginMarketplace.ts` — Browse + install.
- `/src/plugin/PluginDevTool.ts` — Local dev hot-reload.

### Teknoloji
- WebAssembly (WASM)
- Web Workers (sandbox isolation)
- Content Security Policy (CSP)
- ESM modules

### Test Kriterleri
- Plugin yüklenmesi < 1 sn.
- Sandbox escape denemesi (FS/network) blocklanır.
- API stable (semver).
- Hot-reload developer experience.
- Marketplace install tek tık.
- Permission grant (user consent).

### AAA Referans
**Blender Add-on System** — Python plugin standardı. **Unreal Marketplace
Plugin** — Distribution. **Figma Plugin API** — WASM sandbox referansı.

---

## Sprint 37: AI-Assisted Rigging

### Hedef
ML modeli ile otomatik rig önerisi; bone placement, weight paint ön-tahmin.

### Çıktılar
- `/src/ai/AIRigger.ts` — ML model (transformer-based).
- `/src/ai/BonePredictor.ts` — Mesh → bone positions.
- `/src/ai/WeightPredictor.ts` — Mesh + bone → skin weights.
- `/src/ai/RigTemplate.ts` — Humanoid/quadruped şablonları.
- `/src/ai/RigCorrection.ts` — Artist ince ayar UI'ı.
- `/src/ai/ModelRegistry.ts` — ONNX Runtime model loading.

### Teknoloji
- ONNX Runtime Web (WASM/WebGPU)
- PyTorch (training, offline)
- Transformer (mesh → bone)
- PointNet++ (mesh feature)

### Test Kriterleri
- Humanoid mesh → rig < 5 sn.
- Bone placement accuracy > %85.
- Weight paint quality (visual inspection).
- Quadruped desteği (köpek, kedi, at).
- Artist override all steps.
- Model update pipeline (quarterly).

### AAA Referans
**Mixamo Auto-Rigger** — ML rigging öncüsü. **Adobe Substance 3D Modeler** —
AI tooling. **NVIDIA Omniverse AI** — Pro AI pipeline.

---

## Sprint 38: AI-Assisted Animation

### Hedef
Metin veya örnek motion ile animasyon üretimi; in-between keyframe, motion
synthesis, style transfer.

### Çıktılar
- `/src/ai/AIAnimator.ts` — ML model (diffusion / transformer).
- `/src/ai/MotionGenerator.ts` — Text → motion ("karakter koşuyor").
- `/src/ai/Inbetweener.ts` — Keyframe'ler arası otomatik frame.
- `/src/ai/StyleTransfer.ts` — Animasyon stili transferi (capoeira → bale).
- `/src/ai/MotionRetarget.ts` — Otomatik karakter uygunluğu.
- `/src/ai/PromptLibrary.ts` — Hazır prompt kütüphanesi.

### Teknoloji
- ONNX Runtime Web (WebGPU)
- Diffusion model (motion)
- MotionGPT benzeri transformer
- Vector database (semantic search)

### Test Kriterleri
- Text → 5 sn motion < 10 sn inference.
- Inbetween 10 keyframe → 60 frame smooth.
- Style transfer belirgin (motion signature).
- Retarget humanoid rig'ler arası.
- Prompt library (50+ hazır senaryo).
- GPU memory < 4 GB.

### AAA Referans
**NVIDIA Maxine** — AI animation. **Cascadeur** — AI physics-aware animation.
**Kinetix** — Text-to-animation.

---

## Sprint 39: Procedural Generation (Houdini-like)

### Hedef
Node tabanlı prosedürel sahne üretimi; scatter, copy-to-points, attribute
noise, boolean.

### Çıktılar
- `/src/procedural/ProceduralGraph.ts` — DAG data structure.
- `/src/procedural/NodeLibrary.ts` — Geometry, Scatter, Copy, Noise, Boolean.
- `/src/procedural/AttributeSystem.ts` — Custom attribute (per-point).
- `/src/procedural/VEXInterpreter.ts` — VEX-benzeri expression language.
- `/src/procedural/ProceduralCache.ts` — Cook cache (incremental).
- `/src/procedural/HoudiniBridge.ts` — Houdini .hip → NEXUS graph import.

### Teknoloji
- React Flow (graph editor)
- Custom TypeScript (DAG evaluation)
- WebAssembly (VEX interpreter, possible)
- GPGPU (scatter/noise)

### Test Kriterleri
- 100K point scatter real-time.
- Copy-to-points instanced render.
- Attribute noise 3D (Perlin, Worley).
- Boolean union/intersection/subtract.
- Cook cache incremental (only dirty nodes).
- VEX expression evaluation.
- Houdini bridge hip file import (limited).

### AAA Referans
**SideFX Houdini** — Procedural standardı. **Blender Geometry Nodes** — Node
procedural. **Unreal PCG** — Procedural content generation framework.

---

## Sprint 40: Cloud Rendering + Streaming

### Hedef
Bulut GPU instance'larında yüksek kaliteli render + sonucu tarayıcıya stream;
pixel-perfect, düşük latency.

### Çıktılar
- `/src/cloud/CloudRenderClient.ts` — Frontend streaming client.
- `/src/cloud/RenderServer.ts` — Backend (NVIDIA GPU instance).
- `/src/cloud/StreamProtocol.ts` — WebRTC + custom encoding.
- `/src/cloud/AdaptiveBitrate.ts` — Kalite ayarı (network'e göre).
- `/src/cloud/CostTracker.ts` — Kullanıcı başına maliyet.
- `/src/cloud/SessionManager.ts` — Spot instance lifecycle.

### Teknoloji
- WebRTC (low-latency stream)
- NVENC hardware encoding
- NVIDIA CUDA / OptiX (render)
- Kubernetes (GPU node pool)
- AWS g4dn / GCP T4 / Azure NCas T4

### Test Kriterleri
- 1080p 60 fps stream < 50 ms latency.
- 4K stream < 100 ms latency.
- Adaptive bitrate (network dip'te düşer).
- Cost per user-hour hesaplanabilir.
- Session save/resume (stateful).
- Spot instance preemption handling (graceful).

### AAA Referans
**NVIDIA GeForce NOW** — Cloud game streaming. **Parsec** — Remote GPU.
**Quixel Megascans Cloud** — Asset streaming. **Amazon Nimble Studio** —
Cloud render farm.

---

# Genel Başarı Kriterleri (40 Sprint Sonunda)

## Teknik KPI'lar

| KPI | Hedef |
|---|---|
| Viewport 60 fps | 5M triangle (PC Mid) |
| Asset yükleme | 50 MB GLB < 3 sn |
| Sahne boyutu | 1 GB asset, 10K node |
| Multi-user | 10 eşzamanlı kullanıcı |
| Render farm | 100 frame / 10 node |
| AI inference | Motion gen < 10 sn |
| Cloud stream | 1080p < 50 ms |
| Plugin yüklenme | < 1 sn |

## Kullanıcı KPI'ları

| KPI | Hedef |
|---|---|
| Time-to-first-render | < 10 sn (signup → sahne) |
| Asset import success rate | > %95 |
| Learning curve (basic) | < 2 saat |
| Learning curve (advanced) | < 40 saat |
| Artist productivity | Blender'a göre %80 (final) |
| Bug rate (production) | < 5 critical / ay |

## Pipeline Uyumluluk

- glTF 2.0 tüm extension'lar ✓
- USD import + export ✓
- FBX import (export Phase 5+) ✓
- Alembic cache ✓
- OpenVDB volumetric ✓
- PBR metallic-roughness ✓
- Standard naming ✓
- LOD zinciri ✓
- Texel density 1024/2048 px/m ✓

## AAA Stüdyo Benchmarks

| Stüdyo | NEXUS Hedefi |
|---|---|
| Pixar USD pipeline | Composition parity (Sprint 9+) |
| ILM Alembic | Cache pipeline (Sprint 20+) |
| Epic Unreal Engine | RT + Nanite-like (Sprint 21, 30) |
| Unity HDRP | Shader graph parity (Sprint 26) |
| Autodesk Maya | Rig/anim tooling (Sprint 11-20) |
| SideFX Houdini | Procedural (Sprint 39) |
| Substance | PBR material (Sprint 25) |

## Risk & Mitigasyon

| Risk | Olasılık | Mitigasyon |
|---|---|---|
| WebGPU düşük benimseme | Orta | WebGL2 fallback her sprint |
| USD WASM performans | Yüksek | Lazy loading, sample prim |
| AI model doğruluk | Orta | Artist override zorunlu |
| Cloud maliyet kontrolü | Yüksek | Spot instance + cost cap |
| Multi-user CRDT conflict | Düşük | Yjs production-tested |
| Plugin sandbox escape | Düşük | CSP + Worker isolation |
| Render farm scaling | Orta | K8s autoscaling |

## Faz 5+ (Post-40 Sprint) Yol Haritası

Aşağıdaki konular 40 sprint sonrası (sürüm 2.0+) için planlanmıştır:

- VR/AR native edit (Quest, Vision Pro)
- Real-time collaborative VR review
- Generative AI sahne üretimi (text → scene)
- Voxel pipeline (MagicaVoxel benzeri)
- Sculpting tool (ZBrush benzeri)
- Camera tracking (matchmove)
- Stereo 360 render
- Mobile app (iOS/Android companion)

---

## Sonuç

Bu 40 sprintlik yol haritası, NEXUS 3D Studio'yu bir "tarayıcı tabanlı
AAA 3D üretim platformu" konumuna taşımak için gereken tüm teknik
milestone'ları içermektedir. Her sprint:

1. **Net hedef** — Sprint sonunda ne elde edileceği.
2. **Somut çıktılar** — Üretilen dosya/modül listesi.
3. **Belirli teknoloji** — Kullanılan library/framework.
4. **Ölçülebilir test kriterleri** — Acceptance şartları.
5. **AAA referans stüdyo** — Endüstriyel karşılaştırma noktası.

Pipeline her faz sonunda harici bir AAA stüdyo tarafından denetlenir
(audit). Kullanıcı geri bildirimi (closed beta) Faz 2 başından itibaren
toplanır. Production release: Sprint 40 sonrası 2 haftalık stabilization
dönemi ile v1.0 olarak duyurulur.

---

*Bu doküman NEXUS 3D Studio ürün ekibi tarafından canlı yol haritası olarak
kullanılır. Sprint planlama toplantılarında (her pazartesi) gözden geçirilir,
gerektiğinde reprioritize edilir. Tüm değişiklikler `CHANGELOG.md` dosyasına
kayıt altına alınır.*
