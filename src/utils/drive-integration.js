import { supabase } from "./supabase.ts"

/**
 * Converts a Google Drive sharing URL to a direct download URL
 * @param {string} driveUrl - Google Drive sharing URL
 * @returns {string} Direct download URL
 */
export function convertDriveUrl(driveUrl) {
    // Extract the file ID from various Google Drive URL formats
    let fileId = ""

    if (driveUrl.includes("drive.google.com/file/d/")) {
        // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
        fileId = driveUrl.split("/file/d/")[1].split("/")[0]
    } else if (driveUrl.includes("drive.google.com/open")) {
        // Format: https://drive.google.com/open?id=FILE_ID
        fileId = new URL(driveUrl).searchParams.get("id")
    } else if (driveUrl.includes("docs.google.com/uc?id=")) {
        // Already in direct download format
        return driveUrl
    }

    if (!fileId) {
        throw new Error("Invalid Google Drive URL format")
    }

    // Return the direct download URL
    return `https://drive.google.com/uc?export=view&id=${fileId}`
}

/**
 * Uploads an image from Google Drive to Supabase Storage
 * @param {string} driveUrl - Google Drive sharing URL
 * @param {string} fileName - Name to save the file as
 * @returns {Promise<{path: string, publicUrl: string}>} Storage path and public URL
 */
export async function uploadDriveImageToSupabase(driveUrl, fileName) {
    try {
        // Convert to direct download URL
        const directUrl = convertDriveUrl(driveUrl)

        // Fetch the image
        const response = await fetch(directUrl)
        if (!response.ok) {
            throw new Error("Failed to fetch image from Google Drive")
        }

        // Convert to blob
        const blob = await response.blob()

        // Generate a unique file name if not provided
        const uniqueFileName = fileName || `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
        const fileExt = blob.type.split("/")[1] || "jpg"
        const fullFileName = `${uniqueFileName}.${fileExt}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage.from("productos").upload(`images/${fullFileName}`, blob, {
            contentType: blob.type,
            cacheControl: "3600",
        })

        if (error) throw error

        // Get public URL
        const { data: urlData } = supabase.storage.from("productos").getPublicUrl(`images/${fullFileName}`)

        return {
            path: data.path,
            publicUrl: urlData.publicUrl,
        }
    } catch (error) {
        console.error("Error uploading image from Drive to Supabase:", error)
        throw error
    }
}

