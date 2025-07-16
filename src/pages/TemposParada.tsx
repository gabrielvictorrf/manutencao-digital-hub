import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Search, Edit, Clock, AlertTriangle } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export interface TempoParada {
  id: string;
  ordemServicoId: string;
  ordemServicoNumero: string;
  maquinaId: string;
  maquinaNome: string;
  dataInicio: string;
  dataFim?: string;
  duracao?: number; // em minutos
  motivoParada: string;
  tipoParada: 'programada' | 'nao_programada' | 'emergencia';
  impactoProducao: 'baixo' | 'medio' | 'alto' | 'critico';
  responsavelRegistro: string;
  observacoes?: string;
  status: 'em_andamento' | 'finalizada';
  criadoEm: string;
}

// Motivos de parada comuns
const motivosParada = [
  'Manutenção Preventiva',
  'Manutenção Corretiva',
  'Falha Mecânica',
  'Falha Elétrica',
  'Falta de Material',
  'Troca de Ferramenta',
  'Setup/Preparação',
  'Limpeza',
  'Quebra de Máquina',
  'Falta de Operador',
  'Problema de Qualidade',
  'Outro'
];

// Simulando ordens de serviço disponíveis
const ordensDisponiveis = [
  { id: '1', numero: 'OS20240001', maquinaId: '1', maquinaNome: 'Torno CNC 001' },
  { id: '2', numero: 'OS20240002', maquinaId: '2', maquinaNome: 'Fresadora Universal 002' },
];

export default function TemposParada() {
  const { user, canEdit } = useAuth();
  const { toast } = useToast();
  const [temposParada, setTemposParada] = useState<TempoParada[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTempo, setEditingTempo] = useState<TempoParada | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    ordemServicoId: '',
    dataInicio: null as Date | null,
    horaInicio: '',
    dataFim: null as Date | null,
    horaFim: '',
    motivoParada: '',
    tipoParada: 'nao_programada' as 'programada' | 'nao_programada' | 'emergencia',
    impactoProducao: 'medio' as 'baixo' | 'medio' | 'alto' | 'critico',
    observacoes: '',
  });

  const resetForm = () => {
    setFormData({
      ordemServicoId: '',
      dataInicio: null,
      horaInicio: '',
      dataFim: null,
      horaFim: '',
      motivoParada: '',
      tipoParada: 'nao_programada',
      impactoProducao: 'medio',
      observacoes: '',
    });
    setEditingTempo(null);
    setShowForm(false);
  };

  const calcularDuracao = (inicio: Date, fim?: Date) => {
    if (!fim) return 0;
    return differenceInMinutes(fim, inicio);
  };

  const formatarDuracao = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    
    if (horas === 0) {
      return `${minutosRestantes}min`;
    }
    
    return `${horas}h ${minutosRestantes}min`;
  };

  const handleSave = () => {
    if (!formData.ordemServicoId || !formData.dataInicio || !formData.horaInicio || !formData.motivoParada) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const ordemSelecionada = ordensDisponiveis.find(o => o.id === formData.ordemServicoId);
    if (!ordemSelecionada) {
      toast({
        title: "Erro",
        description: "Ordem de serviço não encontrada",
        variant: "destructive",
      });
      return;
    }

    // Combinar data e hora
    const [horaInicio, minutoInicio] = formData.horaInicio.split(':').map(Number);
    const dataHoraInicio = new Date(formData.dataInicio);
    dataHoraInicio.setHours(horaInicio, minutoInicio, 0, 0);

    let dataHoraFim: Date | undefined;
    let duracao = 0;
    let status: 'em_andamento' | 'finalizada' = 'em_andamento';

    if (formData.dataFim && formData.horaFim) {
      const [horaFim, minutoFim] = formData.horaFim.split(':').map(Number);
      dataHoraFim = new Date(formData.dataFim);
      dataHoraFim.setHours(horaFim, minutoFim, 0, 0);
      
      if (dataHoraFim <= dataHoraInicio) {
        toast({
          title: "Erro",
          description: "Data/hora de fim deve ser posterior ao início",
          variant: "destructive",
        });
        return;
      }
      
      duracao = calcularDuracao(dataHoraInicio, dataHoraFim);
      status = 'finalizada';
    }

    if (editingTempo) {
      // Atualizar tempo existente
      setTemposParada(prev => prev.map(tempo => 
        tempo.id === editingTempo.id 
          ? {
              ...tempo,
              ordemServicoId: formData.ordemServicoId,
              ordemServicoNumero: ordemSelecionada.numero,
              maquinaId: ordemSelecionada.maquinaId,
              maquinaNome: ordemSelecionada.maquinaNome,
              dataInicio: dataHoraInicio.toISOString(),
              dataFim: dataHoraFim?.toISOString(),
              duracao,
              motivoParada: formData.motivoParada,
              tipoParada: formData.tipoParada,
              impactoProducao: formData.impactoProducao,
              observacoes: formData.observacoes,
              status,
            }
          : tempo
      ));
      
      toast({
        title: "Sucesso",
        description: "Tempo de parada atualizado com sucesso!",
      });
    } else {
      // Criar novo tempo de parada
      const novoTempo: TempoParada = {
        id: Date.now().toString(),
        ordemServicoId: formData.ordemServicoId,
        ordemServicoNumero: ordemSelecionada.numero,
        maquinaId: ordemSelecionada.maquinaId,
        maquinaNome: ordemSelecionada.maquinaNome,
        dataInicio: dataHoraInicio.toISOString(),
        dataFim: dataHoraFim?.toISOString(),
        duracao,
        motivoParada: formData.motivoParada,
        tipoParada: formData.tipoParada,
        impactoProducao: formData.impactoProducao,
        responsavelRegistro: user?.name || '',
        observacoes: formData.observacoes,
        status,
        criadoEm: new Date().toISOString(),
      };

      setTemposParada(prev => [...prev, novoTempo]);
      
      toast({
        title: "Sucesso",
        description: "Tempo de parada registrado com sucesso!",
      });
    }

    resetForm();
  };

  const handleEdit = (tempo: TempoParada) => {
    setEditingTempo(tempo);
    
    const dataInicio = new Date(tempo.dataInicio);
    const horaInicio = format(dataInicio, 'HH:mm');
    
    let dataFim: Date | null = null;
    let horaFim = '';
    
    if (tempo.dataFim) {
      dataFim = new Date(tempo.dataFim);
      horaFim = format(dataFim, 'HH:mm');
    }

    setFormData({
      ordemServicoId: tempo.ordemServicoId,
      dataInicio,
      horaInicio,
      dataFim,
      horaFim,
      motivoParada: tempo.motivoParada,
      tipoParada: tempo.tipoParada,
      impactoProducao: tempo.impactoProducao,
      observacoes: tempo.observacoes || '',
    });
    setShowForm(true);
  };

  const handleFinalizarParada = (tempo: TempoParada) => {
    const agora = new Date();
    const duracao = calcularDuracao(new Date(tempo.dataInicio), agora);
    
    setTemposParada(prev => prev.map(t => 
      t.id === tempo.id 
        ? {
            ...t,
            dataFim: agora.toISOString(),
            duracao,
            status: 'finalizada' as const,
          }
        : t
    ));
    
    toast({
      title: "Sucesso",
      description: "Parada finalizada com sucesso!",
    });
  };

  const filteredTempos = temposParada.filter(tempo =>
    tempo.ordemServicoNumero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tempo.maquinaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tempo.motivoParada.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoParadaColor = (tipo: string) => {
    switch (tipo) {
      case 'programada': return 'bg-blue-500';
      case 'nao_programada': return 'bg-orange-500';
      case 'emergencia': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getImpactoColor = (impacto: string) => {
    switch (impacto) {
      case 'critico': return 'bg-red-500';
      case 'alto': return 'bg-orange-500';
      case 'medio': return 'bg-yellow-500';
      case 'baixo': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Tempos de Parada</h2>
        {canEdit && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Registrar Parada
          </Button>
        )}
      </div>

      {/* Busca */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por OS, máquina ou motivo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Formulário */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingTempo ? 'Editar Tempo de Parada' : 'Registrar Tempo de Parada'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ordem">Ordem de Serviço *</Label>
              <Select value={formData.ordemServicoId} onValueChange={(value) => setFormData(prev => ({ ...prev, ordemServicoId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a ordem de serviço" />
                </SelectTrigger>
                <SelectContent>
                  {ordensDisponiveis.map(ordem => (
                    <SelectItem key={ordem.id} value={ordem.id}>
                      {ordem.numero} - {ordem.maquinaNome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data de Início *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dataInicio && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dataInicio ? (
                        format(formData.dataInicio, "PPP", { locale: ptBR })
                      ) : (
                        "Selecione uma data"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dataInicio || undefined}
                      onSelect={(date) => setFormData(prev => ({ ...prev, dataInicio: date || null }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="horaInicio">Hora de Início *</Label>
                <Input
                  id="horaInicio"
                  type="time"
                  value={formData.horaInicio}
                  onChange={(e) => setFormData(prev => ({ ...prev, horaInicio: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data de Fim</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dataFim && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dataFim ? (
                        format(formData.dataFim, "PPP", { locale: ptBR })
                      ) : (
                        "Selecione uma data"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dataFim || undefined}
                      onSelect={(date) => setFormData(prev => ({ ...prev, dataFim: date || null }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="horaFim">Hora de Fim</Label>
                <Input
                  id="horaFim"
                  type="time"
                  value={formData.horaFim}
                  onChange={(e) => setFormData(prev => ({ ...prev, horaFim: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="motivo">Motivo da Parada *</Label>
              <Select value={formData.motivoParada} onValueChange={(value) => setFormData(prev => ({ ...prev, motivoParada: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent>
                  {motivosParada.map(motivo => (
                    <SelectItem key={motivo} value={motivo}>
                      {motivo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipo">Tipo de Parada</Label>
                <Select value={formData.tipoParada} onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipoParada: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programada">Programada</SelectItem>
                    <SelectItem value="nao_programada">Não Programada</SelectItem>
                    <SelectItem value="emergencia">Emergência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="impacto">Impacto na Produção</Label>
                <Select value={formData.impactoProducao} onValueChange={(value: any) => setFormData(prev => ({ ...prev, impactoProducao: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixo">Baixo</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="alto">Alto</SelectItem>
                    <SelectItem value="critico">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Detalhes adicionais sobre a parada"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingTempo ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Tempos de Parada */}
      <div className="space-y-4">
        {filteredTempos.map(tempo => (
          <Card key={tempo.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {tempo.ordemServicoNumero}
                    </Badge>
                    <Badge className={cn("text-white", getTipoParadaColor(tempo.tipoParada))}>
                      {tempo.tipoParada.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className={cn("text-white", getImpactoColor(tempo.impactoProducao))}>
                      Impacto {tempo.impactoProducao.charAt(0).toUpperCase() + tempo.impactoProducao.slice(1)}
                    </Badge>
                    {tempo.status === 'em_andamento' && (
                      <Badge variant="destructive" className="animate-pulse">
                        <Clock className="h-3 w-3 mr-1" />
                        EM ANDAMENTO
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold">{tempo.motivoParada}</h3>
                  <p className="text-muted-foreground">Máquina: {tempo.maquinaNome}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Início:</span><br />
                      {format(new Date(tempo.dataInicio), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </div>
                    <div>
                      <span className="font-medium">Fim:</span><br />
                      {tempo.dataFim 
                        ? format(new Date(tempo.dataFim), "dd/MM/yyyy HH:mm", { locale: ptBR })
                        : 'Em andamento'
                      }
                    </div>
                    <div>
                      <span className="font-medium">Duração:</span><br />
                      {tempo.duracao ? formatarDuracao(tempo.duracao) : 'Calculando...'}
                    </div>
                    <div>
                      <span className="font-medium">Responsável:</span><br />
                      {tempo.responsavelRegistro}
                    </div>
                  </div>

                  {tempo.observacoes && (
                    <div className="mt-2">
                      <span className="font-medium text-sm">Observações:</span>
                      <p className="text-sm text-muted-foreground mt-1">{tempo.observacoes}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {canEdit && tempo.status === 'em_andamento' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFinalizarParada(tempo)}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Finalizar
                    </Button>
                  )}
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(tempo)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredTempos.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {temposParada.length === 0 
                ? "Nenhum tempo de parada registrado ainda."
                : "Nenhum registro encontrado com os critérios de busca."
              }
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}