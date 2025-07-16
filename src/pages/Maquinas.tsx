import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Settings, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { saveMaquinas, loadMaquinas } from '@/lib/storage';

export interface Maquina {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  fabricante: string;
  modelo: string;
  anoFabricacao: number;
  numeroSerie: string;
  localizacao: string;
  status: 'operacional' | 'manutencao' | 'parada' | 'inativa';
  criticidade: 'baixa' | 'media' | 'alta' | 'critica';
  ultimaManutencao?: string;
  proximaManutencao?: string;
  horasOperacao: number;
  especificacoesTecnicas?: string;
  observacoes?: string;
  criadoEm: string;
  criadoPor: string;
}

const tiposMaquina = [
  'Torno CNC',
  'Fresadora',
  'Furadeira',
  'Prensa',
  'Compressor',
  'Esteira',
  'Bomba',
  'Motor',
  'Gerador',
  'Outro'
];

export default function Maquinas() {
  const { user, canEdit } = useAuth();
  const { toast } = useToast();
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMaquina, setEditingMaquina] = useState<Maquina | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar dados do localStorage ao montar o componente
  useEffect(() => {
    const maquinasCarregadas = loadMaquinas();
    setMaquinas(maquinasCarregadas);
  }, []);

  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    fabricante: '',
    modelo: '',
    anoFabricacao: new Date().getFullYear(),
    numeroSerie: '',
    localizacao: '',
    criticidade: 'media' as 'baixa' | 'media' | 'alta' | 'critica',
    especificacoesTecnicas: '',
    observacoes: '',
  });

  const gerarCodigoMaquina = () => {
    const proximoNumero = maquinas.length + 1;
    return `MAQ${proximoNumero.toString().padStart(3, '0')}`;
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: '',
      fabricante: '',
      modelo: '',
      anoFabricacao: new Date().getFullYear(),
      numeroSerie: '',
      localizacao: '',
      criticidade: 'media',
      especificacoesTecnicas: '',
      observacoes: '',
    });
    setEditingMaquina(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!formData.nome || !formData.tipo || !formData.fabricante || !formData.localizacao) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (editingMaquina) {
      // Atualizar máquina existente
      const novasMaquinas = maquinas.map(maquina => 
        maquina.id === editingMaquina.id 
          ? {
              ...maquina,
              nome: formData.nome,
              tipo: formData.tipo,
              fabricante: formData.fabricante,
              modelo: formData.modelo,
              anoFabricacao: formData.anoFabricacao,
              numeroSerie: formData.numeroSerie,
              localizacao: formData.localizacao,
              criticidade: formData.criticidade,
              especificacoesTecnicas: formData.especificacoesTecnicas,
              observacoes: formData.observacoes,
            }
          : maquina
      );
      
      setMaquinas(novasMaquinas);
      saveMaquinas(novasMaquinas);
      
      toast({
        title: "Sucesso",
        description: "Máquina atualizada com sucesso!",
      });
    } else {
      // Criar nova máquina
      const novaMaquina: Maquina = {
        id: Date.now().toString(),
        codigo: gerarCodigoMaquina(),
        nome: formData.nome,
        tipo: formData.tipo,
        fabricante: formData.fabricante,
        modelo: formData.modelo,
        anoFabricacao: formData.anoFabricacao,
        numeroSerie: formData.numeroSerie,
        localizacao: formData.localizacao,
        status: 'operacional',
        criticidade: formData.criticidade,
        horasOperacao: 0,
        especificacoesTecnicas: formData.especificacoesTecnicas,
        observacoes: formData.observacoes,
        criadoEm: new Date().toISOString(),
        criadoPor: user?.name || '',
      };

      const novasMaquinas = [...maquinas, novaMaquina];
      setMaquinas(novasMaquinas);
      saveMaquinas(novasMaquinas);
      
      toast({
        title: "Sucesso",
        description: `Máquina ${novaMaquina.codigo} cadastrada com sucesso!`,
      });
    }

    resetForm();
  };

  const handleEdit = (maquina: Maquina) => {
    setEditingMaquina(maquina);
    setFormData({
      nome: maquina.nome,
      tipo: maquina.tipo,
      fabricante: maquina.fabricante,
      modelo: maquina.modelo,
      anoFabricacao: maquina.anoFabricacao,
      numeroSerie: maquina.numeroSerie,
      localizacao: maquina.localizacao,
      criticidade: maquina.criticidade,
      especificacoesTecnicas: maquina.especificacoesTecnicas || '',
      observacoes: maquina.observacoes || '',
    });
    setShowForm(true);
  };

  const filteredMaquinas = maquinas.filter(maquina =>
    maquina.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    maquina.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    maquina.fabricante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    maquina.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operacional': return 'bg-green-500';
      case 'manutencao': return 'bg-yellow-500';
      case 'parada': return 'bg-red-500';
      case 'inativa': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getCriticidadeColor = (criticidade: string) => {
    switch (criticidade) {
      case 'critica': return 'bg-red-500';
      case 'alta': return 'bg-orange-500';
      case 'media': return 'bg-yellow-500';
      case 'baixa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Gestão de Máquinas</h2>
        {canEdit && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Máquina
          </Button>
        )}
      </div>

      {/* Busca */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por código, nome, fabricante ou localização..."
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
              {editingMaquina ? 'Editar Máquina' : 'Nova Máquina'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome da Máquina *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Nome identificador da máquina"
                />
              </div>
              
              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposMaquina.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fabricante">Fabricante *</Label>
                <Input
                  id="fabricante"
                  value={formData.fabricante}
                  onChange={(e) => setFormData(prev => ({ ...prev, fabricante: e.target.value }))}
                  placeholder="Fabricante da máquina"
                />
              </div>
              
              <div>
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  value={formData.modelo}
                  onChange={(e) => setFormData(prev => ({ ...prev, modelo: e.target.value }))}
                  placeholder="Modelo da máquina"
                />
              </div>

              <div>
                <Label htmlFor="ano">Ano de Fabricação</Label>
                <Input
                  id="ano"
                  type="number"
                  value={formData.anoFabricacao}
                  onChange={(e) => setFormData(prev => ({ ...prev, anoFabricacao: parseInt(e.target.value) || new Date().getFullYear() }))}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numeroSerie">Número de Série</Label>
                <Input
                  id="numeroSerie"
                  value={formData.numeroSerie}
                  onChange={(e) => setFormData(prev => ({ ...prev, numeroSerie: e.target.value }))}
                  placeholder="Número de série da máquina"
                />
              </div>

              <div>
                <Label htmlFor="localizacao">Localização *</Label>
                <Input
                  id="localizacao"
                  value={formData.localizacao}
                  onChange={(e) => setFormData(prev => ({ ...prev, localizacao: e.target.value }))}
                  placeholder="Setor/Local onde está instalada"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="criticidade">Criticidade</Label>
              <Select value={formData.criticidade} onValueChange={(value: any) => setFormData(prev => ({ ...prev, criticidade: value }))}>
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
              <Label htmlFor="especificacoes">Especificações Técnicas</Label>
              <Textarea
                id="especificacoes"
                value={formData.especificacoesTecnicas}
                onChange={(e) => setFormData(prev => ({ ...prev, especificacoesTecnicas: e.target.value }))}
                placeholder="Detalhes técnicos da máquina"
                rows={3}
              />
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
                {editingMaquina ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Máquinas */}
      <div className="grid gap-4">
        {filteredMaquinas.map(maquina => (
          <Card key={maquina.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="font-mono">
                      {maquina.codigo}
                    </Badge>
                    <Badge className={cn("text-white", getStatusColor(maquina.status))}>
                      {maquina.status.toUpperCase()}
                    </Badge>
                    <Badge className={cn("text-white", getCriticidadeColor(maquina.criticidade))}>
                      {maquina.criticidade.charAt(0).toUpperCase() + maquina.criticidade.slice(1)}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold">{maquina.nome}</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Tipo:</span> {maquina.tipo}
                    </div>
                    <div>
                      <span className="font-medium">Fabricante:</span> {maquina.fabricante}
                    </div>
                    <div>
                      <span className="font-medium">Modelo:</span> {maquina.modelo}
                    </div>
                    <div>
                      <span className="font-medium">Ano:</span> {maquina.anoFabricacao}
                    </div>
                    <div>
                      <span className="font-medium">Localização:</span> {maquina.localizacao}
                    </div>
                    <div>
                      <span className="font-medium">Horas Op.:</span> {maquina.horasOperacao.toLocaleString()}h
                    </div>
                    {maquina.numeroSerie && (
                      <div className="col-span-2">
                        <span className="font-medium">Série:</span> {maquina.numeroSerie}
                      </div>
                    )}
                  </div>

                  {maquina.especificacoesTecnicas && (
                    <div className="mt-2">
                      <span className="font-medium text-sm">Especificações:</span>
                      <p className="text-sm text-muted-foreground mt-1">{maquina.especificacoesTecnicas}</p>
                    </div>
                  )}
                </div>
                
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(maquina)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredMaquinas.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {maquinas.length === 0 
                ? "Nenhuma máquina cadastrada ainda."
                : "Nenhuma máquina encontrada com os critérios de busca."
              }
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}