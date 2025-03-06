import React, { useState } from "react";
import '../hoja-de-estilos/Productos.css';

function Productos({ searchTerm, imagenproducto, imagenproducto2, imagenproducto3, nombreproducto, descripcionproducto, precioproducto, nombreproducto2, descripcionproducto2, precioproducto2, nombreproducto3, descripcionproducto3, precioproducto3, onAgregarAlCarrito }) {

  const productos = [
    {
      imagen: imagenproducto,
      nombre: nombreproducto,
      descripcion: descripcionproducto,
      precio: precioproducto
    },
    {
      imagen: imagenproducto2,
      nombre: nombreproducto2,
      descripcion: descripcionproducto2,
      precio: precioproducto2
    },
    {
      imagen: imagenproducto3,
      nombre: nombreproducto3,
      descripcion: descripcionproducto3,
      precio: precioproducto3
    }
  ];

  const [cantidades, setCantidades] = useState(Array(productos.length).fill(1));

  const actualizarCantidad = (index, nuevaCantidad) => {
    const nuevasCantidades = [...cantidades];
    nuevasCantidades[index] = nuevaCantidad < 1 ? 1 : nuevaCantidad;
    setCantidades(nuevasCantidades);
  };

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='product-container'>
      {productosFiltrados.length > 0 ? (
        productosFiltrados.map((producto, index) => (
          <div key={index} className='product-card'>
            <div className='product-image'>
              <img src={producto.imagen} alt={producto.nombre} />
            </div>
            <h3 className='product-title'>{producto.nombre}</h3>
            <p className='product-description'>{producto.descripcion}</p>
            <p className='product-price'>{producto.precio}</p>

            {/* Selector de cantidad con - y + */}
            <div className="cantidad-selector">
              <button
                className="btn-cantidad"
                onClick={() => actualizarCantidad(index, cantidades[index] - 1)}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={cantidades[index]}
                onChange={(e) => actualizarCantidad(index, parseInt(e.target.value))}
                className="cantidad-input"
              />
              <button
                className="btn-cantidad"
                onClick={() => actualizarCantidad(index, cantidades[index] + 1)}
              >
                +
              </button>
            </div>

            <button
              className='add-to-cart'
              onClick={() => onAgregarAlCarrito(producto, cantidades[index])}
            >
              Agregar al carrito
            </button>
          </div>
        ))
      ) : (
        <p>No se encontraron productos que coincidan con la búsqueda.</p>
      )}
    </div>
  );
}

export default Productos;
