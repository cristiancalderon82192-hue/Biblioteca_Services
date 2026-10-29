import { useState, useEffect } from 'react';
import api from '../api/config';

const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [usuarioEliminar, setUsuarioEliminar] = useState(null);
    const [notificacion, setNotificacion] = useState({ visible: false, tipo: '', mensaje: '' });

    // Estado del formulario de nuevo usuario
    const [nuevoUsuario, setNuevoUsuario] = useState({
        documento_identidad: '',
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        tipo_usuario: 'Estudiante',
        estado: 'Activo'
    });

    const notificar = (tipo, mensaje) => {
        setNotificacion({ visible: true, tipo, mensaje });
        setTimeout(() => setNotificacion({ visible: false, tipo: '', mensaje: '' }), 4000);
    };

    const cargarUsuarios = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/usuarios');
            setUsuarios(res.data);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            notificar('error', 'No se pudieron cargar los usuarios.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const handleNuevoChange = (e) => {
        setNuevoUsuario({ ...nuevoUsuario, [e.target.name]: e.target.value });
    };

    const handleRegistrar = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/usuarios', nuevoUsuario);
            notificar('success', res.data.mensaje || 'Usuario registrado exitosamente.');
            setMostrarModalNuevo(false);
            setNuevoUsuario({
                documento_identidad: '',
                nombre: '',
                apellido: '',
                email: '',
                telefono: '',
                tipo_usuario: 'Estudiante',
                estado: 'Activo'
            });
            cargarUsuarios();
        } catch (error) {
            notificar('error', error.response?.data?.error || 'Error al registrar usuario.');
        }
    };

    const handleGuardarEdicion = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/api/usuarios/${usuarioEditando.id_usuario}`, usuarioEditando);
            notificar('success', res.data.mensaje || 'Usuario actualizado correctamente.');
            setUsuarioEditando(null);
            cargarUsuarios();
        } catch (error) {
            notificar('error', error.response?.data?.error || 'Error al actualizar usuario.');
        }
    };

    const handleEliminar = async () => {
        if (!usuarioEliminar) return;
        try {
            await api.delete(`/api/usuarios/${usuarioEliminar.id_usuario}`);
            notificar('success', 'Usuario eliminado correctamente.');
            setUsuarioEliminar(null);
            cargarUsuarios();
        } catch (error) {
            notificar('error', error.response?.data?.error || 'No se pudo eliminar el usuario.');
            setUsuarioEliminar(null);
        }
    };

    const usuariosFiltrados = usuarios.filter(u => {
        const query = searchTerm.toLowerCase();
        const coincideBusqueda = 
            u.nombre.toLowerCase().includes(query) ||
            u.apellido.toLowerCase().includes(query) ||
            u.documento_identidad.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query);
        const coincideTipo = filtroTipo ? u.tipo_usuario === filtroTipo : true;
        return coincideBusqueda && coincideTipo;
    });

    return (
        <div className="w-full space-y-6">
            
            {/* Notificación flotante */}
            {notificacion.visible && (
                <div className={`p-4 rounded-xl text-white shadow-xl flex items-center justify-between transition-all duration-300 ${notificacion.tipo === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
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

            {/* Cabecera y botón de acción */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h2>
                    <p className="text-slate-500 text-sm mt-1">Registra y administra estudiantes, docentes y personal institucional.</p>
                </div>
                <button
                    onClick={() => setMostrarModalNuevo(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    <span>Nuevo Usuario</span>
                </button>
            </div>

            {/* Filtros de búsqueda */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, documento o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                    />
                </div>

                <div className="flex w-full md:w-auto items-center gap-3">
                    <select
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm"
                    >
                        <option value="">Todos los tipos</option>
                        <option value="Estudiante">Estudiante</option>
                        <option value="Docente">Docente</option>
                        <option value="Administrativo">Administrativo</option>
                        <option value="Externo">Externo</option>
                    </select>

                    <button 
                        onClick={cargarUsuarios} 
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                        title="Recargar usuarios"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>
            </div>

            {/* Listado de Usuarios */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
            ) : usuariosFiltrados.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                    <p className="text-slate-500 font-medium">No se encontraron usuarios registrados.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-6">Usuario</th>
                                    <th className="py-3.5 px-6">Documento</th>
                                    <th className="py-3.5 px-6">Contacto</th>
                                    <th className="py-3.5 px-6">Tipo</th>
                                    <th className="py-3.5 px-6">Estado</th>
                                    <th className="py-3.5 px-6">Préstamos</th>
                                    <th className="py-3.5 px-6 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {usuariosFiltrados.map((u) => (
                                    <tr key={u.id_usuario} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-sm">
                                                    {u.nombre.charAt(0)}{u.apellido.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{u.nombre} {u.apellido}</p>
                                                    <p className="text-xs text-slate-400">ID: #{u.id_usuario}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 font-mono text-slate-700 font-medium">{u.documento_identidad}</td>
                                        <td className="py-4 px-6">
                                            <p className="text-slate-700">{u.email}</p>
                                            <p className="text-xs text-slate-400">{u.telefono || 'Sin teléfono'}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                                {u.tipo_usuario}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                                                u.estado === 'Activo' 
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                    : u.estado === 'Suspendido'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                            }`}>
                                                {u.estado}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-lg ${u.prestamos_activos > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {u.prestamos_activos || 0} activos
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setUsuarioEditando(u)}
                                                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Editar usuario"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => setUsuarioEliminar(u)}
                                                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Eliminar usuario"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal: Registrar Nuevo Usuario */}
            {mostrarModalNuevo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold">Registrar Usuario Institucional</h3>
                            <button onClick={() => setMostrarModalNuevo(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleRegistrar} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Documento / Cédula / RUT *</label>
                                    <input
                                        type="text"
                                        name="documento_identidad"
                                        value={nuevoUsuario.documento_identidad}
                                        onChange={handleNuevoChange}
                                        placeholder="Ej: 10203040"
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Tipo de Usuario *</label>
                                    <select
                                        name="tipo_usuario"
                                        value={nuevoUsuario.tipo_usuario}
                                        onChange={handleNuevoChange}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                                    >
                                        <option value="Estudiante">Estudiante</option>
                                        <option value="Docente">Docente</option>
                                        <option value="Administrativo">Administrativo</option>
                                        <option value="Externo">Externo</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Nombres *</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={nuevoUsuario.nombre}
                                        onChange={handleNuevoChange}
                                        placeholder="Ej: Carlos"
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Apellidos *</label>
                                    <input
                                        type="text"
                                        name="apellido"
                                        value={nuevoUsuario.apellido}
                                        onChange={handleNuevoChange}
                                        placeholder="Ej: Gómez"
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Correo Electrónico *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={nuevoUsuario.email}
                                        onChange={handleNuevoChange}
                                        placeholder="carlos@universidad.edu"
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Teléfono</label>
                                    <input
                                        type="text"
                                        name="telefono"
                                        value={nuevoUsuario.telefono}
                                        onChange={handleNuevoChange}
                                        placeholder="Ej: 3001234567"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
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
                                    Guardar Usuario
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Editar Usuario */}
            {usuarioEditando && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold">Editar Usuario</h3>
                            <button onClick={() => setUsuarioEditando(null)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleGuardarEdicion} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Documento *</label>
                                    <input
                                        type="text"
                                        value={usuarioEditando.documento_identidad}
                                        onChange={(e) => setUsuarioEditando({ ...usuarioEditando, documento_identidad: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Estado *</label>
                                    <select
                                        value={usuarioEditando.estado}
                                        onChange={(e) => setUsuarioEditando({ ...usuarioEditando, estado: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                                    >
                                        <option value="Activo">Activo</option>
                                        <option value="Suspendido">Suspendido</option>
                                        <option value="Inactivo">Inactivo</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Nombres *</label>
                                    <input
                                        type="text"
                                        value={usuarioEditando.nombre}
                                        onChange={(e) => setUsuarioEditando({ ...usuarioEditando, nombre: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Apellidos *</label>
                                    <input
                                        type="text"
                                        value={usuarioEditando.apellido}
                                        onChange={(e) => setUsuarioEditando({ ...usuarioEditando, apellido: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Correo *</label>
                                    <input
                                        type="email"
                                        value={usuarioEditando.email}
                                        onChange={(e) => setUsuarioEditando({ ...usuarioEditando, email: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Teléfono</label>
                                    <input
                                        type="text"
                                        value={usuarioEditando.telefono || ''}
                                        onChange={(e) => setUsuarioEditando({ ...usuarioEditando, telefono: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setUsuarioEditando(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/30 transition-colors"
                                >
                                    Actualizar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Confirmación Eliminar */}
            {usuarioEliminar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
                        <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-rose-100 text-rose-500 mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-1">¿Eliminar usuario?</h4>
                        <p className="text-sm text-slate-600 mb-6">Vas a eliminar a "{usuarioEliminar.nombre} {usuarioEliminar.apellido}". Esta acción es irreversible.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setUsuarioEliminar(null)} className="flex-1 py-2.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors font-medium">Cancelar</button>
                            <button onClick={handleEliminar} className="flex-1 py-2.5 rounded-xl text-white bg-rose-600 hover:bg-rose-700 transition-colors font-medium shadow-md shadow-rose-600/30">Sí, eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionUsuarios;
