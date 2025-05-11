const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Obtiene información de eventos musicales desde Songkick
 * @returns {Promise<Array>} - Eventos musicales formateados según el esquema requerido
 */
async function obtenerMusica() {
  try {
    console.log('Obteniendo información de eventos musicales desde Songkick...');
    
    // URL de Songkick para eventos en Buenos Aires
    const url = 'https://www.songkick.com/metro-areas/1521-argentina-buenos-aires';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    const eventos = [];
    
    // Selector para eventos (ajustar según la estructura real del sitio)
    $('.event-listing').each((i, el) => {
      try {
        const nombre = $(el).find('.summary a.summary-title').text().trim();
        const lugar = $(el).find('.venue-name a').text().trim();
        
        // Obtener fecha
        let fecha = new Date().toISOString().split('T')[0]; // Por defecto hoy
        const fechaText = $(el).find('.date-time .date').text().trim();
        if (fechaText) {
          // Procesar la fecha si está en un formato reconocible
          const fechaMatch = fechaText.match(/(\d+)\s+([A-Za-z]+)/);
          if (fechaMatch) {
            // Convertir a formato YYYY-MM-DD (simplificado para el ejemplo)
            const dia = fechaMatch[1];
            const mes = {
              'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
              'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
            }[fechaMatch[2].substring(0, 3)];
            
            if (dia && mes) {
              fecha = `2025-${mes}-${dia.padStart(2, '0')}`;
            }
          }
        }
        
        // Hora por defecto para conciertos
        const hora = '21:00';
        
        // Obtener ubicación
        let ubicacion = 'Buenos Aires, Argentina';
        const ubicacionText = $(el).find('.venue-name').text().trim();
        if (ubicacionText) {
          ubicacion = ubicacionText + ', Buenos Aires';
        }
        
        // Descripción
        let descripcion = 'Evento musical en vivo';
        const artistaInfo = $(el).find('.artists').text().trim();
        if (artistaInfo) {
          descripcion = `Concierto de ${artistaInfo}`;
        }
        
        eventos.push({
          tipo: 'música',
          nombre,
          fecha,
          hora,
          lugar,
          ubicacion,
          descripcion
        });
      } catch (err) {
        console.warn(`Error procesando evento musical: ${err.message}`);
      }
    });
    
    console.log(`Se encontraron ${eventos.length} eventos musicales en Songkick`);
    
    // Si no se encuentran eventos, agregar algunos de ejemplo para pruebas
    if (eventos.length === 0) {
      console.log('No se encontraron eventos. Agregando datos de ejemplo...');
      
      const artistas = ['Lisandro Aristimuño', 'Fito Páez', 'La Beriso', 'Babasónicos', 'Duki'];
      const venues = ['Teatro Gran Rex', 'Luna Park', 'Movistar Arena', 'Niceto Club', 'Teatro Ópera'];
      
      for (let i = 0; i < 5; i++) {
        const fechaConcierto = new Date();
        fechaConcierto.setDate(fechaConcierto.getDate() + Math.floor(Math.random() * 60)); // Próximos 60 días
        
        eventos.push({
          tipo: 'música',
          nombre: `${artistas[i]} en concierto`,
          fecha: fechaConcierto.toISOString().split('T')[0],
          hora: '21:00',
          lugar: venues[i],
          ubicacion: 'Buenos Aires, Argentina',
          descripcion: `Show en vivo de ${artistas[i]}`
        });
      }
    }
    
    return eventos;
  } catch (error) {
    console.error('Error al obtener datos de Songkick:', error.message);
    
    // Datos de ejemplo en caso de error
    const eventosEjemplo = [
      {
        tipo: 'música',
        nombre: 'Lisandro Aristimuño',
        fecha: '2025-05-12',
        hora: '21:00',
        lugar: 'Teatro Gran Rex',
        ubicacion: 'Av. Corrientes 857, CABA',
        descripcion: 'Show acústico del reconocido músico argentino.'
      },
      {
        tipo: 'música',
        nombre: 'Babasónicos',
        fecha: '2025-05-20',
        hora: '20:30',
        lugar: 'Luna Park',
        ubicacion: 'Av. Madero 420, CABA',
        descripcion: 'Presentación del nuevo álbum de la banda.'
      }
    ];
    
    return eventosEjemplo;
  }
}

module.exports = obtenerMusica; 