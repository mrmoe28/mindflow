-- Migration script for NeonDB with custom authentication
-- Run this after the main schema.sql

-- First, ensure users table exists (from auth_schema.sql)
-- If you haven't run auth_schema.sql yet, run it first

-- Update mind_maps.user_id to be UUID type if it's currently VARCHAR
DO $$
BEGIN
    -- Check if user_id column exists and is not UUID
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'mind_maps' 
        AND column_name = 'user_id'
        AND data_type != 'uuid'
    ) THEN
        -- Convert VARCHAR to UUID
        ALTER TABLE mind_maps 
        ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
    END IF;
END $$;

-- Ensure foreign key constraint exists
ALTER TABLE mind_maps 
    DROP CONSTRAINT IF EXISTS mind_maps_user_id_fkey;

ALTER TABLE mind_maps 
    ADD CONSTRAINT mind_maps_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_mind_maps_user_id ON mind_maps(user_id) WHERE user_id IS NOT NULL;

