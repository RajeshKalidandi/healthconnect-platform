import { useState, useEffect } from "react";
import { format, addDays, isSunday, setHours, setMinutes, isAfter, isBefore } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/config";

// Generate time slots from 9 AM to 8 PM with 30-minute intervals
const generateTimeSlots = () => {
  const slots = [];
  const startTime = setHours(setMinutes(new Date(), 0), 9); // 9 AM
  const endTime = setHours(setMinutes(new Date(), 0), 20); // 8 PM

  let currentTime = startTime;
  while (isBefore(currentTime, endTime)) {
    slots.push(format(currentTime, "HH:mm"));
    currentTime = addMinutes(currentTime, 30);
  }
  return slots;
};

const addMinutes = (date: Date, minutes: number) => {
  return new Date(date.getTime() + minutes * 60000);
};

interface BookedSlot {
  date: string;
  time: string;
}

export const BookAppointment = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);

  const timeSlots = generateTimeSlots();

  useEffect(() => {
    fetchBookedSlots();
  }, [date]);

  const fetchBookedSlots = async () => {
    if (!date) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/appointments/slots?date=${format(date, 'yyyy-MM-dd')}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch booked slots');
      }

      const data = await response.json();
      setBookedSlots(data.slots || []);
    } catch (error) {
      console.error('Error fetching booked slots:', error);
      toast.error("Failed to load available time slots");
    }
  };

  const isSlotBooked = (time: string) => {
    if (!date) return false;
    return bookedSlots.some(
      slot => slot.date === format(date, 'yyyy-MM-dd') && slot.time === time
    );
  };

  const isDateDisabled = (date: Date) => {
    // Disable Sundays and past dates
    return isSunday(date) || isBefore(date, new Date());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          appointmentDate: format(date!, 'yyyy-MM-dd'),
          appointmentTime: selectedTime,
          consultationType: 'in-person'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book appointment');
      }

      const data = await response.json();
      toast.success("Appointment booked successfully!");
      // Reset form
      setFormData({ name: "", email: "", phone: "", reason: "" });
      setSelectedTime("");
      setDate(new Date());
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="book-appointment" className="min-h-screen py-16 bg-gradient-to-br from-medical-50/50 to-white">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Book an Appointment</CardTitle>
            <CardDescription>
              Choose your preferred date and time slot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Select Date</Label>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={isDateDisabled}
                      className="rounded-md border"
                    />
                  </div>
                  <div>
                    <Label>Select Time</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          type="button"
                          variant={selectedTime === time ? "default" : "outline"}
                          className={`${
                            isSlotBooked(time)
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : selectedTime === time
                              ? "bg-medical-600 text-white"
                              : "hover:bg-medical-50"
                          }`}
                          onClick={() => setSelectedTime(time)}
                          disabled={isSlotBooked(time)}
                        >
                          {time}
                          {isSlotBooked(time) && " (Booked)"}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

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
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason for Visit</Label>
                    <Input
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button
                  type="submit"
                  className="w-full md:w-auto bg-medical-600 hover:bg-medical-700"
                  disabled={loading || !date || !selectedTime}
                >
                  {loading ? "Booking..." : "Book Appointment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 