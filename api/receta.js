// api/receta.js
// Esta función corre en el servidor de Vercel, nunca en el navegador.
// La API key vive acá, leída de una variable de entorno — jamás en el HTML/JS del cliente.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { ingredientes, pedidoEspecifico } = req.body || {};
  if (!ingredientes || typeof ingredientes !== 'string') {
    return res.status(400).json({ error: 'Faltan ingredientes' });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY no configurada en el servidor' });
  }

  let promptBase;
  if (pedidoEspecifico && typeof pedidoEspecifico === 'string' && pedidoEspecifico.trim()) {
    promptBase = `Eres un chef experto. El usuario quiere la receta de: "${pedidoEspecifico.trim()}". Dale la receta completa y clara de eso, con cantidades aproximadas y pasos numerados. Si podés aprovechar alguno de estos ingredientes que ya tiene en stock, mencionalo: ${ingredientes}. No uses markdown pesado, solo guiones claros y listas limpias.`;
  } else {
    promptBase = `Eres un chef experto. Sugiere 2 recetas simples y rápidas usando exclusivamente algunos de estos ingredientes: ${ingredientes}. Asume sal, aceite y agua. No uses markdown pesado, solo guiones claros y listas limpias.`;
  }

  try {
    const respuestaGemini = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({ contents: [{ parts: [{ text: promptBase }] }] }),
      }
    );
    const data = await respuestaGemini.json();
    if (!respuestaGemini.ok) {
      return res.status(respuestaGemini.status).json({ error: data?.error?.message || 'Error de Google' });
    }
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al conectar con la IA' });
  }
}
