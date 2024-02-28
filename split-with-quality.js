// 'fluent-ffmpeg' kütüphanesini projemize dahil ediyoruz.
const ffmpeg = require('fluent-ffmpeg');
// 'path' ve 'fs' modüllerini dahil ediyoruz. Bu modüller dosya ve dizin yolları ile dosya sistemi işlemleri için kullanılır.
const path = require('path');
const fs = require('fs');

// Belirtilen dosya yolu için gerekli olan dizinlerin varlığını kontrol eden ve gerekirse oluşturan bir fonksiyon.
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  fs.mkdirSync(dirname, { recursive: true });
}

// Belirtilen kaynak dosyayı farklı çözünürlüklerde HLS formatına dönüştüren ana fonksiyon.
function convertToHLS(sourcePath, outputDirectory, sizes) {
  // Her bir çözünürlük için döngü başlatıyoruz.
  sizes.forEach(size => {
    // Çıktı ismini ve yolunu belirliyoruz. 'original' için farklı bir isimlendirme kullanıyoruz.
    const outputName = size === 'original' ? 'original' : `hls_${size}p`;
    const outputPath = path.join(outputDirectory, size, `${outputName}.m3u8`);
    // Çıktı dizininin varlığını kontrol edip, gerekirse oluşturuyoruz.
    ensureDirectoryExistence(outputPath);

    // ffmpeg komutunu başlatıyoruz.
    const command = ffmpeg(sourcePath)
      .outputOptions([
        '-hls_time 20', // HLS segmentlerinin maksimum süresini 10 saniye olarak belirliyoruz.
        '-hls_list_size 0', // Oluşturulacak segment listesinin boyutunu sınırsız yapıyoruz.
        '-f hls' // Çıktı formatını HLS olarak ayarlıyoruz.
      ])
      .on('end', () => console.log(`${outputName} conversion is finished.`)) // Dönüşüm tamamlandığında bir mesaj logluyoruz.
      .on('error', (err) => console.error('An error occurred: ', err)); // Bir hata oluşursa, hatayı logluyoruz.

    // 'original' haricindeki çözünürlükler için videoyu yeniden ölçeklendiriyoruz ve codec ayarlarını yapılandırıyoruz.
    if (size !== 'original') {
      command.outputOptions([
        `-vf scale=-2:${size}`, // Videoyu belirtilen yükseklikte ölçeklendiriyoruz. Genişlik otomatik ayarlanır (-2).
        '-c:v libx264', // Video codec'ini H.264 olarak ayarlıyoruz.
        '-crf 20', // Çıktı kalitesini belirleyen CRF değerini ayarlıyoruz.
        '-preset veryfast', // Kodlama hızını belirleyen preset'i ayarlıyoruz.
        '-c:a aac', // Ses codec'ini AAC olarak ayarlıyoruz.
        '-ar 48000', // Ses örnekleme oranını 48kHz olarak ayarlıyoruz.
        '-b:a 128k' // Ses bitrate'ini 128 kbps olarak ayarlıyoruz.
      ]);
    }

    // Ayarladığımız çıktı yoluna göre işlemi başlatıyoruz.
    command.output(outputPath).run();
  });
}

// Fonksiyonu çağırma örneği
// NOT: 'sourcePath', 'outputDirectory' ve çözünürlükler ('sizes') gerçek senaryonuza göre güncellenmelidir.
const sourceVideoPath = 'video.mp4';
const outputDir = './output2';
const sizes = ['720', '480', 'original']; // İstenen çözünürlükler ve 'original' için bir işlem.

// Fonksiyonumuzu belirtilen parametrelerle çağırıyoruz.
convertToHLS(sourceVideoPath, outputDir, sizes);
