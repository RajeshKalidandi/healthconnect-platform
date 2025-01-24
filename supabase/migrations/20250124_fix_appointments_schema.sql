-- Drop and recreate the appointments table to ensure correct schema
DROP TABLE IF EXISTS appointments;

CREATE TABLE appointments (
    id text PRIMARY KEY,
    patient_name text NOT NULL,
    patient_email text NOT NULL,
    patient_phone text NOT NULL,
    date date NOT NULL,
    time text NOT NULL,
    reason text NOT NULL,
    type text NOT NULL DEFAULT 'in-person',
    status text NOT NULL DEFAULT 'pending',
    payment_status text NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Add indexes for better performance
CREATE INDEX idx_appointments_patient_email ON appointments(patient_email);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_payment_status ON appointments(payment_status);

-- Enable row level security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON appointments
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON appointments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON appointments
    FOR UPDATE USING (true);
