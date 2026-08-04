import { useEffect } from 'react';

function SafariToolbarColor({ color }) {
  useEffect(() => {
    // 1. Gestionar la etiqueta meta clásica
    let metaTag = document.querySelector('meta[name="theme-color"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'theme-color';
      document.head.appendChild(metaTag);
    }
    metaTag.content = color;

    // 2. TRUCO PARA SAFARI: Sincronizar el color del body
    // Safari lee el color de fondo del body para tintar la barra superior
    const originalBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = color;

    return () => {
      // Restaurar el color original al desmontar
      document.body.style.backgroundColor = originalBodyBg;
    };
  }, [color]);

  return null;
}

export default SafariToolbarColor;
