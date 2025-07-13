import { useLocation } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Pessoal from "@/pages/Pessoal";
import Relatorios from "@/pages/Relatorios";

export function AppRouter() {
  const location = useLocation();

  switch (location.pathname) {
    case "/":
    case "/dashboard":
      return <Dashboard />;
    case "/pessoal":
      return <Pessoal />;
    case "/relatorios":
      return <Relatorios />;
    case "/ordens":
      return (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h2>
          <p className="text-muted-foreground">Em desenvolvimento...</p>
        </div>
      );
    case "/maquinas":
      return (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Máquinas</h2>
          <p className="text-muted-foreground">Em desenvolvimento...</p>
        </div>
      );
    case "/paradas":
      return (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Tempos de Parada</h2>
          <p className="text-muted-foreground">Em desenvolvimento...</p>
        </div>
      );
    case "/indicadores":
      return (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Indicadores</h2>
          <p className="text-muted-foreground">Em desenvolvimento...</p>
        </div>
      );
    case "/configuracoes":
      return (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">Em desenvolvimento...</p>
        </div>
      );
    default:
      return <Dashboard />;
  }
}