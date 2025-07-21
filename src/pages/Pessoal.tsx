import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { Plus, Edit, Trash2, User, Clock, Wrench } from "lucide-react";

interface Tecnico {
  id: string;
  nome: string;
  especialidade: string;
  nivel: string;
  horasTrabalhadasMes: number;
  ordensCompletas: number;
  status: "Ativo" | "Inativo" | "Férias";
}

export default function Pessoal() {
  const { toast } = useToast();
  const { tecnicos, addTecnico, updateTecnico, deleteTecnico } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTecnico, setEditingTecnico] = useState<Tecnico | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    especialidade: "",
    nivel: "",
    status: "Ativo" as "Ativo" | "Inativo" | "Férias"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTecnico) {
      updateTecnico(editingTecnico.id, formData);
      toast({
        title: "Técnico atualizado",
        description: "Os dados do técnico foram atualizados com sucesso.",
      });
    } else {
      const novoTecnico = {
        id: Date.now().toString(),
        ...formData,
        horasTrabalhadasMes: 0,
        ordensCompletas: 0
      };
      addTecnico(novoTecnico);
      toast({
        title: "Técnico cadastrado",
        description: "Novo técnico foi adicionado ao sistema.",
      });
    }

    setDialogOpen(false);
    setEditingTecnico(null);
    setFormData({ nome: "", especialidade: "", nivel: "", status: "Ativo" });
  };

  const handleEdit = (tecnico: Tecnico) => {
    setEditingTecnico(tecnico);
    setFormData({
      nome: tecnico.nome,
      especialidade: tecnico.especialidade,
      nivel: tecnico.nivel,
      status: tecnico.status
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteTecnico(id);
    toast({
      title: "Técnico removido",
      description: "O técnico foi removido do sistema.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Ativo":
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case "Férias":
        return <Badge className="bg-blue-100 text-blue-800">Férias</Badge>;
      case "Inativo":
        return <Badge variant="secondary">Inativo</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getNivelBadge = (nivel: string) => {
    switch (nivel) {
      case "Sênior":
        return <Badge className="bg-purple-100 text-purple-800">Sênior</Badge>;
      case "Pleno":
        return <Badge className="bg-orange-100 text-orange-800">Pleno</Badge>;
      case "Júnior":
        return <Badge className="bg-gray-100 text-gray-800">Júnior</Badge>;
      default:
        return <Badge variant="secondary">{nivel}</Badge>;
    }
  };

  const totalHorasEquipe = tecnicos.reduce((acc, t) => acc + t.horasTrabalhadasMes, 0);
  const mediaOrdensCompletas = tecnicos.length > 0 
    ? Math.round(tecnicos.reduce((acc, t) => acc + t.ordensCompletas, 0) / tecnicos.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Pessoal</h2>
          <p className="text-muted-foreground">
            Gerencie sua equipe de manutenção e acompanhe as horas trabalhadas
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTecnico(null);
              setFormData({ nome: "", especialidade: "", nivel: "", status: "Ativo" });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Técnico
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTecnico ? "Editar Técnico" : "Novo Técnico"}
              </DialogTitle>
              <DialogDescription>
                {editingTecnico ? "Atualize os dados do técnico" : "Adicione um novo técnico à equipe"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="especialidade">Especialidade</Label>
                <Select value={formData.especialidade} onValueChange={(value) => setFormData(prev => ({ ...prev, especialidade: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mecânica">Mecânica</SelectItem>
                    <SelectItem value="Elétrica">Elétrica</SelectItem>
                    <SelectItem value="Hidráulica">Hidráulica</SelectItem>
                    <SelectItem value="Soldagem">Soldagem</SelectItem>
                    <SelectItem value="Pneumática">Pneumática</SelectItem>
                    <SelectItem value="Eletrônica">Eletrônica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nivel">Nível</Label>
                <Select value={formData.nivel} onValueChange={(value) => setFormData(prev => ({ ...prev, nivel: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Júnior">Júnior</SelectItem>
                    <SelectItem value="Pleno">Pleno</SelectItem>
                    <SelectItem value="Sênior">Sênior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as "Ativo" | "Inativo" | "Férias" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Férias">Férias</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                {editingTecnico ? "Atualizar" : "Cadastrar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Técnicos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tecnicos.length}</div>
            <p className="text-xs text-muted-foreground">
              {tecnicos.filter(t => t.status === "Ativo").length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total HH Mês</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHorasEquipe}h</div>
            <p className="text-xs text-muted-foreground">
              Horas trabalhadas este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Ordens</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaOrdensCompletas}</div>
            <p className="text-xs text-muted-foreground">
              Ordens completas por técnico
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Técnicos */}
      <Card>
        <CardHeader>
          <CardTitle>Equipe de Manutenção</CardTitle>
          <CardDescription>
            Lista completa dos técnicos e suas informações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tecnicos.map((tecnico) => (
              <div key={tecnico.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{tecnico.nome}</h3>
                    {getStatusBadge(tecnico.status)}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{tecnico.especialidade}</span>
                    {getNivelBadge(tecnico.nivel)}
                    <span>{tecnico.horasTrabalhadasMes}h este mês</span>
                    <span>{tecnico.ordensCompletas} ordens completas</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(tecnico)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(tecnico.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}