// Este archivo es para depurar problemas con las imágenes
// Puedes incluirlo en tu proyecto para ayudar a diagnosticar problemas

export const depurarImagenes = (productos) => {
    console.log("=== DEPURACIÓN DE IMÁGENES ===")

    if (!productos || productos.length === 0) {
        console.log("No hay productos para depurar")
        return
    }

    productos.forEach((producto, index) => {
        console.log(`Producto ${index + 1}: ${producto.nombre}`)

        if (!producto.imagenes) {
            console.log("  - No tiene propiedad 'imagenes'")
        } else if (!Array.isArray(producto.imagenes)) {
            console.log(`  - 'imagenes' no es un array, es: ${typeof producto.imagenes}`)
            console.log(`  - Valor: ${JSON.stringify(producto.imagenes)}`)
        } else if (producto.imagenes.length === 0) {
            console.log("  - El array 'imagenes' está vacío")
        } else {
            console.log(`  - Tiene ${producto.imagenes.length} imágenes:`)
            producto.imagenes.forEach((img, i) => {
                console.log(`    ${i + 1}: ${typeof img === "string" ? img.substring(0, 50) + "..." : "No es una cadena"}`)

                // Solo intentar cargar la imagen si es una cadena
                if (typeof img === "string") {
                    // Crear un elemento de imagen para probar si carga
                    const imgTest = new Image()
                    imgTest.crossOrigin = "anonymous" // Añadir esto para evitar problemas CORS
                    imgTest.onload = () => console.log(`    ✓ La imagen ${i + 1} carga correctamente`)
                    imgTest.onerror = () => console.log(`    ✗ Error al cargar la imagen ${i + 1}`)
                    imgTest.src = img
                }
            })
        }
    })
}

// Función para corregir URLs de imágenes
export const corregirUrlsImagenes = (productos) => {
    return productos.map((producto) => {
        // Si imagenes no es un array o es null/undefined, crear un array vacío
        if (!producto.imagenes || !Array.isArray(producto.imagenes)) {
            return {
                ...producto,
                imagenes: [],
            }
        }

        // Filtrar URLs vacías o inválidas
        const imagenesValidas = producto.imagenes.filter((url) => {
            return url && typeof url === "string" && url.trim() !== ""
        })

        return {
            ...producto,
            imagenes: imagenesValidas,
        }
    })
}

// Función para verificar si una imagen existe
export const verificarImagen = (src) => {
    return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = "anonymous" // Añadir esto para evitar problemas CORS
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false)
        img.src = src
    })
}

