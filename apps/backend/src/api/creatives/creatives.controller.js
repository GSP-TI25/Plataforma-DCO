//Ubicacion: DCO/apps/backend/src/api/creatives/creatives.controller.js

const creativeService = require('./creatives.service');

const getCreatives = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 8;
    const searchTerm = req.query.search || ''; // <-- Añadimos esto

    const data = await creativeService.getAllCreatives(page, limit, searchTerm); // <-- Y lo pasamos
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCreative = async (req, res) => {
  try {
    const newCreative = await creativeService.createCreative(req.body);
    res.status(201).json(newCreative);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateCreative = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCreative = await creativeService.updateCreative(id, req.body);
    if (!updatedCreative) return res.status(404).json({ message: 'Creatividad no encontrada' });
    res.status(200).json(updatedCreative);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCreative = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCreative = await creativeService.deleteCreative(id);
    if (!deletedCreative) return res.status(404).json({ message: 'Creatividad no encontrada' });
    res.status(200).json({ message: 'Creatividad eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCreativeById = async (req, res) => { // <-- Nueva función
  try {
    const { id } = req.params;
    const creative = await creativeService.getCreativeById(id);
    if (!creative) return res.status(404).json({ message: 'Creatividad no encontrada' });
    res.status(200).json(creative);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCreatives,
  createCreative,
  updateCreative,
  deleteCreative,
  getCreativeById,
};