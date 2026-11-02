# Zihin Atlası

iPhone ana ekranından kullanılabilen, çevrimdışı çalışan kişisel öğrenme alanı. Sunucu, hesap veya ücretli hizmet gerektirmez. Türkçe arayüz; açık adaçayı ve kâğıt renkleri; telefonda alt gezinme, geniş ekranda yan menü.

## Özellikler

- Tarihe bağlı, düzenlenebilir altı günlük görev; görev adı, kaynak, süre ve görünürlük ayarları.
- Haftalık gün seçimi, aylık takvim, tamamlanan görevler ve seri takibi. Seri için günde en az bir görev yeterlidir. İstatistikteki dakika, tamamlanan görevlerin planlanan süresidir; ölçülmüş çalışma süresi değildir.
- 5/10/25 dakika veya görev süresine göre odak sayacı. Sayfa arka planda kaldığında geçen zamanı hesaba katar; yeniden açıldığında devam eder. Kapalı uygulamada alarm veya bildirim göndermez.
- Kelime defteri, arama ve basit aralıklı tekrar: hatırlanan kartlar 1, 3, 7, 14, 30 gün sonra; tekrar çalışılacak kartlar aynı gün yeniden gösterilir. Anki'nin algoritması kullanılmaz.
- Tarihe göre otomatik kaydedilen günlük, geçmiş sayfalar ve düşünce soruları.
- Okuma/dinleme/izleme kaynakları, filtreler ve yer imleri.
- Doğrulanan JSON yedekleri, içe aktarmadan önce kayıt özeti ve onay; desteklenen cihazlarda dosya paylaşımı.
- GitHub Pages alt diziniyle uyumlu PWA, çevrimdışı uygulama kabuğu ve kullanıcı tarafından başlatılan sürüm güncellemesi.

## iPhone kurulumu

1. Yayındaki adresi Safari'de aç.
2. **Paylaş → Ana Ekrana Ekle** seç.
3. Varsa **Web Uygulaması Olarak Aç** açık kalsın; **Ekle** de.
4. Yeni simgeden aç ve ilk kurulum için bir kez internete bağlı kal.

Veriler `localStorage` içinde bu tarayıcıya/uygulamaya aittir. Safari sekmesi ve ana ekran uygulaması farklı depolama alanları kullanabilir. Gerekirse Safari'den JSON yedeği alıp ana ekran uygulamasına yükle. Tarayıcı verilerini temizlemek veya uygulamayı kaldırmak kayıtları silebilir. Düzenli yedek al. Cihazlar arasında otomatik eşitleme, iCloud, HealthKit ve arka plan bildirimleri yoktur. Dış kaynaklar çevrimdışı çalışmaz.

Eski `zihin-atlasi-v1` verileri ilk açılışta `zihin-atlasi-v2` alanına taşınır. Orijinal uygulamanın tarihleri **Kasım 2026** olduğundan eski görev ve not kayıtları bu tarihlerle korunur. Eski anahtar silinmez. Eski JSON yedekleri de yüklenebilir. Bozuk kayıtlar otomatik olarak üzerine yazılmaz.

## Yerelde çalıştırma ve doğrulama

Node.js 22 veya üzeri:

```sh
npm ci
npm start
```

Adres: `http://127.0.0.1:4173/zihin-atlasi/`. iPhone'da gerçek çevrimdışı kurulum için HTTPS yayını kullan.

```sh
npm run check
npm test
npx playwright install chromium webkit
npm run test:e2e
```

Windows PowerShell yürütme ilkesi `npm.ps1` dosyasını engelliyorsa `npm.cmd` ve `npx.cmd` kullan. PNG ikonlarını yeniden üretmek için `scripts/generate-icons.ps1` kullanılabilir.

## GitHub Pages yayını

Depo: https://github.com/gokhanozbek66/zihin-atlasi

1. GitHub'da **Settings → Pages → Build and deployment → Source: GitHub Actions** seç.
2. `main` dalına push yap. `.github/workflows/pages.yml` kod kontrollerini ve Chromium/WebKit testlerini çalıştırır, yalnızca uygulamanın herkese açık dosyalarını paketler ve Pages'e yayınlar.
3. **Actions → Publish Zihin Atlası** çalışmasının başarılı olduğunu kontrol et.

Beklenen adres: https://gokhanozbek66.github.io/zihin-atlasi/

Yeni bir uygulama sürümünde `sw.js` içindeki `CACHE` sürümünü artır. Böylece bütün uygulama dosyaları birlikte güncellenir. Kullanıcı üstte çıkan **Kaydet ve güncelle** düğmesiyle yeni sürüme geçer; not yazarken zorunlu yenileme yapılmaz.

## Tasarım ve araştırma

Bu proje öğrenme ve merak odağını korur. [Streaks](https://streaks.app/) seri görünümü, [Anki'nin aktif hatırlama ve aralıklı tekrar ilkeleri](https://docs.ankiweb.net/background.html) kelime kartları, [Daylio'nun etkinlik istatistikleri](https://daylio.net/faq/docs/daylio-faq/about/activity-and-mood-statistics/) ilerleme görünümü için incelendi. Tasarım ve kod bu projeye özeldir.

iPhone kurulum referansı: [Apple — Safari'deki bir web sitesini uygulamaya dönüştürme](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios).
