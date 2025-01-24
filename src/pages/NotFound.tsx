import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | HealthConnect Platform</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-medical-50/50 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8 p-8"
        >
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-medical-600">404</h1>
            <h2 className="text-3xl font-semibold text-gray-900">Page Not Found</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Oops! The page you're looking for doesn't exist. It might have been moved or
              deleted.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="bg-medical-600 hover:bg-medical-700"
            >
              Return Home
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
}; 