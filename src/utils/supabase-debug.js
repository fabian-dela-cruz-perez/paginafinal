import { supabase } from "./supabase"

/**
 * Función para verificar la configuración de Supabase Storage
 * @returns {Promise<Object>} Resultado del diagnóstico
 */
export async function diagnosticarSupabaseStorage() {
    try {
        // 1. Verificar si el usuario está autenticado
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError) {
            return {
                autenticado: false,
                error: `Error de autenticación: ${authError.message}`,
                recomendacion: "Inicia sesión antes de intentar subir archivos.",
            }
        }

        if (!user) {
            return {
                autenticado: false,
                error: "No hay usuario autenticado",
                recomendacion: "Inicia sesión antes de intentar subir archivos.",
            }
        }

        // 2. Verificar si el bucket existe
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

        if (bucketsError) {
            return {
                autenticado: true,
                bucketExiste: false,
                error: `Error al listar buckets: ${bucketsError.message}`,
                recomendacion: "Verifica que tu usuario tenga permisos para listar buckets.",
            }
        }

        const bucketProductos = buckets.find((b) => b.name === "productos")

        if (!bucketProductos) {
            return {
                autenticado: true,
                bucketExiste: false,
                error: 'El bucket "productos" no existe',
                recomendacion: 'Crea el bucket "productos" en Supabase Storage.',
            }
        }

        // 3. Intentar listar archivos en el bucket para verificar permisos
        const { data: files, error: filesError } = await supabase.storage.from("productos").list()

        if (filesError) {
            return {
                autenticado: true,
                bucketExiste: true,
                permisosLectura: false,
                error: `Error al listar archivos: ${filesError.message}`,
                recomendacion: 'Verifica las políticas de acceso para SELECT en el bucket "productos".',
            }
        }

        // 4. Intentar subir un archivo de prueba
        const testBlob = new Blob(["test"], { type: "text/plain" })
        const testFileName = `test_${Date.now()}.txt`

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("productos")
            .upload(`test/${testFileName}`, testBlob)

        if (uploadError) {
            return {
                autenticado: true,
                bucketExiste: true,
                permisosLectura: true,
                permisosEscritura: false,
                error: `Error al subir archivo de prueba: ${uploadError.message}`,
                recomendacion: 'Verifica las políticas de acceso para INSERT en el bucket "productos".',
            }
        }

        // 5. Eliminar el archivo de prueba
        await supabase.storage.from("productos").remove([`test/${testFileName}`])

        // Todo está bien
        return {
            autenticado: true,
            bucketExiste: true,
            permisosLectura: true,
            permisosEscritura: true,
            mensaje: "La configuración de Supabase Storage es correcta.",
        }
    } catch (error) {
        return {
            error: `Error inesperado: ${error.message}`,
            recomendacion: "Revisa la consola del navegador para más detalles.",
        }
    }
}

