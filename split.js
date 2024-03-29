const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");

// // ffmpeg ve ffprobe yollarını ayarla (Gerekirse bu yolları güncelleyin)
// const ffmpegPath = '/path/to/ffmpeg'; // ffmpeg'in yolu
// const ffprobePath = '/path/to/ffprobe'; // ffprobe'un yolu

// ffmpeg.setFfmpegPath(ffmpegPath);
// ffmpeg.setFfprobePath(ffprobePath);

/**
 * Video dosyasını HLS formatına dönüştürür.
 *
 * @param {string} sourcePath - Kaynak video dosyasının yolu
 * @param {string} outputDirectory - Çıktı dosyalarının kaydedileceği dizin
 * @param {string} outputName - Oluşturulacak HLS playlist dosyasının adı (uzantısız)
 */
function convertToHLS(sourcePath, outputDirectory, outputName) {
  const startTime = Date.now();
  // Çıktı dizininin var olup olmadığını kontrol et, yoksa oluştur
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }

  const outputPath = path.join(outputDirectory, `${outputName}.m3u8`);

  ffmpeg(sourcePath)
    .outputOptions([
      "-codec: copy", // Video ve ses kodeklerini değiştirmeden kopyalar
      "-start_number 0", // İlk segment dosyasının numarasını 0 olarak ayarlar
      "-hls_time 30", // Her segmentin maksimum süresini 10 saniye olarak ayarlar
      "-hls_list_size 0", // Oynatma listesinde sınırsız giriş tutar, tüm segmentleri listeler
      "-f hls", // Çıktı formatını HLS olarak ayarlar
    ])
    .output(outputPath)
    .on("end", () => { const endTime = Date.now(); // İşlem bitiş zamanını kaydet
    const durationInSeconds = (endTime - startTime) / 1000; // İşlem süresini hesapla
    console.log(`HLS conversion is finished in ${durationInSeconds} seconds.`);}) 
    .on("error", (err) => console.error("An error occurred: ", err))
    .run();
}

// Fonksiyonu kullanma örneği
// NOT: 'sourcePath', 'outputDirectory' ve 'ffmpegPath', 'ffprobePath' yollarını güncelleyin
convertToHLS("uzunvideo.mp4", "./output3", "video_stream");
