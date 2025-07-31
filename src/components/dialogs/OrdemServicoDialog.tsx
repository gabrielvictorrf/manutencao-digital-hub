import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useData, setoresFabris, setoresRequisitantes } from "@/contexts/DataContext";
import { OrdemServico } from "@/pages/OrdensServico";

interface OrdemServicoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ordem?: OrdemServico;
  mode: "create" | "edit";
}

export function OrdemServicoDialog({ open, onOpenChange, ordem, mode }: OrdemServicoDialogProps) {
  const { maquinas, tecnicos, requisitantes, setores, addOrdem, updateOrdem } = useData();
  
  const [formData, setFormData] = useState({
    numeroRastreio: "",
    titulo: "",
    prioridade: "media" as "baixa" | "media" | "alta" | "critica",
    status: "aberta" as "aberta" | "em_andamento" | "concluida" | "cancelada",
    maquinaId: "",
    descricao: "",
    tecnicoResponsavelId: "",
    requisitanteId: "",
    setorId: "",
    dataAbertura: new Date().toISOString().split('T')[0],
    dataInicio: "",
    dataConclusao: "",
    observacoes: ""
  });

  useEffect(() => {
    if (ordem && mode === "edit") {
      setFormData({
        numeroRastreio: ordem.numeroRastreio,
        titulo: ordem.titulo,
        prioridade: ordem.prioridade,
        status: ordem.status,
        maquinaId: ordem.maquinaId,
        descricao: ordem.descricao,
        tecnicoResponsavelId: ordem.tecnicoResponsavelId || "",
        requisitanteId: ordem.requisitanteId || "",
        setorId: ordem.setorId || "",
        dataAbertura: ordem.dataAbertura.split('T')[0],
        dataInicio: ordem.dataInicio?.split('T')[0] || "",
        dataConclusao: ordem.dataConclusao?.split('T')[0] || "",
        observacoes: ordem.observacoes || ""
      });
    } else if (mode === "create") {
      setFormData({
        numeroRastreio: `OS-${Date.now()}`,
        titulo: "",
        prioridade: "media",
        status: "aberta",
        maquinaId: "",
        descricao: "",
        tecnicoResponsavelId: "",
        requisitanteId: "",
        setorId: "",
        dataAbertura: new Date().toISOString().split('T')[0],
        dataInicio: "",
        dataConclusao: "",
        observacoes: ""
      });
    }
  }, [ordem, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const maquina = maquinas.find(m => m.id === formData.maquinaId);
    const requisitante = requisitantes.find(r => r.id === formData.requisitanteId);
    const tecnico = tecnicos.find(t => t.id === formData.tecnicoResponsavelId);

    const ordemData: OrdemServico = {
      id: ordem?.id || Date.now().toString(),
      numeroRastreio: formData.numeroRastreio,
      titulo: formData.titulo,
      descricao: formData.descricao,
      maquinaId: formData.maquinaId,
      maquinaNome: maquina?.nome || "",
      requisitanteId: formData.requisitanteId,
      requisitanteNome: requisitante?.nome || "",
      setorId: formData.setorId,
      setorNome: requisitante?.setor || "",
      prioridade: formData.prioridade,
      status: formData.status,
      tecnicoResponsavelId: formData.tecnicoResponsavelId,
      tecnicoResponsavelNome: tecnico?.nome || "",
      dataAbertura: formData.dataAbertura,
      dataInicio: formData.dataInicio || undefined,
      dataConclusao: formData.dataConclusao || undefined,
      observacoes: formData.observacoes || undefined,
      criadoPor: ordem?.criadoPor || "Sistema"
    };

    if (mode === "create") {
      addOrdem(ordemData);
    } else {
      updateOrdem(ordem!.id, ordemData);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nova Ordem de Serviço" : "Editar Ordem de Serviço"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Preencha os dados para criar uma nova ordem de serviço"
              : "Altere os dados da ordem de serviço"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numeroRastreio">Número da OS</Label>
              <Input
                id="numeroRastreio"
                value={formData.numeroRastreio}
                onChange={(e) => setFormData({ ...formData, numeroRastreio: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select value={formData.prioridade} onValueChange={(value) => setFormData({ ...formData, prioridade: value as any })}>
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

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberta">Aberta</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maquina">Máquina</Label>
            <Select value={formData.maquinaId} onValueChange={(value) => setFormData({ ...formData, maquinaId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma máquina" />
              </SelectTrigger>
              <SelectContent>
                {maquinas.map((maquina) => (
                  <SelectItem key={maquina.id} value={maquina.id}>
                    {maquina.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tecnico">Técnico Responsável</Label>
              <Select value={formData.tecnicoResponsavelId} onValueChange={(value) => setFormData({ ...formData, tecnicoResponsavelId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um técnico" />
                </SelectTrigger>
                <SelectContent>
                  {tecnicos.map((tecnico) => (
                    <SelectItem key={tecnico.id} value={tecnico.id}>
                      {tecnico.nome} - {tecnico.especialidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requisitante">Requisitante</Label>
              <Select value={formData.requisitanteId} onValueChange={(value) => setFormData({ ...formData, requisitanteId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um requisitante" />
                </SelectTrigger>
                <SelectContent>
                  {requisitantes.map((req) => (
                    <SelectItem key={req.id} value={req.id}>
                      {req.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="setor">Setor</Label>
              <Select value={formData.setorId} onValueChange={(value) => setFormData({ ...formData, setorId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um setor" />
                </SelectTrigger>
                <SelectContent>
                  {setoresFabris.map((setor) => (
                    <SelectItem key={setor} value={setor}>
                      {setor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataAbertura">Data de Abertura</Label>
              <Input
                id="dataAbertura"
                type="date"
                value={formData.dataAbertura}
                onChange={(e) => setFormData({ ...formData, dataAbertura: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data de Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataConclusao">Data de Conclusão</Label>
              <Input
                id="dataConclusao"
                type="date"
                value={formData.dataConclusao}
                onChange={(e) => setFormData({ ...formData, dataConclusao: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Observações adicionais..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {mode === "create" ? "Criar Ordem" : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}