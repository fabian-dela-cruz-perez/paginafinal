import { createClient } from "@supabase/supabase-js"

// Conexión a Supabase
const supabaseUrl = "https://girvwbqhyfmatsvhzfty.supabase.co"
const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpcnZ3YnFoeWZtYXRzdmh6ZnR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MTY1NDEsImV4cCI6MjA1NzM5MjU0MX0.Y6JTe8tRRZ-hHbFd5wKXr5wFXeKbLN_ceBourx27HnA"

export const supabase = createClient(supabaseUrl, supabaseKey)

