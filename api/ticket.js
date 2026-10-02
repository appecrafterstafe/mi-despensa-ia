const { GoogleGenAI } = require('@google/genai');

module.exports = async (req, res) => {
  // Permitir solo peticiones POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }

  try {
    // Asegurar que req.body esté parseado si viene como string
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const { image } = body || {};
    if (!image) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen de ticket.' });
    }

    // Inicializar la IA con la clave de entorno
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `Analiza este ticket de compra. Extrae todos los productos alimenticios o de despensa que encuentres. 
Devuelve estrictamente un objeto JSON válido con la siguiente estructura exacta (sin texto adicional, sin bloques de código markdown como \`\`\`json):
{
  "productos": [
    {
      "nombre": "Nombre del producto",
      "cantidad": 1,
      "unidad": "Unidad",
      "ubicacion": "despensa"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: image
          }
        },
        prompt
      ]
    });

    let textoRespuesta = response.text ? response.text.trim() : '';
    
    // Limpieza de bloques markdown por si la IA los incluye
    if (textoRespuesta.startsWith('```json')) {
      textoRespuesta = textoRespuesta.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (textoRespuesta.startsWith('```')) {
      textoRespuesta = textoRespuesta.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const resultadoJson = JSON.parse(textoRespuesta);
    return res.status(200).json(resultadoJson);

  } catch (error) {
    console.error("Error detallado en ticket.js:", error);
    return res.status(500).json({ error: error.message || 'Error interno al procesar el ticket con la IA.' });
  }
};
