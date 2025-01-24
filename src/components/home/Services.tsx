import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Microscope, UserRound, Brain, Heart, Laptop } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export const Services = () => {
  const services = [
    {
      icon: Stethoscope,
      title: "General Consultations",
      description: "Comprehensive medical check-ups and consultations for all age groups",
      link: "#book-appointment"
    },
    {
      icon: UserRound,
      title: "Specialist Visits",
      description: "Expert care from experienced specialists in various medical fields",
      link: "#specialists"
    },
    {
      icon: Microscope,
      title: "Diagnostics",
      description: "Advanced diagnostic services with quick and accurate results",
      link: "#diagnostics"
    },
    {
      icon: Brain,
      title: "Neurology",
      description: "Specialized care for neurological conditions and disorders",
      link: "#neurology"
    },
    {
      icon: Heart,
      title: "Cardiology",
      description: "Comprehensive heart care and cardiovascular treatments",
      link: "#cardiology"
    },
    {
      icon: Laptop,
      title: "Telemedicine",
      description: "Virtual consultations from the comfort of your home",
      link: "#telemedicine"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive healthcare services tailored to meet your needs with the highest standards of medical care.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {services.map((service, index) => (
            <motion.div key={index} variants={cardVariants}>
              <Card className="group relative overflow-hidden bg-white/60 backdrop-blur-sm hover:bg-white transition-all duration-300 border border-gray-100 hover:border-medical-200 hover:shadow-xl">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-medical-50 group-hover:bg-medical-100 transition-colors duration-300">
                      <service.icon className="h-12 w-12 text-medical-500 group-hover:text-medical-600 transition-colors duration-300" />
                    </div>
                  </div>
                  <CardTitle className="text-xl text-center group-hover:text-medical-600 transition-colors duration-300">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 mb-4">
                    {service.description}
                  </CardDescription>
                  <Button
                    variant="ghost"
                    className="text-medical-600 hover:text-medical-700 hover:bg-medical-50 transition-colors duration-300"
                    onClick={() => window.location.href = service.link}
                  >
                    Learn More
                  </Button>
                </CardContent>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-medical-200 rounded-lg transition-colors duration-300" />
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};