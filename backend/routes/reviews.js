const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

/**
 * @route   GET /reviews
 * @desc    Obtiene todas las reviews de restaurantes combinadas
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Directorio donde se almacenan los archivos de reviews
    const reviewsDir = path.join(__dirname, '../data');
    
    // Leer todos los archivos en el directorio
    const archivos = await fs.readdir(reviewsDir);
    
    // Filtrar solo los archivos que comienzan con "all-task-" y terminan en ".json"
    const archivosReviews = archivos.filter(archivo => 
      archivo.startsWith('all-task-') && archivo.endsWith('.json')
    );
    
    if (archivosReviews.length === 0) {
      return res.status(404).json({
        mensaje: 'No se encontraron archivos de reviews'
      });
    }
    
    // Leer y combinar todos los archivos de reviews
    const todasLasReviews = [];
    
    for (const archivo of archivosReviews) {
      const rutaArchivo = path.join(reviewsDir, archivo);
      const contenidoRaw = await fs.readFile(rutaArchivo, 'utf8');
      const reviews = JSON.parse(contenidoRaw);
      
      // Añadir las reviews al array combinado
      todasLasReviews.push(...reviews);
    }
    
    // Opcionalmente filtrar por nombre del restaurante si se proporciona
    const { nombre } = req.query;
    if (nombre) {
      const reviewsFiltradas = todasLasReviews.filter(
        review => review.name.toLowerCase().includes(nombre.toLowerCase())
      );
      return res.json(reviewsFiltradas);
    }
    
    res.json(todasLasReviews);
  } catch (error) {
    console.error('Error al obtener las reviews:', error.message);
    res.status(500).json({
      mensaje: 'Error al obtener las reviews de restaurantes',
      error: error.message
    });
  }
});

/**
 * @route   GET /reviews/:id
 * @desc    Obtiene un restaurante por ID (posición en el array combinado)
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNum = parseInt(id);
    
    if (isNaN(idNum)) {
      return res.status(400).json({
        mensaje: 'ID no válido. Debe ser un número'
      });
    }
    
    // Directorio donde se almacenan los archivos de reviews
    const reviewsDir = path.join(__dirname, '../data');
    
    // Leer todos los archivos en el directorio
    const archivos = await fs.readdir(reviewsDir);
    
    // Filtrar solo los archivos que comienzan con "all-task-" y terminan en ".json"
    const archivosReviews = archivos.filter(archivo => 
      archivo.startsWith('all-task-') && archivo.endsWith('.json')
    );
    
    if (archivosReviews.length === 0) {
      return res.status(404).json({
        mensaje: 'No se encontraron archivos de reviews'
      });
    }
    
    // Leer y combinar todos los archivos de reviews
    const todasLasReviews = [];
    
    for (const archivo of archivosReviews) {
      const rutaArchivo = path.join(reviewsDir, archivo);
      const contenidoRaw = await fs.readFile(rutaArchivo, 'utf8');
      const reviews = JSON.parse(contenidoRaw);
      
      // Añadir las reviews al array combinado
      todasLasReviews.push(...reviews);
    }
    
    // Verificar si el ID está dentro del rango del array
    if (idNum < 0 || idNum >= todasLasReviews.length) {
      return res.status(404).json({
        mensaje: `No se encontró un restaurante con el ID ${id}`
      });
    }
    
    res.json(todasLasReviews[idNum]);
  } catch (error) {
    console.error(`Error al obtener el restaurante con ID ${req.params.id}:`, error.message);
    res.status(500).json({
      mensaje: `Error al obtener el restaurante con ID ${req.params.id}`,
      error: error.message
    });
  }
});

module.exports = router; 