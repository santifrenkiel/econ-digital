import { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

const PromptForm = ({ onSubmit, disabled = false }) => {
  const [mensaje, setMensaje] = useState('');
  
  const ejemplos = [
    'Quiero una salida divertida con amigos',
    'Busco un plan romántico para este fin de semana',
    'Necesito una salida cultural y tranquila',
    'Me gustaría ver algo de teatro y comer bien cerca',
    'Recomiéndame un concierto y donde cenar después'
  ];
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (mensaje.trim() && !disabled) {
      onSubmit(mensaje);
    }
  };
  
  const setEjemplo = (ejemplo) => {
    setMensaje(ejemplo);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label 
            htmlFor="mensaje" 
            className="block text-gray-700 font-medium mb-2"
          >
            Cuéntanos qué te gustaría hacer:
          </label>
          <textarea
            id="mensaje"
            className="input h-24 resize-none"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Ej: Quiero una salida divertida con amigos..."
            disabled={disabled}
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className={`btn ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'btn-primary'} flex items-center`}
            disabled={disabled || !mensaje.trim()}
          >
            <span>Obtener Recomendación</span>
            <FaPaperPlane className="ml-2" />
          </button>
        </div>
      </form>
      
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">Ejemplos de lo que puedes preguntar:</p>
        <div className="flex flex-wrap gap-2">
          {ejemplos.map((ejemplo, index) => (
            <button
              key={index}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-700 transition-colors"
              onClick={() => setEjemplo(ejemplo)}
              disabled={disabled}
            >
              {ejemplo}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromptForm; 