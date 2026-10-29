const pool = require('./db');

async function seedData() {
    try {
        const [usuarios] = await pool.query('SELECT COUNT(*) as count FROM usuarios');
        if (usuarios[0].count === 0) {
            console.log('Insertando usuarios de prueba...');
            await pool.query(`
                INSERT INTO usuarios (documento_identidad, nombre, apellido, email, telefono, tipo_usuario, estado) VALUES
                ('10203040', 'Carlos', 'Gómez', 'carlos.gomez@universidad.edu', '3001234567', 'Estudiante', 'Activo'),
                ('20304050', 'María', 'Fernández', 'maria.fernandez@universidad.edu', '3109876543', 'Docente', 'Activo'),
                ('30405060', 'Andrés', 'Rodríguez', 'andres.rodriguez@universidad.edu', '3205557788', 'Estudiante', 'Activo'),
                ('40506070', 'Laura', 'Pérez', 'laura.perez@universidad.edu', '3154443322', 'Administrativo', 'Activo')
            `);
            console.log('Usuarios de prueba insertados con éxito.');
        } else {
            console.log('Ya existen usuarios registrados en la base de datos.');
        }

        // Aseguramos que los libros existentes tengan copias disponibles > 0
        await pool.query(`
            UPDATE libros 
            SET copias_totales = GREATEST(copias_totales, 3), 
                copias_disponibles = GREATEST(copias_disponibles, 3) 
            WHERE copias_totales <= 1
        `);
        console.log('Stock de copias verificado en libros.');

        process.exit(0);
    } catch (error) {
        console.error('Error al insertar datos de prueba:', error);
        process.exit(1);
    }
}

seedData();
