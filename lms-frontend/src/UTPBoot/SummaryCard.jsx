function SummaryCard({
  analisis,
  cargando,
  onAnalizar
}) {
  if (cargando) {
    return (
      <div className="utpboot-loading">
        <span className="utpboot-loader" />
        <p>Estoy analizando esta lección...</p>
      </div>
    );
  }

  if (!analisis) {
    return (
      <div className="utpboot-empty">
        <p>
          Todavía no he generado el análisis inteligente de esta
          lección.
        </p>

        <button
          type="button"
          className="utpboot-primary-button"
          onClick={onAnalizar}
        >
          Analizar ahora
        </button>
      </div>
    );
  }

  return (
    <div className="utpboot-content-block">
      <p>{analisis.resumen}</p>

      <div className="utpboot-tags">
        <span>
          Nivel: {analisis.nivel || 'No determinado'}
        </span>

        <span>
          Duración: {analisis.duracion || '15 minutos'}
        </span>
      </div>
    </div>
  );
}

export default SummaryCard;