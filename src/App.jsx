import './App.css'
import { useState, useEffect } from 'react'
import { supabase } from './utils/supabase'
import MyMapComponent from './components/myMapComponent';
import './assets/styles/MapaHome.css';
import Header from "./components/Header";
import Footer from "./components/Footer";
import ArchiveroPage from "./pages/ArchiveroPage";
import Perfil from "./pages/perfil";


function App() {
  const [todos, setTodos] = useState([])

  useEffect(() => {
    async function getTodos() {
      const { data: todos } = await supabase.from('todos').select()

      if (todos) {
        setTodos(todos)
      }
    }

    getTodos()
  }, [])


  const currentPath = window.location.pathname.toLowerCase();

  if (currentPath === '/archivero') {
    return <ArchiveroPage />;
  }
  if (currentPath === '/perfil') {
    return <Perfil />;
  }
  return (
    <div className="app">
      <Header />
      <div className="map-container">
        <MyMapComponent />
      </div>
      <Footer />
    </div>
  );
}

export default App