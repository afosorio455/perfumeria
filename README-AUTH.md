# Sistema de Autenticación Personalizado - PerfumeStock

## Descripción

Este sistema implementa un sistema de autenticación personalizado que utiliza una tabla `users` en Supabase en lugar del sistema de auth nativo de Supabase.

## Estructura de la Base de Datos

### Tabla `users`

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  status VARCHAR(50) DEFAULT 'activo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Campos:
- `id`: Identificador único del usuario
- `nombre`: Nombre completo del usuario
- `email`: Email único del usuario
- `password_hash`: Hash de la contraseña (en producción, usar bcrypt o similar)
- `role`: Rol del usuario (admin, vendedor, user)
- `status`: Estado del usuario (activo, inactivo)
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

## Implementación

### 1. Crear la tabla en Supabase

Ejecuta el script SQL ubicado en `scripts/create-users-table.sql` en tu base de datos de Supabase.

### 2. Usuarios de prueba

El script crea automáticamente dos usuarios de prueba:

- **Administrador**: admin@perfumestock.com / admin123
- **Vendedor**: vendedor@perfumestock.com / vendedor123

#### Usuarios adicionales (opcional)

Ejecuta `scripts/seed-users.sql` para agregar más usuarios de prueba:
- **Supervisor**: supervisor@perfumestock.com / supervisor123
- **Vendedor 2**: vendedor2@perfumestock.com / vendedor123
- **Admin 2**: admin2@perfumestock.com / admin123
- **Usuario Inactivo**: inactivo@perfumestock.com / inactivo123

### 3. Funcionalidades implementadas

#### Hook `useAuth`
- `signIn(email, password)`: Inicia sesión verificando credenciales en la tabla users
- `signOut()`: Cierra sesión y limpia localStorage
- `isAuthenticated()`: Verifica si el usuario está autenticado
- `hasRole(role)`: Verifica si el usuario tiene un rol específico

#### Componente `AuthGuard`
- Protege rutas que requieren autenticación
- Redirige a `/login` si el usuario no está autenticado
- Opcionalmente verifica roles específicos

#### Página de Login
- Formulario de inicio de sesión
- Redirige al dashboard (`/`) después del login exitoso
- Manejo de errores de autenticación

#### Navbar actualizado
- Muestra información del usuario logueado
- Botón de logout funcional
- Indicador de rol del usuario

#### Gestión de Usuarios
- **Crear Usuarios**: Formulario para agregar nuevos usuarios al sistema
- **Lista de Usuarios**: Tabla con todos los usuarios del sistema
- **Editar Roles**: Cambiar roles de usuarios (vendedor, supervisor, administrador)
- **Cambiar Estado**: Activar/desactivar usuarios
- **Eliminar Usuarios**: Eliminar usuarios del sistema
- **Protección por Rol**: Solo administradores pueden acceder a la gestión de usuarios

## Uso

### Proteger una página

```tsx
import { AuthGuard } from "@/components/auth-guard"

export default function MiPagina() {
  return (
    <AuthGuard>
      <div>Contenido protegido</div>
    </AuthGuard>
  )
}
```

### Proteger con rol específico

```tsx
<AuthGuard requiredRole="admin">
  <div>Solo para administradores</div>
</AuthGuard>
```

### Verificar autenticación en componentes

```tsx
import { useAuth } from "@/hooks/use-auth"

function MiComponente() {
  const { user, isAuthenticated, hasRole } = useAuth()
  
  if (!isAuthenticated()) {
    return <div>No autenticado</div>
  }
  
  if (hasRole('admin')) {
    return <div>Panel de administrador</div>
  }
  
  return <div>Panel de usuario</div>
}
```

### Gestión de Usuarios

La página `/users` incluye:

1. **Pestaña "Lista de Usuarios"**:
   - Ver todos los usuarios del sistema
   - Cambiar roles en tiempo real
   - Activar/desactivar usuarios
   - Eliminar usuarios

2. **Pestaña "Crear Usuario"**:
   - Formulario para crear nuevos usuarios
   - Selección de roles
   - Validación de contraseñas
   - Mensajes de éxito/error

## Seguridad

### Consideraciones importantes:

1. **Hashing de contraseñas**: En producción, implementa bcrypt o similar para hashear contraseñas
2. **JWT/Sessions**: Considera implementar JWT o sesiones para mayor seguridad
3. **Validación**: Agrega validación de entrada en el frontend y backend
4. **Rate limiting**: Implementa límites de intentos de login
5. **HTTPS**: Asegúrate de usar HTTPS en producción
6. **Control de Acceso**: Solo administradores pueden gestionar usuarios

### Implementación de bcrypt (recomendado):

```typescript
import bcrypt from 'bcrypt'

// Al crear usuario
const hashedPassword = await bcrypt.hash(password, 10)

// Al verificar login
const isValid = await bcrypt.compare(password, user.password_hash)
```

## Archivos modificados

- `hooks/use-auth.ts` - Hook de autenticación personalizado
- `components/auth-guard.tsx` - Componente de protección de rutas
- `components/navbar.tsx` - Navbar con funcionalidad de logout
- `components/create-user-form.tsx` - Formulario para crear usuarios
- `components/users-list.tsx` - Lista y gestión de usuarios
- `components/users-content.tsx` - Componente principal de gestión de usuarios
- `app/login/page.tsx` - Página de login actualizada
- `app/register/page.tsx` - Página de registro
- `app/users/page.tsx` - Página de gestión de usuarios (solo para administradores)
- `app/page.tsx` - Dashboard protegido
- `app/inventory/page.tsx` - Página de inventario protegida
- `app/sales/page.tsx` - Página de ventas protegida
- `app/sales/new/page.tsx` - Página de nueva venta protegida

## Scripts SQL

- `scripts/create-users-table.sql` - Crear tabla de usuarios
- `scripts/seed-users.sql` - Agregar usuarios de prueba adicionales

## Próximos pasos

1. Implementar hashing de contraseñas con bcrypt
2. Agregar validación de formularios más robusta
3. Implementar recuperación de contraseñas
4. Agregar logs de auditoría para cambios de usuarios
5. Implementar roles y permisos más granulares
6. Agregar autenticación de dos factores (2FA)
7. Implementar notificaciones por email para nuevos usuarios
8. Agregar filtros y búsqueda en la lista de usuarios
