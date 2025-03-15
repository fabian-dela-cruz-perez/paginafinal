"use client"

import { useState, useEffect } from "react"
import "../hoja-de-estilos/AdminProductos.css"
import { supabase } from "../utils/supabase.ts"

function AdminProductos({ onClose, onProductoAgregado }) {
    const [productos, setProductos] = useState([])
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [modoEdicion, setModoEdicion] = useState(false)
    const [productoActual, setProductoActual] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    // Estado para el formulario
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        precio: "",
        categoria: "Conjuntos",
        colorUnico: "",
        imagen: "",
        imagenes: ["", "", ""],
    })

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

    // Cargar productos desde Supabase al iniciar
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                setLoading(true)
                const { data, error } = await supabase.from("productos").select("*")

                if (error) {
                    throw error
                }

                if (data) {
                    setProductos(data)
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

        fetchProductos()
    }, [])

    // Guardar productos cuando cambien
    useEffect(() => {
        if (productos.length > 0) {
            localStorage.setItem("productos", JSON.stringify(productos))
        }
    }, [productos])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })
    }

    const handleImagenChange = (e, index) => {
        const { value } = e.target

        if (index === undefined) {
            // Imagen principal
            setFormData({
                ...formData,
                imagen: value,
            })
        } else {
            // Imágenes adicionales
            const nuevasImagenes = [...formData.imagenes]
            nuevasImagenes[index] = value
            setFormData({
                ...formData,
                imagenes: nuevasImagenes,
            })
        }
    }

    const resetFormulario = () => {
        setFormData({
            nombre: "",
            descripcion: "",
            precio: "",
            categoria: "Conjuntos",
            colorUnico: "",
            imagen: "",
            imagenes: ["", "", ""],
        })
        setModoEdicion(false)
        setProductoActual(null)
    }

    const toggleFormulario = () => {
        setMostrarFormulario(!mostrarFormulario)
        if (!mostrarFormulario) {
            resetFormulario()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validar campos obligatorios
        if (!formData.nombre || !formData.precio || !formData.categoria) {
            alert("Por favor completa los campos obligatorios: nombre, precio y categoría")
            return
        }

        // Formatear el precio si no tiene el formato correcto
        let precioFormateado = formData.precio
        if (!precioFormateado.startsWith("$")) {
            precioFormateado = `$${precioFormateado}`
        }

        // Crear objeto de producto
        const nuevoProducto = {
            ...formData,
            precio: precioFormateado,
            // Filtrar imágenes vacías
            imagenes: [formData.imagen, ...formData.imagenes.filter((img) => img.trim() !== "")],
        }

        try {
            if (modoEdicion && productoActual) {
                // Actualizar producto existente en Supabase
                const { error } = await supabase.from("productos").update(nuevoProducto).eq("id", productoActual.id)

                if (error) throw error

                // Actualizar estado local
                const productosActualizados = productos.map((p) =>
                    p.id === productoActual.id ? { ...nuevoProducto, id: productoActual.id } : p,
                )
                setProductos(productosActualizados)
            } else {
                // Agregar nuevo producto a Supabase
                const { data, error } = await supabase.from("productos").insert([nuevoProducto]).select()

                if (error) throw error

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
            alert("Error al guardar el producto. Por favor, intenta de nuevo.")
        }
    }

    const editarProducto = (producto) => {
        setProductoActual(producto)
        setModoEdicion(true)

        // Preparar imágenes para el formulario
        const imagenPrincipal = producto.imagen || ""
        const imagenesAdicionales =
            producto.imagenes && producto.imagenes.length > 1 ? producto.imagenes.slice(1, 4) : ["", "", ""]

        // Rellenar el formulario con los datos del producto
        setFormData({
            nombre: producto.nombre || "",
            descripcion: producto.descripcion || "",
            precio: producto.precio || "",
            categoria: producto.categoria || "Conjuntos",
            colorUnico: producto.colorUnico || "",
            imagen: imagenPrincipal,
            imagenes: imagenesAdicionales,
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
                                    <label htmlFor="categoria">Categoría*</label>
                                    <select
                                        id="categoria"
                                        name="categoria"
                                        value={formData.categoria}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="Conjuntos">Conjuntos</option>
                                        <option value="Gorras">Gorras</option>
                                        <option value="Accesorios">Accesorios</option>
                                        <option value="Zapatos">Zapatos</option>
                                    </select>
                                </div>

                                {formData.categoria === "Conjuntos" && (
                                    <div className="form-group">
                                        <label htmlFor="colorUnico">Color Único (para conjuntos)</label>
                                        <input
                                            type="text"
                                            id="colorUnico"
                                            name="colorUnico"
                                            value={formData.colorUnico}
                                            onChange={handleInputChange}
                                            placeholder="Ej: Negro, Unico"
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label htmlFor="imagen">URL de Imagen Principal*</label>
                                    <input
                                        type="text"
                                        id="imagen"
                                        name="imagen"
                                        value={formData.imagen}
                                        onChange={(e) => handleImagenChange(e)}
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>URLs de Imágenes Adicionales</label>
                                    {formData.imagenes.map((img, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            value={img}
                                            onChange={(e) => handleImagenChange(e, index)}
                                            placeholder={`URL de imagen adicional ${index + 1}`}
                                        />
                                    ))}
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
                                                    <img
                                                        src={producto.imagen || "/placeholder.svg"}
                                                        alt={producto.nombre}
                                                        className="producto-thumbnail"
                                                    />
                                                </td>
                                                <td>{producto.nombre}</td>
                                                <td>{producto.categoria}</td>
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

