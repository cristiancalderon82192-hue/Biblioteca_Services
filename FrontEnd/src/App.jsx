import { useState, useEffect } from 'react';
import LandingLogin from './components/LandingLogin';
import FormularioLibro from './components/FormularioLibro';
import InventarioLibros from './components/InventarioLibros';
import Dashboard from './components/Dashboard';
import GestionUsuarios from './components/GestionUsuarios';
import GestionPrestamos from './components/GestionPrestamos';
import PrestamosVencidos from './components/PrestamosVencidos';
import HistorialPrestamos from './components/HistorialPrestamos';
import GestionAdmins from './components/GestionAdmins';

function App() {
  // Estado de autenticación
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [modoVisitanteCatalogo, setModoVisitanteCatalogo] = useState(false);

  // Módulo activo en el panel
  const [activeModule, setActiveModule] = useState('dashboard');
  const [libroSeleccionadoParaPrestamo, setLibroSeleccionadoParaPrestamo] = useState(null);

  // Verificar si hay sesión recordada
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('biblioteca_usuario');
    if (usuarioGuardado) {
      try {
        setUsuarioActual(JSON.parse(usuarioGuardado));
      } catch (e) {
        console.error('Error restaurando sesión:', e);
      }
    }
  }, []);

  const handleLoginSuccess = (usuario) => {
    setUsuarioActual(usuario);
    setModoVisitanteCatalogo(false);
    setActiveModule('dashboard');
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('biblioteca_usuario');
    localStorage.removeItem('biblioteca_token');
    setUsuarioActual(null);
    setModoVisitanteCatalogo(false);
    setActiveModule('dashboard');
  };

  const irAPrestamoConLibro = (libro) => {
    setLibroSeleccionadoParaPrestamo(libro);
    setActiveModule('prestamos');
  };

  // Si no está autenticado y no está en modo visitante, mostrar la Landing con Login
  if (!usuarioActual && !modoVisitanteCatalogo) {
    return (
      <LandingLogin 
        onLoginSuccess={handleLoginSuccess}
        onExplorarPublico={() => setModoVisitanteCatalogo(true)}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* --- SIDEBAR LATERAL --- */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col transition-all duration-300 shadow-2xl relative z-20">
        
        {/* Logo / Nombre del Sistema */}
        <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-white font-heading">
                        Academic Library
                    </h1>
                    <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
                        {modoVisitanteCatalogo ? 'Modo Visitante' : 'Portal Administrativo'}
                    </p>
                </div>
            </div>
        </div>
        
        {/* Navegación según los Requerimientos */}
        <nav className="flex-1 px-4 space-y-1.5 py-4 overflow-y-auto">
            
            <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Panel Principal</p>
            
            <button 
                onClick={() => setActiveModule('dashboard')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm ${activeModule === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                <span>Inicio / Métricas</span>
            </button>
            
            <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-4 mb-2">Libros & Disponibilidad</p>

            <button 
                onClick={() => setActiveModule('inventario')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm ${activeModule === 'inventario' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <span>2. Disponibilidad de Libros</span>
            </button>

            {/* Acciones de gestión para administradores */}
            {usuarioActual && (
              <>
                <button 
                    onClick={() => setActiveModule('registro_libro')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm ${activeModule === 'registro_libro' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>1. Registrar Libros</span>
                </button>

                <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-4 mb-2">Comunidad & Lectores</p>

                <button 
                    onClick={() => setActiveModule('usuarios')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm ${activeModule === 'usuarios' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    <span>1. Registrar Usuarios / Lectores</span>
                </button>

                <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-4 mb-2">Operaciones & Auditoría</p>

                <button 
                    onClick={() => setActiveModule('prestamos')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm ${activeModule === 'prestamos' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span>3. Préstamos y Devoluciones</span>
                </button>

                <button 
                    onClick={() => setActiveModule('vencidos')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm ${activeModule === 'vencidos' ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <span>4. Préstamos Vencidos & Multas</span>
                </button>

                <button 
                    onClick={() => setActiveModule('historial')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm ${activeModule === 'historial' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                    <span>5. Historial de Préstamos</span>
                </button>

                {/* NUEVO MÓDULO: GESTIÓN DE ADMINISTRADORES */}
                <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-4 mb-2">Seguridad & Equipo</p>

                <button 
                    onClick={() => setActiveModule('admins')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm ${activeModule === 'admins' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                >
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    <span>Crear / Gestionar Admins</span>
                </button>
              </>
            )}

        </nav>
        
        {/* Footer Usuario & Cerrar Sesión */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
            {usuarioActual ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                        {usuarioActual.avatar || 'A'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{usuarioActual.nombre} {usuarioActual.apellido}</p>
                        <p className="text-[11px] text-indigo-400 font-medium truncate">{usuarioActual.cargo || usuarioActual.rol}</p>
                    </div>
                </div>
                <button
                    onClick={handleCerrarSesion}
                    title="Cerrar Sesión"
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors ml-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setModoVisitanteCatalogo(false)}
                className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                <span>Volver al Login / Landing</span>
              </button>
            )}
        </div>
      </aside>

      {/* --- ÁREA DE CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        {/* Header superior */}
        <header className="bg-white/90 backdrop-blur-md shadow-xs border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 font-heading">
                    {activeModule === 'dashboard' && 'Dashboard y Métricas'}
                    {activeModule === 'registro_libro' && '1. Registrar Nuevo Libro'}
                    {activeModule === 'usuarios' && '1. Gestión de Lectores / Usuarios'}
                    {activeModule === 'inventario' && '2. Consulta de Disponibilidad de Libros'}
                    {activeModule === 'prestamos' && '3. Gestión de Préstamos y Devoluciones'}
                    {activeModule === 'vencidos' && '4. Control de Préstamos Vencidos y Multas'}
                    {activeModule === 'historial' && '5. Historial y Auditoría de Préstamos'}
                    {activeModule === 'admins' && 'Gestión de Administradores del Sistema'}
                </h2>
                <p className="text-xs text-slate-500">Sistema Institucional de Gestión Bibliotecaria</p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right">
                    <span className="text-xs font-semibold text-slate-700 block">
                      {usuarioActual ? `${usuarioActual.nombre} (${usuarioActual.cargo || usuarioActual.rol})` : 'Modo Exploración'}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-medium">● Servidor en línea</span>
                </div>

                {usuarioActual ? (
                  <button
                      onClick={handleCerrarSesion}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5"
                  >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      <span>Salir</span>
                  </button>
                ) : (
                  <button
                      onClick={() => setModoVisitanteCatalogo(false)}
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                      Iniciar Sesión
                  </button>
                )}
            </div>
        </header>
        
        {/* Contenedor dinámico */}
        <div className="p-8 max-w-7xl mx-auto w-full flex-1">
            
            {activeModule === 'dashboard' && (
                <Dashboard onNavigate={setActiveModule} />
            )}
            
            {activeModule === 'registro_libro' && (
                <div className="flex justify-center">
                    <FormularioLibro />
                </div>
            )}

            {activeModule === 'usuarios' && (
                <GestionUsuarios />
            )}

            {activeModule === 'inventario' && (
                <InventarioLibros onSolicitarPrestamo={usuarioActual ? irAPrestamoConLibro : null} />
            )}

            {activeModule === 'prestamos' && (
                <GestionPrestamos 
                    libroPreseleccionado={libroSeleccionadoParaPrestamo}
                    onLimpiarLibroPreseleccionado={() => setLibroSeleccionadoParaPrestamo(null)}
                />
            )}

            {activeModule === 'vencidos' && (
                <PrestamosVencidos />
            )}

            {activeModule === 'historial' && (
                <HistorialPrestamos />
            )}

            {activeModule === 'admins' && (
                <GestionAdmins adminLogueado={usuarioActual} />
            )}
        </div>
      </main>
    </div>
  );
}

export default App;