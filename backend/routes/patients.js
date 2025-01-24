const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Get all patients
router.get('/', async (req, res) => {
  try {
    console.log('Fetching patients...');
    
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        role,
        created_at,
        updated_at,
        user:id (
          email,
          created_at
        )
      `)
      .eq('role', 'user')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Patients fetch error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch patients',
        details: error.message,
        hint: error.hint
      });
    }

    if (!profiles) {
      return res.status(404).json({ error: 'No patients found' });
    }

    // Format the response
    const formattedPatients = profiles.map(profile => ({
      id: profile.id,
      name: `${profile.first_name} ${profile.last_name}`.trim(),
      email: profile.user?.email,
      role: profile.role,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    }));

    console.log('Successfully fetched patients:', formattedPatients.length);
    res.json(formattedPatients);
  } catch (error) {
    console.error('Error in patients route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch patients',
      details: error.message,
      hint: error.hint || 'Check server logs for more details'
    });
  }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: patient, error } = await supabase
      .from('patients')
      .select(`
        *,
        profile:profiles(name, email, phone),
        appointments(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ 
      error: 'Failed to fetch patient',
      details: error.message 
    });
  }
});

// Update patient
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: updatedPatient, error } = await supabase
      .from('patients')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        profile:profiles(name, email, phone)
      `)
      .single();

    if (error) throw error;

    // Broadcast update to all connected clients
    req.app.broadcast({
      type: 'PATIENT_UPDATED',
      patient: updatedPatient
    });

    res.json(updatedPatient);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ 
      error: 'Failed to update patient',
      details: error.message 
    });
  }
});

module.exports = router; 