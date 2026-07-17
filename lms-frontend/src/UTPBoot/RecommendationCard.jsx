function RecommendationCard({
  analisis,
  leccion
}) {
  const consejo =
    analisis?.consejo ||
    `Revisa el contenido de “${leccion?.titulo || 'esta lección'}” antes de iniciar la práctica.`;

  const siguientePaso =
    analisis?.siguientePaso ||
    'Completa el contenido, realiza el reto práctico y marca la lección como completada.';

  return (
    <div className="utpboot-recommendations">
      <div>
        <span className="utpboot-label">Consejo del tutor</span>
        <p>{consejo}</p>
      </div>

      <div>
        <span className="utpboot-label">Siguiente paso</span>
        <p>{siguientePaso}</p>
      </div>
    </div>
  );
}

export default RecommendationCard;