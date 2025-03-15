const { data, error } = await supabase
    .from('usuarios')
    .insert([
        {
            user_id: authUser.id, // El ID de auth.users
            nombre: "Fabian",
            apellido: "Pérez",
            email: "fabianjo0316@gmail.com",
            isAdmin: true
        }
    ])
