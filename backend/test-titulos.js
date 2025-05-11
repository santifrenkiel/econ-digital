const obtenerTitulosPeliculas = require('./scrapers/titulos-cine');

async function main() {
  try {
    const titulos = await obtenerTitulosPeliculas();
    console.log('Títulos de películas obtenidos:', JSON.stringify(titulos, null, 2));
  } catch (error) {
    console.error('Error en la prueba:', error);
  }
}

main(); 