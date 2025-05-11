const obtenerTeatroAlternativa = require('./scrapers/teatro_alternativa');

async function testScraper() {
  try {
    const obras = await obtenerTeatroAlternativa();
    console.log('Total de obras encontradas:', obras.length);
    
    // Mostrar más obras de ejemplo
    console.log('\n--- MUESTRAS DE OBRAS ---');
    for (let i = 0; i < Math.min(obras.length, 10); i++) {
      const obra = obras[i];
      console.log(`\n[${i+1}] "${obra.nombre}"`);
      console.log('Lugar:', obra.lugar);
      console.log('Dirección:', obra.direccion);
      console.log('Total funciones:', obra.funciones.length);
      
      // Mostrar la primera función
      if (obra.funciones.length > 0) {
        const f = obra.funciones[0];
        console.log(`Primera función: ${f.nombreDia} (día ${f.dia}): ${f.hora} - Fecha: ${f.fecha}`);
      }
    }
  } catch (error) {
    console.error('Error en la prueba:', error);
  }
}

testScraper(); 