"use client"

import { useState, useEffect } from "react"
import "../hoja-de-estilos/PedidosPanel.css"

function PedidosPanel({ onClose }) {
    const [pedidos, setPedidos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [filtroEstado, setFiltroEstado] = useState("todos")
    const [busqueda, setBusqueda] = useState("")

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                setLoading(true)
                setError("")

                // Construir URL con parámetros de filtro
                let url = "http://localhost:5000/api/pedidos"
                const params = new URLSearchParams()

                if (filtroEstado !== "todos") {
                    params.append("estado", filtroEstado)
                }

                if (busqueda) {
                    params.append("buscar", busqueda)
                }

                if (params.toString()) {
                    url += `?${params.toString()}`
                }

                // Obtener el token del localStorage
                const token = localStorage.getItem("token")

                const response = await fetch(url, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        // Incluir el token en los headers
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                })

                if (!response.ok) {
                    throw new Error("No se pudieron cargar los pedidos")
                }

                const data = await response.json()
                console.log("Datos de pedidos recibidos:", data)
                setPedidos(Array.isArray(data) ? data : [])
                setLoading(false)
            } catch (error) {
                console.error("Error al cargar pedidos:", error)
                setError("Error al cargar los pedidos. Por favor, intenta de nuevo.")
                setLoading(false)
            }
        }

        fetchPedidos()
    }, [filtroEstado, busqueda])

    // Manejar cambio en el filtro de estado
    const handleFiltroEstadoChange = (e) => {
        setFiltroEstado(e.target.value)
    }

    // Manejar cambio en la búsqueda
    const handleBusquedaChange = (e) => {
        setBusqueda(e.target.value)
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

                <div className="pedidos-filtros">
                    <div className="filtro-grupo">
                        <label htmlFor="filtroEstado">Filtrar por estado:</label>
                        <select
                            id="filtroEstado"
                            value={filtroEstado}
                            onChange={handleFiltroEstadoChange}
                            className="filtro-select"
                        >
                            <option value="todos">Todos</option>
                            <option value="PENDING">Pendiente</option>
                            <option value="COMPLETED">Completado</option>
                            <option value="FAILED">Fallido</option>
                            <option value="CANCELLED">Cancelado</option>
                        </select>
                    </div>
                    <div className="busqueda-grupo">
                        <input
                            type="text"
                            value={busqueda}
                            onChange={handleBusquedaChange}
                            placeholder="Buscar por nombre, email o ID"
                            className="busqueda-input"
                        />
                    </div>
                </div>

                <div className="pedidos-content">
                    {loading ? (
                        <div className="loading-spinner">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Cargando pedidos...</p>
                        </div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : (
                        <div className="pedidos-table-container">
                            {pedidos.length === 0 ? (
                                <div className="no-pedidos">
                                    <i
                                        className="fas fa-shopping-bag"
                                        style={{ fontSize: "48px", color: "#ddd", marginBottom: "15px" }}
                                    ></i>
                                    <p>No hay pedidos que coincidan con los criterios de búsqueda</p>
                                </div>
                            ) : (
                                <table className="pedidos-table">
                                    <thead>
                                        <tr>
                                            <th>ID Pedido</th>
                                            <th>Cliente</th>
                                            <th>Total</th>
                                            <th>Estado</th>
                                            <th>Fecha</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pedidos.map((pedido) => (
                                            <tr key={pedido._id}>
                                                <td>{pedido._id}</td>
                                                <td>
                                                    {pedido.usuario?.nombre} {pedido.usuario?.apellido}
                                                </td>
                                                <td>${pedido.total?.toLocaleString("es-CO")}</td>
                                                <td>
                                                    <span className={`estado-badge estado-${pedido.pago?.estado?.toLowerCase() || "pendiente"}`}>
                                                        {pedido.pago?.estado || "Pendiente"}
                                                    </span>
                                                </td>
                                                <td>{new Date(pedido.fechaCreacion).toLocaleDateString("es-CO")}</td>
                                                <td>
                                                    <button className="btn-view" onClick={() => console.log("Ver detalles:", pedido._id)}>
                                                        <i className="fas fa-eye"></i> Ver
                                                    </button>
                                                    <button className="btn-edit" onClick={() => console.log("Editar pedido:", pedido._id)}>
                                                        <i className="fas fa-edit"></i> Editar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>

                <div className="pedidos-footer">
                    <button className="close-pedidos-button" onClick={onClose}>
                        <i className="fas fa-times-circle"></i> Cerrar Panel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PedidosPanel

