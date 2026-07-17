function Header({
  estado,
  minimizado,
  onMinimizar,
  onCerrar
}) {
  return (
    <header className="utpboot-header">
      <div className="utpboot-identity">
        <div className="utpboot-avatar" aria-hidden="true">
          🤖
        </div>

        <div>
          <h2>UTP-BOOT</h2>

          <span className={`utpboot-status ${estado.clave}`}>
            {estado.icono} {estado.texto}
          </span>
        </div>
      </div>

      <div className="utpboot-header-actions">
        <button
          type="button"
          className="utpboot-icon-button"
          onClick={onMinimizar}
          title={minimizado ? 'Expandir UTP-BOOT' : 'Minimizar UTP-BOOT'}
        >
          {minimizado ? '□' : '—'}
        </button>

        <button
          type="button"
          className="utpboot-icon-button"
          onClick={onCerrar}
          title="Ocultar UTP-BOOT"
        >
          ×
        </button>
      </div>
    </header>
  );
}

export default Header;