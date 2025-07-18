import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Search, Clock, User, Settings } from 'lucide-react';
import { OrdemServico } from '@/pages/OrdensServico';
import { loadOrdens, saveOrdens } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function BacklogOrdens() {
  const { user, canEdit } = useAuth();
  const { toast } = useToast();
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [prioridadeFilter, setPrioridadeFilter] = useState('todos');

  useEffect(() => {
    const ordensCarregadas = loadOrdens();
    setOrdens(ordensCarregadas);
  }, []);

  const handleStatusChange = (ordemId: string, novoStatus: OrdemServico['status']) => {
    if (!canEdit) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para alterar o status das ordens",
        variant: "destructive",
      });
      return;
    }

    const ordensAtualizadas = ordens.map(ordem => {
      if (ordem.id === ordemId) {
        const ordemAtualizada = { ...ordem, status: novoStatus };
        
        // Atualizar datas conforme o status
        if (novoStatus === 'em_andamento' && !ordem.dataInicio) {
          ordemAtualizada.dataInicio = new Date().toISOString();
        } else if (novoStatus === 'concluida' && !ordem.dataConclusao) {
          ordemAtualizada.dataConclusao = new Date().toISOString();
        }
        
        return ordemAtualizada;
      }
      return ordem;
    });

    setOrdens(ordensAtualizadas);
    saveOrdens(ordensAtualizadas);

    toast({
      title: "Status atualizado",
      description: `Ordem ${ordens.find(o => o.id === ordemId)?.numeroRastreio} marcada como ${getStatusLabel(novoStatus)}`,
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

  const filteredOrdens = ordens.filter(ordem => {
    const matchSearch = ordem.numeroRastreio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.maquinaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.requisitanteNome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.tecnicoResponsavelNome?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = statusFilter === 'todos' || ordem.status === statusFilter;
    const matchPrioridade = prioridadeFilter === 'todos' || ordem.prioridade === prioridadeFilter;
    
    return matchSearch && matchStatus && matchPrioridade;
  });

  // Agrupar ordens por status
  const ordensAbertas = filteredOrdens.filter(o => o.status === 'aberta');
  const ordensAndamento = filteredOrdens.filter(o => o.status === 'em_andamento');
  const ordensConcluidas = filteredOrdens.filter(o => o.status === 'concluida');

  const OrdemCard = ({ ordem }: { ordem: OrdemServico }) => {
    const isUrgent = ordem.prioridade === 'critica';
    const isAberta = ordem.status === 'aberta';

    return (
      <Card className={`relative ${isUrgent ? 'border-red-500' : ''}`}>
        {/* Indicadores visuais piscantes */}
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
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Backlog de Ordens</h2>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ordens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="aberta">Abertas</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluida">Concluídas</SelectItem>
            <SelectItem value="cancelada">Canceladas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="critica">Crítica</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abertas</CardTitle>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordensAbertas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordensAndamento.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordensConcluidas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredOrdens.filter(o => o.prioridade === 'critica').length}
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
            {ordensAbertas.map(ordem => (
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
            {ordensAndamento.map(ordem => (
              <OrdemCard key={ordem.id} ordem={ordem} />
            ))}
          </div>
        </div>

        {/* Concluídas */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold">Concluídas</h3>
            <Badge variant="secondary">{ordensConcluidas.length}</Badge>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {ordensConcluidas.map(ordem => (
              <OrdemCard key={ordem.id} ordem={ordem} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}