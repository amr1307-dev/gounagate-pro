-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
ALTER TABLE packages ADD COLUMN IF NOT EXISTS discount_percent integer DEFAULT 0;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS original_price numeric(10,2);
UPDATE packages SET original_price = price WHERE original_price IS NULL;
