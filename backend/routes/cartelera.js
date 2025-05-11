const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

/**
 * Función auxiliar para filtrar funciones pasadas
 * @param {Array} cartelera - Lista de eventos de la cartelera
 * @returns {Array} - Lista de eventos con funciones actualizadas
 */
function filtrarFuncionesPasadas(cartelera) {
  const fechaHoy = new Date();
  fechaHoy.setHours(0, 0, 0, 0);
  
  let contadorFuncionesFiltradas = 0;
  let contadorCinesFiltrados = 0;
  let contadorEventosFiltrados = 0;
  
  // Filtrar sólo para eventos de tipo cine
  const carteleraFiltrada = cartelera.map(evento => {
    // Si no es cine o no tiene cines, devolvemos el evento sin cambios
    if (evento.tipo !== 'cine' || !evento.cines || !Array.isArray(evento.cines)) {
      return evento;
    }
    
    // Para eventos de cine, filtrar funciones pasadas
    const cinesFiltrados = evento.cines.map(cine => {
      if (!cine.funciones || !Array.isArray(cine.funciones)) {
        return cine;
      }
      
      const funcionesOriginales = cine.funciones.length;
      
      // Filtrar sólo funciones con fecha actual o futura
      const funcionesActuales = cine.funciones.filter(funcion => {
        if (!funcion.fecha) return true; // Si no tiene fecha, la mantenemos
        
        const fechaFuncion = new Date(funcion.fecha);
        return fechaFuncion >= fechaHoy;
      });
      
      // Registrar cuántas funciones se filtraron
      const funcionesFiltradas = funcionesOriginales - funcionesActuales.length;
      contadorFuncionesFiltradas += funcionesFiltradas;
      
      // Devolver cine con funciones actualizadas
      return {
        ...cine,
        funciones: funcionesActuales
      };
    });
    
    // Filtrar cines que ya no tienen funciones
    const cinesConFunciones = cinesFiltrados.filter(cine => 
      cine.funciones && cine.funciones.length > 0
    );
    
    contadorCinesFiltrados += (cinesFiltrados.length - cinesConFunciones.length);
    
    // Si después de filtrar no quedan cines con funciones, este evento se eliminará
    const eventoFiltrado = {
      ...evento,
      cines: cinesConFunciones
    };
    
    return eventoFiltrado;
  }).filter(evento => {
    // Mantener eventos que no son cine o que siendo cine aún tienen cines con funciones
    const mantener = evento.tipo !== 'cine' || (evento.cines && evento.cines.length > 0);
    
    if (!mantener) {
      contadorEventosFiltrados++;
    }
    
    return mantener;
  });
  
  // Mostrar estadísticas de lo que se ha filtrado
  if (contadorFuncionesFiltradas > 0 || contadorCinesFiltrados > 0 || contadorEventosFiltrados > 0) {
    console.log(`🧹 Filtrado de funciones pasadas:
- Funciones eliminadas: ${contadorFuncionesFiltradas}
- Cines eliminados: ${contadorCinesFiltrados}
- Eventos eliminados: ${contadorEventosFiltrados}`);
    
    // Si hubo cambios, devolver un objeto con los datos y un flag indicando cambios
    return {
      cartelera: carteleraFiltrada,
      cambios: true,
      estadisticas: {
        funcionesEliminadas: contadorFuncionesFiltradas,
        cinesEliminados: contadorCinesFiltrados,
        eventosEliminados: contadorEventosFiltrados
      }
    };
  }
  
  // Si no hubo cambios, devolver solo la cartelera
  return {
    cartelera: carteleraFiltrada,
    cambios: false
  };
}

/**
 * Función para actualizar el archivo cartelera.json
 * @param {Array} cartelera - Cartelera actualizada
 * @returns {Promise<void>}
 */
async function actualizarArchivoCartelera(cartelera) {
  try {
    const carteleraPath = path.join(__dirname, '../data/cartelera.json');
    await fs.writeFile(carteleraPath, JSON.stringify(cartelera, null, 2), 'utf8');
    console.log('✅ Archivo cartelera.json actualizado con filtrado de funciones pasadas');
    return true;
  } catch (error) {
    console.error('❌ Error al actualizar archivo cartelera.json:', error.message);
    return false;
  }
}

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
    let cartelera = JSON.parse(carteleraRaw);
    
    // Filtrar funciones pasadas antes de enviar
    const resultado = filtrarFuncionesPasadas(cartelera);
    cartelera = resultado.cartelera;
    
    // Si hubo cambios, actualizar el archivo
    if (resultado.cambios) {
      // Actualizar archivo en segundo plano sin esperar
      actualizarArchivoCartelera(cartelera).then(exito => {
        if (exito) {
          console.log('🔄 Base de datos actualizada eliminando funciones pasadas');
        }
      });
    }
    
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
    let cartelera = JSON.parse(carteleraRaw);
    
    // Filtrar funciones pasadas antes de filtrar por tipo
    const resultado = filtrarFuncionesPasadas(cartelera);
    cartelera = resultado.cartelera;
    
    // Si hubo cambios, actualizar el archivo
    if (resultado.cambios) {
      // Actualizar archivo en segundo plano sin esperar
      actualizarArchivoCartelera(cartelera).then(exito => {
        if (exito) {
          console.log('🔄 Base de datos actualizada eliminando funciones pasadas');
        }
      });
    }
    
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