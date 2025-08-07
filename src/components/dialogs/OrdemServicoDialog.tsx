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
import { useAuth } from "@/contexts/AuthContext";
import { OrdemServico } from "@/pages/OrdensServico";
import { TempoParada } from "@/pages/TemposParada";
import { differenceInMinutes } from "date-fns";

interface OrdemServicoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ordem?: OrdemServico;
  mode: "create" | "edit";
}

export function OrdemServicoDialog({ open, onOpenChange, ordem, mode }: OrdemServicoDialogProps) {
  const { maquinas, tecnicos, addOrdem, updateOrdem, addTempoParada, updateTempoParada, temposParada } = useData();
  const { users } = useAuth();
  
  const [formData, setFormData] = useState({
    numeroRastreio: "",
    titulo: "",
    prioridade: "media" as "baixa" | "media" | "alta" | "critica",
    status: "aberta" as "aberta" | "em_andamento" | "concluida" | "cancelada",
    maquinaId: "",
    descricao: "",
    tecnicoResponsavelId: "",
    requisitanteId: "",
    dataAbertura: new Date().toISOString().split('T')[0],
    dataInicio: "",
    dataConclusao: "",
    observacoes: "",
    // Novos campos para métricas
    horaQuebra: "",
    horaInicioReparo: "",
    horaFimReparo: "",
    horaVoltaOperacao: ""
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
        dataAbertura: ordem.dataAbertura.split('T')[0],
        dataInicio: ordem.dataInicio?.split('T')[0] || "",
        dataConclusao: ordem.dataConclusao?.split('T')[0] || "",
        observacoes: ordem.observacoes || "",
        horaQuebra: ordem.horaQuebra || "",
        horaInicioReparo: ordem.horaInicioReparo || "",
        horaFimReparo: ordem.horaFimReparo || "",
        horaVoltaOperacao: ordem.horaVoltaOperacao || ""
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
        dataAbertura: new Date().toISOString().split('T')[0],
        dataInicio: "",
        dataConclusao: "",
        observacoes: "",
        horaQuebra: "",
        horaInicioReparo: "",
        horaFimReparo: "",
        horaVoltaOperacao: ""
      });
    }
  }, [ordem, mode, open]);

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

  // Função para criar/atualizar tempo de parada automaticamente
  const sincronizarTempoParada = (ordemAtualizada: OrdemServico) => {
    if (!ordemAtualizada.horaQuebra) return;

    // Verificar se já existe um tempo de parada para esta ordem
    const tempoExistente = temposParada.find(t => t.ordemServicoId === ordemAtualizada.id);
    
    const novoTempo: TempoParada = {
      id: tempoExistente?.id || `tp_${ordemAtualizada.id}_${Date.now()}`,
      ordemServicoId: ordemAtualizada.id,
      ordemServicoNumero: ordemAtualizada.numeroRastreio,
      maquinaId: ordemAtualizada.maquinaId,
      maquinaNome: ordemAtualizada.maquinaNome,
      dataInicio: ordemAtualizada.horaQuebra,
      dataFim: ordemAtualizada.horaVoltaOperacao,
      duracao: ordemAtualizada.tempoParadaTotal || 0,
      motivoParada: 'Manutenção Corretiva',
      tipoParada: 'nao_programada',
      impactoProducao: ordemAtualizada.prioridade === 'critica' ? 'critico' : 
                      ordemAtualizada.prioridade === 'alta' ? 'alto' : 'medio',
      responsavelRegistro: ordemAtualizada.criadoPor,
      observacoes: `Tempo de parada sincronizado automaticamente da OS ${ordemAtualizada.numeroRastreio}. Reparo efetivo: ${ordemAtualizada.tempoReparoEfetivo || 0} minutos.`,
      status: ordemAtualizada.horaVoltaOperacao ? 'finalizada' : 'em_andamento',
      criadoEm: tempoExistente?.criadoEm || new Date().toISOString(),
    };

    if (tempoExistente) {
      updateTempoParada(tempoExistente.id, novoTempo);
    } else {
      addTempoParada(novoTempo);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const maquina = maquinas.find(m => m.id === formData.maquinaId);
    const requisitante = users.find(u => u.id === formData.requisitanteId);
    const tecnico = tecnicos.find(t => t.id === formData.tecnicoResponsavelId);
    const { tempoParadaTotal, tempoReparoEfetivo } = calcularTempos();

    const ordemData: OrdemServico = {
      id: ordem?.id || Date.now().toString(),
      numeroRastreio: formData.numeroRastreio,
      titulo: formData.titulo,
      descricao: formData.descricao,
      maquinaId: formData.maquinaId,
      maquinaNome: maquina?.nome || "",
      requisitanteId: formData.requisitanteId,
      requisitanteNome: requisitante?.name || "",
      setorId: maquina?.localizacao || "",
      setorNome: maquina?.localizacao || "",
      prioridade: formData.prioridade,
      status: formData.status,
      tecnicoResponsavelId: formData.tecnicoResponsavelId,
      tecnicoResponsavelNome: tecnico?.nome || "",
      dataAbertura: formData.dataAbertura,
      dataInicio: formData.dataInicio || undefined,
      dataConclusao: formData.dataConclusao || undefined,
      observacoes: formData.observacoes || undefined,
      criadoPor: ordem?.criadoPor || "Sistema",
      // Novos campos de tempo
      horaQuebra: formData.horaQuebra || undefined,
      horaInicioReparo: formData.horaInicioReparo || undefined,
      horaFimReparo: formData.horaFimReparo || undefined,
      horaVoltaOperacao: formData.horaVoltaOperacao || undefined,
      tempoParadaTotal,
      tempoReparoEfetivo
    };

    if (mode === "create") {
      addOrdem(ordemData);
    } else {
      updateOrdem(ordem!.id, ordemData);
    }

    // Sincronizar tempo de parada automaticamente
    sincronizarTempoParada(ordemData);

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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tecnico">Profissional</Label>
              <Select value={formData.tecnicoResponsavelId} onValueChange={(value) => setFormData({ ...formData, tecnicoResponsavelId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um profissional" />
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
              <Select value={formData.requisitanteId} onValueChange={(value) => {
                setFormData({ ...formData, requisitanteId: value });
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um requisitante" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(user => user.active).map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} - {user.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Setor da Máquina (read-only, baseado na máquina selecionada) */}
          {formData.maquinaId && (
            <div className="space-y-2">
              <Label htmlFor="setorMaquina">Setor do Equipamento</Label>
              <Input
                id="setorMaquina"
                value={maquinas.find(m => m.id === formData.maquinaId)?.localizacao || ""}
                disabled
                className="bg-muted"
              />
            </div>
          )}

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

            {/* Seção de Tempos de Parada para Métricas */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center space-x-2 mb-4">
                <Label className="text-base font-semibold">Tempos de Parada (Para Métricas MTTR/MTBF)</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horaQuebra">Hora da Quebra/Problema</Label>
                  <input
                    id="horaQuebra"
                    type="datetime-local"
                    value={formData.horaQuebra}
                    onChange={(e) => setFormData({ ...formData, horaQuebra: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="horaInicioReparo">Hora Início do Reparo</Label>
                  <input
                    id="horaInicioReparo"
                    type="datetime-local"
                    value={formData.horaInicioReparo}
                    onChange={(e) => setFormData({ ...formData, horaInicioReparo: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="horaFimReparo">Hora Fim do Reparo</Label>
                  <input
                    id="horaFimReparo"
                    type="datetime-local"
                    value={formData.horaFimReparo}
                    onChange={(e) => setFormData({ ...formData, horaFimReparo: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="horaVoltaOperacao">Hora Volta à Operação</Label>
                  <input
                    id="horaVoltaOperacao"
                    type="datetime-local"
                    value={formData.horaVoltaOperacao}
                    onChange={(e) => setFormData({ ...formData, horaVoltaOperacao: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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