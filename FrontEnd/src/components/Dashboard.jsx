import { useState, useEffect } from 'react';
import api from '../api/config';

const images = [
    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // Library
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // Books on shelf
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // Reading a book
    "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"  // Stack of books
];

const Dashboard = ({ onNavigate }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [metricas, setMetricas] = useState(null);

    // Auto-play del carrusel
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // Cargar métricas en vivo del backend
    useEffect(() => {
        api.get('/api/prestamos/metricas')
            .then(res => setMetricas(res.data))
            .catch(err => console.error('Error al cargar métricas de biblioteca:', err));
    }, []);

    const goToSlide = (index) => setCurrentIndex(index);
    const nextSlide = () => setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
    const prevSlide = () => setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            
            {/* Sección de Bienvenida Hero */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        Sistema de Gestión de Biblioteca Institucional
                    </div>
                    <h2 className="text-4xl font-extrabold text-slate-800 leading-tight">
                        Bienvenido a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Academic Library</span>
                    </h2>
                    <p className="text-slate-500 text-base leading-relaxed">
                        Control integral de inventario, usuarios institucionales, préstamos, disponibilidad en tiempo real, alertas de vencimientos y cálculo automático de multas.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                        {onNavigate && (
                            <>
                                <button
                                    onClick={() => onNavigate('prestamos')}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                    Gestionar Préstamos
                                </button>
                                <button
                                    onClick={() => onNavigate('inventario')}
                                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    Ver Disponibilidad
                                </button>
                            </>
                        )}
                    </div>
                </div>
                
                <div className="w-full md:w-1/3 flex justify-center">
                    <div className="w-48 h-48 bg-gradient-to-tr from-indigo-100 to-blue-50 rounded-full flex items-center justify-center p-8 relative shadow-inner">
                        <svg className="w-28 h-28 text-indigo-600 drop-shadow-xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Tarjetas de Métricas en Tiempo Real */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Libros & Copias */}
                <div 
                    onClick={() => onNavigate && onNavigate('inventario')}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Catálogo</span>
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </div>
                    </div>
                    <h4 className="text-2xl font-bold text-slate-800 mt-2">
                        {metricas ? metricas.libros.total_libros : '...'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                        {metricas ? `${metricas.libros.total_disponibles} de ${metricas.libros.total_ejemplares} copias disp.` : 'Cargando...'}
                    </p>
                </div>

                {/* Usuarios Registrados */}
                <div 
                    onClick={() => onNavigate && onNavigate('usuarios')}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Usuarios</span>
                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                    </div>
                    <h4 className="text-2xl font-bold text-slate-800 mt-2">
                        {metricas ? metricas.usuarios.total_usuarios : '...'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                        {metricas ? `${metricas.usuarios.usuarios_activos} usuarios activos` : 'Cargando...'}
                    </p>
                </div>

                {/* Préstamos Activos */}
                <div 
                    onClick={() => onNavigate && onNavigate('prestamos')}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Préstamos en curso</span>
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                    </div>
                    <h4 className="text-2xl font-bold text-slate-800 mt-2">
                        {metricas ? metricas.prestamosActivos : '...'}
                    </h4>
                    <p className="text-xs text-emerald-600 font-medium mt-1">Libros en préstamo</p>
                </div>

                {/* Préstamos Vencidos y Multas */}
                <div 
                    onClick={() => onNavigate && onNavigate('vencidos')}
                    className={`bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer group ${
                        metricas && metricas.prestamosVencidos > 0 ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Vencidos / Multas</span>
                        <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                    </div>
                    <h4 className="text-2xl font-bold text-rose-600 mt-2">
                        {metricas ? metricas.prestamosVencidos : '...'}
                    </h4>
                    <p className="text-xs text-rose-500 font-medium mt-1">
                        {metricas ? `$${Number(metricas.multas.total_monto_pendiente).toLocaleString()} en multas` : 'Cargando...'}
                    </p>
                </div>

            </div>

            {/* Carrusel de Imágenes */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 px-1">Colección y Espacios Institucionales</h3>
                <div className="relative w-full h-[360px] rounded-3xl overflow-hidden shadow-xl group">
                    <div 
                        className="w-full h-full flex transition-transform duration-700 ease-out" 
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {images.map((src, index) => (
                            <div key={index} className="w-full h-full flex-shrink-0 relative">
                                <img src={src} alt={`Slide ${index}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent flex items-end">
                                    <div className="p-8 text-white w-full">
                                        <h4 className="text-2xl font-bold mb-1">Centro de Recursos y Conocimiento</h4>
                                        <p className="text-slate-200 text-sm">Préstamos eficientes, catálogo en línea y administración académica automatizada.</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Flechas de Navegación */}
                    <button 
                        onClick={prevSlide}
                        className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button 
                        onClick={nextSlide}
                        className="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>

                    {/* Indicadores */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${
                                    currentIndex === index ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default Dashboard;
