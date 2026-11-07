export default async function handler(req, res) {
    // 1. Izinkan akses CORS agar script Tampermonkey kamu bisa nembak API ini
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    // 2. Ambil parameter 'url' yang dikirim dari userscript
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).json({ status: 'error', message: 'URL tidak ditemukan!' });
    }

    try {
        // --- DI TITIK INI LUU BISA TARUH LOGIKA "KOTOR" NYA ---
        // Contoh: Disini server Vercel kamu bisa nge-fetch atau nge-solve link target.
        // Untuk sekarang, kita buat simulasi balikan data sukses:
        
        const simulatedFinalUrl = "https://www.google.com"; // Ganti dengan hasil link akhir asli nantinya

        // 3. Kirim balik hasilnya ke userscript dalam format JSON
        return res.status(200).json({
            status: 'success',
            original: targetUrl,
            result: simulatedFinalUrl
        });

    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
}
