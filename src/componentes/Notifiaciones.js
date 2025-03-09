import { useState } from "react"
import "../hoja-de-estilos/Notificaciones.css"

function Notificaciones({ notificaciones, onClose }) {
    const [filtro, setFiltro] = useState("todas") // todas, no-leidas, leidas

    // Filtrar notificaciones según el filtro seleccionado
    const notificacionesFiltradas = notificaciones.filter(notif => {
        if (filtro === "todas") return true
        if (filtro === "no-leidas") return !notif.leida
        if (filtro === "leidas") return notif.leida
        return true
    })

    // Formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const hoy = new Date()
        const ayer = new Date(hoy)
        ayer.setDate(hoy.getDate() - 1)

        // Si es hoy, mostrar la hora
        if (date.toDateString() === hoy.toDateString()) {
            return `Hoy a las ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
        }

        // Si es ayer, mostrar "Ayer"
        if (date.toDateString() === ayer.toDateString()) {
            return `Ayer a las ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
        }

        // Si es otro día, mostrar la fecha completa
        const options = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
        return date.toLocaleDateString("es-ES", options)
    }

    // Obtener icono según el tipo de notificación
    const getIcono = (tipo) => {
        switch (tipo) {
            case "pedido_eliminado":
                return <i className="fas fa-trash-alt notif-icon eliminado"></i>
            case "estado_actualizado":
                return <i className="fas fa-sync-alt notif-icon actualizado"></i>
            case "nuevo_pedido":
                return <i className="fas fa-shopping-bag notif-icon nuevo"></i>
            default:
                return <i className="fas fa-bell notif-icon"></i>
        }
    }

    return (
        <div className="notificaciones-panel">
            <div className="notificaciones-header">
                <h3>Notificaciones</h3>
                <div className="notificaciones-filtros">
                    <button
                        className={`filtro-btn ${filtro === "todas" ? "activo" : ""}`}
                        onClick={() => setFiltro("todas")}
                    >
                        Todas
                    </button>
                    <button
                        className={`filtro-btn ${filtro === "no-leidas" ? "activo" : ""}`}
                        onClick={() => setFiltro("no-leidas")}
                    >
                        No leídas
                    </button>
                    <button
                        className={`filtro-btn ${filtro === "leidas" ? "activo" : ""}`}
                        onClick={() => setFiltro("leidas")}
                    >
                        Leídas
                    </button>
                </div>
            </div>

            <div className="notificaciones-lista">
                {notificacionesFiltradas.length > 0 ? (
                    notificacionesFiltradas.map((notif, index) => (
                        <div
                            key={index}
                            className={`notificacion-item ${!notif.leida ? "no-leida" : ""}`}
                        >
                            <div className="notificacion-icono">
                                {getIcono(notif.tipo)}
                            </div>
                            <div className="notificacion-contenido">
                                <p className="notificacion-mensaje">{notif.mensaje}</p>
                                <span className="notificacion-fecha">{formatDate(notif.fecha)}</span>
                            </div>
                            {!notif.leida && <div className="indicador-no-leida"></div>}
                        </div>
                    ))
                ) : (
                    <div className="no-notificaciones">
                        <i className="fas fa-bell-slash"></i>
                        <p>No hay notificaciones {filtro !== "todas" ? "con este filtro" : ""}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Notificaciones
