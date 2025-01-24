import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail } from "lucide-react";

export const Contact = () => {
  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get in touch with us for any questions or concerns. We're here to help.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-6">
              <Input type="text" placeholder="Your Name" />
              <Input type="email" placeholder="Your Email" />
              <Input type="tel" placeholder="Your Phone" />
              <Textarea placeholder="Your Message" className="h-32" />
              <Button size="lg" className="w-full">Send Message</Button>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <MapPin className="h-6 w-6 text-medical-500" />
                  <p className="text-gray-600">123 Medical Center Drive, City, State</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone className="h-6 w-6 text-medical-500" />
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Mail className="h-6 w-6 text-medical-500" />
                  <p className="text-gray-600">contact@medicare.com</p>
                </div>
              </div>
            </div>
            <div className="h-64 bg-gray-200 rounded-lg">
              {/* Placeholder for Google Maps integration */}
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Map will be integrated here
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};