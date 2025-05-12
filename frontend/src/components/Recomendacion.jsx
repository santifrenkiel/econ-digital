import { useState, useRef } from 'react';
import { FaFilm, FaTheaterMasks, FaMusic, FaUtensils, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaStar, FaAngleDown, FaAngleUp, FaQuoteLeft, FaTicketAlt, FaComments } from 'react-icons/fa';

const Recomendacion = ({ data }) => {
  const [mostrarDetallesEvento, setMostrarDetallesEvento] = useState(true);
  const [mostrarDetallesRestaurante, setMostrarDetallesRestaurante] = useState(true);
  const [mostrarHorariosPopup, setMostrarHorariosPopup] = useState(false);
  const [mostrarResenasPopup, setMostrarResenasPopup] = useState(false);
  const [resenasExpandidas, setResenasExpandidas] = useState({});
  const [cinesExpandidos, setCinesExpandidos] = useState({});
  const [diasExpandidos, setDiasExpandidos] = useState({});
  
  // Referencias para mantener el scroll
  const cineRefs = useRef({});
  const diaRefs = useRef({});
  const popupRef = useRef(null);
  
  // Si no hay datos, no mostrar nada
  if (!data || !data.respuesta || !data.sugerencia) {
    return null;
  }
  
  const { respuesta, sugerencia } = data;
  const { evento, restaurante } = sugerencia;
  
  // Verificación básica de que los datos estructurados estén disponibles
  const hayDatosEvento = evento && (evento.titulo || evento.nombre || evento.lugar);
  const hayDatosRestaurante = restaurante && (restaurante.name || restaurante.id);
  
  // Obtener el icono según el tipo de evento
  const getTipoIcon = (tipo) => {
    if (!tipo) return <FaTheaterMasks className="text-purple-500" />;
    
    switch (tipo.toLowerCase()) {
      case 'cine':
        return <FaFilm className="text-blue-500" />;
      case 'teatro':
        return <FaTheaterMasks className="text-purple-500" />;
      case 'música':
      case 'musica':
        return <FaMusic className="text-green-500" />;
      default:
        return <FaCalendarAlt className="text-gray-500" />;
    }
  };
  
  // Formatear fecha para mostrar en formato legible
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'Consultar horarios';
    
    try {
      const fecha = new Date(fechaStr);
      // Verificar si la fecha es válida
      if (isNaN(fecha.getTime())) {
        return fechaStr; // Mostrar el string original si no es una fecha válida
      }
      return fecha.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return fechaStr || 'Consultar horarios';
    }
  };
  
  // Obtener categorías del restaurante como array
  const getCategorias = () => {
    if (restaurante?.categories && Array.isArray(restaurante.categories)) {
      return restaurante.categories;
    } else if (restaurante?.categories && typeof restaurante.categories === 'string') {
      return restaurante.categories.split(',').map(cat => cat.trim());
    }
    return [];
  };
  
  // Obtener la dirección completa del restaurante
  const getDireccionRestaurante = () => {
    if (restaurante?.location?.address1) {
      const ciudad = restaurante.location.city ? `, ${restaurante.location.city}` : '';
      return `${restaurante.location.address1}${ciudad}`;
    } else if (restaurante?.address) {
      return restaurante.address;
    }
    return 'Dirección no disponible';
  };
  
  // Obtener nombre del evento
  const getNombreEvento = () => {
    return evento?.titulo || evento?.nombre || 'Evento no especificado';
  };
  
  // Obtener lugar del evento
  const getLugarEvento = () => {
    // Si es un evento de cine con lugar genérico, mostrar "Consultar cines"
    if (evento?.tipo === 'cine' && (evento?.lugar === 'Multicines Buenos Aires' || !evento?.lugar)) {
      return 'Consultar cines';
    }
    return evento?.lugar || evento?.ubicacion || 'Ubicación no especificada';
  };
  
  // Obtener dirección del evento
  const getDireccionEvento = () => {
    // Para eventos de cine con ubicación genérica
    if (evento?.tipo === 'cine' && 
        (evento?.ubicacion === 'Varias salas en Buenos Aires' || 
         evento?.direccion === 'Varias salas en Buenos Aires')) {
      return 'Consultar cines disponibles';
    }
    return evento?.direccion || evento?.ubicacion || 'Dirección no especificada';
  };

  // Componente para popup
  const Popup = ({ titulo, contenido, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div 
        ref={popupRef}
        className="bg-white rounded-lg p-6 max-w-3xl max-h-[80vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{titulo}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="mt-2">
          {contenido}
        </div>
      </div>
    </div>
  );
  
  // Renderizar horarios de funciones
  const renderHorariosContenido = () => {
    // Si no hay cines o funciones disponibles
    if ((!evento?.cines || !Array.isArray(evento.cines) || evento.cines.length === 0) &&
        (!evento?.funciones || !Array.isArray(evento.funciones) || evento.funciones.length === 0)) {
      
      // Si hay un mensaje personalizado, mostrarlo
      if (evento?.mensaje) {
        return (
          <div className="p-5 text-center">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
              <p className="text-blue-800 mb-1 font-medium">Información</p>
              <p className="text-gray-700">{evento.mensaje}</p>
            </div>
            <p className="text-gray-600 mt-3">
              Puedes intentar buscar información en:
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <a 
                href={`https://www.google.com/search?q=película+${evento.nombre}+horarios+cines+Buenos+Aires`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Buscar en Google
              </a>
              <a 
                href="https://www.cinesargentinos.com.ar/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-secondary-600 text-white rounded hover:bg-secondary-700"
              >
                Cines Argentinos
              </a>
            </div>
          </div>
        );
      }
      
      return <p className="text-gray-700 p-4 text-center">No hay horarios disponibles para este evento.</p>;
    }
    
    // Determinar si estamos usando el nuevo formato de múltiples cines
    const tieneMultiplesCines = evento?.cines && Array.isArray(evento.cines) && evento.cines.length > 0;
    
    // Usar el formato de varios cines si está disponible, o el formato antiguo si no
    if (tieneMultiplesCines) {
      return (
        <div className="space-y-6">
          <p className="font-medium text-gray-700 mb-4">Selecciona la función a la que deseas asistir:</p>
          
          {/* Mostrar cines */}
          {evento.cines.map((cine, cineIndex) => {
            // Determinar si este cine está expandido
            const expandido = !!cinesExpandidos[cineIndex];
            
            // Contar cuántas funciones tiene este cine
            const cantidadFunciones = cine.funciones?.length || 0;
            
            // Agrupar funciones por día
            const funcionesPorDia = {};
            if (cine.funciones && cine.funciones.length > 0) {
              cine.funciones.forEach(funcion => {
                const fechaKey = funcion.fecha || '';
                if (!funcionesPorDia[fechaKey]) {
                  funcionesPorDia[fechaKey] = [];
                }
                funcionesPorDia[fechaKey].push(funcion);
              });
            }
            
            // Convertir a array y ordenar por fecha
            const diasOrdenados = Object.keys(funcionesPorDia)
              .sort((a, b) => new Date(a) - new Date(b))
              .map(fecha => {
                // Obtener todas las funciones para esta fecha
                const funcionesParaFecha = funcionesPorDia[fecha];
                
                // Ordenar las funciones por hora antes de devolverlas
                const funcionesOrdenadas = funcionesParaFecha.sort((a, b) => {
                  // Función para convertir hora en formato "HH:MM" a minutos desde medianoche
                  const convertirAMinutos = (hora) => {
                    if (!hora) return 0;
                    
                    const partes = hora.split(':');
                    if (partes.length !== 2) return 0;
                    
                    const horas = parseInt(partes[0], 10);
                    const minutos = parseInt(partes[1], 10);
                    
                    if (isNaN(horas) || isNaN(minutos)) return 0;
                    
                    return (horas * 60) + minutos;
                  };
                  
                  // Convertir cada hora a minutos y comparar
                  const minutosA = convertirAMinutos(a.hora);
                  const minutosB = convertirAMinutos(b.hora);
                  
                  return minutosA - minutosB;
                });
                
                return {
                  fecha,
                  nombreDia: obtenerNombreDiaCorrecto({ fecha }) || formatearFechaCorta(fecha),
                  funciones: funcionesOrdenadas
                };
              });
              
            return (
              <div 
                key={cineIndex} 
                className="mb-6 bg-white rounded-lg border border-gray-100 shadow-sm"
                ref={el => cineRefs.current[cineIndex] = el}
              >
                <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-800">{cine.nombre}</h4>
                      {cine.direccion && (
                        <p className="text-sm text-gray-600 mt-1 flex items-center">
                          <FaMapMarkerAlt className="mr-1 text-gray-400" />
                          {cine.direccion}
                        </p>
                      )}
                    </div>
                    
                    {cantidadFunciones > 0 && (
                      <button 
                        onClick={() => toggleCineExpandido(cineIndex)}
                        className="flex items-center text-primary-600 hover:text-primary-800 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        {expandido ? (
                          <>
                            <FaAngleUp className="mr-1" />
                            <span className="text-sm font-medium">Ocultar horarios</span>
                          </>
                        ) : (
                          <>
                            <FaAngleDown className="mr-1" />
                            <span className="text-sm font-medium">Ver {cantidadFunciones} horarios</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* Mostrar funciones resumidas cuando está colapsado */}
                  {!expandido && cantidadFunciones > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {diasOrdenados.slice(0, 3).map((dia, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                          {dia.nombreDia}
                        </span>
                      ))}
                      {diasOrdenados.length > 3 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs font-medium rounded">
                          +{diasOrdenados.length - 3} días más
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Mostrar todas las funciones agrupadas por día cuando está expandido */}
                {expandido && cantidadFunciones > 0 && (
                  <div className="p-4">
                    <div className="space-y-3">
                      {diasOrdenados.map((dia, diaIndex) => {
                        const diaExpandido = !!diasExpandidos[`${cineIndex}-${diaIndex}`];
                        const refKey = `${cineIndex}-${diaIndex}`;
                        
                        return (
                          <div 
                            key={diaIndex} 
                            className="border border-gray-100 rounded-lg overflow-hidden"
                            ref={el => diaRefs.current[refKey] = el}
                          >
                            <div 
                              className="p-3 bg-gray-50 flex justify-between items-center cursor-pointer"
                              onClick={() => toggleDiaExpandido(cineIndex, diaIndex)}
                            >
                              <div className="flex items-center">
                                <FaCalendarAlt className="text-primary-500 mr-2" />
                                <span className="font-medium">
                                  {dia.nombreDia} {new Date(dia.fecha).getDate()}
                                </span>
                              </div>
                              <button className="text-primary-600 hover:text-primary-800 flex items-center">
                                {diaExpandido ? (
                                  <>
                                    <FaAngleUp className="mr-1" />
                                    <span className="text-sm">Ocultar</span>
                                  </>
                                ) : (
                                  <>
                                    <FaAngleDown className="mr-1" />
                                    <span className="text-sm">Ver {dia.funciones.length} horarios</span>
                                  </>
                                )}
                              </button>
                            </div>
                            
                            {diaExpandido && (
                              <div className="p-3 bg-white">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {dia.funciones.map((funcion, i) => (
                                    <div key={i} className="flex items-center bg-gray-50 px-3 py-2 rounded-md">
                                      <FaClock className="text-primary-500 mr-2" />
                                      <span>{funcion.hora || 'Horario no especificado'}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          <p className="text-sm text-gray-500 mt-4">* Los horarios pueden estar sujetos a cambios. Te recomendamos verificar en el sitio oficial del cine.</p>
        </div>
      );
    }
    
    // Formato antiguo (una única lista de funciones)
    // Agrupar funciones por fecha
    const funcionesPorFecha = {};
    evento.funciones.forEach(funcion => {
      const fechaKey = funcion.fecha || '';
      if (!funcionesPorFecha[fechaKey]) {
        funcionesPorFecha[fechaKey] = [];
      }
      funcionesPorFecha[fechaKey].push(funcion);
    });
    
    // Convertir a array y ordenar por fecha
    const funcionesAgrupadas = Object.keys(funcionesPorFecha)
      .sort((a, b) => new Date(a) - new Date(b))
      .map(fecha => {
        // Obtener todas las funciones para esta fecha
        const funcionesParaFecha = funcionesPorFecha[fecha];
        
        // Ordenar las funciones por hora
        const funcionesOrdenadas = funcionesParaFecha.sort((a, b) => {
          // Función para convertir hora en formato "HH:MM" a minutos desde medianoche
          const convertirAMinutos = (hora) => {
            if (!hora) return 0;
            
            const partes = hora.split(':');
            if (partes.length !== 2) return 0;
            
            const horas = parseInt(partes[0], 10);
            const minutos = parseInt(partes[1], 10);
            
            if (isNaN(horas) || isNaN(minutos)) return 0;
            
            return (horas * 60) + minutos;
          };
          
          // Convertir cada hora a minutos y comparar
          const minutosA = convertirAMinutos(a.hora);
          const minutosB = convertirAMinutos(b.hora);
          
          return minutosA - minutosB;
        });
        
        return {
          fecha,
          nombreDia: obtenerNombreDiaCorrecto({ fecha }),
          funciones: funcionesOrdenadas
        };
      });
    
    return (
      <div className="space-y-4">
        <p className="font-medium text-gray-700 mb-2">Selecciona la función a la que deseas asistir:</p>
        <div className="space-y-4">
          {funcionesAgrupadas.map((grupo, index) => {
            const diaExpandido = !!diasExpandidos[`grupo-${index}`];
            const refKey = `grupo-${index}`;
            
            return (
              <div 
                key={index} 
                className="border border-gray-200 rounded-lg overflow-hidden"
                ref={el => diaRefs.current[refKey] = el}
              >
                <div 
                  className="p-3 bg-gray-50 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleDiaExpandido('grupo', index)}
                >
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-primary-500" />
                    <span className="font-medium">{formatearFecha(grupo.fecha)}</span>
                  </div>
                  <button className="text-primary-600 hover:text-primary-800 flex items-center">
                    {diaExpandido ? (
                      <>
                        <FaAngleUp className="mr-1" />
                        <span className="text-sm">Ocultar</span>
                      </>
                    ) : (
                      <>
                        <FaAngleDown className="mr-1" />
                        <span className="text-sm">Ver {grupo.funciones.length} horarios</span>
                      </>
                    )}
                  </button>
                </div>
                
                {diaExpandido && (
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {grupo.funciones.map((funcion, i) => (
                        <div key={i} className="flex items-center bg-gray-50 px-3 py-2 rounded-md">
                          <FaClock className="mr-2 text-sm text-primary-500" />
                          <span>{funcion.hora || 'Horario no especificado'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-sm text-gray-500 mt-4">* Los horarios pueden estar sujetos a cambios. Te recomendamos verificar en el sitio oficial del evento.</p>
      </div>
    );
  };

  // Renderizar reseñas
  const renderResenasContenido = () => {
    // Preparar todas las reseñas disponibles
    let resenasDestacadas = [];
    let resenasDetalladas = [];
    let resenasTexto = [];
    
    // Obtener reseñas destacadas si existen
    if (restaurante?.featured_reviews && Array.isArray(restaurante.featured_reviews)) {
      resenasDestacadas = restaurante.featured_reviews.map(review => ({
        ...review,
        author: review.author || "Cliente destacado",
        isHighlighted: true
      }));
    }
    
    // Obtener reseñas detalladas si existen
    if (restaurante?.detailed_reviews && Array.isArray(restaurante.detailed_reviews)) {
      resenasDetalladas = restaurante.detailed_reviews;
    }
    
    // Obtener reseñas básicas si existen
    if (restaurante?.reviews && Array.isArray(restaurante.reviews)) {
      resenasTexto = restaurante.reviews.map((texto, i) => ({
        author: `Usuario ${i+1}`,
        text: texto,
        rating: 5
      }));
    }
    
    // Combinar todas las reseñas
    let todasLasResenas = [
      ...resenasDestacadas,
      ...resenasDetalladas.filter(dr => 
        !resenasDestacadas.some(fr => fr.text === dr.text)
      ),
      ...resenasTexto.filter(tr => 
        !resenasDestacadas.some(fr => fr.text === tr.text) && 
        !resenasDetalladas.some(dr => dr.text === tr.text)
      )
    ];
    
    // Si no hay reseñas, mostrar mensaje de que no hay reseñas disponibles
    if (todasLasResenas.length === 0) {
      return (
        <div className="p-4 text-center">
          <p className="text-gray-600">No hay reseñas disponibles para este restaurante.</p>
        </div>
      );
    }
    
    // Calcular estadísticas de calificaciones
    const ratings = todasLasResenas.map(r => r.rating).filter(r => r);
    const ratingPromedio = ratings.length > 0 
      ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) 
      : restaurante?.rating || 0;
    
    return (
      <div className="space-y-6">
        {/* Información general de las reseñas */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <FaStar className="text-yellow-400 mr-2 text-2xl" />
            <span className="font-bold text-2xl">{ratingPromedio}</span>
            <span className="text-gray-500 ml-2">({todasLasResenas.length} reseñas)</span>
          </div>
          
          {/* Distribución de calificaciones */}
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map(num => {
              const cantidad = ratings.filter(r => Math.round(r) === num).length;
              const porcentaje = ratings.length > 0 ? Math.round((cantidad / ratings.length) * 100) : 0;
              
              return (
                <div key={num} className="flex items-center text-sm">
                  <div className="flex items-center w-12">
                    <span>{num}</span>
                    <FaStar className="text-yellow-400 ml-1 text-xs" />
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 ml-2 mr-3">
                    <div 
                      className="bg-yellow-400 rounded-full h-2" 
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-600 w-10 text-right">{porcentaje}%</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Reseñas destacadas */}
        {resenasDestacadas.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-lg mb-3">Reseñas destacadas</h4>
            <div className="space-y-4">
              {resenasDestacadas.map((review, i) => (
                <div key={`featured-${i}`} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <div className="flex items-center mb-2">
                    <span className="font-medium text-gray-900">{review.author || "Cliente destacado"}</span>
                    <div className="ml-auto flex items-center">
                      <FaStar className="text-yellow-400 text-sm" />
                      <span className="ml-1 text-sm">{review.rating || 5}</span>
                    </div>
                  </div>
                  <TextoTruncado 
                    texto={review.text} 
                    id={`featured-${i}`}
                    maxCaracteres={200}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Resto de reseñas */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg mb-3">Todas las opiniones</h4>
          {todasLasResenas
            .filter(r => !resenasDestacadas.some(fr => fr.text === r.text))
            .map((review, i) => (
              <div key={i} className="border-b border-gray-200 pb-4">
                <div className="flex items-center mb-2">
                  <span className="font-medium text-gray-900">{review.author}</span>
                  <div className="ml-2 flex items-center">
                    <FaStar className="text-yellow-400 text-sm" />
                    <span className="ml-1 text-sm">{review.rating}</span>
                  </div>
                  {review.published_at && (
                    <span className="ml-2 text-xs text-gray-500">
                      {review.published_at}
                    </span>
                  )}
                </div>
                <TextoTruncado 
                  texto={review.text} 
                  id={`review-${i}`}
                  maxCaracteres={150}
                />
                
                {/* Mostrar detalles de experiencia si existen */}
                {review.experience_details && review.experience_details.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {review.experience_details
                      .filter(detail => detail.name && detail.value)
                      .map((detail, j) => (
                        <span key={j} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {detail.name}: {detail.value}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    );
  };
  
  // Función para expandir/contraer reseñas
  const toggleResenaExpandida = (id) => {
    setResenasExpandidas(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Función para mostrar texto truncado con botón "Ver más"
  const TextoTruncado = ({ texto, id, maxCaracteres = 150 }) => {
    if (!texto) return <p className="text-gray-700">[Sin texto]</p>;
    
    const esLargo = texto.length > maxCaracteres;
    const expandido = resenasExpandidas[id];
    
    if (!esLargo) return <p className="text-gray-700">{texto}</p>;
    
    return (
      <div>
        <p className="text-gray-700">
          {expandido ? texto : `${texto.substring(0, maxCaracteres)}...`}
        </p>
        <button 
          onClick={() => toggleResenaExpandida(id)}
          className="text-primary-600 hover:text-primary-800 text-sm font-medium mt-1"
        >
          {expandido ? 'Ver menos' : 'Ver más'}
        </button>
      </div>
    );
  };
  
  // Manejar expansión/colapso de funciones para un cine específico
  const toggleCineExpandido = (cineIndex) => {
    // Si el cine que se va a expandir ya está expandido, colapsarlo
    const isCurrentlyExpanded = !!cinesExpandidos[cineIndex];
    
    if (isCurrentlyExpanded) {
      // Si está expandido, simplemente lo cerramos
      setCinesExpandidos(prev => ({
        ...prev,
        [cineIndex]: false
      }));
    } else {
      // Si no está expandido, cerramos todos los otros cines y abrimos este
      // Creamos un nuevo objeto vacío para resetear todos los estados
      const newState = {};
      // Solo activamos el cine actual
      newState[cineIndex] = true;
      setCinesExpandidos(newState);
      
      // Hacemos scroll al elemento con un pequeño delay para permitir la renderización
      // Pero con offset para que quede bien visible y no justo en el borde superior
      setTimeout(() => {
        if (cineRefs.current[cineIndex]) {
          const element = cineRefs.current[cineIndex];
          const headerRect = element.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const targetPosition = scrollTop + headerRect.top - 80; // 80px de margen superior
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }, 100); // Mayor delay para asegurar que la UI se haya actualizado
    }
  };
  
  // Manejar expansión/colapso de funciones para un día específico dentro de un cine
  const toggleDiaExpandido = (cineIndex, diaIndex) => {
    const key = `${cineIndex}-${diaIndex}`;
    const isCurrentlyExpanded = !!diasExpandidos[key];
    
    if (isCurrentlyExpanded) {
      // Si está expandido, simplemente lo cerramos
      setDiasExpandidos(prev => ({
        ...prev,
        [key]: false
      }));
    } else {
      // Si no está expandido, lo abrimos y hacemos scroll
      setDiasExpandidos(prev => ({
        ...prev,
        [key]: true
      }));
      
      // Hacemos scroll al elemento con un pequeño delay para permitir la renderización
      // Pero con offset para que quede bien visible
      setTimeout(() => {
        if (diaRefs.current[key]) {
          const element = diaRefs.current[key];
          const headerRect = element.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const targetPosition = scrollTop + headerRect.top - 100; // 100px de margen superior
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }, 100); // Mayor delay para asegurar que la UI se haya actualizado
    }
  };
  
  // Formatear fecha corta (para funciones)
  const formatearFechaCorta = (fechaStr) => {
    try {
      const fecha = new Date(fechaStr);
      if (isNaN(fecha.getTime())) return '';
      
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Normalizar a medianoche para mejor comparación
      
      const manana = new Date(hoy);
      manana.setDate(hoy.getDate() + 1);
      
      // Comparar sólo las fechas sin hora
      const fechaSinHora = new Date(fecha);
      fechaSinHora.setHours(0, 0, 0, 0);
      
      const esHoy = fechaSinHora.getTime() === hoy.getTime();
      const esMañana = fechaSinHora.getTime() === manana.getTime();
      
      if (esHoy) return 'Hoy';
      if (esMañana) return 'Mañana';
      
      // Obtener el nombre del día según el día de la semana (0: domingo, 1: lunes, etc.)
      const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      return `${nombresDias[fecha.getDay()]} ${fecha.getDate()}`;
    } catch (error) {
      console.error('Error al formatear fecha corta:', error);
      return '';
    }
  };
  
  // Obtener nombre del día correcto a partir de una fecha
  const obtenerNombreDiaCorrecto = (funcion) => {
    if (!funcion || !funcion.fecha) return '';
    
    // Si tiene una fecha válida, calcular el nombre del día correcto
    try {
      const fecha = new Date(funcion.fecha);
      if (isNaN(fecha.getTime())) return funcion.nombreDia || '';
      
      const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      return nombresDias[fecha.getDay()];
    } catch (error) {
      console.error('Error al obtener nombre del día:', error);
      return funcion.nombreDia || '';
    }
  };

  // Al abrir el popup de horarios, resetear los estados de expansión
  const abrirHorariosPopup = () => {
    setCinesExpandidos({});
    setDiasExpandidos({});
    setMostrarHorariosPopup(true);
  };
  
  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 bg-primary-700 text-white">
        <h3 className="text-xl font-bold flex items-center">
          <FaQuoteLeft className="mr-2 text-secondary-300" />
          Recomendación Personalizada
        </h3>
        <p className="mt-2 text-lg">{respuesta}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* Evento */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold flex items-center">
              {getTipoIcon(evento?.tipo)}
              <span className="ml-2">{getNombreEvento()}</span>
            </h4>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
              {evento?.tipo || 'teatro'}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-gray-700">
              <FaCalendarAlt className="mr-2 text-sm" />
              <span>{formatearFecha(evento?.fecha) || 'Consultar disponibilidad'}</span>
            </div>
            
            <div className="flex items-center text-gray-700">
              <FaClock className="mr-2 text-sm" />
              <span>{evento?.hora || 'Consultar horarios'}</span>
            </div>
            
            <div className="flex items-center text-gray-700">
              <FaMapMarkerAlt className="mr-2 text-sm" />
              <span>{getLugarEvento()}</span>
            </div>
            
            {/* Botón para ver horarios - Comprobación mejorada para ambos formatos */}
            {(
              (evento?.cines && Array.isArray(evento.cines) && evento.cines.length > 0) || 
              (evento?.funciones && Array.isArray(evento.funciones) && evento.funciones.length > 0)
            ) ? (
              <button 
                onClick={() => abrirHorariosPopup()}
                className="mt-2 flex items-center text-primary-600 hover:text-primary-800"
              >
                <FaTicketAlt className="mr-1" />
                <span>Ver horarios disponibles</span>
              </button>
            ) : evento?.mensaje ? (
              <button 
                onClick={() => abrirHorariosPopup()}
                className="mt-2 flex items-center text-yellow-600 hover:text-yellow-800"
              >
                <FaTicketAlt className="mr-1" />
                <span>Ver información de horarios</span>
              </button>
            ) : null}
          </div>
          
          <div className="mt-4">
            <button 
              className="text-primary-600 hover:text-primary-800 flex items-center font-medium"
              onClick={() => setMostrarDetallesEvento(!mostrarDetallesEvento)}
            >
              {mostrarDetallesEvento ? (
                <>
                  <FaAngleUp className="mr-1" />
                  Ocultar detalles
                </>
              ) : (
                <>
                  <FaAngleDown className="mr-1" />
                  Ver detalles
                </>
              )}
            </button>
            
            {mostrarDetallesEvento && (
              <div className="mt-3 bg-white p-3 rounded border border-gray-100">
                <p className="text-sm text-gray-700 mb-2">{evento?.descripcion || 'Disfruta de esta obra en uno de los mejores teatros de Buenos Aires.'}</p>
                <p className="text-sm font-medium">Ubicación: {getDireccionEvento()}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Restaurante */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold flex items-center">
              <FaUtensils className="mr-2 text-secondary-500" />
              <span>{restaurante?.name || 'Restaurante'}</span>
            </h4>
            <div className="flex items-center">
              <FaStar className="text-yellow-400" />
              <span className="ml-1 text-sm font-medium">{restaurante?.rating || '4.5'}</span>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex flex-wrap gap-1 mb-2">
              {getCategorias().length > 0 ? (
                getCategorias().map((categoria, i) => (
                <span key={i} className="px-2 py-1 bg-secondary-100 text-secondary-800 text-xs font-medium rounded">
                  {categoria}
                </span>
                ))
              ) : (
                <>
                  <span className="px-2 py-1 bg-secondary-100 text-secondary-800 text-xs font-medium rounded">
                    Restaurante
                  </span>
                  {respuesta.toLowerCase().includes('parrilla') && (
                    <span className="px-2 py-1 bg-secondary-100 text-secondary-800 text-xs font-medium rounded">
                      Parrilla
                    </span>
                  )}
                </>
              )}
            </div>
            
            <div className="flex items-center text-gray-700">
              <FaMapMarkerAlt className="mr-2 text-sm" />
              <span>{getDireccionRestaurante()}</span>
            </div>
            
            {/* Botón para ver reseñas */}
            <button 
              onClick={() => setMostrarResenasPopup(true)}
              className="mt-2 flex items-center text-primary-600 hover:text-primary-800"
            >
              <FaComments className="mr-1" />
              <span>Ver opiniones</span>
            </button>
          </div>
          
          <div className="mt-2">
            <button 
              className="text-primary-600 hover:text-primary-800 flex items-center font-medium"
              onClick={() => setMostrarDetallesRestaurante(!mostrarDetallesRestaurante)}
            >
              {mostrarDetallesRestaurante ? (
                <>
                  <FaAngleUp className="mr-1" />
                  Ocultar detalles
                </>
              ) : (
                <>
                  <FaAngleDown className="mr-1" />
                  Ver detalles
                </>
              )}
            </button>
            
            {mostrarDetallesRestaurante && (
              <div className="mt-3 bg-white p-3 rounded border border-gray-100">
                <div className="mb-3">
                  <h5 className="text-sm font-semibold mb-1">Atmósfera:</h5>
                  <p className="text-sm text-gray-700">{restaurante?.about?.atmósfera || 'Ambiente acogedor y tradicional. Ideal para disfrutar de una cena agradable en Buenos Aires.'}</p>
                </div>
                
                {(restaurante?.about?.servicios && restaurante.about.servicios.length > 0) ? (
                  <div className="mb-3">
                    <h5 className="text-sm font-semibold mb-1">Servicios:</h5>
                    <div className="flex flex-wrap gap-1">
                      {restaurante.about.servicios.map((servicio, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {servicio}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-3">
                    <h5 className="text-sm font-semibold mb-1">Servicios:</h5>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        Comida para llevar
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        Delivery
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        Cena
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Popup para horarios */}
      {mostrarHorariosPopup && (
        <Popup 
          titulo={`Horarios de ${getNombreEvento()}`}
          contenido={renderHorariosContenido()}
          onClose={() => setMostrarHorariosPopup(false)}
        />
      )}
      
      {/* Popup para reseñas */}
      {mostrarResenasPopup && (
        <Popup 
          titulo={`Opiniones sobre ${restaurante?.name || 'el restaurante'}`}
          contenido={renderResenasContenido()}
          onClose={() => setMostrarResenasPopup(false)}
        />
      )}
    </div>
  );
};

export default Recomendacion; 