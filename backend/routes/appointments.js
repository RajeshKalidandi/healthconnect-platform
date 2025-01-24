const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

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

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: 50000, // ₹500 in paise
      currency: 'INR',
      receipt: appointmentId,
      payment_capture: 1
    });

    // Create appointment record
    const appointmentRecord = {
      id: appointmentId,
      patient_name: appointmentData.name,
      patient_email: appointmentData.email,
      patient_phone: appointmentData.phone,
      date: new Date(appointmentData.appointmentDate).toISOString().split('T')[0],
      time: appointmentData.appointmentTime || '10:00',
      reason: appointmentData.reason || 'General consultation',
      type: appointmentData.consultationType || 'in-person',
      status: 'pending',
      payment_status: 'pending',
      created_at: new Date().toISOString(),
      order_id: order.id
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentRecord]);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to create appointment'
      });
    }

    // Broadcast to WebSocket clients
    const wss = req.app.get('wss');
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'NEW_APPOINTMENT',
            data: appointmentRecord
          }));
        }
      });
    }

    // Send confirmation email
    try {
      // Add email sending logic here
      console.log('Appointment confirmation email would be sent here');
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: appointmentRecord,
      order_id: order.id
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { appointmentId, paymentId, orderId, signature } = req.body;

    // Verify signature
    const text = orderId + "|" + paymentId;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");

    if (generated_signature !== signature) {
      return res.status(400).json({
        error: 'Invalid signature',
        message: 'Payment verification failed'
      });
    }

    // Update appointment status
    const { error } = await supabase
      .from('appointments')
      .update({
        payment_status: 'completed',
        status: 'confirmed',
        payment_id: paymentId
      })
      .eq('id', appointmentId);

    if (error) {
      throw error;
    }

    res.json({
      message: 'Payment verified successfully',
      appointment_id: appointmentId
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      error: 'Payment verification failed',
      message: error.message
    });
  }
});

// Get all appointments (for admin dashboard)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({ appointments: data });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Failed to fetch appointments'
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