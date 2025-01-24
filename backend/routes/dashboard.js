const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get current month's stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    // Get last month's stats
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

    // Current month queries
    const [
      { count: totalAppointments },
      { count: totalPatients },
      { count: videoConsultations },
      { count: pendingAppointments }
    ] = await Promise.all([
      supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth),
      supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth),
      supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'video')
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth),
      supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth)
    ]);

    // Last month queries
    const [
      { count: lastMonthAppointments },
      { count: lastMonthPatients },
      { count: lastMonthVideoConsultations },
      { count: lastMonthPendingAppointments }
    ] = await Promise.all([
      supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfLastMonth)
        .lte('created_at', endOfLastMonth),
      supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfLastMonth)
        .lte('created_at', endOfLastMonth),
      supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'video')
        .gte('created_at', startOfLastMonth)
        .lte('created_at', endOfLastMonth),
      supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .gte('created_at', startOfLastMonth)
        .lte('created_at', endOfLastMonth)
    ]);

    // Calculate trends (percentage change from last month)
    const calculateTrend = (current, last) => {
      if (last === 0) return current > 0 ? 100 : 0;
      return ((current - last) / last) * 100;
    };

    const stats = {
      totalAppointments,
      totalPatients,
      videoConsultations,
      pendingAppointments,
      trends: {
        appointments: calculateTrend(totalAppointments, lastMonthAppointments),
        patients: calculateTrend(totalPatients, lastMonthPatients),
        videoConsultations: calculateTrend(videoConsultations, lastMonthVideoConsultations),
        pendingAppointments: calculateTrend(pendingAppointments, lastMonthPendingAppointments)
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard statistics',
      details: error.message 
    });
  }
});

module.exports = router; 