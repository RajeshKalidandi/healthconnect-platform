import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { Services } from "@/components/home/Services";
import { Features } from "@/components/home/Features";
import { About } from "@/components/home/About";
import { Contact } from "@/components/home/Contact";
import { BookAppointment } from "@/components/home/BookAppointment";
import { Helmet } from "react-helmet";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>HealthConnect Platform - Your Healthcare Connection</title>
        <meta name="description" content="Connect with healthcare providers, book appointments, and manage your health journey with HealthConnect Platform." />
        <meta name="keywords" content="healthcare, telemedicine, doctor appointments, health platform, medical services" />
        <meta property="og:title" content="HealthConnect Platform" />
        <meta property="og:description" content="Your comprehensive healthcare connection platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Hero />
            <Services />
            <Features />
            <About />
            <Contact />
            <BookAppointment />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;