const express = require('express');
const router = express.Router();
const { registrarLibro, obtenerLibros, actualizarLibro, eliminarLibro } = require('../controller/libros.controller');

router.post('/', registrarLibro);
router.get('/', obtenerLibros);
router.put('/:id', actualizarLibro);
router.delete('/:id', eliminarLibro);

module.exports = router;