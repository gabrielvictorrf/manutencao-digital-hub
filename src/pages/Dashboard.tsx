import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  ClipboardList, 
  Wrench, 
  Timer,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export default function Dashboard() {
  // Dados simulados - serão substituídos por dados reais do Supabase
  const stats = {
    totalTecnicos: 12,
    ordensAbertas: 8,
    maquinasOperando: 45,
    maquinasParadas: 3,
    mttrMedio: 2.5, // horas
    mtbfMedio: 168, // horas
    disponibilidade: 94.2, // %
    ordensCompletas: 156
  };

  const ordensRecentes = [
    { id: "OS-001", maquina: "Torno CNC 01", tecnico: "João Silva", status: "Em Andamento", prioridade: "Alta" },
    { id: "OS-002", maquina: "Fresadora 03", tecnico: "Maria Santos", status: "Pendente", prioridade: "Média" },
    { id: "OS-003", maquina: "Prensa 02", tecnico: "Carlos Lima", status: "Concluída", prioridade: "Baixa" },
    { id: "OS-004", maquina: "Solda 01", tecnico: "Ana Costa", status: "Em Andamento", prioridade: "Alta" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Concluída":
        return <Badge className="bg-green-100 text-green-800">Concluída</Badge>;
      case "Em Andamento":
        return <Badge className="bg-blue-100 text-blue-800">Em Andamento</Badge>;
      case "Pendente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPrioridadeBadge = (prioridade: string) => {
    switch (prioridade) {
      case "Alta":
        return <Badge variant="destructive">Alta</Badge>;
      case "Média":
        return <Badge className="bg-orange-100 text-orange-800">Média</Badge>;
      case "Baixa":
        return <Badge className="bg-gray-100 text-gray-800">Baixa</Badge>;
      default:
        return <Badge variant="secondary">{prioridade}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral do sistema de manutenção
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Técnicos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTecnicos}</div>
            <p className="text-xs text-muted-foreground">
              +2 desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ordens Abertas
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ordensAbertas}</div>
            <p className="text-xs text-muted-foreground">
              -3 desde ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              MTTR Médio
            </CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mttrMedio}h</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" />
              -15% este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              MTBF Médio
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mtbfMedio}h</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8% este mês
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Disponibilidade */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Disponibilidade dos Equipamentos</CardTitle>
            <CardDescription>
              Porcentagem de tempo operacional das máquinas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Operando</span>
                </div>
                <span className="text-sm text-muted-foreground">{stats.maquinasOperando} máquinas</span>
              </div>
              <Progress value={stats.disponibilidade} className="h-2" />
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{stats.disponibilidade}%</span>
                <div className="flex items-center space-x-2 text-red-500">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">{stats.maquinasParadas} paradas</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ordens Recentes */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ordens Recentes</CardTitle>
            <CardDescription>
              Últimas ordens de serviço do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ordensRecentes.map((ordem) => (
                <div key={ordem.id} className="flex items-center justify-between space-x-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{ordem.id}</p>
                    <p className="text-xs text-muted-foreground">{ordem.maquina}</p>
                    <p className="text-xs text-muted-foreground">{ordem.tecnico}</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    {getStatusBadge(ordem.status)}
                    {getPrioridadeBadge(ordem.prioridade)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}