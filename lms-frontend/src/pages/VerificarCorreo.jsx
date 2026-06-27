import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function VerificarCorreo() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    codigo: ''
  });

  const verificar = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.codigo.trim()) {
      alert('Ingresa correo y código');
      return;
    }

    try {
      const response = await api.post('/verificacion/confirmar', form);

      alert('Correo verificado correctamente. Ahora puedes iniciar sesión.');
      navigate('/login');

    } catch (error) {
      alert(error.response?.data?.mensaje || 'Error al verificar correo');
    }
  };

  const reenviarCodigo = async () => {
    if (!form.email.trim()) {
      alert('Ingresa tu correo para reenviar el código');
      return;
    }

    try {
      await api.post('/verificacion/reenviar', {
        email: form.email
      });

      alert('Código reenviado al correo');

    } catch (error) {
      alert(error.response?.data?.mensaje || 'Error al reenviar código');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <div className="card p-4">
        <h2 className="text-center mb-3">Verificar correo</h2>

        <p className="text-muted text-center">
          Ingresa el código que enviamos a tu correo.
        </p>

        <form onSubmit={verificar}>
          <input
            className="form-control mb-3"
            type="email"
            placeholder="Correo"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            className="form-control mb-3"
            placeholder="Código de 6 dígitos"
            maxLength="6"
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
          />

          <button className="btn btn-primary w-100" type="submit">
            Verificar cuenta
          </button>
        </form>

        <button
          className="btn btn-link mt-3"
          onClick={reenviarCodigo}
        >
          Reenviar código
        </button>
      </div>
    </div>
  );
}

export default VerificarCorreo;