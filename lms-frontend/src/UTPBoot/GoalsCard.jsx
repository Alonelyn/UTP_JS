function GoalsCard({ analisis }) {
  const objetivos = analisis?.objetivos || [];

  if (!objetivos.length) {
    return (
      <p className="utpboot-muted">
        Analiza la lección para generar objetivos personalizados.
      </p>
    );
  }

  return (
    <ul className="utpboot-list">
      {objetivos.map((objetivo, index) => (
        <li key={`${objetivo}-${index}`}>
          <span>✓</span>
          {objetivo}
        </li>
      ))}
    </ul>
  );
}

export default GoalsCard;