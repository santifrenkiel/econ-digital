const fs = require('fs').promises;
const path = require('path');
const obtenerPeliculas = require('./cine');
const obtenerTeatroPlateanet = require('./teatro_plateanet');
const obtenerTeatroAlternativa = require('./teatro_alternativa');
const obtenerMusica = require('./musica_songkick');

/**
 * Ejecuta todos los scrapers, combina los resultados y los guarda en cartelera.json
 */
async function ejecutarScrapers() {
  console.log('Iniciando proceso de scraping...');
  
  try {
    // Ejecutar todos los scrapers en paralelo
    const [peliculas, teatroPlateanet, teatroAlternativa, musica] = await Promise.all([
      obtenerPeliculas(),
      obtenerTeatroPlateanet(),
      obtenerTeatroAlternativa(),
      obtenerMusica()
    ]);
    
    // Combinar todos los resultados
    const cartelera = [
      ...peliculas,
      ...teatroPlateanet,
      ...teatroAlternativa,
      ...musica
    ];
    
    console.log(`Total de eventos obtenidos: ${cartelera.length}`);
    
    // Guardar los resultados en el archivo cartelera.json
    const rutaArchivo = path.join(__dirname, '../data/cartelera.json');
    await fs.writeFile(rutaArchivo, JSON.stringify(cartelera, null, 2), 'utf8');
    
    console.log(`Cartelera guardada exitosamente en ${rutaArchivo}`);
    return cartelera;
  } catch (error) {
    console.error('Error al ejecutar los scrapers:', error.message);
    
    // En caso de error, crear un archivo con datos de ejemplo
    const carteleraEjemplo = [
      {
        "tipo": "cine",
        "nombre": "Duna: Parte 2",
        "fecha": "2025-05-11",
        "hora": "19:30",
        "lugar": "Cinemark Palermo",
        "ubicacion": "Beruti 3399, CABA",
        "descripcion": "Secuela épica de ciencia ficción con Timothée Chalamet."
      },
      {
        "tipo": "teatro",
        "nombre": "Toc Toc",
        "fecha": "2025-05-11",
        "hora": "20:30",
        "lugar": "Teatro Multiteatro Comafi",
        "ubicacion": "Av. Corrientes 1283, CABA",
        "descripcion": "Comedia sobre pacientes con trastornos obsesivos compulsivos en una sala de espera."
      },
      {
        "tipo": "música",
        "nombre": "Lisandro Aristimuño",
        "fecha": "2025-05-12",
        "hora": "21:00",
        "lugar": "Teatro Gran Rex",
        "ubicacion": "Av. Corrientes 857, CABA",
        "descripcion": "Show acústico del reconocido músico argentino."
      }
    ];
    
    const rutaArchivo = path.join(__dirname, '../data/cartelera.json');
    await fs.writeFile(rutaArchivo, JSON.stringify(carteleraEjemplo, null, 2), 'utf8');
    
    console.log(`Se generó un archivo de cartelera de ejemplo en ${rutaArchivo}`);
    return carteleraEjemplo;
  }
}

// Si este archivo se ejecuta directamente (no es importado), ejecutar los scrapers
if (require.main === module) {
  ejecutarScrapers()
    .then(() => {
      console.log('Proceso de scraping completado.');
    })
    .catch(err => {
      console.error('Error en el proceso principal:', err);
      process.exit(1);
    });
}

module.exports = ejecutarScrapers; 