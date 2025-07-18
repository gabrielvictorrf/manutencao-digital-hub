import { useLocation } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Pessoal from "@/pages/Pessoal";
import Relatorios from "@/pages/Relatorios";
import Configuracoes from "@/pages/Configuracoes";
import OrdensServico from "@/pages/OrdensServico";

import Maquinas from "@/pages/Maquinas";
import TemposParada from "@/pages/TemposParada";

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
      return <OrdensServico />;
    case "/maquinas":
      return <Maquinas />;
    case "/paradas":
      return <TemposParada />;
    case "/indicadores":
      return (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Indicadores</h2>
          <p className="text-muted-foreground">Em desenvolvimento...</p>
        </div>
      );
    case "/configuracoes":
      return <Configuracoes />;
    default:
      return <Dashboard />;
  }
}