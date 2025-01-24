import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Users,
  VideoIcon,
  MessageCircle,
  CreditCard,
  BarChart,
  Settings,
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { toast } from 'sonner';
import { Overview } from "@/components/dashboard/Overview";
import { Appointments } from "@/components/dashboard/Appointments";
import { Patients } from '@/components/dashboard/Patients';
import { Messages } from '@/components/dashboard/Messages';
import { Payments } from '@/components/dashboard/Payments';
import { Settings as SettingsComponent } from '@/components/dashboard/Settings';
import { WS_BASE_URL } from '@/lib/config';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated');
    
    if (!token || !isAuthenticated) {
      navigate('/admin-login');
      return;
    }

    const connectWebSocket = () => {
      wsRef.current = new WebSocket(`${WS_BASE_URL}?token=${token}`);

      wsRef.current.onopen = () => {
        console.log('Connected to WebSocket');
        setIsConnected(true);
      };

      wsRef.current.onclose = () => {
        console.log('Disconnected from WebSocket');
        setIsConnected(false);
        setTimeout(connectWebSocket, 5000); // Attempt to reconnect after 5 seconds
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error. Retrying...');
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [navigate]);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'APPOINTMENT_UPDATED':
        toast.success('Appointment updated successfully');
        break;
      case 'NEW_MESSAGE':
        toast.info('New message received');
        break;
      case 'PAYMENT_UPDATED':
        toast.success('Payment status updated');
        break;
      case 'PATIENT_UPDATED':
        toast.success('Patient information updated');
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  };

  const handleLogout = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('userId');
    navigate('/admin-login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'appointments':
        return <Appointments />;
      case 'patients':
        return <Patients />;
      case 'messages':
        return <Messages />;
      case 'payments':
        return <Payments />;
      case 'settings':
        return <SettingsComponent />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Helmet>
        <title>Admin Dashboard - HealthConnect Platform</title>
      </Helmet>

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
          {!isConnected && (
            <p className="text-sm text-red-500 mt-2">Connecting to server...</p>
          )}
        </div>
        <nav className="mt-4">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart },
            { id: 'appointments', label: 'Appointments', icon: Calendar },
            { id: 'patients', label: 'Patients', icon: Users },
            { id: 'messages', label: 'Messages', icon: MessageCircle },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full px-6 py-3 text-left hover:bg-gray-50 flex items-center gap-3 ${
                activeTab === item.id ? 'bg-gray-50 border-l-4 border-blue-500' : ''
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="w-full px-6 py-3 text-left text-red-600 hover:bg-red-50 mt-4 flex items-center gap-3"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}; 