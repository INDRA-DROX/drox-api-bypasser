export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).json({ status: 'error', message: 'URL tidak disediakan!' });
    }

    try {
        // 1. Ekstrak ID/Slug dari URL Linkvertise (Contoh: linkvertise.com/123456/judul)
        const urlObj = new URL(targetUrl);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        
        if (pathParts.length < 2) {
            return res.status(400).json({ status: 'error', message: 'Format URL Linkvertise tidak valid.' });
        }

        const userId = pathParts[0];
        const slug = pathParts[1];

        // 2. Tembak endpoint API internal yang biasa dipakai Linkvertise untuk mengambil target
        // (Catatan: Endpoint ini bisa berubah sewaktu-waktu oleh pihak Linkvertise)
        const apiLinkvertise = `https://linkvertise.com/api/v1/redirect/link/static/${userId}/${slug}`;

        const response = await fetch(apiLinkvertise, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Referer': targetUrl
            }
        });

        const data = await response.json();

        // 3. Ambil link tujuan dari respons JSON mereka
        let finalDestination = "";
        if (data && data.data && data.data.target) {
            finalDestination = data.data.target;
        }

        if (!finalDestination) {
            return res.status(400).json({ status: 'error', message: 'Gagal mendapatkan link tujuan dari API Linkvertise.' });
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
