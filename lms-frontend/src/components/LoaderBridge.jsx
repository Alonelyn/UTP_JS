import { useEffect } from 'react';
import { useLoader } from '../context/LoaderContext';
import { conectarLoader } from '../api/axios';

function LoaderBridge() {
  const loader = useLoader();

  useEffect(() => {
    conectarLoader(loader);
  }, [loader]);

  return null;
}

export default LoaderBridge;