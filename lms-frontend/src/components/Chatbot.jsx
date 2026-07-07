import '../styles/chatbot.css';
import { useState } from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
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

  const [posicion, setPosicion] = useState({ x: 40, y: 120 });
  const [arrastrando, setArrastrando] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [expandido, setExpandido] = useState(false);

  const iniciarArrastre = (e) => {
    setArrastrando(true);

    setOffset({
      x: e.clientX - posicion.x,
      y: e.clientY - posicion.y
    });
  };

  const moverChat = (e) => {
    if (!arrastrando) return;

    setPosicion({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y
    });
  };

  const detenerArrastre = () => {
    setArrastrando(false);
  };

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

  const enviarPregunta = async (e, mensajeRapido = null) => {
    e.preventDefault();

    const texto = mensajeRapido || pregunta;

    if (!texto.trim()) return;

    const mensajeEstudiante = {
      autor: 'estudiante',
      texto
    };

    setMensajes((prev) => [...prev, mensajeEstudiante]);
    setPregunta('');
    setCargando(true);

    try {
      const contextoPagina = obtenerContextoPagina();

      const response = await api.post('/ia/chat', {
        mensaje: texto,
        paginaActual: location.pathname,
        usuario: {
          id: usuario?.id,
          nombre: usuario?.nombre,
          rol: usuario?.rol
        },
        contextoPagina,
        contextoLeccion
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
          texto:
            'La IA está saturada temporalmente. Intenta otra vez en unos segundos. Si el problema persiste, contacta al administrador del sistema.'
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

  const enviarPreguntaRapida = (texto) => {
    enviarPregunta(
      {
        preventDefault: () => {}
      },
      texto
    );
  };



  return (
    <div
        className={`chatbot-floating-card ${expandido ? 'chatbot-expanded' : ''}`}
        style={{
          left: `${posicion.x}px`,
          top: `${posicion.y}px`,
          right: 'auto',
          bottom: 'auto'
        }}
        onMouseMove={moverChat}
        onMouseUp={detenerArrastre}
        onMouseLeave={detenerArrastre}
      >
      <div
        className="chatbot-header d-flex justify-content-between align-items-center"
        onMouseDown={iniciarArrastre}
      >
        <span>
          🤖 UTP-BOOT <br/>
          Asistente Académico <br />
          En línea 🟢
        </span>
        <button
          type="button"
          className="btn btn-sm btn-light me-2"
          onClick={(e) => {
            e.stopPropagation();
            setExpandido(!expandido);
          }}
        >
          {expandido ? '↙' : '⛶'}
        </button>

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
            <div
              className="chat-bubble"
              dangerouslySetInnerHTML={{
                __html: mensaje.texto
              }}
            />
          </div>
        ))}

        {cargando && <div className="typing">La IA está pensando...</div>}
      </div>
      <div className="chatbot-tools">
      <button
        type="button"
        className="btn btn-outline-primary btn-sm"
        onClick={() =>
          enviarPreguntaRapida('Explícame esta lección de forma sencilla.')
        }
        >
          📚 Explicar
        </button>

      <button
        type="button"
        className="btn btn-outline-primary btn-sm"
        onClick={() =>
          enviarPreguntaRapida('Explícame esta lección de forma sencilla.')
        }
        >
          💻 Ejercicio
        </button>

          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() =>
              enviarPreguntaRapida('Explícame esta lección de forma sencilla.')
            }
        >
          📝 Evaluarme
        </button>

          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() =>
              enviarPreguntaRapida('Explícame esta lección de forma sencilla.')
            }
        >
          🚀 Recursos
        </button>
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

        <button
          type="button"
          className="btn btn-danger chatbot-special"
          onClick={() =>
            enviarPreguntaRapida(
              'Actúa como mi tutor personal. Analiza esta lección, identifica mis posibles dificultades, recomiéndame recursos adicionales, genera un ejercicio práctico y un mini examen.'
            )
          }
        >
          🎓 Tutor IA
        </button>
        
      </form>
    </div>
  );
}

export default Chatbot;