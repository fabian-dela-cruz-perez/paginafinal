"use client"

import "./App.css"
import "./hoja-de-estilos/Logo.css"
import SimpleSearchBar from "./componentes/Barra-de-busqueda"
import "./hoja-de-estilos/Barra-de-busqueda.css"
import Productos from "../src/componentes/Productos"
import LoginRegistro from "./componentes/LoginRegistro"
import { useState } from "react"
import conjuntocalamar from "./imagenes/conjuto del juego del calamar.jpg"
import conjuntocapucha from "../src/imagenes/Conjunto para hombres, con estampado de los angeles.jpg"
import gorra from "./imagenes/gorra.jpg"
import conjuntodeportivo from "./imagenes/Conjunto deportivo para Hombre.jpg"
import conjuntoestampado from "../src/imagenes/Conjunto para hombres, con estampado de los angeles.jpg"
import zapatosfoam from "./imagenes/Zapatos foam runner.jpg"
import monedero from "./imagenes/monedero naruto.jpg"

function App() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos") // Mostrar todos por defecto
  const [carrito, setCarrito] = useState([])
  const [mostrarCarrito, setMostrarCarrito] = useState(false)
  const [mostrarLogin, setMostrarLogin] = useState(false)

  // Definir todos los productos en un solo array
  const todosLosProductos = [
    {
      id: 1,
      imagen: conjuntocalamar,
      nombre: "Conjunto del juego del calamar",
      descripcion: "Conjunto deportivo inspirado en Squid Game, cómodo y ligero, ideal para entrenar o descansar.",
      precio: "$50.000",
      categoria: "Conjuntos",
    },
    {
      id: 2,
      imagen: conjuntocapucha,
      nombre: "Conjunto capucha de manga larga con estampado de estrellas y letras de Super Wisdom",
      descripcion: "Conjunto de sudadera y pantalón 'Super Wisdom', diseño moderno y cómodo para el día a día.",
      precio: "$45.000",
      categoria: "Conjuntos",
    },
    {
      id: 3,
      imagen: gorra,
      nombre: "Gorra",
      descripcion: "Estilo audaz con diseño de llamas en colores vivos. Ideal para destacar en cualquier ocasión.",
      precio: "$60.000",
      categoria: "Gorras",
    },
    {
      id: 4,
      imagen: conjuntodeportivo,
      nombre: "Conjunto deportivo",
      descripcion:
        "Conjunto deportivo compuesto por camiseta de licra roja y shorts negros con diseño gráfico. Material de secado rápido, ideal para actividades acuáticas o al aire libre.",
      precio: "$80.000",
      categoria: "Conjuntos",
    },
    {
      id: 5,
      imagen: conjuntoestampado,
      nombre: "Conjunto deportivo negro",
      descripcion:
        "Conjunto deportivo negro de dos piezas, compuesto por sudadera y pantalones ajustados. Ideal para uso casual o deportivo.",
      precio: "$90.000",
      categoria: "Conjuntos",
    },
    {
      id: 6,
      imagen: zapatosfoam,
      nombre: "Zapatos foam",
      descripcion: "Estilo audaz con diseño de llamas en colores vivos. Ideal para destacar en cualquier ocasión.",
      precio: "$150.000",
      categoria: "Zapatos",
    },
    {
      id: 7,
      imagen: monedero,
      nombre: "Monedero de naruto",
      descripcion: "Monedero temático de Naruto, perfecto para fans del anime. Diseño práctico y duradero.",
      precio: "$80.000",
      categoria: "Accesorios",
    },
  ]

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const agregarAlCarrito = (producto, cantidad, color, talla) => {
    // Crear un identificador único para el producto con su color y talla
    const productoId = `${producto.nombre}-${color}-${talla}`

    const productoExistente = carrito.find(
      (item) => item.nombre === producto.nombre && item.color === color && item.talla === talla,
    )

    if (productoExistente) {
      setCarrito(
        carrito.map((item) =>
          item.nombre === producto.nombre && item.color === color && item.talla === talla
            ? { ...productoExistente, cantidad: productoExistente.cantidad + cantidad }
            : item,
        ),
      )
    } else {
      setCarrito([...carrito, { ...producto, cantidad, color, talla, id: productoId }])
    }
  }

  const eliminarDelCarrito = (productoId) => {
    setCarrito(carrito.filter((item) => item.id !== productoId))
  }

  const toggleCarrito = () => {
    setMostrarCarrito(!mostrarCarrito)
  }

  const toggleLogin = () => {
    setMostrarLogin(!mostrarLogin)
  }

  const calcularTotal = () => {
    return carrito.reduce((total, item) => {
      const precioNumerico = Number.parseFloat(item.precio.replace("$", "").replace(".", ""))
      return total + precioNumerico * item.cantidad
    }, 0)
  }

  const handleCategoriaSeleccionada = (categoria) => {
    setCategoriaSeleccionada(categoria) // Asignar la categoría seleccionada
    console.log("Categoría seleccionada:", categoria) // Para verificar el cambio
  }

  return (
    <div className="App">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      <header>
        <div>
          <nav className="nav-atributos">
            <div className="Logo">
              <span>RTH</span>
            </div>
            <div>
              <SimpleSearchBar onSearch={handleSearch} />
            </div>

            <button className="boton-con-icono">
              <i className="fas fa-home"></i> Inicio
            </button>

            <div className="dropdown">
              <button className="boton-con-icono" onClick={toggleDropdown}>
                <i className="fas fa-tags"></i> Catálogo
              </button>
              {dropdownOpen && (
                <div className="dropdown-content">
                  <button onClick={() => handleCategoriaSeleccionada("Todos")}>Todos</button>
                  <button onClick={() => handleCategoriaSeleccionada("Conjuntos")}>Conjuntos</button>
                  <button onClick={() => handleCategoriaSeleccionada("Gorras")}>Gorras</button>
                  <button onClick={() => handleCategoriaSeleccionada("Accesorios")}>Accesorios</button>
                  <button onClick={() => handleCategoriaSeleccionada("Zapatos")}>Zapatos</button>
                </div>
              )}
            </div>

            <button className="boton-con-icono" onClick={toggleLogin}>
              <i className="fas fa-user"></i> Yo
            </button>

            <button className="boton-con-icono" onClick={toggleCarrito}>
              <i className="fas fa-shopping-cart"></i> Carrito ({carrito.length})
            </button>
          </nav>
        </div>
      </header>

      <h2 className="centrar-texto">
        "RTH esencia te abre las puertas a una elección única
        <br /> de productos y ofertas bienvenido a la mejor tienda virtual"
      </h2>
      <br />

      <div className="ajustar">
        <h1>Bienvenido a RTH</h1>
      </div>

      {/* Renderizar todos los productos en un solo componente */}
      <Productos
        productos={todosLosProductos}
        searchTerm={searchTerm}
        categoriaSeleccionada={categoriaSeleccionada}
        onAgregarAlCarrito={agregarAlCarrito}
      />

      {mostrarCarrito && (
        <div className="carrito-modal">
          <div className="carrito-content">
            <div className="carrito-header">
              <h2>Carrito de Compras</h2>
              <span className="carrito-contador">
                {carrito.length} {carrito.length === 1 ? "producto" : "productos"}
              </span>
            </div>

            <div className="carrito-body">
              {carrito.length === 0 ? (
                <div className="carrito-empty">
                  <i
                    className="fas fa-shopping-cart"
                    style={{ fontSize: "48px", color: "#ddd", marginBottom: "15px" }}
                  ></i>
                  <p>Tu carrito está vacío</p>
                  <p>¡Agrega algunos productos para comenzar!</p>
                </div>
              ) : (
                <ul className="carrito-lista">
                  {carrito.map((item) => (
                    <li key={item.id}>
                      <div className="producto-carrito">
                        <img src={item.imagen || "/placeholder.svg"} alt={item.nombre} className="carrito-imagen" />
                        <div className="carrito-detalles">
                          <h3>{item.nombre}</h3>
                          <div>
                            <span className="detalle-color-talla">Color: {item.color}</span>
                            <span className="detalle-color-talla">Talla: {item.talla}</span>
                          </div>
                          <p>Cantidad: {item.cantidad}</p>
                          <p className="detalle-precio">{item.precio}</p>
                        </div>
                        <div className="carrito-acciones">
                          <button className="eliminar-producto" onClick={() => eliminarDelCarrito(item.id)}>
                            <i className="fas fa-trash-alt"></i> Eliminar
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="carrito-footer">
              <div className="carrito-total">
                <h3>Total:</h3>
                <span className="total-precio">${calcularTotal().toLocaleString("es-ES")}</span>
              </div>

              <div className="carrito-botones">
                <button className="cerrar-carrito" onClick={toggleCarrito}>
                  Cerrar
                </button>
                <button className="proceder-pago" disabled={carrito.length === 0}>
                  Proceder al pago
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarLogin && <LoginRegistro onClose={toggleLogin} />}

      <footer>
        <div className="footer-container">
          <div className="footer-left">
            <p>"La mejor tienda para encontrar lo que necesitas, solo en RTH"</p>
          </div>
          <div className="footer-center">
            <ul>
              <li>
                <a href="http://localhost:3000/">Inicio</a>
              </li>
              <li>
                <a href="http://localhost:3000/">Catálogo</a>
              </li>
              <li>
                <a href="http://localhost:3000/">Nosotros</a>
              </li>
              <li>
                <a href="http://localhost:3000/">Contacto</a>
              </li>
            </ul>
          </div>
          <div className="footer-right">
            <a
              href="https://www.facebook.com/share/169Yeh4dZE/"
              className="social-icon"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://wa.me/573043545082" className="social-icon" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-whatsapp"></i>
            </a>
            <a
              href="https://www.instagram.com/rth_esencia?igshid=MzRlODBiNWFlZA=="
              className="social-icon"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

