-- Datos iniciales para Supabase

-- Insertar tipos de frasco
INSERT INTO bottle_types (name, description) VALUES
('atomizador', 'Frasco con atomizador para aplicación en spray'),
('roll-on', 'Frasco con aplicador roll-on'),
('spray', 'Frasco con spray tradicional'),
('gotero', 'Frasco con gotero para aplicación precisa'),
('crema', 'Envase para perfumes en crema')
ON CONFLICT (name) DO NOTHING;

-- Nota: Los usuarios se crearán automáticamente cuando se registren
-- Los perfumes y ventas se crearán a través de la aplicación
