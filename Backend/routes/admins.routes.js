const express = require('express');
const router = express.Router();
const { crearAdmin, obtenerAdmins, actualizarAdmin, eliminarAdmin } = require('../controller/admins.controller');

router.post('/', crearAdmin);
router.get('/', obtenerAdmins);
router.put('/:id', actualizarAdmin);
router.delete('/:id', eliminarAdmin);

module.exports = router;
