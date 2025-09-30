const downloadService = require('../../services/download.service');

const downloadFromUrl = async (req, res) => {
  try {
    const { url } = req.query; // Leemos la URL de la imagen desde los parámetros
    if (!url) {
      return res.status(400).send('Se requiere una URL.');
    }

    const imageBuffer = await downloadService.downloadImageAsBuffer(url);

    // --- LA MAGIA OCURRE AQUÍ ---
    // 1. Le decimos al navegador que esto es un archivo para descargar
    res.setHeader('Content-Disposition', 'attachment; filename=dco-generated-image.png');
    // 2. Le decimos que el tipo de contenido es una imagen PNG
    res.setHeader('Content-Type', 'image/png');

    // 3. Enviamos los datos de la imagen
    res.send(imageBuffer);
  } catch (error) {
    console.error("Error al descargar la imagen:", error);
    res.status(500).send('No se pudo descargar la imagen.');
  }
};

module.exports = { downloadFromUrl };