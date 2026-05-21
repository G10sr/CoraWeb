import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Login.css'; 

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Enviando datos al backend:', formData);
      
      // Aquí se ejecutla la lógica de autenticación real:
      // const response = await fetch('https://elenlacedelabasededatosoalmenosesoentendideladocumentacion.com', { ... });
      
      navigate('/home'); 
      
    } catch (err) {
      setError('Credenciales incorrectas. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
        <h2 className="title">Iniciar Sesión</h2>
        
        {error && <p className="error">{error}</p>}

        <div className="inputGroup">
          <label htmlFor="text">Usuario</label>
          <input
            type="text"
            id="text"
            name="text"
            value={formData.text}
            onChange={handleChange}
            required
            placeholder="administrador"
          />
        </div>

        <div className="inputGroup">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="********"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
