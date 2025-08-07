import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Maquina } from '@/pages/Maquinas';

interface MaquinaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  maquina?: Maquina | null;
}


export default function MaquinaDialog({ isOpen, onClose, maquina }: MaquinaDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { maquinas, addMaquina, updateMaquina, tiposEquipamento, setores } = useData();
  
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    fabricante: '',
    modelo: '',
    anoFabricacao: new Date().getFullYear(),
    numeroSerie: '',
    localizacao: '',
    criticidade: 'media' as 'baixa' | 'media' | 'alta' | 'critica',
    horasOperacao: 0,
    especificacoesTecnicas: '',
    observacoes: '',
  });

  useEffect(() => {
    if (maquina) {
      setFormData({
        nome: maquina.nome,
        tipo: maquina.tipo,
        fabricante: maquina.fabricante,
        modelo: maquina.modelo,
        anoFabricacao: maquina.anoFabricacao,
        numeroSerie: maquina.numeroSerie,
        localizacao: maquina.localizacao,
        criticidade: maquina.criticidade,
        horasOperacao: maquina.horasOperacao,
        especificacoesTecnicas: maquina.especificacoesTecnicas || '',
        observacoes: maquina.observacoes || '',
      });
    } else {
      resetForm();
    }
  }, [maquina, isOpen]);

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: '',
      fabricante: '',
      modelo: '',
      anoFabricacao: new Date().getFullYear(),
      numeroSerie: '',
      localizacao: '',
      criticidade: 'media',
      horasOperacao: 0,
      especificacoesTecnicas: '',
      observacoes: '',
    });
  };

  const gerarCodigoMaquina = () => {
    const proximoNumero = maquinas.length + 1;
    return `MAQ${proximoNumero.toString().padStart(3, '0')}`;
  };

  const handleSave = () => {
    if (!formData.nome || !formData.tipo || !formData.fabricante || !formData.localizacao) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (maquina) {
      // Atualizar máquina existente
      const maquinaAtualizada: Partial<Maquina> = {
        nome: formData.nome,
        tipo: formData.tipo,
        fabricante: formData.fabricante,
        modelo: formData.modelo,
        anoFabricacao: formData.anoFabricacao,
        numeroSerie: formData.numeroSerie,
        localizacao: formData.localizacao,
        criticidade: formData.criticidade,
        horasOperacao: formData.horasOperacao,
        especificacoesTecnicas: formData.especificacoesTecnicas,
        observacoes: formData.observacoes,
      };
      
      updateMaquina(maquina.id, maquinaAtualizada);
      
      toast({
        title: "Sucesso",
        description: "Máquina atualizada com sucesso!",
      });
    } else {
      // Criar nova máquina
      const novaMaquina: Maquina = {
        id: Date.now().toString(),
        codigo: gerarCodigoMaquina(),
        nome: formData.nome,
        tipo: formData.tipo,
        fabricante: formData.fabricante,
        modelo: formData.modelo,
        anoFabricacao: formData.anoFabricacao,
        numeroSerie: formData.numeroSerie,
        localizacao: formData.localizacao,
        status: 'operacional',
        criticidade: formData.criticidade,
        horasOperacao: formData.horasOperacao,
        especificacoesTecnicas: formData.especificacoesTecnicas,
        observacoes: formData.observacoes,
        criadoEm: new Date().toISOString(),
        criadoPor: user?.name || '',
      };

      addMaquina(novaMaquina);
      
      toast({
        title: "Sucesso",
        description: `Máquina ${novaMaquina.codigo} cadastrada com sucesso!`,
      });
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {maquina ? 'Editar Máquina' : 'Nova Máquina'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome da Máquina *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome identificador da máquina"
              />
            </div>
            
            <div>
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposEquipamento.map(tipo => (
                    <SelectItem key={tipo.id} value={tipo.nome}>
                      {tipo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="fabricante">Fabricante *</Label>
              <Input
                id="fabricante"
                value={formData.fabricante}
                onChange={(e) => setFormData(prev => ({ ...prev, fabricante: e.target.value }))}
                placeholder="Fabricante da máquina"
              />
            </div>
            
            <div>
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => setFormData(prev => ({ ...prev, modelo: e.target.value }))}
                placeholder="Modelo da máquina"
              />
            </div>

            <div>
              <Label htmlFor="ano">Ano de Fabricação</Label>
              <Input
                id="ano"
                type="number"
                value={formData.anoFabricacao}
                onChange={(e) => setFormData(prev => ({ ...prev, anoFabricacao: parseInt(e.target.value) || new Date().getFullYear() }))}
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="numeroSerie">Número de Série</Label>
              <Input
                id="numeroSerie"
                value={formData.numeroSerie}
                onChange={(e) => setFormData(prev => ({ ...prev, numeroSerie: e.target.value }))}
                placeholder="Número de série da máquina"
              />
            </div>

            <div>
              <Label htmlFor="localizacao">Localização *</Label>
              <Select value={formData.localizacao} onValueChange={(value) => setFormData(prev => ({ ...prev, localizacao: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {setores.map(setor => (
                    <SelectItem key={setor.id} value={setor.nome}>
                      {setor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="horasOperacao">Horas de Operação</Label>
              <Input
                id="horasOperacao"
                type="number"
                value={formData.horasOperacao}
                onChange={(e) => setFormData(prev => ({ ...prev, horasOperacao: parseInt(e.target.value) || 0 }))}
                placeholder="Total de horas operadas"
                min="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="criticidade">Criticidade</Label>
            <Select value={formData.criticidade} onValueChange={(value: any) => setFormData(prev => ({ ...prev, criticidade: value }))}>
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

          <div>
            <Label htmlFor="especificacoes">Especificações Técnicas</Label>
            <Textarea
              id="especificacoes"
              value={formData.especificacoesTecnicas}
              onChange={(e) => setFormData(prev => ({ ...prev, especificacoesTecnicas: e.target.value }))}
              placeholder="Detalhes técnicos da máquina"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações adicionais"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {maquina ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}