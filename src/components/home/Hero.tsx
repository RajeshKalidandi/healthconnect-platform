import { Button } from "@/components/ui/button";
import { Calendar, Phone, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export const Hero = () => {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] pt-16 pb-32 flex content-center items-center justify-center overflow-hidden" aria-label="Hero Section">
      <div className="absolute top-0 w-full h-full bg-gradient-to-br from-medical-50 to-white opacity-90"></div>
      
      <div className="container relative mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="items-center flex flex-wrap"
        >
          <div className="w-full lg:w-6/12 mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-medical-600 to-medical-800">
              Your Health, Our Priority
            </h1>
            <p className="mt-4 text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience healthcare reimagined. Book appointments, consult with doctors,
              and manage your health - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                className="group transition-all duration-300 hover:scale-105"
                aria-label="Book an appointment"
              >
                <Calendar className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Book Appointment
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="group transition-all duration-300 hover:scale-105"
                onClick={() => window.open("https://wa.me/1234567890", "_blank")}
                aria-label="Chat on WhatsApp"
              >
                <MessageCircle className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Chat on WhatsApp
              </Button>
            </div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex justify-center items-center gap-2 text-medical-600"
            >
              <Phone className="h-5 w-5 animate-bounce" />
              <a href="tel:+15551234567" className="text-lg font-semibold hover:text-medical-700 transition-colors">
                Call us: +1 (555) 123-4567
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      {/* Feature Cards */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="container absolute bottom-0 transform translate-y-1/2 px-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Calendar,
              title: "Easy Scheduling",
              description: "Book appointments at your convenience",
            },
            {
              icon: MessageCircle,
              title: "WhatsApp Support",
              description: "Get instant assistance via WhatsApp",
            },
            {
              icon: Phone,
              title: "24/7 Support",
              description: "Always here when you need us",
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.2 }}
              className="bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              whileHover={{ scale: 1.02 }}
            >
              <feature.icon className="h-10 w-10 text-medical-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};