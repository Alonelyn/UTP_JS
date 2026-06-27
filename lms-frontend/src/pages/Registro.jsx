import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/login.css';
import '../styles/registro.css';

function Registro() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password_hash: ''
  });

  const registrarAlumno = async (e) => {
    e.preventDefault();

    if (
      !form.nombre.trim() ||
      !form.apellido.trim() ||
      !form.email.trim() ||
      !form.password_hash.trim()
    ) {
      alert('Completa todos los campos');
      return;
    }

      const correoValido =
        /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|outlook\.com|utp\.edu\.pe)$/;

      if (!correoValido.test(form.email)) {
        alert(
          'Correo no válido. Solo se permiten gmail.com, hotmail.com, outlook.com y utp.edu.pe'
        );
        return;
      }

    try {
      const response = await api.post('/usuarios', {
        ...form,
        rol: 'estudiante'
      });

      localStorage.setItem('usuario', JSON.stringify(response.data));

      alert('Registro exitoso');
      navigate('/verificar-correo');

    } catch (error) {
      console.log('ERROR COMPLETO:', error.response?.data);
      alert(error.response?.data?.mensaje || 'Error al registrar alumno');
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card registro">
        <div className="auth-card-body">
          <p className="auth-eyebrow">Plataforma LMS</p>
          <h2 className="auth-title">Registro de alumno</h2>

          <form onSubmit={registrarAlumno}>
            <input
              className="form-control"
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />

            <input
              className="form-control"
              placeholder="Apellido"
              value={form.apellido}
              onChange={(e) => setForm({ ...form, apellido: e.target.value })}
            />

            <input
              className="form-control"
              placeholder="Correo institucional"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
              className="form-control"
              placeholder="Contraseña"
              type="password"
              value={form.password_hash}
              onChange={(e) => setForm({ ...form, password_hash: e.target.value })}
            />

            <button className="btn btn-primary w-100" type="submit">
              Registrarme
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Registro;
