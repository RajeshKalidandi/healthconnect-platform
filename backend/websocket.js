const WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('New client connected');

    // Set up Supabase real-time subscription
    const subscription = supabase
      .channel('db_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        async (payload) => {
          try {
            // Fetch updated appointment data
            const { data: appointments, error } = await supabase
              .from('appointments')
              .select('*')
              .order('created_at', { ascending: false });

            if (error) throw error;

            // Fetch updated stats
            const stats = await fetchDashboardStats();

            // Broadcast both appointments and stats
            ws.send(JSON.stringify({
              type: 'REALTIME_UPDATE',
              appointments,
              stats,
              event: payload.eventType,
              timestamp: new Date().toISOString()
            }));
          } catch (error) {
            console.error('Error broadcasting update:', error);
          }
        }
      )
      .subscribe();

    // Handle client messages
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'FETCH_INITIAL_DATA') {
          const [appointments, stats] = await Promise.all([
            supabase.from('appointments').select('*').order('created_at', { ascending: false }),
            fetchDashboardStats()
          ]);

          ws.send(JSON.stringify({
            type: 'INITIAL_DATA',
            appointments: appointments.data,
            stats,
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      subscription.unsubscribe();
    });
  });

  return wss;
};

// Helper function to fetch dashboard stats
const fetchDashboardStats = async () => {
  const today = new Date().toISOString();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthDate = lastMonth.toISOString();

  // Fetch current stats
  const [
    { count: totalAppointments },
    { count: totalPatients },
    { count: videoConsultations },
    { count: pendingAppointments },
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select('*', { count: 'exact' }),
    supabase
      .from('patients')
      .select('*', { count: 'exact' }),
    supabase
      .from('appointments')
      .select('*', { count: 'exact' })
      .eq('type', 'video'),
    supabase
      .from('appointments')
      .select('*', { count: 'exact' })
      .eq('status', 'pending'),
  ]);

  // Fetch last month's stats
  const [
    { count: lastMonthAppointments },
    { count: lastMonthPatients },
    { count: lastMonthVideo },
    { count: lastMonthPending },
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select('*', { count: 'exact' })
      .lt('created_at', lastMonthDate),
    supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .lt('created_at', lastMonthDate),
    supabase
      .from('appointments')
      .select('*', { count: 'exact' })
      .eq('type', 'video')
      .lt('created_at', lastMonthDate),
    supabase
      .from('appointments')
      .select('*', { count: 'exact' })
      .eq('status', 'pending')
      .lt('created_at', lastMonthDate),
  ]);

  // Calculate percentage change
  const calculateTrend = (current, previous) => {
    return previous ? ((current - previous) / previous) * 100 : 0;
  };

  return {
    appointments: totalAppointments || 0,
    patients: totalPatients || 0,
    videoConsultations: videoConsultations || 0,
    pendingAppointments: pendingAppointments || 0,
    trends: {
      appointments: calculateTrend(totalAppointments, lastMonthAppointments),
      patients: calculateTrend(totalPatients, lastMonthPatients),
      videoConsultations: calculateTrend(videoConsultations, lastMonthVideo),
      pendingAppointments: calculateTrend(pendingAppointments, lastMonthPending),
    },
  };
};

module.exports = setupWebSocket; 