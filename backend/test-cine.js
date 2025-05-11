require('dotenv').config();
const obtenerPeliculas = require('./scrapers/cine');

async function main() {
  try {
    console.log('\n🎬 PRUEBA DE OBTENCIÓN DE PELÍCULAS Y FUNCIONES DE CINE 🎬');
    console.log('=======================================================\n');
    
    console.log('Probando obtención de funciones de cine...');
    const peliculas = await obtenerPeliculas();
    
    console.log(`\n✅ Se obtuvieron datos de ${peliculas.length} películas:\n`);
    
    peliculas.forEach((pelicula, index) => {
      console.log(`\n[${index + 1}] ${pelicula.nombre} (${pelicula.tipo})`);
      console.log(`   Lugar: ${pelicula.lugar}`);
      console.log(`   Ubicación: ${pelicula.ubicacion}`);
      
      // Limitar la descripción a 100 caracteres para mejor visualización
      const descripcionCorta = pelicula.descripcion?.length > 100 
        ? pelicula.descripcion.substring(0, 97) + '...'
        : pelicula.descripcion || 'Sin descripción';
      
      console.log(`   Descripción: ${descripcionCorta}`);
      
      // Mostrar información de funciones
      if (pelicula.cines && pelicula.cines.length > 0) {
        const totalFunciones = pelicula.cines.reduce((total, cine) => 
          total + (cine.funciones?.length || 0), 0);
          
        console.log(`   ✅ Funciones disponibles: ${totalFunciones} en ${pelicula.cines.length} cines`);
        
        // Mostrar los primeros 3 cines como ejemplo
        pelicula.cines.slice(0, 3).forEach(cine => {
          console.log(`      🎦 ${cine.nombre} - ${cine.funciones?.length || 0} horarios`);
        });
        
        if (pelicula.cines.length > 3) {
          console.log(`      ... y ${pelicula.cines.length - 3} cines más`);
        }
      } else if (pelicula.mensaje) {
        console.log(`   ℹ️ Mensaje: ${pelicula.mensaje}`);
      } else {
        console.log('   ⚠️ No hay información de funciones disponible');
      }
    });
    
    console.log('\n=======================================================');
    console.log('✅ PRUEBA FINALIZADA EXITOSAMENTE');
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

main(); 