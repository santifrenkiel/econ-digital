import { FaUtensils, FaBeer, FaPizzaSlice, FaHamburger, FaStar, FaMapMarkerAlt, FaInfoCircle, FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { useState } from 'react';

const RestaurantesList = ({ restaurantes = [] }) => {
  // Obtener el icono según la categoría del restaurante
  const getCategoriaIcon = (categorias) => {
    if (!categorias || categorias.length === 0) {
      return <FaUtensils className="text-gray-500" />;
    }
    
    const categoria = categorias[0].toLowerCase();
    switch (true) {
      case categoria.includes('bar'):
        return <FaBeer className="text-amber-500" />;
      case categoria.includes('parrilla'):
        return <FaUtensils className="text-red-500" />;
      case categoria.includes('pizza'):
        return <FaPizzaSlice className="text-yellow-500" />;
      case categoria.includes('hamburgues'):
        return <FaHamburger className="text-orange-500" />;
      default:
        return <FaUtensils className="text-green-500" />;
    }
  };
  
  // Si no hay restaurantes, mostrar mensaje
  if (!restaurantes || restaurantes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay restaurantes disponibles en esta categoría.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurantes.map((restaurante, index) => (
        <RestauranteCard 
          key={`${restaurante.name}-${index}`}
          restaurante={restaurante}
          icon={getCategoriaIcon(restaurante.categories)}
        />
      ))}
    </div>
  );
};

const RestauranteCard = ({ restaurante, icon }) => {
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  
  // Obtener el color de fondo según la categoría
  const getBackgroundColor = (categorias) => {
    if (!categorias || categorias.length === 0) return 'bg-gray-50';
    
    const categoria = categorias[0].toLowerCase();
    switch (true) {
      case categoria.includes('bar'):
        return 'bg-amber-50';
      case categoria.includes('parrilla'):
        return 'bg-red-50';
      case categoria.includes('bodegón'):
        return 'bg-orange-50';
      case categoria.includes('restaurant'):
      case categoria.includes('restaurante'):
        return 'bg-green-50';
      default:
        return 'bg-blue-50';
    }
  };
  
  // Obtener el color del borde según la categoría
  const getBorderColor = (categorias) => {
    if (!categorias || categorias.length === 0) return 'border-gray-200';
    
    const categoria = categorias[0].toLowerCase();
    switch (true) {
      case categoria.includes('bar'):
        return 'border-amber-200';
      case categoria.includes('parrilla'):
        return 'border-red-200';
      case categoria.includes('bodegón'):
        return 'border-orange-200';
      case categoria.includes('restaurant'):
      case categoria.includes('restaurante'):
        return 'border-green-200';
      default:
        return 'border-blue-200';
    }
  };
  
  return (
    <div className={`card p-4 rounded-lg ${getBackgroundColor(restaurante.categories)} border ${getBorderColor(restaurante.categories)} transition-all duration-300 hover:shadow-xl`}>
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-bold mb-2 flex-grow">{restaurante.name}</h3>
        <div className="ml-2 mt-1 flex items-center">
          {icon}
          {restaurante.rating && (
            <div className="ml-2 flex items-center">
              <FaStar className="text-yellow-400" />
              <span className="ml-1 text-sm font-medium">{restaurante.rating}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-2 mt-3">
        {restaurante.categories && (
          <div className="flex flex-wrap gap-1 mb-2">
            {restaurante.categories.map((categoria, i) => (
              <span key={i} className="px-2 py-1 bg-white bg-opacity-50 text-gray-700 text-xs font-medium rounded">
                {categoria}
              </span>
            ))}
          </div>
        )}
        
        {restaurante.address && (
          <div className="flex items-center text-gray-600">
            <FaMapMarkerAlt className="mr-2 text-sm" />
            <span>{restaurante.address}</span>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <button 
          className="flex items-center text-primary-600 hover:text-primary-800 transition-colors font-medium"
          onClick={() => setMostrarDetalles(!mostrarDetalles)}
        >
          {mostrarDetalles ? (
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
        
        {mostrarDetalles && (
          <div className="mt-3 text-sm text-gray-700 bg-white p-3 rounded-md">
            {restaurante.about && restaurante.about.atmósfera && (
              <div className="mb-2">
                <span className="font-medium">Atmósfera:</span> {restaurante.about.atmósfera}
              </div>
            )}
            
            {restaurante.about && restaurante.about.servicios && (
              <div className="mb-2">
                <span className="font-medium">Servicios:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {restaurante.about.servicios.map((servicio, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {servicio}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {restaurante.detailed_reviews && restaurante.detailed_reviews.length > 0 && (
              <div>
                <span className="font-medium">Opiniones:</span>
                <div className="space-y-2 mt-2">
                  {restaurante.detailed_reviews.slice(0, 2).map((review, i) => (
                    <div key={i} className="border-l-2 border-gray-200 pl-2">
                      <div className="flex items-center">
                        <span className="font-medium text-xs">{review.author}</span>
                        <div className="ml-2 flex items-center">
                          <FaStar className="text-yellow-400 text-xs" />
                          <span className="ml-1 text-xs">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantesList; 