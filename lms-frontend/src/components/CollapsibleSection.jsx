import { useState } from 'react';

function CollapsibleSection({
  titulo,
  subtitulo,
  icono = '📦',
  defaultOpen = false,
  bloqueado = false,
  children
}) {
  const [abierto, setAbierto] = useState(defaultOpen);

  return (
    <section className={`card p-0 mt-4 collapsible-section ${bloqueado ? 'locked' : ''}`}>
      <button
        type="button"
        className="collapsible-header"
        onClick={() => !bloqueado && setAbierto(!abierto)}
      >
        <div>
          <h3>
            {icono} {titulo}
          </h3>
          {subtitulo && <p>{subtitulo}</p>}
        </div>

        <span>
          {bloqueado ? '🔒' : abierto ? '−' : '+'}
        </span>
      </button>

      {abierto && !bloqueado && (
        <div className="collapsible-body">
          {children}
        </div>
      )}

      {bloqueado && (
        <div className="collapsible-locked">
          Completa la lección o activa tu plan para desbloquear esta sección.
        </div>
      )}
    </section>
  );
}

export default CollapsibleSection;