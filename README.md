# Sistema de Gestión de Biblioteca Institucional (Academic Library)

Sistema web integral para la administración de bibliotecas universitarias y colegiales. Incluye gestión de inventario con control de copias físicas disponibles, préstamos con búsqueda predictiva (autocompletado por cédula/nombre y libro/ISBN), cálculo automatizado de multas por mora ($1,000 COP/día), historial de auditoría de préstamos, landing page moderna y panel de administración con control de acceso y gestión de administradores.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Axios.
- **Backend:** Node.js, Express, MySQL2 (`promise`), CORS, Dotenv.
- **Base de Datos:** MySQL (compatible con Aiven Cloud y local).
- **Despliegue Cloud:**
  - **Base de Datos:** [Aiven for MySQL](https://aiven.io/)
  - **Backend API:** [Render](https://render.com/)
  - **Frontend SPA:** [Vercel](https://vercel.com/)

---

## 🚀 Despliegue en la Nube (Paso a Paso)

### 1. Base de Datos en Aiven
1. Regístrate o inicia sesión en [Aiven Console](https://console.aiven.io/).
2. Haz clic en **Create Service** y selecciona **MySQL**.
3. Elige el plan gratuito o básico y tu nube preferida (ej. AWS / GCP).
4. Asigna un nombre al servicio (ej. `biblioteca-mysql`) y haz clic en **Create Service**.
5. En la pestaña **Overview**:
   - Copia la **Service URI** (formato: `mysql://avnadmin:PASSWORD@HOST:PORT/defaultdb?ssl-mode=REQUIRED`).
   - El backend creará automáticamente todas las tablas (`libros`, `usuarios`, `prestamos`, `multas`, `administradores`) y el usuario administrador inicial al arrancar.

### 2. Backend en Render
1. Sube tu proyecto a un repositorio en **GitHub**.
2. Ve a [Render Dashboard](https://dashboard.render.com/) y haz clic en **New +** > **Web Service**.
3. Conecta tu repositorio de GitHub.
4. Configura los siguientes campos:
   - **Name:** `sistemas-biblioteca-backend` (o el nombre que prefieras).
   - **Root Directory:** `Backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. En la sección **Environment Variables**, añade:
   - `DATABASE_URL`: *(Pega aquí la Service URI de Aiven)*
   - `PORT`: `3001` (o déjalo vacío, Render asigna automáticamente el puerto).
6. Haz clic en **Create Web Service**.
7. Copia la URL pública generada por Render (ej. `https://sistemas-biblioteca-backend.onrender.com`).

### 3. Frontend en Vercel
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard) y haz clic en **Add New...** > **Project**.
2. Importa el mismo repositorio de GitHub.
3. En la configuración del proyecto:
   - **Root Directory:** Haz clic en *Edit* y selecciona la carpeta `FrontEnd`.
   - **Framework Preset:** `Vite`
4. En **Environment Variables**, añade:
   - `VITE_API_URL`: *(La URL de tu backend en Render, sin barra al final, ej: `https://sistemas-biblioteca-backend.onrender.com`)*
5. Haz clic en **Deploy**.
6. ¡Listo! Vercel desplegará tu aplicación y te dará una URL pública (ej. `https://tu-biblioteca.vercel.app`).

---

## 💻 Ejecución en Entorno Local

### Backend:
```bash
cd Backend
npm install
# Configurar archivo .env con las credenciales locales de MySQL
npm run dev
```

### Frontend:
```bash
cd FrontEnd
npm install
npm run dev
```

---

## 👤 Acceso Inicial al Sistema
- **Usuario:** `admin`
- **Contraseña:** `admin123`
*(Puedes cambiar las credenciales o crear nuevos administradores desde el módulo "Gestión de Administradores" dentro de la plataforma).*
