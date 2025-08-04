import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Edit, Trash2, User, Wrench, Clock, Users } from "lucide-react";

interface Tecnico {
  id: string;
  nome: string;
  especialidade: string;
  turno: string;
  valorHora: number;
  horasTrabalhadasMes: number;
  ordensCompletas: number;
  status: "Ativo" | "Inativo" | "Férias";
}

interface Turno {
  id: string;
  nome: string;
  horaInicio: string;
  horaFim: string;
  diasSemana: string[];
  criadoEm: string;
  criadoPor: string;
}

interface Especialidade {
  id: string;
  nome: string;
  valorHora: number;
  criadoEm: string;
  criadoPor: string;
}

export default function Pessoal() {
  const { toast } = useToast();
  const { canEdit, user } = useAuth();
  const { 
    tecnicos, addTecnico, updateTecnico, deleteTecnico,
    turnos, addTurno, updateTurno, deleteTurno,
    especialidades, addEspecialidade, updateEspecialidade, deleteEspecialidade
  } = useData();

  // Estados para técnicos
  const [tecnicoDialogOpen, setTecnicoDialogOpen] = useState(false);
  const [editingTecnico, setEditingTecnico] = useState<Tecnico | null>(null);
  const [tecnicoFormData, setTecnicoFormData] = useState({
    nome: "",
    especialidade: "",
    turno: "",
    valorHora: 0,
    status: "Ativo" as "Ativo" | "Inativo" | "Férias"
  });

  // Estados para turnos
  const [turnoDialogOpen, setTurnoDialogOpen] = useState(false);
  const [editingTurno, setEditingTurno] = useState<Turno | null>(null);
  const [turnoFormData, setTurnoFormData] = useState({
    nome: "",
    horaInicio: "",
    horaFim: "",
    diasSemana: [] as string[]
  });

  // Estados para especialidades
  const [especialidadeDialogOpen, setEspecialidadeDialogOpen] = useState(false);
  const [editingEspecialidade, setEspecialidadeEditingEspecialidade] = useState<Especialidade | null>(null);
  const [especialidadeFormData, setEspecialidadeFormData] = useState({
    nome: "",
    valorHora: 0
  });

  // Handlers para técnicos
  const handleTecnicoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTecnico) {
      updateTecnico(editingTecnico.id, tecnicoFormData);
      toast({
        title: "Técnico atualizado",
        description: "Os dados do técnico foram atualizados com sucesso.",
      });
    } else {
      const novoTecnico = {
        id: Date.now().toString(),
        ...tecnicoFormData,
        horasTrabalhadasMes: 0,
        ordensCompletas: 0
      };
      addTecnico(novoTecnico);
      toast({
        title: "Técnico cadastrado",
        description: "Novo técnico foi adicionado ao sistema.",
      });
    }

    setTecnicoDialogOpen(false);
    setEditingTecnico(null);
    setTecnicoFormData({ nome: "", especialidade: "", turno: "", valorHora: 0, status: "Ativo" });
  };

  const handleTecnicoEdit = (tecnico: Tecnico) => {
    setEditingTecnico(tecnico);
    setTecnicoFormData({
      nome: tecnico.nome,
      especialidade: tecnico.especialidade,
      turno: tecnico.turno,
      valorHora: tecnico.valorHora,
      status: tecnico.status
    });
    setTecnicoDialogOpen(true);
  };

  const handleTecnicoDelete = (id: string) => {
    if (!canEdit) return;
    
    deleteTecnico(id);
    toast({
      title: "Técnico removido",
      description: "O técnico foi removido do sistema.",
    });
  };

  // Handlers para turnos
  const handleTurnoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTurno) {
      updateTurno(editingTurno.id, turnoFormData);
      toast({
        title: "Turno atualizado",
        description: "O turno foi atualizado com sucesso.",
      });
    } else {
      const novoTurno: Turno = {
        id: Date.now().toString(),
        ...turnoFormData,
        criadoEm: new Date().toISOString(),
        criadoPor: user?.name || ''
      };
      addTurno(novoTurno);
      toast({
        title: "Turno cadastrado",
        description: "Novo turno foi adicionado ao sistema.",
      });
    }

    setTurnoDialogOpen(false);
    setEditingTurno(null);
    setTurnoFormData({ nome: "", horaInicio: "", horaFim: "", diasSemana: [] });
  };

  // Handlers para especialidades
  const handleEspecialidadeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEspecialidade) {
      updateEspecialidade(editingEspecialidade.id, especialidadeFormData);
      toast({
        title: "Especialidade atualizada",
        description: "A especialidade foi atualizada com sucesso.",
      });
    } else {
      const novaEspecialidade: Especialidade = {
        id: Date.now().toString(),
        ...especialidadeFormData,
        criadoEm: new Date().toISOString(),
        criadoPor: user?.name || ''
      };
      addEspecialidade(novaEspecialidade);
      toast({
        title: "Especialidade cadastrada",
        description: "Nova especialidade foi adicionada ao sistema.",
      });
    }

    setEspecialidadeDialogOpen(false);
    setEspecialidadeEditingEspecialidade(null);
    setEspecialidadeFormData({ nome: "", valorHora: 0 });
  };

  // Funções auxiliares
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

  const mediaOrdensCompletas = tecnicos.length > 0 
    ? Math.round(tecnicos.reduce((acc, t) => acc + t.ordensCompletas, 0) / tecnicos.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Pessoal</h2>
          <p className="text-muted-foreground">
            Gerencie sua equipe de manutenção, turnos e especialidades
          </p>
        </div>
      </div>

      <Tabs defaultValue="tecnicos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tecnicos">Técnicos</TabsTrigger>
          <TabsTrigger value="turnos">Turnos</TabsTrigger>
          <TabsTrigger value="especialidades">Especialidades</TabsTrigger>
        </TabsList>

        <TabsContent value="tecnicos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Equipe de Manutenção</h3>
            {canEdit && (
              <Dialog open={tecnicoDialogOpen} onOpenChange={setTecnicoDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingTecnico(null);
                    setTecnicoFormData({ nome: "", especialidade: "", turno: "", valorHora: 0, status: "Ativo" });
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
                  </DialogHeader>
                  <form onSubmit={handleTecnicoSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome</Label>
                      <Input
                        id="nome"
                        value={tecnicoFormData.nome}
                        onChange={(e) => setTecnicoFormData(prev => ({ ...prev, nome: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="especialidade">Especialidade</Label>
                      <Select 
                        value={tecnicoFormData.especialidade} 
                        onValueChange={(value) => {
                          const especialidade = especialidades.find(e => e.nome === value);
                          setTecnicoFormData(prev => ({ 
                            ...prev, 
                            especialidade: value,
                            valorHora: especialidade?.valorHora || 0
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma especialidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {especialidades.map(esp => (
                            <SelectItem key={esp.id} value={esp.nome}>{esp.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="turno">Turno</Label>
                      <Select value={tecnicoFormData.turno} onValueChange={(value) => setTecnicoFormData(prev => ({ ...prev, turno: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um turno" />
                        </SelectTrigger>
                        <SelectContent>
                          {turnos.map(turno => (
                            <SelectItem key={turno.id} value={turno.nome}>{turno.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valorHora">Valor por Hora (R$)</Label>
                      <Input
                        id="valorHora"
                        type="number"
                        step="0.01"
                        value={tecnicoFormData.valorHora}
                        onChange={(e) => setTecnicoFormData(prev => ({ ...prev, valorHora: parseFloat(e.target.value) }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={tecnicoFormData.status} onValueChange={(value) => setTecnicoFormData(prev => ({ ...prev, status: value as "Ativo" | "Inativo" | "Férias" }))}>
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
            )}
          </div>

          {/* Cards de Resumo */}
          <div className="grid gap-4 md:grid-cols-2">
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
                        <span>{tecnico.turno}</span>
                        <span>R$ {tecnico.valorHora.toFixed(2)}/h</span>
                        <span>{tecnico.ordensCompletas} ordens completas</span>
                      </div>
                    </div>
                    
                    {canEdit && (
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleTecnicoEdit(tecnico)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleTecnicoDelete(tecnico.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="turnos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Gestão de Turnos</h3>
            {canEdit && (
              <Dialog open={turnoDialogOpen} onOpenChange={setTurnoDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingTurno(null);
                    setTurnoFormData({ nome: "", horaInicio: "", horaFim: "", diasSemana: [] });
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Turno
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingTurno ? "Editar Turno" : "Novo Turno"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleTurnoSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomeTurno">Nome do Turno</Label>
                      <Input
                        id="nomeTurno"
                        value={turnoFormData.nome}
                        onChange={(e) => setTurnoFormData(prev => ({ ...prev, nome: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="horaInicio">Hora de Início</Label>
                        <Input
                          id="horaInicio"
                          type="time"
                          value={turnoFormData.horaInicio}
                          onChange={(e) => setTurnoFormData(prev => ({ ...prev, horaInicio: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="horaFim">Hora de Fim</Label>
                        <Input
                          id="horaFim"
                          type="time"
                          value={turnoFormData.horaFim}
                          onChange={(e) => setTurnoFormData(prev => ({ ...prev, horaFim: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      {editingTurno ? "Atualizar" : "Cadastrar"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid gap-4">
            {turnos.map(turno => (
              <Card key={turno.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{turno.nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        {turno.horaInicio} às {turno.horaFim}
                      </p>
                    </div>
                    {canEdit && (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingTurno(turno);
                            setTurnoFormData({
                              nome: turno.nome,
                              horaInicio: turno.horaInicio,
                              horaFim: turno.horaFim,
                              diasSemana: turno.diasSemana
                            });
                            setTurnoDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            deleteTurno(turno.id);
                            toast({
                              title: "Turno excluído",
                              description: "O turno foi removido do sistema.",
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="especialidades" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Gestão de Especialidades</h3>
            {canEdit && (
              <Dialog open={especialidadeDialogOpen} onOpenChange={setEspecialidadeDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEspecialidadeEditingEspecialidade(null);
                    setEspecialidadeFormData({ nome: "", valorHora: 0 });
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Especialidade
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingEspecialidade ? "Editar Especialidade" : "Nova Especialidade"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEspecialidadeSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomeEspecialidade">Nome da Especialidade</Label>
                      <Input
                        id="nomeEspecialidade"
                        value={especialidadeFormData.nome}
                        onChange={(e) => setEspecialidadeFormData(prev => ({ ...prev, nome: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valorHoraEspecialidade">Valor por Hora (R$)</Label>
                      <Input
                        id="valorHoraEspecialidade"
                        type="number"
                        step="0.01"
                        value={especialidadeFormData.valorHora}
                        onChange={(e) => setEspecialidadeFormData(prev => ({ ...prev, valorHora: parseFloat(e.target.value) }))}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      {editingEspecialidade ? "Atualizar" : "Cadastrar"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid gap-4">
            {especialidades.map(especialidade => (
              <Card key={especialidade.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{especialidade.nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        Valor/hora: R$ {especialidade.valorHora.toFixed(2)}
                      </p>
                    </div>
                    {canEdit && (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEspecialidadeEditingEspecialidade(especialidade);
                            setEspecialidadeFormData({
                              nome: especialidade.nome,
                              valorHora: especialidade.valorHora
                            });
                            setEspecialidadeDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            deleteEspecialidade(especialidade.id);
                            toast({
                              title: "Especialidade excluída",
                              description: "A especialidade foi removida do sistema.",
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}