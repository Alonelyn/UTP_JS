function WelcomeCard({
  saludo,
  nombreUsuario,
  bienvenida
}) {
  return (
    <div className="utpboot-welcome">
      <span className="utpboot-welcome-icon">
        {saludo.icono}
      </span>

      <div>
        <h3>
          {saludo.texto}, {nombreUsuario}
        </h3>

        <p>{bienvenida}</p>
      </div>
    </div>
  );
}

export default WelcomeCard;