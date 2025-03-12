"use client"

import { useState } from "react"
import "../hoja-de-estilos/LoginRegistro.css"

function LoginRegistro({ onClose }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const API_URL = "http://localhost:5000/api"

  const toggleForm = () => {
    setIsLogin(!isLogin)
    // Limpiar los campos al cambiar de formulario
    setEmail("")
    setPassword("")
    setNombre("")
    setApellido("")
    setError("")
    setSuccess("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      if (isLogin) {
        // Proceso de login
        const response = await fetch(`${API_URL}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Error al iniciar sesión")
        }

        setSuccess("Inicio de sesión exitoso")

        // Guardar el token de autenticación si existe
        if (data.token) {
          localStorage.setItem("token", data.token)
        }

        // Guardar la información del usuario
        localStorage.setItem("user", JSON.stringify(data.user))

        // Cerrar el modal después de un breve retraso
        setTimeout(() => {
          onClose()
          // Recargar la página para aplicar los cambios de rol
          window.location.reload()
        }, 1500)
      } else {
        // Proceso de registro
        const response = await fetch(`${API_URL}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nombre, apellido, email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Error al registrar usuario")
        }

        setSuccess("Registro exitoso. Ya puedes iniciar sesión.")
        // Cambiar al formulario de login después de un breve retraso
        setTimeout(() => {
          setIsLogin(true)
        }, 1500)
      }
    } catch (error) {
      console.error("Error:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="login-modal-overlay">
      <div className="login-modal">
        <div className="login-header">
          <h2>{isLogin ? "Iniciar Sesión" : "Crear Cuenta"}</h2>
          <button type="button" className="close-button" onClick={onClose} aria-label="Cerrar">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="login-tabs">
          <button type="button" className={`tab-button ${isLogin ? "active" : ""}`} onClick={() => setIsLogin(true)}>
            Iniciar Sesión
          </button>
          <button type="button" className={`tab-button ${!isLogin ? "active" : ""}`} onClick={() => setIsLogin(false)}>
            Registrarse
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">
                  <i className="fas fa-user"></i> Nombre
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ingresa tu nombre"
                  required={!isLogin}
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
                  placeholder="Ingresa tu apellido"
                  required={!isLogin}
                />
              </div>
            </div>
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
              placeholder="ejemplo@correo.com"
              required
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
                placeholder="Ingresa tu contraseña"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
          </div>

          {isLogin && (
            <div className="forgot-password">
              <button
                type="button"
                onClick={() => console.log("Recuperar contraseña")}
                className="forgot-password-button"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? <i className="fas fa-spinner fa-spin"></i> : isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </button>

          <div className="social-login">
            <p>O continúa con</p>
            <div className="social-buttons">
              <button type="button" className="social-button google" aria-label="Continuar con Google">
                <i className="fab fa-google"></i>
              </button>
              <button type="button" className="social-button facebook" aria-label="Continuar con Facebook">
                <i className="fab fa-facebook-f"></i>
              </button>
              <button type="button" className="social-button apple" aria-label="Continuar con Apple">
                <i className="fab fa-apple"></i>
              </button>
            </div>
          </div>

          <div className="form-footer">
            <p>
              {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}
              <button type="button" className="toggle-form-button" onClick={toggleForm}>
                {isLogin ? "Regístrate" : "Inicia Sesión"}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginRegistro