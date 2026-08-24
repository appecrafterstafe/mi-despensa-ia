// api/receta.js (Este código corre oculto en el servidor de Vercel)
export default async function handler(req, res) {
    // Permitir que tu frontend acceda desde cualquier lado (CORS)
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

    // 🔒 Vercel tomará la clave desde las variables de entorno ocultas de su panel
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Falta la configuración de la API Key en el servidor.' });
    }

    try {
        const { ingredientes } = req.body;
        const promptBase = `Eres un chef experto. Sugiere 2 recetas simples y rápidas usando exclusivamente algunos de estos ingredientes: ${ingredientes}. Asume sal, aceite y agua. Usa un formato con listas limpias.`;

        // Llamada segura de servidor a servidor (Google <-> Vercel)
        const url = `https://googleapis.com`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-goog-api-key': GEMINI_API_KEY 
            },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptBase }] }] })
        });

        const data = await response.json();

        if (data.candidates && data.candidates.content.parts[0].text) {
            return res.status(200).json({ receta: data.candidates.content.parts[0].text });
        } else {
            return res.status(500).json({ error: 'Formato de IA incompatible', detalles: data });
        }

    } catch (error) {
        return res.status(500).json({ error: 'Error interno en el servidor', detalle: error.message });
    }
}
