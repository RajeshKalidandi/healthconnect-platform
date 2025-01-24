import { Button } from "@/components/ui/button";

export const About = () => {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-gray-900">About MediCare</h2>
            <p className="text-lg text-gray-600">
              At MediCare, we're committed to providing exceptional healthcare services with a 
              patient-centered approach. Our team of experienced medical professionals ensures 
              that you receive the highest quality care in a comfortable environment.
            </p>
            <p className="text-lg text-gray-600">
              With over 10 years of service excellence, we've built a reputation for reliable, 
              accessible, and comprehensive healthcare solutions that meet the diverse needs 
              of our community.
            </p>
            <div className="pt-4">
              <Button size="lg">Learn More About Us</Button>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
              alt="Medical Team"
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};