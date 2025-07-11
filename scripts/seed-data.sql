-- Insertar datos de ejemplo para el sistema de inventario de perfumes

-- Insertar usuarios de ejemplo
INSERT INTO users (name, email, password_hash, role, status) VALUES
('María García', 'maria.garcia@perfumestock.com', '$2b$10$example_hash_1', 'administrador', 'activo'),
('Carlos López', 'carlos.lopez@perfumestock.com', '$2b$10$example_hash_2', 'vendedor', 'activo'),
('Ana Martínez', 'ana.martinez@perfumestock.com', '$2b$10$example_hash_3', 'supervisor', 'activo'),
('Luis Rodríguez', 'luis.rodriguez@perfumestock.com', '$2b$10$example_hash_4', 'vendedor', 'inactivo');

-- Insertar perfumes de ejemplo
INSERT INTO perfumes (name, brand, category, description, current_stock, min_stock, price_per_ml, cost_per_ml, supplier, created_by) VALUES
('Chanel No. 5', 'Chanel', 'Floral', 'Icónico perfume floral con notas de rosa y jazmín', 250, 100, 5.00, 3.00, 'Distribuidora Premium', 1),
('Dior Sauvage', 'Dior', 'Woody', 'Fragancia masculina fresca y especiada', 180, 100, 4.50, 2.80, 'Distribuidora Premium', 1),
('Creed Aventus', 'Creed', 'Fruity', 'Perfume de lujo con notas frutales y ahumadas', 25, 100, 8.00, 5.50, 'Importadora Luxury', 1),
('Tom Ford Black Orchid', 'Tom Ford', 'Oriental', 'Fragancia oriental intensa y seductora', 120, 50, 6.00, 4.00, 'Distribuidora Premium', 1),
('Bleu de Chanel', 'Chanel', 'Fresh', 'Perfume masculino fresco y elegante', 45, 100, 4.80, 3.20, 'Distribuidora Premium', 1),
('La Vie Est Belle', 'Lancôme', 'Gourmand', 'Fragancia femenina dulce y radiante', 30, 100, 4.20, 2.90, 'Distribuidora Beauty', 1),
('Acqua di Gio', 'Giorgio Armani', 'Fresh', 'Perfume acuático fresco y marino', 85, 75, 3.80, 2.50, 'Distribuidora Beauty', 1),
('Flowerbomb', 'Viktor & Rolf', 'Floral', 'Explosión floral intensa y femenina', 60, 50, 5.20, 3.60, 'Importadora Luxury', 1);

-- Insertar movimientos de inventario de ejemplo
INSERT INTO inventory_movements (perfume_id, movement_type, quantity, unit_price, total_amount, customer_info, created_by) VALUES
-- Ventas
(1, 'venta', -50, 5.00, 250.00, 'Cliente Regular - María Pérez', 2),
(2, 'venta', -30, 4.50, 135.00, 'Nuevo Cliente - Juan García', 2),
(4, 'venta', -40, 6.00, 240.00, 'Cliente VIP - Ana López', 3),
(3, 'venta', -25, 8.00, 200.00, 'Cliente Premium - Carlos Ruiz', 3),
-- Entradas de stock
(1, 'entrada', 100, 3.00, 300.00, 'Reposición - Distribuidora Premium', 1),
(2, 'entrada', 80, 2.80, 224.00, 'Reposición - Distribuidora Premium', 1),
(3, 'entrada', 50, 5.50, 275.00, 'Reposición - Importadora Luxury', 1),
-- Ajustes
(5, 'ajuste', -5, 0, 0, 'Ajuste por inventario físico', 3);

-- Insertar ventas de ejemplo
INSERT INTO sales (sale_date, total_amount, total_items, customer_name, customer_contact, payment_method, created_by) VALUES
('2024-01-15', 250.00, 50, 'María Pérez', 'maria.perez@email.com', 'tarjeta', 2),
('2024-01-15', 135.00, 30, 'Juan García', '555-0123', 'efectivo', 2),
('2024-01-14', 240.00, 40, 'Ana López', 'ana.lopez@email.com', 'transferencia', 3),
('2024-01-14', 200.00, 25, 'Carlos Ruiz', '555-0456', 'tarjeta', 3);

-- Insertar detalles de venta
INSERT INTO sale_details (sale_id, perfume_id, quantity, unit_price, subtotal) VALUES
(1, 1, 50, 5.00, 250.00),
(2, 2, 30, 4.50, 135.00),
(3, 4, 40, 6.00, 240.00),
(4, 3, 25, 8.00, 200.00);

-- Actualizar timestamps de última actualización
UPDATE users SET last_login = CURRENT_TIMESTAMP - INTERVAL '2 hours' WHERE id = 1;
UPDATE users SET last_login = CURRENT_TIMESTAMP - INTERVAL '4 hours' WHERE id = 2;
UPDATE users SET last_login = CURRENT_TIMESTAMP - INTERVAL '1 day' WHERE id = 3;
UPDATE users SET last_login = CURRENT_TIMESTAMP - INTERVAL '5 days' WHERE id = 4;
