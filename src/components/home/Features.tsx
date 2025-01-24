import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, MessageCircle, CreditCard, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export const Features = () => {
  const features = [
    {
      icon: Video,
      title: "Video Consultations",
      description: "Connect with our doctors remotely through secure video calls",
      benefits: ["24/7 availability", "No travel required", "HD video quality"],
      action: "Try Video Call"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Integration",
      description: "Quick assistance and updates through WhatsApp",
      benefits: ["Instant responses", "File sharing", "Voice messages"],
      action: "Chat Now"
    },
    {
      icon: CreditCard,
      title: "Easy Payments",
      description: "Secure and convenient payment options for all services",
      benefits: ["Multiple options", "Secure encryption", "Auto-billing"],
      action: "View Plans"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <section id="features" className="py-20 bg-gradient-to-br from-medical-50/30 via-white to-medical-50/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-medical-600 to-medical-800 bg-clip-text text-transparent mb-4">
            Why Choose Us
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Experience healthcare that's convenient, accessible, and patient-centered.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="group h-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-500 hover:shadow-xl border-medical-100/50">
                <CardHeader>
                  <div className="flex justify-center mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="p-4 rounded-2xl bg-medical-50 group-hover:bg-medical-100 transition-colors duration-300"
                    >
                      <feature.icon className="h-12 w-12 text-medical-500 group-hover:text-medical-600 transition-colors duration-300" />
                    </motion.div>
                  </div>
                  <CardTitle className="text-2xl text-center group-hover:text-medical-600 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-center text-gray-600">
                    {feature.description}
                  </CardDescription>
                  
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 * idx }}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <ArrowRight className="h-4 w-4 text-medical-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </motion.li>
                    ))}
                  </ul>

                  <div className="pt-4 text-center">
                    <Button
                      variant="ghost"
                      className="group/btn relative overflow-hidden text-medical-600 hover:text-medical-700 hover:bg-medical-50"
                    >
                      <span className="relative z-10">{feature.action}</span>
                      <motion.span
                        className="absolute inset-0 bg-medical-100 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                        initial={false}
                        whileHover={{ scale: 1.5 }}
                        transition={{ duration: 0.6 }}
                      />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};