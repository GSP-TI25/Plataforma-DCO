// Ubicación: DCO/apps/backend/src/services/stability.service.js

const OpenAI = require('openai'); // Importamos la librería de OpenAI
const axios = require('axios'); // Todavía necesitamos axios para descargar la imagen de DALL-E
const cloudinary = require('cloudinary').v2;

// const geminiService = require('./gemini.service'); // Importamos el servicio de Gemini (comentado porque no se usa directamente aquí)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Genera una imagen conceptual utilizando la API de DALL-E (OpenAI).
 * @param {string} prompt - La descripción de la imagen.
 * @returns {Promise<string>} - Una promesa que resuelve a la URL de la imagen en Cloudinary.
 */
const generateMoodboardImage = async (prompt) => {
  try {
    // Para evitar sobrecargar Gemini, usaremos el prompt directamente.
    // Si los prompts no están en inglés, DALL-E funciona bien con prompts en español.
    // const englishPrompt = await geminiService.translateToEnglish(prompt); // Comentado para evitar la llamada a Gemini

    // Hacemos la llamada a la API de DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3", // Usamos el modelo DALL-E 3
      prompt: prompt,
      n: 1, // Generamos una sola imagen
      size: "1024x1024", // Tamaño de la imagen
    });

    const imageUrl = response.data[0].url; // DALL-E devuelve una URL temporal de la imagen

    // Descargamos la imagen de la URL temporal
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });
    const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');
    
    // Subimos la imagen directamente desde la memoria a Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(
      `data:image/png;base64,${base64Image}`,
      { folder: 'dco_moodboards' } // La guardamos en una carpeta específica
    );
    
    // Devolvemos la URL segura de Cloudinary
    return cloudinaryResponse.secure_url;

  } catch (error) {
    console.error("Error al llamar a la API de DALL-E:", error.response?.data || error.message);
    throw new Error("No se pudo generar la imagen desde DALL-E.");
  }
};

module.exports = {
  generateMoodboardImage,
};