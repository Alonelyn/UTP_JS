function ResourceCard({ curso, leccion }) {
  return (
    <div className="utpboot-content-block">
      <p>
        Puedo recomendar videos, documentación oficial y repositorios
        relacionados con:
      </p>

      <div className="utpboot-topic">
        <strong>{curso?.titulo}</strong>
        <span>{leccion?.titulo}</span>
      </div>

      <small className="utpboot-muted">
        Las recomendaciones se conectarán con el Resource Hub del LMS.
      </small>
    </div>
  );
}

export default ResourceCard;