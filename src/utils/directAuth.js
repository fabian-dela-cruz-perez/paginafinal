// Función para redirigir directamente a los sitios de autenticación
// Esta es una solución alternativa cuando Supabase OAuth no está configurado

export const redirectToProvider = (provider) => {
    switch (provider) {
        case "google":
            // URL para iniciar sesión con Google
            window.location.href = "https://accounts.google.com/signin"
            break
        case "facebook":
            // URL para iniciar sesión con Facebook
            window.location.href = "https://www.facebook.com/login"
            break
        case "apple":
            // URL para iniciar sesión con Apple
            window.location.href = "https://appleid.apple.com/sign-in"
            break
        default:
            console.error(`Proveedor no soportado: ${provider}`)
    }
}

