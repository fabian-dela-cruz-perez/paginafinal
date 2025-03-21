"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "../utils/supabase.ts"
import "../hoja-de-estilos/PasarelaPago.css"

function PasarelaPago({ total, onClose, onPagoCompletado, direccionEnvio }) {
    // Estado para controlar las pestañas/pasos
    const [paso, setPaso] = useState(direccionEnvio ? "pago" : "envio")

    // Estados para la información de envío
    const [datosEnvio, setDatosEnvio] = useState({
        direccion: direccionEnvio || "",
        ciudad: "",
        codigoPostal: "",
        telefono: "",
        notas: "",
    })

    // Estados para el pago
    const [metodoPago, setMetodoPago] = useState("nequi")
    const [referencia, setReferencia] = useState(`M${Math.floor(Math.random() * 100000000)}`)
    const [error, setError] = useState(null)
    const [cargando, setCargando] = useState(false)
    const [exito, setExito] = useState(false)
    const [archivoComprobante, setArchivoComprobante] = useState(null)
    const [previewComprobante, setPreviewComprobante] = useState(null)
    const [comprobanteGuardado, setComprobanteGuardado] = useState(false)
    const fileInputRef = useRef(null)
    const downloadLinkRef = useRef(null)

    // Configuración de Nequi (podría venir de la base de datos)
    const [nequiConfig, setNequiConfig] = useState({
        numero: "3013827407",
    })

    // Obtener configuración de Nequi desde la base de datos
    useEffect(() => {
        const obtenerConfigNequi = async () => {
            try {
                const { data, error } = await supabase.from("configuracion").select("*").eq("tipo", "nequi").single()

                if (error) {
                    console.error("Error al obtener configuración de Nequi:", error)
                    return
                }

                if (data && data.valor) {
                    setNequiConfig({
                        numero: data.valor,
                    })
                }
            } catch (error) {
                console.error("Error al obtener configuración de Nequi:", error)
            }
        }

        obtenerConfigNequi()
    }, [])

    // Limpiar la vista previa cuando se desmonte el componente
    useEffect(() => {
        return () => {
            if (previewComprobante) {
                URL.revokeObjectURL(previewComprobante)
            }
        }
    }, [previewComprobante])

    // Manejar cambios en los campos de envío
    const handleDatosEnvioChange = (e) => {
        const { name, value } = e.target
        setDatosEnvio((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    // Manejar cambio de archivo de comprobante
    const handleComprobanteChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setArchivoComprobante(file)
            setComprobanteGuardado(false)

            // Crear una vista previa para imágenes
            if (file.type.startsWith("image/")) {
                const fileUrl = URL.createObjectURL(file)
                setPreviewComprobante(fileUrl)
            } else {
                setPreviewComprobante(null)
            }
        }
    }

    // Eliminar el comprobante seleccionado
    const eliminarComprobante = () => {
        setArchivoComprobante(null)
        setPreviewComprobante(null)
        setComprobanteGuardado(false)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    // Guardar comprobante localmente
    const guardarComprobante = () => {
        if (!archivoComprobante) {
            setError("Por favor selecciona un archivo primero")
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

            setComprobanteGuardado(true)
            setError(null)
        } catch (err) {
            console.error("Error al guardar el comprobante:", err)
            setError("Error al guardar el comprobante: " + err.message)
        }
    }

    // Validar datos de envío
    const validarDatosEnvio = () => {
        if (!datosEnvio.direccion || !datosEnvio.ciudad || !datosEnvio.telefono) {
            setError("Por favor completa todos los campos obligatorios")
            return false
        }
        setError(null)
        return true
    }

    // Continuar al paso de pago
    const continuarAPago = () => {
        if (validarDatosEnvio()) {
            setPaso("pago")
        }
    }

    // Verificar si la tabla pagos existe y crearla si no
    const verificarTablaPagos = async () => {
        try {
            // Verificar si la tabla pagos existe
            const { data, error } = await supabase.from("pagos").select("*").limit(1)

            if (error && error.code === "42P01") {
                // Código para "relation does not exist"
                console.log("La tabla pagos no existe, creándola...")

                // Crear la tabla pagos
                const { error: createError } = await supabase.rpc("crear_tabla_pagos")

                if (createError) {
                    console.error("Error al crear tabla pagos:", createError)
                    return false
                }

                console.log("Tabla pagos creada exitosamente")
                return true
            }

            return true // La tabla ya existe
        } catch (error) {
            console.error("Error al verificar tabla pagos:", error)
            return false
        }
    }

    // Verificar si la tabla detalles_pedido existe y crearla si no
    const verificarTablaDetallesPedido = async () => {
        try {
            // Verificar si la tabla detalles_pedido existe
            const { data, error } = await supabase.from("detalles_pedido").select("*").limit(1)

            if (error && error.code === "42P01") {
                // Código para "relation does not exist"
                console.log("La tabla detalles_pedido no existe, creándola...")

                // Crear la tabla detalles_pedido
                const { error: createError } = await supabase.rpc("crear_tabla_detalles_pedido")

                if (createError) {
                    console.error("Error al crear tabla detalles_pedido:", createError)
                    return false
                }

                console.log("Tabla detalles_pedido creada exitosamente")
                return true
            }

            return true // La tabla ya existe
        } catch (error) {
            console.error("Error al verificar tabla detalles_pedido:", error)
            return false
        }
    }

    // Procesar el pago
    const confirmarPago = async () => {
        try {
            setCargando(true)
            setError(null)

            // Validar datos según el método de pago
            if (metodoPago !== "contraentrega" && !referencia) {
                setError("Por favor ingresa la referencia de la transacción")
                setCargando(false)
                return
            }

            // Validar comprobante para métodos que lo requieren
            if ((metodoPago === "nequi" || metodoPago === "transferencia") && !archivoComprobante) {
                setError("Por favor adjunta un comprobante de pago")
                setCargando(false)
                return
            }

            // Validar que el comprobante se haya guardado localmente
            if ((metodoPago === "nequi" || metodoPago === "transferencia") && !comprobanteGuardado) {
                setError("Por favor guarda el comprobante en tu dispositivo antes de continuar")
                setCargando(false)
                return
            }

            // Obtener el usuario actual de la sesión
            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession()

            if (sessionError) {
                console.error("Error al obtener la sesión:", sessionError)
                throw new Error("No se pudo verificar la sesión del usuario")
            }

            if (!session || !session.user) {
                throw new Error("Debes iniciar sesión para realizar un pedido")
            }

            // Obtener el ID del usuario en la tabla usuarios (no el auth.id)
            const { data: userData, error: userError } = await supabase
                .from("usuarios")
                .select("id")
                .eq("auth_id", session.user.id)
                .single()

            let usuarioId // Declare usuarioId here

            if (userError) {
                console.error("Error al obtener datos del usuario:", userError)

                // Si el usuario no existe en la tabla usuarios, crearlo
                if (userError.code === "PGRST116") {
                    console.log("Usuario no encontrado, creando perfil...")

                    const { data: userInfo } = await supabase.auth.getUser()

                    if (!userInfo || !userInfo.user) {
                        throw new Error("No se pudo obtener información del usuario")
                    }

                    const { data: newUser, error: createError } = await supabase
                        .from("usuarios")
                        .insert([
                            {
                                auth_id: session.user.id,
                                email: userInfo.user.email,
                                nombre: userInfo.user.user_metadata?.nombre || "Usuario",
                                apellido: userInfo.user.user_metadata?.apellido || "",
                                isadmin: false,
                                fecharegistro: new Date().toISOString(),
                            },
                        ])
                        .select()

                    if (createError) {
                        console.error("Error al crear perfil de usuario:", createError)
                        throw new Error("No se pudo crear tu perfil de usuario")
                    }

                    if (!newUser || newUser.length === 0) {
                        throw new Error("No se pudo crear tu perfil de usuario")
                    }

                    console.log("Perfil de usuario creado:", newUser[0])
                    usuarioId = newUser[0].id
                } else {
                    throw new Error("No se pudo encontrar tu información de usuario")
                }
            } else {
                if (!userData || !userData.id) {
                    throw new Error("No se encontró tu perfil de usuario")
                }
                usuarioId = userData.id
            }

            console.log("ID de usuario para el pedido:", usuarioId)

            // Verificar si la tabla pagos existe
            const tablaPagosExiste = await verificarTablaPagos()

            if (!tablaPagosExiste) {
                throw new Error("No se pudo verificar la tabla de pagos")
            }

            // Formatear la dirección de envío como un objeto estructurado
            let direccionFormateada = direccionEnvio

            // Si la dirección es un string, intentar convertirla a objeto
            if (typeof direccionEnvio === "string" && direccionEnvio.trim() !== "") {
                try {
                    // Intentar parsear si es un JSON
                    if (direccionEnvio.startsWith("{")) {
                        direccionFormateada = JSON.parse(direccionEnvio)
                    } else {
                        // Si no es JSON, crear un objeto simple
                        direccionFormateada = {
                            direccion: direccionEnvio,
                            ciudad: datosEnvio.ciudad,
                            codigoPostal: datosEnvio.codigoPostal,
                            telefono: datosEnvio.telefono,
                        }
                    }
                } catch (e) {
                    console.error("Error al parsear dirección:", e)
                    // Si hay error, usar como string
                    direccionFormateada = {
                        direccion: direccionEnvio,
                        ciudad: datosEnvio.ciudad,
                        codigoPostal: datosEnvio.codigoPostal,
                        telefono: datosEnvio.telefono,
                    }
                }
            }

            // Preparar datos del pedido
            const pedidoData = {
                usuario_id: usuarioId,
                estado: metodoPago === "contraentrega" ? "pendiente_entrega" : "pendiente",
                total: typeof total === "string" ? Number.parseFloat(total.replace(/[^\d.-]/g, "")) : total,
                direccion_envio:
                    typeof direccionFormateada === "object" ? JSON.stringify(direccionFormateada) : direccionFormateada,
                ciudad_envio: datosEnvio.ciudad,
                codigo_postal_envio: datosEnvio.codigoPostal || "",
                telefono_contacto: datosEnvio.telefono,
                notas: datosEnvio.notas || "",
                fecha_pedido: new Date().toISOString(),
                fecha_actualizacion: new Date().toISOString(),
                metodo_pago: metodoPago, // Asegurarse de que el método de pago se guarde aquí
                referencia_pago: referencia || "", // Guardar la referencia de pago
            }

            console.log("Datos del pedido a insertar:", pedidoData)

            // Crear el pedido en la base de datos
            const { data: nuevoPedido, error: pedidoError } = await supabase.from("pedidos").insert([pedidoData]).select()

            if (pedidoError) {
                console.error("Error al crear pedido:", pedidoError)
                throw new Error("No se pudo crear el pedido: " + pedidoError.message)
            }

            if (!nuevoPedido || nuevoPedido.length === 0) {
                throw new Error("No se recibieron datos del pedido creado")
            }

            console.log("Pedido creado:", nuevoPedido[0])

            // Guardar los productos del carrito en la tabla de detalles_pedido
            const carrito = JSON.parse(localStorage.getItem("carrito") || "[]")

            if (carrito.length > 0) {
                console.log("Guardando productos del carrito:", carrito)

                // Guardar en la tabla pedido_productos (tabla principal)
                for (const item of carrito) {
                    try {
                        // Buscar el ID del producto por nombre exacto primero
                        let { data: productoData, error: productoError } = await supabase
                            .from("productos")
                            .select("id")
                            .eq("nombre", item.nombre)
                            .limit(1)

                        // Si no encuentra, intentar con búsqueda parcial
                        if (!productoData || productoData.length === 0) {
                            const { data: productoDataAlt, error: productoErrorAlt } = await supabase
                                .from("productos")
                                .select("id")
                                .ilike("nombre", `%${item.nombre}%`)
                                .limit(1)

                            productoData = productoDataAlt
                            productoError = productoErrorAlt
                        }

                        if (productoError) {
                            console.error("Error al buscar producto:", productoError)
                            continue
                        }

                        const productoId = productoData && productoData.length > 0 ? productoData[0].id : null

                        if (productoId) {
                            console.log(`Guardando producto ${item.nombre} (ID: ${productoId}) en pedido_productos`)

                            // Insertar en pedido_productos
                            const { error: insertError } = await supabase.from("pedido_productos").insert([
                                {
                                    pedido_id: nuevoPedido[0].id,
                                    producto_id: productoId,
                                    cantidad: item.cantidad,
                                    precio_unitario:
                                        typeof item.precio === "string"
                                            ? Number.parseFloat(item.precio.replace(/[^\d.-]/g, ""))
                                            : item.precio,
                                    color: item.color || "N/A",
                                    talla: item.talla || "N/A",
                                },
                            ])

                            if (insertError) {
                                console.error("Error al insertar en pedido_productos:", insertError)
                            } else {
                                console.log("Producto guardado correctamente en pedido_productos")
                            }
                        } else {
                            console.error("No se encontró el ID del producto:", item.nombre)
                        }
                    } catch (error) {
                        console.error("Error al procesar producto para pedido_productos:", error)
                    }
                }

                // También intentar guardar en detalles_pedido como respaldo
                try {
                    // Verificar y crear la tabla si no existe
                    const tablaExiste = await verificarTablaDetallesPedido()

                    if (tablaExiste) {
                        for (const item of carrito) {
                            const detalleData = {
                                pedido_id: nuevoPedido[0].id,
                                producto_nombre: item.nombre,
                                precio:
                                    typeof item.precio === "string"
                                        ? Number.parseFloat(item.precio.replace(/[^\d.-]/g, ""))
                                        : item.precio,
                                cantidad: item.cantidad,
                                color: item.color || "N/A",
                                talla: item.talla || "N/A",
                                subtotal:
                                    (typeof item.precio === "string"
                                        ? Number.parseFloat(item.precio.replace(/[^\d.-]/g, ""))
                                        : item.precio) * item.cantidad,
                            }

                            const { error: detalleError } = await supabase.from("detalles_pedido").insert([detalleData])

                            if (detalleError) {
                                console.error("Error al guardar detalle del pedido:", detalleError)
                            } else {
                                console.log("Producto guardado correctamente en detalles_pedido")
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error al guardar detalles del pedido:", error)
                }
            }

            // Registrar la información del pago directamente en la base de datos
            try {
                // Intentar insertar en la tabla pagos
                const { error: pagoError } = await supabase.from("pagos").insert([
                    {
                        pedido_id: nuevoPedido[0].id,
                        metodo: metodoPago,
                        referencia: referencia,
                        estado: "pendiente",
                        fecha: new Date().toISOString(),
                        monto: pedidoData.total,
                        // No guardamos la URL del comprobante ya que se guarda localmente
                    },
                ])

                if (pagoError) {
                    console.error("Error al registrar pago:", pagoError)

                    // Si la tabla no existe, intentar crearla y reintentar
                    if (pagoError.code === "42P01") {
                        console.log("La tabla pagos no existe, intentando crear...")

                        // Crear la tabla pagos usando SQL directo
                        const { error: sqlError } = await supabase.rpc("ejecutar_sql", {
                            sql_query: `
                CREATE TABLE IF NOT EXISTS pagos (
                  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                  pedido_id UUID REFERENCES pedidos(id),
                  metodo TEXT NOT NULL,
                  referencia TEXT,
                  estado TEXT NOT NULL,
                  fecha TIMESTAMPTZ NOT NULL,
                  monto NUMERIC NOT NULL,
                  created_at TIMESTAMPTZ DEFAULT NOW()
                );
              `,
                        })

                        if (sqlError) {
                            console.error("Error al crear tabla pagos:", sqlError)
                            throw new Error("No se pudo crear la tabla de pagos")
                        }

                        // Reintentar la inserción
                        const { error: reinsertError } = await supabase.from("pagos").insert([
                            {
                                pedido_id: nuevoPedido[0].id,
                                metodo: metodoPago,
                                referencia: referencia,
                                estado: "pendiente",
                                fecha: new Date().toISOString(),
                                monto: pedidoData.total,
                            },
                        ])

                        if (reinsertError) {
                            console.error("Error al reintentar registro de pago:", reinsertError)
                            throw new Error("No se pudo registrar el pago después de crear la tabla")
                        }
                    } else {
                        throw new Error("No se pudo registrar el pago: " + pagoError.message)
                    }
                }
            } catch (pagoError) {
                console.error("Error en el proceso de pago:", pagoError)

                // Alternativa: Guardar la información del pago en el pedido
                const { error: updateError } = await supabase
                    .from("pedidos")
                    .update({
                        metodo_pago: metodoPago,
                        referencia_pago: referencia,
                    })
                    .eq("id", nuevoPedido[0].id)

                if (updateError) {
                    console.error("Error al actualizar pedido con info de pago:", updateError)
                    throw new Error("No se pudo registrar la información del pago")
                }
            }

            // Información del pago para el componente padre
            const infoPago = {
                pedidoId: nuevoPedido[0].id,
                metodoPago: metodoPago,
                referencia: referencia,
                estado: "pendiente",
                fecha: new Date().toISOString(),
                monto: pedidoData.total,
                // No incluimos la URL del comprobante ya que se guarda localmente
            }

            // Guardar el pedido en localStorage para referencia
            localStorage.setItem(
                "ultimoPedido",
                JSON.stringify({
                    id: nuevoPedido[0].id,
                    total: pedidoData.total,
                    fecha: new Date().toISOString(),
                }),
            )

            // Limpiar el carrito después de procesar el pedido
            localStorage.removeItem("carrito")

            // Mostrar mensaje de éxito
            setExito(true)

            // Notificar al componente padre
            if (onPagoCompletado) {
                onPagoCompletado(infoPago)
            }

            // Cerrar automáticamente después de 3 segundos
            setTimeout(() => {
                onClose()
            }, 3000)
        } catch (err) {
            console.error("Error al procesar pago:", err)

            // Verificar si es un error de clave foránea
            if (err.message && err.message.includes("foreign key constraint")) {
                setError("Error de referencia en la base de datos. Por favor, contacta al administrador.")
            }
            // Verificar si es un error de conexión
            else if (err.message && (err.message.includes("network") || err.message.includes("connection"))) {
                setError("Error de conexión. Verifica tu conexión a internet e intenta nuevamente.")
            }
            // Mensaje genérico para otros errores
            else {
                setError(err.message || "Hubo un error al procesar el pago. Inténtalo de nuevo.")
            }

            // Intentar guardar el pedido en localStorage para recuperación
            try {
                const pedidoFallido = {
                    carrito: JSON.parse(localStorage.getItem("carrito") || "[]"),
                    datosEnvio: {
                        direccion: datosEnvio.direccion,
                        ciudad: datosEnvio.ciudad,
                        codigoPostal: datosEnvio.codigoPostal,
                        telefono: datosEnvio.telefono,
                        notas: datosEnvio.notas,
                    },
                    metodoPago,
                    referencia,
                    total: typeof total === "string" ? Number.parseFloat(total.replace(/[^\d.-]/g, "")) : total,
                    fecha: new Date().toISOString(),
                }
                localStorage.setItem("pedidoFallido", JSON.stringify(pedidoFallido))
            } catch (e) {
                console.error("Error al guardar pedido fallido:", e)
            }
        } finally {
            setCargando(false)
        }
    }

    return (
        <div className="modal-overlay">
            <div className="pasarela-modal">
                <div className="pasarela-header">
                    <h2>{paso === "envio" ? "Información de Envío" : "Pasarela de Pago"}</h2>
                    <button className="cerrar-modal" onClick={onClose}>
                        ×
                    </button>
                </div>

                {error && (
                    <div className="error-mensaje">
                        <i className="fas fa-exclamation-circle"></i> {error}
                    </div>
                )}

                {exito && (
                    <div className="exito-mensaje">
                        <i className="fas fa-check-circle"></i> ¡Pago procesado correctamente! Redirigiendo...
                    </div>
                )}

                <div className="pasarela-content">
                    {paso === "envio" ? (
                        <div className="form-envio">
                            <div className="form-group">
                                <label htmlFor="direccion">Dirección de Envío *</label>
                                <input
                                    type="text"
                                    id="direccion"
                                    name="direccion"
                                    value={datosEnvio.direccion}
                                    onChange={handleDatosEnvioChange}
                                    placeholder="Calle, número, apartamento"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="ciudad">Ciudad *</label>
                                    <input
                                        type="text"
                                        id="ciudad"
                                        name="ciudad"
                                        value={datosEnvio.ciudad}
                                        onChange={handleDatosEnvioChange}
                                        placeholder="Ciudad"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="codigoPostal">Código Postal</label>
                                    <input
                                        type="text"
                                        id="codigoPostal"
                                        name="codigoPostal"
                                        value={datosEnvio.codigoPostal}
                                        onChange={handleDatosEnvioChange}
                                        placeholder="Código postal"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="telefono">Teléfono de Contacto *</label>
                                <input
                                    type="tel"
                                    id="telefono"
                                    name="telefono"
                                    value={datosEnvio.telefono}
                                    onChange={handleDatosEnvioChange}
                                    placeholder="Teléfono"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="notas">Notas (opcional)</label>
                                <textarea
                                    id="notas"
                                    name="notas"
                                    value={datosEnvio.notas}
                                    onChange={handleDatosEnvioChange}
                                    placeholder="Instrucciones especiales para la entrega"
                                    rows="3"
                                ></textarea>
                            </div>
                        </div>
                    ) : (
                        <div className="form-pago">
                            <div className="total-pagar">
                                <span>Total a pagar:</span>
                                <span className="precio-total">
                                    ${typeof total === "number" ? total.toLocaleString("es-ES") : total}
                                </span>
                            </div>

                            <h3 className="metodos-titulo">Método de Pago</h3>

                            <div className="metodos-pago">
                                <div
                                    className={`metodo-item ${metodoPago === "transferencia" ? "seleccionado" : ""}`}
                                    onClick={() => setMetodoPago("transferencia")}
                                >
                                    <input
                                        type="radio"
                                        id="transferencia"
                                        name="metodoPago"
                                        checked={metodoPago === "transferencia"}
                                        onChange={() => setMetodoPago("transferencia")}
                                    />
                                    <label htmlFor="transferencia" className="metodo-label">
                                        <i className="fas fa-university"></i>
                                        <div>
                                            <span className="metodo-titulo">Transferencia Bancaria</span>
                                            <span className="metodo-descripcion">Realiza una transferencia bancaria a nuestra cuenta</span>
                                        </div>
                                    </label>
                                </div>

                                <div
                                    className={`metodo-item ${metodoPago === "nequi" ? "seleccionado" : ""}`}
                                    onClick={() => setMetodoPago("nequi")}
                                >
                                    <input
                                        type="radio"
                                        id="nequi"
                                        name="metodoPago"
                                        checked={metodoPago === "nequi"}
                                        onChange={() => setMetodoPago("nequi")}
                                    />
                                    <label htmlFor="nequi" className="metodo-label">
                                        <i className="fas fa-mobile-alt"></i>
                                        <div>
                                            <span className="metodo-titulo">Nequi</span>
                                            <span className="metodo-descripcion">Paga con tu cuenta de Nequi</span>
                                            <span className="metodo-descripcion">Envía el pago al número {nequiConfig.numero}</span>
                                        </div>
                                    </label>
                                </div>

                                <div
                                    className={`metodo-item ${metodoPago === "contraentrega" ? "seleccionado" : ""}`}
                                    onClick={() => setMetodoPago("contraentrega")}
                                >
                                    <input
                                        type="radio"
                                        id="contraentrega"
                                        name="metodoPago"
                                        checked={metodoPago === "contraentrega"}
                                        onChange={() => setMetodoPago("contraentrega")}
                                    />
                                    <label htmlFor="contraentrega" className="metodo-label">
                                        <i className="fas fa-truck"></i>
                                        <div>
                                            <span className="metodo-titulo">Pago contra entrega</span>
                                            <span className="metodo-descripcion">Paga en efectivo cuando recibas tu pedido</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="referencia">Referencia de la transacción</label>
                                <input
                                    type="text"
                                    id="referencia"
                                    value={referencia}
                                    onChange={(e) => setReferencia(e.target.value)}
                                    placeholder="Número de referencia"
                                    disabled={metodoPago === "contraentrega"}
                                    className={metodoPago === "contraentrega" ? "disabled" : ""}
                                />
                                {metodoPago !== "contraentrega" && (
                                    <small className="referencia-ayuda">Ingresa el número de referencia de tu transacción</small>
                                )}
                            </div>

                            {metodoPago !== "contraentrega" && (
                                <div className="form-group comprobante-group">
                                    <label htmlFor="comprobante">Comprobante de pago</label>
                                    <div className="comprobante-upload">
                                        <input
                                            type="file"
                                            id="comprobante"
                                            ref={fileInputRef}
                                            accept="image/*,.pdf"
                                            onChange={handleComprobanteChange}
                                            className="file-input"
                                        />
                                        <label htmlFor="comprobante" className="file-label">
                                            <i className="fas fa-upload"></i> Seleccionar archivo
                                        </label>
                                        {archivoComprobante && (
                                            <div className="file-info">
                                                <span className="file-name">{archivoComprobante.name}</span>
                                                <button type="button" className="btn-eliminar-archivo" onClick={eliminarComprobante}>
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {previewComprobante && (
                                        <div className="comprobante-preview">
                                            <img src={previewComprobante || "/placeholder.svg"} alt="Vista previa del comprobante" />
                                        </div>
                                    )}
                                    {archivoComprobante && !comprobanteGuardado && (
                                        <button type="button" className="btn-guardar-comprobante" onClick={guardarComprobante}>
                                            <i className="fas fa-download"></i> Guardar comprobante en mi dispositivo
                                        </button>
                                    )}
                                    {comprobanteGuardado && (
                                        <div className="comprobante-guardado">
                                            <i className="fas fa-check-circle"></i> Comprobante guardado correctamente
                                        </div>
                                    )}
                                    <small className="comprobante-ayuda">
                                        Adjunta una captura de pantalla o imagen del comprobante de pago y guárdalo en tu dispositivo
                                    </small>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="pasarela-footer">
                    {paso === "envio" ? (
                        <div className="botones-accion">
                            <button className="btn-cancelar" onClick={onClose}>
                                Cancelar
                            </button>
                            <button className="btn-continuar" onClick={continuarAPago}>
                                Continuar
                            </button>
                        </div>
                    ) : (
                        <div className="botones-accion">
                            {direccionEnvio ? (
                                <button className="btn-cancelar" onClick={onClose}>
                                    Cancelar
                                </button>
                            ) : (
                                <button className="btn-volver" onClick={() => setPaso("envio")}>
                                    Volver
                                </button>
                            )}
                            <button className="btn-confirmar" onClick={confirmarPago} disabled={cargando || exito}>
                                {cargando ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Procesando...
                                    </>
                                ) : (
                                    "Confirmar Pago"
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PasarelaPago

