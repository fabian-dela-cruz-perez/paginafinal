import React from "react";
import '../hoja-de-estilos/Botones-nav.css'

function Boton ({texto}){
  return(
    <button
    className='estilos-botones'>
      {texto}
    </button>
    )
}

export default Boton;