//Ubicacion:  DCO/apps/backend/src/api/generator/generator.controller.js

const generatorService = require('./generator.service');
const generate = async (req, res) => {
  try {
    const result = await generatorService.generateCreatives(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error en el controlador del generador:', error);
    res.status(500).json({ message: error.message });
  }
};
module.exports = { generate };