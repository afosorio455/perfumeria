-- Crear usuario administrador de prueba
-- Este script debe ejecutarse después de configurar Supabase

-- Insertar usuario administrador directamente en auth.users
-- Nota: En producción, esto se haría a través del panel de Supabase o la API de administración

-- El hash corresponde a la contraseña "admin123"
-- En un entorno real, deberías usar el panel de Supabase para crear este usuario

-- Crear perfil de administrador (el usuario se debe crear primero en el panel de Supabase)
-- Email: admin@perfumestock.com
-- Password: admin123

-- Una vez creado el usuario en Supabase, su perfil se creará automáticamente
-- pero podemos actualizarlo para asegurar que tenga el rol correcto:

-- UPDATE profiles 
-- SET role = 'administrador', name = 'Administrador Sistema'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@perfumestock.com');

-- Crear algunos usuarios de prueba adicionales (estos también deben crearse en el panel de Supabase)
-- vendedor@perfumestock.com / vendedor123
-- supervisor@perfumestock.com / supervisor123

-- Instrucciones para crear usuarios en Supabase:
-- 1. Ve al panel de Supabase > Authentication > Users
-- 2. Haz clic en "Add user"
-- 3. Ingresa el email y contraseña
-- 4. En "User Metadata" agrega:
--    {
--      "name": "Nombre del Usuario",
--      "role": "administrador" // o "vendedor" o "supervisor"
--    }
-- 5. Confirma el email automáticamente

-- Alternativamente, puedes usar la función de crear usuario desde la aplicación
-- una vez que tengas acceso como administrador
