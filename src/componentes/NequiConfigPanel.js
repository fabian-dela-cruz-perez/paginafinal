"use client"

import { useState, useEffect } from "react"
import "../hoja-de-estilos/NequiConfigPanel.css"

function NequiConfigPanel({ onClose }) {
    const [config, setConfig] = useState({
        apiKey: "",
        phoneNumber: "",
        callbackUrl: "",
        active: true,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [pendingPayments, setPendingPayments] = useState([])
    const [verificationResult, setVerificationResult] = useState(null)

    // Cargar configuración actual
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                setLoading(true)
                const response = await fetch("http://localhost:5000/api/nequi/config")

                if (!response.ok) {
                    throw new Error("No se pudo cargar la configuración de Nequi")
                }

                const data = await response.json()
                setConfig(data)
            } catch (err) {
                setError(err.message)
                console.error("Error al cargar configuración:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchConfig()
    }, [])

    // Cargar pagos pendientes
    useEffect(() => {
        const fetchPendingPayments = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/pedidos")

                if (!response.ok) {
                    throw new Error("No se pudieron cargar los pedidos")
                }

                const pedidos = await response.json()

                // Filtrar solo los pedidos con pagos Nequi pendientes
                const pendientes = pedidos.filter(
                    (pedido) => pedido.pago.metodoPago === "nequi" && pedido.pago.estado === "Pendiente",
                )

                setPendingPayments(pendientes)
            } catch (err) {
                console.error("Error al cargar pagos pendientes:", err)
            }
        }

        fetchPendingPayments()
    }, [verificationResult])

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setConfig({
            ...config,
            [name]: type === "checkbox" ? checked : value,
        })
    }

    // Guardar configuración
    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setLoading(true)
            const response = await fetch("http://localhost:5000/api/nequi/config", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(config),
            })

            if (!response.ok) {
                throw new Error("No se pudo actualizar la configuración")
            }

            setSuccess("Configuración actualizada correctamente")
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            setError(err.message)
            setTimeout(() => setError(null), 3000)
        } finally {
            setLoading(false)
        }
    }

    // Verificar pagos pendientes
    const handleVerifyPayments = async () => {
        try {
            setLoading(true)
            const response = await fetch("http://localhost:5000/api/nequi/verificar-pagos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                throw new Error("Error al verificar pagos")
            }

            const result = await response.json()
            setVerificationResult(result)
            setTimeout(() => setVerificationResult(null), 5000)
        } catch (err) {
            setError(err.message)
            setTimeout(() => setError(null), 3000)
        } finally {
            setLoading(false)
        }
    }

    // Simular un callback para un pago específico
    const handleSimulateCallback = async (pedidoId, referencia) => {
        try {
            const response = await fetch("http://localhost:5000/api/nequi/callback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    referencia,
                    estado: "Completado",
                }),
            })

            if (!response.ok) {
                throw new Error("Error al simular callback")
            }

            // Actualizar la lista de pagos pendientes
            setPendingPayments(pendingPayments.filter((p) => p._id !== pedidoId))

            setSuccess(`Pago con referencia ${referencia} marcado como completado`)
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            setError(err.message)
            setTimeout(() => setError(null), 3000)
        }
    }

    if (loading && !config.apiKey) {
        return (
            <div className="admin-modal-overlay">
                <div className="admin-modal">
                    <div className="admin-modal-header">
                        <h2>Configuración de Nequi</h2>
                        <button className="close-button" onClick={onClose}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="admin-modal-content">
                        <div className="loading-container">
                            <i className="fas fa-spinner fa-spin"></i> Cargando...
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal nequi-config-modal">
                <div className="admin-modal-header">
                    <h2>Configuración de Nequi</h2>
                    <button className="close-button" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="admin-modal-content">
                    {error && (
                        <div className="alert alert-error">
                            <i className="fas fa-exclamation-circle"></i> {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            <i className="fas fa-check-circle"></i> {success}
                        </div>
                    )}

                    {verificationResult && (
                        <div className="verification-result">
                            <h3>Resultado de verificación</h3>
                            <p>
                                <strong>Pagos actualizados:</strong> {verificationResult.actualizados} de {verificationResult.total}
                            </p>
                            <ul className="verification-list">
                                {verificationResult.resultados.map((resultado, index) => (
                                    <li key={index} className={resultado.estadoAnterior !== resultado.estadoNuevo ? "updated" : ""}>
                                        <span className="verification-ref">Ref: {resultado.referencia}</span>
                                        <span className="verification-status">
                                            {resultado.estadoAnterior} → {resultado.estadoNuevo}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="nequi-config-container">
                        <div className="nequi-config-section">
                            <h3>Configuración de la API</h3>
                            <form onSubmit={handleSubmit} className="nequi-config-form">
                                <div className="form-group">
                                    <label htmlFor="apiKey">API Key:</label>
                                    <input type="text" id="apiKey" name="apiKey" value={config.apiKey} onChange={handleChange} required />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phoneNumber">Número de teléfono:</label>
                                    <input
                                        type="text"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={config.phoneNumber}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="callbackUrl">URL de callback:</label>
                                    <input
                                        type="text"
                                        id="callbackUrl"
                                        name="callbackUrl"
                                        value={config.callbackUrl}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group checkbox-group">
                                    <label>
                                        <input type="checkbox" name="active" checked={config.active} onChange={handleChange} />
                                        Pagos con Nequi activos
                                    </label>
                                </div>

                                <button type="submit" className="btn-save" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save"></i> Guardar configuración
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        <div className="nequi-config-section">
                            <h3>Pagos pendientes ({pendingPayments.length})</h3>

                            <div className="pending-payments-actions">
                                <button
                                    className="btn-verify-payments"
                                    onClick={handleVerifyPayments}
                                    disabled={loading || pendingPayments.length === 0}
                                >
                                    <i className="fas fa-sync-alt"></i> Verificar pagos pendientes
                                </button>
                            </div>

                            {pendingPayments.length === 0 ? (
                                <div className="no-pending-payments">No hay pagos pendientes para verificar</div>
                            ) : (
                                <ul className="pending-payments-list">
                                    {pendingPayments.map((pedido) => (
                                        <li key={pedido._id} className="pending-payment-item">
                                            <div className="payment-info">
                                                <div className="payment-client">
                                                    <strong>Cliente:</strong> {pedido.usuario.nombre}
                                                </div>
                                                <div className="payment-details">
                                                    <span className="payment-ref">
                                                        <strong>Ref:</strong> {pedido.pago.referencia}
                                                    </span>
                                                    <span className="payment-amount">
                                                        <strong>Monto:</strong> ${pedido.total.toLocaleString("es-ES")}
                                                    </span>
                                                    <span className="payment-date">
                                                        <strong>Fecha:</strong> {new Date(pedido.pago.fecha).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="payment-actions">
                                                <button
                                                    className="btn-simulate-callback"
                                                    onClick={() => handleSimulateCallback(pedido._id, pedido.pago.referencia)}
                                                >
                                                    <i className="fas fa-check"></i> Marcar como pagado
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NequiConfigPanel

