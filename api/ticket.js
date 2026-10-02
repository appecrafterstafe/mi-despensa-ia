module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const { image } = body || {};
    if (!image) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen de ticket.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Falta configurar GEMINI_API_KEY en las variables de entorno de Vercel.' });
    }

    const promptText = `Analiza este ticket de compra. Extrae todos los productos alimenticios o de despensa que encuentres. 
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

    // Usamos fetch directamente contra la API REST oficial de Gemini para evitar conflictos en serverless
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: image
                }
              },
              { text: promptText }
            ]
          }
        ]
      })
    });

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      throw new Error(data.error?.message || 'Error al comunicarse con la API de Gemini');
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    let textoRespuesta = rawText.trim();
    
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
