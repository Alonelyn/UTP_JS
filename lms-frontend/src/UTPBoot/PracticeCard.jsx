function PracticeCard({ analisis }) {
  const proyecto = analisis?.proyecto;

  if (!proyecto) {
    return (
      <p className="utpboot-muted">
        Analiza la lección para crear una práctica personalizada.
      </p>
    );
  }

  return (
    <div className="utpboot-practice">
      <span className="utpboot-badge">
        {proyecto.dificultad}
      </span>

      <h4>{proyecto.titulo}</h4>

      <p>{proyecto.descripcion}</p>
    </div>
  );
}

export default PracticeCard;