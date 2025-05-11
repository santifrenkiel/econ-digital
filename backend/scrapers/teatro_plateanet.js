const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function obtenerTeatro() {
  try {
    console.log('Obteniendo información de teatro desde Plateanet...');

    const url = 'https://www.plateanet.com/Obras/teatro';
    const response = await axios.get(url);

    // Guardar el HTML recibido para inspección manual
    fs.writeFileSync('plateanet.html', response.data);
    console.log('🧪 HTML guardado como plateanet.html');

    // Chequear si el contenido parece un CAPTCHA
    if (response.data.includes('Soy humano') || response.data.includes('captcha')) {
      console.warn('⚠️ Plateanet devolvió un CAPTCHA');
      return [];
    }

    const $ = cheerio.load(response.data);
    const obras = [];

    $('div[class^="itemObra"]').each((i, el) => {
      const nombre = $(el).find('.tituloObra').text().trim();
      const lugar = $(el).find('.lugarObra').text().trim();
      const descripcion = $(el).find('.descripcionObra').text().trim() || 'Sinopsis no disponible';

      // Simular fecha y hora aleatoria
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + Math.floor(Math.random() * 7));
      const hora = ['20:00', '20:30', '21:00'][Math.floor(Math.random() * 3)];

      obras.push({
        tipo: 'teatro',
        nombre,
        fecha: fecha.toISOString().split('T')[0],
        hora,
        lugar,
        ubicacion: 'CABA, Buenos Aires',
        descripcion
      });
    });

    console.log(`🎭 Se encontraron ${obras.length} obras de teatro en Plateanet`);
    return obras;
  } catch (error) {
    console.error('❌ Error al obtener datos de Plateanet:', error.message);
    return [];
  }
}

module.exports = obtenerTeatro;
