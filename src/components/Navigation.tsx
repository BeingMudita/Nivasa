import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, User, Heart, Settings, ArrowLeft } from "lucide-react";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Survey', icon: Home },
    { path: '/profile-review', label: 'Profile', icon: User },
    { path: '/matches', label: 'Matches', icon: Heart },
    { path: '/admin', label: 'Admin', icon: Settings },
  ];

  const currentIndex = navItems.findIndex(item => item.path === location.pathname);
  const canGoBack = currentIndex > 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">Nivasa</span>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "gradient" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="flex items-center space-x-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Mobile Back Button */}
          <div className="md:hidden">
            {canGoBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(navItems[currentIndex - 1].path)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;