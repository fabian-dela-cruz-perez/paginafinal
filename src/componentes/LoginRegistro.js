"use client"

import { useState } from "react"
import { supabase } from "../utils/supabase.ts"
import "../hoja-de-estilos/LoginRegistro.css"

function Login({ onClose }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isLogin) {
        // Iniciar sesión
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        // Redirigir según el rol del usuario
        const { data: userData, error: userError } = await supabase
          .from("usuarios")
          .select("isadmin")
          .eq("email", email)
          .single()

        if (userError) throw userError

        // En lugar de usar navigate, usamos window.location
        if (userData && userData.isadmin) {
          window.location.href = "/admin"
        } else {
          window.location.href = "/mi-cuenta"
        }
      } else {
        // Validar que se hayan ingresado nombre y apellido
        if (!nombre.trim() || !apellido.trim()) {
          throw new Error("Por favor, ingresa tu nombre y apellido")
        }

        // Registrar nuevo usuario
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (authError) throw authError

        // Asegurarse de que tenemos el user_id
        if (!authData?.user?.id) {
          throw new Error("No se pudo obtener el ID del usuario")
        }

        // Crear registro en la tabla usuarios usando el user_id como clave foránea
        const { error: insertError } = await supabase.from("usuarios").insert([
          {
            auth_id: authData.user.id, // Usar el ID del usuario de auth
            email,
            nombre,
            apellido,
            isadmin: false,
            fecharegistro: new Date(),
          },
        ])

        if (insertError) throw insertError

        alert("Registro exitoso. Por favor, verifica tu correo electrónico.")
        setIsLogin(true)
      }
    } catch (error) {
      console.error("Error:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-modal-overlay">
      <div className="login-modal">
        <div className="login-header">
          <h2>{isLogin ? "Iniciar Sesión" : "Crear Cuenta"}</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="login-tabs">
          <button className={`tab-button ${isLogin ? "active" : ""}`} onClick={() => setIsLogin(true)}>
            Iniciar Sesión
          </button>
          <button className={`tab-button ${!isLogin ? "active" : ""}`} onClick={() => setIsLogin(false)}>
            Registrarse
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="login-form">
          <form onSubmit={handleSubmit}>
            {/* Nombre y Apellido (solo mostrar en registro) */}
            {!isLogin && (
              <>
                <div className="form-group">
                  <label htmlFor="nombre">
                    <i className="fas fa-user"></i> Nombre
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    placeholder="Ingresa tu nombre"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="apellido">
                    <i className="fas fa-user"></i> Apellido
                  </label>
                  <input
                    type="text"
                    id="apellido"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    required
                    placeholder="Ingresa tu apellido"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i> Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i> Contraseña
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Ingresa tu contraseña"
                />
                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="forgot-password">
                <button type="button" className="forgot-password-button">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <span>
                  <i className="fas fa-spinner fa-spin"></i> Procesando...
                </span>
              ) : isLogin ? (
                "Iniciar Sesión"
              ) : (
                "Registrarse"
              )}
            </button>
          </form>

          <div className="form-footer">
            {isLogin ? (
              <p>
                ¿No tienes cuenta?{" "}
                <button type="button" className="toggle-form-button" onClick={() => setIsLogin(false)}>
                  Regístrate
                </button>
              </p>
            ) : (
              <p>
                ¿Ya tienes cuenta?{" "}
                <button type="button" className="toggle-form-button" onClick={() => setIsLogin(true)}>
                  Inicia sesión
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

