import './App.css'
import { useState, useEffect } from 'react'

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import './assets/styles/MapaHome.css'
import Header from "./components/Header"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import ArchiveroPage from "./pages/ArchiveroPage"
import Perfil from "./pages/perfil"
import Agente from "./components/AgenteCoraChat"
import NotFound from "./pages/NotFound";



function App() {

  return (
    <BrowserRouter>
    <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/archivero" element={<ArchiveroPage />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <Agente />
      
    </BrowserRouter>
    
  )
}

export default App