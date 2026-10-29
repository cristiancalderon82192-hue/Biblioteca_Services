const express = require('express');
const router = express.Router();
const {
    crearPrestamo,
    registrarDevolucion,
    obtenerPrestamosActivos,
    obtenerPrestamosVencidos,
    obtenerHistorialPrestamos,
    actualizarEstadoMulta,
    obtenerMetricasDashboard
} = require('../controller/prestamos.controller');

// Requerimiento 3: Registrar préstamo y devoluciones
router.post('/', crearPrestamo);
router.put('/:id/devolucion', registrarDevolucion);

// Requerimiento 3: Préstamos activos
router.get('/activos', obtenerPrestamosActivos);

// Requerimiento 4: Préstamos vencidos y cálculo de multas
router.get('/vencidos', obtenerPrestamosVencidos);
router.put('/multas/:id', actualizarEstadoMulta);

// Requerimiento 5: Historial de préstamos
router.get('/historial', obtenerHistorialPrestamos);

// Métricas agregadas para Dashboard
router.get('/metricas', obtenerMetricasDashboard);

module.exports = router;
