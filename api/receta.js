export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Falta configurar la API Key en el panel de Vercel.' });
    }

    try {
        const { ingredientes } = req.body;
        const promptBase = `Eres un chef experto de hogar. Sugiere 2 recetas cortas y fáciles usando exclusivamente algunos de estos ingredientes: ${ingredientes}. Asume sal, aceite y agua. Sé breve y estructurado.`;

        // URL del modelo estable para peticiones POST de servidor
        const url = `https://googleapis.com{GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptBase }] }] })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return res.status(200).json({ receta: data.candidates[0].content.parts[0].text });
        } else {
            return res.status(500).json({ error: 'Respuesta inesperada de Google', detalles: data });
        }

    } catch (error) {
        return res.status(500).json({ error: 'Error en la conexión del servidor', detalle: error.message });
    }
}
