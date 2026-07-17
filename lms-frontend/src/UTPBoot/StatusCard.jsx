function StatusCard({
  tiempoSesion,
  porcentaje,
  progreso
}) {
  return (
    <div className="utpboot-status-grid">
      <div className="utpboot-metric">
        <span>Tiempo en esta lección</span>
        <strong>{tiempoSesion}</strong>
      </div>

      <div className="utpboot-metric">
        <span>Progreso del curso</span>
        <strong>{porcentaje}%</strong>
      </div>

      <div className="utpboot-progress">
        <div
          className="utpboot-progress-value"
          style={{
            width: `${Math.min(Math.max(porcentaje, 0), 100)}%`
          }}
        />
      </div>

      {progreso && (
        <small>
          {progreso.completadas || 0} de {progreso.total || 0}{' '}
          lecciones completadas
        </small>
      )}
    </div>
  );
}

export default StatusCard;