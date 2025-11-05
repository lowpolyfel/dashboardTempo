# Plantilla de Dashboard de Producción

Esta plantilla proporciona una base modular para construir tableros de monitoreo de líneas de producción. Separa la lógica en
archivos independientes de HTML, CSS y JavaScript para facilitar la personalización y la extensión en proyectos futuros.

## Estructura del proyecto

```
├── assets/
│   ├── css/
│   │   └── main.css
│   └── js/
│       ├── app.js
│       ├── data.js
│       ├── logic.js
│       └── render.js
├── index.html
└── README.md
```

- **index.html**: Contiene la estructura del documento y enlaza los recursos de estilo y scripts.
- **main.css**: Define la apariencia visual del tablero.
- **data.js**: Centraliza constantes, estado inicial y variables compartidas.
- **logic.js**: Incluye funciones de negocio para generar datos, aplicar reglas y gestionar el estado.
- **render.js**: Responsable de la actualización de la interfaz y del renderizado de componentes.
- **app.js**: Punto de entrada que inicializa el tablero y conecta eventos de usuario.

## Uso local

1. Abre `index.html` en tu navegador preferido.
2. Personaliza los archivos dentro de `assets/` para ajustar estilos, reglas de negocio o textos según tus necesidades.

## Personalización sugerida

- Ajusta los nombres de máquinas y los indicadores en `data.js`.
- Modifica las reglas de severidad o los cálculos de KPIs en `logic.js`.
- Cambia la distribución de tarjetas o componentes visuales en `render.js` y `main.css`.

Con esta estructura modular, puedes ampliar fácilmente el panel para nuevas métricas, fuentes de datos o estilos corporativos.
