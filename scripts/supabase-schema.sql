-- Esquema completo para Supabase

-- Habilitar Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    role TEXT DEFAULT 'vendedor' CHECK (role IN ('vendedor', 'supervisor', 'administrador')),
    status TEXT DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de perfumes
CREATE TABLE IF NOT EXISTS public.perfumes (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT,
    description TEXT,
    current_stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 0,
    price_per_ml DECIMAL(10,2) NOT NULL,
    cost_per_ml DECIMAL(10,2),
    supplier TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Tabla de movimientos de inventario
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id BIGSERIAL PRIMARY KEY,
    perfume_id BIGINT NOT NULL REFERENCES perfumes(id),
    movement_type TEXT NOT NULL CHECK (movement_type IN ('entrada', 'venta', 'ajuste', 'devolucion')),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    customer_info TEXT,
    bottle_type TEXT,
    milliliters INTEGER,
    is_refill BOOLEAN DEFAULT FALSE,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS public.sales (
    id BIGSERIAL PRIMARY KEY,
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount DECIMAL(10,2) NOT NULL,
    total_items INTEGER NOT NULL,
    customer_name TEXT,
    customer_contact TEXT,
    customer_email TEXT,
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Tabla de detalles de venta
CREATE TABLE IF NOT EXISTS public.sale_details (
    id BIGSERIAL PRIMARY KEY,
    sale_id BIGINT NOT NULL REFERENCES sales(id),
    perfume_id BIGINT NOT NULL REFERENCES perfumes(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    bottle_type TEXT,
    milliliters INTEGER,
    is_refill BOOLEAN DEFAULT FALSE,
    discount_applied DECIMAL(10,2) DEFAULT 0
);

-- Tabla de tipos de frasco
CREATE TABLE IF NOT EXISTS public.bottle_types (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de auditoría
CREATE TABLE IF NOT EXISTS public.audit_log (
    id BIGSERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id BIGINT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID NOT NULL REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_perfumes_brand ON perfumes(brand);
CREATE INDEX IF NOT EXISTS idx_perfumes_category ON perfumes(category);
CREATE INDEX IF NOT EXISTS idx_perfumes_status ON perfumes(status);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_perfume ON inventory_movements(perfume_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_date ON inventory_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Vista para reportes de ventas detallados
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
    pr.name as sold_by,
    s.created_at
FROM sales s
JOIN sale_details sd ON s.id = sd.sale_id
JOIN perfumes p ON sd.perfume_id = p.id
JOIN profiles pr ON s.created_by = pr.id;

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_perfumes_updated_at BEFORE UPDATE ON perfumes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'vendedor')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'administrador'
        )
    );

-- Políticas RLS para perfumes
CREATE POLICY "Authenticated users can view perfumes" ON perfumes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert perfumes" ON perfumes
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own perfumes" ON perfumes
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all perfumes" ON perfumes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'administrador'
        )
    );

-- Políticas similares para otras tablas
CREATE POLICY "Authenticated users can view inventory_movements" ON inventory_movements
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert inventory_movements" ON inventory_movements
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can view sales" ON sales
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert sales" ON sales
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can view sale_details" ON sale_details
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert sale_details" ON sale_details
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM sales 
            WHERE id = sale_id AND created_by = auth.uid()
        )
    );
