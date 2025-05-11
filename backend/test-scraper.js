const scraper = require('./scrapers/teatro_alternativa.js');

async function run() {
  try {
    console.log('Iniciando prueba del scraper...');
    const obras = await scraper();
    
    // Inspeccionar detalladamente la primera obra
    if (obras.length > 0) {
      console.log('Detalle de la primera obra:');
      for (const [key, value] of Object.entries(obras[0])) {
        console.log(`- ${key}: ${value} (tipo: ${typeof value})`);
      }
    }
    
    console.log('Resultado final:');
    console.log(JSON.stringify(obras, null, 2));
  } catch (error) {
    console.error('Error en la prueba:', error);
  }
}

run(); 