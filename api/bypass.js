export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).json({ status: 'error', message: 'URL kosong!' });

    try {
        // 1. Ambil halaman HTML Linkvertise dengan menyamar sebagai browser desktop
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': 'https://google.com'
            }
        });

        const htmlText = await response.text();
        let targetLink = '';

        // 2. ILMU PARSING: Cari pola JSON __NEXT_DATA__ atau regex target di dalam HTML
        const nextDataMatch = htmlText.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
        
        if (nextDataMatch && nextDataMatch[1]) {
            const jsonData = JSON.parse(nextDataMatch[1]);
            
            // Telusuri objek JSON-nya (struktur ini bisa disesuaikan dengan isi __NEXT_DATA__ mereka)
            // Biasanya target link disembunyikan di dalam props halaman
            try {
                targetLink = jsonData.props.pageProps.link.target; 
            } catch (e) {
                // Kalau jalurnya beda, fallback ke pencarian regex universal di bawah
            }
        }

        // 3. FALLBACK: Kalau tidak ketemu lewat JSON, cari pakai regex langsung di teks HTML
        if (!targetLink) {
            const regexTarget = htmlText.match(/"target"\s*:\s*"([^"]+)"/);
            if (regexTarget && regexTarget[1]) {
                targetLink = regexTarget[1].replace(/\\u002F/g, '/').replace(/\\"/g, '"');
            }
        }

        if (!targetLink) {
            return res.status(400).json({ status: 'error', message: 'Gagal mengekstrak link tujuan secara mandiri.' });
        }

        // 4. Kirim hasil temuan ke userscript lu!
        return res.status(200).json({
            status: 'success',
            original: targetUrl,
            result: targetLink
        });

    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
}
