"use client"

import { useState, useEffect } from "react"
import "../hoja-de-estilos/PedidosPanel.css"
import { supabase } from "../utils/supabase.ts"

function PedidosPanel({ onClose }) {
    const [pedidos, setPedidos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)
    const [estadoSeleccionado, setEstadoSeleccionado] = useState("")
    const [actualizandoEstado, setActualizandoEstado] = useState(false)
    const [filtroEstado, setFiltroEstado] = useState("Todos")
    const [busqueda, setBusqueda] = useState("")
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        const checkAdminAndFetchPedidos = async () => {
            try {
                setLoading(true)

                // Verificar si el usuario es administrador
                const {
                    data: { user },
                } = await supabase.auth.getUser()

                if (!user) {
                    throw new Error("No hay sesión de usuario")
                }

                // Verificar si el usuario es administrador usando el campo isadmin
                const { data: userData, error: userError } = await supabase
                    .from("usuarios")
                    .select("isadmin")
                    .eq("auth_id", user.id)
                    .single()

                if (userError) {
                    throw new Error("Error al verificar permisos de administrador")
                }

                setIsAdmin(userData?.isadmin || false)

                if (!userData?.isadmin) {
                    throw new Error("No tienes permisos de administrador")
                }

                // Obtener pedidos desde Supabase con join correcto
                const { data: pedidosData, error: pedidosError } = await supabase
                    .from("pedidos")
                    .select(`
                        *,
                        usuario:user_id (
                            id,
                            nombre,
                            email,
                            apellido
                        )
                    `)
                    .order("fecha_pedido", { ascending: false })

                if (pedidosError) {
                    throw pedidosError
                }

                // Obtener productos para cada pedido
                const pedidosConProductos = await Promise.all(
                    pedidosData.map(async (pedido) => {
                        const { data: productos, error: productosError } = await supabase
                            .from("pedido_productos")
                            .select(`
                                cantidad,
                                color,
                                talla,
                                precio,
                                producto:producto_id (
                                    nombre
                                )
                            `)
                            .eq("pedido_id", pedido.id)

                        if (productosError) {
                            console.error("Error al obtener productos del pedido:", productosError)
                            return {
                                ...pedido,
                                productos: [],
                            }
                        }

                        // Formatear productos
                        const productosFormateados = productos.map((item) => ({
                            nombre: item.producto?.nombre || "Producto no disponible",
                            precio: item.precio || 0,
                            cantidad: item.cantidad || 1,
                            color: item.color || "N/A",
                            talla: item.talla || "N/A",
                        }))

                        return {
                            ...pedido,
                            productos: productosFormateados,
                        }
                    }),
                )

                setPedidos(pedidosConProductos)
            } catch (error) {
                console.error("Error:", error)
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }

        checkAdminAndFetchPedidos()
    }, [])

    // Formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return "N/A"

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
            // Actualizar en Supabase
            const { error } = await supabase
                .from("pedidos")
                .update({ estado: estadoSeleccionado })
                .eq("id", pedidoSeleccionado.id)

            if (error) throw error

            // Actualizar el pedido en la lista
            setPedidos(pedidos.map((p) => (p.id === pedidoSeleccionado.id ? { ...p, estado: estadoSeleccionado } : p)))

            // Actualizar el pedido seleccionado
            setPedidoSeleccionado({ ...pedidoSeleccionado, estado: estadoSeleccionado })

            alert("Estado del pedido actualizado correctamente")
        } catch (error) {
            console.error("Error al actualizar estado:", error)
            alert("Error al actualizar el estado del pedido: " + error.message)
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
            // Eliminar en Supabase
            const { error } = await supabase.from("pedidos").delete().eq("id", pedidoSeleccionado.id)

            if (error) throw error

            // Eliminar el pedido de la lista
            setPedidos(pedidos.filter((p) => p.id !== pedidoSeleccionado.id))

            // Cerrar detalles
            cerrarDetalles()

            alert("Pedido eliminado correctamente. Se ha notificado al usuario.")
        } catch (error) {
            console.error("Error al eliminar pedido:", error)
            alert("Error al eliminar el pedido: " + error.message)
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
                (pedido.usuario && pedido.usuario.nombre && pedido.usuario.nombre.toLowerCase().includes(terminoBusqueda)) ||
                (pedido.usuario && pedido.usuario.email && pedido.usuario.email.toLowerCase().includes(terminoBusqueda)) ||
                (pedido.id && pedido.id.toString().toLowerCase().includes(terminoBusqueda))
            )
        }

        return true
    })

    // Verificar si un pedido tiene comprobante de pago pendiente
    const tienePagoPendiente = (pedido) => {
        return pedido.pago && pedido.pago.estado === "Pendiente"
    }

    if (!isAdmin) {
        return (
            <div className="pedidos-panel-overlay">
                <div className="pedidos-panel-modal">
                    <div className="pedidos-panel-header">
                        <h2>Acceso Denegado</h2>
                        <button className="close-button" onClick={onClose}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="pedidos-panel-content">
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
        <div className="pedidos-modal-overlay">
            <div className="pedidos-modal">
                <div className="pedidos-header">
                    <h2>Panel de Pedidos</h2>
                    <button className="close-button" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="pedidos-content">
                    {loading ? (
                        <div className="loading-spinner">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Cargando pedidos...</p>
                        </div>
                    ) : error ? (
                        <div className="error-message">
                            <i className="fas fa-exclamation-triangle"></i>
                            <p>{error}</p>
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
                                                    <tr key={pedido.id} className={tienePagoPendiente(pedido) ? "fila-pago-pendiente" : ""}>
                                                        <td>{pedido.id.toString().substring(0, 8)}...</td>
                                                        <td>{pedido.usuario ? pedido.usuario.nombre : "N/A"}</td>
                                                        <td>{formatDate(pedido.created_at || pedido.fechaPedido)}</td>
                                                        <td>${pedido.total ? pedido.total.toLocaleString("es-ES") : "0"}</td>
                                                        <td>
                                                            <span className={`estado-badge ${getEstadoClass(pedido.estado)}`}>
                                                                {pedido.estado || "Pendiente"}
                                                            </span>
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

