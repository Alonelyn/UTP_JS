function RecommendationCard({ analisis }) {
  if (!analisis) {
    return (
      <p className="utpboot-muted">
        Primero realiza el análisis de la lección.
      </p>
    );
  }

  return (
    <div className="utpboot-recommendation">
      <div>
        <strong>Consejo</strong>
        <p>{analisis.consejo}</p>
      </div>

      <div>
        <strong>Siguiente paso</strong>
        <p>{analisis.siguientePaso}</p>
      </div>
    </div>
  );
}

export default RecommendationCard;