const mysql = require('mysql2/promise');
require('dotenv').config();

let poolConfig;

// Soporte para URL completa de Aiven / Cloud MySQL (DATABASE_URL o MYSQL_URL)
if (process.env.DATABASE_URL || process.env.MYSQL_URL) {
    const connectionUri = process.env.DATABASE_URL || process.env.MYSQL_URL;
    poolConfig = {
        uri: connectionUri,
        ssl: { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
} else {
    // Configuración por variables individuales (Aiven, Render o Localhost)
    const useSSL = process.env.DB_SSL === 'true' || (process.env.DB_HOST && !process.env.DB_HOST.includes('localhost') && !process.env.DB_HOST.includes('127.0.0.1'));
    
    poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sistema_biblioteca',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ...(useSSL ? { ssl: { rejectUnauthorized: false } } : {})
    };
}

const pool = mysql.createPool(poolConfig);

// Verificar la conexión inicial para diagnóstico en Render / Cloud
pool.getConnection()
    .then(conn => {
        console.log('✅ Conexión exitosa a la base de datos MySQL (Aiven / Local).');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Error conectando a la base de datos MySQL:', err.message);
    });

module.exports = pool;