const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get all payments
router.get('/', async (req, res) => {
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        patient:profiles(name),
        appointment(type)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payments',
      details: error.message 
    });
  }
});

// Get payment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: payment, error } = await supabase
      .from('payments')
      .select(`
        *,
        patient:profiles(name, email),
        appointment(type, date, time)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payment',
      details: error.message 
    });
  }
});

// Create new payment
router.post('/', async (req, res) => {
  try {
    const { 
      amount,
      patient_id,
      appointment_id,
      payment_method,
      status = 'pending'
    } = req.body;

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        amount,
        patient_id,
        appointment_id,
        payment_method,
        status,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        patient:profiles(name),
        appointment(type)
      `)
      .single();

    if (error) throw error;

    // Broadcast new payment to all connected clients
    req.app.broadcast({
      type: 'NEW_PAYMENT',
      payment
    });

    res.json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ 
      error: 'Failed to create payment',
      details: error.message 
    });
  }
});

// Update payment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data: payment, error } = await supabase
      .from('payments')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        patient:profiles(name),
        appointment(type)
      `)
      .single();

    if (error) throw error;

    // Broadcast payment update to all connected clients
    req.app.broadcast({
      type: 'PAYMENT_UPDATED',
      payment
    });

    res.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ 
      error: 'Failed to update payment',
      details: error.message 
    });
  }
});

module.exports = router; 