import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData, setoresFabris } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Setor {
  id: string;
  nome: string;
  descricao?: string;
  tipo: 'fabril' | 'administrativo';
  criadoEm: string;
  criadoPor: string;
}

export default function Setores() {
  const { canEdit } = useAuth();
  const { user } = useAuth();
  const { setores, addSetor, updateSetor, deleteSetor } = useData();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSetor, setEditingSetor] = useState<Setor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: 'fabril' as 'fabril' | 'administrativo'
  });

  React.useEffect(() => {
    // Adicionar setores fabris padrão se não existirem
    const setoresExistentes = setores.map(s => s.nome);
    const setoresFaltantes = setoresFabris.filter(nome => !setoresExistentes.includes(nome));
    
    setoresFaltantes.forEach(nome => {
      const novoSetor: Setor = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        nome,
        tipo: 'fabril',
        criadoEm: new Date().toISOString(),
        criadoPor: 'Sistema'
      };
      addSetor(novoSetor);
    });
  }, [setores, addSetor]);

  const handleNovoSetor = () => {
    setEditingSetor(null);
    setFormData({ nome: '', descricao: '', tipo: 'fabril' });
    setDialogOpen(true);
  };

  const handleEdit = (setor: Setor) => {
    setEditingSetor(setor);
    setFormData({
      nome: setor.nome,
      descricao: setor.descricao || '',
      tipo: setor.tipo
    });
    setDialogOpen(true);
  };

  const handleDelete = (setor: Setor) => {
    if (confirm(`Tem certeza que deseja excluir o setor "${setor.nome}"?`)) {
      deleteSetor(setor.id);
      toast({
        title: "Sucesso",
        description: "Setor excluído com sucesso!",
      });
    }
  };

  const handleSave = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome do setor é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (editingSetor) {
      updateSetor(editingSetor.id, {
        nome: formData.nome,
        descricao: formData.descricao,
        tipo: formData.tipo
      });
      toast({
        title: "Sucesso",
        description: "Setor atualizado com sucesso!",
      });
    } else {
      const novoSetor: Setor = {
        id: Date.now().toString(),
        nome: formData.nome,
        descricao: formData.descricao,
        tipo: formData.tipo,
        criadoEm: new Date().toISOString(),
        criadoPor: user?.name || ''
      };
      addSetor(novoSetor);
      toast({
        title: "Sucesso",
        description: "Setor cadastrado com sucesso!",
      });
    }

    setDialogOpen(false);
  };

  const filteredSetores = setores.filter(setor =>
    setor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    setor.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Gestão de Setores</h2>
        {canEdit && (
          <Button onClick={handleNovoSetor}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Setor
          </Button>
        )}
      </div>

      {/* Busca */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou tipo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSetor ? 'Editar Setor' : 'Novo Setor'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome do Setor *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome do setor"
              />
            </div>
            
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <select
                id="tipo"
                value={formData.tipo}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as 'fabril' | 'administrativo' }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="fabril">Fabril</option>
                <option value="administrativo">Administrativo</option>
              </select>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição do setor"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingSetor ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lista de Setores */}
      <div className="grid gap-4">
        {filteredSetores.map(setor => (
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
                      onClick={() => handleEdit(setor)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(setor)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredSetores.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {setores.length === 0 
                ? "Nenhum setor cadastrado ainda."
                : "Nenhum setor encontrado com os critérios de busca."
              }
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}