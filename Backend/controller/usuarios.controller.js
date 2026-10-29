const pool = require('../db');

const registrarUsuario = async (req, res) => {
    const { documento_identidad, nombre, apellido, email, telefono, tipo_usuario, estado } = req.body;

    if (!documento_identidad || !nombre || !apellido || !email) {
        return res.status(400).json({ error: 'Documento, nombre, apellido y correo electrónico son requeridos.' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO usuarios (documento_identidad, nombre, apellido, email, telefono, tipo_usuario, estado)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                documento_identidad.trim(),
                nombre.trim(),
                apellido.trim(),
                email.trim(),
                telefono ? telefono.trim() : null,
                tipo_usuario || 'Estudiante',
                estado || 'Activo'
            ]
        );
        res.status(201).json({ mensaje: 'Usuario registrado exitosamente', id: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El documento de identidad o correo ya se encuentra registrado.' });
        }
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al registrar el usuario.' });
    }
};

const obtenerUsuarios = async (req, res) => {
    try {
        const { busqueda, estado, tipo } = req.query;
        let query = `
            SELECT u.*, 
                   COUNT(CASE WHEN p.estado IN ('Activo', 'Vencido') THEN 1 END) AS prestamos_activos
            FROM usuarios u
            LEFT JOIN prestamos p ON u.id_usuario = p.id_usuario
            WHERE 1=1
        `;
        const params = [];

        if (busqueda) {
            query += ` AND (u.nombre LIKE ? OR u.apellido LIKE ? OR u.documento_identidad LIKE ? OR u.email LIKE ?)`;
            const term = `%${busqueda}%`;
            params.push(term, term, term, term);
        }

        if (estado) {
            query += ` AND u.estado = ?`;
            params.push(estado);
        }

        if (tipo) {
            query += ` AND u.tipo_usuario = ?`;
            params.push(tipo);
        }

        query += ` GROUP BY u.id_usuario ORDER BY u.id_usuario DESC`;

        const [usuarios] = await pool.query(query, params);
        res.status(200).json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener usuarios.' });
    }
};

const actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { documento_identidad, nombre, apellido, email, telefono, tipo_usuario, estado } = req.body;

    try {
        const [result] = await pool.query(
            `UPDATE usuarios SET 
                documento_identidad = ?, 
                nombre = ?, 
                apellido = ?, 
                email = ?, 
                telefono = ?, 
                tipo_usuario = ?, 
                estado = ?
             WHERE id_usuario = ?`,
            [documento_identidad, nombre, apellido, email, telefono, tipo_usuario, estado, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        res.status(200).json({ mensaje: 'Usuario actualizado exitosamente.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El documento o correo ya está en uso por otro usuario.' });
        }
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al actualizar el usuario.' });
    }
};

const eliminarUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        // Verificar si tiene préstamos activos
        const [prestamos] = await pool.query(
            "SELECT id_prestamo FROM prestamos WHERE id_usuario = ? AND estado IN ('Activo', 'Vencido')",
            [id]
        );

        if (prestamos.length > 0) {
            return res.status(400).json({ error: 'No se puede eliminar el usuario porque tiene préstamos pendientes.' });
        }

        const [result] = await pool.query('DELETE FROM usuarios WHERE id_usuario = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        res.status(200).json({ mensaje: 'Usuario eliminado exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar el usuario.' });
    }
};

module.exports = { registrarUsuario, obtenerUsuarios, actualizarUsuario, eliminarUsuario };
