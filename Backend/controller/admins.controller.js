const pool = require('../db');

// Crear un nuevo administrador para acceder al sistema
const crearAdmin = async (req, res) => {
    const { nombre, apellido, email, password, cargo, estado } = req.body;

    if (!nombre || !apellido || !email || !password) {
        return res.status(400).json({ error: 'Nombre, apellido, correo y contraseña son obligatorios.' });
    }

    const emailNormalizado = email.trim().toLowerCase();

    try {
        const [result] = await pool.query(
            `INSERT INTO administradores (nombre, apellido, email, password, cargo, estado)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                nombre.trim(),
                apellido.trim(),
                emailNormalizado,
                password.trim(),
                cargo || 'Bibliotecario',
                estado || 'Activo'
            ]
        );

        res.status(201).json({ 
            mensaje: 'Nuevo administrador creado exitosamente. Ya puede iniciar sesión en el sistema.',
            id_admin: result.insertId 
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El correo electrónico ya está registrado por otro administrador.' });
        }
        console.error('Error al crear administrador:', error);
        res.status(500).json({ error: 'Error interno del servidor al crear administrador.' });
    }
};

// Obtener todos los administradores registrados
const obtenerAdmins = async (req, res) => {
    try {
        const [admins] = await pool.query(`
            SELECT id_admin, nombre, apellido, email, cargo, estado, fecha_creacion 
            FROM administradores 
            ORDER BY id_admin ASC
        `);
        res.status(200).json(admins);
    } catch (error) {
        console.error('Error al obtener administradores:', error);
        res.status(500).json({ error: 'Error al listar administradores.' });
    }
};

// Actualizar datos o contraseña de un administrador
const actualizarAdmin = async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, email, password, cargo, estado } = req.body;

    try {
        let query = `
            UPDATE administradores 
            SET nombre = ?, apellido = ?, email = ?, cargo = ?, estado = ?
        `;
        const params = [nombre.trim(), apellido.trim(), email.trim().toLowerCase(), cargo, estado];

        if (password && password.trim() !== '') {
            query += ', password = ?';
            params.push(password.trim());
        }

        query += ' WHERE id_admin = ?';
        params.push(id);

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Administrador no encontrado.' });
        }

        res.status(200).json({ mensaje: 'Administrador actualizado exitosamente.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El correo electrónico ya está en uso por otro administrador.' });
        }
        console.error('Error al actualizar administrador:', error);
        res.status(500).json({ error: 'Error interno al actualizar el administrador.' });
    }
};

// Eliminar un administrador
const eliminarAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar cuántos administradores activos existen
        const [totalAdmins] = await pool.query('SELECT COUNT(*) as count FROM administradores');
        if (totalAdmins[0].count <= 1) {
            return res.status(400).json({ error: 'No es posible eliminar el único administrador existente en el sistema.' });
        }

        const [result] = await pool.query('DELETE FROM administradores WHERE id_admin = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Administrador no encontrado.' });
        }

        res.status(200).json({ mensaje: 'Administrador eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar administrador:', error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar administrador.' });
    }
};

module.exports = { crearAdmin, obtenerAdmins, actualizarAdmin, eliminarAdmin };
