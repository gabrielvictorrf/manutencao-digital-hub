import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData, TipoEquipamento } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import MaquinaDialog from '@/components/dialogs/MaquinaDialog';

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


export default function Maquinas() {
  const { canEdit, user } = useAuth();
  const { 
    maquinas, 
    tiposEquipamento, addTipoEquipamento, updateTipoEquipamento, deleteTipoEquipamento,
    setores, addSetor, updateSetor, deleteSetor, setoresFabris
  } = useData();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaquina, setEditingMaquina] = useState<Maquina | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para tipos de equipamento
  const [tipoDialogOpen, setTipoDialogOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoEquipamento | null>(null);
  const [tipoFormData, setTipoFormData] = useState({
    nome: '',
    categoria: '',
    descricao: ''
  });
  
  // Estados para setores
  const [setorDialogOpen, setSetorDialogOpen] = useState(false);
  const [editingSetor, setEditingSetor] = useState<any>(null);
  const [setorFormData, setSetorFormData] = useState({
    nome: '',
    descricao: '',
    tipo: 'fabril' as 'fabril' | 'administrativo'
  });

  const handleNovaMaquina = () => {
    setEditingMaquina(null);
    setDialogOpen(true);
  };

  const handleEdit = (maquina: Maquina) => {
    setEditingMaquina(maquina);
    setDialogOpen(true);
  };

  const handleNovoTipo = () => {
    setEditingTipo(null);
    setTipoFormData({ nome: '', categoria: '', descricao: '' });
    setTipoDialogOpen(true);
  };

  const handleEditTipo = (tipo: TipoEquipamento) => {
    setEditingTipo(tipo);
    setTipoFormData({
      nome: tipo.nome,
      categoria: tipo.categoria,
      descricao: tipo.descricao || ''
    });
    setTipoDialogOpen(true);
  };

  const handleDeleteTipo = (tipo: TipoEquipamento) => {
    if (confirm(`Tem certeza que deseja excluir o tipo "${tipo.nome}"?`)) {
      deleteTipoEquipamento(tipo.id);
      toast({
        title: "Sucesso",
        description: "Tipo de equipamento excluído com sucesso!",
      });
    }
  };

  const handleSaveTipo = () => {
    if (!tipoFormData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome do tipo é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (editingTipo) {
      updateTipoEquipamento(editingTipo.id, {
        nome: tipoFormData.nome,
        categoria: tipoFormData.categoria,
        descricao: tipoFormData.descricao
      });
      toast({
        title: "Sucesso",
        description: "Tipo de equipamento atualizado com sucesso!",
      });
    } else {
      const novoTipo: TipoEquipamento = {
        id: Date.now().toString(),
        nome: tipoFormData.nome,
        categoria: tipoFormData.categoria,
        descricao: tipoFormData.descricao,
        criadoEm: new Date().toISOString(),
        criadoPor: user?.name || ''
      };
      addTipoEquipamento(novoTipo);
      toast({
        title: "Sucesso",
        description: "Tipo de equipamento cadastrado com sucesso!",
      });
    }

    setTipoDialogOpen(false);
  };

  // Handlers para setores
  React.useEffect(() => {
    // Adicionar setores fabris padrão se não existirem
    const setoresExistentes = setores.map(s => s.nome);
    const setoresFaltantes = setoresFabris.filter(nome => !setoresExistentes.includes(nome));
    
    setoresFaltantes.forEach(nome => {
      const novoSetor = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        nome,
        tipo: 'fabril' as 'fabril' | 'administrativo',
        criadoEm: new Date().toISOString(),
        criadoPor: 'Sistema'
      };
      addSetor(novoSetor);
    });
  }, [setores, addSetor, setoresFabris]);

  const handleNovoSetor = () => {
    setEditingSetor(null);
    setSetorFormData({ nome: '', descricao: '', tipo: 'fabril' });
    setSetorDialogOpen(true);
  };

  const handleEditSetor = (setor: any) => {
    setEditingSetor(setor);
    setSetorFormData({
      nome: setor.nome,
      descricao: setor.descricao || '',
      tipo: setor.tipo
    });
    setSetorDialogOpen(true);
  };

  const handleDeleteSetor = (setor: any) => {
    if (confirm(`Tem certeza que deseja excluir o setor "${setor.nome}"?`)) {
      deleteSetor(setor.id);
      toast({
        title: "Sucesso",
        description: "Setor excluído com sucesso!",
      });
    }
  };

  const handleSaveSetor = () => {
    if (!setorFormData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome do setor é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (editingSetor) {
      updateSetor(editingSetor.id, {
        nome: setorFormData.nome,
        descricao: setorFormData.descricao,
        tipo: setorFormData.tipo
      });
      toast({
        title: "Sucesso",
        description: "Setor atualizado com sucesso!",
      });
    } else {
      const novoSetor = {
        id: Date.now().toString(),
        nome: setorFormData.nome,
        descricao: setorFormData.descricao,
        tipo: setorFormData.tipo,
        criadoEm: new Date().toISOString(),
        criadoPor: user?.name || ''
      };
      addSetor(novoSetor);
      toast({
        title: "Sucesso",
        description: "Setor cadastrado com sucesso!",
      });
    }

    setSetorDialogOpen(false);
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
      </div>

      <Tabs defaultValue="maquinas" className="w-full">
        <TabsList>
          <TabsTrigger value="maquinas">Máquinas</TabsTrigger>
          <TabsTrigger value="tipos">Tipos de Equipamento</TabsTrigger>
          <TabsTrigger value="setores">Setores Fabris</TabsTrigger>
        </TabsList>

        <TabsContent value="maquinas" className="space-y-6">
          <div className="flex justify-between items-center">
            {canEdit && (
              <Button onClick={handleNovaMaquina}>
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

          <MaquinaDialog
            isOpen={dialogOpen}
            onClose={() => setDialogOpen(false)}
            maquina={editingMaquina}
          />

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
        </TabsContent>

        <TabsContent value="tipos" className="space-y-6">
          <div className="flex justify-between items-center">
            {canEdit && (
              <Button onClick={handleNovoTipo}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Tipo
              </Button>
            )}
          </div>

          {/* Dialog para Tipos */}
          <Dialog open={tipoDialogOpen} onOpenChange={setTipoDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTipo ? 'Editar Tipo de Equipamento' : 'Novo Tipo de Equipamento'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome do Tipo *</Label>
                  <Input
                    id="nome"
                    value={tipoFormData.nome}
                    onChange={(e) => setTipoFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome do tipo de equipamento"
                  />
                </div>
                
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input
                    id="categoria"
                    value={tipoFormData.categoria}
                    onChange={(e) => setTipoFormData(prev => ({ ...prev, categoria: e.target.value }))}
                    placeholder="Categoria do equipamento"
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={tipoFormData.descricao}
                    onChange={(e) => setTipoFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descrição do tipo de equipamento"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setTipoDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveTipo}>
                    {editingTipo ? 'Atualizar' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Lista de Tipos */}
          <div className="grid gap-4">
            {tiposEquipamento.map(tipo => (
              <Card key={tipo.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold">{tipo.nome}</h3>
                        {tipo.categoria && (
                          <Badge variant="outline">{tipo.categoria}</Badge>
                        )}
                      </div>
                      
                      {tipo.descricao && (
                        <p className="text-sm text-muted-foreground">{tipo.descricao}</p>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        Criado em {new Date(tipo.criadoEm).toLocaleDateString()} por {tipo.criadoPor}
                      </div>
                    </div>
                    
                    {canEdit && (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTipo(tipo)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTipo(tipo)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {tiposEquipamento.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Nenhum tipo de equipamento cadastrado ainda.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="setores" className="space-y-6">
          <div className="flex justify-between items-center">
            {canEdit && (
              <Button onClick={handleNovoSetor}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Setor
              </Button>
            )}
          </div>

          {/* Dialog para Setores */}
          <Dialog open={setorDialogOpen} onOpenChange={setSetorDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSetor ? 'Editar Setor' : 'Novo Setor'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nomeSetor">Nome do Setor *</Label>
                  <Input
                    id="nomeSetor"
                    value={setorFormData.nome}
                    onChange={(e) => setSetorFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome do setor"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tipoSetor">Tipo</Label>
                  <select
                    id="tipoSetor"
                    value={setorFormData.tipo}
                    onChange={(e) => setSetorFormData(prev => ({ ...prev, tipo: e.target.value as 'fabril' | 'administrativo' }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="fabril">Fabril</option>
                    <option value="administrativo">Administrativo</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="descricaoSetor">Descrição</Label>
                  <Textarea
                    id="descricaoSetor"
                    value={setorFormData.descricao}
                    onChange={(e) => setSetorFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descrição do setor"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setSetorDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveSetor}>
                    {editingSetor ? 'Atualizar' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Lista de Setores */}
          <div className="grid gap-4">
            {setores.map(setor => (
              <Card key={setor.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold">{setor.nome}</h3>
                        <Badge variant={setor.tipo === 'fabril' ? 'default' : 'secondary'}>
                          {setor.tipo === 'fabril' ? 'Fabril' : 'Administrativo'}
                        </Badge>
                      </div>
                      
                      {setor.descricao && (
                        <p className="text-sm text-muted-foreground">{setor.descricao}</p>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        Criado em {new Date(setor.criadoEm).toLocaleDateString()} por {setor.criadoPor}
                      </div>
                    </div>
                    
                    {canEdit && (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSetor(setor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSetor(setor)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {setores.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Nenhum setor cadastrado ainda.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}