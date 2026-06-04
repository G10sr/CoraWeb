import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

import './assets/styles/MapaHome.css'
import Header from "./components/Header"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import ArchiveroPage from "./pages/ArchiveroPage"
import Perfil from "./pages/Perfil"
import Agente from "./components/AgenteCoraChat"
import NotFound from "./pages/NotFound";
import Login from './pages/Login';

/* 🔥 ESTE COMPONENTE SÍ PUEDE USAR useLocation */
function Layout() {
  const location = useLocation();

  const hideFooter = location.pathname === "/login";

  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/archivero" element={<ArchiveroPage />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!hideFooter && (
        <>
          <Footer />
          <Agente />
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