const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { autoMigrateDatabase } = require('./auto_migrate');
const authRoutes = require('./routes/auth.routes');
const adminsRoutes = require('./routes/admins.routes');
const librosRoutes = require('./routes/libros.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const prestamosRoutes = require('./routes/prestamos.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Endpoint de prueba y salud para Render
app.get('/', (req, res) => {
    res.json({
        estado: 'online',
        mensaje: 'API del Sistema de Biblioteca Institucional activa',
        version: '2.0.0'
    });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Endpoints del sistema
app.use('/api/auth', authRoutes);
app.use('/api/admins', adminsRoutes);
app.use('/api/libros', librosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/prestamos', prestamosRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
    console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`);
    // Ejecutar verificación y migración automática de tablas en la base de datos (Aiven/Cloud)
    await autoMigrateDatabase();
});