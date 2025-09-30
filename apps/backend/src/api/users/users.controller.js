// Ubicación: DCO/apps/backend/src/api/users/users.controller.js

const userService = require('./users.service');

// Controlador para obtener todos los usuarios
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 8;
    const searchTerm = req.query.search || ''; // <-- Añadimos esto

    const data = await userService.getAllUsers(page, limit, searchTerm); // <-- Y lo pasamos aquí
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
};

// Controlador para crear un usuario
const createUser = async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    // Manejo de error por si el email ya existe
    if (error.code === '23505') {
      return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
    }
    res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
  }
};

// Controlador para actualizar un usuario
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await userService.updateUser(id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
  }
};

// Controlador para eliminar un usuario
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await userService.deleteUser(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    res.status(200).json({ message: 'Usuario eliminado exitosamente.', user: deletedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};