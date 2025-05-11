const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

/**
 * Función auxiliar para filtrar funciones pasadas
 * @param {Array} cartelera - Lista de eventos de la cartelera
 * @param {Boolean} mostrarOcultas - Indica si se deben incluir las funciones pasadas
 * @returns {Array} - Lista de eventos con funciones actualizadas
 */
function filtrarFuncionesPasadas(cartelera, mostrarOcultas = false) {
  const fechaHoy = new Date();
  fechaHoy.setHours(0, 0, 0, 0);
  
  console.log(`🕒 [Filtrado] Fecha actual: ${fechaHoy.toISOString()}, mostrarOcultas=${mostrarOcultas}`);
  
  let contadorFuncionesFiltradas = 0;
  let contadorCinesFiltrados = 0;
  let contadorEventosFiltrados = 0;
  
  // Filtrar sólo para eventos de tipo cine
  const carteleraFiltrada = cartelera.map(evento => {
    // Si no es cine o no tiene cines, devolvemos el evento sin cambios
    if (evento.tipo !== 'cine' || !evento.cines || !Array.isArray(evento.cines)) {
      return evento;
    }
    
    console.log(`🎬 [Filtrado] Procesando evento cine: "${evento.nombre}" con ${evento.cines.length} cines`);
    
    // Para eventos de cine, procesar funciones pasadas
    const cinesProcesados = evento.cines.map(cine => {
      if (!cine.funciones || !Array.isArray(cine.funciones)) {
        return cine;
      }
      
      const funcionesOriginales = cine.funciones.length;
      let funcionesActuales = [];
      
      // Marcar funciones pasadas como ocultas o filtrarlas según el parámetro
      if (mostrarOcultas) {
        // Si se piden todas, incluir todas pero marcar las pasadas
        funcionesActuales = cine.funciones.map(funcion => {
          if (!funcion.fecha) return funcion; // Si no tiene fecha, la dejamos igual
          
          const fechaFuncion = new Date(funcion.fecha);
          const esPasada = fechaFuncion < fechaHoy;
          
          if (esPasada && !funcion.oculta) {
            contadorFuncionesFiltradas++;
            console.log(`🏷️ [Filtrado] Marcar función pasada: ${funcion.fecha} ${funcion.hora || ''} (${funcion.nombreDia || 'sin nombre día'})`);
            return { ...funcion, oculta: true };
          }
          
          return funcion;
        });
      } else {
        // Si no se piden todas, filtrar las que están ocultas o son de fechas pasadas
        funcionesActuales = cine.funciones.filter(funcion => {
          if (funcion.oculta) {
            console.log(`⛔ [Filtrado] Excluir función oculta: ${funcion.fecha} ${funcion.hora || ''} (${funcion.nombreDia || 'sin nombre día'})`);
            return false; // No mostrar las ya marcadas como ocultas
          }
          
          if (!funcion.fecha) return true; // Si no tiene fecha, la mantenemos
          
          const fechaFuncion = new Date(funcion.fecha);
          
          // Verificar si la fecha es válida
          if (isNaN(fechaFuncion.getTime())) {
            console.log(`⚠️ [Filtrado] Fecha inválida: ${funcion.fecha}`);
            return true; // Mantener funciones con fecha inválida
          }
          
          const mantener = fechaFuncion >= fechaHoy;
          
          if (!mantener) {
            contadorFuncionesFiltradas++;
            console.log(`❌ [Filtrado] Filtrar función pasada: ${funcion.fecha} ${funcion.hora || ''} (${funcion.nombreDia || 'sin nombre día'}) - ${fechaFuncion.toISOString()} < ${fechaHoy.toISOString()}`);
          } else {
            console.log(`✅ [Filtrado] Mantener función futura: ${funcion.fecha} ${funcion.hora || ''} (${funcion.nombreDia || 'sin nombre día'}) - ${fechaFuncion.toISOString()} >= ${fechaHoy.toISOString()}`);
          }
          
          return mantener;
        });
      }
      
      console.log(`📊 [Filtrado] Cine "${cine.nombre}": ${funcionesOriginales} originales -> ${funcionesActuales.length} actuales`);
      
      // Devolver cine con funciones actualizadas
      return {
        ...cine,
        funciones: funcionesActuales
      };
    });
    
    // Si se piden mostrar todas, devolver todos los cines
    if (mostrarOcultas) {
      return { ...evento, cines: cinesProcesados };
    }
    
    // De lo contrario, filtrar cines sin funciones
    const cinesConFunciones = cinesProcesados.filter(cine => 
      cine.funciones && cine.funciones.length > 0
    );
    
    contadorCinesFiltrados += (cinesProcesados.length - cinesConFunciones.length);
    
    // Si después de filtrar no quedan cines con funciones, este evento se eliminará
    const eventoFiltrado = {
      ...evento,
      cines: cinesConFunciones
    };
    
    return eventoFiltrado;
  });
  
  let resultadoFiltrado = carteleraFiltrada;
  
  // Si no estamos mostrando ocultas, filtrar eventos sin cines/funciones
  if (!mostrarOcultas) {
    resultadoFiltrado = carteleraFiltrada.filter(evento => {
      // Mantener eventos que no son cine o que siendo cine aún tienen cines con funciones
      const mantener = evento.tipo !== 'cine' || (evento.cines && evento.cines.length > 0);
      
      if (!mantener) {
        contadorEventosFiltrados++;
      }
      
      return mantener;
    });
  }
  
  // Mostrar estadísticas si hay cambios
  if (contadorFuncionesFiltradas > 0 || contadorCinesFiltrados > 0 || contadorEventosFiltrados > 0) {
    console.log(`🧹 [Filtrado] Resumen de procesamiento:
- Funciones ${mostrarOcultas ? 'marcadas' : 'filtradas'}: ${contadorFuncionesFiltradas}
- Cines ${mostrarOcultas ? 'actualizados' : 'filtrados'}: ${contadorCinesFiltrados}
- Eventos ${mostrarOcultas ? 'actualizados' : 'filtrados'}: ${contadorEventosFiltrados}`);
  } else {
    console.log(`ℹ️ [Filtrado] No se encontraron funciones pasadas para procesar.`);
  }
  
  // Devolver el resultado con cambios aplicados
  return {
    cartelera: resultadoFiltrado,
    cambios: contadorFuncionesFiltradas > 0,
    estadisticas: {
      funcionesProcesadas: contadorFuncionesFiltradas,
      cinesProcesados: contadorCinesFiltrados,
      eventosProcesados: contadorEventosFiltrados
    }
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
    console.log(`📥 [API:cartelera] Request recibido: Query params =`, req.query);
    
    const carteleraPath = path.join(__dirname, '../data/cartelera.json');
    
    // Verificar si el archivo existe
    try {
      await fs.access(carteleraPath);
    } catch (error) {
      console.error('❌ [API:cartelera] Error: archivo cartelera.json no encontrado');
      return res.status(404).json({ 
        mensaje: 'No se encontró la cartelera de eventos', 
        error: 'Archivo no encontrado' 
      });
    }
    
    // Leer el archivo
    const carteleraRaw = await fs.readFile(carteleraPath, 'utf8');
    let cartelera = JSON.parse(carteleraRaw);
    
    console.log(`📊 [API:cartelera] Cartelera cargada con ${cartelera.length} eventos`);
    
    // Determinar si se mostrarán funciones ocultas
    const mostrarOcultas = req.query.incluirPasadas === 'true';
    console.log(`🔍 [API:cartelera] Parámetro incluirPasadas=${req.query.incluirPasadas}, procesado como mostrarOcultas=${mostrarOcultas}`);
    
    // Para actualizar la BD, siempre procesamos con mostrarOcultas=true
    // para marcar las funciones pasadas sin eliminarlas
    const resultadoActualizacion = filtrarFuncionesPasadas(cartelera, true);
    
    // Si hubo cambios, actualizar el archivo
    if (resultadoActualizacion.cambios) {
      // Actualizar archivo en segundo plano sin esperar
      actualizarArchivoCartelera(resultadoActualizacion.cartelera).then(exito => {
        if (exito) {
          console.log('🔄 [API:cartelera] Base de datos actualizada marcando funciones pasadas');
        }
      });
    }
    
    // Para la respuesta, filtramos según el parámetro mostrarOcultas
    // Si mostrarOcultas es false, se filtrarán las funciones pasadas
    console.log(`🔄 [API:cartelera] Aplicando segundo filtrado con mostrarOcultas=${mostrarOcultas}`);
    const resultado = mostrarOcultas ? 
      resultadoActualizacion : 
      filtrarFuncionesPasadas(resultadoActualizacion.cartelera, false);
    
    let carteleraFinal = resultado.cartelera;
    
    // Opcionalmente filtrar por tipo si se proporciona un parámetro en la query
    const { tipo } = req.query;
    if (tipo) {
      console.log(`🏷️ [API:cartelera] Filtrando por tipo: ${tipo}`);
      const eventosFiltrados = carteleraFinal.filter(
        evento => evento.tipo.toLowerCase() === tipo.toLowerCase()
      );
      return res.json(eventosFiltrados);
    }
    
    console.log(`📤 [API:cartelera] Enviando respuesta con ${carteleraFinal.length} eventos`);
    res.json(carteleraFinal);
  } catch (error) {
    console.error('❌ [API:cartelera] Error al obtener la cartelera:', error.message);
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
    console.log(`📥 [API:cartelera/${tipo}] Request recibido: Query params =`, req.query);
    
    if (!['cine', 'teatro', 'música'].includes(tipo.toLowerCase())) {
      console.log(`⚠️ [API:cartelera/${tipo}] Tipo de evento no válido`);
      return res.status(400).json({ 
        mensaje: 'Tipo de evento no válido', 
        tipos_validos: ['cine', 'teatro', 'música'] 
      });
    }
    
    const carteleraPath = path.join(__dirname, '../data/cartelera.json');
    const carteleraRaw = await fs.readFile(carteleraPath, 'utf8');
    let cartelera = JSON.parse(carteleraRaw);
    
    console.log(`📊 [API:cartelera/${tipo}] Cartelera cargada con ${cartelera.length} eventos`);
    
    // Determinar si se mostrarán funciones ocultas
    const mostrarOcultas = req.query.incluirPasadas === 'true';
    console.log(`🔍 [API:cartelera/${tipo}] Parámetro incluirPasadas=${req.query.incluirPasadas}, procesado como mostrarOcultas=${mostrarOcultas}`);
    
    // Para actualizar la BD, siempre procesamos con mostrarOcultas=true
    // para marcar las funciones pasadas sin eliminarlas
    const resultadoActualizacion = filtrarFuncionesPasadas(cartelera, true);
    
    // Si hubo cambios, actualizar el archivo
    if (resultadoActualizacion.cambios) {
      // Actualizar archivo en segundo plano sin esperar
      actualizarArchivoCartelera(resultadoActualizacion.cartelera).then(exito => {
        if (exito) {
          console.log(`🔄 [API:cartelera/${tipo}] Base de datos actualizada marcando funciones pasadas`);
        }
      });
    }
    
    // Para la respuesta, filtramos según el parámetro mostrarOcultas
    console.log(`🔄 [API:cartelera/${tipo}] Aplicando segundo filtrado con mostrarOcultas=${mostrarOcultas}`);
    const resultado = mostrarOcultas ? 
      resultadoActualizacion : 
      filtrarFuncionesPasadas(resultadoActualizacion.cartelera, false);
    
    let carteleraFinal = resultado.cartelera;
    
    // Filtrar por tipo
    const eventosFiltrados = carteleraFinal.filter(
      evento => evento.tipo.toLowerCase() === tipo.toLowerCase()
    );
    
    console.log(`📤 [API:cartelera/${tipo}] Enviando respuesta con ${eventosFiltrados.length} eventos de tipo ${tipo}`);
    res.json(eventosFiltrados);
  } catch (error) {
    console.error(`❌ [API:cartelera/${tipo}] Error al obtener eventos de ${req.params.tipo}:`, error.message);
    res.status(500).json({ 
      mensaje: `Error al obtener eventos de ${req.params.tipo}`, 
      error: error.message 
    });
  }
});

module.exports = router; 