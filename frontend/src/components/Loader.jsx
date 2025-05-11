import { Oval } from 'react-loader-spinner';

const Loader = ({ message = 'Cargando...', size = 40 }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Oval
        height={size}
        width={size}
        color="#0ea5e9"
        secondaryColor="#e0f2fe"
        strokeWidth={4}
        strokeWidthSecondary={4}
        visible={true}
        ariaLabel="cargando"
      />
      {message && (
        <p className="mt-3 text-gray-600 font-medium">{message}</p>
      )}
    </div>
  );
};

export default Loader; 