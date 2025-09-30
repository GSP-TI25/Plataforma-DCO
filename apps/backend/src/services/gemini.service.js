// Ubicación: DCO/apps/backend/src/services/gemini.service.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inicializamos el cliente de Gemini con la clave secreta de nuestro .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Genera copys de marketing utilizando la API de Gemini.
 * @param {string} prompt - La instrucción del usuario.
 * @returns {Promise<Array<string>>} - Una promesa que resuelve a un array de textos generados.
 */
const generateMarketingCopies = async (prompt) => {
  try {
    // Seleccionamos el modelo de Gemini más adecuado para chat y generación de texto
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro"});

    // Creamos un "prompt" de sistema para darle un rol y formato de respuesta a la IA
    const fullPrompt = `
      Eres un experto copywriter de marketing digital. Tu tarea es generar textos persuasivos para anuncios.
      Basado en la siguiente instrucción, crea una lista de 5 opciones.
      Tu respuesta DEBE SER ÚNICAMENTE un objeto JSON que contenga un array llamado "copies".
      Ejemplo de respuesta: {"copies": ["texto 1", "texto 2", "texto 3", "texto 4", "texto 5"]}

      Instrucción del usuario: "${prompt}"
    `;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Limpiamos la respuesta para asegurarnos de que sea un JSON válido
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedResponse = JSON.parse(jsonString);
    
    if (!parsedResponse.copies || !Array.isArray(parsedResponse.copies)) {
      throw new Error("La respuesta de la IA no tuvo el formato esperado (se esperaba un objeto con un array 'copies').");
    }

    return parsedResponse.copies;

  } catch (error) {
    console.error("Error al llamar a la API de Gemini:", error);
    throw new Error("No se pudo generar el contenido desde Gemini.");
  }
};


const translateToEnglish = async (textToTranslate) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    const prompt = `Translate the following Spanish text to English. Return only the translated text, nothing else:\n\n"${textToTranslate}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error al traducir con Gemini:", error);
    // Si la traducción falla, devolvemos el texto original para no romper el flujo
    return textToTranslate;
  }
};

module.exports = {
  generateMarketingCopies,
  translateToEnglish,
};
