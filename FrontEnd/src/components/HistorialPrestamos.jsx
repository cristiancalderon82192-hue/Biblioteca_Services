import { useState, useEffect } from 'react';
import api from '../api/config';

const HistorialPrestamos = () => {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    const cargarHistorial = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filtroEstado !== 'Todos') params.estado = filtroEstado;
            if (searchTerm) params.busqueda = searchTerm;
            if (fechaDesde) params.desde = fechaDesde;
            if (fechaHasta) params.hasta = fechaHasta;

            const res = await api.get('/api/prestamos/historial', { params });
            setHistorial(res.data);
        } catch (error) {
            console.error('Error al cargar historial:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarHistorial();
    }, [filtroEstado, fechaDesde, fechaHasta]);

    const handleBuscar = (e) => {
        e.preventDefault();
        cargarHistorial();
    };

    const limpiarFiltros = () => {
        setFiltroEstado('Todos');
        setSearchTerm('');
        setFechaDesde('');
        setFechaHasta('');
    };

    const totalDevueltos = historial.filter(h => h.estado === 'Devuelto').length;
    const totalActivos = historial.filter(h => h.estado === 'Activo').length;
    const totalVencidos = historial.filter(h => h.estado === 'Vencido').length;

    return (
        <div className="w-full space-y-6">
            
            {/* Cabecera */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Historial General de Préstamos</h2>
                    <p className="text-slate-500 text-sm mt-1">Auditoría completa de todos los préstamos, entregas, retrasos y multas registradas.</p>
                </div>

                {/* Métricas rápidas */}
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        Total: {historial.length}
                    </span>
                    <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Devueltos: {totalDevueltos}
                    </span>
                    <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Activos: {totalActivos}
                    </span>
                    <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        Vencidos: {totalVencidos}
                    </span>
                </div>
            </div>

            {/* Panel de Filtros */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <form onSubmit={handleBuscar} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    
                    {/* Búsqueda de texto */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 uppercase">Buscar</label>
                        <input
                            type="text"
                            placeholder="Libro, ISBN o Usuario..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Estado */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 uppercase">Estado</label>
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option value="Todos">Todos los estados</option>
                            <option value="Activo">Activo (En curso)</option>
                            <option value="Devuelto">Devuelto</option>
                            <option value="Vencido">Vencido</option>
                        </select>
                    </div>

                    {/* Rango de Fechas */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 uppercase">Fecha Préstamo Desde</label>
                        <input
                            type="date"
                            value={fechaDesde}
                            onChange={(e) => setFechaDesde(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                        >
                            Filtrar
                        </button>
                        <button
                            type="button"
                            onClick={limpiarFiltros}
                            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors"
                            title="Limpiar filtros"
                        >
                            Limpiar
                        </button>
                    </div>
                </form>
            </div>

            {/* Tabla del Historial */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
            ) : historial.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                    <p className="text-slate-500 font-medium">No se encontraron registros de préstamos con los filtros especificados.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-6">ID</th>
                                    <th className="py-3.5 px-6">Libro</th>
                                    <th className="py-3.5 px-6">Usuario</th>
                                    <th className="py-3.5 px-6">F. Préstamo</th>
                                    <th className="py-3.5 px-6">F. Esperada</th>
                                    <th className="py-3.5 px-6">F. Devolución Real</th>
                                    <th className="py-3.5 px-6">Estado</th>
                                    <th className="py-3.5 px-6">Multa</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {historial.map((h) => (
                                    <tr key={h.id_prestamo} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-4 px-6 font-mono text-xs text-slate-400 font-bold">#{h.id_prestamo}</td>
                                        <td className="py-4 px-6">
                                            <p className="font-semibold text-slate-800 line-clamp-1">{h.libro_titulo}</p>
                                            <p className="text-xs text-slate-400 font-mono">ISBN: {h.libro_isbn}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="font-medium text-slate-800">{h.usuario_nombre}</p>
                                            <p className="text-xs text-slate-400">Doc: {h.usuario_documento} • {h.tipo_usuario}</p>
                                        </td>
                                        <td className="py-4 px-6 font-mono text-xs text-slate-600">
                                            {new Date(h.fecha_prestamo).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="py-4 px-6 font-mono text-xs text-slate-600">
                                            {new Date(h.fecha_devolucion_esperada).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="py-4 px-6 font-mono text-xs">
                                            {h.fecha_devolucion_real ? (
                                                <span className="text-emerald-700 font-medium">
                                                    {new Date(h.fecha_devolucion_real).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic">En préstamo</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                                                h.estado === 'Devuelto'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : h.estado === 'Activo'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-rose-100 text-rose-800'
                                            }`}>
                                                {h.estado}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            {h.monto_multa > 0 ? (
                                                <div>
                                                    <span className="font-bold text-rose-600 text-xs">
                                                        ${Number(h.monto_multa).toLocaleString()}
                                                    </span>
                                                    <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                                        h.multa_estado === 'Pagada'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {h.multa_estado}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistorialPrestamos;
