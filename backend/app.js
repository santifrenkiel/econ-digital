require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const fs = require('fs').promises;
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
      { ruta: '/recomendar', método: 'POST', descripción: 'Genera una recomendación basada en el mensaje del usuario', body: { mensaje: 'Texto del usuario' } },
      { ruta: '/admin/actualizar-cartelera', método: 'POST', descripción: 'Fuerza una actualización manual de la cartelera' },
      { ruta: '/admin/estado-actualizacion', método: 'GET', descripción: 'Muestra la información de la última actualización' }
    ]
  });
});

// Configurar tarea CRON para ejecutar los scrapers diariamente a las 10AM UTC
// Railway mantiene la aplicación activa constantemente, por lo que este cron funcionará de manera confiable
cron.schedule('0 10 * * *', async () => {
  console.log('🔄 Ejecutando actualización diaria de cartelera - ' + new Date().toISOString());
  try {
    // Ejecutar todos los scrapers
    const cartelera = await ejecutarScrapers();
    console.log(`✅ Actualización completada con éxito - ${cartelera.length} eventos obtenidos`);
    
    // Guardar un registro detallado de la actualización
    const eventosXTipo = cartelera.reduce((acc, evento) => {
      acc[evento.tipo] = (acc[evento.tipo] || 0) + 1;
      return acc;
    }, {});
    
    // Guardar timestamp de última actualización
    const timestampFile = path.join(__dirname, 'data', 'ultima_actualizacion.json');
    const updateData = {
      timestamp: new Date().toISOString(),
      total_eventos: cartelera.length,
      detalles: eventosXTipo
    };
    
    // Usar writeFileSync para garantizar que se escriba adecuadamente
    require('fs').writeFileSync(
      timestampFile, 
      JSON.stringify(updateData, null, 2), 
      'utf8'
    );
    
    console.log('📊 Resumen de eventos actualizados:', eventosXTipo);
  } catch (error) {
    console.error('❌ Error en actualización programada:', error.message);
  }
});

// Ruta para forzar una actualización manual (útil para testing)
app.post('/admin/actualizar-cartelera', async (req, res) => {
  console.log('🔄 Iniciando actualización manual de cartelera - ' + new Date().toISOString());
  try {
    // Ejecutar todos los scrapers
    const cartelera = await ejecutarScrapers();
    console.log(`✅ Actualización manual completada con éxito - ${cartelera.length} eventos obtenidos`);
    
    // Guardar un registro detallado de la actualización
    const eventosXTipo = cartelera.reduce((acc, evento) => {
      acc[evento.tipo] = (acc[evento.tipo] || 0) + 1;
      return acc;
    }, {});
    
    // Guardar timestamp de última actualización
    const timestampFile = path.join(__dirname, 'data', 'ultima_actualizacion.json');
    const updateData = {
      timestamp: new Date().toISOString(),
      total_eventos: cartelera.length,
      detalles: eventosXTipo
    };
    
    // Usar writeFileSync para garantizar que se escriba antes de enviar la respuesta
    require('fs').writeFileSync(
      timestampFile, 
      JSON.stringify(updateData, null, 2), 
      'utf8'
    );
    
    console.log('📊 Resumen de eventos actualizados:', eventosXTipo);
    res.json({
      success: true,
      message: `Cartelera actualizada con éxito. ${cartelera.length} eventos obtenidos.`,
      update_info: updateData
    });
  } catch (error) {
    console.error('❌ Error en actualización manual:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la cartelera',
      error: error.message
    });
  }
});

// Ruta para verificar cuándo fue la última actualización
app.get('/admin/estado-actualizacion', async (req, res) => {
  try {
    const timestampFile = path.join(__dirname, 'data', 'ultima_actualizacion.json');
    const data = await fs.readFile(timestampFile, 'utf8')
      .then(content => JSON.parse(content))
      .catch(() => ({ timestamp: 'Nunca', mensaje: 'No hay registro de actualizaciones' }));
    
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener información de actualización',
      mensaje: error.message
    });
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