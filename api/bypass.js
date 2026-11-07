export default async function handler(req, res) {
    // Izinkan akses CORS untuk userscript kamu
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).json({ status: 'error', message: 'URL tidak disediakan!' });
    }

    try {
        // 1. Fetch halaman Linkvertise dengan menyamar sebagai browser desktop normal
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            },
            redirect: 'follow'
        });

        const html = await response.text();
        let finalDestination = '';

        // 2. Ekstrak link tujuan dari struktur data JSON / teks di dalam HTML Linkvertise
        const targetMatch = html.match(/"target"\s*:\s*"([^"]+)"/);
        if (targetMatch && targetMatch[1]) {
            // Bersihkan escape characters jika ada
            finalDestination = targetMatch[1].replace(/\\u002F/g, '/').replace(/\\"/g, '"');
        }

        // Cek cadangan jika polanya menggunakan key lain di dalam payload halaman mereka
        if (!finalDestination) {
            const altMatch = html.match(/"destination"\s*:\s*"([^"]+)"/) || html.match(/"url"\s*:\s*"([^"]+)"/);
            if (altMatch && altMatch[1]) {
                finalDestination = altMatch[1].replace(/\\/g, '');
            }
        }

        // 3. Validasi hasil akhir
        if (!finalDestination || finalDestination.includes('linkvertise')) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Gagal mengekstrak link akhir. Halaman terlindung atau struktur berubah.' 
            });
        }

        // 4. Kirim balik hasil sukses ke userscript kamu
        return res.status(200).json({
            status: 'success',
            original: targetUrl,
            result: finalDestination
        });

    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
}
