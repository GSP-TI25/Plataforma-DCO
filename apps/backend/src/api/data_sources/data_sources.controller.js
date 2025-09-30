//Ubicacion: DCO/apps/backend/src/api/data_sources/data_sources.controller.js

const dataSourceService = require('./data_sources.service');
const getDataSources = async (req, res) => {
  try {
    const dataSources = await dataSourceService.getAllDataSources();
    res.status(200).json(dataSources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createDataSource = async (req, res) => {
  try {
    const newDataSource = await dataSourceService.createDataSource(req.body);
    res.status(201).json(newDataSource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDataSources, createDataSource };
