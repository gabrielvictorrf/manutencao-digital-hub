import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Search, Edit, Eye, Clock, Trash2 } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { TempoParada } from '@/pages/TemposParada';

export interface OrdemServico {
  id: string;
  numeroRastreio: string;
  titulo: string;
  descricao: string;
  maquinaId: string;
  maquinaNome: string;
  requisitanteId: string;
  requisitanteNome: string;
  setorId: string;
  setorNome: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  status: 'aberta' | 'em_andamento' | 'concluida' | 'cancelada';
  tecnicoResponsavelId: string;
  tecnicoResponsavelNome: string;
  dataAbertura: string;
  dataInicio?: string;
  dataConclusao?: string;
  // Tempos detalhados para métricas
  horaQuebra?: string; // Quando a máquina quebrou
  horaInicioReparo?: string; // Quando o mecânico começou o reparo
  horaFimReparo?: string; // Quando o reparo foi concluído
  horaVoltaOperacao?: string; // Quando a máquina voltou a operar
  tempoParadaTotal?: number; // em minutos (da quebra até voltar a operar)
  tempoReparoEfetivo?: number; // em minutos (do início ao fim do reparo)
  observacoes?: string;
  criadoPor: string;
}


export default function OrdensServico() {
  const { user, canEdit, canCreate } = useAuth();
  const { toast } = useToast();
  const { ordens, maquinas, requisitantes, setores, tecnicos, addOrdem, updateOrdem, addTempoParada, temposParada, deleteOrdem } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingOrdem, setEditingOrdem] = useState<OrdemServico | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    maquinaId: '',
    requisitanteId: '',
    setorId: '',
    prioridade: 'media' as 'baixa' | 'media' | 'alta' | 'critica',
    tecnicoResponsavelId: '',
    dataInicio: null as Date | null,
    horaQuebra: '',
    horaInicioReparo: '',
    horaFimReparo: '',
    horaVoltaOperacao: '',
    observacoes: '',
  });

  // Função para criar automaticamente o tempo de parada
  const criarTempoParada = (ordem: OrdemServico) => {
    if (!ordem.horaQuebra) return;

    // Verificar se já existe um tempo de parada para esta ordem
    const tempoExistente = temposParada.find(t => t.ordemServicoId === ordem.id);
    if (tempoExistente) return; // Não criar duplicado

    const novoTempo: TempoParada = {
      id: `tp_${ordem.id}_${Date.now()}`,
      ordemServicoId: ordem.id,
      ordemServicoNumero: ordem.numeroRastreio,
      maquinaId: ordem.maquinaId,
      maquinaNome: ordem.maquinaNome,
      dataInicio: ordem.horaQuebra,
      dataFim: ordem.horaVoltaOperacao,
      duracao: ordem.tempoParadaTotal || 0,
      motivoParada: 'Manutenção Corretiva',
      tipoParada: 'nao_programada',
      impactoProducao: ordem.prioridade === 'critica' ? 'critico' : 
                      ordem.prioridade === 'alta' ? 'alto' : 'medio',
      responsavelRegistro: ordem.criadoPor,
      observacoes: `Tempo de parada gerado automaticamente da OS ${ordem.numeroRastreio}. Reparo efetivo: ${ordem.tempoReparoEfetivo || 0} minutos.`,
      status: ordem.horaVoltaOperacao ? 'finalizada' : 'em_andamento',
      criadoEm: new Date().toISOString(),
    };

    addTempoParada(novoTempo);
  };

  // Gerar número de rastreio único
  const gerarNumeroRastreio = () => {
    const ano = new Date().getFullYear();
    const proximoNumero = ordens.length + 1;
    return `OS${ano}${proximoNumero.toString().padStart(4, '0')}`;
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      maquinaId: '',
      requisitanteId: '',
      setorId: '',
      prioridade: 'media',
      tecnicoResponsavelId: '',
      dataInicio: null,
      horaQuebra: '',
      horaInicioReparo: '',
      horaFimReparo: '',
      horaVoltaOperacao: '',
      observacoes: '',
    });
    setEditingOrdem(null);
    setShowForm(false);
  };

  const handleDelete = (ordem: OrdemServico) => {
    if (!canEdit) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para excluir ordens",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir a ordem ${ordem.numeroRastreio}?`)) {
      deleteOrdem(ordem.id);
      
      toast({
        title: "Ordem excluída",
        description: `Ordem ${ordem.numeroRastreio} foi excluída com sucesso`,
      });
    }
  };

  // Função para calcular tempos automaticamente
  const calcularTempos = () => {
    if (!formData.horaQuebra) return { tempoParadaTotal: 0, tempoReparoEfetivo: 0 };

    const quebra = new Date(formData.horaQuebra);
    const volta = formData.horaVoltaOperacao ? new Date(formData.horaVoltaOperacao) : null;
    const inicioReparo = formData.horaInicioReparo ? new Date(formData.horaInicioReparo) : null;
    const fimReparo = formData.horaFimReparo ? new Date(formData.horaFimReparo) : null;

    const tempoParadaTotal = volta ? differenceInMinutes(volta, quebra) : 0;
    const tempoReparoEfetivo = (inicioReparo && fimReparo) ? differenceInMinutes(fimReparo, inicioReparo) : 0;

    return { tempoParadaTotal, tempoReparoEfetivo };
  };

  const handleSave = () => {
    if (!formData.titulo || !formData.descricao || !formData.maquinaId || !formData.requisitanteId || !formData.setorId || !formData.tecnicoResponsavelId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const maquina = maquinas.find(m => m.id === formData.maquinaId);
    const requisitante = requisitantes.find(r => r.id === formData.requisitanteId);
    const setor = setores.find(s => s.id === formData.setorId);
    const tecnico = tecnicos.find(t => t.id === formData.tecnicoResponsavelId);
    const { tempoParadaTotal, tempoReparoEfetivo } = calcularTempos();
    
    if (editingOrdem) {
      // Atualizar ordem existente
      const ordemAtualizada: Partial<OrdemServico> = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        maquinaId: formData.maquinaId,
        maquinaNome: maquina?.nome || '',
        requisitanteId: formData.requisitanteId,
        requisitanteNome: requisitante?.nome || '',
        setorId: formData.setorId,
        setorNome: setor?.nome || '',
        prioridade: formData.prioridade,
        tecnicoResponsavelId: formData.tecnicoResponsavelId,
        tecnicoResponsavelNome: tecnico?.nome || '',
        dataInicio: formData.dataInicio?.toISOString(),
        horaQuebra: formData.horaQuebra || undefined,
        horaInicioReparo: formData.horaInicioReparo || undefined,
        horaFimReparo: formData.horaFimReparo || undefined,
        horaVoltaOperacao: formData.horaVoltaOperacao || undefined,
        tempoParadaTotal,
        tempoReparoEfetivo,
        observacoes: formData.observacoes,
      };

      updateOrdem(editingOrdem.id, ordemAtualizada);
      
      // Criar/atualizar tempo de parada
      const ordemCompleta = { ...editingOrdem, ...ordemAtualizada } as OrdemServico;
      criarTempoParada(ordemCompleta);
      
      toast({
        title: "Sucesso",
        description: "Ordem de serviço atualizada com sucesso!",
      });
    } else {
      // Criar nova ordem
      const novaOrdem: OrdemServico = {
        id: Date.now().toString(),
        numeroRastreio: gerarNumeroRastreio(),
        titulo: formData.titulo,
        descricao: formData.descricao,
        maquinaId: formData.maquinaId,
        maquinaNome: maquina?.nome || '',
        requisitanteId: formData.requisitanteId,
        requisitanteNome: requisitante?.nome || '',
        setorId: formData.setorId,
        setorNome: setor?.nome || '',
        prioridade: formData.prioridade,
        status: 'aberta',
        tecnicoResponsavelId: formData.tecnicoResponsavelId,
        tecnicoResponsavelNome: tecnico?.nome || '',
        dataAbertura: new Date().toISOString(),
        dataInicio: formData.dataInicio?.toISOString(),
        horaQuebra: formData.horaQuebra || undefined,
        horaInicioReparo: formData.horaInicioReparo || undefined,
        horaFimReparo: formData.horaFimReparo || undefined,
        horaVoltaOperacao: formData.horaVoltaOperacao || undefined,
        tempoParadaTotal,
        tempoReparoEfetivo,
        observacoes: formData.observacoes,
        criadoPor: user?.name || '',
      };

      addOrdem(novaOrdem);
      
      // Criar tempo de parada automaticamente
      criarTempoParada(novaOrdem);
      
      toast({
        title: "Sucesso",
        description: `Ordem de serviço ${novaOrdem.numeroRastreio} criada com sucesso!`,
      });
    }

    resetForm();
  };

  const handleEdit = (ordem: OrdemServico) => {
    setEditingOrdem(ordem);
    setFormData({
      titulo: ordem.titulo,
      descricao: ordem.descricao,
      maquinaId: ordem.maquinaId,
      requisitanteId: ordem.requisitanteId || '',
      setorId: ordem.setorId || '',
      prioridade: ordem.prioridade,
      tecnicoResponsavelId: ordem.tecnicoResponsavelId || '',
      dataInicio: ordem.dataInicio ? new Date(ordem.dataInicio) : null,
      horaQuebra: ordem.horaQuebra || '',
      horaInicioReparo: ordem.horaInicioReparo || '',
      horaFimReparo: ordem.horaFimReparo || '',
      horaVoltaOperacao: ordem.horaVoltaOperacao || '',
      observacoes: ordem.observacoes || '',
    });
    setShowForm(true);
  };

  const filteredOrdens = ordens.filter(ordem =>
    ordem.numeroRastreio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.maquinaNome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'critica': return 'bg-red-500';
      case 'alta': return 'bg-orange-500';
      case 'media': return 'bg-yellow-500';
      case 'baixa': return 'bg-green-500';
      default: return 'bg-gray-500';
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h2>
        {canCreate && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Ordem
          </Button>
        )}
      </div>

      {/* Busca */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por número, título ou máquina..."
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
              {editingOrdem ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Título da ordem de serviço"
                />
              </div>
              
              <div>
                <Label htmlFor="maquina">Máquina *</Label>
                <Select value={formData.maquinaId} onValueChange={(value) => setFormData(prev => ({ ...prev, maquinaId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a máquina" />
                  </SelectTrigger>
                  <SelectContent>
                    {maquinas.map(maquina => (
                      <SelectItem key={maquina.id} value={maquina.id}>
                        {maquina.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição detalhada do problema ou serviço"
                rows={3}
              />
            </div>

            {/* Novos campos obrigatórios */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="requisitante">Requisitante *</Label>
                <Select value={formData.requisitanteId} onValueChange={(value) => setFormData(prev => ({ ...prev, requisitanteId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o requisitante" />
                  </SelectTrigger>
                  <SelectContent>
                    {requisitantes.map(requisitante => (
                      <SelectItem key={requisitante.id} value={requisitante.id}>
                        {requisitante.nome} ({requisitante.setor})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="setor">Setor *</Label>
                <Select value={formData.setorId} onValueChange={(value) => setFormData(prev => ({ ...prev, setorId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {setores.map(setor => (
                      <SelectItem key={setor.id} value={setor.id}>
                        {setor.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select value={formData.prioridade} onValueChange={(value: any) => setFormData(prev => ({ ...prev, prioridade: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tecnico">Técnico Responsável *</Label>
                <Select value={formData.tecnicoResponsavelId} onValueChange={(value) => setFormData(prev => ({ ...prev, tecnicoResponsavelId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o técnico" />
                  </SelectTrigger>
                  <SelectContent>
                    {tecnicos.map(tecnico => (
                      <SelectItem key={tecnico.id} value={tecnico.id}>
                        {tecnico.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data de Início Prevista</Label>
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
            </div>

            {/* Seção de Tempos de Parada para Métricas */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="h-4 w-4" />
                <Label className="text-base font-semibold">Tempos de Parada (Para Métricas MTTR/MTBF)</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="horaQuebra">Hora da Quebra/Problema</Label>
                  <Input
                    id="horaQuebra"
                    type="datetime-local"
                    value={formData.horaQuebra}
                    onChange={(e) => setFormData(prev => ({ ...prev, horaQuebra: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="horaInicioReparo">Hora Início do Reparo</Label>
                  <Input
                    id="horaInicioReparo"
                    type="datetime-local"
                    value={formData.horaInicioReparo}
                    onChange={(e) => setFormData(prev => ({ ...prev, horaInicioReparo: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="horaFimReparo">Hora Fim do Reparo</Label>
                  <Input
                    id="horaFimReparo"
                    type="datetime-local"
                    value={formData.horaFimReparo}
                    onChange={(e) => setFormData(prev => ({ ...prev, horaFimReparo: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="horaVoltaOperacao">Hora Volta à Operação</Label>
                  <Input
                    id="horaVoltaOperacao"
                    type="datetime-local"
                    value={formData.horaVoltaOperacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, horaVoltaOperacao: e.target.value }))}
                  />
                </div>
              </div>
              
              {/* Exibir tempos calculados */}
              {formData.horaQuebra && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Tempos Calculados:</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Tempo Parada Total:</span>{' '}
                      {calcularTempos().tempoParadaTotal > 0 ? `${Math.floor(calcularTempos().tempoParadaTotal / 60)}h ${calcularTempos().tempoParadaTotal % 60}min` : '--'}
                    </div>
                    <div>
                      <span className="font-medium">Tempo Reparo Efetivo:</span>{' '}
                      {calcularTempos().tempoReparoEfetivo > 0 ? `${Math.floor(calcularTempos().tempoReparoEfetivo / 60)}h ${calcularTempos().tempoReparoEfetivo % 60}min` : '--'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações adicionais"
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingOrdem ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Ordens */}
      <div className="space-y-4">
        {filteredOrdens.map(ordem => (
          <Card key={ordem.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="font-mono">
                      {ordem.numeroRastreio}
                    </Badge>
                    <Badge className={cn("text-white", getPrioridadeColor(ordem.prioridade))}>
                      {ordem.prioridade.charAt(0).toUpperCase() + ordem.prioridade.slice(1)}
                    </Badge>
                    <Badge className={cn("text-white", getStatusColor(ordem.status))}>
                      {ordem.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold">{ordem.titulo}</h3>
                  <p className="text-muted-foreground">{ordem.descricao}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Máquina:</span> {ordem.maquinaNome}
                    </div>
                    <div>
                      <span className="font-medium">Técnico:</span> {ordem.tecnicoResponsavelNome}
                    </div>
                    <div>
                      <span className="font-medium">Requisitante:</span> {ordem.requisitanteNome}
                    </div>
                    <div>
                      <span className="font-medium">Setor:</span> {ordem.setorNome}
                    </div>
                    <div>
                      <span className="font-medium">Abertura:</span> {format(new Date(ordem.dataAbertura), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </div>
                     <div>
                       <span className="font-medium">Criado por:</span> {ordem.criadoPor}
                     </div>
                   </div>
                   
                   {/* Mostrar tempos de parada se existirem */}
                   {(ordem.horaQuebra || ordem.tempoParadaTotal) && (
                     <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                       <p className="text-sm font-medium mb-2">Tempos de Parada:</p>
                       <div className="grid grid-cols-2 gap-2 text-sm">
                         {ordem.tempoParadaTotal && (
                           <div>
                             <span className="font-medium">Parada Total:</span> {Math.floor(ordem.tempoParadaTotal / 60)}h {ordem.tempoParadaTotal % 60}min
                           </div>
                         )}
                         {ordem.tempoReparoEfetivo && (
                           <div>
                             <span className="font-medium">Reparo Efetivo:</span> {Math.floor(ordem.tempoReparoEfetivo / 60)}h {ordem.tempoReparoEfetivo % 60}min
                           </div>
                         )}
                       </div>
                     </div>
                   )}
                 </div>
                
                  {canEdit && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(ordem)}
                        title="Editar ordem"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(ordem)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                        title="Excluir ordem"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredOrdens.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {ordens.length === 0 
                ? "Nenhuma ordem de serviço cadastrada ainda."
                : "Nenhuma ordem encontrada com os critérios de busca."
              }
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}