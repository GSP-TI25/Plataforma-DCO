const { Router } = require('express');
const controller = require('./download.controller');
const verificarToken = require('../../middleware/auth.middleware');

const router = Router();
//router.use(verificarToken);


router.get('/', controller.downloadFromUrl);

module.exports = router;