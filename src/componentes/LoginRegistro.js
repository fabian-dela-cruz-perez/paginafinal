import React, { useState } from "react";
import "../hoja-de-estilos/LoginRegistro.css";

const LoginRegistro = ({ onClose }) => {
    const [isRegistrarse, setIsRegistrarse] = useState(false); // Estado para alternar entre login y registro

    const toggleMode = () => {
        setIsRegistrarse(!isRegistrarse);
    };

    return (
        <div className="login-modal">
            <div className="login-content">
                <h2>{isRegistrarse ? "Registrarse" : "Iniciar Sesión"}</h2>

                <form>
                    {isRegistrarse && (
                        <>
                            <div className="form-group">
                                <label htmlFor="nombre">Nombre</label>
                                <input type="text" id="nombre" placeholder="Nombre completo" required />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" placeholder="Correo electrónico" required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input type="password" id="password" placeholder="Contraseña" required />
                    </div>

                    {isRegistrarse && (
                        <>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                                <input type="password" id="confirmPassword" placeholder="Confirmar contraseña" required />
                            </div>
                        </>
                    )}

                    <button type="submit" className="login-button">
                        {isRegistrarse ? "Registrarse" : "Iniciar Sesión"}
                    </button>
                </form>

                <button className="toggle-button" onClick={toggleMode}>
                    {isRegistrarse ? "¿Ya tienes cuenta? Iniciar Sesión" : "¿No tienes cuenta? Registrarse"}
                </button>

                <button className="cerrar-login" onClick={onClose}>
                    Cerrar
                </button>
            </div>
        </div>
    );
};

export default LoginRegistro;
