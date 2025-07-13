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

export default function Configuracoes() {
  const { user, users, createUser, updateUser, deleteUser, changePassword, canAdmin } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'visualizador' as UserRole,
    password: '',
    active: true,
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

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
        role: 'visualizador',
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
      case 'visualizador':
        return <Badge className="bg-green-100 text-green-800">Visualizador</Badge>;
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
                        <SelectItem value="visualizador">Visualizador - Apenas leitura</SelectItem>
                        <SelectItem value="operador">Operador - Pode editar ordens</SelectItem>
                        <SelectItem value="admin">Administrador - Acesso total</SelectItem>
                      </SelectContent>
                    </Select>
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