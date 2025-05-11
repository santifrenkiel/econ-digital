require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const ejecutarScrapers = require('./scrapers');

// Importar rutas
const carteleraRoutes = require('./routes/cartelera');
const reviewsRoutes = require('./routes/reviews');
const recomendarRoutes = require('./routes/recomendar');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Permitir conexiones desde otros dominios
app.use(express.json()); // Parsear solicitudes JSON

// Rutas
app.use('/cartelera', carteleraRoutes);
app.use('/reviews', reviewsRoutes);
app.use('/recomendar', recomendarRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API de recomendaciones de salidas',
    endpoints: [
      { ruta: '/cartelera', método: 'GET', descripción: 'Obtiene todos los eventos' },
      { ruta: '/cartelera/:tipo', método: 'GET', descripción: 'Obtiene eventos filtrados por tipo (cine, teatro, música)' },
      { ruta: '/reviews', método: 'GET', descripción: 'Obtiene todos los restaurantes' },
      { ruta: '/reviews/:id', método: 'GET', descripción: 'Obtiene un restaurante por ID' },
      { ruta: '/recomendar', método: 'POST', descripción: 'Genera una recomendación basada en el mensaje del usuario', body: { mensaje: 'Texto del usuario' } }
    ]
  });
});

// Configurar tarea CRON para ejecutar los scrapers diariamente a las 3am
// Este script debe ejecutarse en el servidor de Render
cron.schedule('0 3 * * *', async () => {
  console.log('Ejecutando scrapers programados...');
  try {
    await ejecutarScrapers();
    console.log('Scrapers completados con éxito.');
  } catch (error) {
    console.error('Error al ejecutar scrapers programados:', error.message);
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
  console.log(`API disponible en http://localhost:${PORT}`);
});

// Ejecutar los scrapers cuando se inicia la aplicación
// Esto asegura que tengamos datos iniciales
ejecutarScrapers()
  .then(() => console.log('Datos iniciales generados correctamente'))
  .catch(err => console.error('Error al generar datos iniciales:', err.message));

module.exports = app;

const obtenerTitulosPeliculas = require('./scrapers/titulos-cine');

obtenerTitulosPeliculas()
  .then(titulos => console.log('🎬 Títulos encontrados:', titulos))
  .catch(err => console.error('❌ Error al obtener títulos:', err.message)); 