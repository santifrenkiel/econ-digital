const obtenerTeatroAlternativa = require('./scrapers/teatro_alternativa');

obtenerTeatroAlternativa()
  .then(obras => {
    console.log(`\nTotal de obras encontradas: ${obras.length}\n`);
    
    // Mostrar 10 obras
    for (let i = 0; i < Math.min(obras.length, 10); i++) {
      const obra = obras[i];
      console.log(`[${i+1}] "${obra.nombre}"`);
      console.log(`   Lugar: "${obra.lugar}"`);
      console.log(`   Dirección: "${obra.direccion}"`);
      console.log('');
    }
  })
  .catch(err => console.error('Error:', err.message)); 