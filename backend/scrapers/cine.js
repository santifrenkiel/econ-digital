/* 
// Versión estática: funciones precargadas desde archivo
const funcionesPrecargadas = require('../data/cine.json');

async function obtenerPeliculas() {
  console.log('🟡 Usando funciones de cine precargadas (modo estático)');
  return funcionesPrecargadas;
}

module.exports = obtenerPeliculas;
*/

// Versión dinámica activada
require('dotenv').config();
const axios = require('axios');
const obtenerTitulosPeliculas = require('./titulos-cine');

async function buscarFuncionesPorTitulo(titulo, apiKey, ubicacionReferencia = '') {
  try {
    console.log(`🔍 Buscando información para: "${titulo}"`);
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        api_key: apiKey,
        q: `película ${titulo} horarios cines Buenos Aires`,
        hl: 'es',
        gl: 'ar'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    
    // Guardar todas las respuestas de SerpAPI para análisis
    try {
      const fs = require('fs').promises;
      const fsSync = require('fs');
      const path = require('path');
      
      // Asegurarse de que la carpeta data existe
      const dataDir = path.join(__dirname, '../data');
      if (!fsSync.existsSync(dataDir)) {
        await fs.mkdir(dataDir, { recursive: true });
        console.log(`📁 Carpeta data creada en ${dataDir}`);
      }
      
      // Crear un nombre de archivo único para cada película
      const nombreArchivo = titulo.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const responseFilePath = path.join(dataDir, `serpapi_response_${nombreArchivo}.json`);
      await fs.writeFile(responseFilePath, JSON.stringify(response.data, null, 2), 'utf8');
      console.log(`✅ Respuesta de SerpAPI guardada en ${responseFilePath}`);
    } catch (error) {
      console.error('❌ Error al guardar respuesta de SerpAPI:', error.message);
    }

    // Extraer información básica de la película
    let lugar = 'Multicines Buenos Aires';
    let direccion = 'Varias salas en Buenos Aires';
    let sinopsis = '';
    let horariosCines = [];
    
    // Intentar obtener información más precisa desde knowledge_graph
    if (response.data.knowledge_graph) {
      const kg = response.data.knowledge_graph;
      console.log('📊 Se encontró información en knowledge_graph');
      
      if (kg.description) {
        sinopsis = kg.description;
        console.log('✅ Se encontró sinopsis de la película');
      }
      
      if (kg.title) {
        console.log(`✅ Título confirmado: ${kg.title}`);
      }
    }
    
    // Buscar información de cines y horarios en resultados locales
    if (response.data.local_results && response.data.local_results.length > 0) {
      const cine = response.data.local_results[0];
      console.log(`✅ Se encontró información local para: ${cine.title || 'cine'}`);
      
      lugar = cine.title || lugar;
      
      if (cine.address) {
        direccion = cine.address;
        console.log(`✅ Dirección encontrada: ${direccion}`);
      }
    }
    
    // Intentar extraer horarios de showtimes si están disponibles
    if (response.data.showtimes && Array.isArray(response.data.showtimes)) {
      console.log('✅ Se encontraron horarios reales de cines en showtimes');
      
      const funciones = [];
      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const fechaActual = new Date();
      
      // Procesar cada día de showtimes
      response.data.showtimes.forEach(dayData => {
        if (!dayData.day || !dayData.theaters || !Array.isArray(dayData.theaters)) return;
        
        // Extraer fecha del formato "dom11 may" -> "11/05/2025"
        let fechaShow;
        try {
          const match = dayData.day.match(/(\d+)\s+([a-z]{3})/i);
          if (match) {
            const dia = parseInt(match[1], 10);
            const mesStr = match[2].toLowerCase();
            const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
            const mes = meses.indexOf(mesStr);
            
            if (mes !== -1) {
              fechaShow = new Date(fechaActual.getFullYear(), mes, dia);
              
              // Si la fecha es anterior a hoy, asumir que es del próximo año
              if (fechaShow < fechaActual && fechaShow.getMonth() < fechaActual.getMonth()) {
                fechaShow.setFullYear(fechaShow.getFullYear() + 1);
              }
            }
          }
          
          if (!fechaShow) {
            // Si no pudimos extraer la fecha, usar la fecha actual + índice
            fechaShow = new Date(fechaActual);
            const indexDay = dayData.day.includes('hoy') ? 0 : dayData.day.includes('mañana') ? 1 : 0;
            fechaShow.setDate(fechaShow.getDate() + indexDay);
          }
        } catch (e) {
          console.error('❌ Error procesando fecha:', e.message);
          return;
        }
        
        // Obtener el nombre del día de la semana
        const nombreDia = diasSemana[fechaShow.getDay()];
        const fechaStr = fechaShow.toISOString().split('T')[0];
        
        // Procesar cada cine para este día
        dayData.theaters.forEach(theater => {
          // Guardar información del cine y sus horarios
          if (theater.name && theater.showing && Array.isArray(theater.showing)) {
            console.log(`🎬 Cine encontrado: ${theater.name}`);
            
            // Guardar dirección si existe
            if (theater.address) {
              console.log(`📍 Dirección: ${theater.address}`);
            }
            
            // Extraer horarios
            theater.showing.forEach(show => {
              if (show.time && Array.isArray(show.time)) {
                const horarios = show.time.map(time => {
                  // Convertir formato como "3:50p. m." a "15:50"
                  let hora24 = time;
                  try {
                    // Detectar si tiene formato AM/PM
                    if (time.toLowerCase().includes('p. m.') || time.toLowerCase().includes('pm')) {
                      const [horaStr, minStr] = time.replace(/p\.\s*m\.|pm/i, '').trim().split(':');
                      let hora = parseInt(horaStr, 10);
                      const min = parseInt(minStr || '0', 10);
                      
                      if (hora < 12) hora += 12;
                      
                      hora24 = `${hora}:${min.toString().padStart(2, '0')}`;
                    } else if (time.toLowerCase().includes('a. m.') || time.toLowerCase().includes('am')) {
                      const [horaStr, minStr] = time.replace(/a\.\s*m\.|am/i, '').trim().split(':');
                      let hora = parseInt(horaStr, 10);
                      const min = parseInt(minStr || '0', 10);
                      
                      if (hora === 12) hora = 0;
                      
                      hora24 = `${hora.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
                    }
                  } catch (e) {
                    console.warn(`⚠️ No se pudo convertir el horario: ${time}`, e.message);
                    hora24 = time;
                  }
                  
                  return {
                    fecha: fechaStr,
                    hora: hora24,
                    nombreDia,
                    cine: theater.name,
                    direccion: theater.address
                  };
                });
                
                // Añadir horarios a la lista principal
                funciones.push(...horarios);
              }
            });
          }
        });
      });
      
      // Si encontramos funciones, organizarlas por cine
      if (funciones.length > 0) {
        // Filtrar funciones de días pasados
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Establecer a las 00:00:00 para comparar solo la fecha
        
        const funcionesActuales = funciones.filter(funcion => {
          const fechaFuncion = new Date(funcion.fecha);
          return fechaFuncion >= hoy;
        });
        
        if (funcionesActuales.length < funciones.length) {
          console.log(`🧹 Se eliminaron ${funciones.length - funcionesActuales.length} funciones de días pasados`);
        }
        
        // Usar solo las funciones actuales a partir de ahora
        funciones = funcionesActuales;
        
        // Agrupar funciones por cine
        const funcionesPorCine = {};
        
        funciones.forEach(funcion => {
          const cineKey = funcion.cine || 'Otros cines';
          if (!funcionesPorCine[cineKey]) {
            funcionesPorCine[cineKey] = {
              nombre: funcion.cine,
              direccion: funcion.direccion,
              funciones: []
            };
          }
          
          // Añadir solo la información de fecha/hora a las funciones de este cine
          funcionesPorCine[cineKey].funciones.push({
            fecha: funcion.fecha,
            hora: funcion.hora,
            nombreDia: funcion.nombreDia
          });
        });
        
        // Convertir a array para guardar
        horariosCines = Object.values(funcionesPorCine);
        
        console.log(`✅ Se encontraron ${funciones.length} funciones reales en ${horariosCines.length} cines`);
        
        // Si tenemos una ubicación de referencia, priorizar los cines cercanos
        if (ubicacionReferencia && horariosCines.length > 0) {
          console.log(`🔍 Buscando cines cercanos a: ${ubicacionReferencia}`);
          
          // Marcador para indicar que se ha priorizado un cine cercano
          let cineRecomendado = null;
          let cineCercanoEncontrado = false;
          
          // Seleccionar lugar y ubicación del cine recomendado
          if (horariosCines.length === 1) {
            // Si solo hay un cine, usarlo como recomendado
            cineRecomendado = horariosCines[0];
            lugar = cineRecomendado.nombre || lugar;
            direccion = cineRecomendado.direccion || direccion;
          } else {
            // Intentar encontrar un cine cercano a la ubicación de referencia
            for (const cine of horariosCines) {
              if (cine.direccion && cine.nombre && 
                  (cine.direccion.toLowerCase().includes(ubicacionReferencia.toLowerCase()) || 
                   cine.nombre.toLowerCase().includes(ubicacionReferencia.toLowerCase()))) {
                // Este cine tiene una dirección que coincide con la ubicación de referencia
                cineRecomendado = cine;
                lugar = cineRecomendado.nombre;
                direccion = cineRecomendado.direccion;
                cineCercanoEncontrado = true;
                console.log(`✅ Cine cercano encontrado: ${lugar}`);
                break;
              }
            }
            
            // Si no encontramos coincidencia exacta, usar Gemini para identificar el cine más cercano
            if (!cineCercanoEncontrado) {
              // Mensaje para el log (el cine lo seleccionará Gemini en el frontend)
              console.log(`ℹ️ No se encontró coincidencia exacta. Gemini seleccionará el cine más cercano a: ${ubicacionReferencia}`);
            }
          }
        }
        
        return {
          tipo: 'cine',
          nombre: titulo,
          lugar,
          ubicacion: direccion,
          descripcion: sinopsis || 'Disfruta de esta película en la pantalla grande.',
          cines: horariosCines, // Devolvemos todos los cines con sus horarios
          ubicacionReferencia: ubicacionReferencia || null, // Incluimos la ubicación de referencia para que Gemini pueda usarla
        };
      } else {
        console.log('⚠️ No se encontraron horarios específicos en showtimes para la película');
        return null; // Retornamos null para indicar que esta película no tiene funciones
      }
    } else {
      console.log('⚠️ No se encontró el nodo showtimes en la respuesta de SerpAPI');
      return null; // Retornamos null si no hay información de showtimes
    }
  } catch (err) {
    console.error(`❌ Error buscando "${titulo}":`, err.message);
    return null;
  }
}

async function obtenerPeliculas(ubicacionReferencia = '') {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.error('❌ Error: Falta SERPAPI_KEY en el archivo .env');
    return [];
  }

  try {
    // Usar directamente las tres películas específicas en lugar de obtenerlas del scraper
    const peliculasABuscar = [
      'Thunderbolts*',
      'La carga más preciada',
      'Until Dawn'
    ];
    
    console.log(`🎬 Buscando horarios para ${peliculasABuscar.length} películas fijas: ${peliculasABuscar.join(', ')}`);

    const funciones = [];
    for (const titulo of peliculasABuscar) {
      const funcion = await buscarFuncionesPorTitulo(titulo, apiKey, ubicacionReferencia);
      
      // Solo incluir películas que tengan funciones en cines
      if (funcion && funcion.cines && funcion.cines.length > 0) {
        console.log(`✅ Se encontraron ${funcion.cines.length} cines con funciones para "${funcion.nombre}"`);
        
        // Verificar y limpiar funciones pasadas de cada cine
        const fechaHoy = new Date();
        fechaHoy.setHours(0, 0, 0, 0);
        
        // Para cada cine, eliminar las funciones de días pasados
        funcion.cines = funcion.cines.map(cine => {
          const funcionesActuales = cine.funciones.filter(f => {
            const fechaFuncion = new Date(f.fecha);
            return fechaFuncion >= fechaHoy;
          });
          
          // Si se eliminaron funciones, mostrar mensaje
          if (funcionesActuales.length < cine.funciones.length) {
            console.log(`🧹 Se eliminaron ${cine.funciones.length - funcionesActuales.length} funciones pasadas de "${cine.nombre}" para "${funcion.nombre}"`);
          }
          
          // Actualizar las funciones del cine
          return {
            ...cine,
            funciones: funcionesActuales
          };
        });
        
        // Eliminar cines que no tengan funciones después de la limpieza
        funcion.cines = funcion.cines.filter(cine => cine.funciones.length > 0);
        
        // Solo incluir la película si todavía tiene cines con funciones
        if (funcion.cines.length > 0) {
          funciones.push(funcion);
        } else {
          console.log(`⚠️ Se descartó "${titulo}" porque todas sus funciones eran de días pasados`);
        }
      } else {
        console.log(`⚠️ Se descartó "${titulo}" porque no tiene funciones en cines`);
      }
    }

    console.log(`✅ Se encontraron ${funciones.length} películas con funciones en cines`);
    return funciones;
  } catch (error) {
    console.error('❌ Error general al obtener películas:', error.message);
    return [];
  }
}

module.exports = obtenerPeliculas;