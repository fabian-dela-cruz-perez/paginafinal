"use client"

import { useState, useEffect } from "react"
import { supabase } from "../utils/supabase.ts"
import "../hoja-de-estilos/AdminPagos.css"

function AdminPagos({ onClose }) {
    const [pagos, setPagos] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    const [filtro, setFiltro] = useState("todos")

    // Cargar pagos
    useEffect(() => {
        const cargarPagos = async () => {
            try {
                setCargando(true)

                // Obtener pedidos con información de pago
                const { data, error } = await supabase
                    .from("pedidos")
                    .select(`
                        id,
                        usuario_id,
                        total,
                        metodo_pago,
                        referencia_pago,
                        comprobante_url,
                        estado,
                        fecha_pedido,
                        usuarios:usuario_id (
                            nombre,
                            email
                        )
                    `)
                    .not("metodo_pago", "is", null)
                    .order("fecha_pedido", { ascending: false })

                if (error) {
                    throw error
                }

                // Formatear datos de pagos
                const pagosProcesados = data.map((pedido) => ({
                    id: pedido.id,
                    pedidoId: pedido.id,
                    metodoPago: pedido.metodo_pago,
                    estado: pedido.estado,
                    referencia: pedido.referencia_pago || "N/A",
                    fecha: pedido.fecha_pedido,
                    total: pedido.total,
                    comprobanteUrl: pedido.comprobante_url,
                    usuario: {
                        nombre: pedido.usuarios?.nombre || "Usuario desconocido",
                        email: pedido.usuarios?.email || "N/A",
                    },
                }))

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
        filtro === "todos" ? pagos : pagos.filter((pago) => pago.estado.toLowerCase() === filtro.toLowerCase())

    // Ver comprobante
    const verComprobante = (url) => {
        if (url) {
            window.open(url, "_blank")
        } else {
            alert("No hay comprobante disponible para este pago")
        }
    }

    // Descargar comprobante
    const descargarComprobante = (pago) => {
        if (pago.comprobanteUrl) {
            const a = document.createElement("a")
            a.href = pago.comprobanteUrl
            a.download = `comprobante-${pago.referencia || pago.id}.jpg`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
        } else {
            alert("No hay comprobante disponible para este pago")
        }
    }

    // Actualizar estado de pago
    const actualizarEstadoPago = async (id, nuevoEstado) => {
        try {
            const { error } = await supabase
                .from("pedidos")
                .update({
                    estado: nuevoEstado,
                    fecha_actualizacion: new Date().toISOString(),
                })
                .eq("id", id)

            if (error) throw error

            // Crear notificación para el usuario
            const pago = pagos.find((p) => p.id === id)
            if (pago) {
                await supabase.from("notificaciones").insert({
                    usuario_id: pago.usuario_id, // ID del usuario
                    tipo: "estado_actualizado",
                    mensaje: `El estado de tu pago ha sido actualizado a: ${nuevoEstado}`,
                    leida: false,
                    fecha: new Date().toISOString(),
                })
            }

            // Actualizar estado local
            setPagos(pagos.map((pago) => (pago.id === id ? { ...pago, estado: nuevoEstado } : pago)))

            alert(`Pago actualizado a: ${nuevoEstado}`)
        } catch (err) {
            console.error("Error al actualizar pago:", err)
            alert(err.message)
        }
    }

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal admin-pagos-modal">
                <div className="admin-modal-header">
                    <h2>Gestión de Pagos</h2>
                    <button className="close-button" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="admin-modal-content">
                    <div className="admin-pagos-container">
                        <div className="filtros-pagos">
                            <label>Filtrar por estado:</label>
                            <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
                                <option value="todos">Todos</option>
                                <option value="pendiente">Pendiente</option>
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
                                            <th>Estado</th>
                                            <th>Comprobante</th>
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
                                                    <div className="acciones-comprobante">
                                                        <button
                                                            className="btn-comprobante"
                                                            onClick={() => descargarComprobante(pago)}
                                                            disabled={!pago.comprobanteUrl}
                                                            title="Descargar comprobante"
                                                        >
                                                            <i className="fas fa-download"></i>
                                                        </button>
                                                        <button
                                                            className="btn-ver-comprobante"
                                                            onClick={() => verComprobante(pago.comprobanteUrl)}
                                                            disabled={!pago.comprobanteUrl}
                                                            title="Ver comprobante"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="acciones-pago">
                                                        <select
                                                            onChange={(e) => actualizarEstadoPago(pago.pedidoId, e.target.value)}
                                                            value=""
                                                            className="select-estado"
                                                        >
                                                            <option value="" disabled>
                                                                Cambiar estado
                                                            </option>
                                                            <option value="Pendiente">Pendiente</option>
                                                            <option value="Procesando">Procesando</option>
                                                            <option value="Completado">Completado</option>
                                                            <option value="Entregado">Entregado</option>
                                                            <option value="Cancelado">Cancelado</option>
                                                        </select>
                                                    </div>
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

export default AdminPagos

