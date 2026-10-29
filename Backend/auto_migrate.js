const pool = require('./db');

async function autoMigrateDatabase(intentos = 5) {
    for (let i = 1; i <= intentos; i++) {
        try {
            console.log(`🔄 [Intento ${i}/${intentos}] Verificando conexión y esquema de base de datos...`);

            // 1. Crear tabla libros si no existe
            await pool.query(`
                CREATE TABLE IF NOT EXISTS libros (
                    id_libro INT AUTO_INCREMENT PRIMARY KEY,
                    isbn VARCHAR(17) NOT NULL UNIQUE,
                    titulo VARCHAR(200) NOT NULL,
                    subtitulo VARCHAR(200) NULL,
                    anio_publicacion SMALLINT NOT NULL,
                    edicion VARCHAR(30) NULL,
                    editorial VARCHAR(100) NOT NULL,
                    idioma VARCHAR(30) NOT NULL,
                    descripcion TEXT NULL,
                    numero_paginas INT NULL,
                    ubicacion VARCHAR(100) NOT NULL,
                    portada TEXT NULL,
                    copias_totales INT NOT NULL DEFAULT 1,
                    copias_disponibles INT NOT NULL DEFAULT 1
                )
            `);

            // Verificar columnas de copias si libros fue creada en una versión anterior
            const [columnasLibros] = await pool.query("SHOW COLUMNS FROM libros LIKE 'copias_totales'");
            if (columnasLibros.length === 0) {
                await pool.query(`
                    ALTER TABLE libros 
                    ADD COLUMN copias_totales INT NOT NULL DEFAULT 1,
                    ADD COLUMN copias_disponibles INT NOT NULL DEFAULT 1
                `);
            }

            // 2. Crear tabla usuarios institucionales
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

            // 3. Crear tabla prestamos
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

            // 4. Crear tabla multas
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

            // 5. Crear tabla administradores
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

            // Seed: Administrador Principal por defecto si no hay ninguno
            const [admins] = await pool.query('SELECT COUNT(*) as count FROM administradores');
            if (admins[0].count === 0) {
                await pool.query(`
                    INSERT INTO administradores (nombre, apellido, email, password, cargo, estado)
                    VALUES ('Admin', 'Principal', 'admin@universidad.edu', 'admin123', 'Administrador General', 'Activo')
                `);
                console.log('👑 Administrador principal inicializado (admin@universidad.edu / admin123).');
            }

            // Seed: Libros iniciales para el catálogo si no hay ninguno
            const [librosCount] = await pool.query('SELECT COUNT(*) as count FROM libros');
            if (librosCount[0].count === 0) {
                await pool.query(`
                    INSERT INTO libros (isbn, titulo, subtitulo, anio_publicacion, edicion, editorial, idioma, descripcion, numero_paginas, ubicacion, portada, copias_totales, copias_disponibles)
                    VALUES 
                    ('978-0132350884', 'Clean Code', 'A Handbook of Agile Software Craftsmanship', 2008, '1st Edition', 'Prentice Hall', 'Inglés', 'La guía canónica de buenas prácticas y código limpio para desarrolladores de software profesional.', 464, 'Estante A-12', 'https://images-na.ssl-images-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg', 5, 5),
                    ('978-0201633610', 'Design Patterns', 'Elements of Reusable Object-Oriented Software', 1994, '1ra Edición', 'Addison-Wesley', 'Inglés', 'Catálogo de soluciones probadas y patrones de arquitectura de software fundamentales.', 395, 'Estante B-04', 'https://images-na.ssl-images-amazon.com/images/I/51szD9HC9pL._SX395_BO1,204,203,200_.jpg', 4, 4),
                    ('978-0131103627', 'The C Programming Language', 'ANSI C Version', 1988, '2nd Edition', 'Prentice Hall', 'Inglés', 'La guía canónica del lenguaje C escrita por los propios creadores Brian Kernighan y Dennis Ritchie.', 272, 'Estante C-01', 'https://images-na.ssl-images-amazon.com/images/I/41as+WaA2yL._SX379_BO1,204,203,200_.jpg', 3, 3)
                `);
                console.log('📚 Libros iniciales insertados en la base de datos.');
            }

            // Seed: Usuarios iniciales si no hay ninguno
            const [usuariosCount] = await pool.query('SELECT COUNT(*) as count FROM usuarios');
            if (usuariosCount[0].count === 0) {
                await pool.query(`
                    INSERT INTO usuarios (documento_identidad, nombre, apellido, email, telefono, tipo_usuario, estado) VALUES
                    ('10203040', 'Carlos', 'Gómez', 'carlos.gomez@universidad.edu', '3001234567', 'Estudiante', 'Activo'),
                    ('20304050', 'María', 'Fernández', 'maria.fernandez@universidad.edu', '3109876543', 'Docente', 'Activo')
                `);
                console.log('👥 Usuarios iniciales creados.');
            }

            console.log('✅ Esquema y tablas de base de datos sincronizadas correctamente.');
            return { success: true };
        } catch (error) {
            console.error(`⚠️ Error en intento ${i} de migración:`, error.message);
            if (i < intentos) {
                console.log('Esperando 3 segundos antes de reintentar...');
                await new Promise(r => setTimeout(r, 3000));
            } else {
                return { success: false, error: error.message };
            }
        }
    }
}

module.exports = { autoMigrateDatabase };
