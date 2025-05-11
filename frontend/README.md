# Frontend de Recomendaciones de Salidas

Aplicación web para visualizar y obtener recomendaciones personalizadas de salidas culturales y gastronómicas en Buenos Aires.

## Características

- Visualización de cartelera de eventos (cine, teatro, música)
- Filtrado por categorías
- Formulario para solicitar recomendaciones personalizadas
- Integración con backend de IA para recomendaciones
- Diseño responsivo con TailwindCSS
- Listo para desplegar en Vercel

## Tecnologías

- React (Vite)
- TailwindCSS para estilos
- Axios para peticiones HTTP
- React Icons para iconografía
- React Tabs para navegación por pestañas
- React Loader Spinner para indicadores de carga

## Estructura del Proyecto

```
frontend/
├── src/                # Código fuente
│   ├── components/     # Componentes de React
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── CarteleraList.jsx
│   │   ├── CarteleraCard.jsx
│   │   ├── PromptForm.jsx
│   │   ├── Recomendacion.jsx
│   │   └── Loader.jsx
│   ├── App.jsx         # Componente principal
│   ├── main.jsx        # Punto de entrada
│   └── index.css       # Estilos globales
├── public/             # Activos estáticos
├── vite.config.js      # Configuración de Vite
├── tailwind.config.js  # Configuración de TailwindCSS
└── package.json        # Dependencias
```

## Instalación

1. Clonar el repositorio
2. Navegar a la carpeta `frontend`
3. Instalar dependencias:

```bash
npm install
```

4. Crear un archivo `.env` con las siguientes variables:

```
VITE_API_URL=http://localhost:3000
```

## Ejecución

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

Para construir para producción:

```bash
npm run build
```

Para previsualizar la versión de producción:

```bash
npm run preview
```

## Despliegue en Vercel

1. Crear una cuenta en Vercel
2. Conectar el repositorio de GitHub
3. Configurar las variables de entorno:
   - `VITE_API_URL` = URL de la API en producción
4. Desplegar!

## Notas para Desarrollo

- Asegúrate de que el backend esté en ejecución para las peticiones API
- Puedes ajustar la URL de la API en el archivo `.env` 