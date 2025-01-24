import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, VideoIcon, CreditCard, ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { API_BASE_URL, WS_BASE_URL } from "@/lib/config";
import { toast } from "sonner";

interface StatsData {
  totalAppointments: number;
  totalPatients: number;
  videoConsultations: number;
  pendingAppointments: number;
  trends: {
    appointments: number;
    patients: number;
    videoConsultations: number;
    pendingAppointments: number;
  };
}

export const Overview = () => {
  const [stats, setStats] = useState<StatsData>({
    totalAppointments: 0,
    totalPatients: 0,
    videoConsultations: 0,
    pendingAppointments: 0,
    trends: {
      appointments: 0,
      patients: 0,
      videoConsultations: 0,
      pendingAppointments: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Fetch stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getTrendColor = (value: number) => {
    return value >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const formatTrend = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value}%`;
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      trend: stats.trends.appointments,
      icon: Calendar,
      iconColor: 'text-blue-500'
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      trend: stats.trends.patients,
      icon: Users,
      iconColor: 'text-green-500'
    },
    {
      title: 'Video Consultations',
      value: stats.videoConsultations,
      trend: stats.trends.videoConsultations,
      icon: VideoIcon,
      iconColor: 'text-purple-500'
    },
    {
      title: 'Pending Appointments',
      value: stats.pendingAppointments,
      trend: stats.trends.pendingAppointments,
      icon: Calendar,
      iconColor: 'text-yellow-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{card.value}</div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(card.trend)}
                    <span className={`text-sm ${getTrendColor(card.trend)}`}>
                      {formatTrend(card.trend)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            Chart will be implemented here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 