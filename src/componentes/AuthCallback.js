"use client"

import { useEffect, useState } from "react"
import { supabase } from "../utils/supabase.ts"
import "../hoja-de-estilos/AuthCallback.css"

function AuthCallback() {
    const [message, setMessage] = useState("Procesando autenticación...")
    const [error, setError] = useState(null)

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Obtener la sesión actual después de la redirección OAuth
                const {
                    data: { session },
                    error: sessionError,
                } = await supabase.auth.getSession()

                if (sessionError) throw sessionError

                if (!session) {
                    setMessage("No se pudo completar la autenticación.")
                    return
                }

                // Verificar si el usuario ya existe en nuestra tabla de usuarios
                const { data: existingUser, error: userError } = await supabase
                    .from("usuarios")
                    .select("*")
                    .eq("auth_id", session.user.id)
                    .single()

                if (userError && userError.code !== "PGRST116") {
                    // PGRST116 es el código para "no se encontraron resultados"
                    throw userError
                }

                // Si el usuario no existe en nuestra tabla, lo creamos
                if (!existingUser) {
                    // Extraer información del perfil del usuario
                    const { user } = session

                    // Obtener nombre y apellido de los metadatos del usuario
                    // Los proveedores OAuth suelen proporcionar esta información
                    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || ""
                    const names = fullName.split(" ")
                    const nombre = names[0] || ""
                    const apellido = names.slice(1).join(" ") || ""

                    // Determinar el proveedor
                    const provider = user.app_metadata?.provider || "email"

                    // Insertar el nuevo usuario en nuestra tabla
                    const { error: insertError } = await supabase.from("usuarios").insert([
                        {
                            auth_id: user.id,
                            email: user.email,
                            nombre,
                            apellido,
                            isadmin: false,
                            fecharegistro: new Date(),
                            provider: provider,
                        },
                    ])

                    if (insertError) throw insertError
                }

                // Verificar si el usuario es administrador
                const { data: userData, error: adminCheckError } = await supabase
                    .from("usuarios")
                    .select("isadmin")
                    .eq("auth_id", session.user.id)
                    .single()

                if (adminCheckError) throw adminCheckError

                // Redirigir según el rol
                if (userData && userData.isadmin) {
                    window.location.href = "/admin"
                } else {
                    window.location.href = "/mi-cuenta"
                }
            } catch (error) {
                console.error("Error en el callback de autenticación:", error)
                setError(`Error: ${error.message}`)
            }
        }

        handleAuthCallback()
    }, [])

    if (error) {
        return (
            <div className="auth-callback-container">
                <div className="auth-callback-error">
                    <h2>Error de autenticación</h2>
                    <p>{error}</p>
                    <button onClick={() => (window.location.href = "/")}>Volver al inicio</button>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-callback-container">
            <div className="auth-callback-loading">
                <h2>Autenticación en proceso</h2>
                <p>{message}</p>
                <div className="loading-spinner">
                    <i className="fas fa-spinner fa-spin"></i>
                </div>
            </div>
        </div>
    )
}

export default AuthCallback

