// Ubicación: DCO/apps/backend/src/api/meta/meta.controller.js
const facebookService = require('../../services/facebook.service');
const credentialsService = require('../api-credentials/credentials.service');

// Función auxiliar para manejar errores de forma consistente
const handleError = (res, message, error) => {
  console.error(`${message}:`, error.response?.data || error.message);
  // Si el error tiene un mensaje específico (como nuestro token no encontrado), úsalo
  const errorMessage = error.message || message;
  res.status(500).json({ message: errorMessage });
};

const getAdAccountsForClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const accessToken = await credentialsService.getClientAccessToken(clientId, 'meta');
    const adAccounts = await facebookService.getAdAccounts(accessToken);
    res.status(200).json(adAccounts);
  } catch (error) {
    handleError(res, 'Error al obtener las cuentas publicitarias de Meta', error);
  }
};

const getCampaignsForAdAccount = async (req, res) => {
  try {
    const { clientId, adAccountId } = req.params;
    const accessToken = await credentialsService.getClientAccessToken(clientId, 'meta');
    const campaigns = await facebookService.getCampaignsByAdAccount(accessToken, adAccountId);
    res.status(200).json(campaigns);
  } catch (error) {
    handleError(res, 'Error al obtener las campañas de Meta', error);
  }
};

const createCampaignForAdAccount = async (req, res) => {
  try {
    const { clientId, adAccountId } = req.params;
    const accessToken = await credentialsService.getClientAccessToken(clientId, 'meta');
    const newCampaign = await facebookService.createCampaignInMeta(accessToken, adAccountId, req.body);
    res.status(201).json(newCampaign);
  } catch (error) {
    handleError(res, 'Error al crear la campaña en Meta', error);
  }
};

const deleteCampaignFromMeta = async (req, res) => {
  try {
    const { clientId, campaignId } = req.params;
    const accessToken = await credentialsService.getClientAccessToken(clientId, 'meta');
    await facebookService.deleteMetaAdObject(accessToken, campaignId);
    res.status(200).json({ success: true, message: 'Campaña eliminada de Meta.' });
  } catch (error) {
    handleError(res, 'Error al eliminar la campaña de Meta', error);
  }
};

const getAdSetsForCampaign = async (req, res) => {
  try {
    const { clientId, campaignId } = req.params;
    const accessToken = await credentialsService.getClientAccessToken(clientId, 'meta');
    const adSets = await facebookService.getAdSetsByCampaign(accessToken, campaignId);
    res.status(200).json(adSets);
  } catch (error) {
    handleError(res, 'Error al obtener conjuntos de anuncios', error);
  }
};

const createAdSetForCampaign = async (req, res) => {
  try {
    const { clientId, adAccountId } = req.params;
    const accessToken = await credentialsService.getClientAccessToken(clientId, 'meta');
    const newAdSet = await facebookService.createAdSetInMeta(accessToken, adAccountId, req.body);
    res.status(201).json(newAdSet);
  } catch (error) {
    handleError(res, 'Error al crear conjunto de anuncios', error);
  }
};

const deleteAdSetFromMeta = async (req, res) => {
  try {
    const { clientId, adSetId } = req.params;
    const accessToken = await credentialsService.getClientAccessToken(clientId, 'meta');
    await facebookService.deleteMetaAdObject(accessToken, adSetId);
    res.status(200).json({ success: true, message: 'Conjunto de anuncios eliminado de Meta.' });
  } catch (error) {
    handleError(res, 'Error al eliminar el conjunto de anuncios', error);
  }
};

const uploadImageForAdAccount = async (req, res) => {
  try {
    const { clientId, adAccountId } = req.params;
    const { imageUrl } = req.body;
    const accessToken = await credentialsService.getClientAccessToken(clientId, 'meta');
    const imageHash = await facebookService.uploadImageAndGetHash(accessToken, adAccountId, imageUrl);
    res.status(200).json({ hash: imageHash });
  } catch (error) {
    handleError(res, 'Error al subir la imagen a Meta', error);
  }
};

const createCreativeForAdAccount = async (req, res) => {
  try {
    const { clientId, adAccountId } = req.params;
    const accessToken = await credentialsService.getClientAccessToken(clientId, 'meta');
    const creativeId = await facebookService.createAdCreative(accessToken, adAccountId, req.body);
    res.status(201).json({ id: creativeId });
  } catch (error) {
    handleError(res, 'Error al crear la creatividad en Meta', error);
  }
};

const createAdForAdAccount = async (req, res) => {
  try {
    const { clientId, adAccountId } = req.params;
    const accessToken = await credentialsService.getClientAccessToken(clientId, 'meta');
    const newAd = await facebookService.createAd(accessToken, adAccountId, req.body);
    res.status(201).json(newAd);
  } catch (error) {
    handleError(res, 'Error al crear el anuncio en Meta', error);
  }
};

const getPagesForClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const accessToken = await credentialsService.getClientAccessToken(clientId, 'meta');
    const pages = await facebookService.getFacebookPages(accessToken);
    res.status(200).json(pages);
  } catch (error) {
    handleError(res, 'Error al obtener las páginas de Facebook', error);
  }
};


module.exports = { 
  getAdAccountsForClient, 
  getCampaignsForAdAccount, 
  createCampaignForAdAccount, 
  deleteCampaignFromMeta, 
  getAdSetsForCampaign, 
  createAdSetForCampaign,
  deleteAdSetFromMeta,
  uploadImageForAdAccount,
  createCreativeForAdAccount,
  createAdForAdAccount,
  getPagesForClient,
};
