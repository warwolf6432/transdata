import React from "react";
import ReactDOM from "react-dom/client";
import Login from "./Login"; // Asegúrate de importar el archivo correcto
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Login /> {/* Renderiza la pantalla de Login en el inicio */}
  </React.StrictMode>
);
