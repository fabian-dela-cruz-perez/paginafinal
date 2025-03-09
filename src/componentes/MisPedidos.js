"use client"

import { useState, useEffect } from "react"
import "../hoja-de-estilos/MisPedidos.css"

function MisPedidos({ onClose, userId }) {
    const [pedidos, setPedidos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)
    const [notificaciones, setNotificaciones] = useState([])
    const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false)
    const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0)

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/pedidos/usuario/${userId}`)

                if (!response.ok) {
                    throw new Error("No se pudieron cargar tus pedidos")
                }

                const data = await response.json()
                setPedidos(data)
                setLoading(false)
            } catch (error) {
                console.error("Error al cargar pedidos:", error)
                setError("Error al cargar tus pedidos. Por favor, intenta de nuevo.")
                setLoading(false)
            }
        }

        const fetchNotificaciones = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/notificaciones/${userId}`)

                if (!response.ok) {
                    throw new Error("No se pudieron cargar las notificaciones")
                }

                const data = await response.json()
                setNotificaciones(data)

                // Contar notificaciones no leídas
                const noLeidas = data.filter((notif) => !notif.leida).length
                setNotificacionesNoLeidas(noLeidas)
            } catch (error) {
                console.error("Error al cargar notificaciones:", error)
            }
        }

        if (userId) {
            fetchPedidos()
            fetchNotificaciones()
        }
    }, [userId])

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
    }

    // Cerrar detalles del pedido
    const cerrarDetalles = () => {
        setPedidoSeleccionado(null)
    }

    // Obtener mensaje según el estado del pedido
    const getMensajeEstado = (estado) => {
        switch (estado) {
            case "Pendiente":
                return "Tu pedido está pendiente de procesamiento."
            case "Procesando":
                return "Tu pedido está siendo procesado."
            case "Enviado":
                return "¡Tu pedido ha sido enviado! Pronto llegará a tu dirección."
            case "Entregado":
                return "Tu pedido ha sido entregado. ¡Gracias por tu compra!"
            case "Cancelado":
                return "Lo sentimos, tu pedido ha sido cancelado."
            default:
                return ""
        }
    }

    // Marcar notificación como leída
    const marcarNotificacionComoLeida = async (notificacionId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/notificaciones/${notificacionId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                throw new Error("Error al actualizar la notificación")
            }

            // Actualizar el estado local de las notificaciones
            setNotificaciones(
                notificaciones.map((notif) => (notif._id === notificacionId ? { ...notif, leida: true } : notif)),
            )

            // Actualizar contador de no leídas
            setNotificacionesNoLeidas((prev) => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Error:", error)
        }
    }

    // Alternar vista de notificaciones
    const toggleNotificaciones = () => {
        setMostrarNotificaciones(!mostrarNotificaciones)
    }

    return (
        <div className="mis-pedidos-modal-overlay">
            <div className="mis-pedidos-modal">
                <div className="mis-pedidos-header">
                    <h2>Mis Pedidos</h2>
                    <div className="header-actions">
                        <button className="notificaciones-button" onClick={toggleNotificaciones}>
                            <i className="fas fa-bell"></i>
                            {notificacionesNoLeidas > 0 && <span className="notificaciones-badge">{notificacionesNoLeidas}</span>}
                        </button>
                        <button className="close-button" onClick={onClose}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <div className="mis-pedidos-content">
                    {mostrarNotificaciones ? (
                        <div className="notificaciones-panel">
                            <div className="notificaciones-header">
                                <h3>Notificaciones</h3>
                                <button className="volver-button" onClick={toggleNotificaciones}>
                                    <i className="fas fa-arrow-left"></i> Volver a mis pedidos
                                </button>
                            </div>

                            {notificaciones.length > 0 ? (
                                <div className="notificaciones-lista">
                                    {notificaciones.map((notif) => (
                                        <div
                                            key={notif._id}
                                            className={`notificacion-item ${!notif.leida ? "no-leida" : ""}`}
                                            onClick={() => marcarNotificacionComoLeida(notif._id)}
                                        >
                                            <div className="notificacion-icono">
                                                {notif.tipo === "pedido_eliminado" ? (
                                                    <i className="fas fa-trash-alt"></i>
                                                ) : (
                                                    <i className="fas fa-info-circle"></i>
                                                )}
                                            </div>
                                            <div className="notificacion-contenido">
                                                <p className="notificacion-mensaje">{notif.mensaje}</p>
                                                {notif.tipo === "pedido_eliminado" && notif.datos && (
                                                    <div className="notificacion-detalles">
                                                        <p>Pedido cancelado: ${notif.datos.total.toLocaleString("es-ES")}</p>
                                                        <p>Fecha: {formatDate(notif.datos.fechaPedido)}</p>
                                                        <p>
                                                            Productos: {notif.datos.productos.map((p) => `${p.cantidad}x ${p.nombre}`).join(", ")}
                                                        </p>
                                                    </div>
                                                )}
                                                <p className="notificacion-fecha">{formatDate(notif.fecha)}</p>
                                            </div>
                                            {!notif.leida && <div className="notificacion-indicador"></div>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-notificaciones">
                                    <i className="fas fa-bell-slash"></i>
                                    <p>No tienes notificaciones</p>
                                </div>
                            )}
                        </div>
                    ) : pedidoSeleccionado ? (
                        <div className="pedido-detalles">
                            <div className="detalles-header">
                                <h3>Detalles del Pedido</h3>
                                <button className="volver-button" onClick={cerrarDetalles}>
                                    <i className="fas fa-arrow-left"></i> Volver a mis pedidos
                                </button>
                            </div>

                            <div className="estado-actual">
                                <div className={`estado-badge ${getEstadoClass(pedidoSeleccionado.estado)}`}>
                                    {pedidoSeleccionado.estado}
                                </div>
                                <p className="estado-mensaje">{getMensajeEstado(pedidoSeleccionado.estado)}</p>
                            </div>

                            <div className="detalles-info">
                                <div className="detalles-seccion">
                                    <h4>Información del Pedido</h4>
                                    <p>
                                        <strong>Fecha:</strong> {formatDate(pedidoSeleccionado.fechaPedido)}
                                    </p>
                                    <p>
                                        <strong>Dirección de envío:</strong> {pedidoSeleccionado.direccionEnvio}
                                    </p>
                                    <p>
                                        <strong>Total:</strong> ${pedidoSeleccionado.total.toLocaleString("es-ES")}
                                    </p>
                                </div>

                                <div className="detalles-seccion">
                                    <h4>Seguimiento</h4>
                                    <div className="seguimiento-timeline">
                                        <div
                                            className={`timeline-step ${pedidoSeleccionado.estado !== "Cancelado" ? "active" : "cancelled"}`}
                                        >
                                            <div className="timeline-icon">
                                                <i className="fas fa-shopping-cart"></i>
                                            </div>
                                            <div className="timeline-content">
                                                <h5>Pedido Recibido</h5>
                                                <p>{formatDate(pedidoSeleccionado.fechaPedido)}</p>
                                            </div>
                                        </div>

                                        <div
                                            className={`timeline-step ${["Procesando", "Enviado", "Entregado"].includes(pedidoSeleccionado.estado) ? "active" : ""} ${pedidoSeleccionado.estado === "Cancelado" ? "cancelled" : ""}`}
                                        >
                                            <div className="timeline-icon">
                                                <i className="fas fa-box"></i>
                                            </div>
                                            <div className="timeline-content">
                                                <h5>En Procesamiento</h5>
                                            </div>
                                        </div>

                                        <div
                                            className={`timeline-step ${["Enviado", "Entregado"].includes(pedidoSeleccionado.estado) ? "active" : ""} ${pedidoSeleccionado.estado === "Cancelado" ? "cancelled" : ""}`}
                                        >
                                            <div className="timeline-icon">
                                                <i className="fas fa-shipping-fast"></i>
                                            </div>
                                            <div className="timeline-content">
                                                <h5>Enviado</h5>
                                            </div>
                                        </div>

                                        <div
                                            className={`timeline-step ${pedidoSeleccionado.estado === "Entregado" ? "active" : ""} ${pedidoSeleccionado.estado === "Cancelado" ? "cancelled" : ""}`}
                                        >
                                            <div className="timeline-icon">
                                                <i className="fas fa-home"></i>
                                            </div>
                                            <div className="timeline-content">
                                                <h5>Entregado</h5>
                                            </div>
                                        </div>
                                    </div>
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
                        </div>
                    ) : (
                        <>
                            <h3>Historial de Pedidos</h3>

                            {loading ? (
                                <div className="loading-spinner">
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <p>Cargando tus pedidos...</p>
                                </div>
                            ) : error ? (
                                <div className="error-message">{error}</div>
                            ) : (
                                <div className="pedidos-table-container">
                                    {pedidos.length > 0 ? (
                                        <table className="pedidos-table">
                                            <thead>
                                                <tr>
                                                    <th>Fecha</th>
                                                    <th>Total</th>
                                                    <th>Estado</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pedidos.map((pedido) => (
                                                    <tr key={pedido._id}>
                                                        <td>{formatDate(pedido.fechaPedido)}</td>
                                                        <td>${pedido.total.toLocaleString("es-ES")}</td>
                                                        <td>
                                                            <span className={`estado-badge ${getEstadoClass(pedido.estado)}`}>{pedido.estado}</span>
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
                                            <p>No has realizado ningún pedido aún</p>
                                            <p>¡Explora nuestra tienda y encuentra productos increíbles!</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="mis-pedidos-footer">
                    <button className="close-pedidos-button" onClick={onClose}>
                        <i className="fas fa-times-circle"></i> Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MisPedidos

