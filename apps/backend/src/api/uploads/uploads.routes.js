// Ubicación: DCO/apps/backend/src/api/uploads/uploads.routes.js
'use strict';
const { Router } = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const assetService = require('../assets/assets.service');
const verificarToken = require('../../middleware/auth.middleware');

// Configuración de Cloudinary (usa las variables del archivo .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración del almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'dco_assets', // Carpeta en Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });
const router = Router();

// Endpoint para subir un archivo. Está protegido por el token.
router.post('/', verificarToken, upload.single('asset'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ningún archivo.' });
  }
  
  try {
    // Después de subir a Cloudinary, guardamos la info en nuestra base de datos
    const assetData = {
      file_name: req.file.originalname,
      cloudinary_url: req.file.path,
      file_type: req.file.mimetype,
      size_bytes: req.file.size
    };
    const nuevoAsset = await assetService.createAsset(assetData);
    
    // Devolvemos el registro completo que se creó en nuestra base de datos
    res.status(201).json(nuevoAsset);
  } catch (error) {
    console.error("Error al guardar el asset en la base de datos:", error);
    res.status(500).json({ message: 'Error al guardar el registro del asset.' });
  }
});

module.exports = router;