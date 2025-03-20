"use client"
import "./App.css"
import AdminPagos from "../src/componentes/AdminPagos"
import AdminProductos from "./componentes/AdminProductos.js"
import Navbar from "./componentes/NavBar.js"

import "./hoja-de-estilos/Logo.css"
import "./hoja-de-estilos/Barra-de-busqueda.css"
import ProductosComponent from "../src/componentes/Productos"
import LoginRegistro from "./componentes/LoginRegistro"
import AdminPanel from "./componentes/AdminPanel"
import PedidosPanel from "./componentes/PedidosPanel"
import MisPedidosComponent from "./componentes/MisPedidos"
import { useState, useEffect } from "react"
import { supabase } from "./utils/supabase.ts"

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
  const [isAdmin, setIsAdmin] = useState(false) // Nuevo estado para verificar si es admin
  const [loading, setLoading] = useState(true) // Estado para controlar la carga
  const [mostrarAdminPagos, setMostrarAdminPagos] = useState(false)
  // Añadir el estado para mostrar el panel de configuración de Nequi
  const [mostrarNequiConfig, setMostrarNequiConfig] = useState(false)
  // Añadir el estado para mostrar el panel de administración de productos
  const [mostrarAdminProductos, setMostrarAdminProductos] = useState(false)

  // Añadir nuevos estados para el flujo de pedido
  const [mostrarInfoEnvio, setMostrarInfoEnvio] = useState(false)
  const [mostrarPasarelaPago, setMostrarPasarelaPago] = useState(false)
  const [direccionEnvio, setDireccionEnvio] = useState("")
  const [infoPago, setInfoPago] = useState(null)

  // Nuevo estado para almacenar los productos cargados desde la base de datos
  const [todosLosProductos, setTodosLosProductos] = useState([])
  const [loadingProductos, setLoadingProductos] = useState(true)

  // Verificar sesión de usuario y permisos de administrador
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        setLoading(true)

        // Obtener sesión actual
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Error al obtener sesión:", sessionError)
          return
        }

        if (!session) {
          setUsuario(null)
          setIsAdmin(false)
          return
        }

        // Obtener datos del usuario
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError) {
          console.error("Error al obtener usuario:", userError)
          return
        }

        if (userData && userData.user) {
          // Verificar si el usuario es administrador
          const { data: adminData, error: adminError } = await supabase
            .from("usuarios")
            .select("*")
            .eq("email", userData.user.email)
            .single()

          if (adminError) {
            console.error("Error al verificar permisos:", adminError)
          } else if (adminData) {
            setUsuario({
              id: adminData.id || userData.user.id,
              email: adminData.email || userData.user.email,
              nombre: adminData.nombre || "Usuario",
              apellido: adminData.apellido || "",
              isAdmin: adminData.isadmin || false,
            })
            setIsAdmin(adminData.isadmin || false)
          }
        }
      } catch (error) {
        console.error("Error en la verificación de sesión:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUserSession()

    // Configurar listener para cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Estado de autenticación cambiado:", event)
      checkUserSession()
    })

    // Limpiar listener al desmontar
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [])

  // Modificado: useEffect para cargar productos desde Supabase
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoadingProductos(true)
        console.log("Cargando productos desde Supabase...")

        // Obtener productos de la base de datos
        const { data: productosData, error } = await supabase
          .from("productos")
          .select(`
            *,
            categorias:categoria_id (
              id,
              nombre
            )
          `)
          .order("nombre")

        if (error) {
          console.error("Error al cargar productos:", error)
          return
        }

        console.log(`Se encontraron ${productosData.length} productos en la base de datos`)

        // Formatear productos directamente sin buscar imágenes en otra tabla
        const productosFormateados = productosData.map((producto) => {
          // Usar directamente el array de imágenes del producto
          const imagenes = Array.isArray(producto.imagenes) ? producto.imagenes : []

          return {
            id: producto.id,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: `$${producto.precio.toLocaleString("es-ES")}`,
            categoria: producto.categorias ? producto.categorias.nombre : "Sin categoría",
            categoria_id: producto.categoria_id,
            colorUnico: producto.color_unico || null,
            // Usar la primera imagen del array o un placeholder
            imagen: imagenes.length > 0 ? imagenes[0] : "/placeholder.svg",
            // Guardar todo el array de imágenes
            imagenes: imagenes.length > 0 ? imagenes : ["/placeholder.svg"],
            tallas_disponibles: Array.isArray(producto.tallas_disponibles) ? producto.tallas_disponibles : [],
            colores_disponibles: Array.isArray(producto.colores_disponibles) ? producto.colores_disponibles : [],
          }
        })

        console.log("Productos formateados:", productosFormateados.length)
        // Mostrar información de depuración del primer producto
        if (productosFormateados.length > 0) {
          const primerProducto = productosFormateados[0]
          console.log("Primer producto:", primerProducto.nombre)
          console.log("Imágenes:", primerProducto.imagenes.length)
          if (primerProducto.imagenes.length > 0) {
            console.log(
              "Primera imagen:",
              typeof primerProducto.imagenes[0] === "string"
                ? primerProducto.imagenes[0].substring(0, 50) + "..."
                : "No es una cadena",
            )
          }
        }

        setTodosLosProductos(productosFormateados)
      } catch (error) {
        console.error("Error al cargar productos:", error)
      } finally {
        setLoadingProductos(false)
      }
    }

    cargarProductos()
  }, [])

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const agregarAlCarrito = (producto, cantidad, color, talla) => {
    // Usar el ID real del producto como base para el ID del item en el carrito
    const productoId = `${producto.id}-${color}-${talla}`

    const productoExistente = carrito.find((item) => item.id === productoId)

    if (productoExistente) {
      setCarrito(
        carrito.map((item) =>
          item.id === productoId ? { ...productoExistente, cantidad: productoExistente.cantidad + cantidad } : item,
        ),
      )
    } else {
      setCarrito([...carrito, { ...producto, cantidad, color, talla, id: productoId }])
    }

    // Guardar carrito en localStorage para recuperación
    localStorage.setItem(
      "carrito",
      JSON.stringify([...carrito, { ...producto, cantidad, color, talla, id: productoId }]),
    )
  }

  const eliminarDelCarrito = (productoId) => {
    const nuevoCarrito = carrito.filter((item) => item.id !== productoId)
    setCarrito(nuevoCarrito)

    // Actualizar localStorage
    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito))
  }

  const toggleCarrito = () => {
    setMostrarCarrito(!mostrarCarrito)
  }

  const toggleLogin = () => {
    setMostrarLogin(!mostrarLogin)
  }

  const toggleAdmin = () => {
    if (!isAdmin) {
      alert("No tienes permisos de administrador para acceder a esta sección.")
      return
    }
    setMostrarAdmin(!mostrarAdmin)
  }

  const togglePedidos = () => {
    if (!isAdmin) {
      alert("No tienes permisos de administrador para acceder a esta sección.")
      return
    }
    setMostrarPedidos(!mostrarPedidos)
  }

  const toggleMisPedidos = () => {
    setMostrarMisPedidos(!mostrarMisPedidos)
  }

  const toggleAdminPagos = () => {
    if (!isAdmin) {
      alert("No tienes permisos de administrador para acceder a esta sección.")
      return
    }
    setMostrarAdminPagos(!mostrarAdminPagos)
  }

  // Añadir la función para mostrar/ocultar el panel de Nequi
  const toggleNequiConfig = () => {
    if (!isAdmin) {
      alert("No tienes permisos de administrador para acceder a esta sección.")
      return
    }
    setMostrarNequiConfig(!mostrarNequiConfig)
  }

  // Añadir la función para mostrar/ocultar el panel de administración de productos
  const toggleAdminProductos = () => {
    if (!isAdmin) {
      alert("No tienes permisos de administrador para acceder a esta sección.")
      return
    }
    setMostrarAdminProductos(!mostrarAdminProductos)
  }

  // Modificado: Función para manejar productos agregados desde el panel de administración
  const handleProductoAgregado = async (nuevoProducto) => {
    console.log("Producto agregado, recargando productos...")

    // Recargar los productos después de agregar uno nuevo
    try {
      const { data, error } = await supabase
        .from("productos")
        .select(`
          *,
          categorias:categoria_id (
            id,
            nombre
          )
        `)
        .order("nombre")

      if (error) throw error

      // Formatear productos directamente sin buscar imágenes en otra tabla
      const productosFormateados = data.map((producto) => {
        // Usar directamente el array de imágenes del producto
        const imagenes = Array.isArray(producto.imagenes) ? producto.imagenes : []

        return {
          id: producto.id,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: `$${producto.precio.toLocaleString("es-ES")}`,
          categoria: producto.categorias ? producto.categorias.nombre : "Sin categoría",
          categoria_id: producto.categoria_id,
          colorUnico: producto.color_unico || null,
          // Usar la primera imagen del array o un placeholder
          imagen: imagenes.length > 0 ? imagenes[0] : "/placeholder.svg",
          // Guardar todo el array de imágenes
          imagenes: imagenes.length > 0 ? imagenes : ["/placeholder.svg"],
          tallas_disponibles: Array.isArray(producto.tallas_disponibles) ? producto.tallas_disponibles : [],
          colores_disponibles: Array.isArray(producto.colores_disponibles) ? producto.colores_disponibles : [],
        }
      })

      console.log("Productos actualizados:", productosFormateados.length)
      setTodosLosProductos(productosFormateados)
    } catch (error) {
      console.error("Error al actualizar productos:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUsuario(null)
      setIsAdmin(false)
      localStorage.removeItem("user")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const calcularTotal = () => {
    return carrito.reduce((total, item) => {
      let precioNumerico

      // Verificar si el precio es un string o un número
      if (typeof item.precio === "string") {
        // Si es string, eliminar el símbolo $ y los puntos, luego convertir a número
        precioNumerico = Number.parseFloat(item.precio.replace("$", "").replace(/\./g, ""))
      } else {
        // Si ya es un número, usarlo directamente
        precioNumerico = item.precio
      }

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
  const handleContinuarPago = (direccion) => {
    setDireccionEnvio(direccion)
    setMostrarInfoEnvio(false)
    setMostrarPasarelaPago(true)
  }

  const handlePagoCompletado = async (infoPago) => {
    setInfoPago(infoPago)

    // Cerrar la pasarela de pago
    setMostrarPasarelaPago(false)

    // Limpiar el carrito
    setCarrito([])
    localStorage.removeItem("carrito")

    // Mostrar mensaje de éxito
    alert("¡Pedido realizado con éxito! Puedes ver el estado de tu pedido en 'Mis Pedidos'.")
  }

  const cerrarPasarelaPago = () => {
    setMostrarPasarelaPago(false)
  }

  const cerrarInfoEnvio = () => {
    setMostrarInfoEnvio(false)
    // Opcional: volver a mostrar el carrito
    setMostrarCarrito(true)
  }

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const carritoGuardado = localStorage.getItem("carrito")
    if (carritoGuardado) {
      try {
        setCarrito(JSON.parse(carritoGuardado))
      } catch (e) {
        console.error("Error al cargar carrito desde localStorage:", e)
      }
    }
  }, [])

  // Mostrar indicador de carga mientras se verifica la sesión o se cargan los productos
  if (loading || loadingProductos) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando{loadingProductos ? " productos" : ""}...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

      {/* Use the new Navbar component */}
      <Navbar
        usuario={usuario}
        isAdmin={isAdmin}
        carrito={carrito}
        toggleLogin={toggleLogin}
        toggleAdmin={toggleAdmin}
        togglePedidos={togglePedidos}
        toggleAdminPagos={toggleAdminPagos}
        toggleNequiConfig={toggleNequiConfig}
        toggleAdminProductos={toggleAdminProductos}
        toggleMisPedidos={toggleMisPedidos}
        toggleCarrito={toggleCarrito}
        handleLogout={handleLogout}
        handleSearch={handleSearch}
        toggleDropdown={toggleDropdown}
        dropdownOpen={dropdownOpen}
        handleCategoriaSeleccionada={handleCategoriaSeleccionada}
      />

      <h2 className="centrar-texto">
        "RTH esencia te abre las puertas a una elección única
        <br /> de productos y ofertas bienvenido a la mejor tienda virtual"
      </h2>
      <br />

      <div className="ajustar">
        <h1>Bienvenido a RTH</h1>
      </div>

      {/* Renderizar todos los productos en un solo componente */}
      <ProductosComponent
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
                        <img
                          src={item.imagen || "/placeholder.svg"}
                          alt={item.nombre}
                          className="carrito-imagen"
                          onError={(e) => {
                            console.error(`Error al cargar imagen en carrito: ${item.nombre}`)
                            e.target.onerror = null
                            e.target.src = "/placeholder.svg"
                          }}
                        />
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
      {mostrarMisPedidos && usuario && <MisPedidosComponent onClose={toggleMisPedidos} userId={usuario.id} />}
      {mostrarAdminPagos && usuario && isAdmin && <AdminPagos onClose={toggleAdminPagos} />}
      {mostrarNequiConfig && usuario && isAdmin && <NequiConfigPanel onClose={toggleNequiConfig} />}
      {/* Agregar este componente para administrar productos */}
      {mostrarAdminProductos && usuario && isAdmin && (
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

