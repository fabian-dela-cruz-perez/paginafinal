"use client"

import { useState, useEffect } from "react"
import { supabase } from "../utils/supabase.ts"
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
                        usuarios:usuario_id (
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
                        // Intentar obtener productos de pedido_productos primero (tabla principal)
                        const { data: productosRelacion, error: productosError } = await supabase
                            .from("pedido_productos")
                            .select(`
                        cantidad,
                        color,
                        talla,
                        precio_unitario,
                        productos:producto_id (
                            id,
                            nombre,
                            descripcion,
                            precio
                        )
                    `)
                            .eq("pedido_id", pedido.id)

                        console.log(`Productos encontrados para pedido ${pedido.id}:`, productosRelacion)

                        if (!productosError && productosRelacion && productosRelacion.length > 0) {
                            // Si hay productos en pedido_productos, usarlos
                            const productosFormateados = productosRelacion.map((item) => ({
                                nombre: item.productos?.nombre || "Producto no disponible",
                                precio: item.precio_unitario || 0,
                                cantidad: item.cantidad || 1,
                                color: item.color || "N/A",
                                talla: item.talla || "N/A",
                                subtotal: (item.precio_unitario || 0) * (item.cantidad || 1),
                            }))

                            return {
                                ...pedido,
                                usuario: pedido.usuarios,
                                productos: productosFormateados,
                            }
                        }

                        // Si no hay productos en pedido_productos, intentar con detalles_pedido
                        const { data: detalles, error: detallesError } = await supabase
                            .from("detalles_pedido")
                            .select("*")
                            .eq("pedido_id", pedido.id)

                        if (!detallesError && detalles && detalles.length > 0) {
                            // Si hay detalles, usarlos
                            const productosFormateados = detalles.map((item) => ({
                                nombre: item.producto_nombre || "Producto no disponible",
                                precio: item.precio || 0,
                                cantidad: item.cantidad || 1,
                                color: item.color || "N/A",
                                talla: item.talla || "N/A",
                                subtotal: item.subtotal || 0,
                            }))

                            return {
                                ...pedido,
                                usuario: pedido.usuarios,
                                productos: productosFormateados,
                            }
                        }

                        // Si no hay productos en ninguna tabla, devolver un array vacío
                        return {
                            ...pedido,
                            usuario: pedido.usuarios,
                            productos: [],
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

    // Obtener clase CSS según el estado del pedido
    const getEstadoClass = (estado) => {
        switch (estado) {
            case "pendiente":
            case "Pendiente":
                return "estado-pendiente"
            case "procesando":
            case "Procesando":
                return "estado-procesando"
            case "enviado":
            case "Enviado":
                return "estado-enviado"
            case "entregado":
            case "Entregado":
                return "estado-entregado"
            case "cancelado":
            case "Cancelado":
                return "estado-cancelado"
            default:
                return ""
        }
    }

    // Formatear dirección de envío
    const formatearDireccion = (direccionStr) => {
        if (!direccionStr) return "Dirección no disponible"

        try {
            // Intentar parsear si es un JSON
            if (typeof direccionStr === "string" && direccionStr.startsWith("{")) {
                const direccion = JSON.parse(direccionStr)

                // Formatear la dirección de manera legible
                if (direccion.nombre && direccion.apellido) {
                    return (
                        <div className="direccion-formateada">
                            <p>
                                <strong>Nombre:</strong> {direccion.nombre} {direccion.apellido}
                            </p>
                            <p>
                                <strong>Dirección:</strong> {direccion.direccion}
                            </p>
                            <p>
                                <strong>Ciudad:</strong> {direccion.ciudad || ""}
                            </p>
                            {direccion.codigoPostal && (
                                <p>
                                    <strong>Código Postal:</strong> {direccion.codigoPostal}
                                </p>
                            )}
                            <p>
                                <strong>Teléfono:</strong> {direccion.telefono}
                            </p>
                            {direccion.instrucciones && (
                                <p>
                                    <strong>Instrucciones:</strong> {direccion.instrucciones}
                                </p>
                            )}
                        </div>
                    )
                } else {
                    // Si no tiene nombre/apellido, mostrar campos disponibles
                    return (
                        <div className="direccion-formateada">
                            {Object.entries(direccion).map(([key, value]) => (
                                <p key={key}>
                                    <strong>{key}:</strong> {value}
                                </p>
                            ))}
                        </div>
                    )
                }
            } else {
                // Si no es JSON, mostrar como texto
                return <p>{direccionStr}</p>
            }
        } catch (error) {
            console.error("Error al formatear dirección:", error)
            return <p>{direccionStr}</p>
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
                .update({
                    estado: estadoSeleccionado,
                    fecha_actualizacion: new Date().toISOString(),
                })
                .eq("id", pedidoSeleccionado.id)

            if (error) throw error

            // Crear notificación para el usuario
            await supabase.from("notificaciones").insert({
                usuario_id: pedidoSeleccionado.usuario.id,
                tipo: "estado_actualizado",
                mensaje: `El estado de tu pedido ha sido actualizado a: ${estadoSeleccionado}`,
                leida: false,
                fecha: new Date().toISOString(),
            })

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
            // Primero eliminar los productos asociados al pedido
            const { error: errorProductos } = await supabase
                .from("pedido_productos")
                .delete()
                .eq("pedido_id", pedidoSeleccionado.id)

            if (errorProductos) throw errorProductos

            // Eliminar en Supabase
            const { error } = await supabase.from("pedidos").delete().eq("id", pedidoSeleccionado.id)

            if (error) throw error

            // Crear notificación para el usuario
            await supabase.from("notificaciones").insert({
                usuario_id: pedidoSeleccionado.usuario.id,
                tipo: "pedido_eliminado",
                mensaje: "Tu pedido ha sido cancelado por el administrador",
                leida: false,
                fecha: new Date().toISOString(),
                datos: {
                    total: pedidoSeleccionado.total,
                    fechaPedido: pedidoSeleccionado.fecha_pedido,
                    productos: pedidoSeleccionado.productos,
                },
            })

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
                            {!pedidoSeleccionado ? (
                                <>
                                    <div className="filtros-busqueda">
                                        <div className="filtro-estado">
                                            <label htmlFor="filtroEstado">Filtrar por estado:</label>
                                            <select id="filtroEstado" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                                                <option value="Todos">Todos</option>
                                                <option value="pendiente">Pendiente</option>
                                                <option value="procesando">Procesando</option>
                                                <option value="enviado">Enviado</option>
                                                <option value="entregado">Entregado</option>
                                                <option value="cancelado">Cancelado</option>
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

                                    {pedidosFiltrados.length > 0 ? (
                                        <div className="pedidos-table-container">
                                            <table className="pedidos-table">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Cliente</th>
                                                        <th>Fecha</th>
                                                        <th>Total</th>
                                                        <th>Estado</th>
                                                        <th>Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pedidosFiltrados.map((pedido) => (
                                                        <tr key={pedido.id}>
                                                            <td>{pedido.id.toString().substring(0, 8)}...</td>
                                                            <td>{pedido.usuario ? pedido.usuario.nombre : "N/A"}</td>
                                                            <td>{formatDate(pedido.created_at || pedido.fecha_pedido)}</td>
                                                            <td>${pedido.total ? pedido.total.toLocaleString("es-ES") : "0"}</td>
                                                            <td>
                                                                <span className={`estado-badge ${getEstadoClass(pedido.estado)}`}>
                                                                    {pedido.estado || "Pendiente"}
                                                                </span>
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
                                        </div>
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
                                </>
                            ) : (
                                <div className="pedido-detalles">
                                    <div className="detalles-header">
                                        <button className="volver-button" onClick={cerrarDetalles}>
                                            <i className="fas fa-arrow-left"></i> Volver a la lista
                                        </button>
                                        <div className="detalles-acciones">
                                            <button className="eliminar-button" onClick={eliminarPedido}>
                                                <i className="fas fa-trash"></i> Eliminar pedido
                                            </button>
                                            <button className="cerrar-button" onClick={onClose}>
                                                <i className="fas fa-times"></i> Cerrar
                                            </button>
                                        </div>
                                    </div>

                                    <div className="detalles-grid">
                                        <div className="detalles-seccion">
                                            <h3>Información del pedido</h3>
                                            <div className="detalles-info">
                                                <p>
                                                    <strong>ID:</strong> {pedidoSeleccionado.id}
                                                </p>
                                                <p>
                                                    <strong>Cliente:</strong> {pedidoSeleccionado.usuario?.nombre}{" "}
                                                    {pedidoSeleccionado.usuario?.apellido}
                                                </p>
                                                <p>
                                                    <strong>Email:</strong> {pedidoSeleccionado.usuario?.email}
                                                </p>
                                                <p>
                                                    <strong>Fecha:</strong>{" "}
                                                    {formatDate(pedidoSeleccionado.fecha_pedido || pedidoSeleccionado.created_at)}
                                                </p>
                                                <p>
                                                    <strong>Total:</strong> ${pedidoSeleccionado.total.toLocaleString("es-ES")}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="detalles-seccion">
                                            <h3>Dirección de envío</h3>
                                            <div className="detalles-info">
                                                {formatearDireccion(pedidoSeleccionado.direccion_envio)}
                                                <p>
                                                    <strong>Ciudad:</strong> {pedidoSeleccionado.ciudad_envio}
                                                </p>
                                                {pedidoSeleccionado.codigo_postal_envio && (
                                                    <p>
                                                        <strong>Código postal:</strong> {pedidoSeleccionado.codigo_postal_envio}
                                                    </p>
                                                )}
                                                <p>
                                                    <strong>Teléfono:</strong> {pedidoSeleccionado.telefono_contacto}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="detalles-seccion productos-seccion">
                                        <h3>Productos</h3>
                                        <table className="productos-table">
                                            <thead>
                                                <tr>
                                                    <th>Producto</th>
                                                    <th>Precio</th>
                                                    <th>Cantidad</th>
                                                    <th>Color</th>
                                                    <th>Talla</th>
                                                    <th>Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pedidoSeleccionado.productos && pedidoSeleccionado.productos.length > 0 ? (
                                                    pedidoSeleccionado.productos.map((producto, index) => (
                                                        <tr key={index}>
                                                            <td>{producto.nombre}</td>
                                                            <td>
                                                                $
                                                                {typeof producto.precio === "number"
                                                                    ? producto.precio.toLocaleString("es-ES")
                                                                    : producto.precio}
                                                            </td>
                                                            <td>{producto.cantidad}</td>
                                                            <td>{producto.color}</td>
                                                            <td>{producto.talla}</td>
                                                            <td>
                                                                $
                                                                {typeof producto.subtotal === "number"
                                                                    ? producto.subtotal.toLocaleString("es-ES")
                                                                    : (producto.precio * producto.cantidad).toLocaleString("es-ES")}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" style={{ textAlign: "center" }}>
                                                            No hay productos disponibles
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="detalles-seccion actualizar-estado">
                                        <h3>Actualizar estado</h3>
                                        <div className="actualizar-estado-form">
                                            <select
                                                value={estadoSeleccionado}
                                                onChange={(e) => setEstadoSeleccionado(e.target.value)}
                                                className="estado-select"
                                            >
                                                <option value="pendiente">Pendiente</option>
                                                <option value="procesando">Procesando</option>
                                                <option value="enviado">Enviado</option>
                                                <option value="entregado">Entregado</option>
                                                <option value="cancelado">Cancelado</option>
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
                                                    "Actualizar estado"
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {pedidoSeleccionado.notas && (
                                        <div className="detalles-seccion">
                                            <h3>Notas</h3>
                                            <p className="notas-text">{pedidoSeleccionado.notas}</p>
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

