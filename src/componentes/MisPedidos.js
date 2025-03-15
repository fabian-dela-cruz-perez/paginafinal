"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import "../hoja-de-estilos/MisPedidos.css"

// Configura tu cliente de Supabase
const supabaseUrl = "https://girvwbqhyfmatsvhzfty.supabase.co"
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpcnZ3YnFoeWZtYXRzdmh6ZnR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MTY1NDEsImV4cCI6MjA1NzM5MjU0MX0.Y6JTe8tRRZ-hHbFd5wKXr5wFXeKbLN_ceBourx27HnA"
const supabase = createClient(supabaseUrl, supabaseAnonKey)

function MisPedidos({ onClose, userId, isAdmin }) {
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
                let query = supabase.from("pedidos").select(`
                *,
                usuarios:user_id (
                    nombre,
                    email
                )
            `)

                // Only filter by user_id if not admin
                if (!isAdmin) {
                    query = query.eq("user_id", userId)
                }

                const { data, error } = await query

                if (error) {
                    throw new Error("No se pudieron cargar los pedidos")
                }

                // Ensure all pedidos have the required properties
                const processedData = data.map((pedido) => ({
                    ...pedido,
                    productos: pedido.productos || [],
                    estado: pedido.estado || "Pendiente",
                    total: pedido.total || 0,
                    fecha_pedido: pedido.fecha_pedido || pedido.fechaPedido,
                }))

                setPedidos(processedData)
                setLoading(false)
            } catch (error) {
                console.error("Error al cargar pedidos:", error)
                setError("Error al cargar los pedidos. Por favor, intenta de nuevo.")
                setLoading(false)
            }
        }

        const fetchNotificaciones = async () => {
            try {
                const { data, error } = await supabase.from("notificaciones").select("*").eq("usuario_id", userId)

                if (error) {
                    throw new Error("No se pudieron cargar las notificaciones")
                }

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
    }, [userId, isAdmin])

    // Formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return "Fecha no disponible"

        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return "Fecha inválida"

            const options = {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
            return date.toLocaleDateString("es-ES", options)
        } catch (error) {
            console.error("Error formatting date:", error)
            return "Fecha inválida"
        }
    }

    // Formatear precio
    const formatPrice = (priceString) => {
        if (!priceString) return "$0"

        // Asegurarse de que priceString sea siempre una cadena
        const formattedPrice = String(priceString)

        return formattedPrice.startsWith("$") ? formattedPrice : `$${formattedPrice}`
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
            const { error } = await supabase.from("notificaciones").update({ leida: true }).eq("id", notificacionId)

            if (error) {
                throw new Error("Error al actualizar la notificación")
            }

            // Actualizar el estado local de las notificaciones
            setNotificaciones(
                notificaciones.map((notif) => (notif.id === notificacionId ? { ...notif, leida: true } : notif)),
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
                    <h2>{isAdmin ? "Todos los Pedidos" : "Mis Pedidos"}</h2>
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
                                            key={notif.id}
                                            className={`notificacion-item ${!notif.leida ? "no-leida" : ""}`}
                                            onClick={() => marcarNotificacionComoLeida(notif.id)}
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

                            <div className="detalles-info">
                                {isAdmin && pedidoSeleccionado.usuarios && (
                                    <p>
                                        <strong>Usuario:</strong> {pedidoSeleccionado.usuarios.nombre || pedidoSeleccionado.usuarios.email}
                                    </p>
                                )}
                                <p>
                                    <strong>Estado:</strong> {pedidoSeleccionado.estado || "No especificado"}
                                </p>
                                <p>
                                    <strong>Total:</strong> {formatPrice(pedidoSeleccionado.total)}
                                </p>
                                <p>
                                    <strong>Fecha:</strong>{" "}
                                    {formatDate(pedidoSeleccionado.fecha_pedido || pedidoSeleccionado.fechaPedido)}
                                </p>
                                <p>
                                    <strong>Productos:</strong>{" "}
                                    {pedidoSeleccionado.productos && Array.isArray(pedidoSeleccionado.productos)
                                        ? pedidoSeleccionado.productos.map((p) => `${p.cantidad}x ${p.nombre}`).join(", ")
                                        : "No hay productos"}
                                </p>
                            </div>

                            <div className="mensaje-estado">
                                <p>{getMensajeEstado(pedidoSeleccionado.estado)}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="lista-pedidos">
                            {loading ? (
                                <div className="loading-spinner"></div>
                            ) : error ? (
                                <div className="error-message">{error}</div>
                            ) : pedidos.length > 0 ? (
                                <ul>
                                    {pedidos.map((pedido) => (
                                        <li key={pedido.id} className={`pedido-item ${getEstadoClass(pedido.estado)}`}>
                                            <div onClick={() => verDetallesPedido(pedido)}>
                                                <span className="pedido-total">{formatPrice(pedido.total)}</span>
                                                <span className="pedido-fecha">{formatDate(pedido.fecha_pedido || pedido.fechaPedido)}</span>
                                                <span className="pedido-estado">{pedido.estado || "Pendiente"}</span>
                                                {isAdmin && pedido.usuarios && (
                                                    <span className="pedido-usuario">
                                                        Usuario: {pedido.usuarios.nombre || pedido.usuarios.email || "Usuario desconocido"}
                                                    </span>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="no-pedidos">
                                    <p>No has realizado ningún pedido.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MisPedidos

