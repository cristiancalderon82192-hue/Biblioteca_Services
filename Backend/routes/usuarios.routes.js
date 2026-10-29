const express = require('express');
const router = express.Router();
const { registrarUsuario, obtenerUsuarios, actualizarUsuario, eliminarUsuario } = require('../controller/usuarios.controller');

router.post('/', registrarUsuario);
router.get('/', obtenerUsuarios);
router.put('/:id', actualizarUsuario);
router.delete('/:id', eliminarUsuario);

module.exports = router;
