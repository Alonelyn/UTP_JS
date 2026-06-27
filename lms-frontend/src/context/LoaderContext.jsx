import { createContext, useContext, useState } from 'react';
import Loader from '../components/Loader';

const LoaderContext = createContext();

export function LoaderProvider({ children }) {
  const [cargando, setCargando] = useState(false);
  const [contador, setContador] = useState(0);

  const iniciarCarga = () => {
    setContador((prev) => prev + 1);
    setCargando(true);
  };

  const finalizarCarga = () => {
    setContador((prev) => {
      const nuevo = Math.max(prev - 1, 0);

      if (nuevo === 0) {
        setCargando(false);
      }

      return nuevo;
    });
  };

  return (
    <LoaderContext.Provider value={{ iniciarCarga, finalizarCarga }}>
      {children}
      {cargando && <Loader texto="Cargando información..." />}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  return useContext(LoaderContext);
}