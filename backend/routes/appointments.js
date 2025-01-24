const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

// Create new appointment
router.post('/', async (req, res) => {
  try {
    console.log('Received appointment data:', req.body);
    const appointmentData = req.body;

    // Basic validation
    if (!appointmentData.name || !appointmentData.email || !appointmentData.appointmentDate) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Name, email, and appointment date are required'
      });
    }

    // Generate appointment ID
    const appointmentId = `apt_${Math.random().toString(36).substr(2, 9)}`;

    // Create appointment record
    const appointmentRecord = {
      id: appointmentId,
      patient_name: appointmentData.name,
      patient_email: appointmentData.email,
      patient_phone: appointmentData.phone,
      date: new Date(appointmentData.appointmentDate).toISOString().split('T')[0], // Format as YYYY-MM-DD
      time: appointmentData.appointmentTime || '10:00',
      reason: appointmentData.reason || 'General consultation',
      type: appointmentData.consultationType || 'in-person',
      status: 'pending',
      payment_status: 'pending'
    };

    console.log('Attempting to insert appointment:', appointmentRecord);

    // First, check if the table exists and has the correct schema
    const { error: schemaError } = await supabase
      .from('appointments')
      .select('id')
      .limit(1);

    if (schemaError) {
      console.error('Schema validation error:', schemaError);
      return res.status(500).json({
        error: 'Database schema error',
        details: process.env.NODE_ENV === 'development' ? schemaError.message : 'Internal server error'
      });
    }

    // Insert the appointment
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentRecord])
      .select()
      .single();

    if (error) {
      console.error('Database error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        record: appointmentRecord
      });
      return res.status(500).json({
        error: 'Failed to save appointment',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }

    // In demo mode, simulate payment and notification services
    if (process.env.DEMO_MODE === 'true') {
      const demoData = {
        ...data,
        demo_mode: true,
        payment_id: `demo_pay_${Math.random().toString(36).substr(2, 9)}`,
        amount: 500,
        message: 'Appointment created. Payment and notifications will be simulated.'
      };

      // Broadcast the new appointment to all connected clients
      req.app.broadcast({
        type: 'APPOINTMENT_CREATED',
        appointment: demoData
      });

      return res.status(201).json(demoData);
    }

    // Broadcast the new appointment to all connected clients
    req.app.broadcast({
      type: 'APPOINTMENT_CREATED',
      appointment: data
    });

    // In real mode, return the appointment data
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      error: 'Failed to create appointment',
      details: error.message
    });
  }
});

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // In demo mode, add demo indicators for external services
    if (process.env.DEMO_MODE === 'true') {
      const appointmentsWithDemo = data.map(apt => ({
        ...apt,
        payment_id: apt.payment_id || `demo_pay_${Math.random().toString(36).substr(2, 9)}`,
        amount: apt.amount || 500,
        notifications: {
          email: 'simulated',
          whatsapp: 'simulated'
        }
      }));
      return res.json(appointmentsWithDemo);
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      error: 'Failed to fetch appointments',
      details: error.message
    });
  }
});

// Get single appointment
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({
        error: 'Appointment not found',
        details: `No appointment found with ID: ${id}`
      });
    }

    // In demo mode, add demo indicators for external services
    if (process.env.DEMO_MODE === 'true') {
      return res.json({
        ...data,
        payment_id: data.payment_id || `demo_pay_${Math.random().toString(36).substr(2, 9)}`,
        amount: data.amount || 500,
        notifications: {
          email: 'simulated',
          whatsapp: 'simulated'
        }
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      error: 'Failed to fetch appointment',
      details: error.message
    });
  }
});

// Update appointment
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('appointments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // In demo mode, add demo indicators for external services
    if (process.env.DEMO_MODE === 'true' && data.type === 'video') {
      return res.json({
        ...data,
        video_link: `demo_meeting_${Math.random().toString(36).substr(2, 9)}`,
        notifications: {
          email: 'simulated',
          whatsapp: 'simulated'
        }
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      error: 'Failed to update appointment',
      details: error.message
    });
  }
});

// Update appointment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Update real appointment in Supabase
    const { data: appointment, error } = await supabase
      .from('appointments')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Broadcast the update
    req.app.broadcast({
      type: 'APPOINTMENT_UPDATE',
      appointment
    });

    // In demo mode, add demo indicators for external services
    if (process.env.DEMO_MODE === 'true') {
      return res.json({
        ...appointment,
        payment_id: appointment.payment_id || `demo_pay_${Math.random().toString(36).substr(2, 9)}`,
        amount: appointment.amount || 500,
        notifications: {
          email: 'simulated',
          whatsapp: 'simulated'
        }
      });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ 
      error: 'Failed to update appointment status',
      details: error.message,
      hint: error.hint || 'Check server logs for more details'
    });
  }
});

// Get booked slots for a specific date
router.get('/slots', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const { data: bookedSlots, error } = await supabase
      .from('appointments')
      .select('date, time')
      .eq('date', date)
      .eq('status', 'confirmed');

    if (error) throw error;

    res.json({ bookedSlots: bookedSlots || [] });
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    res.status(500).json({ error: 'Failed to fetch booked slots' });
  }
});

// Book a new appointment
router.post('/book', async (req, res) => {
  try {
    const { name, email, phone, date, time, reason } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !date || !time || !reason) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if slot is already booked
    const { data: existingSlot, error: checkError } = await supabase
      .from('appointments')
      .select('id')
      .eq('date', date)
      .eq('time', time)
      .eq('status', 'confirmed')
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw checkError;
    }

    if (existingSlot) {
      return res.status(409).json({ error: 'This slot is already booked' });
    }

    // Create new appointment
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert([
        {
          patient_name: name,
          patient_email: email,
          patient_phone: phone,
          date,
          time,
          reason,
          status: 'confirmed'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        record: {
          patient_name: name,
          patient_email: email,
          patient_phone: phone,
          date,
          time,
          reason,
          status: 'confirmed'
        }
      });
      throw new Error(`Failed to save appointment to database: ${error.message}`);
    }

    // Broadcast the new appointment
    req.app.broadcast({
      type: 'NEW_APPOINTMENT',
      data: appointment
    });

    // In demo mode, add demo indicators for external services
    if (process.env.DEMO_MODE === 'true') {
      return res.status(201).json({
        ...appointment,
        payment_id: `demo_pay_${Math.random().toString(36).substr(2, 9)}`,
        amount: 500,
        notifications: {
          email: 'simulated',
          whatsapp: 'simulated'
        }
      });
    }

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

module.exports = router;