// Ubicación: DCO/apps/backend/src/api/clients/clients.controller.js

const clientService = require('./clients.service');

const getClients = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 8;
    const data = await clientService.getAllClients(page, limit);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener clientes', error: error.message });
  }
};

const createClient = async (req, res) => {
  try {
    const newClient = await clientService.createClient(req.body);
    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el cliente', error: error.message });
  }
};

const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedClient = await clientService.updateClient(id, req.body);
    if (!updatedClient) return res.status(404).json({ message: 'Cliente no encontrado.' });
    res.status(200).json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el cliente', error: error.message });
  }
};

const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedClient = await clientService.deleteClient(id);
    if (!deletedClient) return res.status(404).json({ message: 'Cliente no encontrado.' });
    res.status(200).json({ message: 'Cliente eliminado.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el cliente', error: error.message });
  }
};

module.exports = {
  getClients,
  createClient,
  updateClient,
  deleteClient,
};