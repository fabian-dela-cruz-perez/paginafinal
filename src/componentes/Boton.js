import React from "react";
import PropTypes from "prop-types";

const Boton = ({ texto, icono }) => {
  return (
    <button className="boton-con-icono">
      <i className={`fas ${icono}`} style={{ marginRight: "10px" }}></i>
      {texto}
    </button>
  );
};

Boton.propTypes = {
  texto: PropTypes.string.isRequired,
  icono: PropTypes.string, // Nombre del icono de FontAwesome
};

export default Boton;
