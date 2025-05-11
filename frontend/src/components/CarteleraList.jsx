import { FaFilm, FaTheaterMasks, FaMusic, FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import CarteleraCard from './CarteleraCard';

const CarteleraList = ({ eventos = [] }) => {
  // Obtener el icono según el tipo de evento
  const getTipoIcon = (tipo) => {
    switch (tipo.toLowerCase()) {
      case 'cine':
        return <FaFilm className="text-blue-500" />;
      case 'teatro':
        return <FaTheaterMasks className="text-purple-500" />;
      case 'música':
        return <FaMusic className="text-green-500" />;
      default:
        return <FaCalendarAlt className="text-gray-500" />;
    }
  };
  
  // Filtrar las obras de teatro que sean streaming
  const eventosFiltrados = eventos.filter(evento => {
    // Si es teatro y el lugar contiene "STREAMING" o "streaming", excluirlo
    if (evento.tipo === 'teatro' && 
        (evento.lugar?.toUpperCase().includes('STREAMING') || 
         evento.ubicacion?.toUpperCase().includes('STREAMING') ||
         evento.descripcion?.toUpperCase().includes('STREAMING ON DEMAND'))) {
      return false;
    }
    return true;
  });
  
  // Si no hay eventos, mostrar mensaje
  if (!eventosFiltrados || eventosFiltrados.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay eventos disponibles en esta categoría.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {eventosFiltrados.map((evento, index) => (
        <CarteleraCard 
          key={`${evento.tipo}-${evento.nombre}-${index}`}
          evento={evento}
          icon={getTipoIcon(evento.tipo)}
        />
      ))}
    </div>
  );
};

export default CarteleraList; 