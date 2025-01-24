import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const BookAppointment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
    consultationType: "in-person",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.phone || !formData.appointmentDate) {
        throw new Error("Please fill in all required fields");
      }

      // 1. Create appointment
      const appointmentResponse = await fetch("http://localhost:3000/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!appointmentResponse.ok) {
        const errorData = await appointmentResponse.json();
        throw new Error(errorData.details || 'Failed to create appointment');
      }

      const appointment = await appointmentResponse.json();

      // 2. Process payment (Demo or Real Razorpay)
      if (appointment.demo_mode) {
        toast.info(
          "DEMO MODE: Payment simulation" +
          "\n• Amount: ₹" + appointment.amount +
          "\n• Payment ID: " + appointment.payment_id +
          "\n• Status: Pending"
        );
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast.success(
          "DEMO MODE: Payment successful!" +
          "\n• Amount: ₹" + appointment.amount +
          "\n• Payment ID: " + appointment.payment_id
        );
      } else {
        // Real Razorpay integration
        const options = {
          key: process.env.RAZORPAY_KEY_ID,
          amount: appointment.amount * 100,
          currency: "INR",
          name: "HealthConnect",
          description: `Appointment on ${formData.appointmentDate}`,
          order_id: appointment.payment_id,
          handler: async (response: any) => {
            const paymentResponse = await fetch("http://localhost:3000/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                appointmentId: appointment.id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            if (!paymentResponse.ok) {
              throw new Error("Payment verification failed");
            }
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }

      // 3. Send notifications (Demo or Real)
      if (appointment.demo_mode) {
        toast.success(
          "DEMO MODE: Notifications sent!" +
          "\n• Email confirmation to: " + formData.email +
          "\n• WhatsApp update to: " + formData.phone +
          (appointment.type === 'video' ? "\n• Video consultation link will be sent soon" : "")
        );
      } else {
        await Promise.all([
          fetch("http://localhost:3000/api/notifications/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: formData.email,
              appointmentId: appointment.id,
            }),
          }),
          fetch("http://localhost:3000/api/notifications/whatsapp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: formData.phone,
              appointmentId: appointment.id,
            }),
          }),
        ]);
      }

      // 4. Show success and redirect
      toast.success("Appointment booked successfully!");
      navigate(`/appointments/${appointment.id}/confirmation`);
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Book an Appointment</CardTitle>
        <CardDescription>
          Fill in your details below to schedule an appointment with our healthcare professionals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="consultationType">Consultation Type</Label>
              <Select
                value={formData.consultationType}
                onValueChange={(value) => setFormData({ ...formData, consultationType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select consultation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-person">In-Person Visit</SelectItem>
                  <SelectItem value="video">Video Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="appointmentDate">Preferred Date</Label>
              <Input
                id="appointmentDate"
                type="date"
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div>
              <Label htmlFor="appointmentTime">Preferred Time</Label>
              <Input
                id="appointmentTime"
                type="time"
                value={formData.appointmentTime}
                onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason for Visit</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Please briefly describe your symptoms or reason for visit"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Booking..." : "Book Appointment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};