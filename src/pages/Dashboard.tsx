import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  ClipboardList, 
  Wrench, 
  Timer,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  User,
  Search
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { OrdemServico } from '@/pages/OrdensServico';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const { user, canEdit } = useAuth();
  const { toast } = useToast();
  const { ordens, maquinas, temposParada, updateOrdem, tecnicos } = useData();

  const handleStatusChange = (ordemId: string, novoStatus: OrdemServico['status']) => {
    if (!canEdit) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para alterar o status das ordens",
        variant: "destructive",
      });
      return;
    }

    const ordem = ordens.find(o => o.id === ordemId);
    if (!ordem) return;

    const ordemAtualizada: Partial<OrdemServico> = { status: novoStatus };
    
    if (novoStatus === 'em_andamento' && !ordem.dataInicio) {
      ordemAtualizada.dataInicio = new Date().toISOString();
    } else if (novoStatus === 'concluida' && !ordem.dataConclusao) {
      ordemAtualizada.dataConclusao = new Date().toISOString();
    }

    updateOrdem(ordemId, ordemAtualizada);

    toast({
      title: "Status atualizado",
      description: `Ordem ${ordem.numeroRastreio} marcada como ${getStatusLabel(novoStatus)}`,
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aberta': return 'Aberta';
      case 'em_andamento': return 'Em Andamento';
      case 'concluida': return 'Concluída';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberta': return 'bg-blue-500';
      case 'em_andamento': return 'bg-orange-500';
      case 'concluida': return 'bg-green-500';
      case 'cancelada': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'critica': return 'bg-red-500';
      case 'alta': return 'bg-orange-500';
      case 'media': return 'bg-yellow-500';
      case 'baixa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Calcular métricas em tempo real
  const ordensAbertas = ordens.filter(o => o.status === 'aberta');
  const ordensAndamento = ordens.filter(o => o.status === 'em_andamento');
  const ordensConcluidas = ordens.filter(o => o.status === 'concluida');
  const ordensCriticas = ordens.filter(o => o.prioridade === 'critica');

  // Calcular MTTR e MTBF baseado nos tempos de parada reais
  const temposReparoCompletos = temposParada.filter(tp => tp.duracao && tp.duracao > 0);
  const mttrMedio = temposReparoCompletos.length > 0 
    ? (temposReparoCompletos.reduce((acc, tp) => acc + (tp.duracao || 0), 0) / temposReparoCompletos.length / 60).toFixed(1)
    : '0';

  const temposParadaCompletos = temposParada.filter(tp => tp.status === 'finalizada');
  const mtbfMedio = temposParadaCompletos.length > 0 
    ? (24 * 30 / temposParadaCompletos.length).toFixed(0) // Estimativa baseada em 30 dias
    : '0';

  // Calcular disponibilidade
  const maquinasOperando = maquinas.filter(m => m.status === 'operacional').length;
  const maquinasParadas = maquinas.filter(m => m.status === 'parada').length;
  const disponibilidade = maquinas.length > 0 
    ? ((maquinasOperando / maquinas.length) * 100).toFixed(1)
    : 100;

  // Top colaboradores por quantidade de ordens (usando dados reais dos técnicos)
  const topColaboradores = tecnicos
    .map(tecnico => ({
      nome: tecnico.nome,
      ordens: tecnico.ordensCompletas,
      especialidade: tecnico.especialidade,
      status: tecnico.status
    }))
    .sort((a, b) => b.ordens - a.ordens)
    .slice(0, 5);

  // Estatísticas por setor/especialidade (usando dados reais dos técnicos)
  const setoresStats = tecnicos.reduce((acc: Record<string, number>, tecnico) => {
    if (!acc[tecnico.especialidade]) {
      acc[tecnico.especialidade] = 0;
    }
    acc[tecnico.especialidade] += tecnico.ordensCompletas;
    return acc;
  }, {});

  const OrdemCard = ({ ordem }: { ordem: OrdemServico }) => {
    const isUrgent = ordem.prioridade === 'critica';
    const isAberta = ordem.status === 'aberta';

    return (
      <Card className={`relative ${isUrgent ? 'border-red-500' : ''}`}>
        {isAberta && (
          <div className="absolute top-2 right-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        )}
        {isUrgent && (
          <div className="absolute top-2 left-2">
            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-sm font-medium">
                {ordem.numeroRastreio}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{ordem.titulo}</p>
            </div>
            <div className="flex flex-col space-y-1">
              <Badge className={`${getPrioridadeColor(ordem.prioridade)} text-white text-xs`}>
                {ordem.prioridade.toUpperCase()}
              </Badge>
              <Badge className={`${getStatusColor(ordem.status)} text-white text-xs`}>
                {getStatusLabel(ordem.status)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Settings className="w-3 h-3" />
              <span>{ordem.maquinaNome}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{ordem.requisitanteNome}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{format(new Date(ordem.dataAbertura), 'dd/MM/yy', { locale: ptBR })}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{ordem.tecnicoResponsavelNome}</span>
            </div>
          </div>

          {canEdit && (
            <div className="pt-2">
              <Select
                value={ordem.status}
                onValueChange={(value) => handleStatusChange(ordem.id, value as OrdemServico['status'])}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberta">Aberta</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral do sistema de manutenção
        </p>
      </div>

      {/* Status das Ordens - Cabeçalho */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abertas</CardTitle>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordensAbertas.length}</div>
            <p className="text-xs text-muted-foreground">
              {ordensAbertas.filter(o => o.prioridade === 'critica').length} críticas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordensAndamento.length}</div>
            <p className="text-xs text-muted-foreground">
              em execução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordensConcluidas.length}</div>
            <p className="text-xs text-muted-foreground">
              finalizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordensCriticas.length}</div>
            <p className="text-xs text-red-600">
              atenção urgente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas MTTR/MTBF e Disponibilidade */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MTTR Médio</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mttrMedio}h</div>
            <p className="text-xs text-muted-foreground">
              tempo reparo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MTBF Médio</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mtbfMedio}h</div>
            <p className="text-xs text-muted-foreground">
              entre falhas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibilidade</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{disponibilidade}%</div>
            <p className="text-xs text-muted-foreground">
              {maquinasOperando} operando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Máquinas Paradas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maquinasParadas}</div>
            <p className="text-xs text-red-600">
              necessitam atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Colaboradores e Setores Mais Atuantes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Colaboradores</CardTitle>
            <CardDescription>
              Técnicos com mais ordens de serviço
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topColaboradores.length > 0 ? (
                topColaboradores.map((colaborador: any, index) => (
                  <div key={colaborador.nome} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{colaborador.nome}</p>
                        <p className="text-xs text-muted-foreground">{colaborador.especialidade}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{colaborador.ordens} ordens</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma ordem registrada</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Setores da Manutenção</CardTitle>
            <CardDescription>
              Atividade por especialidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(setoresStats).length > 0 ? (
                Object.entries(setoresStats).map(([setor, quantidade]: [string, any]) => (
                  <div key={setor} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Wrench className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{setor}</span>
                    </div>
                    <Badge variant="outline">{quantidade} ordens</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma ordem registrada</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban das Ordens */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Abertas */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold">Abertas</h3>
            <Badge variant="secondary">{ordensAbertas.length}</Badge>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {ordensAbertas.slice(0, 10).map(ordem => (
              <OrdemCard key={ordem.id} ordem={ordem} />
            ))}
          </div>
        </div>

        {/* Em Andamento */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold">Em Andamento</h3>
            <Badge variant="secondary">{ordensAndamento.length}</Badge>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {ordensAndamento.slice(0, 10).map(ordem => (
              <OrdemCard key={ordem.id} ordem={ordem} />
            ))}
          </div>
        </div>

        {/* Concluídas */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold">Concluídas Recentes</h3>
            <Badge variant="secondary">{ordensConcluidas.length}</Badge>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {ordensConcluidas.slice(0, 10).map(ordem => (
              <OrdemCard key={ordem.id} ordem={ordem} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}