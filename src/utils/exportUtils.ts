import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { OrdemServico } from '@/pages/OrdensServico';

export const exportOrderToPDF = (ordem: OrdemServico) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // === CABEÇALHO COM LOGOTIPO ===
  // Área reservada para logotipo da empresa (substituir pela URL real)
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text('[LOGOTIPO DA EMPRESA]', 20, 15);
  
  // Título principal
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('ORDEM DE SERVIÇO DE MANUTENÇÃO', pageWidth / 2, yPosition + 10, { align: 'center' });
  
  // Número da OS em destaque
  doc.setFontSize(14);
  doc.text(`Nº: ${ordem.numeroRastreio}`, pageWidth / 2, yPosition + 25, { align: 'center' });
  
  yPosition += 45;

  // === INFORMAÇÕES BÁSICAS EM TABELA ===
  autoTable(doc, {
    startY: yPosition,
    head: [['INFORMAÇÕES BÁSICAS']],
    body: [
      ['Título', ordem.titulo],
      ['Descrição', ordem.descricao],
      ['Status', ordem.status.replace('_', ' ').toUpperCase()],
      ['Prioridade', ordem.prioridade.toUpperCase()],
      ['Data de Abertura', format(new Date(ordem.dataAbertura), 'dd/MM/yyyy HH:mm', { locale: ptBR })],
      ...(ordem.dataInicio ? [['Data de Início', format(new Date(ordem.dataInicio), 'dd/MM/yyyy HH:mm', { locale: ptBR })]] : []),
      ...(ordem.dataConclusao ? [['Data de Conclusão', format(new Date(ordem.dataConclusao), 'dd/MM/yyyy HH:mm', { locale: ptBR })]] : []),
    ],
    headStyles: { 
      fillColor: [70, 130, 180], 
      textColor: 255, 
      fontSize: 12, 
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 120 }
    },
    theme: 'striped',
    margin: { left: 20, right: 20 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // === EQUIPAMENTO E LOCALIZAÇÃO ===
  autoTable(doc, {
    startY: yPosition,
    head: [['EQUIPAMENTO E LOCALIZAÇÃO']],
    body: [
      ['Máquina/Equipamento', ordem.maquinaNome],
      ['Setor do Equipamento', ordem.setorNome],
    ],
    headStyles: { 
      fillColor: [70, 130, 180], 
      textColor: 255, 
      fontSize: 12, 
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 120 }
    },
    theme: 'striped',
    margin: { left: 20, right: 20 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // === RESPONSÁVEIS ===
  autoTable(doc, {
    startY: yPosition,
    head: [['RESPONSÁVEIS']],
    body: [
      ['Técnico Responsável', ordem.tecnicoResponsavelNome || 'Não atribuído'],
      ['Requisitante', ordem.requisitanteNome],
      ['Criado por', ordem.criadoPor],
    ],
    headStyles: { 
      fillColor: [70, 130, 180], 
      textColor: 255, 
      fontSize: 12, 
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 120 }
    },
    theme: 'striped',
    margin: { left: 20, right: 20 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // === TEMPOS DE PARADA E REPARO (se existirem) ===
  if (ordem.horaQuebra || ordem.tempoParadaTotal || ordem.tempoReparoEfetivo) {
    const temposData = [];
    
    if (ordem.horaQuebra) {
      temposData.push(['Hora da Quebra', ordem.horaQuebra]);
    }
    if (ordem.horaInicioReparo) {
      temposData.push(['Início do Reparo', ordem.horaInicioReparo]);
    }
    if (ordem.horaFimReparo) {
      temposData.push(['Fim do Reparo', ordem.horaFimReparo]);
    }
    if (ordem.horaVoltaOperacao) {
      temposData.push(['Volta à Operação', ordem.horaVoltaOperacao]);
    }
    if (ordem.tempoParadaTotal) {
      const hours = Math.floor(ordem.tempoParadaTotal / 60);
      const minutes = ordem.tempoParadaTotal % 60;
      temposData.push(['Tempo Total de Parada', `${hours}h ${minutes}min`]);
    }
    if (ordem.tempoReparoEfetivo) {
      const hours = Math.floor(ordem.tempoReparoEfetivo / 60);
      const minutes = ordem.tempoReparoEfetivo % 60;
      temposData.push(['Tempo Efetivo de Reparo', `${hours}h ${minutes}min`]);
    }

    autoTable(doc, {
      startY: yPosition,
      head: [['TEMPOS DE PARADA E REPARO']],
      body: temposData,
      headStyles: { 
        fillColor: [220, 53, 69], 
        textColor: 255, 
        fontSize: 12, 
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 110 }
      },
      theme: 'striped',
      margin: { left: 20, right: 20 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // === OBSERVAÇÕES (se existirem) ===
  if (ordem.observacoes) {
    autoTable(doc, {
      startY: yPosition,
      head: [['OBSERVAÇÕES']],
      body: [[ordem.observacoes]],
      headStyles: { 
        fillColor: [40, 167, 69], 
        textColor: 255, 
        fontSize: 12, 
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 170 }
      },
      theme: 'striped',
      margin: { left: 20, right: 20 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // === SEÇÃO DE ASSINATURAS ===
  // Verificar se há espaço suficiente na página atual
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 30;
  }

  yPosition += 20; // Espaço extra antes das assinaturas

  autoTable(doc, {
    startY: yPosition,
    head: [['ASSINATURAS E APROVAÇÕES']],
    body: [
      ['', ''],
      ['', ''],
      ['', ''],
      ['', ''],
    ],
    headStyles: { 
      fillColor: [108, 117, 125], 
      textColor: 255, 
      fontSize: 12, 
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: { fontSize: 10, minCellHeight: 20 },
    columnStyles: {
      0: { cellWidth: 85 },
      1: { cellWidth: 85 }
    },
    didDrawCell: function (data) {
      // Adicionar rótulos nas células de assinatura
      if (data.section === 'body') {
        const labels = [
          ['Requisitante:', 'Data: ____/____/______'],
          ['_'.repeat(30), ''],
          ['Técnico Responsável:', 'Data: ____/____/______'], 
          ['_'.repeat(30), '']
        ];
        
        if (labels[data.row.index]) {
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          if (data.column.index === 0) {
            doc.text(labels[data.row.index][0], data.cell.x + 2, data.cell.y + data.cell.height - 3);
          } else {
            doc.text(labels[data.row.index][1], data.cell.x + 2, data.cell.y + data.cell.height - 3);
          }
        }
      }
    },
    theme: 'grid',
    margin: { left: 20, right: 20 }
  });

  // === RODAPÉ ===
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`Documento gerado automaticamente em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 
    pageWidth / 2, pageHeight - 10, { align: 'center' });

  // === SALVAR ARQUIVO ===
  const dateSuffix = ordem.dataConclusao 
    ? format(new Date(ordem.dataConclusao), 'yyyy-MM-dd')
    : format(new Date(), 'yyyy-MM-dd');
  
  const filename = `OS-${ordem.numeroRastreio}-${dateSuffix}.pdf`;
  doc.save(filename);
};