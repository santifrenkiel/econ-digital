require('dotenv').config();
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Configurar la autenticación con Gemini
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-2.0-flash';

// Crear el cliente de Gemini con la nueva API
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

/**
 * Busca un evento por nombre o título en la base de datos
 * @param {string} texto - Texto para buscar (nombre o título)
 * @returns {Object|null} - Objeto del evento encontrado o null
 */
const buscarEvento = async (texto) => {
  if (!texto) return null;
  
  try {
    console.log(`Buscando evento con texto: "${texto}"`);
    
    const carteleraPath = path.join(__dirname, '../data/cartelera.json');
    const carteleraRaw = await fs.readFile(carteleraPath, 'utf8');
    const cartelera = JSON.parse(carteleraRaw);
    
    // Convertir a minúsculas para búsqueda sin distinción de mayúsculas/minúsculas
    const textoLowerCase = texto.toLowerCase().trim();
    
    // Primero intentar una coincidencia exacta
    let evento = cartelera.find(e => 
      (e.nombre && e.nombre.toLowerCase() === textoLowerCase) ||
      (e.titulo && e.titulo.toLowerCase() === textoLowerCase) ||
      (e.lugar && e.lugar.toLowerCase() === textoLowerCase)
    );
    
    // Si no hay coincidencia exacta, buscar coincidencia parcial
    if (!evento) {
      evento = cartelera.find(e => 
        (e.nombre && e.nombre.toLowerCase().includes(textoLowerCase)) ||
        (e.titulo && e.titulo.toLowerCase().includes(textoLowerCase)) ||
        (e.lugar && e.lugar.toLowerCase().includes(textoLowerCase))
      );
    }
    
    if (evento) {
      console.log(`Evento encontrado: ${evento.nombre || evento.titulo}`);
      
      // Añadir horarios de funciones si no existen
      if (!evento.funciones) {
        // Crear horarios de ejemplo basados en la fecha del evento
        const fechaBase = evento.fecha ? new Date(evento.fecha) : new Date();
        
        // Generar funciones para los próximos 5 días
        evento.funciones = [];
        
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const horarios = ['14:00', '16:30', '19:00', '21:30'];
        
        for (let i = 0; i < 5; i++) {
          const fecha = new Date(fechaBase);
          fecha.setDate(fecha.getDate() + i);
          
          // Seleccionar horarios aleatorios para cada día
          const horariosDisponibles = [];
          const numHorarios = Math.floor(Math.random() * 3) + 1; // 1-3 horarios por día
          
          for (let j = 0; j < numHorarios; j++) {
            const horarioAleatorio = horarios[Math.floor(Math.random() * horarios.length)];
            if (!horariosDisponibles.includes(horarioAleatorio)) {
              horariosDisponibles.push(horarioAleatorio);
            }
          }
          
          // Ordenar horarios
          horariosDisponibles.sort();
          
          // Agregar cada horario como una función individual
          for (const hora of horariosDisponibles) {
            evento.funciones.push({
              fecha: fecha.toISOString().split('T')[0],
              hora: hora,
              nombreDia: diasSemana[fecha.getDay()]
            });
          }
        }
      }
      
      return evento;
    }
    
    console.log(`No se encontró el evento con texto: "${texto}"`);
    return null;
  } catch (error) {
    console.error('Error al buscar evento:', error);
    return null;
  }
};

/**
 * Busca un restaurante por nombre en la base de datos
 * @param {string} nombre - Nombre o parte del nombre del restaurante
 * @returns {Object|null} - Objeto del restaurante encontrado o null
 */
const buscarRestaurante = async (nombre) => {
  if (!nombre) return null;
  
  try {
    console.log(`Buscando restaurante con nombre: "${nombre}"`);
    
    // Usar el archivo all-task-1.json
    const rutaArchivo = path.join(__dirname, '../data/all-task-1.json');
    
    try {
      const contenidoRaw = await fs.readFile(rutaArchivo, 'utf8');
      const restaurantes = JSON.parse(contenidoRaw);
      
      const nombreLowerCase = nombre.toLowerCase().trim();
      
      // Buscar coincidencia por nombre
      const restaurante = restaurantes.find(r => 
        r.name && r.name.toLowerCase() === nombreLowerCase
      ) || restaurantes.find(r => 
        r.name && r.name.toLowerCase().includes(nombreLowerCase)
      );
      
      if (restaurante) {
        console.log(`Restaurante encontrado: ${restaurante.name}`);
        
        // Procesar reseñas detalladas si existen
        if (restaurante.detailed_reviews && Array.isArray(restaurante.detailed_reviews)) {
          console.log(`El restaurante tiene ${restaurante.detailed_reviews.length} reseñas detalladas`);
          // Asegurar que cada reseña detallada tiene todos los campos necesarios
          restaurante.detailed_reviews = restaurante.detailed_reviews.map(review => ({
            author: review.author || `Usuario ${Math.floor(Math.random() * 1000)}`,
            text: review.review_text || review.text || `[Sin texto de reseña]`,
            rating: review.rating || Math.floor(Math.random() * 2) + 4,  // Rating 4-5
            published_at: review.published_at || "Hace un mes",
            ...review
          }));
        } else {
          restaurante.detailed_reviews = [];
        }
        
        // Procesar reseñas destacadas si existen
        if (restaurante.featured_reviews && Array.isArray(restaurante.featured_reviews)) {
          console.log(`El restaurante tiene ${restaurante.featured_reviews.length} reseñas destacadas`);
          // Asegurar que cada reseña destacada tiene todos los campos necesarios
          restaurante.featured_reviews = restaurante.featured_reviews.map(review => ({
            author: review.name || review.author || "Cliente destacado",
            text: review.review_text || review.text || `[Sin texto de reseña]`,
            rating: review.rating || 5,
            published_at: review.published_at || "Hace 2 semanas",
            ...review
          }));
        } else {
          restaurante.featured_reviews = [];
        }
        
        // Si hay reseñas básicas pero no hay reseñas detalladas, convertirlas a formato detallado
        if (restaurante.reviews && Array.isArray(restaurante.reviews) && restaurante.reviews.length > 0 && restaurante.detailed_reviews.length === 0) {
          console.log(`Convirtiendo ${restaurante.reviews.length} reseñas básicas a formato detallado`);
          restaurante.detailed_reviews = restaurante.reviews.map((texto, i) => ({
            author: `Usuario ${i+1}`,
            text: texto,
            rating: Math.floor(Math.random() * 2) + 4,  // Rating 4-5
            published_at: `Hace ${Math.floor(Math.random() * 6) + 1} meses`
          }));
        }
        
        // No crear reseñas ficticias si no hay reseñas reales
        // Dejar que el frontend maneje este caso mostrando un mensaje apropiado
        
        return restaurante;
      }
      
      console.log(`No se encontró el restaurante con nombre: "${nombre}"`);
      return null;
    } catch (error) {
      console.error(`Error al leer el archivo ${rutaArchivo}:`, error);
      return null;
    }
  } catch (error) {
    console.error('Error al buscar restaurante:', error);
    return null;
  }
};

/**
 * @route   POST /recomendar
 * @desc    Recibe un mensaje del usuario y utiliza la API de Gemini para generar una recomendación
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { mensaje } = req.body;
    
    if (!mensaje) {
      return res.status(400).json({
        mensaje: 'Se requiere un mensaje para generar una recomendación'
      });
    }
    
    // Cargar eventos
    const carteleraPath = path.join(__dirname, '../data/cartelera.json');
    let cartelera;
    
    try {
      const carteleraRaw = await fs.readFile(carteleraPath, 'utf8');
      cartelera = JSON.parse(carteleraRaw);
    } catch (error) {
      console.error('Error al leer la cartelera:', error.message);
      return res.status(500).json({
        mensaje: 'Error al leer la cartelera de eventos',
        error: error.message
      });
    }
    
    // Cargar restaurantes desde all-task-1.json
    let restaurantes = [];
    
    try {
      const rutaArchivo = path.join(__dirname, '../data/all-task-1.json');
      const contenidoRaw = await fs.readFile(rutaArchivo, 'utf8');
      restaurantes = JSON.parse(contenidoRaw);
    } catch (error) {
      console.error(`Error al leer all-task-1.json:`, error.message);
      return res.status(500).json({
        mensaje: 'Error al leer los datos de restaurantes',
        error: error.message
      });
    }
    
    // Reducir el tamaño de los datos para evitar exceder el límite de la API
    const convertirEventosATexto = (eventos) => {
      return eventos.slice(0, 40).map(evento => {
        let infoBasica = `NOMBRE: ${evento.nombre || ''} | TIPO: ${evento.tipo || ''} | LUGAR: ${evento.lugar || ''} | DIRECCIÓN: ${evento.ubicacion || evento.direccion || ''}`;
        
        // Si es de tipo cine y tiene cines disponibles, incluir la información
        if (evento.tipo === 'cine' && evento.cines && Array.isArray(evento.cines) && evento.cines.length > 0) {
          const cinesInfo = evento.cines.map(cine => 
            `    - CINE: ${cine.nombre || 'Sin nombre'} | DIRECCIÓN: ${cine.direccion || 'Sin dirección'}`
          ).join('\n');
          
          infoBasica += `\n  CINES DISPONIBLES:\n${cinesInfo}`;
        }
        
        return infoBasica;
      }).join('\n\n');
    };
    
    const convertirRestaurantesATexto = (restaurantes) => {
      return restaurantes.slice(0, 70).map(rest => {
        // Construir la dirección completa con todos los campos disponibles
        let direccionCompleta = rest.location?.address1 || rest.address || '';
        if (rest.location?.city) direccionCompleta += rest.location.city;
        if (rest.location?.zip_code) direccionCompleta += `, ${rest.location.zip_code}`;
        if (rest.location?.country) direccionCompleta += `, ${rest.location.country}`;
        
        if (!direccionCompleta) direccionCompleta = 'Sin dirección disponible';
        
        return `NOMBRE: ${rest.name || ''} | CATEGORÍAS: ${Array.isArray(rest.categories) ? rest.categories.join(', ') : rest.categories || ''} | RATING: ${rest.rating || ''} | DIRECCIÓN: ${direccionCompleta}`;
      }).join('\n');
    };
    
    // Convertir a formato de texto
    const carteleraTexto = convertirEventosATexto(cartelera);
    const restaurantesTexto = convertirRestaurantesATexto(restaurantes);
    
    // Prompt simplificado que solicita una recomendación descriptiva
    const promptText = `
    Eres un asistente especializado en recomendaciones de salidas combinando eventos culturales con restaurantes en Buenos Aires.
    
    DATOS DE EVENTOS:
    ${carteleraTexto}
    
    DATOS DE RESTAURANTES:
    ${restaurantesTexto}
    
    INSTRUCCIONES:
    1. Analiza este mensaje del usuario: "${mensaje}"
    2. Recomienda una combinación de un evento (cine, teatro o música) con un restaurante que complementen bien la experiencia.
    3. Si recomiendas una película, ANALIZA LAS DIRECCIONES y sugiere el cine ESPECÍFICO que esté más cerca del restaurante recomendado. Compara las direcciones para identificar los barrios o zonas cercanas.
    4. Menciona explícitamente en tu respuesta la cercanía entre el cine y el restaurante, explicando por qué es conveniente (misma zona, barrio cercano, etc.).
    5. Tu respuesta debe ser conversacional y descriptiva, explicando por qué recomiendas esa combinación.
    6. MUY IMPORTANTE: Usa EXACTAMENTE los nombres de los eventos/lugares y restaurantes como aparecen en los datos proporcionados.
    7. No inventes lugares ni incluyas sitios que no estén listados en los datos.
    8. Cuando menciones un evento o restaurante, utiliza su nombre completo y exacto como aparece en los datos.
    9. ES OBLIGATORIO incluir los campos "evento_nombre" y "restaurante_nombre" con los nombres exactos.
    
    Formato de tu respuesta (JSON):
    {
      "respuesta": "Tu recomendación conversacional detallada que DEBE mencionar la cercanía entre el cine y el restaurante.",
      "evento_nombre": "NOMBRE EXACTO del evento que recomiendas",
      "restaurante_nombre": "NOMBRE EXACTO del restaurante que recomiendas"
    }
    
    RECUERDA: Los campos "evento_nombre" y "restaurante_nombre" deben contener los nombres EXACTOS tal como aparecen en los datos.
    `;
    
    try {
      // Llamar a la API de Gemini
      const result = await model.generateContent(promptText);
      const response = await result.response;
      const generatedText = response.text();
      
      if (!generatedText) {
        return res.status(500).json({
          mensaje: 'No se pudo generar una recomendación',
          error: 'Respuesta vacía del modelo'
        });
      }
      
      try {
        // Extraer la parte JSON de la respuesta
        const jsonMatch = generatedText.match(/(\{[\s\S]*\})/);
        const jsonResponse = jsonMatch ? jsonMatch[0] : generatedText;
        
        const recomendacion = JSON.parse(jsonResponse);
        
        // Obtener nombres directamente de la respuesta JSON
        const eventoNombre = recomendacion.evento_nombre;
        const restauranteNombre = recomendacion.restaurante_nombre;
        
        // Crear variable para almacenar nombres extraídos como fallback
        let lugaresExtraidos = { eventoNombre: null, restauranteNombre: null };
        
        // Verificar si los campos necesarios están presentes
        if (!eventoNombre || !restauranteNombre) {
          console.warn('Gemini no proporcionó los campos requeridos:', recomendacion);
          
          // Intentar extraer nombres de eventos/lugares de la cartelera
          if (!eventoNombre) {
            for (const evento of cartelera) {
              if (evento.nombre && recomendacion.respuesta.toLowerCase().includes(evento.nombre.toLowerCase())) {
                lugaresExtraidos.eventoNombre = evento.nombre;
                break;
              }
              if (evento.lugar && recomendacion.respuesta.toLowerCase().includes(evento.lugar.toLowerCase())) {
                lugaresExtraidos.eventoNombre = evento.lugar;
                break;
              }
            }
          }
          
          // Intentar extraer nombres de restaurantes
          if (!restauranteNombre) {
            for (const restaurante of restaurantes) {
              if (restaurante.name && recomendacion.respuesta.toLowerCase().includes(restaurante.name.toLowerCase())) {
                lugaresExtraidos.restauranteNombre = restaurante.name;
                break;
              }
            }
          }
        }
        
        // Usar los nombres originales o los extraídos como fallback
        const nombreEventoFinal = eventoNombre || lugaresExtraidos.eventoNombre;
        const nombreRestauranteFinal = restauranteNombre || lugaresExtraidos.restauranteNombre;
        
        if (eventoNombre || lugaresExtraidos.eventoNombre) {
          console.log(`Nombres extraídos: Evento="${nombreEventoFinal}", Restaurante="${nombreRestauranteFinal}"`);
        } else {
          console.log("No se pudo extraer nombres de eventos o restaurantes de la respuesta de Gemini");
        }
        
        // Buscar los datos completos de los lugares mencionados
        let eventoCompleto = null;
        let restauranteCompleto = null;
        
        if (nombreEventoFinal) {
          eventoCompleto = await buscarEvento(nombreEventoFinal);
        }
        
        if (nombreRestauranteFinal) {
          restauranteCompleto = await buscarRestaurante(nombreRestauranteFinal);
        }
        
        // Datos por defecto si no se encuentran los eventos
        if (!eventoCompleto && nombreEventoFinal) {
          // Crear un objeto genérico con el nombre extraído
          eventoCompleto = {
            nombre: nombreEventoFinal,
            tipo: nombreEventoFinal.toLowerCase().includes('teatro') ? 'teatro' : 'cine',
            lugar: nombreEventoFinal,
            descripcion: 'Consultar detalles'
          };
        }
        
        if (!restauranteCompleto && nombreRestauranteFinal) {
          // Crear un objeto genérico con el nombre extraído
          restauranteCompleto = {
            name: nombreRestauranteFinal,
            categories: ['Restaurante'],
            rating: 4.5
          };
        }
        
        // Construir respuesta final
        const respuestaFinal = {
          respuesta: recomendacion.respuesta,
          sugerencia: {
            evento: eventoCompleto || cartelera[0], // Usar el primer evento como fallback
            restaurante: restauranteCompleto || restaurantes[0] // Usar el primer restaurante como fallback
          }
        };
        
        res.json(respuestaFinal);
      } catch (parseError) {
        console.error('Error al parsear la respuesta del modelo:', parseError.message);
        
        return res.status(500).json({
          mensaje: 'Error al procesar la recomendación',
          error: parseError.message,
          respuestaOriginal: generatedText
        });
      }
    } catch (aiError) {
      console.error('Error al llamar a la API de Gemini:', aiError.message);
      
      return res.status(500).json({
        mensaje: 'Error al generar la recomendación',
        error: aiError.message
      });
    }
  } catch (error) {
    console.error('Error general al procesar la recomendación:', error.message);
    
    res.status(500).json({
      mensaje: 'Error al procesar la solicitud de recomendación',
      error: error.message
    });
  }
});

module.exports = router; 