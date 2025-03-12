"use client"

import { useState, useEffect } from "react"
import "../hoja-de-estilos/Productos.css"

function Productos({ productos, searchTerm, categoriaSeleccionada, onAgregarAlCarrito }) {
  // Cantidades de productos
  const [cantidades, setCantidades] = useState({})
  // Colores seleccionados para cada producto
  const [coloresSeleccionados, setColoresSeleccionados] = useState({})
  // Tallas seleccionadas para cada producto
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState({})
  // Estado para la imagen seleccionada de cada producto
  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState({})
  // Estado para el modal de imagen ampliada
  const [imagenAmpliada, setImagenAmpliada] = useState(null)

  const actualizarCantidad = (id, nuevaCantidad) => {
    setCantidades({
      ...cantidades,
      [id]: nuevaCantidad < 1 ? 1 : nuevaCantidad,
    })
  }

  const actualizarColor = (id, color) => {
    setColoresSeleccionados({
      ...coloresSeleccionados,
      [id]: color,
    })
  }

  const actualizarTalla = (id, talla) => {
    setTallasSeleccionadas({
      ...tallasSeleccionadas,
      [id]: talla,
    })
  }

  // Nueva función para actualizar la imagen seleccionada
  const actualizarImagenSeleccionada = (productoId, imagenUrl) => {
    setImagenesSeleccionadas({
      ...imagenesSeleccionadas,
      [productoId]: imagenUrl,
    })
  }

  // Función para obtener la imagen actual de un producto
  const getImagenSeleccionada = (producto, index) => {
    return imagenesSeleccionadas[index] || (producto.imagenes && producto.imagenes[0]) || producto.imagen
  }

  // Función para mostrar la imagen ampliada
  const mostrarImagenAmpliada = (imagenUrl, nombre) => {
    setImagenAmpliada({ url: imagenUrl, nombre: nombre })
  }

  // Función para cerrar la imagen ampliada
  const cerrarImagenAmpliada = () => {
    setImagenAmpliada(null)
  }

  // Obtener la cantidad actual de un producto
  const getCantidad = (id) => {
    return cantidades[id] || 1
  }

  // Obtener el color seleccionado de un producto
  const getColor = (id) => {
    return coloresSeleccionados[id] || ""
  }

  // Obtener la talla seleccionada de un producto
  const getTalla = (id) => {
    return tallasSeleccionadas[id] || ""
  }

  // Función para determinar si mostrar selector de color
  const mostrarSelectorColor = (categoria, producto) => {
    // Categorías que no necesitan selector de color
    const categoriasColorUnico = ["Accesorios", "Gorras"]

    // Verificar si es un conjunto de color único
    if (categoria === "Conjuntos" && producto && producto.colorUnico) {
      return false
    }

    return !categoriasColorUnico.includes(categoria)
  }

  // Función para determinar si mostrar selector de talla
  const mostrarSelectorTalla = (categoria) => {
    // Categorías que no necesitan selector de talla
    const categoriasTallaUnica = ["Accesorios"]
    return !categoriasTallaUnica.includes(categoria)
  }

  // Función para obtener el color predeterminado según la categoría o producto
  const getColorPredeterminado = (categoria, producto) => {
    // Si es un conjunto con color único, usar ese color
    if (categoria === "Conjuntos" && producto && producto.colorUnico) {
      return producto.colorUnico
    }

    switch (categoria) {
      case "Accesorios":
        return "único"
      case "Gorras":
        return "único"
      default:
        return ""
    }
  }

  // Función para obtener la talla predeterminada según la categoría
  const getTallaPredeterminada = (categoria) => {
    switch (categoria) {
      case "Accesorios":
        return "única"
      default:
        return ""
    }
  }

  // Opciones de colores disponibles
  const opcionesColores = [
    { valor: "", texto: "Seleccionar color" },
    { valor: "negro", texto: "Negro" },
    { valor: "blanco", texto: "Blanco" },
    { valor: "rojo", texto: "Rojo" },
    { valor: "azul", texto: "Azul" },
    { valor: "gris", texto: "Gris" },
    { valor: "verde", texto: "Verde" },
  ]

  // Función para obtener opciones de talla según categoría
  const getOpcionesTallasPorCategoria = (categoria) => {
    switch (categoria) {
      case "Gorras":
        return [
          { valor: "", texto: "Seleccionar talla" },
          { valor: "S", texto: "S" },
          { valor: "M", texto: "M" },
          { valor: "L", texto: "L" },
        ]
      case "Zapatos":
        return [
          { valor: "", texto: "Seleccionar talla" },
          { valor: "38", texto: "38" },
          { valor: "39", texto: "39" },
          { valor: "40", texto: "40" },
          { valor: "41", texto: "41" },
          { valor: "42", texto: "42" },
        ]
      default:
        return [
          { valor: "", texto: "Seleccionar talla" },
          { valor: "XS", texto: "XS" },
          { valor: "S", texto: "S" },
          { valor: "M", texto: "M" },
          { valor: "L", texto: "L" },
          { valor: "XL", texto: "XL" },
          { valor: "XXL", texto: "XXL" },
        ]
    }
  }

  // Filtrar productos por búsqueda y categoría
  const productosFiltrados =
    productos && productos.filter
      ? productos.filter((producto) => {
        // Verificar si el producto tiene nombre antes de filtrar
        if (!producto || !producto.nombre) return false

        // Convertir nombre y término de búsqueda a minúsculas para hacer la comparación
        const coincideBusqueda = producto.nombre.toLowerCase().includes((searchTerm || "").toLowerCase())

        // Mostrar productos de la categoría seleccionada o todos si es "Todos"
        const coincideCategoria = categoriaSeleccionada === "Todos" || producto.categoria === categoriaSeleccionada

        // Solo mostrar productos que coincidan con ambos filtros
        return coincideBusqueda && coincideCategoria
      })
      : []

  // Establecer valores predeterminados para productos según su categoría
  useEffect(() => {
    if (productos && productos.length > 0) {
      const nuevosColores = { ...coloresSeleccionados }
      const nuevasTallas = { ...tallasSeleccionadas }

      productos.forEach((producto, index) => {
        // Si es un conjunto con color único, establecer ese color
        if (producto.categoria === "Conjuntos" && producto.colorUnico) {
          nuevosColores[index] = producto.colorUnico
        }
        // Para otras categorías que no muestran selector de color
        else if (!mostrarSelectorColor(producto.categoria, producto) && !nuevosColores[index]) {
          nuevosColores[index] = getColorPredeterminado(producto.categoria, producto)
        }

        if (!mostrarSelectorTalla(producto.categoria) && !nuevasTallas[index]) {
          nuevasTallas[index] = getTallaPredeterminada(producto.categoria)
        }
      })

      setColoresSeleccionados(nuevosColores)
      setTallasSeleccionadas(nuevasTallas)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productos])

  // Manejar el agregar al carrito con color y talla
  const handleAgregarAlCarrito = (producto, index) => {
    let color = getColor(index)
    let talla = getTalla(index)
    const cantidad = getCantidad(index)

    // Para conjuntos de color único, usar ese color
    if (producto.categoria === "Conjuntos" && producto.colorUnico) {
      color = producto.colorUnico
    }
    // Para productos específicos, establecer valores predeterminados
    else if (!mostrarSelectorColor(producto.categoria, producto)) {
      color = color || getColorPredeterminado(producto.categoria, producto)
    }

    if (!mostrarSelectorTalla(producto.categoria)) {
      talla = talla || getTallaPredeterminada(producto.categoria)
    }

    // Validar solo si es necesario para este tipo de producto
    if (mostrarSelectorColor(producto.categoria, producto) && !color) {
      alert("Por favor selecciona un color")
      return
    }

    if (mostrarSelectorTalla(producto.categoria) && !talla) {
      alert("Por favor selecciona una talla")
      return
    }

    // Llamar a la función de agregar al carrito con los datos adicionales
    onAgregarAlCarrito(producto, cantidad, color, talla)
  }

  return (
    <div className="product-container">
      {productosFiltrados.length > 0 ? (
        productosFiltrados.map((producto, index) => (
          <div key={index} className="product-card">
            <div className="product-image-container">
              <div className="product-image main-image">
                <img
                  src={getImagenSeleccionada(producto, index) || "/placeholder.svg"}
                  alt={producto.nombre}
                  onClick={() => mostrarImagenAmpliada(getImagenSeleccionada(producto, index), producto.nombre)}
                />
              </div>

              {/* Galería de miniaturas */}
              {producto.imagenes && producto.imagenes.length > 0 && (
                <div className="product-thumbnails">
                  {producto.imagenes.map((imagen, imgIndex) => (
                    <button
                      key={imgIndex}
                      className={`thumbnail-button ${getImagenSeleccionada(producto, index) === imagen ? "selected" : ""}`}
                      onClick={() => actualizarImagenSeleccionada(index, imagen)}
                    >
                      <img
                        src={imagen || "/placeholder.svg"}
                        alt={`${producto.nombre} vista ${imgIndex + 1}`}
                        className="thumbnail-image"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <h3 className="product-title">{producto.nombre}</h3>
            <p className="product-description">{producto.descripcion}</p>
            <p className="product-price">{producto.precio}</p>

            {/* Selector de color - condicional según categoría y tipo de producto */}
            {producto.categoria === "Conjuntos" && producto.colorUnico ? (
              <div className="selector-container">
                <label className="selector-label">Color:</label>
                <div className="color-unico">{producto.colorUnico}</div>
              </div>
            ) : mostrarSelectorColor(producto.categoria, producto) ? (
              <div className="selector-container">
                <label htmlFor={`color-${index}`} className="selector-label">
                  Color:
                </label>
                <select
                  id={`color-${index}`}
                  className="selector-input"
                  value={getColor(index)}
                  onChange={(e) => actualizarColor(index, e.target.value)}
                >
                  {opcionesColores.map((opcion) => (
                    <option key={opcion.valor} value={opcion.valor}>
                      {opcion.texto}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="selector-container">
                <label className="selector-label">Color:</label>
                <div className="color-unico">{getColorPredeterminado(producto.categoria, producto)}</div>
              </div>
            )}

            {/* Selector de talla - condicional según categoría */}
            {mostrarSelectorTalla(producto.categoria) ? (
              <div className="selector-container">
                <label htmlFor={`talla-${index}`} className="selector-label">
                  Talla:
                </label>
                <select
                  id={`talla-${index}`}
                  className="selector-input"
                  value={getTalla(index)}
                  onChange={(e) => actualizarTalla(index, e.target.value)}
                >
                  {getOpcionesTallasPorCategoria(producto.categoria).map((opcion) => (
                    <option key={opcion.valor} value={opcion.valor}>
                      {opcion.texto}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="selector-container">
                <label className="selector-label">Talla:</label>
                <div className="talla-unica">{getTallaPredeterminada(producto.categoria)}</div>
              </div>
            )}

            {/* Selector de cantidad con - y + */}
            <div className="cantidad-selector">
              <button className="btn-cantidad" onClick={() => actualizarCantidad(index, getCantidad(index) - 1)}>
                -
              </button>
              <input
                type="number"
                min="1"
                value={getCantidad(index)}
                onChange={(e) => actualizarCantidad(index, Number.parseInt(e.target.value))}
                className="cantidad-input"
              />
              <button className="btn-cantidad" onClick={() => actualizarCantidad(index, getCantidad(index) + 1)}>
                +
              </button>
            </div>

            <button className="boton-agregar-carrito" onClick={() => handleAgregarAlCarrito(producto, index)}>
              Agregar al carrito
            </button>
          </div>
        ))
      ) : (
        <p className="no-products">No se encontraron productos</p>
      )}

      {/* Modal para imagen ampliada */}
      {imagenAmpliada && (
        <div className="imagen-ampliada-modal" onClick={cerrarImagenAmpliada}>
          <div className="imagen-ampliada-contenido" onClick={(e) => e.stopPropagation()}>
            <button className="cerrar-imagen" onClick={cerrarImagenAmpliada}>
              <i className="fas fa-times"></i>
            </button>
            <h3>{imagenAmpliada.nombre}</h3>
            <div className="imagen-ampliada-container">
              <img src={imagenAmpliada.url || "/placeholder.svg"} alt={imagenAmpliada.nombre} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Productos

