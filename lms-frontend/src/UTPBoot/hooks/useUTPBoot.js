import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import UTPBootService from '../services/utpboot.service';
import {
  obtenerNombreUsuario,
  obtenerSaludo
} from '../utils/greetings';

const ESTADOS = {
  DISPONIBLE: {
    clave: 'disponible',
    texto: 'Disponible',
    icono: '🟢'
  },
  ANALIZANDO: {
    clave: 'analizando',
    texto: 'Analizando la lección',
    icono: '🟡'
  },
  ACOMPANANDO: {
    clave: 'acompanando',
    texto: 'Acompañándote',
    icono: '🔵'
  },
  ERROR: {
    clave: 'error',
    texto: 'Conexión limitada',
    icono: '🔴'
  }
};

function useUTPBoot({
  usuario,
  curso,
  leccion,
  progreso
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [estado, setEstado] = useState(ESTADOS.DISPONIBLE);
  const [analisis, setAnalisis] = useState(null);
  const [cargandoAnalisis, setCargandoAnalisis] = useState(false);
  const [error, setError] = useState('');
  const [segundosSesion, setSegundosSesion] = useState(0);
  const [seccionActiva, setSeccionActiva] = useState('bienvenida');
  const [mensajes, setMensajes] = useState([]);
  const [cargandoChat, setCargandoChat] = useState(false);

  const saludo = useMemo(() => obtenerSaludo(), []);
  const nombreUsuario = useMemo(
    () => obtenerNombreUsuario(usuario),
    [usuario]
  );

  useEffect(() => {
    setSegundosSesion(0);
    setAnalisis(null);
    setError('');
    setMensajes([]);
    setSeccionActiva('bienvenida');
    setEstado(ESTADOS.ACOMPANANDO);
  }, [leccion?.id]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setSegundosSesion((anterior) => anterior + 1);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [leccion?.id]);

  const tiempoSesion = useMemo(() => {
    const minutos = Math.floor(segundosSesion / 60);
    const segundos = segundosSesion % 60;

    return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(
      2,
      '0'
    )}`;
  }, [segundosSesion]);

  const porcentaje = Number(progreso?.porcentaje || 0);

  const bienvenida = useMemo(() => {
    if (!curso || !leccion) {
      return 'Estoy preparando el entorno de aprendizaje.';
    }

    if (porcentaje >= 100) {
      return `Has completado ${curso.titulo}. Puedo ayudarte a repasar esta lección o planificar tu siguiente curso.`;
    }

    if (porcentaje >= 50) {
      return `Ya avanzaste más de la mitad de ${curso.titulo}. Ahora continuaremos con ${leccion.titulo}.`;
    }

    return `Hoy trabajaremos la lección “${leccion.titulo}” del curso ${curso.titulo}.`;
  }, [curso, leccion, porcentaje]);

  const cambiarSeccion = (seccion) => {
    setSeccionActiva((actual) =>
      actual === seccion ? null : seccion
    );
  };

const analizarLeccion = async () => {
  if (
    !usuario ||
    !curso ||
    !leccion ||
    cargandoAnalisis
  ) {
    return;
  }

  setCargandoAnalisis(true);
  setError('');
  setSeccionActiva('resumen');
  setEstado(ESTADOS.ANALIZANDO);

  try {
    const resultado = await UTPBootService.analizarLeccion({
      usuario,
      curso,
      leccion,
      progreso
    });

    setAnalisis(resultado);
    setEstado(ESTADOS.ACOMPANANDO);
  } catch (err) {
    console.error(
      'Error al analizar la lección:',
      err.response?.data || err.message
    );

    setError(
      err.response?.data?.mensaje ||
        'No se pudo generar el análisis de esta lección.'
    );

    setEstado(ESTADOS.ERROR);
  } finally {
    setCargandoAnalisis(false);
  }
};

  const obtenerContextoPagina = () => {
    const zonas = document.querySelectorAll(
      '[data-ai-context="true"]'
    );

    if (!zonas.length) {
      return document.body.innerText.slice(0, 6000);
    }

    return Array.from(zonas)
      .map((zona) => zona.innerText)
      .join('\n\n')
      .slice(0, 6000);
  };

  const ejecutarAccion = (accion) => {
    if (!accion || accion === 'NINGUNA') return;

    const rutas = {
      IR_DASHBOARD: '/dashboard',
      IR_CURSOS: '/cursos',
      IR_LECCIONES: '/lecciones',
      IR_PERFIL: '/perfil'
    };

    const ruta = rutas[accion];

    if (ruta) {
      navigate(ruta);
    }
  };

  const enviarMensaje = async (texto) => {
    const mensajeLimpio = texto?.trim();

    if (!mensajeLimpio || cargandoChat) return;

    const mensajeUsuario = {
      id: crypto.randomUUID(),
      rol: 'user',
      mensaje: mensajeLimpio
    };

    setMensajes((actuales) => [
      ...actuales,
      mensajeUsuario
    ]);

    setCargandoChat(true);
    setError('');
    setEstado({
      clave: 'analizando',
      texto: 'Analizando tu pregunta',
      icono: '🟡'
    });

    try {
      const resultado = await UTPBootService.enviarMensaje({
        mensaje: mensajeLimpio,
        paginaActual: location.pathname,

        usuario: {
          id: usuario?.id,
          nombre: usuario?.nombre,
          rol: usuario?.rol
        },

        contextoPagina: obtenerContextoPagina(),

        contextoLeccion:
          leccion?.contenido_texto ||
          leccion?.descripcion ||
          leccion?.titulo ||
          '',

        cursoActual: curso,

        leccionActual: leccion,

        progresoActual: progreso
      });

      const respuestaIA = {
        id: crypto.randomUUID(),
        rol: 'assistant',
        mensaje:
          resultado?.respuesta ||
          'No pude generar una respuesta.'
      };

      setMensajes((actuales) => [
        ...actuales,
        respuestaIA
      ]);

      ejecutarAccion(resultado?.accion);

      setEstado(ESTADOS.ACOMPANANDO);
    } catch (err) {
      console.error(
        'Error al conversar con UTP-BOOT:',
        err.response?.data || err.message
      );

      setMensajes((actuales) => [
        ...actuales,
        {
          id: crypto.randomUUID(),
          rol: 'assistant',
          mensaje:
            err.response?.data?.mensaje ||
            'No pude responder en este momento. Inténtalo nuevamente.'
        }
      ]);

      setEstado(ESTADOS.ERROR);
    } finally {
      setCargandoChat(false);
    }
  };

  return {
    estado,
    analisis,
    error,
    saludo,
    nombreUsuario,
    bienvenida,
    tiempoSesion,
    porcentaje,
    seccionActiva,
    mensajes,
    cargandoAnalisis,
    cargandoChat,
    cambiarSeccion,
    analizarLeccion,
    enviarMensaje,
    setEstado,
    estados: ESTADOS
  };
}

export default useUTPBoot;