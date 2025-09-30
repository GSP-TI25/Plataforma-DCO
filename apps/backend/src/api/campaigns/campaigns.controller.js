// Ubicacion: DCO/apps/backend/src/api/campaigns/campaigns.controller.js

const campaignService = require('./campaigns.service');

// Obtener todas las campañas
const getCampaigns = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 8;
    // Leemos el nuevo parámetro 'search' de la URL. Si no existe, es un string vacío.
    const searchTerm = req.query.search || '';

    const data = await campaignService.getAllCampaigns(page, limit, searchTerm);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear una campaña
const createCampaign = async (req, res) => {
  try {
    const newCampaign = await campaignService.createCampaign(req.body);
    res.status(201).json(newCampaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await campaignService.getCampaignById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }
    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar una campaña
const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCampaign = await campaignService.updateCampaign(id, req.body);
    if (!updatedCampaign) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }
    res.status(200).json(updatedCampaign);
  } catch (error){
    res.status(500).json({ message: error.message });
  }
};

// Borrar una campaña
const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCampaign = await campaignService.deleteCampaign(id);
    if (!deletedCampaign) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }
    res.status(200).json({ message: 'Campaña eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCampaigns,
  createCampaign,
  getCampaignById, 
  updateCampaign,
  deleteCampaign,
};