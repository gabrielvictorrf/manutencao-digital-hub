import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { TempoParada } from '@/pages/TemposParada';

interface TempoParadaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tempo?: TempoParada | null;
}

const motivosParada = [
  'Manutenção Preventiva',
  'Manutenção Corretiva',
  'Falha Mecânica',
  'Falha Elétrica',
  'Falta de Material',
  'Troca de Ferramenta',
  'Setup/Preparação',
  'Limpeza',
  'Quebra de Máquina',
  'Falta de Operador',
  'Problema de Qualidade',
  'Outro'
];

export default function TempoParadaDialog({ isOpen, onClose, tempo }: TempoParadaDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { ordens, addTempoParada, updateTempoParada } = useData();
  
  const ordensDisponiveis = ordens.map(o => ({
    id: o.id,
    numero: o.numeroRastreio,
    maquinaId: o.maquinaId,
    maquinaNome: o.maquinaNome
  }));

  const [formData, setFormData] = useState({
    ordemServicoId: '',
    dataInicio: null as Date | null,
    horaInicio: '',
    dataFim: null as Date | null,
    horaFim: '',
    motivoParada: '',
    tipoParada: 'nao_programada' as 'programada' | 'nao_programada' | 'emergencia',
    impactoProducao: 'medio' as 'baixo' | 'medio' | 'alto' | 'critico',
    observacoes: '',
  });

  useEffect(() => {
    if (tempo) {
      const dataInicio = new Date(tempo.dataInicio);
      const horaInicio = format(dataInicio, 'HH:mm');
      
      let dataFim: Date | null = null;
      let horaFim = '';
      
      if (tempo.dataFim) {
        dataFim = new Date(tempo.dataFim);
        horaFim = format(dataFim, 'HH:mm');
      }

      setFormData({
        ordemServicoId: tempo.ordemServicoId,
        dataInicio,
        horaInicio,
        dataFim,
        horaFim,
        motivoParada: tempo.motivoParada,
        tipoParada: tempo.tipoParada,
        impactoProducao: tempo.impactoProducao,
        observacoes: tempo.observacoes || '',
      });
    } else {
      resetForm();
    }
  }, [tempo, isOpen]);

  const resetForm = () => {
    setFormData({
      ordemServicoId: '',
      dataInicio: null,
      horaInicio: '',
      dataFim: null,
      horaFim: '',
      motivoParada: '',
      tipoParada: 'nao_programada',
      impactoProducao: 'medio',
      observacoes: '',
    });
  };

  const calcularDuracao = (inicio: Date, fim?: Date) => {
    if (!fim) return 0;
    return differenceInMinutes(fim, inicio);
  };

  const handleSave = () => {
    if (!formData.ordemServicoId || !formData.dataInicio || !formData.horaInicio || !formData.motivoParada) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const ordemSelecionada = ordensDisponiveis.find(o => o.id === formData.ordemServicoId);
    if (!ordemSelecionada) {
      toast({
        title: "Erro",
        description: "Ordem de serviço não encontrada",
        variant: "destructive",
      });
      return;
    }

    // Combinar data e hora
    const [horaInicio, minutoInicio] = formData.horaInicio.split(':').map(Number);
    const dataHoraInicio = new Date(formData.dataInicio);
    dataHoraInicio.setHours(horaInicio, minutoInicio, 0, 0);

    let dataHoraFim: Date | undefined;
    let duracao = 0;
    let status: 'em_andamento' | 'finalizada' = 'em_andamento';

    if (formData.dataFim && formData.horaFim) {
      const [horaFim, minutoFim] = formData.horaFim.split(':').map(Number);
      dataHoraFim = new Date(formData.dataFim);
      dataHoraFim.setHours(horaFim, minutoFim, 0, 0);
      
      if (dataHoraFim <= dataHoraInicio) {
        toast({
          title: "Erro",
          description: "Data/hora de fim deve ser posterior ao início",
          variant: "destructive",
        });
        return;
      }
      
      duracao = calcularDuracao(dataHoraInicio, dataHoraFim);
      status = 'finalizada';
    }

    const tempoData = {
      ordemServicoId: formData.ordemServicoId,
      ordemServicoNumero: ordemSelecionada.numero,
      maquinaId: ordemSelecionada.maquinaId,
      maquinaNome: ordemSelecionada.maquinaNome,
      dataInicio: dataHoraInicio.toISOString(),
      dataFim: dataHoraFim?.toISOString(),
      duracao,
      motivoParada: formData.motivoParada,
      tipoParada: formData.tipoParada,
      impactoProducao: formData.impactoProducao,
      observacoes: formData.observacoes,
      status,
      responsavelRegistro: user?.name || '',
    };

    if (tempo) {
      updateTempoParada(tempo.id, tempoData);
      toast({
        title: "Sucesso",
        description: "Tempo de parada atualizado com sucesso!",
      });
    } else {
      addTempoParada({
        ...tempoData,
        id: Date.now().toString(),
        criadoEm: new Date().toISOString(),
      });
      toast({
        title: "Sucesso",
        description: "Tempo de parada registrado com sucesso!",
      });
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tempo ? 'Editar Tempo de Parada' : 'Registrar Tempo de Parada'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="ordem">Ordem de Serviço *</Label>
            <Select value={formData.ordemServicoId} onValueChange={(value) => setFormData(prev => ({ ...prev, ordemServicoId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a ordem de serviço" />
              </SelectTrigger>
              <SelectContent>
                {ordensDisponiveis.map(ordem => (
                  <SelectItem key={ordem.id} value={ordem.id}>
                    {ordem.numero} - {ordem.maquinaNome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data de Início *</Label>
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
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="horaInicio">Hora de Início *</Label>
              <Input
                id="horaInicio"
                type="time"
                value={formData.horaInicio}
                onChange={(e) => setFormData(prev => ({ ...prev, horaInicio: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data de Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dataFim && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dataFim ? (
                      format(formData.dataFim, "PPP", { locale: ptBR })
                    ) : (
                      "Selecione uma data"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dataFim || undefined}
                    onSelect={(date) => setFormData(prev => ({ ...prev, dataFim: date || null }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="horaFim">Hora de Fim</Label>
              <Input
                id="horaFim"
                type="time"
                value={formData.horaFim}
                onChange={(e) => setFormData(prev => ({ ...prev, horaFim: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="motivo">Motivo da Parada *</Label>
            <Select value={formData.motivoParada} onValueChange={(value) => setFormData(prev => ({ ...prev, motivoParada: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                {motivosParada.map(motivo => (
                  <SelectItem key={motivo} value={motivo}>
                    {motivo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo de Parada</Label>
              <Select value={formData.tipoParada} onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipoParada: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="programada">Programada</SelectItem>
                  <SelectItem value="nao_programada">Não Programada</SelectItem>
                  <SelectItem value="emergencia">Emergência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="impacto">Impacto na Produção</Label>
              <Select value={formData.impactoProducao} onValueChange={(value: any) => setFormData(prev => ({ ...prev, impactoProducao: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixo">Baixo</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="alto">Alto</SelectItem>
                  <SelectItem value="critico">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Detalhes adicionais sobre a parada"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {tempo ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}