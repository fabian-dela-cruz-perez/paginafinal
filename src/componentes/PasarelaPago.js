"use client"

import { useState } from "react"
import "../hoja-de-estilos/PasarelaPago.css"

function PasarelaPago({ total, onClose, onPagoCompletado, direccionEnvio }) {
    const [metodoPago, setMetodoPago] = useState("consignacion")
    const [comprobante, setComprobante] = useState(null)
    const [numeroReferencia, setNumeroReferencia] = useState("")
    const [mostrarInstrucciones, setMostrarInstrucciones] = useState(true)
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState("")
    const [previewComprobante, setPreviewComprobante] = useState(null)

    // Información de cuentas bancarias
    const cuentasBancarias = [
        {
            banco: "Bancolombia",
            tipo: "Cuenta de Ahorros",
            numero: "123-456789-00",
            titular: "RTH Esencia S.A.S.",
            nit: "900.123.456-7",
        },
        {
            banco: "Davivienda",
            tipo: "Cuenta Corriente",
            numero: "987-654321-00",
            titular: "RTH Esencia S.A.S.",
            nit: "900.123.456-7",
        },
        {
            banco: "Nequi",
            tipo: "Cuenta Digital",
            numero: "300-123-4567",
            titular: "RTH Esencia",
            nit: "900.123.456-7",
        },
    ]

    // Manejar cambio de método de pago
    const handleMetodoPagoChange = (e) => {
        setMetodoPago(e.target.value)
        setMostrarInstrucciones(true)
    }

    // Manejar carga de comprobante
    const handleComprobanteChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setComprobante(file)

            // Crear preview del comprobante
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewComprobante(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    // Validar formulario
    const validarFormulario = () => {
        if (!comprobante) {
            setError("Por favor, sube un comprobante de pago")
            return false
        }

        if (!numeroReferencia.trim()) {
            setError("Por favor, ingresa el número de referencia o comprobante")
            return false
        }

        return true
    }

    // Procesar pago
    const procesarPago = async (e) => {
        e.preventDefault()

        if (!validarFormulario()) {
            return
        }

        setCargando(true)
        setError("")

        try {
            // En un sistema real, aquí subirías el comprobante a un servidor
            // Simulamos una carga con un timeout
            await new Promise((resolve) => setTimeout(resolve, 1500))

            // Información del pago para el backend
            const infoPago = {
                metodoPago: metodoPago,
                estado: "Pendiente", // El pago está pendiente de verificación
                referencia: numeroReferencia,
                fecha: new Date().toISOString(),
                total: total,
                comprobanteNombre: comprobante.name,
            }

            // Llamar a la función de pago completado
            onPagoCompletado(infoPago)

            // Mostrar mensaje de éxito
            alert("Tu comprobante ha sido enviado. Tu pedido está en proceso de verificación.")
            onClose()
        } catch (error) {
            console.error("Error al procesar el pago:", error)
            setError("Ocurrió un error al procesar tu pago. Por favor, intenta de nuevo.")
        } finally {
            setCargando(false)
        }
    }

    // Renderizar instrucciones según el método de pago
    const renderizarInstrucciones = () => {
        return (
            <div className="instrucciones-pago">
                <h3>Instrucciones de Pago</h3>

                <div className="pasos-pago">
                    <div className="paso">
                        <div className="paso-numero">1</div>
                        <div className="paso-contenido">
                            <h4>Realiza la consignación o transferencia</h4>
                            <p>Utiliza cualquiera de nuestras cuentas bancarias:</p>

                            <div className="cuentas-bancarias">
                                {cuentasBancarias.map((cuenta, index) => (
                                    <div key={index} className="cuenta-bancaria">
                                        <h5>{cuenta.banco}</h5>
                                        <p>
                                            <strong>Tipo:</strong> {cuenta.tipo}
                                        </p>
                                        <p>
                                            <strong>Número:</strong> {cuenta.numero}
                                        </p>
                                        <p>
                                            <strong>Titular:</strong> {cuenta.titular}
                                        </p>
                                        <p>
                                            <strong>NIT:</strong> {cuenta.nit}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="paso">
                        <div className="paso-numero">2</div>
                        <div className="paso-contenido">
                            <h4>Guarda tu comprobante</h4>
                            <p>Toma una foto clara o guarda el PDF de tu comprobante de pago.</p>
                        </div>
                    </div>

                    <div className="paso">
                        <div className="paso-numero">3</div>
                        <div className="paso-contenido">
                            <h4>Sube tu comprobante</h4>
                            <p>Sube el comprobante y proporciona el número de referencia de la transacción.</p>
                        </div>
                    </div>
                </div>

                <div className="total-a-pagar">
                    <h3>Total a pagar: ${total.toLocaleString("es-ES")}</h3>
                </div>

                <button className="continuar-button" onClick={() => setMostrarInstrucciones(false)}>
                    Continuar
                </button>
            </div>
        )
    }

    // Renderizar formulario de comprobante
    const renderizarFormularioComprobante = () => {
        return (
            <form onSubmit={procesarPago} className="formulario-comprobante">
                <h3>Subir Comprobante de Pago</h3>

                <div className="campo-formulario">
                    <label>Número de referencia o comprobante:</label>
                    <input
                        type="text"
                        value={numeroReferencia}
                        onChange={(e) => setNumeroReferencia(e.target.value)}
                        placeholder="Ej: 123456789"
                        required
                    />
                </div>

                <div className="campo-formulario">
                    <label>Comprobante de pago:</label>
                    <div className="upload-area">
                        <input
                            type="file"
                            id="comprobante"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleComprobanteChange}
                            className="file-input"
                        />
                        <label htmlFor="comprobante" className="file-label">
                            <i className="fas fa-upload"></i>
                            {comprobante ? comprobante.name : "Seleccionar archivo"}
                        </label>
                    </div>
                    <p className="formato-permitido">Formatos permitidos: JPG, PNG, PDF (máx. 5MB)</p>
                </div>

                {previewComprobante && (
                    <div className="preview-comprobante">
                        <h4>Vista previa:</h4>
                        <img src={previewComprobante || "/placeholder.svg"} alt="Vista previa del comprobante" />
                    </div>
                )}

                {error && <div className="error-mensaje">{error}</div>}

                <div className="botones-accion">
                    <button type="button" className="volver-button" onClick={() => setMostrarInstrucciones(true)}>
                        <i className="fas fa-arrow-left"></i> Volver
                    </button>

                    <button type="submit" className="confirmar-button" disabled={cargando}>
                        {cargando ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i> Procesando...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-check"></i> Confirmar Pago
                            </>
                        )}
                    </button>
                </div>
            </form>
        )
    }

    return (
        <div className="pasarela-pago-overlay">
            <div className="pasarela-pago-modal">
                <div className="pasarela-header">
                    <h2>Pago de tu Pedido</h2>
                    <button className="close-button" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="pasarela-content">
                    <div className="metodos-pago">
                        <h3>Método de Pago</h3>
                        <div className="opciones-pago">
                            <label className="opcion-pago">
                                <input
                                    type="radio"
                                    name="metodoPago"
                                    value="consignacion"
                                    checked={metodoPago === "consignacion"}
                                    onChange={handleMetodoPagoChange}
                                />
                                <div className="opcion-contenido">
                                    <i className="fas fa-university"></i>
                                    <span>Consignación Bancaria</span>
                                </div>
                            </label>

                            <label className="opcion-pago">
                                <input
                                    type="radio"
                                    name="metodoPago"
                                    value="nequi"
                                    checked={metodoPago === "nequi"}
                                    onChange={handleMetodoPagoChange}
                                />
                                <div className="opcion-contenido">
                                    <i className="fas fa-mobile-alt"></i>
                                    <span>Nequi</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="detalles-pago">
                        {mostrarInstrucciones ? renderizarInstrucciones() : renderizarFormularioComprobante()}
                    </div>
                </div>

                <div className="pasarela-footer">
                    <div className="resumen-pedido">
                        <div className="resumen-item">
                            <span>Subtotal:</span>
                            <span>${total.toLocaleString("es-ES")}</span>
                        </div>
                        <div className="resumen-item">
                            <span>Envío:</span>
                            <span>Gratis</span>
                        </div>
                        <div className="resumen-item total">
                            <span>Total:</span>
                            <span>${total.toLocaleString("es-ES")}</span>
                        </div>
                    </div>

                    <div className="direccion-envio">
                        <h4>Dirección de Envío:</h4>
                        <p>{direccionEnvio}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PasarelaPago

