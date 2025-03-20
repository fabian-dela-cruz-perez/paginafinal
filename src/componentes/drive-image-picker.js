"use client"

import { useState } from "react"
import { uploadDriveImageToSupabase, convertDriveUrl } from "../utils/drive-integration"

export default function DriveImagePicker({ onImageSelected, label = "Seleccionar imagen de Drive" }) {
    const [driveUrl, setDriveUrl] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState("")
    const [error, setError] = useState("")

    const handleDriveUrlChange = (e) => {
        setDriveUrl(e.target.value)
        setError("")

        try {
            // Try to generate a preview if it's a valid Drive URL
            if (e.target.value) {
                const directUrl = convertDriveUrl(e.target.value)
                setPreviewUrl(directUrl)
            } else {
                setPreviewUrl("")
            }
        } catch (err) {
            setPreviewUrl("")
        }
    }

    const handleUpload = async () => {
        if (!driveUrl) {
            setError("Por favor ingresa una URL de Google Drive")
            return
        }

        try {
            setIsUploading(true)
            setError("")

            const result = await uploadDriveImageToSupabase(driveUrl, null)

            // Call the callback with the public URL
            onImageSelected(result.publicUrl)

            // Reset the input
            setDriveUrl("")
            setPreviewUrl("")
        } catch (error) {
            setError("Error al subir la imagen: " + error.message)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="drive-image-picker">
            <div className="form-group">
                <label>{label}</label>
                <div className="drive-url-input">
                    <input
                        type="text"
                        value={driveUrl}
                        onChange={handleDriveUrlChange}
                        placeholder="Pega la URL de Google Drive aquí"
                        disabled={isUploading}
                    />
                    <button type="button" onClick={handleUpload} disabled={isUploading || !driveUrl} className="btn-upload">
                        {isUploading ? "Subiendo..." : "Subir"}
                    </button>
                </div>
                {error && <p className="error-message">{error}</p>}
            </div>

            {previewUrl && (
                <div className="image-preview">
                    <p>Vista previa:</p>
                    <img src={previewUrl || "/placeholder.svg"} alt="Vista previa" />
                </div>
            )}

            <style jsx>{`
        .drive-url-input {
          display: flex;
          gap: 8px;
        }
        
        .drive-url-input input {
          flex: 1;
        }
        
        .btn-upload {
          background-color: #4285F4;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .btn-upload:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        
        .error-message {
          color: red;
          margin-top: 4px;
          font-size: 14px;
        }
        
        .image-preview {
          margin-top: 16px;
        }
        
        .image-preview img {
          max-width: 200px;
          max-height: 200px;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 4px;
        }
      `}</style>
        </div>
    )
}

