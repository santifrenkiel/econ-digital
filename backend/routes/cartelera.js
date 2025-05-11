const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

/**
 * @route   GET /cartelera
 * @desc    Obtiene toda la cartelera de eventos
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const carteleraPath = path.join(__dirname, '../data/cartelera.json');
    
    // Verificar si el archivo existe
    try {
      await fs.access(carteleraPath);
    } catch (error) {
      console.error('Error: archivo cartelera.json no encontrado');
      return res.status(404).json({ 
        mensaje: 'No se encontró la cartelera de eventos', 
        error: 'Archivo no encontrado' 
      });
    }
    
    // Leer el archivo
    const carteleraRaw = await fs.readFile(carteleraPath, 'utf8');
    const cartelera = JSON.parse(carteleraRaw);
    
    // Opcionalmente filtrar por tipo si se proporciona un parámetro en la query
    const { tipo } = req.query;
    if (tipo) {
      const eventosFiltrados = cartelera.filter(
        evento => evento.tipo.toLowerCase() === tipo.toLowerCase()
      );
      return res.json(eventosFiltrados);
    }
    
    res.json(cartelera);
  } catch (error) {
    console.error('Error al obtener la cartelera:', error.message);
    res.status(500).json({ 
      mensaje: 'Error al obtener la cartelera de eventos', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /cartelera/:tipo
 * @desc    Obtiene eventos filtrados por tipo (cine, teatro, música)
 * @access  Public
 */
router.get('/:tipo', async (req, res) => {
  try {
    const { tipo } = req.params;
    
    if (!['cine', 'teatro', 'música'].includes(tipo.toLowerCase())) {
      return res.status(400).json({ 
        mensaje: 'Tipo de evento no válido', 
        tipos_validos: ['cine', 'teatro', 'música'] 
      });
    }
    
    const carteleraPath = path.join(__dirname, '../data/cartelera.json');
    const carteleraRaw = await fs.readFile(carteleraPath, 'utf8');
    const cartelera = JSON.parse(carteleraRaw);
    
    const eventosFiltrados = cartelera.filter(
      evento => evento.tipo.toLowerCase() === tipo.toLowerCase()
    );
    
    res.json(eventosFiltrados);
  } catch (error) {
    console.error(`Error al obtener eventos de ${req.params.tipo}:`, error.message);
    res.status(500).json({ 
      mensaje: `Error al obtener eventos de ${req.params.tipo}`, 
      error: error.message 
    });
  }
});

module.exports = router; 