import { FaTicketAlt, FaUtensils } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="bg-primary-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <FaTicketAlt className="text-xl text-secondary-400" />
            <FaUtensils className="text-xl text-secondary-400" />
          </div>
          <h1 className="text-2xl font-bold m-0">Salidas BA</h1>
        </div>
        
        <nav>
          <ul className="flex space-x-6">
            <li>
              <a href="#" className="hover:text-secondary-300 transition-colors">Inicio</a>
            </li>
            <li>
              <a href="#recomendaciones" className="hover:text-secondary-300 transition-colors">Recomendaciones</a>
            </li>
            <li>
              <a href="#cartelera" className="hover:text-secondary-300 transition-colors">Cartelera</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 