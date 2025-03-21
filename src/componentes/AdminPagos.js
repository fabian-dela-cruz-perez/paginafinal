"use client"

import { useState, useEffect } from "react"
import { supabase } from "../utils/supabase.ts"
import "../hoja-de-estilos/AdminPagos.css"

function AdminPagosSimplificado({ onClose, volverAPedidos, actualizarPedidos, pedidos }) {
    const [pagos, setPagos] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    const [filtro, setFiltro] = useState("todos")
    const [pagoSeleccionado, setPagoSeleccionado] = useState(null)
    const [estadoPagoSeleccionado, setEstadoPagoSeleccionado] = useState("")
    const [actualizandoPago, setActualizandoPago] = useState(false)
    const [archivoComprobante, setArchivoComprobante] = useState(null)
    const [subiendoComprobante, setSubiendoComprobante] = useState(false)

    // Cargar pagos
    useEffect(() => {
        const cargarPagos = async () => {
            try {
                setCargando(true)

                // Obtener pagos directamente de la tabla pagos
                const { data: datosPagos, error: errorPagos } = await supabase
                    .from("pagos")
                    .select(`
                      id,
                      pedido_id,
                      metodo,
                      referencia,
                      estado,
                      fecha,
                      monto,
                      comprobante_verificado
                  `)
                    .order("fecha", { ascending: false })

                if (errorPagos) {
                    throw errorPagos
                }

                // Obtener información de pedidos y usuarios
                const pagosProcesados = await Promise.all(
                    datosPagos.map(async (pago) => {
                        // Obtener información del pedido
                        const { data: pedidoData, error: pedidoError } = await supabase
                            .from("pedidos")
                            .select(`
                              id,
                              usuario_id,
                              estado,
                              total,
                              usuarios:usuario_id (
                                  id,
                                  nombre,
                                  email,
                                  apellido
                              )
                          `)
                            .eq("id", pago.pedido_id)
                            .single()

                        if (pedidoError && pedidoError.code !== "PGRST116") {
                            console.error("Error al obtener pedido:", pedidoError)
                        }

                        return {
                            id: pago.id,
                            pedidoId: pago.pedido_id,
                            metodoPago: pago.metodo,
                            estado: pedidoData?.estado || "desconocido",
                            estadoPago: pago.comprobante_verificado
                                ? "verificado"
                                : pago.estado === "rechazado"
                                    ? "rechazado"
                                    : "pendiente",
                            referencia: pago.referencia || "N/A",
                            fecha: pago.fecha,
                            total: pago.monto || pedidoData?.total || 0,
                            usuario: pedidoData?.usuarios || { nombre: "Usuario desconocido", email: "N/A" },
                            pedidoCompleto: pedidoData,
                        }
                    }),
                )

                setPagos(pagosProcesados)
            } catch (err) {
                setError(err.message)
                console.error("Error al cargar pagos:", err)
            } finally {
                setCargando(false)
            }
        }

        cargarPagos()
    }, [])

    // Filtrar pagos según estado
    const pagosFiltrados =
        filtro === "todos"
            ? pagos
            : pagos.filter((pago) => {
                if (filtro === "verificado") {
                    return pago.estadoPago === "verificado"
                } else if (filtro === "pendiente") {
                    return pago.estadoPago === "pendiente"
                } else if (filtro === "rechazado") {
                    return pago.estadoPago === "rechazado"
                } else {
                    return pago.estado.toLowerCase() === filtro.toLowerCase()
                }
            })

    // Manejar cambio de archivo
    const handleArchivoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setArchivoComprobante(e.target.files[0])
        }
    }

    // Guardar comprobante localmente
    const guardarComprobante = () => {
        if (!archivoComprobante) {
            alert("Por favor selecciona un archivo primero")
            return
        }

        try {
            // Crear un nombre de archivo con fecha y hora
            const fecha = new Date().toISOString().replace(/[:.]/g, "-")
            const nombreArchivo = `comprobante_${fecha}_${archivoComprobante.name}`

            // Crear un enlace de descarga
            const url = URL.createObjectURL(archivoComprobante)

            // Crear un elemento de enlace para descargar
            const a = document.createElement("a")
            a.href = url
            a.download = nombreArchivo
            document.body.appendChild(a)
            a.click()

            // Limpiar
            setTimeout(() => {
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
            }, 100)

            alert("Comprobante guardado correctamente en tu dispositivo")
            setArchivoComprobante(null)
        } catch (error) {
            console.error("Error al guardar el comprobante:", error)
            alert("Error al guardar el comprobante: " + error.message)
        }
    }

    // Ver detalles del pedido
    const verDetallesPedido = (pedidoId) => {
        try {
            // Verificar si pedidos existe y es un array
            if (!pedidos || !Array.isArray(pedidos)) {
                alert("No se pueden ver los detalles del pedido en este momento.")
                // Verificar si volverAPedidos es una función antes de llamarla
                if (typeof volverAPedidos === "function") {
                    volverAPedidos()
                }
                return
            }

            // Buscar el pedido en la lista de pedidos
            const pedidoEncontrado = pedidos.find((p) => p.id === pedidoId)

            if (pedidoEncontrado) {
                // Verificar si volverAPedidos es una función antes de llamarla
                if (typeof volverAPedidos === "function") {
                    volverAPedidos()
                } else {
                    alert("No se puede volver a la vista de pedidos. Por favor, cierre esta ventana y vuelva a intentarlo.")
                }
            } else {
                alert(`No se encontró el pedido con ID ${pedidoId} en la lista actual.`)
                // Verificar si volverAPedidos es una función antes de llamarla
                if (typeof volverAPedidos === "function") {
                    volverAPedidos()
                }
            }
        } catch (error) {
            console.error("Error al ver detalles del pedido:", error)
            alert("Ocurrió un error al intentar ver los detalles del pedido.")
        }
    }

    // Seleccionar un pago para actualizar
    const seleccionarPago = (pago) => {
        setPagoSeleccionado(pago)
        setEstadoPagoSeleccionado(pago.estadoPago)
        setArchivoComprobante(null)
    }

    // Cerrar detalles del pago
    const cerrarDetallesPago = () => {
        setPagoSeleccionado(null)
        setEstadoPagoSeleccionado("")
        setArchivoComprobante(null)
    }

    // Actualizar estado del pago
    const actualizarEstadoPago = async () => {
        if (!pagoSeleccionado || estadoPagoSeleccionado === pagoSeleccionado.estadoPago) {
            return
        }

        setActualizandoPago(true)

        try {
            // Actualizar el pago en la base de datos
            const { error } = await supabase
                .from("pagos")
                .update({
                    comprobante_verificado: estadoPagoSeleccionado === "verificado",
                    estado: estadoPagoSeleccionado === "rechazado" ? "rechazado" : "procesado",
                })
                .eq("id", pagoSeleccionado.id)

            if (error) throw error

            // Crear notificación para el usuario
            let mensajeNotificacion = ""
            if (estadoPagoSeleccionado === "verificado") {
                mensajeNotificacion = "Tu pago ha sido verificado correctamente."
            } else if (estadoPagoSeleccionado === "rechazado") {
                mensajeNotificacion = "Tu pago ha sido rechazado. Por favor, contacta con atención al cliente."
            } else {
                mensajeNotificacion = "El estado de tu pago ha sido actualizado."
            }

            await supabase.from("notificaciones").insert({
                usuario_id: pagoSeleccionado.usuario.id,
                tipo: "pago_actualizado",
                mensaje: mensajeNotificacion,
                leida: false,
                fecha: new Date().toISOString(),
            })

            // Actualizar el pago en la lista
            setPagos(pagos.map((p) => (p.id === pagoSeleccionado.id ? { ...p, estadoPago: estadoPagoSeleccionado } : p)))

            // Actualizar el pago seleccionado
            setPagoSeleccionado({ ...pagoSeleccionado, estadoPago: estadoPagoSeleccionado })

            // Actualizar también la lista de pedidos en el componente padre
            if (actualizarPedidos && pedidos) {
                const pedidosActualizados = pedidos.map((p) => {
                    if (p.id === pagoSeleccionado.pedidoId) {
                        return { ...p, estadoPago: estadoPagoSeleccionado }
                    }
                    return p
                })
                actualizarPedidos(pedidosActualizados)
            }

            alert("Estado del pago actualizado correctamente")
        } catch (error) {
            console.error("Error al actualizar estado del pago:", error)
            alert("Error al actualizar el estado del pago: " + error.message)
        } finally {
            setActualizandoPago(false)
        }
    }

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal admin-pagos-modal">
                <div className="admin-modal-header">
                    <h2>Historial de Pagos</h2>
                    <div className="panel-tabs">
                        <button className="tab-button" onClick={volverAPedidos}>
                            Pedidos
                        </button>
                        <button className="tab-button active">Pagos</button>
                    </div>
                    <button className="close-button" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="admin-modal-content">
                    {!pagoSeleccionado ? (
                        <div className="admin-pagos-container">
                            <div className="filtros-pagos">
                                <label>Filtrar por estado:</label>
                                <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
                                    <option value="todos">Todos</option>
                                    <option value="pendiente">Pendiente</option>
                                    <option value="verificado">Verificado</option>
                                    <option value="rechazado">Rechazado</option>
                                    <option value="procesando">Procesando</option>
                                    <option value="completado">Completado</option>
                                    <option value="entregado">Entregado</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                            </div>

                            {error && <div className="error-container">{error}</div>}

                            {cargando ? (
                                <div className="cargando-container">
                                    <i className="fas fa-spinner fa-spin"></i> Cargando...
                                </div>
                            ) : pagosFiltrados.length === 0 ? (
                                <div className="no-resultados">No hay pagos que coincidan con el filtro seleccionado</div>
                            ) : (
                                <div className="tabla-pagos">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Cliente</th>
                                                <th>Referencia</th>
                                                <th>Fecha</th>
                                                <th>Método</th>
                                                <th>Total</th>
                                                <th>Estado Pedido</th>
                                                <th>Estado Pago</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pagosFiltrados.map((pago) => (
                                                <tr key={pago.id} className={`estado-${pago.estado.toLowerCase()}`}>
                                                    <td>{pago.usuario.nombre}</td>
                                                    <td>{pago.referencia}</td>
                                                    <td>{new Date(pago.fecha).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className={`metodo-${pago.metodoPago}`}>
                                                            {pago.metodoPago === "nequi"
                                                                ? "Nequi"
                                                                : pago.metodoPago === "transferencia"
                                                                    ? "Transferencia"
                                                                    : pago.metodoPago}
                                                        </span>
                                                    </td>
                                                    <td>${pago.total.toLocaleString("es-ES")}</td>
                                                    <td>
                                                        <span className={`badge-estado ${pago.estado.toLowerCase()}`}>{pago.estado}</span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge-estado ${pago.estadoPago}`}>
                                                            {pago.estadoPago === "verificado"
                                                                ? "Verificado"
                                                                : pago.estadoPago === "rechazado"
                                                                    ? "Rechazado"
                                                                    : "Pendiente"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="acciones-pago">
                                                            <button
                                                                className="btn-editar-pago"
                                                                onClick={() => seleccionarPago(pago)}
                                                                title="Editar estado del pago"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button
                                                                className="btn-ver-pedido"
                                                                onClick={() => verDetallesPedido(pago.pedidoId)}
                                                                title="Ver detalles del pedido"
                                                            >
                                                                <i className="fas fa-search"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="pago-detalles">
                            <div className="detalles-header">
                                <button className="volver-button" onClick={cerrarDetallesPago}>
                                    <i className="fas fa-arrow-left"></i> Volver a la lista
                                </button>
                            </div>

                            <div className="detalles-grid">
                                <div className="detalles-seccion">
                                    <h3>Información del pago</h3>
                                    <div className="detalles-info">
                                        <p>
                                            <strong>ID:</strong> {pagoSeleccionado.id}
                                        </p>
                                        <p>
                                            <strong>Pedido ID:</strong> {pagoSeleccionado.pedidoId}
                                        </p>
                                        <p>
                                            <strong>Cliente:</strong> {pagoSeleccionado.usuario.nombre} {pagoSeleccionado.usuario.apellido}
                                        </p>
                                        <p>
                                            <strong>Email:</strong> {pagoSeleccionado.usuario.email}
                                        </p>
                                        <p>
                                            <strong>Fecha:</strong> {new Date(pagoSeleccionado.fecha).toLocaleDateString()}
                                        </p>
                                        <p>
                                            <strong>Método:</strong> {pagoSeleccionado.metodoPago}
                                        </p>
                                        <p>
                                            <strong>Referencia:</strong> {pagoSeleccionado.referencia}
                                        </p>
                                        <p>
                                            <strong>Total:</strong> ${pagoSeleccionado.total.toLocaleString("es-ES")}
                                        </p>
                                    </div>
                                </div>

                                <div className="detalles-seccion estado-pago-seccion">
                                    <h3>Actualizar Estado del Pago</h3>
                                    <div className="actualizar-estado-form">
                                        <select
                                            value={estadoPagoSeleccionado}
                                            onChange={(e) => setEstadoPagoSeleccionado(e.target.value)}
                                            className="estado-select"
                                        >
                                            <option value="pendiente">Pendiente de verificación</option>
                                            <option value="verificado">Pago verificado</option>
                                            <option value="rechazado">Pago rechazado</option>
                                        </select>
                                        <button
                                            className="actualizar-button"
                                            onClick={actualizarEstadoPago}
                                            disabled={actualizandoPago || estadoPagoSeleccionado === pagoSeleccionado.estadoPago}
                                        >
                                            {actualizandoPago ? (
                                                <>
                                                    <i className="fas fa-spinner fa-spin"></i> Actualizando...
                                                </>
                                            ) : (
                                                "Actualizar estado del pago"
                                            )}
                                        </button>
                                    </div>
                                    <div className="estado-pago-info">
                                        <p>
                                            <strong>Estado actual:</strong>{" "}
                                            <span className={`estado-badge ${pagoSeleccionado.estadoPago}`}>
                                                {pagoSeleccionado.estadoPago === "verificado"
                                                    ? "Verificado"
                                                    : pagoSeleccionado.estadoPago === "rechazado"
                                                        ? "Rechazado"
                                                        : "Pendiente"}
                                            </span>
                                        </p>
                                        <p className="estado-pago-descripcion">
                                            {pagoSeleccionado.estadoPago === "verificado"
                                                ? "El pago ha sido verificado y confirmado."
                                                : pagoSeleccionado.estadoPago === "rechazado"
                                                    ? "El pago ha sido rechazado. El cliente debe realizar un nuevo pago."
                                                    : "El pago está pendiente de verificación."}
                                        </p>
                                    </div>
                                </div>

                                <div className="detalles-seccion">
                                    <h3>Comprobante de Pago</h3>
                                    <div className="subir-comprobante">
                                        <p>Puedes subir un comprobante de pago para este pedido.</p>
                                        <div className="upload-container">
                                            <input
                                                type="file"
                                                id="comprobante"
                                                accept="image/*,.pdf"
                                                onChange={handleArchivoChange}
                                                className="file-input"
                                            />
                                            <label htmlFor="comprobante" className="file-label">
                                                <i className="fas fa-upload"></i> Seleccionar archivo
                                            </label>
                                            {archivoComprobante && <span className="file-name">{archivoComprobante.name}</span>}
                                        </div>
                                        <button
                                            className="btn-subir-comprobante"
                                            onClick={guardarComprobante}
                                            disabled={!archivoComprobante || subiendoComprobante}
                                        >
                                            {subiendoComprobante ? (
                                                <>
                                                    <i className="fas fa-spinner fa-spin"></i> Guardando...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-download"></i> Guardar comprobante en mi dispositivo
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="detalles-seccion">
                                    <h3>Acciones</h3>
                                    <div className="acciones-container">
                                        <button className="btn-ver-pedido" onClick={() => verDetallesPedido(pagoSeleccionado.pedidoId)}>
                                            <i className="fas fa-search"></i> Ver detalles del pedido
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AdminPagosSimplificado

