"use client"

import { useState } from "react"

const FileUpload = ({ onImageUploaded, label = "Subir imagen" }) => {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState("")

    const handleFileChange = async (e) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const file = files[0]

        // Validar que sea una imagen
        if (!file.type.startsWith("image/")) {
            setError("Por favor selecciona un archivo de imagen válido")
            return
        }

        try {
            setUploading(true)
            setError("")

            // Usar FileReader para convertir la imagen a base64
            const reader = new FileReader()

            reader.onload = (event) => {
                const base64Image = event.target.result

                // Llamar al callback con la imagen en base64
                if (typeof onImageUploaded === "function") {
                    onImageUploaded(base64Image)
                }

                setUploading(false)
            }

            reader.onerror = () => {
                setError("Error al leer el archivo. Intenta con otra imagen.")
                setUploading(false)
            }

            // Leer el archivo como URL de datos (base64)
            reader.readAsDataURL(file)
        } catch (error) {
            console.error("Error al procesar imagen:", error)
            setError("Error al procesar la imagen. Intenta de nuevo.")
            setUploading(false)
        }
    }

    return (
        <div className="file-upload-container">
            <label className="file-upload-button">
                {uploading ? "Subiendo..." : label}
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    style={{ display: "none" }}
                />
            </label>
            {error && <div className="file-upload-error">{error}</div>}
        </div>
    )
}

export default FileUpload

