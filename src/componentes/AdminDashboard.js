"use client"

import { useState } from "react"
import { useAuth } from "./AuthCheck"
import AdminPanel from "./AdminPanel"
import AdminProductos from "./AdminProductos"
import PedidosPanel from "./PedidosPanel"
import "../hoja-de-estilos/AdminDashboard.css"

function AdminDashboard() {
    const { isAdmin } = useAuth()
    const [activePanel, setActivePanel] = useState(null)

    const openPanel = (panel) => {
        setActivePanel(panel)
    }

    const closePanel = () => {
        setActivePanel(null)
    }

    if (!isAdmin) {
        return (
            <div className="acceso-denegado">
                <div className="acceso-denegado-contenido">
                    <i className="fas fa-exclamation-triangle"></i>
                    <h2>Acceso Denegado</h2>
                    <p>No tienes permisos para acceder al panel de administración.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="admin-dashboard">
            <h1>Panel de Administración</h1>

            <div className="admin-cards">
                <div className="admin-card" onClick={() => openPanel("usuarios")}>
                    <div className="admin-card-icon">
                        <i className="fas fa-users"></i>
                    </div>
                    <div className="admin-card-content">
                        <h3>Usuarios</h3>
                        <p>Gestionar usuarios registrados</p>
                    </div>
                </div>

                <div className="admin-card" onClick={() => openPanel("productos")}>
                    <div className="admin-card-icon">
                        <i className="fas fa-box"></i>
                    </div>
                    <div className="admin-card-content">
                        <h3>Productos</h3>
                        <p>Administrar catálogo de productos</p>
                    </div>
                </div>

                <div className="admin-card" onClick={() => openPanel("pedidos")}>
                    <div className="admin-card-icon">
                        <i className="fas fa-shopping-bag"></i>
                    </div>
                    <div className="admin-card-content">
                        <h3>Pedidos</h3>
                        <p>Ver y gestionar pedidos</p>
                    </div>
                </div>

                <div className="admin-card">
                    <div className="admin-card-icon">
                        <i className="fas fa-chart-bar"></i>
                    </div>
                    <div className="admin-card-content">
                        <h3>Estadísticas</h3>
                        <p>Ver estadísticas de ventas</p>
                    </div>
                </div>
            </div>

            {activePanel === "usuarios" && <AdminPanel onClose={closePanel} />}
            {activePanel === "productos" && <AdminProductos onClose={closePanel} />}
            {activePanel === "pedidos" && <PedidosPanel onClose={closePanel} />}
        </div>
    )
}

export default AdminDashboard

