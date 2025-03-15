"use client"

import { useState, useEffect } from "react"
// Replace Link with standard anchor tags or React Router if you're using it
// Add the missing import for SimpleSearchBar
import SimpleSearchBar from "./Barra-de-busqueda.jsx"

// Add these styles at the top of the file
const styles = {
    adminDropdown: `
    absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200
  `,
    dropdownItem: `
    flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#FF5636] transition-colors
  `,
    dropdownIcon: `
    h-4 w-4 mr-3 text-gray-500
  `,
}

// Add these styles at the top of the file
const dropdownStyles = {
    container: {
        padding: "8px 0",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        border: "1px solid #e2e8f0",
        backgroundColor: "white",
        width: "200px",
    },
    button: {
        display: "flex",
        alignItems: "center",
        width: "100%",
        textAlign: "left",
        padding: "10px 16px",
        fontSize: "14px",
        transition: "all 0.2s ease",
        color: "#4A5568",
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer",
    },
    icon: {
        marginRight: "12px",
        width: "16px",
        color: "#718096",
    },
    hoverStyle: {
        backgroundColor: "#f7fafc",
        color: "#FF5636",
    },
}

export default function Navbar({
    usuario,
    isAdmin,
    carrito = [],
    toggleLogin,
    toggleAdmin,
    togglePedidos,
    toggleAdminPagos,
    toggleNequiConfig,
    toggleAdminProductos,
    toggleMisPedidos,
    toggleCarrito,
    handleLogout,
    handleSearch,
    toggleDropdown,
    dropdownOpen,
    handleCategoriaSeleccionada,
}) {
    const [showAdminMenu, setShowAdminMenu] = useState(false)
    // We'll use the isMobile variable for conditional rendering
    const [isMobile, setIsMobile] = useState(false)

    // Check if we're on mobile
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        // Set initial value
        handleResize()

        // Add event listener
        window.addEventListener("resize", handleResize)

        // Clean up
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // Close admin menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showAdminMenu && !event.target.closest(".admin-menu")) {
                setShowAdminMenu(false)
            }
        }

        document.addEventListener("click", handleClickOutside)

        return () => {
            document.removeEventListener("click", handleClickOutside)
        }
    }, [showAdminMenu])

    // Use isMobile to conditionally render elements or apply different styles
    const navbarClass = isMobile ? "nav-atributos mobile" : "nav-atributos"

    // Helper function for dropdown items
    const AdminDropdownItem = ({ icon, label, onClick }) => (
        <button
            className="admin-dropdown-item"
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                textAlign: "left",
                padding: "10px 16px",
                fontSize: "14px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#4A5568",
                transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#f7fafc"
                e.currentTarget.style.color = "#FF5636"
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent"
                e.currentTarget.style.color = "#4A5568"
            }}
        >
            <i className={`fas fa-${icon}`} style={{ marginRight: "12px", width: "16px" }}></i>
            <span>{label}</span>
        </button>
    )

    return (
        <header>
            <div>
                <nav className={navbarClass}>
                    <div className="Logo">
                        <span>RTH</span>
                    </div>

                    <div>
                        <SimpleSearchBar onSearch={handleSearch} />
                    </div>

                    {/* Replace Link with a regular anchor tag */}
                    <a href="/" className="boton-con-icono">
                        <i className="fas fa-home"></i> Inicio
                    </a>

                    <div className="dropdown">
                        <button className="boton-con-icono" onClick={toggleDropdown}>
                            <i className="fas fa-tags"></i> Catálogo
                        </button>
                        {dropdownOpen && (
                            <div className="dropdown-content">
                                <button onClick={() => handleCategoriaSeleccionada("Todos")}>Todos</button>
                                <button onClick={() => handleCategoriaSeleccionada("Conjuntos")}>Conjuntos</button>
                                <button onClick={() => handleCategoriaSeleccionada("Gorras")}>Gorras</button>
                                <button onClick={() => handleCategoriaSeleccionada("Accesorios")}>Accesorios</button>
                                <button onClick={() => handleCategoriaSeleccionada("Zapatos")}>Zapatos</button>
                            </div>
                        )}
                    </div>

                    <button className="boton-con-icono" onClick={toggleLogin}>
                        <i className="fas fa-user"></i> {usuario ? usuario.nombre : "Yo"}
                    </button>

                    {isAdmin && (
                        <div className="admin-menu">
                            <button
                                className="boton-con-icono admin-button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowAdminMenu(!showAdminMenu)
                                }}
                            >
                                <i className="fas fa-shield-alt"></i> Admin <i className="fas fa-caret-down"></i>
                            </button>
                            {showAdminMenu && (
                                <div
                                    className="admin-dropdown"
                                    style={{
                                        padding: "8px 0",
                                        borderRadius: "8px",
                                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                        border: "1px solid #e2e8f0",
                                        backgroundColor: "white",
                                        width: "200px",
                                        position: "absolute",
                                        right: "0",
                                        marginTop: "8px",
                                        zIndex: "50",
                                    }}
                                >
                                    <AdminDropdownItem icon="users-cog" label="Usuarios" onClick={toggleAdmin} />
                                    <AdminDropdownItem icon="shopping-bag" label="Pedidos" onClick={togglePedidos} />
                                    <AdminDropdownItem icon="credit-card" label="Pagos" onClick={toggleAdminPagos} />
                                    <AdminDropdownItem icon="mobile-alt" label="Nequi" onClick={toggleNequiConfig} />
                                    <AdminDropdownItem icon="box" label="Productos" onClick={toggleAdminProductos} />
                                </div>
                            )}
                        </div>
                    )}

                    {usuario && !isAdmin && (
                        <button className="boton-con-icono mis-pedidos-button" onClick={toggleMisPedidos}>
                            <i className="fas fa-box"></i> Mis Pedidos
                        </button>
                    )}

                    {usuario && (
                        <button className="boton-con-icono" onClick={handleLogout}>
                            <i className="fas fa-sign-out-alt"></i> Cerrar sesión
                        </button>
                    )}

                    {!isAdmin && (
                        <button className="boton-con-icono" onClick={toggleCarrito}>
                            <i className="fas fa-shopping-cart"></i> Carrito ({carrito.length})
                        </button>
                    )}
                </nav>
            </div>
        </header>
    )
}

