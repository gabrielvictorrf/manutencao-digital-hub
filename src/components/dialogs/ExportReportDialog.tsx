import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Calendar, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { OrdemServico } from '@/pages/OrdensServico';

interface ExportReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportReportDialog({ open, onOpenChange }: ExportReportDialogProps) {
  const { ordens, maquinas, tecnicos } = useData();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedSetor, setSelectedSetor] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [dateField, setDateField] = useState<'dataAbertura' | 'dataInicio' | 'dataConclusao'>('dataAbertura');

  // Obter setores únicos das localizações dos equipamentos
  const setores = [...new Set(maquinas.map(m => m.localizacao).filter(Boolean))].sort();

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedEquipment('todos');
    setSelectedSetor('todos');
    setSelectedTechnician('todos');
    setDateField('dataAbertura');
  };

  const generateCSV = () => {
    let filteredOrdens = [...ordens];

    // Filtro por data
    if (dateFrom || dateTo) {
      filteredOrdens = filteredOrdens.filter(ordem => {
        let orderDate: string;
        switch (dateField) {
          case 'dataInicio':
            orderDate = ordem.dataInicio || ordem.dataAbertura;
            break;
          case 'dataConclusao':
            orderDate = ordem.dataConclusao || ordem.dataAbertura;
            break;
          default:
            orderDate = ordem.dataAbertura;
        }

        const date = new Date(orderDate);
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        const toDate = dateTo ? new Date(dateTo + 'T23:59:59') : null;

        return (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
      });
    }

    // Filtro por equipamento
    if (selectedEquipment && selectedEquipment !== 'todos') {
      filteredOrdens = filteredOrdens.filter(ordem => ordem.maquinaId === selectedEquipment);
    }

    // Filtro por setor (setor do equipamento)
    if (selectedSetor && selectedSetor !== 'todos') {
      filteredOrdens = filteredOrdens.filter(ordem => {
        const maquina = maquinas.find(m => m.id === ordem.maquinaId);
        return maquina?.localizacao === selectedSetor;
      });
    }

    // Filtro por técnico
    if (selectedTechnician && selectedTechnician !== 'todos') {
      filteredOrdens = filteredOrdens.filter(ordem => ordem.tecnicoResponsavelId === selectedTechnician);
    }

    // Cabeçalho do CSV
    const headers = [
      'Número OS',
      'Título',
      'Descrição',
      'Máquina',
      'Setor',
      'Técnico Responsável',
      'Requisitante',
      'Prioridade',
      'Status',
      'Data Abertura',
      'Data Início',
      'Data Conclusão',
      'Tempo Parada Total (min)',
      'Tempo Reparo Efetivo (min)',
      'Criado Por',
      'Observações'
    ];

    // Dados do CSV
    const csvData = filteredOrdens.map(ordem => {
      // Buscar setor do equipamento
      const maquina = maquinas.find(m => m.id === ordem.maquinaId);
      const setorEquipamento = maquina?.localizacao || 'N/A';
      
      return [
        ordem.numeroRastreio,
        ordem.titulo,
        ordem.descricao,
        ordem.maquinaNome,
        setorEquipamento, // Usar setor do equipamento em vez do requisitante
        ordem.tecnicoResponsavelNome,
        ordem.requisitanteNome,
        ordem.prioridade,
        ordem.status,
        format(new Date(ordem.dataAbertura), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        ordem.dataInicio ? format(new Date(ordem.dataInicio), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '',
        ordem.dataConclusao ? format(new Date(ordem.dataConclusao), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '',
        ordem.tempoParadaTotal || '',
        ordem.tempoReparoEfetivo || '',
        ordem.criadoPor,
        ordem.observacoes || ''
      ];
    });

    // Gerar arquivo CSV
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // Adicionar BOM para suporte a caracteres especiais
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Download do arquivo
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const filename = `relatorio-ordens-servico-${today}.csv`;
    link.setAttribute('download', filename);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Relatório CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filtro por Data */}
          <div className="space-y-2">
            <Label>Campo de Data:</Label>
            <Select value={dateField} onValueChange={(value: 'dataAbertura' | 'dataInicio' | 'dataConclusao') => setDateField(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dataAbertura">Data de Abertura</SelectItem>
                <SelectItem value="dataInicio">Data de Início</SelectItem>
                <SelectItem value="dataConclusao">Data de Conclusão</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Data Inicial:</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Final:</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Filtro por Equipamento */}
          <div className="space-y-2">
            <Label>Equipamento:</Label>
            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os equipamentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os equipamentos</SelectItem>
                {maquinas.map(maquina => (
                  <SelectItem key={maquina.id} value={maquina.id}>
                    {maquina.nome} - {maquina.modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Setor */}
          <div className="space-y-2">
            <Label>Setor:</Label>
            <Select value={selectedSetor} onValueChange={setSelectedSetor}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os setores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os setores</SelectItem>
                {setores.map(setor => (
                  <SelectItem key={setor} value={setor}>
                    {setor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Técnico */}
          <div className="space-y-2">
            <Label>Técnico:</Label>
            <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os técnicos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os técnicos</SelectItem>
                {tecnicos.map(tecnico => (
                  <SelectItem key={tecnico.id} value={tecnico.id}>
                    {tecnico.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botão Limpar Filtros */}
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={generateCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}