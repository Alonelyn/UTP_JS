import { useEffect, useState } from 'react';
import api from '../api/axios';
import '../styles/usuarios.css';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password_hash: '',
    rol: 'estudiante'
  });

  const listarUsuarios = async () => {
    const response = await api.get('/usuarios');
    setUsuarios(response.data);
  };

  const eliminarUsuario = async (id) => {
    const confirmar = confirm('¿Seguro que quieres eliminar este usuario?');

    if (!confirmar) return;

    await api.delete(`/usuarios/${id}`);
    listarUsuarios();
  };

  const cargarUsuarioParaEditar = (usuario) => {
    setForm({
      nombre:        usuario.nombre,
      apellido:      usuario.apellido,
      email:         usuario.email,
      password_hash: '',        // siempre vacío — nunca mostrar el hash
      rol:           usuario.rol
    });

    setUsuarioEditando(usuario.id);
  };

  const actualizarUsuario = async (e) => {
    e.preventDefault();

    // Solo enviar password_hash si el admin escribió una nueva contraseña
    const payload = {
      nombre:   form.nombre,
      apellido: form.apellido,
      email:    form.email,
      rol:      form.rol
    };

    if (form.password_hash.trim()) {
      payload.password_hash = form.password_hash;
    }

    await api.put(`/usuarios/${usuarioEditando}`, payload);

    setUsuarioEditando(null);
    setForm({ nombre: '', apellido: '', email: '', password_hash: '', rol: 'estudiante' });
    listarUsuarios();
  };

  const registrarUsuario = async (e) => {
    e.preventDefault();

    try {
      if (
        !form.nombre.trim() ||
        !form.apellido.trim() ||
        !form.email.trim() ||
        !form.password_hash.trim()
      ) {
        mostrarToast('Completa todos los campos obligatorios.', 'danger');
        return;
      }

      await api.post('/usuarios', form);

      setForm({
        nombre: '',
        apellido: '',
        email: '',
        password_hash: '',
        rol: 'estudiante'
      });

      mostrarToast('Usuario registrado correctamente. Se envió correo de verificación.');

      listarUsuarios();

    } catch (error) {
      console.error('Error al registrar:', error.response?.data || error.message);

      mostrarToast(
        error.response?.data?.mensaje || 'Error al registrar usuario',
        'danger'
      );
    }
  };

  const [toast, setToast] = useState({
    mostrar: false,
    mensaje: '',
    tipo: 'sucess'
  });

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({
      mostrar: true,
      mensaje,
      tipo
    });

    setTimeout(() => {
      setToast({
        mostrar: false,
        mensaje: '',
        tipo: 'success'
      });
    }, 3000);
  };

    useEffect(() => {
      listarUsuarios();
    }, []);

  const selloPorRol = {
    admin: 'sello-azul',
    instructor: 'sello-emerald',
    estudiante: 'sello-brass'
  };

  return (
    <div className="page-shell">
      {toast.mostrar && (
        <div
          className={`alert ${
            toast.tipo === 'success' ? 'alert-success' : 'alert-danger'
          } position-fixed top-0 end-0 m-3`}
          style={{ zIndex: 3000, minWidth: '280px' }}
        >
          {toast.mensaje}
        </div>
      )}
      <div className="usuarios-head">
        <p className="eyebrow" style={{ '--accent': 'var(--azul)' }}>Administración</p>
        <h1 className="page-title">Usuarios</h1>
        <p className="page-sub">{usuarios.length} cuenta(s) registradas</p>
      </div>

      <div className="usuarios-wrap">
        <div className="usuarios-form">
          <div className="usuarios-form-head">
            {usuarioEditando ? 'Editar usuario' : 'Nuevo usuario'}
          </div>

          <form
            onSubmit={usuarioEditando ? actualizarUsuario : registrarUsuario}
            className="usuarios-form-body"
          >
            <input
              className="form-control mb-2"
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />

            <input
              className="form-control mb-2"
              placeholder="Apellido"
              value={form.apellido}
              onChange={(e) => setForm({ ...form, apellido: e.target.value })}
            />

            <input
              className="form-control mb-2"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
              className="form-control mb-2"
              placeholder={usuarioEditando ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
              type="password"
              value={form.password_hash}
              onChange={(e) => setForm({ ...form, password_hash: e.target.value })}
            />

            <select
              className="form-control mb-2"
              value={form.rol}
              onChange={(e) => setForm({ ...form, rol: e.target.value })}
            >
              <option value="estudiante">Estudiante</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>

            <button
              className="btn btn-primary mt-2"
              type="submit">
              {usuarioEditando ? 'Actualizar' : 'Registrar'}
            </button>
          </form>
        </div>

        <h2 className="usuarios-lista-titulo">Lista de usuarios</h2>

        {usuarios.map((usuario) => (
          <div key={usuario.id} className="ficha usuario-ficha" style={{ '--accent': 'var(--azul)' }}>
            <div className="usuario-info">
              <strong>{usuario.nombre} {usuario.apellido}</strong>
              <p>{usuario.email}</p>
              <span className={`sello ${selloPorRol[usuario.rol] || 'sello-brass'}`}>
                {usuario.rol}
              </span>
            </div>
            <div className="usuario-acciones">
              <button
                className="btn btn-warning"
                onClick={() => cargarUsuarioParaEditar(usuario)}>
                Editar
              </button>
              <button className="btn btn-danger" onClick={() => eliminarUsuario(usuario.id)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Usuarios;
