import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { OrdemServico } from '@/pages/OrdensServico';

export const exportOrderToPDF = (ordem: OrdemServico) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPosition = margin;

  // Função para adicionar texto com quebra de linha
  const addText = (text: string, x: number, y: number, maxWidth?: number, fontSize = 12) => {
    doc.setFontSize(fontSize);
    if (maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * fontSize * 0.5);
    } else {
      doc.text(text, x, y);
      return y + fontSize * 0.5;
    }
  };

  // Função para verificar se precisa de nova página
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Cabeçalho
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('ORDEM DE SERVIÇO', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Número da OS
  doc.setFontSize(16);
  doc.text(`Nº: ${ordem.numeroRastreio}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Linha divisória
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Informações básicas
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  yPosition = addText('INFORMAÇÕES BÁSICAS', margin, yPosition, undefined, 14);
  yPosition += 5;

  doc.setFont(undefined, 'normal');
  yPosition = addText(`Título: ${ordem.titulo}`, margin, yPosition);
  yPosition += 5;
  yPosition = addText(`Descrição: ${ordem.descricao}`, margin, yPosition, pageWidth - 2 * margin);
  yPosition += 10;

  checkPageBreak(30);

  // Equipamento e Setor
  doc.setFont(undefined, 'bold');
  yPosition = addText('EQUIPAMENTO E LOCALIZAÇÃO', margin, yPosition, undefined, 14);
  yPosition += 5;

  doc.setFont(undefined, 'normal');
  yPosition = addText(`Máquina: ${ordem.maquinaNome}`, margin, yPosition);
  yPosition += 5;
  yPosition = addText(`Setor: ${ordem.setorNome}`, margin, yPosition);
  yPosition += 10;

  checkPageBreak(40);

  // Responsáveis
  doc.setFont(undefined, 'bold');
  yPosition = addText('RESPONSÁVEIS', margin, yPosition, undefined, 14);
  yPosition += 5;

  doc.setFont(undefined, 'normal');
  yPosition = addText(`Técnico Responsável: ${ordem.tecnicoResponsavelNome}`, margin, yPosition);
  yPosition += 5;
  yPosition = addText(`Requisitante: ${ordem.requisitanteNome}`, margin, yPosition);
  yPosition += 5;
  yPosition = addText(`Criado por: ${ordem.criadoPor}`, margin, yPosition);
  yPosition += 10;

  checkPageBreak(50);

  // Status e Prioridade
  doc.setFont(undefined, 'bold');
  yPosition = addText('STATUS E PRIORIDADE', margin, yPosition, undefined, 14);
  yPosition += 5;

  doc.setFont(undefined, 'normal');
  yPosition = addText(`Status: ${ordem.status.replace('_', ' ').toUpperCase()}`, margin, yPosition);
  yPosition += 5;
  yPosition = addText(`Prioridade: ${ordem.prioridade.toUpperCase()}`, margin, yPosition);
  yPosition += 10;

  checkPageBreak(60);

  // Datas
  doc.setFont(undefined, 'bold');
  yPosition = addText('DATAS', margin, yPosition, undefined, 14);
  yPosition += 5;

  doc.setFont(undefined, 'normal');
  yPosition = addText(`Data de Abertura: ${format(new Date(ordem.dataAbertura), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, margin, yPosition);
  yPosition += 5;

  if (ordem.dataInicio) {
    yPosition = addText(`Data de Início: ${format(new Date(ordem.dataInicio), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, margin, yPosition);
    yPosition += 5;
  }

  if (ordem.dataConclusao) {
    yPosition = addText(`Data de Conclusão: ${format(new Date(ordem.dataConclusao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, margin, yPosition);
    yPosition += 5;
  }
  yPosition += 5;

  // Tempos detalhados (se existirem)
  if (ordem.horaQuebra || ordem.tempoParadaTotal || ordem.tempoReparoEfetivo) {
    checkPageBreak(80);
    
    doc.setFont(undefined, 'bold');
    yPosition = addText('TEMPOS DE PARADA E REPARO', margin, yPosition, undefined, 14);
    yPosition += 5;

    doc.setFont(undefined, 'normal');
    
    if (ordem.horaQuebra) {
      yPosition = addText(`Hora da Quebra: ${ordem.horaQuebra}`, margin, yPosition);
      yPosition += 5;
    }
    
    if (ordem.horaInicioReparo) {
      yPosition = addText(`Início do Reparo: ${ordem.horaInicioReparo}`, margin, yPosition);
      yPosition += 5;
    }
    
    if (ordem.horaFimReparo) {
      yPosition = addText(`Fim do Reparo: ${ordem.horaFimReparo}`, margin, yPosition);
      yPosition += 5;
    }
    
    if (ordem.horaVoltaOperacao) {
      yPosition = addText(`Volta à Operação: ${ordem.horaVoltaOperacao}`, margin, yPosition);
      yPosition += 5;
    }
    
    if (ordem.tempoParadaTotal) {
      const hours = Math.floor(ordem.tempoParadaTotal / 60);
      const minutes = ordem.tempoParadaTotal % 60;
      yPosition = addText(`Tempo Total de Parada: ${hours}h ${minutes}min`, margin, yPosition);
      yPosition += 5;
    }
    
    if (ordem.tempoReparoEfetivo) {
      const hours = Math.floor(ordem.tempoReparoEfetivo / 60);
      const minutes = ordem.tempoReparoEfetivo % 60;
      yPosition = addText(`Tempo Efetivo de Reparo: ${hours}h ${minutes}min`, margin, yPosition);
      yPosition += 5;
    }
    yPosition += 5;
  }

  // Observações (se existirem)
  if (ordem.observacoes) {
    checkPageBreak(40);
    
    doc.setFont(undefined, 'bold');
    yPosition = addText('OBSERVAÇÕES', margin, yPosition, undefined, 14);
    yPosition += 5;

    doc.setFont(undefined, 'normal');
    yPosition = addText(ordem.observacoes, margin, yPosition, pageWidth - 2 * margin);
  }

  // Rodapé
  const footerY = pageHeight - 30;
  doc.setFontSize(10);
  doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, margin, footerY);

  // Nome do arquivo
  const dateConclusao = ordem.dataConclusao 
    ? format(new Date(ordem.dataConclusao), 'yyyy-MM-dd')
    : format(new Date(), 'yyyy-MM-dd');
  
  const filename = `OS-${ordem.numeroRastreio}-${dateConclusao}.pdf`;

  // Salvar o PDF
  doc.save(filename);
};