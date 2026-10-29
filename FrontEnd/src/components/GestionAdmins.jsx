import { useState, useEffect } from 'react';
import api from '../api/config';

const GestionAdmins = ({ adminLogueado }) => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
    const [adminEditando, setAdminEditando] = useState(null);
    const [adminEliminar, setAdminEliminar] = useState(null);
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [notificacion, setNotificacion] = useState({ visible: false, tipo: '', mensaje: '' });

    // Estado para nuevo admin
    const [nuevoAdmin, setNuevoAdmin] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        cargo: 'Bibliotecario Encargado',
        estado: 'Activo'
    });

    const notificar = (tipo, mensaje) => {
        setNotificacion({ visible: true, tipo, mensaje });
        setTimeout(() => setNotificacion({ visible: false, tipo: '', mensaje: '' }), 5000);
    };

    const cargarAdmins = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admins');
            setAdmins(res.data);
        } catch (error) {
            console.error('Error al cargar administradores:', error);
            notificar('error', 'No se pudo cargar la lista de administradores.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarAdmins();
    }, []);

    const handleCrearAdmin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/admins', nuevoAdmin);
            notificar('success', res.data.mensaje);
            setMostrarModalNuevo(false);
            setNuevoAdmin({
                nombre: '',
                apellido: '',
                email: '',
                password: '',
                cargo: 'Bibliotecario Encargado',
                estado: 'Activo'
            });
            cargarAdmins();
        } catch (error) {
            notificar('error', error.response?.data?.error || 'Error al crear el administrador.');
        }
    };

    const handleActualizarAdmin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/api/admins/${adminEditando.id_admin}`, adminEditando);
            notificar('success', res.data.mensaje);
            setAdminEditando(null);
            cargarAdmins();
        } catch (error) {
            notificar('error', error.response?.data?.error || 'Error al actualizar el administrador.');
        }
    };

    const handleEliminarAdmin = async () => {
        if (!adminEliminar) return;

        // Evitar que el admin actual se elimine a sí mismo
        if (adminLogueado && adminLogueado.email === adminEliminar.email) {
            notificar('error', 'No puedes eliminar tu propia cuenta de administrador en sesión.');
            setAdminEliminar(null);
            return;
        }

        try {
            const res = await api.delete(`/api/admins/${adminEliminar.id_admin}`);
            notificar('success', res.data.mensaje);
            setAdminEliminar(null);
            cargarAdmins();
        } catch (error) {
            notificar('error', error.response?.data?.error || 'Error al eliminar administrador.');
            setAdminEliminar(null);
        }
    };

    const totalActivos = admins.filter(a => a.estado === 'Activo').length;

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

            {/* Cabecera y Botón de Creación */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        <span>Seguridad y Control de Acceso</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 font-heading">Gestión de Administradores del Sistema</h2>
                    <p className="text-slate-500 text-sm mt-1">Crea y autoriza nuevos usuarios administradores para que puedan ingresar y gestionar la biblioteca.</p>
                </div>

                <button
                    onClick={() => setMostrarModalNuevo(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                    <span>Crear Nuevo Administrador</span>
                </button>
            </div>

            {/* Tarjetas de Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">Total Administradores</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{admins.length}</h3>
                    </div>
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">Cuentas Activas</p>
                        <h3 className="text-2xl font-bold text-emerald-600 mt-1">{totalActivos}</h3>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">Protocolo de Acceso</p>
                        <h3 className="text-sm font-bold text-slate-800 mt-1">Cifrado Institucional</h3>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                </div>
            </div>

            {/* Listado de Administradores */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
            ) : admins.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                    <p className="text-slate-500 font-medium">No hay administradores registrados.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-6">Administrador</th>
                                    <th className="py-3.5 px-6">Correo Institucional (Login)</th>
                                    <th className="py-3.5 px-6">Cargo / Rol</th>
                                    <th className="py-3.5 px-6">Estado</th>
                                    <th className="py-3.5 px-6">Fecha Creación</th>
                                    <th className="py-3.5 px-6 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {admins.map((admin) => {
                                    const esElMismo = adminLogueado && adminLogueado.email === admin.email;
                                    return (
                                        <tr key={admin.id_admin} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                                        {admin.nombre.charAt(0)}{admin.apellido.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-slate-800">{admin.nombre} {admin.apellido}</p>
                                                            {esElMismo && (
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                                                                    Tu sesión
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-400">ID Admin: #{admin.id_admin}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-mono text-xs text-slate-700 font-medium">
                                                {admin.email}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                                    {admin.cargo}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                                                    admin.estado === 'Activo'
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                                                }`}>
                                                    {admin.estado}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 font-mono text-xs text-slate-500">
                                                {admin.fecha_creacion ? new Date(admin.fecha_creacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setAdminEditando({ ...admin, password: '' })}
                                                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Editar datos o clave"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    
                                                    {admins.length > 1 && !esElMismo && (
                                                        <button
                                                            onClick={() => setAdminEliminar(admin)}
                                                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                            title="Eliminar administrador"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal: Crear Nuevo Administrador */}
            {mostrarModalNuevo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold font-heading">Crear Nuevo Administrador</h3>
                                <p className="text-xs text-blue-100 mt-0.5">Podrá iniciar sesión inmediatamente en la plataforma.</p>
                            </div>
                            <button onClick={() => setMostrarModalNuevo(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleCrearAdmin} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Nombres *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Laura"
                                        value={nuevoAdmin.nombre}
                                        onChange={(e) => setNuevoAdmin({ ...nuevoAdmin, nombre: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Apellidos *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Sánchez"
                                        value={nuevoAdmin.apellido}
                                        onChange={(e) => setNuevoAdmin({ ...nuevoAdmin, apellido: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 uppercase">Correo Institucional (Usuario para Login) *</label>
                                <input
                                    type="email"
                                    placeholder="laura.sanchez@universidad.edu"
                                    value={nuevoAdmin.email}
                                    onChange={(e) => setNuevoAdmin({ ...nuevoAdmin, email: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 uppercase">Contraseña de Acceso *</label>
                                <div className="relative">
                                    <input
                                        type={mostrarPassword ? 'text' : 'password'}
                                        placeholder="Mínimo 6 caracteres"
                                        value={nuevoAdmin.password}
                                        onChange={(e) => setNuevoAdmin({ ...nuevoAdmin, password: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarPassword(!mostrarPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                    >
                                        {mostrarPassword ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Cargo en la Biblioteca *</label>
                                    <select
                                        value={nuevoAdmin.cargo}
                                        onChange={(e) => setNuevoAdmin({ ...nuevoAdmin, cargo: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                                    >
                                        <option value="Administrador General">Administrador General</option>
                                        <option value="Bibliotecario Encargado">Bibliotecario Encargado</option>
                                        <option value="Auxiliar de Préstamos">Auxiliar de Préstamos</option>
                                        <option value="Catalogador">Catalogador</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Estado Inicial *</label>
                                    <select
                                        value={nuevoAdmin.estado}
                                        onChange={(e) => setNuevoAdmin({ ...nuevoAdmin, estado: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                                    >
                                        <option value="Activo">Activo (Puede ingresar)</option>
                                        <option value="Inactivo">Inactivo (Acceso bloqueado)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setMostrarModalNuevo(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/30 transition-colors"
                                >
                                    Crear Administrador
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Editar Administrador */}
            {adminEditando && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold font-heading">Editar Administrador</h3>
                            <button onClick={() => setAdminEditando(null)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleActualizarAdmin} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Nombres *</label>
                                    <input
                                        type="text"
                                        value={adminEditando.nombre}
                                        onChange={(e) => setAdminEditando({ ...adminEditando, nombre: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Apellidos *</label>
                                    <input
                                        type="text"
                                        value={adminEditando.apellido}
                                        onChange={(e) => setAdminEditando({ ...adminEditando, apellido: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 uppercase">Correo Institucional *</label>
                                <input
                                    type="email"
                                    value={adminEditando.email}
                                    onChange={(e) => setAdminEditando({ ...adminEditando, email: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 uppercase">Cambiar Contraseña (Opcional)</label>
                                <input
                                    type="password"
                                    placeholder="Dejar en blanco para mantener la contraseña actual"
                                    value={adminEditando.password || ''}
                                    onChange={(e) => setAdminEditando({ ...adminEditando, password: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Cargo *</label>
                                    <select
                                        value={adminEditando.cargo}
                                        onChange={(e) => setAdminEditando({ ...adminEditando, cargo: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                                    >
                                        <option value="Administrador General">Administrador General</option>
                                        <option value="Bibliotecario Encargado">Bibliotecario Encargado</option>
                                        <option value="Auxiliar de Préstamos">Auxiliar de Préstamos</option>
                                        <option value="Catalogador">Catalogador</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Estado *</label>
                                    <select
                                        value={adminEditando.estado}
                                        onChange={(e) => setAdminEditando({ ...adminEditando, estado: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                                    >
                                        <option value="Activo">Activo (Puede ingresar)</option>
                                        <option value="Inactivo">Inactivo (Acceso bloqueado)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAdminEditando(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/30 transition-colors"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Confirmar Eliminar */}
            {adminEliminar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
                        <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-rose-100 text-rose-500 mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-1">¿Eliminar administrador?</h4>
                        <p className="text-sm text-slate-600 mb-6">Vas a revocar el acceso a "{adminEliminar.nombre} {adminEliminar.apellido}" ({adminEliminar.email}).</p>
                        <div className="flex gap-3">
                            <button onClick={() => setAdminEliminar(null)} className="flex-1 py-2.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors font-medium">Cancelar</button>
                            <button onClick={handleEliminarAdmin} className="flex-1 py-2.5 rounded-xl text-white bg-rose-600 hover:bg-rose-700 transition-colors font-medium shadow-md shadow-rose-600/30">Sí, eliminar</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default GestionAdmins;
