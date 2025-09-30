// Ubicacion: DCO/apps/backend/src/api/content-plans/plans.controller.js

const planService = require('./plans.service');
const geminiService = require('../../services/gemini.service');
const stabilityService = require('../../services/stability.service');
const credentialsService = require('../api-credentials/credentials.service');
const facebookService = require('../../services/facebook.service');
const ApiError = require('../../utils/ApiError');

// NOTA: Todos los try-catch han sido eliminados. 
// Express 5 maneja los errores en funciones async y los pasa al middleware de error.

const getByClientId = async (req, res) => {
  const { clientId } = req.params;
  const plans = await planService.getPlansByClientId(clientId);
  res.status(200).json(plans);
};

const create = async (req, res) => {
  const newPlan = await planService.createPlan(req.body);
  res.status(201).json(newPlan);
};

const getById = async (req, res) => {
  const { planId } = req.params;
  const plan = await planService.getPlanById(planId);
  if (!plan) {
    throw new ApiError(404, 'Plan de contenido no encontrado.');
  }
  res.status(200).json(plan);
};

const update = async (req, res) => {
  const { planId } = req.params;
  const planDataToUpdate = { ...req.body };

  if (Array.isArray(planDataToUpdate.generated_moodboard)) {
    planDataToUpdate.generated_moodboard = JSON.stringify(planDataToUpdate.generated_moodboard);
  }
  if (Array.isArray(planDataToUpdate.generated_copies)) {
    planDataToUpdate.generated_copies = JSON.stringify(planDataToUpdate.generated_copies);
  }

  const updatedPlan = await planService.updatePlan(planId, planDataToUpdate);
  if (!updatedPlan) {
    throw new ApiError(404, 'Plan no encontrado.');
  }
  res.status(200).json(updatedPlan);
};

const deleteById = async (req, res) => {
  const { planId } = req.params;
  const deletedPlan = await planService.deletePlan(planId);
  if (!deletedPlan) {
    throw new ApiError(404, 'Plan no encontrado.');
  }
  res.status(200).json({ message: 'Plan eliminado' });
};

const generateCopiesForPlan = async (req, res) => {
  const { planId } = req.params;
  const { prompt } = req.body;

  if (!prompt) {
    throw new ApiError(400, 'Se requiere un prompt.');
  }

  const copies = await geminiService.generateMarketingCopies(prompt);
  const updatedPlan = await planService.updatePlan(planId, { generated_copies: JSON.stringify(copies) });
  res.status(200).json(updatedPlan);
};

const generateImageForPlan = async (req, res) => {
  const { planId } = req.params;
  const { prompt } = req.body;

  if (!prompt) {
    throw new ApiError(400, 'Se requiere un prompt.');
  }

  const englishPrompt = await geminiService.translateToEnglish(prompt);
  const imageUrl = await stabilityService.generateMoodboardImage(englishPrompt);

  const currentPlan = await planService.getPlanById(planId);
  if (!currentPlan) {
      throw new ApiError(404, 'Plan no encontrado mientras se actualizaba la imagen.');
  }
  const existingMoodboard = currentPlan.generated_moodboard || [];
  const newMoodboard = [...existingMoodboard, imageUrl];
  const updatedPlan = await planService.updatePlan(planId, { generated_moodboard: newMoodboard });

  res.status(200).json(updatedPlan);
};

const updateStatus = async (req, res) => {
  const { planId } = req.params;
  const { status } = req.body;
  const updatedPlan = await planService.updatePlanStatus(planId, status);
  res.status(200).json(updatedPlan);
};

const getByApprovalToken = async (req, res) => {
  const { token } = req.params;
  const plan = await planService.getPlanByApprovalToken(token);
  if (!plan) {
    throw new ApiError(404, 'Plan de aprobación no encontrado o inválido.');
  }
  res.status(200).json(plan);
};

const updateStatusByToken = async (req, res) => {
  const { token } = req.params;
  const { status, feedback } = req.body;

  if (status !== 'approved' && status !== 'rejected') {
    throw new ApiError(400, 'Estado no válido.');
  }

  const feedbackToSave = status === 'rejected' ? feedback : null;
  const updatedPlan = await planService.updatePlanStatusByToken(token, status, feedbackToSave);
  res.status(200).json(updatedPlan);
};

const createMetaCampaignFromPlan = async (req, res) => {
  const { planId } = req.params;
  const { adAccountId } = req.body;

  const plan = await planService.getPlanById(planId);
  if (!plan) {
    throw new ApiError(404, 'Plan no encontrado.');
  }

  const accessToken = await credentialsService.getClientAccessToken(plan.client_id, 'meta');
  const campaignData = { name: plan.name, objective: 'OUTCOME_TRAFFIC' };
  const newMetaCampaign = await facebookService.createCampaignInMeta(accessToken, adAccountId, campaignData);

  const updatedPlan = await planService.updatePlan(planId, { meta_campaign_id: newMetaCampaign.id });
  res.status(201).json(updatedPlan);
};

const getByMetaCampaignId = async (req, res) => {
  const { metaCampaignId } = req.params;
  const plan = await planService.getPlanByMetaCampaignId(metaCampaignId);
  if (!plan) {
    throw new ApiError(404, 'No se encontró un plan de contenido para esta campaña de Meta.');
  }
  res.status(200).json(plan);
};

module.exports = {
  getByClientId,
  create,
  getById,
  update,
  deleteById,
  generateCopiesForPlan,
  generateImageForPlan,
  updateStatus,
  getByApprovalToken,
  updateStatusByToken,
  createMetaCampaignFromPlan,
  getByMetaCampaignId,
};
