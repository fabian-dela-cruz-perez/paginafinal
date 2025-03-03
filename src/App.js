import "./App.css"
import Boton from "../src/componentes/Boton"
import "./hoja-de-estilos/Logo.css"
import SimpleSearchBar from "./componentes/Barra-de-busqueda"
import "./hoja-de-estilos/Barra-de-busqueda.css"
import Productos from "./componentes/Productos.js"

function App() {
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
              <SimpleSearchBar />
            </div>
            <Boton texto={"Inicio"} />
            <Boton texto={"Catalogo"} />
            <Boton texto={"Yo"} />
            <Boton texto={"Carrito"} />
          </nav>
        </div>
      </header>
      <h2 className="centrar-texto">
        "RTH esencia te abre las puertas a una elección única
        <br /> de productos y ofertas bienvenido a la mejor tienda virtual
      </h2>
      <br />

      <div className="ajustar">
        <h1>Bienvenido a RTH</h1>
      </div>

      <Productos
        nombreproducto="camisa"
        descripcionproducto="camisa de tela transpirante"
        precioproducto="$50.000"
        nombreproducto2="pantalon"
        descripcionproducto2="jean azul"
        precioproducto2="$45.000"
        nombreproducto3="zapatos"
        descripcionproducto3="cuero de culebra"
        precioproducto3="$60.000"
      />

      <Productos
        nombreproducto="camisa"
        descripcionproducto="camisa de tela transpirante"
        precioproducto="$50.000"
        nombreproducto2="pantalon"
        descripcionproducto2="jean azul"
        precioproducto2="$45.000"
        nombreproducto3="zapatos"
        descripcionproducto3="cuero de culebra"
        precioproducto3="$60.000"
      />
      <Productos
        nombreproducto="camisa"
        descripcionproducto="camisa de tela transpirante"
        precioproducto="$50.000"
        nombreproducto2="pantalon"
        descripcionproducto2="jean azul"
        precioproducto2="$45.000"
        nombreproducto3="zapatos"
        descripcionproducto3="cuero de culebra"
        precioproducto3="$60.000"
      />
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
            <a href="https://facebook.com" className="social-icon" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://wa.me/1234567890" className="social-icon" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-whatsapp"></i>
            </a>
            <a href="https://instagram.com" className="social-icon" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 RTH Esencia. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

export default App

