const pool = require('../db');

// Tarifa fija de multa por día de retraso (en pesos / moneda local)
const TARIFA_MULTA_POR_DIA = 1000;

// Requerimiento 3: Registrar un nuevo préstamo
const crearPrestamo = async (req, res) => {
    const { id_libro, id_usuario, fecha_prestamo, fecha_devolucion_esperada, observaciones } = req.body;

    if (!id_libro || !id_usuario || !fecha_prestamo || !fecha_devolucion_esperada) {
        return res.status(400).json({ error: 'Libro, usuario, fecha de préstamo y fecha estimada de devolución son obligatorios.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Validar estado del usuario
        const [usuarios] = await connection.query('SELECT id_usuario, estado, nombre, apellido FROM usuarios WHERE id_usuario = ?', [id_usuario]);
        if (usuarios.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'El usuario seleccionado no existe.' });
        }
        if (usuarios[0].estado !== 'Activo') {
            await connection.rollback();
            return res.status(400).json({ error: `El usuario ${usuarios[0].nombre} ${usuarios[0].apellido} se encuentra en estado "${usuarios[0].estado}" y no puede solicitar préstamos.` });
        }

        // 2. Validar que el usuario no tenga multas pendientes
        const [multasPendientes] = await connection.query(`
            SELECT m.id_multa, m.monto_multa 
            FROM multas m
            JOIN prestamos p ON m.id_prestamo = p.id_prestamo
            WHERE p.id_usuario = ? AND m.estado = 'Pendiente'
        `, [id_usuario]);

        if (multasPendientes.length > 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'El usuario tiene multas pendientes de pago. Debe saldarlas antes de solicitar nuevos préstamos.' });
        }

        // 3. Validar disponibilidad del libro (Requerimiento 2)
        const [libros] = await connection.query('SELECT id_libro, titulo, copias_disponibles FROM libros WHERE id_libro = ? FOR UPDATE', [id_libro]);
        if (libros.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'El libro seleccionado no existe.' });
        }
        if (libros[0].copias_disponibles <= 0) {
            await connection.rollback();
            return res.status(400).json({ error: `El libro "${libros[0].titulo}" no tiene copias disponibles actualmente.` });
        }

        // 4. Insertar el préstamo
        const [prestamoResult] = await connection.query(`
            INSERT INTO prestamos (id_libro, id_usuario, fecha_prestamo, fecha_devolucion_esperada, estado, observaciones)
            VALUES (?, ?, ?, ?, 'Activo', ?)
        `, [id_libro, id_usuario, fecha_prestamo, fecha_devolucion_esperada, observaciones || null]);

        // 5. Decrementar disponibilidad del libro
        await connection.query('UPDATE libros SET copias_disponibles = copias_disponibles - 1 WHERE id_libro = ?', [id_libro]);

        await connection.commit();
        res.status(201).json({ 
            mensaje: 'Préstamo registrado exitosamente.', 
            id_prestamo: prestamoResult.insertId 
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al registrar préstamo:', error);
        res.status(500).json({ error: 'Error interno del servidor al procesar el préstamo.' });
    } finally {
        connection.release();
    }
};

// Requerimiento 3 y 4: Registrar devolución y calcular posibles multas
const registrarDevolucion = async (req, res) => {
    const { id } = req.params;
    const { fecha_devolucion_real, observaciones } = req.body;
    const fechaReal = fecha_devolucion_real || new Date().toISOString().split('T')[0];

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Obtener el préstamo
        const [prestamos] = await connection.query(`
            SELECT p.*, l.titulo, u.nombre, u.apellido 
            FROM prestamos p
            JOIN libros l ON p.id_libro = l.id_libro
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            WHERE p.id_prestamo = ? FOR UPDATE
        `, [id]);

        if (prestamos.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Préstamo no encontrado.' });
        }

        const prestamo = prestamos[0];
        if (prestamo.estado === 'Devuelto') {
            await connection.rollback();
            return res.status(400).json({ error: 'Este préstamo ya fue registrado como devuelto con anterioridad.' });
        }

        // 2. Calcular días de retraso y multa si corresponde (Requerimiento 4)
        const fechaEsperada = new Date(prestamo.fecha_devolucion_esperada);
        const fechaDevolucion = new Date(fechaReal);
        // Diferencia en días enteros
        const diffMs = fechaDevolucion.setHours(0,0,0,0) - fechaEsperada.setHours(0,0,0,0);
        const diasRetraso = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

        let multaGenerada = null;

        // 3. Actualizar préstamo a devuelto
        await connection.query(`
            UPDATE prestamos 
            SET fecha_devolucion_real = ?, 
                estado = 'Devuelto',
                observaciones = COALESCE(CONCAT(COALESCE(observaciones, ''), ' [Devolución: ', ? , ']'), observaciones)
            WHERE id_prestamo = ?
        `, [fechaReal, observaciones || 'Devolución conforme', id]);

        // 4. Reponer copia disponible del libro (Requerimiento 2)
        await connection.query('UPDATE libros SET copias_disponibles = copias_disponibles + 1 WHERE id_libro = ?', [prestamo.id_libro]);

        // 5. Si hubo retraso, registrar la multa correspondiente
        if (diasRetraso > 0) {
            const montoMulta = diasRetraso * TARIFA_MULTA_POR_DIA;
            
            // Comprobar si ya existía una multa previa registrada
            const [existente] = await connection.query('SELECT id_multa FROM multas WHERE id_prestamo = ?', [id]);
            if (existente.length > 0) {
                await connection.query(`
                    UPDATE multas 
                    SET dias_retraso = ?, monto_multa = ?, estado = 'Pendiente'
                    WHERE id_prestamo = ?
                `, [diasRetraso, montoMulta, id]);
                multaGenerada = { diasRetraso, montoMulta, estado: 'Pendiente' };
            } else {
                const [multaRes] = await connection.query(`
                    INSERT INTO multas (id_prestamo, dias_retraso, monto_multa, estado)
                    VALUES (?, ?, ?, 'Pendiente')
                `, [id, diasRetraso, montoMulta]);
                multaGenerada = { id_multa: multaRes.insertId, diasRetraso, montoMulta, estado: 'Pendiente' };
            }
        }

        await connection.commit();

        res.status(200).json({
            mensaje: diasRetraso > 0 
                ? `Devolución procesada con ${diasRetraso} día(s) de retraso. Se generó una multa de $${(diasRetraso * TARIFA_MULTA_POR_DIA).toLocaleString()}.`
                : 'Libro devuelto a tiempo exitosamente.',
            diasRetraso,
            multa: multaGenerada
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al registrar devolución:', error);
        res.status(500).json({ error: 'Error interno del servidor al procesar la devolución.' });
    } finally {
        connection.release();
    }
};

// Requerimiento 3: Listar préstamos activos (y actualizar dinámicamente si vencieron)
const obtenerPrestamosActivos = async (req, res) => {
    try {
        // Actualizar automáticamente a 'Vencido' aquellos activos cuya fecha estimada ya pasó
        await pool.query(`
            UPDATE prestamos 
            SET estado = 'Vencido' 
            WHERE estado = 'Activo' AND fecha_devolucion_esperada < CURDATE()
        `);

        const query = `
            SELECT 
                p.id_prestamo,
                p.fecha_prestamo,
                p.fecha_devolucion_esperada,
                p.estado,
                p.observaciones,
                l.id_libro,
                l.titulo AS libro_titulo,
                l.isbn AS libro_isbn,
                l.portada AS libro_portada,
                u.id_usuario,
                u.documento_identidad AS usuario_documento,
                CONCAT(u.nombre, ' ', u.apellido) AS usuario_nombre,
                u.email AS usuario_email,
                u.telefono AS usuario_telefono,
                DATEDIFF(CURDATE(), p.fecha_devolucion_esperada) AS dias_transcurridos_esperada,
                CASE 
                    WHEN p.fecha_devolucion_esperada < CURDATE() 
                    THEN DATEDIFF(CURDATE(), p.fecha_devolucion_esperada) * ?
                    ELSE 0 
                END AS multa_estimada,
                m.id_multa,
                m.monto_multa AS multa_registrada,
                m.estado AS multa_estado
            FROM prestamos p
            JOIN libros l ON p.id_libro = l.id_libro
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN multas m ON p.id_prestamo = m.id_prestamo
            WHERE p.estado IN ('Activo', 'Vencido')
            ORDER BY p.fecha_devolucion_esperada ASC
        `;

        const [prestamos] = await pool.query(query, [TARIFA_MULTA_POR_DIA]);
        res.status(200).json(prestamos);
    } catch (error) {
        console.error('Error al obtener préstamos activos:', error);
        res.status(500).json({ error: 'Error al obtener los préstamos activos.' });
    }
};

// Requerimiento 4: Identificar préstamos vencidos y calcular posibles multas
const obtenerPrestamosVencidos = async (req, res) => {
    try {
        // Actualizamos préstamos vencidos
        await pool.query(`
            UPDATE prestamos 
            SET estado = 'Vencido' 
            WHERE estado = 'Activo' AND fecha_devolucion_esperada < CURDATE()
        `);

        const query = `
            SELECT 
                p.id_prestamo,
                p.fecha_prestamo,
                p.fecha_devolucion_esperada,
                p.fecha_devolucion_real,
                p.estado,
                l.id_libro,
                l.titulo AS libro_titulo,
                l.isbn AS libro_isbn,
                l.portada AS libro_portada,
                u.id_usuario,
                u.documento_identidad AS usuario_documento,
                CONCAT(u.nombre, ' ', u.apellido) AS usuario_nombre,
                u.email AS usuario_email,
                u.telefono AS usuario_telefono,
                GREATEST(0, DATEDIFF(COALESCE(p.fecha_devolucion_real, CURDATE()), p.fecha_devolucion_esperada)) AS dias_mora,
                COALESCE(m.monto_multa, GREATEST(0, DATEDIFF(COALESCE(p.fecha_devolucion_real, CURDATE()), p.fecha_devolucion_esperada)) * ?) AS monto_multa,
                COALESCE(m.estado, 'Pendiente') AS multa_estado,
                m.id_multa
            FROM prestamos p
            JOIN libros l ON p.id_libro = l.id_libro
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN multas m ON p.id_prestamo = m.id_prestamo
            WHERE (p.estado = 'Vencido' OR (p.estado = 'Devuelto' AND m.id_multa IS NOT NULL))
            ORDER BY dias_mora DESC, p.fecha_devolucion_esperada ASC
        `;

        const [vencidos] = await pool.query(query, [TARIFA_MULTA_POR_DIA]);
        res.status(200).json({
            tarifaDiaria: TARIFA_MULTA_POR_DIA,
            totalVencidos: vencidos.length,
            prestamosVencidos: vencidos
        });
    } catch (error) {
        console.error('Error al obtener préstamos vencidos:', error);
        res.status(500).json({ error: 'Error al consultar préstamos vencidos y multas.' });
    }
};

// Requerimiento 5: Consultar el historial general de préstamos con filtros
const obtenerHistorialPrestamos = async (req, res) => {
    try {
        const { estado, busqueda, desde, hasta } = req.query;

        let query = `
            SELECT 
                p.id_prestamo,
                p.fecha_prestamo,
                p.fecha_devolucion_esperada,
                p.fecha_devolucion_real,
                p.estado,
                p.observaciones,
                l.id_libro,
                l.titulo AS libro_titulo,
                l.isbn AS libro_isbn,
                l.editorial AS libro_editorial,
                u.id_usuario,
                u.documento_identidad AS usuario_documento,
                CONCAT(u.nombre, ' ', u.apellido) AS usuario_nombre,
                u.tipo_usuario,
                m.id_multa,
                m.dias_retraso,
                m.monto_multa,
                m.estado AS multa_estado
            FROM prestamos p
            JOIN libros l ON p.id_libro = l.id_libro
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN multas m ON p.id_prestamo = m.id_prestamo
            WHERE 1=1
        `;
        const params = [];

        if (estado && estado !== 'Todos') {
            query += ' AND p.estado = ?';
            params.push(estado);
        }

        if (busqueda) {
            query += ` AND (l.titulo LIKE ? OR l.isbn LIKE ? OR u.nombre LIKE ? OR u.apellido LIKE ? OR u.documento_identidad LIKE ?)`;
            const term = `%${busqueda}%`;
            params.push(term, term, term, term, term);
        }

        if (desde) {
            query += ' AND p.fecha_prestamo >= ?';
            params.push(desde);
        }

        if (hasta) {
            query += ' AND p.fecha_prestamo <= ?';
            params.push(hasta);
        }

        query += ' ORDER BY p.id_prestamo DESC';

        const [historial] = await pool.query(query, params);
        res.status(200).json(historial);
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ error: 'Error al consultar el historial de préstamos.' });
    }
};

// Cambiar estado de una multa (Pagada o Condonada)
const actualizarEstadoMulta = async (req, res) => {
    const { id } = req.params; // id_multa
    const { nuevo_estado } = req.body; // 'Pagada' o 'Condonada' o 'Pendiente'

    if (!['Pagada', 'Condonada', 'Pendiente'].includes(nuevo_estado)) {
        return res.status(400).json({ error: 'Estado de multa inválido.' });
    }

    try {
        const [result] = await pool.query('UPDATE multas SET estado = ? WHERE id_multa = ?', [nuevo_estado, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Multa no encontrada.' });
        }
        res.status(200).json({ mensaje: `Multa actualizada a estado "${nuevo_estado}".` });
    } catch (error) {
        console.error('Error al actualizar multa:', error);
        res.status(500).json({ error: 'Error al actualizar el estado de la multa.' });
    }
};

// Métricas generales para el Dashboard
const obtenerMetricasDashboard = async (req, res) => {
    try {
        const [librosCount] = await pool.query('SELECT COUNT(*) AS total_libros, COALESCE(SUM(copias_totales),0) AS total_ejemplares, COALESCE(SUM(copias_disponibles),0) AS total_disponibles FROM libros');
        const [usuariosCount] = await pool.query("SELECT COUNT(*) AS total_usuarios, COUNT(CASE WHEN estado = 'Activo' THEN 1 END) AS usuarios_activos FROM usuarios");
        const [prestamosActivos] = await pool.query("SELECT COUNT(*) AS total FROM prestamos WHERE estado = 'Activo'");
        const [prestamosVencidos] = await pool.query("SELECT COUNT(*) AS total FROM prestamos WHERE estado = 'Vencido' OR (estado = 'Activo' AND fecha_devolucion_esperada < CURDATE())");
        const [multasInfo] = await pool.query("SELECT COUNT(*) AS total_multas, COALESCE(SUM(CASE WHEN estado = 'Pendiente' THEN monto_multa ELSE 0 END), 0) AS total_monto_pendiente FROM multas");

        res.status(200).json({
            libros: librosCount[0],
            usuarios: usuariosCount[0],
            prestamosActivos: prestamosActivos[0].total,
            prestamosVencidos: prestamosVencidos[0].total,
            multas: multasInfo[0]
        });
    } catch (error) {
        console.error('Error al obtener métricas:', error);
        res.status(500).json({ error: 'Error al calcular las métricas del dashboard.' });
    }
};

module.exports = {
    crearPrestamo,
    registrarDevolucion,
    obtenerPrestamosActivos,
    obtenerPrestamosVencidos,
    obtenerHistorialPrestamos,
    actualizarEstadoMulta,
    obtenerMetricasDashboard
};
