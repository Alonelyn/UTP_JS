function ProgressCard({
  progreso,
  porcentaje
}) {
  return (
    <div className="utpboot-progress-details">
      <div>
        <strong>{porcentaje}%</strong>
        <span>avance total</span>
      </div>

      <div>
        <strong>{progreso?.completadas || 0}</strong>
        <span>completadas</span>
      </div>

      <div>
        <strong>
          {Math.max(
            Number(progreso?.total || 0) -
              Number(progreso?.completadas || 0),
            0
          )}
        </strong>
        <span>pendientes</span>
      </div>
    </div>
  );
}

export default ProgressCard;