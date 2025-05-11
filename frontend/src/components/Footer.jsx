import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold mb-2">Salidas BA</h3>
            <p className="text-sm text-gray-400">
              Recomendaciones personalizadas de eventos culturales y gastronómicos en Buenos Aires
            </p>
          </div>
          
          <div className="flex space-x-4">
            <a href="#" aria-label="GitHub" className="text-gray-400 hover:text-white transition-colors">
              <FaGithub className="text-xl" />
            </a>
            <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-white transition-colors">
              <FaLinkedin className="text-xl" />
            </a>
            <a href="mailto:info@ejemplo.com" aria-label="Email" className="text-gray-400 hover:text-white transition-colors">
              <FaEnvelope className="text-xl" />
            </a>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Salidas BA. Todos los derechos reservados.</p>
          <p className="mt-1">Desarrollado para proyecto universitario.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 