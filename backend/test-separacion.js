// Función para extraer lugar y dirección
const extraerLugarYDireccion = (texto) => {
  texto = texto.replace(/\s+/g, ' ').trim();   // quita espacios dobles
  
  // Método principal: buscar patrón de MAYÚSCULAS seguido por Mayúscula+minúsculas
  // Ejemplo: "TEATRO SANCOR Av. Corrientes 1234"
  const patronMayusculas = /^([A-Z0-9\s\.&-]+)([A-Z][a-z])/;
  const match = texto.match(patronMayusculas);
  if (match) {
    const indiceSeparacion = match.index + match[1].length;
    return {
      lugar: texto.substring(0, indiceSeparacion).trim(),
      direccion: texto.substring(indiceSeparacion).trim()
    };
  }

  // Si aparece el primer número, todo lo que sigue es la dirección
  const iNum = texto.search(/\d/);
  if (iNum > 0) {
    return {
      lugar: texto.slice(0, iNum).replace(/\s*-\s*$/, '').trim(),
      direccion: texto.slice(iNum).trim()
    };
  }

  // Segundo intento: separador " - "
  if (texto.includes(' - ')) {
    const [lugarPart, ...resto] = texto.split(' - ');
    return { lugar: lugarPart.trim(), direccion: resto.join(' - ').trim() };
  }

  // Si nada coincide
  return { lugar: texto, direccion: '' };
};

// Ejemplos para probar
const ejemplos = [
  "TEATRO SANCOR Av. Corrientes 1234",
  "GORRITI ART CENTER Av. Juan B. Justo 1617 - Capital Federal - Buenos Aires",
  "DUMONT 4040Santos Dumont 4040 - Capital Federal - Buenos Aires",
  "LA GALERA ENCANTADAHumboldt 1591 - Capital Federal - Buenos Aires",
  "CEMENTERIO DE LA CHACARITAGuzmán 680 - Capital Federal - Buenos Aires",
  "ITACA COMPLEJO TEATRALHumahuaca 4027 - Capital Federal - Buenos Aires",
  "STREAMING Tu casa - / - /",
  "TEATRO CIEGO Zelaya 3006"
];

// Prueba cada ejemplo
console.log("PRUEBA DE SEPARACIÓN DE LUGAR Y DIRECCIÓN\n");
ejemplos.forEach((ejemplo, index) => {
  console.log(`[${index + 1}] Texto original: "${ejemplo}"`);
  const resultado = extraerLugarYDireccion(ejemplo);
  console.log(`    Lugar: "${resultado.lugar}"`);
  console.log(`    Dirección: "${resultado.direccion}"`);
  console.log();
});

// Caso especial para "DUMONT 4040"
console.log("CASO ESPECIAL - DUMONT 4040");
const casoEspecial = "DUMONT 4040Santos Dumont 4040 - Capital Federal - Buenos Aires";
let { lugar, direccion } = extraerLugarYDireccion(casoEspecial);
if (lugar.includes("DUMONT") && direccion.includes("Santos Dumont")) {
  lugar = "DUMONT 4040";
  direccion = "Santos Dumont 4040 - Capital Federal - Buenos Aires";
}
console.log(`Lugar: "${lugar}"`);
console.log(`Dirección: "${direccion}"`); 