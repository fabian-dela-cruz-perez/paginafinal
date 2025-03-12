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
                setLoading(true)
                setError("")

                const token = localStorage.getItem("token")
                if (!token) {
                    throw new Error("No hay token de autenticación")
                }

                const response = await fetch("http://localhost:5000/api/users", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                })

                if (!response.ok) {
                    throw new Error("No se pudieron cargar los usuarios")
                }

                const data = await response.json()
                setUsers(Array.isArray(data) ? data : [])
                setLoading(false)
            } catch (error) {
                console.error("Error al cargar usuarios:", error)
                setError(error.message || "Error al cargar los usuarios. Por favor, intenta de nuevo.")
                setLoading(false)
            }
        }

        fetchUsers()
    }, [])

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
                                        <th>Rol</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users && users.length > 0 ? (
                                        users.map((user) => (
                                            <tr key={user.id}>
                                                <td>{user.nombre}</td>
                                                <td>{user.apellido}</td>
                                                <td>{user.email}</td>
                                                <td>{user.isAdmin ? "Administrador" : "Usuario"}</td>
                                                <td>
                                                    <button className="btn-edit" onClick={() => console.log("Editar usuario:", user.id)}>
                                                        <i className="fas fa-edit"></i> Editar
                                                    </button>
                                                    <button className="btn-delete" onClick={() => console.log("Eliminar usuario:", user.id)}>
                                                        <i className="fas fa-trash"></i> Eliminar
                                                    </button>
                                                </td>
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

