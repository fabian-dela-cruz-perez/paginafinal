"use client"

import { useState, useEffect } from "react"
import "../hoja-de-estilos/AdminPanel.css"

function AdminPanel({ onClose }) {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/users")

                if (!response.ok) {
                    throw new Error("No se pudieron cargar los usuarios")
                }

                const data = await response.json()
                setUsers(data)
                setLoading(false)
            } catch (error) {
                console.error("Error al cargar usuarios:", error)
                setError("Error al cargar los usuarios. Por favor, intenta de nuevo.")
                setLoading(false)
            }
        }

        fetchUsers()
    }, [])

    // Formatear fecha
    const formatDate = (dateString) => {
        const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
        return new Date(dateString).toLocaleDateString("es-ES", options)
    }

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal">
                <div className="admin-header">
                    <h2>Panel de Administración</h2>
                    <button className="close-button" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="admin-content">
                    <h3>Usuarios Registrados</h3>

                    {loading ? (
                        <div className="loading-spinner">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Cargando usuarios...</p>
                        </div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : (
                        <div className="users-table-container">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Apellido</th>
                                        <th>Email</th>
                                        <th>Fecha de Registro</th>
                                        <th>Rol</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <tr key={user._id}>
                                                <td>{user.nombre}</td>
                                                <td>{user.apellido}</td>
                                                <td>{user.email}</td>
                                                <td>{formatDate(user.fechaRegistro)}</td>
                                                <td>{user.isAdmin ? "Administrador" : "Usuario"}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="no-users">
                                                No hay usuarios registrados
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="admin-footer">
                    <button className="close-admin-button" onClick={onClose}>
                        <i className="fas fa-times-circle"></i> Cerrar Panel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AdminPanel

