// Este es un ejemplo de cómo debería ser el endpoint en tu servidor
// Ruta: /api/pedidos (POST)

const express = require("express")
const router = express.Router()
const { createClient } = require("@supabase/supabase-js")

// Configurar cliente de Supabase
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

router.post("/pedidos", async (req, res) => {
    try {
        const { usuario, productos, total, direccionEnvio, pago } = req.body

        console.log("Datos recibidos:", { usuario, productos, total, direccionEnvio, pago })

        // 1. Crear el pedido principal
        const { data: pedido, error: pedidoError } = await supabase
            .from("pedidos")
            .insert({
                usuario_id: usuario.id,
                total: total,
                estado: "pendiente",
                direccion_envio: JSON.stringify(direccionEnvio),
                metodo_pago: pago.metodo,
                referencia_pago: pago.referencia || null,
            })
            .select()
            .single()

        if (pedidoError) {
            console.error("Error al crear pedido:", pedidoError)
            return res.status(500).json({
                message: "Error al crear el pedido",
                error: pedidoError,
            })
        }

        // 2. Insertar los productos del pedido
        if (productos && productos.length > 0) {
            // Simplificar los datos de productos para evitar errores
            const productosInsert = productos.map((producto) => ({
                pedido_id: pedido.id,
                producto_id: producto.producto_id,
                cantidad: producto.cantidad,
                precio_unitario: producto.precio,
                color: producto.color || "N/A",
                talla: producto.talla || "N/A",
                // Campos adicionales para mostrar en detalles
                nombre_producto: producto.nombre || "Producto",
                imagen_url: producto.imagen || null,
                subtotal: producto.subtotal || producto.precio * producto.cantidad,
            }))

            console.log("Insertando productos:", productosInsert)

            const { error: productosError } = await supabase.from("pedido_productos").insert(productosInsert)

            if (productosError) {
                console.error("Error al guardar productos del pedido:", productosError)
                return res.status(500).json({
                    message: "Error al guardar los productos del pedido",
                    error: productosError,
                })
            }
        }

        // 3. Crear notificación para el usuario
        await supabase.from("notificaciones").insert({
            usuario_id: usuario.id,
            tipo: "pedido_creado",
            mensaje: `Tu pedido #${pedido.id} ha sido recibido y está pendiente de confirmación.`,
            leida: false,
            fecha: new Date().toISOString(),
        })

        return res.status(201).json({
            message: "Pedido creado con éxito",
            pedido_id: pedido.id,
        })
    } catch (error) {
        console.error("Error en el servidor:", error)
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message,
        })
    }
})

module.exports = router

