import { useState, useEffect } from 'react';
import api from '../api/config';

const PrestamosVencidos = () => {
    const [vencidosData, setVencidosData] = useState({ tarifaDiaria: 1000, totalVencidos: 0, prestamosVencidos: [] });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [notificacion, setNotificacion] = useState({ visible: false, tipo: '', mensaje: '' });
    const [prestamoDevolver, setPrestamoDevolver] = useState(null);

    const notificar = (tipo, mensaje) => {
        setNotificacion({ visible: true, tipo, mensaje });
        setTimeout(() => setNotificacion({ visible: false, tipo: '', mensaje: '' }), 5000);
    };

    const cargarVencidos = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/prestamos/vencidos');
            setVencidosData(res.data);
        } catch (error) {
            console.error('Error al cargar préstamos vencidos:', error);
            notificar('error', 'No se pudieron consultar los préstamos vencidos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarVencidos();
    }, []);

    const handleActualizarMulta = async (idMulta, nuevoEstado) => {
        try {
            const res = await api.put(`/api/prestamos/multas/${idMulta}`, { nuevo_estado: nuevoEstado });
            notificar('success', res.data.mensaje);
            cargarVencidos();
        } catch (error) {
            notificar('error', error.response?.data?.error || 'Error al actualizar estado de la multa.');
        }
    };

    const handleProcesarDevolucion = async () => {
        if (!prestamoDevolver) return;
        try {
            const res = await api.put(`/api/prestamos/${prestamoDevolver.id_prestamo}/devolucion`, {
                fecha_devolucion_real: new Date().toISOString().split('T')[0],
                observaciones: 'Devolución recibida con retraso.'
            });
            notificar('success', res.data.mensaje);
            setPrestamoDevolver(null);
            cargarVencidos();
        } catch (error) {
            notificar('error', error.response?.data?.error || 'Error al recibir devolución.');
            setPrestamoDevolver(null);
        }
    };

    const listaFiltrada = vencidosData.prestamosVencidos.filter(p => {
        const query = searchTerm.toLowerCase();
        return (
            (p.libro_titulo && p.libro_titulo.toLowerCase().includes(query)) ||
            (p.usuario_nombre && p.usuario_nombre.toLowerCase().includes(query)) ||
            (p.usuario_documento && p.usuario_documento.toLowerCase().includes(query)) ||
            (p.usuario_email && p.usuario_email.toLowerCase().includes(query))
        );
    });

    const totalMultasPendientes = vencidosData.prestamosVencidos
        .filter(p => p.multa_estado === 'Pendiente')
        .reduce((acc, curr) => acc + Number(curr.monto_multa || 0), 0);

    return (
        <div className="w-full space-y-6">
            
            {/* Banner de Notificación */}
            {notificacion.visible && (
                <div className={`p-4 rounded-xl text-white shadow-xl flex items-center justify-between transition-all duration-300 ${
                    notificacion.tipo === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
                }`}>
                    <span className="font-medium text-sm">{notificacion.mensaje}</span>
                </div>
            )}

            {/* Cabecera y Tarjetas KPI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-6 rounded-2xl text-white shadow-lg shadow-rose-500/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-rose-100 text-sm font-medium">Préstamos Vencidos en Mora</p>
                            <h3 className="text-3xl font-extrabold mt-1">{vencidosData.totalVencidos}</h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    </div>
                    <p className="text-xs text-rose-100 mt-4 flex items-center gap-1">
                        <span>⚠️ Ejemplares que superaron la fecha límite</span>
                    </p>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-2xl text-white shadow-lg shadow-amber-500/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-amber-100 text-sm font-medium">Multas Pendientes por Cobrar</p>
                            <h3 className="text-3xl font-extrabold mt-1">${totalMultasPendientes.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    </div>
                    <p className="text-xs text-amber-100 mt-4">Calculadas según los días de mora</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-indigo-100 text-sm font-medium">Tarifa de Multa Institucional</p>
                            <h3 className="text-3xl font-extrabold mt-1">${(vencidosData.tarifaDiaria || 1000).toLocaleString()} <span className="text-sm font-normal">/ día</span></h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        </div>
                    </div>
                    <p className="text-xs text-indigo-100 mt-4">Aplicada automáticamente al vencer el plazo</p>
                </div>
            </div>

            {/* Buscador */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por usuario moroso, cédula o libro vencido..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 outline-none text-sm bg-white"
                    />
                </div>
                <button onClick={cargarVencidos} className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors" title="Actualizar">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
            </div>

            {/* Listado de Préstamos Vencidos y Multas */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600"></div>
                </div>
            ) : listaFiltrada.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="text-slate-800 font-bold text-xl">¡Excelente! No hay préstamos vencidos ni multas pendientes.</p>
                    <p className="text-slate-400 text-sm mt-1">Todos los usuarios están al día con sus préstamos institucionales.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-6">Libro</th>
                                    <th className="py-3.5 px-6">Usuario Moroso</th>
                                    <th className="py-3.5 px-6">Fecha Vencimiento</th>
                                    <th className="py-3.5 px-6">Días de Mora</th>
                                    <th className="py-3.5 px-6">Multa Calculada</th>
                                    <th className="py-3.5 px-6">Estado Multa</th>
                                    <th className="py-3.5 px-6 text-right">Gestión</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {listaFiltrada.map((p) => (
                                    <tr key={p.id_prestamo} className="hover:bg-rose-50/20 transition-colors">
                                        <td className="py-4 px-6">
                                            <p className="font-semibold text-slate-800 line-clamp-1">{p.libro_titulo}</p>
                                            <p className="text-xs text-slate-400 font-mono">ISBN: {p.libro_isbn}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="font-medium text-slate-800">{p.usuario_nombre}</p>
                                            <p className="text-xs text-slate-400">Doc: {p.usuario_documento}</p>
                                            <p className="text-xs text-slate-500 font-medium">{p.usuario_telefono || p.usuario_email}</p>
                                        </td>
                                        <td className="py-4 px-6 font-mono text-xs text-slate-600">
                                            {new Date(p.fecha_devolucion_esperada).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                                                🚨 {p.dias_mora} día(s)
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 font-bold text-rose-600 text-base">
                                            ${Number(p.monto_multa || 0).toLocaleString()}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                                                p.multa_estado === 'Pagada'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : p.multa_estado === 'Condonada'
                                                    ? 'bg-slate-200 text-slate-700'
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {p.multa_estado}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {p.estado !== 'Devuelto' && (
                                                    <button
                                                        onClick={() => setPrestamoDevolver(p)}
                                                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
                                                        title="Recibir libro en mostrador"
                                                    >
                                                        Recibir Libro
                                                    </button>
                                                )}

                                                {p.id_multa && p.multa_estado === 'Pendiente' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleActualizarMulta(p.id_multa, 'Pagada')}
                                                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                                                            title="Registrar cobro de multa"
                                                        >
                                                            Cobrar
                                                        </button>
                                                        <button
                                                            onClick={() => handleActualizarMulta(p.id_multa, 'Condonada')}
                                                            className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                                                            title="Exonerar multa"
                                                        >
                                                            Condonar
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal: Recibir Devolución con mora */}
            {prestamoDevolver && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md text-center">
                        <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-amber-100 text-amber-600 mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h4 className="text-xl font-bold text-slate-800 mb-1">Recibir Devolución con Atraso</h4>
                        <p className="text-sm text-slate-600 mb-2">
                            Libro: <strong className="text-slate-800">"{prestamoDevolver.libro_titulo}"</strong>
                        </p>
                        <p className="text-sm text-slate-600 mb-4">
                            Días de atraso: <span className="font-bold text-rose-600">{prestamoDevolver.dias_mora} días</span>.
                            <br />
                            Multa generada: <strong className="text-rose-600 font-bold">${Number(prestamoDevolver.monto_multa).toLocaleString()}</strong>.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setPrestamoDevolver(null)}
                                className="flex-1 py-2.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors font-medium text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleProcesarDevolucion}
                                className="flex-1 py-2.5 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors font-medium text-sm shadow-md shadow-emerald-600/30"
                            >
                                Confirmar Recepción
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrestamosVencidos;
