-- Add missing columns with defaults
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';

-- Set not null constraints
ALTER TABLE appointments
ALTER COLUMN payment_status SET NOT NULL;
