import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import '../styles/login.css';
import '../styles/recuperar.css';

function RecuperarPassword() {
  const [paso,    setPaso]    = useState(1); // 1=pedir email, 2=ingresar código+nueva pass
  const [email,   setEmail]   = useState('');
  const [codigo,  setCodigo]  = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmar,     setConfirmar]     = useState('');
  const [cargando, setCargando] = useState(false);
  const [exito,    setExito]   = useState(false);
  const [error,    setError]   = useState('');

  /* ── Paso 1: Solicitar código ──────────────────────────── */
  const solicitarCodigo = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await api.post('/auth/recuperar', { email });
      setPaso(2);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al enviar el código');
    } finally {
      setCargando(false);
    }
  };

  /* ── Paso 2: Restablecer contraseña ────────────────────── */
  const restablecerPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (nuevaPassword !== confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (nuevaPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCargando(true);

    try {
      await api.post('/auth/nueva-password', {
        email,
        codigo,
        nueva_password: nuevaPassword
      });
      setExito(true);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Código incorrecto o expirado');
    } finally {
      setCargando(false);
    }
  };

  /* ── Éxito ─────────────────────────────────────────────── */
  if (exito) {
    return (
      <div className="auth-shell">
        <div className="auth-card recuperar">
          <div className="auth-card-body">
            <div className="recuperar-exito">
              <div className="recuperar-exito-icono">✅</div>
              <h2>¡Contraseña restablecida!</h2>
              <p>
                Tu contraseña fue actualizada correctamente.
                Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <Link className="btn btn-primary w-100" to="/login">
                Ir al login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-card recuperar">
        <div className="auth-card-body">
          <p className="auth-eyebrow">Plataforma LMS</p>

          {/* Indicador de pasos */}
          <div className="recuperar-pasos">
            <div className={`recuperar-paso ${paso >= 1 ? 'activo' : ''}`}>
              <span>1</span> Correo
            </div>
            <div className="recuperar-linea" />
            <div className={`recuperar-paso ${paso >= 2 ? 'activo' : ''}`}>
              <span>2</span> Código
            </div>
          </div>

          {/* ── Paso 1 ── */}
          {paso === 1 && (
            <>
              <h2 className="auth-title">Recuperar contraseña</h2>
              <p className="recuperar-sub">
                Ingresa tu correo y te enviaremos un código de 6 dígitos.
              </p>

              <form onSubmit={solicitarCodigo}>
                <input
                  className="form-control"
                  type="email"
                  placeholder="Tu correo registrado"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                {error && <p className="recuperar-error">{error}</p>}

                <button
                  className="btn btn-primary w-100 mt-2"
                  type="submit"
                  disabled={cargando}
                >
                  {cargando ? 'Enviando...' : 'Enviar código 📧'}
                </button>
              </form>
            </>
          )}

          {/* ── Paso 2 ── */}
          {paso === 2 && (
            <>
              <h2 className="auth-title">Ingresa el código</h2>
              <p className="recuperar-sub">
                Revisá tu correo <strong>{email}</strong> y copia el código de 6 dígitos.
              </p>

              <form onSubmit={restablecerPassword}>
                <input
                  className="form-control recuperar-codigo-input"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                  required
                />

                <input
                  className="form-control mt-2"
                  type="password"
                  placeholder="Nueva contraseña (mín. 6 caracteres)"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  required
                />

                <input
                  className="form-control mt-2"
                  type="password"
                  placeholder="Confirmar nueva contraseña"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  required
                />

                {error && <p className="recuperar-error">{error}</p>}

                <button
                  className="btn btn-primary w-100 mt-2"
                  type="submit"
                  disabled={cargando}
                >
                  {cargando ? 'Procesando...' : 'Restablecer contraseña 🔐'}
                </button>

                <button
                  type="button"
                  className="btn btn-link w-100 mt-1"
                  onClick={() => { setPaso(1); setError(''); }}
                >
                  ← Cambiar correo
                </button>
              </form>
            </>
          )}

          <p className="auth-footnote mt-3">
            ¿Ya recordaste? <Link to="/login">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RecuperarPassword;
