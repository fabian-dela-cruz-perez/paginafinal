"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import "../hoja-de-estilos/CarruselOfertas.css"

export default function CarruselOfertas({ productos = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0)

    // Productos de ejemplo si no se proporcionan
    const productosDemo =
        productos.length > 0
            ? productos
            : [
                {
                    nombre: "Smartphone Galaxy S23",
                    descripcion: "El último smartphone con cámara de 108MP, pantalla AMOLED y batería de larga duración.",
                    precio: "$2,499,000",
                    imagen: "/placeholder.svg",
                    categoria: "Electrónica",
                },
                {
                    nombre: "Laptop Ultrabook Pro",
                    descripcion: "Potente laptop con procesador i7, 16GB RAM y SSD de 512GB. Ideal para profesionales.",
                    precio: "$3,899,000",
                    imagen: "/placeholder.svg",
                    categoria: "Computadores",
                },
                {
                    nombre: "Audífonos Inalámbricos",
                    descripcion: "Audífonos con cancelación de ruido, 30 horas de batería y sonido de alta fidelidad.",
                    precio: "$599,000",
                    imagen: "/placeholder.svg",
                    categoria: "Audio",
                },
            ]

    // Cambiar automáticamente cada 5 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % productosDemo.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [productosDemo.length])

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? productosDemo.length - 1 : prevIndex - 1))
    }

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % productosDemo.length)
    }

    return (
        <div className="carrusel-container">
            <div className="carrusel-content">
                {productosDemo.length > 0 && (
                    <div className="carrusel-slide">
                        <div className="carrusel-info">
                            <div className="carrusel-badge">Oferta especial</div>
                            <h2 className="carrusel-title">{productosDemo[currentIndex].nombre}</h2>
                            <p className="carrusel-description">{productosDemo[currentIndex].descripcion}</p>
                            <div className="carrusel-price">{productosDemo[currentIndex].precio}</div>
                            <button className="carrusel-button">Ver oferta</button>
                        </div>
                        <div className="carrusel-image">
                            <img
                                src={productosDemo[currentIndex].imagen || "/placeholder.svg"}
                                alt={productosDemo[currentIndex].nombre}
                            />
                        </div>
                    </div>
                )}

                {/* Controles de navegación */}
                <button onClick={goToPrevious} className="carrusel-control carrusel-prev" aria-label="Anterior">
                    <ChevronLeft size={20} />
                </button>
                <button onClick={goToNext} className="carrusel-control carrusel-next" aria-label="Siguiente">
                    <ChevronRight size={20} />
                </button>

                {/* Indicadores */}
                <div className="carrusel-indicators">
                    {productosDemo.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`carrusel-indicator ${index === currentIndex ? "active" : ""}`}
                            aria-label={`Ir a la diapositiva ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

