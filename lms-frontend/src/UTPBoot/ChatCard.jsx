import { useEffect, useRef, useState } from 'react';

function ChatCard({
  mensajes,
  cargandoChat,
  onEnviarMensaje
}) {
  const [texto, setTexto] = useState('');
  const finalChatRef = useRef(null);

  useEffect(() => {
    finalChatRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [mensajes, cargandoChat]);

  const enviar = async (event) => {
    event.preventDefault();

    const mensajeLimpio = texto.trim();

    if (!mensajeLimpio || cargandoChat) return;

    setTexto('');

    await onEnviarMensaje(mensajeLimpio);
  };

  const enviarRapido = async (mensaje) => {
    if (cargandoChat) return;

    await onEnviarMensaje(mensaje);
  };

  return (
    <div className="utpboot-chat">
      <div className="utpboot-quick-actions">
        <button
          type="button"
          onClick={() =>
            enviarRapido(
              'Explícame esta lección de forma sencilla y con un ejemplo.'
            )
          }
          disabled={cargandoChat}
        >
          📖 Explicar
        </button>

        <button
          type="button"
          onClick={() =>
            enviarRapido(
              'Genera un ejercicio práctico progresivo sobre esta lección.'
            )
          }
          disabled={cargandoChat}
        >
          💻 Ejercicio
        </button>

        <button
          type="button"
          onClick={() =>
            enviarRapido(
              'Créame una evaluación corta sobre esta lección. Haz una pregunta a la vez.'
            )
          }
          disabled={cargandoChat}
        >
          📝 Evaluarme
        </button>

        <button
          type="button"
          onClick={() =>
            enviarRapido(
              'Recomiéndame recursos concretos para profundizar en esta lección.'
            )
          }
          disabled={cargandoChat}
        >
          📚 Recursos
        </button>
      </div>

      <div className="utpboot-chat-messages">
        {mensajes.length === 0 ? (
          <div className="utpboot-empty-message">
            <span>💬</span>

            <p>
              Puedes preguntarme sobre el contenido de esta lección.
            </p>
          </div>
        ) : (
          mensajes.map((mensaje) => (
            <div
              key={mensaje.id}
              className={`utpboot-message ${mensaje.rol}`}
            >
              {mensaje.mensaje}
            </div>
          ))
        )}

        {cargandoChat && (
          <div className="utpboot-message assistant">
            UTP-BOOT está analizando tu pregunta...
          </div>
        )}

        <div ref={finalChatRef} />
      </div>

      <form
        className="utpboot-chat-form"
        onSubmit={enviar}
      >
        <textarea
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          placeholder="Pregunta sobre esta lección..."
          rows="2"
          disabled={cargandoChat}
        />

        <button
          type="submit"
          disabled={cargandoChat || !texto.trim()}
        >
          {cargandoChat ? 'Pensando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}

export default ChatCard;