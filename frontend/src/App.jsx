import { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import axios from 'axios';

// Componentes
import Header from './components/Header';
import CarteleraList from './components/CarteleraList';
import PromptForm from './components/PromptForm';
import Recomendacion from './components/Recomendacion';
import Loader from './components/Loader';
import Footer from './components/Footer';
import RestaurantesList from './components/RestaurantesList';

// Configuración de Axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
axios.defaults.baseURL = API_BASE_URL;

function App() {
  // Estados
  const [cartelera, setCartelera] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [restaurantes, setRestaurantes] = useState([]);
  const [restaurantesFiltrados, setRestaurantesFiltrados] = useState([]);
  const [loadingCartelera, setLoadingCartelera] = useState(true);
  const [loadingRestaurantes, setLoadingRestaurantes] = useState(true);
  const [error, setError] = useState(null);
  const [recomendacion, setRecomendacion] = useState(null);
  const [procesandoRecomendacion, setProcesandoRecomendacion] = useState(false);
  
  // Obtener la cartelera al cargar la aplicación
  useEffect(() => {
    const obtenerCartelera = async () => {
      try {
        setLoadingCartelera(true);
        const response = await axios.get('/cartelera');
        setCartelera(response.data);
        setEventosFiltrados(response.data);
        setError(null);
      } catch (err) {
        console.error('Error al obtener la cartelera:', err);
        setError('No se pudo obtener la cartelera de eventos. Intente nuevamente más tarde.');
      } finally {
        setLoadingCartelera(false);
      }
    };
    
    obtenerCartelera();
  }, []);

  // Obtener los restaurantes al cargar la aplicación
  useEffect(() => {
    const obtenerRestaurantes = async () => {
      try {
        setLoadingRestaurantes(true);
        const response = await axios.get('/reviews');
        setRestaurantes(response.data);
        setRestaurantesFiltrados(response.data);
        setError(null);
      } catch (err) {
        console.error('Error al obtener los restaurantes:', err);
        setError('No se pudo obtener las opciones gastronómicas. Intente nuevamente más tarde.');
      } finally {
        setLoadingRestaurantes(false);
      }
    };
    
    obtenerRestaurantes();
  }, []);
  
  // Filtrar eventos por tipo
  const filtrarEventos = (tipo) => {
    if (tipo === 'todos') {
      setEventosFiltrados(cartelera);
    } else {
      const filtrados = cartelera.filter(evento => evento.tipo === tipo);
      setEventosFiltrados(filtrados);
    }
  };

  // Filtrar restaurantes por categoría
  const filtrarRestaurantes = (categoria) => {
    if (categoria === 'todos') {
      setRestaurantesFiltrados(restaurantes);
    } else {
      const filtrados = restaurantes.filter(restaurante => 
        restaurante.categories && restaurante.categories.some(cat => 
          cat.toLowerCase() === categoria.toLowerCase()
        )
      );
      setRestaurantesFiltrados(filtrados);
    }
  };
  
  // Enviar mensaje para obtener recomendación
  const solicitarRecomendacion = async (mensaje) => {
    if (!mensaje.trim()) return;
    
    try {
      setProcesandoRecomendacion(true);
      setRecomendacion(null);
      
      const response = await axios.post('/recomendar', { mensaje });
      setRecomendacion(response.data);
    } catch (err) {
      console.error('Error al obtener recomendación:', err);
      setError('No se pudo obtener una recomendación. Intente nuevamente más tarde.');
    } finally {
      setProcesandoRecomendacion(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Recomendaciones de Salidas en Buenos Aires</h1>
        
        <section className="mb-12">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-center">¿Qué te gustaría hacer hoy?</h2>
            <PromptForm onSubmit={solicitarRecomendacion} disabled={procesandoRecomendacion} />
          </div>
          
          {procesandoRecomendacion && (
            <div className="mt-8 text-center">
              <Loader message="Generando recomendación personalizada..." />
            </div>
          )}
          
          {recomendacion && <Recomendacion data={recomendacion} />}
          
          {error && (
            <div className="mt-8 p-4 bg-red-100 text-red-700 rounded-md max-w-2xl mx-auto">
              <p>{error}</p>
            </div>
          )}
        </section>
        
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">Explora la Cartelera</h2>
          
          {loadingCartelera ? (
            <div className="text-center py-12">
              <Loader message="Cargando eventos..." />
            </div>
          ) : (
            <Tabs className="max-w-6xl mx-auto">
              <TabList className="flex flex-wrap justify-center mb-8 border-b border-gray-200">
                <Tab className="px-4 py-2 font-medium cursor-pointer" selectedClassName="text-primary-600 border-b-2 border-primary-600" onClick={() => filtrarEventos('todos')}>Todos</Tab>
                <Tab className="px-4 py-2 font-medium cursor-pointer" selectedClassName="text-primary-600 border-b-2 border-primary-600" onClick={() => filtrarEventos('cine')}>Cine</Tab>
                <Tab className="px-4 py-2 font-medium cursor-pointer" selectedClassName="text-primary-600 border-b-2 border-primary-600" onClick={() => filtrarEventos('teatro')}>Teatro</Tab>
                <Tab className="px-4 py-2 font-medium cursor-pointer" selectedClassName="text-primary-600 border-b-2 border-primary-600" onClick={() => filtrarEventos('música')}>Música</Tab>
              </TabList>
              
              <TabPanel>
                <CarteleraList eventos={eventosFiltrados} />
              </TabPanel>
              <TabPanel>
                <CarteleraList eventos={cartelera.filter(e => e.tipo === 'cine')} />
              </TabPanel>
              <TabPanel>
                <CarteleraList eventos={cartelera.filter(e => e.tipo === 'teatro')} />
              </TabPanel>
              <TabPanel>
                <CarteleraList eventos={cartelera.filter(e => e.tipo === 'música')} />
              </TabPanel>
            </Tabs>
          )}
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">Explora las opciones gastronómicas</h2>
          
          {loadingRestaurantes ? (
            <div className="text-center py-12">
              <Loader message="Cargando restaurantes..." />
            </div>
          ) : (
            <Tabs className="max-w-6xl mx-auto">
              <TabList className="flex flex-wrap justify-center mb-8 border-b border-gray-200">
                <Tab className="px-4 py-2 font-medium cursor-pointer" selectedClassName="text-primary-600 border-b-2 border-primary-600" onClick={() => filtrarRestaurantes('todos')}>Todos</Tab>
                <Tab className="px-4 py-2 font-medium cursor-pointer" selectedClassName="text-primary-600 border-b-2 border-primary-600" onClick={() => filtrarRestaurantes('parrilla')}>Parrilla</Tab>
                <Tab className="px-4 py-2 font-medium cursor-pointer" selectedClassName="text-primary-600 border-b-2 border-primary-600" onClick={() => filtrarRestaurantes('bodegón')}>Bodegón</Tab>
                <Tab className="px-4 py-2 font-medium cursor-pointer" selectedClassName="text-primary-600 border-b-2 border-primary-600" onClick={() => filtrarRestaurantes('restaurante')}>Restaurante</Tab>
                <Tab className="px-4 py-2 font-medium cursor-pointer" selectedClassName="text-primary-600 border-b-2 border-primary-600" onClick={() => filtrarRestaurantes('bar')}>Bar</Tab>
              </TabList>
              
              <TabPanel>
                <RestaurantesList restaurantes={restaurantesFiltrados} />
              </TabPanel>
              <TabPanel>
                <RestaurantesList restaurantes={restaurantes.filter(r => r.categories && r.categories.some(cat => cat.toLowerCase() === 'parrilla'))} />
              </TabPanel>
              <TabPanel>
                <RestaurantesList restaurantes={restaurantes.filter(r => r.categories && r.categories.some(cat => cat.toLowerCase() === 'bodegón'))} />
              </TabPanel>
              <TabPanel>
                <RestaurantesList restaurantes={restaurantes.filter(r => r.categories && r.categories.some(cat => cat.toLowerCase() === 'restaurante'))} />
              </TabPanel>
              <TabPanel>
                <RestaurantesList restaurantes={restaurantes.filter(r => r.categories && r.categories.some(cat => cat.toLowerCase() === 'bar'))} />
              </TabPanel>
            </Tabs>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

export default App; 