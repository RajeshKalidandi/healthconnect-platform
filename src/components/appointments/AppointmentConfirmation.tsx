import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface Appointment {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_date: string;
  appointment_time: string;
  reason: string;
  type: string;
  status: string;
  payment_status: string;
  payment_id: string;
  amount: number;
  demo_mode?: boolean;
}

const AppointmentConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/appointments/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch appointment details');
        }
        const data = await response.json();
        setAppointment(data);
      } catch (error) {
        console.error('Error fetching appointment:', error);
        toast.error('Failed to load appointment details');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Appointment Not Found</h1>
        <p className="text-gray-600 mb-8">The appointment you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/"
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-white px-6 py-4">
            <h1 className="text-2xl font-bold">Appointment Confirmed!</h1>
            {appointment.demo_mode && (
              <span className="inline-block bg-yellow-400 text-primary text-sm px-2 py-1 rounded mt-2">
                Demo Mode
              </span>
            )}
          </div>

          {/* Appointment Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Patient Information</h2>
                <div className="space-y-3">
                  <p className="text-gray-600">
                    <span className="font-medium">Name:</span> {appointment.patient_name}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span> {appointment.patient_email}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Phone:</span> {appointment.patient_phone}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Appointment Details</h2>
                <div className="space-y-3">
                  <p className="text-gray-600">
                    <span className="font-medium">Date:</span>{' '}
                    {new Date(appointment.appointment_date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Time:</span> {appointment.appointment_time}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Type:</span>{' '}
                    {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Reason:</span> {appointment.reason}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Information</h2>
              <div className="space-y-3">
                <p className="text-gray-600">
                  <span className="font-medium">Status:</span>{' '}
                  <span
                    className={`inline-block px-2 py-1 rounded text-sm ${
                      appointment.payment_status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {appointment.payment_status.charAt(0).toUpperCase() + appointment.payment_status.slice(1)}
                  </span>
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Payment ID:</span> {appointment.payment_id}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Amount:</span> ₹{appointment.amount}
                </p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Next Steps</h2>
              <div className="bg-blue-50 text-blue-700 p-4 rounded-lg">
                <ul className="list-disc list-inside space-y-2">
                  <li>A confirmation email has been sent to {appointment.patient_email}</li>
                  <li>You'll receive a WhatsApp reminder 24 hours before your appointment</li>
                  {appointment.type === 'video' && (
                    <li>Video consultation link will be sent 30 minutes before the appointment</li>
                  )}
                  <li>Please arrive 10 minutes before your scheduled time</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                to="/"
                className="inline-flex justify-center items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Return Home
              </Link>
              <button
                onClick={() => window.print()}
                className="inline-flex justify-center items-center px-6 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Print Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;
