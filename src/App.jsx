import './App.css'
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom'

import './assets/styles/MapaHome.css'
import Header from "./components/Header"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import ArchiveroPage from "./pages/ArchiveroPage"
import Perfil from "./pages/Perfil"
import Agente from "./components/AgenteCoraChat"
import NotFound from "./pages/NotFound";
import Login from './pages/Login';
import Register from './pages/Register';
import CoraTour from "./components/CoraTour";
import Informativa from "./pages/Informativa";
import AdminPanel from "./pages/AdminPanel";
import { clearStoredUser, getStoredUser } from "./lib/authSession";
import SafariToolbarColor from './components/SafariColor'
function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const hideFooter = location.pathname === "/login" || location.pathname === "/register";
  const storedUser = getStoredUser();
  const user = storedUser?.id;

  if (!user && !hideFooter) {
    return <Navigate to="/login" replace />;
  }

  if (user && !hideFooter) {
    const verifyUserSession = async () => {
      try {
        const response = await fetch("/api/load-perfil", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: user }),
        });
        const data = await response.json();

        if (!data?.ok || !data?.perfil) {
          clearStoredUser();
          navigate("/login", { replace: true });
        }
      } catch {
        return;
      }
    };

    verifyUserSession();
  }

  return (
    <>
      <Header />
              <SafariToolbarColor color="#04504F"/>

      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/archivero" element={<ArchiveroPage />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/register" element={<Register />} />. This is for Public Registration */}
        <Route path="/informativa" element={<Informativa />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!hideFooter && (
        <>
          <Footer />
          <Agente />
          <CoraTour />
        </>
      )}
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