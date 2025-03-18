"use client"

import { useState, useEffect } from "react"
import { supabase } from "../utils/supabase.ts"
import "../hoja-de-estilos/AdminProductos.css"

function AdminProductos({ onClose, onProductoAgregado }) {
    const [productos, setProductos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [productoSeleccionado, setProductoSeleccionado] = useState(null)
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        precio: "",
        categoria_id: "",
        color_unico: "",
        tallas_disponibles: [],
        colores_disponibles: [],
        activo: true,
    })
    const [imagenes, setImagenes] = useState([])
    const [nuevasImagenes, setNuevasImagenes] = useState([])
    const [uploading, setUploading] = useState(false)

    // Cargar productos y categorías al montar el componente
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // Cargar categorías
                const { data: categoriasData, error: categoriasError } = await supabase
                    .from("categorias")
                    .select("*")
                    .order("nombre")

                if (categoriasError) throw categoriasError
                setCategorias(categoriasData)

                // Cargar productos con sus categorías
                const { data: productosData, error: productosError } = await supabase
                    .from("productos")
                    .select(`
            *,
            categorias:categoria_id (
              id,
              nombre
            )
          `)
                    .order("nombre")

                if (productosError) throw productosError
                setProductos(productosData)
            } catch (error) {
                console.error("Error al cargar datos:", error)
                setError("Error al cargar los datos. Por favor, intenta de nuevo.")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target

        if (type === "checkbox") {
            setFormData({ ...formData, [name]: checked })
        } else {
            setFormData({ ...formData, [name]: value })
        }
    }

    // Manejar cambios en arrays (tallas, colores)
    const handleArrayChange = (e, arrayName) => {
        const value = e.target.value

        setFormData((prevData) => {
            // Si el valor ya está en el array, quitarlo
            if (prevData[arrayName].includes(value)) {
                return {
                    ...prevData,
                    [arrayName]: prevData[arrayName].filter((item) => item !== value),
                }
            }
            // Si no está, añadirlo
            else {
                return {
                    ...prevData,
                    [arrayName]: [...prevData[arrayName], value],
                }
            }
        })
    }

    // Manejar subida de imágenes
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files)
        setNuevasImagenes((prevImagenes) => [...prevImagenes, ...files])
    }

    // Eliminar imagen de la lista de nuevas imágenes
    const removeNewImage = (index) => {
        setNuevasImagenes((prevImagenes) => prevImagenes.filter((_, i) => i !== index))
    }

    // Eliminar imagen existente
    const removeExistingImage = async (imagenId) => {
        try {
            const { error } = await supabase.from("imagenes").delete().eq("id", imagenId)

            if (error) throw error

            // Actualizar la lista de imágenes
            setImagenes((prevImagenes) => prevImagenes.filter((img) => img.id !== imagenId))
        } catch (error) {
            console.error("Error al eliminar imagen:", error)
            alert("Error al eliminar la imagen")
        }
    }

    // Mostrar formulario para crear nuevo producto
    const mostrarFormularioNuevo = () => {
        setProductoSeleccionado(null)
        setFormData({
            nombre: "",
            descripcion: "",
            precio: "",
            categoria_id: "",
            color_unico: "",
            tallas_disponibles: [],
            colores_disponibles: [],
            activo: true,
        })
        setImagenes([])
        setNuevasImagenes([])
        setMostrarFormulario(true)
    }

    // Mostrar formulario para editar producto existente
    const mostrarFormularioEditar = async (producto) => {
        try {
            // Cargar imágenes del producto
            const { data: imagenesData, error: imagenesError } = await supabase
                .from("imagenes")
                .select("*")
                .eq("producto_id", producto.id)
                .order("orden")

            if (imagenesError) throw imagenesError

            setProductoSeleccionado(producto)
            setFormData({
                nombre: producto.nombre || "",
                descripcion: producto.descripcion || "",
                precio: producto.precio || "",
                categoria_id: producto.categoria_id || "",
                color_unico: producto.color_unico || "",
                tallas_disponibles: producto.tallas_disponibles || [],
                colores_disponibles: producto.colores_disponibles || [],
                activo: producto.activo !== false,
            })
            setImagenes(imagenesData || [])
            setNuevasImagenes([])
            setMostrarFormulario(true)
        } catch (error) {
            console.error("Error al cargar datos del producto:", error)
            alert("Error al cargar los datos del producto")
        }
    }

    // Guardar producto (crear nuevo o actualizar existente)
    const guardarProducto = async (e) => {
        e.preventDefault()

        try {
            setUploading(true)

            // Validar datos
            if (!formData.nombre || !formData.precio || !formData.categoria_id) {
                alert("Por favor completa los campos obligatorios: nombre, precio y categoría")
                return
            }

            // Convertir precio a número
            const precioNumerico = Number.parseFloat(formData.precio.replace(/\./g, "").replace(",", "."))

            if (isNaN(precioNumerico)) {
                alert("El precio debe ser un número válido")
                return
            }

            // Datos a guardar
            const productoData = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                precio: precioNumerico,
                categoria_id: formData.categoria_id,
                color_unico: formData.color_unico || null,
                tallas_disponibles: formData.tallas_disponibles,
                colores_disponibles: formData.colores_disponibles,
                activo: formData.activo,
            }

            let productoId

            // Crear nuevo o actualizar existente
            if (productoSeleccionado) {
                // Actualizar producto existente
                const { data, error } = await supabase
                    .from("productos")
                    .update(productoData)
                    .eq("id", productoSeleccionado.id)
                    .select()

                if (error) throw error
                productoId = productoSeleccionado.id
            } else {
                // Crear nuevo producto
                const { data, error } = await supabase.from("productos").insert(productoData).select()

                if (error) throw error
                productoId = data[0].id
            }

            // Subir nuevas imágenes si hay
            if (nuevasImagenes.length > 0) {
                for (let i = 0; i < nuevasImagenes.length; i++) {
                    const file = nuevasImagenes[i]
                    const fileExt = file.name.split(".").pop()
                    const fileName = `${productoId}/${Date.now()}.${fileExt}`
                    const filePath = `productos/${fileName}`

                    // Subir archivo a Storage
                    const { error: uploadError } = await supabase.storage.from("imagenes").upload(filePath, file)

                    if (uploadError) throw uploadError

                    // Obtener URL pública
                    const { data: urlData } = supabase.storage.from("imagenes").getPublicUrl(filePath)

                    // Guardar referencia en la tabla de imágenes
                    const { error: insertError } = await supabase.from("imagenes").insert({
                        producto_id: productoId,
                        url: urlData.publicUrl,
                        orden: imagenes.length + i + 1,
                    })

                    if (insertError) throw insertError
                }
            }

            // Actualizar la lista de productos
            const { data: productosActualizados, error: productosError } = await supabase
                .from("productos")
                .select(`
          *,
          categorias:categoria_id (
            id,
            nombre
          )
        `)
                .order("nombre")

            if (productosError) throw productosError

            setProductos(productosActualizados)
            setMostrarFormulario(false)

            // Notificar al componente padre
            if (onProductoAgregado) {
                onProductoAgregado(productoData)
            }

            alert(productoSeleccionado ? "Producto actualizado con éxito" : "Producto creado con éxito")
        } catch (error) {
            console.error("Error al guardar producto:", error)
            alert("Error al guardar el producto: " + error.message)
        } finally {
            setUploading(false)
        }
    }

    // Eliminar producto
    const eliminarProducto = async (producto) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar el producto "${producto.nombre}"?`)) {
            return
        }

        try {
            // Primero eliminar imágenes asociadas
            const { error: imagenesError } = await supabase.from("imagenes").delete().eq("producto_id", producto.id)

            if (imagenesError) throw imagenesError

            // Luego eliminar el producto
            const { error } = await supabase.from("productos").delete().eq("id", producto.id)

            if (error) throw error

            // Actualizar la lista de productos
            setProductos(productos.filter((p) => p.id !== producto.id))

            alert("Producto eliminado con éxito")
        } catch (error) {
            console.error("Error al eliminar producto:", error)
            alert("Error al eliminar el producto: " + error.message)
        }
    }

    return (
        <div className="admin-productos-overlay">
            <div className="admin-productos-modal">
                <div className="admin-productos-header">
                    <h2>
                        {mostrarFormulario
                            ? productoSeleccionado
                                ? "Editar Producto"
                                : "Nuevo Producto"
                            : "Administración de Productos"}
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="admin-productos-content">
                    {loading ? (
                        <div className="loading-spinner">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Cargando...</p>
                        </div>
                    ) : error ? (
                        <div className="error-message">
                            <i className="fas fa-exclamation-triangle"></i>
                            <p>{error}</p>
                        </div>
                    ) : mostrarFormulario ? (
                        <form onSubmit={guardarProducto} className="producto-form">
                            <div className="form-group">
                                <label htmlFor="nombre">Nombre *</label>
                                <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="descripcion">Descripción</label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    rows={4}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="precio">Precio *</label>
                                <input type="text" id="precio" name="precio" value={formData.precio} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="categoria_id">Categoría *</label>
                                <select
                                    id="categoria_id"
                                    name="categoria_id"
                                    value={formData.categoria_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Seleccionar categoría</option>
                                    {categorias.map((categoria) => (
                                        <option key={categoria.id} value={categoria.id}>
                                            {categoria.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="color_unico">Color único (opcional)</label>
                                <input
                                    type="text"
                                    id="color_unico"
                                    name="color_unico"
                                    value={formData.color_unico}
                                    onChange={handleChange}
                                    placeholder="Dejar en blanco si tiene múltiples colores"
                                />
                            </div>

                            <div className="form-group">
                                <label>Tallas disponibles</label>
                                <div className="checkbox-group">
                                    {["XS", "S", "M", "L", "XL", "XXL"].map((talla) => (
                                        <label key={talla} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                value={talla}
                                                checked={formData.tallas_disponibles.includes(talla)}
                                                onChange={(e) => handleArrayChange(e, "tallas_disponibles")}
                                            />
                                            {talla}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Colores disponibles</label>
                                <div className="checkbox-group">
                                    {["negro", "blanco", "rojo", "azul", "gris", "verde"].map((color) => (
                                        <label key={color} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                value={color}
                                                checked={formData.colores_disponibles.includes(color)}
                                                onChange={(e) => handleArrayChange(e, "colores_disponibles")}
                                            />
                                            {color}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="activo" className="checkbox-label">
                                    <input type="checkbox" id="activo" name="activo" checked={formData.activo} onChange={handleChange} />
                                    Producto activo
                                </label>
                            </div>

                            <div className="form-group">
                                <label>Imágenes</label>

                                {/* Imágenes existentes */}
                                {imagenes.length > 0 && (
                                    <div className="imagenes-existentes">
                                        <h4>Imágenes actuales:</h4>
                                        <div className="imagenes-grid">
                                            {imagenes.map((imagen) => (
                                                <div key={imagen.id} className="imagen-item">
                                                    <img src={imagen.url || "/placeholder.svg"} alt="Imagen del producto" />
                                                    <button
                                                        type="button"
                                                        className="eliminar-imagen"
                                                        onClick={() => removeExistingImage(imagen.id)}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Nuevas imágenes */}
                                {nuevasImagenes.length > 0 && (
                                    <div className="nuevas-imagenes">
                                        <h4>Nuevas imágenes:</h4>
                                        <div className="imagenes-grid">
                                            {nuevasImagenes.map((file, index) => (
                                                <div key={index} className="imagen-item">
                                                    <img
                                                        src={URL.createObjectURL(file) || "/placeholder.svg"}
                                                        alt={`Nueva imagen ${index + 1}`}
                                                    />
                                                    <button type="button" className="eliminar-imagen" onClick={() => removeNewImage(index)}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="upload-container">
                                    <input type="file" id="imagenes" accept="image/*" multiple onChange={handleImageUpload} />
                                    <label htmlFor="imagenes" className="upload-button">
                                        <i className="fas fa-upload"></i> Subir imágenes
                                    </label>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="cancel-button" onClick={() => setMostrarFormulario(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="save-button" disabled={uploading}>
                                    {uploading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Guardando...
                                        </>
                                    ) : (
                                        "Guardar Producto"
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="admin-productos-actions">
                                <button className="add-button" onClick={mostrarFormularioNuevo}>
                                    <i className="fas fa-plus"></i> Nuevo Producto
                                </button>
                            </div>

                            {productos.length > 0 ? (
                                <div className="productos-table-container">
                                    <table className="productos-table">
                                        <thead>
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Categoría</th>
                                                <th>Precio</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productos.map((producto) => (
                                                <tr key={producto.id}>
                                                    <td>{producto.nombre}</td>
                                                    <td>{producto.categorias ? producto.categorias.nombre : "Sin categoría"}</td>
                                                    <td>${producto.precio.toLocaleString("es-ES")}</td>
                                                    <td>
                                                        <span className={`estado-badge ${producto.activo ? "estado-activo" : "estado-inactivo"}`}>
                                                            {producto.activo ? "Activo" : "Inactivo"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="acciones-buttons">
                                                            <button className="editar-button" onClick={() => mostrarFormularioEditar(producto)}>
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button className="eliminar-button" onClick={() => eliminarProducto(producto)}>
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="no-productos">
                                    <i className="fas fa-box-open"></i>
                                    <p>No hay productos disponibles</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AdminProductos

