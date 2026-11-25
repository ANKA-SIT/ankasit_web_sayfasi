# Düzce Üniversitesi ANKA-SİT Web Platformu

Düzce Üniversitesi Savunma Sanayii ve İleri Teknolojiler Topluluğu (ANKA-SİT) için geliştirilmiş, iki dilli (TR/EN), metalik altın & siyah soft tasarımlı, scroll ile taneciklere dağılan merkez logo animasyonlu, Takımlar, Etkinlikler, Başvuru, İletişim & Sponsorluk ve Admin/YK panelli Next.js + Supabase web platformu.

## 1. Yerelde Çalıştırma
```bash
npm install
npm run dev
```
Tarayıcıda `http://localhost:3000` adresini açın.

## 2. GitHub'a Pushlama (Yükleme)
1. GitHub'da yeni ve boş bir depo (repository) oluşturun (ör. `anka-sit-web`).
2. Proje klasöründe terminali açıp sırayla şu komutları çalıştırın:
```bash
git init
git add .
git commit -m "ANKA-SIT web platformu ilk surum"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/anka-sit-web.git
git push -u origin main
```

## 3. Vercel ile Ücretsiz Yayınlama (Publish)
1. [vercel.com](https://vercel.com) adresine GitHub hesabınızla giriş yapın.
2. **Add New > Project** deyip `anka-sit-web` deposunu seçin.
3. **Deploy** butonuna basın (`.gitignore` ve Next.js yapılandırması hazırdır).
4. Supabase bağlantısını aktif ettiğinizde `.env.example` içindeki anahtarları Vercel > **Settings > Environment Variables** ekranına ekleyin.
