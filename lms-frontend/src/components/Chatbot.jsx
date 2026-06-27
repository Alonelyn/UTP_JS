import '../styles/chatbot.css';
import { useState } from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import api from '../api/axios';

function Chatbot({ contextoLeccion }) {
  const navigate = useNavigate();
  const location = useLocation();

  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [minimizado, setMinimizado] = useState(false);
  const [mensajes, setMensajes] = useState([
    {
      autor: 'ia',
      texto: `Hola ${usuario?.nombre}, soy UTP-BOOT y te acompañaré en tus lecciones. ¿Por dónde deseas empezar?`
    }
  ]);

  const saludoInicial = () => {
    if (!usuario) {
      return 'Hola, soy tu asistente académico.';
    }

    switch (location.pathname) {
      case '/dashboard':
        return `¡Hola ${usuario.nombre}! Bienvenido nuevamente al LMS. ¿Qué te gustaría hacer hoy?`;

      case '/cursos':
        return `Hola ${usuario.nombre}. Estoy listo para ayudarte a elegir o entender cualquiera de los cursos.`;

      case '/perfil':
        return `Hola ${usuario.nombre}. Si tienes dudas sobre tu progreso o tu cuenta, aquí estoy.`;

      default:
        return `Hola ${usuario.nombre}. ¿En qué puedo ayudarte?`;
    }
  };  

  const [pregunta, setPregunta] = useState('');
  const [cargando, setCargando] = useState(false);

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

  const obtenerContextoPagina = () => {
    const zonas = document.querySelectorAll('[data-ai-context="true"]');

    if (!zonas.length) {
      return document.body.innerText;
    }

    return Array.from(zonas)
      .map((zona) => zona.innerText)
      .join('\n\n')
      .slice(0,6000);
  };

  const enviarPregunta = async (e) => {
    e.preventDefault();

    if (!pregunta.trim()) return;

    const textoPregunta = pregunta;

    const mensajeEstudiante = {
      autor: 'estudiante',
      texto: textoPregunta
    };

    setMensajes((prev) => [...prev, mensajeEstudiante]);
    setPregunta('');
    setCargando(true);

    try {
      const contextoPagina = obtenerContextoPagina();

      const response = await api.post('/ia/chat', {
        mensaje: textoPregunta,
        paginaActual: location.pathname,
        contextoLeccion: contextoPagina || contextoLeccion,
      });

      const respuestaIA = {
        autor: 'ia',
        texto: response.data.respuesta
      };

      setMensajes((prev) => [...prev, respuestaIA]);

      ejecutarAccion(response.data.accion);

    } catch (error) {
      console.error('Error IA:', error.response?.data || error.message);

      setMensajes((prev) => [
        ...prev,
        {
          autor: 'ia',
          texto: 'La IA está saturada temporalmente. Intenta otra vez en unos segundos. Si el problema persiste, contacta al administrador del sistema.'
        }
      ]);
    } finally {
      setCargando(false);
    }
  };
  if (minimizado) {
    return (
      <button
        className="chatbot-floating-btn"
        onClick={() => setMinimizado(false)}
      >
        IA
      </button>
    );
  }

  return (
    <div className="chatbot-floating-card">
      <div className="chatbot-header d-flex justify-content-between align-items-center">
        <span>
          🤖 UTP-BOOT <br/>
          Asistente Académico <br />
          En línea 🟢
        </span>

        <button
          className="btn btn-sm btn-light"
          onClick={() => setMinimizado(true)}
        >
          —
        </button>
      </div>

      <div className="chatbot-body">
        {mensajes.map((mensaje, index) => (
          <div
            key={index}
            className={`chat-message ${
              mensaje.autor === 'estudiante' ? 'student' : 'ia'
            }`}
          >
            <div className="chat-bubble">{mensaje.texto}</div>
          </div>
        ))}

        {cargando && <div className="typing">La IA está pensando...</div>}
      </div>

      <form onSubmit={enviarPregunta} className="chatbot-footer">
        <input
          className="form-control chatbot-input"
          placeholder="Pregunta sobre esta lección..."
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
        />

        <button className="btn btn-primary chatbot-btn" type="submit">
          Enviar
        </button>
      </form>
    </div>
  );
}

export default Chatbot;