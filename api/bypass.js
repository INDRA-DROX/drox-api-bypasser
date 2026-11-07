export default async function handler(req, res) {
    // 1. Izinkan CORS untuk userscript kamu
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).json({ status: 'error', message: 'URL tidak ditemukan!' });
    }

    try {
        // 2. Contoh logika dasar: Menembak atau mem-parsing halaman Linkvertise
        // Catatan: Linkvertise punya struktur API internal atau token dinamis. 
        // Di sini kita gunakan teknik fetch dengan User-Agent browser asli.
        
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        });

        const htmlText = await response.text();

        // 3. Cari pola atau ekstrak link tujuan dari HTML/JSON yang didapat
        // (Biasanya Linkvertise menyimpan data target di dalam script JSON atau struktur DOM tertentu)
        // Contoh sederhana pencarian regex atau parsing data:
        
        let finalDestination = "";

        // Contoh logika ekstraksi (menyesuaikan struktur respon Linkvertise)
        if (htmlText.includes('target')) {
            // Lakukan ekstraksi link target di sini, atau parse JSON-nya jika endpoint-nya berupa API v1
            // Sebagai contoh, jika server berhasil mendeteksi target:
            finalDestination = "https://example.com/file-asli"; // Ganti dengan hasil parsing asli
        }

        if (!finalDestination) {
            // Fallback jika gagal ekstrak otomatis
            return res.status(400).json({ status: 'error', message: 'Gagal mengekstrak link tujuan dari server.' });
        }

        // 4. Kirim balik link asli yang sudah bersih ke userscript kamu
        return res.status(200).json({
            status: 'success',
            original: targetUrl,
            result: finalDestination
        });

    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
}
