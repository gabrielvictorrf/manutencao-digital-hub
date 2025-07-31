import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import MaquinaDialog from '@/components/dialogs/MaquinaDialog';

export interface Maquina {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  fabricante: string;
  modelo: string;
  anoFabricacao: number;
  numeroSerie: string;
  localizacao: string;
  status: 'operacional' | 'manutencao' | 'parada' | 'inativa';
  criticidade: 'baixa' | 'media' | 'alta' | 'critica';
  ultimaManutencao?: string;
  proximaManutencao?: string;
  horasOperacao: number;
  especificacoesTecnicas?: string;
  observacoes?: string;
  criadoEm: string;
  criadoPor: string;
}

const tiposMaquina = [
  'Torno CNC',
  'Fresadora',
  'Furadeira',
  'Prensa',
  'Compressor',
  'Esteira',
  'Bomba',
  'Motor',
  'Gerador',
  'Outro'
];

export default function Maquinas() {
  const { canEdit } = useAuth();
  const { maquinas } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaquina, setEditingMaquina] = useState<Maquina | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleNovaMaquina = () => {
    setEditingMaquina(null);
    setDialogOpen(true);
  };

  const handleEdit = (maquina: Maquina) => {
    setEditingMaquina(maquina);
    setDialogOpen(true);
  };

  const filteredMaquinas = maquinas.filter(maquina =>
    maquina.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    maquina.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    maquina.fabricante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    maquina.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operacional': return 'bg-green-500';
      case 'manutencao': return 'bg-yellow-500';
      case 'parada': return 'bg-red-500';
      case 'inativa': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getCriticidadeColor = (criticidade: string) => {
    switch (criticidade) {
      case 'critica': return 'bg-red-500';
      case 'alta': return 'bg-orange-500';
      case 'media': return 'bg-yellow-500';
      case 'baixa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Gestão de Máquinas</h2>
        {canEdit && (
          <Button onClick={handleNovaMaquina}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Máquina
          </Button>
        )}
      </div>

      {/* Busca */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por código, nome, fabricante ou localização..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <MaquinaDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maquina={editingMaquina}
      />

      {/* Lista de Máquinas */}
      <div className="grid gap-4">
        {filteredMaquinas.map(maquina => (
          <Card key={maquina.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="font-mono">
                      {maquina.codigo}
                    </Badge>
                    <Badge className={cn("text-white", getStatusColor(maquina.status))}>
                      {maquina.status.toUpperCase()}
                    </Badge>
                    <Badge className={cn("text-white", getCriticidadeColor(maquina.criticidade))}>
                      {maquina.criticidade.charAt(0).toUpperCase() + maquina.criticidade.slice(1)}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold">{maquina.nome}</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Tipo:</span> {maquina.tipo}
                    </div>
                    <div>
                      <span className="font-medium">Fabricante:</span> {maquina.fabricante}
                    </div>
                    <div>
                      <span className="font-medium">Modelo:</span> {maquina.modelo}
                    </div>
                    <div>
                      <span className="font-medium">Ano:</span> {maquina.anoFabricacao}
                    </div>
                    <div>
                      <span className="font-medium">Localização:</span> {maquina.localizacao}
                    </div>
                    <div>
                      <span className="font-medium">Horas Op.:</span> {maquina.horasOperacao.toLocaleString()}h
                    </div>
                    {maquina.numeroSerie && (
                      <div className="col-span-2">
                        <span className="font-medium">Série:</span> {maquina.numeroSerie}
                      </div>
                    )}
                  </div>

                  {maquina.especificacoesTecnicas && (
                    <div className="mt-2">
                      <span className="font-medium text-sm">Especificações:</span>
                      <p className="text-sm text-muted-foreground mt-1">{maquina.especificacoesTecnicas}</p>
                    </div>
                  )}
                </div>
                
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(maquina)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredMaquinas.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {maquinas.length === 0 
                ? "Nenhuma máquina cadastrada ainda."
                : "Nenhuma máquina encontrada com os critérios de busca."
              }
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}