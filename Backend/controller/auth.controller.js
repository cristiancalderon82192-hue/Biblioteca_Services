const pool = require('../db');

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Por favor ingresa tu correo de administrador y contraseña.' });
    }

    const emailNormalizado = email.trim().toLowerCase();

    try {
        // Consultar en la tabla de administradores del sistema
        const [admins] = await pool.query(
            'SELECT * FROM administradores WHERE LOWER(email) = ?',
            [emailNormalizado]
        );

        if (admins.length === 0) {
            return res.status(401).json({ 
                error: 'Acceso denegado. No existe un administrador registrado con este correo.' 
            });
        }

        const admin = admins[0];

        // Validar contraseña
        if (admin.password !== password) {
            return res.status(401).json({ error: 'Contraseña incorrecta.' });
        }

        // Validar estado de la cuenta
        if (admin.estado !== 'Activo') {
            return res.status(403).json({ 
                error: 'Tu cuenta de administrador se encuentra inactiva. Contacta al Administrador Principal.' 
            });
        }

        return res.status(200).json({
            mensaje: `Bienvenido al sistema, ${admin.nombre} ${admin.apellido}.`,
            token: 'token-admin-' + admin.id_admin + '-' + Date.now(),
            usuario: {
                id_admin: admin.id_admin,
                nombre: admin.nombre,
                apellido: admin.apellido,
                email: admin.email,
                cargo: admin.cargo,
                rol: admin.cargo || 'Administrador',
                avatar: `${admin.nombre.charAt(0)}${admin.apellido.charAt(0)}`
            }
        });

    } catch (error) {
        console.error('Error en autenticación de administrador:', error);
        res.status(500).json({ error: error.message || 'Error interno del servidor al procesar el inicio de sesión.' });
    }
};

module.exports = { login };
