import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for existing database tables
export interface Profile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor' | 'patient';
  avatar_url?: string;
  phone?: string;
  created_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  age: number;
  gender: string;
  blood_group: string;
  medical_history?: string;
  allergies?: string[];
  emergency_contact: string;
  address: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  type: 'in-person' | 'video' | 'phone';
  created_at: string;
  updated_at: string;
}

// Helper functions for data fetching
export const fetchProfileById = async (id: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const fetchPatientByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const fetchAppointments = async (filters?: {
  patient_id?: string;
  doctor_id?: string;
  status?: Appointment['status'];
  type?: Appointment['type'];
}) => {
  let query = supabase.from('appointments').select('*');

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        query = query.eq(key, value);
      }
    });
  }

  const { data, error } = await query.order('appointment_date', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const updateAppointmentStatus = async (
  id: string,
  status: Appointment['status']
) => {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export interface Doctor {
  id: string;
  profile_id: string;
  specialization: string;
  qualifications: string[];
  available_days: string[];
  available_hours: string[];
  created_at: string;
}

export interface Consultation {
  id: string;
  appointment_id: string;
  doctor_notes?: string;
  prescription?: string;
  follow_up_date?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  appointment_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  transaction_id?: string;
  created_at: string;
} 