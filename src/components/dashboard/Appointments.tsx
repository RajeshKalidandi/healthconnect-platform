import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { apiCall } from "@/lib/api";
import { WS_BASE_URL } from "@/lib/config";
import { format } from "date-fns";

interface Appointment {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  date: string;
  time: string;
  reason: string;
  type: 'in-person' | 'video' | 'phone';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  meeting?: {
    link: string;
    password: string;
  };
}

export const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      const data = await apiCall('/api/appointments');
      setAppointments(data);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      toast.error(error.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const ws = new WebSocket(`${WS_BASE_URL}?token=${token}`);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
      setWsConnected(true);
      // Request initial data
      ws.send(JSON.stringify({ type: 'FETCH_INITIAL_DATA' }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'INITIAL_DATA' || data.type === 'REALTIME_UPDATE') {
          setAppointments(data.appointments || []);
          setLoading(false);
        } else if (data.type === 'APPOINTMENT_CREATED') {
          setAppointments(prev => [...prev, data.appointment]);
        } else if (data.type === 'APPOINTMENT_UPDATED') {
          setAppointments(prev => 
            prev.map(apt => 
              apt.id === data.appointment.id ? data.appointment : apt
            )
          );
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast.error('Connection error. Please refresh the page.');
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
      setWsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: Appointment['status']) => {
    try {
      await apiCall(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        body: { status: newStatus }
      });
      
      toast.success(`Appointment ${newStatus} successfully`);
      fetchAppointments();
    } catch (error: any) {
      console.error('Error updating appointment status:', error);
      toast.error(error.message || 'Failed to update appointment status');
    }
  };

  const handleVideoConsultation = async (appointmentId: string) => {
    try {
      toast.info("DEMO MODE: Setting up video consultation (API not integrated yet)");
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate demo meeting details
      const demoMeetingDetails = {
        platform: "Zoom (Demo)",
        link: `https://zoom.us/j/${Math.random().toString(36).substr(2, 9)}`,
        password: Math.random().toString(36).substr(2, 9),
        startTime: new Date(Date.now() + 30 * 60000).toISOString() // 30 mins from now
      };

      // Show demo meeting info
      toast.success(
        "DEMO MODE: Video consultation created!" +
        "\n\nMeeting Details (Demo):" +
        `\n• Link: ${demoMeetingDetails.link}` +
        `\n• Password: ${demoMeetingDetails.password}` +
        `\n• Start Time: ${format(new Date(demoMeetingDetails.startTime), 'PPp')}` +
        "\n\nNote: In production:" +
        "\n• Real Zoom/Agora meeting will be created" +
        "\n• Email will be sent via SendGrid" +
        "\n• WhatsApp update will be sent via Twilio"
      );

      // Update appointment with demo meeting details
      const response = await fetch(`/api/appointments/${appointmentId}/meeting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(demoMeetingDetails)
      });

      if (!response.ok) throw new Error('Failed to save meeting details');

    } catch (error) {
      console.error('Error setting up video consultation:', error);
      toast.error("Failed to set up video consultation");
    }
  };

  const filteredAppointments = appointments.filter(appointment =>
    appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Appointments</CardTitle>
        <div className="flex items-center space-x-2">
          {wsConnected && (
            <Badge variant="outline" className="bg-green-50">
              Live Updates Active
            </Badge>
          )}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search appointments..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{appointment.patient_name}</TableCell>
                <TableCell>{appointment.patient_email}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {new Date(appointment.date).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>{appointment.time}</TableCell>
                <TableCell>
                  <Badge variant="outline">{appointment.type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      appointment.status === 'confirmed'
                        ? 'default'
                        : appointment.status === 'completed'
                        ? 'success'
                        : appointment.status === 'cancelled'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {appointment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      appointment.payment_status === 'completed'
                        ? 'success'
                        : appointment.payment_status === 'failed'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {appointment.payment_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {appointment.type === 'video' && appointment.status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVideoConsultation(appointment.id)}
                      >
                        Set Up Video Call
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                      disabled={appointment.status === 'confirmed'}
                    >
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                      disabled={appointment.status === 'completed'}
                    >
                      Complete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};