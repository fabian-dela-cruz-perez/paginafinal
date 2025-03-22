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
  // Estado para rastrear errores de carga de imágenes
  const [imagenesConError, setImagenesConError] = useState({})

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

  // Función para manejar errores de carga de imágenes
  const manejarErrorImagen = (productoId, imagenIndex) => {
    console.error(`Error al cargar imagen ${imagenIndex} del producto ${productoId}`)
    setImagenesConError((prev) => ({
      ...prev,
      [`${productoId}_${imagenIndex}`]: true,
    }))
  }

  // Nueva función para actualizar la imagen seleccionada
  const actualizarImagenSeleccionada = (productoId, imagenUrl, imagenIndex) => {
    console.log(
      `Seleccionando imagen ${imagenIndex} para producto ${productoId}:`,
      imagenUrl ? imagenUrl.substring(0, 50) + "..." : "undefined",
    )
    setImagenesSeleccionadas({
      ...imagenesSeleccionadas,
      [productoId]: { url: imagenUrl, index: imagenIndex },
    })
  }

  // Función para obtener la imagen actual de un producto
  const getImagenSeleccionada = (producto, productoId) => {
    // Si hay una imagen seleccionada para este producto, usarla
    if (imagenesSeleccionadas[productoId] && imagenesSeleccionadas[productoId].url) {
      return imagenesSeleccionadas[productoId].url
    }

    // Si no, usar la primera imagen disponible
    if (producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
      // Verificar si la primera imagen tiene error
      if (imagenesConError[`${productoId}_0`]) {
        // Buscar la primera imagen sin error
        for (let i = 1; i < producto.imagenes.length; i++) {
          if (!imagenesConError[`${productoId}_${i}`]) {
            return producto.imagenes[i]
          }
        }
        // Si todas tienen error, usar placeholder
        return "/placeholder.svg"
      }
      return producto.imagenes[0]
    }

    // Si no hay imágenes en el array, intentar usar la propiedad imagen
    if (producto.imagen) {
      return producto.imagen
    }

    // Si no hay ninguna imagen, usar placeholder
    return "/placeholder.svg"
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
  const getColor = (id, producto) => {
    // Si el producto tiene colores disponibles, usar esos
    if (producto && producto.colores_disponibles && producto.colores_disponibles.length > 0) {
      return coloresSeleccionados[id] || producto.colores_disponibles[0]
    }
    return coloresSeleccionados[id] || ""
  }

  // Obtener la talla seleccionada de un producto
  const getTallaInterna = (id, producto) => {
    // Si el producto tiene tallas disponibles, usar esas
    if (producto && producto.tallas_disponibles && producto.tallas_disponibles.length > 0) {
      return tallasSeleccionadas[id] || producto.tallas_disponibles[0]
    }
    return tallasSeleccionadas[id] || ""
  }

  // Función para determinar si mostrar selector de color
  const mostrarSelectorColor = (categoria, producto) => {
    // Si el producto tiene un color único definido, no mostrar selector
    if (producto && producto.color_unico) {
      return false
    }

    // Si el producto tiene colores disponibles, siempre mostrar selector
    if (producto && producto.colores_disponibles && producto.colores_disponibles.length > 0) {
      return true
    }

    // Categorías que no necesitan selector de color
    const categoriasColorUnico = ["Accesorios", "Gorras"]
    return !categoriasColorUnico.includes(categoria)
  }

  // Función para determinar si mostrar selector de talla
  const mostrarSelectorTalla = (categoria, producto) => {
    // Si el producto tiene tallas disponibles, siempre mostrar selector
    if (producto && producto.tallas_disponibles && producto.tallas_disponibles.length > 0) {
      return true
    }

    // Categorías que no necesitan selector de talla
    const categoriasTallaUnica = ["Accesorios"]
    return !categoriasTallaUnica.includes(categoria)
  }

  // Función para obtener el color predeterminado según la categoría o producto
  const getColorPredeterminado = (categoria, producto) => {
    // Si el producto tiene colores disponibles, usar el primero
    if (producto && producto.colores_disponibles && producto.colores_disponibles.length > 0) {
      return producto.colores_disponibles[0]
    }

    // Si es un conjunto con color único, usar ese color
    if (categoria === "Conjuntos" && producto && producto.color_unico) {
      return producto.color_unico
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
  const getTallaPredeterminada = (categoria, producto) => {
    // Si el producto tiene tallas disponibles, usar la primera
    if (producto && producto.tallas_disponibles && producto.tallas_disponibles.length > 0) {
      return producto.tallas_disponibles[0]
    }

    switch (categoria) {
      case "Accesorios":
        return "única"
      default:
        return ""
    }
  }

  // Opciones de colores disponibles
  const getOpcionesColores = (producto) => {
    // Si el producto tiene colores disponibles, usarlos
    if (producto && producto.colores_disponibles && producto.colores_disponibles.length > 0) {
      return [
        { valor: "", texto: "Seleccionar color" },
        ...producto.colores_disponibles.map((color) => ({
          valor: color.toLowerCase(),
          texto: color.charAt(0).toUpperCase() + color.slice(1).toLowerCase(),
        })),
      ]
    }

    // Si no, usar opciones predeterminadas
    return [
      { valor: "", texto: "Seleccionar color" },
      { valor: "negro", texto: "Negro" },
      { valor: "blanco", texto: "Blanco" },
      { valor: "rojo", texto: "Rojo" },
      { valor: "azul", texto: "Azul" },
      { valor: "gris", texto: "Gris" },
      { valor: "verde", texto: "Verde" },
    ]
  }

  // Función para obtener opciones de talla según categoría y producto
  const getOpcionesTallas = (categoria, producto) => {
    // Si el producto tiene tallas disponibles, usarlas
    if (producto && producto.tallas_disponibles && producto.tallas_disponibles.length > 0) {
      return [
        { valor: "", texto: "Seleccionar talla" },
        ...producto.tallas_disponibles.map((talla) => ({ valor: talla, texto: talla })),
      ]
    }

    // Si no, usar opciones según categoría
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
        const coincideCategoria =
          categoriaSeleccionada === "Todos" ||
          (producto.categoria_id && producto.categoria_id === categoriaSeleccionada) ||
          (producto.categoria && producto.categoria === categoriaSeleccionada)

        // Solo mostrar productos que coincidan con ambos filtros
        return coincideBusqueda && coincideCategoria
      })
      : []

  // Establecer valores predeterminados para productos según su categoría
  useEffect(() => {
    if (productos && productos.length > 0) {
      const nuevosColores = { ...coloresSeleccionados }
      const nuevasTallas = { ...tallasSeleccionadas }
      const nuevasImagenes = { ...imagenesSeleccionadas }

      productos.forEach((producto, index) => {
        // Establecer imagen predeterminada
        if (
          producto.imagenes &&
          Array.isArray(producto.imagenes) &&
          producto.imagenes.length > 0 &&
          !nuevasImagenes[index]
        ) {
          nuevasImagenes[index] = { url: producto.imagenes[0], index: 0 }
        }

        // Si el producto tiene color único, no establecer color seleccionado
        if (producto.color_unico) {
          // No hacer nada, se usará el color único
        }
        // Establecer color predeterminado
        else if (producto.colores_disponibles && producto.colores_disponibles.length > 0 && !nuevosColores[index]) {
          nuevosColores[index] = producto.colores_disponibles[0]
        }
        // Para otras categorías que no muestran selector de color
        else if (!mostrarSelectorColor(producto.categoria, producto) && !nuevosColores[index]) {
          nuevosColores[index] = getColorPredeterminado(producto.categoria, producto)
        }

        // Establecer talla predeterminada
        if (producto.tallas_disponibles && producto.tallas_disponibles.length > 0 && !nuevasTallas[index]) {
          nuevasTallas[index] = producto.tallas_disponibles[0]
        } else if (!mostrarSelectorTalla(producto.categoria, producto) && !nuevasTallas[index]) {
          nuevasTallas[index] = getTallaPredeterminada(producto.categoria, producto)
        }
      })

      setImagenesSeleccionadas(nuevasImagenes)
      setColoresSeleccionados(nuevosColores)
      setTallasSeleccionadas(nuevasTallas)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productos])

  // Manejar el agregar al carrito con color y talla
  const handleAgregarAlCarrito = (producto, index) => {
    // Si el producto tiene un color único definido, usarlo
    let color = producto.color_unico || getColor(index, producto)
    let talla = getTallaInterna(index, producto)
    const cantidad = getCantidad(index)

    // Para productos específicos, establecer valores predeterminados
    if (!producto.color_unico && !mostrarSelectorColor(producto.categoria, producto)) {
      color = color || getColorPredeterminado(producto.categoria, producto)
    }

    talla = talla || getTallaPredeterminada(producto.categoria, producto)

    // Validar solo si es necesario para este tipo de producto
    if (!producto.color_unico && mostrarSelectorColor(producto.categoria, producto) && !color) {
      alert("Por favor selecciona un color")
      return
    }

    if (mostrarSelectorTalla(producto.categoria, producto) && !talla) {
      alert("Por favor selecciona una talla")
      return
    }

    // Llamar a la función de agregar al carrito con los datos adicionales
    onAgregarAlCarrito(producto, cantidad, color, talla)
  }

  // Depurar información de productos
  useEffect(() => {
    if (productos && productos.length > 0) {
      console.log("Productos cargados:", productos.length)
      const primerProducto = productos[0]
      console.log("Primer producto:", primerProducto.nombre)

      if (primerProducto.imagenes) {
        console.log(
          "Imágenes del primer producto:",
          Array.isArray(primerProducto.imagenes) ? primerProducto.imagenes.length : "No es un array",
        )
        if (Array.isArray(primerProducto.imagenes) && primerProducto.imagenes.length > 0) {
          console.log(
            "Primera imagen:",
            primerProducto.imagenes[0] ? primerProducto.imagenes[0].substring(0, 50) + "..." : "undefined",
          )
        }
      } else {
        console.log("El primer producto no tiene propiedad 'imagenes'")
      }
    }
  }, [productos])

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
                  onError={() => manejarErrorImagen(index, imagenesSeleccionadas[index]?.index || 0)}
                />
              </div>

              {/* Galería de miniaturas */}
              {producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0 && (
                <div className="product-thumbnails">
                  {producto.imagenes.map((imagen, imgIndex) => (
                    <button
                      key={imgIndex}
                      className={`thumbnail-button ${imagenesSeleccionadas[index]?.index === imgIndex ? "selected" : ""
                        }`}
                      onClick={() => actualizarImagenSeleccionada(index, imagen, imgIndex)}
                    >
                      <img
                        src={imagen || "/placeholder.svg"}
                        alt={`${producto.nombre} vista ${imgIndex + 1}`}
                        className="thumbnail-image"
                        onError={() => manejarErrorImagen(index, imgIndex)}
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
            {producto.color_unico ? (
              <div className="selector-container">
                <label className="selector-label">Color:</label>
                <div className="color-unico">{producto.color_unico}</div>
              </div>
            ) : mostrarSelectorColor(producto.categoria, producto) ? (
              <div className="selector-container">
                <label htmlFor={`color-${index}`} className="selector-label">
                  Color:
                </label>
                <select
                  id={`color-${index}`}
                  className="selector-input"
                  value={getColor(index, producto)}
                  onChange={(e) => actualizarColor(index, e.target.value)}
                >
                  {getOpcionesColores(producto).map((opcion) => (
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
            {mostrarSelectorTalla(producto.categoria, producto) ? (
              <div className="selector-container">
                <label htmlFor={`talla-${index}`} className="selector-label">
                  Talla:
                </label>
                <select
                  id={`talla-${index}`}
                  className="selector-input"
                  value={getTallaInterna(index, producto)}
                  onChange={(e) => actualizarTalla(index, e.target.value)}
                >
                  {getOpcionesTallas(producto.categoria, producto).map((opcion) => (
                    <option key={opcion.valor} value={opcion.valor}>
                      {opcion.texto}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="selector-container">
                <label className="selector-label">Talla:</label>
                <div className="talla-unica">{getTallaPredeterminada(producto.categoria, producto)}</div>
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
              <img
                src={imagenAmpliada.url || "/placeholder.svg"}
                alt={imagenAmpliada.nombre}
                onError={(e) => {
                  console.error("Error al cargar imagen ampliada")
                  e.target.onerror = null
                  e.target.src = "/placeholder.svg"
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Productos

