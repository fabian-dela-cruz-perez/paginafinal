import React from "react";

function BarraDeCategorias({ setCategoriaSeleccionada }) {
  return (
    <div className="categorias-container">
      <button onClick={() => setCategoriaSeleccionada("Todos")}>Todos</button>
      <button onClick={() => setCategoriaSeleccionada("Conjuntos")}>Conjuntos</button>
      <button onClick={() => setCategoriaSeleccionada("Gorras")}>Gorras</button>
      <button onClick={() => setCategoriaSeleccionada("Accesorios")}>Accesorios</button>
      <button onClick={() => setCategoriaSeleccionada("Zapatos")}>Zapatos</button>


    </div>
  );
}

export default BarraDeCategorias;
