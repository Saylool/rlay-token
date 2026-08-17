# RLAY — Rlay Hub Brand Guide

> Base Sepolia testnet üzerinde yaşayan RLAY (Rlay Hub) tokeninin arayüz kimliği.
> Referans estetik: FonMap (tokenization), A-Identity (agentic trust), Lumenia — koyu zemin,
> yüksek kontrast, "protocol-grade" ciddiyet + testnet oyunbazlığı.

---

## 1. Marka Özü

| | |
|---|---|
| **İsim** | Rlay Hub |
| **Token** | RLAY (ERC20, 18 decimals) |
| **Ağ** | Base Sepolia (chainId 84532) |
| **Ses tonu** | Teknik, net, güven veren. Pazarlama abartısı yok; adresler, rakamlar ve kurallar konuşur. |
| **Slogan** | "Rules on-chain. Supply capped. Faucet open." |

---

## 2. Renk Paleti

Koyu tema birincildir (dApp'lerin doğal ortamı). Renkler Tailwind token'ları olarak tanımlıdır.

| Token | Hex | Kullanım |
|---|---|---|
| `ink` (bg) | `#0A0E1A` | Ana sayfa zemini — gece laciverti |
| `ink-soft` | `#111827` | Kart / panel zeminleri |
| `line` | `#1F2A44` | Kart kenarlıkları, ayraçlar (1px) |
| `relay` (primary) | `#3B82F6` | Birincil aksiyonlar, linkler — Base mavisiyle akraba |
| `relay-glow` | `#60A5FA` | Hover, focus ring, vurgu gradyanları |
| `mint` (success) | `#34D399` | Başarılı tx, "claim ready", pozitif durumlar |
| `amber` (warn) | `#FBBF24` | Cooldown, bekleyen tx, testnet uyarı rozeti |
| `rose` (error) | `#FB7185` | Revert, hata durumları |
| `fog` | `#94A3B8` | İkincil metin |
| `paper` | `#F8FAFC` | Birincil metin (koyu zemin üstünde) |

**Gradyan imzası:** hero başlığı ve birincil CTA'da `relay → relay-glow` (135°) lineer gradyan.
Başka yerde gradyan kullanma — imza tek kalsın.

---

## 3. Tipografi

| Rol | Font | Ağırlık | Boyut |
|---|---|---|---|
| Display / Hero | **Space Grotesk** | 700 | 48–64px, `tracking-tight` |
| Başlıklar (h2/h3) | Space Grotesk | 600 | 24–32px |
| Gövde | **Inter** | 400/500 | 16px / 1.6 satır yüksekliği |
| Adres, hash, rakam | **JetBrains Mono** | 400/500 | 13–14px |

Kurallar:
- Cüzdan adresleri, tx hash'leri, token miktarları **her zaman** monospace.
- Adresler kısaltılır: `0xBd3f…c316` (ilk 6 + son 4), tıklayınca kopyalanır.
- Büyük sayılar `Intl.NumberFormat` ile ayraçlı gösterilir: `10,000,000 RLAY`.

---

## 4. Layout

- **Container:** `max-w-6xl mx-auto px-6` — tek kolon, dikey akış.
- **Bölüm sırası (landing = dApp):**
  1. Navbar: logo + ağ rozeti + `Connect Wallet`
  2. Hero: token adı, slogan, canlı toplam arz / cap göstergesi
  3. Stats şeridi: 4'lü grid (Total Supply, Max Supply, Sizin Bakiyeniz, Faucet Durumu)
  4. Faucet kartı: tek büyük CTA — "Claim 100 RLAY" + cooldown sayacı
  5. Transfer kartı: adres + miktar formu
  6. Kontrat bilgisi: adres, BaseScan linki, kurallar listesi
- **Grid:** kartlar `grid md:grid-cols-2 gap-6`; stats `grid-cols-2 md:grid-cols-4`.
- **Boşluk ritmi:** bölümler arası `py-16`, kart içi `p-6`. 8px taban ölçek.
- **Köşeler:** kartlar `rounded-2xl`, butonlar `rounded-xl`, rozetler `rounded-full`.

---

## 5. UI Bileşen Parametreleri

### Butonlar
- **Primary:** gradyan zemin, `paper` metin, `hover:brightness-110`, `active:scale-[0.98]`.
- **Secondary:** şeffaf zemin + `line` kenarlık, hover'da `ink-soft`.
- **Disabled:** `opacity-40 cursor-not-allowed` — cooldown'daki faucet butonu böyle görünür.
- Yükseklik 44px (dokunma hedefi), `font-medium`.

### Kartlar
- `bg-ink-soft border border-line rounded-2xl p-6`.
- Hover'da kenarlık `relay/40`'a yumuşar (`transition-colors`).

### Rozetler
- Ağ rozeti: `Base Sepolia` — nokta + metin, `amber` (testnet olduğunu daima hatırlat).
- Durum rozetleri: mint = claim hazır, amber = cooldown, rose = hata.

### Formlar
- Input: `bg-ink border border-line rounded-xl px-4 py-3`, focus'ta `ring-2 ring-relay/50`.
- Hatalı input: kenarlık `rose`, altına 13px açıklama.

---

## 6. UX Kuralları

1. **Cüzdan durumu her zaman görünür:** bağlı adres navbar'da kısaltılmış + kopyalanabilir.
2. **Yanlış ağ = tek aksiyon:** Base Sepolia dışındaysa tüm kartların yerine
   "Switch to Base Sepolia" butonu çıkar (`wallet_switchEthereumChain`).
3. **Tx yaşam döngüsü şeffaf:** `imzalanıyor → beklemede (amber) → onaylandı (mint) / revert (rose)`;
   her tx için BaseScan linki göster.
4. **Cooldown dürüstlüğü:** faucet butonu kilitliyken kalan süre canlı geri sayımla gösterilir
   (`nextFaucetClaimAt` on-chain okunur, UI tahmin etmez).
5. **Optimistic update yok:** bakiyeler yalnızca tx onayından sonra yeniden okunur.
6. **Hata mesajları insanca:** raw revert data değil — "24 saatlik faucet bekleme süresi dolmadı" gibi.
7. **Boş durumlar yönlendirir:** cüzdan bağlı değilse kartlar veriyi gizler, tek CTA `Connect Wallet`.
8. **Erişilebilirlik:** kontrast ≥ 4.5:1, tüm interaktif öğelerde görünür focus ring, `aria-live`
   ile tx durumu duyurulur.

---

## 7. Logo & İkonografi

- Logomark: mono "R" harfi, `rounded-xl` gradyan kare içinde (imza gradyanı).
- İkon seti: tek çizgi (stroke 1.5px) — lucide tarzı; dolu ikon kullanma.
- Emoji kullanma.
