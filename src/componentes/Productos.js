import React from "react";
import '../hoja-de-estilos/Productos.css';

function Productos({ searchTerm, nombreproducto, descripcionproducto, precioproducto, nombreproducto2, descripcionproducto2, precioproducto2, nombreproducto3, descripcionproducto3, precioproducto3 }) {

  const productos = [
    {
      nombre: nombreproducto,
      descripcion: descripcionproducto,
      precio: precioproducto
    },
    {
      nombre: nombreproducto2,
      descripcion: descripcionproducto2,
      precio: precioproducto2
    },
    {
      nombre: nombreproducto3,
      descripcion: descripcionproducto3,
      precio: precioproducto3
    }
  ];

  const productosFiltrados = productos.filter((producto) => 
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='product-container'>
      {productosFiltrados.length > 0 ? (
        productosFiltrados.map((producto, index) => (
          <div key={index} className='product-card'>
            <div className='product-image'></div>
            <h3 className='product-title'>{producto.nombre}</h3>
            <p className='product-description'>{producto.descripcion}</p>
            <p className='product-price'>{producto.precio}</p>
          </div>
        ))
      ) : (
        <p>No se encontraron productos</p>
      )}
    </div>
  );
}

export default Productos;
