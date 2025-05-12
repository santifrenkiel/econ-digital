import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaInfoCircle, FaTheaterMasks, FaTicketAlt, FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';

const CarteleraCard = ({ evento, icon }) => {
  const [mostrarDescripcion, setMostrarDescripcion] = useState(false);
  const [mostrarFuncionesPopup, setMostrarFuncionesPopup] = useState(false);
  const [cinesExpandidos, setCinesExpandidos] = useState({});
  const [diasExpandidos, setDiasExpandidos] = useState({});
  
  // Referencias para mantener el scroll
  const cineRefs = useRef({});
  const diaRefs = useRef({});
  const popupRef = useRef(null);
  
  // Manejar expansión/colapso de funciones para un cine específico
  const toggleCineExpandido = (cineIndex) => {
    setCinesExpandidos(prev => ({
      ...prev,
      [cineIndex]: !prev[cineIndex]
    }));
  };
  
  // Manejar expansión/colapso de funciones para un día específico dentro de un cine
  const toggleDiaExpandido = (cineIndex, diaIndex) => {
    const key = `${cineIndex}-${diaIndex}`;
    setDiasExpandidos(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Formatear fecha para mostrar en formato legible
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'Consultar horarios';
    
    try {
      const fecha = new Date(fechaStr);
      // Verificar si la fecha es válida
      if (isNaN(fecha.getTime())) {
        return 'Consultar horarios';
      }
      return fecha.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Consultar horarios';
    }
  };
  
  // Formatear fecha más corta (para funciones)
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
  
  // Obtener el color de fondo según el tipo
  const getBackgroundColor = (tipo) => {
    switch (tipo.toLowerCase()) {
      case 'cine':
        return 'bg-blue-50';
      case 'teatro':
        return 'bg-purple-50';
      case 'música':
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
    }
  };
  
  // Obtener el color del borde según el tipo
  const getBorderColor = (tipo) => {
    switch (tipo.toLowerCase()) {
      case 'cine':
        return 'border-blue-200';
      case 'teatro':
        return 'border-purple-200';
      case 'música':
        return 'border-green-200';
      default:
        return 'border-gray-200';
    }
  };
  
  // Verificar si el evento tiene funciones tradicionales
  const tieneFunciones = evento.funciones && evento.funciones.length > 0;
  
  // Verificar si el evento tiene información de múltiples cines (para películas)
  const tieneCines = evento.cines && Array.isArray(evento.cines) && evento.cines.length > 0;
  
  // Verificar si debe mostrarse el botón "Ver funciones"
  const mostrarBotonFunciones = tieneFunciones || tieneCines || evento.tipo === 'cine' || evento.tipo === 'teatro';
  
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
  
  // Agrupar funciones por fecha para una mejor visualización
  const agruparPorFecha = () => {
    if (!tieneFunciones) return [];
    
    // Crear un mapa para agrupar las funciones por fecha
    const funcionesPorFecha = {};
    evento.funciones.forEach(funcion => {
      if (!funcionesPorFecha[funcion.fecha]) {
        funcionesPorFecha[funcion.fecha] = [];
      }
      funcionesPorFecha[funcion.fecha].push(funcion);
    });
    
    // Convertir a array y ordenar por fecha
    const diasOrdenados = Object.keys(funcionesPorFecha)
      .sort((a, b) => new Date(a) - new Date(b))
      .map(fecha => {
        // Obtener todas las funciones para esta fecha
        const funcionesParaFecha = funcionesPorFecha[fecha];
        
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
          // Usar la función para obtener el nombre del día correcto
          nombreDia: obtenerNombreDiaCorrecto({ fecha }) || formatearFechaCorta(fecha),
          funciones: funcionesOrdenadas
        };
      });
    
    return diasOrdenados;
  };
  
  const funcionesAgrupadas = agruparPorFecha();
  
  // Renderizar contenido de funciones para el popup
  const renderFuncionesContenido = () => {
    // Si es una película con múltiples cines
    if (tieneCines) {
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
                  // Usar la función para obtener el nombre del día correcto
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
                      <h4 className="font-semibold text-gray-800">{cine.nombre || 'Cine'}</h4>
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
    
    // Si es un evento con funciones tradicionales
    if (tieneFunciones) {
      // Para funciones tradicionales, también usamos el mismo enfoque de colapso
      return (
        <div className="space-y-4">
          <p className="font-medium text-gray-700 mb-2">Selecciona la función a la que deseas asistir:</p>
          <div className="space-y-4">
            {funcionesAgrupadas.map((grupo, index) => {
              const diaExpandido = !!diasExpandidos[`grupo-${index}`];
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="p-3 bg-gray-50 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleDiaExpandido(`grupo`, index)}
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
                            <span>{funcion.hora}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-sm text-gray-500 mt-4">* Los horarios pueden estar sujetos a cambios. Te recomendamos verificar en el sitio oficial.</p>
        </div>
      );
    }
    
    // Si no hay funciones disponibles
    return (
      <div className="p-5 text-center">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
          <p className="text-blue-800 mb-1 font-medium">Información</p>
          <p className="text-gray-700">No hay horarios disponibles para este evento actualmente.</p>
        </div>
        <p className="text-gray-600 mt-3">
          Puedes intentar buscar información en:
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <a 
            href={`https://www.google.com/search?q=${evento.tipo}+${evento.nombre}+horarios+Buenos+Aires`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Buscar en Google
          </a>
          {evento.tipo === 'cine' && (
            <a 
              href="https://www.cinesargentinos.com.ar/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-secondary-600 text-white rounded hover:bg-secondary-700"
            >
              Cines Argentinos
            </a>
          )}
        </div>
      </div>
    );
  };
  
  // Obtener el lugar formateado del evento
  const getLugarFormateado = () => {
    // Si es un evento de cine con lugar genérico, mostrar "Consultar cines"
    if (evento.tipo === 'cine' && (evento.lugar === 'Multicines Buenos Aires' || !evento.lugar)) {
      return 'Consultar cines';
    }
    return evento.lugar || 'Ubicación no especificada';
  };
  
  // Al abrir el popup, resetear los estados de expansión
  const abrirPopupFunciones = () => {
    setCinesExpandidos({});
    setDiasExpandidos({});
    setMostrarFuncionesPopup(true);
  };
  
  return (
    <div className={`card ${getBackgroundColor(evento.tipo)} border ${getBorderColor(evento.tipo)} transition-all duration-300 hover:shadow-xl`}>
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-bold mb-2 flex-grow">{evento.nombre}</h3>
        <div className="ml-2 mt-1">
          {icon}
        </div>
      </div>
      
      <div className="space-y-2 mt-3">
        {/* Teatro y dirección */}
        <div className="flex items-center text-gray-800 font-medium">
          <FaTheaterMasks className="mr-2 text-sm" />
          <span>{getLugarFormateado()}</span>
        </div>
        
        {evento.direccion && (
          <div className="flex items-start text-gray-600 ml-6">
            <FaMapMarkerAlt className="mr-2 text-sm mt-1 flex-shrink-0" />
            <span>{evento.direccion}</span>
          </div>
        )}
        
        {/* Información básica de fecha/hora */}
        <div className="flex items-center text-gray-600">
          <FaCalendarAlt className="mr-2 text-sm" />
          <span>{formatearFecha(evento.fecha) || 'Consultar horarios'}</span>
        </div>
        
        {evento.hora && (
          <div className="flex items-center text-gray-600">
            <FaClock className="mr-2 text-sm" />
            <span>{evento.hora}</span>
          </div>
        )}
        
        {/* Botón para ver funciones */}
        {mostrarBotonFunciones && (
          <button 
            onClick={abrirPopupFunciones}
            className="mt-2 flex items-center text-primary-600 hover:text-primary-800"
          >
            <FaTicketAlt className="mr-1" />
            <span>Ver funciones</span>
          </button>
        )}
      </div>
      
      <div className="mt-4">
        <button 
          className="flex items-center text-primary-600 hover:text-primary-800 transition-colors font-medium"
          onClick={() => setMostrarDescripcion(!mostrarDescripcion)}
        >
          <FaInfoCircle className="mr-1" />
          {mostrarDescripcion ? 'Ocultar detalles' : 'Mostrar detalles'}
        </button>
        
        {mostrarDescripcion && (
          <div className="mt-3 text-sm text-gray-700 bg-white p-3 rounded-md">
            <p>{evento.descripcion}</p>
            {evento.ubicacion && evento.ubicacion !== evento.lugar && (
              <p className="mt-2 font-medium">Ubicación: {evento.ubicacion}</p>
            )}
          </div>
        )}
      </div>
      
      {/* Popup para funciones */}
      {mostrarFuncionesPopup && (
        <Popup 
          titulo={`Funciones de ${evento.nombre}`}
          contenido={renderFuncionesContenido()}
          onClose={() => setMostrarFuncionesPopup(false)}
        />
      )}
    </div>
  );
};

export default CarteleraCard; 