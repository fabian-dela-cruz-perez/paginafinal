"use client"

import { useState } from "react"
import "../hoja-de-estilos/InformacionEnvio.css"

function InformacionEnvio({ total, onClose, onContinuarPago }) {
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        direccion: "",
        ciudad: "",
        departamento: "",
        codigoPostal: "",
        telefono: "",
        instrucciones: "",
    })
    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })

        // Limpiar error cuando el usuario comienza a escribir
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: "",
            })
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido"
        if (!formData.apellido.trim()) newErrors.apellido = "El apellido es requerido"
        if (!formData.direccion.trim()) newErrors.direccion = "La dirección es requerida"
        if (!formData.ciudad.trim()) newErrors.ciudad = "La ciudad es requerida"
        if (!formData.departamento.trim()) newErrors.departamento = "El departamento es requerido"
        if (!formData.telefono.trim()) newErrors.telefono = "El teléfono es requerido"
        else if (!/^\d{10}$/.test(formData.telefono.trim()))
            newErrors.telefono = "Ingrese un número de teléfono válido (10 dígitos)"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (validateForm()) {
            // Formatear la dirección completa
            const direccionCompleta = `${formData.direccion}, ${formData.ciudad}, ${formData.departamento}${formData.codigoPostal ? ", CP: " + formData.codigoPostal : ""}`

            // Pasar los datos al componente padre, incluyendo toda la información de envío
            onContinuarPago({
                ...formData,
                direccionCompleta,
            })
        }
    }

    return (
        <div className="info-envio-overlay">
            <div className="info-envio-modal">
                <div className="info-envio-header">
                    <h2>Información de Envío</h2>
                    <button className="close-button" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="info-envio-content">
                    <div className="resumen-compra">
                        <div className="resumen-item">
                            <span>Total a pagar:</span>
                            <span className="resumen-precio">${total.toLocaleString("es-ES")}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="info-envio-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="nombre">Nombre</label>
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    className={errors.nombre ? "error" : ""}
                                />
                                {errors.nombre && <span className="error-text">{errors.nombre}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="apellido">Apellido</label>
                                <input
                                    type="text"
                                    id="apellido"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    className={errors.apellido ? "error" : ""}
                                />
                                {errors.apellido && <span className="error-text">{errors.apellido}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="direccion">Dirección</label>
                            <input
                                type="text"
                                id="direccion"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                placeholder="Calle, número, apartamento, etc."
                                className={errors.direccion ? "error" : ""}
                            />
                            {errors.direccion && <span className="error-text">{errors.direccion}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="ciudad">Ciudad</label>
                                <input
                                    type="text"
                                    id="ciudad"
                                    name="ciudad"
                                    value={formData.ciudad}
                                    onChange={handleChange}
                                    className={errors.ciudad ? "error" : ""}
                                />
                                {errors.ciudad && <span className="error-text">{errors.ciudad}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="departamento">Departamento</label>
                                <input
                                    type="text"
                                    id="departamento"
                                    name="departamento"
                                    value={formData.departamento}
                                    onChange={handleChange}
                                    className={errors.departamento ? "error" : ""}
                                />
                                {errors.departamento && <span className="error-text">{errors.departamento}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="codigoPostal">Código Postal (opcional)</label>
                                <input
                                    type="text"
                                    id="codigoPostal"
                                    name="codigoPostal"
                                    value={formData.codigoPostal}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="telefono">Teléfono</label>
                                <input
                                    type="tel"
                                    id="telefono"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    placeholder="Ej: 3001234567"
                                    className={errors.telefono ? "error" : ""}
                                />
                                {errors.telefono && <span className="error-text">{errors.telefono}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="instrucciones">Instrucciones de entrega (opcional)</label>
                            <textarea
                                id="instrucciones"
                                name="instrucciones"
                                value={formData.instrucciones}
                                onChange={handleChange}
                                placeholder="Información adicional para la entrega"
                                rows="3"
                            ></textarea>
                        </div>

                        <button type="submit" className="continuar-pago-btn">
                            <i className="fas fa-arrow-right"></i> Continuar al Pago
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default InformacionEnvio
