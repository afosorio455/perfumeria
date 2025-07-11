-- Actualizar esquema de base de datos para incluir información de frascos y recargas

-- Agregar nuevas columnas a la tabla de movimientos de inventario
ALTER TABLE inventory_movements 
ADD COLUMN IF NOT EXISTS bottle_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS milliliters INTEGER,
ADD COLUMN IF NOT EXISTS is_refill BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) DEFAULT 0;

-- Agregar nuevas columnas a la tabla de detalles de venta
ALTER TABLE sale_details 
ADD COLUMN IF NOT EXISTS bottle_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS milliliters INTEGER,
ADD COLUMN IF NOT EXISTS is_refill BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS discount_applied DECIMAL(10,2) DEFAULT 0;

-- Crear tabla de tipos de frasco para estandarizar
CREATE TABLE IF NOT EXISTS bottle_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar tipos de frasco comunes
INSERT INTO bottle_types (name, description) VALUES
('atomizador', 'Frasco con atomizador para aplicación en spray'),
('roll-on', 'Frasco con aplicador roll-on'),
('spray', 'Frasco con spray tradicional'),
('gotero', 'Frasco con gotero para aplicación precisa'),
('crema', 'Envase para perfumes en crema')
ON CONFLICT (name) DO NOTHING;

-- Crear tabla de tamaños comunes
CREATE TABLE IF NOT EXISTS common_sizes (
    id SERIAL PRIMARY KEY,
    milliliters INTEGER NOT NULL UNIQUE,
    is_popular BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0
);

-- Insertar tamaños comunes
INSERT INTO common_sizes (milliliters, is_popular, sort_order) VALUES
(5, TRUE, 1),
(10, TRUE, 2),
(15, TRUE, 3),
(20, TRUE, 4),
(25, TRUE, 5),
(30, TRUE, 6),
(50, TRUE, 7),
(100, TRUE, 8),
(75, FALSE, 9),
(125, FALSE, 10),
(150, FALSE, 11)
ON CONFLICT (milliliters) DO NOTHING;

-- Crear vista para reportes de ventas detallados
CREATE OR REPLACE VIEW sales_detailed_view AS
SELECT 
    s.id as sale_id,
    s.sale_date,
    s.customer_name,
    s.payment_method,
    sd.perfume_id,
    p.name as perfume_name,
    p.brand as perfume_brand,
    p.category as perfume_category,
    sd.bottle_type,
    sd.milliliters,
    sd.is_refill,
    sd.quantity,
    sd.unit_price,
    sd.discount_applied,
    sd.subtotal,
    u.name as sold_by,
    s.created_at
FROM sales s
JOIN sale_details sd ON s.id = sd.sale_id
JOIN perfumes p ON sd.perfume_id = p.id
JOIN users u ON s.created_by = u.id;

-- Crear función para calcular descuento por recarga
CREATE OR REPLACE FUNCTION calculate_refill_discount(
    base_price DECIMAL(10,2),
    is_refill BOOLEAN,
    discount_rate DECIMAL(5,2) DEFAULT 10.0
) RETURNS DECIMAL(10,2) AS $$
BEGIN
    IF is_refill THEN
        RETURN base_price * (discount_rate / 100);
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Crear función para obtener productos más vendidos por tipo de frasco
CREATE OR REPLACE FUNCTION get_top_selling_by_bottle_type(
    bottle_type_filter VARCHAR(50) DEFAULT NULL,
    limit_count INTEGER DEFAULT 10
) RETURNS TABLE (
    perfume_name VARCHAR(255),
    perfume_brand VARCHAR(255),
    bottle_type VARCHAR(50),
    total_quantity INTEGER,
    total_milliliters INTEGER,
    total_revenue DECIMAL(10,2),
    refill_percentage DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.name,
        p.brand,
        sd.bottle_type,
        SUM(sd.quantity)::INTEGER as total_quantity,
        SUM(sd.milliliters * sd.quantity)::INTEGER as total_milliliters,
        SUM(sd.subtotal) as total_revenue,
        ROUND(
            (SUM(CASE WHEN sd.is_refill THEN sd.quantity ELSE 0 END)::DECIMAL / 
             NULLIF(SUM(sd.quantity), 0) * 100), 2
        ) as refill_percentage
    FROM sale_details sd
    JOIN perfumes p ON sd.perfume_id = p.id
    WHERE (bottle_type_filter IS NULL OR sd.bottle_type = bottle_type_filter)
    GROUP BY p.name, p.brand, sd.bottle_type
    ORDER BY total_revenue DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_sale_details_bottle_type ON sale_details(bottle_type);
CREATE INDEX IF NOT EXISTS idx_sale_details_milliliters ON sale_details(milliliters);
CREATE INDEX IF NOT EXISTS idx_sale_details_is_refill ON sale_details(is_refill);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_bottle_type ON inventory_movements(bottle_type);
