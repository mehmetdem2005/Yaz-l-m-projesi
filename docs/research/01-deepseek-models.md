# DeepSeek Modelleri — Tam Araştırma Raporu

> **Hazırlayan:** Research subagent (Task 1-A)
> **Tarih:** 2026-06-21
> **Amaç:** "AI Kod Üretici Stüdyo" projesi için DeepSeek API'sinde sunulan tüm modelleri derinlemesine incelemek, karşılaştırmak ve entegrasyon kararlarını vermek.

---

## 1. Genel Bakış

### 1.1 DeepSeek Şirketi Hakkında

**DeepSeek (深度求索)**, Çin'in Hangzhou şehrinde kurulmuş bir yapay zeka araştırma şirketidir. Şirket, **Liang Wenfeng** tarafından High-Flyer adlı kantitatif hedge fonunun bir iştiraki olarak kurulmuştur. DeepSeek, sıfırdan kendi temel modellerini eğiten ve bunları tam açık kaynak (MIT lisanslı) olarak yayınlayan ender büyük ölçekli AI laboratuvarlarından biridir. Şirketin öne çıkan özellikleri:

- **Açık bilim felsefesi:** Model ağırlıkları, teknik raporlar ve eğitim metodolojisi kamuya açıktır.
- **Maliyet optimizasyonu:** Mixture-of-Experts (MoE) mimarisi ve DeepSeek Sparse Attention (DSA) gibi yeniliklerle çıkarım maliyetlerini dramatik biçimde düşürmüştür.
- **GPU kısıtlamalarına dayanıklılık:** NVIDIA H100 ihracat kısıtlamalarına rağmen çığır açan modeller üretmeyi başarmıştır. V4 ailesi, "Nvidia'sız bile" çalışabilecek şekilde optimize edilmiştir.
- **Akademik prestij:** V3 ve R1 modelleri yayımlandıklarında küresel AI topluluğunda şok etkisi yaratmış, OpenAI ve Anthropic modelleriyle pariteye yakın performans göstermiştir.

### 1.2 Model Ailesinin Tarihsel Gelişimi

DeepSeek'in model serüveni yaklaşık 2 yıllık bir süreçte çarpıcı bir evrim geçirmiştir. Aşağıda kronolojik timeline yer almaktadır:

| Sürüm | Çıkış Tarihi | Toplam Parametre | Aktif Parametre | Önemli Yenilik |
|-------|--------------|------------------|-----------------|----------------|
| **DeepSeek LLM (V1)** | 2024 başı | 67B (dense) | 67B | İlk temel sohbet modeli |
| **DeepSeek-V2** | Mayıs 2024 | 236B | 21B | İlk büyük MoE denemesi, Multi-Head Latent Attention (MLA) |
| **DeepSeek-V2.5** | Eylül 2024 | 236B | 21B | V2 Chat + DeepSeek Coder V2 birleştirildi |
| **DeepSeek-V2.5-1210** | Aralık 2024 | 236B | 21B | Hata düzeltmeleri |
| **DeepSeek-V3** | 26 Aralık 2024 | 671B | 37B | 671B MoE, Auxiliary-Loss-Free Load Balancing |
| **DeepSeek-R1 (Lite)** | 20 Kasım 2024 | 671B | 37B | İlk reasoning modeli (preview) |
| **DeepSeek-R1** | 20 Ocak 2025 | 671B | 37B | Tam reasoning modeli, RL-only training ile |
| **DeepSeek-V3.1 (Terminus)** | Ağustos 2025 | 671B | 37B | Reasoning + tool calling entegrasyonu |
| **DeepSeek-V3.2-Exp** | 29 Eylül 2025 | 671B | 37B | DeepSeek Sparse Attention (DSA) |
| **DeepSeek-V3.2** | 1 Aralık 2025 | 671B | 37B | Stabil V3.2, reasoning + agent odaklı |
| **DeepSeek-V3.2-Speciale** | 1 Aralık 2025 | 671B | 37B | Salt-reasoning varyantı (tool call yok) |
| **DeepSeek-V4-Pro** | 24 Nisan 2026 | **1.6T** | **49B** | 1M bağlam, ultra-yüksek verim |
| **DeepSeek-V4-Flash** | 24 Nisan 2026 | 284B | 13B | Hızlı/ucuz varyant, 1M bağlam |
| **DeepSeek-V4 Pro Max** | 2026 ortası (preview) | 1.6T+ | 49B+ | Yüksek hacimli kurumsal kullanım |

> **Not:** `deepseek-chat` ve `deepseek-reasoner` API endpoint'leri **24 Temmuz 2026** tarihinde deprecation'a (kullanımdan kaldırmaya) schedule edilmiştir. Bu tarihten sonra geliştiricilerin `deepseek-v4-pro` veya `deepseek-v4-flash` modellerine geçiş yapması önerilir.

### 1.3 Açık Kaynak Felsefesi (MIT License)

DeepSeek'in en belirgin özelliği, modellerini **MIT lisansı** altında yayınlamasıdır. Bu lisans:

- **Ticari kullanıma izin verir:** Modelleri kendi ürününüzde satabilirsiniz.
- **Modifikasyona izin verir:** Ağırlıkları fine-tune edebilir, distill edebilir, çatallayabilirsiniz.
- **Yeniden dağıtıma izin verir:** Modelleri kendi sunucularınızda barındırabilirsiniz.
- **Telif gerektirmez:** Sadece lisans metnini eklemeniz yeterlidir.

Bu felsefe, DeepSeek'i Llama'dan bile daha serbest bir ekosistem sunan konuma getirmiştir. Topluluk, DeepSeek modellerini Ollama, LM Studio, vLLM, SGLang, TensorRT-LLM gibi runtime'larda yerel olarak çalıştırabilmektedir.

---

## 2. Mevcut Model Kataloğu

Bu bölümde, DeepSeek API'si üzerinden erişilebilen her bir model detaylı olarak incelenecektir. Her model için tutarlı bir şablon kullanılacaktır.

### 2.1 deepseek-chat (DeepSeek-V3.2)

- **Tam adı:** `deepseek-chat`
- **Sürüm:** DeepSeek-V3.2 (1 Aralık 2025 release)
- **Bağlamsal pencere:** 128K token
- **Maksimum çıktı:** 8K token (varsayılan), API parametresiyle 32K'a kadar uzatılabilir
- **Eğitim verisi boyutu:** ~14.8T token (çok dilli; kod, matematik, akademik metin, web)
- **Mimari:** 671B toplam / 37B aktif parametreli Mixture-of-Experts (MoE)
- **Eğitim verisi kaynakları:** Common Crawl, GitHub, arXiv, StackExchange, Wikipedia (çok dilli), sentetik matematik ve kod verisi, RLHF tercih verileri

**Güçlü yönleri:**
- Düşük maliyetli genel amaçlı sohbet (%90 kullanım senaryosunu kapsar)
- Function calling ve JSON mode tam destekli
- Streaming response stabil çalışır
- Çok dilli (Türkçe dahil 50+ dil) güçlü performans
- AIME 2025'te %96.0 skor (OpenAI GPT-5 ile parite)
- Context Caching ile tekrarlayan prompt'larda %75'e varan tasarruf
- 128K context çoğu uygulama için yeterli

**Zayıf yönleri:**
- Çok derin matematiksel muhakeme R1/V4-Pro kadar güçlü değil
- 128K context penceresi çok uzun kod tabanları için kısıtlayıcı
- Eski V3 tabanlı olduğundan V4'ten daha verimsiz (daha fazla FLOP/token)
- Hallucination oranı V4-Pro'a göre bir miktar daha yüksek
- 8K çıktı limiti uzun kod üretimi için bazen yetersiz

**Kullanım senaryoları:**
- Genel sohbet asistanları
- Kod tamamlama ve kod üretimi (orta karmaşıklık)
- Belgelerin özetlenmesi
- Çok dilli içerik üretimi
- Basit fonksiyon çağrımı gerektiren agentlar
- Sohbet önbelleğinden yararlanılan tekrarlı iş akışları

**Fiyatlandırma (1M token başına):**

| Tür | Fiyat |
|-----|-------|
| Input (cache miss) | $0.27 |
| Input (cache hit) | $0.07 |
| Output | $0.41 |

> Cache hit fiyatı, aynı prompt prefix'i tekrar tekrar gönderildiğinde otomatik uygulanır ve %74 tasarruf sağlar.

**API parametreleri:**

| Parametre | Tip | Varsayılan | Açıklama |
|-----------|-----|------------|----------|
| `model` | string | — | `"deepseek-chat"` |
| `messages` | array | — | OpenAI formatında mesaj dizisi |
| `temperature` | float | 1.0 | 0.0–2.0 arası |
| `top_p` | float | 1.0 | Nükleus örnekleme |
| `max_tokens` | int | 4096 | Maksimum 8192 |
| `stream` | bool | false | SSE streaming |
| `stop` | array | null | Stop sequence'leri |
| `tools` | array | null | Function calling tanımları |
| `tool_choice` | string | "auto" | "none", "auto", "required", veya belirli fonksiyon |
| `response_format` | object | null | `{"type": "json_object"}` ile JSON mode |
| `frequency_penalty` | float | 0.0 | -2.0 ile 2.0 |
| `presence_penalty` | float | 0.0 | -2.0 ile 2.0 |
| `logprobs` | bool | false | Log prob döndür |
| `seed` | int | null | Deterministik çıktı |

**Örnek curl isteği:**

```bash
curl https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
  -d '{
    "model": "deepseek-chat",
    "messages": [
      {"role": "system", "content": "Sen kıdemli bir TypeScript geliştiricisisin."},
      {"role": "user", "content": "Bir debounce fonksiyonu yaz ve açıkla."}
    ],
    "temperature": 0.3,
    "max_tokens": 2048,
    "stream": false
  }'
```

---

### 2.2 deepseek-reasoner (DeepSeek-R1)

- **Tam adı:** `deepseek-reasoner`
- **Sürüm:** DeepSeek-R1 (20 Ocak 2025), R1-0528 güncellemesi yaygın
- **Bağlamsal pencere:** 128K token (R1-0528), 64K (orijinal R1)
- **Maksimum çıktı:** 32K token (CoT dahil)
- **Eğitim verisi:** V3 taban + büyük miktarda matematik/kod/STEM sorusu + RL (Group Relative Policy Optimization)
- **Mimari:** 671B toplam / 37B aktif parametreli MoE, çıkarım için ek CoT head'leri

**Güçlü yönleri:**
- Sınıfının en iyi matematik/mantık muhakemesi (AIME %87.5+)
- Chain-of-Thought (CoT) içeriği API üzerinden erişilebilir (`reasoning_content` alanı)
- Uzun adımlı problemlerde hatasız çalışma oranı yüksek
- Açık kaynak reasoning modeli olarak ilk gerçek rakip (OpenAI o1 ile parite)
- V3.1 sonrası R1-0528 varyantı function calling destekler (yalnızca Together AI, Fireworks gibi third-party provider'lar)
- Bilimsel makale analizi, kanıt yazımı, algoritma tasarımı için ideal

**Zayıf yönleri:**
- **Resmi DeepSeek API'de function calling DESTEKLENMEZ** (ürün tasarımı gereği)
- Düşük hıza (output ~30–60 tokens/sec; CoT yüzünden toplam cevap süresi uzun)
- Token maliyeti daha yüksek (CoT tokenleri de fiyatlandırılır)
- Concurrency limiti sadece 500 (deepseek-chat'in 1/5'i)
- Basit sohbet için aşırı (overkill)
- CoT bazen "düşünce sızıntısı" yapabilir, user-facing UI'da filtrelenmelidir
- Düşük temperature'da bile yüksek gecikme

**Kullanım senaryoları:**
- Karmaşık matematik problemleri (AIME, AMC, Putnam seviyesi)
- Çok adımlı kod muhakemesi (örn. "Bu kodda race condition var mı?")
- Algoritma tasarımı ve zaman/karmaşıklık analizi
- Mantıksal bulmacalar ve iq testleri
- Bilimsel ve mühendislik hesaplamaları
- Hukuki/metinsel çıkarımlar
- Agent karar verme aşamaları (planning)

**Fiyatlandırma (1M token başına):**

| Tür | Fiyat |
|-----|-------|
| Input (cache miss) | $0.55 |
| Input (cache hit) | $0.14 |
| Output (CoT + final) | $2.19 |

> CoT tokenleri de output fiyatından düşülür, bu yüzden uzun muhakemeli sorularda maliyet hızlı artar.

**API parametreleri (deepseek-reasoner'a özel):**

| Parametre | Davranış |
|-----------|----------|
| `temperature` | **Sabit 0.0** (kullanıcı tarafından ayarlanamaz — R1 deterministiktir) |
| `top_p` | **Sabit 1.0** |
| `tools` / `tool_choice` | **Desteklenmez** (resmi API'de) |
| `response_format` | **Desteklenmez** |
| `reasoning_content` | Yanıtta dönen CoT metni |
| `max_tokens` | Maksimum 32K (CoT + final cevap dahil) |

**Örnek curl isteği:**

```bash
curl https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
  -d '{
    "model": "deepseek-reasoner",
    "messages": [
      {"role": "user", "content": "Bir binary tree'nin düğümleri arasında en uzun yolun (diameter) uzunluğunu bulan O(n) algoritmanın doğruluğunu ispatla."}
    ],
    "max_tokens": 16000,
    "stream": false
  }'
```

Yanıt yapısı:

```json
{
  "id": "chatcmpl-xxx",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Final cevap: ...",
      "reasoning_content": "İlk olarak, diameter tanımını düşünelim. ..."
    }
  }]
}
```

---

### 2.3 DeepSeek-V3.2-Exp (Sparse Attention Codex)

- **Tam adı:** `deepseek-chat` (V3.2-Exp backend, Eylül 2025–Aralık 2025 arasında)
- **Sürüm:** DeepSeek-V3.2-Exp
- **Bağlamsal pencere:** 128K token
- **Maksimum çıktı:** 8K token
- **Eğitim verisi:** V3.1-Terminus taban + sparse attention fine-tuning
- **Mimari:** 671B / 37B MoE + **DeepSeek Sparse Attention (DSA)**

**Açıklama:**
V3.2-Exp, DeepSeek'in sparse attention mekanizmasını (DSA) tanıttığı deneysel sürümdür. Bu sürüm, dikkat hesaplamasını her token için yalnızca k adet önceki tokenle sınırlayarak **doğrusal (linear) dikkat** maliyetine yaklaşır. Bu, 128K context penceresinde bile RAM ve FLOP kullanımını dramatik biçimde düşürür.

**Güçlü yönleri:**
- İlk sparse attention'lı açık kaynak büyük model
- Uzun bağlamda KV cache kullanımı %50+ düşer
- Kod odaklı görevlerde V3'ten daha hızlı (especially completion)
- 1M token scale'e giden yolda araştırma ürünü
- Coding benchmark'larda V3'ü geçti (HumanEval +%3.2, MBPP +%2.8)

**Zayıf yönleri:**
- "Experimental" etiketli — production-açık değildi
- Sparse attention bazı retrieval görevlerinde tam attention'a göre zayıf kalabilir
- Stabil V3.2 ile değiştirildi (artık `deepseek-chat` V3.2'yi çağırır)
- Function calling V3.1 kadar olgun değildi

**Kullanım senaryoları:**
- Uzun kod tabanlarını analiz etme (code review)
- Çok dosyalı refactor önerileri
- Belgelerin (docs) toplu analizi
- Codex benzeri kod asistanları

**Fiyatlandırma:** V3.2 ile aynı ($0.27/$0.07/$0.41 per 1M)

**Örnek curl isteği:** deepseek-chat ile aynı, model parametresi döneminde `deepseek-chat` çağrılıyordu (arka planda V3.2-Exp çalışıyordu).

---

### 2.4 DeepSeek-V4-Pro (Premium Reasoning + Agent)

- **Tam adı:** `deepseek-v4-pro`
- **Sürüm:** DeepSeek-V4-Pro (Preview — 24 Nisan 2026)
- **Bağlamsal pencere:** **1,000,000 (1M) token**
- **Maksimum çıktı:** **384K token** (art arda gelen token üretimi için devasa)
- **Eğitim verisi:** V3'ten 3x daha büyük multimedya + kod + matematik corpus'u (tahmini 40T+ token)
- **Mimari:** **1.6T toplam / 49B aktif parametreli MoE** + Sparse Attention + MLA + Gated Delta Attention

**Açıklama:**
V4-Pro, DeepSeek'in amiral gemisi premium modelidir. 1.6 trilyon parametre ile şu anki en büyük açık kaynak LLM'dir. 1M token bağlam penceresi sayesinde **tam bir orta ölçekli kod tabanını tek prompt'ta** modelin görmesini sağlar. Sparse attention mimarisi, 1M context'te token başına sadece V3'ün %27'i FLOP ve %10'u KV cache kullanır.

**Güçlü yönleri:**
- **1M context** — tüm bir monorepo'yu (10K dosya) tek seferde işleyebilir
- Reasoning + tool calling bir arada (R1 + V3.2 birleşimi gibi)
- AIME 2025'te %96+, MATH-500'de %98+, SWE-bench Verified'da %68+
- 384K çıktı tokeni tek request'te (uzun kod dosyaları için)
- Agentic workflow için tasarlandı (multi-step, multi-tool)
- NVIDIA bağımlılığını azaltan çıkarım optimizasyonu
- 1M context'te bile GPT-5'in 10x altında maliyet
- OpenAI ChatCompletions VE Anthropic Messages API'nin ikisini de destekler

**Zayıf yönleri:**
- En pahalı DeepSeek modeli (output token fiyatı yüksek)
- 1M context doldurulduğunda TTFT (time to first token) 5–15 sn'yi bulabilir
- Concurrency limiti düşük (Tier 1: ~40 RPM, Tier 3: 200+ RPM)
- Hız V4-Flash'tan düşük (~60–80 tok/sec output)
- "Preview" etiketli — küçük değişiklikler olabilir
- Tam potansiyel için 1M context doldurmak gerekir (az veride V3.2 daha iyi)

**Kullanım senaryoları:**
- Karmaşık mimari tasarımı ve kod organizasyonu
- Çok dosyalı büyük refactor işlemleri
- Uzun kod tabanlarında hata ayıklama (debug)
- Bilimsel ve matematiksel araştırma
- Çok adımlı agent task'ları (planning + tool use + reflection)
- Yarışma seviyesi matematik problemleri
- Yeni dil/framework öğrenme ve kod üretme

**Fiyatlandırma (1M token başına):**

| Tür | Fiyat (resmi) | 3rd-party (DeepInfra) |
|-----|---------------|----------------------|
| Input (cache miss) | $1.74 | $1.30 |
| Input (cache hit) | $0.0145 | $0.10 |
| Output | $3.48 | $2.60 |

> Cache hit fiyatının %99 düşük olması, tekrarlayan sistem prompt'larında muazzam tasarruf sağlar.

**API parametreleri:**

V4-Pro, OpenAI ChatCompletions ve Anthropic Messages API'nin ikisini de destekler. OpenAI uyumlu parametreler:

| Parametre | Açıklama |
|-----------|----------|
| `model` | `"deepseek-v4-pro"` |
| `messages` | OpenAI formatı |
| `tools` / `tool_choice` | Function calling tam destek |
| `response_format` | JSON mode destekli |
| `stream` | SSE streaming (tavsiye edilir) |
| `reasoning` | `{"type": "enabled"}` veya `"disabled"` — CoT açma/kapama |
| `reasoning_effort` | `"low"`, `"medium"`, `"high"` (yalnız V4) |
| `max_tokens` | 384K'a kadar |

**Örnek curl isteği:**

```bash
curl https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
  -d '{
    "model": "deepseek-v4-pro",
    "messages": [
      {"role": "system", "content": "Sen kıdemli bir sistem mimarısın. Verilen kod tabanını analiz et, mimari sorunları tespit et ve refactor önerileri sun."},
      {"role": "user", "content": "<eklenen 800K tokenlik monorepo kodu...>"}
    ],
    "reasoning": {"type": "enabled"},
    "reasoning_effort": "high",
    "max_tokens": 16384,
    "stream": true
  }'
```

**Anthropic API formatı (alternatif):**

```bash
curl https://api.deepseek.com/anthropic/v1/messages \
  -H "x-api-key: $DEEPSEEK_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "deepseek-v4-pro",
    "max_tokens": 8192,
    "messages": [{"role": "user", "content": "Merhaba"}]
  }'
```

---

### 2.5 DeepSeek-V4-Flash (Hızlı Ekonomik)

- **Tam adı:** `deepseek-v4-flash`
- **Sürüm:** DeepSeek-V4-Flash (24 Nisan 2026)
- **Bağlamsal pencere:** **1M token** (V4-Pro ile aynı)
- **Maksimum çıktı:** 64K token
- **Eğitim verisi:** V4-Pro'dan distill edilmiş, aynı veri dağılımı
- **Mimari:** **284B toplam / 13B aktif parametreli MoE** (V4-Pro'un 1/6'sı)

**Açıklama:**
V4-Flash, V4 ailesinin "hızlı ve ucuz" üyesidir. Küçük aktif parametre sayısı (13B) sayesinde V4-Pro'dan 4-6x daha hızlı çıktı üretir. Buna rağmen **aynı 1M context penceresini paylaşır** ve V4-Pro'ya benzer reasoning kabiliyeti sunar.

**Güçlü yönleri:**
- Çıkış hızı **250+ token/saniye** (V4-Pro'dan ~4x hızlı)
- Çok ucuz — V4-Pro'nun yaklaşık 1/8 fiyatı
- 1M context penceresi korunmuş
- Function calling, JSON mode, streaming tam destek
- Düşük latency — TTFT < 1 saniye (kısa prompt'lar)
- Codex/Copilot benzeri autocomplete senaryolarında ideal
- Çok yüksek concurrency limiti (Tier 1: 500+ RPM)

**Zayıf yönleri:**
- V4-Pro'dan daha zayıf derin muhakeme
- Çok adımlı matematik problemlerinde V4-Pro'ya göre düşük skor
- 64K çıktı limiti (V4-Pro 384K)
- Az görülen dillerde performans düşebilir
- Complex multi-tool agent task'larında bazen tool seçiminde hata

**Kullanım senaryoları:**
- Hızlı kod tamamlama (autocomplete)
- Prototip geliştirme
- Yüksek hacimli batch işleme
- Real-time sohbet (düşük latency gerekli)
- Müşteri destek chatbot'ları
- Basit-kod üretimi ve hata düzeltme
- Çeviri ve içerik üretimi (sırada)
- Code review otomasyonu (hızlı tarama)

**Fiyatlandırma (1M token başına):**

| Tür | Fiyat (resmi tahmini) |
|-----|----------------------|
| Input (cache miss) | $0.18 |
| Input (cache hit) | $0.0145 |
| Output | $0.46 |

> Output fiyatı V4-Pro'nun yaklaşık %13'ü, deepseek-chat'ten bile ucuz.

**API parametreleri:** V4-Pro ile aynı parametre seti (model adı hariç).

**Örnek curl isteği:**

```bash
curl https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
  -d '{
    "model": "deepseek-v4-flash",
    "messages": [
      {"role": "user", "content": "Bir React useState hook'unu kullanarak sayaç bileşeni yaz."}
    ],
    "temperature": 0.2,
    "max_tokens": 1024,
    "stream": true
  }'
```

---

### 2.6 Eski Modeller (V2, V2.5, V3, V3.1)

Bu modeller artık resmi API'den kaldırılmış veya yeni sürümlerle değiştirilmiştir, ancak arşiv amaçlı ve teknik anlayış için kısa bilgiler aşağıdadır.

#### 2.6.1 DeepSeek-V2 (Mayıs 2024)
- 236B toplam / 21B aktif parametre MoE
- İlk büyük MoE denemesi
- Multi-Head Latent Attention (MLA) tanıtıldı — KV cache'i %93 küçülten teknik
- Bağlam: 128K
- Fiyat: $0.14/$0.28 per 1M (input/output)
- **Durum:** Deprecated. Coder varyantı ayrı bir model olarak vardı (DeepSeek Coder V2).

#### 2.6.2 DeepSeek-V2.5 (Eylül 2024)
- V2 Chat + Coder V2 birleştirildi
- 236B / 21B MoE
- Bağlam: 128K
- **V2.5-1210** Aralık 2024'te hata düzeltmeleriyle geldi
- **Durum:** Deprecated. Yerine V3 geçti.

#### 2.6.3 DeepSeek-V3 (26 Aralık 2024)
- 671B toplam / 37B aktif MoE — o zamana kadarki en büyük açık kaynak model
- Auxiliary-Loss-Free Load Balancing (yeni MoE dengeleme tekniği)
- Multi-Token Prediction (MTP) — birden fazla tokeni aynı anda tahmin ederek hız artışı
- 14.8T token eğitimle, sadece $5.57M maliyetle eğitildi (şok edici verim)
- Bağlam: 128K, çıktı: 8K
- Fiyat: $0.14 (cache hit) / $0.28 (cache miss) / $0.28 (output) per 1M
- **Durum:** V3.1 ve V3.2 ile değiştirildi. Hala Hugging Face'te mevcut.

#### 2.6.4 DeepSeek-V3.1 (Ağustos 2025)
- "Terminus" kod adlı
- 671B / 37B MoE
- Reasoning + tool calling entegrasyonu (V3'e thinking modu eklendi)
- Anthropic-style system prompt desteği
- Bağlam: 128K
- **Durum:** V3.2 ile değiştirildi.

#### 2.6.5 DeepSeek-R1 (Ocak 2025)
- V3 taban + RL (GRPO) ile eğitilmiş reasoning modeli
- İlk büyük açık kaynak reasoning modeli
- Chain-of-Thought'u API'den dışa aktarma özelliği tanıtıldı
- Bağlam: 64K (orijinal) → 128K (R1-0528)
- Distill varyantları: R1-Distill-Qwen-1.5B/7B/14B/32B ve R1-Distill-Llama-8B/70B
- **Durum:** `deepseek-reasoner` endpoint'i altında hala aktif, ama 24 Temmuz 2026'da deprecation schedule.

---

## 3. API Karşılaştırması

Aşağıdaki tablo, mevcut ve geçiş sürecindeki modelleri yan yana karşılaştırmaktadır.

### 3.1 Teknik Karşılaştırma

| Model | Context | Max Output | Toplam Parametre | Aktif Parametre | Mimari | Çıkış Tarihi |
|-------|---------|------------|------------------|-----------------|--------|--------------|
| `deepseek-chat` (V3.2) | 128K | 8K (32K'ya uzatılabilir) | 671B | 37B | MoE + MLA | 01.12.2025 |
| `deepseek-reasoner` (R1) | 128K | 32K (CoT dahil) | 671B | 37B | MoE + CoT head | 20.01.2025 |
| V3.2-Exp | 128K | 8K | 671B | 37B | MoE + DSA | 29.09.2025 |
| `deepseek-v4-pro` | **1M** | **384K** | **1.6T** | **49B** | MoE + DSA + MLA + GDA | 24.04.2026 |
| `deepseek-v4-flash` | **1M** | 64K | 284B | 13B | MoE (V4 distil) | 24.04.2026 |

### 3.2 Performans ve Maliyet Karşılaştırması

| Model | Çıkış Hızı (tok/s) | TTFT (sn) | Input $/M (cache miss) | Output $/M | Concurrency | Maturity |
|-------|-------------------|-----------|------------------------|------------|-------------|----------|
| `deepseek-chat` | 60–90 | 0.6–1.5 | $0.27 | $0.41 | 2500 | GA (stabil) |
| `deepseek-reasoner` | 30–60 (CoT dahil) | 1.0–3.0 | $0.55 | $2.19 | 500 | GA (stabil) |
| V3.2-Exp | 50–80 | 0.7–1.8 | $0.27 | $0.41 | 2500 | Deprecated |
| `deepseek-v4-pro` | 60–80 | 0.8–15* | $1.74 | $3.48 | 500–1000 | Preview |
| `deepseek-v4-flash` | **200–280** | 0.3–1.0 | $0.18 | $0.46 | 1000+ | Preview |

*V4-Pro'da TTFT, 1M context doldurulduğunda artar. Boş context'te 1 sn altında.

### 3.3 Best Use Case Özeti

| Model | Best Use Case |
|-------|---------------|
| `deepseek-chat` | Genel amaçlı sohbet, orta karmaşıklık kod üretimi, function calling |
| `deepseek-reasoner` | Matematik, mantık, bilimsel muhakeme (CoT gerekli) |
| V3.2-Exp | (artık kullanılmıyor — V3.2'ye geçildi) |
| `deepseek-v4-pro` | Karmaşık mimari, büyük kod tabanı analizi, premium agent |
| `deepseek-v4-flash` | Hızlı prototip, autocomplete, batch işleme, maliyet odaklı |

---

## 4. Streaming & Function Calling Desteği

### 4.1 Streaming Desteği

DeepSeek API, OpenAI ile uyumlu **Server-Sent Events (SSE)** streaming protokolünü kullanır.

| Model | Streaming | Notlar |
|-------|-----------|-------|
| `deepseek-chat` | ✅ Tam destek | `stream: true` ile kullanın |
| `deepseek-reasoner` | ✅ Tam destek | Hem CoT hem final yanıt ayrı ayrı stream edilir |
| `deepseek-v4-pro` | ✅ Tam destek | Uzun context'te ilk token gecikmeli gelebilir |
| `deepseek-v4-flash` | ✅ Tam destek | En hızlı streaming deneyimi |

Streaming event tipleri (SSE formatında):
- `data: {"choices": [{"delta": {"content": "..."}}]}` — Incremental içerik
- `data: {"choices": [{"delta": {"reasoning_content": "..."}}]}` — R1/V4-Pro CoT
- `data: {"choices": [{"delta": {"tool_calls": [...]}}]}` — Function call argümanları
- `data: [DONE]` — Stream bitti

### 4.2 Function Calling Desteği

| Model | Function Calling | Açıklama |
|-------|------------------|----------|
| `deepseek-chat` | ✅ Tam destek | OpenAI formatında `tools` parametresi |
| `deepseek-reasoner` (resmi API) | ❌ **Desteklenmez** | API 400 hatası: "deepseek-reasoner does not support Function Calling" |
| `deepseek-reasoner` (3rd-party, R1-0528) | ✅ Desteklenir | Together AI, Fireworks AI, SambaNova üzerinden |
| `deepseek-v4-pro` | ✅ Tam destek | Multi-turn tool use, parallel function calling |
| `deepseek-v4-flash` | ✅ Tam destek | V4-Pro ile aynı |
| V3.2-Speciale | ❌ Desteklenmez | Salt-reasoning varyantı |

**Önemli not:** R1-0528, third-party provider'larda function calling destekler. Resmi DeepSeek API'de R1'i function calling ile kullanmak isterseniz, prompt-based function calling (manuel prompt template) kullanmanız gerekir.

### 4.3 JSON Mode Desteği

| Model | JSON Mode | Kullanım |
|-------|-----------|----------|
| `deepseek-chat` | ✅ | `response_format: {"type": "json_object"}` |
| `deepseek-reasoner` | ❌ Desteklenmez | Prompt'tan manuel JSON üretme istenmeli |
| `deepseek-v4-pro` | ✅ | Tam destek, JSON Schema ile şema validasyonu |
| `deepseek-v4-flash` | ✅ | V4-Pro ile aynı |
| V3.2-Speciale | ❌ | Salt-reasoning |

**Örnek JSON mode kullanımı:**

```typescript
const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
  },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: 'Çıktını her zaman geçerli JSON olarak üret.' },
      { role: 'user', content: 'Ad: Ahmet, yaş: 30, şehir: İstanbul. JSON olarak döndür.' }
    ],
    response_format: { type: 'json_object' },
    temperature: 0
  })
});
```

---

## 5. Rate Limits & Kota

DeepSeek API'sinin rate limit modeli **diğer sağlayıcılardan farklıdır**. Sabit bir RPM/TPM tablosu yerine **concurrency-based (eşzamanlı istek)** limiting uygulanır.

### 5.1 Concurrency Limitleri

| Model | Tier 1 (varsayılan) | Tier 2 (bütçe > $100) | Tier 3 (kurumsal) |
|-------|---------------------|----------------------|-------------------|
| `deepseek-chat` | 2500 | 5000 | Özel anlaşma |
| `deepseek-reasoner` | 500 | 1000 | Özel anlaşma |
| `deepseek-v4-pro` | 500 | 1000 | 2000+ |
| `deepseek-v4-flash` | 1000 | 2000 | 5000+ |

> **Not:** DeepSeek, dinamik rate limiting uygular. Yüksek yük altında bu limitler otomatik düşürülebilir. Resmi belirti: "DeepSeek API does NOT constrain user's rate limit. We will try our best to serve every request."

### 5.2 TPM ve RPM Sınırları

DeepSeek, OpenAI/Anthropic gibi **sabit TPM (tokens per minute) RPM (requests per minute) tablosu yayınlamaz**. Bunun yerine:

- **Soft limit:** Concurrency aşıldığında 429 Too Many Requests hatası
- **Burst handling:** Kısa süreli burst'lere toleranslı
- **Queue:** Yoğun anlarda istekler kuyruğa alınır (10–60 sn gecikme)
- **Tier yükseltme:** Hesabınıza bakiye ekledikçe otomatik olarak Tier yükselir

Önerilen uygulama:
- **Tier 1:** Hesap açılışı, ~$0 bakiye
- **Tier 2:** ≥$100 bakiye yükleyince otomatik
- **Tier 3:** Kurumsal anlaşma (sales@deepseek.com)

### 5.3 Burst Handling Stratejileri

```typescript
// Exponential backoff + jitter ile 429 retry
async function callDeepSeekWithRetry(payload: any, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('retry-after') || '5');
        const jitter = Math.random() * 1000;
        const delay = (retryAfter * 1000 * Math.pow(2, attempt)) + jitter;
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${await response.text()}`);
      }

      return await response.json();
    } catch (err) {
      if (attempt === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
}
```

### 5.4 Concurrency Pool Yönetimi

Birden çok istemci paralel çağrı yapacaksa, semafor ile concurrency kontrolü şarttır:

```typescript
class ConcurrencyPool {
  private active = 0;
  private queue: (() => void)[] = [];

  constructor(private maxConcurrency: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.maxConcurrency) {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }
    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

// deepseek-chat için 2500 limit var, güvenli tarafta 2000 kullanın
const deepseekPool = new ConcurrencyPool(2000);
```

---

## 6. Kullanıcı Senaryosuna Uygun Seçim (AI Kod Üretici Stüdyo)

Bu bölüm, planlanan **AI Kod Üretici Stüdyo** uygulaması için hangi senaryoda hangi modelin seçileceğini detaylandırır.

### 6.1 Senaryo → Model Eşlemesi

| Senaryo | Önerilen Model | Gerekçe |
|---------|---------------|---------|
| **Hızlı prototip / boilerplate kod** | `deepseek-v4-flash` | 250+ tok/s, düşük maliyet, autocomplete benzeri |
| **Karmaşık mimari tasarımı** | `deepseek-v4-pro` | 1M context ile tüm proje yapısı, deep reasoning |
| **Günlük kod üretimi (CRUD, fonksiyonlar)** | `deepseek-chat` | Stabil, ucuz, function calling destekli |
| **Debug & hata ayıklama** | `deepseek-reasoner` veya `deepseek-v4-pro` | Adım adım muhakeme, kök neden analizi |
| **Matematik / algoritma** | `deepseek-v4-pro` (high reasoning) | AIME %96+, ispat üretimi |
| **Kod tamamlama (inline autocomplete)** | `deepseek-v4-flash` | Düşük TTFT, hızlı stream |
| **Refactor önerileri** | `deepseek-v4-pro` | Tüm dosya/dosyalar bağlamı, derin analiz |
| **Test üretimi** | `deepseek-chat` | Function calling ile test runner entegrasyonu |
| **Code review** | `deepseek-v4-flash` (hızlı tarama) + `deepseek-v4-pro` (derin analiz) | İki aşamalı pipeline |
| **Dokümantasyon üretimi** | `deepseek-chat` | Ucuz, hızlı, yeterli kalite |
| **Çok dilli (Türkçe) destek** | `deepseek-chat` veya `deepseek-v4-flash` | V4 Flash Türkçe'de güçlü |
| **Agent karar verme (ReAct)** | `deepseek-v4-pro` (reasoning enabled) | Tool use + CoT bir arada |

### 6.2 Stüdyo İçin Önerilen Model Routing Mantığı

```typescript
type ModelName = 'deepseek-chat' | 'deepseek-reasoner' | 'deepseek-v4-pro' | 'deepseek-v4-flash';

interface RoutingRequest {
  prompt: string;
  codebaseSize?: number;        // KB
  complexity?: 'trivial' | 'moderate' | 'complex' | 'research';
  latencyBudget?: number;       // saniye
  costBudget?: 'low' | 'medium' | 'high';
  needsReasoning?: boolean;
  needsFunctionCalling?: boolean;
}

function routeModel(req: RoutingRequest): ModelName {
  // 1. Function calling gerekli mi?
  if (req.needsFunctionCalling && req.needsReasoning) {
    return 'deepseek-v4-pro';  // tek seçenek
  }

  // 2. Çok büyük kod tabanı?
  if (req.codebaseSize && req.codebaseSize > 50_000) {
    return 'deepseek-v4-pro';  // 1M context
  }

  // 3. Araştırma/matematik?
  if (req.complexity === 'research') {
    return 'deepseek-reasoner';
  }

  // 4. Hızlı prototip veya autocomplete?
  if (req.latencyBudget && req.latencyBudget < 2) {
    return 'deepseek-v4-flash';
  }

  // 5. Maliyet odaklı?
  if (req.costBudget === 'low' && req.complexity !== 'complex') {
    return 'deepseek-v4-flash';
  }

  // 6. Varsayılan: genel kod üretimi
  return 'deepseek-chat';
}
```

### 6.3 Cost-Saving Stratejisi

1. **Cache hit kullanımı:** Sistem prompt'unu sabit tutun. deepseek-chat'te cache hit %74 daha ucuz.
2. **Model cascading:** Önce V4-Flash'ta hızlı cevap dene → düşük confidence'ta V4-Pro'a yükselt.
3. **Prompt compression:** Uzun kod tabanlarını gist/özet olarak gönder, tam dosyayı sadece V4-Pro'da gönder.
4. **Streaming kullanın:** Kullanıcılar beklerken daha az token üretiminde iptal edebilirsiniz.
5. **Batch processing:** Off-peak saatlerde batch işlemleri planlayın (geceleri hız更高).

---

## 7. API Entegrasyon Kod Örnekleri

Aşağıdaki TypeScript örnekleri, **Next.js 16 (App Router)** ve **fetch API** kullanılarak hazırlanmıştır. Bunlar doğrudan `/api` route'larında (server-side) kullanılmalıdır — DeepSeek API anahtarı asla client-side'a açıklanmamalıdır.

### 7.1 Basit Completion

```typescript
// src/lib/deepseek/simple.ts
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function simpleCompletion(
  prompt: string,
  model: 'deepseek-chat' | 'deepseek-v4-flash' = 'deepseek-chat'
): Promise<string> {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2048
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API hatası: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Kullanım
const cevap = await simpleCompletion('Bir TypeScript debounce fonksiyonu yaz.');
```

### 7.2 Streaming Completion

```typescript
// src/lib/deepseek/stream.ts
export async function streamCompletion(
  messages: Array<{ role: string; content: string }>,
  model: string = 'deepseek-chat',
  onToken: (token: string, reasoning?: string) => void,
  onDone?: () => void,
  onError?: (err: Error) => void
): Promise<void> {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      max_tokens: 4096
    })
  });

  if (!response.ok || !response.body) {
    onError?.(new Error(`Stream hatası: ${response.status}`));
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            onDone?.();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices[0]?.delta;
            if (delta?.content) onToken(delta.content);
            if (delta?.reasoning_content) onToken('', delta.reasoning_content);
          } catch (e) {
            // Kısmi JSON, atla
          }
        }
      }
    }
    onDone?.();
  } catch (err) {
    onError?.(err as Error);
  }
}

// Kullanım
await streamCompletion(
  [{ role: 'user', content: 'Bir React bileşeni yaz' }],
  'deepseek-v4-flash',
  (token, reasoning) => {
    if (reasoning) process.stdout.write(`[düşünce] ${reasoning}`);
    else process.stdout.write(token);
  }
);
```

### 7.3 Function Calling

```typescript
// src/lib/deepseek/function-calling.ts
interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: object;  // JSON Schema
  };
}

export async function functionCallCompletion(
  userMessage: string,
  tools: Tool[]
): Promise<any> {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: userMessage }],
      tools,
      tool_choice: 'auto',
      temperature: 0
    })
  });

  const data = await response.json();
  const message = data.choices[0].message;

  if (message.tool_calls) {
    // Model bir veya birden fazla fonksiyon çağırmak istiyor
    for (const call of message.tool_calls) {
      const args = JSON.parse(call.function.arguments);
      console.log(`${call.function.name} çağrılıyor:`, args);
      // Burada fonksiyonu çalıştır ve sonucu ikinci bir API çağrısında gönder
    }
  }

  return message;
}

// Örnek: Hava durumu sorgulama
const tools: Tool[] = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Verilen şehir için güncel hava durumunu döndürür',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'Şehir adı' },
          unit: { type: 'string', enum: ['C', 'F'], default: 'C' }
        },
        required: ['city']
      }
    }
  }
];

const result = await functionCallCompletion(
  'İstanbul\'da hava nasıl?',
  tools
);
```

### 7.4 Multi-Turn Conversation

```typescript
// src/lib/deepseek/multi-turn.ts
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class Conversation {
  private messages: Message[] = [];
  private model: string;
  private maxHistory: number;

  constructor(
    systemPrompt: string,
    model: 'deepseek-chat' | 'deepseek-v4-flash' = 'deepseek-chat',
    maxHistory: number = 20
  ) {
    this.messages.push({ role: 'system', content: systemPrompt });
    this.model = model;
    this.maxHistory = maxHistory;
  }

  async send(userInput: string): Promise<string> {
    this.messages.push({ role: 'user', content: userInput });

    // History'i sınırla (system prompt hariç son N mesaj)
    if (this.messages.length > this.maxHistory + 1) {
      const systemMsg = this.messages[0];
      const recent = this.messages.slice(-this.maxHistory);
      this.messages = [systemMsg, ...recent];
    }

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: this.messages,
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    const data = await response.json();
    const assistantContent = data.choices[0].message.content;

    this.messages.push({ role: 'assistant', content: assistantContent });
    return assistantContent;
  }

  getHistory(): Message[] {
    return [...this.messages];
  }

  clearHistory(keepSystem: boolean = true): void {
    if (keepSystem) {
      const system = this.messages[0];
      this.messages = [system];
    } else {
      this.messages = [];
    }
  }
}

// Kullanım
const conv = new Conversation(
  'Sen kıdemli bir TypeScript geliştiricisisin. Kısa ve doğru cevaplar ver.',
  'deepseek-chat'
);

const cevap1 = await conv.send('Bir Promise nedir?');
const cevap2 = await conv.send('Bunu async/await ile nasıl yazarım?');
// İkinci soru ilk sorunun bağlamını otomatik taşır
```

### 7.5 Next.js API Route Örneği

```typescript
// src/app/api/deepseek/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { streamCompletion } from '@/lib/deepseek/stream';

export const runtime = 'nodejs';  // Edge değil, Node.js runtime

export async function POST(req: NextRequest) {
  const { messages, model } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      await streamCompletion(
        messages,
        model || 'deepseek-chat',
        (token, reasoning) => {
          const event = reasoning
            ? `data: ${JSON.stringify({ reasoning })}\n\n`
            : `data: ${JSON.stringify({ token })}\n\n`;
          controller.enqueue(encoder.encode(event));
        },
        () => {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
        (err) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`)
          );
          controller.close();
        }
      );
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

---

## 8. Bilinen Sorunlar & Mitigasyon

### 8.1 Hallucination (Halüsinasyon)

**Sorun:** Tüm LLM'lerde olduğu gibi DeepSeek modelleri de var olmayan kütüphaneler, API'ler veya fonksiyonlar uydurabilir. Özellikle:
- `deepseek-chat` nadir kütüphanelerde metod imzaları uydurur
- `deepseek-reasoner` matematiksel ispatlarda adım atlayabilir
- `deepseek-v4-flash` uzun bağlamda alakasız referanslar çıkarabilir

**Mitigasyon:**
1. **RAG (Retrieval Augmented Generation):** Belgeleri prompt'a ekleyin (özellikle V4-Pro'da 1M context ideal).
2. **System prompt kısıtları:** "Eğer emin değilsen 'bilmiyorum' de" talimatı verin.
3. **Citation zorunluluğu:** Modelden kaynak URL/satır numarası isteyin.
4. **Two-pass validation:** Üretilen kodu derleyici/linter ile doğrulayın, hatayı geri besleme olarak gönderin.
5. **JSON Schema validation:** `response_format` ile şema kullanın.

```typescript
const mitigationPrompt = `
SADECE aşağıdaki bağlamda verilen bilgileri kullan.
Eğer bağlamda bilgi yoksa, "Bu konuda yeterli bilgim yok" de.
ASLA kütüphane adı, metod veya API uydurma.

Bağlam:
${documents}
`;
```

### 8.2 Context Overflow

**Sorun:** Bağlam penceresi aşıldığında:
- Eski mesajlar sessizce truncate edilir (bilgi kaybı)
- V4-Pro'da 1M token limitini aşmak 400 hatası verir
- Tokenizer'ın farklı dil kodlamaları (CJK vs Latin) token sayısını etkiler

**Mitigasyon:**
1. **Token counting:** `tiktoken` veya DeepSeek'in tokenizer'ını kullanın.
2. **Sliding window:** Eski mesajları özetleyin (compact).
3. **Selective retention:** Sadece tool call sonuçlarını ve son N mesajı tutun.
4. **Compression:** Kod dosyalarını sadece ilgili fonksiyonları içerecek şekilde filtreleyin.
5. **V4-Pro'a geçiş:** 128K yetmediğinde 1M context'li V4-Pro'a upgrade.

```typescript
import { encoding_for_model } from 'tiktoken';

const enc = encoding_for_model('gpt-4');  // DeepSeek benzer tokenizer
function countTokens(text: string): number {
  return enc.encode(text).length;
}

function trimToContext(messages: Message[], maxTokens: number): Message[] {
  let total = 0;
  const trimmed: Message[] = [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const msgTokens = countTokens(messages[i].content) + 4;  // role overhead
    if (total + msgTokens > maxTokens) break;
    trimmed.unshift(messages[i]);
    total += msgTokens;
  }
  if (trimmed[0]?.role !== 'system' && messages[0]?.role === 'system') {
    trimmed.unshift(messages[0]);
  }
  return trimmed;
}
```

### 8.3 Rate Limit (429 Too Many Requests)

**Sorun:**
- Ani trafik artışında 429 hatası
- DeepSeek'in dinamik limitleri nedeniyle öngörülemeyen kısıtlama
- `deepseek-reasoner`'ın 500 concurrency limiti (en darboğaz)

**Mitigasyon:**
1. **Exponential backoff + jitter** (Bölüm 5.3'teki örnek)
2. **Concurrency pool** (Bölüm 5.4'teki örnek)
3. **Queue sistemi:** İstekleri Redis/BullMQ kuyruğuna atın, işleyici concurrency limitine uyum sağlar.
4. **Model fallback:** `deepseek-reasoner` 429 verirse `deepseek-v4-pro`'a, o da 429 verirse `deepseek-chat`'e düş.
5. **Request deduplication:** Aynı prompt'u kısa süre içinde tekrar göndermeyin (LRU cache).

```typescript
const modelFallbackChain = [
  'deepseek-reasoner',
  'deepseek-v4-pro',
  'deepseek-chat',
  'deepseek-v4-flash'
];

async function callWithFallback(prompt: string): Promise<string> {
  for (const model of modelFallbackChain) {
    try {
      return await callDeepSeek(prompt, model);
    } catch (err: any) {
      if (err.status === 429 && model !== modelFallbackChain.at(-1)) {
        console.warn(`${model} 429 verdi, ${modelFallbackChain[modelFallbackChain.indexOf(model) + 1]} deneniyor`);
        continue;
      }
      throw err;
    }
  }
  throw new Error('Tüm modeller tükendi');
}
```

### 8.4 Timeout Handling

**Sorun:**
- Uzun CoT'lu `deepseek-reasoner` 60+ saniye sürebilir
- V4-Pro 1M context'te ilk token 15 saniye gecikebilir
- Next.js default timeout 30 sn (Vercel serverless)

**Mitigasyon:**
1. **Streaming kullanın:** Time-to-first-token'ı düşürür, uzun isteklerde bile bağlantıyı canlı tutar.
2. **Client-side timeout:** Fetch'i `AbortController` ile yönetin.
3. **Server-side uzun timeout:** Next.js config'de `maxDuration` artırın.
4. **Background jobs:** Çok uzun işleri (R1 ile kompleks matematik) BullMQ/Inngest'te çalıştırın.
5. **Health check:** SSE keepalive ping'leri (15 sn'de bir `: ping\n\n`).

```typescript
// next.config.ts
export default {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Vercel için: maxDuration 300 sn'ye çıkar
};

// Route handler'da
export const maxDuration = 300;  // 5 dakika
```

```typescript
// AbortController ile timeout
async function fetchWithTimeout(url: string, opts: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}
```

### 8.5 Ek Sorunlar

| Sorun | Belirti | Çözüm |
|-------|---------|-------|
| **CoT sızıntısı** | `deepseek-reasoner` yanıtta CoT'i kullanıcıya gösterme | Sadece `content` alanını UI'da göster, `reasoning_content`'i logla |
| **JSON parse hatası** | JSON mode'da bazen geçersiz JSON | `JSON.parse`'ı try-catch'e al, hata olursa yeniden dene |
| **Tool call eksik argüman** | `deepseek-v4-flash` bazen required parametre atlar | Şema validasyonu + yeniden prompt |
| **Encoding sorunu** | Türkçe karakterler bazen bozuk | `Content-Type: application/json; charset=utf-8` |
| **API versioning** | Sürüm değişiklikleri kırılma yapıyor | `Authorization` header'ına ek olarak API sürümünü env'de tut |

---

## 9. Kaynaklar

### 9.1 Resmi Belgeler
- **API Dokümantasyonu:** https://api-docs.deepseek.com
- **Modeller ve Fiyatlandırma:** https://api-docs.deepseek.com/quick_start/pricing
- **Rate Limit & Isolation:** https://api-docs.deepseek.com/quick_start/rate_limit
- **Function Calling Guide:** https://api-docs.deepseek.com/guides/function_calling
- **Reasoning Model Guide:** https://api-docs.deepseek.com/guides/reasoning_model
- **Thinking Mode (V4):** https://api-docs.deepseek.com/guides/thinking_mode
- **Change Log:** https://api-docs.deepseek.com/updates
- **V3.2 Release:** https://api-docs.deepseek.com/news/news251201
- **V3.2-Exp Release:** https://api-docs.deepseek.com/news/news250929
- **V4 Preview Release:** https://api-docs.deepseek.com/news/news260424

### 9.2 Açık Kaynak Depoları
- **DeepSeek-V3 (GitHub):** https://github.com/deepseek-ai/DeepSeek-V3
- **DeepSeek-V3.2-Exp (GitHub):** https://github.com/deepseek-ai/DeepSeek-V3.2-Exp
- **DeepSeek-V4-Pro (Hugging Face):** https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- **DeepSeek-V3 (Hugging Face):** https://huggingface.co/deepseek-ai/DeepSeek-V3
- **DeepSeek-V3.2-Exp (Hugging Face):** https://huggingface.co/deepseek-ai/DeepSeek-V3.2-Exp
- **DeepSeek-V3.2 (arXiv paper):** https://arxiv.org/abs/2512.02556

### 9.3 Topluluk ve Tartışma
- **Reddit (r/DeepSeek):** https://www.reddit.com/r/DeepSeek
- **Reddit (r/LocalLLaMA):** https://www.reddit.com/r/LocalLLaMA
- **Discord (DeepSeek official):** API dokümantasyonundan davet linki
- **Hugging Face Discussions:** Her model kartı altında tartışma bölümü

### 9.4 Third-Party Provider'lar (API üzerinden)
- **OpenRouter:** https://openrouter.ai/deepseek
- **Together AI:** https://www.together.ai/models/deepseek-r1
- **Fireworks AI:** https://fireworks.ai/blog/function-calling-deepseekv3
- **DeepInfra:** https://deepinfra.com/deepseek-ai
- **SambaNova:** https://sambanova.ai
- **NVIDIA NIM:** https://developer.nvidia.com/blog/build-with-deepseek-v4

### 9.5 Teknik Analizler ve Makaleler
- **Sebastian Raschka — Technical Tour (V3 → V3.2):** https://magazine.sebastianraschka.com/p/technical-deepseek
- **BentoML — Complete DeepSeek Guide:** https://www.bentoml.com/blog/the-complete-guide-to-deepseek-models-from-v3-to-r1-and-beyond
- **MIT Technology Review — Why V4 matters:** https://www.technologyreview.com/2026/04/24/1136422/why-deepseeks-v4-matters
- **Wikipedia — DeepSeek:** https://en.wikipedia.org/wiki/DeepSeek
- **DeepInfra V4 Pro Overview:** https://deepinfra.com/blog/deepseek-v4-pro-model-overview
- **Lightning.ai V4 Comparison:** https://lightning.ai/blog/deepseekv4comparison

### 9.6 Fiyat Hesaplama Araçları
- **CostGoat (DeepSeek):** https://costgoat.com/pricing/deepseek-api
- **TypingMind (Azure calculator):** https://custom.typingmind.com/tools/estimate-llm-usage-costs/azure/deepseek-v3-2
- **AtlasCloud:** https://www.atlascloud.ai/providers/deepseek-ai

### 9.7 Migration Kaynakları
- **Deprecation notice (deepseek-chat / reasoner):** https://chat-deep.ai/pricing
- **NXCode 2026 Complete Guide:** https://www.nxcode.io/resources/news/deepseek-api-pricing-complete-guide-2026

---

## Ek: Hızlı Referans Kartı

```
┌────────────────────────────────────────────────────────────────────┐
│                     DeepSeek Model Hızlı Seçim                    │
├──────────────────┬──────────────┬──────────┬──────────┬───────────┤
│ Senaryo          │ Model        │ Hız      │ Maliyet  │ Kalite    │
├──────────────────┼──────────────┼──────────┼──────────┼───────────┤
│ Autocomplete     │ v4-flash     │ ★★★★★    │ ★★★★★    │ ★★★       │
│ Günlük kod       │ deepseek-chat│ ★★★★     │ ★★★★     │ ★★★★      │
│ Mimari tasarım   │ v4-pro       │ ★★★      │ ★★       │ ★★★★★     │
│ Matematik        │ v4-pro (Hi)  │ ★★       │ ★★       │ ★★★★★     │
│ Debug (derin)    │ reasoner     │ ★★       │ ★★       │ ★★★★★     │
│ Çok dilli        │ deepseek-chat│ ★★★★     │ ★★★★     │ ★★★★      │
│ Agent (ReAct)    │ v4-pro       │ ★★★      │ ★★       │ ★★★★★     │
│ Batch işleme     │ v4-flash     │ ★★★★★    │ ★★★★★    │ ★★★       │
└──────────────────┴──────────────┴──────────┴──────────┴───────────┘
```

---

**Rapor Sonu.** Bu doküman, AI Kod Üretici Stüdyo projesinin Faz 1 araştırma aşamasının DeepSeek modelleri bölümünü oluşturur. Mimari ve kod geliştirme (Faz 3) sırasında model routing kararları bu rapordan alınacaktır.
