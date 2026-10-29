const pool = require('../db');

const registrarLibro = async (req, res) => {
    const { 
        isbn, titulo, subtitulo, anio_publicacion, edicion, 
        editorial, idioma, descripcion, numero_paginas, ubicacion, portada,
        copias_totales
    } = req.body;

    const totalCopias = parseInt(copias_totales, 10) || 1;
    const disponibles = totalCopias;

    try {
        const [result] = await pool.query(
            `INSERT INTO libros (isbn, titulo, subtitulo, anio_publicacion, edicion, editorial, idioma, descripcion, numero_paginas, ubicacion, portada, copias_totales, copias_disponibles) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [isbn, titulo, subtitulo, anio_publicacion, edicion, editorial, idioma, descripcion, numero_paginas, ubicacion, portada, totalCopias, disponibles]
        );
        res.status(201).json({ mensaje: 'Libro registrado exitosamente', id: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El ISBN ya está registrado en el sistema' });
        }
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const obtenerLibros = async (req, res) => {
    try {
        const { disponibilidad, busqueda } = req.query;
        let query = 'SELECT * FROM libros WHERE 1=1';
        const params = [];

        if (disponibilidad === 'disponible') {
            query += ' AND copias_disponibles > 0';
        } else if (disponibilidad === 'agotado') {
            query += ' AND copias_disponibles = 0';
        }

        if (busqueda) {
            query += ' AND (titulo LIKE ? OR isbn LIKE ? OR editorial LIKE ?)';
            const term = `%${busqueda}%`;
            params.push(term, term, term);
        }

        query += ' ORDER BY id_libro DESC';

        const [libros] = await pool.query(query, params);
        res.status(200).json(libros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los libros' });
    }
};

const actualizarLibro = async (req, res) => {
    const { id } = req.params;
    const { 
        isbn, titulo, subtitulo, anio_publicacion, edicion, 
        editorial, idioma, descripcion, numero_paginas, ubicacion, portada,
        copias_totales, copias_disponibles 
    } = req.body;
    
    try {
        // Obtenemos el libro actual para mantener consistencia de copias si no vienen
        const [actual] = await pool.query('SELECT copias_totales, copias_disponibles FROM libros WHERE id_libro = ?', [id]);
        if (actual.length === 0) {
            return res.status(404).json({ error: 'Libro no encontrado' });
        }

        const totalCopias = copias_totales !== undefined ? parseInt(copias_totales, 10) : actual[0].copias_totales;
        // Ajustamos las copias disponibles si cambia el total
        let disponibles = copias_disponibles !== undefined ? parseInt(copias_disponibles, 10) : actual[0].copias_disponibles;
        if (disponibles > totalCopias) disponibles = totalCopias;

        const [result] = await pool.query(
            `UPDATE libros SET 
                isbn = ?, titulo = ?, subtitulo = ?, anio_publicacion = ?, 
                edicion = ?, editorial = ?, idioma = ?, descripcion = ?, 
                numero_paginas = ?, ubicacion = ?, portada = ?,
                copias_totales = ?, copias_disponibles = ? 
             WHERE id_libro = ?`,
            [isbn, titulo, subtitulo, anio_publicacion, edicion, editorial, idioma, descripcion, numero_paginas, ubicacion, portada, totalCopias, disponibles, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Libro no encontrado' });
        }
        res.status(200).json({ mensaje: 'Libro actualizado exitosamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El ISBN ya está registrado en otro libro' });
        }
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const eliminarLibro = async (req, res) => {
    const { id } = req.params;
    try {
        // Verificar si tiene préstamos activos
        const [prestamosActivos] = await pool.query(
            "SELECT id_prestamo FROM prestamos WHERE id_libro = ? AND estado IN ('Activo', 'Vencido')", 
            [id]
        );
        if (prestamosActivos.length > 0) {
            return res.status(400).json({ error: 'No se puede eliminar el libro porque tiene préstamos en curso.' });
        }

        const [result] = await pool.query('DELETE FROM libros WHERE id_libro = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Libro no encontrado' });
        }
        res.status(200).json({ mensaje: 'Libro eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar el libro' });
    }
};

module.exports = { registrarLibro, obtenerLibros, actualizarLibro, eliminarLibro };