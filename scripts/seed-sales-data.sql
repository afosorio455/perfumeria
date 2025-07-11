-- Insertar datos de ejemplo para el nuevo sistema de ventas

-- Actualizar ventas existentes con información de frascos
UPDATE sale_details SET 
    bottle_type = 'atomizador',
    milliliters = 50,
    is_refill = FALSE,
    discount_applied = 0
WHERE id = 1;

UPDATE sale_details SET 
    bottle_type = 'spray',
    milliliters = 30,
    is_refill = FALSE,
    discount_applied = 0
WHERE id = 2;

UPDATE sale_details SET 
    bottle_type = 'atomizador',
    milliliters = 25,
    is_refill = TRUE,
    discount_applied = 24.00  -- 10% de descuento sobre 240
WHERE id = 3;

UPDATE sale_details SET 
    bottle_type = 'roll-on',
    milliliters = 10,
    is_refill = FALSE,
    discount_applied = 0
WHERE id = 4;

-- Insertar nuevas ventas de ejemplo con información completa
INSERT INTO sales (sale_date, total_amount, total_items, customer_name, customer_contact, payment_method, created_by) VALUES
('2024-01-16', 285.00, 3, 'Patricia Morales', '555-0789', 'tarjeta', 2),
('2024-01-16', 156.00, 2, 'Roberto Silva', 'roberto.silva@email.com', 'nequi', 3),
('2024-01-15', 420.00, 4, 'Carmen Jiménez', '555-0321', 'efectivo', 2);

-- Insertar detalles de las nuevas ventas
INSERT INTO sale_details (sale_id, perfume_id, quantity, unit_price, subtotal, bottle_type, milliliters, is_refill, discount_applied) VALUES
-- Venta 5: Patricia Morales
(5, 1, 1, 225.00, 225.00, 'atomizador', 50, FALSE, 0),  -- Chanel No. 5 50ml atomizador
(5, 2, 1, 60.00, 60.00, 'roll-on', 15, TRUE, 6.75),    -- Dior Sauvage 15ml roll-on recarga (10% desc)

-- Venta 6: Roberto Silva  
(6, 4, 1, 90.00, 90.00, 'spray', 15, FALSE, 0),         -- Tom Ford 15ml spray
(6, 1, 1, 66.00, 66.00, 'gotero', 15, TRUE, 7.50),     -- Chanel No. 5 15ml gotero recarga

-- Venta 7: Carmen Jiménez
(7, 2, 2, 90.00, 180.00, 'atomizador', 20, FALSE, 0),   -- Dior Sauvage 20ml x2
(7, 3, 1, 240.00, 240.00, 'spray', 30, FALSE, 0);      -- Creed Aventus 30ml spray

-- Actualizar movimientos de inventario con información de frascos
UPDATE inventory_movements SET 
    bottle_type = 'atomizador',
    milliliters = 50,
    is_refill = FALSE
WHERE id = 1;

UPDATE inventory_movements SET 
    bottle_type = 'spray',
    milliliters = 30,
    is_refill = FALSE
WHERE id = 2;

UPDATE inventory_movements SET 
    bottle_type = 'atomizador',
    milliliters = 25,
    is_refill = TRUE,
    discount_percentage = 10.0
WHERE id = 4;

-- Insertar nuevos movimientos de inventario
INSERT INTO inventory_movements (perfume_id, movement_type, quantity, unit_price, total_amount, customer_info, bottle_type, milliliters, is_refill, created_by) VALUES
(-50, 'venta', -50, 4.50, 225.00, 'Patricia Morales - Atomizador 50ml', 'atomizador', 50, FALSE, 2),
(-15, 'venta', -15, 4.00, 60.00, 'Patricia Morales - Roll-on 15ml Recarga', 'roll-on', 15, TRUE, 2),
(-15, 'venta', -15, 6.00, 90.00, 'Roberto Silva - Spray 15ml', 'spray', 15, FALSE, 3),
(-15, 'venta', -15, 4.40, 66.00, 'Roberto Silva - Gotero 15ml Recarga', 'gotero', 15, TRUE, 3),
(-40, 'venta', -40, 4.50, 180.00, 'Carmen Jiménez - Atomizador 20ml x2', 'atomizador', 20, FALSE, 2),
(-30, 'venta', -30, 8.00, 240.00, 'Carmen Jiménez - Spray 30ml', 'spray', 30, FALSE, 2);
