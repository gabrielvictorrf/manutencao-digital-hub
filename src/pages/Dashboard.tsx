import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  Search,
  CalendarIcon,
  Check,
  ChevronsUpDown
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { OrdemServico } from '@/pages/OrdensServico';
import { useToast } from '@/hooks/use-toast';
import { format, isAfter, isBefore, isEqual, parseISO, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { user, canEdit } = useAuth();
  const { toast } = useToast();
  const { ordens, maquinas, temposParada, updateOrdem, tecnicos } = useData();

  // Estados para filtros de data
  const [dataInicio1, setDataInicio1] = useState<Date | undefined>();
  const [dataFim1, setDataFim1] = useState<Date | undefined>();
  const [dataInicio2, setDataInicio2] = useState<Date | undefined>();
  const [dataFim2, setDataFim2] = useState<Date | undefined>();
  
  // Estados para indicadores por equipamento
  const [dataInicio3, setDataInicio3] = useState<Date | undefined>();
  const [dataFim3, setDataFim3] = useState<Date | undefined>();
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState<string>('');
  const [openEquipamento, setOpenEquipamento] = useState(false);

  // Função para filtrar ordens por período
  const filtrarOrdensPorPeriodo = (ordens: OrdemServico[], inicio?: Date, fim?: Date) => {
    if (!inicio && !fim) return ordens;
    
    return ordens.filter(ordem => {
      const dataOrdem = parseISO(ordem.dataAbertura);
      const dataComparacao = startOfDay(dataOrdem);
      
      if (inicio && fim) {
        return (isEqual(dataComparacao, startOfDay(inicio)) || isAfter(dataComparacao, startOfDay(inicio))) &&
               (isEqual(dataComparacao, startOfDay(fim)) || isBefore(dataComparacao, endOfDay(fim)));
      } else if (inicio) {
        return isEqual(dataComparacao, startOfDay(inicio)) || isAfter(dataComparacao, startOfDay(inicio));
      } else if (fim) {
        return isEqual(dataComparacao, startOfDay(fim)) || isBefore(dataComparacao, endOfDay(fim));
      }
      return true;
    });
  };

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

  // Calcular métricas em tempo real com filtro 1
  const ordensFiltradas1 = filtrarOrdensPorPeriodo(ordens, dataInicio1, dataFim1);
  const ordensAbertas = ordensFiltradas1.filter(o => o.status === 'aberta');
  const ordensAndamento = ordensFiltradas1.filter(o => o.status === 'em_andamento');
  const ordensConcluidas = ordensFiltradas1.filter(o => o.status === 'concluida');
  const ordensCriticas = ordensFiltradas1.filter(o => o.prioridade === 'critica');

  // Calcular MTTR e MTBF baseado nos dados reais das ordens de serviço
  const ordensConcluídasComTempos = ordensConcluidas.filter(o => o.tempoReparoEfetivo && o.tempoReparoEfetivo > 0);
  const mttrMedio = ordensConcluídasComTempos.length > 0 
    ? (ordensConcluídasComTempos.reduce((acc, ordem) => acc + (ordem.tempoReparoEfetivo || 0), 0) / ordensConcluídasComTempos.length / 60).toFixed(1)
    : '0';

  // MTBF baseado no tempo entre falhas por máquina (com filtro 1)
  const ordensComParada = ordensFiltradas1.filter(o => o.tempoParadaTotal && o.tempoParadaTotal > 0 && o.status === 'concluida');
  const maquinasComOrdens = [...new Set(ordensComParada.map(o => o.maquinaId))];
  
  let mtbfMedio = '0';
  if (maquinasComOrdens.length > 0 && ordensComParada.length > 1) {
    // Calcular tempo médio entre falhas (assumindo 720 horas por mês por máquina)
    const horasOperacaoTotal = maquinasComOrdens.length * 720; // 30 dias * 24 horas
    const numeroFalhas = ordensComParada.length;
    mtbfMedio = (horasOperacaoTotal / numeroFalhas).toFixed(0);
  }

  // Calcular disponibilidade
  const maquinasOperando = maquinas.filter(m => m.status === 'operacional').length;
  const maquinasParadas = maquinas.filter(m => m.status === 'parada').length;
  const disponibilidade = maquinas.length > 0 
    ? ((maquinasOperando / maquinas.length) * 100).toFixed(1)
    : 100;

  // Top colaboradores por quantidade de ordens (com filtro 2)
  const ordensFiltradas2 = filtrarOrdensPorPeriodo(ordens, dataInicio2, dataFim2);
  const topColaboradores = tecnicos
    .map(tecnico => {
      const ordensDoTecnico = ordensFiltradas2.filter(o => o.tecnicoResponsavelNome === tecnico.nome && o.status === 'concluida');
      return {
        nome: tecnico.nome,
        ordens: ordensDoTecnico.length,
        especialidade: tecnico.especialidade,
        status: tecnico.status
      };
    })
    .sort((a, b) => b.ordens - a.ordens)
    .slice(0, 5);

  // Estatísticas por setor/especialidade (com filtro 2)
  const setoresStats = tecnicos.reduce((acc: Record<string, number>, tecnico) => {
    const ordensDoTecnico = ordensFiltradas2.filter(o => o.tecnicoResponsavelNome === tecnico.nome && o.status === 'concluida');
    if (!acc[tecnico.especialidade]) {
      acc[tecnico.especialidade] = 0;
    }
    acc[tecnico.especialidade] += ordensDoTecnico.length;
    return acc;
  }, {});

  // Indicadores por equipamento (com filtro 3)
  const ordensFiltradas3 = filtrarOrdensPorPeriodo(ordens, dataInicio3, dataFim3);
  const ordensDoEquipamento = equipamentoSelecionado 
    ? ordensFiltradas3.filter(o => o.maquinaId === equipamentoSelecionado)
    : [];

  // Calcular número de dias no período filtrado
  const calcularDiasPeriodo = () => {
    if (!dataInicio3 && !dataFim3) return 30; // Assume 30 dias se não há filtro
    if (dataInicio3 && dataFim3) {
      const diffTime = Math.abs(dataFim3.getTime() - dataInicio3.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 30; // Default para um mês
  };

  const diasPeriodo = calcularDiasPeriodo();

  // Calcular métricas do equipamento selecionado
  const ordensConcluídasEquipamento = ordensDoEquipamento.filter(o => o.status === 'concluida');
  const ordensComTempoEquipamento = ordensConcluídasEquipamento.filter(o => o.tempoReparoEfetivo && o.tempoReparoEfetivo > 0);
  
  const mttrEquipamento = ordensComTempoEquipamento.length > 0 
    ? (ordensComTempoEquipamento.reduce((acc, ordem) => acc + (ordem.tempoReparoEfetivo || 0), 0) / ordensComTempoEquipamento.length / 60).toFixed(1)
    : '0';

  const paradasEquipamento = ordensDoEquipamento.filter(o => o.tempoParadaTotal && o.tempoParadaTotal > 0).length;
  
  // MTBF baseado no período e horas de operação da máquina
  const equipamentoSelecionadoData = maquinas.find(m => m.id === equipamentoSelecionado);
  const horasOperacaoMaquina = equipamentoSelecionadoData?.horasOperacao || 720; // Horas por mês cadastradas
  const horasOperacaoPeriodo = (horasOperacaoMaquina / 30) * diasPeriodo; // Proporcional ao período
  
  const mtbfEquipamento = ordensConcluídasEquipamento.length > 0 
    ? (horasOperacaoPeriodo / ordensConcluídasEquipamento.length).toFixed(0)
    : horasOperacaoPeriodo.toFixed(0);

  const disponibilidadeEquipamento = equipamentoSelecionadoData 
    ? (equipamentoSelecionadoData.status === 'operacional' ? '100' : '0')
    : '0';

  // Horas operantes = Horas de operação do período - tempo total de parada (em horas)
  const tempoTotalParadaHoras = ordensDoEquipamento.reduce((acc, ordem) => acc + ((ordem.tempoParadaTotal || 0) / 60), 0);
  const horasOperantesEquipamento = (horasOperacaoPeriodo - tempoTotalParadaHoras).toFixed(1);

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

  const DateRangePicker = ({ 
    startDate, 
    endDate, 
    onStartDateChange, 
    onEndDateChange, 
    placeholder = "Filtrar por período" 
  }: {
    startDate?: Date;
    endDate?: Date;
    onStartDateChange: (date?: Date) => void;
    onEndDateChange: (date?: Date) => void;
    placeholder?: string;
  }) => (
    <div className="flex items-center space-x-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[140px] justify-start text-left font-normal",
              !startDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? format(startDate, "dd/MM/yy") : "Início"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={onStartDateChange}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[140px] justify-start text-left font-normal",
              !endDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {endDate ? format(endDate, "dd/MM/yy") : "Fim"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={onEndDateChange}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      
      {(startDate || endDate) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onStartDateChange(undefined);
            onEndDateChange(undefined);
          }}
        >
          Limpar
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral do sistema de manutenção
        </p>
      </div>

      {/* Filtro de Data para Ordens e Métricas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Filtrar por data:</span>
              <DateRangePicker
                startDate={dataInicio1}
                endDate={dataFim1}
                onStartDateChange={setDataInicio1}
                onEndDateChange={setDataFim1}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

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

      {/* Filtro de Data para Colaboradores e Setores */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Filtrar por data:</span>
              <DateRangePicker
                startDate={dataInicio2}
                endDate={dataFim2}
                onStartDateChange={setDataInicio2}
                onEndDateChange={setDataFim2}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Colaboradores e Setores Mais Atuantes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ordens de Serviço por Profissional</CardTitle>
            <CardDescription>
              Profissionais com mais ordens de serviço concluídas
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

      {/* Filtro de Data para Indicadores por Equipamento */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Filtrar por data:</span>
              <DateRangePicker
                startDate={dataInicio3}
                endDate={dataFim3}
                onStartDateChange={setDataInicio3}
                onEndDateChange={setDataFim3}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Indicadores por Equipamento */}
      <Card>
        <CardHeader>
          <CardTitle>Indicadores por Equipamento</CardTitle>
          <CardDescription>
            Métricas específicas de um equipamento selecionado
          </CardDescription>
          <div className="flex items-center space-x-4 mt-4">
            <span className="font-medium">Equipamento:</span>
            <Popover open={openEquipamento} onOpenChange={setOpenEquipamento}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openEquipamento}
                  className="w-[300px] justify-between"
                >
                  {equipamentoSelecionado
                    ? maquinas.find((maquina) => maquina.id === equipamentoSelecionado)?.nome
                    : "Selecione um equipamento..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Pesquisar equipamento..." />
                  <CommandList>
                    <CommandEmpty>Nenhum equipamento encontrado.</CommandEmpty>
                    <CommandGroup>
                      {maquinas.map((maquina) => (
                        <CommandItem
                          key={maquina.id}
                          value={maquina.nome}
                          onSelect={() => {
                            setEquipamentoSelecionado(maquina.id);
                            setOpenEquipamento(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              equipamentoSelecionado === maquina.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {maquina.nome} - {maquina.localizacao}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {equipamentoSelecionado && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEquipamentoSelecionado('');
                  setDataInicio3(undefined);
                  setDataFim3(undefined);
                }}
              >
                Limpar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {equipamentoSelecionado ? (
            <div className="grid gap-4 md:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">MTTR</CardTitle>
                  <Timer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mttrEquipamento}h</div>
                  <p className="text-xs text-muted-foreground">tempo reparo</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">MTBF</CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mtbfEquipamento}h</div>
                  <p className="text-xs text-muted-foreground">entre falhas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Paradas</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{paradasEquipamento}</div>
                  <p className="text-xs text-muted-foreground">no período</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disponibilidade</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{disponibilidadeEquipamento}%</div>
                  <p className="text-xs text-muted-foreground">atual</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Horas Operantes</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{horasOperantesEquipamento}h</div>
                  <p className="text-xs text-muted-foreground">no período</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Selecione um equipamento para visualizar os indicadores</p>
            </div>
          )}
        </CardContent>
      </Card>

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