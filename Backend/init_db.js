const pool = require('./db');

async function initializeDatabase() {
    console.log('Iniciando migración y configuración de base de datos...');
    
    try {
        // 1. Verificar si existen columnas copias_totales y copias_disponibles en libros
        const [columns] = await pool.query("SHOW COLUMNS FROM libros LIKE 'copias_totales'");
        if (columns.length === 0) {
            console.log('Agregando columnas copias_totales y copias_disponibles a libros...');
            await pool.query(`
                ALTER TABLE libros 
                ADD COLUMN copias_totales INT NOT NULL DEFAULT 1,
                ADD COLUMN copias_disponibles INT NOT NULL DEFAULT 1
            `);
            console.log('Columnas añadidas exitosamente a libros.');
        } else {
            console.log('Las columnas de copias ya existen en libros.');
        }

        // 2. Crear tabla usuarios
        console.log('Creando tabla usuarios si no existe...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id_usuario INT AUTO_INCREMENT PRIMARY KEY,
                documento_identidad VARCHAR(20) NOT NULL UNIQUE,
                nombre VARCHAR(100) NOT NULL,
                apellido VARCHAR(100) NOT NULL,
                email VARCHAR(120) NOT NULL UNIQUE,
                telefono VARCHAR(20),
                tipo_usuario ENUM('Estudiante', 'Docente', 'Administrativo', 'Externo') DEFAULT 'Estudiante',
                estado ENUM('Activo', 'Suspendido', 'Inactivo') DEFAULT 'Activo',
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Tabla usuarios verificada/creada.');

        // 3. Crear tabla prestamos
        console.log('Creando tabla prestamos si no existe...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS prestamos (
                id_prestamo INT AUTO_INCREMENT PRIMARY KEY,
                id_libro INT NOT NULL,
                id_usuario INT NOT NULL,
                fecha_prestamo DATE NOT NULL,
                fecha_devolucion_esperada DATE NOT NULL,
                fecha_devolucion_real DATE NULL,
                estado ENUM('Activo', 'Devuelto', 'Vencido') DEFAULT 'Activo',
                observaciones TEXT NULL,
                FOREIGN KEY (id_libro) REFERENCES libros(id_libro) ON DELETE RESTRICT,
                FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT
            )
        `);
        console.log('Tabla prestamos verificada/creada.');

        // 4. Crear tabla multas
        console.log('Creando tabla multas si no existe...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS multas (
                id_multa INT AUTO_INCREMENT PRIMARY KEY,
                id_prestamo INT NOT NULL UNIQUE,
                dias_retraso INT NOT NULL DEFAULT 0,
                monto_multa DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                estado ENUM('Pendiente', 'Pagada', 'Condonada') DEFAULT 'Pendiente',
                fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_prestamo) REFERENCES prestamos(id_prestamo) ON DELETE CASCADE
            )
        `);
        console.log('Tabla multas verificada/creada.');

        console.log('✅ Base de datos inicializada correctamente.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
        process.exit(1);
    }
}

initializeDatabase();
