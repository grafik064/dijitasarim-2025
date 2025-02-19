# DijiTasarım - Grafik Tasarım Analiz Sistemi

DijiTasarım, grafik tasarım öğrencilerinin çalışmalarını yapay zeka destekli olarak analiz eden ve geri bildirim sağlayan bir web uygulamasıdır.

## Özellikler

- Tasarım öğelerinin otomatik analizi
  - Renk analizi ve öneriler
  - Kompozisyon değerlendirmesi
  - Görsel hiyerarşi analizi
  - Denge ve ritim değerlendirmesi

- İllüstrasyon tekniklerinin tespiti
  - Kullanılan teknik ve malzemelerin analizi
  - Uygulama yöntemlerinin değerlendirilmesi
  - Teknik kalite ölçümleri

- Yapay zeka destekli öneriler
  - Kişiselleştirilmiş geri bildirimler
  - İyileştirme önerileri
  - Örnek çalışmalar ve kaynaklar

## Teknolojik Altyapı

- Frontend: Next.js 14
- Backend: Node.js
- Yapay Zeka: TensorFlow.js
- Görüntü İşleme: OpenCV.js
- Veritabanı: PostgreSQL
- Önbellek: Redis
- Model Sunumu: TensorFlow Serving
- Web Sunucusu: NGINX

## Kurulum

1. Gereksinimleri yükleyin:
   ```bash
   # Docker ve Docker Compose yüklü olmalıdır
   docker --version
   docker-compose --version
   ```

2. Projeyi klonlayın:
   ```bash
   git clone https://github.com/grafik064/dijitasarim-2025.git
   cd dijitasarim-2025
   ```

3. Ortam değişkenlerini ayarlayın:
   ```bash
   cp .env.example .env
   # .env dosyasını düzenleyin
   ```

4. Docker konteynerlerini başlatın:
   ```bash
   docker-compose up -d
   ```

5. Veritabanı şemasını oluşturun:
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

## Geliştirme

1. Geliştirme ortamını başlatın:
   ```bash
   npm install
   npm run dev
   ```

2. TensorFlow modellerini eğitin:
   ```bash
   npm run train-models
   ```

3. Test çalıştırın:
   ```bash
   npm run test
   ```

## API Kullanımı

API dökümanı: http://localhost:3000/api/docs

Örnek istek:
```bash
curl -X POST http://localhost:3000/api/analyze \
  -F "file=@tasarim.jpg" \
  -H "Content-Type: multipart/form-data"
```

## Üretim Ortamı

1. Üretim derlemesi oluşturun:
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. Üretim ortamını başlatın:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. SSL sertifikalarını yapılandırın:
   ```bash
   # NGINX SSL sertifikalarını /nginx/ssl/ dizinine yerleştirin
   # NGINX yapılandırmasında SSL'i etkinleştirin
   ```

## Katkıda Bulunma

1. Bu depoyu fork edin
2. Özellik dalı oluşturun (`git checkout -b yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik: özet'`)
4. Dalı push edin (`git push origin yeni-ozellik`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim

- Proje sorumlusu: [Ad Soyad](mailto:email@example.com)
- Geliştirici ekibi: [DijiTasarım Ekibi](https://example.com/team)
- Hata raporları: [GitHub Issues](https://github.com/grafik064/dijitasarim-2025/issues)