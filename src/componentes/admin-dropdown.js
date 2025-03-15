"use client"

import { Users, ShoppingBag, CreditCard, Smartphone, Package, ShieldCheck } from "lucide-react"

export default function AdminDropdown({
    onToggleAdmin,
    onTogglePedidos,
    onToggleAdminPagos,
    onToggleNequiConfig,
    onToggleAdminProductos,
}) {
    const styles = {
        adminMenu: `
            relative
        `,
        adminButton: `
            flex items-center gap-2 px-4 py-2 rounded-md bg-[#FF5636] text-white hover:bg-opacity-90 transition-colors
        `,
        adminDropdown: `
            absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50
        `,
        dropdownItem: `
            flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#FF5636]
        `,
    }

    return (
        <div className={styles.adminMenu}>
            <button className={styles.adminButton}>
                <ShieldCheck className="h-5 w-5" /> Admin
            </button>
            <div className={styles.adminDropdown}>
                <button onClick={onToggleAdmin} className={styles.dropdownItem}>
                    <Users className="h-4 w-4" />
                    Usuarios
                </button>
                <button onClick={onTogglePedidos} className={styles.dropdownItem}>
                    <ShoppingBag className="h-4 w-4" />
                    Pedidos
                </button>
                <button onClick={onToggleAdminPagos} className={styles.dropdownItem}>
                    <CreditCard className="h-4 w-4" />
                    Pagos
                </button>
                <button onClick={onToggleNequiConfig} className={styles.dropdownItem}>
                    <Smartphone className="h-4 w-4" />
                    Nequi
                </button>
                <button onClick={onToggleAdminProductos} className={styles.dropdownItem}>
                    <Package className="h-4 w-4" />
                    Productos
                </button>
            </div>
        </div>
    )
}

