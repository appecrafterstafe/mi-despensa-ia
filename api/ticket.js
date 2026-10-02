import { GoogleGenAI } from '@google/genai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen.' });
    }

    // Inicializa la IA usando la variable de entorno configurada en Vercel
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

    let textoRespuesta = response.text.trim();
    
    // Limpieza por si la IA devuelve bloques de código markdown
    if (textoRespuesta.startsWith('```json')) {
      textoRespuesta = textoRespuesta.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (textoRespuesta.startsWith('```')) {
      textoRespuesta = textoRespuesta.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const resultadoJson = JSON.parse(textoRespuesta);
    return res.status(200).json(resultadoJson);

  } catch (error) {
    console.error("Error al procesar ticket en el backend:", error);
    return res.status(500).json({ error: 'Error interno al procesar el ticket con la IA.' });
  }
}
