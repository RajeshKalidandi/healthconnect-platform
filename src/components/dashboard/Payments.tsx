import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  createdAt: string;
  patient: {
    name: string;
  };
  appointment: {
    type: string;
  };
}

export const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    successfulPayments: 0,
    failedPayments: 0
  });

  // Demo data generator
  const generateDemoPayments = () => {
    const demoPayments: Payment[] = [];
    const types = ['in-person', 'video'];
    const statuses: ('pending' | 'completed' | 'failed')[] = ['pending', 'completed', 'failed'];
    const methods = ['card', 'upi', 'netbanking'];
    
    // Generate last 30 days of payments
    for (let i = 0; i < 30; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const amount = Math.floor(Math.random() * 1000) + 500; // Random amount between 500-1500
      const payment: Payment = {
        id: `demo_pay_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        status,
        paymentMethod: methods[Math.floor(Math.random() * methods.length)],
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        patient: {
          name: `Demo Patient ${i + 1}`
        },
        appointment: {
          type: types[Math.floor(Math.random() * types.length)]
        }
      };
      demoPayments.push(payment);
    }
    return demoPayments;
  };

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        toast.info("DEMO MODE: Loading demo payment data (Razorpay API not integrated yet)");
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate and set demo payments
        const demoPayments = generateDemoPayments();
        setPayments(demoPayments);

        // Calculate demo stats
        const stats = demoPayments.reduce((acc, payment) => ({
          totalRevenue: acc.totalRevenue + (payment.status === 'completed' ? payment.amount : 0),
          pendingAmount: acc.pendingAmount + (payment.status === 'pending' ? payment.amount : 0),
          successfulPayments: acc.successfulPayments + (payment.status === 'completed' ? 1 : 0),
          failedPayments: acc.failedPayments + (payment.status === 'failed' ? 1 : 0)
        }), {
          totalRevenue: 0,
          pendingAmount: 0,
          successfulPayments: 0,
          failedPayments: 0
        });

        setStats(stats);
        
        toast.success(
          "DEMO MODE: Payment dashboard loaded!" +
          "\nNote: In production, this will show real Razorpay transaction data"
        );
      } catch (error) {
        console.error('Error fetching payments:', error);
        toast.error('Failed to fetch payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(payment =>
    payment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefund = async (paymentId: string) => {
    try {
      toast.info("DEMO MODE: Processing refund (Razorpay API not integrated yet)");
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(
        "DEMO MODE: Refund processed!" +
        "\nNote: In production, this will:" +
        "\n• Process real refund via Razorpay" +
        "\n• Send confirmation email via SendGrid" +
        "\n• Send WhatsApp update via Twilio"
      );
    } catch (error) {
      toast.error("Failed to process refund");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Payment Statistics (Demo)</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded">
            <h3 className="text-sm font-medium text-green-600">Total Revenue</h3>
            <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded">
            <h3 className="text-sm font-medium text-yellow-600">Pending Amount</h3>
            <p className="text-2xl font-bold">₹{stats.pendingAmount.toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="text-sm font-medium text-blue-600">Successful Payments</h3>
            <p className="text-2xl font-bold">{stats.successfulPayments}</p>
          </div>
          <div className="bg-red-50 p-4 rounded">
            <h3 className="text-sm font-medium text-red-600">Failed Payments</h3>
            <p className="text-2xl font-bold">{stats.failedPayments}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Payment History (Demo)</h2>
          <Input
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-mono">{payment.id}</TableCell>
                <TableCell>{payment.patient.name}</TableCell>
                <TableCell>₹{payment.amount}</TableCell>
                <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-sm ${
                    payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {payment.status}
                  </span>
                </TableCell>
                <TableCell>{format(new Date(payment.createdAt), 'PPp')}</TableCell>
                <TableCell>
                  {payment.status === 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRefund(payment.id)}
                    >
                      Refund
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};