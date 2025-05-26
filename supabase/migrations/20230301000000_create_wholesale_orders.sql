
-- Create the wholesale_orders table to store purchase orders
CREATE TABLE IF NOT EXISTS public.wholesale_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id TEXT NOT NULL,
  customer_id TEXT,
  quantity INTEGER DEFAULT 1,
  total_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  duration_months INTEGER,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  customer_company TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies for wholesale_orders
ALTER TABLE public.wholesale_orders ENABLE ROW LEVEL SECURITY;

-- Only admins can see all orders
CREATE POLICY "Admins can see all wholesale orders" 
ON public.wholesale_orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow users to create their own orders
CREATE POLICY "Users can create their own wholesale orders" 
ON public.wholesale_orders
FOR INSERT
WITH CHECK (true);
