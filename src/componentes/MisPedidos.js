"use client"
import { useState, useEffect } from "react"
import { supabase } from "../utils/supabase.ts"
import "../hoja-de-estilos/MisPedidos.css"

function MisPedidosComponent({ onClose, userId }) {
    const [pedidos, setPedidos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)
    const [productosPedido, setProductosPedido] = useState([])
    const [loadingProductos, setLoadingProductos] = useState(false)

    // Cargar pedidos del usuario
    useEffect(() => {
        const cargarPedidos = async () => {
            try {
                setLoading(true)
                console.log("Cargando pedidos para usuario:", userId)

                const { data, error } = await supabase
                    .from("pedidos")
                    .select("*")
                    .eq("usuario_id", userId)
                    .order("created_at", { ascending: false })

                if (error) {
                    console.error("Error al cargar pedidos:", error)
                    throw error
                }

                console.log("Pedidos cargados:", data)
                setPedidos(data || [])
            } catch (err) {
                console.error("Error al cargar pedidos:", err)
                setError("No se pudieron cargar tus pedidos. Por favor, intenta de nuevo más tarde.")
            } finally {
                setLoading(false)
            }
        }

        if (userId) {
            cargarPedidos()
        }
    }, [userId])

    // Cargar productos de un pedido específico
    const cargarProductosPedido = async (pedidoId) => {
        try {
            setLoadingProductos(true)
            console.log("Cargando productos para pedido:", pedidoId)

            // Primero obtenemos los productos del pedido
            const { data: productosData, error: productosError } = await supabase
                .from("pedido_productos")
                .select("*")
                .eq("pedido_id", pedidoId)

            if (productosError) {
                console.error("Error al cargar productos del pedido:", productosError)
                throw productosError
            }

            console.log("Productos del pedido cargados:", productosData)

            // Para cada producto del pedido, obtenemos la información completa del producto
            const productosConDetalles = await Promise.all(
                productosData.map(async (producto) => {
                    try {
                        // Obtener detalles del producto
                        const { data: productoInfo, error: productoError } = await supabase
                            .from("productos")
                            .select("*")
                            .eq("id", producto.producto_id)
                            .single()

                        if (productoError && productoError.code !== "PGRST116") {
                            console.error(`Error al cargar detalles del producto ${producto.producto_id}:`, productoError)
                        }

                        // Obtener la primera imagen del producto
                        let imagenUrl = "/placeholder.svg"
                        if (productoInfo && productoInfo.imagenes) {
                            try {
                                const imagenes =
                                    typeof productoInfo.imagenes === "string" ? JSON.parse(productoInfo.imagenes) : productoInfo.imagenes

                                if (Array.isArray(imagenes) && imagenes.length > 0) {
                                    imagenUrl = imagenes[0]
                                }
                            } catch (e) {
                                console.error("Error al parsear imágenes:", e)
                            }
                        }

                        // Si no hay imagen en el producto, intentar obtenerla de la tabla de imágenes
                        if (imagenUrl === "/placeholder.svg" && productoInfo) {
                            const { data: imagenesData, error: imagenesError } = await supabase
                                .from("imagenes")
                                .select("url")
                                .eq("producto_id", productoInfo.id)
                                .order("orden")
                                .limit(1)

                            if (!imagenesError && imagenesData && imagenesData.length > 0) {
                                imagenUrl = imagenesData[0].url
                            }
                        }

                        return {
                            ...producto,
                            nombre_producto: productoInfo?.nombre || "Producto no disponible",
                            imagen_url: imagenUrl,
                            subtotal: producto.precio_unitario * producto.cantidad,
                        }
                    } catch (err) {
                        console.error("Error al procesar producto:", err)
                        return {
                            ...producto,
                            nombre_producto: "Producto no disponible",
                            imagen_url: "/placeholder.svg",
                            subtotal: producto.precio_unitario * producto.cantidad,
                        }
                    }
                }),
            )

            setProductosPedido(productosConDetalles)
        } catch (err) {
            console.error("Error al cargar productos del pedido:", err)
            setProductosPedido([])
        } finally {
            setLoadingProductos(false)
        }
    }

    // Mostrar detalles de un pedido
    const verDetallesPedido = async (pedido) => {
        setPedidoSeleccionado(pedido)
        await cargarProductosPedido(pedido.id)
    }

    // Formatear fecha
    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return "Fecha no disponible"
        const fecha = new Date(fechaStr)
        return fecha.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    // Formatear precio
    const formatearPrecio = (precio) => {
        if (precio === null || precio === undefined) return "$0"
        return `$${Number(precio).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    // Obtener clase CSS según el estado del pedido
    const getEstadoClass = (estado) => {
        switch (estado?.toLowerCase()) {
            case "pendiente":
                return "estado-pendiente"
            case "confirmado":
                return "estado-confirmado"
            case "enviado":
                return "estado-enviado"
            case "entregado":
                return "estado-entregado"
            case "cancelado":
                return "estado-cancelado"
            default:
                return "estado-pendiente"
        }
    }

    // Cerrar modal de detalles
    const cerrarDetalles = () => {
        setPedidoSeleccionado(null)
        setProductosPedido([])
    }

    return (
        <div className="mis-pedidos-overlay">
            <div className="mis-pedidos-modal">
                <div className="mis-pedidos-header">
                    <h2>
                        {pedidoSeleccionado ? `Detalles del Pedido #${pedidoSeleccionado.id.substring(0, 8)}...` : "Mis Pedidos"}
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="mis-pedidos-content">
                    {loading ? (
                        <div className="loading-spinner">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Cargando tus pedidos...</p>
                        </div>
                    ) : error ? (
                        <div className="error-message">
                            <i className="fas fa-exclamation-triangle"></i>
                            <p>{error}</p>
                        </div>
                    ) : pedidoSeleccionado ? (
                        <div className="detalles-pedido">
                            <div className="detalles-grid">
                                <div className="detalles-seccion">
                                    <h3>Información del Pedido</h3>
                                    <p>
                                        <strong>Fecha:</strong> {formatearFecha(pedidoSeleccionado.created_at)}
                                    </p>
                                    <p>
                                        <strong>Estado:</strong>{" "}
                                        <span className={`estado-badge ${getEstadoClass(pedidoSeleccionado.estado)}`}>
                                            {pedidoSeleccionado.estado || "Pendiente"}
                                        </span>
                                    </p>
                                    <p>
                                        <strong>Total:</strong> {formatearPrecio(pedidoSeleccionado.total)}
                                    </p>
                                    <p>
                                        <strong>Método de pago:</strong> {pedidoSeleccionado.metodo_pago || "No especificado"}
                                    </p>
                                    {pedidoSeleccionado.referencia_pago && (
                                        <p>
                                            <strong>Referencia:</strong> {pedidoSeleccionado.referencia_pago}
                                        </p>
                                    )}
                                </div>

                                <div className="detalles-seccion">
                                    <h3>Dirección de envío</h3>
                                    {pedidoSeleccionado.direccion_envio ? (
                                        (() => {
                                            try {
                                                const direccion = JSON.parse(pedidoSeleccionado.direccion_envio)
                                                return (
                                                    <>
                                                        <p>
                                                            <strong>Nombre:</strong> {direccion.nombre} {direccion.apellido}
                                                        </p>
                                                        <p>
                                                            <strong>Dirección:</strong> {direccion.direccion}
                                                        </p>
                                                        <p>
                                                            <strong>Ciudad:</strong> {pedidoSeleccionado.ciudad_envio || direccion.ciudad}
                                                            {direccion.departamento ? `, ${direccion.departamento}` : ""}
                                                        </p>
                                                        <p>
                                                            <strong>Teléfono:</strong> {pedidoSeleccionado.telefono_contacto || direccion.telefono}
                                                        </p>
                                                    </>
                                                )
                                            } catch (e) {
                                                return (
                                                    <>
                                                        <p>
                                                            <strong>Dirección:</strong> {pedidoSeleccionado.direccion_envio}
                                                        </p>
                                                        {pedidoSeleccionado.ciudad_envio && (
                                                            <p>
                                                                <strong>Ciudad:</strong> {pedidoSeleccionado.ciudad_envio}
                                                            </p>
                                                        )}
                                                        {pedidoSeleccionado.telefono_contacto && (
                                                            <p>
                                                                <strong>Teléfono:</strong> {pedidoSeleccionado.telefono_contacto}
                                                            </p>
                                                        )}
                                                    </>
                                                )
                                            }
                                        })()
                                    ) : (
                                        <>
                                            {pedidoSeleccionado.ciudad_envio && (
                                                <p>
                                                    <strong>Ciudad:</strong> {pedidoSeleccionado.ciudad_envio}
                                                </p>
                                            )}
                                            {pedidoSeleccionado.telefono_contacto && (
                                                <p>
                                                    <strong>Teléfono:</strong> {pedidoSeleccionado.telefono_contacto}
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="productos-seccion">
                                <h3>Productos</h3>
                                {loadingProductos ? (
                                    <div className="loading-spinner">
                                        <i className="fas fa-spinner fa-spin"></i>
                                        <p>Cargando productos...</p>
                                    </div>
                                ) : productosPedido.length > 0 ? (
                                    <div className="productos-lista">
                                        {productosPedido.map((producto) => (
                                            <div key={producto.id} className="producto-item">
                                                <div className="producto-imagen">
                                                    <img
                                                        src={producto.imagen_url || "/placeholder.svg"}
                                                        alt={producto.nombre_producto || "Producto"}
                                                    />
                                                </div>
                                                <div className="producto-info">
                                                    <h4>{producto.nombre_producto || "Producto"}</h4>
                                                    <p>
                                                        <span className="producto-detalle">Color: {producto.color || "N/A"}</span>
                                                        <span className="producto-detalle">Talla: {producto.talla || "N/A"}</span>
                                                    </p>
                                                    <p>
                                                        <span className="producto-precio">{formatearPrecio(producto.precio_unitario)}</span> x{" "}
                                                        <span className="producto-cantidad">{producto.cantidad}</span>
                                                    </p>
                                                    <p className="producto-subtotal">
                                                        Subtotal:{" "}
                                                        {formatearPrecio(producto.subtotal || producto.precio_unitario * producto.cantidad)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>No hay detalles disponibles para este pedido.</p>
                                )}
                            </div>

                            <div className="detalles-acciones">
                                <button className="volver-button" onClick={cerrarDetalles}>
                                    Volver a mis pedidos
                                </button>
                            </div>
                        </div>
                    ) : pedidos.length > 0 ? (
                        <div className="pedidos-lista">
                            <table className="pedidos-table">
                                <thead>
                                    <tr>
                                        <th>Pedido</th>
                                        <th>Fecha</th>
                                        <th>Estado</th>
                                        <th>Total</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pedidos.map((pedido) => (
                                        <tr key={pedido.id}>
                                            <td>#{pedido.id.substring(0, 8)}...</td>
                                            <td>{formatearFecha(pedido.created_at)}</td>
                                            <td>
                                                <span className={`estado-badge ${getEstadoClass(pedido.estado)}`}>
                                                    {pedido.estado || "Pendiente"}
                                                </span>
                                            </td>
                                            <td>{formatearPrecio(pedido.total)}</td>
                                            <td>
                                                <button className="ver-detalles-button" onClick={() => verDetallesPedido(pedido)}>
                                                    <i className="fas fa-eye"></i> Ver
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="no-pedidos">
                            <i className="fas fa-shopping-bag"></i>
                            <p>No tienes pedidos realizados</p>
                            <p>¡Explora nuestro catálogo y realiza tu primer pedido!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MisPedidosComponent

