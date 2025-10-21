// Ubicación: DCO/apps/backend/src/services/gemini.service.js
// (Considera renombrar este archivo a algo como ai.service.js u openai.service.js si prefieres)

// <<< CAMBIO 1: Importamos la librería de OpenAI en lugar de GoogleGenerativeAI
const OpenAI = require("openai");

// <<< CAMBIO 2: Inicializamos el cliente de OpenAI con la clave del .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Genera copys de marketing utilizando la API de OpenAI.
 * @param {string} prompt - La instrucción del usuario.
 * @returns {Promise<Array<string>>} - Una promesa que resuelve a un array de textos generados.
 */
const generateMarketingCopies = async (prompt) => {
  try {
    // <<< CAMBIO 3: Creamos el "prompt" de sistema para OpenAI
    // Le pedimos explícitamente una respuesta JSON con el formato deseado.
    const systemPrompt = `Eres un experto copywriter de marketing digital. Tu tarea es generar textos persuasivos para anuncios. Basado en la instrucción del usuario, crea una lista de 5 opciones. Tu respuesta DEBE SER ÚNICAMENTE un objeto JSON válido que contenga un array llamado "copies". Ejemplo: {"copies": ["texto 1", "texto 2", "texto 3", "texto 4", "texto 5"]}`;

    // <<< CAMBIO 4: Hacemos la llamada a la API de Chat Completions de OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Puedes usar "gpt-4" si tienes acceso y prefieres mayor calidad
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Instrucción: "${prompt}"` }
      ],
      response_format: { type: "json_object" }, // Pedimos explícitamente formato JSON
      temperature: 0.7, // Un valor para controlar la creatividad (0.7 es un buen balance)
    });

    // <<< CAMBIO 5: Extraemos y parseamos la respuesta JSON
    const jsonString = response.choices[0].message.content;
    const parsedResponse = JSON.parse(jsonString);

    if (!parsedResponse.copies || !Array.isArray(parsedResponse.copies)) {
      throw new Error("La respuesta de la IA (OpenAI) no tuvo el formato esperado (se esperaba un objeto con un array 'copies').");
    }

    return parsedResponse.copies;

  } catch (error) {
    console.error("Error al llamar a la API de OpenAI:", error);
    // Puedes personalizar el mensaje de error si lo deseas
    if (error.response) {
        console.error("Detalles del error de OpenAI:", error.response.data);
    }
    throw new Error("No se pudo generar el contenido desde OpenAI.");
  }
};

// Mantenemos la función de traducción (si aún la necesitas, si no, puedes eliminarla)
// Si la mantienes, asegúrate de que también use OpenAI o mantenga Gemini
// Aquí la dejo como estaba (usando Gemini) por si acaso.
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const translateToEnglish = async (textToTranslate) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Translate the following Spanish text to English. Return only the translated text, nothing else:\n\n"${textToTranslate}"`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error al traducir con Gemini:", error);
    return textToTranslate;
  }
};


module.exports = {
  generateMarketingCopies,
  translateToEnglish, // Mantenemos esta por si acaso, aunque ahora usa Gemini
};