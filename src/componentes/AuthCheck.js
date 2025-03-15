"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { supabase } from "../utils/supabase.ts"

// Crear contexto para el estado de autenticación
export const AuthContext = createContext(null)

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Función para obtener el usuario actual y verificar si es admin
        const getUserData = async () => {
            try {
                setLoading(true)

                // Obtener sesión actual
                const {
                    data: { session },
                    error: sessionError,
                } = await supabase.auth.getSession()

                if (sessionError) {
                    throw sessionError
                }

                if (!session) {
                    // No hay sesión activa
                    setUser(null)
                    setIsAdmin(false)
                    return
                }

                // Obtener datos del usuario
                const { data: userData, error: userError } = await supabase.auth.getUser()

                if (userError) {
                    throw userError
                }

                if (userData && userData.user) {
                    setUser(userData.user)

                    // Verificar si el usuario es administrador
                    const { data: adminData, error: adminError } = await supabase
                        .from("usuarios")
                        .select("isadmin")
                        .eq("email", userData.user.email)
                        .single()

                    if (adminError) {
                        console.error("Error al verificar permisos de administrador:", adminError)
                        setIsAdmin(false)
                    } else {
                        setIsAdmin(adminData && adminData.isadmin === true)
                    }
                }
            } catch (error) {
                console.error("Error al obtener datos del usuario:", error)
                setUser(null)
                setIsAdmin(false)
            } finally {
                setLoading(false)
            }
        }

        // Obtener datos iniciales
        getUserData()

        // Configurar listener para cambios en la autenticación
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth state changed:", event)
            getUserData()
        })

        // Limpiar listener al desmontar
        return () => {
            if (authListener && authListener.subscription) {
                authListener.subscription.unsubscribe()
            }
        }
    }, [])

    // Valor del contexto
    const value = {
        user,
        isAdmin,
        loading,
        signOut: () => supabase.auth.signOut(),
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Componente para proteger rutas que requieren autenticación
export function RequireAuth({ children, adminOnly = false }) {
    const { user, isAdmin, loading } = useAuth()

    if (loading) {
        return <div className="loading">Cargando...</div>
    }

    if (!user) {
        return (
            <div className="auth-required">
                <h2>Acceso Restringido</h2>
                <p>Debes iniciar sesión para acceder a esta página.</p>
            </div>
        )
    }

    if (adminOnly && !isAdmin) {
        return (
            <div className="admin-required">
                <h2>Acceso Denegado</h2>
                <p>Esta sección es solo para administradores.</p>
            </div>
        )
    }

    return children
}

// Componente para mostrar contenido solo a administradores
export function AdminOnly({ children }) {
    const { isAdmin, loading } = useAuth()

    if (loading) return null

    return isAdmin ? children : null
}

