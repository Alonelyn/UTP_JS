import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/login.css';

function Login() {
  const navigate = useNavigate();
  

  const [form, setForm] = useState({
    email: '',
    password_hash: ''
  });

  const iniciarSesion = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password_hash.trim()) {
      alert('Completa correo y contraseña');
      return;
    }

    try {
      const response = await api.post('/auth/login', form);

      // Guardar token JWT y datos del usuario
      localStorage.setItem('token',   response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));

      const rol = response.data.usuario?.rol;
      if (rol === 'admin')       navigate('/admin');
      else if (rol === 'instructor') navigate('/docente');
      else                           navigate('/dashboard');

    } catch (error) {
      alert(error.response?.data?.mensaje || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card login">
        <div className="auth-card-body">
          <p className="auth-eyebrow">Plataforma LMS</p>
          <h2 className="auth-title">Iniciar sesión</h2>

          <form onSubmit={iniciarSesion}>
            <input
              className="form-control"
              type="email"
              placeholder="Correo"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
              className="form-control"
              type="password"
              placeholder="Contraseña"
              value={form.password_hash}
              onChange={(e) => setForm({ ...form, password_hash: e.target.value })}
            />

            <button className="btn btn-primary w-100" type="submit">
              Entrar
            </button>
          </form>

          <p className="auth-footnote">
            ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
          </p>
          <p className="auth-footnote">
            ¿Olvidaste tu contraseña? <Link to="/recuperar-password">Recupérala aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
