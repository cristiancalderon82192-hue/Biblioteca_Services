import { useState, useEffect } from 'react';
import api from '../api/config';

const LandingLogin = ({ onLoginSuccess, onExplorarPublico }) => {
    const [email, setEmail] = useState('admin@universidad.edu');
    const [password, setPassword] = useState('admin123');
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [recordarme, setRecordarme] = useState(true);
    const [cargando, setCargando] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Búsqueda rápida de disponibilidad en la landing (modo visitante/comunidad)
    const [busquedaLibro, setBusquedaLibro] = useState('');
    const [librosDisponibilidad, setLibrosDisponibilidad] = useState([]);
    const [resultadoBusqueda, setResultadoBusqueda] = useState(null);

    // Cargar libros para preview de disponibilidad en la landing
    useEffect(() => {
        api.get('/api/libros')
            .then(res => setLibrosDisponibilidad(res.data))
            .catch(err => console.error('Error cargando libros para preview:', err));
    }, []);

    const autocompletarAdmin = () => {
        setEmail('admin@universidad.edu');
        setPassword('admin123');
        setErrorMsg('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setCargando(true);

        try {
            const res = await api.post('/api/auth/login', {
                email,
                password
            });

            if (recordarme) {
                localStorage.setItem('biblioteca_usuario', JSON.stringify(res.data.usuario));
                localStorage.setItem('biblioteca_token', res.data.token);
            }

            onLoginSuccess(res.data.usuario);
        } catch (error) {
            setErrorMsg(error.response?.data?.error || 'Credenciales incorrectas. Verifica correo o contraseña.');
        } finally {
            setCargando(false);
        }
    };

    // Búsqueda en vivo de disponibilidad para la comunidad
    const handleBusquedaRapida = (e) => {
        const query = e.target.value;
        setBusquedaLibro(query);
        if (query.trim().length > 1) {
            const filtrados = librosDisponibilidad.filter(l => 
                l.titulo.toLowerCase().includes(query.toLowerCase()) ||
                l.editorial.toLowerCase().includes(query.toLowerCase()) ||
                l.isbn.toLowerCase().includes(query.toLowerCase())
            );
            setResultadoBusqueda(filtrados.slice(0, 4));
        } else {
            setResultadoBusqueda(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
            
            {/* Luces y orbes de fondo (Glow Effects) */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
            <div className="absolute top-1/3 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* --- NAVBAR DE LA LANDING --- */}
            <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 px-6 lg:px-12 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/20">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold tracking-tight text-white font-heading">Academic Library</span>
                            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                Portal Institucional
                            </span>
                        </div>
                        <p className="text-xs text-slate-400">Sistema Centralizado de Gestión Bibliotecaria</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={onExplorarPublico}
                        className="hidden md:flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 rounded-xl border border-slate-800 transition-all"
                    >
                        <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <span>Explorar Catálogo</span>
                    </button>
                    
                    <a
                        href="#admin-login-card"
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-1.5"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        <span>Acceso Administrador</span>
                    </a>
                </div>
            </header>

            {/* --- HERO SECTION: LANDING + LOGIN ADMIN --- */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                
                {/* LADO IZQUIERDO: Propuesta de valor & Buscador rápido de libros */}
                <div className="lg:col-span-7 space-y-8">
                    
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-inner">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                        <span>Plataforma Bibliotecaria 2026 • Administración Centralizada</span>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] font-heading">
                            Gestión integral de biblioteca <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                                eficiente, clara y bajo control.
                            </span>
                        </h1>
                        <p className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
                            Control total sobre el catálogo de títulos, usuarios institucionales, préstamos activos, devoluciones inmediatas y cálculo automático de multas por mora.
                        </p>
                    </div>

                    {/* Buscador de Disponibilidad en la Landing (Requerimiento 2 para la comunidad) */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md max-w-xl">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Consultar Disponibilidad de Ejemplares
                            </span>
                            <span className="text-[11px] text-slate-500">Búsqueda rápida</span>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Escribe el título, autor o ISBN..."
                                value={busquedaLibro}
                                onChange={handleBusquedaRapida}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>

                        {/* Resultados de la consulta rápida */}
                        {resultadoBusqueda && (
                            <div className="mt-3 space-y-2 border-t border-slate-800/80 pt-3 animate-in fade-in duration-200">
                                {resultadoBusqueda.length === 0 ? (
                                    <p className="text-xs text-slate-500 italic py-1">No se encontraron títulos con esa búsqueda.</p>
                                ) : (
                                    resultadoBusqueda.map(libro => {
                                        const tieneCopias = (libro.copias_disponibles ?? 0) > 0;
                                        return (
                                            <div key={libro.id_libro} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs">
                                                <div className="overflow-hidden pr-2">
                                                    <p className="font-semibold text-slate-200 truncate">{libro.titulo}</p>
                                                    <p className="text-[11px] text-slate-400 truncate">{libro.editorial} • {libro.ubicacion}</p>
                                                </div>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                                                    tieneCopias 
                                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                                }`}>
                                                    {tieneCopias ? `Disponible (${libro.copias_disponibles} copias)` : 'Agotado'}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    {/* Métricas destacadas */}
                    <div className="grid grid-cols-3 gap-6 pt-2 max-w-lg border-t border-slate-800/80">
                        <div>
                            <p className="text-2xl font-extrabold text-white font-heading">5 Módulos</p>
                            <p className="text-xs text-slate-400 mt-0.5">Control Institucional</p>
                        </div>
                        <div>
                            <p className="text-2xl font-extrabold text-indigo-400 font-heading">1-Clic</p>
                            <p className="text-xs text-slate-400 mt-0.5">Préstamo y Devolución</p>
                        </div>
                        <div>
                            <p className="text-2xl font-extrabold text-emerald-400 font-heading">100%</p>
                            <p className="text-xs text-slate-400 mt-0.5">Enlace en Tiempo Real</p>
                        </div>
                    </div>

                </div>

                {/* LADO DERECHO: Formulario de Login Exclusivo para el Administrador */}
                <div id="admin-login-card" className="lg:col-span-5">
                    <div className="relative">
                        
                        {/* Resplandor elegante de borde */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur-lg opacity-35 transition duration-1000"></div>

                        {/* Card Glassmorphism */}
                        <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
                            
                            {/* Encabezado del Login */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2">
                                        <span>👑</span>
                                        <span>Acceso Exclusivo Administrador</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white font-heading">Panel de Control</h2>
                                    <p className="text-xs text-slate-400 mt-0.5">Accede para administrar libros, usuarios y préstamos</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                            </div>

                            {/* Alerta de Error */}
                            {errorMsg && (
                                <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            {/* Formulario */}
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-slate-300">Correo de Administrador</label>
                                        <button
                                            type="button"
                                            onClick={autocompletarAdmin}
                                            className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium"
                                        >
                                            Restablecer credenciales demo
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="admin@universidad.edu"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300">Contraseña Maestra</label>
                                    <div className="relative">
                                        <input
                                            type={mostrarPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setMostrarPassword(!mostrarPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            {mostrarPassword ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={recordarme}
                                            onChange={(e) => setRecordarme(e.target.checked)}
                                            className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                                        />
                                        <span className="text-xs text-slate-400">Recordar credenciales</span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={cargando}
                                    className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200 active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {cargando ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span>Ingresar al Panel de Biblioteca</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Badge de Seguridad */}
                            <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
                                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                <span>Acceso Protegido • TLS 1.3 Cifrado</span>
                            </div>

                        </div>
                    </div>
                </div>

            </main>

            {/* --- SECCIÓN DE CARACTERÍSTICAS / LOS 5 REQUERIMIENTOS --- */}
            <section className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 py-16 px-6 lg:px-12">
                <div className="max-w-7xl mx-auto space-y-10">
                    <div className="text-center max-w-2xl mx-auto space-y-2">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Módulos Administrativos</span>
                        <h3 className="text-3xl font-extrabold text-white font-heading">Control Total para el Administrador</h3>
                        <p className="text-sm text-slate-400">Una solución integral que centraliza las operaciones de la biblioteca institucional.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        
                        {/* 1 */}
                        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2">1. Libros y Usuarios</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Registro completo del inventario de libros con copias y administración de la comunidad universitaria.
                            </p>
                        </div>

                        {/* 2 */}
                        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2">2. Disponibilidad en Vivo</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Visualización en tiempo real de copias disponibles y títulos agotados o en circulación.
                            </p>
                        </div>

                        {/* 3 */}
                        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2">3. Préstamos y Devolución</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Procesamiento ágil de salidas y recepciones de libros con ajuste automático de existencias.
                            </p>
                        </div>

                        {/* 4 & 5 */}
                        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-rose-500/40 hover:bg-slate-900 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-xl bg-rose-600/10 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2">4 & 5. Multas e Historial</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Identificación de préstamos vencidos, cálculo de tarifas por día de mora y auditoría histórica completa.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- FOOTER INSTITUCIONAL --- */}
            <footer className="border-t border-slate-800 bg-slate-950 py-8 px-6 lg:px-12 text-center text-xs text-slate-500 space-y-2">
                <p>© 2026 Academic Library System • Gestión Administrativa Institucional.</p>
                <p className="text-slate-600">Acceso exclusivo para el Administrador y Personal Bibliotecario autorizado.</p>
            </footer>

        </div>
    );
};

export default LandingLogin;
