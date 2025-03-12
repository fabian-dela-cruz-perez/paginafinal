"use client"
import AdminPagos from "../src/componentes/AdminPagos"
import AdminProductos from "./componentes/AdminProductos"

import "./App.css"
import "./hoja-de-estilos/Logo.css"
import SimpleSearchBar from "./componentes/Barra-de-busqueda"
import "./hoja-de-estilos/Barra-de-busqueda.css"
import Productos from "../src/componentes/Productos"
import LoginRegistro from "./componentes/LoginRegistro"
import AdminPanel from "./componentes/AdminPanel"
import PedidosPanel from "./componentes/PedidosPanel"
import MisPedidos from "./componentes/MisPedidos"
import { useState, useEffect } from "react"
import conjuntocalamar from "./imagenes/conjuntocalamar/conjuntocalamar1.jpg"
import conjuntocapucha from "../src/imagenes/conjuntocapucha/conjuntocapucha1.jpg"
import gorra from "./imagenes/gorra/gorra1.jpg"
import conjuntodeportivo from "./imagenes/conjuntodeportivo/conjuntodeportivo1.jpg"
import conjuntonegro from "./imagenes/conjuntonegro/conjuntonegro1.jpg"
import zapatosfoam from "../src/imagenes/zapatosfoam/zapatosfoam1.jpg"
import monedero from "./imagenes/monedero/monedero1.jpg"
import zapatoscorrer from "../src/imagenes/Zapatos deportivos para correr.jpg"
import zapatoscasuales from "../src/imagenes/Zapatos Casuales Retro.jpg"


// Importar imágenes adicionales para cada producto (ejemplo)
import conjuntocalamar2 from "../src/imagenes/conjuntocalamar/conjuntocalamar2.jpg"// Asegúrate de tener estas imágenes
import conjuntocalamar3 from "../src/imagenes/conjuntocalamar/conjuntocalamar3.jpg" // o reemplaza con rutas correctas
import conjuntocapucha2 from "../src/imagenes/conjuntocapucha/conjuntocapucha2.jpg"
import conjuntocapucha3 from "../src/imagenes/conjuntocapucha/conjuntocapucha3.jpg"
import zapatosfoam2 from "../src/imagenes/zapatosfoam/zapatosfoam2.jpg"
import zapatosfoam3 from "../src/imagenes/zapatosfoam/zapatosfoam3.jpg"
import gorra2 from "./imagenes/gorra/gorra2.jpg"
import gorra3 from "./imagenes/gorra/gorra3.jpg"
import conjuntodeportivo2 from "./imagenes/conjuntodeportivo/conjuntodeportivo2.jpg"
import conjuntodeportivo3 from "./imagenes/conjuntodeportivo/conjuntodeportivo3.jpg"
import conjuntonegro2 from "./imagenes/conjuntonegro/conjuntonegro2.jpg"
import conjuntonegro3 from "./imagenes/conjuntonegro/conjuntonegro3.jpg"
import monedero2 from "./imagenes/monedero/monedero1.jpg"
import monedero3 from "./imagenes/monedero/monedero3.jpg"

// Importar los nuevos componentes en la parte superior del archivo
import InformacionEnvio from "./componentes/InformacionEnvio"
import PasarelaPago from "./componentes/PasarelaPago"
import NequiConfigPanel from "./componentes/NequiConfigPanel"

function App() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos") // Mostrar todos por defecto
  const [carrito, setCarrito] = useState([])
  const [mostrarCarrito, setMostrarCarrito] = useState(false)
  const [mostrarLogin, setMostrarLogin] = useState(false)
  const [mostrarAdmin, setMostrarAdmin] = useState(false)
  const [mostrarPedidos, setMostrarPedidos] = useState(false)
  const [mostrarMisPedidos, setMostrarMisPedidos] = useState(false)
  const [usuario, setUsuario] = useState(null)
  const [mostrarAdminPagos, setMostrarAdminPagos] = useState(false)
  // Añadir el estado para mostrar el panel de configuración de Nequi
  const [mostrarNequiConfig, setMostrarNequiConfig] = useState(false)
  // Añadir el estado para mostrar el panel de administración de productos
  const [mostrarAdminProductos, setMostrarAdminProductos] = useState(false)

  // Añadir nuevos estados para el flujo de pedido
  const [mostrarInfoEnvio, setMostrarInfoEnvio] = useState(false)
  const [mostrarPasarelaPago, setMostrarPasarelaPago] = useState(false)
  const [direccionEnvio, setDireccionEnvio] = useState("")
  // const [datosEnvio, setDatosEnvio] = useState(null); // Se utilizará en futuras implementaciones
  const [infoPago, setInfoPago] = useState(null)

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("user")
    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado))
      } catch (error) {
        console.error("Error al parsear usuario:", error)
        localStorage.removeItem("user")
      }
    }
  }, [])

  // Definir todos los productos en un solo array
  const todosLosProductos = [
    {
      imagen: conjuntocalamar,
      imagenes: [
        conjuntocalamar,
        conjuntocalamar2, // Imagen adicional 1
        conjuntocalamar3, // Imagen adicional 2
      ],
      nombre: "Conjunto del juego del calamar",
      descripcion: "Conjunto deportivo inspirado en Squid Game, cómodo y ligero, ideal para entrenar o descansar.",
      precio: "$50.000",
      categoria: "Conjuntos",
      colorUnico: "Unico", // Añadido colorUnico
    },
    {
      imagen: conjuntocapucha,
      imagenes: [
        conjuntocapucha,
        conjuntocapucha2, // Imagen adicional 1
        conjuntocapucha3, // Imagen adicional 2
      ],
      nombre: "Conjunto capucha de manga larga con estampado de estrellas y letras de Super Wisdom",
      descripcion: "Conjunto de sudadera y pantalón 'Super Wisdom', diseño moderno y cómodo para el día a día.",
      precio: "$45.000",
      categoria: "Conjuntos",
      colorUnico: "Unico", // Añadido colorUnico
    },
    {
      imagen: gorra,
      imagenes: [
        gorra,
        gorra2,
        gorra3
      ],
      nombre: "Gorra",
      descripcion: "Estilo audaz con diseño de llamas en colores vivos. Ideal para destacar en cualquier ocasión.",
      precio: "$60.000",
      categoria: "Gorras",
    },
    {
      imagen: conjuntodeportivo,
      imagenes: [
        conjuntodeportivo,
        conjuntodeportivo2,
        conjuntodeportivo3
      ],
      nombre: "Conjunto deportivo",
      descripcion:
        "Conjunto deportivo compuesto por camiseta de licra roja y shorts negros con diseño gráfico. Material de secado rápido, ideal para actividades acuáticas o al aire libre.",
      precio: "$80.000",
      categoria: "Conjuntos",
    },
    {
      imagen: conjuntonegro,
      imagenes: [
        conjuntonegro,
        conjuntonegro2,
        conjuntonegro3
      ],
      nombre: "Conjunto deportivo negro",
      descripcion:
        "Conjunto deportivo negro de dos piezas, compuesto por sudadera y pantalones ajustados. Ideal para uso casual o deportivo.",
      precio: "$90.000",
      categoria: "Conjuntos",
      colorUnico: "Negro", // Añadido colorUnico
    },
    {
      imagen: zapatosfoam,
      imagenes: [
        zapatosfoam,
        zapatosfoam2, // Imagen adicional 1
        zapatosfoam3, // Imagen adicional 2
      ],
      nombre: "Zapatos foam",
      descripcion: "Estilo audaz con diseño de llamas en colores vivos. Ideal para destacar en cualquier ocasión.",
      precio: "$150.000",
      categoria: "Zapatos",
    },
    {
      imagen: monedero,
      imagenes: [monedero,
        monedero2,
        monedero3
      ],
      nombre: "Monedero de naruto",
      descripcion: "Monedero temático de Naruto, perfecto para fans del anime. Diseño práctico y duradero.",
      precio: "$80.000",
      categoria: "Accesorios",
    },
    {
      imagen: zapatoscorrer,
      nombre: "Zapatos deportivos",
      descripcion:
        "Estas zapatillas parecen estar diseñadas para ofrecer comodidad y un estilo audaz, ideales tanto para entrenar como para uso casual.",
      precio: "$180.000",
      categoria: "Zapatos",
    },
    {
      imagen: zapatoscasuales,
      nombre: "Zapatos casuales retro",
      descripcion:
        "Zapatillas deportivas blancas con detalles en azul y patrón estilo bandana, suela gruesa y toques rojos en el cierre.",
      precio: "$180.000",
      categoria: "Zapatos",
    },
    {
      imagen: "",
      nombre: "",
      descripcion: "",
      precio: "",
      categoria: "",
    },
    {
      imagen: "",
      nombre: "",
      descripcion: "",
      precio: "",
      categoria: "",
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

  const toggleAdmin = () => {
    setMostrarAdmin(!mostrarAdmin)
  }

  const togglePedidos = () => {
    setMostrarPedidos(!mostrarPedidos)
  }

  const toggleMisPedidos = () => {
    setMostrarMisPedidos(!mostrarMisPedidos)
  }

  const toggleAdminPagos = () => {
    setMostrarAdminPagos(!mostrarAdminPagos)
  }

  // Añadir la función para mostrar/ocultar el panel de Nequi
  const toggleNequiConfig = () => {
    setMostrarNequiConfig(!mostrarNequiConfig)
  }

  // Añadir la función para mostrar/ocultar el panel de administración de productos
  const toggleAdminProductos = () => {
    setMostrarAdminProductos(!mostrarAdminProductos)
  }

  // Función para manejar productos agregados desde el panel de administración
  const handleProductoAgregado = (nuevoProducto) => {
    // Aquí puedes actualizar el estado de productos si es necesario
    console.log("Producto agregado:", nuevoProducto)
  }

  const handleLogout = () => {
    setUsuario(null)
    localStorage.removeItem("user")
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

  // Reemplazar la función realizarPedido con esta nueva versión
  const realizarPedido = () => {
    if (!usuario) {
      alert("Debes iniciar sesión para realizar un pedido")
      toggleLogin()
      return
    }

    if (carrito.length === 0) {
      alert("Tu carrito está vacío")
      return
    }

    // Mostrar el formulario de información de envío
    setMostrarCarrito(false)
    setMostrarInfoEnvio(true)
  }

  // Añadir nuevas funciones para manejar el flujo de pedido
  const handleContinuarPago = (direccion, datos) => {
    setDireccionEnvio(direccion)
    // setDatosEnvio(datos);
    setMostrarInfoEnvio(false)
    setMostrarPasarelaPago(true)
  }

  const handlePagoCompletado = async (infoPago) => {
    setInfoPago(infoPago)

    try {
      // Preparar datos del pedido
      const pedidoData = {
        usuario: {
          id: usuario.id,
          nombre: `${usuario.nombre} ${usuario.apellido}`,
          email: usuario.email,
        },
        productos: carrito.map((item) => ({
          nombre: item.nombre,
          precio: item.precio,
          cantidad: item.cantidad,
          color: item.color,
          talla: item.talla,
        })),
        total: calcularTotal(),
        direccionEnvio,
        pago: infoPago,
      }

      // Enviar pedido al servidor
      const response = await fetch("http://localhost:5000/api/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pedidoData),
      })

      if (!response.ok) {
        throw new Error("Error al procesar el pedido")
      }

      // Limpiar carrito
      setCarrito([])
    } catch (error) {
      console.error("Error:", error)
      alert("No se pudo procesar tu pedido. Por favor, intenta de nuevo.")
    }
  }

  const cerrarPasarelaPago = () => {
    setMostrarPasarelaPago(false)
    if (infoPago) {
      // Si el pago fue exitoso, mostrar mensaje
      alert("¡Pedido realizado con éxito! Puedes ver el estado de tu pedido en 'Mis Pedidos'.")
      setInfoPago(null)
    }
  }

  const cerrarInfoEnvio = () => {
    setMostrarInfoEnvio(false)
    // Opcional: volver a mostrar el carrito
    setMostrarCarrito(true)
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
              <i className="fas fa-user"></i> {usuario ? usuario.nombre : "Yo"}
            </button>

            {usuario && usuario.isAdmin && (
              <>
                <button className="boton-con-icono admin-button" onClick={toggleAdmin}>
                  <i className="fas fa-users-cog"></i> Usuarios
                </button>
                <button className="boton-con-icono pedidos-button" onClick={togglePedidos}>
                  <i className="fas fa-shopping-bag"></i> Pedidos
                </button>
                <button className="boton-con-icono pagos-button" onClick={toggleAdminPagos}>
                  <i className="fas fa-credit-card"></i> Pagos
                </button>
                <button className="boton-con-icono nequi-button" onClick={toggleNequiConfig}>
                  <i className="fas fa-mobile-alt"></i> Nequi
                </button>
                {/* Agregar este nuevo botón para administrar productos */}
                <button className="boton-con-icono productos-button" onClick={toggleAdminProductos}>
                  <i className="fas fa-box"></i> Productos
                </button>
              </>
            )}

            {usuario && !usuario.isAdmin && (
              <button className="boton-con-icono mis-pedidos-button" onClick={toggleMisPedidos}>
                <i className="fas fa-box"></i> Mis Pedidos
              </button>
            )}

            {usuario && (
              <button className="boton-con-icono" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Cerrar sesión
              </button>
            )}

            {!usuario?.isAdmin && (
              <button className="boton-con-icono" onClick={toggleCarrito}>
                <i className="fas fa-shopping-cart"></i> Carrito ({carrito.length})
              </button>
            )}
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
                <button className="proceder-pago" disabled={carrito.length === 0} onClick={realizarPedido}>
                  Realizar Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarLogin && <LoginRegistro onClose={toggleLogin} />}
      {mostrarAdmin && <AdminPanel onClose={toggleAdmin} />}
      {mostrarPedidos && <PedidosPanel onClose={togglePedidos} />}
      {mostrarMisPedidos && usuario && <MisPedidos onClose={toggleMisPedidos} userId={usuario.id} />}
      {mostrarAdminPagos && usuario && usuario.isAdmin && <AdminPagos onClose={toggleAdminPagos} />}
      {mostrarNequiConfig && usuario && usuario.isAdmin && <NequiConfigPanel onClose={toggleNequiConfig} />}
      {/* Agregar este componente para administrar productos */}
      {mostrarAdminProductos && usuario && usuario.isAdmin && (
        <AdminProductos onClose={toggleAdminProductos} onProductoAgregado={handleProductoAgregado} />
      )}

      {mostrarInfoEnvio && (
        <InformacionEnvio total={calcularTotal()} onClose={cerrarInfoEnvio} onContinuarPago={handleContinuarPago} />
      )}

      {mostrarPasarelaPago && (
        <PasarelaPago
          total={calcularTotal()}
          onClose={cerrarPasarelaPago}
          onPagoCompletado={handlePagoCompletado}
          direccionEnvio={direccionEnvio}
        />
      )}

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