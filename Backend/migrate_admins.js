const pool = require('./db');

async function migrateAdmins() {
    try {
        console.log('Creando tabla administradores si no existe...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS administradores (
                id_admin INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                apellido VARCHAR(100) NOT NULL,
                email VARCHAR(120) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                cargo VARCHAR(100) DEFAULT 'Bibliotecario',
                estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Tabla administradores lista.');

        // Insertar admin maestro por defecto si la tabla está vacía
        const [admins] = await pool.query('SELECT COUNT(*) as count FROM administradores');
        if (admins[0].count === 0) {
            await pool.query(`
                INSERT INTO administradores (nombre, apellido, email, password, cargo, estado)
                VALUES ('Admin', 'Principal', 'admin@universidad.edu', 'admin123', 'Administrador General', 'Activo')
            `);
            console.log('Administrador principal insertado por defecto.');
        } else {
            console.log('Ya existen administradores en la tabla.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error migrando administradores:', error);
        process.exit(1);
    }
}

migrateAdmins();
