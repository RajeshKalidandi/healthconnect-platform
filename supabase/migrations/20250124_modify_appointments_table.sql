-- First, add new columns
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS patient_name text,
ADD COLUMN IF NOT EXISTS patient_email text,
ADD COLUMN IF NOT EXISTS patient_phone text,
ADD COLUMN IF NOT EXISTS date date,
ADD COLUMN IF NOT EXISTS time text,
ADD COLUMN IF NOT EXISTS reason text,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS type text DEFAULT 'in-person';

-- Set default value for status if not already set
ALTER TABLE appointments 
ALTER COLUMN status SET DEFAULT 'confirmed';

-- Update timestamp columns to use timezone
ALTER TABLE appointments
ALTER COLUMN created_at SET DEFAULT timezone('utc'::text, now()),
ALTER COLUMN updated_at SET DEFAULT timezone('utc'::text, now());

-- Add not null constraints after ensuring data is migrated
ALTER TABLE appointments
ALTER COLUMN patient_name SET NOT NULL,
ALTER COLUMN patient_email SET NOT NULL,
ALTER COLUMN patient_phone SET NOT NULL,
ALTER COLUMN date SET NOT NULL,
ALTER COLUMN time SET NOT NULL,
ALTER COLUMN reason SET NOT NULL,
ALTER COLUMN status SET NOT NULL,
ALTER COLUMN payment_status SET NOT NULL,
ALTER COLUMN type SET NOT NULL;

-- Remove columns that are not in the new schema
ALTER TABLE appointments
DROP COLUMN IF EXISTS appointment_datetime,
DROP COLUMN IF EXISTS consultation_type,
DROP COLUMN IF EXISTS notes;

-- Add any missing indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient_email ON appointments(patient_email);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_payment_status ON appointments(payment_status);
