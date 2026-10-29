import { useState, useEffect, useRef } from 'react';
import api from '../api/config';

const GestionPrestamos = ({ libroPreseleccionado, onLimpiarLibroPreseleccionado }) => {
    const [prestamos, setPrestamos] = useState([]);
    const [libros, setLibros] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal nuevo préstamo
    const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
    const [nuevoPrestamo, setNuevoPrestamo] = useState({
        id_libro: '',
        id_usuario: '',
        fecha_prestamo: new Date().toISOString().split('T')[0],
        fecha_devolucion_esperada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observaciones: ''
    });

    // Estados de búsqueda interactiva de libro y usuario en el modal
    const [busquedaLibroModal, setBusquedaLibroModal] = useState('');
    const [libroSeleccionado, setLibroSeleccionado] = useState(null);
    const [mostrarSugerenciasLibro, setMostrarSugerenciasLibro] = useState(false);

    const [busquedaUsuarioModal, setBusquedaUsuarioModal] = useState('');
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [mostrarSugerenciasUsuario, setMostrarSugerenciasUsuario] = useState(false);

    const libroRef = useRef(null);
    const usuarioRef = useRef(null);

    // Modal devolución
    const [prestamoDevolver, setPrestamoDevolver] = useState(null);
    const [observacionDevolucion, setObservacionDevolucion] = useState('');
    
    // Notificación
    const [notificacion, setNotificacion] = useState({ visible: false, tipo: '', mensaje: '' });

    const notificar = (tipo, mensaje) => {
        setNotificacion({ visible: true, tipo, mensaje });
        setTimeout(() => setNotificacion({ visible: false, tipo: '', mensaje: '' }), 5000);
    };

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [resPrestamos, resLibros, resUsuarios] = await Promise.all([
                api.get('/api/prestamos/activos'),
                api.get('/api/libros'),
                api.get('/api/usuarios')
            ]);
            setPrestamos(resPrestamos.data);
            setLibros(resLibros.data);
            setUsuarios(resUsuarios.data);
        } catch (error) {
            console.error('Error al cargar datos de préstamos:', error);
            notificar('error', 'Error al cargar la información de préstamos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    // Manejar clics fuera de los dropdowns de búsqueda
    useEffect(() => {
        const handleClickAfuera = (e) => {
            if (libroRef.current && !libroRef.current.contains(e.target)) {
                setMostrarSugerenciasLibro(false);
            }
            if (usuarioRef.current && !usuarioRef.current.contains(e.target)) {
                setMostrarSugerenciasUsuario(false);
            }
        };
        document.addEventListener('mousedown', handleClickAfuera);
        return () => document.removeEventListener('mousedown', handleClickAfuera);
    }, []);

    // Si viene un libro preseleccionado desde el inventario
    useEffect(() => {
        if (libroPreseleccionado) {
            setLibroSeleccionado(libroPreseleccionado);
            setNuevoPrestamo(prev => ({ ...prev, id_libro: libroPreseleccionado.id_libro }));
            setMostrarModalNuevo(true);
            if (onLimpiarLibroPreseleccionado) {
                onLimpiarLibroPreseleccionado();
            }
        }
    }, [libroPreseleccionado]);

    const seleccionarLibro = (libro) => {
        setLibroSeleccionado(libro);
        setNuevoPrestamo(prev => ({ ...prev, id_libro: libro.id_libro }));
        setBusquedaLibroModal('');
        setMostrarSugerenciasLibro(false);
    };

    const quitarLibroSeleccionado = () => {
        setLibroSeleccionado(null);
        setNuevoPrestamo(prev => ({ ...prev, id_libro: '' }));
        setBusquedaLibroModal('');
    };

    const seleccionarUsuario = (usuario) => {
        setUsuarioSeleccionado(usuario);
        setNuevoPrestamo(prev => ({ ...prev, id_usuario: usuario.id_usuario }));
        setBusquedaUsuarioModal('');
        setMostrarSugerenciasUsuario(false);
    };

    const quitarUsuarioSeleccionado = () => {
        setUsuarioSeleccionado(null);
        setNuevoPrestamo(prev => ({ ...prev, id_usuario: '' }));
        setBusquedaUsuarioModal('');
    };

    const setDiasPlazo = (dias) => {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + dias);
        setNuevoPrestamo({ ...nuevoPrestamo, fecha_devolucion_esperada: fecha.toISOString().split('T')[0] });
    };

    const limpiarModalPrestamo = () => {
        setNuevoPrestamo({
            id_libro: '',
            id_usuario: '',
            fecha_prestamo: new Date().toISOString().split('T')[0],
            fecha_devolucion_esperada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            observaciones: ''
        });
        setLibroSeleccionado(null);
        setUsuarioSeleccionado(null);
        setBusquedaLibroModal('');
        setBusquedaUsuarioModal('');
        setMostrarModalNuevo(false);
    };

    const handleCrearPrestamo = async (e) => {
        e.preventDefault();
        if (!nuevoPrestamo.id_libro) {
            notificar('error', 'Por favor busca y selecciona un libro disponible.');
            return;
        }
        if (!nuevoPrestamo.id_usuario) {
            notificar('error', 'Por favor busca y selecciona un usuario institucional por nombre o cédula.');
            return;
        }

        try {
            const res = await api.post('/api/prestamos', nuevoPrestamo);
            notificar('success', res.data.mensaje || 'Préstamo registrado exitosamente.');
            limpiarModalPrestamo();
            cargarDatos();
        } catch (error) {
            notificar('error', error.response?.data?.error || 'No se pudo registrar el préstamo.');
        }
    };

    const handleConfirmarDevolucion = async () => {
        if (!prestamoDevolver) return;

        try {
            const res = await api.put(`/api/prestamos/${prestamoDevolver.id_prestamo}/devolucion`, {
                fecha_devolucion_real: new Date().toISOString().split('T')[0],
                observaciones: observacionDevolucion
            });
            notificar('success', res.data.mensaje);
            setPrestamoDevolver(null);
            setObservacionDevolucion('');
            cargarDatos();
        } catch (error) {
            notificar('error', error.response?.data?.error || 'Error al registrar devolución.');
            setPrestamoDevolver(null);
        }
    };

    const prestamosFiltrados = prestamos.filter(p => {
        const query = searchTerm.toLowerCase();
        return (
            (p.libro_titulo && p.libro_titulo.toLowerCase().includes(query)) ||
            (p.usuario_nombre && p.usuario_nombre.toLowerCase().includes(query)) ||
            (p.usuario_documento && p.usuario_documento.toLowerCase().includes(query)) ||
            (p.libro_isbn && p.libro_isbn.toLowerCase().includes(query))
        );
    });

    // Filtros de búsqueda predictiva en el modal
    const librosDisponibles = libros.filter(l => (l.copias_disponibles ?? 0) > 0);
    const librosFiltradosModal = librosDisponibles.filter(l => {
        if (!busquedaLibroModal.trim()) return true;
        const term = busquedaLibroModal.toLowerCase();
        return (
            (l.titulo && l.titulo.toLowerCase().includes(term)) ||
            (l.isbn && l.isbn.toLowerCase().includes(term)) ||
            (l.editorial && l.editorial.toLowerCase().includes(term))
        );
    });

    const usuariosActivos = usuarios.filter(u => u.estado === 'Activo');
    const usuariosFiltradosModal = usuariosActivos.filter(u => {
        if (!busquedaUsuarioModal.trim()) return true;
        const term = busquedaUsuarioModal.toLowerCase();
        return (
            (u.nombre && u.nombre.toLowerCase().includes(term)) ||
            (u.apellido && u.apellido.toLowerCase().includes(term)) ||
            (u.documento_identidad && u.documento_identidad.toLowerCase().includes(term)) ||
            (`${u.nombre} ${u.apellido}`.toLowerCase().includes(term))
        );
    });

    return (
        <div className="w-full space-y-6">
            
            {/* Banner de Notificación */}
            {notificacion.visible && (
                <div className={`p-4 rounded-xl text-white shadow-xl flex items-center justify-between transition-all duration-300 ${
                    notificacion.tipo === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
                }`}>
                    <div className="flex items-center gap-2">
                        {notificacion.tipo === 'success' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        )}
                        <span className="font-medium text-sm">{notificacion.mensaje}</span>
                    </div>
                </div>
            )}

            {/* Cabecera del Módulo */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 font-heading">Gestión de Préstamos y Devoluciones</h2>
                    <p className="text-slate-500 text-sm mt-1">Registra nuevos préstamos institucionales mediante búsqueda predictiva y procesa devoluciones.</p>
                </div>
                
                <button
                    onClick={() => setMostrarModalNuevo(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <span>Nuevo Préstamo</span>
                </button>
            </div>

            {/* Buscador de Préstamos Activos */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar préstamo activo por título de libro, usuario o documento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                    />
                </div>
                <button onClick={cargarDatos} className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors" title="Refrescar">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
            </div>

            {/* Listado de Préstamos Activos */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
            ) : prestamosFiltrados.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                    <svg className="w-16 h-16 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-slate-600 font-semibold text-lg">No hay préstamos activos en este momento.</p>
                    <p className="text-slate-400 text-sm mt-1">Todos los libros prestados han sido devueltos a la biblioteca.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-6">Libro Prestado</th>
                                    <th className="py-3.5 px-6">Usuario Solicitante</th>
                                    <th className="py-3.5 px-6">Fecha Préstamo</th>
                                    <th className="py-3.5 px-6">Fecha Límite</th>
                                    <th className="py-3.5 px-6">Estado Plazo</th>
                                    <th className="py-3.5 px-6 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {prestamosFiltrados.map((p) => {
                                    const hoy = new Date();
                                    hoy.setHours(0,0,0,0);
                                    const limite = new Date(p.fecha_devolucion_esperada);
                                    limite.setHours(0,0,0,0);
                                    const diffDias = Math.round((limite - hoy) / (1000 * 60 * 60 * 24));
                                    const estaVencido = diffDias < 0;
                                    const venceHoy = diffDias === 0;

                                    return (
                                        <tr key={p.id_prestamo} className={`hover:bg-slate-50/80 transition-colors ${estaVencido ? 'bg-rose-50/30' : ''}`}>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    {p.libro_portada ? (
                                                        <img src={p.libro_portada} alt={p.libro_titulo} className="w-10 h-14 object-cover rounded-lg shadow-sm border border-slate-200" />
                                                    ) : (
                                                        <div className="w-10 h-14 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-slate-800 line-clamp-1">{p.libro_titulo}</p>
                                                        <p className="text-xs text-slate-400 font-mono">ISBN: {p.libro_isbn}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="font-medium text-slate-800">{p.usuario_nombre}</p>
                                                <p className="text-xs text-slate-400">Doc: {p.usuario_documento}</p>
                                                <p className="text-xs text-slate-400">{p.usuario_telefono || p.usuario_email}</p>
                                            </td>
                                            <td className="py-4 px-6 text-slate-600 font-mono text-xs">
                                                {new Date(p.fecha_prestamo).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="py-4 px-6 font-mono text-xs">
                                                <span className={`font-semibold ${estaVencido ? 'text-rose-600' : 'text-slate-700'}`}>
                                                    {new Date(p.fecha_devolucion_esperada).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                {estaVencido ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                                                        Vencido ({Math.abs(diffDias)} d)
                                                    </span>
                                                ) : venceHoy ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                                        ⚠️ Vence hoy
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        En plazo ({diffDias} d restantes)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => setPrestamoDevolver(p)}
                                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 ml-auto"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    <span>Devolver</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal: Registrar Nuevo Préstamo con Búsqueda Predictiva */}
            {mostrarModalNuevo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold font-heading">Registrar Préstamo de Libro</h3>
                                <p className="text-xs text-blue-100 mt-0.5">Búsqueda rápida por nombre/ISBN de libro y nombre/cédula de usuario.</p>
                            </div>
                            <button onClick={limpiarModalPrestamo} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleCrearPrestamo} className="p-6 space-y-5">
                            
                            {/* --- 1. BUSCADOR INTELIGENTE DE LIBRO (NOMBRE O ISBN) --- */}
                            <div className="space-y-1.5" ref={libroRef}>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                                    <span>1. Buscar Libro (Nombre o ISBN) *</span>
                                    {libroSeleccionado && (
                                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                                            ✓ Libro seleccionado
                                        </span>
                                    )}
                                </label>

                                {libroSeleccionado ? (
                                    /* Ficha del Libro Seleccionado */
                                    <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/60 flex items-center justify-between gap-3 animate-in fade-in duration-200">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            {libroSeleccionado.portada ? (
                                                <img src={libroSeleccionado.portada} alt={libroSeleccionado.titulo} className="w-10 h-14 object-cover rounded-lg shadow-sm border border-indigo-200 flex-shrink-0" />
                                            ) : (
                                                <div className="w-10 h-14 rounded-lg bg-indigo-200/60 text-indigo-700 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                                </div>
                                            )}
                                            <div className="overflow-hidden">
                                                <p className="font-bold text-slate-800 text-sm truncate">{libroSeleccionado.titulo}</p>
                                                <p className="text-xs text-slate-600 font-mono">ISBN: {libroSeleccionado.isbn}</p>
                                                <p className="text-[11px] text-slate-500">{libroSeleccionado.editorial} • Ubicación: {libroSeleccionado.ubicacion}</p>
                                                <span className="inline-block mt-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                                    {libroSeleccionado.copias_disponibles} copias disponibles
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={quitarLibroSeleccionado}
                                            className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex-shrink-0 shadow-xs"
                                        >
                                            Cambiar
                                        </button>
                                    </div>
                                ) : (
                                    /* Input de búsqueda interactiva de libro */
                                    <div className="relative">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Escribe el título o el ISBN del libro..."
                                                value={busquedaLibroModal}
                                                onChange={(e) => {
                                                    setBusquedaLibroModal(e.target.value);
                                                    setMostrarSugerenciasLibro(true);
                                                }}
                                                onFocus={() => setMostrarSugerenciasLibro(true)}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white"
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                            </div>
                                        </div>

                                        {/* Dropdown de sugerencias de libros */}
                                        {mostrarSugerenciasLibro && (
                                            <div className="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-2xl divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                                                {librosFiltradosModal.length === 0 ? (
                                                    <div className="p-4 text-center text-xs text-slate-500">
                                                        No se encontraron libros disponibles con "{busquedaLibroModal}".
                                                    </div>
                                                ) : (
                                                    librosFiltradosModal.map(l => (
                                                        <div
                                                            key={l.id_libro}
                                                            onClick={() => seleccionarLibro(l)}
                                                            className="p-3 hover:bg-indigo-50/70 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                                                        >
                                                            <div className="overflow-hidden">
                                                                <p className="font-semibold text-slate-800 text-sm truncate">{l.titulo}</p>
                                                                <p className="text-slate-500 font-mono text-[11px]">ISBN: {l.isbn} • {l.editorial}</p>
                                                                <p className="text-slate-400 text-[10px]">📍 {l.ubicacion}</p>
                                                            </div>
                                                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                                                                {l.copias_disponibles} disp.
                                                            </span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* --- 2. BUSCADOR INTELIGENTE DE USUARIO (NOMBRE O CÉDULA) --- */}
                            <div className="space-y-1.5" ref={usuarioRef}>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                                    <span>2. Buscar Usuario (Nombre o Cédula) *</span>
                                    {usuarioSeleccionado && (
                                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                                            ✓ Usuario seleccionado
                                        </span>
                                    )}
                                </label>

                                {usuarioSeleccionado ? (
                                    /* Ficha del Usuario Seleccionado */
                                    <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/60 flex items-center justify-between gap-3 animate-in fade-in duration-200">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                                                {usuarioSeleccionado.nombre.charAt(0)}{usuarioSeleccionado.apellido.charAt(0)}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-bold text-slate-800 text-sm truncate">
                                                    {usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}
                                                </p>
                                                <p className="text-xs text-slate-600 font-mono">Cédula/Doc: {usuarioSeleccionado.documento_identidad}</p>
                                                <p className="text-[11px] text-slate-500">{usuarioSeleccionado.email} • {usuarioSeleccionado.tipo_usuario}</p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={quitarUsuarioSeleccionado}
                                            className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex-shrink-0 shadow-xs"
                                        >
                                            Cambiar
                                        </button>
                                    </div>
                                ) : (
                                    /* Input de búsqueda interactiva de usuario */
                                    <div className="relative">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Escribe el nombre, apellido o número de cédula..."
                                                value={busquedaUsuarioModal}
                                                onChange={(e) => {
                                                    setBusquedaUsuarioModal(e.target.value);
                                                    setMostrarSugerenciasUsuario(true);
                                                }}
                                                onFocus={() => setMostrarSugerenciasUsuario(true)}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white"
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            </div>
                                        </div>

                                        {/* Dropdown de sugerencias de usuarios */}
                                        {mostrarSugerenciasUsuario && (
                                            <div className="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-2xl divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                                                {usuariosFiltradosModal.length === 0 ? (
                                                    <div className="p-4 text-center text-xs text-slate-500">
                                                        No se encontraron usuarios activos con "{busquedaUsuarioModal}".
                                                    </div>
                                                ) : (
                                                    usuariosFiltradosModal.map(u => (
                                                        <div
                                                            key={u.id_usuario}
                                                            onClick={() => seleccionarUsuario(u)}
                                                            className="p-3 hover:bg-blue-50/70 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                                                        >
                                                            <div className="flex items-center gap-2.5 overflow-hidden">
                                                                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-slate-200">
                                                                    {u.nombre.charAt(0)}{u.apellido.charAt(0)}
                                                                </div>
                                                                <div className="overflow-hidden">
                                                                    <p className="font-semibold text-slate-800 truncate">{u.nombre} {u.apellido}</p>
                                                                    <p className="text-slate-500 font-mono text-[11px]">Cédula: {u.documento_identidad}</p>
                                                                </div>
                                                            </div>
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                                                                {u.tipo_usuario}
                                                            </span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* --- 3. FECHAS DEL PRÉSTAMO --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Fecha Préstamo *</label>
                                    <input
                                        type="date"
                                        value={nuevoPrestamo.fecha_prestamo}
                                        onChange={(e) => setNuevoPrestamo({ ...nuevoPrestamo, fecha_prestamo: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Fecha Límite Devolución *</label>
                                    <input
                                        type="date"
                                        value={nuevoPrestamo.fecha_devolucion_esperada}
                                        onChange={(e) => setNuevoPrestamo({ ...nuevoPrestamo, fecha_devolucion_esperada: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                                    />
                                </div>
                            </div>

                            {/* Plazos rápidos */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">Plazos rápidos:</span>
                                <button type="button" onClick={() => setDiasPlazo(7)} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors">
                                    +7 días
                                </button>
                                <button type="button" onClick={() => setDiasPlazo(14)} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors">
                                    +14 días
                                </button>
                                <button type="button" onClick={() => setDiasPlazo(30)} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors">
                                    +30 días
                                </button>
                            </div>

                            {/* Observaciones */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 uppercase">Observaciones (Opcional)</label>
                                <textarea
                                    value={nuevoPrestamo.observaciones}
                                    onChange={(e) => setNuevoPrestamo({ ...nuevoPrestamo, observaciones: e.target.value })}
                                    placeholder="Ej: Ejemplar entregado con forro plástico en sala..."
                                    rows="2"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                                />
                            </div>

                            {/* Botones de acción */}
                            <div className="pt-3 flex gap-3">
                                <button
                                    type="button"
                                    onClick={limpiarModalPrestamo}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!nuevoPrestamo.id_libro || !nuevoPrestamo.id_usuario}
                                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirmar Préstamo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Confirmación de Devolución */}
            {prestamoDevolver && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md text-center">
                        <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h4 className="text-xl font-bold text-slate-800 mb-1">Registrar Devolución</h4>
                        <p className="text-sm text-slate-600 mb-4">
                            ¿Confirmas que el libro <strong className="text-slate-800">"{prestamoDevolver.libro_titulo}"</strong> ha sido devuelto por <strong className="text-slate-800">{prestamoDevolver.usuario_nombre}</strong>?
                        </p>

                        <div className="text-left mb-4 space-y-1">
                            <label className="text-xs font-semibold text-slate-600 uppercase">Observación al recibir (opcional):</label>
                            <input
                                type="text"
                                placeholder="Ej: Libro en perfecto estado"
                                value={observacionDevolucion}
                                onChange={(e) => setObservacionDevolucion(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setPrestamoDevolver(null)}
                                className="flex-1 py-2.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmarDevolucion}
                                className="flex-1 py-2.5 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors font-medium shadow-md shadow-emerald-600/30"
                            >
                                Sí, recibir libro
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionPrestamos;
