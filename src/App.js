import "./App.css";
import "./hoja-de-estilos/Logo.css";
import SimpleSearchBar from "./componentes/Barra-de-busqueda";
import "./hoja-de-estilos/Barra-de-busqueda.css";
import Productos from "../src/componentes/Productos";
import LoginRegistro from "./componentes/LoginRegistro"; // Importar el componente de login/registro
import { useState } from "react";
import conjuntocalamar from "../src/imagenes/conjuto del juego del calamar.jpg";
import conjuntocapucha from "../src/imagenes/Conjunto capucha de manga larga con estampado de estrellas y letras de Super Windom.jpg";
import gorra from "../src/imagenes/gorra.jpg";

function App() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false); // Estado para mostrar el carrito
  const [mostrarLogin, setMostrarLogin] = useState(false); // Estado para mostrar el login/registro

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const agregarAlCarrito = (producto, cantidad) => {
    const productoExistente = carrito.find((item) => item.nombre === producto.nombre);

    if (productoExistente) {
      setCarrito(
        carrito.map((item) =>
          item.nombre === producto.nombre
            ? { ...productoExistente, cantidad: productoExistente.cantidad + cantidad }
            : item
        )
      );
    } else {
      setCarrito([...carrito, { ...producto, cantidad }]);
    }
  };

  const eliminarDelCarrito = (nombreProducto) => {
    setCarrito(carrito.filter((item) => item.nombre !== nombreProducto));
  };

  const toggleCarrito = () => {
    setMostrarCarrito(!mostrarCarrito); // Cambiar el estado para mostrar u ocultar el carrito
  };

  const toggleLogin = () => {
    setMostrarLogin(!mostrarLogin); // Cambiar el estado para mostrar u ocultar el login/registro
  };

  // Nueva función para calcular el total de los productos
  const calcularTotal = () => {
    return carrito.reduce((total, item) => {
      const precioNumerico = parseFloat(item.precio.replace("$", "").replace(".", ""));
      return total + precioNumerico * item.cantidad;
    }, 0);
  };

  return (
    <div className="App">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
      />
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
                  <button>Conjuntos</button>
                  <button>Gorras</button>
                  <button>Accesorios</button>
                </div>
              )}
            </div>

            {/* Botón "Yo" para abrir el modal de login/registro */}
            <button className="boton-con-icono" onClick={toggleLogin}>
              <i className="fas fa-user"></i> Yo
            </button>

            {/* Botón del carrito */}
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

      <div className="Productos-container">
        <Productos
          imagenproducto={conjuntocalamar}
          nombreproducto="Conjunto del juego del calamar"
          descripcionproducto="Conjunto deportivo inspirado en Squid Game, cómodo y ligero, ideal para entrenar o descansar."
          precioproducto="$50.000"
          imagenproducto2={conjuntocapucha}
          nombreproducto2="Conjunto capucha de manga larga con estampado de estrellas y letras de Super Wisdom"
          descripcionproducto2="Conjunto de sudadera y pantalón 'Super Wisdom', diseño moderno y cómodo para el día a día."
          precioproducto2="$45.000"
          imagenproducto3={gorra}
          nombreproducto3="Gorra"
          descripcionproducto3="Estilo audaz con diseño de llamas en colores vivos. Ideal para destacar en cualquier ocasión."
          precioproducto3="$60.000"
          searchTerm={searchTerm}
          onAgregarAlCarrito={agregarAlCarrito}
        />
      </div>

      {/* Modal del carrito */}
      {mostrarCarrito && (
        <div className="carrito-modal">
          <div className="carrito-content">
            <h2>Carrito de Compras</h2>
            {carrito.length === 0 ? (
              <p>El carrito está vacío</p>
            ) : (
              <ul>
                {carrito.map((item, index) => (
                  <li key={index}>
                    <div className="producto-carrito">
                      <img src={item.imagen} alt={item.nombre} className="carrito-imagen" />
                      <div className="carrito-detalles">
                        <h3>{item.nombre}</h3>
                        <p>{item.descripcion}</p>
                        <p>Cantidad: {item.cantidad}</p>
                        <p>Precio: {item.precio}</p>
                      </div>
                      <button
                        className="eliminar-producto"
                        onClick={() => eliminarDelCarrito(item.nombre)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Mostrar el total */}
            <div className="carrito-total">
              <h3>Total: ${calcularTotal().toLocaleString("es-ES")}</h3>
            </div>

            <button className="cerrar-carrito" onClick={toggleCarrito}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de login/registro */}
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
            <a
              href="https://wa.me/573043545082"
              className="social-icon"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-whatsapp"></i>
            </a>
            <a
              href="https://www.instagram.com/rth_esencia?igsh=MXV6azQ5c3h2eXMzNQ=="
              className="social-icon"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 RTH Esencia. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
