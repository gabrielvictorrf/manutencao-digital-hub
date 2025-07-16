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
import { CalendarIcon, Plus, Search, Edit, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export interface OrdemServico {
  id: string;
  numeroRastreio: string;
  titulo: string;
  descricao: string;
  maquinaId: string;
  maquinaNome: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  status: 'aberta' | 'em_andamento' | 'concluida' | 'cancelada';
  tecnicoResponsavel: string;
  dataAbertura: string;
  dataInicio?: string;
  dataConclusao?: string;
  tempoParada?: number; // em minutos
  observacoes?: string;
  criadoPor: string;
}

// Simulando máquinas disponíveis
const maquinasDisponiveis = [
  { id: '1', nome: 'Torno CNC 001' },
  { id: '2', nome: 'Fresadora Universal 002' },
  { id: '3', nome: 'Furadeira Radial 003' },
  { id: '4', nome: 'Prensa Hidráulica 004' },
  { id: '5', nome: 'Compressor 005' },
];

export default function OrdensServico() {
  const { user, canEdit } = useAuth();
  const { toast } = useToast();
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOrdem, setEditingOrdem] = useState<OrdemServico | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    maquinaId: '',
    prioridade: 'media' as 'baixa' | 'media' | 'alta' | 'critica',
    tecnicoResponsavel: '',
    dataInicio: null as Date | null,
    observacoes: '',
  });

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
      prioridade: 'media',
      tecnicoResponsavel: '',
      dataInicio: null,
      observacoes: '',
    });
    setEditingOrdem(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!formData.titulo || !formData.descricao || !formData.maquinaId || !formData.tecnicoResponsavel) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const maquina = maquinasDisponiveis.find(m => m.id === formData.maquinaId);
    
    if (editingOrdem) {
      // Atualizar ordem existente
      setOrdens(prev => prev.map(ordem => 
        ordem.id === editingOrdem.id 
          ? {
              ...ordem,
              titulo: formData.titulo,
              descricao: formData.descricao,
              maquinaId: formData.maquinaId,
              maquinaNome: maquina?.nome || '',
              prioridade: formData.prioridade,
              tecnicoResponsavel: formData.tecnicoResponsavel,
              dataInicio: formData.dataInicio?.toISOString(),
              observacoes: formData.observacoes,
            }
          : ordem
      ));
      
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
        prioridade: formData.prioridade,
        status: 'aberta',
        tecnicoResponsavel: formData.tecnicoResponsavel,
        dataAbertura: new Date().toISOString(),
        dataInicio: formData.dataInicio?.toISOString(),
        observacoes: formData.observacoes,
        criadoPor: user?.name || '',
      };

      setOrdens(prev => [...prev, novaOrdem]);
      
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
      prioridade: ordem.prioridade,
      tecnicoResponsavel: ordem.tecnicoResponsavel,
      dataInicio: ordem.dataInicio ? new Date(ordem.dataInicio) : null,
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
        {canEdit && (
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
                    {maquinasDisponiveis.map(maquina => (
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
                <Input
                  id="tecnico"
                  value={formData.tecnicoResponsavel}
                  onChange={(e) => setFormData(prev => ({ ...prev, tecnicoResponsavel: e.target.value }))}
                  placeholder="Nome do técnico responsável"
                />
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
                      <span className="font-medium">Técnico:</span> {ordem.tecnicoResponsavel}
                    </div>
                    <div>
                      <span className="font-medium">Abertura:</span> {format(new Date(ordem.dataAbertura), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </div>
                    <div>
                      <span className="font-medium">Criado por:</span> {ordem.criadoPor}
                    </div>
                  </div>
                </div>
                
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(ordem)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
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