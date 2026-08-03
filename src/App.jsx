import './App.css'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'

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

function Layout() {
  const location = useLocation();

  const hideFooter = location.pathname === "/login" || location.pathname === "/register";
  const user = JSON.parse(localStorage.getItem("user") || "null")?.id;
  if (!user && !hideFooter) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/archivero" element={<ArchiveroPage />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/informativa" element={<Informativa />} />
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