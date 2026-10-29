import { useState, useEffect } from 'react';
import api from '../api/config';

const InventarioLibros = ({ onSolicitarPrestamo }) => {
    const [libros, setLibros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', message: '' });
    const [libroEditando, setLibroEditando] = useState(null);
    const [libroEliminar, setLibroEliminar] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('todos'); // 'todos', 'disponibles', 'agotados'

    const cargarLibros = async () => {
        setLoading(true);
        try {
            const respuesta = await api.get('/api/libros');
            setLibros(respuesta.data);
        } catch (error) {
            console.error('Error al cargar libros:', error);
            setModalConfig({ isOpen: true, type: 'error', message: 'Error al cargar el inventario de libros.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarLibros();
    }, []);

    const confirmarEliminar = (libro) => {
        setLibroEliminar(libro);
    };

    const eliminarLibro = async () => {
        if (!libroEliminar) return;
        
        try {
            const res = await api.delete(`/api/libros/${libroEliminar.id_libro}`);
            setLibros(libros.filter(l => l.id_libro !== libroEliminar.id_libro));
            setModalConfig({ isOpen: true, type: 'success', message: res.data.mensaje || 'Libro eliminado exitosamente.' });
            setLibroEliminar(null);
        } catch (error) {
            setModalConfig({ isOpen: true, type: 'error', message: error.response?.data?.error || 'Error al eliminar el libro.' });
            setLibroEliminar(null);
        }
    };

    const iniciarEdicion = (libro) => {
        setLibroEditando({ ...libro });
    };

    const handleEditChange = (e) => {
        setLibroEditando({ ...libroEditando, [e.target.name]: e.target.value });
    };

    const guardarEdicion = async (e) => {
        e.preventDefault();
        try {
            const respuesta = await api.put(`/api/libros/${libroEditando.id_libro}`, libroEditando);
            setModalConfig({ isOpen: true, type: 'success', message: respuesta.data.mensaje || 'Libro actualizado exitosamente.' });
            setLibroEditando(null);
            cargarLibros();
        } catch (error) {
            setModalConfig({ isOpen: true, type: 'error', message: error.response?.data?.error || 'Error al actualizar.' });
        }
    };

    const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

    // Filtrar libros por búsqueda y disponibilidad
    const librosFiltrados = libros.filter(libro => {
        const busqueda = searchTerm.toLowerCase();
        const coincideBusqueda = (
            (libro.titulo && libro.titulo.toLowerCase().includes(busqueda)) ||
            (libro.isbn && libro.isbn.toLowerCase().includes(busqueda)) ||
            (libro.editorial && libro.editorial.toLowerCase().includes(busqueda))
        );

        const disponibles = libro.copias_disponibles ?? 0;
        let coincideDisponibilidad = true;
        if (filtroDisponibilidad === 'disponibles') {
            coincideDisponibilidad = disponibles > 0;
        } else if (filtroDisponibilidad === 'agotados') {
            coincideDisponibilidad = disponibles <= 0;
        }

        return coincideBusqueda && coincideDisponibilidad;
    });

    const totalLibros = libros.length;
    const librosDisponiblesCount = libros.filter(l => (l.copias_disponibles ?? 0) > 0).length;
    const librosAgotadosCount = libros.filter(l => (l.copias_disponibles ?? 0) <= 0).length;

    return (
        <div className="w-full space-y-6">
            
            {/* Header del inventario y métricas rápidas de disponibilidad */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Catálogo e Inventario de Libros</h2>
                    <p className="text-slate-500 text-sm mt-1">Consulta la disponibilidad en tiempo real de todos los títulos registrados.</p>
                </div>
                
                {/* Resumen de disponibilidad */}
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setFiltroDisponibilidad('todos')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            filtroDisponibilidad === 'todos' 
                                ? 'bg-slate-900 text-white shadow-md' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Todos ({totalLibros})
                    </button>
                    <button 
                        onClick={() => setFiltroDisponibilidad('disponibles')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            filtroDisponibilidad === 'disponibles' 
                                ? 'bg-emerald-600 text-white shadow-md' 
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        Disponibles ({librosDisponiblesCount})
                    </button>
                    <button 
                        onClick={() => setFiltroDisponibilidad('agotados')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            filtroDisponibilidad === 'agotados' 
                                ? 'bg-rose-600 text-white shadow-md' 
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                        En préstamo / Agotados ({librosAgotadosCount})
                    </button>
                </div>
            </div>

            {/* Barra de Búsqueda y Botón de Recarga */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por título, editorial o ISBN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm bg-white"
                    />
                </div>
                
                <button onClick={cargarLibros} className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors shadow-sm" title="Actualizar lista">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
            </div>

            {/* Cuadrícula de Libros */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : libros.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                    <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    <p className="text-xl text-slate-500 font-medium">No hay libros registrados aún.</p>
                </div>
            ) : librosFiltrados.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                    <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <p className="text-xl text-slate-500 font-medium">No se encontraron resultados para los filtros seleccionados.</p>
                    <button onClick={() => { setSearchTerm(''); setFiltroDisponibilidad('todos'); }} className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors">Limpiar filtros</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {librosFiltrados.map(libro => {
                        const disponibles = libro.copias_disponibles ?? 0;
                        const totales = libro.copias_totales ?? 1;
                        const tieneDisponibilidad = disponibles > 0;

                        return (
                            <div key={libro.id_libro} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group">
                                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                                    {libro.portada ? (
                                        <img src={libro.portada} alt={libro.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="h-full w-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                            <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                    )}

                                    {/* Badge flotante de Disponibilidad (Requerimiento 2) */}
                                    <div className="absolute top-3 right-3">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${
                                            tieneDisponibilidad 
                                                ? 'bg-emerald-500/90 text-white' 
                                                : 'bg-rose-500/90 text-white'
                                        }`}>
                                            <span className={`w-2 h-2 rounded-full ${tieneDisponibilidad ? 'bg-white animate-pulse' : 'bg-white/60'}`}></span>
                                            {tieneDisponibilidad ? `Disponible (${disponibles}/${totales})` : `Agotado (0/${totales})`}
                                        </span>
                                    </div>

                                    {/* Badge de Ubicación */}
                                    <div className="absolute bottom-3 left-3">
                                        <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                                            📍 {libro.ubicacion}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-slate-800 line-clamp-1" title={libro.titulo}>{libro.titulo}</h3>
                                    {libro.subtitulo && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{libro.subtitulo}</p>}
                                    
                                    <div className="mt-3 space-y-1 text-xs text-slate-600">
                                        <p><span className="font-semibold text-slate-700">ISBN:</span> {libro.isbn}</p>
                                        <p><span className="font-semibold text-slate-700">Editorial:</span> {libro.editorial}</p>
                                        <p><span className="font-semibold text-slate-700">Año:</span> {libro.anio_publicacion} • {libro.idioma}</p>
                                    </div>

                                    {/* Botón de Préstamo Rápido (Requerimiento 3) */}
                                    {onSolicitarPrestamo && (
                                        <div className="mt-4">
                                            <button
                                                onClick={() => onSolicitarPrestamo(libro)}
                                                disabled={!tieneDisponibilidad}
                                                className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                                                    tieneDisponibilidad
                                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 active:scale-95'
                                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                                }`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                                {tieneDisponibilidad ? 'Prestar este Libro' : 'Sin copias disponibles'}
                                            </button>
                                        </div>
                                    )}

                                    <div className="mt-auto pt-4 flex gap-2 border-t border-slate-100">
                                        <button onClick={() => iniciarEdicion(libro)} className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg font-medium transition-colors text-xs flex items-center justify-center gap-1 border border-slate-200">
                                            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            Editar
                                        </button>
                                        <button onClick={() => confirmarEliminar(libro)} className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-medium transition-colors text-xs flex items-center justify-center gap-1 border border-rose-200">
                                            <svg className="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            Borrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal de Confirmación de Eliminación */}
            {libroEliminar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-100 text-rose-500 mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">¿Eliminar libro?</h3>
                        <p className="text-slate-600 mb-6 text-sm">Estás a punto de eliminar "{libroEliminar.titulo}".</p>
                        <div className="flex gap-3">
                            <button onClick={() => setLibroEliminar(null)} className="flex-1 py-2.5 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancelar</button>
                            <button onClick={eliminarLibro} className="flex-1 py-2.5 rounded-xl font-medium text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/30 transition-colors">Sí, eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edición con Copias y Disponibilidad */}
            {libroEditando && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden relative">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center text-white">
                            <h2 className="text-xl font-bold">Editar Libro y Ejemplares</h2>
                            <button onClick={() => setLibroEditando(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <form onSubmit={guardarEdicion} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600 uppercase">ISBN *</label>
                                    <input type="text" name="isbn" value={libroEditando.isbn} onChange={handleEditChange} required 
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600 uppercase">Título *</label>
                                    <input type="text" name="titulo" value={libroEditando.titulo} onChange={handleEditChange} required 
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600 uppercase">Subtítulo</label>
                                    <input type="text" name="subtitulo" value={libroEditando.subtitulo || ''} onChange={handleEditChange} 
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600 uppercase">Editorial *</label>
                                    <input type="text" name="editorial" value={libroEditando.editorial} onChange={handleEditChange} required 
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600 uppercase">Copias Totales *</label>
                                    <input type="number" name="copias_totales" value={libroEditando.copias_totales ?? 1} onChange={handleEditChange} required min="1" 
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-indigo-600" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600 uppercase">Copias Disponibles *</label>
                                    <input type="number" name="copias_disponibles" value={libroEditando.copias_disponibles ?? 1} onChange={handleEditChange} required min="0" 
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-emerald-600" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600 uppercase">Año *</label>
                                    <input type="number" name="anio_publicacion" value={libroEditando.anio_publicacion} onChange={handleEditChange} required max="2026" 
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600 uppercase">Ubicación *</label>
                                    <input type="text" name="ubicacion" value={libroEditando.ubicacion} onChange={handleEditChange} required 
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase">URL Portada</label>
                                    <input type="url" name="portada" value={libroEditando.portada || ''} onChange={handleEditChange} 
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                                </div>
                            </div>
                            
                            <div className="pt-4 flex gap-3 border-t border-gray-100">
                                <button type="button" onClick={() => setLibroEditando(null)} className="flex-1 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all">
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Éxito / Error */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className={`p-6 text-center border-t-8 ${modalConfig.type === 'success' ? 'border-emerald-500' : 'border-rose-500'}`}>
                            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${modalConfig.type === 'success' ? 'bg-emerald-100 text-emerald-500' : 'bg-rose-100 text-rose-500'} mb-6`}>
                                {modalConfig.type === 'success' ? (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                )}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">
                                {modalConfig.type === 'success' ? '¡Éxito!' : 'Error'}
                            </h3>
                            <p className="text-slate-600 mb-8">{modalConfig.message}</p>
                            <button onClick={closeModal} className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-colors ${modalConfig.type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}>
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventarioLibros;
