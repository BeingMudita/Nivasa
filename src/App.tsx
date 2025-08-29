import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

import Navigation from "./components/Navigation";
import Survey from "./pages/Survey";
import ProfileReview from "./pages/ProfileReview";
import Matches from "./pages/Matches";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import LoginSignup from "./pages/LoginSignup";
import ProtectedRoute from "./components/protectedRoute"; // ✅ import it

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen">
            <Navigation />
            <div className="pt-16">
              <Routes>
                <Route path="/" element={<Survey />} />
                <Route path="/auth" element={<LoginSignup />} />
                
                {/* Protected routes */}
                <Route
                  path="/profile-review"
                  element={
                    <ProtectedRoute>
                      <ProfileReview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/matches"
                  element={
                    <ProtectedRoute>
                      <Matches />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
