import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Chatbot from './components/Chatbot';
import Navbar from './components/Navbar';
import DevTool from './components/DevTool';

import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import CursoDetalle from './pages/CursoDetalle';
import Cursos from './pages/Cursos';
import Modulos from './pages/Modulos';
import Lecciones from './pages/Lecciones';
import Perfil from './pages/Perfil';
import AdminDashboard from './pages/admin/AdminDashboard';
import CursosDocente from './pages/docente/CursosDocentes';
import GestionContenido from './pages/docente/GestionContenido';
import InscripcionesAdmin from './pages/admin/InscripcionesAdmin';
import LeccionDetalle from './pages/LeccionDetalle';
import Progreso from './pages/Progreso';
import VerificarCorreo from './pages/VerificarCorreo';
import LoaderBridge from './components/LoaderBridge';
import EditorContenido from './pages/docente/EditorContenido';
import DocenteDashboard from './pages/docente/DocenteDashboard';
import Landing from './pages/Landing';



function Layout() {
  const location = useLocation();

  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const ocultarNavbar =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/registro'
    location.pathname === '/verificar-correo';
  

  return (
    <>
      <LoaderBridge />
      {!ocultarNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path='/login' element={<Login />} />
        <Route path="/" element={<Landing />} />
        <Route path='/docente/cursos' element={<CursosDocente />} />
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path="/docente/contenido" element={<GestionContenido />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/cursos" element={<Cursos />} />
        <Route path="/modulos" element={<Modulos />} />
        <Route path="/lecciones" element={<Lecciones />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/cursos/:cursoSlug" element={<CursoDetalle />} />
        <Route path="/cursos/:cursoSlug/lecciones/:leccionSlug" element={<LeccionDetalle />} />
        <Route path="/admin/inscripciones" element={<InscripcionesAdmin />} />
        <Route path="/progreso" element={<Progreso />} />
        <Route path="/verificar-correo" element={<VerificarCorreo />} />
        <Route path="/docente" element={<DocenteDashboard />} />
        <Route path="/docente/editor-contenido" element={<EditorContenido />} />

        
      </Routes>

      {!ocultarNavbar && 
        usuario?.rol === 'estudiante' && (
        <Chatbot
          contextoLeccion="Estás dentro del sistema LMS. Puedes ayudar al estudiante a navegar entre Dashboard, Cursos, Lecciones, Perfil y Módulos."
        />
      )}
        <DevTool/>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;