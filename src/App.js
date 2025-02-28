import './App.css';
import Boton from '../src/componentes/Boton';
import './hoja-de-estilos/Logo.css';
import SimpleSearchBar from './componentes/Barra-de-busqueda';
import './hoja-de-estilos/Barra-de-busqueda.css';
import Productos from './componentes/Productos.js';



function App() {

  return (
    <div className="App">
      <header>
        <div>
          <nav className='nav-atributos'>
            <div className='Logo'>
              <span>RTH</span>
            </div>
            <div><SimpleSearchBar/></div>
            <Boton
            texto={'Inicio'}
            />
            <Boton
            texto={'Catalogo'}/>
            <Boton
            texto={'Yo'}/>
            <Boton
            texto={'Carrito'}
            />
          </nav>
        </div>
      </header>
        <h2 className='centrar-texto'>
          "RTH esencia te abre las puertas a 
          una elección única<br/> de productos y ofertas
          bienvenido a la mejor tienda virtual
        </h2>
      <br/>
      <h1>Bienvenido a RTH</h1>        
      <Productos
      nombreproducto='camisa'
      descripcionproducto='camisa de tela transpirante'
      precioproducto='$50.000'

      nombreproducto2='pantalon'
      descripcionproducto2='jean azul'
      precioproducto2='$45.000'

      nombreproducto3='zapatos'
      descripcionproducto3='cuero de culebra'
      precioproducto3='$60.000'
      />
      <footer>
        <div class="footer-container">
           <div class="footer-left">
              <p>"La mejor tienda para encontrar lo que necesitas, solo en RTH"</p>
            </div>
    <div class="footer-center">
      <ul>
        <li><a href="#">Inicio</a></li>
        <li><a href="#">Catálogo</a></li>
        <li><a href="#">Nosotros</a></li>
        <li><a href="#">Contacto</a></li>
      </ul>
    </div>
    <div class="footer-right">
      <a href="#"><i class="fab fa-facebook"></i></a>
      <a href="#"><i class="fab fa-twitter"></i></a>
      <a href="#"><i class="fab fa-instagram"></i></a>
      <a href="#"><i class="fab fa-linkedin"></i></a>
    </div>
  </div>
  <div class="footer-bottom">
    <p>&copy; 2025 RTH Esencia. Todos los derechos reservados.</p>
  </div>
</footer>
    </div>
    
    
  );
}

export default App;
