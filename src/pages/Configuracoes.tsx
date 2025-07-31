import { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Key, Users, Shield } from "lucide-react";
import { useData, setoresRequisitantes } from "@/contexts/DataContext";

export default function Configuracoes() {
  const { user, users, createUser, updateUser, deleteUser, changePassword, canAdmin } = useAuth();
  const { toast } = useToast();
  const { setores, requisitantes, addSetor, updateSetor, addRequisitante, updateRequisitante } = useData();
  const [setorDialogOpen, setSetorDialogOpen] = useState(false);
  const [requisitanteDialogOpen, setRequisitanteDialogOpen] = useState(false);
  const [editingSetor, setEditingSetor] = useState<any>(null);
  const [editingRequisitante, setEditingRequisitante] = useState<any>(null);
  const [novoSetor, setNovoSetor] = useState({ nome: "", descricao: "" });
  const [novoRequisitante, setNovoRequisitante] = useState({ nome: "", setor: "", email: "", telefone: "" });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'requisitante' as UserRole,
    password: '',
    active: true,
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleSaveSetor = () => {
    if (editingSetor) {
      updateSetor(editingSetor.id, novoSetor);
    } else {
      addSetor({
        id: `setor-${Date.now()}`,
        ...novoSetor,
        responsavel: "Sistema",
        status: "ativo",
        criadoEm: new Date().toISOString()
      });
    }
    setSetorDialogOpen(false);
    setEditingSetor(null);
    setNovoSetor({ nome: "", descricao: "" });
  };

  const handleSaveRequisitante = () => {
    if (editingRequisitante) {
      updateRequisitante(editingRequisitante.id, novoRequisitante);
    } else {
      addRequisitante({
        id: `req-${Date.now()}`,
        ...novoRequisitante,
        cargo: "Requisitante",
        status: "ativo",
        criadoEm: new Date().toISOString()
      });
    }
    setRequisitanteDialogOpen(false);
    setEditingRequisitante(null);
    setNovoRequisitante({ nome: "", setor: "", email: "", telefone: "" });
  };

  const handleEditSetor = (setor: any) => {
    setEditingSetor(setor);
    setNovoSetor({ nome: setor.nome, descricao: setor.descricao });
    setSetorDialogOpen(true);
  };

  const handleEditRequisitante = (req: any) => {
    setEditingRequisitante(req);
    setNovoRequisitante({ nome: req.nome, setor: req.setor, email: req.email, telefone: req.telefone });
    setRequisitanteDialogOpen(true);
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.name || !newUser.password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const success = await createUser(newUser);
    if (success) {
      toast({
        title: "Usuário criado",
        description: `Usuário ${newUser.name} criado com sucesso.`,
      });
      setNewUser({
        email: '',
        name: '',
        role: 'requisitante',
        password: '',
        active: true,
      });
      setIsCreateDialogOpen(false);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível criar o usuário. Email já existe.",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: "Erro",
        description: "A confirmação da senha não confere.",
        variant: "destructive",
      });
      return;
    }

    const success = await changePassword(passwordData.current, passwordData.new);
    if (success) {
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
      setPasswordData({ current: '', new: '', confirm: '' });
      setIsPasswordDialogOpen(false);
    } else {
      toast({
        title: "Erro",
        description: "Senha atual incorreta.",
        variant: "destructive",
      });
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const success = await updateUser(userId, { active: !currentStatus });
    if (success) {
      toast({
        title: "Status atualizado",
        description: `Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso.`,
      });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${userName}?`)) {
      const success = await deleteUser(userId);
      if (success) {
        toast({
          title: "Usuário excluído",
          description: `Usuário ${userName} foi excluído.`,
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o usuário.",
          variant: "destructive",
        });
      }
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800">Administrador</Badge>;
      case 'operador':
        return <Badge className="bg-blue-100 text-blue-800">Operador</Badge>;
      case 'requisitante':
        return <Badge className="bg-green-100 text-green-800">Requisitante</Badge>;
    }
  };

  if (!canAdmin) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                Você não tem permissão para acessar esta área.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie usuários e configurações do sistema
        </p>
      </div>

      {/* Gestão de Usuários */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestão de Usuários
              </CardTitle>
              <CardDescription>
                Crie e gerencie usuários do sistema
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Usuário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Usuário</DialogTitle>
                  <DialogDescription>
                    Adicione um novo usuário ao sistema
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email/Login</Label>
                    <Input
                      id="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="usuario@empresa.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome do usuário"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Nível de Acesso</Label>
                    <Select value={newUser.role} onValueChange={(value: UserRole) => setNewUser(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="operador">Operador</SelectItem>
                        <SelectItem value="requisitante">Requisitante</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      <strong>Admin:</strong> Acesso total ao sistema<br/>
                      <strong>Operador:</strong> Pode criar, editar e visualizar dados<br/>
                      <strong>Requisitante:</strong> Pode criar ordens de serviço e visualizar dados
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="password">Senha Inicial</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Senha inicial"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newUser.active}
                      onCheckedChange={(checked) => setNewUser(prev => ({ ...prev, active: checked }))}
                    />
                    <Label>Usuário ativo</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateUser}>
                      Criar Usuário
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{u.name}</p>
                    {u.id === user?.id && <Badge variant="outline">Você</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(u.role)}
                    <Badge variant={u.active ? "default" : "secondary"}>
                      {u.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={u.active}
                    onCheckedChange={() => handleToggleUserStatus(u.id, u.active)}
                    disabled={u.id === '1'} // Admin principal sempre ativo
                  />
                  {u.id !== '1' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(u.id, u.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gestão de Setores */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestão de Setores</CardTitle>
              <CardDescription>
                Configure os setores da empresa
              </CardDescription>
            </div>
            <Dialog open={setorDialogOpen} onOpenChange={setSetorDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Setor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSetor ? 'Editar Setor' : 'Novo Setor'}</DialogTitle>
                  <DialogDescription>
                    {editingSetor ? 'Altere os dados do setor' : 'Adicione um novo setor'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nomeSetor">Nome do Setor</Label>
                    <Input
                      id="nomeSetor"
                      value={novoSetor.nome}
                      onChange={(e) => setNovoSetor({ ...novoSetor, nome: e.target.value })}
                      placeholder="Nome do setor"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="descricaoSetor">Descrição</Label>
                    <Input
                      id="descricaoSetor"
                      value={novoSetor.descricao}
                      onChange={(e) => setNovoSetor({ ...novoSetor, descricao: e.target.value })}
                      placeholder="Descrição do setor"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => {
                      setSetorDialogOpen(false);
                      setEditingSetor(null);
                      setNovoSetor({ nome: "", descricao: "" });
                    }}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveSetor}>
                      {editingSetor ? 'Salvar' : 'Criar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {setores.map((setor) => (
              <div key={setor.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{setor.nome}</h4>
                  <p className="text-sm text-muted-foreground">{setor.descricao}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditSetor(setor)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gestão de Requisitantes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestão de Requisitantes</CardTitle>
              <CardDescription>
                Configure os requisitantes do sistema
              </CardDescription>
            </div>
            <Dialog open={requisitanteDialogOpen} onOpenChange={setRequisitanteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Requisitante
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingRequisitante ? 'Editar Requisitante' : 'Novo Requisitante'}</DialogTitle>
                  <DialogDescription>
                    {editingRequisitante ? 'Altere os dados do requisitante' : 'Adicione um novo requisitante'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      value={novoRequisitante.nome}
                      onChange={(e) => setNovoRequisitante({ ...novoRequisitante, nome: e.target.value })}
                      placeholder="Nome do requisitante"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="setor">Setor</Label>
                    <Select value={novoRequisitante.setor} onValueChange={(value) => setNovoRequisitante({ ...novoRequisitante, setor: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o setor" />
                      </SelectTrigger>
                      <SelectContent>
                        {setoresRequisitantes.map((setor) => (
                          <SelectItem key={setor} value={setor}>
                            {setor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={novoRequisitante.email}
                      onChange={(e) => setNovoRequisitante({ ...novoRequisitante, email: e.target.value })}
                      placeholder="Email do requisitante"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={novoRequisitante.telefone}
                      onChange={(e) => setNovoRequisitante({ ...novoRequisitante, telefone: e.target.value })}
                      placeholder="Telefone do requisitante"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => {
                      setRequisitanteDialogOpen(false);
                      setEditingRequisitante(null);
                      setNovoRequisitante({ nome: "", setor: "", email: "", telefone: "" });
                    }}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveRequisitante}>
                      {editingRequisitante ? 'Salvar' : 'Criar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {requisitantes.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{req.nome}</h4>
                  <p className="text-sm text-muted-foreground">{req.setor} • {req.email}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditRequisitante(req)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alteração de Senha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Segurança
          </CardTitle>
          <CardDescription>
            Altere sua senha de acesso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Key className="h-4 w-4 mr-2" />
                Alterar Senha
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Alterar Senha</DialogTitle>
                <DialogDescription>
                  Digite sua senha atual e a nova senha
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleChangePassword}>
                    Alterar Senha
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}