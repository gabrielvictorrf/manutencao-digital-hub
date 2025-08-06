import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { OrdemServicoDialog } from '@/components/dialogs/OrdemServicoDialog';
import { ExportReportDialog } from '@/components/dialogs/ExportReportDialog';
import { exportOrderToPDF } from '@/utils/exportUtils';

export interface OrdemServico {
  id: string;
  numeroRastreio: string;
  titulo: string;
  descricao: string;
  maquinaId: string;
  maquinaNome: string;
  requisitanteId: string;
  requisitanteNome: string;
  setorId: string;
  setorNome: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  status: 'aberta' | 'em_andamento' | 'concluida' | 'cancelada';
  tecnicoResponsavelId: string;
  tecnicoResponsavelNome: string;
  dataAbertura: string;
  dataInicio?: string;
  dataConclusao?: string;
  // Tempos detalhados para métricas
  horaQuebra?: string; // Quando a máquina quebrou
  horaInicioReparo?: string; // Quando o mecânico começou o reparo
  horaFimReparo?: string; // Quando o reparo foi concluído
  horaVoltaOperacao?: string; // Quando a máquina voltou a operar
  tempoParadaTotal?: number; // em minutos (da quebra até voltar a operar)
  tempoReparoEfetivo?: number; // em minutos (do início ao fim do reparo)
  observacoes?: string;
  criadoPor: string;
}


export default function OrdensServico() {
  const { canEdit, canCreate } = useAuth();
  const { toast } = useToast();
  const { ordens, deleteOrdem } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrdem, setEditingOrdem] = useState<OrdemServico | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);


  const handleDelete = (ordem: OrdemServico) => {
    if (!canEdit) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para excluir ordens",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir a ordem ${ordem.numeroRastreio}?`)) {
      deleteOrdem(ordem.id);
      
      toast({
        title: "Ordem excluída",
        description: `Ordem ${ordem.numeroRastreio} foi excluída com sucesso`,
      });
    }
  };

  const handleEdit = (ordem: OrdemServico) => {
    setEditingOrdem(ordem);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingOrdem(null);
    setDialogOpen(true);
  };

  const handleExportPDF = (ordem: OrdemServico) => {
    try {
      exportOrderToPDF(ordem);
      toast({
        title: "PDF exportado",
        description: `Ordem ${ordem.numeroRastreio} foi exportada com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar a ordem para PDF",
        variant: "destructive",
      });
    }
  };


  const filteredOrdens = ordens.filter(ordem =>
    ordem.numeroRastreio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.maquinaNome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'critica': return 'bg-red-500';
      case 'alta': return 'bg-orange-500';
      case 'media': return 'bg-yellow-500';
      case 'baixa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberta': return 'bg-blue-500';
      case 'em_andamento': return 'bg-orange-500';
      case 'concluida': return 'bg-green-500';
      case 'cancelada': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
          {canCreate && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Ordem
            </Button>
          )}
        </div>
      </div>

      {/* Busca */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por número, título ou máquina..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Dialog de Ordem de Serviço */}
      <OrdemServicoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        ordem={editingOrdem || undefined}
        mode={editingOrdem ? "edit" : "create"}
      />

      {/* Dialog de Exportação de Relatório */}
      <ExportReportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
      />

      {/* Lista de Ordens */}
      <div className="space-y-4">
        {filteredOrdens.map(ordem => (
          <Card key={ordem.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="font-mono">
                      {ordem.numeroRastreio}
                    </Badge>
                    <Badge className={cn("text-white", getPrioridadeColor(ordem.prioridade))}>
                      {ordem.prioridade.charAt(0).toUpperCase() + ordem.prioridade.slice(1)}
                    </Badge>
                    <Badge className={cn("text-white", getStatusColor(ordem.status))}>
                      {ordem.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold">{ordem.titulo}</h3>
                  <p className="text-muted-foreground">{ordem.descricao}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Máquina:</span> {ordem.maquinaNome}
                    </div>
                    <div>
                      <span className="font-medium">Técnico:</span> {ordem.tecnicoResponsavelNome}
                    </div>
                    <div>
                      <span className="font-medium">Requisitante:</span> {ordem.requisitanteNome}
                    </div>
                    <div>
                      <span className="font-medium">Setor:</span> {ordem.setorNome}
                    </div>
                    <div>
                      <span className="font-medium">Abertura:</span> {format(new Date(ordem.dataAbertura), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </div>
                     <div>
                       <span className="font-medium">Criado por:</span> {ordem.criadoPor}
                     </div>
                   </div>
                   
                   {/* Mostrar tempos de parada se existirem */}
                   {(ordem.horaQuebra || ordem.tempoParadaTotal) && (
                     <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                       <p className="text-sm font-medium mb-2">Tempos de Parada:</p>
                       <div className="grid grid-cols-2 gap-2 text-sm">
                         {ordem.tempoParadaTotal && (
                           <div>
                             <span className="font-medium">Parada Total:</span> {Math.floor(ordem.tempoParadaTotal / 60)}h {ordem.tempoParadaTotal % 60}min
                           </div>
                         )}
                         {ordem.tempoReparoEfetivo && (
                           <div>
                             <span className="font-medium">Reparo Efetivo:</span> {Math.floor(ordem.tempoReparoEfetivo / 60)}h {ordem.tempoReparoEfetivo % 60}min
                           </div>
                         )}
                       </div>
                     </div>
                   )}
                 </div>
                 
                   <div className="flex space-x-2">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => handleExportPDF(ordem)}
                       title="Exportar PDF"
                       className="text-blue-600 hover:text-blue-700 hover:border-blue-300"
                     >
                       <FileText className="h-4 w-4" />
                     </Button>
                     {canEdit && (
                       <>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleEdit(ordem)}
                           title="Editar ordem"
                         >
                           <Edit className="h-4 w-4" />
                         </Button>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleDelete(ordem)}
                           className="text-red-600 hover:text-red-700 hover:border-red-300"
                           title="Excluir ordem"
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </>
                     )}
                   </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredOrdens.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {ordens.length === 0 
                ? "Nenhuma ordem de serviço cadastrada ainda."
                : "Nenhuma ordem encontrada com os critérios de busca."
              }
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}