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

// Diagnóstico de base de datos en la nube (Render / Aiven)
app.get('/api/debug-db', async (req, res) => {
    try {
        const pool = require('./db');
        const [tables] = await pool.query('SHOW TABLES');
        res.status(200).json({
            status: 'Conectado a MySQL exitosamente',
            tablas_encontradas: tables.map(t => Object.values(t)[0])
        });
    } catch (err) {
        res.status(500).json({
            status: 'Error conectando a MySQL',
            mensaje: err.message,
            codigo: err.code
        });
    }
});

// Forzar migración y creación de tablas y datos semilla bajo demanda
app.get('/api/debug-migrate', async (req, res) => {
    try {
        const resultado = await autoMigrateDatabase(3);
        res.status(200).json({
            mensaje: 'Migración ejecutada',
            resultado
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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