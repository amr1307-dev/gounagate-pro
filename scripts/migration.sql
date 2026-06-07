-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- discount_percent and original_price already exist

ALTER TABLE packages ADD COLUMN IF NOT EXISTS highlights jsonb DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS good_to_know jsonb DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS whats_included jsonb DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS faqs jsonb DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS video_url text;
