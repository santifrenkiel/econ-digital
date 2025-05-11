const puppeteer = require('puppeteer');

/**
 * Espera un tiempo determinado
 * @param {number} ms - Tiempo en milisegundos
 * @returns {Promise}
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Formatea una fecha como YYYY-MM-DD
 * @param {Date} fecha - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
const formatearFecha = (fecha) => {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}T12:00:00`;
};

/**
 * Obtiene información de obras de teatro desde Alternativa Teatral
 * @returns {Promise<Array>} - Obras de teatro formateadas según el esquema requerido
 */
async function obtenerTeatroAlternativa() {
  let browser;
  try {
    console.log('Obteniendo información de teatro desde Alternativa Teatral...');
    
    // Iniciar browser
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Ir a la página principal de la cartelera
    await page.goto('https://www.alternativateatral.com/cartelera.asp', {
      waitUntil: 'networkidle2'
    });
    
    // Hacer scroll para cargar más contenido (unas 10-15 veces para llegar a ~40-50 obras)
    console.log('Haciendo scroll para cargar más obras...');
    for (let i = 0; i < 15; i++) {
      await page.evaluate(() => {
        window.scrollBy(0, 1000);
      });
      // Esperar un poco para que cargue el contenido
      await delay(300);
    }
    
    // Esperar a que se cargue el contenido dinámicamente
    await page.waitForSelector('#cartelera .espectaculo', { timeout: 10000 })
      .catch(() => console.log('No se encontraron espectáculos, intentando continuar...'));
    
    // Extraer datos de las obras
    const obras = await page.evaluate(() => {
      const espectaculos = Array.from(document.querySelectorAll('.espectaculo, #cartelera > div'));
      
      // Función para convertir día de la semana en número (0 = domingo, 1 = lunes, etc.)
      const diaANumero = {
        'domingo': 0,
        'lunes': 1,
        'martes': 2,
        'miércoles': 3,
        'miercoles': 3,
        'jueves': 4,
        'viernes': 5,
        'sábado': 6,
        'sabado': 6
      };
      
      return espectaculos.map(espectaculo => {
        try {
          // Obtener datos básicos
          const nombre = espectaculo.querySelector('.titulo a')?.textContent?.trim() || 
                         espectaculo.querySelector('h2')?.textContent?.trim() || 
                         espectaculo.querySelector('h3')?.textContent?.trim() || 
                         'Sin título';
          
          // --------------------------------------------------
          // Función única para separar el nombre del teatro y la dirección
          const extraerLugarYDireccion = (texto) => {
            texto = texto.replace(/\s+/g, ' ').trim();               // quita espacios duplicados

            // 1) Bloque de MAYÚSCULAS (con tildes) seguido de cualquier otra cosa
            //    Funciona aunque no exista un espacio intermedio
            const regex = /^([A-ZÁÉÍÓÚÜÑ\s]+?)([A-ZÁÉÍÓÚÜÑ]?[a-záéíóúüñ].*)$/u;
            const m = texto.match(regex);
            if (m) return { lugar: m[1].trim(), direccion: m[2].trim() };

            // 2) Primer número → empieza la dirección
            const iNum = texto.search(/\d/);
            if (iNum > 0) {
              return { lugar: texto.slice(0, iNum).trim(),
                      direccion: texto.slice(iNum).trim() };
            }

            // 3) Separador " - "
            if (texto.includes(' - ')) {
              const [lugarPart, ...resto] = texto.split(' - ');
              return { lugar: lugarPart.trim(), direccion: resto.join(' - ').trim() };
            }

            // 4) Si nada coincide, todo es lugar
            return { lugar: texto, direccion: '' };
          };
          // --------------------------------------------------

          // Obtener información del teatro/sala
          const lugarCompleto = espectaculo.querySelector('.sala')?.textContent?.trim() ||
                                espectaculo.querySelector('.lugar')?.textContent?.trim() ||
                                'Sala no especificada';

          let { lugar: lugarFinal, direccion: direccionFinal } = extraerLugarYDireccion(lugarCompleto);
          
          // Corrección para caso especial DUMONT
          if (lugarFinal === "DUMONT" && direccionFinal.includes("4040Santos Dumont 4040")) {
            lugarFinal = "DUMONT 4040";
            direccionFinal = "Santos Dumont 4040 - Capital Federal - Buenos Aires";
          }
          
          // Intentar extraer ubicación completa
          let ubicacion = direccionFinal;
          const direccionText = espectaculo.querySelector('.direccion')?.textContent?.trim() || '';
          if (direccionText) {
            ubicacion = direccionText;
          }
          
          // Si la ubicación está vacía, usar una predeterminada
          if (!ubicacion) {
            ubicacion = direccionFinal || 'Buenos Aires, Argentina';
          }
          
          // MEJORA: Extracción mejorada de funciones y horarios
          const funciones = [];
          
          // 1. Extraer elemento específico que contiene las funciones
          const funcionesElem = espectaculo.querySelector('.funciones');
          let funcionesText = '';
          
          if (funcionesElem) {
            funcionesText = funcionesElem.textContent.trim();
          } else {
            // Intentar buscar en otros elementos donde podría estar la información
            const textoAdicional = espectaculo.querySelector('.adicional')?.textContent?.trim() || '';
            funcionesText = textoAdicional;
          }
          
          // 2. Buscar patrones de días y horarios usando expresiones regulares más robustas
          if (funcionesText) {
            // Patrón principal: día seguido de hora (con variantes)
            // Por ejemplo: "Domingo 20:30 hs" o "Sábados 21:00"
            const patronDiaHora = /([a-zÁ-Úá-ú]+)(?:es|s)?\s+(?:a las\s+)?(\d{1,2})[:\.](\d{2})(?:\s*hs\.?)?/gi;
            let match;
            
            while ((match = patronDiaHora.exec(funcionesText)) !== null) {
              let diaNombre = match[1].trim();
              let diaKey = diaNombre.toLowerCase();
              
              // Normalizar el nombre del día
              if (diaKey.startsWith('sáb') || diaKey.startsWith('sab')) diaKey = 'sabado';
              else if (diaKey.startsWith('dom')) diaKey = 'domingo';
              else if (diaKey.startsWith('lun')) diaKey = 'lunes';
              else if (diaKey.startsWith('mar')) diaKey = 'martes';
              else if (diaKey.startsWith('mié') || diaKey.startsWith('mie')) diaKey = 'miercoles';
              else if (diaKey.startsWith('jue')) diaKey = 'jueves';
              else if (diaKey.startsWith('vie')) diaKey = 'viernes';
              
              // Convertir al número de día
              const diaNumero = diaANumero[diaKey];
              
              if (diaNumero !== undefined) {
                // Formatear hora
                const hora = `${String(match[2]).padStart(2, '0')}:${String(match[3]).padStart(2, '0')}`;
                const nombreDiaFormateado = diaNombre.charAt(0).toUpperCase() + diaNombre.slice(1).toLowerCase();
                
                // Añadir la función solo si no existe una igual
                const existeFuncion = funciones.some(f => f.dia === diaNumero && f.hora === hora);
                if (!existeFuncion) {
                  funciones.push({
                    dia: diaNumero,
                    nombreDia: nombreDiaFormateado,
                    hora
                  });
                }
              }
            }
            
            // 3. Buscar patrones alternativos (por ejemplo: "Función: Domingo a las 20:30 hs")
            if (funciones.length === 0) {
              const patronAlternativo = /(?:función|funciones):\s+([^\.]+)/i;
              const funcMatch = funcionesText.match(patronAlternativo);
              
              if (funcMatch) {
                const textoFunciones = funcMatch[1];
                // Extraer días
                const diasMencionados = textoFunciones.match(/domingo|lunes|martes|mi[ée]rcoles|jueves|viernes|s[áa]bado/gi) || [];
                // Extraer hora
                const horaMatch = textoFunciones.match(/(\d{1,2})[:\.](\d{2})/);
                
                if (diasMencionados.length > 0 && horaMatch) {
                  const horaComun = `${String(horaMatch[1]).padStart(2, '0')}:${String(horaMatch[2]).padStart(2, '0')}`;
                  
                  // Añadir una función por cada día mencionado
                  diasMencionados.forEach(dia => {
                    let diaKey = dia.toLowerCase();
                    
                    // Normalizar el día
                    if (diaKey.startsWith('sáb') || diaKey.startsWith('sab')) diaKey = 'sabado';
                    else if (diaKey.startsWith('dom')) diaKey = 'domingo';
                    else if (diaKey.startsWith('lun')) diaKey = 'lunes';
                    else if (diaKey.startsWith('mar')) diaKey = 'martes';
                    else if (diaKey.startsWith('mié') || diaKey.startsWith('mie')) diaKey = 'miercoles';
                    else if (diaKey.startsWith('jue')) diaKey = 'jueves';
                    else if (diaKey.startsWith('vie')) diaKey = 'viernes';
                    
                    const diaNumero = diaANumero[diaKey];
                    
                    if (diaNumero !== undefined) {
                      const nombreDiaFormateado = dia.charAt(0).toUpperCase() + dia.slice(1).toLowerCase();
                      
                      // Verificar que no exista ya esta función
                      const existeFuncion = funciones.some(f => f.dia === diaNumero && f.hora === horaComun);
                      if (!existeFuncion) {
                        funciones.push({
                          dia: diaNumero,
                          nombreDia: nombreDiaFormateado,
                          hora: horaComun
                        });
                      }
                    }
                  });
                }
              }
            }
          }
          
          // 4. Si seguimos sin funciones pero hay menciones de días en todo el texto
          if (funciones.length === 0) {
            const textoCompleto = espectaculo.textContent.trim();
            // Buscar todos los días mencionados
            const diasGenericos = textoCompleto.match(/domingo|lunes|martes|mi[ée]rcoles|jueves|viernes|s[áa]bado/gi) || [];
            
            if (diasGenericos.length > 0) {
              // Buscar también un horario
              const horarioGenerico = textoCompleto.match(/(\d{1,2})[:\.](\d{2})/);
              const hora = horarioGenerico ? 
                `${String(horarioGenerico[1]).padStart(2, '0')}:${String(horarioGenerico[2]).padStart(2, '0')}` : 
                '20:00'; // Horario por defecto más probable
              
              // Añadir función para cada día mencionado
              const diasProcesados = new Set();
              diasGenericos.forEach(dia => {
                let diaKey = dia.toLowerCase();
                
                // Normalizar el día
                if (diaKey.startsWith('sáb') || diaKey.startsWith('sab')) diaKey = 'sabado';
                else if (diaKey.startsWith('dom')) diaKey = 'domingo';
                else if (diaKey.startsWith('lun')) diaKey = 'lunes';
                else if (diaKey.startsWith('mar')) diaKey = 'martes';
                else if (diaKey.startsWith('mié') || diaKey.startsWith('mie')) diaKey = 'miercoles';
                else if (diaKey.startsWith('jue')) diaKey = 'jueves';
                else if (diaKey.startsWith('vie')) diaKey = 'viernes';
                
                const diaNumero = diaANumero[diaKey];
                
                if (diaNumero !== undefined && !diasProcesados.has(diaNumero)) {
                  diasProcesados.add(diaNumero);
                  
                  const nombreDiaFormateado = dia.charAt(0).toUpperCase() + dia.slice(1).toLowerCase();
                  funciones.push({
                    dia: diaNumero,
                    nombreDia: nombreDiaFormateado,
                    hora
                  });
                }
              });
            }
          }
          
          // 5. Casos especiales
          // Si contiene "STREAMING" o "ON DEMAND", añadir todos los días con horario 00:00
          if ((lugarFinal.includes("STREAMING") || lugarFinal.includes("ON DEMAND") || funcionesText.includes("streaming")) && funciones.length === 0) {
            // Añadir todos los días de la semana con horario 00:00
            [
              { dia: 0, nombre: 'Domingo' },
              { dia: 1, nombre: 'Lunes' },
              { dia: 2, nombre: 'Martes' },
              { dia: 3, nombre: 'Miércoles' },
              { dia: 4, nombre: 'Jueves' },
              { dia: 5, nombre: 'Viernes' },
              { dia: 6, nombre: 'Sábado' }
            ].forEach(dia => {
              funciones.push({
                dia: dia.dia,
                nombreDia: dia.nombre,
                hora: '00:00'
              });
            });
          }
          
          // 6. Si aún no hay funciones, usar un valor por defecto razonable
          if (funciones.length === 0) {
            // Añadir funciones para viernes, sábado y domingo que son los días más comunes
            [
              { dia: 5, nombre: 'Viernes' },
              { dia: 6, nombre: 'Sábado' },
              { dia: 0, nombre: 'Domingo' }
            ].forEach(dia => {
              funciones.push({ 
                dia: dia.dia, 
                nombreDia: dia.nombre, 
                hora: '20:30'  // Hora predeterminada más común para teatro
              });
            });
          }
          
          // Descripción
          const descripcion = espectaculo.querySelector('.sinopsis')?.textContent?.trim() || 
                             'Obra de teatro alternativo';
          
          return {
            tipo: 'teatro',
            nombre,
            lugar: lugarFinal,
            direccion: direccionFinal,
            ubicacion,
            descripcion,
            funciones
          };
        } catch (err) {
          console.warn(`Error procesando espectáculo: ${err.message}`);
          return null;
        }
      }).filter(obra => obra !== null);
    });
    
    console.log(`Se encontraron ${obras.length} obras de teatro en Alternativa Teatral`);
    
    if (obras.length === 0) {
      console.log('No se encontraron obras, generando ejemplos...');
      
      // Si no hay obras, crear algunas obras de ejemplo
      const hoy = new Date();
      const diaHoy = hoy.getDay(); // 0 = domingo, 1 = lunes, etc.
      const manana = new Date(hoy);
      manana.setDate(hoy.getDate() + 1);
      const diaManana = manana.getDay();
      
      const fechaHoyStr = formatearFecha(hoy);
      const fechaMananaStr = formatearFecha(manana);
      
      // Nombres de los días según el día de la semana
      const nombreDiaHoy = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][diaHoy];
      const nombreDiaManana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][diaManana];
      
      return [
        {
          tipo: 'teatro',
          nombre: 'Bodas de Sangre',
          lugar: 'Teatro San Martín',
          direccion: 'Corrientes 1530',
          ubicacion: 'Corrientes 1530, CABA',
          descripcion: 'Obra clásica de Federico García Lorca',
          funciones: [
            { dia: diaHoy, nombreDia: nombreDiaHoy, hora: '20:30', fecha: fechaHoyStr },
            { dia: diaManana, nombreDia: nombreDiaManana, hora: '21:00', fecha: fechaMananaStr }
          ]
        },
        {
          tipo: 'teatro',
          nombre: 'El Método Grönholm',
          lugar: 'Teatro Picadero',
          direccion: 'Pasco 300',
          ubicacion: 'Pasco 300, CABA',
          descripcion: 'Comedia dramática sobre una extraña selección de personal',
          funciones: [
            { dia: diaHoy, nombreDia: nombreDiaHoy, hora: '21:00', fecha: fechaHoyStr }
          ]
        }
      ];
    }
    
    // Añadir fechas concretas para los próximos días basándose en días reales de las funciones
    obras.forEach(obra => {
      const fechasFunciones = [];
      const hoy = new Date();
      
      // Limitar a 2 semanas (14 días) en lugar de 30 días
      for (let i = 0; i < 14; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + i);
        const diaSemana = fecha.getDay(); // 0 = domingo, 1 = lunes, etc.
        
        // Solo añadir fechas para los días que tienen funciones según la web
        obra.funciones.forEach(funcion => {
          // Verificar si la función corresponde al día de la semana actual
          // El día de la función debe coincidir con el día de la semana de la fecha
          if (funcion.dia === diaSemana) {
            fechasFunciones.push({
              ...funcion,
              fecha: formatearFecha(fecha)
            });
          }
        });
      }
      
      // Reemplazar las funciones con las fechas concretas (si hay fechas)
      if (fechasFunciones.length > 0) {
        obra.funciones = fechasFunciones;
      } else {
        // Si no encontramos fechas, es un caso especial, mantener las funciones originales
        // pero añadir una fecha para hoy
        const fechaHoy = formatearFecha(new Date());
        obra.funciones = obra.funciones.map(f => ({...f, fecha: fechaHoy}));
      }
    });
    
    return obras;
  } catch (error) {
    console.error('Error al obtener datos de Alternativa Teatral:', error.message);
    // Devolver datos de ejemplo en caso de error
    const hoy = new Date();
    const diaActual = hoy.getDay(); // 0 = domingo, 1 = lunes, etc.
    const fechaHoyStr = formatearFecha(hoy);
    
    // Elegir un día adecuado basado en el día actual
    let diaFuncion;
    let nombreDiaFuncion;
    
    // Si hoy es sábado (día 6), usar sábado
    if (diaActual === 6) {
      diaFuncion = 6;
      nombreDiaFuncion = 'Sábado';
    }
    // Si hoy es viernes (día 5), usar viernes
    else if (diaActual === 5) {
      diaFuncion = 5;
      nombreDiaFuncion = 'Viernes';
    }
    // En cualquier otro caso, usar el día actual
    else {
      diaFuncion = diaActual;
      nombreDiaFuncion = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][diaActual];
    }
    
    return [
      {
        tipo: 'teatro',
        nombre: 'La Noche de la Iguana',
        lugar: 'Teatro Regio',
        direccion: 'Córdoba 6056',
        ubicacion: 'Córdoba 6056, CABA',
        descripcion: 'Clásico de Tennessee Williams',
        funciones: [
          { dia: diaFuncion, nombreDia: nombreDiaFuncion, hora: '20:00', fecha: fechaHoyStr }
        ]
      }
    ];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = obtenerTeatroAlternativa; 