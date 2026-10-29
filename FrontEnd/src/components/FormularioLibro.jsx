import { useState } from 'react';
import api from '../api/config';

const FormularioLibro = () => {
    const [libro, setLibro] = useState({
        isbn: '', titulo: '', subtitulo: '', anio_publicacion: '',
        edicion: '', editorial: '', idioma: '', descripcion: '',
        numero_paginas: '', ubicacion: '', portada: '', copias_totales: 1
    });

    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', message: '' });

    const handleChange = (e) => {
        setLibro({ ...libro, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const respuesta = await api.post('/api/libros', libro);
            setModalConfig({ 
                isOpen: true, 
                type: 'success', 
                message: respuesta.data?.mensaje || '¡Libro registrado exitosamente!' 
            });
        } catch (error) {
            setModalConfig({ 
                isOpen: true, 
                type: 'error', 
                message: error.response?.data?.error || 'Ocurrió un error al registrar el libro.' 
            });
        }
    };

    const closeModal = () => {
        if (modalConfig.type === 'success') {
            setLibro({
                isbn: '', titulo: '', subtitulo: '', anio_publicacion: '',
                edicion: '', editorial: '', idioma: '', descripcion: '',
                numero_paginas: '', ubicacion: '', portada: '', copias_totales: 1
            });
        }
        setModalConfig({ ...modalConfig, isOpen: false });
    };

    return (
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white">
                <h2 className="text-3xl font-bold tracking-tight">Registrar Nuevo Libro</h2>
                <p className="mt-2 text-blue-100 text-sm">Completa la información a continuación para añadir un libro y sus copias a la biblioteca.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">ISBN *</label>
                        <input type="text" name="isbn" value={libro.isbn} placeholder="Ej: 978-3-16-148410-0" onChange={handleChange} required 
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Título *</label>
                        <input type="text" name="titulo" value={libro.titulo} placeholder="Título del libro" onChange={handleChange} required 
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Subtítulo</label>
                        <input type="text" name="subtitulo" value={libro.subtitulo} placeholder="Subtítulo (opcional)" onChange={handleChange} 
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Año de Publicación *</label>
                        <input type="number" name="anio_publicacion" value={libro.anio_publicacion} placeholder="Ej: 2023" onChange={handleChange} required max="2026" 
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Edición</label>
                        <input type="text" name="edicion" value={libro.edicion} placeholder="Ej: 1ra Edición" onChange={handleChange} 
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Editorial *</label>
                        <input type="text" name="editorial" value={libro.editorial} placeholder="Nombre de editorial" onChange={handleChange} required 
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Idioma *</label>
                        <input type="text" name="idioma" value={libro.idioma} placeholder="Ej: Español" onChange={handleChange} required 
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Número de páginas</label>
                        <input type="number" name="numero_paginas" value={libro.numero_paginas} placeholder="Ej: 350" onChange={handleChange} min="1" 
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Ubicación *</label>
                        <input type="text" name="ubicacion" value={libro.ubicacion} placeholder="Sala A - Estante 03" onChange={handleChange} required 
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Cantidad de Ejemplares (Copias) *</label>
                        <input type="number" name="copias_totales" value={libro.copias_totales} placeholder="Ej: 3" onChange={handleChange} min="1" required 
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-semibold text-gray-700">URL Portada</label>
                        <input type="url" name="portada" value={libro.portada} placeholder="Enlace a la imagen de portada" onChange={handleChange} 
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-semibold text-gray-700">Descripción</label>
                        <textarea name="descripcion" value={libro.descripcion} placeholder="Breve sinopsis o descripción del libro" onChange={handleChange} rows="3"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"></textarea>
                    </div>
                </div>
                
                <div className="pt-4">
                    <button type="submit" 
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transform transition-all active:scale-[0.98]">
                        Guardar Libro
                    </button>
                </div>
            </form>

            {/* Modal de Guardado */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
                        <div className={`p-6 text-center border-t-8 ${modalConfig.type === 'success' ? 'border-emerald-500' : 'border-rose-500'}`}>
                            
                            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${modalConfig.type === 'success' ? 'bg-emerald-100 text-emerald-500' : 'bg-rose-100 text-rose-500'} mb-6`}>
                                {modalConfig.type === 'success' ? (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                )}
                            </div>
                            
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">
                                {modalConfig.type === 'success' ? '¡Éxito!' : 'Oops, error'}
                            </h3>
                            
                            <p className="text-slate-600 text-base mb-8">
                                {modalConfig.message}
                            </p>
                            
                            <button onClick={closeModal} 
                                className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-colors ${modalConfig.type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30'} shadow-lg`}>
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FormularioLibro;