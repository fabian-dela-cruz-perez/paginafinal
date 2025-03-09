"use client"

import { useState, useEffect } from "react"
import "../hoja-de-estilos/PedidosPanel.css"

function PedidosPanel({ onClose }) {
    const [pedidos, setPedidos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)
    const [estadoSeleccionado, setEstadoSeleccionado] = useState("")
    const [actualizandoEstado, setActualizandoEstado] = useState(false)
    const [filtroEstado, setFiltroEstado] = useState("Todos")
    const [busqueda, setBusqueda] = useState("")

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/pedidos")

                if (!response.ok) {
                    throw new Error("No se pudieron cargar los pedidos")
                }

                const data = await response.json()
                setPedidos(data)
                setLoading(false)
            } catch (error) {
                console.error("Error al cargar pedidos:", error)
                setError("Error al cargar los pedidos. Por favor, intenta de nuevo.")
                setLoading(false)
            }
        }

        fetchPedidos()
    }, [])

    // Formatear fecha
    const formatDate = (dateString) => {
        const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
        return new Date(dateString).toLocaleDateString("es-ES", options)
    }

    // Formatear precio
    const formatPrice = (priceString) => {
        if (!priceString) return "$0"
        return priceString.startsWith("$") ? priceString : `$${priceString}`
    }

    // Obtener clase CSS según el estado del pedido
    const getEstadoClass = (estado) => {
        switch (estado) {
            case "Pendiente":
                return "estado-pendiente"
            case "Procesando":
                return "estado-procesando"
            case "Enviado":
                return "estado-enviado"
            case "Entregado":
                return "estado-entregado"
            case "Cancelado":
                return "estado-cancelado"
            default:
                return ""
        }
    }

    // Ver detalles de un pedido
    const verDetallesPedido = (pedido) => {
        setPedidoSeleccionado(pedido)
        setEstadoSeleccionado(pedido.estado)
    }

    // Cerrar detalles del pedido
    const cerrarDetalles = () => {
        setPedidoSeleccionado(null)
        setEstadoSeleccionado("")
    }

    // Actualizar estado del pedido
    const actualizarEstadoPedido = async () => {
        if (!pedidoSeleccionado || estadoSeleccionado === pedidoSeleccionado.estado) {
            return
        }

        setActualizandoEstado(true)

        try {
            const response = await fetch(`http://localhost:5000/api/pedidos/${pedidoSeleccionado._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ estado: estadoSeleccionado }),
            })

            if (!response.ok) {
                throw new Error("No se pudo actualizar el estado del pedido")
            }

            const pedidoActualizado = await response.json()

            // Actualizar el pedido en la lista
            setPedidos(pedidos.map((p) => (p._id === pedidoSeleccionado._id ? { ...p, estado: estadoSeleccionado } : p)))

            // Actualizar el pedido seleccionado
            setPedidoSeleccionado({ ...pedidoSeleccionado, estado: estadoSeleccionado })

            alert("Estado del pedido actualizado correctamente")
        } catch (error) {
            console.error("Error al actualizar estado:", error)
            alert("Error al actualizar el estado del pedido")
        } finally {
            setActualizandoEstado(false)
        }
    }

    // Eliminar pedido
    const eliminarPedido = async () => {
        if (!pedidoSeleccionado) {
            return
        }

        if (!window.confirm("¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.")) {
            return
        }

        try {
            const response = await fetch(`http://localhost:5000/api/pedidos/${pedidoSeleccionado._id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("No se pudo eliminar el pedido")
            }

            // Eliminar el pedido de la lista
            setPedidos(pedidos.filter((p) => p._id !== pedidoSeleccionado._id))

            // Cerrar detalles
            cerrarDetalles()

            alert("Pedido eliminado correctamente. Se ha notificado al usuario.")
        } catch (error) {
            console.error("Error al eliminar pedido:", error)
            alert("Error al eliminar el pedido")
        }
    }

    // Filtrar pedidos
    const pedidosFiltrados = pedidos.filter((pedido) => {
        // Filtrar por estado
        if (filtroEstado !== "Todos" && pedido.estado !== filtroEstado) {
            return false
        }

        // Filtrar por búsqueda (nombre de usuario, email o ID)
        if (busqueda) {
            const terminoBusqueda = busqueda.toLowerCase()
            return (
                pedido.usuario.nombre.toLowerCase().includes(terminoBusqueda) ||
                pedido.usuario.email.toLowerCase().includes(terminoBusqueda) ||
                pedido._id.toLowerCase().includes(terminoBusqueda)
            )
        }

        return true
    })

    // Verificar si un pedido tiene comprobante de pago pendiente
    const tienePagoPendiente = (pedido) => {
        return pedido.pago && pedido.pago.estado === "Pendiente"
    }

    return (
        <div className="pedidos-panel-overlay">
            <div className="pedidos-panel-modal">
                <div className="pedidos-panel-header">
                    <h2>Panel de Pedidos</h2>
                    <button className="close-button" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="pedidos-panel-content">
                    {pedidoSeleccionado ? (
                        <div className="pedido-detalles">
                            <div className="detalles-header">
                                <h3>Detalles del Pedido</h3>
                                <button className="volver-button" onClick={cerrarDetalles}>
                                    <i className="fas fa-arrow-left"></i> Volver a la lista
                                </button>
                            </div>

                            <div className="detalles-info">
                                <div className="detalles-seccion">
                                    <h4>Información del Cliente</h4>
                                    <p>
                                        <strong>Nombre:</strong> {pedidoSeleccionado.usuario.nombre}
                                    </p>
                                    <p>
                                        <strong>Email:</strong> {pedidoSeleccionado.usuario.email}
                                    </p>
                                    <p>
                                        <strong>Dirección de envío:</strong> {pedidoSeleccionado.direccionEnvio}
                                    </p>
                                </div>

                                <div className="detalles-seccion">
                                    <h4>Información del Pedido</h4>
                                    <p>
                                        <strong>ID:</strong> {pedidoSeleccionado._id}
                                    </p>
                                    <p>
                                        <strong>Fecha:</strong> {formatDate(pedidoSeleccionado.fechaPedido)}
                                    </p>
                                    <p>
                                        <strong>Total:</strong> ${pedidoSeleccionado.total.toLocaleString("es-ES")}
                                    </p>
                                    <div className="estado-actual">
                                        <strong>Estado actual:</strong>
                                        <span className={`estado-badge ${getEstadoClass(pedidoSeleccionado.estado)}`}>
                                            {pedidoSeleccionado.estado}
                                        </span>
                                    </div>
                                </div>

                                <div className="detalles-seccion">
                                    <h4>Información de Pago</h4>
                                    {pedidoSeleccionado.pago ? (
                                        <>
                                            <p>
                                                <strong>Método:</strong> {pedidoSeleccionado.pago.metodoPago}
                                            </p>
                                            <p>
                                                <strong>Estado:</strong>{" "}
                                                <span
                                                    className={`estado-badge ${pedidoSeleccionado.pago.estado === "Completado"
                                                            ? "estado-entregado"
                                                            : pedidoSeleccionado.pago.estado === "Pendiente"
                                                                ? "estado-pendiente"
                                                                : "estado-procesando"
                                                        }`}
                                                >
                                                    {pedidoSeleccionado.pago.estado}
                                                </span>
                                            </p>
                                            <p>
                                                <strong>Referencia:</strong> {pedidoSeleccionado.pago.referencia}
                                            </p>
                                            <p>
                                                <strong>Fecha:</strong> {formatDate(pedidoSeleccionado.pago.fecha)}
                                            </p>
                                            {tienePagoPendiente(pedidoSeleccionado) && (
                                                <div className="alerta-pago-pendiente">
                                                    <i className="fas fa-exclamation-triangle"></i>
                                                    <p>Este pedido tiene un comprobante de pago pendiente de verificación</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p>No hay información de pago disponible</p>
                                    )}
                                </div>
                            </div>

                            <div className="detalles-productos">
                                <h4>Productos</h4>
                                <table className="productos-table">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Color</th>
                                            <th>Talla</th>
                                            <th>Precio</th>
                                            <th>Cantidad</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pedidoSeleccionado.productos.map((producto, index) => {
                                            const precioNumerico = Number.parseFloat(producto.precio.replace("$", "").replace(".", ""))
                                            const subtotal = precioNumerico * producto.cantidad

                                            return (
                                                <tr key={index}>
                                                    <td>{producto.nombre}</td>
                                                    <td>{producto.color}</td>
                                                    <td>{producto.talla}</td>
                                                    <td>{formatPrice(producto.precio)}</td>
                                                    <td>{producto.cantidad}</td>
                                                    <td>${subtotal.toLocaleString("es-ES")}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="detalles-acciones">
                                <div className="actualizar-estado">
                                    <label htmlFor="estado">Actualizar estado:</label>
                                    <select
                                        id="estado"
                                        value={estadoSeleccionado}
                                        onChange={(e) => setEstadoSeleccionado(e.target.value)}
                                    >
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Procesando">Procesando</option>
                                        <option value="Enviado">Enviado</option>
                                        <option value="Entregado">Entregado</option>
                                        <option value="Cancelado">Cancelado</option>
                                    </select>
                                    <button
                                        className="actualizar-button"
                                        onClick={actualizarEstadoPedido}
                                        disabled={actualizandoEstado || estadoSeleccionado === pedidoSeleccionado.estado}
                                    >
                                        {actualizandoEstado ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i> Actualizando...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save"></i> Guardar cambios
                                            </>
                                        )}
                                    </button>
                                </div>

                                <button className="eliminar-button" onClick={eliminarPedido}>
                                    <i className="fas fa-trash-alt"></i> Eliminar pedido
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="filtros-busqueda">
                                <div className="filtro-estado">
                                    <label htmlFor="filtroEstado">Filtrar por estado:</label>
                                    <select id="filtroEstado" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                                        <option value="Todos">Todos</option>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Procesando">Procesando</option>
                                        <option value="Enviado">Enviado</option>
                                        <option value="Entregado">Entregado</option>
                                        <option value="Cancelado">Cancelado</option>
                                    </select>
                                </div>

                                <div className="busqueda">
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre, email o ID..."
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                    />
                                    {busqueda && (
                                        <button className="limpiar-busqueda" onClick={() => setBusqueda("")}>
                                            <i className="fas fa-times"></i>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {loading ? (
                                <div className="loading-spinner">
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <p>Cargando pedidos...</p>
                                </div>
                            ) : error ? (
                                <div className="error-message">{error}</div>
                            ) : (
                                <div className="pedidos-table-container">
                                    {pedidosFiltrados.length > 0 ? (
                                        <table className="pedidos-table">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Cliente</th>
                                                    <th>Fecha</th>
                                                    <th>Total</th>
                                                    <th>Estado</th>
                                                    <th>Pago</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pedidosFiltrados.map((pedido) => (
                                                    <tr key={pedido._id} className={tienePagoPendiente(pedido) ? "fila-pago-pendiente" : ""}>
                                                        <td>{pedido._id.substring(0, 8)}...</td>
                                                        <td>{pedido.usuario.nombre}</td>
                                                        <td>{formatDate(pedido.fechaPedido)}</td>
                                                        <td>${pedido.total.toLocaleString("es-ES")}</td>
                                                        <td>
                                                            <span className={`estado-badge ${getEstadoClass(pedido.estado)}`}>{pedido.estado}</span>
                                                        </td>
                                                        <td>
                                                            {pedido.pago ? (
                                                                <span
                                                                    className={`estado-badge ${pedido.pago.estado === "Completado"
                                                                            ? "estado-entregado"
                                                                            : pedido.pago.estado === "Pendiente"
                                                                                ? "estado-pendiente"
                                                                                : "estado-procesando"
                                                                        }`}
                                                                >
                                                                    {pedido.pago.estado}
                                                                </span>
                                                            ) : (
                                                                "N/A"
                                                            )}
                                                        </td>
                                                        <td>
                                                            <button className="ver-detalles-button" onClick={() => verDetallesPedido(pedido)}>
                                                                <i className="fas fa-eye"></i> Ver detalles
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="no-pedidos">
                                            <i className="fas fa-shopping-bag"></i>
                                            <p>No se encontraron pedidos</p>
                                            {(filtroEstado !== "Todos" || busqueda) && (
                                                <button
                                                    className="limpiar-filtros"
                                                    onClick={() => {
                                                        setFiltroEstado("Todos")
                                                        setBusqueda("")
                                                    }}
                                                >
                                                    <i className="fas fa-filter"></i> Limpiar filtros
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PedidosPanel

