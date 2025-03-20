"use client"

import { useState, useEffect } from "react"
import "../hoja-de-estilos/AdminProductos.css"
import { supabase } from "../utils/supabase.ts"
import FileUpload from "./file-upload.js"

function AdminProductos({ onClose, onProductoAgregado }) {
    const [productos, setProductos] = useState([])
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [modoEdicion, setModoEdicion] = useState(false)
    const [productoActual, setProductoActual] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [saveError, setSaveError] = useState("")
    const [categorias, setCategorias] = useState([])

    // Modificar el estado formData para usar imagenes en lugar de imagen
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        precio: "",
        categoria_id: "",
        imagenes: [], // Ahora solo usamos imagenes (sin imagen separada)
        tallas_disponibles: [], // Cambiado a array
        colores_disponibles: [], // Cambiado a array
        activo: true, // Añadir esta propiedad
    })

    // Añadir estos estados para las opciones de tallas y colores
    const [tallasDisponibles] = useState(["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Única"])
    const [coloresDisponibles] = useState([
        "Unico",
        "Rojo",
        "Azul",
        "Verde",
        "Amarillo",
        "Negro",
        "Blanco",
        "Gris",
        "Morado",
        "Rosa",
        "Naranja",
        "Marrón",
        "Beige",
        "Turquesa",
        "Dorado",
        "Plateado",
    ])

    // Verificar si el usuario es administrador
    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser()

                if (!user) {
                    throw new Error("No hay sesión de usuario")
                }

                // Verificar si el usuario es administrador en la tabla usuarios
                const { data, error } = await supabase.from("usuarios").select("isadmin").eq("email", user.email).single()

                if (error || !data || !data.isadmin) {
                    setIsAdmin(false)
                    throw new Error("No tienes permisos de administrador")
                }

                setIsAdmin(true)
            } catch (error) {
                console.error("Error de verificación de admin:", error)
                setIsAdmin(false)
            }
        }

        checkAdmin()
    }, [])

    // Cargar categorías
    const cargarCategorias = async () => {
        try {
            const { data, error } = await supabase.from("categorias").select("*")
            if (error) throw error
            setCategorias(data || [])
        } catch (error) {
            console.error("Error al cargar categorías:", error)
        }
    }

    // Modificar la función para cargar productos para asegurar que las imágenes estén correctamente formateadas
    const fetchProductos = async () => {
        try {
            setLoading(true)
            // Cargar productos con join a categorías
            const { data, error } = await supabase.from("productos").select(`
        *,
        categorias:categoria_id (id, nombre)
      `)

            if (error) {
                throw error
            }

            if (data) {
                // Asegurarse de que todos los productos tengan un array de imágenes válido
                const productosFormateados = data.map((producto) => ({
                    ...producto,
                    imagenes: Array.isArray(producto.imagenes) ? producto.imagenes : [],
                    tallas_disponibles: Array.isArray(producto.tallas_disponibles) ? producto.tallas_disponibles : [],
                    colores_disponibles: Array.isArray(producto.colores_disponibles) ? producto.colores_disponibles : [],
                }))

                console.log("Productos cargados (formateados):", productosFormateados)
                setProductos(productosFormateados)
            }
        } catch (error) {
            console.error("Error al cargar productos:", error)
            // Si falla la carga desde Supabase, intentar cargar desde localStorage
            const productosGuardados = localStorage.getItem("productos")
            if (productosGuardados) {
                try {
                    setProductos(JSON.parse(productosGuardados))
                } catch (error) {
                    console.error("Error al cargar productos desde localStorage:", error)
                }
            }
        } finally {
            setLoading(false)
        }
    }

    // Reemplazar la función existente con esta versión mejorada
    useEffect(() => {
        fetchProductos()
        cargarCategorias() // Cargar las categorías
    }, [])

    // Guardar productos cuando cambien
    useEffect(() => {
        if (productos.length > 0) {
            localStorage.setItem("productos", JSON.stringify(productos))
            console.log("Productos cargados:", productos)
            if (productos[0].imagenes && productos[0].imagenes.length > 0) {
                console.log("Primera imagen del primer producto:", productos[0].imagenes[0].substring(0, 50) + "...")
            }
        }
    }, [productos])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })
    }

    // Modificar la función resetFormulario
    const resetFormulario = () => {
        setFormData({
            nombre: "",
            descripcion: "",
            precio: "",
            categoria_id: "",
            imagenes: [],
            tallas_disponibles: [],
            colores_disponibles: [],
            activo: true,
        })
        setModoEdicion(false)
        setProductoActual(null)
        setSaveError("")
    }

    const toggleFormulario = () => {
        setMostrarFormulario(!mostrarFormulario)
        if (!mostrarFormulario) {
            resetFormulario()
        }
    }

    // Modificar la función handleSubmit para asegurar que las imágenes se guarden correctamente
    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaveError("")

        // Validar campos obligatorios
        if (!formData.nombre || !formData.precio || !formData.categoria_id) {
            setSaveError("Por favor completa los campos obligatorios: nombre, precio y categoría")
            return
        }

        // Formatear el precio correctamente para la base de datos
        let precioFormateado = formData.precio
        if (typeof precioFormateado === "string") {
            // Eliminar el símbolo $ y cualquier separador de miles
            precioFormateado = precioFormateado.replace(/[$,]/g, "")

            // Verificar que sea un número válido
            if (isNaN(Number(precioFormateado))) {
                setSaveError("El precio debe ser un valor numérico válido")
                return
            }

            // Convertir a número
            precioFormateado = Number(precioFormateado)
        }

        // Validar que haya al menos una imagen
        if (!formData.imagenes || formData.imagenes.length === 0) {
            setSaveError("Debes agregar al menos una imagen del producto")
            return
        }

        // Crear objeto de producto con los arrays formateados correctamente
        const nuevoProducto = {
            ...formData,
            precio: precioFormateado,
            // Asegurarse de que todos los campos sean del tipo correcto
            imagenes: Array.isArray(formData.imagenes) ? formData.imagenes : [],
            tallas_disponibles: Array.isArray(formData.tallas_disponibles) ? formData.tallas_disponibles : [],
            colores_disponibles: Array.isArray(formData.colores_disponibles) ? formData.colores_disponibles : [],
        }

        console.log("Guardando producto:", nuevoProducto)

        try {
            if (modoEdicion && productoActual) {
                // Actualizar producto existente en Supabase
                const { data, error } = await supabase
                    .from("productos")
                    .update(nuevoProducto)
                    .eq("id", productoActual.id)
                    .select()

                if (error) throw error

                console.log("Producto actualizado:", data)

                // Actualizar estado local
                const productosActualizados = productos.map((p) => (p.id === productoActual.id ? data[0] : p))
                setProductos(productosActualizados)
            } else {
                // Agregar nuevo producto a Supabase
                const { data, error } = await supabase.from("productos").insert([nuevoProducto]).select()

                if (error) throw error

                console.log("Producto insertado:", data)

                // Actualizar estado local con el producto insertado
                const productoConId = data[0]
                setProductos([...productos, productoConId])

                // Notificar al componente padre si existe la función
                if (typeof onProductoAgregado === "function") {
                    onProductoAgregado(productoConId)
                }
            }

            // Resetear formulario y cerrar
            resetFormulario()
            setMostrarFormulario(false)
        } catch (error) {
            console.error("Error al guardar producto:", error)
            setSaveError(`Error al guardar el producto: ${error.message}`)
        }
    }

    // Modificar la función editarProducto para manejar correctamente los arrays
    const editarProducto = (producto) => {
        setProductoActual(producto)
        setModoEdicion(true)
        setSaveError("")

        // Rellenar el formulario con los datos del producto
        setFormData({
            nombre: producto.nombre || "",
            descripcion: producto.descripcion || "",
            precio: producto.precio || "",
            categoria_id: producto.categoria_id || "",
            imagenes: Array.isArray(producto.imagenes) ? producto.imagenes : [],
            tallas_disponibles: Array.isArray(producto.tallas_disponibles) ? producto.tallas_disponibles : [],
            colores_disponibles: Array.isArray(producto.colores_disponibles) ? producto.colores_disponibles : [],
            activo: producto.activo !== false, // Si no está definido, asumimos true
        })

        setMostrarFormulario(true)
    }

    const eliminarProducto = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
            try {
                // Eliminar producto de Supabase
                const { error } = await supabase.from("productos").delete().eq("id", id)

                if (error) throw error

                // Actualizar estado local
                setProductos(productos.filter((p) => p.id !== id))
            } catch (error) {
                console.error("Error al eliminar producto:", error)
                alert("Error al eliminar el producto. Por favor, intenta de nuevo.")
            }
        }
    }

    // Estilos para los botones seleccionables
    useEffect(() => {
        const estilosCSS = document.createElement("style")
        estilosCSS.textContent = `
      .botones-seleccionables {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
      }
      
      .boton-seleccionable {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #f5f5f5;
          cursor: pointer;
          transition: all 0.2s;
      }
      
      .boton-seleccionable.seleccionado {
          background-color: #3f51b5;
          color: white;
          border-color: #3f51b5;
      }
  `
        document.head.appendChild(estilosCSS)

        // Limpiar al desmontar
        return () => {
            if (document.head.contains(estilosCSS)) {
                document.head.removeChild(estilosCSS)
            }
        }
    }, [])

    if (!isAdmin) {
        return (
            <div className="admin-productos-modal">
                <div className="admin-productos-content">
                    <div className="admin-productos-header">
                        <h2>Acceso Denegado</h2>
                        <button className="cerrar-modal" onClick={onClose}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="admin-productos-body">
                        <div className="error-message">
                            <i className="fas fa-exclamation-triangle"></i>
                            <p>No tienes permisos de administrador para acceder a esta sección.</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="admin-productos-modal">
            <div className="admin-productos-content">
                <div className="admin-productos-header">
                    <h2>Administrar Productos</h2>
                    <button className="cerrar-modal" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="admin-productos-body">
                    <div className="admin-productos-actions">
                        <button className="btn-agregar-producto" onClick={toggleFormulario}>
                            {mostrarFormulario ? "Cancelar" : "Agregar Nuevo Producto"}
                        </button>
                    </div>

                    {saveError && (
                        <div className="error-message-container">
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i> {saveError}
                            </div>
                        </div>
                    )}

                    {mostrarFormulario && (
                        <div className="formulario-producto">
                            <h3>{modoEdicion ? "Editar Producto" : "Nuevo Producto"}</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="nombre">Nombre del Producto*</label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="descripcion">Descripción</label>
                                    <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="precio">Precio*</label>
                                    <input
                                        type="text"
                                        id="precio"
                                        name="precio"
                                        value={formData.precio}
                                        onChange={handleInputChange}
                                        placeholder="$50.000"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="categoria_id">Categoría*</label>
                                    <select
                                        id="categoria_id"
                                        name="categoria_id"
                                        value={formData.categoria_id}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Selecciona una categoría</option>
                                        {categorias.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Modificar la sección del formulario para las imágenes */}
                                <div className="form-group">
                                    <label>Imágenes del Producto*</label>
                                    <div className="imagenes-container">
                                        {formData.imagenes && formData.imagenes.length > 0 ? (
                                            <div className="imagenes-preview">
                                                {formData.imagenes.map((img, index) => (
                                                    <div key={index} className="imagen-preview-container">
                                                        <img
                                                            src={img || "/placeholder.svg"}
                                                            alt={`Imagen ${index + 1}`}
                                                            className="imagen-preview"
                                                            onError={(e) => {
                                                                console.error(`Error al cargar imagen: ${index}`)
                                                                e.target.onerror = null
                                                                e.target.src = "/placeholder.svg"
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn-remove-image"
                                                            onClick={() => {
                                                                const nuevasImagenes = [...formData.imagenes]
                                                                nuevasImagenes.splice(index, 1)
                                                                setFormData({ ...formData, imagenes: nuevasImagenes })
                                                            }}
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="no-imagenes">No hay imágenes seleccionadas</p>
                                        )}

                                        <FileUpload
                                            onImageUploaded={(base64Image) => {
                                                console.log("Imagen subida en base64:", base64Image.substring(0, 50) + "...")
                                                const nuevasImagenes = [...(formData.imagenes || [])]
                                                nuevasImagenes.push(base64Image)
                                                setFormData({ ...formData, imagenes: nuevasImagenes })
                                            }}
                                            label="Añadir imagen"
                                        />
                                    </div>
                                </div>

                                {/* Añadir estos campos adicionales al formulario */}
                                <div className="form-group">
                                    <label>Tallas</label>
                                    <div className="botones-seleccionables">
                                        {tallasDisponibles.map((talla) => (
                                            <button
                                                key={talla}
                                                type="button"
                                                className={`boton-seleccionable ${formData.tallas_disponibles.includes(talla) ? "seleccionado" : ""}`}
                                                onClick={() => {
                                                    const nuevasTallas = [...formData.tallas_disponibles]
                                                    if (nuevasTallas.includes(talla)) {
                                                        // Si ya está seleccionado, lo quitamos
                                                        const index = nuevasTallas.indexOf(talla)
                                                        nuevasTallas.splice(index, 1)
                                                    } else {
                                                        // Si no está seleccionado, lo añadimos
                                                        nuevasTallas.push(talla)
                                                    }
                                                    setFormData({ ...formData, tallas_disponibles: nuevasTallas })
                                                }}
                                            >
                                                {talla}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Colores</label>
                                    <div className="botones-seleccionables">
                                        {coloresDisponibles.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`boton-seleccionable ${formData.colores_disponibles.includes(color) ? "seleccionado" : ""}`}
                                                onClick={() => {
                                                    const nuevosColores = [...formData.colores_disponibles]
                                                    if (nuevosColores.includes(color)) {
                                                        // Si ya está seleccionado, lo quitamos
                                                        const index = nuevosColores.indexOf(color)
                                                        nuevosColores.splice(index, 1)
                                                    } else {
                                                        // Si no está seleccionado, lo añadimos
                                                        nuevosColores.push(color)
                                                    }
                                                    setFormData({ ...formData, colores_disponibles: nuevosColores })
                                                }}
                                            >
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="activo">Estado</label>
                                    <select
                                        id="activo"
                                        name="activo"
                                        value={formData.activo}
                                        onChange={(e) => setFormData({ ...formData, activo: e.target.value === "true" })}
                                    >
                                        <option value="true">Activo</option>
                                        <option value="false">Inactivo</option>
                                    </select>
                                </div>

                                <div className="form-actions">
                                    <button type="button" onClick={resetFormulario} className="btn-cancelar">
                                        Limpiar
                                    </button>
                                    <button type="submit" className="btn-guardar">
                                        {modoEdicion ? "Actualizar Producto" : "Guardar Producto"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="lista-productos">
                        <h3>Productos Existentes ({productos.length})</h3>
                        {loading ? (
                            <div className="loading-spinner">
                                <i className="fas fa-spinner fa-spin"></i> Cargando productos...
                            </div>
                        ) : productos.length === 0 ? (
                            <p className="no-productos">No hay productos registrados</p>
                        ) : (
                            <div className="tabla-productos">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Imagen</th>
                                            <th>Nombre</th>
                                            <th>Categoría</th>
                                            <th>Precio</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productos.map((producto) => (
                                            <tr key={producto.id}>
                                                <td>
                                                    {producto.imagenes && producto.imagenes.length > 0 ? (
                                                        <img
                                                            src={producto.imagenes[0] || "/placeholder.svg"}
                                                            alt={producto.nombre}
                                                            className="producto-thumbnail"
                                                            onError={(e) => {
                                                                console.error(`Error al cargar imagen de producto: ${producto.id}`)
                                                                e.target.onerror = null
                                                                e.target.src = "/placeholder.svg"
                                                            }}
                                                        />
                                                    ) : (
                                                        <img src="/placeholder.svg" alt={producto.nombre} className="producto-thumbnail" />
                                                    )}
                                                </td>
                                                <td>{producto.nombre}</td>
                                                <td>{producto.categorias ? producto.categorias.nombre : "Sin categoría"}</td>
                                                <td>{producto.precio}</td>
                                                <td>
                                                    <button className="btn-editar" onClick={() => editarProducto(producto)}>
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button className="btn-eliminar" onClick={() => eliminarProducto(producto.id)}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminProductos

