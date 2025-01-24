import { Facebook, Instagram, Linkedin, Twitter, Lock } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

export const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-background border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">HealthConnect</h3>
            <p className="text-sm text-muted-foreground">
              Connecting you with quality healthcare services and professionals.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Telemedicine</li>
              <li>Medical Records</li>
              <li>Appointments</li>
              <li>Emergency Care</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>About Us</li>
              <li>Careers</li>
              <li>Press</li>
              <li>Contact</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Cookie Policy</li>
              <li>HIPAA Compliance</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t flex flex-col items-center space-y-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-medical-600 transition-colors"
            onClick={() => navigate('/admin-login')}
          >
            <Lock className="h-4 w-4 mr-2" />
            Admin Login
          </Button>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} HealthConnect Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}; 