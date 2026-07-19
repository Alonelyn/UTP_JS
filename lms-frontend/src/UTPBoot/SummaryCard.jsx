function SummaryCard({
  analisis,
  cargando,
  error,
  onAnalizar
}) {
  if (cargando) {
    return (
      <div className="utpboot-loading">
        Analizando la lección...
      </div>
    );
  }

  if (error) {
    return (
      <div className="utpboot-error">
        <p>{error}</p>

        <button
          type="button"
          onClick={onAnalizar}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!analisis) {
    return (
      <div className="utpboot-empty-card">
        <p>
          UTP-BOOT puede analizar el contenido actual y generar una guía de estudio.
        </p>

        <button
          type="button"
          onClick={onAnalizar}
        >
          Analizar ahora
        </button>
      </div>
    );
  }

  return (
    <div className="utpboot-summary">
      <p>{analisis.resumen}</p>

      <div className="utpboot-summary-meta">
        <span>📊 {analisis.nivel}</span>
        <span>⏱️ {analisis.duracion}</span>
      </div>
    </div>
  );
}

export default SummaryCard;