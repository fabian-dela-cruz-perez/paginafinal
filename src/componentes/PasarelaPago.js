"use client"

// Import necessary modules and libraries (e.g., React, Supabase client)
import { useState, useEffect } from "react"
import { supabase } from "../utils/supabase.ts" // Assuming you have a supabaseClient.js file

function Pedidos() {
    const [pedidos, setPedidos] = useState([])
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)
    const [estadoSeleccionado, setEstadoSeleccionado] = useState("")
    const [actualizandoEstado, setActualizandoEstado] = useState(false)

    useEffect(() => {
        const obtenerPedidos = async () => {
            try {
                // Obtener pedidos desde Supabase
                const { data, error } = await supabase
                    .from("pedidos")
                    .select(`
                        *,
                        usuario:usuario_id (
                            nombre,
                            email
                        )
                    `)
                    .order("created_at", { ascending: false })

                if (error) {
                    throw error
                }

                // Formatear pedidos
                const pedidosFormateados = data.map((pedido) => ({
                    id: pedido.id,
                    usuario: pedido.usuario,
                    estado: pedido.estado,
                    total: pedido.total,
                    direccionEnvio: pedido.direccion_envio,
                    created_at: pedido.fecha_pedido,
                    updated_at: pedido.fecha_actualizacion,
                    // ... otros campos necesarios
                }))

                // Obtener productos para cada pedido
                const pedidosConProductos = await Promise.all(
                    pedidosFormateados.map(async (pedido) => {
                        const { data: productos, error: productosError } = await supabase
                            .from("pedido_productos")
                            .select(`
                                *,
                                producto:producto_id (
                                    nombre
                                )
                            `)
                            .eq("pedido_id", pedido.id)

                        if (productosError) {
                            console.error("Error al obtener productos del pedido:", productosError)
                            return {
                                ...pedido,
                                productos: [],
                            }
                        }

                        // Formatear productos
                        const productosFormateados = productos.map((item) => ({
                            nombre: item.producto ? item.producto.nombre : "Producto no disponible",
                            precio: item.precio || "$0",
                            cantidad: item.cantidad || 1,
                            color: item.color || "N/A",
                            talla: item.talla || "N/A",
                        }))

                        return {
                            ...pedido,
                            productos: productosFormateados,
                        }
                    }),
                )

                setPedidos(pedidosConProductos)
            } catch (error) {
                console.error("Error al obtener pedidos:", error)
                alert("Error al obtener los pedidos: " + error.message)
            }
        }

        obtenerPedidos()
    }, [])

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

            // Actualizar el pedido en la lista
            setPedidos(
                pedidos.map((p) =>
                    p.id === pedidoSeleccionado.id
                        ? {
                            ...p,
                            estado: estadoSeleccionado,
                            updated_at: new Date().toISOString(),
                        }
                        : p,
                ),
            )

            // Actualizar el pedido seleccionado
            setPedidoSeleccionado({
                ...pedidoSeleccionado,
                estado: estadoSeleccionado,
                updated_at: new Date().toISOString(),
            })

            alert("Estado del pedido actualizado correctamente")
        } catch (error) {
            console.error("Error al actualizar estado:", error)
            alert("Error al actualizar el estado del pedido: " + error.message)
        } finally {
            setActualizandoEstado(false)
        }
    }

    const eliminarPedido = async () => {
        if (!pedidoSeleccionado) {
            return
        }

        if (!window.confirm("¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.")) {
            return
        }

        try {
            // Primero eliminar los productos asociados
            await supabase.from("pedido_productos").delete().eq("pedido_id", pedidoSeleccionado.id)

            // Luego eliminar el pedido
            await supabase.from("pedidos").delete().eq("id", pedidoSeleccionado.id)

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

    const cerrarDetalles = () => {
        setPedidoSeleccionado(null)
    }

    // Placeholder functions for event handlers and rendering
    const handlePedidoClick = (pedido) => {
        setPedidoSeleccionado(pedido)
        setEstadoSeleccionado(pedido.estado)
    }

    const handleEstadoChange = (e) => {
        setEstadoSeleccionado(e.target.value)
    }

    return (
        <div>
            <h1>Lista de Pedidos</h1>
            {pedidos.map((pedido) => (
                <div key={pedido.id} onClick={() => handlePedidoClick(pedido)}>
                    Pedido ID: {pedido.id}, Estado: {pedido.estado}
                </div>
            ))}

            {pedidoSeleccionado && (
                <div>
                    <h2>Detalles del Pedido</h2>
                    <p>ID: {pedidoSeleccionado.id}</p>
                    <p>
                        Usuario: {pedidoSeleccionado.usuario?.nombre} ({pedidoSeleccionado.usuario?.email})
                    </p>
                    <p>Estado: {pedidoSeleccionado.estado}</p>
                    <p>Total: {pedidoSeleccionado.total}</p>
                    <p>Dirección de Envío: {pedidoSeleccionado.direccionEnvio}</p>
                    <p>Fecha de Pedido: {pedidoSeleccionado.created_at}</p>
                    <p>Fecha de Actualización: {pedidoSeleccionado.updated_at}</p>

                    <h3>Productos:</h3>
                    <ul>
                        {pedidoSeleccionado.productos.map((producto, index) => (
                            <li key={index}>
                                {producto.nombre} - Precio: {producto.precio}, Cantidad: {producto.cantidad}, Color: {producto.color},
                                Talla: {producto.talla}
                            </li>
                        ))}
                    </ul>

                    <div>
                        <label>
                            Nuevo Estado:
                            <select value={estadoSeleccionado} onChange={handleEstadoChange}>
                                <option value="pendiente">Pendiente</option>
                                <option value="en_proceso">En Proceso</option>
                                <option value="enviado">Enviado</option>
                                <option value="entregado">Entregado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </label>
                        <button onClick={actualizarEstadoPedido} disabled={actualizandoEstado}>
                            {actualizandoEstado ? "Actualizando..." : "Actualizar Estado"}
                        </button>
                    </div>

                    <button onClick={eliminarPedido}>Eliminar Pedido</button>
                    <button onClick={cerrarDetalles}>Cerrar Detalles</button>
                </div>
            )}
        </div>
    )
}

export default Pedidos

