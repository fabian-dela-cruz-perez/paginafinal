"use client"

import { useState, useEffect } from "react"
import "../hoja-de-estilos/AdminPagos.css"

function AdminPagos({ onClose }) {
    const [pagos, setPagos] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    const [filtro, setFiltro] = useState("todos")

    // Cargar pagos del servidor
    useEffect(() => {
        const cargarPagos = async () => {
            try {
                setCargando(true)
                // Obtener pagos de todos los pedidos
                const response = await fetch("http://localhost:5000/api/pedidos")

                if (!response.ok) {
                    throw new Error("No se pudieron cargar los pagos")
                }

                const pedidos = await response.json()

                // Extraer la información de pago de cada pedido
                const pagosDePedidos = pedidos.map((pedido) => ({
                    _id: pedido._id,
                    pedidoId: pedido._id,
                    metodoPago: pedido.pago.metodoPago,
                    estado: pedido.pago.estado,
                    referencia: pedido.pago.referencia,
                    fecha: pedido.pago.fecha,
                    total: pedido.total,
                    comprobanteUrl: pedido.pago.comprobanteUrl,
                    comprobanteNombre: pedido.pago.comprobanteNombre,
                    usuario: pedido.usuario.nombre,
                }))

                setPagos(pagosDePedidos)
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

    // Descargar comprobante
    const descargarComprobante = (pago) => {
        if (pago.comprobanteUrl) {
            const a = document.createElement("a")
            a.href = pago.comprobanteUrl
            a.download = pago.comprobanteNombre || `comprobante-${pago.referencia}.jpg`
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
            const response = await fetch(`http://localhost:5000/api/pedidos/${id}/pago`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ estado: nuevoEstado }),
            })

            if (!response.ok) {
                throw new Error("No se pudo actualizar el estado del pago")
            }

            // Actualizar estado local
            setPagos(pagos.map((pago) => (pago.pedidoId === id ? { ...pago, estado: nuevoEstado } : pago)))

            alert(`Pago actualizado a: ${nuevoEstado}`)
        } catch (err) {
            console.error("Error al actualizar pago:", err)
            alert(err.message)
        }
    }

    // Ver detalles del comprobante
    const verComprobante = (pago) => {
        if (pago.comprobanteUrl) {
            window.open(pago.comprobanteUrl, "_blank")
        } else {
            alert("No hay comprobante disponible para este pago")
        }
    }

    if (cargando)
        return (
            <div className="admin-modal-overlay">
                <div className="admin-modal">
                    <div className="admin-modal-header">
                        <h2>Gestión de Pagos</h2>
                        <button className="close-button" onClick={onClose}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="cargando-container">
                        <i className="fas fa-spinner fa-spin"></i> Cargando...
                    </div>
                </div>
            </div>
        )

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
                                <option value="fallido">Fallido</option>
                            </select>
                        </div>

                        {error && <div className="error-container">{error}</div>}

                        {pagosFiltrados.length === 0 ? (
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
                                            <tr key={pago._id} className={`estado-${pago.estado.toLowerCase()}`}>
                                                <td>{pago.usuario}</td>
                                                <td>{pago.referencia}</td>
                                                <td>{new Date(pago.fecha).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`metodo-${pago.metodoPago}`}>
                                                        {pago.metodoPago === "nequi" ? "Nequi" : pago.metodoPago}
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
                                                            onClick={() => verComprobante(pago)}
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
                                                            <option value="Fallido">Fallido</option>
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

