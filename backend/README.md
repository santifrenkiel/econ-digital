# Backend de Recomendaciones de Salidas

API REST para recomendar salidas combinando eventos culturales con restaurantes en Buenos Aires.

## Características

- Scraping automático de cartelera de cine, teatro y eventos musicales
- Gestión de datos de restaurantes
- API para recomendaciones personalizadas usando IA (Gemini)
- Programación de tareas con CRON
- Listo para desplegar en Render

## Estructura del Proyecto

```
backend/
├── scrapers/           # Scripts para obtener datos
│   ├── cine.js         # Scraper de cine (SerpApi)
│   ├── teatro_*.js     # Scrapers de teatro
│   ├── musica_*.js     # Scrapers de eventos musicales
│   └── index.js        # Centraliza todos los scrapers
├── routes/             # Rutas de la API
│   ├── cartelera.js    # Endpoints para eventos
│   ├── reviews.js      # Endpoints para restaurantes
│   └── recomendar.js   # Endpoints para recomendaciones
├── data/               # Datos persistentes
│   ├── cartelera.json  # Eventos culturales
│   └── reviews_*.json  # Datos de restaurantes
├── app.js              # Punto de entrada principal
├── .env                # Variables de entorno (agregar a .gitignore)
└── package.json        # Dependencias
```

## Requisitos Previos

- Node.js 14.x o superior
- Cuenta en SerpApi para datos de cine
- Cuenta en Google AI Studio para Gemini

## Instalación

1. Clonar el repositorio
2. Navegar a la carpeta `backend`
3. Instalar dependencias:

```bash
npm install
```

4. Crear archivo `.env` con las siguientes variables:

```
SERPAPI_KEY=tu_clave_serpapi
GEMINI_API_KEY=tu_clave_gemini
```

## Ejecución

Para iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

Para ejecutar los scrapers manualmente:

```bash
npm run scrape
```

El servidor se ejecutará en `http://localhost:3000`

## Endpoints de la API

### Cartelera de Eventos

- `GET /cartelera` - Obtiene todos los eventos
- `GET /cartelera?tipo=cine` - Filtra eventos por tipo
- `GET /cartelera/:tipo` - Obtiene eventos por tipo (cine, teatro, música)

### Restaurantes

- `GET /reviews` - Obtiene todos los restaurantes
- `GET /reviews?nombre=bar` - Filtra restaurantes por nombre
- `GET /reviews/:id` - Obtiene un restaurante específico

### Recomendaciones

- `POST /recomendar` - Genera una recomendación personalizada
  - Body: `{ "mensaje": "Texto del usuario" }`
  - Response: Combinación de evento + restaurante

## Despliegue en Render

1. Conectar el repositorio a Render
2. Configurar como "Web Service"
3. Usar `npm install` como comando de instalación
4. Usar `npm start` como comando de inicio
5. Configurar variables de entorno en el panel de Render
6. Activar CRON job en el apartado de "Scheduled Tasks" 