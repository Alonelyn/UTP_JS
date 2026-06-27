import { Link } from 'react-router-dom';
import '../styles/navbar.css';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const { tema, alternarTema } = useTheme();
  return (
    <nav className="navbar navbar-expand-lg lms-navbar">
      <Link className="lms-brand" to="/dashboard">
        LMS
      </Link>

      {usuario?.rol === 'admin' && (
        <Link className="lms-admin-tag" to="/admin">
          Admin
        </Link>
      )}

      <button className='btn btn-sm btn-outline-light ms-3' onClick={alternarTema}>
        {tema === 'ligth' ? '🌙 Oscuro' : '☀️ Claro'}
      </button>

      <div className="lms-links">
        <Link className="lms-link" to="/dashboard">Dashboard</Link>
        <Link className="lms-link" to="/cursos">Cursos</Link>
        <Link className="lms-link" to="/perfil">Perfil</Link>
      </div>
    </nav>
  );
}

export default Navbar;
