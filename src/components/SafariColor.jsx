import { useEffect } from 'react';

function SafariToolbarColor({ color }) {
  useEffect(() => {
    let metaTag = document.querySelector('meta[name="theme-color"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'theme-color';
      document.head.appendChild(metaTag);
    }
    metaTag.content = color;

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

//Unica funcion, cambiar color del toolbar en Safari para IOS y MacOS

export default SafariToolbarColor;
