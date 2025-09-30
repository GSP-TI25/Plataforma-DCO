// Ubicación: DCO/apps/backend/src/api/api-credentials/credentials.controller.js
const credentialService = require('./credentials.service');

const getByClientId = async (req, res) => {
  try {
    const { clientId } = req.params;
    const credentials = await credentialService.getCredentialsByClientId(clientId);
    res.status(200).json(credentials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const newCredential = await credentialService.createCredential(req.body);
    res.status(201).json(newCredential);
  } catch (error) {
    if (error.code === '23505') { // Error de índice único
      return res.status(409).json({ message: 'Ya existe una credencial para esta plataforma y cliente.' });
    }
    res.status(500).json({ message: error.message });
  }
};

const deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await credentialService.deleteCredential(id);
    if (!deleted) return res.status(404).json({ message: 'Credencial no encontrada' });
    res.status(200).json({ message: 'Credencial eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getByClientId, create, deleteById };