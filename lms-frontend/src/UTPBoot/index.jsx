import { useEffect, useState } from 'react';
import Header from './Header';
import WelcomeCard from './WelcomeCard';
import StatusCard from './StatusCard';
import SummaryCard from './SummaryCard';
import GoalsCard from './GoalsCard';
import RecommendationCard from './RecommendationCard';
import ProgressCard from './ProgressCard';
import ResourceCard from './ResourceCard';
import PracticeCard from './PracticeCard';
import ChatCard from './ChatCard';
import Footer from './Footer';
import useUTPBoot from './hooks/useUTPBoot';
import './UTPBoot.css';

const SECCIONES = [
  {
    id: 'estado',
    icono: '📊',
    titulo: 'Estado de la sesión'
  },
  {
    id: 'resumen',
    icono: '📖',
    titulo: 'Resumen inteligente'
  },
  {
    id: 'objetivos',
    icono: '🎯',
    titulo: 'Objetivos'
  },
  {
    id: 'progreso',
    icono: '📈',
    titulo: 'Mi progreso'
  },
  {
    id: 'recomendaciones',
    icono: '💡',
    titulo: 'Recomendaciones'
  },
  {
    id: 'recursos',
    icono: '📚',
    titulo: 'Recursos'
  },
  {
    id: 'practica',
    icono: '💻',
    titulo: 'Práctica personalizada'
  },
  {
    id: 'chat',
    icono: '💬',
    titulo: 'Conversar'
  }
];

function UTPBootPanel({
  usuario,
  curso,
  leccion,
  progreso
}) {
  const [visible, setVisible] = useState(true);
  const [minimizado, setMinimizado] = useState(false);
  const [presentado, setPresentado] = useState(false);

  const boot = useUTPBoot({
    usuario,
    curso,
    leccion,
    progreso
  });

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setPresentado(true);
    }, 500);

    return () => clearTimeout(temporizador);
  }, [leccion?.id]);

  if (!visible) {
    return (
      <button
        type="button"
        className="utpboot-floating-button"
        onClick={() => setVisible(true)}
        title="Abrir UTP-BOOT"
      >
        🤖
        <span />
      </button>
    );
  }

  const renderizarContenido = (seccionId) => {
    switch (seccionId) {
      case 'estado':
        return (
          <StatusCard
            tiempoSesion={boot.tiempoSesion}
            porcentaje={boot.porcentaje}
            progreso={progreso}
          />
        );

      case 'resumen':
        return (
          <SummaryCard
            analisis={boot.analisis}
            cargando={boot.cargandoAnalisis}
            onAnalizar={boot.analizarLeccion}
          />
        );

      case 'objetivos':
        return (
          <GoalsCard analisis={boot.analisis} />
        );

      case 'progreso':
        return (
          <ProgressCard
            progreso={progreso}
            porcentaje={boot.porcentaje}
          />
        );

      case 'recomendaciones':
        return (
          <RecommendationCard
            analisis={boot.analisis}
            leccion={leccion}
          />
        );

      case 'recursos':
        return (
          <ResourceCard
            curso={curso}
            leccion={leccion}
          />
        );

      case 'practica':
        return (
          <PracticeCard
            analisis={boot.analisis}
            leccion={leccion}
          />
        );

      case 'chat':
        return (
          <ChatCard
            mensajes={boot.mensajes}
            cargandoChat={boot.cargandoChat}
            onEnviarMensaje={boot.enviarMensaje}
          />
        );
        
        return (
          <ChatCard
            mensajes={boot.mensajes}
            onAgregarMensaje={boot.agregarMensaje}
          />
        );

      default:
        return null;
    }
  };

  return (
    <aside
      className={`utpboot-panel ${
        minimizado ? 'minimized' : ''
      } ${presentado ? 'visible' : ''}`}
    >
      <Header
        estado={boot.estado}
        minimizado={minimizado}
        onMinimizar={() => setMinimizado((actual) => !actual)}
        onCerrar={() => setVisible(false)}
      />

      {!minimizado && (
        <>
          <div className="utpboot-body">
            <WelcomeCard
              saludo={boot.saludo}
              nombreUsuario={boot.nombreUsuario}
              bienvenida={boot.bienvenida}
            />

            {boot.error && (
              <div className="utpboot-error">
                {boot.error}
              </div>
            )}

            <div className="utpboot-sections">
              {SECCIONES.map((seccion) => {
                const abierta =
                  boot.seccionActiva === seccion.id;

                return (
                  <section
                    key={seccion.id}
                    className={`utpboot-section ${
                      abierta ? 'open' : ''
                    }`}
                  >
                    <button
                      type="button"
                      className="utpboot-section-header"
                      onClick={() =>
                        boot.cambiarSeccion(seccion.id)
                      }
                    >
                      <span className="utpboot-section-title">
                        <span>{seccion.icono}</span>
                        {seccion.titulo}
                      </span>

                      <span className="utpboot-chevron">
                        {abierta ? '−' : '+'}
                      </span>
                    </button>

                    {abierta && (
                      <div className="utpboot-section-body">
                        {renderizarContenido(seccion.id)}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </div>

          <Footer />
        </>
      )}
    </aside>
  );
}

export default UTPBootPanel;