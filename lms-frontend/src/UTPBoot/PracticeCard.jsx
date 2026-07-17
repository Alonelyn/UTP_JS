function PracticeCard({ analisis, leccion }) {
  const proyecto = analisis?.proyecto;

  return (
    <div className="utpboot-content-block">
      {proyecto ? (
        <>
          <span className="utpboot-label">
            {proyecto.dificultad || 'Práctica personalizada'}
          </span>

          <h4>{proyecto.titulo}</h4>
          <p>{proyecto.descripcion}</p>
        </>
      ) : (
        <>
          <p>
            {leccion?.reto_practico ||
              'Realiza el ejercicio práctico de la lección para reforzar lo aprendido.'}
          </p>

          <small className="utpboot-muted">
            Próximamente UTP-BOOT generará un reto distinto según tu
            desempeño.
          </small>
        </>
      )}
    </div>
  );
}

export default PracticeCard;