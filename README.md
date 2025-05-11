# Salidas BA - Recomendaciones de Eventos y Restaurantes

Aplicación web para recomendar salidas combinando eventos culturales (cine, teatro, música) con restaurantes en Buenos Aires, utilizando IA para personalizar las recomendaciones.

![Salidas BA](https://img.shields.io/badge/Salidas-BA-blue)
![Versión](https://img.shields.io/badge/Versión-1.0-green)

## 🚀 Descripción

Esta aplicación web está diseñada para recomendar salidas completas en Buenos Aires, combinando eventos culturales (cine, teatro, música) con restaurantes. La aplicación utiliza scraping para obtener información actualizada de carteleras de eventos y emplea IA (Gemini API) para generar recomendaciones personalizadas basadas en los mensajes del usuario.

## 📋 Características

- **Scraping Automatizado**: Obtiene información de eventos de cine (SerpApi), teatro (Plateanet, Alternativa Teatral) y música (Songkick).
- **Gestión de Datos**: Combina información de múltiples fuentes y la estructura para su uso.
- **Recomendaciones por IA**: Utiliza Google Gemini para generar recomendaciones personalizadas.
- **Frontend Interactivo**: Interfaz atractiva y responsiva construida con React y TailwindCSS.
- **Búsqueda y Filtrado**: Permite explorar eventos por categoría.
- **Visualización Detallada**: Muestra información completa de eventos y restaurantes.

## 🛠️ Tecnologías

### Backend
- Node.js y Express
- Axios para peticiones HTTP
- Cheerio para web scraping
- Google Generative AI (Gemini) para IA
- Node-cron para tareas programadas

### Frontend
- React (Vite)
- TailwindCSS para estilos
- Axios para consumo de API
- React Tabs para navegación
- React Icons para iconografía

## 📁 Estructura del Proyecto

El proyecto está dividido en dos partes principales:

```
/
├── backend/             # Código del servidor
│   ├── scrapers/        # Scripts para obtener datos
│   ├── routes/          # Endpoints de la API
│   ├── data/            # Datos persistentes
│   └── app.js           # Punto de entrada
├── frontend/            # Aplicación web
│   ├── src/             # Código fuente de React
│   │   ├── components/  # Componentes de UI
│   │   └── App.jsx      # Componente principal
│   ├── public/          # Activos estáticos
│   └── index.html       # Página principal
└── README.md            # Este archivo
```

## 🔧 Instalación y Ejecución

### Requisitos previos
- Node.js 14.x o superior
- Cuenta en SerpApi para datos de cine
- Cuenta en Google AI Studio para Gemini

### Backend

1. Navegar a la carpeta `backend`
2. Instalar dependencias:
   ```
   npm install
   ```
3. Crear archivo `.env` con las claves requeridas:
   ```
   SERPAPI_KEY=tu_clave_serpapi
   GEMINI_API_KEY=tu_clave_gemini
   ```
4. Iniciar el servidor:
   ```
   npm run dev
   ```

El servidor estará disponible en `http://localhost:3000`

### Frontend

1. Navegar a la carpeta `frontend`
2. Instalar dependencias:
   ```
   npm install
   ```
3. Crear archivo `.env` (opcional para desarrollo):
   ```
   VITE_API_URL=http://localhost:3000
   ```
4. Iniciar la aplicación:
   ```
   npm run dev
   ```

La aplicación estará disponible en `http://localhost:5173`

## 🚢 Despliegue

### Backend (Render)
1. Crear un nuevo Web Service en Render
2. Conectar el repositorio de GitHub
3. Configurar:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Agregar variables de entorno
   - Configurar CRON job para actualizaciones automáticas

### Frontend (Vercel)
1. Crear un nuevo proyecto en Vercel
2. Conectar el repositorio de GitHub
3. Configurar:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Agregar variable de entorno: `VITE_API_URL`

## 📄 Licencia

Desarrollado para proyecto universitario - Todos los derechos reservados.

## ✨ Agradecimientos

- SerpApi por la API de Showtimes
- Google AI Studio por la API de Gemini
- Datos obtenidos de Plateanet, Alternativa Teatral y Songkick 