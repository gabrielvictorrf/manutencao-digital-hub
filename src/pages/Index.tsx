import { useState, useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { MainLayout } from "@/components/layout/MainLayout";
import { AppRouter } from "@/components/AppRouter";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [shouldRerender, setShouldRerender] = useState(0);

  const handleLoginSuccess = () => {
    setShouldRerender(prev => prev + 1);
  };

  const handleLogout = () => {
    setShouldRerender(prev => prev + 1);
  };

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <MainLayout onLogout={handleLogout}>
      <AppRouter />
    </MainLayout>
  );
};

export default Index;
