import React from "react";
import '../hoja-de-estilos/Productos.css'

function Productos(props){
    return(
      <div className='product-container'>
        <div className='product-card'>
          <div className='product-image'></div>
          <h3 className='product-title'>{props.nombreproducto}</h3>
          <p className='product-description'> {props.descripcionproducto} </p>
          <p className='product-price'> {props.precioproducto} </p>


        </div>
        
        <div className='product-card'>
          <div className='product-image'></div>
          <h3 className='product-title'>{props.nombreproducto2}</h3>
          <p className='product-description'> {props.descripcionproducto2} </p>
          <p className='product-price'> {props.precioproducto2} </p>
        </div>

        <div className='product-card'>
          <div className='product-image'></div>
          <h3 className='product-title'>{props.nombreproducto3}</h3>
          <p className='product-description'> {props.descripcionproducto3} </p>
          <p className='product-price'> {props.precioproducto3} </p>
        </div>
      </div>
    )
}

export default Productos;