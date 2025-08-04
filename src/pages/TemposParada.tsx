import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Clock, Trash2 } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/contexts/DataContext';
import TempoParadaDialog from '@/components/dialogs/TempoParadaDialog';

export interface TempoParada {
  id: string;
  ordemServicoId: string;
  ordemServicoNumero: string;
  maquinaId: string;
  maquinaNome: string;
  dataInicio: string;
  dataFim?: string;
  duracao?: number; // em minutos
  motivoParada: string;
  tipoParada: 'programada' | 'nao_programada' | 'emergencia';
  impactoProducao: 'baixo' | 'medio' | 'alto' | 'critico';
  responsavelRegistro: string;
  observacoes?: string;
  status: 'em_andamento' | 'finalizada';
  criadoEm: string;
}

// Motivos de parada comuns
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


export default function TemposParada() {
  const { canEdit } = useAuth();
  const { toast } = useToast();
  const { temposParada, updateTempoParada, deleteTempoParada } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTempo, setEditingTempo] = useState<TempoParada | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const formatarDuracao = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    
    if (horas === 0) {
      return `${minutosRestantes}min`;
    }
    
    return `${horas}h ${minutosRestantes}min`;
  };

  const calcularDuracao = (inicio: Date, fim?: Date) => {
    if (!fim) return 0;
    return differenceInMinutes(fim, inicio);
  };

  const handleNovoTempo = () => {
    setEditingTempo(null);
    setDialogOpen(true);
  };

  const handleEdit = (tempo: TempoParada) => {
    setEditingTempo(tempo);
    setDialogOpen(true);
  };

  const handleFinalizarParada = (tempo: TempoParada) => {
    const agora = new Date();
    const duracao = calcularDuracao(new Date(tempo.dataInicio), agora);
    
    updateTempoParada(tempo.id, {
      dataFim: agora.toISOString(),
      duracao,
      status: 'finalizada' as const,
    });
    
    toast({
      title: "Sucesso",
      description: "Parada finalizada com sucesso!",
    });
  };

  const handleDelete = (tempo: TempoParada) => {
    if (confirm(`Tem certeza que deseja excluir este tempo de parada?`)) {
      deleteTempoParada(tempo.id);
      toast({
        title: "Sucesso",
        description: "Tempo de parada excluído com sucesso!",
      });
    }
  };

  const filteredTempos = temposParada.filter(tempo =>
    tempo.ordemServicoNumero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tempo.maquinaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tempo.motivoParada.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoParadaColor = (tipo: string) => {
    switch (tipo) {
      case 'programada': return 'bg-blue-500';
      case 'nao_programada': return 'bg-orange-500';
      case 'emergencia': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getImpactoColor = (impacto: string) => {
    switch (impacto) {
      case 'critico': return 'bg-red-500';
      case 'alto': return 'bg-orange-500';
      case 'medio': return 'bg-yellow-500';
      case 'baixo': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Tempos de Parada</h2>
        {canEdit && (
          <Button onClick={handleNovoTempo}>
            <Plus className="h-4 w-4 mr-2" />
            Registrar Parada
          </Button>
        )}
      </div>

      {/* Busca */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por OS, máquina ou motivo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <TempoParadaDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        tempo={editingTempo}
      />

      {/* Lista de Tempos de Parada */}
      <div className="space-y-4">
        {filteredTempos.map(tempo => (
          <Card key={tempo.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {tempo.ordemServicoNumero}
                    </Badge>
                    <Badge className={cn("text-white", getTipoParadaColor(tempo.tipoParada))}>
                      {tempo.tipoParada.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className={cn("text-white", getImpactoColor(tempo.impactoProducao))}>
                      Impacto {tempo.impactoProducao.charAt(0).toUpperCase() + tempo.impactoProducao.slice(1)}
                    </Badge>
                    {tempo.status === 'em_andamento' && (
                      <Badge variant="destructive" className="animate-pulse">
                        <Clock className="h-3 w-3 mr-1" />
                        EM ANDAMENTO
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold">{tempo.motivoParada}</h3>
                  <p className="text-muted-foreground">Máquina: {tempo.maquinaNome}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Início:</span><br />
                      {format(new Date(tempo.dataInicio), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </div>
                    <div>
                      <span className="font-medium">Fim:</span><br />
                      {tempo.dataFim 
                        ? format(new Date(tempo.dataFim), "dd/MM/yyyy HH:mm", { locale: ptBR })
                        : 'Em andamento'
                      }
                    </div>
                    <div>
                      <span className="font-medium">Duração:</span><br />
                      {tempo.duracao ? formatarDuracao(tempo.duracao) : 'Calculando...'}
                    </div>
                    <div>
                      <span className="font-medium">Responsável:</span><br />
                      {tempo.responsavelRegistro}
                    </div>
                  </div>

                  {tempo.observacoes && (
                    <div className="mt-2">
                      <span className="font-medium text-sm">Observações:</span>
                      <p className="text-sm text-muted-foreground mt-1">{tempo.observacoes}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {canEdit && tempo.status === 'em_andamento' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFinalizarParada(tempo)}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Finalizar
                    </Button>
                  )}
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(tempo)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(tempo)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredTempos.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {temposParada.length === 0 
                ? "Nenhum tempo de parada registrado ainda."
                : "Nenhum registro encontrado com os critérios de busca."
              }
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}