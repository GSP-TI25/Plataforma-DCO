//Ubicacion; DCO/apps/backend/src/api/assets/assets.controller.js
const assetService = require('./assets.service');

const getAssets = async (req, res) => {
  try {
    const assets = await assetService.getAllAssets();
    res.status(200).json(assets);
  } catch (error) {
    console.error('Error en getAssets:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


const createAsset = async (req, res) => {
  try {
    const assetData = req.body; // Los datos vienen en el "cuerpo" (body) de la petición POST
    const newAsset = await assetService.createAsset(assetData);
    res.status(201).json(newAsset); // 201 significa "Creado exitosamente"
  } catch (error) {
    console.error('Error en createAsset:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateAsset = async (req, res) => {
  try {
    const { id } = req.params; // Extraemos el ID de la URL
    const assetData = req.body; // Extraemos los datos a actualizar del cuerpo

    const updatedAsset = await assetService.updateAsset(id, assetData);

    if (!updatedAsset) {
      return res.status(404).json({ message: 'Asset no encontrado' });
    }

    res.status(200).json(updatedAsset); // 200 significa "OK"
  } catch (error) {
    console.error('Error en updateAsset:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params; // Extraemos el ID de la URL
    const deletedAsset = await assetService.deleteAsset(id);

    if (!deletedAsset) {
      return res.status(404).json({ message: 'Asset no encontrado' });
    }

    res.status(200).json(deletedAsset); // 200 OK, devolvemos el objeto borrado
  } catch (error) {
    console.error('Error en deleteAsset:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset
};