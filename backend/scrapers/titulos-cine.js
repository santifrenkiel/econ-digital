const axios = require('axios');
const cheerio = require('cheerio');

async function obtenerTitulosPeliculas() {
  try {
    console.log('Obteniendo títulos de películas desde Cines Argentinos...');

    // Lista de películas prioritarias confirmadas (segunda tanda de estrenos, ya en cartelera)
    const peliculasPrioritarias = [
      // Películas confirmadas de la segunda sección de estrenos
      'Thunderbolts*',
      'Mazel Tov',
      'Una película de Minecraft',
      'Misericordia',
      'Sneaks, un par con suerte',
      'El casero'
    ];
    
    // Lista de películas a ignorar (estrenos futuros o no disponibles)
    const peliculasAIgnorar = [
      // Primera sección de estrenos (futuros)
      'Karate Kid: Leyendas',
      'Encerrado',
      'La carga más preciada',
      'Esperando la carroza',
      'Unidos por la música',
      'Mars Express',
      'La noche de los Tres Fuegos',
      'MadS'
    ];

    try {
      // Intentamos obtener películas de la web para complementar nuestra lista prioritaria
      const url = 'https://www.cinesargentinos.com.ar/cartelera/';
      const { data: html } = await axios.get(url);
      const $ = cheerio.load(html);

      // Arreglos para almacenar títulos de películas
      const titulosEnCartelera = [];
      const seccionesEstrenos = [];
      
      // Recorrer todos los h2 para detectar las secciones de estrenos
      $('h2.subtitulo').each((index, el) => {
        const textoH2 = $(el).text().trim();
        
        // Detectar secciones de estrenos
        if (textoH2.includes('Estrenos del')) {
          seccionesEstrenos.push({
            titulo: textoH2,
            index: index,
            elemento: el
          });
          console.log(`🎬 Sección de Estrenos detectada: "${textoH2}"`);
        }
      });
      
      // Si encontramos al menos 2 secciones de estrenos
      if (seccionesEstrenos.length >= 2) {
        console.log(`✅ Encontradas ${seccionesEstrenos.length} secciones de estrenos, procesando la segunda sección`);
        
        // Tomamos la segunda sección (índice 1) que contiene estrenos actuales
        const seccionActual = seccionesEstrenos[1];
        
        // Procesamos los enlaces dentro de la segunda sección de estrenos
        const $peliculasEstreno = $(seccionActual.elemento).nextUntil('h2.subtitulo').find('div.carteleraLocalidad a');
        $peliculasEstreno.each((_, pelicula) => {
          const tituloPelicula = $(pelicula).text().trim();
          if (tituloPelicula && !titulosEnCartelera.includes(tituloPelicula) && !peliculasAIgnorar.includes(tituloPelicula)) {
            titulosEnCartelera.push(tituloPelicula);
          }
        });
        
        console.log(`🎬 Se encontraron ${titulosEnCartelera.length} títulos adicionales de películas en la sección seleccionada`);
        
        // Combinar con películas prioritarias
        const todasLasPeliculas = [...peliculasPrioritarias];
        
        // Añadir películas adicionales que no estén ya en la lista prioritaria
        titulosEnCartelera.forEach(pelicula => {
          if (!todasLasPeliculas.includes(pelicula)) {
            todasLasPeliculas.push(pelicula);
          }
        });
        
        console.log(`✅ Lista final combinada: ${todasLasPeliculas.length} películas`);
        
        if (todasLasPeliculas.length > 0) {
          console.log('✅ Películas seleccionadas:', todasLasPeliculas.join(', '));
          return todasLasPeliculas;
        }
      }
    } catch (error) {
      console.log('⚠️ Error al obtener datos del sitio web:', error.message);
    }
    
    // Si llegamos aquí, devolvemos la lista prioritaria predefinida
    console.log('✅ Usando lista predefinida de películas en cartelera');
    console.log('✅ Películas seleccionadas:', peliculasPrioritarias.join(', '));
    return peliculasPrioritarias;
    
  } catch (error) {
    console.error('Error al obtener títulos de películas:', error.message);
    // En caso de error general, devolver la lista básica
    const peliculasBasicas = [
      'Thunderbolts*',
      'Mazel Tov',
      'Una película de Minecraft',
      'Misericordia',
      'Sneaks, un par con suerte',
      'El casero'
    ];
    console.log('⚠️ Usando lista de emergencia debido a un error');
    return peliculasBasicas;
  }
}

module.exports = obtenerTitulosPeliculas;
