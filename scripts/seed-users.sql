-- Script para agregar usuarios de prueba adicionales
-- Ejecutar después de crear la tabla users

-- Usuario supervisor
INSERT INTO users (nombre, email, password_hash, role, status) 
VALUES ('María González', 'supervisor@perfumestock.com', 'supervisor123', 'supervisor', 'activo')
ON CONFLICT (email) DO NOTHING;

-- Usuario vendedor adicional
INSERT INTO users (nombre, email, password_hash, role, status) 
VALUES ('Carlos Rodríguez', 'vendedor2@perfumestock.com', 'vendedor123', 'vendedor', 'activo')
ON CONFLICT (email) DO NOTHING;

-- Usuario administrador adicional
INSERT INTO users (nombre, email, password_hash, role, status) 
VALUES ('Ana Martínez', 'admin2@perfumestock.com', 'admin123', 'administrador', 'activo')
ON CONFLICT (email) DO NOTHING;

-- Usuario inactivo para pruebas
INSERT INTO users (nombre, email, password_hash, role, status) 
VALUES ('Luis Pérez', 'inactivo@perfumestock.com', 'inactivo123', 'vendedor', 'inactivo')
ON CONFLICT (email) DO NOTHING;

-- Verificar usuarios creados
SELECT 
  id,
  nombre,
  email,
  role,
  status,
  created_at
FROM users 
ORDER BY created_at DESC;
